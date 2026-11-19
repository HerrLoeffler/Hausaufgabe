import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installWilmaAnswerReview,applyAnswerDecision} from './wilma-answer-review.mjs';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
function fixture(t,options={}){
 const dom=new JSDOM('<div id="resultsTableWrap"></div>',{pretendToBeVisual:true});t.after(()=>dom.window.close());dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
 const prior=globalThis.CSS;globalThis.CSS={escape:x=>x};t.after(()=>{if(prior===undefined)delete globalThis.CSS;else globalThis.CSS=prior;});
 const ctx={quiz:{id:'fiction'},questions:Array.from({length:100},(_,i)=>({id:'q'+(i+1),type:'text',text:'Fiktive Frage '+(i+1),points:1,acceptedAnswers:['richtig']})),submissions:['A','B'].map(id=>({id,studentName:'Fiktiv '+id,status:'graded',answers:{},grading:{}}))};
 for(const s of ctx.submissions)for(const q of ctx.questions){s.answers[q.id]=q.id==='q2'?'ungeklärt':'richtig';s.grading[q.id]={autoPoints:q.id==='q2'?0:1,awardedPoints:q.id==='q2'?0:1,maxPoints:1,needsReview:false,correct:q.id!=='q2'};}
 const calls=[],preparations=new Map();let writes=0;
 const ui=installWilmaAnswerReview({document:dom.window.document,getContext:()=>ctx,parseGaps:()=>[],answerDisplay:(_,a)=>a,correctDisplay:()=>'',openSubmission:()=>{},notify:()=>{},getPreparation:(qid,sid)=>preparations.get(qid+':'+sid),recoverQuestion:async payload=>calls.push(['recover',payload]),retryAnswer:async payload=>calls.push(['retry',payload]),saveDecision:async({questionId,submissionId,decision})=>{writes++;const index=ctx.submissions.findIndex(s=>s.id===submissionId);ctx.submissions[index]={...ctx.submissions[index],...applyAnswerDecision({question:ctx.questions.find(q=>q.id===questionId),questions:ctx.questions,submission:ctx.submissions[index],parseGaps:()=>[],decision,gradeFromPercent:()=>3,scale:{}})};},...options});
 ui.refresh();ui.openForQuestion('q2');return {ui,ctx,dom,calls,preparations,get writes(){return writes;},tick:()=>new Promise(r=>setTimeout(r,0))};
}
test('compact task chooser keeps active selection and every completed task accessible',t=>{
 const f=fixture(t),el=f.ui.element;
 assert.equal(el.querySelectorAll('[data-question]').length,100);assert.equal(el.querySelector('[data-wilma=task-overview]').open,false);
 assert.equal(el.querySelector('[data-question=q2]').getAttribute('aria-current'),'step');assert.match(el.querySelector('[data-wilma=active-task]').textContent,/Aufgabe 2.*2 offen/);
 el.querySelector('[data-wilma=task-overview]').open=true;el.querySelector('[data-question=q100]').click();assert.equal(el.querySelector('[data-wilma=answers-all]').getAttribute('aria-pressed'),'true');assert.equal(el.querySelectorAll('tr[data-submission]').length,2);
 assert.equal(el.querySelector('[data-question=q100]').dataset.state,'complete');assert.match(el.querySelector('[data-question=q100]').getAttribute('aria-label'),/✓.*Fertig/);assert.equal(el.querySelector('[data-wilma=task-overview]').open,false);
});
test('teacher completion follows every answer, proposals and deferred responses remain amber with exact counts',async t=>{
 const f=fixture(t),el=f.ui.element;
 f.ctx.submissions[0].grading.q2.reviewSuggestion={points:1,status:'clear',source:'wilma-ai',reason:'Vorschlag'};f.ctx.submissions[1].grading.q2.reviewState='deferred';f.ui.refresh();
 assert.equal(el.querySelector('[data-question=q2]').dataset.state,'open');assert.match(el.querySelector('[data-question=q2]').textContent,/2 offen/);
 for(const s of f.ctx.submissions)s.grading.q2.reviewState='confirmed';f.ui.refresh();
 assert.equal(el.querySelector('[data-question=q2]').dataset.state,'complete');assert.match(el.querySelector('[data-question=q2]').getAttribute('aria-label'),/✓.*Fertig/);
});
test('preparation failures and running requests are distinct from missing analysis and never green',t=>{
 const f=fixture(t),el=f.ui.element;
 for(const [phase,label] of [['queued','Warteschlange'],['running','läuft'],['waiting','Warte'],['error','fehlgeschlagen'],['blocked','pausiert']]){
  f.preparations.set('q2:A',{phase,message:'Fiktiver Detailhinweis',reasonCode:'internal',retryAllowed:false});f.ui.refresh();
  assert.match(el.querySelector('tr[data-submission=A]').textContent,new RegExp(label,'i'));assert.doesNotMatch(el.querySelector('tr[data-submission=A]').textContent,/Fiktiver Detailhinweis/);if(['error','blocked'].includes(phase))assert.equal(el.querySelector('tr[data-submission=A] .wilmaProblem').dataset.phase,phase);
  assert.notEqual(el.querySelector('[data-question=q2]').dataset.state,'complete');
 }
});
test('status refresh is free and explicit retry requires a settled failure token, never saves a decision',async t=>{
 const f=fixture(t),el=f.ui.element;
 f.preparations.set('q2:A',{phase:'error',message:'Fehlgeschlagen',reasonCode:'internal',retryAllowed:false,failedAt:123});f.ui.refresh();
 assert.equal(el.querySelectorAll('[data-wilma=retry]').length,0);
 el.querySelector('[data-wilma=recover]').click();await f.tick();assert.deepEqual(f.calls,[['recover',{questionId:'q2'}]]);assert.equal(f.writes,0);
 f.preparations.set('q2:A',{phase:'error',message:'Fehlgeschlagen',retryAllowed:true,failedAt:123});f.ui.refresh();
 assert.match(el.querySelector('tr[data-submission=A]').textContent,/Kontingent/);el.querySelector('tr[data-submission=A] [data-wilma=retry]').click();await f.tick();
 assert.deepEqual(f.calls[1],['retry',{questionId:'q2',submissionId:'A',expectedFailureAt:123}]);assert.equal(f.writes,0);
 for(const failedAt of [undefined,null,'123',NaN]){f.preparations.set('q2:A',{phase:'error',retryAllowed:true,failedAt});f.ui.refresh();assert.equal(el.querySelectorAll('[data-wilma=retry]').length,0);}
});
test('volatile validated proposals stay visible, unconfirmed and warn about tab-only persistence',t=>{
 const f=fixture(t),el=f.ui.element;f.ctx.submissions[0].grading.q2.reviewSuggestion={points:.5,status:'uncertain',source:'wilma-ai',reason:'Fiktive Begründung',persistence:'volatile'};f.ui.refresh();
 assert.match(el.querySelector('tr[data-submission=A]').textContent,/Vorschlag nur in diesem Tab verfügbar/);assert.equal(el.querySelector('[data-question=q2]').dataset.state,'open');assert.equal(f.writes,0);
});
test('background refresh preserves typed points, focus and the answer filter',t=>{
 const f=fixture(t),el=f.ui.element,input=el.querySelector('tr[data-submission=A] [data-wilma=points]');input.focus();input.value='.5';f.ui.refresh();
 assert.equal(el.querySelector('tr[data-submission=A] [data-wilma=points]').value,'.5');assert.equal(f.dom.window.document.activeElement.dataset.wilma,'points');assert.equal(el.querySelector('[data-wilma=answers-open]').getAttribute('aria-pressed'),'true');assert.equal(f.writes,0);
});
test('retry rechecks current failure permission at click time and protects confirmed and stale answers',async t=>{
 const f=fixture(t),el=f.ui.element;
 f.preparations.set('q2:A',{phase:'error',retryAllowed:true,failedAt:123});f.ui.refresh();
 const button=el.querySelector('tr[data-submission=A] [data-wilma=retry]');f.preparations.set('q2:A',{phase:'waiting',retryAllowed:false,failedAt:123});button.click();await f.tick();assert.equal(f.calls.length,0);
 for(const reviewState of ['confirmed','stale','conflict']){f.preparations.set('q2:A',{phase:'error',retryAllowed:true,failedAt:123});f.ctx.submissions[0].grading.q2.reviewState=reviewState;f.ui.refresh();assert.equal(el.querySelector('tr[data-submission=A] [data-wilma=retry]'),null);}
});
test('awaited recovery prevents double submission and a late completion cannot reopen a cleared session',async t=>{
 let finish,count=0;const f=fixture(t,{recoverQuestion:()=>{count++;return new Promise(r=>finish=r);}}),el=f.ui.element;
 el.querySelector('[data-wilma=recover]').click();assert.equal(f.ui.isBusy(),true);el.querySelector('[data-wilma=recover]').click();assert.equal(count,1);
 assert.equal(el.querySelector('tr[data-submission=A] [data-wilma=plus]').disabled,true);
 f.ui.clear();finish();await f.tick();assert.equal(el.hidden,true);assert.equal(el.childElementCount,0);assert.equal(f.writes,0);
});
test('native overview disclosure keeps keyboard focus through a background update',t=>{
 const f=fixture(t),el=f.ui.element,summary=el.querySelector('.wilmaTaskOverview>summary');summary.focus();f.ui.refresh();
 assert.equal(f.dom.window.document.activeElement,el.querySelector('.wilmaTaskOverview>summary'));
});
test('deferred answers still name a failed KI request rather than hiding its category',t=>{
 const f=fixture(t);f.ctx.submissions[0].grading.q2.reviewState='deferred';f.preparations.set('q2:A',{phase:'error',message:'Fiktiver Fehler',retryAllowed:false});f.ui.refresh();
 assert.match(f.ui.element.querySelector('tr[data-submission=A] .wilmaProblem').textContent,/fehlgeschlagen/);
 assert.match(f.ui.element.querySelector('tr[data-submission=A]').textContent,/Zurückgestellt/);
});
test('teacher rows show one short problem without duplicated provider/cache diagnostics',t=>{
 const f=fixture(t),el=f.ui.element;f.preparations.set('q2:A',{phase:'error',reasonCode:'unknown',message:'Erste KI-Prüfung fehlgeschlagen (unknown). Kein passender Fundus verfügbar; deshalb bleibt die Antwort offen.',retryAllowed:false});f.ui.refresh();
 const row=el.querySelector('tr[data-submission=A]');assert.equal(row.querySelectorAll('.wilmaProblem').length,1);assert.doesNotMatch(row.textContent,/unknown|Fundus verfügbar|Erste KI-Prüfung/);assert.match(row.textContent,/manuell bewerten/i);assert.equal(row.querySelectorAll('.wilmaPreparation,.wilmaCritical').length,0);assert.equal(f.writes,0);
});
test('answer filter is a labelled open/all choice and retains completed answers without a dropdown',t=>{
 const f=fixture(t),el=f.ui.element;assert.equal(el.querySelector('select[data-wilma=filter]'),null);assert.equal(el.querySelector('[data-wilma=answers-open]').getAttribute('aria-pressed'),'true');
 el.querySelector('[data-wilma=answers-all]').click();assert.equal(el.querySelector('[data-wilma=answers-all]').getAttribute('aria-pressed'),'true');assert.equal(el.querySelectorAll('tr[data-submission]').length,2);
});
test('a permitted unstarted answer resumes once per explicit click and never writes teacher points',async t=>{
 let finish;const f=fixture(t,{resumeAnswer:payload=>{f.calls.push(['resume',payload]);return new Promise(r=>finish=r);}}),el=f.ui.element;
 f.preparations.set('q2:A',{phase:'blocked',reasonCode:'suppressed',resumeAllowed:true});f.ui.refresh();
 el.querySelector('tr[data-submission=A] [data-wilma=resume]').click();assert.equal(f.ui.isBusy(),true);el.querySelector('tr[data-submission=A] [data-wilma=resume]').click();assert.deepEqual(f.calls,[['resume',{questionId:'q2',submissionId:'A'}]]);assert.equal(f.writes,0);finish();await f.tick();
 f.preparations.set('q2:A',{phase:'waiting',resumeAllowed:true});f.ui.refresh();assert.equal(el.querySelector('tr[data-submission=A] [data-wilma=resume]'),null);
});
test('validated proposals supersede a stale preparation error and expose no retry/resume action',t=>{
 const f=fixture(t,{resumeAnswer:async()=>{}}),el=f.ui.element;f.ctx.submissions[0].grading.q2.reviewSuggestion={points:.5,status:'clear',source:'wilma-ai',requestId:'fiction',reason:'Fiktiv geprüft'};f.preparations.set('q2:A',{phase:'error',message:'Staler Fehler',retryAllowed:true,failedAt:123,resumeAllowed:true});f.ui.refresh();
 const row=el.querySelector('tr[data-submission=A]');assert.doesNotMatch(row.textContent,/fehlgeschlagen|Staler Fehler/);assert.equal(row.querySelectorAll('[data-wilma=resume],[data-wilma=retry]').length,0);assert.match(row.textContent,/KI-Vorschlag/);assert.equal(el.querySelector('[data-question=q2]').dataset.state,'open');f.ui.collapse();assert.doesNotMatch(el.querySelector('[data-wilma=summary]').textContent,/KI-Fehler/);
});
test('technical transfer and source changes keep their guard ahead of an old proposal',t=>{
 const f=fixture(t,{resumeAnswer:async()=>{}}),el=f.ui.element,s=f.ctx.submissions[0];s.grading.q2.reviewSuggestion={points:.5,status:'clear',source:'wilma-ai',requestId:'old-fiction',reason:'Alter Vorschlag'};
 for(const issue of ['incomplete-transfer','stale']){delete s.grading.q2.reviewIssue;delete s.grading.q2.reviewState;if(issue==='stale')s.grading.q2.reviewState='stale';else s.grading.q2.reviewIssue=issue;f.ui.refresh();const row=el.querySelector('tr[data-submission=A]');assert.equal(row.querySelector('.wilmaRowReason'),null);assert.match(row.querySelector('.wilmaProblem').textContent,issue==='stale'?/Fassung geändert/:/Übertragung klären/);assert.equal(row.querySelectorAll('[data-wilma=resume],[data-wilma=retry]').length,0);}
});
