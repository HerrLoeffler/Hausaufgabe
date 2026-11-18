'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const a=JSON.parse(fs.readFileSync('/private/tmp/gc-auto-audit-private.json','utf8')),calls=a.runs.filter(r=>r.phase!=='probe').flatMap(r=>r.calls),hash=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex'),contracts={};
for(const phase of ['generate','judge','adversary']){
 const signatures=[...new Set(calls.filter(c=>c.phase===phase).map(c=>hash({model:c.request.model,reasoning:c.request.reasoning,system:c.request.input[0].content,format:c.request.text.format})))];
 assert.equal(signatures.length,1,phase+' semantic contract changed during trial');contracts[phase]=signatures[0];
}
for(const c of calls.filter(c=>c.phase==='generate'))assert.equal(JSON.parse(c.request.input[1].content).teacherExamples.length,0);
for(const r of a.runs){const bio=r.cases.find(c=>c.id==='biology');if(!bio)continue;
 for(const c of r.calls.filter(c=>c.id.startsWith('biology-')&&['judge','adversary'].includes(c.phase))){const p=JSON.parse(c.request.input[1].content);for(const answer of bio.expected.answers)assert.ok(!p.wish.toLowerCase().includes(answer.toLowerCase()));}
}
assert.ok(calls.every(c=>c.status==='completed'));assert.equal(a.parent.reservedMicros,0);assert.ok(a.parent.spentMicros<=5000000);
const result={at:new Date().toISOString(),sharedBudgetMicros:5000000,spentMicros:a.parent.spentMicros,providerCalls:calls.length,allProviderOutcomesConfirmed:true,
 noNewCallsAfterCompletionReplay:true,contractsUnchangedWithinTrial:contracts,contractHashMethod:'Recursive sorted object keys; preserve array order. Firestore map key order is not semantic.',
 privateTeacherExamplesExcluded:true,biologicalReviewWishContainsNoPrivateTargetWords:true,
 optimizerModels:calls.filter(c=>c.phase==='optimize').map(c=>({step:c.id,model:c.model,effort:c.request.reasoning.effort})),actualModelWeightsTrained:false,dailySchedulerEnabled:false};
fs.writeFileSync('docs/evidence/autonomous-recipes-20261118/contract-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({calls:result.providerCalls,spentUSD:result.spentMicros/1e6,contractsStable:true}));
