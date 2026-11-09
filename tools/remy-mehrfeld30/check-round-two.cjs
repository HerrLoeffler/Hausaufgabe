'use strict';
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const fs=require('node:fs');
const {login,PROJECT}=require('../visual-pilot/access.cjs');
const {roundTwo,roundTwoCode}=require('./round-two.cjs');
const url='https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review';
async function request(data,token){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({data}),signal:AbortSignal.timeout(40000)});
  return r.json();
}
(async()=>{
  const token=await login();
  const noAuth=await request({action:'list',quizId:roundTwoCode});
  assert.equal(noAuth.error?.status,'UNAUTHENTICATED');
  async function call(data){
    const body=await request(data,token);
    if(body.error)throw Error(body.error.message);
    return body.result;
  }
  const before=await call({action:'list'});
  assert.equal(before.tasks.length,30);
  assert.equal(before.tasks[0].review?.verdict,'bad');
  const newDeck=await call({action:'list',quizId:roundTwoCode});
  assert.equal(newDeck.tasks.length,12);
  assert.ok(newDeck.tasks.every(task=>!task.visual?.solution&&task.diagram?.fields.every(f=>!Object.hasOwn(f,'accepted'))!==false));
  const task=newDeck.tasks.find(q=>q.id==='r2-bahn');
  const q=roundTwo.find(q=>q.id===task.id);
  const fields={quizId:task.quizId,id:task.id,version:task.version};
  const full=Object.fromEntries(q.fields.map(f=>[f.id,f.accepted[0]]));
  const correct=await call({action:'score',...fields,answer:full});
  assert.equal(correct.points,1.5);
  const partial=await call({action:'score',...fields,answer:{einzel:'24,0'}});
  assert.equal(partial.points,.5);
  const payload={action:'rate',...fields,verdict:'good',eventId:randomUUID(),comment:'Synthetische Funktionsprüfung'};
  assert.equal((await call(payload)).rating.verdict,'good');
  assert.equal((await call(payload)).rating.verdict,'good');
  const reloaded=await call({action:'list',quizId:roundTwoCode});
  assert.equal(reloaded.tasks.find(q=>q.id===task.id).review?.verdict,'good');
  const receipt={at:new Date().toISOString(),firstRound:30,secondRound:12,oldSyntheticRatingPreserved:true,
    roundTwoRatingStored:true,repeatRequestIdAccepted:true,complete:correct.points,partial:partial.points,publicKeysAbsent:true,anonymousDenied:true};
  fs.writeFileSync('docs/evidence/remy-mehrfeld30-20261109/round-two-server.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
