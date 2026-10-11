'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createRequire}=require('node:module'),path=require('node:path');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/);
const rf=createRequire(path.resolve(__dirname,'../../functions/package.json'));
const {initializeApp,deleteApp}=rf('firebase-admin/app'),{getFirestore}=rf('firebase-admin/firestore');
const app=initializeApp({projectId:'demo-gradecrew-usage-fix'}),db=getFirestore(app);
const {consumeQuota,logUsage,recordUsage,dayKey,monthKey}=rf('./lib/usage'),{createAccountActions}=rf('./lib/admin-account-actions');
async function seed(){for(const c of ['users','accountDeletions','accountActions','accountActionControl','adminAudit'])await db.recursiveDelete(db.collection(c));await db.doc('users/admin').set({role:'admin',status:'active'});await db.doc('users/teacher').set({role:'teacher',status:'active'});}
const counts=async()=>({quota:(await db.collection('users/teacher/aiUsage').get()).size,events:(await db.collection('users/teacher/aiEvents').get()).size,rollups:(await db.collection('users/teacher/aiUsageRollups').get()).size});
test.after(async()=>{await db.terminate();await deleteApp(app);});
test('active account usage retains quota, token, cache and model accounting atomically',async()=>{
 await seed();await consumeQuota('teacher','assistant');await logUsage('teacher','assistant',{input_tokens:12,output_tokens:8,total_tokens:20},{cacheHit:true,model:'synthetic-model'});
 const quota=(await db.doc(`users/teacher/aiUsage/${dayKey()}`).get()).data(),rollup=(await db.doc(`users/teacher/aiUsageRollups/${monthKey()}-assistant`).get()).data();
 assert.equal(quota.assistantCount,1);assert.equal(quota.assistantMinuteCount,1);assert.equal(rollup.requestCount,1);assert.equal(rollup.inputTokens,12);assert.equal(rollup.outputTokens,8);assert.equal(rollup.totalTokens,20);assert.equal(rollup.cacheHits,1);assert.equal(rollup.lastModel,'synthetic-model');assert.deepEqual(await counts(),{quota:1,events:1,rollups:1});
});
test('missing profile or durable deletion tombstone cannot recreate private quota/events/rollups',async()=>{
 for(const kind of ['missing','tombstone']){await seed();if(kind==='missing')await db.doc('users/teacher').delete();else await db.doc('accountDeletions/teacher').set({operationId:'synthetic-deleted'});
  await assert.rejects(logUsage('teacher','assistant',{total_tokens:4}),{code:'permission-denied'});await assert.rejects(consumeQuota('teacher','assistant'),{code:'permission-denied'});assert.deepEqual(await counts(),{quota:0,events:0,rollups:0});}
});
test('delayed real usage writer after completed account deletion preserves paid response without resurrecting private data',async()=>{
 await seed();await consumeQuota('teacher','assistant');await logUsage('teacher','assistant',{total_tokens:2});
 const identities=new Map(['admin','teacher'].map(uid=>[uid,{uid,disabled:false,tokensValidAfterTime:'1970-01-01T00:00:00Z'}]));
 const auth={getUser:async uid=>{if(!identities.has(uid))throw Object.assign(new Error('missing'),{code:'auth/user-not-found'});return identities.get(uid);},updateUser:async(uid,patch)=>Object.assign(identities.get(uid),patch),revokeRefreshTokens:async()=>{},deleteUser:async uid=>identities.delete(uid)};
 const service=createAccountActions({db,auth}),request=data=>({auth:{uid:'admin',token:{auth_time:Math.floor(Date.now()/1000)}},data});
 let finish;const providerWait=new Promise(resolve=>finish=resolve);const late=(async()=>{await providerWait;const saved=await recordUsage('teacher','assistant',{total_tokens:9});return{response:'already-generated-synthetic-result',saved};})();
 const preview=await service.preview(request({action:'delete',targets:['teacher']}));const deleted=await service.execute(request({operationId:preview.operationId}));assert.deepEqual(deleted.outcomes,[{id:'teacher',code:'complete'}]);assert.equal((await db.doc('users/teacher').get()).exists,false);assert.equal((await db.doc('accountDeletions/teacher').get()).exists,true);
 finish();assert.deepEqual(await late,{response:'already-generated-synthetic-result',saved:false});assert.deepEqual(await counts(),{quota:0,events:0,rollups:0});
});
