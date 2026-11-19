import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {createWilmaAutoReview} from './wilma-auto-review.mjs';import {installWilmaAnswerReview} from './wilma-answer-review.mjs';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
function fixture(t){
 const dom=new JSDOM('<div id="resultsTableWrap"></div>',{pretendToBeVisual:true});t.after(()=>dom.window.close());dom.window.HTMLElement.prototype.scrollIntoView=()=>{};const old=globalThis.CSS;globalThis.CSS={escape:x=>x};t.after(()=>{if(old===undefined)delete globalThis.CSS;else globalThis.CSS=old;});
 const q={id:'q',type:'text',text:'Nenne ein Tier.',points:1,acceptedAnswers:['Hund']},sub=id=>({id,studentName:'Fiktiv '+id,status:'review',answers:{q:'Giraffe '+id},grading:{q:{awardedPoints:0,autoPoints:0,maxPoints:1,needsReview:true}}});
 const ctx={actor:'teacher:1',quiz:{id:'synthetic'},questions:[q],submissions:[sub('missing')]},calls=[],stored=new Map(),preparations=new Map();let ui,writes=0,release,hold=false,entered;const begun=new Promise(r=>entered=r);
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],serverBudgeted:true,allowFreeLookups:true,allowAutomaticPaid:()=>false,onState:s=>{preparations.set(s.submissionId,s);ui?.refresh();},onIdle:()=>ui?.refresh(),analyzeAnswer:async p=>{
  calls.push(p);if(hold&&p.submissionId==='busy'){entered();await new Promise(r=>release=r);}
  if(!stored.has(p.submissionId))throw Object.assign(Error('No receipt'),{details:{reasonCode:'cache_miss',reviewState:'not_started'}});
  ctx.submissions.find(s=>s.id===p.submissionId).grading.q.reviewSuggestion={source:'wilma-ai',requestId:'synthetic-saved',cached:true,points:1,status:'uncertain',reason:'Gespeicherter fiktiver Beleg.'};
 }});
 ui=installWilmaAnswerReview({document:dom.window.document,getContext:()=>ctx,parseGaps:()=>[],answerDisplay:(_,a)=>a,correctDisplay:()=> 'Hund',saveDecision:async()=>writes++,openSubmission:()=>{},notify:()=>{},getPreparation:(_,sid)=>preparations.get(sid),isPreparing:()=>scheduler.isRunning(),resumeAnswer:p=>scheduler.resume(p)});ui.refresh();ui.openForQuestion('q');
 return {ctx,ui,scheduler,calls,stored,sub,begun,release:()=>release(),set hold(x){hold=x;},get writes(){return writes;},tick:()=>new Promise(r=>setImmediate(r))};
}
test('the actual first-start button reveals an existing saved receipt without a provider or grade write',async t=>{
 const f=fixture(t);await f.scheduler.run();f.stored.set('missing',true);const row=()=>f.ui.element.querySelector('tr[data-submission=missing]');assert.match(row().querySelector('.wilmaProblem').textContent,/fehlt noch/);
 row().querySelector('[data-wilma=resume]').click();assert.match(row().querySelector('.wilmaRowStatus').textContent,/geladen|läuft|Warteschlange/,'The click immediately shows progress');
 await f.tick();assert.match(row().querySelector('.wilmaRowReason').textContent,/1 \/ 1 P/);assert.equal(row().querySelector('[data-wilma=resume]'),null);assert.equal(f.calls.length,2);assert.equal(f.writes,0);assert.equal(f.ctx.submissions[0].grading.q.awardedPoints,0);
});
test('clicking a missing proposal during another check queues visibly and then loads its saved result once',async t=>{
 const f=fixture(t);await f.scheduler.run();f.ctx.submissions.push(f.sub('busy'));f.hold=true;const busy=f.scheduler.run();await f.begun;f.ui.refresh();f.stored.set('missing',true);
 const row=()=>f.ui.element.querySelector('tr[data-submission=missing]'),button=row().querySelector('[data-wilma=resume]');assert.equal(button.disabled,false,'A first-start intent must not silently become a disabled button because another answer is checked');button.click();assert.match(row().querySelector('.wilmaRowStatus').textContent,/geladen|läuft|Warteschlange/);f.release();await busy;await f.tick();await f.tick();
 assert.match(row().querySelector('.wilmaRowReason').textContent,/1 \/ 1 P/);assert.equal(f.calls.filter(p=>p.submissionId==='missing').length,2);assert.equal(f.writes,0);assert.equal(f.ctx.submissions[0].grading.q.awardedPoints,0);
});

test('queued first-start intent cannot cross an account change',async t=>{
 const f=fixture(t);await f.scheduler.run();f.ctx.submissions.push(f.sub('busy'));f.hold=true;const active=f.scheduler.run();await f.begun;const queued=f.scheduler.resume({questionId:'q',submissionId:'missing'}),again=f.scheduler.resume({questionId:'q',submissionId:'missing'});assert.equal(queued,again);f.ctx.actor='different:2';f.scheduler.clear({resetSession:true});f.release();await Promise.all([active,queued]);assert.equal(f.calls.filter(p=>p.submissionId==='missing').length,1);assert.equal(f.writes,0);
});

test('exhausted Stage session can still retrieve saved results and gives a visible limit for an unseen answer',async()=>{
 const q={id:'q',type:'text',text:'Nenne ein Tier.',points:1},ctx={actor:'teacher',quiz:{id:'synthetic'},questions:[q],submissions:['a','b','cachedLater','unseen'].map(id=>({id,status:'review',answers:{q:'Giraffe '+id},grading:{q:{awardedPoints:0,autoPoints:0,maxPoints:1,needsReview:true}}}))},states=[],calls=[];let ready=false;
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,enabled:()=>true,parseGaps:()=>[],allowFreeLookups:true,onState:s=>states.push(s),analyzeAnswer:async p=>{calls.push(p);if(p.allowPaid||ready&&p.submissionId==='cachedLater')ctx.submissions.find(s=>s.id===p.submissionId).grading.q.reviewSuggestion={source:'wilma-ai',cached:!p.allowPaid,points:1,status:'uncertain',reason:'Fiktiv.'};else throw Object.assign(Error('No saved result'),{details:{reasonCode:'cache_miss',reviewState:'not_started'}});}});
 await scheduler.run();ready=true;await scheduler.resume({questionId:'q',submissionId:'cachedLater'});assert.ok(ctx.submissions[2].grading.q.reviewSuggestion);assert.equal(calls.filter(p=>p.allowPaid).length,2);
 await scheduler.resume({questionId:'q',submissionId:'unseen'});assert.equal(calls.filter(p=>p.allowPaid).length,2);assert.equal(states.at(-1).reasonCode,'session_limit');assert.equal(states.at(-1).resumeAllowed,false);
});
