import {domains} from './portfolio.mjs';
import {statusName} from './runtime-view.mjs';
import {taskView,scopedRequests,date,plainSummary,evidenceLinks} from './operations-model.mjs';
import {el,add,link,button,field,details,textPair,act,chatLink} from './operations-ui.mjs';
export function renderWorkDetail(root,client,ops,id,life){
 const task=ops.items.find(x=>x.id===id);if(!task){add(root,el('h1','Auftrag nicht gefunden'),link('Alle Aufträge','#/arbeit/auftraege'));return;}
 const owner=ops.owners.find(x=>x.id===task.ownerId),v=taskView(task),d=domains.find(x=>x.id===task.domainId);
 add(root,link('Alle Aufträge','#/arbeit/auftraege','ops-text-link'),add(el('header',undefined,'ops-heading'),add(el('div'),link(d?.name||task.domainId,`#/arbeit/bereich/${task.domainId}`,'ops-domain-label'),el('h1',task.title),el('p',v.state,'ops-status')),chatLink(owner)));
 const facts=el('section',undefined,'ops-work-facts');add(facts,textPair('Zuständig',owner.title),textPair('Nächster Schritt',task.next),textPair('Noch offen',task.gap));root.append(facts);
 let questionPanel=null;
 if(v.needsReview)root.append(el('p','Seit dem festgehaltenen Stand liegt eine neue Meldung vor. Nächsten Schritt und offene Punkte damit abgleichen.','ops-connection-note'));
 const stateLine=el('div',undefined,'ops-evidence-line');add(stateLine,el('span',task.acknowledgement?'Übernahme mit Meldung belegt':'Aufnahme noch nicht bestätigt'),el('span',v.activity),el('span',v.release));root.append(stateLine);
 if(task.decision){const q=el('section',undefined,'ops-question');add(q,el('h2',task.decision.question),el('p',task.decision.why,'ops-muted'));if(task.decision.state==='answered')add(q,el('strong','Deine Antwort'),el('p',task.decision.answer));else{const answer=field('Deine Antwort','answer');answer.input.dataset.keep='decision-'+id;const err=el('p',undefined,'error');add(q,answer.label,button('Antwort festhalten',()=>act(client,'/api/work-items/decision',{id,revision:task.revision,answer:answer.input.value},err),'button primary'),err,el('small','Wird in dieser Auftragsakte festgehalten. Eine Nachricht an den Fachchat wird gesondert übermittelt.','ops-muted'));}questionPanel=q;}
 const body=el('div',undefined,'ops-task-layout'),conversation=el('section'),aside=el('aside');
 add(conversation,el('h2','Verlauf im Fachchat'),el('p',owner.title,'ops-muted'));const stream=el('div',undefined,'ops-chat-stream');conversation.append(stream);
 if(questionPanel)aside.append(questionPanel);add(aside,el('h2','Auftragsakte'),textPair('Beauftragt',task.source?.at||date(task.createdAt)),textPair('Ziel',task.acceptance||task.scope),textPair('Zuletzt festgehaltener Fortschritt',task.progressEvidence?.text?plainSummary(task.progressEvidence.text,260):'Noch kein Schritt ausdrücklich als Fortschritt bestätigt.'),el('p',task.lastProgressAt?date(task.lastProgressAt):'Neue Meldungen werden separat angezeigt.','ops-muted'));
 const next=field('Nächsten Schritt ändern','next',task.next),err=el('p',undefined,'error');next.input.dataset.keep='next-'+id;
 aside.append(details('Nächsten Schritt bearbeiten',next.label,button('Änderung speichern',()=>act(client,'/api/work-items/change',{id,revision:task.revision,next:next.input.value},err)),err));
 const changeOwner=ownerForm(client,ops,task);aside.append(details('Zuständigkeit übergeben',changeOwner));add(body,conversation,aside);root.append(body);
 renderDispatch(conversation,client,ops,task,owner,v);
 const analysis=el('section',undefined,'ops-area-analysis');root.append(analysis);renderAnalysis(analysis,client,{domainId:task.domainId,topicId:task.topicId,title:task.title,area:d?.area||'tech'},task.id);
 root.append(details('Verbrauch und Modellangaben',el('p','Der Verbrauch der Fachchats ist hier nicht als Abrechnung belegt. Zuordnen, Quellen lesen und Status berechnen lösen keinen neuen Modellauftrag aus. Analyseaufträge verwenden das im Auftrag angegebene Modell; tatsächliche Laufangaben bleiben beim jeweiligen Ergebnis. Es werden keine Token- oder Kosteneinsparungen geschätzt.','ops-muted')));
 const technical=el('div');if(task.progressEvidence)technical.append(details('Vollständiger bestätigter Fortschrittsbeleg',el('p',task.progressEvidence.text,'ops-chat-text')));if(task.scopeItems?.length){const list=el('ul');task.scopeItems.forEach(x=>list.append(el('li',x)));technical.append(el('h3','Weitere Themen im selben Auftrag – Reihenfolge prüfen'),list);}for(const h of task.handoffHistory||[])technical.append(add(el('article',undefined,'ops-pair'),el('h3',h.at),el('p',h.label),el('small',h.source,'ops-muted'),chatLink({conversationId:h.conversationId})));technical.append(textPair('Originaltask',task.externalTaskId||'Originaltask noch mit der Übergabe abgleichen.'),textPair('Arbeitsumfang',task.scope),textPair('Umgebung',task.environment||'Nicht ausgewählt'),textPair('Quelle',task.source?.label||'Zuordnung in der Zentrale'),textPair('Übermittlung',task.delivery));root.append(details('Quellen, Übergabe und Nachweise',technical));
 fetch('/api/work-items/'+encodeURIComponent(id),{signal:life.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(detail=>{
  if(!life.alive()||!stream.isConnected)return;stream.replaceChildren();const obs=detail.observation||{};
  const messages=(obs.messages||[]).filter(m=>m.role==='assistant');if(!messages.length)stream.append(el('p','Noch keine zugeordnete Antwort gelesen. Die Zuordnung allein ist kein Arbeitsbeginn.','ops-muted'));
  const older=details('Frühere Meldungen · Auszug');
  for(const [index,m] of messages.slice(-6).entries()){
   const newest=index===messages.slice(-6).length-1,row=el('article',undefined,'ops-chat-message');
   add(row,el('span',m.phase==='final_answer'?'Abschlussmeldung des Fachchats':'Meldung des Fachchats','ops-domain-label'),el('p',newest?plainSummary(m.text,650):m.text,'ops-chat-text'));
   if(newest&&m.text.length>650)row.append(details('Vollständige Meldung',el('p',m.text,'ops-chat-text')));
   if(newest){
    const error=el('p',undefined,'error'),stateSelect=el('select'),stateLabel=el('label','Welche Aussage ist durch diese Meldung belegt?','ops-field');
    for(const [value,name] of [['checkpoint','Neuer Arbeitsschritt'],['blocked','Blocker gemeldet'],['candidate','Kandidat gemeldet'],['waiting_human','Rückfrage offen']]){const option=el('option',name);option.value=value;stateSelect.append(option);}stateSelect.setAttribute('aria-label','Welche Aussage ist durch diese Meldung belegt?');stateSelect.name='assessment';stateSelect.dataset.keep='assessment-'+id;stateLabel.append(stateSelect);
    const nextStep=field('Nächster Schritt','progress-next',task.next),gap=field('Was fehlt noch?','progress-gap',task.gap);nextStep.input.dataset.keep='progress-next-'+id;gap.input.dataset.keep='progress-gap-'+id;
    add(row,el('p','Gelesen '+date(obs.readAt),'ops-muted'));
    for(const url of evidenceLinks(m.text))row.append(link(url.includes('/pull/')?'PR '+url.split('/').pop():'Originalnachweis',url,'ops-text-link'));
    row.append(details('Diesen Stand in der Akte festhalten',stateLabel,nextStep.label,gap.label,button('Belegten Stand speichern',()=>act(client,'/api/work-items/progress',{id,revision:task.revision,itemId:m.id,assessment:stateSelect.value,next:nextStep.input.value,gap:gap.input.value},error)),error,el('p','Die Meldung bleibt als Quelle gebunden. Ein gemeldeter Kandidat wird damit nicht als veröffentlicht oder am Gerät geprüft freigegeben.','ops-muted')));stream.append(row);
   }else older.append(row);
  }
  if(messages.length>1)stream.append(older);
  stream.append(details('Herkunft und Abdeckung',el('p',detail.error||obs.coverage||'Noch keine Fachmeldung abrufbar.','ops-footnote'),el('p',obs.readAt?'Gelesen '+date(obs.readAt):'Noch nicht gelesen.','ops-muted')));
  const timeline=el('ol',undefined,'ops-timeline');const names={assigned:'Auftrag zugeordnet',assignment_changed:'Zuordnung oder nächster Schritt geändert',human_decision:'Antwort von Martin festgehalten',progress_confirmed:'Fortschritt mit Quelle bestätigt',dispatch_intent:'Übermittlung begonnen',dispatch_receipt:'Startbeleg erhalten',dispatch_uncertain:'Übermittlung nicht sicher bestätigt'};
  for(const e of detail.events||[])timeline.append(el('li',date(e.at)+' · '+(names[e.kind]||e.kind)));aside.append(details('Zuordnung und Änderungen',timeline));
 }).catch(e=>{if(e.name!=='AbortError'&&stream.isConnected)stream.append(el('p','Der Verlauf konnte nicht geladen werden. Den Fachchat direkt öffnen oder den Stand erneut prüfen.','error'));});
}
function renderDispatch(parent,client,ops,task,owner,v){
 const box=el('section',undefined,'ops-dispatch');add(box,el('h3','Rückfrage an diesen Fachchat'));const message=field('Deine Nachricht','owner-message');message.input.dataset.keep='owner-message-'+task.id;const error=el('p',undefined,'error');box.append(message.label);
 const manual=button('Übergabe vorbereiten und kopieren',async()=>{
  manual.disabled=true;error.textContent='';
  try{
   const result=await client.post('/api/work-items/prepare',{id:task.id,revision:task.revision,message:message.input.value});
   try{await navigator.clipboard.writeText(result.text);error.className='ops-muted';error.textContent='Übergabe kopiert. Den Fachchat öffnen, dort einfügen und bewusst absenden. Erst die wiedergefundene Nachricht bestätigt die Zustellung.';}
   catch{const copy=field('Vorbereitete Übergabe zum Kopieren','prepared-envelope',result.text);copy.input.readOnly=true;box.append(copy.label);error.textContent='Das Briefing ist gespeichert. Bitte den angezeigten Text kopieren und im bestehenden Fachchat einfügen.';}
   await client.refresh();
  }catch(e){error.textContent=e.message;}finally{manual.disabled=false;}
 },'button primary');manual.disabled=!v.canSend||task.delivery==='prepared';
 add(box,manual,chatLink(owner),error);
 if(ops.host.connected){const send=button('Direkt an Fachchat senden',async()=>{send.disabled=true;await act(client,'/api/work-items/dispatch',{id:task.id,revision:task.revision,requestId:crypto.randomUUID(),message:message.input.value},error);send.disabled=!v.canSend;});send.disabled=!v.canSend||task.delivery==='prepared';box.append(send);}
 else box.append(el('p','Der direkte Desktopversand ist noch nicht verbunden. Die vorbereitete Übergabe wird erst nach dem Einfügen und Absenden im richtigen Fachchat als angekommen bestätigt.','ops-connection-note'));
 if(task.delivery==='prepared'){box.append(el('p','Die Übergabe ist gespeichert, aber ihre Zustellung ist noch nicht bestätigt. Im Fachchat einfügen und bewusst absenden.','ops-connection-note'));
  const copy=button('Vorbereitetes Briefing erneut anzeigen',async()=>{try{const r=await fetch('/api/work-items/'+task.id);const d=await r.json();const f=field('Gespeicherte Übergabe','prepared-copy',d.item.preparedEnvelope||'');f.input.readOnly=true;box.append(f.label);}catch{error.textContent='Gespeicherte Übergabe nicht erreichbar.';}});box.append(copy);
 }
 if(!v.canSend)box.append(el('p','Die frühere Übermittlung zuerst im zugeordneten Chat prüfen. Ein weiterer Start ist gesperrt.','ops-connection-note'));
 parent.append(box);
}
export function renderAnalysis(parent,client,scope,workItemId){
 add(parent,el('h2','Hier zum Thema nachfragen'),el('p','Eigener Analyseverlauf mit gebundenen Projektquellen. Aufträge an Fachchats bleiben oben gesondert zugeordnet.','ops-muted'));
 const list=el('div',undefined,'ops-analysis-stream'),requests=scopedRequests(client.state?.requests,scope.domainId,scope.topicId);
 for(const r of [...requests].reverse()){
  const row=el('article',undefined,'ops-analysis-message');add(row,el('strong','Du'),el('p',r.body,'ops-chat-text'),el('span',statusName[r.status]||r.status,'ops-status'));
  if(r.report?.text||r.result)add(row,el('strong','Analyse'),el('p',r.report?.text||r.result,'ops-chat-text'));
  if(r.question){const answer=field(r.question.text,'analysis-answer');answer.input.dataset.keep='answer-'+r.id;const error=el('p',undefined,'error');add(row,answer.label,button('Antwort senden',()=>act(client,'/api/answer',{id:r.id,callId:r.question.callId,answer:answer.input.value},error)),error);}
  if(r.error)row.append(el('p',r.error,'error'));list.append(row);
 }
 parent.append(list);const draftKey='gradecrew-analysis-draft:'+scope.domainId+'/'+scope.topicId;let draft='';try{draft=localStorage.getItem(draftKey)||'';}catch{}
 const message=field('Was möchtest du klären?','analysis-message',draft),error=el('p',undefined,'error');message.input.dataset.keep=draftKey;message.input.maxLength=12000;
 message.input.oninput=()=>{try{localStorage.setItem(draftKey,message.input.value);}catch{error.textContent='Entwurf konnte nicht gespeichert werden. Den Text vor dem Schließen kopieren.';}};
 const send=button('Analysefrage senden',async()=>{
  if(!message.input.value.trim()){error.textContent='Bitte eine Frage oder einen Auftrag eingeben.';return;}
  send.disabled=true;const pendingKey='gradecrew-analysis-pending:'+scope.domainId+'/'+scope.topicId;
  try{
   const payload={title:'Rückfrage: '+scope.title.slice(0,140),body:message.input.value,area:scope.area,domainId:scope.domainId,topicId:scope.topicId,conversationId:'analysis:'+scope.domainId+'/'+scope.topicId,...(workItemId?{workItemId}:{})};
   let pending=JSON.parse(localStorage.getItem(pendingKey)||'null');if(pending&&JSON.stringify(pending.payload)!==JSON.stringify(payload))throw Error('Eine vorige Übermittlung ist noch unklar. Bitte zuerst im Eingang prüfen; die Kennung bleibt erhalten.');
   if(!pending){pending={requestId:crypto.randomUUID(),payload};localStorage.setItem(pendingKey,JSON.stringify(pending));}
   await client.post('/api/tasks',{requestId:pending.requestId,...pending.payload});localStorage.removeItem(pendingKey);localStorage.removeItem(draftKey);message.input.value='';await client.refresh();
  }catch(e){error.textContent=e.message;}finally{send.disabled=!client.state?.connected;}
 },'button primary');send.disabled=!client.state?.connected;add(parent,message.label,send,error);if(!client.state?.connected)parent.append(el('p','Analyseanschluss derzeit nicht verbunden. Dein Entwurf bleibt erhalten.','ops-muted'));
}
function ownerForm(client,ops,task){
 const form=el('div'),label=el('label','Neuer Fachchat','ops-field'),select=el('select');for(const owner of ops.owners.filter(o=>o.role==='implementer'&&o.domains.includes(task.domainId))){const option=el('option',owner.title);option.value=owner.id;option.selected=owner.id===task.ownerId;select.append(option);}select.setAttribute('aria-label','Neuer Fachchat');select.dataset.keep='new-owner-'+task.id;label.append(select);form.append(label);
 const fields={};for(const [name,title] of [['commit','Gesicherter Commit'],['branch','Branch'],['handoff','Übergabe / Nachweis'],['files','Dateien und Schreibgrenzen'],['attempts','Bisherige Versuche und Budget'],['unfinished','Noch laufende Vorgänge'],['scope','Neuer genauer Umfang']]){const f=field(title,name,name==='scope'?task.scope:'',name==='scope'?'textarea':'input');f.input.dataset.keep='transfer-'+task.id+'-'+name;fields[name]=f.input;form.append(f.label);}
 const error=el('p',undefined,'error');add(form,el('p','Ändert die Zuordnung in dieser Akte. Ein laufender Chat wird dadurch nicht abgebrochen oder neu gestartet.','ops-muted'),button('Zuordnung mit Übergabe ändern',()=>{const values=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value]));const {scope,...checkpoint}=values;return act(client,'/api/work-items/change',{id:task.id,revision:task.revision,ownerId:select.value,scope,checkpoint},error);}),error);return form;
}
