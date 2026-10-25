import {mountReleases,mountCompanyStatus,mountAreaAudit} from './release-view.mjs';
import {CentralClient,mountTasks,mountSources,mountDomainSources} from './runtime-view.mjs';
const central=new CentralClient();let runtimeOff=()=>{};
import {areas,topics} from './data.mjs';
import {domains,recordsFor,coverage,primaryDomain} from './portfolio.mjs';
import {mountNetwork} from './network-view.mjs';
let inventory,brandManifest;
try {
 const responses=await Promise.all([fetch('inventory.json'),fetch('/shared/gradecrew-design/assets.json')]);
 if(responses.some(r=>!r.ok))throw Error('Quellenbestand nicht geladen');
 [inventory,brandManifest]=await Promise.all(responses.map(r=>r.json()));
} catch(error) {
 document.querySelector('#content').textContent='Der Projektbestand konnte nicht geladen werden. Bitte die lokale Vorschau über tools/serve_firmenzentrale.py starten und neu laden.';
 throw error;
}

import {parseRoute,searchTopics,safeLink,readDrafts,writeDrafts,validateDraft} from './model.mjs';

// This adapter deliberately exposes a dated, read-only snapshot, not a live company store.
const snapshot={date:'22. Oktober 2026',topics,areas};
const $=s=>document.querySelector(s);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const append=(parent,...children)=>{parent.append(...children.filter(Boolean));return parent;};
const link=(text,href,cls='')=>{const a=el('a',cls,text);a.href=href;return a;};
const button=(text,action,cls='button secondary')=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
const areaName=id=>areas.find(a=>a.id===id)?.name||'Noch zuordnen';
const label=(text,kind='neutral')=>el('span',`label ${kind}`,text);
const kindName={task:'Auftrag',idea:'Idee',goal:'Ziel',customer:'Kundenanfrage',problem:'Problem'};
let storage;let draftsState;
try{storage=window.localStorage;draftsState=readDrafts(storage);}catch{draftsState={ok:false,items:[],error:'Lokaler Speicher ist nicht verfügbar. Texte können heruntergeladen werden.'};}
let drafts=draftsState.items,editingId=null,route=parseRoute(location.hash),toastTimer,editorBaseline='',closeRequested=false;
const icons={heute:'M3 10 12 3 21 10M5 9v12h14V9M9 21v-8h6v8',eingang:'M4 4h16v16H4zM4 13h5l1 3h4l1-3h5',arbeit:'M3 7h18v14H3zM8 7V3h8v4M3 12h18M10 12v3h4v-3',wissen:'M12 5c-3-3-7-2-10-1v15c3-1 7-2 10 1 3-3 7-2 10-1V4c-3-1-7-2-10 1v15',arrow:'M5 12h14M13 6l6 6-6 6',empty:'M5 3h14v18H5zM8 8h8M8 12h6M8 16h4'};
function icon(name){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.5');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',icons[name]||icons.empty);s.append(p);return s;}
function notify(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function head(title,description,action){const h=el('div','page-heading');append(h,append(el('div'),el('h1','',title),el('p','',description)),action);return h;}
function section(title,description){return append(el('div','section-head'),append(el('div'),el('h2','',title),description&&el('p','',description)));}
function empty(title,text,action){return append(el('div','empty'),icon('empty'),el('h2','',title),el('p','',text),action);}
function note(text){return el('p','info-note',text);}
function topicRow(t){const a=link('',`#/arbeit/thema/${t.id}`,'topic-row');append(a,el('span','topic-symbol',t.title.slice(0,2)),append(el('div'),el('h3','',t.title),el('p','',t.statusLabel),el('p','tiny',areaName(t.area))),el('span','go','↗'));return a;}
function topicList(items){const p=el('div','panel');items.forEach(t=>p.append(topicRow(t)));return items.length?p:empty('Kein passendes Thema','Andere Suche versuchen oder einen neuen Entwurf erfassen.',button('Neu erfassen',()=>openEditor()));}
function source(s){const href=safeLink(s.url);const a=href?link('',href,'source'):el('div','source');if(href){a.target='_blank';a.rel='noopener noreferrer';}append(a,el('strong','',s.label),el('small','',s.stamp),el('span','source-path',href?new URL(href).hostname:s.path||'Quelle ohne erreichbaren Link'));return a;}
function pairs(title,items){const d=append(el('section','detail-section'),el('h2','',title));items.forEach(([a,b])=>append(d,append(el('article','aside-note'),el('h3','',a),el('p','',b))));return d;}
function tabnav(entries,base,current){const n=el('nav','tabs');n.setAttribute('aria-label','Ansichten');entries.forEach(([id,name])=>{const a=link(name,`${base}/${id}`,current===id?'active':'');if(current===id)a.setAttribute('aria-current','page');n.append(a);});return n;}

function navigation(){
  $('#primary').replaceChildren();$('#secondary').replaceChildren();
  for(const [id,name] of [['heute','Heute'],['eingang','Eingang'],['arbeit','Arbeit'],['wissen','Wissen']]){
    const a=link('',`#/${id}`,`nav-link ${route.page===id?'active':''}`);append(a,icon(id),el('span','',name));if(route.page===id)a.setAttribute('aria-current','page');$('#primary').append(a);
  }
  if(route.page==='arbeit'){
    if(route.section!=='bereich')for(const [id,name] of [['landkarte','Unternehmensnetz'],['stand','Bereichsstand'],['releases','Seiten & Releases'],['abdeckung','Quellenabdeckung'],['themen','Detailakten'],['ziele','Ziele'],['qualitaet','Aufgabenqualität'],['netz','Beziehungen']]){
      const active=route.section===id||(!route.section&&id==='landkarte')||(route.section==='thema'&&id==='themen');
      const a=link(name,`#/arbeit/${id}${id==='bereich'?'/strategy':''}`,`sub-link ${active?'active':''}`);if(active)a.setAttribute('aria-current','page');$('#secondary').append(a);
    }
    if(route.section==='bereich'){
      $('#secondary').append(link('← Arbeitsübersicht','#/arbeit','sub-link'));
      $('#secondary').append(el('label','sub-label','Ausgewählter Bereich'));
      const select=el('select','area-select');select.setAttribute('aria-label','Firmenbereich auswählen');areas.forEach(a=>{const o=el('option','',a.name);o.value=a.id;o.selected=a.id===route.id;select.append(o);});
      select.addEventListener('change',()=>location.hash=`/arbeit/bereich/${select.value}`);$('#secondary').append(select);
      for(const [id,name] of [['ueberblick','Überblick'],['themen','Themen'],['ziele','Ziele'],['wissen','Wissen']])$('#secondary').append(link(name,`#/arbeit/bereich/${route.id}/${id}`,`sub-link ${route.tab===id?'active':''}`));
    }
  }
  const names={heute:'Heute',eingang:'Eingang',arbeit:'Arbeit',wissen:'Wissen',verbindungen:'Verbindungen'};
  $('#breadcrumb').replaceChildren(link('Firmenzentrale','#/heute'),el('span','','/'),el('span','current',names[route.page]||'Heute'));
  if(route.section==='thema')$('#breadcrumb').append(el('span','','/'),el('span','current',topics.find(t=>t.id===route.id)?.title||'Thema'));
  if(route.section==='bereich')$('#breadcrumb').append(el('span','','/'),el('span','current',areaName(route.id)));
  if(route.section==='landkarte'&&route.id){const d=domains.find(x=>x.id===route.id);if(d)$('#breadcrumb').append(el('span','','/'),link(d.name,`#/arbeit/landkarte/${d.id}`));}

}

function today(){
 mountNetwork($('#content'),{selected:route.section==='landkarte'?route.id:'',child:route.tab==='ueberblick'?'':route.tab,brandIcon:`/${brandManifest.root}/${brandManifest.brand.icon}`,onDraft:(n,edge)=>openEditor(null,{area:n.area,title:edge?`Weiterarbeit: ${edge.scope}`:`Weiterarbeit: ${n.label}`,body:edge?.childWork?`Bereich: ${n.name}\n${edge.childWork}`:`Bereich: ${n.name}\nZuständigkeit: ${n.owner}\n\n${edge?`Verbindung: ${edge.from} → ${edge.to}\nBetroffener Umfang: ${edge.scope}\nZusammenhang: ${edge.reason}\nArbeitsschritt: ${edge.next||n.blocker?.next||n.next[0]}\nQuelle: ${edge.source}`:`Nächster Schritt: ${n.blocker?.next||n.next[0]}\nBelegter Ausgangsstand: ${n.built}`}\n\nStatus: lokaler Entwurf, nicht gesendet. Bestehende Task-ID und aktuellen Quellenstand vor Ausführung prüfen.`})});
 const shortcuts=el('nav','release-controls');shortcuts.setAttribute('aria-label','Firmenstand');append(shortcuts,link('Bereichsstand','#/arbeit/stand','button secondary'),link('Seiten & Releases','#/arbeit/releases','button secondary'));if(route.page==='heute')$('#content').prepend(shortcuts);
}
function sourceAge(value){const n=typeof value==='number'?(value<1e12?value*1000:value):Date.parse(value);if(!Number.isFinite(n))return 'Quelldatum unbekannt';const days=Math.max(0,Math.floor((Date.now()-n)/86400000));return new Date(n).toLocaleDateString('de-DE')+' · '+days+' Tage alt';}
function portfolioDetail(){
 const d=domains.find(d=>d.id===route.id),c=$('#content');if(!d){c.append(empty('Themenfeld nicht gefunden','Bitte die Projektlandkarte öffnen.',link('Zur Landkarte','#/heute','button primary')));return;}
 const records=recordsFor(inventory,d.id);
 append(c,link('← Projektlandkarte','#/heute','button quiet'),head(d.name,d.goal),pairs('Was wir bereits aufgebaut haben',[['Bisheriges Arbeitszeugnis',d.built]]));
 c.append(append(el('div','domain-pieces'),...d.pieces.map(p=>el('span','',p))));
 append(c,pairs('Was als größere Lieferstücke fehlt',d.next.map((n,i)=>[`Nächster Schritt ${i+1}`,n])),note(`Verantwortung: ${d.owner}. Fortschritt bleibt unbekannt, bis Zielumfang und gewichtete Abnahmekriterien vereinbart sind.`));
 c.append(button('Auftrag zu diesem Themenfeld vorbereiten',()=>openEditor(null,{area:d.area,title:`Weiterarbeit: ${d.name}`,body:`Themenfeld: ${d.name}\nZiel: ${d.goal}\n\nVorhandene Arbeit:\n${d.built}\n\nNächste Lieferstücke:\n${d.next.join('\n')}\n\nZuständigkeit: ${d.owner}\nStatus: Entwurf, noch nicht gesendet. Quellen und aktuelle Task-ID vor Ausführung bestätigen.`}),'button primary'));
 c.append(section('Belegter Code- und Releasestand','Registeraussagen sind datiert. Ein veröffentlichter Teil ergibt keine Gesamtfreigabe.'));
 const stages={branch_only:'Auf Branch',ci_green:'Automatisch geprüft',integrated:'Integriert',staging_deployed:'Auf Staging dokumentiert',user_tested:'Nutzertest dokumentiert',production:'Production dokumentiert'};
 if(!records.workstreams.length)c.append(note('Noch kein passender Release-Registereintrag zugeordnet. Das ist eine Quellenlücke, kein Beleg fehlender Arbeit.'));
 for(const w of records.workstreams){const block=append(el('details','evidence-record'),append(el('summary'),el('strong','',w.id),label(stages[w.stage]||w.stage)),el('p','',`Branch: ${w.branch}`),el('p','',w.next_action));append(block,source({label:'Originaleintrag im aktuellen Release-Register',url:'https://github.com/HerrLoeffler/Hausaufgabe/blob/main/GRADECREW_STATE.json',stamp:'Am 23.10.2026 gelesen · kein neuer Deploytest'}));c.append(block);}
 c.append(section('Kandidaten und nächste Produktarbeit',`${records.prs.length} zugeordnete offene PRs · noch keine Übernahme durch diese Ansicht`));records.prs.forEach(p=>c.append(source({label:`PR${p.number}: ${p.title}`,url:p.url,stamp:`Branch ${p.branch} · ${p.sha.slice(0,8)}`})));
 c.append(section('Gespräche & Quellenabdeckung','Titel sind Zuordnungshinweise; die redaktionelle Synthese wird weiter geprüft.'));
 records.chats.forEach(t=>c.append(append(el('article','source'),el('strong','',t.title),el('small','',`${t.status} · ${t.pages} API-Seiten / ${t.turns} Turns · ${sourceAge(t.updatedAt)}`),el('span','source-path',t.id))));
 if(!records.chats.length)c.append(note('Noch kein Gespräch zugeordnet. Die Abdeckungsliste bewahrt alle erfassten Quellen.'));
 const detailed=topics.filter(t=>primaryDomain([t.title,t.id].join(' '))===d.id);if(detailed.length){c.append(section('Erhaltene Detailakten und geparkte Ideen'));detailed.forEach(t=>c.append(topicRow(t)));}if(d.id==='operations')c.append(pairs('Für spätere Entscheidungen erhalten',[['Lokale Modelle / Ollama','Archivierter Fachchat empfiehlt, zunächst den bestehenden KI-Zugang zu stabilisieren. Eigene Hardware/Offline-KI später bei konkretem Bedarf prüfen. Als Empfehlung erhalten, keine verbindliche Unternehmensentscheidung behauptet.']]));c.append(section('Hängt zusammen mit'));d.related.forEach(id=>{const related=domains.find(d=>d.id===id);if(related)c.append(link(related.name,`#/arbeit/landkarte/${id}`,'button secondary'));});
}
function coverageView(){
 const outer=$('#content'),stats=coverage(inventory),c=el('div');append(outer,head('Quellenabdeckung','Aktueller Abruf und erkennbare Lücken.'),append(el('details','compact-details'),el('summary','','Historische Inventur · 23.10.2026'),c));
 append(c,el('p','quality-summary',`Historische Inventur vom 23.10.2026: ${stats.chats} Chats erschlossen, ${stats.pages} API-Seiten und ${stats.turns} Turns erfasst. ${stats.partial} Chats sind nur teilweise oder nicht erreichbar. Die redaktionelle Gesamtauswertung ist offen.`),note(`${stats.branches} Remote-Branches bis Seite4, ${stats.prs} offene PRs und ${inventory.workstreams.length} Release-Registereinträge erfasst. Der Produktbaum enthält ${inventory.productTree.count} Einträge bei ${inventory.productTree.sha.slice(0,8)}; keine Vollcodeprüfung aller Branches.`));
 c.append(note(`${inventory.localCode?.length||0} lokale Git-Checkouts mit HEAD, Branch und versionierten Dateitypen erfasst. Historische Kopien sind keine zusätzlichen Produkte.`));const codeList=append(el('details','evidence-record'),el('summary','','Lokale Codebestände und exakte Stände'));for(const repo of inventory.localCode||[])codeList.append(append(el('article','source'),el('strong','',repo.path.split('/').at(-1)),el('small','',`${repo.branch} · ${repo.head.slice(0,12)} · ${repo.trackedFiles} versionierte Dateien`),el('span','source-path',repo.path),el('p','',Object.entries(repo.codeFileCounts).map(([k,v])=>`${v} ${k}`).join(' / '))));c.append(codeList);c.append(pairs('Zugriffsgrenzen',inventory.limits.map((s,i)=>[`Grenze ${i+1}`,s])));
 for(const t of inventory.chats)c.append(append(el('article','source'),el('strong','',t.title),el('small','',`${t.status} · ${t.pages} API-Seiten · ${t.turns} Turns`),el('span','source-path',t.id)));
 const unassigned=recordsFor(inventory,'unassigned');c.append(section('Noch redaktionell zuordnen',`${unassigned.workstreams.length} Registereinträge und ${unassigned.prs.length} PRs bleiben sichtbar.`));unassigned.workstreams.forEach(w=>c.append(el('p','source',`${w.id} · ${w.branch}`)));unassigned.prs.forEach(p=>c.append(source({label:`PR${p.number}: ${p.title}`,url:p.url,stamp:'Noch keinem großen Themenfeld zugeordnet'})));
}

function themes(items=topics){
  const c=$('#content');append(c,head('Themen & Projekte','Ein Thema, eine Akte. Aufgaben und Quellen bleiben miteinander verbunden.'));
  const controls=el('div','toolbar'),input=el('input','filter-input');input.type='search';input.placeholder='Themen und Aufgaben durchsuchen';input.setAttribute('aria-label','Themen durchsuchen');const select=el('select','filter-input');select.setAttribute('aria-label','Nach Bereich filtern');for(const a of [{id:'all',name:'Alle Bereiche'},...areas]){const o=el('option','',a.name);o.value=a.id;select.append(o);}
  append(controls,input,select);const results=el('div');results.setAttribute('aria-live','polite');const update=()=>results.replaceChildren(topicList(searchTopics(items,input.value,select.value)));input.addEventListener('input',update);select.addEventListener('change',update);append(c,controls,results);update();
}
function detail(){
  const t=topics.find(t=>t.id===route.id),c=$('#content');if(!t){c.append(empty('Thema nicht gefunden','Die Adresse passt zu keiner übernommenen Akte.',link('Alle Themen','#/arbeit/themen','button primary')));return;}
  append(c,link('← Alle Themen','#/arbeit/themen','button quiet'),append(el('div','detail-title'),el('p','id',`${t.id} · ${areaName(t.area)}`),el('h1','',t.title)),tabnav([['ueberblick','Überblick'],['aufgaben','Aufgaben'],['entscheidungen','Entscheidungen'],['gespraeche','Gespräche'],['quellen','Quellen'],['verlauf','Verlauf']],`#/arbeit/thema/${t.id}`,route.tab));
  if(route.tab==='aufgaben'){c.append(section('Was zu tun ist','Fachabgleich25.10.2026; neuere Quellen vor Ausführung prüfen.'));t.tasks.forEach(g=>{const d=el('details','work-group');append(d,append(el('summary'),document.createTextNode(g.title),el('small','',g.state)));const ul=el('ul');g.children.forEach(([a,b])=>ul.append(append(el('li'),el('strong','',a+': '),document.createTextNode(b))));append(c,append(d,ul));});}
  else if(route.tab==='entscheidungen'){append(c,pairs('Offene Entscheidungen',t.decisions),pairs('Für später festgehalten',t.parked));}
  else if(route.tab==='gespraeche'){append(c,note('Hier liegen die bekannten Gesprächsbezüge. Frisch abrufbare Verläufe stehen unter Quellenabdeckung; neue Analyseaufträge und Ergebnisse im Eingang.'));t.conversations.forEach(x=>append(c,append(el('section','detail-section'),el('h2','',x.title),el('p','',x.text),el('small','',`Chat-ID: ${x.id}`))));c.append(button('Arbeitsauftrag vorbereiten',()=>openEditor(null,{title:`Weiterarbeit: ${t.title}`,area:t.area,body:`Aufgabe: ${t.id}\n\nNächster Schritt:\n${t.next}\n\nBisherige Grenze:\n${t.stage}\n\nQuellen:\n${t.sources.map(s=>s.url).join('\n')}`})));}
  else if(route.tab==='quellen'){c.append(note('Historische Nachweise. Ein verlinkter Testbericht bestätigt nur den dort beschriebenen Umfang.'));t.sources.forEach(s=>c.append(source(s)));}
  else if(route.tab==='verlauf'){const timeline=el('div','timeline');t.history.forEach(h=>timeline.append(append(el('article'),el('h3','',h.title),el('p','',h.text))));c.append(timeline);if(t.historicalTasks){const old=append(el('details','work-group'),el('summary','','Frühere Aufgabenstände · nicht aktueller Arbeitsauftrag'));t.historicalTasks.forEach(g=>old.append(pairs(g.title,g.children)));c.append(old);}}
  else{
    append(c,label(t.statusLabel,'amber'),append(el('section','detail-section'),el('h2','','Worum es geht'),el('p','',t.summary)),append(el('section','detail-section'),el('h2','','Nächster Schritt'),el('p','',t.next)),append(el('section','detail-section'),el('h2','','Warum dieser Schritt'),el('p','',t.reason)));
    const facts=el('dl','facts');for(const [k,v]of [['Verantwortung laut Akte',t.owner],['Belegter Stand',t.stage]])facts.append(append(el('div'),el('dt','',k),el('dd','',v)));append(c,facts,note(t.conflict));
    if(t.links.length){c.append(section('Hängt zusammen mit'));t.links.forEach(([id,reason])=>{const target=topics.find(x=>x.id===id);if(target)c.append(append(el('div','detail-section'),link(target.title,`#/arbeit/thema/${id}`,'button quiet'),el('p','',reason)));});}
  }
}
function goals(area){
  const c=$('#content');append(c,head('Ziele & Fortschritt','Ein klarer Abschluss braucht überprüfbare Teilziele.'));
  const local=drafts.filter(d=>d.kind==='goal'&&(!area||d.area===area));
  append(c,empty('Noch kein verbindlicher Zielstand','Es liegen noch keine übernommenen Ziele mit gewichteten und abgenommenen Meilensteinen vor. Deshalb wird kein scheinbarer Fortschritt in Prozent angezeigt.',button('Ziel entwerfen',()=>openEditor(null,{kind:'goal',area:area||'strategy'}))),note('Fortschritt = Gewicht abgenommener Meilensteine ÷ Gesamtgewicht. Ohne vereinbarte Kriterien bleibt der Wert unbekannt.'));
  if(local.length){c.append(section('Deine Zielentwürfe','Nur auf diesem Gerät; noch nicht als Unternehmensziele übernommen.'));local.forEach(d=>c.append(draftRow(d)));}
}
function quality(){
  const c=$('#content');append(c,head('Aufgabenqualität','Bewährte Formate bewahren. Neue Formate schrittweise zuverlässig machen.'),el('p','quality-summary','„Grün“ gilt für eine konkrete Version und einen geprüften Einsatzbereich. Offene Fehler, fehlende Prüfungen oder eine geänderte Grundlage verhindern die Freigabe.'));
  const grid=el('div','quality-grid');
  for(const t of topics.filter(t=>t.relatedAreas.includes('pedagogy')||t.area==='pedagogy')){
    const card=append(el('article','quality-item'),label('ABNAHME OFFEN','amber'),el('h3','',t.title),el('p','',t.stage));const gates=el('div','gates');for(const s of ['Fachliche Richtigkeit und verständliche Aufgaben','Technische Funktion auf Zielgeräten','Wiederholbare Ergebnisse und Fehlernachprüfung','Freigabe der konkreten Version'])gates.append(append(el('div','gate'),el('span','','○'),el('span','',s)));append(card,gates,link('Nachweise und nächste Schritte →',`#/arbeit/thema/${t.id}`,'button quiet'));grid.append(card);
  }
  append(c,grid,section('Von offen zu verlässlich'),pairs('Der Prüfablauf',[['1 · Bestand aufnehmen','Aufgabenformat, Version, Einsatzbereich, bekannte Fehler und vorhandene Prüfnachweise zusammenführen.'],['2 · Fehler reproduzieren','Eingabe, erwartetes Ergebnis, tatsächliches Ergebnis und Schwere festhalten. Ein Erfolg in einem Einzelfall schließt keinen Fehler.'],['3 · Korrigieren und erneut prüfen','Den betroffenen Fall sowie benachbarte Funktionen testen. Fachliche, technische und visuelle Prüfung getrennt belegen.'],['4 · Begrenzt freigeben','Freigabe mit Version, Prüfumfang, Zeitpunkt und verantwortlicher Person verbinden. Nach relevanten Änderungen oder Regressionen erneut prüfen.']]));
}
function area(){
  const a=areas.find(a=>a.id===route.id),c=$('#content');if(!a){c.append(empty('Bereich nicht gefunden','Bitte einen Bereich links auswählen.'));return;}
  if(route.tab==='ziele'){goals(a.id);return;}
  const associated=searchTopics(topics,'',a.id);
  append(c,head(a.name,a.short));
  if(route.tab==='themen'){append(c,section('Themen in diesem Bereich','Verknüpfte Akten; keine Kopien.'),topicList(associated));return;}
  if(route.tab==='wissen'){knowledge(a.id,false);return;}
  append(c,append(el('section','detail-section'),el('h2','','Auftrag des Bereichs'),el('p','',a.purpose)),append(el('section','detail-section'),el('h2','','Was hier zusammenläuft'),el('p','',a.scope)));
  const f=el('dl','facts');for(const[k,v]of [['Verantwortliche Rolle',a.owner],['Erwartete Ergebnisse',a.results]])f.append(append(el('div'),el('dt','',k),el('dd','',v)));append(c,f,section('Zugeordnete Arbeit',`${associated.length} Themen im übernommenen Quellenstand`),topicList(associated));
}
function knowledge(area,heading=true){
  const c=$('#content');if(heading)c.append(head('Wissen','Quellen bei der passenden Arbeit finden.'));
  const input=el('input','filter-input');input.type='search';input.placeholder='Quelle oder Thema suchen';input.setAttribute('aria-label','Wissen durchsuchen');c.append(append(el('div','toolbar'),input));const list=el('div');c.append(list);
  const draw=()=>{list.replaceChildren();const q=input.value.trim().toLocaleLowerCase('de');let count=0;for(const t of searchTopics(topics,'',area||'all')){const matches=t.sources.filter(s=>`${t.title} ${s.label} ${s.url}`.toLocaleLowerCase('de').includes(q));if(matches.length){list.append(section(t.title));matches.forEach(s=>list.append(source(s)));count+=matches.length;}}if(!count)list.append(empty('Keine passende Quelle','In diesem Quellenstand gibt es dazu keinen Eintrag.'));};input.addEventListener('input',draw);draw();
}
function network(){const c=$('#content');append(c,head('So hängt die Arbeit zusammen.','Gemeinsame Ziele brauchen sichtbare Abhängigkeiten.'));const net=el('div','network'),seen=new Set();for(const t of topics)for(const[id,why]of t.links){const key=[t.id,id].sort().join(':');if(seen.has(key))continue;seen.add(key);const target=topics.find(x=>x.id===id);if(target)net.append(append(el('div','network-row'),link(t.title,`#/arbeit/thema/${t.id}`),el('span','','↔'),append(el('div'),link(target.title,`#/arbeit/thema/${id}`),el('p','',why))));}c.append(net);}
function draftRow(d){return append(el('article','draft-row'),append(el('div'),el('h3','',d.title),el('p','',`${kindName[d.kind]||'Entwurf'} · ${areaName(d.area)} · lokal, nicht versendet`)),button('Öffnen',()=>openEditor(d)));}
function inbox(){
  const c=$('#content');append(c,head('Eingang','Aufträge, Rückfragen und Ergebnisse.'));
  runtimeOff=mountTasks(c,central);
  if(!draftsState.ok)c.append(el('p','error',draftsState.error));
  if(drafts.length){c.append(section('Lokale Entwürfe',`${drafts.length} erfasst · auf diesem Gerät gespeichert`));drafts.toReversed().forEach(d=>c.append(draftRow(d)));}

  const panel=el('div','panel');for(const [name,desc]of [['E-Mail','Kein Postfach verbunden. Nachrichten werden hier noch nicht abgerufen.'],['Kunden & Support','Kein Eingangskanal verbunden. Anfragen können als lokale Entwürfe erfasst werden.']])panel.append(append(el('article','channel'),append(el('div'),el('h3','',name),el('p','',desc)),label('Nicht verbunden')));append(c,append(el('details','compact-details'),el('summary','','Weitere Eingangskanäle · 2 nicht verbunden'),panel));
}
function connections(){const c=$('#content');append(c,head('Verbindungen','Quellenstand und offene Anbindungen.'),append(el('details','compact-details'),el('summary','','Was die Zentrale bereits kann'),pairs('Arbeitsweise',[
 ['Chat-Aufträge','Die bestehende Codex-Anmeldung verbindet diese lokale Zentrale mit echten Arbeitsverläufen. Das freigegebene Profil bearbeitet Analysen, Konzepte und Berichte; Produktcode und Liveänderungen sind gesperrt.'],
 ['Projektwissen','Codex-Quellen und GitHub werden alle fünf Minuten geprüft. Neue Quellen ändern fachliche Abnahmen nicht automatisch. Die redaktionelle Landkarte bleibt als datierter Stand erhalten.'],
 ['Entwürfe','Entwurf speichern sendet nichts. Erst Bearbeitung starten nimmt einen Auftrag in den dauerhaften lokalen Dienst auf.'],
 ['E-Mail und Kundenkanäle','Noch kein Postfach oder Supportkanal verbunden.'],
 ['Betrieb','Der Dienst muss auf diesem Mac laufen. Keine Mehrbenutzer- oder Cloudfreigabe. Ein Ergebnis ist keine Produktabnahme.']
 ])));runtimeOff=mountSources(c,central);}

function field(name,labelText,type,value,options){const l=el('label','field',labelText);let input;if(options){input=el('select');for(const [v,t]of options){const o=el('option','',t);o.value=v;input.append(o);}}else input=el(type==='textarea'?'textarea':'input');input.name=name;if(type!=='textarea'&&!options)input.type=type;input.value=value||'';l.append(input);return l;}
function openEditor(d=null,preset={}){
  try{const pending=JSON.parse(storage?.getItem('gradecrew-pending-dispatch-v1')||'null');if(pending&&central.state?.requests.some(r=>r.id===pending.requestId))storage.removeItem('gradecrew-pending-dispatch-v1');}catch{}
  editingId=d?.id||null;const value={kind:'task',area:'strategy',title:'',body:'',...preset,...d};$('#dialog-title').textContent=d?'Entwurf bearbeiten':'Neu erfassen';$('#editor-message').textContent='';$('#editor-message').className='';
  const title=field('title','Titel','text',value.title);title.lastChild.maxLength=160;title.lastChild.required=true;
  const body=field('body','Beschreibung & gewünschtes Ergebnis','textarea',value.body);body.lastChild.maxLength=12000;
  $('#editor-body').replaceChildren(title,append(el('div','field-pair'),field('kind','Art','select',value.kind,Object.entries(kindName)),field('area','Bereich','select',value.area,areas.map(a=>[a.id,a.name]))),body,el('p','help','Entwurf = nur speichern. Start = Analyse, Konzept oder Bericht bearbeiten lassen. Live bleibt unverändert.'));
  $('#save-draft').disabled=!draftsState.ok;
  if(!draftsState.ok){$('#editor-message').textContent=draftsState.error;$('#editor-message').className='error';}
  editorBaseline=JSON.stringify([...new FormData($('#editor-form'))]);closeRequested=false;
  $('#editor').showModal();title.lastChild.focus();
}
function formDraft(){const f=new FormData($('#editor-form'));return {id:editingId||crypto.randomUUID(),kind:f.get('kind'),area:f.get('area'),title:f.get('title').trim(),body:f.get('body'),updatedAt:new Date().toISOString()};}
$('#editor-form').addEventListener('submit',event=>{
  event.preventDefault();const d=formDraft(),valid=validateDraft(d);if(!valid.ok){$('#editor-message').textContent=valid.error;return;}
  if(!draftsState.ok)return;
  // Read again before writing: preserve other-tab additions; refuse corrupt or stale edits.
  const latest=readDrafts(storage);if(!latest.ok){$('#editor-message').textContent=latest.error;$('#save-draft').disabled=true;draftsState=latest;return;}
  const before=drafts.find(x=>x.id===editingId),now=latest.items.find(x=>x.id===editingId);
  if(editingId&&before?.updatedAt!==now?.updatedAt){$('#editor-message').textContent='Dieser Entwurf wurde in einer anderen Ansicht geändert. Bitte den Text herunterladen und die Seite neu laden.';return;}
  const next=editingId?latest.items.map(x=>x.id===editingId?d:x):[...latest.items,d];const result=writeDrafts(storage,next);
  if(!result.ok){$('#editor-message').textContent=result.error;$('#editor-message').className='error';return;}
  drafts=next;$('#editor').close();render(false);notify('Entwurf auf diesem Gerät gespeichert. Noch nicht versendet.');
});
$('#download-draft').addEventListener('click',()=>{const d=formDraft();const text=`# ${d.title||'Entwurf'}\n\nArt: ${kindName[d.kind]}\nBereich: ${areaName(d.area)}\nStatus: lokaler Entwurf; nicht beauftragt\n\n${d.body}\n\nVor Ausführung: bestehende Task-ID, aktuellen Stand und Aufgabenübergabe abgleichen. Live unverändert.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=link('',url);a.download='gradecrew-entwurf.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
function editorDirty(){return JSON.stringify([...new FormData($('#editor-form'))])!==editorBaseline;}
function requestEditorClose(){
  if(editorDirty()&&!closeRequested){closeRequested=true;$('#editor-message').replaceChildren(el('p','','Deine Änderungen sind noch nicht gespeichert.'),button('Änderungen verwerfen',()=>$('#editor').close(),'button quiet'));return;}
  if(!editorDirty())$('#editor').close();
}
$('#close-editor').addEventListener('click',requestEditorClose);
$('#editor').addEventListener('cancel',event=>{if(editorDirty()){event.preventDefault();requestEditorClose();}});
$('#editor-form').addEventListener('input',()=>{if(closeRequested){closeRequested=false;$('#editor-message').textContent='';}});
window.addEventListener('beforeunload',event=>{if($('#editor').open&&editorDirty()){event.preventDefault();event.returnValue='';}});
$('.skip').addEventListener('click',event=>{event.preventDefault();$('#content').focus();});
$('#new-button').addEventListener('click',()=>openEditor());
function search(){const results=$('#search-results'),q=$('#global-search').value;results.replaceChildren();const term=q.trim().toLocaleLowerCase('de');for(const d of domains){if(JSON.stringify([d,recordsFor(inventory,d.id)]).toLocaleLowerCase('de').includes(term)){const a=link(d.name,`#/arbeit/landkarte/${d.id}`,'source');a.addEventListener('click',()=>$('#search-dialog').close());results.append(a);}}const matches=searchTopics(topics,q);matches.forEach(t=>{const a=topicRow(t);a.addEventListener('click',()=>$('#search-dialog').close());results.append(a);});const locals=drafts.filter(d=>`${d.title} ${d.body}`.toLocaleLowerCase('de').includes(q.trim().toLocaleLowerCase('de')));locals.forEach(d=>results.append(button(`${d.title} · lokaler Entwurf`,()=>{$('#search-dialog').close();openEditor(d);},'source search-result')));if(!results.children.length)results.append(empty('Keine Treffer','Versuche einen anderen Begriff.'));}
function openSearch(){$('#global-search').value='';search();$('#search-dialog').showModal();$('#global-search').focus();}
$('#global-search').addEventListener('input',search);$('#search-button').addEventListener('click',openSearch);$('#close-search').addEventListener('click',()=>$('#search-dialog').close());
const mobile=window.matchMedia('(max-width:760px)');
function syncMenu(){const open=$('#sidebar').classList.contains('open');const hidden=mobile.matches&&!open;$('#sidebar').inert=hidden;$('#sidebar').setAttribute('aria-hidden',String(hidden));$('#menu').setAttribute('aria-expanded',String(open));$('#menu').setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');}
function closeMenu(){$('#sidebar').classList.remove('open');syncMenu();}
$('#close-menu').addEventListener('click',()=>{closeMenu();$('#menu').focus();});
mobile.addEventListener('change',closeMenu);
$('#menu').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');syncMenu();if(open)$('#primary a').focus();});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&!$('#editor').open){e.preventDefault();if(!$('#search-dialog').open)openSearch();}if(e.key==='Escape'&&$('#sidebar').classList.contains('open')){closeMenu();$('#menu').focus();}});
document.addEventListener('click',e=>{if($('#sidebar').classList.contains('open')&&!$('#sidebar').contains(e.target)&&!$('#menu').contains(e.target))closeMenu();});
function render(focus=true){runtimeOff();runtimeOff=()=>{};route=parseRoute(location.hash);navigation();$('#content').replaceChildren();if(route.page==='eingang')inbox();else if(route.page==='wissen')knowledge();else if(route.page==='verbindungen')connections();else if(route.page==='arbeit'){if(route.section==='releases')runtimeOff=mountReleases($('#content'),central,(id,brief)=>openEditor(null,{area:domains.find(x=>x.id===id)?.area||'tech',...brief}),{tab:route.id,area:route.tab==='ueberblick'?'all':route.tab});else if(route.section==='stand')runtimeOff=mountCompanyStatus($('#content'),central,(id,brief)=>openEditor(null,{area:domains.find(x=>x.id===id)?.area||'tech',...brief}));else if(route.section==='akte')portfolioDetail();else if(route.section==='landkarte'&&route.id)today();else if(route.section==='abdeckung'){coverageView();runtimeOff=mountSources($('#content'),central);}else if(route.section==='thema')detail();else if(route.section==='ziele')goals();else if(route.section==='qualitaet')quality();else if(route.section==='bereich')area();else if(route.section==='netz')network();else if(route.section==='landkarte'||!route.section)today();else themes();}else today();if(route.section==='landkarte'&&route.id&&$('#content .focus-inspector')){const off1=mountDomainSources($('#content .focus-inspector'),central,route.id,primaryDomain),off2=mountAreaAudit($('#content .focus-inspector'),central,route.id,route.tab!=='ueberblick');runtimeOff=()=>{off1();off2();};}document.title=`${$('#content h1')?.textContent||'Firmenzentrale'} · GradeCrew`;closeMenu();if(focus){$('#content').focus({preventScroll:true});window.scrollTo(0,0);}}
window.addEventListener('hashchange',()=>render());
window.addEventListener('storage',event=>{if(event.key==='gradecrew-company-personal-drafts-v1'){const latest=readDrafts(storage);if(!$('#editor').open){draftsState=latest;drafts=latest.items;render(false);}else notify('Entwürfe wurden in einer anderen Ansicht geändert.');}});
render(false);

const brandImage=el('img','brand-logo');brandImage.src=`/${brandManifest.root}/${brandManifest.brand.primary}`;brandImage.alt='';brandImage.width=54;brandImage.height=54;$('.brandmark').replaceWith(brandImage);
const favicon=el('link');favicon.rel='icon';favicon.type='image/svg+xml';favicon.href=`/${brandManifest.root}/${brandManifest.brand.icon}`;document.head.append(favicon);

const sendTask=button('Bearbeitung starten',async()=>{
 if(!$('#editor-form').reportValidity())return;
 const d=formDraft(),payload={title:d.title,body:d.body,area:d.area};
 sendTask.disabled=true;$('#editor-message').textContent='Auftrag wird dauerhaft angenommen …';
 try{
  const old=storage?.getItem('gradecrew-pending-dispatch-v1');let pending=old?JSON.parse(old):null;
  if(pending&&JSON.stringify(pending.payload)!==JSON.stringify(payload))throw Error('Eine frühere Übermittlung ist noch ungeklärt. Zuerst den Eingang prüfen; der alte Auftrag wird nicht ersetzt.');
  if(!pending){pending={requestId:crypto.randomUUID(),payload};if(!storage)throw Error('Lokaler Speicher fehlt. Sicherer Versand nicht möglich.');storage.setItem('gradecrew-pending-dispatch-v1',JSON.stringify(pending));}
  const result=await central.post('/api/tasks',{requestId:pending.requestId,...pending.payload});
  storage.removeItem('gradecrew-pending-dispatch-v1');if(central.state&&!central.state.requests.some(r=>r.id===result.id))central.state.requests.unshift(result);$('#editor').close();location.hash='#/eingang';notify('Auftrag angenommen. Bearbeitung und Ergebnis stehen im Eingang.');
 }catch(e){$('#editor-message').textContent=e.message+' Bei unklarer Antwort denselben Text erneut senden; die Kennung bleibt gleich.';}
 finally{sendTask.disabled=!central.state?.connected;}
},'button primary');
sendTask.id='send-task';$('#editor .dialog-foot').append(sendTask);
central.subscribe((state,error)=>{
 sendTask.disabled=!state?.connected||Boolean(error);
 document.querySelector('.footnote span').textContent=error?'Verbindung unterbrochen · letzter bekannter Stand':state?.connected?'Codex verbunden · Live unverändert':'Chatanschluss wird geprüft';
 // Keep uncertain submissions bound to their original ID until the dialog acknowledges them.

});
central.poll();
