import test from 'node:test';
import assert from 'node:assert/strict';
import {monitorModel} from './exam-monitor.mjs';
const now=1800000000000;
test('monitor keeps reported work distinct from a stale connection and derives clickable counts from all recipients',()=>{
 const result={round:{state:'running',serverNow:now,startedAt:now-60000,deadlineAt:now+60000},rows:[
  {studentId:'b',name:'Test Zwei',status:'running',lastSeenAt:now-45001},
  {studentId:'a',name:'Test Eins',status:'not_joined',lastSeenAt:0},
  {studentId:'c',name:'Test Drei',status:'submitted',lastSeenAt:now-100000}
 ]};const m=monitorModel(result,now);assert.equal(m.counts.all,3);assert.equal(m.counts.not_joined,1);assert.equal(m.counts.running,1);assert.equal(m.counts.attention,1);assert.equal(m.rows.find(r=>r.studentId==='b').status,'running');assert.equal(m.rows.find(r=>r.studentId==='b').stale,true);assert.equal(m.rows.find(r=>r.studentId==='c').stale,false);assert.deepEqual(m.rows.map(r=>r.studentId),['c','a','b']);assert.equal(m.canStart,false);assert.equal(m.remainingSeconds,60);
});
test('common start is offered only in the waiting round and never reopens a closed or self-start test',()=>{for(const state of ['running','closed','open'])assert.equal(monitorModel({round:{state,startMode:'teacher'},rows:[]},now).canStart,false);assert.equal(monitorModel({round:{state:'waiting',startMode:'teacher'},rows:[]},now).canStart,true);});
