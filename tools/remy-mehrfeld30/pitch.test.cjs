'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {buildPitch,publicPitch,scorePitch,pitchExamples}=require('./pitch.cjs');
test('G4 is the second line and A4 the next space in a treble staff',()=>{
  const q=buildPitch(pitchExamples[0]);
  assert.deepEqual(q.solution,{p0:2,p1:3});
  assert.equal(scorePitch(q,{p0:2,p1:3}),1);
  assert.equal(scorePitch(q,{p0:3,p1:2}),0);
  assert.equal(scorePitch(q,{p0:2}),.5);
  assert.ok(!Object.hasOwn(publicPitch(q),'solution'));
  assert.ok(publicPitch(q).notes.every(n=>!Object.hasOwn(n,'position')));
});
test('a sequence scores each slot separately and rejects unsupported positions',()=>{
  const q=buildPitch(pitchExamples[1]);
  assert.equal(scorePitch(q,q.solution),q.points);
  assert.equal(scorePitch(q,{...q.solution,p2:99}),q.points-.5);
  assert.throws(()=>buildPitch({...pitchExamples[1],notes:['G4','A4','C3']}));
  assert.throws(()=>buildPitch({...pitchExamples[1],notes:['G4','G4','G4']}));
});
