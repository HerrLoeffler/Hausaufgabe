import test from 'node:test';import assert from 'node:assert/strict';
import {createQuestionFeedbackClient} from './question-feedback-client.mjs';
const storage=()=>{const rows=new Map();return {rows,get:async k=>structuredClone(rows.get(k)||null),put:async(k,v)=>rows.set(k,structuredClone(v)),remove:async k=>rows.delete(k),update:async(k,f)=>{const v=f(structuredClone(rows.get(k)||null));rows.set(k,v);return v;}};};
const payload={testCode:'TEST1234',questionId:'q1',verdict:'bad',feedbackAction:'remove',questionSnapshot:{type:'single',text:'Aufgabe'},reason:''};
test('offline rating is durable and retries exact ID after reload without automatic removal',async()=>{
 const store=storage();let online=false;const sent=[];const api=async p=>{sent.push(p);if(!online)throw Error('offline');return {confirmed:true,id:'server-id'};};
 let client=createQuestionFeedbackClient({storage:store,api,project:'gradecrew-staging-2026'});client.setSession('one');
 const pending=await client.submit(payload);assert.equal(pending.confirmed,false);assert.equal((await client.pending()).length,1);
 client=createQuestionFeedbackClient({storage:store,api,project:'gradecrew-staging-2026'});client.setSession('one');online=true;
 await client.flush();assert.equal((await client.pending()).length,0);const retry=await client.submit(payload);assert.equal(retry.confirmed,true);assert.equal(sent[0].clientRequestId,sent[1].clientRequestId);assert.equal(sent.length,2);
});
test('two accounts and projects never share queue or late UI acknowledgement',async()=>{
 const store=storage();let resolve;const client=createQuestionFeedbackClient({storage:store,project:'hausaufgabe-staging',api:()=>new Promise(r=>resolve=r)});client.setSession('one');
 const task=client.submit(payload);for(let i=0;i<100&&!resolve;i++)await new Promise(r=>setImmediate(r));assert.equal(typeof resolve,'function');client.setSession('two');resolve({confirmed:true,id:'saved'});assert.equal((await task).confirmed,false);assert.equal((await client.pending()).length,0);
 const other=createQuestionFeedbackClient({storage:store,project:'gradecrew-staging-2026',api:async()=>{throw Error('offline');}});other.setSession('one');assert.equal((await other.pending()).length,0);
});
test('storage failure never pretends feedback was secured',async()=>{
 const client=createQuestionFeedbackClient({storage:{get:async()=>null,put:async()=>{throw Error('storage full');}},project:'hausaufgabe-staging',api:async()=>({confirmed:true})});client.setSession('one');await assert.rejects(client.submit(payload),/storage full/);
});
test('permanent rejection cannot block later valid ratings and its local copy can be discarded',async()=>{
 const store=storage();const api=async p=>{if(p.questionId==='q1')throw Object.assign(Error('Ungültiger Ausschnitt'),{code:'functions/invalid-argument'});return {confirmed:true,id:'good'};};
 const client=createQuestionFeedbackClient({storage:store,project:'hausaufgabe-staging',api});client.setSession('one');await client.submit(payload);
 assert.equal((await client.submit({...payload,questionId:'q2'})).confirmed,true);
 const pending=await client.pending();assert.equal(pending.length,1);assert.equal(pending[0].terminal,true);
 await client.discard(pending[0].id);assert.equal((await client.pending()).length,0);
});
