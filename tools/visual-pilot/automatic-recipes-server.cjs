'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {read,UID,login}=require('./access.cjs');
const probeCount=Number(process.argv[2]||6);if(![6,40].includes(probeCount))throw Error('Only own6/40-task assessment proofs allowed');const probeSuffix=probeCount===40?'-B':'';
async function call(name,data){const run=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../docs/evidence/interactive-generation-performance-20261026/generation-'+probeCount+probeSuffix+'.json')));if(!['startAssessmentAttempt','resumeAssessmentAttempt','submitAssessmentAttempt'].includes(name)||data.quizId!==run.quizId)throw Error('Outside own6-task assessment scope');const r=await fetch('https://europe-west1-gradecrew-staging-2026.cloudfunctions.net/'+name,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await login()},body:JSON.stringify({data})});const body=await r.json();if(!r.ok||body.error)throw Error(name+' HTTP '+r.status+' '+JSON.stringify(body.error));return body.result??body.data;}
const core=require('../../visual/core.js'),{assertNoSolutionLeak}=require('../../assessment-functions/lib/assessment-core.js');
const dir=path.resolve(__dirname,'../../docs/evidence/interactive-generation-performance-20261026'),privateDir='/tmp/gc-auto-recipes-attempts-'+probeCount;fs.mkdirSync(privateDir,{recursive:true,mode:0o700});
const save=(p,d)=>{fs.writeFileSync(p+'.tmp',JSON.stringify(d,null,2),{mode:0o600});fs.renameSync(p+'.tmp',p);};
(async()=>{
 const run=JSON.parse(fs.readFileSync(path.join(dir,'generation-'+probeCount+probeSuffix+'.json'))),bundle=JSON.parse(fs.readFileSync(path.join(dir,'generation-'+probeCount+probeSuffix+'-tasks.json')));
 const quiz=await read('quizzes/'+run.quizId);if(run.status!=='ready'||quiz.ownerId!==UID||quiz.generationJobId!==run.jobId)throw Error('Owner/job scope mismatch');
 if(!quiz.published){
  const url='https://firestore.googleapis.com/v1/projects/gradecrew-staging-2026/databases/(default)/documents/quizzes/'+run.quizId;
  const r=await fetch(url,{headers:{Authorization:'Bearer '+await login()}});if(!r.ok)throw Error('Publish preflight '+r.status);const raw=await r.json(),time=new Date().toISOString();
  const fields={published:{booleanValue:true},ended:{booleanValue:false},sessionState:{stringValue:'open'},sessionRunId:{nullValue:null},sessionStartedAt:{nullValue:null},showSolutions:{booleanValue:false},publishedAt:{timestampValue:time},updatedAt:{timestampValue:time},aiReviewAcknowledgedAt:{timestampValue:time}};
  const query=Object.keys(fields).map(k=>'updateMask.fieldPaths='+k).join('&')+'&currentDocument.updateTime='+encodeURIComponent(raw.updateTime);
  const out=await fetch(url+'?'+query,{method:'PATCH',headers:{Authorization:'Bearer '+await login(),'Content-Type':'application/json'},body:JSON.stringify({fields})});if(!out.ok)throw Error('Own publication '+out.status);
 }
 const results=[];
 for(const kind of ['correct','wrong_operator','wrong_number','blank']){
  const file=path.join(privateDir,kind+'.json');let s=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{quizId:run.quizId,clientAttemptId:crypto.randomBytes(24).toString('base64url'),attemptToken:crypto.randomBytes(32).toString('base64url')};save(file,s);
  if(s.done){results.push(s.evidence);continue;}
  if(!s.attemptId){const start=await call('startAssessmentAttempt',{quizId:s.quizId,studentName:'Staging QA '+kind,clientAttemptId:s.clientAttemptId,attemptToken:s.attemptToken});s.attemptId=start.attemptId;s.paper=start.paper;save(file,s);}
  assertNoSolutionLeak(s.paper);if(s.paper.length!==probeCount)throw Error('Paper count drift');
  const resumed=await call('resumeAssessmentAttempt',{quizId:s.quizId,attemptId:s.attemptId,attemptToken:s.attemptToken});if(resumed.paper&&JSON.stringify(resumed.paper)!==JSON.stringify(s.paper))throw Error('Resume changed paper');
  const answers={};if(kind!=='blank')for(let i=0;i<s.paper.length;i++){const t=JSON.parse(bundle.questions[i].visualTask);if(t.id!==JSON.parse(s.paper[i].visualTask).id)throw Error('Paper alignment');answers[s.paper[i].id]=core.solutionResponse(t);}
  if(['wrong_operator','wrong_number'].includes(kind)){const i=bundle.questions.findIndex(q=>{const t=JSON.parse(q.visualTask);return t.spec.layout==='dreisatz'&&(kind!=='wrong_operator'||t.spec.rows.flat().some(c=>c.input&&c.control==='operator'));}),t=JSON.parse(bundle.questions[i].visualTask);if(t.maxPoints/t.solution.cells.length!==.5)throw Error('Halfpoint contract');const cell=kind==='wrong_operator'?t.spec.rows.flat().find(c=>c.input&&c.control==='operator'):t.spec.rows.flat().find(c=>c.input&&!c.control);if(!cell)throw Error('Missing target field');answers[s.paper[i].id][cell.id]='__wrong__';}
  const result=await call('submitAssessmentAttempt',{quizId:s.quizId,attemptId:s.attemptId,attemptToken:s.attemptToken,answers});const receipt=result.receipt,expected=kind==='correct'?run.points:kind==='blank'?0:run.points-.5;if(receipt.totalPoints!==expected||receipt.maxPoints!==run.points)throw Error('Score mismatch '+kind+' '+receipt.totalPoints);
  const replay=await call('submitAssessmentAttempt',{quizId:s.quizId,attemptId:s.attemptId,attemptToken:s.attemptToken,answers:{}});if(JSON.stringify(replay.receipt)!==JSON.stringify(receipt))throw Error('Replay changed receipt');
  s.evidence={case:kind,expected,actual:receipt.totalPoints,maxPoints:receipt.maxPoints,resume:true,idempotent:true,solutionFreePaper:true};s.done=true;save(file,s);results.push(s.evidence);save(path.join(dir,probeCount===6?'server-verification.json':'server-verification-40-B.json'),{quizId:run.quizId,results});console.log(kind+' '+receipt.totalPoints+'/'+run.points);
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
