import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { requestPublishReview } from './publish-review.mjs';
const require = createRequire(import.meta.url);
const {JSDOM} = require('./tools/ui/node_modules/jsdom');
function setup(t, overrides={}) {
 const dom=new JSDOM('<button id="before">Publish</button>',{pretendToBeVisual:true});t.after(()=>dom.window.close());
 const doc=dom.window.document;doc.querySelector('button').focus();dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 const changes=[],calls=[];
 const pending=requestPublishReview({doc,settings:{startMode:'teacher',timeLimitMinutes:10,shuffleQuestions:true,shuffleAnswers:false,gradeScaleId:'saved',resultMode:'points_grade',solutionReleaseMode:'exam_after_end',showSolutions:true},scales:[{id:'saved',name:'Gespeichert'}],onChange:v=>changes.push(v),onPublish:async v=>{calls.push(v);return true;},...overrides});
 const dialog=doc.querySelector('dialog'), action=name=>dialog.querySelector(`[data-action="${name}"]`), field=name=>dialog.querySelector(`[name="${name}"]`);
 const change=(name,value)=>{const el=field(name);if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));};
 return {dom,doc,dialog,action,field,change,pending,changes,calls};
}
async function flush(){await new Promise(r=>setTimeout(r,0));}
test('opening, navigation, edits and Escape never publish; cancel retains draft values and restores focus',async t=>{
 const f=setup(t);assert.equal(f.field('startMode').value,'teacher');assert.equal(f.field('timeLimitMinutes').value,'10');assert.equal(f.calls.length,0);
 f.change('timeLimitMinutes',25);f.action('next').click();assert.equal(f.dialog.dataset.step,'2');f.change('shuffleAnswers',true);f.action('back').click();assert.equal(f.field('timeLimitMinutes').value,'25');
 const ev=new f.dom.window.Event('cancel',{cancelable:true});f.dialog.dispatchEvent(ev);assert.equal(await f.pending,false);assert.equal(f.calls.length,0);assert.equal(f.changes.at(-1).shuffleAnswers,true);assert.equal(f.doc.activeElement.id,'before');
});
test('invalid enabled time limit refuses progression and focuses field',t=>{const f=setup(t);f.change('timeLimitMinutes','301');f.action('next').click();assert.equal(f.dialog.dataset.step,'1');assert.equal(f.doc.activeElement,f.field('timeLimitMinutes'));assert.equal(f.calls.length,0);});
test('final review summarizes choices and requires conscious practice acknowledgement',async t=>{
 const f=setup(t);f.action('next').click();f.action('next').click();assert.match(f.dialog.querySelector('[data-summary]').textContent,/10/);assert.equal(f.action('publish').textContent,'Jetzt veröffentlichen');
 f.change('solutionReleaseMode','practice_after_submit');f.action('publish').click();await flush();assert.equal(f.calls.length,0);assert.match(f.dialog.textContent,/Nach der Abgabe können Lernende die Lösungen anzeigen/);
 f.change('practiceAcknowledged',true);f.action('publish').click();assert.equal(await f.pending,true);assert.equal(f.calls.length,1);assert.equal(f.calls[0].practiceAcknowledged,true);
});
test('single final action freezes navigation, repeated clicks and Escape while publishing',async t=>{
 let resolve;let count=0;const f=setup(t,{onPublish:()=>{count++;return new Promise(r=>resolve=r);}});f.action('next').click();f.action('next').click();f.action('publish').click();f.action('publish').click();f.dialog.dispatchEvent(new f.dom.window.Event('cancel',{cancelable:true}));
 assert.equal(count,1);assert.ok(f.action('back').disabled);assert.ok(f.dialog.isConnected);resolve(true);assert.equal(await f.pending,true);
});
test('failed or ambiguous publication keeps choices and requires state refresh before another attempt',async t=>{
 let count=0;const f=setup(t,{onPublish:async()=>{count++;throw new Error('Connection lost');}});f.action('next').click();f.action('next').click();f.action('publish').click();await flush();assert.equal(f.dialog.isConnected,true);assert.match(f.dialog.querySelector('[role="alert"]').textContent,/Connection lost/);assert.ok(f.action('publish').disabled);f.action('publish').click();assert.equal(count,1);f.action('cancel').click();assert.equal(await f.pending,false);
});
test('English labels, progress semantics and explicit cancel',async t=>{const f=setup(t,{locale:'en'});assert.match(f.dialog.textContent,/Start & time/);assert.equal(f.dialog.querySelector('[aria-current="step"]').textContent.trim(),'1');f.action('cancel').click();assert.equal(await f.pending,false);});
test('pending AI review must be acknowledged consciously on final step',async t=>{const f=setup(t,{aiReviewPending:true});f.action('next').click();f.action('next').click();f.action('publish').click();await flush();assert.equal(f.calls.length,0);assert.ok(f.field('aiReviewAcknowledged'));f.change('aiReviewAcknowledged',true);f.action('publish').click();assert.equal(await f.pending,true);});
test('Tab and Shift-Tab wrap among visible enabled controls inside the modal',async t=>{const f=setup(t);f.action('next').focus();f.action('next').dispatchEvent(new f.dom.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(f.doc.activeElement,f.field('startMode'));f.field('startMode').dispatchEvent(new f.dom.window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(f.doc.activeElement,f.action('next'));f.action('cancel').click();await f.pending;});
test('disabled time limit explains start without promising a countdown',async t=>{const f=setup(t);f.change('useTimeLimit',false);assert.doesNotMatch(f.dialog.querySelector('.publishReviewHint').textContent,/Countdown/);assert.equal(f.changes.at(-1).timeLimitMinutes,null);f.action('cancel').click();await f.pending;});
