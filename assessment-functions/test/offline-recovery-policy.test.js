'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {offlineRecovery}=require('../lib/offline-recovery-policy');
const now=1_000_000_000, start=now-600_000;
const base={requested:true,now,startedAt:start,deadlineAt:now-60_000,quiz:{published:true,ended:false},sameRun:true,status:'running'};
test('late recovery is bounded and requires teacher review, not a client clock',()=>{
 assert.deepEqual(offlineRecovery(base),{review:true,reason:'late_delivery'});
 assert.equal(offlineRecovery({...base,requested:false}),null);
 assert.deepEqual(offlineRecovery({...base,deadlineAt:now+60_000}),{review:false,reason:null});
 assert.throws(()=>offlineRecovery({...base,startedAt:now-8*86400000}),{code:'deadline-exceeded'});
});
test('closed rounds and renderer fallback remain reviewable; held/deleted data cannot be restored',()=>{
 assert.equal(offlineRecovery({...base,sameRun:false}).reason,'changed_round');
 assert.equal(offlineRecovery({...base,quiz:{published:true,ended:true,endedAt:now-120_000}}).review,true);
 assert.equal(offlineRecovery({...base,deadlineAt:now+60_000,reason:'last_saved_snapshot'}).reason,'last_saved_snapshot');
 for(const quiz of [{isDeleted:true},{rightsHold:true}])assert.throws(()=>offlineRecovery({...base,quiz}),{code:'failed-precondition'});
 assert.throws(()=>offlineRecovery({...base,status:'ready'}),{code:'failed-precondition'});
});
