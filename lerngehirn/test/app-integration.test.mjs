import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import * as model from '../model.mjs';
import * as brain from '../brain.mjs';
import * as workshop from '../workshop.mjs';

async function mount(activeSession,{turnResult}={}){
  const events=new Map(),calls=[];
  const focus={setAttribute(){},focus(){}};
  const app={innerHTML:'',setAttribute(){},querySelector(){return focus;}};
  const account={innerHTML:''};
  let onAuth,tick,hoverCell=null;
  const api={isLocal:false,watchAuth(listener){onAuth=listener;return ()=>{};},login:async()=>{},logout:async()=>{},async call(method,data){calls.push({method,data});if(method==='learningBrainCatalog')return {topics:[]};if(method==='learningBrainTurn'&&turnResult)return typeof turnResult==='function'?turnResult(data):turnResult;if(method==='learningBrainProfile')return {learner:{alias:'du',grade:6,track:'R'},skills:[],recommendations:[],activeSession};throw new Error('Unexpected network call');}};
  const imported={...api,...model,...brain,...workshop};
  let source=await fs.readFile(new URL('../app.mjs',import.meta.url),'utf8');
  // Execute the real entry point with only its browser/provider boundaries replaced.
  source=source.replace(/^import \{([^}]+)\} from '[^']+';$/gm,(_,names)=>{for(const name of names.split(',').map(n=>n.trim()))assert.ok(name in imported,`entry point import ${name} exists`);return '';});
  vm.runInNewContext(source,{...imported,document:{elementFromPoint(){return hoverCell;},querySelector(selector){return selector==='#app'?app:account;},addEventListener(name,listener){events.set(name,listener);}},setInterval(fn){tick=fn;},URL,Date,crypto:webcrypto,console,FormData:class {get(){return null;}}},{filename:'lerngehirn/app.mjs'});
  onAuth({uid:'synthetic-b'});
  await new Promise(resolve=>setImmediate(resolve));
  return {app,calls,pointer(type,index,pointerId=1){const cell=index===null?null:{dataset:{workshopPart:String(index)},disabled:false,closest(){return this;}};hoverCell=cell;events.get(type)({target:cell||{closest(){return null;}},button:0,isPrimary:true,pointerId,clientX:0,clientY:0,preventDefault(){}});},tick(){tick();},input(name,value){events.get('input')({target:{name,value}});},async submit(id){await events.get('submit')({preventDefault(){},target:{id}});},async board(type,value){await events.get('click')({detail:0,target:{closest(selector){return selector==='[data-workshop-part], [data-workshop-action]'?{dataset:type==='toggle-part'?{workshopPart:String(value)}:{workshopAction:type,value:String(value)},disabled:false}:null;}}});},async click(action){await events.get('click')({target:{closest(){return {dataset:{action},disabled:false};}}});}};
}

test('Weiterlernen opens stored B07 with LaTex, correct feedback, absent original task and null visual without a network turn',async()=>{
  const ui=await mount({id:'session-b',revision:3,topic:{id:'B07',title:'Erweitern',subject:'math'},phase:'practice',task:{id:'b07-3',prompt:'Erweitere den Bruch \\(\\frac{1}{3}\\) mit 4.',contextText:'',input:'text',options:[]},feedback:{outcome:'correct',short:'Richtig'},visual:null,remainingSeconds:1170});
  assert.match(ui.app.innerHTML,/Weiterlernen/);
  const callsBefore=ui.calls.length;
  await ui.click('resume');
  assert.match(ui.app.innerHTML,/id="answer-form"/);
  assert.match(ui.app.innerHTML,/class="math-fraction"/);
  assert.match(ui.app.innerHTML,/Richtig/);
  assert.equal(ui.calls.length,callsBefore);
});


test('resume keeps completion answerable and teacher route disables questions',async()=>{
  const base={id:'s',revision:5,topic:{title:'Bruchzahlen',subject:'math'},task:{id:'t',prompt:'Wie heißt der wertgleiche Bruch?',input:'text'},originalTask:{prompt:'Erweitere 1/3 mit 4.',contextText:'Dasselbe Ganze.'},explanation:'Schau auf den Zähler.',visual:{kind:'none'},remainingSeconds:20};
  const completion=await mount({...base,phase:'completion'});await completion.click('resume');assert.match(completion.app.innerHTML,/id="answer-form"/);assert.match(completion.app.innerHTML,/Deine ursprüngliche Aufgabe/);assert.doesNotMatch(completion.app.innerHTML,/Dein Schritt für heute/);
  const teacher=await mount({...base,phase:'teacher'});await teacher.click('resume');assert.match(teacher.app.innerHTML,/Hol deine Lehrkraft dazu/);assert.match(teacher.app.innerHTML,/<button class="secondary" disabled>Frage stellen/);
});

test('clock tick leaves entered answer and rendered form unchanged; failed request retains answer',async()=>{
  const ui=await mount({id:'s',revision:1,topic:{title:'Brüche'},phase:'practice',task:{id:'t',prompt:'Erweitere 1/3.',input:'text'},visual:null,remainingSeconds:5});await ui.click('resume');ui.input('answer','4/12');const form=ui.app.innerHTML;ui.tick();assert.equal(ui.app.innerHTML,form);await ui.click('help');assert.match(ui.app.innerHTML,/>4\/12<\/textarea>/);assert.match(ui.app.innerHTML,/Deine Eingabe bleibt/);
});


test('answer workshop sends semantic actions on answer/help/question, keeps them on failure, and hides old feedback',async()=>{
  const ui=await mount({id:'w',revision:1,phase:'practice',topic:{title:'Anteil'},task:{id:'wt',prompt:'Zeige 1/3.',input:'workshop',workshop:{tool:'fraction-board',version:1,role:'answer',goal:'represent',numerator:1,denominator:3,targetDenominator:0,instruction:'Markiere.'}},feedback:{short:'Richtig!'},remainingSeconds:500});await ui.click('resume');assert.match(ui.app.innerHTML,/Deine Lernwerkstatt/);assert.doesNotMatch(ui.app.innerHTML,/id="answer-input"/);assert.match(ui.app.innerHTML,/Zum letzten Schritt/);await ui.board('toggle-part',0);await ui.submit('answer-form');let sent=ui.calls.at(-1).data;assert.equal(sent.answer,'');assert.deepEqual(sent.workshop.actions,[{type:'toggle-part',value:0}]);assert.doesNotMatch(ui.app.innerHTML,/Zum letzten Schritt/);await ui.click('help');assert.deepEqual(ui.calls.at(-1).data.workshop.actions,sent.workshop.actions);ui.input('question','Warum?');await ui.submit('question-form');assert.deepEqual(ui.calls.at(-1).data.workshop.actions,sent.workshop.actions);
});


test('painting by pointer creates only bounded semantic actions with no provider request until submitting',async()=>{
 const ui=await mount({id:'paint',revision:1,phase:'practice',task:{id:'pt',prompt:'Markiere.',input:'workshop',workshop:{tool:'fraction-board',version:1,role:'answer',goal:'represent',numerator:2,denominator:3,targetDenominator:0,instruction:''}},remainingSeconds:500});await ui.click('resume');const before=ui.calls.length;ui.pointer('pointerdown',0);ui.pointer('pointermove',1);ui.pointer('pointermove',0);ui.pointer('pointerup',null);assert.equal(ui.calls.length,before);await ui.submit('answer-form');assert.deepEqual(ui.calls.at(-1).data.workshop.actions,[{type:'toggle-part',value:0},{type:'toggle-part',value:1}]);
});


test('support board keeps the ordinary answer field and sends both typed answer and semantic evidence',async()=>{
 const session={id:'support',revision:1,phase:'help',task:{id:'st',prompt:'Was fällt dir auf?',input:'text',workshop:{tool:'fraction-board',version:1,role:'support',goal:'equivalent',numerator:1,denominator:3,targetDenominator:6,instruction:'Probiere aus.'}},remainingSeconds:100};const ui=await mount(session);await ui.click('resume');assert.match(ui.app.innerHTML,/id="answer-input"/);assert.match(ui.app.innerHTML,/Zum Ausprobieren mit Hilfe/);await ui.board('partition',2);ui.input('answer','2/6');await ui.submit('answer-form');assert.equal(ui.calls.at(-1).data.answer,'2/6');assert.deepEqual(ui.calls.at(-1).data.workshop.actions,[{type:'partition',value:2}]);
});

test('same-task question response preserves the board; a new server task resets actions',async()=>{
 const base={id:'change',revision:1,phase:'practice',task:{id:'first',prompt:'Zeige.',input:'workshop',workshop:{tool:'fraction-board',version:1,role:'answer',goal:'represent',numerator:1,denominator:3,targetDenominator:0,instruction:''}},remainingSeconds:100};let same=true;const ui=await mount(base,{turnResult:()=>({...base,revision:same?2:3,task:{...base.task,id:same?'first':'next'}})});await ui.click('resume');await ui.board('toggle-part',0);ui.input('question','Passt das?');await ui.submit('question-form');same=false;await ui.submit('answer-form');assert.deepEqual(ui.calls.at(-1).data.workshop.actions,[{type:'toggle-part',value:0}]);await ui.submit('answer-form');assert.deepEqual(ui.calls.at(-1).data.workshop.actions,[]);
});
test('all board controls are disabled during an API request and pointer actions cannot change its submitted evidence',async()=>{
 const session={id:'busy',revision:1,phase:'practice',task:{id:'busy-t',prompt:'Zeige.',input:'workshop',workshop:{tool:'fraction-board',version:1,role:'answer',goal:'represent',numerator:1,denominator:3,targetDenominator:0,instruction:''}},remainingSeconds:100};let resolveTurn;const response=new Promise(resolve=>resolveTurn=resolve);const ui=await mount(session,{turnResult:()=>response});await ui.click('resume');await ui.board('toggle-part',0);const sending=ui.submit('answer-form');assert.match(ui.app.innerHTML,/data-workshop-part="0"[^>]*disabled/);assert.match(ui.app.innerHTML,/name="workshop-parts"[^>]*disabled/);assert.match(ui.app.innerHTML,/data-workshop-action="reset"[^>]*disabled/);await ui.board('toggle-part',1);assert.deepEqual(ui.calls.at(-1).data.workshop.actions,[{type:'toggle-part',value:0}]);resolveTurn({...session,revision:2});await sending;
});
