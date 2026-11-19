import test from 'node:test';
import assert from 'node:assert/strict';
import * as autoReview from './wilma-auto-review.mjs';
const {createWilmaAutoReview}=autoReview;

const q={id:'q',type:'text',text:'Explain a half.',points:2,reviewCriteria:['Two equal parts.']};
const sub=id=>({id,status:'review',answers:{q:'Fictional '+id},grading:{q:{awardedPoints:0,maxPoints:2,needsReview:true}}});
test('historical answers and refreshes are free-only; new explicit results openings retain preparation',()=>{
 const policy=autoReview.wilmaAutomaticPaidPolicy;assert.equal(typeof policy,'function');
 for(const submittedAt of ['2026-11-18T14:30:00Z',null,undefined])assert.equal(policy({context:{allowAutomaticPaid:true},submission:{submittedAt}}),false);
 for(const submittedAt of ['2026-11-18T18:00:00Z',{seconds:Date.parse('2026-11-18T18:00:00Z')/1000},{toMillis:()=>Date.parse('2026-11-18T18:00:00Z')}]){assert.equal(policy({context:{allowAutomaticPaid:false},submission:{submittedAt}}),false);assert.equal(policy({context:{allowAutomaticPaid:true},submission:{submittedAt}}),true);}
});
test('a legacy failure does not turn never-started rows into permanent actor-wide failures',async()=>{
 const ctx={actor:'teacher',quiz:{id:'old'},questions:[q],submissions:[sub('old'),sub('unstarted')]},calls=[],states=[];
 const analyzeAnswer=async payload=>{calls.push(payload);if(payload.retry||payload.allowPaid){ctx.submissions.find(s=>s.id===payload.submissionId).grading.q.reviewSuggestion={source:'wilma-ai',points:1,status:'uncertain',reason:'Fiction'};return;}
  throw Object.assign(Error('safe'),{details:payload.submissionId==='old'?{reasonCode:'result_unknown',retryAllowed:true,failedAt:1000}:{reasonCode:'cache_miss',reviewState:'not_started'}});
 };
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],allowFreeLookups:true,serverBudgeted:true,allowAutomaticPaid:()=>false,analyzeAnswer,onState:s=>states.push(s)});
 await scheduler.run();assert.equal(calls.every(c=>c.allowPaid===false),true);
 const old=states.filter(s=>s.submissionId==='old').at(-1),unstarted=states.filter(s=>s.submissionId==='unstarted').at(-1);
 assert.equal(old.retryAllowed,true);assert.equal(unstarted.reasonCode,'cache_miss');assert.equal(unstarted.resumeAllowed,true);assert.equal(unstarted.message.includes('früheren'),false);
 scheduler.clear();await scheduler.run();assert.equal(calls.every(c=>c.allowPaid===false),true);
 await scheduler.resume({questionId:'q',submissionId:'unstarted'});assert.equal(calls.filter(c=>c.allowPaid===true).length,1);assert.equal(states.at(-1).phase,'proposal');assert.equal(states.at(-1).resumeAllowed,false);
 await scheduler.retry({questionId:'q',submissionId:'old',expectedFailureAt:1000});assert.equal(calls.filter(c=>c.allowPaid===true).length,2);assert.equal(states.at(-1).phase,'proposal');
 assert.ok(ctx.submissions.every(s=>s.grading.q.awardedPoints===0));
});
test('a failure in one quiz never pauses the same teacher in a different quiz',async()=>{
 const ctx={actor:'teacher',quiz:{id:'old'},questions:[q],submissions:[sub('a')]},calls=[];
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],allowFreeLookups:true,serverBudgeted:true,analyzeAnswer:async p=>{calls.push({...p,quiz:ctx.quiz.id});if(ctx.quiz.id==='old')throw Error('Synthetic outage');ctx.submissions[0].grading.q.reviewSuggestion={source:'wilma-ai',points:1,status:'uncertain'};}});
 await scheduler.run();ctx.quiz={id:'other'};scheduler.clear();await scheduler.run();assert.equal(calls.at(-1).allowPaid,true);assert.equal(calls.at(-1).quiz,'other');
});
test('manual resume is one answer, debounced and does not start the rest after success or reload',async()=>{
 const ctx={actor:'teacher',quiz:{id:'old'},questions:[q],submissions:[sub('a'),sub('b')]},calls=[];let resolve,pause=false;
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],allowFreeLookups:true,serverBudgeted:true,allowAutomaticPaid:()=>false,analyzeAnswer:async p=>{calls.push(p);if(!p.allowPaid||!pause)throw Object.assign(Error('missing'),{details:{reasonCode:'cache_miss',reviewState:'not_started'}});await new Promise(r=>resolve=r);ctx.submissions.find(s=>s.id===p.submissionId).grading.q.reviewSuggestion={source:'wilma-ai',points:1,status:'uncertain'};}});
 await scheduler.run();pause=true;const run=scheduler.resume({questionId:'q',submissionId:'a'}),duplicate=scheduler.resume({questionId:'q',submissionId:'a'});await new Promise(r=>setImmediate(r));assert.equal(calls.filter(c=>c.allowPaid).length,1);resolve();await Promise.all([run,duplicate]);scheduler.clear();await scheduler.run();assert.equal(calls.filter(c=>c.allowPaid).length,1);
});
