'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {roundTwo,roundTwoCode,projectDiagram,scoreDiagram}=require('./round-two.cjs');
const {present,score}=require('./review.cjs');
const {core,parseVisualTask}=require('../../functions/lib/visual-task');
test('reference round spans different subjects and interactions, with individually solvable fields',()=>{
  assert.equal(roundTwo.length,12);
  assert.equal(new Set(roundTwo.map(q=>q.id)).size,12);
  assert.ok(new Set(roundTwo.map(q=>q.subject)).size>=7);
  assert.ok(new Set(roundTwo.map(q=>q.shape)).size>=6);
  for(const q of roundTwo){
    const projected=present(roundTwoCode,'runde2',q);
    if(q.type==='diagram'){
      assert.deepEqual(projected.diagram,projectDiagram(q));
      assert.ok(projected.diagram.fields.every(f=>!Object.hasOwn(f,'accepted')));
      const answer=Object.fromEntries(q.fields.map(f=>[f.id,f.accepted[0]]));
      assert.equal(score(q,answer),q.points,q.id);
      delete answer[q.fields[0].id];
      assert.equal(score(q,answer),q.points-.5,q.id);
      assert.equal(scoreDiagram(q,{unrelated:'richtig'}),0,q.id);
    }else{
      const task=parseVisualTask(q.visualTask,{points:q.points});
      assert.equal(Object.hasOwn(projected.visual,'solution'),false);
      assert.equal(score(q,core.solutionResponse(task)),q.points,q.id);
    }
    assert.equal(score(q,null),0,q.id);
  }
});
