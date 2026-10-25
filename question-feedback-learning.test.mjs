import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync('app.js','utf8');
function helper(){const start=source.indexOf('function questionLearningSummary(');assert.notEqual(start,-1,'status helper exists');const end=source.indexOf('\nfunction ',start+10);const ctx=vm.createContext({fmtDate:v=>'DATE'+v});vm.runInContext(source.slice(start,end),ctx);return ctx.questionLearningSummary;}
test('UI distinguishes eligible, reviewed and actual model use without claiming improved correctness',()=>{
 const summary=helper();assert.match(summary({personalLearningStatus:'eligible_no_evidence',sharedLearningStatus:'pending_review'}),/noch kein.*Einsatznachweis/);assert.match(summary({personalLearningStatus:'applied',personalAppliedAt:123,sharedLearningStatus:'approved_pending_use'}),/DATE123/);assert.match(summary({sharedLearningStatus:'review_outdated'}),/erneut prüfen/);assert.match(summary({sharedLearningStatus:'applied',sharedAppliedAt:45}),/DATE45/);assert.doesNotMatch(summary({sharedLearningStatus:'applied'}),/fachlich verbessert/);
});
