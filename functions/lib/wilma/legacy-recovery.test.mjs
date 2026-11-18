import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './runtime-fixture.mjs';

async function oldOperation(){
 const f=fixture(),provider=f.deps.provider;let time=Date.UTC(2026,10,18,16);
 f.deps.monthlyBudget=true;f.deps.model='gpt-5.6-luna';f.deps.now=()=>time++;
 f.deps.provider=async task=>({...await provider(task),usage:{input_tokens:100,output_tokens:100}});
 await f.handler()({auth:{uid:'owner'},data:f.review});
 const key=[...f.docs.keys()].find(k=>k.includes('/wilma-reviews/'));
 return {f,key,stamp:()=>f.docs.get(key).updatedAt};
}
for(const broken of ['missing','bad-json','wrong-answer-id','wrong-snapshot'])test(`old completed ${broken} receipt has one guarded repair and preserves its cost history`,async()=>{
 const {f,key,stamp}=await oldOperation(),before=structuredClone(f.docs.get('quizzes/quiz/submissions/s1'));
 const path=[...f.results.keys()][0],receipt=f.results.get(path);let badJSON=broken==='bad-json';
 if(broken==='missing')f.results.clear();
 if(broken==='wrong-answer-id')f.results.set(path,{...receipt,answers:[{...receipt.answers[0],id:'foreign'}]});
 if(broken==='wrong-snapshot')f.results.set(path,{...receipt,questionSnapshot:'unrelated task'});
 const read=f.deps.resultStore.read,write=f.deps.resultStore.write;f.deps.resultStore.read=async p=>{if(badJSON)throw new SyntaxError('Synthetic malformed JSON');return read(p);};f.deps.resultStore.write=async(...args)=>{badJSON=false;return write(...args);};
 let failure;await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}}),e=>{failure=e.details;return failure?.retryAllowed===true&&failure.failedAt===stamp();});
 assert.equal(f.calls,1);assert.equal(f.quotas,1);
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:stamp()-1}}));assert.equal(f.calls,1);
 const repaired=await f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:stamp()}});
 assert.equal(repaired.answers[0].id,'s1');assert.equal(f.calls,2);assert.equal(f.docs.get(key).attemptCount,2);assert.equal(f.docs.get(key).history.length,1);assert.equal(f.docs.get(key).history[0].costSettled,true);
 const again=await f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}});assert.equal(again.cached,true);assert.equal(f.calls,2);assert.deepEqual(f.docs.get('quizzes/quiz/submissions/s1'),before);
});
test('old failed phase and missing updatedAt use a stable creation-time retry handshake',async()=>{
 const {f,key}=await oldOperation();f.results.clear();const old=f.docs.get(key);delete old.updatedAt;delete old.attemptCount;f.docs.set(key,{...old,phase:'failed'});
 let details;await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}}),e=>{details=e.details;return details?.retryAllowed===true&&details.failedAt===old.createdAt;});
 await f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:details.failedAt}});assert.equal(f.calls,2);assert.equal(f.docs.get(key).history[0].phase,'failed');
});
test('a valid legacy receipt recovers for free even while its original monetary hold remains unsettled',async()=>{
 const {f,key}=await oldOperation();f.docs.set(key,{...f.docs.get(key),phase:'unknown',costSettled:false});
 const before=structuredClone([...f.docs]);const result=await f.handler()({auth:{uid:'owner'},data:{...f.review,allowPaid:false}});
 assert.equal(result.cached,true);assert.equal(f.calls,1);assert.equal(f.quotas,1);assert.equal(f.docs.get(key).costSettled,false);assert.deepEqual([...f.docs],before);
});
test('missing receipt with an unsettled original hold never triggers a paid repair',async()=>{
 const {f,key,stamp}=await oldOperation();f.results.clear();f.docs.set(key,{...f.docs.get(key),phase:'unknown',costSettled:false});
 await assert.rejects(f.handler()({auth:{uid:'owner'},data:{...f.review,retry:true,expectedFailureAt:stamp()}}));assert.equal(f.calls,1);assert.equal(f.quotas,1);assert.equal(f.docs.get(key).costSettled,false);
});
