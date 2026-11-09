import test from 'node:test';import assert from 'node:assert/strict';
import {createReviewService} from './functions/lib/wilma/core.mjs';import {questionSnapshot} from './wilma-review-source.mjs';import {createWilmaAutoReview} from './wilma-auto-review.mjs';
test('normal results reload reuses per-answer persistent receipts with no new provider requests',async()=>{
 const q={id:'q',type:'text',text:'English for Haustür?',points:1,acceptedAnswers:['front door'],reviewCriteria:['Correct English; justified partial credit.']};
 const original=['front Tür','front'].map((answer,i)=>({id:'fiction'+i,status:'graded',answers:{q:answer},grading:{q:{autoPoints:0,awardedPoints:0,maxPoints:1,needsReview:false}}}));
 const ctx={actor:'owner:1',quiz:{id:'fiction',ownerId:'owner'},questions:[q],submissions:structuredClone(original)},cache=new Map(),reserved=new Set();let providerCalls=0,httpCalls=0;
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,parseGaps:()=>[],enabled:()=>true,analyzeAnswer:async({questionId,submissionId})=>{
  httpCalls++;const s=ctx.submissions.find(x=>x.id===submissionId);
  const service=createReviewService({projectId:'gradecrew-staging-2026',loadQuiz:async()=>ctx.quiz,loadQuestion:async()=>q,loadSubmission:async(_quizId,id)=>ctx.submissions.find(x=>x.id===id),readCache:async key=>cache.get(key),reserve:async key=>{assert.equal(reserved.has(key),false);reserved.add(key);},finish:async(key,info)=>{if(info.phase==='completed')cache.set(key,info.receipt);},provider:async()=>{providerCalls++;return{answers:[{id:'a0',points:.5,status:'uncertain',reason:'Synthetic partial meaning.'}],requestId:'fictional-'+providerCalls};}});
  const receipt=await service({uid:'owner',data:{quizId:ctx.quiz.id,questionId,expectedQuestion:questionSnapshot(q),answerIds:[submissionId],expectedAnswers:{[submissionId]:s.answers.q}}});
  s.grading.q.reviewSuggestion={...receipt.answers[0],source:'wilma-ai',requestId:receipt.requestId};
 }});
 await scheduler.run();assert.equal(providerCalls,2);assert.equal(httpCalls,2);
 scheduler.clear();ctx.submissions=structuredClone(original);await scheduler.run();assert.equal(httpCalls,4);assert.equal(providerCalls,2);assert.equal(reserved.size,2);
 assert.ok(ctx.submissions.every(s=>s.grading.q.reviewSuggestion));assert.ok(ctx.submissions.every(s=>s.grading.q.awardedPoints===0));
});
