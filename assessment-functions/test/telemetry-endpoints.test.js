"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../lib/telemetry-core');
class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
function setup(){
 const data=new Map([['users/teacher',{role:'teacher',status:'active'}],['users/other',{role:'teacher',status:'active'}],['quizzes/ABCD',{ownerId:'teacher',sessionRunId:'run'}],['assessmentPrivate/ABCD_a_'+ 'a'.repeat(28),{tokenHash:'T'.repeat(43)}]]);
 const snap=path=>({exists:data.has(path),data:()=>structuredClone(data.get(path)),ref:{path}});
 const doc=path=>({path,get:async()=>snap(path)});
 const tx={get:async r=>snap(r.path),create:(r,v)=>{if(data.has(r.path))throw Error('duplicate');data.set(r.path,structuredClone(v));},set:(r,v)=>data.set(r.path,{...data.get(r.path),...structuredClone(v)})};
 const db={doc,runTransaction:fn=>fn(tx),collection:path=>{
  const filter=[];let bound=Infinity;
  const q={where:(...args)=>{filter.push(args);return q;},limit:n=>{bound=n;return q;},get:async()=>{
   let rows=[...data].filter(([k])=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/'));
   for(const [key,op,value] of filter)rows=rows.filter(([,r])=>op==='=='?r[key]===value:r[key]<=value);
   rows=rows.slice(0,bound);return {size:rows.length,docs:rows.map(([k,v])=>({data:()=>structuredClone(v),ref:{path:k}}))};
  }};return q;
 }};
 const handlers={},exports={};let active=true;
 const req=id=>{
  if(id==='firebase-admin/firestore')return {getFirestore:()=>db,Timestamp:{fromMillis:x=>x,now:()=>Date.now()}};
  if(id==='firebase-functions/v2/https')return {onCall:(o,h)=>h,HttpsError};
  if(id==='firebase-functions/v2/scheduler')return {onSchedule:(o,h)=>h};
  if(id==='./assessment-core')return {secureTokenMatches:(a,b)=>a===b};
  if(id==='./telemetry-core')return {...core,enabled:()=>active};
  throw Error(id);
 };
 vm.runInNewContext(fs.readFileSync(require.resolve('../lib/telemetry'),'utf8'),{require:req,exports,Date,process:{env:{}}});
 return {handlers:exports,data,disable:()=>active=false};
}
const batch=()=>({scope:{quizId:'ABCD',attemptId:null,attemptToken:null},release:'a'.repeat(40),events:[{id:'12345678-1234-4123-8123-123456789abc',at:new Date().toISOString(),action:'submit',outcome:'ok',code:'none',durationMs:23,trigger:'manual',reference:''}]});
test('authorized write deduplicates and rejects conflicting retry',async()=>{
 const {handlers,data}=setup(),b=batch();const request={auth:{uid:'teacher'},data:b};
 assert.equal((await handlers.collectAssessmentTelemetry(request)).accepted,1);
 assert.equal((await handlers.collectAssessmentTelemetry(request)).duplicate,1);
 b.events[0].durationMs++;await assert.rejects(handlers.collectAssessmentTelemetry(request),e=>e.code==='already-exists');
 assert.equal([...data.keys()].filter(k=>k.startsWith('telemetryPrivateEvents/')).length,1);
});
test('foreign teacher, missing pupil credential and wrong token denied',async()=>{
 const {handlers}=setup();await assert.rejects(handlers.collectAssessmentTelemetry({auth:{uid:'other'},data:batch()}),e=>e.code==='permission-denied');
 await assert.rejects(handlers.collectAssessmentTelemetry({data:batch()}),e=>e.code==='unauthenticated');
 const b=batch();b.scope.attemptId='a_'+ 'a'.repeat(28);b.scope.attemptToken='X'.repeat(43);
 await assert.rejects(handlers.collectAssessmentTelemetry({data:b}),e=>e.code==='permission-denied');
});
test('pupil token authorizes own scope without persisting token or answers',async()=>{
 const {handlers,data}=setup(),b=batch();b.scope.attemptId='a_'+ 'a'.repeat(28);b.scope.attemptToken='T'.repeat(43);
 await handlers.collectAssessmentTelemetry({data:b});const row=[...data].find(([k])=>k.startsWith('telemetryPrivateEvents/'))[1];
 assert.equal(JSON.stringify(row).includes('T'.repeat(43)),false);assert.equal(row.ownerId,'teacher');
});
test('disabled endpoint and suspended account deny writes',async()=>{
 const s=setup();s.disable();await assert.rejects(s.handlers.collectAssessmentTelemetry({auth:{uid:'teacher'},data:batch()}),e=>e.code==='failed-precondition');
 const t=setup();t.data.set('users/teacher',{status:'suspended'});await assert.rejects(t.handlers.collectAssessmentTelemetry({auth:{uid:'teacher'},data:batch()}),e=>e.code==='permission-denied');
});
test('summary is owner-scoped and does not include raw records',async()=>{
 const {handlers,data}=setup();await handlers.collectAssessmentTelemetry({auth:{uid:'teacher'},data:batch()});
 data.set('telemetryPrivateEvents/foreign',{...core.projectEvent(batch().events[0],{ownerId:'other',scopeKey:'foreign',release:'b'.repeat(40),now:Date.now()})});
 const s=await handlers.getAssessmentTelemetrySummary({auth:{uid:'teacher'},data:{days:7}});assert.equal(s.receivedRecords,1);assert.equal(s.operations.submit.count,1);assert.equal(JSON.stringify(s).includes('foreign'),false);
});
test('run diagnostics use stored state, protect owner, unknown expected stays null',async()=>{
 const {handlers,data}=setup();data.set('quizzes/ABCD/attempts/a',{sessionRunId:'run',status:'submitted',studentName:'PRIVATE'});
 data.set('quizzes/ABCD/submissions/a',{sessionRunId:'run',autoSubmitted:false,answers:'PRIVATE'});
 const r=await handlers.getAssessmentRunDiagnostics({auth:{uid:'teacher'},data:{quizId:'ABCD'}});
 assert.equal(r.confirmedSubmissions,1);assert.equal(r.counts.manual,1);assert.equal(r.expectedParticipants,null);assert.equal(JSON.stringify(r).includes('PRIVATE'),false);
 await assert.rejects(handlers.getAssessmentRunDiagnostics({auth:{uid:'other'},data:{quizId:'ABCD'}}),e=>e.code==='permission-denied');
});
