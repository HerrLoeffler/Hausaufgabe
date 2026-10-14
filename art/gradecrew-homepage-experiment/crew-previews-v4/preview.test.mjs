import test from 'node:test';
import assert from 'node:assert/strict';
import {createTutorialGate} from './tutorial-gate.mjs';
import {COLOURS_TEST} from './test-data.mjs';
const draft={id:'tutorial-draft',title:'My first GradeCrew journey',questions:[{id:'q1',prompt:'Example'}]};
for(const target of ['settings','create']){
 test('guest '+target+' retains tutorial name and draft through cancel and login switch',()=>{
  const gate=createTutorialGate({name:'Mara',draft});
  gate.request(target);
  assert.equal(gate.snapshot().view,'account');
  gate.setMode('login');gate.cancel();
  const s=gate.snapshot();
  assert.equal(s.name,'Mara');assert.equal(s.intent,target);assert.deepEqual(s.draft,draft);
  gate.request(target);assert.equal(gate.snapshot().view,'account');
 });
 test('an already signed-in user can enter '+target+' without the account gate',()=>{
  const gate=createTutorialGate({name:'Mara',draft,authenticated:true});
  gate.request(target);assert.equal(gate.snapshot().view,target);
 });
}
test('demo authentication continues the remembered destination and never retains credentials',()=>{
 const gate=createTutorialGate({name:'Mara',draft});gate.request('settings');
 gate.simulateSignIn({email:'mara@example.test',password:'DEMO-ONLY'});
 const s=gate.snapshot();assert.equal(s.view,'settings');assert.deepEqual(s.draft,draft);
 assert.ok(!JSON.stringify(s).includes('DEMO-ONLY'));assert.ok(!JSON.stringify(s).includes('example.test'));
});
test('closing the gate and returning through browser history can retain a changed tutorial name',()=>{
 const gate=createTutorialGate({name:'Mara',draft});
 gate.setName('Alex');gate.request('create');gate.returnToFinish();assert.equal(gate.snapshot().name,'Alex');
 assert.equal(gate.snapshot().intent,'create');
});
test('Remy produces a coherent ten-question English colours test containing the visible examples',()=>{
 assert.equal(COLOURS_TEST.grade,5);assert.equal(COLOURS_TEST.language,'en');assert.equal(COLOURS_TEST.questions.length,10);
 assert.equal(new Set(COLOURS_TEST.questions.map(q=>q.id)).size,10);
 assert.equal(COLOURS_TEST.questions[0].id,'colours-1');
 assert.equal(COLOURS_TEST.questions[1].type,'listening');
 assert.ok(COLOURS_TEST.questions.every(q=>q.prompt&&q.points>0));
 assert.equal(COLOURS_TEST.questions[1].audio,'../assets/colours-listening.wav');
});

