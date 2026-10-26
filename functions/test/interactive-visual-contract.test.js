'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../lib/visual-task');
const {validateQuestion,normalizeQuestion}=require('../lib/validation');
const {storedAiQuestion}=require('../lib/ai-job');
const {cleanWholeTestRevisionRequest}=require('../lib/whole-test-revision');

test('new normal-test interactive tasks survive validation, AI materialization, revision and changed points', async () => {
  for (const format of ['timeline','sequence']) {
    const task=V.core.example(format);
    const question={type:'visual',text:task.prompt,points:task.maxPoints,visualTask:JSON.stringify(task)};
    assert.deepEqual(validateQuestion(question),[]);
    assert.equal(normalizeQuestion(question).visualTask,question.visualTask);
    assert.equal((await storedAiQuestion(question,0,{})).visualTask,question.visualTask);
    const revised=cleanWholeTestRevisionRequest({instruction:'Bitte leichter',test:{title:'Abläufe ordnen',questions:[question]}});
    assert.equal(revised.test.questions[0].question.visualTask,question.visualTask);
    const balanced=V.withQuestionPoints(question,5);
    assert.equal(balanced.points,5);assert.equal(JSON.parse(balanced.visualTask).maxPoints,5);
    assert.deepEqual(validateQuestion(balanced),[]);
  }
});
