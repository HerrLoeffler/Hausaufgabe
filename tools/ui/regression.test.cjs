const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
const source = file => readFileSync(path.join(root, file), 'utf8');
const app = source('app.js');
function fn(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return app.slice(start, app.indexOf('\n}', start) + 2);
}
function fixture(t) {
  const dom = new JSDOM(source('index.html'), { url: 'https://hausaufgabe-staging.web.app', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const observers = [];
  const NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  t.after(() => { observers.forEach(observer => observer.disconnect()); dom.window.close(); });
  w.$ = id => w.document.getElementById(id);
  w.escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  return w;
}
const settle = (ms = 80) => new Promise(resolve => setTimeout(resolve, ms));
function editor(w, quizId = 'test-a') {
  const view = w.$('editorView');
  view.classList.remove('hidden');
  view.dataset.quizId = quizId;
  view.dataset.ownerId = 'teacher-a';
  const card = w.$('questionTemplate').content.firstElementChild.cloneNode(true);
  card.dataset.id = 'q1'; card.dataset.index = '0';
  card.querySelector('.qText').value = 'Ein Beispiel mit Testify im Aufgabentext';
  w.$('questionList').append(card);
  return card;
}

test('brand and crew are present before scripts, without modifying authored content', async t => {
  const w = fixture(t);
  assert.match(w.document.title, /^GradeCrew/);
  assert.equal(w.document.querySelector('.brandCopy strong').textContent, 'GradeCrew');
  for (const img of w.document.querySelectorAll('img[src*="assets/gradecrew/"]')) {
    assert.ok(existsSync(path.join(root, img.getAttribute('src').replace(/^\//, ''))));
    assert.ok(Number(img.getAttribute('width')) > 0);
  }
  const card = editor(w);
  w.eval(source('gradecrew-brand.js').replace('export {};', ''));
  await settle();
  assert.equal(card.querySelector('.qText').value, 'Ein Beispiel mit Testify im Aufgabentext');
});

test('tutorial artwork survives every next/back step and custom icons remain visible', t => {
  const w = fixture(t);
  const steps = ['👋', '✨', '☺', '↻', '🧭'].map(icon => ({ icon, title: 'Schritt', text: 'Kurz', bullets: [] }));
  w.currentTeacherTourConfig = () => ({ steps });
  w.eval(fn('renderTeacherTourStep'));
  for (const index of [0, 1, 2, 3, 2, 1, 0, 4, 0]) {
    w.teacherTourIndex = index;
    w.renderTeacherTourStep();
    const icon = w.$('teacherTourIcon');
    if (index === 4) {
      assert.equal(icon.textContent, '🧭');
      assert.equal(icon.classList.contains('gradecrewTourMascot'), false);
    } else assert.ok(icon.querySelector('img[src$=".svg"]'));
  }
});

test('fallback variant dialog has one wish field and carries its own instruction', t => {
  const w = fixture(t);
  w.state = { questions: [], currentQuiz: { id: 'test-a' } };
  w.defaultVariantMediaKind = () => 'none';
  w.toast = () => {};
  const requests = [];
  w.createQuestionVariants = (q, options) => requests.push(options);
  w.eval(fn('openQuestionVariantDialog'));
  for (const wish of ['Schwieriger', '']) {
    w.openQuestionVariantDialog({ id: 'q1' }, 0);
    const dialog = w.document.querySelector('dialog.questionVariantDialog');
    assert.equal(dialog.querySelectorAll('textarea').length, 1);
    const form = dialog.querySelector('form');
    form.elements.variantInstruction.value = wish;
    form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(w.document.querySelector('dialog.questionVariantDialog'), null);
  }
  assert.deepEqual(requests.map(r => r.instruction), ['Schwieriger', '']);
});

test('queued variants never open a hidden second modal or change another test', async t => {
  const w = fixture(t);
  const card = editor(w);
  const requests = [];
  w.document.addEventListener('gradecrew:variant-request', event => {
    event.detail.accepted = true;
    requests.push({ ...event.detail });
    const host = w.$('variantBackgroundProgress');
    host.classList.remove('hidden');
    host.dataset.running = 'true'; host.dataset.ready = '0';
    host.innerHTML = '<strong>läuft</strong>';
  });
  w.eval(source('ui-enhancements.js'));
  w.eval(source('variant-enhancements.js'));
  card.querySelector('.aiVariantQuestion').click();
  const dialog = w.document.querySelector('.variantRequestDialog');
  assert.equal(dialog.querySelectorAll('textarea').length, 1);
  dialog.querySelector('textarea').value = 'Andere Zahlen';
  dialog.querySelector('form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].instruction, 'Andere Zahlen');
  assert.equal(requests[0].quizId, 'test-a');
  assert.equal(w.document.querySelectorAll('dialog[open]').length, 0);
  card.querySelector('.aiVariantQuestion').click();
  w.document.querySelector('.variantRequestDialog form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  w.$('editorView').dataset.quizId = 'test-b';
  w.$('variantBackgroundProgress').innerHTML = '';
  await settle();
  assert.equal(requests.length, 1);
  w.document.dispatchEvent(new w.CustomEvent('gradecrew:account-changed'));
  await settle();
  assert.equal(requests.length, 1);
});

test('core variant events reject a different teacher, test, publication or invalid amount', t => {
  const w = fixture(t);
  w.state = { user: { uid: 'teacher-a' }, currentQuiz: { id: 'test-a' }, questions: [{ id: 'q1' }] };
  const requests = [];
  w.createQuestionVariants = (_, request) => requests.push(request);
  w.eval(fn('handleVariantRequest'));
  const valid = { id: 'q1', quizId: 'test-a', ownerId: 'teacher-a', count: 1, mediaKind: 'none', instruction: 'Kontext' };
  for (const patch of [{ ownerId: 'teacher-b' }, { quizId: 'test-b' }, { count: 6 }, { count: 0 }, { mediaKind: 'invalid' }, { id: 'missing' }]) {
    const detail = { ...valid, ...patch };
    w.handleVariantRequest({ detail });
    assert.equal(detail.accepted, undefined);
  }
  w.state.currentQuiz.published = true;
  w.handleVariantRequest({ detail: { ...valid } });
  assert.equal(requests.length, 0);
  w.state.currentQuiz.published = false;
  const detail = { ...valid };
  w.handleVariantRequest({ detail });
  assert.equal(detail.accepted, true);
  assert.equal(requests[0].instruction, 'Kontext');
});

test('keeping a variant is persisted separately from an explicit positive rating', t => {
  const w = fixture(t);
  const q = { id: 'q1', type: 'truefalse', correctBoolean: true };
  w.state = { user: { uid: 'teacher-a' }, currentQuiz: { id: 'test-a' }, questions: [q] };
  let dirty = 0;
  w.markDirty = () => dirty++;
  w.renderQuestions = () => {};
  w.round1 = n => Math.round(n * 10) / 10;
  w.eval(fn('handleVariantKept'));
  w.eval(fn('sanitizeQuestionForSave'));
  w.handleVariantKept({ detail: { id: 'q1', quizId: 'test-a', ownerId: 'teacher-a' } });
  assert.equal(q.aiVariantKept, true);
  assert.equal(q._aiFeedbackVerdict, undefined);
  assert.equal(w.sanitizeQuestionForSave(q).aiVariantKept, true);
  assert.equal(dirty, 1);
});

test('layout observers settle instead of rewriting the page on every animation frame', async t => {
  const w = fixture(t);
  editor(w);
  w.eval(source('layout-enhancements.js'));
  w.eval(source('ui-enhancements.js'));
  w.eval(source('variant-enhancements.js'));
  let changes = 0;
  const observer = new w.MutationObserver(records => { changes += records.length; });
  observer.observe(w.document.body, { childList: true, subtree: true, attributes: true });
  await settle(150);
  const before = changes;
  await settle(150);
  assert.equal(changes, before, 'DOM should be idle when the user is idle');
  observer.disconnect();
});
