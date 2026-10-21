import {openStudentAccess} from './student-access-dialog.mjs';
import {openRosterImport} from './roster-import-dialog.mjs';
// Named, account-owned device-local roster. No authentication simulation or quiz
// writes. IDs remain stable when names and class membership are edited.
export function createManualRoster({document:doc,client,accessClient,onChange,onStudents,onFindClasses,onClassesChanged}){
 let uid=null,epoch=0,status='idle',error='',state={revision:0,classes:[],students:[]};
 let filter='',search='',page=0,dialog=null,importDialog=null,accessDialog=null,closed=false,importNotice='';
 const make=(tag,text,attrs={})=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
 const button=(label,action,attrs={})=>{const b=make('button',label,{type:'button',class:'button ghost',...attrs});b.addEventListener('click',action);return b;};
 const sortedClasses=()=>[...state.classes].sort((a,b)=>b.schoolYear.localeCompare(a.schoolYear)||a.name.localeCompare(b.name,'de',{numeric:true}));
 const classLabel=id=>{const c=state.classes.find(x=>x.id===id);return c?`${c.name} · ${c.schoolYear}`:'Ohne Klasse';};
 function dismiss(){accessDialog?.destroy();accessDialog=null;importDialog?.destroy();importDialog=null;if(!dialog)return;dialog.remove();dialog=null;}
 async function load(){
  if(!uid||closed)return;const current=epoch;status='loading';error='';onChange();
  try{const data=await client.read();if(current!==epoch||closed)return;state=data;status='ready';}
  catch(e){if(current!==epoch||closed)return;status='error';error=e.code==='unavailable'?e.message:'Der lokale Bestand konnte nicht geladen werden. Bitte erneut versuchen.';}
  onChange();
 }
 function setAccount(next){
  if(uid===next)return;uid=next;epoch++;dismiss();filter='';search='';page=0;importNotice='';state={revision:0,classes:[],students:[]};status='idle';error='';
  if(uid)queueMicrotask(load);
 }
 function note(host){
  if(importNotice)host.append(make('p',importNotice,{role:'status',class:'rosterImportSuccess'}));
  host.append(make('p',state.contextId?`Auf diesem Mac gespeichert · ${state.schoolName} · ${state.canManageRoster?'Schulverwaltung':'Deine ausgewählten Klassen'}`:'Auf diesem Mac gespeichert · Nur für deinen angemeldeten Account',{class:'hint rosterStorageNote'}));
  if(status==='loading')host.append(make('p','Klassen und Schüler:innen werden geladen …',{role:'status'}));
  if(status==='error'){
   host.append(make('p',error,{class:'classroomError',role:'alert'}),button('Erneut laden',load));
  }
 }
 function formDialog(kind,item=null){
  if(status!=='ready'||!uid||(kind==='class'?state.canCreateClass===false:state.canAddStudents===false))return;
  dismiss();const current=epoch,revision=state.revision,isStudent=kind==='student';
  let pending=false,lastPayload='',operationId='';
  const title=isStudent?(item?'Schüler:in bearbeiten':'Schüler:in hinzufügen'):(item?'Klasse bearbeiten':'Klasse hinzufügen');
  dialog=make('dialog',undefined,{class:'classroomDialog rosterDialog','aria-labelledby':'rosterDialogTitle','data-roster-dialog':'', 'data-telemetry-private':'true'});
  const target=dialog,form=make('form',undefined,{'data-roster-form':'',autocomplete:'off'}),head=make('div',undefined,{class:'classroomDialogHead'});
  const cancel=()=>{if(!pending){dismiss();onChange();}};
  head.append(make('h2',title,{id:'rosterDialogTitle'}),button('Schließen',cancel,{'aria-label':'Dialog schließen'}));form.append(head);
  const field=(label,name,value='',attrs={})=>{const wrap=make('label',label),input=make('input',undefined,{name,required:'',maxlength:'100',...attrs});input.value=value;wrap.append(input);form.append(wrap);return input;};
  if(isStudent){
   field('Vorname','firstName',item?.firstName||'',{'data-roster-first-name':''});field('Nachname','lastName',item?.lastName||'');
   const wrap=make('label','Klasse'),select=make('select',undefined,{name:'classId'});select.append(make('option','Ohne Klasse',{value:''}));
   for(const c of sortedClasses())select.append(make('option',`${c.name} · ${c.schoolYear}`,{value:c.id}));
   select.value=item?.classId||(filter==='unassigned'?'':filter)||'';wrap.append(select);form.append(wrap);
   form.append(make('p','Vor- und Nachname werden in deinem lokalen Klassenbestand gespeichert.',{class:'hint'}));
  }else{
   field('Klassenname','name',item?.name||'',{maxlength:'40',placeholder:'z. B. 9b'});
   const date=new Date(),start=date.getMonth()>=8?date.getFullYear():date.getFullYear()-1;
   field('Schuljahr','schoolYear',item?.schoolYear||`${start}/${String((start+1)%100).padStart(2,'0')}`,{maxlength:'7',pattern:'[0-9]{4}/[0-9]{2}',placeholder:'2026/27'});
  }
  const feedback=make('p','',{role:'alert',class:'classroomError'}),duplicateLabel=make('label',undefined,{class:'classroomCheck hidden'}),duplicate=make('input',undefined,{type:'checkbox'});
  duplicateLabel.append(duplicate,make('span','Gleicher Name vorhanden: als weitere Person hinzufügen.'));form.append(duplicateLabel,feedback);
  const actions=make('div',undefined,{class:'rosterActions'}),save=make('button',item?'Änderungen speichern':isStudent?'Schüler:in hinzufügen':'Klasse hinzufügen',{type:'submit',class:'button primary'}),cancelButton=button('Abbrechen',cancel);
  actions.append(cancelButton,save);form.append(actions);
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(pending||current!==epoch||!form.reportValidity())return;
   const value=name=>form.elements.namedItem(name).value.trim();
   const payload=isStudent?{firstName:value('firstName'),lastName:value('lastName'),classId:value('classId')||null}:{name:value('name'),schoolYear:value('schoolYear')};
   if(item)payload.id=item.id;
   if(isStudent&&!item&&state.students.some(s=>s.firstName.toLocaleLowerCase('de')===payload.firstName.toLocaleLowerCase('de')&&s.lastName.toLocaleLowerCase('de')===payload.lastName.toLocaleLowerCase('de'))&&!duplicate.checked){
    duplicateLabel.classList.remove('hidden');feedback.textContent='Eine Person mit diesem Namen ist bereits vorhanden. Bitte prüfen.';return;
   }
   const fingerprint=JSON.stringify(payload);if(fingerprint!==lastPayload){operationId=globalThis.crypto.randomUUID();lastPayload=fingerprint;}
   pending=true;save.disabled=true;cancelButton.disabled=true;feedback.textContent='';save.textContent='Wird gespeichert …';
   try{
    const next=await client.mutate(`${item?'update':'create'}${isStudent?'Student':'Class'}`,payload,revision,operationId);
    if(current!==epoch||closed)return;state=next;status='ready';dismiss();onChange();if(!isStudent)onClassesChanged?.();
   }catch(e){
    if(current!==epoch||closed)return;feedback.textContent=e.message||'Speichern nicht möglich. Bitte erneut versuchen.';
    if(e.code==='revision-conflict'){
     const reload=button('Bestand neu laden',()=>{dismiss();void load();});feedback.append(' ',reload);
    }
   }finally{
    pending=false;if(target.isConnected){save.disabled=false;cancelButton.disabled=false;save.textContent=item?'Änderungen speichern':isStudent?'Schüler:in hinzufügen':'Klasse hinzufügen';}
   }
  });
  target.addEventListener('cancel',event=>{if(pending)event.preventDefault();});
  target.addEventListener('close',()=>{if(dialog===target){target.remove();dialog=null;}});
  target.append(form);doc.body.append(target);if(typeof target.showModal==='function')target.showModal();else target.setAttribute('open','');form.querySelector('input')?.focus();
 }
 function importButton(kind='students'){
  const b=button(kind==='teachers'?'Lehrkräfte-CSV importieren':'ASV-/CSV-Datei importieren',()=>{
   if(status!=='ready'||!uid||state.canManageRoster===false)return;dismiss();const current=epoch;
   importDialog=openRosterImport({document:doc,kind,client,state,isCurrent:()=>current===epoch&&!closed&&Boolean(uid),onCommit:(next,counts)=>{state=next;status='ready';importDialog=null;importNotice=`Import abgeschlossen: ${counts.newTeachers??counts.newStudents} neu, ${counts.updated} geändert, ${counts.unchanged} unverändert.`;onChange();}});
  },{[kind==='teachers'?'data-roster-import-teachers':'data-roster-import']:''});b.disabled=status!=='ready'||state.canManageRoster===false;return b;
 }
 function renderClasses(host){
  const section=make('section',undefined,{class:'rosterManaged','data-telemetry-private':'true'}),head=make('div',undefined,{class:'rosterHeading'});
  head.append(make('h2','Klassenbestand'));const add=button('Klasse hinzufügen',()=>formDialog('class'),{class:'button primary','data-roster-create-class':''});add.disabled=status!=='ready'||state.canCreateClass===false;head.append(add,importButton());if(onFindClasses)head.append(button('Klasse finden',onFindClasses));section.append(head);note(section);
  if(status==='ready'){
   if(!state.classes.length)section.append(make('p','Noch keine Klasse angelegt. Lege deine erste Klasse an und füge anschließend Schüler:innen hinzu.'));
   const grid=make('div',undefined,{class:'classroomGrid'});
   for(const c of sortedClasses()){
    const card=make('article',undefined,{class:'card classroomClassCard'}),count=state.students.filter(s=>s.classId===c.id).length;
    const teaching=(state.teachers||[]).flatMap(t=>(t.assignments||[]).filter(a=>a.classId===c.id).map(a=>`${t.firstName} ${t.lastName}: ${a.subject}`));
    card.append(make('h3',c.name),make('p',c.schoolYear),make('p',`${count} Schüler:innen`),button('Schüler:innen öffnen',()=>{filter=c.id;search='';page=0;onStudents();},{'data-roster-class':c.id}),...(state.canManageRoster===false?[]:[button('Klasse bearbeiten',()=>formDialog('class',c),{'data-roster-edit-class':c.id})]));if(teaching.length)card.append(make('p',teaching.join(' · '),{class:'rosterClassTeaching'}));grid.append(card);
   }
   section.append(grid);
  }
  host.append(section);
 }
 function renderStudents(host){
  const head=make('div',undefined,{class:'rosterHeading'});head.append(make('h2','Schülerbestand'));
  const add=button('Schüler:in hinzufügen',()=>formDialog('student'),{class:'button primary','data-roster-create-student':''});add.disabled=status!=='ready'||state.canAddStudents===false;head.append(add,importButton());host.append(head);note(host);
  if(status!=='ready')return;
  const tools=make('div',undefined,{class:'rosterFilters'}),searchLabel=make('label','Nach Namen suchen'),input=make('input',undefined,{type:'search','aria-label':'Nach Namen suchen',autocomplete:'off'});input.value=search;
  const filterLabel=make('label','Klasse'),select=make('select',undefined,{'aria-label':'Nach Klasse filtern'});
  select.append(make('option','Alle Klassen',{value:''}),make('option','Ohne Klasse',{value:'unassigned'}));for(const c of sortedClasses())select.append(make('option',`${c.name} · ${c.schoolYear}`,{value:c.id}));select.value=filter;
  searchLabel.append(input);filterLabel.append(select);tools.append(searchLabel,filterLabel);host.append(tools);
  const result=make('div',undefined,{'data-roster-student-results':'','data-telemetry-private':'true'});host.append(result);
  function list(){
   result.replaceChildren();const term=search.toLocaleLowerCase('de');
   const rows=state.students.filter(s=>(!filter||(filter==='unassigned'?!s.classId:s.classId===filter))&&`${s.firstName} ${s.lastName}`.toLocaleLowerCase('de').includes(term)).sort((a,b)=>a.lastName.localeCompare(b.lastName,'de')||a.firstName.localeCompare(b.firstName,'de'));
   if(accessClient&&state.contextId&&rows.length)result.append(button('Zugänge & Drucken',()=>showAccess(rows),{class:'button primary','data-roster-access':''}));
   const pages=Math.max(1,Math.ceil(rows.length/50));page=Math.min(page,pages-1);
   if(!rows.length){result.append(make('p',state.students.length?'Keine Schüler:innen für diese Auswahl.':'Noch keine Schüler:innen angelegt. Füge die erste Person hinzu.'));return;}
   const wrap=make('div',undefined,{class:'rosterTableWrap'}),table=make('table',undefined,{class:'rosterTable'}),thead=make('thead'),heading=make('tr');
   for(const label of ['Vorname','Nachname','Klasse','Aktionen'])heading.append(make('th',label,{scope:'col'}));thead.append(heading);const tbody=make('tbody');
   for(const s of rows.slice(page*50,page*50+50)){
    const row=make('tr');row.append(make('td',s.firstName),make('td',s.lastName),make('td',classLabel(s.classId)));const action=make('td');if(state.canManageRoster!==false)action.append(button('Bearbeiten',()=>formDialog('student',s),{'data-roster-edit-student':s.id,'aria-label':`${s.firstName} ${s.lastName} bearbeiten`}));if(accessClient&&state.contextId)action.append(button('Zugang & Karte',()=>showAccess([s]),{'data-roster-access-student':s.id}));row.append(action);tbody.append(row);
   }
   table.append(thead,tbody);wrap.append(table);result.append(wrap);
   const paging=make('div',undefined,{class:'rosterActions'}),prev=button('Zurück',()=>{page--;list();}),next=button('Weiter',()=>{page++;list();});prev.disabled=page===0;next.disabled=page>=pages-1;
   paging.append(prev,make('span',`${rows.length} Schüler:innen · Seite ${page+1} von ${pages}`,{role:'status'}),next);result.append(paging);
  }
  input.addEventListener('input',()=>{search=input.value;page=0;list();});select.addEventListener('change',()=>{filter=select.value;page=0;list();});list();
 }
 function showAccess(students){
  if(status!=='ready'||!uid||!accessClient)return;dismiss();const current=epoch;accessDialog=openStudentAccess({document:doc,client:accessClient,state,students,isCurrent:()=>current===epoch&&!closed&&Boolean(uid)});
 }
 function renderTeachers(host){
  const head=make('div',undefined,{class:'rosterHeading'});head.append(make('h2','Lehrkräftebestand'),importButton('teachers'));host.append(head);note(host);
  host.append(make('p','Lehrkräfte mit ihren Klassen und Fächern verwalten. Ein Eintrag vergibt keine Login- oder Administrationsrechte.',{class:'hint'}));
  const example='Personal-ID;Vorname;Nachname;Kürzel;Klasse;Fach\n0001;Ada;Beispiel;AB;8b;Deutsch\n0001;Ada;Beispiel;AB;9b;Englisch\n0002;Mila;Muster;MM;8b;Technik\n';
  host.append(make('a','Beispiel-CSV herunterladen',{href:'data:text/csv;charset=utf-8,'+encodeURIComponent('\ufeff'+example),download:'SYNTHETISCH_Lehrkraefte_Beispiel.csv',class:'button ghost'}));
  if(status!=='ready')return;
  const label=make('label','Lehrkräfte suchen',{class:'rosterTeacherSearch'}),input=make('input',undefined,{type:'search','aria-label':'Lehrkräfte suchen',autocomplete:'off'}),result=make('div',undefined,{'data-telemetry-private':'true'});label.append(input);host.append(label,result);
  function list(){
   result.replaceChildren();const term=input.value.toLocaleLowerCase('de');
   const teachers=(state.teachers||[]).filter(t=>`${t.firstName} ${t.lastName} ${t.shortCode}`.toLocaleLowerCase('de').includes(term)).sort((a,b)=>a.lastName.localeCompare(b.lastName,'de'));
   if(!teachers.length){result.append(make('p','Noch keine passenden Lehrkräfte. Importiere eine CSV-Datei.'));return;}
   const wrap=make('div',undefined,{class:'rosterTableWrap'}),table=make('table',undefined,{class:'rosterTable'}),thead=make('thead'),tr=make('tr');
   for(const title of ['Lehrkraft','Kürzel','Klassen und Fächer'])tr.append(make('th',title,{scope:'col'}));thead.append(tr);table.append(thead);const tbody=make('tbody');
   for(const t of teachers){const tr=make('tr');tr.append(make('td',`${t.firstName} ${t.lastName}`),make('td',t.shortCode||'—'));const pairs=make('td');
    if(!t.assignments?.length)pairs.append(make('span','Keine Zuordnung'));
    for(const a of t.assignments||[])pairs.append(make('p',`${classLabel(a.classId)} / ${a.subject}`));tr.append(pairs);tbody.append(tr);
   }
   table.append(tbody);wrap.append(table);result.append(wrap,make('p',`${teachers.length} Lehrkräfte`,{role:'status'}));
  }
  input.addEventListener('input',list);list();
 }
 return {setAccount,reload(){epoch++;dismiss();void load();},renderClasses,renderStudents,renderTeachers,destroy(){closed=true;epoch++;dismiss();state={revision:0,classes:[],students:[]};}};
}
