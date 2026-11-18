'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {login,PROJECT}=require('../../visual-pilot/access.cjs');
const {RUN}=require('./cases.cjs');
const {fullAnswer}=require('./runner.cjs');
(async()=>{
  const audit=JSON.parse(fs.readFileSync('/private/tmp/gc-remy-training-audit-private.json','utf8'));
  const token=await login(),root='https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review';
  async function call(data,authenticated=true){
    const response=await fetch(root,{method:'POST',headers:{'Content-Type':'application/json',...(authenticated?{Authorization:'Bearer '+token}:{})},
      body:JSON.stringify({data}),signal:AbortSignal.timeout(30000)});
    const body=await response.json();
    if(body.error)throw Error(body.error.status);
    return body.result;
  }
  await assert.rejects(call({action:'list',quizId:'training:'+RUN},false),/UNAUTHENTICATED/);
  const directRead=await fetch('https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/taskLearningRuns/'+RUN,
    {headers:{Authorization:'Bearer '+token}});
  assert.equal(directRead.status,403);
  const state=await call({action:'trainingStatus',runId:RUN});
  const {tasks}=await call({action:'list',quizId:'training:'+RUN});
  assert.equal(tasks.length,60);
  assert.equal(state.reservedMicros,0);
  const results=[];
  for(let i=0;i<tasks.length;i+=4){
    results.push(...await Promise.all(tasks.slice(i,i+4).map(async task=>{
      const c=audit.cases.find(c=>c.id===task.id);assert.equal(c.status,'ready');
      assert.doesNotMatch(JSON.stringify(task),/"(?:solution|accepted|correct)":/);
      const scope={quizId:task.quizId,id:task.id,version:task.version};
      const answer=fullAnswer(c.q),partial=c.q.type==='single'?-1:{...answer,[Object.keys(answer)[0]]:'falsch'};
      const values=await Promise.all([answer,null,partial].map(answer=>call({action:'score',...scope,answer})));
      assert.equal(values[0].points,c.q.points,task.id);
      assert.equal(values[1].points,0,task.id);
      assert.equal(values[2].points,c.q.points-.5,task.id);
      return {id:task.id,family:c.family,kind:c.plan.kind,version:task.version,full:values[0].points,blank:values[1].points,oneWrong:values[2].points};
    })));
  }
  const original=await Promise.all([null,'REMYRND2','REMYRND3','REMYRND4','REMYRND5','REMYMIX6'].map(quizId=>call({action:'list',...(quizId?{quizId}:{})})));
  assert.deepEqual(original.map(x=>x.tasks.length),[30,12,3,3,2,30]);
  assert.equal(original[0].tasks[0].review.verdict,'bad');
  assert.equal(original[1].tasks[0].review.verdict,'good');
  const receipt={at:new Date().toISOString(),runId:RUN,anonymousDenied:true,directClientReadDenied:true,oldDeckSizes:[30,12,3,3,2,30],
    syntheticPriorRatingsPreserved:true,scoreRequests:180,totalPoints:results.reduce((s,q)=>s+q.full,0),cases:results};
  fs.writeFileSync(path.resolve(__dirname,'../../../docs/evidence/remy-training-20261118/server-verification.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({cards:60,scoreRequests:180,totalPoints:receipt.totalPoints,allBlankZero:true,directClientReadDenied:true}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
