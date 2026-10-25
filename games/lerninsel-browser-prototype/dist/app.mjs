import {compileLesson,checkAnswer,examples,types,replaceChoiceOptions} from './core.mjs';
import {createScene} from './scene.mjs';
const $=id=>document.getElementById(id),key='gradecrew.lerninsel.browser-probe.v1';
const h=(tag,text='',attrs={})=>{const e=document.createElement(tag);e.textContent=text;for(const [k,v] of Object.entries(attrs)){if(k==='class')e.className=v;else e.setAttribute(k,v);}return e;};
let draft=examples();try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Array.isArray(saved.tasks)&&saved.tasks.length===4)draft=saved;}catch{}
let selected=0,mode='teacher',round=null,solved=[],results=[],answer=[],compiled=compileLesson(draft),scene;
try{scene=createScene($('world'),i=>select(i));}catch(error){$('scene-fallback').hidden=false;$('world').dataset.renderer='unavailable';console.warn('3D unavailable; accessible task controls remain available.');}
function activeLesson(){return mode==='play'?round:draft;}
function save(){try{localStorage.setItem(key,JSON.stringify(draft));}catch{}}
function invalidate(){compiled=compileLesson(draft);$('approved').checked=false;save();renderValidation();renderLists();renderStudent();scene?.tasks(draft.tasks);}
function field(label,id,value,kind='input',attrs={}){const l=h('label','',{class:'field'});l.append(h('span',label));const e=h(kind,'',{id,...attrs});e.value=value??'';l.append(e);return l;}
function select(i){if(i<0||i>=activeLesson().tasks.length)return;selected=i;answer=activeLesson().tasks[i].type==='match'?{}:activeLesson().tasks[i].type==='measure'?0:[];$('feedback').textContent='';$('feedback').className='';$('next').hidden=true;renderLists();if(mode==='teacher')renderEditor();renderStudent();scene?.select(i);scene?.fill(0);}
function renderLists(){
 $('lesson-title').value=draft.title;$('world-title').textContent=activeLesson().title;
 $('task-list').replaceChildren();$('station-nav').replaceChildren();
 activeLesson().tasks.forEach((t,i)=>{
  const button=h('button',`${i+1}. ${types[t.type]||'Aufgabe'}`,{class:i===selected?'active':''});button.addEventListener('click',()=>select(i));$('task-list').append(button);
  const station=h('button',`${i+1}. ${t.subject}${mode==='play'&&solved[i]?' · gelöst':''}`,{class:[i===selected?'active':'',solved[i]&&mode==='play'?'solved':''].join(' ')});station.setAttribute('aria-pressed',String(i===selected));station.addEventListener('click',()=>select(i));$('station-nav').append(station);
 });
 $('round-status').textContent=mode==='teacher'?'Vorschau':`${solved.filter(Boolean).length} von ${round.tasks.length} gelöst`;
}
function renderEditor(){
 const t=draft.tasks[selected];$('editor-title').textContent=`Aufgabe ${selected+1} bearbeiten`;
 for(const name of ['subject','type','prompt','context'])$(name).value=t[name]??'';
 const box=$('type-fields');box.replaceChildren();
 if(t.type==='choice'){
  box.append(field('Antworten · eine pro Zeile','options',t.options?.join('\n')||'','textarea',{rows:4}));
  const choices=h('fieldset','',{class:'teacher-answers',id:'correct-choices'});choices.append(h('legend','Richtige Antworten'));box.append(choices);renderCorrectChoices();
  $('options').addEventListener('input',()=>{Object.assign(t,replaceChoiceOptions(t,$('options').value));renderCorrectChoices();invalidate();});
 }
 if(t.type==='measure'){
  const row=h('div','',{class:'row-fields'});row.append(field('Ganzes · Bechergröße','capacity',t.capacity,'input',{type:'number',min:.01,max:10000,step:'any'}));const unit=field('Einheit','unit','','select');unit.lastChild.append(h('option','Liter (L)',{value:'L'}),h('option','Milliliter (ml)',{value:'ml'}));unit.lastChild.value=t.unit;row.append(unit);box.append(row);
  const fraction=h('div','',{class:'row-fields'});fraction.append(field('Zähler · Zielanteil','numerator',t.numerator,'input',{type:'number',min:0,max:20}),field('Nenner · Abschnitte','denominator',t.denominator,'input',{type:'number',min:2,max:20}));box.append(fraction);
  box.append(h('p','Ein Beispiel: Bechergröße 2 L, Ziel 3/4. Die Runde verwendet dann 1,5 L als Zielmenge.',{class:'helper'}));
  for(const name of ['capacity','unit','numerator','denominator'])$(name).addEventListener('input',()=>{t[name]=name==='unit'?$(name).value:Number($(name).value);invalidate();});
 }
 if(t.type==='order'){
  box.append(field('Teile in einer richtigen Reihenfolge · eine Zeile pro Teil','items',t.items?.join('\n')||'','textarea',{rows:4}));
  const alternatives=(t.acceptedOrders||[]).slice(1).map(a=>a.map(i=>i+1).join(' ')).join('\n');box.append(field('Weitere richtige Reihenfolgen · optional','alternatives',alternatives,'textarea',{rows:2,placeholder:'Zum Beispiel: 3 2 1 4'}));box.append(h('p','Die erste Reihenfolge steht oben. Zusätzliche Reihenfolgen verwenden die Nummern der Teile; jede Zeile ist eine Alternative.',{class:'helper'}));
  const update=()=>{t.items=$('items').value.split('\n');t.acceptedOrders=[t.items.map((_,i)=>i),...$('alternatives').value.split('\n').filter(x=>x.trim()).map(x=>x.trim().split(/[ ,;]+/).map(n=>Number(n)-1))];invalidate();};$('items').addEventListener('input',update);$('alternatives').addEventListener('input',update);
 }
 if(t.type==='match'){
  box.append(field('Paare · links | rechts · ein Paar pro Zeile','pairs',(t.pairs||[]).map(p=>p.join(' | ')).join('\n'),'textarea',{rows:4}));box.append(h('p','Beispiel: tree | Baum. Beide Seiten müssen eindeutig sein.',{class:'helper'}));$('pairs').addEventListener('input',()=>{t.pairs=$('pairs').value.split('\n').map(row=>row.split('|').map(s=>s.trim()));invalidate();});
 }
}
function renderCorrectChoices(){const t=draft.tasks[selected],box=$('correct-choices');box.replaceChildren(h('legend','Richtige Antworten'));(t.options||[]).forEach((text,i)=>{const l=h('label'),e=h('input','',{type:'checkbox',value:i});e.checked=(t.correct||[]).includes(i);e.addEventListener('change',()=>{t.correct=[...box.querySelectorAll('input:checked')].map(c=>Number(c.value));invalidate();});l.append(e,document.createTextNode(text||`Antwort ${i+1} fehlt`));box.append(l);});}
function renderValidation(){
 const box=$('validation');box.replaceChildren();
 if(compiled.errors.length){const ul=h('ul','',{class:'errors'});compiled.errors.forEach(s=>ul.append(h('li',s)));box.append(ul);}else box.append(h('p',`Vier Aufgaben sind ausführbar. Prüfe jetzt ihre Bedeutung in der Vorschau.`,{class:'validation-ok'}));
 if(compiled.warnings.length){const ul=h('ul','',{class:'warnings'});compiled.warnings.forEach(s=>ul.append(h('li',s)));box.append(ul);}
 $('start').disabled=compiled.errors.length>0||!$('approved').checked;
 $('check').disabled=mode==='teacher'&&compiled.errors.length>0;
}
function renderStudent(){
 const t=activeLesson().tasks[selected];$('task-kind').textContent=`${t.subject} · ${types[t.type]||'Aufgabe'}`;$('task-counter').textContent=`Aufgabe ${selected+1} von ${activeLesson().tasks.length}`;$('student-prompt').textContent=t.prompt||'Deine Frage erscheint hier.';$('student-context').textContent=t.context||'';$('student-context').hidden=!t.context;
 const controls=$('answer-controls');controls.replaceChildren();$('check').textContent=mode==='teacher'?'Vorschauantwort prüfen':'Antwort prüfen';
 if(t.type==='choice'){
  if(!Array.isArray(answer))answer=[];const grid=h('div','',{class:'choice-grid'});
  (t.options||[]).forEach((text,i)=>{const b=h('button',text||'Leere Antwort',{class:answer.includes(i)?'chosen':''});b.setAttribute('aria-pressed',String(answer.includes(i)));b.addEventListener('click',()=>{answer=answer.includes(i)?answer.filter(n=>n!==i):[...answer,i];$('feedback').textContent='';renderStudent();});grid.append(b);});controls.append(grid);
 }
 if(t.type==='measure'){
  if(typeof answer!=='number')answer=0;const d=Number.isInteger(t.denominator)&&t.denominator>=2&&t.denominator<=20?t.denominator:10;answer=Math.max(0,Math.min(d,answer));
  const wrap=h('div','',{class:'measure'}),beakerWrap=h('div','',{class:'beaker-wrap'}),beaker=h('div','',{class:'beaker'}),water=h('div','',{class:'water'});water.style.height=`${answer/d*100}%`;beaker.append(water);const graduations=h('div','',{class:'graduations'});for(let i=0;i<=d;i++)graduations.append(h('span'));beaker.append(graduations);beakerWrap.append(beaker,h('span',`Ganzes: ${String(t.capacity).replace('.',',')} ${t.unit}`));wrap.append(beakerWrap);
  const area=h('div','',{class:'measure-actions'});const number=Math.round((Number(t.capacity)*answer/d)*1e9)/1e9;area.append(h('div',`${String(number).replace('.',',')} ${t.unit}`,{class:'amount',id:'amount'}),h('span',`${answer} von ${d} gleichen Abschnitten`));
  const slider=h('input','',{type:'range',min:0,max:d,step:1,value:answer,'aria-label':'Füllmenge in Skalenabschnitten'});slider.addEventListener('input',()=>{answer=Number(slider.value);renderStudent();scene?.fill(answer/d);});area.append(slider);
  const buttons=h('div','',{class:'measure-buttons'});for(const [name,delta] of [['Weniger',-1],['Mehr',1]]){const b=h('button',name);b.disabled=delta<0?answer<=0:answer>=d;b.addEventListener('click',()=>{answer=Math.max(0,Math.min(d,answer+delta));$('feedback').textContent='';renderStudent();scene?.fill(answer/d);});buttons.append(b);}area.append(buttons);wrap.append(area);controls.append(wrap);scene?.fill(answer/d);
 }
 if(t.type==='order'){
  if(!Array.isArray(answer))answer=[];const line=h('div','',{class:'order-line','aria-label':'Deine Reihenfolge'});answer.forEach((i,pos)=>{const b=h('button',t.items[i]||'Teil');b.setAttribute('aria-label',`${t.items[i]} zurücknehmen`);b.addEventListener('click',()=>{answer.splice(pos,1);renderStudent();});line.append(b);});if(!answer.length)line.append(h('p','Wähle die Teile unten in deiner Reihenfolge.'));
  const pool=h('div','',{class:'pool'});const order=(t.items||[]).map((_,i)=>i);if(order.length>2)order.push(order.shift());else order.reverse();order.forEach(i=>{if(answer.includes(i))return;const b=h('button',t.items[i]);b.addEventListener('click',()=>{answer.push(i);$('feedback').textContent='';renderStudent();});pool.append(b);});controls.append(line,pool);
 }
 if(t.type==='match'){
  if(!answer||Array.isArray(answer))answer={};const table=h('div','',{class:'matching'});(t.pairs||[]).forEach((pair,i)=>{const l=h('label'),s=h('select','',{'aria-label':`Passender Begriff für ${pair[0]||'linken Begriff'}`});s.append(h('option','Bitte zuordnen',{value:''}));(t.pairs||[]).map((_,j)=>j).reverse().forEach(j=>s.append(h('option',t.pairs[j][1]||'Leerer Begriff',{value:j})));s.value=answer[i]??'';s.addEventListener('change',()=>{answer[i]=s.value===''?'':Number(s.value);$('feedback').textContent='';});l.append(h('span',pair[0]||'Leerer Begriff'),s);table.append(l);});controls.append(table);
 }
 renderValidation();
}
function switchMode(next){mode=next;document.body.classList.toggle('playing',mode==='play');$('teacher').hidden=mode==='play';$('review').hidden=mode==='play';$('teacher-back').hidden=mode!=='play';$('reset-examples').hidden=mode==='play';$('finish').hidden=true;$('question').hidden=false;$('intro-copy').textContent=mode==='play'?'Deine Lehrkraftfragen sind jetzt auf der Insel. Jede Station lässt sich auch direkt auswählen.':'Passe vier Stationen an deinen Unterricht an. Prüfe die Aufgabe und probiere sie auf der Insel aus.';if(mode==='play')$('main').querySelector('h1').textContent=round.title;else $('main').querySelector('h1').textContent='Aus deinen Fragen wird eine Lernrunde.';renderLists();scene?.tasks(activeLesson().tasks);scene?.progress(mode==='play'?solved:[]);select(0);}
function start(){compiled=compileLesson(draft);if(compiled.errors.length||!$('approved').checked)return;round=compiled.lesson;solved=Array(round.tasks.length).fill(false);results=Array(round.tasks.length).fill(null);switchMode('play');$('question').scrollIntoView({block:'nearest',behavior:'smooth'});}
$('start').addEventListener('click',start);$('approved').addEventListener('change',renderValidation);
$('teacher-back').addEventListener('click',()=>switchMode('teacher'));$('edit-round').addEventListener('click',()=>switchMode('teacher'));
$('reset-examples').addEventListener('click',()=>{draft=examples();selected=0;invalidate();renderEditor();select(0);});
$('clear-task').addEventListener('click',()=>{draft.tasks[selected]={id:draft.tasks[selected].id,type:'choice',subject:'',prompt:'',context:'',options:['',''],correct:[]};invalidate();renderEditor();});
$('lesson-title').addEventListener('input',()=>{draft.title=$('lesson-title').value;invalidate();});
for(const name of ['subject','prompt','context'])$(name).addEventListener('input',()=>{draft.tasks[selected][name]=$(name).value;invalidate();});
$('type').addEventListener('change',()=>{const t=draft.tasks[selected];t.type=$('type').value;if(t.type==='measure'){t.capacity??=1;t.unit??='L';t.numerator??=3;t.denominator??=10;}if(t.type==='choice'){t.options??=['',''];t.correct??=[];}if(t.type==='order'){t.items??=['',''];t.acceptedOrders??=[[0,1]];}if(t.type==='match')t.pairs??=[['',''],['','']];invalidate();renderEditor();});
$('check').addEventListener('click',()=>{const task=mode==='play'?round.tasks[selected]:compiled.lesson?.tasks[selected];if(!task)return;const result=checkAnswer(task,answer);$('feedback').textContent=result.feedback;$('feedback').className=result.correct?'success':'wrong';if(mode==='play'&&result.correct){solved[selected]=true;results[selected]=result;scene?.progress(solved);renderLists();$('next').hidden=false;$('next').textContent=solved.every(Boolean)?'Runde abschließen':'Nächste Station';}});
$('next').addEventListener('click',()=>{if(solved.every(Boolean)){showFinish();return;}let i=solved.findIndex((v,i)=>!v&&i>selected);if(i<0)i=solved.findIndex(v=>!v);select(i);});
function showFinish(){ $('question').hidden=true;$('finish').hidden=false;$('result-list').replaceChildren();round.tasks.forEach((t,i)=>{const item=h('li');item.append(h('strong',t.prompt),h('p',Array.isArray(results[i].canonicalAnswer)?results[i].canonicalAnswer.map(v=>typeof v==='object'?`${v.left} – ${v.right}`:v).join(' · '):(t.type==='measure'?String(results[i].canonicalAnswer).replace('.',',')+' '+t.unit:String(results[i].canonicalAnswer))));$('result-list').append(item);});$('finish').scrollIntoView({block:'nearest',behavior:'smooth'});}
$('again').addEventListener('click',()=>{solved=Array(round.tasks.length).fill(false);results=Array(round.tasks.length).fill(null);switchMode('play');});
window.addEventListener('pagehide',()=>scene?.dispose(),{once:true});
renderEditor();renderLists();renderValidation();select(0);scene?.tasks(draft.tasks);
