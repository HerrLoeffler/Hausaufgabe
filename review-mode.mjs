import {createReviewStorage} from './review-store.mjs';
const labels={open:'Offen',working:'In Arbeit',review:'Zum Prüfen',done:'Erledigt',pending:'Wartet auf Freigabe',approved:'Freigegeben',rejected:'Abgelehnt',not_required:'Adminhinweis',passed:'Bestanden',failed:'Fehler',blocked:'Blockiert'};
export function installReviewMode({document,api,getContext,storage=createReviewStorage(),openScene,runChecks,local=false}) {
 const win=document.defaultView;let uid='',epoch=0,admin=false,catalog=[],root,toggle,marking=false,selected=null,highlight=null,notes=[],checks=[],syncing=false;
 let pendingWrites=Promise.resolve(),queueWrites=Promise.resolve();
 const updateQueue=(k,change)=>{const p=queueWrites.catch(()=>{}).then(async()=>storage.update?storage.update(k,change):storage.put(k,change(await storage.get(k))));queueWrites=p;return p;};const key=kind=>`staging:${uid}:${kind}`;
 const el=(tag,text,attrs={})=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;};
 const button=(text,fn,attrs={})=>{const b=el('button',text,{type:'button',...attrs});b.addEventListener('click',fn);return b;};
 function message(text,error=false){const n=root?.querySelector('[data-review-message]');if(n){n.textContent=text;n.classList.toggle('reviewError',error);}}
 function error(err){message(err?.message||'Aktion fehlgeschlagen. Bitte erneut versuchen.',true);}
 async function call(data){const e=epoch;const response=await api(data);if(e!==epoch)throw new Error('Konto wurde gewechselt.');return response;}
 function unmark(){marking=false;document.documentElement.classList.remove('reviewMarking');root?.querySelector('[data-review-mark]')?.setAttribute('aria-pressed','false');}
 function close(){unmark();highlight?.classList.remove('reviewSelected');root?.remove();root=null;toggle?.focus();document.documentElement.classList.remove('reviewPanelOpen');}
 function dispose(){portalObserver.disconnect();epoch++;close();toggle?.remove();toggle=null;uid='';document.removeEventListener('click',capture,true);document.removeEventListener('pointerdown',capture,true);document.removeEventListener('keydown',capture,true);win.removeEventListener('online',online);}
 async function setSession(session){epoch++;close();toggle?.remove();toggle=null;uid=session?.uid||'';selected=null;notes=[];checks=[];if(!uid)return;
  const e=epoch;try{const access=await call({action:'access'});if(e!==epoch)return;admin=access.admin;catalog=access.catalog?.checks||[];
   toggle=button('Seite überarbeiten',()=>void open(),{'data-review-toggle':'',class:'reviewToggle'});document.body.append(toggle);
  }catch{/* No access means no UI. Server remains authoritative. */}
 }
 function capture(event){
  if(!root)return;
  if(event.type==='keydown'&&event.key==='Escape'){close();event.preventDefault();event.stopImmediatePropagation();return;}
  if(!marking||root.contains(event.target)||toggle?.contains(event.target))return;
  if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
  event.preventDefault();event.stopImmediatePropagation();if(event.type==='pointerdown')return;
  const target=event.target.closest?.('[data-review-id],[id]');
  if(!target){message('Diese Stelle hat noch keine feste Kennung. Bitte den nächstgelegenen Bereich markieren.',true);return;}
  highlight?.classList.remove('reviewSelected');highlight=target;highlight.classList.add('reviewSelected');
  const question=target.closest('[data-qid],[data-id]');
  selected={...getContext(),target:target.dataset.reviewId||target.id,questionId:question?.dataset.qid||question?.dataset.id||''};
  root.querySelector('[data-review-target]').textContent=`Markiert: ${selected.target}`;unmark();root.querySelector('[data-review-text]').focus();void saveDraft();
 }
 function saveDraft(){if(!root)return Promise.resolve();const k=key('draft'),value={text:root.querySelector('[data-review-text]').value,selected};
  pendingWrites=pendingWrites.catch(()=>{}).then(()=>storage.put(k,value));return pendingWrites.then(()=>message('Lokal gespeichert')).catch(error);
 }
 async function submit(){const input=root?.querySelector('[data-review-text]');if(!input?.value.trim()){message('Bitte einen Hinweis schreiben.',true);return;}
  const context=selected||{...getContext(),target:getContext().view};if(!context.build){message('Die Version wird noch geladen. Bitte kurz warten.',true);return;}
  const payload={action:'create',clientRequestId:win.crypto.randomUUID(),...context,text:input.value.trim()};const e=epoch,k=key('outbox');
  try{await pendingWrites;await updateQueue(k,current=>[...(current||[]),payload]);if(e!==epoch)return;if(input.value.trim()===payload.text){input.value='';const draftKey=key('draft');pendingWrites=pendingWrites.catch(()=>{}).then(async()=>{const change=current=>current?.text?.trim()===payload.text?null:current;if(storage.update)return storage.update(draftKey,change);return storage.put(draftKey,change(await storage.get(draftKey)));});await pendingWrites;}message('Lokal gespeichert – wird übertragen');await sync();}catch(err){error(err);}
 }
 async function sync(){if(syncing||!uid)return;syncing=true;const e=epoch,k=key('outbox');
  try{let queue=await storage.get(k)||[];let sent;
   while((sent=queue.find(x=>!x._error))&&e===epoch){
    try{await call(sent);await updateQueue(k,current=>(current||[]).filter(x=>x.clientRequestId!==sent.clientRequestId));}
    catch(err){if(e!==epoch)throw err;const code=String(err.code||'').replace('functions/','');
     if(!['permission-denied','invalid-argument','already-exists','failed-precondition'].includes(code))throw err;
     await updateQueue(k,current=>(current||[]).map(x=>x.clientRequestId===sent.clientRequestId?{...x,_error:err.message}:x));
    }
    queue=await storage.get(k)||[];
   }
   if(e===epoch){message(queue.length?'Einige Hinweise sind nur lokal gespeichert. Bitte die Ausgangsliste prüfen.':local?'In der lokalen Prüfumgebung gespeichert':'Online gespeichert',queue.length>0);await refresh();}
  }catch(err){if(e===epoch)message(`Nur lokal gespeichert. ${err.message}`,true);}finally{syncing=false;if(e===epoch)await renderOutbox();}
 }
 async function renderOutbox(){const list=root?.querySelector('[data-review-outbox]');if(!list)return;const e=epoch,k=key('outbox');let queue;
  try{queue=await storage.get(k)||[];}catch{return;}if(e!==epoch||!list.isConnected)return;list.replaceChildren();
  for(const note of queue){const card=el('article',null,{class:'reviewCard'});card.append(el('strong','Nur lokal gespeichert'),el('p',note.text),el('small',note._error||'Übertragung ausstehend'));
   card.append(button('Erneut versuchen',async()=>{await updateQueue(k,current=>(current||[]).map(x=>x.clientRequestId===note.clientRequestId?Object.fromEntries(Object.entries(x).filter(([key])=>key!=='_error')):x));await sync();}));
   card.append(button('Lokalen Hinweis verwerfen',async()=>{await updateQueue(k,current=>(current||[]).filter(x=>x.clientRequestId!==note.clientRequestId));await renderOutbox();}));list.append(card);
  }
 }
 async function refresh(){try{const all=[],allChecks=[];let cursor='',checkCursor='',doneNotes=false,doneChecks=false;
  // Bounded pages, expose continuation rather than silently presenting a truncated total.
  for(let page=0;page<10;page++){
   const r=await call({action:'list',cursor,checkCursor});if(!doneNotes)all.push(...r.notes);if(!doneChecks)allChecks.push(...r.checks);
   cursor=r.nextCursor||'';checkCursor=r.nextCheckCursor||'';doneNotes ||= !cursor;doneChecks ||= !checkCursor;if(doneNotes&&doneChecks)break;
  }
  notes=all;checks=allChecks;renderNotes();renderChecks();if(!doneNotes||!doneChecks)message('Mehr als 1.000 Einträge: Bitte den authentifizierten Export verwenden.',true);
 }catch(err){error(err);}}
 function locate(n){const targets=[...document.querySelectorAll('[data-review-id],[id]')].filter(x=>(x.dataset.reviewId||x.id)===n.target&&!root?.contains(x));
  const same=getContext();if(same.view!==n.view||(n.quizId&&same.quizId!==n.quizId)||targets.length!==1){message('Stelle in dieser Version nicht gefunden. Öffne die passende Ansicht oder Prüfszene.',true);return;}
  highlight?.classList.remove('reviewSelected');highlight=targets[0];highlight.classList.add('reviewSelected');highlight.scrollIntoView?.({block:'center',behavior:'smooth'});
 }
 function renderNotes(){const list=root?.querySelector('[data-review-notes]');if(!list)return;list.replaceChildren();
  if(!notes.length)list.append(el('p','Noch keine Hinweise.'));
  notes.forEach((n,i)=>{const card=el('article',null,{class:'reviewCard'});card.append(el('strong',`${i+1} · ${labels[n.status]||n.status}`),el('small',`${labels[n.approval]||n.approval} · ${n.build}`),el('p',n.text));
   const actions=el('div',null,{class:'reviewActions'});actions.append(button('Stelle zeigen',()=>locate(n)));
   if(openScene&&n.scene)actions.append(button('An dieser Stelle prüfen',()=>openScene(n.scene)));
   const edit=el('textarea',null,{'aria-label':'Hinweis bearbeiten',maxlength:'3000'});edit.value=n.text;edit.hidden=true;
   actions.append(button('Text bearbeiten',()=>{edit.hidden=!edit.hidden;if(!edit.hidden)edit.focus();}));
   const save=button('Änderung speichern',async()=>{try{await call({action:'edit',id:n.id,revision:n.revision,text:edit.value});await refresh();}catch(err){error(err);}});save.hidden=true;edit.addEventListener('input',()=>{save.hidden=false;});
   card.append(actions,edit,save);
   if(admin){const controls=el('div',null,{class:'reviewActions'});
    if(n.authorRole!=='admin')for(const [title,approved] of [['Freigeben',true],['Ablehnen',false]])controls.append(button(title,async()=>{try{await call({action:'approve',id:n.id,revision:n.revision,approved});await refresh();}catch(err){error(err);}}));
    const select=el('select',null,{'aria-label':'Bearbeitungsstatus'});for(const status of ['open','working','review','done']){const option=el('option',labels[status],{value:status});option.selected=n.status===status;select.append(option);}
    const evidence=el('input',null,{placeholder:'Prüfnachweis / Vorschauversion','aria-label':'Prüfnachweis',maxlength:'1000'});
    controls.append(select,evidence,button('Status speichern',async()=>{try{await call({action:'transition',id:n.id,revision:n.revision,status:select.value,evidence:evidence.value});await refresh();}catch(err){error(err);}}));card.append(controls);
   }
   if(n.previewEvidence)card.append(el('small',`Vorschau: ${n.previewEvidence}`));if(n.acceptanceEvidence)card.append(el('small',`Geprüft: ${n.acceptanceEvidence}`));card.append(el('small',n.deployedBuild?`Auf Staging: ${n.deployedBuild}`:'Veröffentlichung noch nicht nachgewiesen'));list.append(card);
  });
 }
 function renderChecks(){const list=root?.querySelector('[data-review-checks]');if(!list)return;list.replaceChildren();const build=getContext().build;
  list.append(el('p','Gelb: offen · Rot: Fehler/blockiert · Grün: für diese Version geprüft. Geräteabnahmen bleiben manuell.'));
  catalog.forEach(c=>{const current=checks.filter(x=>x.checkId===c.id&&x.build===build).sort((a,b)=>b.updatedAt-a.updatedAt);const bad=current.find(x=>x.result!=='passed'),result=bad||current[0];
   const card=el('article',null,{class:'reviewCard'});card.append(el('strong',`${result?(result.result==='passed'?'🟢':'🔴'):'🟡'} ${c.title}`),el('small',`${c.id} · ${c.area}`),el('p',c.instruction));
   if(result)card.append(el('p',`${labels[result.result]} · ${result.evidence}`));
   if(openScene&&c.scene)card.append(button('Prüfstelle öffnen',()=>openScene(c.scene)));
   if(c.method==='automated'){
    if(runChecks){const run=button('Automatisch prüfen',async()=>{run.disabled=true;try{message('Automatische Prüfung läuft …');const r=await runChecks(c.id);message(`${r.result==='passed'?'Bestanden':'Fehler'} · ${r.summary}`);await refresh();}catch(err){error(err);}finally{run.disabled=false;}});card.append(run);}else card.append(el('small','Automatische Prüfung in der lokalen Vorschau starten.'));
   }else{const evidence=el('textarea',null,{'aria-label':`Ergebnis für ${c.title}`,placeholder:'Was hast du geprüft? Gerät/Browser und Beobachtung',maxlength:'1500'});const choices=el('div',null,{class:'reviewActions'});
    for(const value of ['passed','failed','blocked'])choices.append(button(labels[value],async()=>{try{await call({action:'check',checkId:c.id,build:getContext().build,result:value,evidence:evidence.value,method:'manual'});await refresh();}catch(err){error(err);}}));card.append(evidence,choices);
   }list.append(card);
  });
 }
 async function batch(){try{let cursor='',out=[];do{const r=await call({action:'batch',cursor});out.push(...r.notes);cursor=r.nextCursor;}while(cursor&&out.length<1000);
  const area=root.querySelector('[data-review-batch]');area.hidden=false;area.value=JSON.stringify({version:1,untrustedComments:true,notes:out,nextCursor:cursor||null},null,2);message('Freigegebener Arbeitsstapel bereit. Noch keine KI gestartet.');
 }catch(err){error(err);}}
 async function open(){if(root){close();return;}const e=epoch;root=el('aside',null,{'data-review-panel':'',class:'reviewPanel','aria-label':'Seite überarbeiten'});document.documentElement.classList.add('reviewPanelOpen');
  const header=el('header');header.append(el('h2','Seite überarbeiten'),button('Schließen',close,{'data-review-close':''}));
  const status=el('p','Hinweise sammeln. Gemeinsam prüfen.',{'data-review-message':'',role:'status','aria-live':'polite'});
  const modes=el('div',null,{class:'reviewActions'});modes.append(button('Seite bedienen',unmark),button('Stelle markieren',()=>{marking=!marking;document.documentElement.classList.toggle('reviewMarking',marking);root.querySelector('[data-review-mark]').setAttribute('aria-pressed',String(marking));},{'data-review-mark':'','aria-pressed':'false'}));
  const target=el('small',selected?`Markiert: ${selected.target}`:'Hinweis zur aktuellen Ansicht',{'data-review-target':''});
  const label=el('label','Dein Hinweis');const input=el('textarea',null,{'data-review-text':'',maxlength:'3000',placeholder:'Was soll hier anders werden?'});label.append(input);input.addEventListener('input',()=>void saveDraft());
  const send=button('Hinweis speichern',async()=>{send.disabled=true;try{await submit();}finally{send.disabled=false;}});
  const notesSection=el('details',null,{open:''});notesSection.append(el('summary','Hinweise'),el('div',null,{'data-review-notes':''}));
  const checkSection=el('details');checkSection.append(el('summary','Ampel · Prüfungen abarbeiten'),el('div',null,{'data-review-checks':''}));
  root.append(header,status,modes,target,label,send,el('div',null,{'data-review-outbox':''}),button('Aktualisieren / erneut übertragen',()=>void sync()),notesSection,checkSection);
  if(admin){const members=el('details');members.append(el('summary','Testkollegium freischalten'));const member=el('input',null,{placeholder:'Benutzer-ID der Lehrkraft','aria-label':'Benutzer-ID'});members.append(member);
   members.append(button('Lehrkräfte laden',async()=>{try{let cursor='',rows=[];do{const r=await call({action:'members',cursor});rows.push(...r.members);cursor=r.nextCursor;}while(cursor&&rows.length<1000);members.querySelector('[data-review-members]')?.remove();const select=el('select',null,{'data-review-members':'','aria-label':'Lehrkraft auswählen'});select.append(el('option','Lehrkraft auswählen',{value:''}));for(const row of rows)select.append(el('option',`${row.displayName||row.id} · ${row.enabled?'freigeschaltet':'nicht freigeschaltet'}`,{value:row.id}));select.addEventListener('change',()=>{member.value=select.value;});members.append(select);}catch(err){error(err);}}));
   for(const [title,enabled] of [['Berechtigen',true],['Berechtigung entziehen',false]])members.append(button(title,async()=>{try{await call({action:'grant',memberId:member.value.trim(),enabled});message(enabled?'Lehrkraft freigeschaltet':'Berechtigung entzogen');}catch(err){error(err);}}));
   const out=el('textarea',null,{'data-review-batch':'','aria-label':'Freigegebener Arbeitsstapel',readonly:''});out.hidden=true;root.append(members,button('Arbeitsstapel bereitstellen',()=>void batch()),out);
  }
  document.body.append(root);portal();root.querySelector('[data-review-close]').focus();
  try{const draft=await storage.get(key('draft'));if(e!==epoch||!root)return;if(draft){input.value=draft.text||'';selected=draft.selected||null;target.textContent=selected?`Markiert: ${selected.target}`:'Hinweis zur aktuellen Ansicht';}await sync();}catch(err){error(err);await refresh();}
 }
 function portal(){const host=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;for(const node of [toggle,root])if(node&&node.parentElement!==host)host.append(node);}
 const portalObserver=new win.MutationObserver(portal);portalObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
 function online(){if(root)void sync();}
 document.addEventListener('click',capture,true);document.addEventListener('pointerdown',capture,true);document.addEventListener('keydown',capture,true);win.addEventListener('online',online);
 return {setSession,dispose,open,refresh};
}
