'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseVisualTask,core}=require('../../assessment-functions/lib/visual-task.js');
const engine=require('../../assessment-functions/lib/assessment-core.js');
const dir=path.resolve(__dirname,'../../docs/evidence/visual-pilot-24-20261025');
const report={at:new Date().toISOString(),tests:[],failures:[],checks:0};
function verify(condition,label){report.checks++;if(!condition)throw Error(label);}
for(const name of fs.readdirSync(dir).filter(x=>/-quiz.json$/.test(x)).sort()){
 const data=JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));const test={id:data.pilotId,quizId:data.quiz.id,questions:[],failures:[]};report.tests.push(test);
 try{verify(data.questions.length===8,'Expected 8 questions');verify(data.questions.every(q=>q.type==='visual'),'Classical fallback type');verify(data.questions.reduce((s,q)=>s+q.points,0)===16,'Point total must be 16');}catch(e){test.failures.push(e.message);}
 for(const [i,q] of data.questions.entries()){
 const r={position:i+1,id:q.id,checks:[],failure:null};test.questions.push(r);
 try{
 const t=parseVisualTask(q.visualTask,{points:q.points});r.format=t.format;const correct=core.solutionResponse(t);
 const key=engine.buildGradingKey(q,'pilot-private-salt');
 verify(engine.gradeQuestion(key,correct).awardedPoints===q.points,'Correct key response not full points');r.checks.push('correct');
 verify(engine.gradeQuestion(key,null).awardedPoints===0,'Blank response gets points');r.checks.push('blank');
 verify(engine.gradeQuestion(key,'__INVALID__').awardedPoints===0,'Invalid response gets points');r.checks.push('invalid');
 const pub=engine.buildPublicQuestion(q,'pilot-private-salt');const p=JSON.parse(pub.visualTask);verify(!p.solution&&!p.review&&!p.rationale&&!p.provenance,'Public private-field leak');r.checks.push('publicProjection');
 const stored=engine.sanitizeAnswersForStorage([key],{[key.id]:correct});verify(engine.gradeQuestion(key,stored[key.id]).awardedPoints===q.points,'Serialized response mismatch');r.checks.push('roundtrip');
 if(t.format==='grid'){const answer=Array.from({length:t.solution.count},(_,n)=>t.spec.rows*t.spec.columns-1-n);verify(engine.gradeQuestion(key,answer).awardedPoints===q.points,'Equivalent grid rejected');r.checks.push('alternativeGrid');}
 if(['table','chart','labeling'].includes(t.format)&&Object.keys(correct).length>1){const partial={...correct};delete partial[Object.keys(partial)[0]];const n=engine.gradeQuestion(key,partial).awardedPoints;verify(n>=0&&n<q.points,'Partial answer must lose points');r.checks.push('partial');}
 if(t.format==='angle'||t.format==='scale'){const s=t.solution;const b=s.value+s.tolerance;if(b<=(t.format==='angle'?180:t.spec.max)){verify(engine.gradeQuestion(key,b).awardedPoints===q.points,'Tolerance border rejected');verify(engine.gradeQuestion(key,b+0.01).awardedPoints===0,'Outside tolerance accepted');r.checks.push('tolerance');}}
 }catch(e){r.failure=e.message;test.failures.push('Q'+(i+1)+': '+e.message);}
 }
 report.failures.push(...test.failures.map(x=>test.id+' '+x));
}
fs.writeFileSync(path.join(dir,'deterministic-checks.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({tests:report.tests.length,questions:report.tests.reduce((s,t)=>s+t.questions.length,0),checks:report.checks,failures:report.failures}));
process.exitCode=report.failures.length?1:0;
