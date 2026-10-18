import {decodeCsv,parseCsv} from './csv.mjs';
import {mapNamedStudents,suggestNamedMapping} from './named-import.mjs';

export function openRosterImport({document:doc,client,state,isCurrent,onCommit}){
 const make=(tag,text,attrs={})=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
 const button=(label,action,attrs={})=>{const b=make('button',label,{type:'button',class:'button ghost',...attrs});b.addEventListener('click',action);return b;};
 let bytes=null,parsed=null,plan=null,frozen=null,decisions=[],generation=0,dead=false,busy=null,operationId=null,page=0;
 const dialog=make('dialog',undefined,{class:'classroomDialog rosterImportDialog','data-import-dialog':'','aria-labelledby':'namedImportTitle','data-telemetry-private':'true'}),form=make('form',undefined,{autocomplete:'off'});
 const header=make('div',undefined,{class:'classroomDialogHead'});header.append(make('h2','Schülerliste importieren',{id:'namedImportTitle'}),button('Schließen',close,{'aria-label':'Import schließen'}));form.append(header);
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
 config.append(make('p','Eine Kennung ist optional. Verwende sie nur, wenn sie dieselbe Person über mehrere Exporte zuverlässig bezeichnet. Behalte dafür dieselbe Importquelle bei.',{class:'hint'}));form.append(config);
 const mappingArea=make('section',undefined,{'data-import-mapping':''}),feedback=make('p','',{role:'alert',class:'classroomError'}),summary=make('section',undefined,{'data-import-summary':'','aria-live':'polite'});
 const previewButton=button('Änderungen prüfen',()=>void preview(),{class:'button secondary','data-import-preview':''});previewButton.disabled=true;
 const back=button('Datei und Spalten ändern',()=>{if(busy)return;config.hidden=false;mappingArea.hidden=false;back.hidden=true;invalidate();},{'data-import-back':''});back.hidden=true;
 form.append(mappingArea,feedback,previewButton,back,summary);
 const approvalLabel=make('label',undefined,{class:'classroomCheck'}),approval=make('input',undefined,{type:'checkbox','data-import-approval':''});approvalLabel.append(approval,make('span','Ich habe die Änderungen geprüft und möchte sie übernehmen.'));form.append(approvalLabel);
 const confirmStatus=make('p','Bitte zuerst die Änderungen prüfen.',{id:'namedImportConfirmStatus',role:'status','data-import-confirm-status':''}),showReview=button('Offene Zuordnungen anzeigen',()=>{if(busy||!plan)return;const index=plan.rows.findIndex(r=>r.status==='review');if(index<0)return;page=Math.floor(index/50);renderPlan();summary.querySelector(`[aria-label="Entscheidung für Zeile ${plan.rows[index].line}"]`)?.focus();},{'data-import-show-review':''});showReview.hidden=true;form.append(confirmStatus,showReview);
 const actions=make('div',undefined,{class:'rosterActions'}),cancel=button('Abbrechen',close,{'data-import-cancel':''}),confirm=button('Geprüfte Änderungen übernehmen',()=>void commit(),{class:'button primary','data-import-confirm':''});confirm.disabled=true;confirm.setAttribute('aria-describedby','namedImportConfirmStatus');actions.append(cancel,confirm);form.append(actions);dialog.append(form);doc.body.append(dialog);
 let mapping={};
 function allowed(){return !dead&&isCurrent();}
 function invalidate(clear=true){generation++;plan=null;frozen=null;operationId=null;approval.checked=false;confirm.disabled=true;previewButton.hidden=false;if(clear)summary.replaceChildren();updateConfirmation();}
 function setBusy(value){busy=value;back.disabled=Boolean(value);for(const e of config.querySelectorAll('input,select'))e.disabled=Boolean(value);for(const e of mappingArea.querySelectorAll('select'))e.disabled=Boolean(value);for(const e of summary.querySelectorAll('button,input,select'))e.disabled=Boolean(value);approval.disabled=Boolean(value);year.disabled=Boolean(value)||Boolean(fixed.value);previewButton.disabled=Boolean(value)||!parsed;cancel.disabled=value==='commit';updateConfirmation();}
 function updateConfirmation(){
  confirm.disabled=Boolean(busy)||!plan||plan.counts.review>0||!approval.checked;
  showReview.hidden=!plan||plan.counts.review===0;showReview.disabled=Boolean(busy);
  confirmStatus.className=plan?.counts.review?'classroomError':'hint';
  confirmStatus.textContent=busy==='commit'?'Änderungen werden gespeichert …':busy==='preview'?'Änderungen werden geprüft …':!plan?(parsed?'Bitte die Änderungen erneut prüfen.':'Bitte zuerst die Änderungen prüfen.'):plan.counts.review?`${plan.counts.review} Zuordnung(en) noch offen. Bitte auch auf den anderen Seiten entscheiden: bestehende Person zuordnen, neu anlegen oder überspringen.`:!approval.checked?'Bitte die geprüften Änderungen mit dem Häkchen bestätigen.':'Alle Zuordnungen geklärt. Die geprüften Änderungen können übernommen werden.';
 }
 function destroy(){if(dead)return;dead=true;generation++;bytes=null;parsed=null;plan=null;frozen=null;decisions=[];mapping={};file.value='';dialog.remove();}
 function close(){if(busy==='commit')return;destroy();if(isCurrent())doc.querySelector('[data-roster-import]')?.focus();}
 function parse(auto=false){
  invalidate();decisions=[];mappingArea.replaceChildren();feedback.textContent='';parsed=null;
  if(!bytes){previewButton.disabled=true;return;}
  try{
   const text=decodeCsv(bytes,encoding.value);let next=parseCsv(text,{delimiter:delimiter.value||undefined,header:hasHeader.checked});
   if(auto){const guess=suggestNamedMapping(next.rows[0]);hasHeader.checked=guess.firstName!==''&&guess.lastName!=='';next=parseCsv(text,{delimiter:delimiter.value||undefined,header:hasHeader.checked});}
   parsed=next;mapping=suggestNamedMapping(next.headers);
   if(!next.header&&next.delimiter==='|'&&next.headers.length===10){mapping={firstName:3,lastName:2,className:7,sourceId:''};mappingArea.append(make('p','Zehnspaltige Pipe-Datei ohne Kopfzeile erkannt. Bitte die Spaltenzuordnung prüfen.',{class:'hint'}));}
   mappingArea.append(make('h3','Spalten zuordnen'));
   for(const[key,label]of [['firstName','Vorname'],['lastName','Nachname'],['className','Klasse'],['sourceId','Kennung (optional)']]){
    const wrap=make('label',label),s=make('select',undefined,{'data-import-map':key});s.append(make('option',key==='sourceId'?'Keine Kennung verwenden':'Bitte wählen',{value:''}));
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
 function setDecision(line,action,studentId){decisions=decisions.filter(d=>d.line!==line);if(action)decisions.push({line,action,...(studentId?{studentId}:{})});invalidate();feedback.textContent='Zuordnung geändert. Bitte die Änderungen erneut prüfen.';}
 function chooseExisting(line,cell){
  invalidate(false);for(const e of summary.querySelectorAll('button,input,select'))e.disabled=true;
  const box=make('div',undefined,{class:'rosterLinkPicker'}),input=make('input',undefined,{type:'search',placeholder:'Bestehende Person suchen','aria-label':'Bestehende Person suchen'}),select=make('select',undefined,{'aria-label':'Bestehendes Konto wählen'});
  function fill(){select.replaceChildren(make('option','Bitte eine Person wählen',{value:''}));const term=input.value.toLocaleLowerCase('de');for(const s of state.students.filter(s=>`${s.firstName} ${s.lastName}`.toLocaleLowerCase('de').includes(term)).slice(0,100)){const c=state.classes.find(c=>c.id===s.classId);select.append(make('option',`${s.firstName} ${s.lastName} · ${c?c.name+' '+c.schoolYear:'Ohne Klasse'} · ${state.students.indexOf(s)+1}`,{value:s.id}));}}
  input.addEventListener('input',fill);select.addEventListener('change',()=>{if(select.value)setDecision(line,'link',select.value);});fill();box.append(input,select);cell.append(box);input.focus();
 }
 function renderPlan(){
  updateConfirmation();
  config.hidden=true;mappingArea.hidden=true;previewButton.hidden=true;back.hidden=false;
  summary.replaceChildren();summary.append(make('h3','Das wird übernommen'));
  const counts=make('div',undefined,{class:'rosterImportCounts'});
  for(const[count,label]of [[plan.counts.newStudents,'Neu'],[plan.counts.unchanged,'Unverändert'],[plan.counts.updated,'Geändert'],[plan.counts.review,'Zuordnung prüfen']])counts.append(make('p',`${count} ${label}`));summary.append(counts);
  summary.append(make('p',`${plan.counts.nameChanges} Namensänderungen · ${plan.counts.classChanges} Klassenwechsel · ${plan.counts.skipped} übersprungene Zeilen`));
  if(plan.newClasses.length)summary.append(make('p','Neue Klassen: '+plan.newClasses.map(c=>`${c.name} · ${c.schoolYear}`).join(', ')));
  if(plan.counts.review){
   summary.append(make('p','Bitte unklare Personen ausdrücklich einem bestehenden Konto zuordnen, als neue Person anlegen oder überspringen.',{class:'classroomError'}));
   const unique=plan.rows.filter(r=>r.status==='review'&&r.candidates.length===1);
   if(unique.length)summary.append(button('Eindeutige Namensvorschläge zuordnen',()=>{for(const r of unique){decisions=decisions.filter(d=>d.line!==r.line);decisions.push({line:r.line,action:'link',studentId:r.candidates[0].id});}invalidate();feedback.textContent='Namensvorschläge ausgewählt. Bitte die Änderungen erneut prüfen.';}));
  }
  const wrap=make('div',undefined,{class:'rosterTableWrap'}),table=make('table'),head=make('tr');for(const title of ['Zeile','Person','Änderung','Bisherige Klasse','Neue Klasse','Entscheidung'])head.append(make('th',title,{scope:'col'}));const thead=make('thead');thead.append(head);table.append(thead);const tbody=make('tbody');
  const statuses={create:'Neu',unchanged:'Unverändert',review:'Zuordnung prüfen',skip:'Überspringen'};
  for(const row of plan.rows.slice(page*50,page*50+50)){
   const tr=make('tr'),name=row.nameChanged?`${row.before.firstName} ${row.before.lastName} → ${row.after.firstName} ${row.after.lastName}`:`${row.after.firstName} ${row.after.lastName}`;
   const label=row.status==='update'?(row.nameChanged&&row.classChanged?'Name und Klasse geändert':row.classChanged?'Klassenwechsel':'Namensänderung'):statuses[row.status];
   for(const value of [String(row.line),name,label,row.before?.classLabel||'—',row.after.classLabel])tr.append(make('td',value));
   const cell=make('td'),s=make('select',undefined,{'aria-label':`Entscheidung für Zeile ${row.line}`});s.append(make('option',row.status==='review'?'Bitte entscheiden':'Vorschlag übernehmen',{value:''}));
   if(!row.studentId){s.append(make('option','Als neue Person anlegen',{value:'create'}));for(const c of row.candidates)s.append(make('option',`Zuordnen: ${c.firstName} ${c.lastName} · ${c.classLabel}`,{value:'link:'+c.id}));if(state.students.length)s.append(make('option','Andere bestehende Person wählen',{value:'other'}));}
   s.append(make('option','Zeile überspringen',{value:'skip'}));const d=decisions.find(d=>d.line===row.line);if(d?.action==='skip')s.value='skip';else if(d?.action==='create')s.value='create';
   s.addEventListener('change',()=>{if(s.value==='other'){chooseExisting(row.line,cell);return;}const[action,id]=s.value.split(':');setDecision(row.line,action,id);});cell.append(s);tr.append(cell);tbody.append(tr);
  }
  table.append(tbody);wrap.append(table);summary.append(wrap);
  if(plan.rows.length>50){const paging=make('div',undefined,{class:'rosterActions'}),prev=button('Zurück',()=>{page--;renderPlan();}),next=button('Weiter',()=>{page++;renderPlan();});prev.disabled=page===0;next.disabled=(page+1)*50>=plan.rows.length;paging.append(prev,make('span',`Seite ${page+1} von ${Math.ceil(plan.rows.length/50)}`),next);summary.append(paging);}
  if(plan.missingStudents.length){const details=make('details'),title=make('summary',`${plan.missingStudents.length} bestehende Personen nicht zugeordnet – bleiben unverändert`);details.append(title);for(const s of plan.missingStudents.slice(0,50))details.append(make('p',`${s.firstName} ${s.lastName} · ${s.classLabel}`));if(plan.missingStudents.length>50)details.append(make('p','Weitere Personen bleiben ebenfalls unverändert.'));summary.append(details);}
 }
 async function preview(){
  if(!parsed||busy||!allowed()||!form.reportValidity())return;
  const fixedClass=state.classes.find(c=>c.id===fixed.value),fixedClassName=fixedClass?.name||'',mapped=mapNamedStudents(parsed,mapping,{fixedClassName});
  invalidate();feedback.textContent='';if(mapped.errors.length){feedback.textContent=mapped.errors.slice(0,20).map(e=>`${e.line?'Zeile '+e.line+': ':''}${e.message}`).join('\n');return;}
  const current=generation,input={schoolYear:fixedClass?.schoolYear||year.value.trim(),...(fixedClass?{fixedClassId:fixedClass.id}:{}),sourceNamespace:source.value.trim(),rows:mapped.rows,decisions:structuredClone(decisions)};setBusy('preview');
  try{const result=await client.previewImport(input);if(!allowed()||current!==generation)return;plan=result;frozen=input;operationId=globalThis.crypto.randomUUID();page=0;renderPlan();}
  catch(e){if(allowed())feedback.textContent=e.message||'Die Vorschau konnte nicht erstellt werden.';}
  finally{if(allowed())setBusy(null);}
 }
 async function commit(){
  if(busy||!allowed()||!plan||plan.counts.review||!approval.checked)return;
  const current=generation,payload={...frozen,previewHash:plan.planHash},revision=plan.revision;setBusy('commit');feedback.textContent='';
  try{const result=await client.mutate('importStudents',payload,revision,operationId);if(!allowed()||current!==generation)return;const counts=plan.counts;destroy();onCommit(result,counts);}
  catch(e){if(allowed()){feedback.textContent=e.message||'Übernahme nicht möglich. Bitte erneut prüfen.';if(['revision-conflict','preview-mismatch'].includes(e.code)){plan=null;frozen=null;approval.checked=false;summary.replaceChildren();}}}
  finally{if(allowed())setBusy(null);}
 }
 form.addEventListener('submit',event=>{event.preventDefault();void preview();});dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',destroy);
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');file.focus();
 return {destroy};
}
