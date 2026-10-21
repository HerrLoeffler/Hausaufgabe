import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import * as model from '../model.mjs';
import * as brain from '../brain.mjs';

async function mount(activeSession){
  const events=new Map(),calls=[];
  const focus={setAttribute(){},focus(){}};
  const app={innerHTML:'',setAttribute(){},querySelector(){return focus;}};
  const account={innerHTML:''};
  let onAuth,tick;
  const api={isLocal:false,watchAuth(listener){onAuth=listener;return ()=>{};},login:async()=>{},logout:async()=>{},async call(method,data){calls.push({method,data});if(method==='learningBrainCatalog')return {topics:[]};if(method==='learningBrainProfile')return {learner:{alias:'du',grade:6,track:'R'},skills:[],recommendations:[],activeSession};throw new Error('Unexpected network call');}};
  const imported={...api,...model,...brain};
  let source=await fs.readFile(new URL('../app.mjs',import.meta.url),'utf8');
  // Execute the real entry point with only its browser/provider boundaries replaced.
  source=source.replace(/^import \{([^}]+)\} from '[^']+';$/gm,(_,names)=>{for(const name of names.split(',').map(n=>n.trim()))assert.ok(name in imported,`entry point import ${name} exists`);return '';});
  vm.runInNewContext(source,{...imported,document:{querySelector(selector){return selector==='#app'?app:account;},addEventListener(name,listener){events.set(name,listener);}},setInterval(fn){tick=fn;},URL,Date,crypto:webcrypto,console},{filename:'lerngehirn/app.mjs'});
  onAuth({uid:'synthetic-b'});
  await new Promise(resolve=>setImmediate(resolve));
  return {app,calls,tick(){tick();},input(name,value){events.get('input')({target:{name,value}});},async click(action){await events.get('click')({target:{closest(){return {dataset:{action},disabled:false};}}});}};
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
