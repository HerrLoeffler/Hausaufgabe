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

test('sticky offsets react to a wrapping header and disconnect when a view is replaced', t => {
  const w = fixture(t);
  let observer;
  w.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {} disconnect() { this.disconnected = true; }
  };
  const header = w.document.querySelector('.topbar');
  let height = 76;
  header.getBoundingClientRect = () => ({ height });
  const stop = w.watchStickyHeight(header, '--topbar-height');
  assert.equal(w.document.documentElement.style.getPropertyValue('--topbar-height'), '76px');
  height = 134;
  observer.callback();
  assert.equal(w.document.documentElement.style.getPropertyValue('--topbar-height'), '134px');
  stop();
  assert.equal(observer.disconnected, true);
});

test('all static form controls, tabs and dialogs have explicit accessible names', t => {
  const w = fixture(t);
  const docs = [w.document, w.$('questionTemplate').content];
  for (const root of docs) {
    for (const field of root.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      const named = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby') || field.closest('label') || field.labels?.length;
      assert.ok(named, field.id || field.className);
    }
  }
  for (const tab of w.document.querySelectorAll('[role=tab]')) {
    const panel = w.$(tab.getAttribute('aria-controls'));
    assert.ok(panel, tab.id);
    assert.equal(panel.getAttribute('aria-labelledby'), tab.id);
  }
  for (const dialog of w.document.querySelectorAll('dialog')) assert.ok(dialog.getAttribute('aria-label') || w.$(dialog.getAttribute('aria-labelledby')), dialog.id);
  const ids = [...w.document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length, 'IDs must remain unique');
});

test('student navigation tracks a long current question and the final question', async t => {
  const w = fixture(t);
  w.matchMedia = () => ({ matches: true });
  w.$('studentView').classList.remove('hidden');
  w.$('studentQuizCard').innerHTML = '<div id="studentTimerBar"></div><div id="studentProgressBar"><div id="studentQuestionNav"><button class="questionNavDot">1</button><button class="questionNavDot">2</button></div></div><section class="studentQuestion" data-qid="a"></section><section class="studentQuestion" data-qid="b"></section>';
  const sections = [...w.document.querySelectorAll('.studentQuestion')];
  let tops = [-900, 416];
  sections.forEach((section, index) => { section.getBoundingClientRect = () => ({ top: tops[index], bottom: tops[index] + 1300 }); });
  const scrolls = [];
  sections[1].scrollIntoView = options => scrolls.push(options);
  runUi(w, 'ui-enhancements.js');
  await settle();
  assert.equal(w.document.querySelector('.studentCurrentNumber').textContent, '1');
  w.document.querySelector('.studentNextQuestion').click();
  assert.equal(w.document.activeElement, sections[1]);
  assert.equal(scrolls[0].behavior, 'instant', 'reduced motion applies to script scrolling');
  tops = [-2000, -400];
  w.dispatchEvent(new w.Event('scroll'));
  await settle();
  assert.equal(w.document.querySelector('.studentCurrentNumber').textContent, '2');
  assert.equal(w.document.querySelector('.studentNextQuestion').disabled, true);
  assert.equal(w.document.querySelectorAll('[aria-current="step"]').length, 1);
  const toggle = w.document.querySelector('.studentOverviewToggle');
  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  w.$('studentQuestionNav').querySelector('button').click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
});

test('optional enhancements never inject CSS or rearrange the editor', async t => {
  const w = fixture(t);
  const original = w.$('editorView').innerHTML;
  const styles = w.document.head.querySelectorAll('style').length;
  runUi(w, 'layout-enhancements.js');
  runUi(w, 'ui-enhancements.js');
  runUi(w, 'variant-enhancements.js');
  runUi(w, 'admin-ai-access.js');
  await settle();
  assert.equal(w.$('editorView').innerHTML, original);
  assert.equal(w.document.head.querySelectorAll('style').length, styles);
});

test('student passage cleanup preserves instructions after an inline quotation', t => {
  const w = fixture(t);
  runUi(w, 'ui-enhancements.js');
  assert.equal(w.stripDuplicatePassage('Markiere die Verben: Tom liest.', 'Tom liest.'), 'Markiere die Verben');
  const instruction = 'Markiere in „Tom liest.“ das Verb und begründe deine Wahl.';
  assert.equal(w.stripDuplicatePassage(instruction, 'Tom liest.'), instruction);
});

test('question navigation keeps a reachable focus target after removing or changing a task', t => {
  const w = fixture(t);
  const card = editor(w);
  w.eval(fn('focusEditorQuestion'));
  w.focusEditorQuestion(0, '.qType');
  assert.equal(w.document.activeElement, card.querySelector('.qType'));
  card.querySelector('.questionTextLabel').classList.add('hidden');
  w.focusEditorQuestion(0, '.qText');
  assert.equal(w.document.activeElement, card, 'gap-fill tasks do not focus a hidden text field');
  card.remove();
  w.focusEditorQuestion(-1);
  assert.equal(w.document.activeElement, w.$('addQuestionBtn'));
});

test('grading keeps the question image, names the points field and restores focus on close', t => {
  const w = fixture(t);
  w.$('resultsView').classList.remove('hidden');
  w.$('resultsTableWrap').innerHTML = '<button id="review-origin">Bewerten</button>';
  w.$('review-origin').focus();
  w.state = {
    submissions: [{ id: 's1', studentName: 'TEST-01', answers: {}, grading: {} }],
    resultQuestions: [{ id: 'q"1', text: 'Frage mit Bild', type: 'truefalse', points: 2, imageUrl: 'https://example.test/question.png' }]
  };
  w.fmtDate = () => '';
  w.answerDisplay = () => 'Richtig';
  w.correctDisplay = () => 'Falsch';
  w.getQuestionImageSrc = question => question.imageUrl;
  w.round1 = value => Math.round(value * 10) / 10;
  w.getQuizScale = () => ({});
  w.gradeFromPercent = () => 2;
  w.eval(fn('openReview'));
  w.openReview('s1');
  assert.equal(w.document.activeElement, w.$('reviewHeading'));
  const field = w.document.querySelector('.manualPoints');
  assert.equal(field.dataset.qid, 'q"1');
  assert.match(field.labels[0].textContent, /Aufgabe 1/);
  assert.equal(field.step, '0.5');
  assert.equal(w.document.querySelector('.reviewQuestionImage img').alt, 'Bild zu Aufgabe 1');
  w.$('closeReview').click();
  assert.equal(w.document.activeElement, w.$('review-origin'));
  assert.equal(w.$('reviewPanel').classList.contains('hidden'), true);
});
