import test from 'node:test';
import assert from 'node:assert/strict';
import * as auto from './wilma-auto-review.mjs';

function fixture({holdFirst=false}={}) {
 const q={id:'q',type:'text',text:'Nenne ein Tier.',points:1,acceptedAnswers:['Hund']};
 const ctx={actor:'teacher:1',quiz:{id:'synthetic'},questions:[q],submissions:['missing','available'].map(id=>({id,status:'review',answers:{q:id==='missing'?'Giraffe':'Katze'},grading:{q:{autoPoints:0,awardedPoints:0,maxPoints:1,needsReview:true}}}))};
 const stored=new Map([['available',{source:'wilma-ai',points:1,status:'uncertain',reason:'Fiktiver gespeicherter Vorschlag.',cached:true}]]),calls=[],states=[];
 let release,entered;const begun=new Promise(r=>entered=r);
 const scheduler=auto.createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],allowFreeLookups:true,serverBudgeted:true,allowAutomaticPaid:()=>false,onState:s=>states.push(s),analyzeAnswer:async p=>{
  calls.push(p);assert.equal(p.allowPaid,false,'Saved-result reconciliation must never authorize a provider start');
  if(holdFirst&&calls.length===1){entered();await new Promise(r=>release=r);}
  const proposal=stored.get(p.submissionId);
  if(!proposal)throw Object.assign(Error('No receipt'),{details:{reasonCode:'cache_miss',reviewState:'not_started'}});
  ctx.submissions.find(s=>s.id===p.submissionId).grading.q.reviewSuggestion=structuredClone(proposal);
 }});
 return {ctx,scheduler,stored,calls,states,begun,release:()=>release?.()};
}

test('returning to a stale missing row loads a later stored receipt without repeating paid work',async()=>{
 const f=fixture();await f.scheduler.run();assert.equal(f.states.filter(x=>x.submissionId==='missing').at(-1).resumeAllowed,true);
 assert.ok(f.ctx.submissions[1].grading.q.reviewSuggestion);
 f.stored.set('missing',{source:'wilma-ai',points:1,status:'uncertain',reason:'Später gespeichert.',cached:true});
 await f.scheduler.run();assert.equal(f.ctx.submissions[0].grading.q.reviewSuggestion,undefined,'Normal rerender reproduces the stale row');
 assert.equal(typeof f.scheduler.refreshSaved,'function');
 await f.scheduler.refreshSaved({questionId:'q'});
 assert.equal(f.ctx.submissions[0].grading.q.reviewSuggestion.points,1);
 assert.equal(f.states.at(-1).phase,'proposal');assert.equal(f.calls.length,3,'Only the missing row needs a saved-result lookup');
 assert.ok(f.calls.every(x=>x.allowPaid===false));assert.ok(f.ctx.submissions.every(s=>s.grading.q.awardedPoints===0&&s.grading.q.reviewState===undefined));
 await f.scheduler.refreshSaved({questionId:'q'});assert.equal(f.calls.length,3,'Already visible proposals are not fetched again');
});

test('a free saved receipt does not reopen a stopped automatic paid queue',async()=>{
 const q={id:'q',type:'text',text:'Begründe.',points:1},ctx={actor:'teacher',quiz:{id:'synthetic'},questions:[q],submissions:[{id:'a',status:'review',answers:{q:'Fiktiv'},grading:{q:{autoPoints:0,maxPoints:1,needsReview:true}}}]};
 let hasSaved=false;const calls=[],idle=[];
 const scheduler=auto.createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],serverBudgeted:true,allowFreeLookups:true,onIdle:s=>idle.push(s),analyzeAnswer:async p=>{
  calls.push(p);if(p.allowPaid)throw Object.assign(Error('Budget'),{code:'resource-exhausted'});
  if(hasSaved&&p.submissionId==='a')ctx.submissions[0].grading.q.reviewSuggestion={source:'wilma-ai',points:1,status:'uncertain',reason:'Fiktiv gespeichert.'};
  else throw Object.assign(Error('missing'),{details:{reasonCode:'cache_miss'}});
 }});
 await scheduler.run();hasSaved=true;await scheduler.refreshSaved({questionId:'q'});assert.equal(idle.at(-1).savedOnly,true);
 ctx.submissions.push({id:'b',status:'review',answers:{q:'Noch ein fiktiver Text'},grading:{q:{autoPoints:0,maxPoints:1,needsReview:true}}});await scheduler.run();
 assert.equal(calls.filter(p=>p.allowPaid).length,1,'The existing paid-stop guard must survive successful free hydration');assert.equal(calls.at(-1).allowPaid,false);
});

test('saved refresh requested during a running check waits and survives without duplicate paid calls',async()=>{
 const f=fixture({holdFirst:true});const first=f.scheduler.run();await f.begun;
 assert.equal(typeof f.scheduler.refreshSaved,'function');const refreshed=f.scheduler.refreshSaved({questionId:'q'});
 f.stored.set('missing',{source:'wilma-ai',points:1,status:'uncertain',reason:'Gespeichert.',cached:true});f.release();await first;await refreshed;
 assert.equal(f.calls.length,2);assert.ok(f.ctx.submissions[0].grading.q.reviewSuggestion);assert.ok(f.calls.every(x=>x.allowPaid===false));
});

test('a queued saved refresh cannot follow an account or quiz change',async()=>{
 for(const key of ['actor','quiz']){
  const f=fixture({holdFirst:true});const first=f.scheduler.run();await f.begun;
  assert.equal(typeof f.scheduler.refreshSaved,'function');const refreshed=f.scheduler.refreshSaved({questionId:'q'});
  if(key==='actor')f.ctx.actor='other:2';else f.ctx.quiz={id:'other'};f.scheduler.clear({resetSession:key==='actor'});f.release();await Promise.all([first,refreshed]);assert.equal(f.calls.length,1);
 }
});

test('foreground events coalesce into a throttled saved-only refresh for the visible question',async()=>{
 assert.equal(typeof auto.installWilmaReceiptRefresh,'function');
 const window=new EventTarget(),document=new EventTarget();document.visibilityState='visible';let clock=0,visible=true,question='q',release;const calls=[];
 const remove=auto.installWilmaReceiptRefresh({window,document,getContext:()=>({actor:'teacher:1',quiz:{id:'synthetic'}}),getQuestionId:()=>question,isVisible:()=>visible,now:()=>clock,refreshSaved:p=>{calls.push(p);return new Promise(r=>release=r);}});
 window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));await Promise.resolve();assert.deepEqual(calls,[{questionId:'q'}]);release();await new Promise(r=>setImmediate(r));
 clock=1000;window.dispatchEvent(new Event('focus'));await Promise.resolve();assert.equal(calls.length,1);
 clock=31000;document.visibilityState='hidden';document.dispatchEvent(new Event('visibilitychange'));await Promise.resolve();assert.equal(calls.length,1);
 document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));await Promise.resolve();assert.equal(calls.length,2);release();await new Promise(r=>setImmediate(r));
 clock=62000;visible=false;window.dispatchEvent(new Event('focus'));await Promise.resolve();assert.equal(calls.length,2);
 visible=true;question=null;window.dispatchEvent(new Event('focus'));await Promise.resolve();assert.equal(calls.length,2);remove();
});
