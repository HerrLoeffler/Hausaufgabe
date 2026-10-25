// A projection of evidence, never an authorization or deployment command.
export const workKinds={product:'Produkt',native:'Native App',documentation:'Plan / Dokumentation',prototype:'Prototyp',tooling:'Arbeitswerkzeug',historical:'Historischer Rest',service:'Isolierter Dienst'};
export const requiredGates=['combined-ci','independent-review','test-components','subject-device','integration-rollback'];
export function matchesAssignment(group,entries,query=''){
 const q=query.trim().toLocaleLowerCase('de');if(!q)return true;
 if(/^#?\d+$/.test(q))return entries.some(p=>p.number===Number(q.replace('#','')));
 return [group.name,group.owner,group.task,group.done,group.next,...group.gaps||[],...entries.map(p=>`${p.title} ${p.branch} ${p.base}`)].join(' ').toLocaleLowerCase('de').includes(q);
}
const sha=s=>/^[a-f0-9]{40}$/.test(s||'');
const current=(s,now)=>Boolean(s&&!s.error&&Number.isFinite(Date.parse(s.lastSuccess))&&now-Date.parse(s.lastSuccess)>=0&&now-Date.parse(s.lastSuccess)<900000);
export function projectPRs(audit={},source,now=Date.now()){
 const recorded=audit.entries||[],known=new Map(recorded.map(e=>[e.number,e]));
 const fresh=current(source,now)&&Array.isArray(source?.data?.prs),hasList=Array.isArray(source?.data?.prs);
 // Preserve the last successfully observed open list on a failed refresh.
 const observed=hasList?source.data.prs:recorded;
 const entries=observed.map(p=>{const old=known.get(p.number);return old?{...old,currentHead:p.head,currentBase:p.base||old.base,changed:p.head!==old.head||Boolean(p.base&&p.base!==old.base),metadataChanged:Boolean(p.updatedAt&&old.updatedAt&&p.updatedAt>old.updatedAt)}:{...p,currentHead:p.head,group:null,kind:'unknown',changed:true};});
 const open=new Set(entries.map(p=>p.number));
 return {entries,fresh,source,audit,unassigned:entries.filter(p=>!p.group),closed:hasList?recorded.filter(p=>!open.has(p.number)):[],groups:(audit.groups||[]).filter(g=>entries.some(e=>e.group===g.id))};
}
export function groupReadiness(group,projection,now=Date.now()){
 const entries=projection.entries.filter(p=>p.group===group.id),product=['product','native'].includes(group.kind),a=group.approval;
 const changed=entries.some(p=>p.changed||p.metadataChanged),conflicts=entries.filter(p=>p.mergeable==='dirty'&&!p.changed);
 const failures=entries.filter(p=>!p.changed&&(p.checks||[]).some(c=>c.head===p.currentHead&&c.status==='completed'&&!['success','neutral','skipped'].includes(c.conclusion)));
 const missing=[...(group.gaps||[])];
 if(changed)missing.unshift('PR-Quelle, Ziel oder Metadaten haben sich seit dem Fachabgleich geändert; neuen Stand prüfen.');
 if(conflicts.length)missing.unshift(`Zusammenführungskonflikt bei ${conflicts.map(p=>'PR'+p.number).join(', ')} klären.`);
 if(failures.length)missing.unshift(`Fehlgeschlagene Headprüfung bei ${failures.map(p=>'PR'+p.number).join(', ')} klären.`);
 const dependencies=entries.flatMap(p=>p.dependencies||[]),headsBound=Boolean(a?.heads&&entries.length&&entries.every(p=>a.heads[p.number]===p.currentHead)&&dependencies.every(n=>a.heads[n]&&projection.entries.some(p=>p.number===n&&p.currentHead===a.heads[n])));
 const targetBound=Boolean(a&&sha(a.source)&&sha(a.target)&&projection.source?.data?.branchHeads?.[a.base]===a.target);
 const bounded=Boolean(a&&Date.parse(a.checkedAt)<=now&&Date.parse(a.expiresAt)>now&&Date.parse(a.expiresAt)-Date.parse(a.checkedAt)<=7*86400000);
 const gates=Boolean(a&&requiredGates.every(id=>a.gates?.filter(g=>g.id===id).length===1&&a.gates.some(g=>g.id===id&&g.result==='passed'&&g.source===a.source&&g.target===a.target&&/^https:\/\//.test(g.evidence||''))));
 const ready=Boolean(product&&projection.fresh&&!changed&&!missing.length&&headsBound&&targetBound&&bounded&&gates);
 return {ready,live:false,product,changed,missing,entries,kind:!projection.fresh?'stale':changed?'changed':conflicts.length||failures.length?'blocked':ready?'ready':product?'proof':'other',label:!projection.fresh?'Quellenprüfung offen':changed?'Neuer Stand · erneut prüfen':conflicts.length?'Konflikt klären':failures.length?'Prüfung fehlgeschlagen':ready?'Bereit zur Liveentscheidung':product?'Nachweise offen':group.kind==='historical'?'Restdelta klären':group.kind==='documentation'?'Dokumentation zu integrieren':group.kind==='prototype'?'Prototyp · Abnahme offen':group.kind==='service'?'Isolierter Pilot':'Werkzeug · Abnahme offen'};
}
export function assignmentBrief(group,state){
 return {title:`Nachweise klären: ${group.name}`,body:`Bestehende Task: ${group.task||'Originaltask anhand der verlinkten Übergaben zuordnen; keine neue Task anlegen'}\nVerantwortung: ${group.owner}\nZiel: ${group.target}\nOffene PRs: ${state.entries.map(p=>'#'+p.number+' '+p.currentHead).join(', ')}\n\nBelegt: ${group.done}\n\nKonkret offen:\n${state.missing.map(t=>'- '+t).join('\n')}\n\nNächster Schritt: ${group.next}\n\nNur aktuelle Quellen prüfen und ein nachvollziehbares Ergebnis mit SHA, Umgebung und Originalbeleg liefern. Historische Tests nicht unnötig wiederholen. Kein Merge, Deployment, PR-Schließen oder bezahlter Test beauftragt. Live unverändert.`};
}
