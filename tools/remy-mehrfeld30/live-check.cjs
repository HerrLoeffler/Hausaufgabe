'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {core,parseVisualTask}=require('../../functions/lib/visual-task');
const {login,PROJECT}=require('../visual-pilot/access.cjs');
const dest='./docs/evidence/remy-mehrfeld30-20261109/';
const url='https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review';
async function call(data,token){
  const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
  const r=await fetch(url,{method:'POST',headers,body:JSON.stringify({data}),signal:AbortSignal.timeout(50000)});
  const body=await r.json();
  return {http:r.status,error:body.error?.status,result:body.result??body.data};
}
(async()=>{
  const anonymous=await call({action:'list'});
  assert.equal(anonymous.error,'UNAUTHENTICATED');
  const token=await login();
  const list=(await call({action:'list'},token)).result;
  assert.ok(list?.tasks.length>=22);
  assert.equal(list.expected,30);
  assert.ok(list.tasks.every(task=>!task.visual||!Object.hasOwn(task.visual,'solution')));
  assert.ok(list.tasks.every(task=>task.options.every(o=>typeof o==='string')));
  const task=list.tasks[0];
  const q=JSON.parse(fs.readFileSync(dest+'direkt-tasks.private.json')).questions.find(q=>q.id===task.id);
  const privateTask=parseVisualTask(q.visualTask,{points:q.points});
  const fields={quizId:task.quizId,id:task.id,version:task.version};
  const good=await call({action:'score',...fields,answer:core.solutionResponse(privateTask)},token);
  const blank=await call({action:'score',...fields,answer:null},token);
  assert.equal(good.result?.points,q.points);
  assert.equal(blank.result?.points,0);
  const stale=await call({action:'rate',...fields,version:'outdated',verdict:'good',eventId:'00000000-0000-4000-8000-000000000030'},token);
  assert.equal(stale.error,'FAILED_PRECONDITION');
  const positive={action:'rate',...fields,verdict:'good',eventId:'00000000-0000-4000-8000-000000000030'};
  const rating=(await call(positive,token)).result?.rating;
  assert.equal(rating?.verdict,'good');
  const replay=(await call(positive,token)).result?.rating;
  assert.equal(replay?.verdict,'good');
  const negative={...positive,verdict:'bad',reason:'auftrag',comment:'Synthetische Funktionsprüfung',eventId:'00000000-0000-4000-8000-000000000031'};
  assert.equal((await call(negative,token)).result?.rating?.verdict,'bad');
  const loaded=(await call({action:'list'},token)).result;
  const stored=loaded.tasks.find(t=>t.version===task.version)?.review;
  assert.equal(stored?.verdict,'bad');
  assert.equal(stored?.reason,'auftrag');
  const receipt={checkedAt:new Date().toISOString(),project:PROJECT,count:loaded.tasks.length,expected:loaded.expected,
    anonymousDenied:true,projectionSolutionFree:true,score:{complete:good.result.points,blank:blank.result.points},
    staleRatingRejected:true,goodAndBadStored:true,reviewPersistedAfterList:true,duplicateEventReplayed:true,reviewAccount:'synthetic'};
  fs.writeFileSync(dest+'server-verification.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
