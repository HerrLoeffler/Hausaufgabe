'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../lib/assessment-core');
const V = require('../lib/visual-task');
const question = format => {
  const task = V.core.example(format);
  task.maxPoints = format === 'timeline' ? 3 : 4;
  task.review = { status:'approved', summary:'Teacher review' };
  return { id:format, position:format === 'timeline' ? 0 : 1, type:'visual', text:task.prompt, points:task.maxPoints, visualTask:JSON.stringify(task) };
};

test('publishing both interactive formats separates public paper from immutable private grading keys', () => {
  const authored=[question('timeline'),question('sequence')];
  const contract=C.buildAssessmentContract(authored,'interactive_contract_secret_12345678');
  for (let i=0;i<authored.length;i++) {
    const paper=contract.paper[i],task=JSON.parse(paper.visualTask);
    assert.equal(C.assertNoSolutionLeak(paper),true);
    for (const field of ['solution','review','rationale','provenance']) assert.equal(Object.hasOwn(task,field),false);
    assert.equal(task.format,authored[i].id);
    assert.equal(contract.gradingKey[i].visualTask,authored[i].visualTask);
  }
  const changed=structuredClone(authored);
  const task=JSON.parse(changed[1].visualTask);task.solution.order.reverse();changed[1].visualTask=JSON.stringify(task);
  const revised=C.buildAssessmentContract(changed,'interactive_contract_secret_12345678');
  assert.notEqual(revised.authoringFingerprint,contract.authoringFingerprint);
  assert.notEqual(revised.sourceFingerprint,contract.sourceFingerprint);
  assert.equal(contract.gradingKey[1].visualTask,authored[1].visualTask);
});

test('saved timeline and picture order grade identically after storage and teacher decoding', () => {
  const authored=[question('timeline'),question('sequence')];
  const contract=C.buildAssessmentContract(authored,'interactive_contract_secret_12345678');
  const responses={timeline:{t1:'event-b',t2:'event-c',t3:'event-a'},sequence:['card-b','card-d','card-a','card-c']};
  const stored=C.sanitizeAnswersForStorage(contract.gradingKey,responses);
  assert.equal(typeof stored.timeline,'string');assert.equal(typeof stored.sequence,'string');
  const reloaded=JSON.parse(JSON.stringify(stored));
  const grade=C.gradeSubmission(contract.gradingKey,reloaded);
  assert.equal(grade.totalPoints,7);assert.equal(grade.maxPoints,7);assert.equal(grade.needsReview,false);
  const {decodeQuestionAnswer}=require('../lib/teacher-answer-decoder');
  for (const q of authored) assert.deepEqual(JSON.parse(decodeQuestionAnswer(q,reloaded[q.id],'interactive_contract_secret_12345678')),responses[q.id]);
  assert.equal(C.gradeSubmission(contract.gradingKey,{timeline:'{"t1":"event-b","t2":null}',sequence:'["card-b","card-d","card-c","card-a"]'}).totalPoints,3);
  assert.equal(C.gradeSubmission(contract.gradingKey,{timeline:null,sequence:null}).totalPoints,0);
});

test('duplicate cards, unsolicited IDs and solution-shaped submissions cannot gain points', () => {
  const time=C.buildGradingKey(question('timeline'),'secret'),seq=C.buildGradingKey(question('sequence'),'secret');
  for (const answer of [{t1:'event-b',t2:'event-b'},{t1:'event-b',wrong:'event-c'},{assignments:{t1:'event-b'}},{t1:{id:'event-b'}}]) assert.equal(C.gradeQuestion(time,answer).autoPoints,0);
  for (const answer of [['card-b','card-d','card-a','card-a'],['card-b','card-d','card-a','unknown'],['card-b','card-d',null,'card-c'],{order:['card-b','card-d','card-a','card-c']}]) assert.equal(C.gradeQuestion(seq,answer).autoPoints,0);
});

test('publishing refuses invalid mappings, injected illustration URLs and point mismatches', () => {
  for (const [format,mutate] of [['timeline',t=>t.solution.assignments.t2='event-b'],['timeline',t=>t.spec.events[0].value=1989],['sequence',t=>t.spec.items[0].illustration='https://evil.test/picture.svg'],['sequence',t=>t.spec.items[0].order=1],['sequence',t=>t.maxPoints=2]]) {
    const q=question(format),task=JSON.parse(q.visualTask);mutate(task);q.visualTask=JSON.stringify(task);
    assert.throws(()=>C.buildPublicQuestion(q,'secret'));
    assert.throws(()=>C.buildGradingKey(q,'secret'));
  }
});
