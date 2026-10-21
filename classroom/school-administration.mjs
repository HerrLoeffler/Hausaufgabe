// Additive local school workflow; the original teacher login and quiz engine own
// their existing state. All membership and roster authority is checked by API.
export function createSchoolAdministration({document:doc,host,port,client,onContextChange,onLabel}){
 let uid=null,epoch=0,state=null,busy=false,error='',notice='',preview=null,issued=null,pendingAction=null,closed=false;
 const el=(tag,value,attrs={})=>{const n=doc.createElement(tag);if(value!==undefined)n.textContent=value;for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
 const button=(label,fn,attrs={})=>{const b=el('button',label,{type:'button',class:'button ghost',...attrs});b.disabled=busy;b.addEventListener('click',fn);return b;};
 function field(form,label,name,value='',attrs={}){const wrap=el('label',label),input=el('input',undefined,{name,required:'',maxlength:'100',autocomplete:'off',...attrs});input.value=value;wrap.append(input);form.append(wrap);return input;}
 function submit(form,label,attrs={}){const b=el('button',label,{type:'submit',class:'button primary',...attrs});b.disabled=busy;form.append(b);return b;}
 function panel(title){const box=el('section',undefined,{class:'schoolPanel'});box.append(el('h2',title));host.append(box);return box;}
 async function load(){
  if(!uid||closed)return;const current=++epoch;busy=true;error='';render();
  try{const next=await client.read();if(current!==epoch||closed)return;state=next;onLabel?.(state.currentSchool?.name||'');onContextChange?.();}
  catch(e){if(current!==epoch||closed)return;error=e.message;}
  if(current===epoch){busy=false;render();}
 }
 async function action(command,payload,success,contextChanged=false){
  if(busy||!state)return;const current=epoch,snapshot=state;busy=true;error='';notice='';render();
  try{
   const next=await client.command(command,payload,snapshot);if(current!==epoch||closed)return;
   state=next;preview=null;pendingAction=null;issued=next.invitation||null;notice=success;onLabel?.(state.currentSchool?.name||'');
   if(contextChanged)onContextChange?.();
  }catch(e){if(current!==epoch||closed)return;error=e.message;if(['revision-conflict','context-mismatch'].includes(e.code)){try{const refreshed=await client.read();if(current!==epoch||closed)return;state=refreshed;preview=null;pendingAction=null;onContextChange?.();}catch(reloadError){if(current!==epoch||closed)return;error=reloadError.message+' Bitte über Aktualisieren erneut laden.';}}}
  finally{if(current===epoch&&!closed){busy=false;render();}}
 }
 function confirm(title,copy,command,payload){pendingAction={title,copy,command,payload};issued=null;render();host.querySelector('[data-school-confirm-action]')?.focus();}
 function render(){
  host.replaceChildren();if(!uid)return;
  host.setAttribute('data-telemetry-private','true');
  const head=el('div',undefined,{class:'pageHead'}),intro=el('div');intro.append(el('h1','Schule & Mitglieder'),el('p','Schulbestand gemeinsam verwalten und eigene Klassen auswählen.'));head.append(intro,button('Aktualisieren',load,{'data-school-refresh':''}));host.append(head);
  host.append(el('p','Lokaler Test auf diesem Mac. Persönlicher Login und „Meine Tests“ bleiben erhalten.',{class:'hint'}));
  if(error)host.append(el('p',error,{role:'alert',class:'classroomError'}));
  if(notice)host.append(el('p',notice,{role:'status',class:'rosterImportSuccess'}));
  if(!state){host.append(el('p',busy?'Schulverwaltung wird geladen …':'Bitte erneut laden.',{role:'status'}));return;}
  if(state.schools.length>1||(!state.currentSchool&&state.schools.length)){
   const wrap=el('label','Aktuelle Schule'),select=el('select',undefined,{'aria-label':'Aktuelle Schule','data-school-switch':''});
   if(!state.currentSchool)select.append(el('option','Schule auswählen',{value:''}));
   for(const s of state.schools)select.append(el('option',s.name,{value:s.id}));select.value=state.currentSchool?.id||'';select.disabled=busy;
   select.addEventListener('change',()=>action('selectSchool',{schoolId:select.value},'Schule gewechselt.',true));wrap.append(select);host.append(wrap);
  }
  if(pendingAction){
   const p=pendingAction,box=panel(p.title);box.append(el('p',p.copy),button('Abbrechen',()=>{pendingAction=null;render();}),button('Änderung bestätigen',()=>action(p.command,p.payload,'Änderung gespeichert.',true),{class:'button primary','data-school-confirm-action':''}));return;
  }
  if(preview){
   const box=panel('Übernahme prüfen');box.append(el('p',`Neue Schule: ${preview.name}`),el('p',`${preview.counts.classes} Klassen · ${preview.counts.students} Schüler:innen · ${preview.counts.teachers} Lehrkräfte`),el('p',`Du wirst als ${preview.displayName} erster Verwalter. Namen, Klassen, IDs und Importzuordnungen bleiben erhalten. Dein bisheriger Bestand wird dieser Schule zugeordnet; deine persönlichen Tests bleiben unverändert.`));
   const label=el('label',undefined,{class:'classroomCheck'}),check=el('input',undefined,{type:'checkbox','data-school-setup-approval':''});label.append(check,el('span','Ich habe die Übernahme geprüft und möchte die Schule anlegen.'));box.append(label);
   const commit=button('Schule anlegen & Bestand übernehmen',()=>action('createSchool',{name:preview.name,displayName:preview.displayName,previewHash:preview.planHash},'Schule angelegt. Dein vorhandener Bestand ist übernommen.',true),{class:'button primary','data-school-commit-setup':''});commit.disabled=true;check.addEventListener('change',()=>{commit.disabled=!check.checked||busy;});box.append(button('Angaben ändern',()=>{preview=null;render();}),commit);return;
  }
  const school=state.currentSchool;
  if(!school){
   const box=panel('Schule mit vorhandenem Bestand anlegen'),form=el('form',undefined,{'data-school-setup':''});field(form,'Name der Schule','schoolName','',{maxlength:'140',placeholder:'Name deiner Schule'});field(form,'Dein Name als Verwalter','displayName',port.getSession()?.displayName||'');submit(form,'Übernahme ansehen');
   form.addEventListener('submit',async e=>{e.preventDefault();if(busy||!form.reportValidity())return;const input={name:form.elements.schoolName.value.trim(),displayName:form.elements.displayName.value.trim()},current=epoch;busy=true;error='';render();
    try{const p=await client.previewSetup(input);if(current!==epoch||closed)return;preview=p;state={...state,revision:p.revision};}catch(e){if(current===epoch)error=e.message;}finally{if(current===epoch&&!closed){busy=false;render();}}
   });box.append(el('p','Zuerst siehst du, welche Klassen und Personen übernommen werden. Es wird noch nichts geändert.'),form);
  }else{
   const box=panel(school.name);box.append(el('p',school.role==='admin'?'Deine Rolle: Verwalter':'Deine Rolle: Lehrkraft'));
   renderClasses();
   if(school.role==='admin')renderAdministration();
  }
  if(state.pending.length){const box=panel('Bestätigung steht aus');for(const r of state.pending)box.append(el('p',`${r.schoolName}: Deine Anfrage wurde eingereicht. Ein Verwalter bestätigt jetzt dein Konto. Danach hier aktualisieren.`));}
  renderClaim();
 }
 function renderClasses(){
  const box=panel('Meine Klassen'),form=el('form',undefined,{'data-school-classes':''}),search=field(form,'Klassen suchen','classSearch','',{type:'search',required:'false',placeholder:'z. B. 8b oder 2026/27'});search.removeAttribute('required');
  box.append(el('p','Wähle selbst die Klassen, die du unterrichtest. Du kannst deine Auswahl jederzeit ändern.'));
  if(state.currentSchool.role==='admin')box.append(el('p','Als Verwalter kannst du den gesamten Schulbestand organisieren. Diese Auswahl hält zusätzlich deine eigenen Klassen fest.',{class:'hint'}));
  const list=el('div',undefined,{class:'schoolClassChoices'}),selected=new Set(state.selectedClassIds);
  for(const c of state.classChoices){const label=el('label',undefined,{class:'classroomCheck'}),input=el('input',undefined,{type:'checkbox',value:c.id,'data-school-class':c.id});input.checked=selected.has(c.id);input.disabled=busy;label.append(input,el('span',`${c.name} · ${c.schoolYear}`));list.append(label);}
  if(!state.classChoices.length)list.append(el('p','Noch keine Klassen vorhanden. Die Verwaltung kann sie unter „Klassen“ anlegen oder importieren.'));
  search.addEventListener('input',()=>{for(const label of list.querySelectorAll('label'))label.hidden=!label.textContent.toLocaleLowerCase('de').includes(search.value.toLocaleLowerCase('de'));});
  form.append(list);submit(form,'Meine Klassen speichern');form.addEventListener('submit',e=>{e.preventDefault();if(busy)return;const classIds=[...list.querySelectorAll('input:checked')].map(x=>x.value);void action('selectClasses',{classIds},'Deine Klassenauswahl wurde gespeichert.',true);});box.append(form);
 }
 function renderAdministration(){
  const box=panel('Mitglieder & Verwalter');
  for(const m of state.members){
   const row=el('div',undefined,{class:'classroomRow'}),copy=el('span');copy.append(el('strong',`${m.displayName}${m.isSelf?' (du)':''}`),el('small',`${m.accountLabel} · ${m.role==='admin'?'Verwalter':'Lehrkraft'}`));row.append(copy);
   const role=m.role==='admin'?'teacher':'admin',roleLabel=role==='admin'?'Als Verwalter einsetzen':'Verwalterrolle entfernen';
   const b=button(roleLabel,()=>confirm(roleLabel,`${m.displayName}: ${role==='admin'?'darf Schulbestand und Mitglieder verwalten. Private Tests anderer bleiben geschützt.':'bleibt Schulmitglied und kann eigene Klassen auswählen.'}`,'changeRole',{memberId:m.id,role}));
   const last=m.role==='admin'&&state.members.filter(x=>x.role==='admin').length===1;if(last){b.disabled=true;b.title='Zuerst einen weiteren Verwalter bestätigen.';}row.append(b);
   if(!last)row.append(button('Mitgliedschaft beenden',()=>confirm('Schulmitgliedschaft beenden',`${m.displayName} verliert den Zugriff auf diesen lokalen Schulbestand. Das persönliche Konto und dessen Tests bleiben bestehen.`,'removeMember',{memberId:m.id})));box.append(row);
  }
  if(state.requests.length){
   box.append(el('h3',`${state.requests.length} Konto-Verbindungen prüfen`));
   for(const r of state.requests){const row=el('div',undefined,{class:'classroomRow'});row.append(el('span',`Eingeladen: ${r.invitedName}. Angemeldet: ${r.displayName} (${r.accountLabel}). Rolle: ${r.role==='admin'?'Verwalter':'Lehrkraft'}.`),button('Konto bestätigen',()=>action('approveRequest',{requestId:r.id},'Schulmitglied bestätigt.',true),{'data-school-approve':r.id}));box.append(row);}
  }
  const inviteBox=panel('Person hinzufügen'),form=el('form',undefined,{'data-school-invite':''});field(form,'Name der eingeladenen Person','inviteName');
  const wrap=el('label','Rolle'),role=el('select',undefined,{name:'role'});role.append(el('option','Lehrkraft',{value:'teacher'}),el('option','Verwalter',{value:'admin'}));wrap.append(role);form.append(wrap);submit(form,'Persönliche Einladung erstellen');
  form.addEventListener('submit',e=>{e.preventDefault();if(busy||!form.reportValidity())return;void action('invite',{name:form.elements.inviteName.value.trim(),role:role.value},'Einladung erstellt. Den Code persönlich weitergeben.');});inviteBox.append(form);
  if(issued){
   const label=el('label','Einladungscode (24 Stunden gültig)'),input=el('input',undefined,{readonly:'','data-school-invite-code':'',class:'schoolInvitationCode'});input.value=issued.secret;label.append(input);inviteBox.append(label,button('Code kopieren',async()=>{try{await doc.defaultView.navigator.clipboard.writeText(input.value);notice='Einladungscode kopiert.';render();}catch{input.select();}}));
   inviteBox.append(el('p','Die Person meldet sich mit ihrem normalen Konto auf dieser lokalen Seite an und gibt den Code unten ein. Danach bestätigst du ihr Konto. Die Einladung funktioniert derzeit nur auf diesem Mac.',{class:'hint'}));
  }
  if(state.invitations.length){const list=el('details');list.append(el('summary',`${state.invitations.length} offene Einladungen`));for(const i of state.invitations){const row=el('div',undefined,{class:'classroomRow'});row.append(el('span',`${i.name} · ${i.role==='admin'?'Verwalter':'Lehrkraft'} · ${i.status==='claimed'?'Konto wartet auf Bestätigung':'Noch nicht angenommen'}`),button('Widerrufen',()=>action('revokeInvitation',{invitationId:i.id},'Einladung widerrufen.')));list.append(row);}inviteBox.append(list);}
 }
 function renderClaim(){
  const details=el('details',undefined,{class:'schoolPanel'});details.append(el('summary','Ich habe eine Schuleinladung'));
  const form=el('form',undefined,{'data-school-claim':''});field(form,'Einladungscode','secret','',{maxlength:'100',spellcheck:'false'});field(form,'Dein Name','displayName',port.getSession()?.displayName||'');submit(form,'Mit meinem Konto anfragen');
  form.addEventListener('submit',e=>{e.preventDefault();if(busy||!form.reportValidity())return;void action('claimInvitation',{secret:form.elements.secret.value.trim(),displayName:form.elements.displayName.value.trim()},'Konto zur Bestätigung eingereicht. Es wurden noch keine Schulrechte freigeschaltet.');});details.append(form);host.append(details);
 }
 return {setAccount(next){if(next===uid)return;uid=next;epoch++;state=null;preview=null;issued=null;pendingAction=null;busy=false;error='';notice='';render();if(uid)queueMicrotask(load);},reload:load,destroy(){closed=true;epoch++;state=null;issued=null;host.replaceChildren();}};
}
