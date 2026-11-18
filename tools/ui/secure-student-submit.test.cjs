const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('secure-student.js', 'utf8');
function between(start, end) { return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))); }
async function fixture(t) {
  const dom = new JSDOM(fs.readFileSync('secure-student.html', 'utf8'), { url: 'https://example.test/?test=FAKE', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window, d = w.document;
  d.getElementById('secureAssessment').classList.remove('hidden');
  d.getElementById('secureQuestions').innerHTML = '<section class="secureQuestion" data-qid="q1"><textarea>draft answer</textarea></section>';
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  const { requestStudentSubmitConfirmation } = await import('../../student-submit-confirm.mjs');
  const sent = [];
  let fail = false;
  Object.assign(w, {
    $: id => d.getElementById(id), quizId: 'FAKE', currentPaper: [{id:'q1'}, {id:'q2'}], currentAttempt: {attemptId:'fake'},
    requestStudentSubmitConfirmation: (message, options) => requestStudentSubmitConfirmation(message, {...options, doc:d}),
    collectAnswers: () => ({q1:d.querySelector('textarea').value}), secureAnswerIsComplete: (_q,value) => Boolean(value),
    api: {submit:async (_id, answers, options) => { sent.push({answers,options}); if (fail) throw Object.assign(new Error('offline'),{code:'unavailable'}); return {receipt:{}}; }},
    setConnection: () => {}, showReceipt: () => d.getElementById('secureAssessment').classList.add('hidden')
  });
  w.eval('let submitting=false, frozenAnswers=null, confirmationPending=null;'+between('function draftKey()', 'function clearDraft()')+between('function freezeAnswers()', 'function watchRunningAssessment()')+between('async function submitAssessment(', 'function consumeEntryName(')+between('$("secureAssessmentForm")?.addEventListener("submit"', '\naddEventListener("online"'));
  const submit = () => d.getElementById('secureAssessmentForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  const settle = () => new Promise(resolve=>setImmediate(resolve));
  return {w,d,sent,submit,settle,setFail(value){fail=value;}};
}
test('Secure manual submit saves draft before its typed confirmation, ignores double taps, and cancel preserves answers', async t => {
  const f = await fixture(t); f.submit(); f.submit();
  assert.equal(f.d.querySelectorAll('dialog').length,1);
  assert.equal(f.sent.length,0);
  assert.equal(JSON.parse(f.w.sessionStorage.getItem('gradecrew_secure_answers:v1:FAKE:fake')).q1,'draft answer');
  assert.match(f.d.querySelector('[data-submit-counts]').textContent,/1.*1/);
  f.d.querySelector('[data-action="cancel"]').click(); await f.settle();
  assert.equal(f.sent.length,0); assert.equal(f.d.querySelector('textarea').value,'draft answer');
});
test('Secure offline manual submission retains its draft and allows a new confirmed retry', async t => {
  const f = await fixture(t); f.setFail(true);
  const confirm = async () => { f.submit(); const input=f.d.querySelector('dialog input'); input.value='ABGEBEN'; input.dispatchEvent(new f.w.Event('input')); f.d.querySelector('[data-action="confirm"]').click(); await f.settle(); };
  await confirm(); assert.equal(f.sent.length,1); assert.match(f.d.querySelector('.secureSubmit .secureInlineError').textContent,/Antworten bleiben/);
  assert.equal(f.d.getElementById('secureSubmitBtn').disabled,false); assert.equal(f.d.querySelector('textarea').value,'draft answer');
  f.setFail(false); await confirm(); assert.equal(f.sent.length,2);
});
test('Secure forced submission closes the dialog and keeps the first frozen answers for retries', async t => {
  const f = await fixture(t); f.submit(); f.setFail(true);
  await f.w.submitAssessment(true); await f.settle();
  assert.equal(f.d.querySelector('dialog'),null); assert.equal(f.sent.length,1);
  f.d.querySelector('textarea').value='late change'; f.setFail(false); await f.w.submitAssessment(true);
  assert.equal(f.sent.length,2); assert.equal(f.sent[1].answers.q1,'draft answer'); assert.equal(f.sent[1].options.autoSubmitted,true);
});
