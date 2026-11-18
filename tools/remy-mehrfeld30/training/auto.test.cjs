'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createRun,stepCase}=require('./runner.cjs'),{TestDatabase}=require('./test-db.cjs');
const {SESSION,manifest}=require('./auto-manifest.cjs');
test('automatic phases freeze matched inputs and a single five-dollar session without private quota bypass',async()=>{
 const db=new TestDatabase(),uid='gc-visual255-e2e';
 const a=await createRun({db,uid,data:{autoPhase:'dev0'}});
 const b=await createRun({db,uid,data:{autoPhase:'dev1',strategyHint:'Prüfe jede Pfeilbedeutung vor der Ausgabe.'}});
 assert.equal(a.runId,SESSION+'-dev0');assert.equal(b.runId,SESSION+'-dev1');
 assert.equal(db.docs.get('taskLearningAutoRuns/'+SESSION).limitMicros,5000000);
 assert.deepEqual([...db.docs].filter(([p])=>p.startsWith('taskLearningRuns/'+a.runId+'/cases/')).map(([,c])=>c.wish),manifest().map(c=>c.wish));
 await assert.rejects(createRun({db,uid:'other',data:{autoPhase:'dev0'}}),/Testkonto|Eigentümer|Referenz/);
 await assert.rejects(createRun({db,uid,data:{autoPhase:'dev1',strategyHint:'Ein anderes Rezept.'}}),/anderen|unveränder/);
 assert.ok(manifest(true).every(c=>!manifest().some(d=>d.wish===c.wish)));
});
test('champion selection compares identical wishes, keeps ties and rejects a factual regression',()=>{
 const {compare}=require('./auto-loop.cjs');
 const c=(id,status,passed=true)=>({id,wish:'Wunsch '+id,expected:{kind:'chain'},status,attempt:1,adversary:{passed,clarityScore:4}});
 const base=[c('a','ready'),c('b','rejected')],better=[c('a','ready'),c('b','ready')];
 assert.equal(compare(base,better).improved,true);assert.equal(compare(base,base).improved,false);
 assert.equal(compare(base,[c('a','rejected'),c('b','ready')]).improved,false);
 assert.throws(()=>compare(base,[{...better[0],wish:'Andere Aufgabe'},better[1]]),/gleichen|identischen/);
 assert.equal(compare(base,[c('a','ready',false),c('b','ready')]).improved,false);
});
test('the optimizer receives only completed development findings and preserves one immutable small change',async()=>{
 const {handle}=require('./auto-loop.cjs'),{phasePlan}=require('./auto-manifest.cjs');
 const db=new TestDatabase(),uid='gc-visual255-e2e';await createRun({db,uid,data:{autoPhase:'dev0'}});
 const p=phasePlan('dev0');for(const c of p.cases)await db.doc('taskLearningRuns/'+p.runId+'/cases/'+c.id).update({status:'rejected',errors:['Konkreter Entwicklungsfehler']});
 let calls=0;
 const engine={providerCall:async input=>{calls++;const body=JSON.parse(input.customRequest.input[1].content);assert.equal(body.results.length,20);assert.ok(body.results.every(c=>p.cases.some(x=>x.wish===c.wish)));return {output_text:JSON.stringify({changedAspect:'wording',generationHint:'Beschreibe nur die tatsächliche Lernhandlung mit klaren einzelnen Arbeitsaufträgen.',reason:'Auftrag verständlicher.'})};}};
 const input={db,uid,engine,data:{action:'trainingAutoOptimize',round:1}};
 const a=await handle(input),b=await handle(input);assert.equal(a.generationHint,b.generationHint);assert.equal(calls,1);assert.equal(a.modelWeightsTrained,false);
 await assert.rejects(handle({...input,uid:'other'}),/Testkonto/);
});
test('first-pass reliability can improve on tied final coverage while a holdout regression still remains visible',()=>{
 const {compare}=require('./auto-loop.cjs');const c={id:'a',wish:'Gleicher Wunsch',expected:{kind:'chain'},status:'ready',attempt:2,adversary:{passed:true}};
 assert.equal(compare([c],[{...c,attempt:1}]).improved,true);
});
test('final selection requires adversarial approval, uses distinct families and never claims teacher approval',async()=>{
 const {handle}=require('./auto-loop.cjs'),{phasePlan}=require('./auto-manifest.cjs'),{buildGraph}=require('./graph.cjs');
 const db=new TestDatabase(),uid='gc-visual255-e2e';
 const plan={kind:'chain',title:'Testweg',subject:'Englisch',text:'Ergänze die Simple-Past-Form von go.',paths:[{title:'Umformen',steps:[{type:'text',text:'go'},{type:'arrow',text:'Simple Past'},{type:'field',fieldId:'past'}]}],fields:[{id:'past',label:'Simple Past',mode:'text',accepted:['went']}],reason:'Verb umformen.'};
 for(const name of ['dev0','dev1','dev2','test0','test1']){
  await createRun({db,uid,data:{autoPhase:name}});
  for(const c of phasePlan(name).cases)await db.doc('taskLearningRuns/'+phasePlan(name).runId+'/cases/'+c.id).update({status:'ready',plan,q:buildGraph(plan,{id:c.id}),judge:{reason:'Test'},adversary:{passed:c.id!=='negative',clarityScore:4}});
 }
 const result=await handle({db,uid,data:{action:'trainingAutoFinalize'}});assert.equal(result.finalCount,10);assert.equal(result.modelWeightsTrained,false);assert.equal(result.humanApproved,false);
 const finals=[...db.docs].filter(([p])=>p.startsWith('taskLearningRuns/'+SESSION+'-final/cases/')).map(([,c])=>c);
 assert.equal(new Set(finals.map(c=>c.family)).size,10);assert.ok(finals.every(c=>c.adversary.passed&&c.humanApproved===false));
 assert.equal(db.docs.get('taskLearningAutoRuns/'+SESSION).status,'completed');
});
