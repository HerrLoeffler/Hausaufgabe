'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {call,read,UID}=require('./normal-staging-repair-access.cjs'),{login}=require('./access.cjs');
const core=require('../../visual/core.js'),{assertNoSolutionLeak}=require('../../assessment-functions/lib/assessment-core.js');
const dir=path.resolve(__dirname,'../../docs/evidence/interactive-staging-repair-20261026'),privateDir='/tmp/gc-interactive-repair-attempts';fs.mkdirSync(privateDir,{recursive:true,mode:0o700});
const save=(p,d)=>{fs.writeFileSync(p+'.tmp',JSON.stringify(d,null,2),{mode:0o600});fs.renameSync(p+'.tmp',p);};
(async()=>{
 const run=JSON.parse(fs.readFileSync(path.join(dir,'generation-20.json'))),bundle=JSON.parse(fs.readFileSync(path.join(dir,'generation-20-tasks.json')));
 const quiz=await read('quizzes/'+run.quizId);if(quiz.ownerId!==UID||quiz.generationJobId!==run.jobId)throw Error('Owner/job scope mismatch');
 if(!quiz.published){
  const url='https://firestore.googleapis.com/v1/projects/gradecrew-staging-2026/databases/(default)/documents/quizzes/'+run.quizId;
  const r=await fetch(url,{headers:{Authorization:'Bearer '+await login()}});if(!r.ok)throw Error('Publish preflight '+r.status);const raw=await r.json(),time=new Date().toISOString();
  const fields={published:{booleanValue:true},ended:{booleanValue:false},sessionState:{stringValue:'open'},sessionRunId:{nullValue:null},sessionStartedAt:{nullValue:null},showSolutions:{booleanValue:false},publishedAt:{timestampValue:time},updatedAt:{timestampValue:time},aiReviewAcknowledgedAt:{timestampValue:time}};
  const query=Object.keys(fields).map(k=>'updateMask.fieldPaths='+k).join('&')+'&currentDocument.updateTime='+encodeURIComponent(raw.updateTime);
  const out=await fetch(url+'?'+query,{method:'PATCH',headers:{Authorization:'Bearer '+await login(),'Content-Type':'application/json'},body:JSON.stringify({fields})});if(!out.ok)throw Error('Own publication '+out.status);
 }
 const results=[];
 for(const kind of ['correct','one_half_point_wrong','blank']){
  const file=path.join(privateDir,kind+'.json');let s=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{quizId:run.quizId,clientAttemptId:crypto.randomBytes(24).toString('base64url'),attemptToken:crypto.randomBytes(32).toString('base64url')};save(file,s);
  if(s.done){results.push(s.evidence);continue;}
  if(!s.attemptId){const start=await call('startAssessmentAttempt',{quizId:s.quizId,studentName:'Staging QA '+kind,clientAttemptId:s.clientAttemptId,attemptToken:s.attemptToken});s.attemptId=start.attemptId;s.paper=start.paper;save(file,s);}
  assertNoSolutionLeak(s.paper);if(s.paper.length!==20)throw Error('Paper count drift');
  const resumed=await call('resumeAssessmentAttempt',{quizId:s.quizId,attemptId:s.attemptId,attemptToken:s.attemptToken});if(resumed.paper&&JSON.stringify(resumed.paper)!==JSON.stringify(s.paper))throw Error('Resume changed paper');
  const answers={};if(kind!=='blank')for(let i=0;i<s.paper.length;i++){const t=JSON.parse(bundle.questions[i].visualTask);if(t.id!==JSON.parse(s.paper[i].visualTask).id)throw Error('Paper alignment');answers[s.paper[i].id]=core.solutionResponse(t);}
  if(kind==='one_half_point_wrong'){const i=bundle.questions.findIndex(q=>JSON.parse(q.visualTask).spec.layout==='dreisatz');const t=JSON.parse(bundle.questions[i].visualTask);if(t.maxPoints/t.solution.cells.length!==0.5)throw Error('Expected half point fields');answers[s.paper[i].id][t.solution.cells[0].id]='__wrong__';}
  const result=await call('submitAssessmentAttempt',{quizId:s.quizId,attemptId:s.attemptId,attemptToken:s.attemptToken,answers});const receipt=result.receipt,expected=kind==='correct'?60:kind==='blank'?0:59.5;if(receipt.totalPoints!==expected||receipt.maxPoints!==60)throw Error('Score mismatch '+kind+' '+receipt.totalPoints);
  const replay=await call('submitAssessmentAttempt',{quizId:s.quizId,attemptId:s.attemptId,attemptToken:s.attemptToken,answers:{}});if(JSON.stringify(replay.receipt)!==JSON.stringify(receipt))throw Error('Replay changed receipt');
  s.evidence={case:kind,expected,actual:receipt.totalPoints,maxPoints:receipt.maxPoints,resume:true,idempotent:true,solutionFreePaper:true};s.done=true;save(file,s);results.push(s.evidence);save(path.join(dir,'server-verification.json'),{quizId:run.quizId,results});console.log(kind+' '+receipt.totalPoints+'/60');
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
