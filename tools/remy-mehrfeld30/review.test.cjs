'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {canReview, feedback, present, ownsPilotJob, score}=require('./review.cjs');
const {core}=require('../../functions/lib/visual-task');
test('pilot access requires an active existing allowed test teacher',()=>{
  assert.equal(canReview('gc-visual255-e2e',{role:'teacher'}),true);
  assert.equal(canReview('unlisted',{role:'teacher'}),false);
  assert.equal(canReview('gc-visual255-e2e',{role:'teacher',status:'blocked'}),false);
  assert.equal(canReview('',{role:'admin'}),false);
});
test('ratings bind to exact question version and reject stale ratings',()=>{
  const q={id:'q1',type:'single',text:'Dreisatz?',points:2.5,options:[{text:'Ja',correct:false},{text:'Nein',correct:true}]};
  const a=present('ABCDEF23','gegenprobe',q);
  assert.deepEqual(a.options,['Ja','Nein']);
  assert.equal(score(q,1),2.5);
  assert.equal(score(q,null),0);
  const data={version:a.version,verdict:'bad',reason:'format',comment:'  Grundgebühr  ',eventId:'a1234567-1234-1234-1234-123456789012'};
  assert.equal(feedback(a,data).comment,'Grundgebühr');
  const b=present('ABCDEF23','gegenprobe',{...q,text:'Anderer Auftrag'});
  assert.throws(()=>feedback(b,data),/Version/);
  assert.throws(()=>feedback(a,{...data,reason:'bogus'}),/Grund/);
});
test('visual projection carries no solution and foreign or ordinary jobs are excluded',()=>{
  const t=core.example('table');
  const q={id:'q1',type:'visual',text:t.prompt,points:t.maxPoints,visualTask:JSON.stringify(t)};
  const a=present('ABCDEF23','eigener',q);
  assert.equal(Object.hasOwn(a.visual,'solution'),false);
  assert.equal(score(q,core.solutionResponse(t)),t.maxPoints);
  const j={ownerId:'u',quizId:'ABCDEF23',requestId:'mehrfeld30-wish-1234',status:'ready'};
  assert.equal(ownsPilotJob(j,'u','ABCDEF23'),true);
  assert.equal(ownsPilotJob(j,'other','ABCDEF23'),false);
  assert.equal(ownsPilotJob({...j,requestId:'normal'},'u','ABCDEF23'),false);
});
