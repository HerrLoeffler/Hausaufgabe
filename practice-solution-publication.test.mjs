import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createPracticePublisher, requestPracticeSolutionConfirmation } from './practice-solution-publication.mjs';
const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');

function fixture(confirm = async () => true) {
  const calls = [];
  const publisher = createPracticePublisher({ confirm, call: async data => {
    calls.push(data);
    return data.action === 'prepare' ? { revision: 'server-revision', needsConfirmation: true } : { published: true };
  } });
  return { calls, publisher };
}
const quiz = () => ({ id: 'QUIZ', solutionReleaseMode: 'practice_after_submit', showSolutions: true });

test('practice publish sends only server revision and explicit approval after confirmation', async () => {
  const f = fixture(); assert.equal((await f.publisher.publish(quiz())).published, true);
  assert.deepEqual(f.calls, [ { quizId: 'QUIZ', action: 'prepare' }, { quizId: 'QUIZ', action: 'publish', expectedRevision: 'server-revision', confirmAfterSubmit: true } ]);
});
test('change setting or cancel refuses publication and no old confirmation is reused', async () => {
  const f = fixture(async () => false);
  assert.equal(await f.publisher.publish(quiz()), null);
  assert.equal(f.calls.length, 1);
  await f.publisher.publish(quiz()); assert.equal(f.calls.length, 2);
  let current = true;
  const edited = fixture(async () => { current = false; return true; });
  assert.equal(await edited.publisher.publish(quiz(), { unchanged: () => current }), null);
  assert.equal(edited.calls.length, 1);
});
test('exam default does not show practice warning or call practice endpoint', async () => {
  let dialogs = 0; const f = fixture(async () => { dialogs++; return true; });
  assert.equal(await f.publisher.publish({ id: 'EXAM', resultMode: 'none', showSolutions: true }), undefined);
  assert.equal(f.calls.length, 0); assert.equal(dialogs, 0);
});
test('practice with solutions withheld publishes without conditional visibility warning', async () => {
  const calls = []; let dialogs = 0;
  const publisher = createPracticePublisher({ confirm: async () => { dialogs++; return true; }, call: async data => {
    calls.push(data); return data.action === 'prepare' ? { revision: 'rev', needsConfirmation: false } : { published: true };
  } });
  await publisher.publish({ ...quiz(), showSolutions: false });
  assert.equal(dialogs, 0); assert.equal(calls[1].confirmAfterSubmit, false);
});
test('concurrent interaction cannot publish twice while confirmation is open', async () => {
  let finish; const f = fixture(() => new Promise(resolve => { finish = resolve; }));
  const first = f.publisher.publish(quiz()); await Promise.resolve(); await Promise.resolve();
  assert.equal(await f.publisher.publish(quiz()), null);
  finish(true); await first;
  assert.equal(f.calls.filter(c => c.action === 'publish').length, 1);
});
test('late release confirms the stored publication revision without requesting current keys', async () => {
  const f = fixture(); await f.publisher.release({ id: 'QUIZ', practiceSolutionRevision: 'saved-revision' });
  assert.deepEqual(f.calls, [{ quizId: 'QUIZ', action: 'release', expectedRevision: 'saved-revision', confirmAfterSubmit: true }]);
});
test('visibility dialog supports explicit publish or settings change and restores keyboard focus', async t => {
  const dom = new JSDOM('<button id="before">Before</button>', { pretendToBeVisual: true }); t.after(() => dom.window.close());
  const doc = dom.window.document; doc.querySelector('button').focus();
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  const pending = requestPracticeSolutionConfirmation({ doc });
  const dialog = doc.querySelector('dialog');
  assert.match(dialog.textContent, /Nach der Abgabe können Lernende die Lösungen anzeigen\./);
  assert.equal(dialog.querySelector('[data-action="confirm"]').textContent, 'So veröffentlichen');
  assert.equal(dialog.querySelector('[data-action="change"]').textContent, 'Einstellung ändern');
  assert.equal(doc.activeElement, dialog.querySelector('[data-action="change"]'));
  dialog.querySelector('[data-action="change"]').click(); assert.equal(await pending, false);
  assert.equal(doc.activeElement.id, 'before');
  const again = requestPracticeSolutionConfirmation({ doc });
  doc.querySelector('[data-action="confirm"]').click(); assert.equal(await again, true);
});

import fs from 'node:fs';
import vm from 'node:vm';
const appSource = fs.readFileSync('app.js', 'utf8');
function entrypoint(name, approve) {
  const q = { ...quiz(), questionCount: 1, published: false, ended: false };
  const writes = [], calls = [];
  const publisher = createPracticePublisher({ confirm: async () => approve, call: async data => {
    calls.push(data); return data.action === 'prepare' ? { revision: 'rev', needsConfirmation: true } : { published: true, sessionState: 'open' };
  } });
  const context = { state: { currentQuiz: q, quizzes: [q], questions: [] }, guestTourRepo: null,
    dashboardPublicationAction: () => 'publish', checkQuizAudioPublication: async () => true,
    isAiReviewPending: () => false, secureAudioPublicationBlocked: () => false,
    saveCurrentQuiz: async () => true, publishPracticeQuiz: q => publisher.publish(q),
    doc: () => ({}), db: {}, updateDoc: async (_, patch) => writes.push(patch), randomId: () => 'run', serverTimestamp: () => 'now',
    renderQuizList() {}, renderAiJobs() {}, renderImportReviewBanner() {}, updateSummary() {}, updateEditorPublishControls() {},
    showPublish() {}, toast() {}, showReportableError() {}, console };
  vm.createContext(context);
  const start = appSource.indexOf(`async function ${name}(`);
  const end = name === 'applyDashboardPublication' ? appSource.indexOf('function quizDefaults(', start) : appSource.indexOf('$("releasePracticeSolutionsBtn")?.addEventListener', start);
  vm.runInContext(appSource.slice(start, end), context);
  return { context, q, writes, calls };
}
for (const name of ['applyDashboardPublication', 'publishCurrentQuiz']) {
  test(`${name} blocks publication when visibility confirmation chooses settings change`, async () => {
    const f = entrypoint(name, false);
    await f.context[name](f.q, { checked: true });
    assert.equal(f.writes.length, 0); assert.equal(f.calls.length, 1); assert.equal(f.q.published, false);
  });
  test(`${name} publishes confirmed practice through the authoritative callable`, async () => {
    const f = entrypoint(name, true);
    await f.context[name](f.q, { checked: true });
    assert.equal(f.writes.length, 0); assert.equal(f.calls[1].action, 'publish'); assert.equal(f.q.published, true);
  });
}

function studentSolutionUi(t) {
  const dom = new JSDOM('<div id="secureResult"><h1>Abgabe gespeichert</h1></div>', { url: 'https://example.test/' }); t.after(() => dom.window.close());
  const context = { document: dom.window.document, location: dom.window.location, URLSearchParams,
    getApps: () => [], initializeApp: () => ({}), firebaseConfig: {}, createSecureAssessmentClient: () => ({}),
    MutationObserver: class { observe() {} } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('secure-solution-release.js', 'utf8').replace(/^import .*;\n/gm, ''), context);
  return { context, doc: dom.window.document };
}
test('student can choose solutions after server release even when no global end or grades exist', t => {
  const f = studentSolutionUi(t);
  f.context.renderReceiptSolutions({ solutionsReleased: true, solutionsConfigured: true, resultMode: 'none', solutionReleaseMode: 'practice_after_submit', solutions: [{ id: 'q1', answer: 'PRIVATE4', prompt: 'Question' }] });
  const button = [...f.doc.querySelectorAll('button')].find(b => b.textContent === 'Lösungen anzeigen');
  assert.ok(button); assert.equal(f.doc.body.textContent.includes('PRIVATE4'), false);
  button.click(); assert.equal(f.doc.body.textContent.includes('PRIVATE4'), true);
  assert.equal(f.doc.body.textContent.includes('Der Test wurde beendet'), false);
});
test('waiting practice never renders solutions from a receipt missing server authorization', t => {
  const f = studentSolutionUi(t);
  f.context.renderReceiptSolutions({ solutionsReleased: false, solutionsConfigured: true, solutionReleaseMode: 'practice_after_submit', solutions: [{ answer: 'NEVER_RENDER' }] });
  assert.match(f.doc.body.textContent, /Warten auf Freigabe/);
  assert.equal(f.doc.body.textContent.includes('NEVER_RENDER'), false);
  assert.equal(f.doc.body.textContent.includes('bis zum Testende'), false);
});
