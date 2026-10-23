export const monitorLabels = Object.freeze({
  all:'Alle', not_joined:'Noch nicht beigetreten', ready:'Wartet',
  running:'Bearbeitet', submitted:'Abgegeben', attention:'Hinweise'
});
export function monitorModel(result, serverNow) {
  const round=result.round||{};
  const rows=(result.rows||[]).map(row=>({
    ...row,
    stale:['ready','running'].includes(row.status)&&(!row.lastSeenAt||serverNow-row.lastSeenAt>45000)
  })).sort((a,b)=>a.name.localeCompare(b.name,'de')||a.studentId.localeCompare(b.studentId));
  const counts={all:rows.length,not_joined:0,ready:0,running:0,submitted:0,attention:0};
  for(const row of rows){if(Object.hasOwn(counts,row.status))counts[row.status]++;if(row.stale)counts.attention++;}
  return {rows,counts,round,canStart:round.state==='waiting'&&round.startMode==='teacher',
    remainingSeconds:round.deadlineAt?Math.max(0,Math.ceil((round.deadlineAt-serverNow)/1000)):null};
}

export function createExamMonitor({host,api,assignmentId,onOpenResults=()=>{},onHelp=()=>{},now=Date.now}) {
  const doc=host.ownerDocument;
  const el=(tag,text,attrs={})=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;};
  const action=(label,fn)=>{const b=el('button',label,{type:'button',class:'button ghost'});b.addEventListener('click',()=>void fn());return b;};
  let disposed=false,inFlight=null,latest=null,receivedAt=0,filter='all',starting=false;
  const records=new Map();
  const heading=el('h2','Prüfungsübersicht'),subtitle=el('p','Teilnehmer werden geladen …'),roundLine=el('p'),updated=el('p',undefined,{class:'gcMonitorUpdated'});
  const warning=el('p','', {role:'alert',class:'gcOnlineError'});warning.hidden=true;
  const filters=el('div',undefined,{class:'gcMonitorFilters','aria-label':'Teilnehmer filtern'}),filterButtons={};
  const table=el('table',undefined,{'data-telemetry-private':'true'}),head=el('thead'),headRow=el('tr'),body=el('tbody');
  for(const name of ['Name','Stand','Letztes Signal','Hilfe'])headRow.append(el('th',name,{scope:'col'}));head.append(headRow);table.append(head,body);
  const start=action('Test für alle starten',()=>requestStart(false));start.className='button primary';start.hidden=true;
  const confirmation=el('div',undefined,{class:'gcMonitorConfirm'});confirmation.hidden=true;
  const explain=el('p','„Bearbeitet“ ist der gemeldete Prüfungsstand. Ein fehlendes Signal bedeutet nicht, dass jemand nicht arbeitet.',{class:'gcMonitorUpdated'});
  host.replaceChildren(heading,subtitle,roundLine,updated,warning,filters,start,confirmation,table,explain);
  for(const[key,label]of Object.entries(monitorLabels)){const b=action(label,()=>{filter=key;applyFilter();});b.dataset.filter=key;filters.append(b);filterButtons[key]=b;}
  function applyFilter(){for(const[key,b]of Object.entries(filterButtons))b.setAttribute('aria-pressed',String(key===filter));for(const r of records.values())r.node.hidden=filter!=='all'&&(filter==='attention'?!r.row.stale:r.row.status!==filter);}
  function render(result){
    latest=result;receivedAt=now();const m=monitorModel(result,result.round?.serverNow||now());
    heading.textContent=result.assignment.title;subtitle.textContent=`${result.assignment.className} · ${m.counts.all} erwartete Schüler:innen`;
    roundLine.textContent=m.round.state==='waiting'?'Warteraum: Die Lehrkraft gibt den Test gemeinsam frei.':m.round.state==='running'?`Prüfung läuft${m.remainingSeconds===null?' ohne Zeitlimit':` · ${Math.ceil(m.remainingSeconds/60)} Minuten verbleiben`}`:m.round.state==='closed'?'Diese Prüfungsrunde ist geschlossen.':'Der Test kann individuell gestartet werden.';
    updated.textContent=`Aktualisiert: ${new Date(now()).toLocaleTimeString('de-DE')}`;warning.hidden=true;
    for(const[key,b]of Object.entries(filterButtons))b.textContent=`${monitorLabels[key]}: ${m.counts[key]}`;
    start.hidden=!m.canStart;start.disabled=starting;confirmation.hidden=true;
    const ids=new Set(m.rows.map(r=>r.studentId));for(const[id,r]of records)if(!ids.has(id)){r.node.remove();records.delete(id);}
    for(let index=0;index<m.rows.length;index++){
      const row=m.rows[index];let record=records.get(row.studentId);
      if(!record){const node=el('tr'),cells=Array.from({length:4},()=>el('td'));node.append(...cells);record={node,cells,row};record.help=action('Hilfe',()=>record.row.status==='submitted'?onOpenResults(record.row,latest.assignment):onHelp(record.row,latest.assignment));cells[3].append(record.help);records.set(row.studentId,record);}
      record.row=row;record.cells[0].textContent=row.name;record.cells[1].textContent=(monitorLabels[row.status]||'Stand unbekannt')+(row.stale?' · Kein frisches Signal':'');
      record.cells[2].textContent=row.lastSeenAt?new Date(row.lastSeenAt).toLocaleTimeString('de-DE'):'Noch kein Kontakt';record.help.textContent=row.status==='submitted'?'Ergebnis':'Hilfe';
      if(body.children[index]!==record.node)body.insertBefore(record.node,body.children[index]||null);
    }
    applyFilter();
  }
  async function requestStart(confirmed){
    if(disposed||starting||!latest)return;
    const model=monitorModel(latest,(latest.round?.serverNow||now())+Math.max(0,now()-receivedAt));if(!model.canStart)return;
    if(model.counts.not_joined&&!confirmed){confirmation.replaceChildren(el('p',`${model.counts.ready} Schüler:innen warten. ${model.counts.not_joined} sind noch nicht beigetreten.`),action('Fehlende anzeigen',()=>{filter='not_joined';applyFilter();}),action('Trotzdem starten',()=>requestStart(true)));confirmation.hidden=false;return;}
    starting=true;start.disabled=true;
    try{await api.teacher('startRound',{assignmentId});await refresh();}catch(e){if(!disposed){warning.textContent=e.message;warning.hidden=false;}}finally{starting=false;if(!disposed)start.disabled=false;}
  }
  function refresh(){
    if(disposed)return Promise.resolve();if(inFlight)return inFlight;
    inFlight=Promise.resolve().then(()=>disposed?null:api.teacher('participants',{assignmentId})).then(result=>{if(!disposed)render(result);}).catch(()=>{if(!disposed){warning.textContent='Verbindung der Übersicht unterbrochen. Die angezeigten Stände sind nicht aktuell.';warning.hidden=false;start.disabled=true;}}).finally(()=>{inFlight=null;});
    return inFlight;
  }
  const timer=setInterval(()=>{if(!doc.hidden)void refresh();},5000);
  const visibility=()=>{if(!doc.hidden)void refresh();};doc.addEventListener('visibilitychange',visibility);
  void refresh();
  return {refresh,dispose(){disposed=true;clearInterval(timer);doc.removeEventListener('visibilitychange',visibility);host.replaceChildren();records.clear();}};
}
