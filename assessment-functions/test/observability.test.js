const test = require('node:test');
const assert = require('node:assert/strict');
const { observeAssessment } = require('../lib/observability');
class HttpsError extends Error { constructor(code, message, details) { super(message); this.code=code; this.details=details; } }
function setup(handler, action='submitAssessmentAttempt') {
 const entries=[]; const logger=Object.fromEntries(['info','warn','error'].map(level=>[level,(name,data)=>entries.push({level,name,data})]));
 return { entries, call: observeAssessment(action,handler,{logger,HttpsError,reference:()=> 'ASM-test'}) };
}
test('unexpected failures expose a reference but no private error message or request data', async()=>{
 const {call,entries}=setup(async()=>{throw new Error('PRIVATE_ANSWER token=PRIVATE')});
 await assert.rejects(call({data:{studentName:'PRIVATE',answers:'PRIVATE'}}), e=>e.code==='internal'&&e.details.reference==='ASM-test'&&!e.message.includes('PRIVATE'));
 assert.equal(JSON.stringify(entries).includes('PRIVATE'),false); assert.equal(entries[0].level,'error');
});
test('backend failures retain only a bounded numeric status so live failures can be diagnosed safely', async()=>{
 const {call,entries}=setup(async()=>{throw Object.assign(new Error('PRIVATE details and answer'),{code:9})},'startAssessmentAttempt');
 await assert.rejects(call({}), e=>e.code==='internal');
 assert.equal(entries[0].data.backendCode,9);
 assert.equal(JSON.stringify(entries).includes('PRIVATE'),false);
 const invalid=setup(async()=>{throw Object.assign(new Error('PRIVATE'),{code:'PRIVATE_TOKEN'})});
 await assert.rejects(invalid.call({}));
 assert.equal(Object.hasOwn(invalid.entries[0].data,'backendCode'),false);
});
test('expected failures preserve code and correlate server/client without tokens', async()=>{
 const {call,entries}=setup(async()=>{throw new HttpsError('deadline-exceeded','Zeit abgelaufen')});
 await assert.rejects(call({}), e=>e.code==='deadline-exceeded'&&e.details.phase==='submitAssessmentAttempt');
 assert.equal(entries[0].data.reference,'ASM-test');
});
test('successful polling is not logged; submission produces a minimal summary', async()=>{
 const polling=setup(async()=>({paper: null}),'resumeAssessmentAttempt'); assert.equal((await polling.call({})).diagnosticReference,'ASM-test'); assert.equal(polling.entries.length,0);
 const submit=setup(async()=>({receipt:{status:'graded'}})); await submit.call({}); assert.equal(submit.entries.length,1); assert.equal(submit.entries[0].data.status,'ok');
});
