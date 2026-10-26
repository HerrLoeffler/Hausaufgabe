'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateQuestion, normalizeQuestion } = require('../lib/validation');
const { questionSchemaForType } = require('../lib/schemas');
const { storedAiQuestion } = require('../lib/ai-job');
const { cleanWholeTestRevisionRequest } = require('../lib/whole-test-revision');
const task = {schemaVersion:2,id:'angle-1',revision:0,format:'angle',title:'Winkel',subject:'Mathematik',grade:'6',prompt:'Miss den Winkel.',hint:'Nutze den Winkelmesser.',maxPoints:2,objective:'Winkel messen',rationale:'Misst Winkel.',sourceNote:'Eigenes Beispiel',spec:{degrees:68,instrument:'aligned-protractor',min:0,max:180},solution:{value:68,tolerance:1},provenance:{kind:'template',offline:true}};
const question = () => ({type:'visual',text:task.prompt,points:2,visualTask:JSON.stringify(task)});
test('visual AI schema and validation preserve versioned tasks',()=>{
 assert.deepEqual(validateQuestion(question()),[]);
 assert.ok(questionSchemaForType('visual').required.includes('visualTask'));
 assert.equal(normalizeQuestion(question()).visualTask,JSON.stringify(task));
});
test('visual validation fails closed on unsafe IDs, markup, unknown nested keys and inconsistent points',()=>{
 for (const mutate of [t=>t.id='constructor',t=>t.prompt='<svg onload="x">',t=>t.spec.html='hello',t=>t.maxPoints=3,t=>t.spec.degrees=Infinity,t=>t.spec.instrument='javascript:evil']) {
  const t=structuredClone(task); mutate(t);
  assert.ok(validateQuestion({...question(),visualTask:JSON.stringify(t)}).length);
 }
});
test('materialization and Emmi whole-test cleaning keep visualTask intact',async()=>{
 const q=question();
 const stored=await storedAiQuestion(q,0,{});
 assert.equal(stored.visualTask,q.visualTask);
 const clean=cleanWholeTestRevisionRequest({instruction:'Bitte leichter',test:{title:'Winkel',questions:[q]}});
 assert.equal(clean.test.questions[0].question.visualTask,q.visualTask);
});
test('reviewer sees a clean public visual model and a private solution',()=>{
 const review=require('../lib/quality').questionForReview(question(),0);
 assert.equal(review.studentView.visualTask.spec.degrees,68);
 assert.equal(Object.hasOwn(review.studentView.visualTask,'solution'),false);
 assert.equal(review.answerKey.visualTask.solution.value,68);
});
test('AI authors receive the closed contract and all twelve examples',()=>{
 const {SYSTEM}=require('../lib/prompts');
 for(const format of ['hotspot','labeling','scale','angle','grid','chart','connections','coordinate','evidence','range','table','correction'])assert.ok(SYSTEM.includes(`"format":"${format}"`));
 assert.ok(SYSTEM.includes('visualTask'));
});
test('point balancing keeps the private visual rubric aligned',()=>{
 const {balanceTestPoints}=require('../lib/repair-test');
 const balanced=balanceTestPoints({questions:[question()]},3);
 assert.equal(balanced.questions[0].points,3);
 assert.equal(JSON.parse(balanced.questions[0].visualTask).maxPoints,3);
 assert.deepEqual(validateQuestion(balanced.questions[0]),[]);
});
test('visual unknown nested structures and nontext accepted answers fail closed',()=>{
 for(const mutate of [t=>t.spec.min={html:'hello'},t=>t.provenance.kind={html:'hello'}]) {
  const t=structuredClone(task);mutate(t);assert.ok(validateQuestion({...question(),visualTask:JSON.stringify(t)}).length);
 }
 const V=require('../lib/visual-task');const t=V.core.example('correction');t.spec.answerMode='text';t.solution.accepted=[{foo:'hello'}];
 assert.ok(validateQuestion({type:'visual',points:t.maxPoints,text:t.prompt,visualTask:JSON.stringify(t)}).length);
});
