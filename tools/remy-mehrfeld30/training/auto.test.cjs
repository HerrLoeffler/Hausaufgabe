'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createRun,recheckCase,handleTraining}=require('./runner.cjs'),{TestDatabase}=require('./test-db.cjs');
const {SESSION,manifest,phasePlan,sharedId}=require('./auto-manifest.cjs');
const {buildGraph}=require('./graph.cjs'),{GRAPH_VERSION}=require('./graph-profile.cjs');
const uid='gc-visual255-e2e';
const plan={kind:'chain',title:'Testweg',subject:'Englisch',text:'Ergänze die Simple-Past-Form von go.',paths:[{title:'Umformen',steps:[{type:'text',text:'go'},{type:'arrow',text:'Simple Past'},{type:'field',fieldId:'past'}]}],fields:[{id:'past',label:'Simple Past',mode:'text',accepted:['went']}],reason:'Verb umformen.'};
async function seed(db,name,hint=''){
 const {recipeHash}=require('./auto-loop.cjs'),p=phasePlan(name);
 await db.doc('taskLearningAutoRuns/'+SESSION).set({id:SESSION,ownerId:uid,status:'running',limitMicros:5000000,spentMicros:0,reservedMicros:0});
 await db.doc('taskLearningRuns/'+p.runId).set({id:p.runId,ownerId:uid,autoSessionId:SESSION,autoPhase:name,strategyHint:hint,recipeHash:recipeHash(hint),status:'evaluated',recipeVersion:GRAPH_VERSION,expected:20});
 for(const c of p.cases)await db.doc('taskLearningRuns/'+p.runId+'/cases/'+c.id).set({...c,status:'ready',attempt:1,plan,q:buildGraph(plan,{id:c.id}),judge:{reason:'Test'},adversary:{passed:true,clarityScore:4}});
}
test('automatic phases require a sealed parent and exactly the stored optimizer proposal',async()=>{
 const db=new TestDatabase();const a=await createRun({db,uid,data:{autoPhase:'dev0'}});assert.equal(a.runId,SESSION+'-dev0');
 assert.equal(db.docs.get('taskLearningAutoRuns/'+SESSION).limitMicros,5000000);
 await assert.rejects(createRun({db,uid,data:{autoPhase:'dev1',strategyHint:'Beliebige neue Anweisung'}}),/Optimier|Eltern|Entwicklung/);
 await seed(db,'dev0');await db.doc('taskLearningAutoRuns/'+SESSION+'/strategies/v1').set({generationHint:'Prüfe jede Pfeilbedeutung.',parentPhase:'dev0'});
 await assert.rejects(createRun({db,uid,data:{autoPhase:'dev1',strategyHint:'Andere Anweisung'}}),/unveränder|gespeichert|überein/);
 const b=await createRun({db,uid,data:{autoPhase:'dev1'}});assert.equal(db.docs.get('taskLearningRuns/'+b.runId).strategyHint,'Prüfe jede Pfeilbedeutung.');
 await assert.rejects(createRun({db,uid:'other',data:{autoPhase:'dev0'}}),/Testkonto|Eigentümer|Referenz/);
 assert.ok(manifest(true).every(c=>!manifest().some(d=>d.wish===c.wish)));
});
test('only the final deck is shared, not intermediate or holdout wishes',()=>{
 assert.equal(sharedId(SESSION+'-dev0'),false);assert.equal(sharedId(SESSION+'-test0'),false);assert.equal(sharedId(SESSION+'-final'),true);
});
test('recipe comparison rejects identical effective recipes, regressions, changed inputs and unfinished repairs',()=>{
 const {compare}=require('./auto-loop.cjs');const c=(id,status,attempt=1)=>({id,wish:'Wunsch '+id,expected:{kind:'chain'},status,attempt,adversary:status==='ready'?{passed:true}:null});
 const base=[c('a','ready'),c('b','rejected',3)],next=[c('a','ready'),c('b','ready')],diff={baselineRecipeHash:'a',candidateRecipeHash:'b'};
 assert.equal(compare(base,next,diff).improved,true);assert.equal(compare(base,next,{baselineRecipeHash:'a',candidateRecipeHash:'a'}).improved,false);
 assert.equal(compare(base,[c('a','rejected',3),c('b','ready')],diff).improved,false);
 assert.throws(()=>compare(base,[{...next[0],wish:'Andere Aufgabe'},next[1]],diff),/gleichen|identischen/);
 assert.throws(()=>compare([c('a','rejected',1)],[c('a','ready')],diff),/vollständig|abgeschlossen/);
 assert.equal(compare([c('a','ready',2)],[c('a','ready',1)],diff).improved,true);
});
test('optimizer retains first failed attempts after a successful repair, stays development-only and replays once',async()=>{
 const {handle}=require('./auto-loop.cjs'),db=new TestDatabase();await seed(db,'dev0');
 const path='taskLearningRuns/'+phasePlan('dev0').runId+'/cases/percent';await db.doc(path).update({attempt:2});await db.doc(path+'/attempts/a1').set({attempt:1,status:'rejected',errors:['FIRST-ERROR'],judge:{reason:'FIRST-BLIND-REASON'}});
 let calls=0;const engine={providerCall:async input=>{calls++;const body=JSON.parse(input.customRequest.input[1].content);assert.equal(body.results.length,20);const record=body.results.find(c=>c.family==='percent');assert.equal(record.attempt,2);assert.match(JSON.stringify(record.history),/FIRST-ERROR/);assert.ok(body.results.every(c=>manifest().some(x=>x.wish===c.wish)));return {output_text:JSON.stringify({changedAspect:'wording',generationHint:'Beschreibe die tatsächliche Lernhandlung mit einem klaren Arbeitsauftrag.',reason:'Auftrag verständlicher.'})};}};
 const input={db,uid,engine,data:{action:'trainingAutoOptimize',round:1}},a=await handle(input),b=await handle(input);assert.deepEqual(a,b);assert.equal(calls,1);
 await assert.rejects(handle({...input,uid:'other'}),/Testkonto/);
});
test('biological private reference words never enter the independent reviewer wish',()=>{
 for(const holdout of [false,true]){const c=manifest(holdout).find(c=>c.id==='biology');assert.ok(c.reviewWish);for(const answer of c.expected.answers)assert.ok(!c.reviewWish.toLowerCase().includes(answer.toLowerCase()));}
});
test('final selection deduplicates actual tasks and baseline control is not cherry-picked from a second holdout',async()=>{
 const {handle}=require('./auto-loop.cjs'),db=new TestDatabase();for(const p of ['dev0','dev1','dev2','test0'])await seed(db,p);
 const outcome=await handle({db,uid,data:{action:'trainingAutoFinalize'}});assert.equal(outcome.finalCount,1);assert.equal(outcome.selectedPhase,'dev0');assert.equal(outcome.transfer.controlOnly,true);assert.equal(outcome.humanApproved,false);
 assert.deepEqual(await handle({db,uid,data:{action:'trainingAutoFinalize'}}),outcome);
 const readable=await handleTraining({db,uid,data:{action:'trainingDetails',runId:SESSION+'-final',caseId:'final-1'}});assert.equal(readable.solution[0].value,'went');
 await assert.rejects(recheckCase({db,uid,data:{runId:SESSION+'-final',caseId:'final-1',requestId:'00000000-0000-4000-8000-000000000099',reason:'Cannot change frozen finalists'}}),/abgeschlossen|unveränder|automatisch/);
});
test('a delayed adversarial verdict cannot overwrite a later attempt',async()=>{
 const {handle}=require('./auto-loop.cjs'),db=new TestDatabase();await seed(db,'dev0');const run='taskLearningRuns/'+phasePlan('dev0').runId;await db.doc(run).update({status:'running'});const ref=db.doc(run+'/cases/english');await ref.update({adversary:null});
 let release,started=false;const wait=new Promise(r=>{release=r;}),engine={getRun:async()=>db.docs.get(run),providerCall:async()=>{started=true;await wait;return {output_text:JSON.stringify({solvable:true,appropriate:true,leaksAnswer:false,clarityScore:4,concreteIssue:'OLD'})};}};
 const pending=handle({db,uid,engine,data:{action:'trainingAutoAdversary',phase:'dev0',caseId:'english'}});while(!started)await new Promise(r=>setImmediate(r));await ref.update({attempt:2,adversary:{passed:true,marker:'NEW'}});release();const result=await pending;assert.equal(result.stale,true);assert.equal((await ref.get()).data().adversary.marker,'NEW');
});
test('aggregate recipe optimization prioritizes failed first attempts using the stronger model while generation and judges remain unchanged',()=>{
 const {request}=require('./auto-loop.cjs'),r=request('optimize',{});assert.equal(r.model,'gpt-6.2-sol');assert.equal(r.reasoning.effort,'medium');assert.match(r.input[0].content,/Erstversuch|Fehlversuch/);assert.match(r.input[0].content,/Kosmetik/);
});
