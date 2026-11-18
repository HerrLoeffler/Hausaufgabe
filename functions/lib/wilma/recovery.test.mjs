import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewService} from './core.mjs';
import {createWilmaProvider} from './provider.mjs';
import {fixture} from './runtime-fixture.mjs';
import {questionSnapshot} from './source.mjs';
const q={type:'gapfill',text:'Erhöhung [6 €], neuer Preis [66 €].',points:1.5};
const data={quizId:'fiction',questionId:'q',answerIds:['s'],expectedQuestion:questionSnapshot(q),expectedAnswers:{s:['6 €','66']}};
function service({provider,finish=async()=>{}}){return createReviewService({projectId:'gradecrew-staging-2026',loadQuiz:async()=>({ownerId:'owner'}),loadQuestion:async()=>q,loadSubmission:async()=>({answers:{q:data.expectedAnswers.s}}),reserve:async()=>{},finish,provider});}
test('invalid point step retains a safe diagnosis and provider reference without accepting a proposal',async()=>{
 const finished=[];const run=service({provider:async()=>({answers:[{id:'a0',points:.75,status:'clear',reason:'Fiktive Teilantwort'}],requestId:'resp_fiction'}),finish:async(_,info)=>finished.push(info)});
 await assert.rejects(run({uid:'owner',data}),e=>e.details?.reasonCode==='receipt_invalid'&&e.details?.reviewState==='failed');
 assert.equal(finished.at(-1).requestId,'resp_fiction');assert.equal(finished.at(-1).diagnostic.reasonCode,'receipt_invalid');assert.equal(finished.at(-1).receipt,undefined);
});
test('valid proposal survives a result-store failure as explicitly volatile; no automatic second computation',async()=>{
 let calls=0;const done=[];const run=service({provider:async()=>{calls++;return {answers:[{id:'a0',points:1,status:'uncertain',reason:'Einheit prüfen'}],requestId:'resp_fiction'};},finish:async(_,info)=>{done.push(info);if(info.phase==='completed')throw Object.assign(Error('Synthetic storage failure'),{wilmaResultStoreFailure:true});}});
 const result=await run({uid:'owner',data});assert.equal(result.answers[0].points,1);assert.equal(result.persistence,'volatile');assert.equal(result.requestId,'resp_fiction');assert.equal(calls,1);assert.equal(done.at(-1).diagnostic.reasonCode,'result_store_failed');
});
test('provider failure classifications never leak response text',async()=>{
 for(const [reasonCode,result] of [['provider_incomplete',{status:'incomplete',output:[]}],['provider_refusal',{status:'completed',output:[{content:[{type:'refusal',refusal:'private text'}]}]}],['provider_format',{status:'completed',output:[{content:[{type:'output_text',text:'private invalid text'}]}]}]]){
  const provider=createWilmaProvider({client:{responses:{create:async()=>({...result,id:'resp_fiction',usage:{input_tokens:20,output_tokens:10}})}},model:'existing'});
  await assert.rejects(provider({maximum:1.5,answers:[{id:'a0',answer:'fictional'}]},{}),e=>e.reasonCode===reasonCode&&e.requestId==='resp_fiction'&&!e.message.includes('private'));
 }
});
test('provider schema only permits supported point steps and requested answer identities',async()=>{
 let sent;const provider=createWilmaProvider({client:{responses:{create:async payload=>{sent=payload;return {status:'completed',output:[{content:[{type:'output_text',text:'{"answers":[]}'}]}]};}}},model:'existing'});
 await provider({maximum:1.5,answers:[{id:'a0',answer:'fictional'}]},{});const props=sent.text.format.schema.properties.answers.items.properties;
 assert.deepEqual(props.points.enum,[0,.5,1,1.5,null]);assert.deepEqual(props.id.enum,['a0']);assert.equal(sent.store,false);
});
test('persisted valid blob can recover after metadata completion failure without another provider or quota',async()=>{
 const f=fixture();await f.handler()({auth:{uid:'owner'},data:f.review});const key=[...f.docs.keys()].find(k=>k.includes('/wilma-reviews/'));f.docs.set(key,{...f.docs.get(key),phase:'unknown'});const before=JSON.stringify(f.docs.get('quizzes/quiz/submissions/s1'));
 const receipt=await f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}});assert.equal(receipt.cached,true);assert.equal(f.calls,1);assert.equal(f.quotas,1);assert.equal(JSON.stringify(f.docs.get('quizzes/quiz/submissions/s1')),before);
});
test('existing operation status distinguishes running, failed and expired without new quota or provider',async()=>{
 for(const [phase,age,reasonCode,state] of [['started',1000,'review_in_progress','running'],['started',300000,'result_unknown','failed'],['unknown',1000,'result_unknown','failed'],['completed',1000,'receipt_expired','failed']]){
  const f=fixture();await f.handler()({auth:{uid:'owner'},data:f.review});f.results.clear();const key=[...f.docs.keys()].find(k=>k.includes('/wilma-reviews/'));f.docs.set(key,{...f.docs.get(key),phase,createdAt:1000});f.deps.now=()=>1000+age;
  await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}}),e=>e.details?.reasonCode===reasonCode&&e.details?.reviewState===state);assert.equal(f.calls,1);assert.equal(f.quotas,1);
 }
});
test('free cache miss is explicitly not started rather than a monetary quota failure',async()=>{const f=fixture();await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}}),e=>e.details?.reasonCode==='cache_miss'&&e.details?.reviewState==='not_started');assert.equal(f.calls,0);assert.equal(f.quotas,0);});
function billableFailureFixture(){
 const f=fixture(),original=f.deps.provider;let time=Date.UTC(2026,10,18,18);f.deps.now=()=>time++;f.deps.monthlyBudget=true;f.deps.model='gpt-5.6-luna';
 f.deps.provider=async task=>{await original(task);throw Object.assign(Error('Synthetic invalid reply'),{usage:{input_tokens:100,output_tokens:100},reasonCode:'provider_format',requestId:'resp_first'});};
 return {f,original,key:()=>[...f.docs.keys()].find(k=>k.includes('/wilma-reviews/'))};
}
test('one explicit settled-failure retry keeps the operation, cost history and pupil grades',async()=>{
 const {f,original,key}=billableFailureFixture();await assert.rejects(f.handler()({auth:{uid:'owner'},data:f.review}));
 let status;await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}}),e=>{status=e.details;return status.retryAllowed===true&&Number.isFinite(status.failedAt);});
 const before=structuredClone(f.docs.get('quizzes/quiz/submissions/s1')),old=structuredClone(f.docs.get(key())),ledgerBefore=structuredClone(f.docs.get('_wilmaPilotPrivate/month-2026-11'));
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:status.failedAt-1}}));assert.equal(f.calls,1);assert.equal(f.quotas,1);
 f.deps.provider=async task=>({...await original(task),usage:{input_tokens:100,output_tokens:100},requestId:'resp_second'});
 const receipt=await f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:status.failedAt}});
 assert.equal(receipt.requestId,'resp_second');assert.equal(f.calls,2);assert.equal(f.quotas,2);assert.equal([...f.docs.keys()].filter(k=>k.includes('/wilma-reviews/')).length,1);
 const job=f.docs.get(key());assert.equal(job.attemptCount,2);assert.equal(job.history.length,1);assert.equal(job.history[0].requestId,old.requestId);assert.equal(job.history[0].costSettled,true);assert.deepEqual(job.history[0].costReservation,old.costReservation);
 assert.ok(f.docs.get('_wilmaPilotPrivate/month-2026-11').spentMicros>ledgerBefore.spentMicros);assert.equal(f.docs.get('_wilmaPilotPrivate/month-2026-11').reservedMicros,0);assert.deepEqual(f.docs.get('quizzes/quiz/submissions/s1'),before);
 await f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:status.failedAt}});assert.equal(f.calls,2);
});
test('unsettled failures and a second settled failure cannot start another paid attempt',async()=>{
 const {f,key}=billableFailureFixture();await assert.rejects(f.handler()({auth:{uid:'owner'},data:f.review}));const first=f.docs.get(key()).updatedAt;
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,allowPaid:false,expectedFailureAt:first}}));assert.equal(f.quotas,1);
 f.docs.set(key(),{...f.docs.get(key()),costSettled:false});await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:first}}));assert.equal(f.calls,1);assert.equal(f.quotas,1);
 f.docs.set(key(),{...f.docs.get(key()),costSettled:true});await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:first}}));assert.equal(f.calls,2);
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}}),e=>e.details?.retryAllowed===false);
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:f.docs.get(key()).updatedAt}}));assert.equal(f.calls,2);assert.equal(f.quotas,2);
});
test('account blocked during provider processing cannot receive a volatile proposal',async()=>{
 const f=fixture(),original=f.deps.provider;f.deps.provider=async task=>{const result=await original(task);f.docs.set('users/owner',{role:'teacher',status:'blocked'});return result;};
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:f.review}),/nicht aktiv/);assert.equal(f.results.size,0);assert.equal(f.calls,1);
});
test('account blocked after result write is not bypassed by metadata failure',async()=>{
 const f=fixture(),write=f.deps.resultStore.write;f.deps.resultStore.write=async(...args)=>{await write(...args);f.docs.set('users/owner',{role:'teacher',status:'blocked'});};
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:f.review}),/nicht aktiv/);assert.equal(f.results.size,1);assert.equal(f.calls,1);
});
test('result-store outage cannot bypass an account block while writing',async()=>{
 const f=fixture();f.deps.resultStore.write=async()=>{f.docs.set('users/owner',{role:'teacher',status:'blocked'});throw Error('Synthetic store outage');};
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:f.review}),/nicht aktiv/);assert.equal(f.calls,1);
});
