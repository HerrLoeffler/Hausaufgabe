import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installWilmaAnswerReview} from './wilma-answer-review.mjs';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
function fixture(t){
 const dom=new JSDOM('<div id="resultsTableWrap"></div>',{pretendToBeVisual:true});t.after(()=>dom.window.close());dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
 const prior=globalThis.CSS;globalThis.CSS={escape:x=>x};t.after(()=>{if(prior===undefined)delete globalThis.CSS;else globalThis.CSS=prior;});
 const question={id:'q',type:'text',text:'Fiktive Frage',points:2},submission={id:'s',studentName:'Fiktiv',answers:{q:'ungeklärt'},grading:{q:{autoPoints:0,maxPoints:2,needsReview:true}}},ctx={quiz:{id:'fixture'},questions:[question],submissions:[submission]};let preparation={phase:'blocked',reasonCode:'suppressed',resumeAllowed:true},calls=0,writes=0,finish;
 const ui=installWilmaAnswerReview({document:dom.window.document,getContext:()=>ctx,parseGaps:()=>[],answerDisplay:(_,a)=>a,correctDisplay:()=>'',openSubmission:()=>{},notify:()=>{},getPreparation:()=>preparation,resumeAnswer:()=>{calls++;return new Promise(resolve=>finish=()=>{submission.grading.q.reviewSuggestion={source:'wilma-ai',requestId:'fiction',points:1,status:'clear',reason:'Fiktiv geprüft'};resolve();});},retryAnswer:async()=>{},saveDecision:async()=>{writes++;}});ui.refresh();ui.openForQuestion('q');
 return {ui,ctx,dom,get preparation(){return preparation;},set preparation(p){preparation=p;},get calls(){return calls;},get writes(){return writes;},finish:()=>finish(),tick:()=>new Promise(r=>setTimeout(r,0))};
}
test('unstarted permitted AI review is actionable beside the answer problem and leads to unconfirmed proposal',async t=>{
 const f=fixture(t),row=()=>f.ui.element.querySelector('tr[data-submission=s]'),start=row().querySelector('.wilmaAnswerCell [data-wilma=resume]');
 assert.ok(start,'First request action must be inside the answer cell beside its missing proposal');assert.match(start.textContent,/KI-Vorschlag erstellen/);assert.ok(start.classList.contains('primary'));assert.match(row().querySelector('.wilmaProblem').textContent,/fehlt noch der KI-Vorschlag/);assert.match(start.parentElement.textContent,/Erste.*Kontingent/);assert.equal(row().querySelectorAll('[data-wilma=resume],[data-wilma=retry]').length,1);assert.equal(f.calls,0);assert.equal(f.writes,0);
 start.click();f.ui.element.querySelector('[data-wilma=resume]').click();assert.equal(f.calls,1);assert.equal(f.writes,0);f.finish();await f.tick();assert.match(row().querySelector('.wilmaRowReason').textContent,/1 \/ 2 P/);assert.equal(row().querySelectorAll('[data-wilma=resume],[data-wilma=retry]').length,0);assert.equal(row().querySelector('[data-wilma=confirm]').disabled,false);assert.equal(f.writes,0);assert.equal(f.ctx.submissions[0].grading.q.reviewState,undefined);
});
test('settled failure retains retry distinction and stale permission cannot start an AI request',async t=>{
 const f=fixture(t);f.preparation={phase:'error',resumeAllowed:true,retryAllowed:true,failedAt:123};f.ui.refresh();assert.equal(f.ui.element.querySelectorAll('[data-wilma=retry]').length,1);assert.equal(f.ui.element.querySelectorAll('[data-wilma=resume]').length,0);
 f.preparation={phase:'blocked',resumeAllowed:true};f.ui.refresh();const start=f.ui.element.querySelector('[data-wilma=resume]');f.preparation={phase:'running',resumeAllowed:true};start.click();await f.tick();assert.equal(f.calls,0);assert.equal(f.writes,0);
});
