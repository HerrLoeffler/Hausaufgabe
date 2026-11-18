"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {HttpsError}=require('firebase-functions/v2/https');
const index=fs.readFileSync(require.resolve('../index.js'),'utf8'),main=fs.readFileSync(require.resolve('../main.js'),'utf8');
test('synchronous generation cannot spend provider calls outside the counted pilot job path',async()=>{
 let calls=0;const c=vm.createContext({exports:{},callableOpts:{},onCall:(_o,fn)=>fn,HttpsError,reportAiError:e=>e,requireAiUser:async()=>({uid:'teacher'}),billingRuntime:{enabledFor:async()=>true,requireFeature:async()=>({})},generateTestForUser:async()=>{calls++;return{};}});
 vm.runInContext(index.slice(index.indexOf('exports.generateTest ='),index.indexOf('\nfunction aiJobLock')),c);
 await assert.rejects(c.exports.generateTest({data:{}}),{code:'failed-precondition'});assert.equal(calls,0);
});
test('trash audio cleanup accepts the real legacy omitted solutionDrafts without a paid edit',async()=>{
 let paid=0;const c=vm.createContext({HttpsError,requireAiUser:async()=>({uid:'teacher',profile:{role:'teacher'}}),getFirestore:()=>({doc:()=>({get:async()=>({exists:true,data:()=>({ownerId:'teacher',isDeleted:true,published:false})})})}),billingRuntime:{requireFeature:async()=>{paid++;throw new HttpsError('permission-denied','Expired');}}});
 vm.runInContext(main.slice(main.indexOf('async function requireAudioQuizAccess('),main.indexOf('\nconst getQuestionAudioDrafts')),c);
 await c.requireAudioQuizAccess({data:{drafts:[]}},'TRASH001',{write:true});assert.equal(paid,0);
 await assert.rejects(c.requireAudioQuizAccess({data:{drafts:[{questionId:'q1',script:'New'}]}},'TRASH001',{write:true}),{code:'permission-denied'});
});
