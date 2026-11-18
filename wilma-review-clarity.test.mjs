import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {installWilmaAnswerReview} from './wilma-answer-review.mjs';
import {createWilmaAutoReview} from './wilma-auto-review.mjs';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
const parseGaps=text=>[...text.matchAll(/\[([^\]]+)\]/g)].map(m=>({answers:m[1].split('|')}));
function fixture(t){
 const dom=new JSDOM('<div id="resultsTableWrap"></div>',{pretendToBeVisual:true});t.after(()=>dom.window.close());dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
 const q={id:'q',type:'gapfill',text:'Erhöhung [20 €|20 Euro], Preis [100 €].',points:1.5};
 const s={id:'fictional-a',studentName:'Fiktiv A',status:'review',answers:{q:['20 €','100']},grading:{q:{maxPoints:1.5,autoPoints:0,awardedPoints:0,needsReview:true}}};
 const ctx={actor:'fictional-owner',quiz:{id:'fiction'},questions:[q],submissions:[s]};let saved=0;
 const ui=installWilmaAnswerReview({document:dom.window.document,getContext:()=>ctx,parseGaps,answerDisplay:(_,a)=>String(a),correctDisplay:()=> '20 €; 100 €',saveDecision:async()=>{saved++;},openSubmission:()=>{},notify:()=>{},getPreparation:()=>({phase:'error',message:'Anfrage abgelehnt · Antwortformat nicht unterstützt.'})});
 ui.refresh();ui.openForQuestion('q');return {ctx,q,s,ui,dom,get saved(){return saved;}};
}
test('each gap pairs response with expected alternatives without inventing wrongness',t=>{
 const f=fixture(t),parts=f.ui.element.querySelectorAll('.wilmaGapComparison');assert.equal(parts.length,2);
 assert.match(parts[0].textContent,/Antwort[\s\S]*20 €[\s\S]*Erwartet[\s\S]*20 € oder 20 Euro/);
 assert.match(parts[0].textContent,/Stimmt überein/);assert.match(parts[1].textContent,/Abgleich offen/);assert.doesNotMatch(parts[1].textContent,/falsch/i);
 assert.match(f.ui.element.textContent,/Antwortformat nicht unterstützt/);assert.equal(f.saved,0);assert.equal(f.s.grading.q.awardedPoints,0);assert.equal(f.ui.element.querySelector('[data-wilma="confirm"]').disabled,true);
});
test('proposal points and reason are visible separately and remain unconfirmed',t=>{
 const f=fixture(t);f.s.grading.q.reviewSuggestion={source:'wilma-ai',points:1,status:'uncertain',reason:'Einheit der zweiten Lücke prüfen.',requestId:'fictional'};f.ui.refresh();
 const reason=f.ui.element.querySelector('.wilmaRowReason');assert.ok(reason);assert.notEqual(reason.tagName,'DETAILS');assert.match(reason.textContent,/KI-Vorschlag[\s\S]*1 \/ 1,5 P\.[\s\S]*Einheit/);assert.equal(f.saved,0);
});
test('empty and incomplete transfers differ from an unrecognised nonempty answer',t=>{
 const f=fixture(t);f.s.answers.q=['','100'];f.ui.refresh();assert.match(f.ui.element.querySelector('.wilmaGapComparison').textContent,/Leer[\s\S]*0 P\./);
 f.s.grading.q.reviewIssue='incomplete-transfer';f.ui.refresh();assert.match(f.ui.element.querySelector('.wilmaGapComparison').textContent,/Übertragung klären/);assert.equal(f.ui.element.querySelector('[data-wilma="confirm"]').disabled,true);
});
test('first validation failure survives free cache miss; refresh never enables another paid attempt',async()=>{
 const q={id:'q',type:'text',text:'Begründe',points:2,reviewCriteria:['Begründung']};const ctx={actor:'fictional',quiz:{id:'fiction'},questions:[q],submissions:['a','b'].map(id=>({id,status:'review',answers:{q:id},grading:{q:{maxPoints:2,needsReview:true}}}))};const states=[],calls=[];
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,parseGaps,enabled:()=>true,allowFreeLookups:true,serverBudgeted:true,onState:s=>states.push(s),analyzeAnswer:async p=>{calls.push(p);throw Object.assign(Error(p.allowPaid?'Antwortformat nicht unterstützt.':'Keine bestätigte Bewertung im Fundus oder Prüfbelegcache. Keine API gestartet.'),{code:p.allowPaid?'functions/invalid-argument':'functions/resource-exhausted'});}});
 await scheduler.run();assert.match(states.find(s=>s.submissionId==='a'&&s.phase==='error').message,/Antwortformat nicht unterstützt/);assert.match(states.at(-1).message,/Anfrage abgelehnt/);assert.match(states.at(-1).message,/Kein gespeicherter Vorschlag/);assert.doesNotMatch(states.at(-1).message,/Monatslimit|Kontingent erreicht/);
 scheduler.clear();await scheduler.run();assert.equal(calls.filter(p=>p.allowPaid).length,1);
});
test('free lookup auth errors retain their own cause',async()=>{
 const q={id:'q',type:'text',text:'Begründe',points:2,reviewCriteria:['Begründung']};const ctx={actor:'fictional',quiz:{id:'fiction'},questions:[q],submissions:['a','b'].map(id=>({id,status:'review',answers:{q:id},grading:{q:{maxPoints:2,needsReview:true}}}))};const states=[];
 const scheduler=createWilmaAutoReview({getContext:()=>ctx,parseGaps,enabled:()=>true,allowFreeLookups:true,onState:s=>states.push(s),analyzeAnswer:async p=>{throw Object.assign(Error('synthetic'),{code:p.allowPaid?'functions/unavailable':'functions/permission-denied'});}});await scheduler.run();assert.match(states.at(-1).message,/Zugriff/);assert.doesNotMatch(states.at(-1).message,/Keine bestätigte Bewertung/);
});
