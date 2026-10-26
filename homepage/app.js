import {gradeAll,gradeTask} from './grading.mjs';
import {historyArt,circuitArt,butterflyArt} from './illustrations.js';

for (const [id,intent] of [['loginLink','login'],['registerLink','register']]) {
  const link=document.getElementById(id);
  if(location.protocol==='https:'&&link){link.href=new URL('/workspace.html?intent='+intent,location.origin).href;link.removeAttribute('target');link.removeAttribute('rel');}
}

const copy = {
  de:{productNote:'Mit „Tests“ meinen wir digitale Aufgaben und Übungen. Die Lehrkraft entscheidet, ob und wie sie diese im Unterricht einsetzt und bewertet.',support:'Support',studentEntry:'Schülerzugang',privacy:'Datenschutz',legal:'Impressum',tagline:'Tests. Einfach digital.',login:'Anmelden',register:'Konto erstellen',audience:'FÜR LEHRKRÄFTE ALLER SCHULFORMEN',hero:'Gute Tests<br>entstehen im Team.',lead:'<span>Deine Idee wird ein digitaler Test.</span><span>Die Crew hilft beim Erstellen, Verbessern und Auswerten.</span>',preview:'INTERAKTIVE VORSCHAU',testTitle:'GradeCrew Testübersicht'},
  en:{productNote:'By “tests” we mean digital tasks and exercises. The teacher decides whether and how to use and assess them in class.',support:'Support',studentEntry:'Student access',privacy:'Privacy',legal:'Legal notice',tagline:'Tests. Simply digital.',login:'Sign in',register:'Create account',audience:'FOR TEACHERS AT EVERY SCHOOL LEVEL',hero:'Great tests<br>take a team.',lead:'<span>Turn your idea into a digital test.</span><span>The crew helps you create, improve and review it.</span>',preview:'INTERACTIVE PREVIEW',testTitle:'GradeCrew Test Overview'}
};
const tasks = [
  {id:'coordinate',subject:['Mathematik','Maths'],label:['Koordinaten','Coordinates'],title:['Setze A auf (−2 | 1) und B auf (2 | 3).','Plot A at (−2, 1) and B at (2, 3).']},
  {id:'audio',subject:['Hören','Listening'],label:['Höraufgabe','Audio task'],title:['Hör zu und wähle die gehörte Schreibweise.','Listen and select the spelling you hear.']},
  {id:'markwords',subject:['Deutsch','Language arts'],label:['Wortarten','Word classes'],title:['Markiere Nomen, Verb und Adjektive im Satz.','Mark the nouns, verb and adjectives in the sentence.']},
  {id:'equation',subject:['Mathematik','Maths'],label:['Quadratische Gleichung','Quadratic equation'],title:['Bestimme die beiden Nullstellen der Funktion.','Find the two zeros of the function.']},
  {id:'plant',subject:['Biologie','Biology'],label:['Bild beschriften','Label an image'],title:['Beschrifte die vier Teile der Pflanze.','Label the four parts of the plant.']},
  {id:'history',subject:['Geschichte','History'],label:['Zeitstrahl','Timeline'],title:['Welches Ereignis gehört zu welchem Jahr?','Which event belongs to which year?']},
  {id:'music',subject:['Musik','Music'],label:['Gruppieren','Group items'],title:['Ordne die Instrumente ihren Familien zu.','Sort the instruments into their families.']},
  {id:'circuit',subject:['Physik','Physics'],label:['Stromkreise','Circuits'],title:['In welchen zwei Schaltungen leuchtet die Lampe?','In which two circuits does the bulb light up?']},
  {id:'butterfly',subject:['Biologie','Biology'],label:['Bildfolge','Picture sequence'],title:['Ordne die Entwicklung des Schmetterlings.','Put the butterfly life cycle in order.']},
  {id:'angleSet',subject:['Mathematik','Maths'],label:['Winkel einstellen','Set an angle'],title:['Stelle den Winkel auf 60° ein.','Set the angle to 60°.']}
];
const plantLabels = [['flower','Blüte','Flower'],['leaf','Blatt','Leaf'],['stem','Stängel','Stem'],['roots','Wurzel','Roots']];
const events = [
  ['charlemagne','Kaiserkrönung Karls des Großen','Charlemagne crowned emperor'],
  ['gutenberg','Buchdruck','Printing press'],
  ['sarajevo','Attentat von Sarajevo','Sarajevo assassination'],
  ['bastille','Sturm auf die Bastille','Storming of the Bastille'],
  ['wall','Mauerfall','Fall of the Berlin Wall']
];
const years = ['800','um 1450','1789','1914','1989'];
const instruments = [
  ['guitar','Gitarre','Guitar'],['violin','Geige','Violin'],
  ['flute','Querflöte','Flute'],['trumpet','Trompete','Trumpet'],
  ['drum','Trommel','Drum'],['xylophone','Xylofon','Xylophone']
];
const musicGroups = [['strings','Saiteninstrumente','String instruments'],['winds','Blasinstrumente','Wind instruments'],['percussion','Schlaginstrumente','Percussion']];
const lifeAlt = {
  egg:['Eier an einem Blatt','Eggs on a leaf'],
  caterpillar:['Raupe auf einem Blatt','Caterpillar on a leaf'],
  chrysalis:['Puppe an einem Zweig','Chrysalis on a branch'],
  butterfly:['Ausgewachsener Schmetterling','Adult butterfly']
};

let lang = /^en(?:-|$)/i.test(new URLSearchParams(location.search).get('lang') || '') ? 'en' : 'de';
let active = 0;
let currentPoint = 'A';
let currentWordTool = 'noun';
let picked = null;
let pickedOrderIndex = null;
let state = {butterflyOrder:['chrysalis','egg','butterfly','caterpillar'],pointWeights:{}};
let wheelUsed = false, wheelSum = 0, wheelTimer = 0, touchY = null;
const root = document.getElementById('testContent');
const scroller = document.getElementById('testScroll');
const nav = document.getElementById('overviewGrid');
const results = document.getElementById('resultsPanel');
const tr = (de,en) => lang === 'de' ? de : en;
const loc = pair => pair[lang === 'de' ? 0 : 1];
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt = value => Number(value).toLocaleString(lang==='de'?'de-DE':'en-US',{maximumFractionDigits:2});
const numeric = value => {const clean=String(value??'').replace(',','.').replace('−','-').trim();return /^-?\d+(?:\.\d+)?$/.test(clean)?Number(clean):null};
const task = () => tasks[active];
const taskTitle = i => loc(tasks[i].label);
const labelFor = (list,id) => {const item=list.find(row=>row[0]===id);return item?item[lang==='de'?1:2]:''};

function coordinateSvg() {
  const point = state.coords || {}, X=x=>180+x*32, Y=y=>150-y*32;
  let lines='';
  for(let i=-4;i<=4;i++) {
    lines += `<line x1="${X(i)}" y1="22" x2="${X(i)}" y2="278" class="${i?'grid-line':'axis-line'}"/><line x1="52" y1="${Y(i)}" x2="308" y2="${Y(i)}" class="${i?'grid-line':'axis-line'}"/>`;
    if(i)lines+=`<text x="${X(i)-4}" y="167">${i}</text><text x="166" y="${Y(i)+4}">${i}</text>`;
  }
  let marks='';
  for(const name of ['A','B']) {
    const x=numeric(point[name]?.x), y=numeric(point[name]?.y);
    if(Number.isInteger(x)&&Number.isInteger(y)&&Math.abs(x)<=4&&Math.abs(y)<=4)
      marks+=`<circle cx="${X(x)}" cy="${Y(y)}" r="8" fill="${name==='A'?'#2869c8':'#e6844f'}" stroke="white" stroke-width="2"/><text x="${X(x)+10}" y="${Y(y)-9}" class="point-label">${name}</text>`;
  }
  const position=point[currentPoint] ? `${point[currentPoint].x} | ${point[currentPoint].y}` : tr('noch nicht gesetzt','not placed yet');
  return `<svg data-grid="coordinate" tabindex="0" class="graph-svg" viewBox="40 10 280 280" role="application" aria-label="${tr('Koordinatensystem; gewählten Punkt mit Pfeiltasten verschieben','Coordinate plane; move the selected point with arrow keys')}. ${currentPoint}: ${position}">${lines}${marks}<rect x="52" y="22" width="256" height="256" fill="transparent"/></svg>`;
}

function protractor(degrees) {
  let ticks='';const x=(r,v)=>180+v*Math.cos(r),y=(r,v)=>145-v*Math.sin(r);
  for(let i=0;i<=180;i+=5){const r=i*Math.PI/180;const inner=i%10?100:94;ticks+=`<line x1="${x(r,inner)}" y1="${y(r,inner)}" x2="${x(r,108)}" y2="${y(r,108)}" stroke="${i%10?'#83a6c8':'#426eaa'}" stroke-width="${i%10?1:1.5}"/>`;if(i%30===0)ticks+=`<text x="${x(r,79)}" y="${y(r,79)+4}" text-anchor="middle" class="degree-label">${i}</text>`}
  const r=degrees*Math.PI/180, hx=x(r,119),hy=y(r,119);
  return `<svg data-angle-drag="1" class="angle-svg" viewBox="0 0 360 185" role="application" aria-label="${tr('Winkelschenkel ziehen oder den Regler mit Pfeiltasten bewegen','Drag the angle arm or use arrow keys on the slider')}"><path d="M72 145 A108 108 0 0 1 288 145 L180 145Z" fill="#e8f3ff" stroke="#7ca5ce" stroke-width="2"/>${ticks}<line x1="61" y1="145" x2="299" y2="145" stroke="#426eaa" stroke-width="2"/><line x1="180" y1="145" x2="302" y2="145" stroke="#294d7f" stroke-width="3"/><line x1="180" y1="145" x2="${hx}" y2="${hy}" stroke="#df8251" stroke-width="4" stroke-linecap="round"/><circle cx="180" cy="145" r="5" fill="#294d7f"/><circle cx="${hx}" cy="${hy}" r="11" fill="#e98f58" stroke="white" stroke-width="3"/></svg>`;
}

function choices(id,options,multi=false) {
  return `<div class="choice-row">${options.map((row,i)=>`<button type="button" class="choice ${(state[id]||[]).includes(i)?'selected':''}" data-choice="${id}" data-index="${i}" data-multi="${multi?1:0}" aria-pressed="${(state[id]||[]).includes(i)}">${esc(labelFor(options,String(i))||loc(row))}</button>`).join('')}</div>`;
}

function plantWidget() {
  const assigned=state.plantSlots||[];
  const targets=[['17%','82%'],['48%','17%'],['68%','82%'],['86%','17%']];
  const guide=`<svg class="plant-leaders" viewBox="0 0 600 330" preserveAspectRatio="none" aria-hidden="true"><path d="M435 56 L347 72 M164 158 L260 171 M435 224 L305 218 M164 284 L297 282"/><circle cx="347" cy="72" r="4"/><circle cx="260" cy="171" r="4"/><circle cx="305" cy="218" r="4"/><circle cx="297" cy="282" r="4"/></svg>`;
  return `<div class="plant-widget"><div class="plant-stage"><img class="botanical-art" src="/homepage/assets/cosmos-botanical-v1.png" alt="${tr('Kosmeenpflanze mit Blüte, Blättern, Stängel und Wurzeln','Cosmos plant with flower, leaves, stem and roots')}">${guide}${targets.map(([top,left],i)=>`<button type="button" class="plant-target ${assigned[i]?'filled':''}" data-slot-kind="plant" data-slot="${i}" style="top:${top};left:${left}" aria-label="${tr('Ziel','Target')} ${i+1}: ${assigned[i]?labelFor(plantLabels,assigned[i])+tr(', zum Entfernen antippen',', tap to remove'):tr('leer','empty')}">${assigned[i]?`${esc(labelFor(plantLabels,assigned[i]))}<span aria-hidden="true"> ×</span>`:tr('Ablegen','Place')}</button>`).join('')}</div><div class="chip-bank">${plantLabels.map(([id,de,en])=>`<button type="button" draggable="true" data-pick="plant" data-id="${id}" class="label-chip ${picked?.kind==='plant'&&picked.id===id?'active':''} ${assigned.includes(id)?'assigned':''}" aria-pressed="${picked?.kind==='plant'&&picked.id===id}">${esc(tr(de,en))}</button>`).join('')}</div><p class="micro-instruction">${tr('Begriff wählen, im Bild ablegen; belegtes Feld antippen zum Entfernen.','Choose a term and place it; tap an occupied field to remove it.')}</p></div>`;
}

function historyWidget() {
  const assigned=state.historySlots||[];
  return `<div class="history-widget"><div class="history-bank">${events.map(([id,de,en])=>`<button type="button" draggable="true" data-pick="history" data-id="${id}" class="history-card ${picked?.kind==='history'&&picked.id===id?'active':''} ${assigned.includes(id)?'assigned':''}" aria-pressed="${picked?.kind==='history'&&picked.id===id}">${historyArt(id)}<span>${esc(tr(de,en))}</span></button>`).join('')}</div><div class="timeline-viewport"><div class="timeline" role="group" aria-label="${tr('Historischer Zeitstrahl','Historical timeline')}"><div class="timeline-axis" aria-hidden="true"></div>${years.map((year,i)=>`<div class="timeline-stop ${i%2?'below':'above'}"><button type="button" class="history-slot ${assigned[i]?'filled':''}" data-slot-kind="history" data-slot="${i}" aria-label="${year}: ${assigned[i]?labelFor(events,assigned[i])+tr(', zum Entfernen antippen',', tap to remove'):tr('leer','empty')}"><span>${assigned[i]?`${esc(labelFor(events,assigned[i]))}<b aria-hidden="true"> ×</b>`:tr('Ablegen','Place')}</span></button><i aria-hidden="true"></i><strong>${year}</strong></div>`).join('')}</div></div><p class="micro-instruction">${tr('Bild wählen und dem Jahr zuordnen. Belegung antippen, um sie zu lösen.','Choose a picture and assign it to a year. Tap a placed event to remove it.')}</p></div>`;
}

function musicWidget() {
  const assigned=state.musicGroups||{};
  return `<div class="music-widget"><div class="instrument-bank">${instruments.map(([id,de,en])=>`<button type="button" draggable="true" data-pick="music" data-id="${id}" class="instrument-card ${picked?.kind==='music'&&picked.id===id?'active':''} ${assigned[id]?'assigned':''}" aria-pressed="${picked?.kind==='music'&&picked.id===id}">${esc(tr(de,en))}</button>`).join('')}</div><div class="music-bins">${musicGroups.map(([id,de,en])=>`<div class="music-group"><button type="button" class="music-bin" data-slot-kind="music" data-slot="${id}"><strong>${esc(tr(de,en))}</strong><span>${tr('Hier zuordnen','Place here')}</span></button><div class="assigned-terms">${Object.entries(assigned).filter(([,group])=>group===id).map(([item])=>`<button type="button" data-unassign="music" data-id="${item}" aria-label="${labelFor(instruments,item)} ${tr('entfernen','remove')}">${esc(labelFor(instruments,item))} ×</button>`).join('')}</div></div>`).join('')}</div><p class="micro-instruction">${tr('Begriff wählen und einer Gruppe zuordnen; × entfernt ihn wieder.','Choose a term and assign it to a group; × removes it.')}</p></div>`;
}

function circuitWidget() {
  const checked=Boolean(state.circuitChecked),selected=state.circuit||[];
  return `<div class="circuit-widget"><div class="circuit-grid">${[0,1,2,3].map(i=>`<button type="button" data-circuit="${i}" class="circuit-card ${selected.includes(i)?'selected':''} ${checked&&(i===0||i===3)?'lit':''}" aria-pressed="${selected.includes(i)}"><span class="circuit-letter">${'ABCD'[i]}</span>${circuitArt(i,checked&&(i===0||i===3))}<span class="circuit-state">${selected.includes(i)?tr('Gewählt','Selected'):tr('Auswählen','Select')}</span></button>`).join('')}</div><div class="circuit-actions"><button type="button" class="local-check" data-check-circuit>${tr('Diese Aufgabe prüfen','Check this task')}</button>${checked?`<span class="circuit-explanation">${tr('A und D: geschlossen. B: Schalter offen. C: beide Kontakte am selben Pol.','A and D: closed. B: open switch. C: both contacts on one terminal.')}</span>`:''}</div></div>`;
}

function butterflyWidget() {
  const order=state.butterflyOrder||['chrysalis','egg','butterfly','caterpillar'];
  return `<div class="seahorse-widget"><div class="seahorse-grid">${order.map((scene,i)=>`<div class="scene-wrap"><button type="button" draggable="true" data-order-index="${i}" class="scene-card ${pickedOrderIndex===i?'active':''}" aria-label="${tr('Position','Position')} ${i+1}: ${loc(lifeAlt[scene])}" aria-pressed="${pickedOrderIndex===i}"><span class="scene-number">${i+1}</span>${butterflyArt(scene)}</button><div class="scene-actions"><button type="button" data-order-move="up" data-index="${i}" ${i===0?'disabled':''} aria-label="${tr('Bild nach links verschieben','Move image left')}">←</button><button type="button" data-order-move="down" data-index="${i}" ${i===3?'disabled':''} aria-label="${tr('Bild nach rechts verschieben','Move image right')}">→</button></div></div>`).join('')}</div><p class="micro-instruction">${tr('Zwei Bilder antippen, um sie zu tauschen.','Tap two pictures to swap them.')}</p></div>`;
}

function widget(id) {
  switch(id) {
    case 'coordinate':return `<div class="graph-layout coordinate-layout"><div class="graph-host">${coordinateSvg()}</div><div class="point-controls"><div class="point-switch"><button type="button" class="point-select point-a ${currentPoint==='A'?'active':''}" data-pointpick="A" aria-pressed="${currentPoint==='A'}">A</button><button type="button" class="point-select point-b ${currentPoint==='B'?'active':''}" data-pointpick="B" aria-pressed="${currentPoint==='B'}">B</button></div></div></div>`;
    case 'audio':return `<div class="audio-question"><div class="audio-board audio-only"><span class="audio-symbol" aria-hidden="true">◖))</span><div class="audio-copy"><strong>${tr('Remy liest vor','Remy reads aloud')}</strong><small>${tr('Du kannst erneut anhören','You can replay the audio')}</small></div><button type="button" class="audio-play" data-audio="toggle">▶ <span>${tr('Anhören','Listen')}</span></button><audio id="sampleAudio" preload="metadata" src="${lang==='de'?'/homepage/assets/remy-gradecrew-de-v8.wav':'/homepage/assets/remy-gradecrew-en.mp3'}"></audio></div>${choices(id,[['GradeCrew','GradeCrew'],['GreatCrew','GreatCrew'],['GradeCrue','GradeCrue'],['CrateCrew','CrateCrew']])}</div>`;
    case 'markwords': {
      const words=lang==='de'?[['Die','the'],['neugierige','curious'],['Füchsin','fox'],['entdeckt','discovers'],['im','in'],['alten','old'],['Schuppen','shed'],['eine','a'],['geheimnisvolle','mysterious'],['Kiste.','box']]:[['The','the'],['curious','curious'],['fox','fox'],['discovers','discovers'],['a','a'],['mysterious','mysterious'],['box','box'],['in','in'],['the','the2'],['old','old'],['shed.','shed']];
      return `<div class="wordclass-board"><div class="wordclass-tools">${[['noun','Nomen','Noun'],['verb','Verb','Verb'],['adj','Adjektiv','Adjective']].map(([key,de,en])=>`<button type="button" class="word-tool role-${key} ${currentWordTool===key?'active':''}" data-wordtool="${key}" aria-pressed="${currentWordTool===key}">${tr(de,en)}</button>`).join('')}</div><div class="wordclass-sentence">${words.map(([word,key])=>`<button type="button" class="word-token ${state.wordClass?.[key]?'marked-'+state.wordClass[key]:''}" data-wordclass="${key}" aria-pressed="${Boolean(state.wordClass?.[key])}">${esc(word)}</button>`).join(' ')}</div></div>`;
    }
    case 'equation':return `<div class="equation-widget"><div class="equation-main"><span class="equation-function">f(x)</span> = x² − 5x + 6</div><p class="equation-prompt">${tr('Für welche zwei Werte von x gilt f(x) = 0? Trage beide Nullstellen ein.','For which two values of x is f(x) = 0? Enter both zeros.')}</p><div class="equation-inputs"><label>x₁ <input type="text" inputmode="decimal" data-equation="first" value="${esc(state.equation?.first??'')}" placeholder="${tr('Erste Nullstelle','First zero')}" autocomplete="off"></label><label>x₂ <input type="text" inputmode="decimal" data-equation="second" value="${esc(state.equation?.second??'')}" placeholder="${tr('Zweite Nullstelle','Second zero')}" autocomplete="off"></label></div></div>`;
    case 'plant':return plantWidget();
    case 'history':return historyWidget();
    case 'music':return musicWidget();
    case 'circuit':return circuitWidget();
    case 'butterfly':return butterflyWidget();
    case 'angleSet':return `<div class="angle-widget"><div class="angle-board" data-angle-board>${protractor(Number(state.angleSet??20))}</div><input class="range-control angle-set-range" type="range" min="0" max="180" step="1" value="${state.angleSet??20}" data-range="angleSet" aria-label="${tr('Winkel einstellen, Pfeiltasten ändern um ein Grad','Set angle, arrow keys change by one degree')}"><p class="micro-instruction">${tr('Schenkel ziehen oder Regler verwenden.','Drag the arm or use the slider.')}</p></div>`;
    default:return '';
  }
}

function updateNav() {
  document.getElementById('currentMeta').textContent=tr('Aufgabe ','Task ')+(active+1)+tr(' von ',' of ')+tasks.length+' · '+taskTitle(active);
  document.getElementById('footerCount').textContent=String(active+1).padStart(2,'0')+' / '+tasks.length;
  document.getElementById('progressFill').style.width=((active+1)/tasks.length*100)+'%';
  nav.innerHTML=tasks.map((item,i)=>`<button type="button" data-go="${i}" class="${i===active?'active':''} ${gradeTask(item.id,state,lang).attempted?'attempted':''}" aria-label="${tr('Aufgabe','Task')} ${i+1}: ${esc(taskTitle(i))}" ${i===active?'aria-current="step"':''}>${i+1}</button>`).join('');
}

function renderTask() {
  const item=task(),score=state.evaluated?gradeTask(item.id,state,lang):null;
  root.innerHTML=`<article class="task featured" id="task-${item.id}"><div class="task-top"><span class="task-index">${String(active+1).padStart(2,'0')}</span><span class="task-type">${esc(loc(item.subject))} / ${esc(loc(item.label))}</span></div><h4>${esc(loc(item.title))}</h4><div class="widget">${widget(item.id)}</div>${score?.attempted?`<div class="answer-feedback ${score.max>0&&score.points===score.max?'full':score.points?'partial':'zero'}"><strong>${fmt(score.points)} / ${fmt(score.max)} ${tr('Punkte','points')}</strong><span>${esc(score.solution)}</span></div>`:''}</article>`;
  updateNav();
}

function renderResults() {
  const result=gradeAll(state,lang);
  const footerScore=document.getElementById('footerScore');
  footerScore.hidden=!state.evaluated;
  footerScore.textContent=tr('Gesamt: ','Total: ')+fmt(result.points)+' / '+fmt(result.max)+' '+tr('Punkte','points');
  document.getElementById('resultsTitle').textContent=tr('Beispielauswertung','Sample grading');
  document.getElementById('resultsBody').innerHTML=`<div class="score-hero"><span class="score-number">${fmt(result.points)}<small> / ${fmt(result.max)}</small></span><strong>${tr('Demopunkte','Demo points')}</strong><p>${result.answered} ${tr('von','of')} ${tasks.length} ${tr('Aufgaben bearbeitet','tasks attempted')}</p></div><p class="result-intro">${tr('Punktevorschläge pro Aufgabe anpassen. Die Auswertung aktualisiert sich sofort.','Adjust the suggested points per task. The score updates immediately.')}</p><div class="result-list">${result.items.map((item,i)=>`<div class="result-entry"><button type="button" data-resultgo="${i}"><span class="result-index">${i+1}</span><span>${esc(taskTitle(i))}</span><strong>${item.attempted?fmt(item.points)+' / '+fmt(item.max):tr('offen','open')}</strong></button><label class="point-weight">${tr('Max. Punkte','Max. points')}<input type="number" min="0" max="20" step="0.5" data-pointweight="${item.id}" value="${item.max}" aria-label="${tr('Maximale Punkte für','Maximum points for')} ${esc(taskTitle(i))}"></label></div>`).join('')}</div>`;
}

function render() {
  document.documentElement.lang=lang;
  document.querySelectorAll('#loginLink,#registerLink,.student-entry').forEach(link=>{
    const target=new URL(link.getAttribute('href'),location.href);
    if(lang==='en')target.searchParams.set('lang','en');else target.searchParams.delete('lang');
    link.href=target.pathname+target.search+target.hash;
  });
  document.title=tr('GradeCrew · Testübersicht','GradeCrew · Test Overview');
  document.querySelector('.brand').setAttribute('aria-label',tr('GradeCrew Start','GradeCrew home'));
  document.querySelector('.crew-photo').alt=tr('Coco, Remy, Emmi und Wilma – die GradeCrew','Coco, Remy, Emmi and Wilma – the GradeCrew');
  document.querySelector('.showcase').setAttribute('aria-label',tr('GradeCrew Testübersicht','GradeCrew test overview'));
  scroller.setAttribute('aria-label',tr('Interaktive Testübersicht','Interactive test overview'));
  nav.setAttribute('aria-label',tr('Aufgaben 1 bis 10','Tasks 1 to 10'));
  document.getElementById('resultsClose').setAttribute('aria-label',tr('Ergebnis schließen','Close results'));
  document.querySelectorAll('[data-i18n]').forEach(element=>element.innerHTML=copy[lang][element.dataset.i18n]);
  document.querySelectorAll('.lang').forEach(element=>{const on=element.dataset.lang===lang;element.classList.toggle('is-active',on);element.setAttribute('aria-pressed',String(on))});
  document.getElementById('evaluateBtn').textContent=tr('Test auswerten','Grade test');
  renderTask();renderResults();
}

function go(index) {
  active=Math.max(0,Math.min(tasks.length-1,index));
  picked=null;pickedOrderIndex=null;
  results.hidden=true;
  renderTask();
  scroller.scrollTop=0;
}

function dirty() {
  if(state.evaluated){state.evaluated=false;results.hidden=true;document.getElementById('footerScore').hidden=true;root.querySelector('.answer-feedback')?.remove()}
}

function setPoint(group,name,x,y) {
  dirty();state[group]??={};state[group][name]={x,y};renderTask();
}

function assignSlot(kind,slot,id) {
  if(!id)return;
  dirty();
  if(kind==='plant'||kind==='history'){
    const key=kind==='plant'?'plantSlots':'historySlots';const values=[...(state[key]||[])];
    for(let i=0;i<values.length;i++)if(values[i]===id)values[i]=null;
    values[Number(slot)]=id;state[key]=values;
  } else if(kind==='music'){
    state.musicGroups??={};state.musicGroups[id]=slot;
  }
  picked=null;renderTask();
}

function clearSlot(kind,slot,id) {
  dirty();
  if(kind==='music')delete state.musicGroups?.[id];
  else {const key=kind==='plant'?'plantSlots':'historySlots';const values=[...(state[key]||[])];values[Number(slot)]=null;state[key]=values}
  renderTask();
}

function swapScenes(from,to) {
  if(from===to)return;
  dirty();const order=[...(state.butterflyOrder||[])];
  [order[from],order[to]]=[order[to],order[from]];
  state.butterflyOrder=order;state.butterflyTouched=true;pickedOrderIndex=null;renderTask();
}

function setAngleFromPointer(event) {
  const svg=root.querySelector('[data-angle-drag]');if(!svg)return;
  const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
  const local=p.matrixTransform(svg.getScreenCTM().inverse());
  const degrees=Math.max(0,Math.min(180,Math.round(Math.atan2(145-local.y,local.x-180)*180/Math.PI)));
  dirty();state.angleSet=String(degrees);
  root.querySelector('[data-angle-board]').innerHTML=protractor(degrees);
  root.querySelector('[data-range="angleSet"]').value=degrees;
  updateNav();
}

nav.addEventListener('click',event=>{const button=event.target.closest('[data-go]');if(button)go(Number(button.dataset.go))});
document.getElementById('evaluateBtn').addEventListener('click',()=>{state.evaluated=true;renderTask();renderResults();results.hidden=false;document.getElementById('resultsClose').focus()});
document.getElementById('resultsClose').addEventListener('click',()=>{results.hidden=true;scroller.focus()});
document.getElementById('resultsBody').addEventListener('click',event=>{const button=event.target.closest('[data-resultgo]');if(button)go(Number(button.dataset.resultgo))});
document.getElementById('resultsBody').addEventListener('change',event=>{const input=event.target.closest('[data-pointweight]');if(!input)return;const value=Number(input.value);state.pointWeights[input.dataset.pointweight]=Number.isFinite(value)?Math.max(0,Math.min(20,Math.round(value*2)/2)):2;renderTask();renderResults()});
document.querySelectorAll('.lang').forEach(button=>button.addEventListener('click',()=>{lang=button.dataset.lang;render()}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')results.hidden=true});

root.addEventListener('click',event=>{
  const audio=event.target.closest('[data-audio]');
  if(audio){const player=document.getElementById('sampleAudio');if(player.paused){player.currentTime=0;player.play().catch(()=>{});audio.innerHTML=`Ⅱ <span>${tr('Pause','Pause')}</span>`}else{player.pause();audio.innerHTML=`▶ <span>${tr('Anhören','Listen')}</span>`}player.onended=()=>audio.innerHTML=`▶ <span>${tr('Erneut anhören','Replay')}</span>`;return}
  const point=event.target.closest('[data-pointpick]');if(point){currentPoint=point.dataset.pointpick;renderTask();root.querySelector('[data-grid="coordinate"]')?.focus();return}
  const tool=event.target.closest('[data-wordtool]');if(tool){currentWordTool=tool.dataset.wordtool;renderTask();return}
  const word=event.target.closest('[data-wordclass]');if(word){dirty();state.wordClass??={};const key=word.dataset.wordclass;state.wordClass[key]=state.wordClass[key]===currentWordTool?null:currentWordTool;renderTask();return}
  const choice=event.target.closest('[data-choice]');if(choice){dirty();const id=choice.dataset.choice,index=Number(choice.dataset.index),list=state[id]||[];state[id]=choice.dataset.multi==='1'?(list.includes(index)?list.filter(value=>value!==index):[...list,index]):[index];renderTask();return}
  const check=event.target.closest('[data-check-circuit]');if(check){state.circuitChecked=true;renderTask();return}
  const circuit=event.target.closest('[data-circuit]');if(circuit){dirty();const index=Number(circuit.dataset.circuit),list=state.circuit||[];state.circuit=list.includes(index)?list.filter(value=>value!==index):[...list,index];state.circuitChecked=false;renderTask();return}
  const move=event.target.closest('[data-order-move]');if(move){const index=Number(move.dataset.index);swapScenes(index,index+(move.dataset.orderMove==='up'?-1:1));return}
  const order=event.target.closest('[data-order-index]');if(order){const index=Number(order.dataset.orderIndex);if(pickedOrderIndex===null){pickedOrderIndex=index;renderTask()}else if(pickedOrderIndex===index){pickedOrderIndex=null;renderTask()}else swapScenes(pickedOrderIndex,index);return}
  const pick=event.target.closest('[data-pick]');if(pick){picked={kind:pick.dataset.pick,id:pick.dataset.id};renderTask();return}
  const unassign=event.target.closest('[data-unassign]');if(unassign){clearSlot(unassign.dataset.unassign,null,unassign.dataset.id);return}
  const slot=event.target.closest('[data-slot-kind]');if(slot){const kind=slot.dataset.slotKind;if(picked?.kind===kind)assignSlot(kind,slot.dataset.slot,picked.id);else if(kind!=='music' && (state[kind==='plant'?'plantSlots':'historySlots']||[])[Number(slot.dataset.slot)])clearSlot(kind,slot.dataset.slot);return}
  const grid=event.target.closest('[data-grid="coordinate"]');if(grid){const p=grid.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const q=p.matrixTransform(grid.getScreenCTM().inverse());setPoint('coords',currentPoint,Math.max(-4,Math.min(4,Math.round((q.x-180)/32))),Math.max(-4,Math.min(4,Math.round((150-q.y)/32))));return}
});

root.addEventListener('input',event=>{
  const input=event.target;
  if(input.dataset.equation){dirty();state.equation??={};state.equation[input.dataset.equation]=input.value;updateNav()}
  if(input.dataset.range==='angleSet'){dirty();state.angleSet=input.value;root.querySelector('[data-angle-board]').innerHTML=protractor(Number(input.value));updateNav()}
});

root.addEventListener('keydown',event=>{
  const grid=event.target.closest('[data-grid="coordinate"]');
  if(!grid)return;
  const steps={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
  const step=steps[event.key];if(!step)return;
  event.preventDefault();event.stopPropagation();
  const point=state.coords?.[currentPoint]||{x:0,y:0};
  setPoint('coords',currentPoint,Math.max(-4,Math.min(4,Number(point.x)+step[0])),Math.max(-4,Math.min(4,Number(point.y)+step[1])));
  root.querySelector('[data-grid="coordinate"]').focus();
});

root.addEventListener('pointerdown',event=>{const svg=event.target.closest('[data-angle-drag]');if(svg){const board=svg.closest('[data-angle-board]');board.setPointerCapture(event.pointerId);setAngleFromPointer(event)}});
root.addEventListener('pointermove',event=>{const board=event.target.closest('[data-angle-board]');if(board?.hasPointerCapture(event.pointerId))setAngleFromPointer(event)});
root.addEventListener('dragstart',event=>{const pick=event.target.closest('[data-pick]');if(pick){event.dataTransfer.setData('text/plain',`${pick.dataset.pick}:${pick.dataset.id}`);event.dataTransfer.effectAllowed='move';return}const order=event.target.closest('[data-order-index]');if(order){event.dataTransfer.setData('text/plain',`order:${order.dataset.orderIndex}`);event.dataTransfer.effectAllowed='move'}});
root.addEventListener('dragover',event=>{if(event.target.closest('[data-slot-kind],[data-order-index]'))event.preventDefault()});
root.addEventListener('drop',event=>{const slot=event.target.closest('[data-slot-kind]'),order=event.target.closest('[data-order-index]');if(!slot&&!order)return;event.preventDefault();const raw=event.dataTransfer.getData('text/plain');const split=raw.indexOf(':');const kind=raw.slice(0,split),id=raw.slice(split+1);if(slot&&kind===slot.dataset.slotKind)assignSlot(kind,slot.dataset.slot,id);if(order&&kind==='order')swapScenes(Number(id),Number(order.dataset.orderIndex))});

scroller.addEventListener('wheel',event=>{
  if(scroller.dataset.pageFlow==='true')return;
  const direction=Math.sign(event.deltaY);if(!direction)return;
  clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelUsed=false;wheelSum=0},420);
  const canScroll=direction>0?scroller.scrollTop+scroller.clientHeight<scroller.scrollHeight-3:scroller.scrollTop>3;
  if(canScroll){wheelUsed=true;return}
  event.preventDefault();if(wheelUsed)return;
  wheelSum+=Math.abs(event.deltaY);
  if(wheelSum>=32){wheelUsed=true;wheelSum=0;go(active+direction)}
},{passive:false});
scroller.addEventListener('touchstart',event=>{if(scroller.dataset.pageFlow==='true')return;if(event.target.closest('button,input,[draggable]'))return;touchY=event.touches[0]?.clientY??null},{passive:true});
scroller.addEventListener('touchend',event=>{if(scroller.dataset.pageFlow==='true')return;if(touchY===null)return;const delta=touchY-(event.changedTouches[0]?.clientY??touchY);touchY=null;if(Math.abs(delta)>65&&scroller.scrollHeight<=scroller.clientHeight+4)go(active+Math.sign(delta))},{passive:true});
scroller.addEventListener('keydown',event=>{if(event.target!==scroller)return;if(event.key==='PageDown'||event.key==='ArrowDown'){event.preventDefault();go(active+1)}if(event.key==='PageUp'||event.key==='ArrowUp'){event.preventDefault();go(active-1)}});

render();
