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
test('all autonomous runs share one transactionally reserved session cap, including uncertain calls',async()=>{
 const {TestDatabase}=require('./test-db.cjs'),db=new TestDatabase();
 await db.doc('taskLearningAutoRuns/s').set({ownerId:'teacher',limitMicros:100,spentMicros:0,reservedMicros:0,status:'running'});
 for(const id of ['r1','r2'])await db.doc('taskLearningRuns/'+id).set({ownerId:'teacher',autoSessionId:'s',limitMicros:100,spentMicros:0,reservedMicros:0,status:'running'});
 await reserve(db,'r1','one',80);
 await assert.rejects(reserve(db,'r2','two',30),/Budget/);
 await settle(db,'r1','one',{status:'uncertain'});
 assert.equal(db.docs.get('taskLearningAutoRuns/s').reservedMicros,80);
 await settle(db,'r1','one',{status:'completed',costMicros:20});await settle(db,'r1','one',{status:'completed',costMicros:20});
 assert.equal(db.docs.get('taskLearningAutoRuns/s').reservedMicros,0);assert.equal(db.docs.get('taskLearningAutoRuns/s').spentMicros,20);
 await reserve(db,'r2','two',80);await assert.rejects(reserve(db,'r1','three',1),/Budget/);
});
test('concurrent reservations across experiment runs cannot overbook the shared cap',async()=>{
 const {TestDatabase}=require('./test-db.cjs'),db=new TestDatabase();await db.doc('taskLearningAutoRuns/concurrent').set({ownerId:'t',limitMicros:100,reservedMicros:0,spentMicros:0,status:'running'});
 for(const r of ['x','y'])await db.doc('taskLearningRuns/'+r).set({ownerId:'t',autoSessionId:'concurrent',limitMicros:100,spentMicros:0,reservedMicros:0,status:'running'});
 const results=await Promise.allSettled([reserve(db,'x','one',80),reserve(db,'y','two',80)]);assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(db.docs.get('taskLearningAutoRuns/concurrent').reservedMicros,80);
});
test('a fixed post-study probe uses the remaining shared budget without reopening frozen trial phases',async()=>{
 const {TestDatabase}=require('./test-db.cjs'),db=new TestDatabase();await db.doc('taskLearningAutoRuns/s').set({ownerId:'t',status:'completed',probeStatus:'running',limitMicros:100,spentMicros:90,reservedMicros:0});
 await db.doc('taskLearningRuns/probe').set({ownerId:'t',autoSessionId:'s',autoPostStudyProbe:true,status:'running',limitMicros:20,spentMicros:0,reservedMicros:0});
 await db.doc('taskLearningRuns/old').set({ownerId:'t',autoSessionId:'s',status:'evaluated',limitMicros:100,spentMicros:0,reservedMicros:0});
 await assert.rejects(reserve(db,'old','bad',1),/nicht aktiv/);await assert.rejects(reserve(db,'probe','too-much',11),/Budget/);
 assert.equal((await reserve(db,'probe','one',8)).dispatch,true);await settle(db,'probe','one',{status:'completed',costMicros:5});assert.equal(db.docs.get('taskLearningAutoRuns/s').spentMicros,95);
 await db.doc('taskLearningAutoRuns/s').update({probeStatus:'completed'});await assert.rejects(reserve(db,'probe','again',1),/nicht aktiv/);
});
