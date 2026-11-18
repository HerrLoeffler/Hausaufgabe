'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {mixedDeck,mixedCode,rankRecipe}=require('./mix.cjs');
const {present,score}=require('./review.cjs');
const {core,parseVisualTask}=require('../../functions/lib/visual-task');
test('30 different mixed cases are safe, solvable and select the intended eligible recipe',()=>{
  assert.equal(mixedDeck.length,30);
  assert.equal(new Set(mixedDeck.map(x=>x.q.id)).size,30);
  assert.ok(new Set(mixedDeck.map(x=>x.q.subject.split(' · ')[0])).size>=10);
  const counts={};
  for(const [index,{q,intent,recipe}] of mixedDeck.entries()){
    counts[recipe]=(counts[recipe]||0)+1;
    assert.equal(rankRecipe(intent),recipe,q.id);
    if(index)assert.notEqual(recipe,mixedDeck[index-1].recipe,q.id);
    const pub=present(mixedCode,'mix',q);
    assert.ok(!Object.hasOwn(pub,'solution')&&!Object.hasOwn(pub.visual||{},'solution'));
    assert.ok(!pub.diagram?.fields.some(x=>Object.hasOwn(x,'accepted')));
    const answer=q.type==='visual'?core.solutionResponse(parseVisualTask(q.visualTask,{points:q.points})):
      q.type==='diagram'?Object.fromEntries(q.fields.map(f=>[f.id,f.accepted[0]])):q.solution;
    assert.equal(score(q,answer),q.points,q.id);
    assert.equal(score(q,null),0,q.id);
  }
  assert.ok(Object.keys(counts).length>=14);
  assert.ok(Object.values(counts).every(n=>n<=3));
});
test('format selection can abstain instead of forcing a superficially related format',()=>{
  for(const intent of [
    {action:'proportional-route',facts:['base-fee','constant-ratio','units','intermediate']},
    {action:'pitch-place',facts:['audio','duration']},
    {action:'source-link',facts:['claims']},
    {action:'order-pictures',facts:['images','cycle']},
    {action:'measure-angle',facts:['numbers']},
    {action:'explain',facts:['percent']}
  ])assert.equal(rankRecipe(intent),null);
});
