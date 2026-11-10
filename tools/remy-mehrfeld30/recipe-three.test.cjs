'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {build,examples,publicRecipe,scoreRecipe}=require('./recipe-three.cjs');
test('all recipes derive safe, solvable displays and independently score their fields',()=>{
  for(const raw of examples){
    const q=build(raw),view=publicRecipe(q);
    assert.equal(view.recipe,raw.recipe);
    assert.ok(!Object.hasOwn(view,'solution'));
    assert.equal(scoreRecipe(q,q.solution),q.points);
    assert.equal(scoreRecipe(q,{}),0);
    const partial={...q.solution};delete partial[Object.keys(partial)[0]];
    assert.equal(scoreRecipe(q,partial),q.points-.5);
  }
});
test('unplayable mazes, ambiguous source labels and untotalable bars fail closed',()=>{
  assert.throws(()=>build({...examples[1],mazes:[examples[1].mazes[0],examples[1].mazes[0]]}));
  assert.throws(()=>build({...examples[2],bars:[[8,8],[2]]}));
  assert.throws(()=>build({...examples[0],sources:[examples[0].sources[0],examples[0].sources[0]]}));
});
