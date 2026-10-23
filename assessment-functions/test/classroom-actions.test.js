'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {requestResume,receiveResume,resumeState}=require('../lib/classroom-actions');
const fail=(code,message)=>{const e=Error(message);e.code=code;throw e;};
const clock=1800000000000;
test('resume help is idempotent, one open request, delivered only to current generation, consciously acknowledged',()=>{
 const action=requestResume({previous:null,actionId:'a',actor:'teacher',generation:2,now:clock,fail});assert.equal(resumeState(action,clock),'pending');
 assert.deepEqual(requestResume({previous:action,actionId:'a',actor:'teacher',generation:2,now:clock+1,fail}),action);
 assert.equal(requestResume({previous:action,actionId:'b',actor:'teacher',generation:2,now:clock+1,fail}).id,'a');
 assert.equal(receiveResume(action,{generation:1,now:clock+1,fail}),null);
 const delivered=receiveResume(action,{generation:2,now:clock+1,fail});assert.equal(resumeState(delivered,clock+1),'delivered');
 assert.throws(()=>receiveResume(delivered,{generation:2,now:clock+2,ackId:'other',fail}),{code:'permission-denied'});
 const ack=receiveResume(delivered,{generation:2,now:clock+2,ackId:'a',fail});assert.equal(resumeState(ack,clock+2),'acknowledged');
 assert.deepEqual(receiveResume(ack,{generation:2,now:clock+3,ackId:'a',fail}),ack);
});
test('resume help expires without claiming delivery or acknowledgement and rejects stale acknowledgement',()=>{
 const a=requestResume({previous:null,actionId:'a',actor:'t',generation:0,now:clock,fail});assert.equal(resumeState(a,clock+600000),'expired');assert.equal(receiveResume(a,{generation:0,now:clock+600000,fail}),null);assert.throws(()=>receiveResume(a,{generation:0,now:clock+600000,ackId:'a',fail}),{code:'failed-precondition'});
 assert.equal(requestResume({previous:a,actionId:'b',actor:'t',generation:0,now:clock+600000,fail}).id,'b');
});
