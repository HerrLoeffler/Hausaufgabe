import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {JSDOM} from './tools/ui/node_modules/jsdom/lib/api.js';
import {orderingVariants,orderingVariantsForStorage} from './ordering-grading.mjs';
const source=fs.readFileSync('app.js','utf8');
function fixture(){
 const dom=new JSDOM('<main id="editorView"><div id="questionList"></div><input id="quizSubject"><input id="quizGrade"></main>',{runScripts:'outside-only',url:'https://example.test/'});const w=dom.window;
 const q={id:'q1',type:'single',text:'Eine Aufgabe',points:1,options:[{text:'Antwort',correct:true}]};
 w.state={user:{uid:'teacher'},currentQuiz:{id:'TEST1234',published:false},questions:[q],newManualQuiz:false};w.guestTourRepo=null;w.reviewBuild='a'.repeat(40);w.APP_VERSION='test';w.$=id=>w.document.getElementById(id);
 w.orderingVariants=orderingVariants;w.orderingVariantsForStorage=orderingVariantsForStorage;w.getQuestionImageSrc=()=>'';w.CSS={escape:v=>v};w.qualityIssueShortLabel=()=>'';w.markDirty=()=>{};w.renderQuestions=()=>{};w.focusEditorQuestion=()=>{};w.crewTour=null;w.toast=()=>{};w.escapeHtml=v=>String(v).replaceAll('<','&lt;');
 w.tourUid=()=>w.state.user.uid;w.questionReviewKey=q=>q.text;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.questionFeedback={submit:async()=>({confirmed:true}),pending:async()=>[],flush:async()=>{}};
 w.eval(source.slice(source.indexOf('const AI_QUALITY_REASONS'),source.indexOf('async function createSimilarTest')));
 const card=w.document.createElement('article');card.className='questionCard';card.dataset.id=q.id;card.innerHTML='<div class="questionGrid"></div><button class="aiFeedbackGood"></button><button class="aiFeedbackBad"></button>';w.document.getElementById('questionList').append(card);
 return {dom,w,q,card};
}
test('real template has one shared negative/remove button and one positive button',()=>{
 const d=new JSDOM(fs.readFileSync('index.html','utf8'));const buttons=d.window.document.getElementById('questionTemplate').content;
 assert.equal(buttons.querySelectorAll('.aiFeedbackBad').length,1);assert.equal(buttons.querySelectorAll('.deleteQuestion').length,1);assert.equal(buttons.querySelector('.deleteQuestion'),buttons.querySelector('.aiFeedbackBad'));assert.match(buttons.querySelector('.aiFeedbackBad').textContent,/☹.*🗑/);d.window.close();
});
test('pending or failed server write cannot remove a question; confirmed snapshot is sent first',async()=>{
 const {dom,w,q}=fixture();let captured;w.questionFeedback.submit=async data=>{captured=data;return {confirmed:false};};
 assert.equal(await w.submitAiQuestionFeedback(q,0,{verdict:'bad',reason:'',action:'remove'}),false);assert.equal(w.state.questions.length,1);assert.equal(captured.questionSnapshot.text,'Eine Aufgabe');
 w.questionFeedback.submit=async()=>({confirmed:true});assert.equal(await w.submitAiQuestionFeedback(q,0,{verdict:'bad',reason:'',action:'remove'}),true);assert.equal(w.state.questions.length,0);dom.window.close();
});
test('late receipt after account switch or content edit never deletes a different current version',async()=>{
 for(const change of ['account','content','replacement','published']){const {dom,w,q}=fixture();let finish;w.questionFeedback.submit=()=>new Promise(resolve=>finish=resolve);const p=w.submitAiQuestionFeedback(q,0,{verdict:'bad',action:'remove'});if(change==='account')w.state.user={uid:'other'};else if(change==='content')q.text='Zwischenzeitlich geändert';else if(change==='replacement')w.state.questions=[{...q,text:'Neu geladen'}];else w.state.currentQuiz.published=true;finish({confirmed:true});assert.equal(await p,false);assert.equal(w.state.questions.length,1);dom.window.close();}
});
test('remove cancellation does not submit; optional reason and green rating work',async()=>{
 const {dom,w,q,card}=fixture();let calls=0;w.questionFeedback.submit=async()=>{calls++;return {confirmed:true};};w.confirm=()=>false;w.openQuestionFeedbackDialog(card.querySelector('.aiFeedbackBad'),q,0);
 const dialog=w.document.querySelector('dialog.aiQualityPanel[open]');assert.ok(dialog);assert.equal(dialog.dataset.questionId,q.id);assert.equal(calls,0);
 assert.equal(dialog.querySelector('.aiQualityReason').value,'');dialog.querySelector('.aiQualityRemove').click();await new Promise(r=>setImmediate(r));assert.equal(calls,0);assert.equal(w.state.questions.length,1);
 assert.equal(await w.submitAiQuestionFeedback(q,0,{verdict:'good',action:'keep'}),true);assert.equal(calls,1);assert.equal(q._aiFeedbackVerdict,'good');dom.window.close();
});
test('feedback offers five optional reasons and preserves the grouped media context', async () => {
  const {dom,w,q,card}=fixture();
  let payload;
  w.questionFeedback.submit=async data=>{payload=data;return {confirmed:true};};
  w.openQuestionFeedbackDialog(card.querySelector('.aiFeedbackBad'),q,0);
  const dialog=w.document.querySelector('dialog.aiQualityPanel[open]');
  const reason=dialog.querySelector('.aiQualityReason');
  assert.deepEqual(Array.from(reason.options, option=>option.value), ['', 'content_wrong', 'incorrect', 'unclear', 'media_language', 'other']);
  assert.equal(dialog.querySelector('details'),null);
  reason.value='media_language';
  dialog.querySelector('.aiQualityComment').value='Audio fehlt';
  dialog.querySelector('.aiQualityReport').click();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(payload.reason,'other');
  assert.equal(payload.teacherComment,'Bild, Audio oder Sprache: Audio fehlt');
  assert.equal(w.state.questions.length,1);
  dom.window.close();
});
test('a dialog never moves the previous account’s technical reports into the active account',()=>{
 const {dom,w,q,card}=fixture();
 let migrations=0;
 w.ensureReportableErrorHost=()=>{migrations++;return w.document.createElement('div');};
 w.openQuestionFeedbackDialog(card.querySelector('.aiFeedbackBad'),q,0);
 const dialog=w.document.querySelector('dialog.aiQualityPanel[open]');
 dialog.querySelector('.questionActionErrors').append(w.document.createElement('section'));
 w.state.user={uid:'another-teacher'};
 w.closeQuestionActionDialogs();
 assert.equal(migrations,0);
 assert.equal(w.document.querySelector('dialog.aiQualityPanel'),null);
 dom.window.close();
});
test('large format context is bounded and accepted by the real server snapshot validator',async()=>{
 const {createRequire}=await import('node:module');const {snapshot}=createRequire(import.meta.url)('./functions/lib/question-feedback.js');
 const {dom,w,q}=fixture();q.groups=Array.from({length:10},()=>({name:'G',items:Array(20).fill('x'.repeat(180))}));q.targetWords=Array(40).fill('x'.repeat(500));q.markGroups=Array.from({length:6},()=>({name:'M',color:'red',words:Array(50).fill('x'.repeat(400)),extra:'must not leave browser'}));
 const clean=w.aiQuestionFeedbackSnapshot(q);assert.ok(JSON.stringify(clean).length<=23000);assert.doesNotThrow(()=>snapshot(JSON.parse(JSON.stringify(clean))));assert.equal(JSON.stringify(clean).includes('must not leave'),false);dom.window.close();
});

const dictationSource = fs.readFileSync("emmi-whole-test-revision.mjs", "utf8");

function dictationFixture(t, local) {
  const { dom, w: window, q, card } = fixture();
  t.after(() => dom.window.close());
  window.openQuestionFeedbackDialog(card.querySelector(".aiFeedbackBad"), q, 0);
  const attempts = [];
  class Recognition extends window.EventTarget {
    start() { attempts.push(this); }
    stop() {}
    emit(type, fields) {
      this.dispatchEvent(Object.assign(new window.Event(type), fields));
    }
  }
  if (local) Recognition.prototype.processLocally = false;
  window.SpeechRecognition = Recognition;
  window.eval(dictationSource);
  const input = window.document.querySelector(".questionActionDialog textarea");
  const mic = window.document.querySelector(".questionActionMic");
  const status = window.document.querySelector(".questionActionMicStatus");
  input.value = "Mein Hinweis";
  return { window, attempts, input, mic, status };
}

test("network failure offers an explicit local retry and preserves existing text", t => {
  const { attempts, input, mic, status } = dictationFixture(t, true);
  mic.click();
  attempts[0].emit("error", { error: "network" });
  assert.equal(attempts.length, 1);
  assert.match(status.textContent, /erneut.*lokal/i);
  mic.click();
  assert.equal(attempts[1].processLocally, true);
  attempts[0].emit("result", { resultIndex: 0, results: [Object.assign([{ transcript: "spät" }], { isFinal: true })] });
  attempts[1].emit("result", { resultIndex: 0, results: [Object.assign([{ transcript: "ergänzt" }], { isFinal: true })] });
  assert.equal(input.value, "Mein Hinweis ergänzt");
});

for (const local of [false, true]) {
  test(`unavailable ${local ? "local language" : "browser speech service"} focuses the text field for keyboard dictation`, t => {
    const { window, attempts, input, mic, status } = dictationFixture(t, local);
    mic.click();
    attempts[0].emit("error", { error: "network" });
    if (local) {
      mic.click();
      attempts[1].emit("error", { error: "language-not-supported" });
    }
    assert.match(status.textContent, /Diktierfunktion deiner Tastatur/);
    assert.equal(window.document.activeElement, input);
    assert.equal(input.value, "Mein Hinweis");
    assert.equal(mic.getAttribute("aria-pressed"), "false");
  });
}

test("explicit microphone stop keeps the final phrase and does not restart", t => {
  const { attempts, input, mic, status } = dictationFixture(t, false);
  mic.click();
  mic.click();
  attempts[0].emit("result", { resultIndex: 0, results: [Object.assign([{ transcript: "letzter Satz" }], { isFinal: true })] });
  attempts[0].emit("end");
  assert.equal(input.value, "Mein Hinweis letzter Satz");
  assert.equal(attempts.length, 1);
  assert.equal(status.textContent, "Diktat beendet.");
  assert.equal(mic.getAttribute("aria-pressed"), "false");
});
