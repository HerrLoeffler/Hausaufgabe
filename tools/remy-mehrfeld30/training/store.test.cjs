'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {reserve,settle,authorizeRun}=require('./store.cjs');
function memory(seed){
  const docs=new Map(Object.entries(seed)),ref=path=>({path});
  return {doc:ref,docs,runTransaction:async callback=>{
    const writes=[],snapshot=r=>({exists:docs.has(r.path),data:()=>structuredClone(docs.get(r.path))});
    const result=await callback({get:async r=>snapshot(r),create:(r,v)=>{assert.ok(!docs.has(r.path));writes.push([r.path,v]);},
      update:(r,v)=>writes.push([r.path,{...docs.get(r.path),...v}]),set:(r,v)=>writes.push([r.path,v])});
    for(const [p,v]of writes)docs.set(p,v);
    return result;
  }};
}
test('a stable provider step is reserved once and unknown calls keep their reservation',async()=>{
  const db=memory({'taskLearningRuns/r':{ownerId:'teacher',limitMicros:100,spentMicros:0,reservedMicros:0,status:'running'}});
  assert.equal((await reserve(db,'r','c-a1-generate',80)).dispatch,true);
  assert.equal((await reserve(db,'r','c-a1-generate',80)).dispatch,false);
  await assert.rejects(reserve(db,'r','c2-a1-generate',30),/Budget/);
  assert.equal(db.docs.get('taskLearningRuns/r').reservedMicros,80);
  await settle(db,'r','c-a1-generate',{status:'completed',costMicros:20,usage:{tokens:10}});
  assert.equal(db.docs.get('taskLearningRuns/r').reservedMicros,0);
  assert.equal(db.docs.get('taskLearningRuns/r').spentMicros,20);
  await settle(db,'r','c-a1-generate',{status:'completed',costMicros:20});
  assert.equal(db.docs.get('taskLearningRuns/r').spentMicros,20);
});
test('only the owner and allowlisted teachers of the fixed shared calibration can open a run',()=>{
  assert.equal(authorizeRun({ownerId:'a'},'a'),true);
  assert.equal(authorizeRun({ownerId:'a'},'b'),false);
  assert.equal(authorizeRun({ownerId:'a',sharedPilot:true},'b'),false);
  assert.equal(authorizeRun({ownerId:'gc-visual255-e2e',sharedPilot:true,id:'dreisatz60-20261118-v1'},'b'),true);
});
module.exports={memory};
