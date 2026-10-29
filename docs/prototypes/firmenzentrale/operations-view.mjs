import {domains} from './portfolio.mjs';
import {areaStatus} from './company-status.mjs';
import {taskView,workFor,ownerLoad,date,plainSummary} from './operations-model.mjs';
import {el,add,link,button,field,details,textPair,act,chatLink} from './operations-ui.mjs';
import {renderWorkDetail,renderAnalysis} from './operations-detail.mjs';
import {renderIntake} from './intake-view.mjs';
const domainName=id=>domains.find(d=>d.id===id)?.name||id;
export function mountOperations(parent,client,{view='home',id='',topic=''}={}){
 const root=el('div',undefined,'operations');parent.append(root);let signature='',alive=true;const savedKey='gradecrew-work-fields-v1';let saved={};let storageError='';try{saved=JSON.parse(localStorage.getItem(savedKey)||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))throw Error();}catch{storageError='Vorhandene Arbeitsentwürfe sind nicht lesbar und wurden nicht überschrieben.';}root.addEventListener('input',e=>{const key=e.target.dataset?.keep;if(!key||key.startsWith('gradecrew-analysis-draft:')||storageError)return;saved[key]=e.target.value;try{localStorage.setItem(savedKey,JSON.stringify(saved));}catch{storageError='Arbeitsentwurf konnte nicht gespeichert werden. Text vor dem Schließen kopieren.';}});const abort=new AbortController();
 const off=client.subscribe((state,problem)=>{
  const ops=state?.operations;if(!ops){root.replaceChildren(el('h1',view==='home'?'Deine Zentrale':'Arbeitsstand'),el('p',problem||'Auftragszuordnungen werden geladen …','ops-muted'));return;}
  const token=JSON.stringify([ops.items.map(t=>[t.id,t.revision,t.acknowledgement?.itemId,t.observation?.lastMessage?.id,t.observation?.error,t.observation?.activity,taskView(t).stale]),ops.owners.map(o=>[o.id,o.title,o.lastMessage?.id,o.error,o.activity]),ops.host,state.requests?.map(r=>[r.id,r.updatedAt]),state.intake,problem]);if(token===signature)return;signature=token;
  const drafts=[...Object.entries(saved).filter(([k])=>!k.startsWith('gradecrew-analysis-draft:')),...[...root.querySelectorAll('textarea,input,select')].filter(x=>x.dataset.keep&&!x.dataset.keep.startsWith('gradecrew-analysis-draft:')).map(x=>[x.dataset.keep,x.value])];const focus=root.contains(document.activeElement)?document.activeElement?.dataset.keep:null;
  root.replaceChildren();
  if(view==='task')renderWorkDetail(root,client,ops,id,{alive:()=>alive,signal:abort.signal});
  else if(view==='owners')renderOwners(root,ops,client);
  else if(view==='domain')renderDomain(root,ops,client,id,topic);
  else if(view==='domains')renderDomains(root,ops);
  else if(view==='all')renderAll(root,ops);
  else renderHome(root,ops,client,state.intake);document.title=(root.querySelector('h1')?.textContent||'Firmenzentrale')+' · GradeCrew';
  if(problem)root.prepend(el('p',problem,'error'));if(storageError)root.prepend(el('p',storageError,'error'));
  for(const [key,value] of drafts){const input=[...root.querySelectorAll('[data-keep]')].find(x=>x.dataset.keep===key);if(input){input.value=value;if(key===focus)input.focus({preventScroll:true});}}
 });return()=>{alive=false;abort.abort();off();};
}
function heading(root,title,desc,action){const h=el('header',undefined,'ops-heading');add(h,add(el('div'),el('h1',title),el('p',desc,'ops-muted')),action);root.append(h);}
function workRow(task){
 const v=taskView(task),owner=task.observation||{},a=link('',`#/arbeit/auftrag/${task.id}`,'ops-work-row');
 add(a,el('span',String(task.priority),'ops-priority'),add(el('div',undefined,'ops-work-main'),el('span',domainName(task.domainId),'ops-domain-label'),el('h3',task.title),el('p',plainSummary(task.next,145),'ops-next'),owner.lastMessage&&el('p','Zuletzt gemeldet: '+plainSummary(owner.lastMessage.text,135),'ops-last-note'),el('small',owner.title||'Chat noch nicht gelesen','ops-muted')),add(el('div',undefined,'ops-work-side'),el('span',v.state,'ops-status'),el('small',owner.lastMessage?'Meldung gelesen '+date(owner.readAt):'Aufnahme noch prüfen','ops-muted')));return a;
}
function renderHome(root,ops,client,intake){
 heading(root,'Deine Zentrale','Was jetzt ansteht. Wer sich kümmert. Was du entscheiden kannst.',button('Stand prüfen',()=>client.post('/api/work-items/refresh',{}),'button secondary'));
 renderIntake(root,client,intake);
 const layout=el('div',undefined,'ops-home-layout'),main=el('section'),aside=el('aside',undefined,'ops-human');
 add(main,el('h2','Als Nächstes'),el('p','Öffnen für Verlauf und nächste Handlung.','ops-muted'));
 const items=workFor(ops.items);items.slice(0,3).forEach(t=>main.append(workRow(t)));main.append(link('Alle Aufträge ansehen','#/arbeit/auftraege','ops-text-link'));
 add(aside,el('h2','Von dir benötigt'));const needs=items.filter(t=>taskView(t).needsHuman);
 if(!needs.length)aside.append(el('p','Keine konkrete Entscheidungsfrage erfasst. Allgemeine offene Abnahmen bleiben in den Aufträgen sichtbar.','ops-muted'));
 for(const t of needs){const question=t.decision?.question||'Offene Rückfrage im Auftrag prüfen.';add(aside,add(el('article',undefined,'ops-decision-card'),el('span',domainName(t.domainId),'ops-domain-label'),el('h3',question),el('p',t.decision?.why||t.gap,'ops-muted'),link('Frage öffnen',`#/arbeit/auftrag/${t.id}`,'button primary')));}
 add(layout,main,aside);root.append(layout);
 const assigned=el('section',undefined,'ops-assigned-strip');add(assigned,el('h2','Wer kümmert sich worum?'));
 for(const t of items){const owner=ops.owners.find(o=>o.id===t.ownerId),v=taskView(t);add(assigned,add(el('div',undefined,'ops-assigned-line'),link(t.title,`#/arbeit/auftrag/${t.id}`,'ops-inline-link'),el('span',owner?.title||'Zuordnung fehlt'),el('span',v.state,'ops-muted')));}root.append(assigned);
 root.append(details('Bereiche und Zusammenhänge',domainGrid(ops),link('Abhängigkeiten im Netz ansehen','#/arbeit/landkarte','ops-text-link')));
 root.append(el('p','Zuordnung ist belegt; laufende Desktoparbeit und fachlicher Abschluss werden gesondert ausgewiesen.','ops-footnote'));
}
function domainGrid(ops){const list=el('div',undefined,'ops-domain-grid');for(const d of domains){const works=workFor(ops.items,d.id);add(list,add(link('',`#/arbeit/bereich/${d.id}`,'ops-domain-card'),el('h3',d.name),el('p',works.length?`${works.length} zugeordnete ${works.length===1?'Arbeit':'Arbeiten'}`:'Noch kein neuer Auftrag zugeordnet.','ops-muted'),el('small',areaStatus[d.id].status)));}return list;}
function renderDomains(root,ops){heading(root,'Bereiche','Wähle einen Bereich. Bestand, offene Arbeit und Verlauf bleiben zusammen.');root.append(domainGrid(ops));root.append(link('Zusammenhänge im Netz','#/arbeit/landkarte','ops-text-link'));}
function renderAll(root,ops){heading(root,'Aufträge','Jeder Auftrag hat einen Bereich, einen zuständigen Chat und einen nächsten Schritt.');workFor(ops.items).forEach(t=>root.append(workRow(t)));}
function renderOwners(root,ops,client){
 heading(root,'Chats & Zuständigkeiten','Zuordnungen und letzter belegter Stand. Keine Auslastung aus einem fehlenden Ergebnis erraten.');
 const list=el('div',undefined,'ops-owner-list');for(const owner of ops.owners){const load=ownerLoad(ops.items,owner.id),row=el('article',undefined,'ops-owner-row');add(row,add(el('div'),el('h2',owner.title),el('p',owner.role==='coordinator'?'Koordination':'Ausführender Fachchat','ops-status'),el('p',owner.scope,'ops-muted')),add(el('div'),el('strong',`${load.assigned} zugeordnet`),el('p',load.overloaded?'Mehrere Themen: Reihenfolge prüfen.':owner.readAt?'Zuletzt gelesen '+date(owner.readAt):'Weitere Aufträge und Aktivität nicht bestätigt','ops-muted'),chatLink(owner)));const jobs=workFor(ops.items).filter(t=>t.ownerId===owner.id);jobs.forEach(t=>row.append(link(t.title,`#/arbeit/auftrag/${t.id}`,'ops-text-link')));list.append(row);}root.append(list);
 const error=el('p',undefined,'error');root.append(details('Verbindung zum laufenden Desktop',el('p',ops.host.connected?'Gemeinsamer Steueranschluss erreichbar. Ein Versand prüft zusätzlich den einzelnen Chat.':ops.host.error,'ops-muted'),button('Verbindung erneut prüfen',()=>act(client,'/api/desktop-host/reconnect',{},error)),error));
}
function renderDomain(root,ops,client,id,topic){
 const d=domains.find(d=>d.id===id);if(!d){heading(root,'Bereich nicht gefunden','Bitte einen der bekannten Bereiche wählen.');root.append(link('Bereiche öffnen','#/arbeit/bereiche'));return;}
 const status=areaStatus[id];heading(root,d.name,d.goal,link('Bereiche','#/arbeit/bereiche'));
 root.append(el('p','Fachlicher Ausgangsstand: 25.10.2026. Neuere konkrete Chatmeldungen stehen bei den Aufträgen.','ops-footnote'));const facts=el('section',undefined,'ops-domain-facts');add(facts,textPair('Belegter Bestand',status.built),textPair('Noch offen',status.gap),textPair('Nächster Schritt',status.next));root.append(facts);
 const jobs=workFor(ops.items,id,topic);root.append(el('h2','Zugeordnete Arbeit'));jobs.forEach(t=>root.append(workRow(t)));if(!jobs.length)root.append(el('p','Für diesen Bereich ist noch kein konkreter neuer Auftrag zugeordnet. Historische Arbeit bleibt unten erreichbar.','ops-muted'));
 root.append(details('Neuen Fachauftrag zuordnen',assignmentForm(client,ops,id,topic||'all')));
 const analysis=el('section',undefined,'ops-area-analysis');root.append(analysis);renderAnalysis(analysis,client,{domainId:id,topicId:topic||'all',title:d.name,area:d.area},null);
 root.append(details('Unterthemen, Quellen und technische Nachweise',link('Unterthemen öffnen',`#/arbeit/landkarte/${id}`),link('Detailakte öffnen',`#/arbeit/akte/${id}`),link('Seiten & Releases',`#/arbeit/releases/kandidaten/${id}`),el('p','Der fachliche Bereichsstand ist redaktionell datiert. Neue Chatmeldungen sind bei den konkreten Aufträgen sichtbar.','ops-muted')));
}
function assignmentForm(client,ops,domainId,topicId){
 const form=el('form',undefined,'ops-assignment-form'),title=field('Worum geht es?','title','','input'),scope=field('Genauer Auftrag','scope'),next=field('Nächster konkreter Schritt','next'),select=el('select'),label=el('label','Zuständiger Fachchat','ops-field'),error=el('p',undefined,'error');
 ops.owners.filter(o=>o.role==='implementer'&&o.domains.includes(domainId)).forEach(o=>{const option=el('option',o.title);option.value=o.id;select.append(option);});select.setAttribute('aria-label','Zuständiger Fachchat');label.append(select);
 for(const f of [title,scope,next]){f.input.required=true;f.input.dataset.keep='new-'+domainId+'-'+f.input.name;}
 const save=el('button','Auftrag zuordnen','button primary');save.type='submit';add(form,title.label,scope.label,next.label,label,el('p','Die Zuordnung wird gespeichert. Ein Chatstart benötigt anschließend eine gesonderte, erreichbare Verbindung.','ops-muted'),error,save);
 if(!select.options.length){save.disabled=true;error.textContent='Für diesen Bereich ist noch kein ausführender Fachchat zugeordnet. Die Analysefrage unten bleibt nutzbar.';}const requestId=crypto.randomUUID();form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{const r=await client.post('/api/work-items',{id:requestId,domainId,topicId,ownerId:select.value,title:title.input.value,scope:scope.input.value,next:next.input.value});await client.refresh();location.hash=`/arbeit/auftrag/${r.id}`;}catch(x){error.textContent=x.message;save.disabled=false;}};return form;
}
