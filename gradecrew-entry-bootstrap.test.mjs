import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { JSDOM } from './tools/ui/node_modules/jsdom/lib/api.js';
import { createLocalTourRepository } from './guest-tour-port.mjs';
import { isAiReviewPending, shouldShowAiJob, parseStoredQualityIssue, buildQualityReviewReport, currentQualityIssues, questionReviewKey, editorQuestionIndex } from './ai-review-state.js';
import { assessmentContentLabels } from './shared/i18n/assessment-locale.mjs';
import { DEMO_TEST } from './gradecrew-tour.js?v=2.3.1-gc21';
import { validOrder, acceptedOrderingOrders, gradeOrdering, orderingNeedsReview } from './ordering-grading.mjs';

test('app entry parses as the ES module used by the browser', () => {
  execFileSync(process.execPath, ['--input-type=module', '--check'], { input: fs.readFileSync('app.js'), stdio: 'pipe' });
});

test('public entry installs on the real app document and preserves auth controls', async () => {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url: 'https://gradecrew.example/' });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  const previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'NodeFilter', 'HTMLImageElement', 'matchMedia', 'requestAnimationFrame'].map(key => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: w, document: w.document, MutationObserver: w.MutationObserver,
    NodeFilter: w.NodeFilter, HTMLImageElement: w.HTMLImageElement,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: callback => w.setTimeout(callback, 0)
  });
  try {
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=6');
    assert.equal(installGradeCrewEntryFlow(), true);
    for (const id of ['loginForm', 'registerForm', 'joinForm', 'forgotBtn', 'loginEmail', 'loginPassword', 'registerName', 'registerEmail', 'registerPassword', 'registerPassword2', 'joinCode']) {
      assert.ok(w.document.getElementById(id), `${id} must survive entry installation`);
    }
    assert.equal(w.document.getElementById('gcPublicNav'), null);
    assert.equal(w.document.querySelectorAll('#gcEntryBenefits li').length, 4);
    assert.match(w.document.getElementById('gcHeroHint').textContent, /Remy, Emmi oder Wilma/);
    assert.match(w.document.querySelector('#joinForm label').textContent, /Testcode/);
    assert.match(w.document.querySelector('#joinForm button[type="submit"]').textContent, /Test öffnen/);
    assert.ok(w.document.getElementById('gcHeroDemoNext'));
    w.document.querySelector('[data-hero-crew="remy"]').click();
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.phase, '0');
    w.document.getElementById('gcHeroDemoNext').click();
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.phase, '1');
    w.document.getElementById('gcHeroDialog').close();
    let guestStarts = 0;
    w.document.addEventListener('gradecrew:start-guest-tour', () => { guestStarts += 1; });
    w.document.getElementById('gcEntryTutorialStart').click();
    assert.equal(guestStarts, 1);
    assert.equal(w.document.getElementById('gcEntryTutorialName'), null, 'obsolete slideshow must not exist');
    w.document.getElementById('gcEntryLoginOpen').click();
    assert.equal(w.document.getElementById('gcEntryLogin').classList.contains('hidden'), false);
    assert.equal(w.document.getElementById('loginForm').classList.contains('hidden'), false);
    w.document.getElementById('gcEntrySwitchRegister').click();
    assert.equal(w.document.getElementById('gcEntryRegister').classList.contains('hidden'), false);
    assert.equal(w.document.getElementById('registerForm').classList.contains('hidden'), false);
  } finally {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
    w.close();
  }
});

test('app bootstrap binds its real auth controls after public entry installation', async () => {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url: 'https://gradecrew.example/' });
  const w = dom.window;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  const previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'NodeFilter', 'HTMLImageElement', 'matchMedia', 'requestAnimationFrame'].map(key => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: w, document: w.document, MutationObserver: w.MutationObserver,
    NodeFilter: w.NodeFilter, HTMLImageElement: w.HTMLImageElement,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: callback => w.setTimeout(callback, 0)
  });
  try {
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=6');
    assert.equal(installGradeCrewEntryFlow(), true);
    const appSource = fs.readFileSync('app.js', 'utf8');
    const source = appSource.slice(0, appSource.indexOf('import { initializeApp')) + appSource.slice(appSource.indexOf('const diagnostics ='));
    const noop = () => {};
    const loginCalls = [];
    let guestStarts = 0;
    let guestApi;
    let guestPort;
    let forbiddenCalls = 0;
    const forbidden = () => { forbiddenCalls += 1; throw new Error('Guest tutorial reached a provider'); };
    const bindings = {
      initializeApp: () => ({}), getAuth: () => ({}), getFirestore: () => ({}), createAiClient: () => new Proxy({}, { get: () => forbidden }),
      firebaseSignIn: (...args) => { loginCalls.push(args); return Promise.resolve({ user: {} }); },
      createDiagnostics: () => ({ record: noop, setRelease: noop }), installDiagnostics: noop,
      installWorkspaceInteractions: noop, bindTabs: noop, onAuthStateChanged: noop, focusView: noop, scrollBehavior: () => 'auto',
      setSaveState: noop, CSS: { escape: value => String(value) },
      requestStudentSubmitConfirmation: async () => true,
      assessmentContentLabels,
      validOrder, acceptedOrderingOrders, gradeOrdering, orderingNeedsReview,
      AbortController,
      crypto: globalThis.crypto,
      isAiReviewPending, shouldShowAiJob, parseStoredQualityIssue, buildQualityReviewReport, currentQualityIssues, questionReviewKey, editorQuestionIndex,
      firestoreGetDoc: forbidden, firestoreGetDocs: forbidden, firestoreOnSnapshot: forbidden,
      firestoreSetDoc: forbidden, firestoreAddDoc: forbidden, firestoreUpdateDoc: forbidden,
      firestoreDeleteDoc: forbidden, firestoreWriteBatch: forbidden,
      createLocalTourRepository: () => { guestPort = createLocalTourRepository(); return guestPort; },
      installCrewTour: api => { guestApi = api; return {
        start() { guestStarts += 1; }, stop: noop, notify: noop,
        ownsQuiz: id => id === 'TOURLOCAL',
        preparedResponse: (_question, { variant } = {}) => ({ question: { type: 'single', text: variant ? 'Cat?' : 'Dog, revised?', points: 1,
          options: [{ text: 'cat', correct: true }, { text: 'dog', correct: false }], mediaIntent: { kind: 'none' } }, meta: {} })
      }; },
      firebaseModule: { firebaseConfig: {} },
      document: w.document, window: w, location: w.location, navigator: w.navigator,
      localStorage: w.localStorage, sessionStorage: w.sessionStorage,
      MutationObserver: w.MutationObserver, ResizeObserver: undefined,
      Event: w.Event, Node: w.Node, HTMLElement: w.HTMLElement,
      fetch: async () => ({ ok: false }), console,
      setTimeout, clearTimeout, setInterval, clearInterval,
      requestAnimationFrame: callback => w.setTimeout(callback, 0)
    };
    const appContext = vm.createContext(bindings);
    vm.runInContext(source, appContext, { filename: 'app.js', timeout: 2000 });
    w.document.getElementById('quizList').innerHTML = '<article>Privater Test vom vorigen Konto</article>';
    w.document.getElementById('aiJobsList').innerHTML = '<article>Privater KI-Auftrag</article>';
    w.document.getElementById('localDraftList').innerHTML = '<article>Privater lokaler Entwurf</article>';
    w.document.getElementById('announcementHost').innerHTML = '<article>Private Mitteilung</article>';
    w.document.getElementById('firstTestDashboard').innerHTML = '<article>Private Einführung</article>';
    w.document.getElementById('gcEntryTutorialStart').click();
    assert.equal(guestStarts, 1, 'the real tour controller must start from the public CTA');
    assert.equal(w.document.getElementById('dashboardView').classList.contains('hidden'), false);
    for (const id of ['quizList', 'aiJobsList', 'localDraftList', 'announcementHost', 'firstTestDashboard']) {
      assert.equal(w.document.getElementById(id).textContent.trim(), '', `${id} must not expose the previous account during a guest tour`);
    }
    const demoCode = await guestApi.createDemo({ title: 'English 4', subject: 'Englisch', grade: '4',
      questions: [{ type: 'single', text: 'Dog?', points: 1, options: [{ text: 'dog', correct: true }, { text: 'cat', correct: false }] }] });
    await guestApi.openEditor(demoCode);
    assert.equal(w.document.getElementById('editorView').classList.contains('hidden'), false);
    w.document.querySelector('#questionList .aiEditQuestion').click();
    const editPanel = w.document.querySelector('#questionList .questionAiPanel');
    editPanel.querySelector('textarea').value = 'Einfacher';
    editPanel.querySelector('.aiApply').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.match(w.document.querySelector('#questionList .qText').value, /revised/);
    const variantRequest = { quizId: demoCode, ownerId: 'local-tour', id: 'tutorial-1', count: 1, mediaKind: 'none', accepted: false };
    w.document.dispatchEvent(new w.CustomEvent('gradecrew:variant-request', { detail: variantRequest }));
    assert.equal(variantRequest.accepted, true);
    await new Promise(resolve => setImmediate(resolve));
    w.document.querySelector('#variantBackgroundProgress .applyVariants').click();
    assert.equal(w.document.querySelectorAll('#questionList .questionCard').length, 2);
    await guestApi.createDemo(DEMO_TEST);
    await guestApi.openEditor(demoCode);
    assert.equal(w.document.querySelectorAll('#questionList .questionCard').length, 10);
    w.document.getElementById('publishBtn').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(w.document.getElementById('publishView').classList.contains('hidden'), false);
    w.document.getElementById('openPublishedStudentBtn').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(w.document.getElementById('studentView').classList.contains('hidden'), false);
    w.document.getElementById('studentName').value = 'ML';
    w.document.getElementById('studentStartBtn').click();
    await new Promise(resolve => setImmediate(resolve));
    const studentSubmit = new w.Event('submit', { bubbles: true, cancelable: true });
    w.document.getElementById('studentForm').dispatchEvent(studentSubmit);
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(w.document.getElementById('studentTeacherResultsBtn'));
    w.document.getElementById('studentTeacherResultsBtn').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(w.document.getElementById('resultsView').classList.contains('hidden'), false);
    w.document.querySelector('#resultsTableWrap .reviewBtn').click();
    w.document.getElementById('saveReview').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.match(w.document.getElementById('resultsTableWrap').textContent, /Bewertet/);
    assert.equal(forbiddenCalls, 0, 'guest data flow must not call Firestore, AI or Billing');
    guestApi.exitTour();
    assert.equal(w.document.getElementById('authView').classList.contains('hidden'), false);
    assert.equal(w.document.getElementById('gcEntryLogin').classList.contains('hidden'), false);
    assert.equal(guestPort.getQuiz(demoCode), null, 'guest data must be erased on exit');
    for (const id of ['studentQuizCard', 'resultsTableWrap', 'reviewPanel', 'questionList', 'questionOutline', 'publishedCode', 'qrcode', 'teacherLivePanel']) {
      assert.equal(w.document.getElementById(id).textContent.trim(), '', `${id} must not retain guest data after exit`);
    }
    assert.equal(w.document.getElementById('publishedLink').value, '');
    assert.equal(w.document.getElementById('quizTitle').value, '');
    w.document.getElementById('gcEntryLogin').querySelector('[data-entry-back]').click();
    w.document.getElementById('gcEntryTutorialStart').click();
    assert.equal(guestStarts, 2, 'a fresh guest run can start after cleanup');
    assert.equal(guestPort.getQuiz(demoCode), null, 'a new run must not revive previous data');
    guestApi.exitTour();
    w.document.getElementById('loginEmail').value = 'teacher@example.test';
    w.document.getElementById('loginPassword').value = 'local-test-only';
    const submit = new w.Event('submit', { bubbles: true, cancelable: true });
    w.document.getElementById('loginForm').dispatchEvent(submit);
    assert.equal(submit.defaultPrevented, true);
    assert.equal(loginCalls.length, 1);
    assert.equal(loginCalls[0][1], 'teacher@example.test');
    assert.equal(loginCalls[0][2], 'local-test-only');
    vm.runInContext("state.user = { uid: 'teacher' }", appContext);
    w.document.getElementById('newQuizBtn').click();
    assert.equal(w.document.getElementById('createView').classList.contains('hidden'), false, 'an authenticated teacher can still open the real new-test view');
    await new Promise(resolve => setImmediate(resolve));
    await Promise.resolve();
  } finally {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
    w.close();
  }
});
