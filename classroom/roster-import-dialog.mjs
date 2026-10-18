import {decodeCsv,parseCsv} from './csv.mjs';
import {mapNamedTeachers,suggestTeacherMapping} from './named-teacher-import.mjs';
import {mapNamedStudents,suggestNamedMapping} from './named-import.mjs';

export function openRosterImport({document:doc,client,state,isCurrent,onCommit,kind='students'}){
 const teachers=kind==='teachers',people=teachers?(state.teachers||[]):state.students,idKey=teachers?'teacherId':'studentId';
 const make=(tag,text,attrs={})=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
 const button=(label,action,attrs={})=>{const b=make('button',label,{type:'button',class:'button ghost',...attrs});b.addEventListener('click',action);return b;};
 let bytes=null,parsed=null,plan=null,frozen=null,decisions=[],generation=0,dead=false,busy=null,operationId=null,page=0,filter='all',reviewLines=new Set(),autoTimer=null,dirty=false,validationError='';
 const dialog=make('dialog',undefined,{class:'classroomDialog rosterImportDialog','data-import-dialog':'','aria-labelledby':'namedImportTitle','data-telemetry-private':'true'}),form=make('form',undefined,{autocomplete:'off'});
 const header=make('div',undefined,{class:'classroomDialogHead'});header.append(make('h2',teachers?'Lehrkräfteliste importieren':'Schülerliste importieren',{id:'namedImportTitle'}),button('Schließen',close,{'aria-label':'Import schließen'}));form.append(header);
 form.append(make('p','CSV-Datei lokal öffnen, Spalten prüfen und Änderungen erst nach deiner Zustimmung übernehmen. Deine Tests bleiben unverändert.'));
 const config=make('fieldset'),legend=make('legend','Datei und Ziel');config.append(legend);
 const addField=(label,element)=>{const wrap=make('label',label);wrap.append(element);config.append(wrap);return element;};
 const file=addField('CSV-Datei (höchstens 2 MB)',make('input',undefined,{type:'file',accept:'.csv,.txt,text/csv,text/plain','data-import-file':''}));
 const controls=make('div',undefined,{class:'rosterImportOptions'});config.append(controls);
 const select=(label,options,attrs={})=>{const wrap=make('label',label),s=make('select',undefined,attrs);for(const[value,text]of options)s.append(make('option',text,{value}));wrap.append(s);controls.append(wrap);return s;};
 const delimiter=select('Trennzeichen',[['','Automatisch'],[';','Semikolon'],[',','Komma'],['|','Pipe (|)'],['\t','Tabulator']],{'data-import-delimiter':''});
 const encoding=select('Zeichenkodierung',[['utf-8','UTF-8'],['windows-1252','Windows-1252']],{'data-import-encoding':''});
 const headerLabel=make('label',undefined,{class:'classroomCheck'}),hasHeader=make('input',undefined,{type:'checkbox','data-import-header':''});hasHeader.checked=true;headerLabel.append(hasHeader,make('span','Datei hat eine Kopfzeile'));config.append(headerLabel);
 const now=new Date(),start=now.getMonth()>=8?now.getFullYear():now.getFullYear()-1;
 const year=addField('Zielschuljahr',make('input',undefined,{value:`${start}/${String((start+1)%100).padStart(2,'0')}`,maxlength:'7',required:'',pattern:'[0-9]{4}/[0-9]{2}','data-import-year':''}));
 const fixed=addField('Feste Zielklasse (optional)',make('select',undefined,{'data-import-fixed-class':''}));fixed.append(make('option','Klassenspalte aus der Datei verwenden',{value:''}));
 for(const c of state.classes)fixed.append(make('option',`${c.name} · ${c.schoolYear}`,{value:c.id}));
 const source=addField('Importquelle für Kennungen',make('input',undefined,{value:'ASV/CSV',maxlength:'80',required:'','data-import-source':''}));
 if(teachers){fixed.parentElement.hidden=true;config.append(make('p','Pro Klasse und Fach eine Zeile. Für mehrere Zuordnungen dieselbe stabile Kennung auswählen. Ohne Klasse und Fach werden nur Namen und Kürzel importiert; vorhandene Zuordnungen bleiben erhalten.',{class:'hint'}));}
 config.append(make('p','Eine Kennung ist optional. Verwende sie nur, wenn sie dieselbe Person über mehrere Exporte zuverlässig bezeichnet. Behalte dafür dieselbe Importquelle bei.',{class:'hint'}));form.append(config);
 const mappingArea=make('section',undefined,{'data-import-mapping':''}),feedback=make('p','',{role:'alert',class:'classroomError'}),summary=make('section',undefined,{'data-import-summary':'','aria-live':'polite'});
 const previewButton=button('Änderungen prüfen',()=>void preview(),{class:'button secondary','data-import-preview':''});previewButton.disabled=true;
 const back=button('Datei und Spalten ändern',()=>{if(busy)return;config.hidden=false;mappingArea.hidden=false;back.hidden=true;invalidate();},{'data-import-back':''});back.hidden=true;
 form.append(mappingArea,feedback,previewButton,back,summary);
 const approvalLabel=make('label',undefined,{class:'classroomCheck'}),approval=make('input',undefined,{type:'checkbox','data-import-approval':''});approvalLabel.append(approval,make('span','Ich habe die Änderungen geprüft und möchte sie übernehmen.'));form.append(approvalLabel);
 const confirmStatus=make('p','Bitte zuerst die Änderungen prüfen.',{id:'namedImportConfirmStatus',role:'status','data-import-confirm-status':''}),showReview=button('Offene Zuordnungen anzeigen',()=>selectFilter('review'),{'data-import-show-review':''});showReview.hidden=true;form.append(confirmStatus,showReview);
 const actions=make('div',undefined,{class:'rosterActions'}),cancel=button('Abbrechen',close,{'data-import-cancel':''}),confirm=button('Geprüfte Änderungen übernehmen',()=>void commit(),{class:'button primary','data-import-confirm':''});confirm.disabled=true;confirm.setAttribute('aria-describedby','namedImportConfirmStatus');actions.append(cancel,confirm);form.append(actions);dialog.append(form);doc.body.append(dialog);
 let mapping={};
 function allowed(){return !dead&&isCurrent();}
 function invalidate(clear=true){clearTimeout(autoTimer);autoTimer=null;dirty=false;validationError='';generation++;plan=null;frozen=null;operationId=null;approval.checked=false;confirm.disabled=true;previewButton.hidden=false;if(clear)summary.replaceChildren();updateConfirmation();}
 function setBusy(value){busy=value;back.disabled=Boolean(value);for(const e of config.querySelectorAll('input,select'))e.disabled=Boolean(value);for(const e of mappingArea.querySelectorAll('select'))e.disabled=Boolean(value);for(const e of summary.querySelectorAll('button,input,select')){e.disabled=value==='commit';if(value!=='commit'&&e.hasAttribute('data-page-end'))e.disabled=e.dataset.pageEnd==='true';}approval.disabled=Boolean(value);year.disabled=Boolean(value)||Boolean(fixed.value);previewButton.disabled=Boolean(value)||!parsed;cancel.disabled=value==='commit';updateConfirmation();}
 function updateConfirmation(){
  confirm.disabled=Boolean(busy)||dirty||!plan||!frozen||plan.counts.review>0||!approval.checked;
  showReview.hidden=!plan||plan.counts.review===0;showReview.disabled=Boolean(busy);
  confirmStatus.className=validationError||plan?.counts.review?'classroomError':'hint';
  confirmStatus.textContent=validationError|| (busy==='commit'?'Änderungen werden gespeichert …':busy==='preview'||dirty?'Entscheidungen werden automatisch geprüft …':!plan?(parsed?'Bitte die Änderungen erneut prüfen.':'Bitte zuerst die Änderungen prüfen.'):plan.counts.review?`${plan.counts.review} Entscheidungen offen. Oben auf „Offen“ klicken und die Personen gemeinsam zuordnen, neu anlegen oder überspringen.`:!approval.checked?'Bitte die geprüften Änderungen mit dem Häkchen bestätigen.':'Alle Zuordnungen geklärt. Die geprüften Änderungen können übernommen werden.');
 }
 function destroy(){if(dead)return;dead=true;generation++;clearTimeout(autoTimer);bytes=null;parsed=null;plan=null;frozen=null;decisions=[];mapping={};file.value='';dialog.remove();}
 function close(){if(busy==='commit')return;destroy();if(isCurrent())doc.querySelector('[data-roster-import]')?.focus();}
 function parse(auto=false){
  invalidate();decisions=[];mappingArea.replaceChildren();feedback.textContent='';parsed=null;
  if(!bytes){previewButton.disabled=true;return;}
  try{
   const text=decodeCsv(bytes,encoding.value);let next=parseCsv(text,{delimiter:delimiter.value||undefined,header:hasHeader.checked});
   if(auto){const guess=(teachers?suggestTeacherMapping:suggestNamedMapping)(next.rows[0]);hasHeader.checked=guess.firstName!==''&&guess.lastName!=='';next=parseCsv(text,{delimiter:delimiter.value||undefined,header:hasHeader.checked});}
   parsed=next;mapping=(teachers?suggestTeacherMapping:suggestNamedMapping)(next.headers);
   if(!teachers&&!next.header&&next.delimiter==='|'&&next.headers.length===10){mapping={firstName:3,lastName:2,className:7,sourceId:''};mappingArea.append(make('p','Zehnspaltige Pipe-Datei ohne Kopfzeile erkannt. Bitte die Spaltenzuordnung prüfen.',{class:'hint'}));}
   mappingArea.append(make('h3','Spalten zuordnen'));
   for(const[key,label]of [['firstName','Vorname'],['lastName','Nachname'],...(teachers?[['shortCode','Kürzel (optional)']]:[]),['className',teachers?'Klasse (optional)':'Klasse'],...(teachers?[['subject','Fach (optional)']]:[]),['sourceId','Kennung (optional)']]){
    const wrap=make('label',label),s=make('select',undefined,{'data-import-map':key});s.append(make('option',key==='sourceId'?'Keine Kennung verwenden':teachers&&!['firstName','lastName'].includes(key)?'Nicht importieren':'Bitte wählen',{value:''}));
    next.headers.forEach((h,i)=>s.append(make('option',`${i+1}: ${h.slice(0,100)}${!next.header?' · '+String(next.rows[0][i]||'').slice(0,40):''}`,{value:String(i)})));s.value=String(mapping[key]);
    s.addEventListener('change',()=>{mapping[key]=s.value;decisions=[];invalidate();});wrap.append(s);mappingArea.append(wrap);
   }
   const sample=next.rows.slice(next.header?1:0,(next.header?1:0)+3);const sampleBox=make('div',undefined,{class:'rosterImportSample'});sampleBox.append(make('p',`${next.rows.length-(next.header?1:0)} Dateizeilen erkannt. Erste Datenzeilen:`,{class:'hint'}));
   for(const row of sample)sampleBox.append(make('p',row.map(v=>v.slice(0,50)).join(' | ')));mappingArea.append(sampleBox);
  }catch(e){feedback.textContent=e.message;parsed=null;}
  previewButton.disabled=!parsed;
 }
 file.addEventListener('change',async()=>{
  invalidate();bytes=null;parsed=null;mappingArea.replaceChildren();feedback.textContent='';previewButton.disabled=true;
  const selected=file.files?.[0],current=generation;if(!selected)return;
  if(selected.size>2*1024*1024){feedback.textContent='Datei zu groß. Höchstens 2 MB im lokalen Import.';return;}
  try{const data=await selected.arrayBuffer();if(!allowed()||current!==generation)return;bytes=data;parse(true);}catch{if(allowed())feedback.textContent='Die Datei konnte nicht gelesen werden.';}
 });
 for(const control of [delimiter,encoding,hasHeader])control.addEventListener('change',()=>parse());
 for(const control of [year,source])control.addEventListener('change',()=>{decisions=[];invalidate();});
 fixed.addEventListener('change',()=>{const c=state.classes.find(c=>c.id===fixed.value);if(c)year.value=c.schoolYear;year.disabled=Boolean(c);decisions=[];invalidate();});
 approval.addEventListener('change',updateConfirmation);
 function scheduleReview(){
  clearTimeout(autoTimer);validationError='';dirty=true;generation++;frozen=null;approval.checked=false;operationId=null;updateConfirmation();
  feedback.textContent='Entscheidungen werden automatisch geprüft …';
  autoTimer=setTimeout(()=>{autoTimer=null;void preview(true);},250);
 }
 function setDecision(line,action,personId){decisions=decisions.filter(d=>d.line!==line);if(action)decisions.push({line,action,...(personId?{[idKey]:personId}:{})});scheduleReview();}
 function selectFilter(value){if(busy==='commit'||!plan)return;filter=value;page=0;if(value==='review')reviewLines=new Set(plan.rows.filter(r=>r.status==='review').map(r=>r.line));renderPlan();summary.querySelector('tbody select')?.focus();}
 function chooseExisting(line,cell){
  clearTimeout(autoTimer);autoTimer=null;dirty=true;generation++;frozen=null;approval.checked=false;updateConfirmation();
  const box=make('div',undefined,{class:'rosterLinkPicker'}),input=make('input',undefined,{type:'search',placeholder:'Bestehende Person suchen','aria-label':'Bestehende Person suchen'}),select=make('select',undefined,{'aria-label':'Bestehendes Konto wählen'});
  function fill(){select.replaceChildren(make('option','Bitte eine Person wählen',{value:''}));const term=input.value.toLocaleLowerCase('de');for(const s of people.filter(s=>`${s.firstName} ${s.lastName}`.toLocaleLowerCase('de').includes(term)).slice(0,100)){const c=state.classes.find(c=>c.id===s.classId);select.append(make('option',`${s.firstName} ${s.lastName} · ${c?c.name+' '+c.schoolYear:'Ohne Klasse'} · ${people.indexOf(s)+1}`,{value:s.id}));}}
  input.addEventListener('input',fill);select.addEventListener('change',()=>{if(select.value)setDecision(line,'link',select.value);});fill();box.append(input,select);cell.append(box);input.focus();
 }
 function renderPlan(){
  updateConfirmation();
  config.hidden=true;mappingArea.hidden=true;previewButton.hidden=true;back.hidden=false;
  summary.replaceChildren();summary.append(make('h3','Das wird übernommen'));
  const counts=make('div',undefined,{class:'rosterImportCounts','aria-label':'Importübersicht'});
  for(const [key,count,label]of [['all',plan.rows.length,'Alle'],['create',plan.counts.newTeachers??plan.counts.newStudents,'Neu'],['update',plan.counts.updated,'Geändert'],['review',plan.counts.review,'Offen']]){const b=button(`${count} ${label}`,()=>selectFilter(key),{'data-import-filter':key,'aria-pressed':String(filter===key)});counts.append(b);}summary.append(counts);
  summary.append(make('p',`${plan.counts.unchanged} unverändert · ${plan.counts.nameChanges} Namensänderungen · ${teachers?plan.counts.assignmentChanges+' Unterrichtsänderungen':plan.counts.classChanges+' Klassenwechsel'} · ${plan.counts.skipped} übersprungen`));
  if(teachers)summary.append(make('p','Unterricht im Zielschuljahr wird wie angezeigt übernommen. Andere Schuljahre bleiben erhalten.',{class:'hint'}));
  if(plan.newClasses.length)summary.append(make('p','Neue Klassen: '+plan.newClasses.map(c=>`${c.name} · ${c.schoolYear}`).join(', ')));
  if(plan.counts.review){
   summary.append(make('p','Bitte unklare Personen ausdrücklich einem bestehenden Konto zuordnen, als neue Person anlegen oder überspringen.',{class:'classroomError'}));
   const unique=plan.rows.filter(r=>r.status==='review'&&r.candidates.length===1);
   if(unique.length)summary.append(button('Eindeutige Namensvorschläge zuordnen',()=>{for(const r of unique){decisions=decisions.filter(d=>d.line!==r.line);decisions.push({line:r.line,action:'link',[idKey]:r.candidates[0].id});}scheduleReview();}));
  }
  const wrap=make('div',undefined,{class:'rosterTableWrap'}),table=make('table'),head=make('tr');for(const title of ['Zeile','Person','Änderung',teachers?'Bisheriger Unterricht':'Bisherige Klasse',teachers?'Neuer Unterricht':'Neue Klasse','Entscheidung'])head.append(make('th',title,{scope:'col'}));const thead=make('thead');thead.append(head);table.append(thead);const tbody=make('tbody');
  const statuses={create:'Neu',unchanged:'Unverändert',review:'Zuordnung prüfen',skip:'Überspringen'};
  const visible=plan.rows.filter(r=>filter==='all'||(filter==='review'?reviewLines.has(r.line):r.status===filter));
  page=Math.min(page,Math.max(0,Math.ceil(visible.length/50)-1));
  for(const row of visible.slice(page*50,page*50+50)){
   const tr=make('tr'),name=row.nameChanged?`${row.before.firstName} ${row.before.lastName} → ${row.after.firstName} ${row.after.lastName}`:`${row.after.firstName} ${row.after.lastName}`;
   const label=teachers&&row.status==='update'?'Name, Kürzel oder Unterricht geändert':row.status==='update'?(row.nameChanged&&row.classChanged?'Name und Klasse geändert':row.classChanged?'Klassenwechsel':'Namensänderung'):statuses[row.status];
   for(const value of [String(row.line),teachers?`${name}${row.before?.shortCode&&row.before.shortCode!==row.after.shortCode?' · '+row.before.shortCode+' → ':row.after.shortCode?' · ':''}${row.after.shortCode||''}`:name,label,row.before?.classLabel||'—',row.after.classLabel])tr.append(make('td',value));
   const cell=make('td'),s=make('select',undefined,{'aria-label':`Entscheidung für Zeile ${row.line}`});s.append(make('option',row.status==='review'?'Bitte entscheiden':decisions.some(d=>d.line===row.line&&d.action==='link')?'Bestehende Person zugeordnet':'Vorschlag übernehmen',{value:''}));
   if(!row[idKey]){s.append(make('option','Als neue Person anlegen',{value:'create'}));for(const c of row.candidates)s.append(make('option',`Zuordnen: ${c.firstName} ${c.lastName} · ${c.classLabel}`,{value:'link:'+c.id}));if(people.length)s.append(make('option','Andere bestehende Person wählen',{value:'other'}));}
   s.append(make('option','Zeile überspringen',{value:'skip'}));const d=decisions.find(d=>d.line===row.line);if(d?.action==='skip')s.value='skip';else if(d?.action==='create')s.value='create';
   s.addEventListener('change',()=>{if(s.value==='other'){chooseExisting(row.line,cell);return;}const[action,id]=s.value.split(':');setDecision(row.line,action,id);});cell.append(s);tr.append(cell);tbody.append(tr);
  }
  table.append(tbody);wrap.append(table);summary.append(wrap);
  if(visible.length>50){const paging=make('div',undefined,{class:'rosterActions'}),prev=button('Zurück',()=>{page--;renderPlan();}),next=button('Weiter',()=>{page++;renderPlan();});prev.disabled=page===0;next.disabled=(page+1)*50>=visible.length;prev.dataset.pageEnd=String(prev.disabled);next.dataset.pageEnd=String(next.disabled);paging.append(prev,make('span',`Seite ${page+1} von ${Math.ceil(visible.length/50)}`),next);summary.append(paging);}
  const missing=teachers?plan.missingTeachers:plan.missingStudents;
  if(missing.length){const details=make('details'),title=make('summary',`${missing.length} bestehende Personen nicht zugeordnet – bleiben unverändert`);details.append(title);for(const s of missing.slice(0,50))details.append(make('p',`${s.firstName} ${s.lastName} · ${s.classLabel}`));if(missing.length>50)details.append(make('p','Weitere Personen bleiben ebenfalls unverändert.'));summary.append(details);}
 }
 async function preview(automatic=false){
  if(!parsed||busy==='commit'||(!automatic&&busy)||!allowed()||!form.reportValidity())return;
  clearTimeout(autoTimer);autoTimer=null;validationError='';
  const fixedClass=state.classes.find(c=>c.id===fixed.value),fixedClassName=fixedClass?.name||'',mapped=teachers?mapNamedTeachers(parsed,mapping):mapNamedStudents(parsed,mapping,{fixedClassName});
  if(!automatic){invalidate();filter='all';reviewLines.clear();}feedback.textContent='';if(mapped.errors.length){feedback.textContent=mapped.errors.slice(0,20).map(e=>`${e.line?'Zeile '+e.line+': ':''}${e.message}`).join('\n');return;}
  const current=generation,input={schoolYear:fixedClass?.schoolYear||year.value.trim(),...(fixedClass?{fixedClassId:fixedClass.id}:{}),sourceNamespace:source.value.trim(),rows:mapped.rows,decisions:structuredClone(decisions)};setBusy('preview');
  try{const result=await (teachers?client.previewTeacherImport(input):client.previewImport(input));if(!allowed()||current!==generation)return;plan=result;frozen=input;dirty=false;operationId=globalThis.crypto.randomUUID();const focused=doc.activeElement?.getAttribute('aria-label');if(!automatic)page=0;const scrollTop=dialog.scrollTop;renderPlan();if(automatic){const target=[...summary.querySelectorAll('[aria-label]')].find(e=>e.getAttribute('aria-label')===focused);target?.focus({preventScroll:true});dialog.scrollTop=scrollTop;}}
  catch(e){if(allowed()&&current===generation){dirty=true;frozen=null;validationError=e.message||'Die Vorschau konnte nicht erstellt werden.';feedback.textContent=validationError;previewButton.hidden=false;}}
  finally{if(allowed()&&current===generation)setBusy(null);}
 }
 async function commit(){
  if(busy||dirty||autoTimer||!allowed()||!plan||!frozen||plan.counts.review||!approval.checked)return;
  const current=generation,payload={...frozen,previewHash:plan.planHash},revision=plan.revision;setBusy('commit');feedback.textContent='';
  try{const result=await client.mutate(teachers?'importTeachers':'importStudents',payload,revision,operationId);if(!allowed()||current!==generation)return;const counts=plan.counts;destroy();onCommit(result,counts);}
  catch(e){if(allowed()){feedback.textContent=e.message||'Übernahme nicht möglich. Bitte erneut prüfen.';if(['revision-conflict','preview-mismatch'].includes(e.code)){invalidate();back.hidden=false;}}}
  finally{if(allowed())setBusy(null);}
 }
 form.addEventListener('submit',event=>{event.preventDefault();void preview();});dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',destroy);
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');file.focus();
 return {destroy};
}
