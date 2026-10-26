"use strict";
const test=require('node:test');const assert=require('node:assert/strict');
const {normalizeAllowedVisualFormats,interactiveGuidance}=require('../lib/interactive-authoring');
const {validateQuestion}=require('../lib/validation');const {core}=require('../lib/visual-task');
const {testUserPrompt}=require('../lib/prompts');const {planTestBatches}=require('../lib/test-batches');
test('format choices are bounded, known and preserved in batch snapshots',()=>{
 assert.deepEqual(normalizeAllowedVisualFormats(['coordinate','angle','coordinate'],true),['coordinate','angle']);
 for(const value of [null,'angle',['invented'],[]])assert.throws(()=>normalizeAllowedVisualFormats(value,true));
 assert.deepEqual(normalizeAllowedVisualFormats(undefined,false),[]);
 assert.ok(normalizeAllowedVisualFormats(undefined,true).includes('coordinate'));
 const input={count:30,points:30,allowedVisualFormats:['coordinate'],allowedTypes:['visual'],imageMode:'none',audioMode:'none'};
 assert.ok(planTestBatches(input).every(b=>b.allowedVisualFormats===input.allowedVisualFormats));
});
test('normal generator guidance loads saved relevant blueprints without forcing unrelated formats',()=>{
 const input={allowedTypes:['visual','single'],allowedVisualFormats:['coordinate'],count:2,points:4};
 const guidance=interactiveGuidance(input);assert.match(guidance,/coordinate/);assert.match(guidance,/Koordinaten|Punkte/);assert.doesNotMatch(guidance,/Schmetterling|Mauerfall/);
 assert.match(testUserPrompt(input),/Nur diese visuellen Formate: coordinate/);
 assert.equal(interactiveGuidance({...input,allowedTypes:['single']}),'');
});
test('generated visual output outside teacher selection is rejected by normal validation',()=>{
 const task=core.example('angle');const question={type:'visual',text:task.prompt,points:task.maxPoints,visualTask:JSON.stringify(task)};
 assert.ok(validateQuestion(question,{allowedTypes:['visual'],allowedVisualFormats:['coordinate']}).some(e=>/Format.*nicht erlaubt/.test(e)));
 assert.equal(validateQuestion(question,{allowedTypes:['visual'],allowedVisualFormats:['angle']}).length,0);
});

test('single revisions keep the original interactive format unless explicitly chosen',()=>{
 const {revisionVisualFormats}=require('../lib/interactive-authoring');
 const task=core.example('timeline'),q={type:'visual',visualTask:JSON.stringify(task)};
 assert.deepEqual(revisionVisualFormats({},q,['visual']),['timeline']);
 assert.deepEqual(revisionVisualFormats({allowedVisualFormats:['angle']},q,['visual']),['angle']);
 assert.deepEqual(revisionVisualFormats({},q,['single']),[]);
});
test('whole-test edits preserve the inner interactive format unless a type change is requested',()=>{
 const {cleanWholeTestRevisionRequest,finalizeWholeTestRevision}=require('../lib/whole-test-revision');
 const make=format=>{const task=core.example(format);return {type:'visual',text:task.prompt,points:2,visualTask:JSON.stringify({...task,maxPoints:2})};};
 const original=make('timeline');const clean=cleanWholeTestRevisionRequest({instruction:'Formuliere klarer',test:{questions:[original]}});
 const result=finalizeWholeTestRevision(clean,{questions:[make('angle')]});
 assert.equal(JSON.parse(result.test.questions[0].visualTask).format,'timeline');
 assert.equal(result.invalidCount,1);
});

test('visual feedback preserves the validated authoring snapshot instead of coercing it to a flag',()=>{
 const {snapshot}=require('../lib/question-feedback');const t=core.example('coordinate');
 const q={type:'visual',text:t.prompt,points:t.maxPoints,visualTask:JSON.stringify(t)};
 assert.equal(snapshot(q).visualTask,q.visualTask);
});
test('whole-test fresh variants preserve each inner interaction and carry its format selection',()=>{
 const {buildVariantInput,variantQuestionErrors}=require('../lib/test-variant');
 const make=format=>{const t=core.example(format);return {id:'q'+format,position:1,type:'visual',text:t.prompt,points:t.maxPoints,visualTask:JSON.stringify(t),mediaIntent:{kind:'none'},audioIntent:{kind:'none'}};};
 const original=make('timeline'),input=buildVariantInput({title:'Geschichte',creationContext:{interactiveFormats:['timeline']}},[original]);
 assert.deepEqual(input.allowedVisualFormats,['timeline']);
 assert.equal(input.variantSlots[0].visualFormat,'timeline');
 assert.ok(variantQuestionErrors(make('angle'),0,input).some(e=>/Format/.test(e)));
 assert.deepEqual(variantQuestionErrors(original,0,input),[]);
});
