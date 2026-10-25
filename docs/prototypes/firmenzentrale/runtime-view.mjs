import { baseline } from './baseline.mjs';
// Same-origin client. User drafts are never automatically submitted.
export class CentralClient {
 constructor(){this.state=null;this.error='';this.token=null;this.listeners=new Set();this.timer=null;}
 async post(path,data){
  if(!this.token){const r=await fetch('/api/session');if(!r.ok)throw Error('Lokaler Dienst nicht erreichbar');this.token=(await r.json()).token;}
  const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-Central-Token':this.token},body:JSON.stringify(data)});
  const result=await r.json();if(!r.ok){if(r.status===403)this.token=null;throw Error(result.error||'Auftrag konnte nicht verarbeitet werden');}return result;
 }
 async poll(){
  try{const r=await fetch('/api/state');if(!r.ok)throw Error();this.state=await r.json();this.error='';}
  catch{this.error='Lokaler Dienst nicht erreichbar. Letzter bekannter Stand bleibt sichtbar.';}
  this.listeners.forEach(fn=>fn(this.state,this.error));this.timer=setTimeout(()=>this.poll(),document.hidden?12000:3000);
 }
 subscribe(fn){this.listeners.add(fn);fn(this.state,this.error);return()=>this.listeners.delete(fn);}
}
export const statusName={queued:'Angenommen',starting:'Wird gestartet',running:'In Bearbeitung',waiting_user:'Rückfrage',completed:'Ergebnis vorhanden',failed:'Fehlgeschlagen',interrupted:'Unterbrochen',unknown:'Abgleich nötig',cancelled:'Abgebrochen'};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const date=value=>value?new Date(value).toLocaleString('de-DE'):'Noch nicht geprüft';
const btn=(text,fn)=>{const b=el('button',text,'button secondary');b.type='button';b.onclick=fn;return b;};
const message=(box,error)=>{box.textContent=error.message||String(error);box.className='error';};
export function mountTasks(parent,client){
 const wrap=el('section',undefined,'runtime-tasks'),intro=el('p','Aufträge werden auf diesem Mac gespeichert. Ergebnisse sind noch keine fachliche Abnahme.','info-note'),list=el('div'),error=el('p');wrap.append(el('h2','Aufträge & Ergebnisse'),intro,error,list);parent.insertBefore(wrap,parent.children[1]||null);
 const nodes=new Map();
 const off=client.subscribe((state,problem)=>{
  error.textContent=problem||(!state?.connected?state?.error||'Chatanschluss wird geprüft …':'');error.hidden=!error.textContent;
  for(const r of state?.requests||[]){
   let node=nodes.get(r.id);
   if(!node){
    node=el('article',undefined,'runtime-task panel');node.dataset.requestId=r.id;
    const title=el('h3'),status=el('p',undefined,'runtime-status'),meta=el('p',undefined,'tiny'),details=el('details'),summary=el('summary','Ergebnis & Verlauf'),body=el('p',undefined,'runtime-text'),result=el('div',undefined,'runtime-text'),problem=el('p',undefined,'error'),report=el('pre',undefined,'runtime-report'),question=el('div'),controls=el('div',undefined,'toolbar');
    details.append(summary,body,result,report,meta);node.append(title,status,problem,question,details,controls);node.parts={title,status,meta,body,result,problem,report,question,controls};nodes.set(r.id,node);list.append(node);
   }
   const p=node.parts;p.title.textContent=r.title;p.status.textContent=statusName[r.status]||r.status;p.body.textContent=r.body;p.result.textContent=r.result;p.problem.textContent=r.error||'';p.problem.hidden=!r.error;p.report.textContent=r.report?.text||'';p.report.hidden=!r.report;
   p.meta.textContent=`${date(r.updatedAt)} · Versuch ${r.attempts} · ${r.model||'Modell noch nicht gewählt'}\nAuftrag ${r.id}\nChat ${r.threadId||'noch nicht zugeordnet'}\nTurn ${r.turnId||'noch nicht angenommen'}${r.report?'\nBericht SHA256 '+r.report.sha256:''}`;
   if(r.question&&p.question.dataset.callId!==r.question.callId){
    p.question.replaceChildren();p.question.dataset.callId=r.question.callId;const label=el('label',r.question.text,'field'),input=el('textarea');input.maxLength=8000;label.append(input);const err=el('p');const send=btn('Antwort senden',async()=>{send.disabled=true;try{await client.post('/api/answer',{id:r.id,callId:r.question.callId,answer:input.value});err.textContent='Antwort übermittelt.';}catch(e){message(err,e);send.disabled=false;}});p.question.append(label,send,err);node.querySelector('details').open=true;
   }else if(!r.question){p.question.replaceChildren();delete p.question.dataset.callId;}
   if(p.controls.dataset.status!==r.status){p.controls.replaceChildren();p.controls.dataset.status=r.status;
    if(['queued','running','waiting_user'].includes(r.status))p.controls.append(btn('Auftrag stoppen',async()=>{try{await client.post('/api/cancel',{id:r.id});}catch(e){message(p.problem,e);}}));
    if(r.status==='unknown')p.controls.append(btn('Stand erneut abgleichen',async()=>{try{await client.post('/api/reconcile',{});}catch(e){message(p.problem,e);}}));
    if(r.status==='completed'&&r.report)p.controls.append(btn('Bericht herunterladen',()=>{const a=el('a');a.href=URL.createObjectURL(new Blob([r.report.text],{type:'text/markdown;charset=utf-8'}));a.download=`gradecrew-${r.id}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}));
   }
  }
  if(!state?.requests?.length)intro.textContent='Noch keine gestarteten Aufträge. Über „Neu erfassen“ eine Aufgabe eingeben und „Bearbeitung starten“ wählen.';
  else intro.textContent=`${state.requests.length} gespeicherte Aufträge · Ergebnisse sind noch keine fachliche Abnahme.`;
 });return off;
}
export function mountSources(parent,client){
 const wrap=el('section',undefined,'runtime-sources panel'),status=el('p'),rows=el('div'),error=el('p');wrap.append(el('h2','Aktueller Ausgangsstand'),status,btn('Quellen jetzt prüfen',async()=>{try{await client.post('/api/refresh',{});status.textContent='Quellen werden geprüft …';}catch(e){message(error,e);}}),error,rows);parent.insertBefore(wrap,parent.children[1]||null);
 const baselineDetails=el('details');baselineDetails.append(el('summary','Standpunkt null · 11 Bereiche · geprüft am 25.10.2026'),el('p','Zusammengeführter Ausgangspunkt aus erreichbaren Quellen und eigenen Prüfungen. Historische Produktmeldungen sind keine aktuelle Vollabnahme. Der ausführliche Analysebericht liegt im Eingang.','tiny'));
 for(const [title,stand,next] of baseline){const row=el('article',undefined,'aside-note');row.append(el('h3',title),el('p',stand),el('strong','Nächster Schritt'),el('p',next));baselineDetails.append(row);}wrap.append(baselineDetails);
 let last='';return client.subscribe((state,problem)=>{
  status.textContent=problem||`${state?.sources?.refreshing?'Quellen werden eingelesen …':'Automatische Prüfung alle 5 Minuten'} · ${state?.connected?'Codex verbunden':'Codex nicht verbunden'}`;
  const sources=state?.sources;if(!sources||JSON.stringify(sources)===last)return;last=JSON.stringify(sources);rows.replaceChildren();
  for(const [id,title] of [['codex','Codex-Projektchats'],['github','GitHub-Projektstand'],['cloud','ChatGPT-Cloudchats']]){
   const s=sources.sources[id],d=s?.data;const card=el('article',undefined,'aside-note');card.append(el('h3',title),el('p',`Letzter Erfolg: ${date(s?.lastSuccess)}`));
   if(s?.error)card.append(el('p',s.error,'error'));
   if(id==='codex'&&d){card.append(el('p',`${d.count} Chats · ${d.turns} Turns · ${d.complete} Verläufe technisch vollständig abgerufen`));const details=el('details');details.append(el('summary','Erfasste Chats und Lücken'));for(const t of d.chats||[])details.append(el('p',`${t.title} · ${t.turns} Turns · ${t.complete?'Abruf vollständig':t.error||'unvollständig'}`));card.append(details);}
   if(id==='github'&&d){
    card.append(el('p',`${d.count} offene PRs · ${d.registryCount||0} registrierte Baustellen · main ${d.commit?.slice(0,10)}`));
    const details=el('details');details.append(el('summary',`${d.workstreams?.length||0} Release-Arbeitsstände und nächste Schritte`));
    for(const w of d.workstreams||[]){const row=el('article',undefined,'aside-note');row.append(el('h4',w.title),el('p',`${w.stage} · ${w.owner}`),el('p',w.next));details.append(row);}card.append(details);
   }
   if(id==='cloud')card.append(el('p',d?`${d.readable} von ${d.count} Chats erreichbar · ${d.turns} gelieferte Turns · teils gekürzte Nachrichten. Abruf über Desktopconnector, nicht automatisch.`:'Historische Inventur vorhanden; neuer Abruf über Desktopconnector ausstehend.'));
   rows.append(card);
  }
  for(const text of sources.limits)rows.append(el('p',text,'tiny'));
 });
}

export function mountDomainSources(parent,client,domainId,classify){
 const block=el('details',undefined,'runtime-domain');block.append(el('summary','Neu geprüfte Quellen zu diesem Bereich'));const body=el('div');block.append(body);parent.append(block);let signature='';
 return client.subscribe(state=>{
  if(!state)return;const sources=state.sources?.sources||{},github=sources.github?.data,codex=sources.codex?.data;
  const streams=(github?.workstreams||[]).filter(x=>classify(`${x.id} ${x.title} ${x.branch}`)===domainId),chats=(codex?.chats||[]).filter(x=>classify(x.title)===domainId);
  const next=JSON.stringify([sources.github?.lastSuccess,sources.codex?.lastSuccess,streams,chats]);if(next===signature)return;signature=next;body.replaceChildren();
  body.append(el('p',`Quellenprüfung: ${date(sources.github?.lastSuccess)}. Fachlicher Registerstand: ${github?.observedAt||'unbekannt'}. Neue Prüfung bedeutet keine neue Abnahme.`,'tiny'));
  for(const w of streams){const row=el('article',undefined,'runtime-source-row');row.append(el('strong',w.title),el('p',`Registerstufe: ${w.stage} · ${w.owner}`),el('p',w.next));body.append(row);}
  for(const c of chats)body.append(el('p',`${c.title} · ${c.turns} Turns · ${c.complete?'Abruf vollständig':c.error||'Abruf unvollständig'}`,'tiny'));
  if(!streams.length&&!chats.length)body.append(el('p','Noch keine frisch zugeordnete Quelle. Die historische Akte bleibt maßgeblich gekennzeichnet.'));
 });
}
