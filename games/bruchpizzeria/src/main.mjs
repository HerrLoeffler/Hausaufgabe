import {newShift,takePizza,applyCut,undoCut,selectSlice,platePizza,serve,unplate,tick,restore} from './shift.mjs';
import {evaluatePortion} from './pizza.mjs';
import {createKitchen} from './kitchen.mjs';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',SAVE='gc-pizza-v1';
let raw=null,storage=true;try{raw=localStorage.getItem(SAVE);}catch{storage=false;}
let state=raw?restore(raw):newShift(),kitchen=null,sound=false,audio=null,drag=null,ordersKey='',pizzaKey='',started=false;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));}catch{storage=false;}$('storage-status').textContent=storage?'Übung · Fortschritt auf diesem Gerät':'Speichern nicht verfügbar · Diese Schicht bleibt nur hier geöffnet';}
function update(next){state=next;save();render();}
function tone(success=false){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.type='sine';osc.frequency.setValueAtTime(success?660:420,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(success?880:520,audio.currentTime+.12);gain.gain.setValueAtTime(.04,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);osc.start();osc.stop(audio.currentTime+.21);}catch{sound=false;}}
function svg(tag,attrs={}){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
const pathOf=(poly,scale=1)=>poly.map((p,i)=>(i?'L':'M')+p.x*scale+','+p.y*scale).join(' ')+' Z';
const toppings=[[-.42,-.4],[-.05,-.62],[.4,-.43],[.56,.12],[.15,.58],[-.38,.45],[-.64,.04],[0,0]];
function renderPizza(){
 if(drag)return;
 const key=JSON.stringify([state.pizza,state.selected,state.history.length]);if(key===pizzaKey)return;pizzaKey=key;
 const focused=document.activeElement?.closest('.slice')?.dataset.index;
 const root=$('pizza-svg');root.replaceChildren();
 const defs=svg('defs');root.append(defs);root.append(svg('circle',{cx:0,cy:.035,r:1.065,fill:'#996135',opacity:.32}));
 state.pizza.forEach((poly,i)=>{
  const clip=svg('clipPath',{id:'slice-clip-'+i});clip.append(svg('path',{d:pathOf(poly,.96)}));defs.append(clip);
  const selected=state.selected.includes(i),p=svg('path',{d:pathOf(poly),fill:selected?'#9cb574':'#cb8d45',stroke:selected?'#315e41':'#815528','stroke-width':selected?.035:.017,class:'slice'+(selected?' selected':''),'data-index':i,tabindex:0,role:'button','aria-label':`Stück ${i+1} ${selected?'ausgewählt':'auswählen'}`,'aria-pressed':selected});
  p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();update(selectSlice(state,i));}});root.append(p);
  const cheese=svg('g',{'clip-path':`url(#slice-clip-${i})`,'pointer-events':'none'});
  cheese.append(svg('circle',{r:.94,fill:selected?'#f3d893':'#edc976'}));
  for(const [x,y] of toppings){cheese.append(svg('circle',{cx:x,cy:y,r:.1,fill:'#ba5740'}));cheese.append(svg('circle',{cx:x-.018,cy:y-.025,r:.025,fill:'#d67957'}));}
  for(const [x,y,r] of [[.28,-.1,30],[-.28,.2,-30],[.3,.3,50],[-.2,-.5,80]])cheese.append(svg('ellipse',{cx:x,cy:y,rx:.04,ry:.11,fill:'#68894e',transform:`rotate(${r} ${x} ${y})`}));
  root.append(cheese);root.append(svg('path',{d:pathOf(poly),fill:'none',stroke:selected?'#315e41':'#9c692e','stroke-width':selected?.035:.018,'pointer-events':'none'}));
  if(selected){const c=poly.reduce((v,p)=>({x:v.x+p.x/poly.length,y:v.y+p.y/poly.length}),{x:0,y:0});root.append(svg('circle',{cx:c.x,cy:c.y,r:.045,fill:'#315e41','pointer-events':'none'}));}
 });
 root.append(svg('circle',{r:.02,fill:'#8f673c','pointer-events':'none'}));
 if(drag)root.append(svg('line',{id:'cut-preview',x1:drag.start.x,y1:drag.start.y,x2:drag.end.x,y2:drag.end.y,stroke:'#fff7dc','stroke-width':.028,'stroke-dasharray':'.06 .03','pointer-events':'none'}));
 const check=evaluatePortion(state.pizza,state.selected,1);
 $('portion-label').textContent=state.selected.length?(check.reason==='unequal'?'Teile noch ungleich – Schnitt prüfen':`${state.selected.length} von ${state.pizza.length} gleich großen Stücken`):'Tippe auf die Stücke für deinen Teller';
 $('undo').disabled=!state.history.length;$('plate').disabled=!state.selected.length;
 if(focused!==undefined)root.querySelector(`[data-index="${focused}"]`)?.focus({preventScroll:true});
}
function render(){
 $('progress').textContent=`${state.served} / 4`;$('feedback').textContent=state.feedback;
 $('carry').textContent=state.carry==='pizza'?'Eine frische Pizza':state.carry==='plate'?'Deine Portion auf dem Teller':'Noch nichts';
 $('shift-note').textContent=state.served===0?'Erst einmal ganz in Ruhe':'Zwei Gäste · ein guter Überblick';
 const key=state.orders.map(o=>o.id).join(',');
 if(key!==ordersKey){ordersKey=key;$('orders').replaceChildren();state.orders.forEach((o,i)=>{
  const button=document.createElement('button');button.id='order-'+o.id;button.className='order-card';button.setAttribute('aria-label',`${o.name}: ${o.label} servieren`);
  const avatar=document.createElement('span');avatar.className='order-avatar';avatar.textContent=o.name[0];avatar.style.background=['#efc887','#cbdbd5','#eed1b9','#d9c6df'][o.id-1];
  const content=document.createElement('span');content.className='order-content';
  const name=document.createElement('span');name.className='order-name';name.textContent=o.name+' bestellt';
  const amount=document.createElement('span');amount.className='order-amount';amount.textContent=o.label;content.append(name,amount);
  const status=document.createElement('span');status.className='order-status';status.textContent=o.patience===null?'Ganz entspannt':'Ich freue mich schon';
  const bar=document.createElement('span');bar.className='patience';bar.setAttribute('aria-hidden','true');bar.append(document.createElement('span'));
  button.append(avatar,content,status,bar);button.addEventListener('click',()=>kitchen?.go('guest'+i));$('orders').append(button);
 });}
 state.orders.forEach(o=>{const card=$('order-'+o.id);card.disabled=!started||state.paused||state.help||state.complete;card.querySelector('.patience>span').style.width=(o.patience===null?100:o.patience)+'%';if(o.patience===0)card.querySelector('.order-status').textContent='Ich warte noch auf meine Portion';});
 $('pause').setAttribute('aria-pressed',String(state.paused));$('pause').textContent=state.paused?'Weiter':'Pause';
 $('pause-overlay').hidden=!state.paused||!started;
 $('station-oven').disabled=!started||state.paused||state.help||state.complete;
 $('station-board').disabled=!started||state.paused||state.help||state.complete;
 if($('cut-dialog').open){$('cut-order').textContent=state.orders.map(o=>`${o.name}: ${o.label}`).join(' · ');$('cut-message').textContent=state.feedback;renderPizza();}
 kitchen?.refresh();
 if(state.complete&&started&&!$('done-dialog').open)$('done-dialog').showModal();
}
function station(id){
 if(id==='oven'){update(takePizza(state));tone();}
 else if(id==='board'){
  if(!state.carry){update({...state,feedback:'Hol zuerst eine frische Pizza aus dem Ofen.'});return;}
  if(state.carry==='plate')state=unplate(state);
  $('cut-dialog').showModal();render();
 }else{
  const order=state.orders[Number(id.slice(-1))];if(!order)return;
  if(state.carry!=='plate'){update({...state,feedback:`${order.name} freut sich auf ${order.label}. Bereite erst den Teller am Schneidebrett vor.`});return;}
  const before=state.served;update(serve(state,order.id));tone(state.served>before);
 }
}
function point(event){const matrix=$('pizza-svg').getScreenCTM();return new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());}
$('pizza-svg').addEventListener('pointerdown',e=>{
 if(e.button!==0||state.paused||state.help)return;e.preventDefault();
 const p=point(e);drag={start:{x:p.x,y:p.y},end:{x:p.x,y:p.y},index:e.target.closest('.slice')?.dataset.index,pointer:e.pointerId};$('pizza-svg').setPointerCapture(e.pointerId);
});
$('pizza-svg').addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;const p=point(e);drag.end={x:p.x,y:p.y};let preview=$('cut-preview');if(!preview){preview=svg('line',{id:'cut-preview',stroke:'#fff7dc','stroke-width':.025,'stroke-dasharray':'.05 .03','pointer-events':'none'});$('pizza-svg').append(preview);}for(const [k,v] of Object.entries({x1:drag.start.x,y1:drag.start.y,x2:p.x,y2:p.y}))preview.setAttribute(k,v);});
$('pizza-svg').addEventListener('pointerup',e=>{
 if(!drag||e.pointerId!==drag.pointer)return;const d=drag;drag=null;$('cut-preview')?.remove();
 const p=point(e);if(Math.hypot(p.x-d.start.x,p.y-d.start.y)>.12){update(applyCut(state,d.start,{x:p.x,y:p.y}));tone();}
 else if(d.index!==undefined)update(selectSlice(state,Number(d.index)));else renderPizza();
});
for(const event of ['pointercancel','lostpointercapture'])$('pizza-svg').addEventListener(event,()=>{if(drag){drag=null;$('cut-preview')?.remove();renderPizza();}});
$('cut-angle').addEventListener('input',()=>{$('angle-value').textContent=$('cut-angle').value+'°';});
$('angle-cut').addEventListener('click',()=>{const a=Number($('cut-angle').value)*Math.PI/180;update(applyCut(state,{x:-Math.cos(a)*1.2,y:-Math.sin(a)*1.2},{x:Math.cos(a)*1.2,y:Math.sin(a)*1.2}));tone();});
$('undo').addEventListener('click',()=>update(undoCut(state)));
$('fresh').addEventListener('click',()=>update(takePizza(state)));
$('plate').addEventListener('click',()=>{update(platePizza(state));if(state.carry==='plate'){$('cut-dialog').close();render();tone();}});
$('cut-close').addEventListener('click',()=>{$('cut-dialog').close();render();});
$('cut-dialog').addEventListener('cancel',()=>{drag=null;});
function begin(fresh){if(fresh)state=newShift();else state={...state,paused:false,help:false};started=true;$('welcome').close();update(state);if(!fresh&&state.carry==='pizza'&&state.pizza.length>1){$('cut-dialog').showModal();render();}}
$('start').addEventListener('click',()=>begin(true));$('resume').addEventListener('click',()=>begin(false));
$('welcome').addEventListener('cancel',e=>e.preventDefault());
$('station-oven').addEventListener('click',()=>kitchen?.go('oven'));$('station-board').addEventListener('click',()=>kitchen?.go('board'));
$('help-button').addEventListener('click',()=>{update({...state,help:true});$('help-dialog').showModal();});
function closeHelp(){state={...state,help:false};$('help-dialog').close();update(state);}
$('help-close').addEventListener('click',closeHelp);$('help-dialog').addEventListener('cancel',e=>{e.preventDefault();closeHelp();});
function pause(){update({...state,paused:!state.paused});}
$('pause').addEventListener('click',pause);$('continue').addEventListener('click',pause);
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'Ton an':'Ton aus';$('sound').setAttribute('aria-pressed',String(sound));tone(true);});
$('restart').addEventListener('click',()=>{$('done-dialog').close();update(newShift());});
$('done-dialog').addEventListener('cancel',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!state.complete)update({...state,paused:true});});
setInterval(()=>{if(started&&!document.hidden&&!$('welcome').open&&!state.paused&&!state.help&&!state.complete)update(tick(state,.5));},500);
if(!window.Phaser){$('feedback').textContent='Das Spiel konnte nicht geladen werden. Bitte lade die Seite erneut.';$('start').disabled=true;}
else createKitchen({getState:()=>state,onStation:station,onReady:api=>{kitchen=api;render();}});
$('resume').hidden=!raw;$('welcome').showModal();render();
