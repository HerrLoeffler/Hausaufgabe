import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewItem as clientItem} from './wilma-answer-review.mjs';
import {reviewItem as serverItem,applyAnswerDecision} from './functions/lib/wilma/scoring.mjs';
const question={id:'q',type:'text',text:'Nenne das englische Wort für Haustür.',points:1,acceptedAnswers:['front door','main door'],manualReview:false};
const base=answer=>({id:'s',status:'graded',answers:{q:answer},grading:{q:{correct:false,autoPoints:0,awardedPoints:0,maxPoints:1,needsReview:false}},totalPoints:0,maxPoints:1});
for(const [scope,reviewItem] of [['client',clientItem],['server',serverItem]]){
 for(const answer of ['front Tür','front','entrance door','unrelated answer'])test(scope+': nonempty unmatched text is pending, never a green definitive zero: '+answer,()=>{
  const item=reviewItem(question,base(answer),()=>[]);assert.equal(item.requiresReview,true);assert.equal(item.status,'open');assert.equal(item.semanticPending,true);assert.equal(item.awarded,0);
 });
 test(scope+': blank text stays rule zero without semantic work',()=>{for(const a of ['', '   ']){const item=reviewItem(question,base(a),()=>[]);assert.equal(item.requiresReview,false);assert.equal(item.semanticPending,false);}});
 test(scope+': existing accepted match stays automatic',()=>{const s=base('main door');s.grading.q={...s.grading.q,correct:true,autoPoints:1,awardedPoints:1};assert.equal(reviewItem(question,s,()=>[]).requiresReview,false);});
 test(scope+': teacher confirmation of zero or partial points is not reopened',()=>{for(const points of [0,.5,1]){const s=base('front Tür');s.grading.q={...s.grading.q,reviewState:'confirmed',awardedPoints:points};assert.equal(reviewItem(question,s,()=>[]).requiresReview,false);}});
 test(scope+': deferred or missing rubric stays visibly pending',()=>{const s=base('front');s.grading.q.reviewState='deferred';assert.equal(reviewItem({...question,acceptedAnswers:[]},s,()=>[]).requiresReview,true);});
}
test('confirming one answer cannot finalize another unmatched text as zero',()=>{
 const q2={...question,id:'q2'},s=base('front Tür');s.answers.q2='front';s.grading.q2={...s.grading.q};
 const patch=applyAnswerDecision({question,questions:[question,q2],submission:s,parseGaps:()=>[],decision:{status:'confirmed',points:.5},gradeFromPercent:()=>5,scale:{thresholds:[91,77,57,39,25,0]}});
 assert.equal(patch.grade,null);assert.equal(patch.status,'review');assert.equal(patch.grading.q2.needsReview,true);assert.equal(patch.grading.q.awardedPoints,.5);
});
