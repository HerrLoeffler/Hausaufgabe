import {safeLink} from './model.mjs';
import {projectPRs,groupReadiness,workKinds,assignmentBrief,matchesAssignment} from './pr-readiness.mjs';
import {domains} from './portfolio.mjs';
const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const A=(p,...cs)=>(p.append(...cs.filter(Boolean)),p);
const B=(text,fn,cls='button secondary')=>{const n=E('button',text,cls);n.type='button';n.onclick=fn;return n;};
const L=(text,url)=>{const n=E('a',text);const href=safeLink(url);if(href){n.href=href;n.target='_blank';n.rel='noopener noreferrer';}return n;};
const D=(title,...children)=>A(E('details'),E('summary',title),...children);
const pair=(label,text)=>A(E('div',undefined,'audit-pair'),E('strong',label),E('p',text));
const repo='https://github.com/HerrLoeffler/Hausaufgabe';
const stamp=s=>s?new Date(s).toLocaleString('de-DE'):'unbekannt';
export function mountPRAssignments(parent,onDraft){
 let projection,area='all',query='',scope='all',selected='';
 const filters=E('div',undefined,'pr-scope'),info=E('p',undefined,'tiny'),list=E('div',undefined,'release-list'),detail=E('section',undefined,'release-detail');detail.tabIndex=-1;detail.setAttribute('aria-label','Gewähltes PR-Arbeitspaket');
 A(parent,filters,info,A(E('div',undefined,'release-layout'),list,detail));
 function render(){
  if(!projection)return;
  const all=projection.groups.map(g=>({g,s:groupReadiness(g,projection)}));
  const options=[['all','Alle Pakete',all.length],['product','Livekandidaten',all.filter(x=>x.s.product).length],['other','Weitere Arbeit',all.filter(x=>!x.s.product).length],['new','Neue PRs',projection.unassigned.length]];
  filters.replaceChildren(...options.map(([id,label,count])=>{const b=B(`${label} · ${count}`,()=>{scope=id;selected='';render();});b.setAttribute('aria-pressed',String(scope===id));return b;}));
  info.textContent=`Fachabgleich: ${stamp(projection.audit.checkedAt)} · ${projection.fresh?'Offene PR-Liste aktuell gelesen':'Quellenprüfung offen – letzter erfasster Stand'}${projection.closed.length?' · '+projection.closed.length+' seitdem nicht mehr offen':''}.`;
  const rows=scope==='new'?projection.unassigned.map(p=>({g:{id:'new-'+p.number,name:'#'+p.number+' '+p.title,area:'unknown',kind:'unknown',owner:'Noch zuzuordnen',done:'Neu in der offenen PR-Liste.',target:p.base||'Ziel prüfen',gaps:['Fachbereich, Originaltask, aktueller Prüfumfang und nächste Arbeit zuordnen.'],next:'Neue PR mit Originalübergabe in den nächsten Fachabgleich aufnehmen.'},s:{label:'Zuordnung fehlt',kind:'changed',missing:['Fachzuordnung und Originalnachweise fehlen.'],entries:[p]}})):all.filter(({s})=>scope==='ready'?s.ready:scope==='product'?s.product:scope==='other'?!s.product:true);
  const shown=rows.filter(({g,s})=>(area==='all'||g.area===area)&&matchesAssignment(g,s.entries,query));
  if(!shown.some(x=>x.g.id===selected))selected=shown[0]?.g.id||'';
  list.replaceChildren();
  for(const {g,s} of shown){const b=B('',()=>{selected=g.id;render();if(matchMedia('(max-width:1000px)').matches){detail.focus({preventScroll:true});detail.scrollIntoView({block:'start'});}},'release-row'+(selected===g.id?' selected':''));b.setAttribute('aria-pressed',String(selected===g.id));A(b,E('strong',g.name),E('span',`${s.entries.map(p=>'#'+p.number).join(' · ')} · ${workKinds[g.kind]||'Zuordnung fehlt'}`,'tiny'),E('span',s.label,'release-state '+s.kind));list.append(b);}
  detail.replaceChildren();const row=shown.find(x=>x.g.id===selected);
  if(!row){detail.append(E('h2',scope==='ready'?'Noch kein neues Paket vollständig belegt':'Keine passenden Pakete'),E('p',scope==='ready'?'Unter Livekandidaten steht für jedes Paket, welcher Nachweis konkret noch fehlt.':'Bereich oder Suche ändern.'));return;}
  const {g,s}=row;
  A(detail,E('p',domains.find(d=>d.id===g.area)?.name||'Fachzuordnung offen','inspector-kicker'),E('h2',g.name),E('p',s.label,'audit-fresh '+s.kind),pair('Als Nächstes',g.next),pair('Zuständig',g.owner));
  A(detail,E('h3',s.product?'Das fehlt bis zur Liveentscheidung':'Konkret offen'),A(E('ul',undefined,'pr-gaps'),...s.missing.map(t=>E('li',t))));
  if(!s.missing.length)detail.append(E('p',s.ready?'Alle vorgeschriebenen Belege sind an Quelle und Ziel gebunden. Eine Veröffentlichung braucht eine eigene Freigabe.':'Vollständiges versionsgebundenes Freigabepaket noch nicht hinterlegt.'));
  A(detail,pair('Schon belegt',g.done),B('Prüfauftrag vorbereiten',()=>onDraft(g.area==='unknown'?'central':g.area,assignmentBrief(g,s))));
  const proofs=D(`PRs & Originalnachweise · ${s.entries.length}`,E('p',g.target),E('p',`Leitende Task der Familie: ${g.task||'Nicht eindeutig belegt; Originalübergabe prüfen'}`,'tiny'));
  for(const p of s.entries){
   const checks=(p.checks||[]).filter(c=>c.head===p.head),success=checks.filter(c=>c.conclusion==='success').length;
   const box=E('article',undefined,'pr-proof');
   A(box,L(`#${p.number} ${p.title}`,p.url||`${repo}/pull/${p.number}`),E('p',`${workKinds[p.kind]||'Noch zuzuordnen'} · ${p.draft?'Entwurf':'Offen'} · Ziel ${p.currentBase||p.base||'unbekannt'}`,'tiny'),E('p',`Aktuell ${p.currentHead?.slice(0,12)||'unbekannt'} · fachlich geprüft ${p.head?.slice(0,12)||'offen'}`,'tiny'),E('p',p.changed?'Head-/Zieländerung: bisherige Prüfungen gelten nicht automatisch.':checks.length?`${success}/${checks.length} Headprüfungen erfolgreich beim Fachabgleich. Kein Produktabnahmebeleg.`:'Keine Head-Checkruns erfasst; dokumentierte Testläufe gesondert lesen.','tiny'));
   if(p.metadataChanged&&!p.changed)box.append(E('p','PR-Metadaten seit Fachabgleich verändert.','tiny'));
   if(p.dependencies?.length)box.append(E('p',`Baut auf ${p.dependencies.map(n=>'PR'+n).join(', ')} auf.`,'tiny'));
   if(p.sameFiles?.length)box.append(E('p',`${p.sameFiles.length} Dateien bytegleich mit dem geprüften Ziel; das belegt nicht den gesamten PRumfang.`,'tiny'));
   for(const path of p.handoffs||[])box.append(A(E('p'),L('Originalübergabe · '+path.split('/').at(-1),`${repo}/blob/${p.head}/${path}`)));
   for(const c of checks)if(c.url)box.append(A(E('p'),L(`${c.name}: ${c.conclusion||c.status}`,c.url)));
   proofs.append(box);
  }
  for(const n of g.related||[])proofs.append(A(E('p'),L('Verknüpfter PR #'+n,`${repo}/pull/${n}`)));
  A(detail,proofs,D('Grenzen dieser Einordnung',...(projection.audit.limits||[]).map(t=>E('p',t,'tiny'))));
 }
 return {update(audit,source,newArea,newQuery){projection=projectPRs(audit,source);area=newArea;query=newQuery;render();},show(value){scope=value;selected='';render();}};
}
