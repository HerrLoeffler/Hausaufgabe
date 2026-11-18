'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {buildCandidate}=require('./builder.cjs');
const {present,score}=require('../review.cjs');
const {core,parseVisualTask}=require('../../../functions/lib/visual-task');
const {cases}=require('./cases.cjs');
test('all arithmetic families use the existing scaffold with independently derived keys and partial points',()=>{
  for(const c of cases.filter(x=>x.family!=='contrast')){
    const plan={...c.expected,title:'Rechenweg',text:c.wish,labels:['Anzahl','Wert'],subject:'Mathematik',
      relationship:c.expected.kind,constantRate:true,constantWork:true,equalRate:true,reason:'Beziehung im Auftrag.'};
    const q=buildCandidate(plan,c);
    const task=parseVisualTask(q.visualTask,{points:q.points}),answer=core.solutionResponse(task);
    assert.equal(score(q,answer),q.points,c.id);
    assert.equal(score(q,{}),0,c.id);
    const keys=Object.keys(answer);
    assert.equal(score(q,{...answer,[keys[0]]:'falsch'}),q.points-.5,c.id);
    assert.equal(Object.hasOwn(present('training:x','training',q).visual,'solution'),false);
  }
});
test('the same field display cannot silently turn a base fee into a direct relation',()=>{
  assert.throws(()=>buildCandidate({kind:'direct',relationship:'base-fee',constantRate:false,a:'4',b:'2',c:'7',text:'Taxi',labels:['km','€'],title:'Taxi'}, {id:'bad'}),/Voraussetzungen/);
  const q=buildCandidate({kind:'other',text:'Vier Euro Grundgebühr und zwei Euro je Kilometer.',title:'Rechenweg',subject:'Mathematik'},{id:'taxi'});
  assert.equal(q.type,'single');
  assert.equal(score(q,1),q.points);
  assert.equal(score(q,0),0);
});
