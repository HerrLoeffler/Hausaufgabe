const ages=(iso,now)=>iso?now-Date.parse(iso):Infinity;
export function taskView(task,now=Date.now()){
 const obs=task.observation||{},stale=Boolean(obs.error)||!Number.isFinite(ages(obs.checkedAt||obs.readAt,now))||ages(obs.checkedAt||obs.readAt,now)>10*60*1000;
 const names={assigned:'Zugeordnet',prepared:'Übergabe vorbereitet',sending:'Wird übermittelt',sent:'Im Fachchat angekommen',unknown:'Übermittlung prüfen',settled:'Antwort eingegangen'};
 let state=names[task.delivery]||'Stand prüfen';if(task.delivery==='assigned'&&task.acknowledgement)state='Übernahme gemeldet';
 const assessed={accepted:'Übernahme bestätigt',blocked:'Blocker gemeldet',waiting_human:'Rückfrage offen',candidate:'Kandidat gemeldet',checkpoint:'Fortschritt festgehalten'};
 if(task.assessment?.state&&task.delivery!=='unknown')state=assessed[task.assessment.state]||state;
 const needsReview=Boolean(task.assessment?.sourceItemId&&obs.lastMessage?.id&&task.assessment.sourceItemId!==obs.lastMessage.id);if(needsReview&&task.delivery!=='unknown')state='Neue Meldung prüfen';
 const activity=stale?'Stand erneut prüfen':obs.live&&obs.activity==='active'?'Chatlauf aktiv':obs.live&&obs.activity==='idle'?'Chat wartet':'Aktivität unbestätigt';
 return {state,activity,stale,needsReview,complete:false,release:task.release?.label||'Veröffentlichung nicht bestätigt',lastMessage:obs.lastMessage?.text||'Noch keine zugeordnete Fachmeldung gelesen.',canSend:!['sending','sent','unknown'].includes(task.delivery),needsHuman:task.decision?.state==='open'||task.assessment?.state==='waiting_human'};
}
export function workFor(items,domainId,topicId){return (items||[]).filter(t=>!t.archived&&(!domainId||t.domainId===domainId)&&(!topicId||t.topicId===topicId)).sort((a,b)=>a.priority-b.priority);}
export function scopedRequests(requests,domainId,topicId){return (requests||[]).filter(r=>r.domainId===domainId&&r.topicId===(topicId||'all'));}
export function ownerLoad(items,ownerId,now=Date.now()){
 const bound=(items||[]).filter(t=>t.ownerId===ownerId&&!t.archived);return {assigned:bound.length,active:bound.filter(t=>taskView(t,now).activity==='Chatlauf aktiv').length,overloaded:bound.length>1||bound.some(t=>(t.scopeItems||[]).length>1)};
}
export const date=value=>value?new Date(typeof value==='number'&&value<1e12?value*1000:value).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'Zeitpunkt nicht belegt';

export function plainSummary(text,limit=180){const value=String(text||'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\*\*|`/g,'').replace(/^#+\s/gm,'').replace(/\s+/g,' ').trim();return value.slice(0,limit)+(value.length>limit?' …':'');}
export function evidenceLinks(text){const urls=[...String(text||'').matchAll(/https:\/\/github\.com\/HerrLoeffler\/Hausaufgabe\/(?:pull\/\d+|actions\/runs\/\d+|commit\/[a-f0-9]{7,40})/g)].map(x=>x[0]);return [...new Set(urls)].slice(0,6);}
