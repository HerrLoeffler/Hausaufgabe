export const kindNames={live:'Live',test:'Testsystem',preview:'Vorschau',historical:'Historisch',local:'Auf diesem Mac',native:'App-Verteilung'};
const validSHA=s=>/^[a-f0-9]{40}$/.test(s||'');
const fresh=o=>Boolean(o?.lastGood&&!o.error&&Date.now()-Date.parse(o.lastSuccess)<15*60*1000);
export function environmentState(e,o={}){
 if(e.kind==='local')return {kind:'local',label:'Laufzeit nicht geprüft'};
 if(e.kind==='native')return {kind:'native',label:'Apple-/Geräteprüfung separat'};
 if(e.expiresAt&&Date.parse(e.expiresAt)<Date.now())return {kind:'expired',label:'Kanal laut Beleg abgelaufen'};
 if(o.error)return {kind:'error',label:'Abruf fehlgeschlagen'};
 if(!o.lastGood)return {kind:'unknown',label:'Aktueller Nachweis fehlt'};
 if(!fresh(o))return {kind:'stale',label:'Nachweis veraltet'};
 return {kind:'observed',label:e.baseline?.commit&&o.lastGood.commit!==e.baseline.commit?'Version seit Fachabgleich geändert':e.kind==='historical'?'Manifest erreichbar · historisch':'Hostingstand gelesen'};
}
export function candidateState(c,observations={},reviews=[]){
 const o=observations[c.testEnvironment],bound=validSHA(c.sourceCommit)&&c.sourceConfirmed!==false;
 const env=observations.__environments?.find(e=>e.id===c.testEnvironment),expired=Boolean(env?.expiresAt&&Date.parse(env.expiresAt)<Date.now());
 const hostingSource=!c.sourceComponent||c.sourceComponent==='hosting';
 const deployed=Boolean(hostingSource&&bound&&!expired&&env?.kind!=='historical'&&fresh(o)&&o.lastGood.commit===c.sourceCommit);
 const checks=c.checks.map(check=>({...check,...reviews.filter(r=>r.candidate===c.id&&r.sha===c.sourceCommit&&r.environment===c.testEnvironment&&r.check===check.id).at(-1),result:reviews.filter(r=>r.candidate===c.id&&r.sha===c.sourceCommit&&r.environment===c.testEnvironment&&r.check===check.id).at(-1)?.result||'pending'}));
 const automated=Boolean(bound&&c.automated?.status==='passed'&&c.automated.sha===c.sourceCommit);
 const currentPR=observations.__prs?.find(p=>p.number===c.pr);
 const changed=Boolean(currentPR&&c.prHead&&currentPR.head!==c.prHead);
 const gateReady=Boolean(bound&&deployed&&automated&&!changed&&checks.every(r=>r.result==='passed'));
 // Journal never constitutes release permission. Integration/rollback decision is separate.
 const published=Boolean(c.published&&c.publication?.commit===c.sourceCommit);
 return {bound,deployed,automated,checks,changed,ready:!published&&gateReady&&!c.releasePreparation,live:published&&deployed,label:published?(deployed?'Hosting live · Wirkung nachprüfen':'Veröffentlicht laut Receipt · Hosting abgleichen'):changed?'Neuer PR-Stand · Abgleich nötig':expired?'Vorschau abgelaufen':checks.some(r=>r.result==='failed')?'Prüfung fehlgeschlagen':!bound?'Version zuordnen':!hostingSource?'Komponenten belegt · Abnahme offen':!deployed?'Teststand abgleichen':checks.some(r=>r.result!=='passed')?'Abnahme offen':'Freigabeunterlagen vervollständigen'};
}
export function areaFreshness(area,sources){
 if(sources?.sources?.github?.error)return {kind:'unknown',label:'GitHub-Abgleich fehlgeschlagen'};
 const codex=sources?.sources?.codex,all=codex?.data?.chats||[];
 const entries=(area.chats||[]).map(ref=>({ref,current:all.find(c=>c.id===ref.id)}));
 if(entries.some(({ref,current})=>current?.updatedAt&&ref.updatedAt&&current.updatedAt>ref.updatedAt))return {kind:'changed',label:'Neuere Chatmeldung · Stand abgleichen'};
 if(codex?.error||entries.some(({current})=>!current?.updatedAt||!current.complete))return {kind:'unknown',label:'Quellenfrische unvollständig'};
 if(entries.length&&(!codex?.lastSuccess||Date.now()-Date.parse(codex.lastSuccess)>15*60*1000))return {kind:'stale',label:'Quellenprüfung veraltet'};
 return {kind:'checked',label:entries.length?'Keine neuere Chatmeldung erfasst':'Datierter Fachabgleich · Details prüfen'};
}
export function releaseBrief(c,s){return {title:`Abnahme vorbereiten: ${c.name}`,body:`Bestehende Task: ${c.task||'Aus verlinkter Übergabe zuordnen; keine neue Task anlegen'}\nZuständig: ${c.owner}\nKandidat: ${c.sourceCommit}\nTestumgebung: ${c.testEnvironment}\nVorgesehenes Ziel: ${c.targetEnvironment}\nKomponenten: ${c.components.join(', ')}\n\nBelegt: ${c.done}\nOffen: ${c.gap}\nNächster Schritt: ${c.next}\nAktuelle Einordnung: ${s.label}\n\nPrüfungen:\n${s.checks.map(x=>'- '+x.label+': '+({passed:'bestanden',failed:'fehlgeschlagen',pending:'offen'}[x.result])).join('\n')}\n\nVor Entscheidung: aktuelle Quelle/CI, unabhängiger Review, tatsächlicher Testdeploy, Backend/Rules, Geräte-/Fachabnahme, Abhängigkeiten, Rückfallplan und Live-Nachkontrolle konkret zusammenführen. Vorhandene Release-Control-Nachweise verwenden. Keine Veröffentlichung beauftragt. Live unverändert. Liefere ausschließlich Analyse und ein prüfbares Freigabebriefing.`};}
