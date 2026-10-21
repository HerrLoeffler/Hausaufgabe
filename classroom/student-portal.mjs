// Separate local pupil session. This module never calls teacher Firebase auth.
export function installStudentPortal({document:doc=globalThis.document,fetchImpl=globalThis.fetch}){
 let dialog=null,student=null,busy=false,error='',generation=0,closed=false,tab='available',subject='';
 const make=(tag,text,attrs={})=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
 const button=(label,action,attrs={})=>{const b=make('button',label,{type:'button',class:'button ghost',...attrs});b.disabled=busy;b.addEventListener('click',action);return b;};
 const trigger=button('Mein Schülerzugang',open,{'data-student-access-open':'',class:'button ghost studentEntryButton'});
 const anchor=doc.getElementById('joinForm');if(anchor)anchor.after(trigger);else doc.getElementById('gcEntryStart')?.append(trigger);
 async function request(path,body){const response=await fetchImpl('/api/classroom/student/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok){const e=Error(result.error?.message||'Der Schülerzugang ist gerade nicht erreichbar.');e.status=response.status;throw e;}return result;}
 function close(){generation++;dialog?.remove();dialog=null;student=null;busy=false;error='';}
 async function open(){
  if(closed)return;close();const current=generation;dialog=make('dialog',undefined,{class:'classroomDialog pupilPortal','data-student-portal':'','data-telemetry-private':'true','aria-label':'Mein Schülerzugang'});doc.body.append(dialog);busy=true;render();if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
  dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});dialog.addEventListener('close',close);
  try{const next=await request('me');if(current!==generation||closed)return;student=next;}catch(e){if(current!==generation||closed)return;if(e.status!==401)error=e.message;}
  finally{if(current===generation&&!closed){busy=false;render();}}
 }
 function render(){
  if(!dialog)return;dialog.replaceChildren();const head=make('div',undefined,{class:'classroomDialogHead'});head.append(make('h2',student?'Mein Schülerbereich':'Mein Schülerzugang'),button('Schließen',close));dialog.append(head);
  if(error)dialog.append(make('p',error,{class:'classroomError',role:'alert'}));
  if(busy){dialog.append(make('p','Zugang wird geprüft …',{role:'status'}));return;}
  if(!student){
   const form=make('form',undefined,{'data-student-access-form':'',autocomplete:'off'}),label=make('label','Dein achtstelliger Zugangscode'),input=make('input',undefined,{type:'text',maxlength:'20',required:'',autocomplete:'off',autocapitalize:'characters',spellcheck:'false','data-student-access-code':''});label.append(input);form.append(make('p','Gib den persönlichen Code von deiner Zugangskarte ein. Ein Testcode gehört weiterhin ins Feld „Testcode“.'),label);
   const submit=make('button','Zu meinem Schülerbereich',{type:'submit',class:'button primary'});form.append(submit);dialog.append(form,make('p','Lokaler Test: Dieser Zugang funktioniert auf diesem Mac.',{class:'hint'}));
   form.addEventListener('submit',async e=>{e.preventDefault();if(busy||!form.reportValidity())return;const code=input.value,current=generation;busy=true;error='';render();
    try{const next=await request('login',{code});if(current!==generation||closed)return;student=next;tab='available';subject='';}catch(e){if(current===generation)error=e.message;}finally{if(current===generation&&!closed){busy=false;render();}}
   });input.focus();return;
  }
  dialog.append(make('h3',`Hallo ${student.student.firstName}`),make('p',`${student.school.name} · ${student.student.className}`));
  const tabs=make('div',undefined,{class:'rosterActions'}),assignments=student.assignments||[];
  for(const[key,label]of [['available','Verfügbar'],['done','Erledigt']])tabs.append(button(label,()=>{tab=key;render();},{'aria-pressed':String(tab===key)}));dialog.append(tabs);
  const subjects=[...new Set(assignments.map(a=>a.subject).filter(Boolean))];
  if(subjects.length){const label=make('label','Fach'),select=make('select');select.append(make('option','Alle Fächer',{value:''}));for(const s of subjects)select.append(make('option',s,{value:s}));select.value=subject;select.addEventListener('change',()=>{subject=select.value;render();});label.append(select);dialog.append(label);}
  const rows=assignments.filter(a=>(!subject||a.subject===subject)&&(tab==='done'?['submitted','completed'].includes(a.status):!['submitted','completed'].includes(a.status)));
  if(!rows.length)dialog.append(make('p',tab==='done'?'Du hast noch keine Tests erledigt.':'Dir wurden noch keine Tests zugewiesen.'));
  for(const row of rows){const card=make('article',undefined,{class:'card'});card.append(make('h3',row.title),make('p',`${row.subject||'Ohne Fach'} · ${tab==='done'?'Erledigt':row.status==='in_progress'?'Begonnen':'Verfügbar'}`));dialog.append(card);}
  if(student.assignmentConnection==='pending')dialog.append(make('p','Die persönliche Testzuweisung wird als nächster Schritt angebunden.',{class:'hint'}));
  dialog.append(button('Vom Schülerbereich abmelden',async()=>{const current=generation;busy=true;error='';render();try{await request('logout',{});if(current===generation)student=null;}catch(e){if(current===generation)error=e.message;}finally{if(current===generation&&!closed){busy=false;render();}}}));
 }
 if(new URL(doc.location.href).searchParams.get('student')==='1')queueMicrotask(open);
 return {open,destroy(){closed=true;close();trigger.remove();}};
}
