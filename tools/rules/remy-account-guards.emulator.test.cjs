'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createHash}=require('node:crypto'),{createRequire}=require('node:module'),path=require('node:path');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/);
const rf=createRequire(path.resolve(__dirname,'../../functions/package.json'));
const {initializeApp,deleteApp}=rf('firebase-admin/app'),{getFirestore,Timestamp}=rf('firebase-admin/firestore');
const app=initializeApp({projectId:'demo-gradecrew-remy-account-merge'}),db=getFirestore(app);
const {requireAiUser}=rf('./lib/access'),{requireAccountWrite}=rf('./lib/account-state'),{reserveJob}=rf('./lib/job-slots');
const {consumeQuota,recordUsage}=rf('./lib/usage'),{createQuickRemyService}=rf('./lib/quick-remy-flow');
const source=fs.readFileSync(path.resolve(__dirname,'../../functions/index.js'),'utf8');
const start=source.indexOf('async function startAiTestJobForUser('),end=source.indexOf('\nexports.startAiTestJob',start);assert.ok(start>=0&&end>start);
let enqueued=0;
const context=vm.createContext({getFirestore:()=>db,Timestamp,createHash,requireAccountWrite,
 cleanInput:data=>({topic:data.topic||'Synthetic Remy topic',subject:'Mathematik',grade:'6',count:8,solutionAudioQuestionCount:0}),sanitizeMaterials:()=>[],
 enqueueAiTestJob:async()=>{enqueued++;},HttpsError:rf('firebase-functions/v2/https').HttpsError,
 reserveJob:(database,args)=>reserveJob(database,{...args,jobData:{...args.jobData,input:{...args.jobData.input}}})});
const lockStart=source.indexOf('function aiJobLock('),lockEnd=source.indexOf('async function releaseAiJob(',lockStart);
vm.runInContext(source.slice(lockStart,lockEnd)+source.slice(start,end),context);
async function seed(){enqueued=0;for(const c of ['users','accountDeletions','aiJobs'])await db.recursiveDelete(db.collection(c));await db.doc('users/teacher').set({role:'teacher',status:'active'});}
const request={auth:{uid:'teacher'},data:{requestId:'merge-voice-1',conversationText:'Mathe Klasse6 Brüche'}};
test.after(async()=>{await db.terminate();await deleteApp(app);});
test('shared Remy starter preserves pending dispatch, same-ID queue retry and fresh transactional account guard',async()=>{
 await seed();const input={topic:'Original synthetic content',clientRequestId:'merge-voice-1'};
 const first=await context.startAiTestJobForUser('teacher',input),ref=db.doc(`aiJobs/${first.jobId}`);assert.equal((await ref.get()).data().dispatchState,'pending');assert.equal(enqueued,1);
 await ref.update({status:'failed',stage:'queue-failed'});await db.doc('users/teacher/aiRuntime/current').delete();
 const retry=await context.startAiTestJobForUser('teacher',{...input,topic:'Must not replace original'});assert.equal(retry.jobId,first.jobId);assert.equal((await ref.get()).data().input.topic,'Original synthetic content');assert.equal((await ref.get()).data().status,'queued');assert.equal(enqueued,2);
 const cached=await requireAiUser(request);await db.doc('accountDeletions/teacher').set({operationId:'synthetic-delete'});await db.doc('users/teacher').delete();await db.recursiveDelete(db.collection('aiJobs'));
 await assert.rejects(context.startAiTestJobForUser(cached.uid,{...input,clientRequestId:'merge-late'}),{code:'permission-denied'});assert.equal((await db.collection('aiJobs').get()).size,0);assert.equal((await db.doc('users/teacher/aiRuntime/current').get()).exists,true);assert.equal(enqueued,2);
});
test('Quick Remy quota and delayed actual usage respect account tombstones without discarding a prepared response',async()=>{
 await seed();let finish;const wait=new Promise(resolve=>finish=resolve);
 const service=createQuickRemyService({requireUser:requireAiUser,consumeQuota,recordUsage,interpret:async()=>{await wait;return{data:{status:'ready',preparedRequest:{subject:'Mathematik',grade:'6',topic:'Brüche',count:8}},usage:{total_tokens:7}};},startJob:async()=>{throw new Error('prepare must not start a job');},findSubmission:async()=>null});
 const prepared=service.prepare(request);for(let i=0;i<40;i++){if(!(await db.collection('users/teacher/aiUsage').get()).empty)break;await new Promise(resolve=>setTimeout(resolve,10));}
 const quota=(await db.collection('users/teacher/aiUsage').get()).docs[0]?.data();assert.equal(quota.quickRemyCount,1);
 await db.doc('accountDeletions/teacher').set({operationId:'synthetic-delete'});await db.doc('users/teacher').delete();await db.recursiveDelete(db.collection('users/teacher/aiUsage'));
 finish();const result=await prepared;assert.equal(result.status,'ready');assert.equal(result.preparedRequest.topic,'Brüche');
 await assert.rejects(consumeQuota('teacher','quickRemy'),{code:'permission-denied'});
 for(const c of ['aiUsage','aiEvents','aiUsageRollups'])assert.equal((await db.collection(`users/teacher/${c}`).get()).size,0,c);
});
