'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {login,PROJECT,UID}=require('../../visual-pilot/access.cjs');
const auth=require('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/gradecrew/tools/rules/node_modules/firebase-tools/lib/auth');
const decode=v=>v?.stringValue??v?.booleanValue??(v?.integerValue!==undefined?Number(v.integerValue):undefined)??v?.doubleValue??(v?.arrayValue?(v.arrayValue.values||[]).map(decode):undefined)??(v?.mapValue?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)])):undefined)??null;
const document=d=>Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]));
(async()=>{
 const root=path.resolve(__dirname,'../../../docs/evidence/fields-arrows8-20261118'),free=JSON.parse(fs.readFileSync(path.join(root,'free-english.json'),'utf8'));
 assert.equal(UID,'gc-visual255-e2e');assert.match(free.runId,/^graph-[a-f0-9]{32}$/);
 const account=auth.getGlobalDefaultAccount(),admin=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
 const base='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/';
 async function read(p){const r=await fetch(base+p,{headers:{Authorization:'Bearer '+admin.access_token}});assert.equal(r.status,200);return r.json();}
 const generation=document(await read('taskLearningRuns/'+free.runId+'/providerCalls/wish-a1-generate'));
 const examples=JSON.parse(generation.request.input[1].content).teacherExamples;
 assert.ok(examples.some(x=>x.verdict==='good'&&x.reason.includes('Synthetischer UI-Test: Die Verbformen')&&x.structure.fields.length===3));
 const memory=(await read('taskLearningTeacherMemory/'+UID+'/examples?pageSize=100')).documents.map(document);
 const notes=memory.filter(x=>x.recipeVersion==='fields-arrows-20261118-v1');
 assert.ok(notes.some(x=>x.humanVerdict==='good'&&x.taskVersion&&x.blueprint));assert.ok(notes.some(x=>x.humanVerdict==='bad'&&x.taskVersion&&x.blueprint));
 const teacher=await login(),denied=[];
 for(const p of ['taskLearningRuns/fields-arrows8-20261118-v1','taskLearningRecipes/fields-arrows-20261118-v1','taskLearningTeacherMemory/'+UID+'/examples']){
  const r=await fetch(base+p,{headers:{Authorization:'Bearer '+teacher}});assert.equal(r.status,403,p);denied.push(p.split('/')[0]);
 }
 const result={at:new Date().toISOString(),syntheticFeedbackOnly:true,physicalSpeechTested:false,greenRedLearningMemoryPersisted:true,examplesRetrievedBySubsequentRealGenerator:true,matchingBlueprintRetrieved:true,ownTeacherOnly:notes.every(x=>x.ownerId===UID&&x.reviewerId===UID),publicClientDenied:denied};
 fs.writeFileSync(path.join(root,'feedback-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
