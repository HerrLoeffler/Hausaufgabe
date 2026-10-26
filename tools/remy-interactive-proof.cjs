'use strict';
// Bounded verification for the existing synthetic staging account; never a generator.
const fs=require('node:fs'),crypto=require('node:crypto');
const access=require('./visual-pilot/access.cjs');
const {core}=require('../assessment-functions/lib/visual-task');
const {assertNoSolutionLeak}=require('../assessment-functions/lib/assessment-core');
const quizId='BZFKMUEB',dir='.review-local/remy26',report='docs/evidence/remy-interactive-20261026/server-checks.json';
async function call(name,data){if(!['StartAssessmentAttempt','ResumeAssessmentAttempt','SubmitAssessmentAttempt'].includes(name))throw Error('Proof endpoint out of scope');const r=await fetch('https://europe-west1-'+access.PROJECT+'.cloudfunctions.net/remy26'+name,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await access.login()},body:JSON.stringify({data}),signal:AbortSignal.timeout(55000)});const d=await r.json();if(!r.ok||d.error)throw Error(name+' HTTP '+r.status+' '+JSON.stringify(d.error));return d.result??d.data;}
function save(p,v){fs.writeFileSync(p+'.tmp',JSON.stringify(v,null,2)+'\n',{mode:0o600});fs.renameSync(p+'.tmp',p);}
(async()=>{
 if(!process.argv.includes('--execute'))throw Error('Explicit --execute needed');
 fs.mkdirSync(dir,{recursive:true});
 const quiz=await access.read('quizzes/'+quizId);if(quiz.ownerId!==access.UID||!quiz.published||quiz.generationJobId!=='4107be8859d80691d522c2010d262b42c6333279')throw Error('Own published proof scope mismatch');
 const qs=await access.read('quizzes/'+quizId+'/questions?pageSize=100');qs.sort((a,b)=>a.position-b.position);
 const tasks=new Map(qs.map(q=>[q.id,JSON.parse(q.visualTask)])),results=[];
 for(const kind of ['correct','blank','mixed','wrong','tolerance','duplicate-cards']){
  const expected={correct:12,blank:0,mixed:6,wrong:0,tolerance:12,'duplicate-cards':0}[kind],file=dir+'/'+kind+'.json';
  let state=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{quizId,studentName:'QA Remy '+kind,clientAttemptId:crypto.randomBytes(24).toString('base64url'),attemptToken:crypto.randomBytes(32).toString('base64url'),phase:'prepared'};save(file,state);
  if(state.phase==='done'){results.push(state.evidence);continue;}
  if(!state.attemptId){const started=await call('StartAssessmentAttempt',state);state.attemptId=started.attemptId;state.paper=started.paper;state.phase='started';save(file,state);}
  assertNoSolutionLeak(state.paper);if(state.paper.length!==6)throw Error('Paper count mismatch');
  const resumed=await call('ResumeAssessmentAttempt',{quizId,attemptId:state.attemptId,attemptToken:state.attemptToken});if(JSON.stringify(resumed.paper)!==JSON.stringify(state.paper))throw Error('Frozen paper changed');
  const answers={};for(let i=0;i<state.paper.length;i++){
   const q=state.paper[i],t=tasks.get(q.id);if(!t||JSON.parse(q.visualTask).id!==t.id)throw Error('Question mismatch');
   if(kind==='blank'||kind==='mixed'&&i%2===1)continue;
   let answer=core.solutionResponse(t);
   if(kind==='tolerance'&&t.format==='angle')answer=t.solution.value+t.solution.tolerance;
   if(kind==='wrong')answer=t.format==='angle'?'179':t.format==='coordinate'?[{x:0,y:0},{x:0,y:0}]:t.format==='hotspot'?[]:t.format==='sequence'?[]:{};
   if(kind==='duplicate-cards'){if(t.format==='timeline')answer=Object.fromEntries(t.spec.ticks.map(tick=>[tick.id,t.spec.events[0].id]));else if(t.format==='sequence')answer=t.spec.items.map(()=>t.spec.items[0].id);else continue;}
   answers[q.id]=answer;
  }
  const payload={quizId,attemptId:state.attemptId,attemptToken:state.attemptToken,answers};state.phase='submitting';save(file,state);
  const result=await call('SubmitAssessmentAttempt',payload),receipt=result.receipt;
  if(receipt.totalPoints!==expected||receipt.maxPoints!==12)throw Error(kind+' awarded '+receipt.totalPoints+' expected '+expected);
  let idempotent=null;if(kind==='correct'){const repeated=await call('SubmitAssessmentAttempt',{...payload,answers:{}});idempotent=JSON.stringify(repeated.receipt)===JSON.stringify(receipt);if(!idempotent)throw Error('Duplicate submit changed score');}
  state.evidence={case:kind,expected,totalPoints:receipt.totalPoints,maxPoints:receipt.maxPoints,publicPaperSolutionFree:true,resumePaperUnchanged:true,idempotent,at:new Date().toISOString()};state.phase='done';save(file,state);results.push(state.evidence);save(report,{project:access.PROJECT,quizId,jobId:quiz.generationJobId,formats:qs.map(q=>JSON.parse(q.visualTask).format),results});console.log(kind+' '+receipt.totalPoints+'/12');
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
