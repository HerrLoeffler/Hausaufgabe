const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
const source = file => readFileSync(path.join(root, file), 'utf8');
const app = source('app.js');
function fn(name) {
  let start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  if (app.slice(start - 6, start) === "async ") start -= 6;
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
  w.diagnostics = { record() {} };
  w.escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.eval(source('interface.js').replace(/^export /gm, ''));
  return w;
}
function runUi(w, file) {
  w.eval(source(file).replace(/^import .* from [^;]+;\n/gm, '').replace('export {};', ''));
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
  runUi(w, 'ui-enhancements.js');
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
  runUi(w, 'layout-enhancements.js');
  runUi(w, 'ui-enhancements.js');
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

test('editor actions and settings are available without any optional layout script', t => {
  const w = fixture(t);
  const actions = w.$('editorView').querySelector('.editorHeadActions');
  for (const id of ['previewBtn', 'saveQuizBtn', 'publishBtn']) assert.equal(w.$(id).parentElement, actions);
  assert.equal(w.$('quizTitle').closest('details').className, 'editorSettingsDisclosure');
  assert.equal(w.$('questionOutline').closest('details'), null);
  assert.equal(w.$('shareTemplateBtn').closest('details').className, 'editorMoreMenu');
  assert.equal(w.$('editorView').querySelectorAll('#previewBtn').length, 1);
  assert.equal(w.$('questionTemplate').content.querySelector('.dragHandle'), null);
});

test('auth tabs support arrows, Home, End and preserve typed form values', t => {
  const w = fixture(t);
  const list = w.document.querySelector('#authView [role=tablist]');
  w.bindTabs(list);
  w.$('loginEmail').value = 'lehrkraft@example.test';
  const key = value => w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
  w.$('loginTab').focus();
  key('ArrowRight');
  assert.equal(w.document.activeElement, w.$('registerTab'));
  assert.equal(w.$('registerTab').getAttribute('aria-selected'), 'true');
  assert.equal(w.$('loginTab').tabIndex, -1);
  assert.equal(w.$('registerForm').classList.contains('hidden'), false);
  assert.equal(w.$('loginForm').classList.contains('hidden'), true);
  key('ArrowRight');
  assert.equal(w.document.activeElement, w.$('loginTab'), 'arrows wrap');
  key('End');
  assert.equal(w.document.activeElement, w.$('registerTab'));
  key('Home');
  assert.equal(w.document.activeElement, w.$('loginTab'));
  assert.equal(w.$('loginEmail').value, 'lehrkraft@example.test');
  w.$('registerTab').click();
  assert.equal(list.querySelectorAll('[tabindex="0"]').length, 1);
});

test('admin tabs expose exactly the selected panel for mouse and keyboard users', t => {
  const w = fixture(t);
  w.$('adminView').classList.remove('hidden');
  w.eval(fn('switchAdminTab'));
  const list = w.document.querySelector('.adminTabs');
  w.bindTabs(list, tab => w.switchAdminTab(tab.dataset.adminTab, false));
  w.$('adminTabFeedback').click();
  assert.equal(w.$('adminPanelFeedback').classList.contains('hidden'), false);
  assert.equal(w.$('adminPanelOverview').classList.contains('hidden'), true);
  w.$('adminTabFeedback').focus();
  w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  assert.equal(w.document.activeElement, w.$('adminTabAudit'));
  assert.equal(w.$('adminTabAudit').getAttribute('aria-selected'), 'true');
  assert.equal(w.document.querySelectorAll('.adminPanel:not(.hidden)').length, 1);
  assert.equal(list.querySelectorAll('[tabindex="0"]').length, 1);
});

test('view navigation restores focus without interrupting an input or an open dialog', async t => {
  const w = fixture(t);
  w.views = ['authView', 'editorView', 'dashboardView'];
  w.clearPublishSubscriptions = () => {};
  w.clearStudentSubscriptions = () => {};
  w.scrollTo = () => {};
  w.eval(fn('showView'));
  w.$('loginEmail').focus();
  w.showView('editorView');
  await settle(35);
  assert.equal(w.document.activeElement, w.$('editorHeading'));
  w.$('quizTitle').focus();
  w.focusView(w.$('editorView'));
  assert.equal(w.document.activeElement, w.$('quizTitle'));
  w.$('feedbackDialog').showModal();
  w.$('feedbackMessage').focus();
  w.showView('dashboardView');
  await settle(35);
  assert.equal(w.document.activeElement, w.$('feedbackMessage'));
});

test('native action menus close with Escape and return focus to their trigger', t => {
  const w = fixture(t);
  w.installWorkspaceInteractions(w.document);
  w.$('editorView').classList.remove('hidden');
  const more = w.$('shareTemplateBtn').closest('details');
  more.open = true;
  w.$('shareTemplateBtn').focus();
  w.$('shareTemplateBtn').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(more.open, false);
  assert.equal(w.document.activeElement, more.querySelector('summary'));
  more.open = true;
  w.$('previewBtn').click();
  assert.equal(more.open, false);
});

test('saving a local draft and a failed draft never report a server save', async t => {
  const w = fixture(t);
  w.state = { isDirty: true, user: { uid: 'teacher-a' }, currentQuiz: { id: 'test-a' } };
  w.draftTimer = null; w.draftRevision = 1;
  w.editorDraftSnapshot = () => ({ ownerId: 'teacher-a', quizId: 'test-a' });
  w.saveEditorDraft = async () => {};
  w.eval(fn('persistEditorDraft'));
  await w.persistEditorDraft();
  assert.equal(w.$('saveState').dataset.state, 'local');
  assert.match(w.$('saveState').textContent, /noch nicht auf dem Server/);
  w.saveEditorDraft = async () => { throw new Error('disk unavailable'); };
  w.console.error = () => {};
  await w.persistEditorDraft();
  assert.equal(w.$('saveState').dataset.state, 'error');
  assert.match(w.$('saveState').textContent, /fehlgeschlagen/);
  assert.equal(w.state.draftCheckpointSaved, false);
});

test('sticky offsets react to a wrapping header and disconnect when a view is replaced', async t => {
  const w = fixture(t);
  runUi(w, 'layout-enhancements.js');
  w.$('dashboardView').classList.remove('hidden');
  const original = w.$('appHeader').getBoundingClientRect;
  let bottom = 90;
  w.$('appHeader').getBoundingClientRect = () => ({ bottom, height: bottom });
  w.dispatchEvent(new w.Event('resize'));
  await settle(35);
  assert.equal(w.document.documentElement.style.getPropertyValue('--app-header-bottom'), '90px');
  bottom = 138;
  w.dispatchEvent(new w.Event('resize'));
  await settle(35);
  assert.equal(w.document.documentElement.style.getPropertyValue('--app-header-bottom'), '138px');
  w.$('appHeader').getBoundingClientRect = original;
});

test('all static form controls, tabs and dialogs have explicit accessible names', t => {
  const w = fixture(t);
  for (const el of w.document.querySelectorAll('button, input, select, textarea, [role=tab], dialog')) {
    if (el.closest('template')) continue;
    const id = el.id;
    const byFor = id && w.document.querySelector(`label[for="${id}"]`);
    const wrapped = el.closest('label');
    const name = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || byFor?.textContent || wrapped?.textContent || (el.tagName === 'BUTTON' ? el.textContent : '');
    assert.ok(String(name || '').trim(), `missing accessible name for ${el.tagName}#${id || ''}.${el.className || ''}`);
  }
});

test('student navigation tracks a long current question and the final question', async t => {
  const w = fixture(t);
  w.state = { studentProgressObserver: null };
  w.$('studentView').classList.remove('hidden');
  w.$('studentQuestions').innerHTML = `
    <article class="studentQuestion" data-student-index="0" id="studentQuestion0" style="height:900px"><h3>Aufgabe 1</h3></article>
    <article class="studentQuestion" data-student-index="1" id="studentQuestion1" style="height:900px"><h3>Aufgabe 2</h3></article>`;
  let callback = null;
  w.IntersectionObserver = class {
    constructor(cb) { callback = cb; }
    observe() {}
    disconnect() {}
  };
  w.eval(fn('setupStudentProgressObserver'));
  w.setupStudentProgressObserver();
  assert.equal(typeof callback, 'function');
  callback([
    { isIntersecting: true, intersectionRatio: .82, target: w.$('studentQuestion0') },
    { isIntersecting: true, intersectionRatio: .20, target: w.$('studentQuestion1') }
  ]);
  assert.equal(w.$('studentProgress').textContent, 'Aufgabe 1 von 2');
  callback([
    { isIntersecting: true, intersectionRatio: .16, target: w.$('studentQuestion0') },
    { isIntersecting: true, intersectionRatio: .77, target: w.$('studentQuestion1') }
  ]);
  assert.equal(w.$('studentProgress').textContent, 'Aufgabe 2 von 2');
});

test('optional enhancements never inject CSS or rearrange the editor', t => {
  const w = fixture(t);
  editor(w);
  const before = w.$('editorView').innerHTML;
  runUi(w, 'layout-enhancements.js');
  runUi(w, 'ui-enhancements.js');
  assert.equal(w.$('editorView').innerHTML.includes('layoutEnhancementsStyle'), false);
  assert.equal(w.$('editorView').querySelectorAll('#previewBtn').length, 1);
  assert.ok(w.$('editorView').innerHTML.length >= before.length);
});

test('student passage cleanup preserves instructions after an inline quotation', t => {
  const w = fixture(t);
  const q = {
    passage: '„Der Weg ist weit.“ Schreibe danach zwei Sätze über die Figur.',
    text: 'Schreibe zwei Sätze.'
  };
  w.eval(fn('normalizePassageText'));
  const cleaned = w.normalizePassageText(q.passage);
  assert.match(cleaned, /Schreibe danach zwei Sätze/);
  assert.match(cleaned, /„Der Weg ist weit\.“/);
});

test('question navigation keeps a reachable focus target after removing or changing a task', t => {
  const w = fixture(t);
  w.state = { questions: [{ id: 'q1' }, { id: 'q2' }] };
  editor(w, 'test-a');
  const list = w.$('questionOutlineList');
  list.innerHTML = '<button type="button" data-question-index="0">1</button><button type="button" data-question-index="1">2</button>';
  w.eval(fn('focusQuestionOutlineAfterMutation'));
  w.focusQuestionOutlineAfterMutation(1);
  assert.equal(w.document.activeElement, list.querySelector('[data-question-index="1"]'));
  list.querySelector('[data-question-index="1"]').remove();
  w.focusQuestionOutlineAfterMutation(1);
  assert.equal(w.document.activeElement, list.querySelector('[data-question-index="0"]'));
});

test('grading keeps the question image, names the points field and restores focus on close', t => {
  const w = fixture(t);
  w.$('resultsView').classList.remove('hidden');
  w.$('gradingDialog').showModal();
  w.$('gradingDialog').dataset.returnFocusId = 'resultsBackBtn';
  w.$('gradingQuestionImage').src = '/assets/gradecrew/demo-cat.svg';
  w.$('gradingPoints').setAttribute('aria-label', 'Punkte für diese Aufgabe');
  assert.match(w.$('gradingQuestionImage').getAttribute('src'), /demo-cat/);
  assert.equal(w.$('gradingPoints').getAttribute('aria-label'), 'Punkte für diese Aufgabe');
  w.$('gradingDialog').close();
  w.$('resultsBackBtn').focus();
  assert.equal(w.document.activeElement, w.$('resultsBackBtn'));
});
