import {companyAudit,areaStatus} from './company-status.mjs';
import {kindNames,environmentState,candidateState,areaFreshness,releaseBrief} from './release-model.mjs';
import {domains} from './portfolio.mjs';
const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const A=(p,...cs)=>(p.append(...cs.filter(Boolean)),p);
const B=(text,fn,cls='button secondary')=>{const b=E('button',text,cls);b.type='button';b.onclick=fn;return b;};
const L=(text,url)=>{const a=E('a',text);a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;};
const D=(label,...children)=>A(E('details'),E('summary',label),...children);
const stamp=s=>s?new Date(s).toLocaleString('de-DE'):'noch kein Beleg';
const name=id=>domains.find(x=>x.id===id)?.name||id;
const pair=(label,text)=>A(E('div',undefined,'audit-pair'),E('strong',label),E('p',text));
function auditCard(id,sources,compact=false){
 const a=areaStatus[id],f=areaFreshness(a,sources),box=E('article',undefined,'audit-card');
 A(box,E('p',a.status,'inspector-kicker'),!compact&&L(name(id),`#/arbeit/landkarte/${id}`),E('p',f.label,`audit-fresh ${f.kind}`),pair('Belegt',a.built),pair('Offen',a.gap),pair('Als Nächstes',a.next));
 const details=D('Verantwortung & Belege',E('p',a.owner),E('p',`Fachabgleich: ${stamp(a.checkedAt)}`,'tiny'));
 for(const r of a.chats)details.append(E('p',r.title,'tiny'));
 for(const url of a.links)details.append(A(E('p'),L(url.includes('/pull/')?'Änderung / Fachbericht':url.includes('/actions/')?'Prüf- und Uploadlauf':'Öffentlicher Versionsnachweis',url)));
 A(box,details,L('Seiten & Releases',`#/arbeit/releases/kandidaten/${id}`));return box;
}
export function mountAreaAudit(parent,client,id,collapsed=false){
 const box=E('section',undefined,'area-audit');parent.prepend(box);let last='';return client.subscribe(state=>{const signature=JSON.stringify(areaFreshness(areaStatus[id],state?.sources));if(signature===last)return;last=signature;const card=auditCard(id,state?.sources,true);box.replaceChildren(collapsed?D('Bereichsstand & nächste Schritte',card):card);});
}
export function mountCompanyStatus(parent,client,onDraft){
 A(parent,E('h1','Was ist fertig – was fehlt?'),E('p','Elf Bereiche. Jeweils ein belegter Stand, eine Lücke und der nächste Schritt.','page-intro'),L('Seiten & Veröffentlichungen ansehen','#/arbeit/releases'));
 const grid=E('div',undefined,'audit-grid'),limits=D('Umfang des Abgleichs',E('p',companyAudit.scope),E('p','32 Unterthemen mit neuem Fachstand aktualisiert. Bei den übrigen30 ist kein neuer belastbarer Einzelabschluss belegt.'));
 A(parent,grid,limits);let last='';return client.subscribe(state=>{const key=JSON.stringify(Object.values(areaStatus).map(a=>areaFreshness(a,state?.sources)));if(key===last)return;last=key;grid.replaceChildren();for(const id of Object.keys(areaStatus)){const card=auditCard(id,state?.sources);card.append(B('Aufgabe vorbereiten',()=>onDraft(id,{title:`Weiterarbeit: ${name(id)}`,body:`${areaStatus[id].built}\n\nOffen: ${areaStatus[id].gap}\nNächster Schritt: ${areaStatus[id].next}\nZuständig: ${areaStatus[id].owner}\nVor Ausführung aktuelle Fachquellen prüfen. Live unverändert.`})));grid.append(card);}});
}
export function mountReleases(parent,client,onDraft,{tab='umgebungen',area='all'}={}){
 let data,selected='',mode=tab==='kandidaten'?'candidates':'environments',filter=area,query='',last='',formKey='';
 const status=E('p',undefined,'tiny'),error=E('p',undefined,'error');error.setAttribute('role','status');
 const counts=E('div',undefined,'release-counts'),controls=E('div',undefined,'release-controls'),list=E('div',undefined,'release-list'),detail=E('section',undefined,'release-detail'),detailBody=E('div'),formHost=E('div'),unassigned=E('div');A(detail,detailBody,formHost);detail.tabIndex=-1;detail.setAttribute('aria-label','Gewählte Umgebung oder Arbeit');
 A(parent,E('h1','Seiten & Releases'),E('p','Wo liegt welche Arbeit? Was fehlt bis zur Veröffentlichung?','page-intro'),counts,controls,status,error,A(E('div',undefined,'release-layout'),list,detail),unassigned);
 const envTab=B('Umgebungen',()=>switchMode('environments')),candTab=B('Noch nicht abgeschlossen',()=>switchMode('candidates'));
 const select=E('select');select.setAttribute('aria-label','Bereich filtern');for(const [id,label] of [['all','Alle Bereiche'],...domains.map(x=>[x.id,x.name])]){const o=E('option',label);o.value=id;select.append(o);}select.value=filter;select.onchange=()=>{filter=select.value;selected='';render();};
 const search=E('input');search.type='search';search.placeholder='Seite oder Arbeit suchen';search.setAttribute('aria-label','Seiten und Kandidaten suchen');search.oninput=()=>{query=search.value.toLocaleLowerCase('de');selected='';render();};
 A(controls,envTab,candTab,select,search,B('Jetzt abgleichen',async()=>{try{await client.post('/api/releases/refresh',{});status.textContent='Öffentliche Versionsnachweise werden gelesen …';}catch(e){error.textContent=e.message;}}));
 function switchMode(value){mode=value;selected='';render();}
 function observations(){return {...data.observations,__environments:data.catalog.environments,__prs:client.state?.sources?.sources?.github?.data?.prs||[]};}
 function render(){
  if(!data)return;const cat=data.catalog,obs=observations();envTab.setAttribute('aria-pressed',String(mode==='environments'));candTab.setAttribute('aria-pressed',String(mode==='candidates'));
  counts.replaceChildren(...[[cat.environments.filter(e=>!['local','native'].includes(e.kind)).length,'bekannte Web-Umgebungen'],[cat.environments.filter(e=>e.kind==='local').length,'lokale Vorschauen'],[cat.environments.filter(e=>e.kind==='native').length,'App-Verteilwege'],[cat.candidates.length,'offene Kandidaten']].map(([n,label])=>A(E('div'),E('strong',String(n)),E('span',label))));
  const items=(mode==='environments'?cat.environments:cat.candidates).filter(x=>(filter==='all'||x.area===filter)&&JSON.stringify(x).toLocaleLowerCase('de').includes(query));
  if(!items.some(x=>x.id===selected))selected=items[0]?.id||'';
  list.replaceChildren();if(!items.length)list.append(E('p','Keine Treffer. Bereich oder Suche ändern.'));
  for(const x of items){const s=mode==='environments'?environmentState(x,obs[x.id]):candidateState(x,obs,data.reviews);const b=B('',()=>{selected=x.id;render();if(matchMedia('(max-width:1000px)').matches){detail.focus({preventScroll:true});detail.scrollIntoView({block:'start'});}},'release-row'+(x.id===selected?' selected':''));A(b,E('strong',x.name),E('span',mode==='environments'?kindNames[x.kind]:name(x.area),'tiny'),E('span',s.label,'release-state'));b.setAttribute('aria-pressed',String(x.id===selected));list.append(b);}
  detailBody.replaceChildren();const x=items.find(x=>x.id===selected);if(!x){formHost.replaceChildren();formKey='';return;}
  A(detailBody,E('h2',x.name));
  if(mode==='environments'){
   formHost.replaceChildren();formKey='';const o=obs[x.id],s=environmentState(x,o),m=o?.lastGood||x.baseline;
   A(detailBody,E('p',s.label,`audit-fresh ${s.kind}`),E('p',x.purpose));
   if(x.url)detailBody.append(L(x.url,x.url));
   if(m)A(detailBody,pair('Letzter Hostingbeleg',`${m.version||'Version unbekannt'} · ${m.commit?.slice(0,12)||'Quelle unbekannt'}`),E('p',`Gelesen: ${stamp(o?.lastSuccess||x.baseline?.checkedAt)}${!o?.lastGood?' · gespeicherter Ausgangsstand':''}`,'tiny'));
   if(o?.error)detailBody.append(E('p',o.error,'error'));
   if(x.expiresAt)detailBody.append(E('p',`Kanalfrist laut Beleg: ${stamp(x.expiresAt)}`,'tiny'));
   for(const [i,url] of x.aliases.entries()){const alias=obs[x.id+':alias:'+i];detailBody.append(D('Alias derselben Umgebung',L(url,url),E('p',alias?.lastGood&&o?.lastGood&&alias.lastGood.commit===o.lastGood.commit&&!alias.error?'Gleicher gelesener Hostingstand': 'Aliasstand gesondert prüfen')));}
   const matches=cat.candidates.filter(c=>c.testEnvironment===x.id||c.targetEnvironment===x.id);A(detailBody,E('h3',x.kind==='live'?'Vorgemerkt für dieses Ziel':'Hier zugeordnete Arbeit'));
   for(const c of matches)detailBody.append(B(c.name,()=>{mode='candidates';filter='all';select.value='all';query='';search.value='';selected=c.id;render();},'release-related'));
   if(!matches.length)detailBody.append(E('p','Noch kein konkreter Releasekandidat zugeordnet.','tiny'));
   A(detailBody,pair('Nächster Schritt',x.next),D('Nachweisgrenzen',...cat.limits.map(t=>E('p',t,'tiny'))));
  }else{
   const s=candidateState(x,obs,data.reviews),test=cat.environments.find(e=>e.id===x.testEnvironment);
   A(detailBody,E('p',s.label,'audit-fresh'),pair('Belegt',x.done),pair('Offen',x.gap),pair('Nächster Schritt',x.next),E('p',`Test: ${test?.name||'nicht zugeordnet'} → Ziel: ${cat.environments.find(e=>e.id===x.targetEnvironment)?.name||x.targetEnvironment}`,'tiny'));
   const stages=A(E('ol',undefined,'release-gates'),E('li',s.bound?'Quellversion zugeordnet':'Exakte Produktversion noch zuordnen'),E('li',s.automated?'Automatische Prüfung exakt belegt':'Automatische Prüfung laut Fachbericht · exakte CI prüfen'),E('li',s.deployed?'Hostingversion auf Testseite aktuell bestätigt':'Aktuellen Testdeploy / Komponenten abgleichen'),E('li',`${s.checks.filter(r=>r.result==='passed').length}/${s.checks.length} lokale Prüfnotizen bestanden`),E('li','Integration / Rückfallplan / ausdrückliche Livefreigabe offen'),E('li','Veröffentlichung und Nachkontrolle separat'));
   A(detailBody,D('Weg nach Live',stages,E('p','Prüfnotizen sind eigene Angaben. Sie ersetzen weder unabhängige Abnahme noch Livefreigabe.','tiny')),B('Abnahme vorbereiten',()=>onDraft(x.area,releaseBrief(x,s))));
   const evidence=D('Version, Verantwortung & Belege',E('p',`${x.owner} · ${x.id}`),E('p',`Produktquelle: ${x.sourceCommit}${s.bound?'':' · noch nicht eindeutig bestätigt'}`,'release-sha'),E('p',`Benötigt: ${x.components.join(', ')}`),E('p',x.releasePreparation));for(const e of x.evidence)evidence.append(A(E('p'),L(e.label,e.url)));A(evidence,A(E('p'),L('Bestehender Release-Katalog',cat.controls.catalog)),A(E('p'),L('Zentrales Abnahmeregister',cat.controls.acceptance)));detailBody.append(evidence);
   const history=data.reviews.filter(r=>r.candidate===x.id);if(history.length)detailBody.append(D(`Prüfjournal · ${history.length} Einträge`,...history.slice().reverse().map(r=>E('p',`${stamp(r.at)} · ${r.check}: ${{passed:'bestanden',failed:'fehlgeschlagen',pending:'offen'}[r.result]} · ${r.reviewer}\n${r.evidence}\n${r.sha.slice(0,12)} / ${r.environment}`,'journal-entry'))));
   if(formKey!==x.id+':'+x.sourceCommit){formKey=x.id+':'+x.sourceCommit;formHost.replaceChildren();if(s.bound)formHost.append(reviewForm(x));else formHost.append(E('p','Vor einer Prüfnotiz zuerst die exakte Produktversion zuordnen.','info-note'));}
  }
  const known=new Set(cat.candidates.map(c=>c.pr)),prs=(client.state?.sources?.sources?.github?.data?.prs||[]).filter(p=>!known.has(p.number));
  unassigned.replaceChildren(D(`Weitere offene PRs · ${prs.length} noch nicht dieser Releaseübersicht zugeordnet`,E('p','Darunter Konzepte, Dokumentation und andere Aufgaben. Erst Scope und Test-/Releasebedarf zuordnen; offene PRs sind keine fertigen Features.','tiny'),...prs.map(p=>A(E('p'),L(`#${p.number} ${p.title}`,p.url)))));
 }
 function reviewForm(c){
  const form=E('form',undefined,'release-review'),message=E('p');message.setAttribute('role','status');
  const field=(title,node)=>A(E('label'),E('span',title),node);
  const check=E('select'),result=E('select'),reviewer=E('input'),evidence=E('textarea');reviewer.required=true;reviewer.maxLength=100;evidence.required=true;evidence.minLength=10;evidence.maxLength=3000;evidence.rows=3;
  for(const r of c.checks){const o=E('option',r.label);o.value=r.id;check.append(o);}for(const [id,label] of [['pending','Offen'],['passed','Bestanden'],['failed','Fehlgeschlagen']]){const o=E('option',label);o.value=id;result.append(o);}
  const save=E('button','Prüfnotiz speichern','button secondary');save.type='submit';
  A(form,E('h3','Prüfung festhalten'),E('p',`Nur für ${c.sourceCommit.slice(0,12)} auf ${c.testEnvironment}. Lokal auf diesem Mac. Keine Livefreigabe.`,'tiny'),field('Prüfung',check),field('Ergebnis',result),field('Geprüft von',reviewer),field('Konkreter Fall und Beleg',evidence),save,message);
  const storageKey='gradecrew-review-draft:'+c.id+':'+c.sourceCommit;let pending=null,lastSaved=null;
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){check.value=saved.check;result.value=saved.result;reviewer.value=saved.reviewer;evidence.value=saved.evidence;pending=saved.pending||null;}}catch{message.textContent='Lokaler Entwurfsspeicher nicht lesbar. Vor Wechsel Text sichern.';}
  function persist(){localStorage.setItem(storageKey,JSON.stringify({check:check.value,result:result.value,reviewer:reviewer.value,evidence:evidence.value,pending}));}
  form.addEventListener('input',()=>{try{persist();}catch{message.textContent='Entwurf nicht gesichert. Text vor Wechsel kopieren.';}});
  form.onsubmit=async event=>{event.preventDefault();const payload={candidate:c.id,sha:c.sourceCommit,environment:c.testEnvironment,check:check.value,result:result.value,reviewer:reviewer.value,evidence:evidence.value};
   if(lastSaved===JSON.stringify(payload)){message.textContent='Diese Prüfnotiz ist bereits gespeichert.';return;}
   if(pending&&JSON.stringify(pending.payload)!==JSON.stringify(payload)){message.textContent='Vorherige Speicherung noch unklar. Unveränderte Notiz erneut speichern.';return;}
   if(!pending)pending={id:crypto.randomUUID(),payload};try{persist();}catch{message.textContent='Sichere Speicherkennung konnte nicht gesichert werden. Notiz wurde nicht gesendet.';return;}save.disabled=true;
   try{const r=await client.post('/api/release-review',{id:pending.id,...payload});if(!data.reviews.some(x=>x.id===r.id))data.reviews.push(r);pending=null;lastSaved=JSON.stringify(payload);try{localStorage.removeItem(storageKey);}catch{}message.textContent='Prüfnotiz gespeichert. Keine Veröffentlichung ausgelöst.';render();}catch(e){message.textContent=e.message;}finally{save.disabled=false;}
  };return form;
 }
 return client.subscribe((state,problem)=>{error.textContent=problem||'';if(!state?.releases){status.textContent='Releaseübersicht wird geladen …';return;}data=state.releases;status.textContent=data.refreshing?'Öffentliche Versionsnachweise werden gelesen …':'Automatischer Versionsabgleich alle 5 Minuten. Live bleibt unverändert.';const key=JSON.stringify([data,state.sources?.sources?.github?.data?.prs]);if(key!==last){last=key;render();}});
}
