'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {login,PROJECT}=require('../../visual-pilot/access.cjs');
const {GRAPH_RUN:RUN}=require('./graph-profile.cjs'),{fullAnswer}=require('./runner.cjs');
const root=path.resolve(__dirname,'../../../docs/evidence/fields-arrows8-20261118');
(async()=>{
 const audit=JSON.parse(fs.readFileSync('/private/tmp/gc-graph-audit-private.json','utf8')),token=await login();
 async function call(data,auth=true){
  const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({data})});
  const b=await r.json();if(b.error)throw Error(b.error.status+' '+b.error.message);return b.result;
 }
 await assert.rejects(call({action:'list',quizId:'training:'+RUN},false),/UNAUTHENTICATED/);
 const listed=await call({action:'list',quizId:'training:'+RUN});assert.equal(listed.tasks.length,8);
 const results=[];
 for(const task of listed.tasks){
  const c=audit.cases.find(c=>c.id===task.id);assert.equal(c.status,'ready');
  assert.doesNotMatch(JSON.stringify(task),/"(?:accepted|solution|correct)":/);
  const scope={quizId:task.quizId,id:task.id,version:task.version};
  if(task.notice){await assert.rejects(call({action:'score',...scope,answer:null}),/FAILED_PRECONDITION/);results.push({id:task.id,kind:c.plan.kind,ungraded:true});continue;}
  const answer=fullAnswer(c.q);let partial;
  if(task.diagram)partial={...answer,[Object.keys(answer)[0]]:'falsch'};
  else if(c.q.trainingPolicy)partial={...answer,[Object.keys(answer)[0]]:'falsch'};
  else partial=answer.slice(1);
  const values=[];for(const a of [answer,null,partial])values.push(await call({action:'score',...scope,answer:a}));
  assert.equal(values[0].points,c.q.points,task.id);assert.equal(values[1].points,0,task.id);assert.equal(values[2].points,c.q.points-.5,task.id);
  results.push({id:task.id,kind:c.plan.kind,full:values[0].points,blank:0,oneWrong:values[2].points,version:task.version});
 }
 const previous=await call({action:'list',quizId:'training:dreisatz60-20261118-v1'});assert.equal(previous.tasks.length,60);
 fs.writeFileSync(path.join(root,'server-verification.json'),JSON.stringify({at:new Date().toISOString(),anonymousDenied:true,previous60Preserved:true,cases:results},null,2)+'\n');
 console.log(JSON.stringify({actualTasks:results.filter(x=>!x.ungraded).length,ungraded:results.filter(x=>x.ungraded).length,allScoresVerified:true}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
