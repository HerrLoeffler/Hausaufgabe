import {createWilmaDecisionClient} from './wilma-decision-client.mjs';
import {canonicalDecisionState,canonicalJson,decisionQuestionSnapshot} from './wilma-decision-state.mjs';
import {questionSnapshot} from './wilma-review-source.mjs';
import {createWilmaReviewClient} from './wilma-review-client.mjs';
import {installWilmaAnswerReview,reviewItem} from './wilma-answer-review.mjs';
import {writeWholeTeacherReview} from './teacher-review-write.mjs';
import {createWilmaAutoReview} from './wilma-auto-review.mjs';
import {teacherGradingSummary} from './teacher-grading-summary.mjs';
import { requestPublishReview } from './publish-review.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { JSDOM } from './tools/ui/node_modules/jsdom/lib/api.js';
import { syncDashboardTutorialEntry } from './dashboard-tutorial-entry.mjs';
import { recordTutorialSignIn } from './tutorial-signins.mjs';
import { createLocalTourRepository } from './guest-tour-port.mjs';
import { isAiReviewPending, shouldShowAiJob, parseStoredQualityIssue, buildQualityReviewReport, currentQualityIssues, questionReviewKey, editorQuestionIndex } from './ai-review-state.js';
import { assessmentContentLabels } from './shared/i18n/assessment-locale.mjs';
import { DEMO_TEST } from './gradecrew-tour.js?v=2.3.1-gc21';
import { validOrder, acceptedOrderingOrders, gradeOrdering, orderingNeedsReview, orderingVariants, orderingVariantsForStorage } from './ordering-grading.mjs';
import { formatMathText } from './shared/math-display.mjs';
import { createQuestionFeedbackClient } from './question-feedback-client.mjs';
import { installReviewMode } from './review-mode.mjs';

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
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=7');
    assert.equal(installGradeCrewEntryFlow(), true);
    for (const id of ['loginForm', 'registerForm', 'joinForm', 'forgotBtn', 'loginEmail', 'loginPassword', 'registerName', 'registerEmail', 'registerPassword', 'registerPassword2', 'joinCode']) {
      assert.ok(w.document.getElementById(id), `${id} must survive entry installation`);
    }
    assert.equal(w.document.getElementById('gcPublicNav'), null);
    assert.equal(w.document.querySelectorAll('#gcEntryBenefits > li:not([aria-hidden="true"])').length, 4);
    const paperActors = [...w.document.querySelectorAll('#gcEntryBenefits > .gcCrewPaper')];
    assert.equal(paperActors.length, 4);
    assert.ok(paperActors.every(actor => actor.getAttribute('aria-hidden') === 'true'), 'animation paper is decorative, not an extra benefit');
    assert.ok(w.document.querySelector('.topbar #gcEntryLoginOpen'), 'public sign-in belongs in the header');
    assert.equal(w.document.querySelector('#gcHeroActions #gcEntryLoginOpen'), null, 'the hero keeps one central crew action');
    assert.equal(w.document.getElementById('gcHeroHint'), null);
    assert.equal(w.document.querySelector('[data-i18n-key="hero.greeting"]'), null);
    let cocoStarted = false;
    w.document.addEventListener('gradecrew:start-guest-tour', () => { cocoStarted = true; }, { once: true });
    w.document.getElementById('gcHeroCocoTour').click();
    assert.equal(cocoStarted, false);
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.crew, 'coco');
    assert.match(w.document.getElementById('gcHeroDemoWorkspace').textContent, /Ratgeber/);
    w.document.getElementById('gcHeroDemoNext').click();
    assert.match(w.document.getElementById('gcHeroDemoWorkspace').textContent, /unten rechts/);
    w.document.getElementById('gcHeroDemoNext').click();
    assert.match(w.document.getElementById('gcHeroDemoWorkspace').textContent, /Frag mich/);
    assert.match(w.document.querySelector('#joinForm label').textContent, /Testcode/);
    assert.match(w.document.querySelector('#joinForm button[type="submit"]').textContent, /Test öffnen/);
    assert.ok(w.document.getElementById('gcHeroDemoNext'));
    w.document.querySelector('[data-hero-crew="remy"]').click();
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.phase, '0');
    w.document.getElementById('gcHeroDemoNext').click();
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.phase, '1');
    w.document.getElementById('gcHeroDialog').close();
    const remyButton = w.document.querySelector('.gcHeroHit-remy');
    remyButton.focus();
    remyButton.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
    remyButton.click();
    w.document.getElementById('gcHeroDialog').close();
    await Promise.resolve();
    assert.notEqual(w.document.activeElement, remyButton, 'pointer-opened crew dialog must not leave a blue oval focus ring');
    remyButton.focus();
    remyButton.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    remyButton.click();
    w.document.getElementById('gcHeroDialog').close();
    await Promise.resolve();
    assert.equal(w.document.activeElement, remyButton, 'keyboard-opened crew dialog must restore focus for accessibility');
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
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=7');
    assert.equal(installGradeCrewEntryFlow(), true);
    const appSource = fs.readFileSync('app.js', 'utf8');
    const source = appSource.slice(0, appSource.indexOf('import { initializeApp')).replace(/import \{ teacherGradingSummary \} from [^;]+;/, '') + appSource.slice(appSource.indexOf('const diagnostics ='));
    const noop = () => {};
    const loginCalls = [];
    let guestStarts = 0;
    let guestApi;
    let guestPort;
    let forbiddenCalls = 0;
    let allowAnnouncementReads = false;
    const announcementReads = [];
    const forbidden = () => { forbiddenCalls += 1; throw new Error('Guest tutorial reached a provider'); };
    const bindings = {
      requestPublishReview, teacherGradingSummary,createWilmaDecisionClient,canonicalDecisionState,canonicalJson,decisionQuestionSnapshot,questionSnapshot,createWilmaReviewClient,installWilmaAnswerReview,reviewItem,writeWholeTeacherReview,createWilmaAutoReview,
      initializeApp: () => ({}), getAuth: () => ({}), getFirestore: () => ({}), createAiClient: () => new Proxy({}, { get: () => forbidden }), installReviewMode,
      firebaseSignIn: (...args) => { loginCalls.push(args); return Promise.resolve({ user: {} }); },
      createDiagnostics: () => ({ record: noop, setRelease: noop }), installDiagnostics: noop,
      createQuickRemyBridge: () => ({ authChanged: noop, prepare: async () => ({}), submit: async () => ({}), recoverPending: async () => ({ status: 'none' }) }),
      publishAuthProfileForGeneration: async ({ readProfile, isCurrent, publishProfile }) => {
        const profile = await readProfile();
        if (!isCurrent()) return null;
        publishProfile(profile);
        return profile;
      },
      installWorkspaceInteractions: noop, bindTabs: noop, onAuthStateChanged: noop, focusView: noop, scrollBehavior: () => 'auto',
      setSaveState: noop, CSS: { escape: value => String(value) },
      requestStudentSubmitConfirmation: async () => true,
      syncDashboardTutorialEntry, recordTutorialSignIn,
      createQuestionFeedbackClient,
      assessmentContentLabels, formatMathText,
      validOrder, acceptedOrderingOrders, gradeOrdering, orderingNeedsReview, orderingVariants, orderingVariantsForStorage,
      AbortController,
      crypto: globalThis.crypto,
      isAiReviewPending, shouldShowAiJob, parseStoredQualityIssue, buildQualityReviewReport, currentQualityIssues, questionReviewKey, editorQuestionIndex,
      firestoreGetDoc: forbidden, firestoreGetDocs: () => allowAnnouncementReads
        ? new Promise(resolve => announcementReads.push(resolve)) : forbidden(), firestoreOnSnapshot: forbidden,
      firestoreSetDoc: forbidden, firestoreAddDoc: forbidden, firestoreUpdateDoc: forbidden,
      firestoreDeleteDoc: forbidden, firestoreWriteBatch: forbidden, firestoreRunTransaction: forbidden,
      collection: (...segments) => segments,
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
    vm.runInContext("state.user = { uid: 'previous-teacher' }", appContext);
    allowAnnouncementReads = true;
    const pendingAnnouncements = vm.runInContext('loadAnnouncements()', appContext);
    allowAnnouncementReads = false;
    assert.equal(announcementReads.length, 2);
    vm.runInContext('state.user = null', appContext);
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
    announcementReads[0]({ docs: [{ id: 'old', data: () => ({ title: 'Private alte Mitteilung', text: 'Vorheriges Konto', display: 'banner' }) }] });
    announcementReads[1]({ docs: [] });
    await pendingAnnouncements;
    assert.equal(w.document.getElementById('announcementHost').textContent.trim(), '', 'a delayed account announcement must not appear in the guest tour');
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
    const faultyCard = w.document.querySelector('#questionList .questionCard[data-id="tutorial-9"]');
    assert.match(faultyCard.querySelector('.qText').value, /gelb/);
    const badFeedback = faultyCard.querySelector('.aiFeedbackBad');
    assert.equal(badFeedback.classList.contains('hidden'), false, 'the real guest editor must show the red smiley for the faulty tutorial question');
    badFeedback.click();
    assert.ok(faultyCard.querySelector('.aiQualityPanel'), 'the real red smiley must open its feedback panel');
    assert.equal(faultyCard.querySelector('.aiQualityReplace'), null, 'the tutorial must not offer a replacement it cannot create');
    faultyCard.querySelector('.aiQualityCancel').click();
    w.document.getElementById('publishBtn').click();
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(w.document.querySelector('dialog.publishReview'));
    assert.equal(w.document.getElementById('publishView').classList.contains('hidden'), true);
    w.document.querySelector('.publishReview [data-action=next]').click();
    w.document.querySelector('.publishReview [data-action=next]').click();
    w.document.querySelector('.publishReview [data-action=publish]').click();
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

test('native auth intent opens the requested real form and keeps route context', async () => {
  const previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'NodeFilter', 'HTMLImageElement', 'matchMedia', 'requestAnimationFrame'].map(key => [key, globalThis[key]]));
  try {
    for (const [intent, expected] of [['login', 'login'], ['register', 'register'], ['reset', 'reset'], ['https://evil.example/', 'start'], ['login&test=ABCD1234', 'start'], ['login&preview=1', 'start']]) {
      const url = `https://hausaufgabe-staging.web.app/?gradecrewApp=teacher&source=ios&appVersion=0.1.9&intent=${intent.includes('&') ? intent : encodeURIComponent(intent)}&template=TEST1234&returnUrl=${encodeURIComponent('https://evil.example/')}`;
      const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url });
      const w = dom.window;
      w.scrollTo = () => {};
      w.HTMLDialogElement.prototype.close = function () { this.open = false; };
      Object.assign(globalThis, { window: w, document: w.document, MutationObserver: w.MutationObserver, NodeFilter: w.NodeFilter,
        HTMLImageElement: w.HTMLImageElement, matchMedia: () => ({ matches: false, addEventListener() {} }), requestAnimationFrame: callback => w.setTimeout(callback, 0) });
      const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=7');
      assert.equal(installGradeCrewEntryFlow(), true);
      assert.equal(w.document.getElementById('authView').dataset.entryState, expected, `intent=${intent}`);
      assert.equal(w.location.href, url, 'entry selection must not navigate to an untrusted return URL or lose context');
      w.document.dispatchEvent(new w.Event('gradecrew:signed-out'));
      assert.equal(w.document.getElementById('authView').dataset.entryState, expected, 'initial signed-out provider result must preserve requested auth entry');
      if (expected === 'login') {
        assert.equal(w.document.getElementById('loginForm').classList.contains('hidden'), false);
        assert.match(w.document.getElementById('gcEntryLoginTitle').textContent, /Willkommen zurück in der Crew\./);
        w.document.getElementById('loginEmail').value = 'teacher@example.test';
        w.document.getElementById('forgotBtn').click();
        assert.equal(w.document.getElementById('authView').dataset.entryState, 'reset');
        assert.equal(w.document.getElementById('resetEmail').value, 'teacher@example.test');
        await new Promise(resolve => w.setTimeout(resolve, 10));
        assert.equal(w.document.activeElement.id, 'resetEmail', 'recovery opens with focus in its email field');
        w.document.getElementById('gcEntryResetLogin').click();
        assert.equal(w.document.getElementById('authView').dataset.entryState, 'login');
        w.document.getElementById('gcEntrySwitchRegister').click();
        assert.equal(w.document.getElementById('authView').dataset.entryState, 'register');
        assert.equal(w.document.querySelectorAll('#registerForm').length, 1);
        await new Promise(resolve => w.setTimeout(resolve, 10));
        assert.equal(w.document.activeElement.id, 'registerName', 'registration opens with focus in its first field');
        assert.match(w.document.getElementById('gcEntryRegisterTitle').textContent, /Werde Teil der Crew\./);
        assert.ok(w.document.querySelector('#gcEntryRegister img[src*="crew-cutout-v2"]'));
        w.document.querySelector('#gcEntryRegister [data-entry-back]').click();
        assert.equal(w.document.getElementById('authView').dataset.entryState, 'start');
        assert.equal(new URL(w.location.href).searchParams.has('intent'), false, 'back removes the login intent so refresh stays on the start');
        assert.equal(new URL(w.location.href).searchParams.get('template'), 'TEST1234');
      }
      w.close();
      await new Promise(resolve => setImmediate(resolve));
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
  }
});

test('password recovery uses the existing provider once, shows status and protects a departed screen', async () => {
  const dom = new JSDOM('<form id="loginForm"><input id="loginEmail"><button id="forgotBtn"></button></form><form id="registerForm"></form><form id="resetForm"><input id="resetEmail" type="email" required><button id="resetSubmit" type="submit">Link senden</button><p id="resetStatus" role="status"></p></form><section id="authView" data-entry-state="reset"></section>');
  const w = dom.window;
  const calls = [];
  let finish, fail;
  const source = fs.readFileSync('app.js', 'utf8');
  const handlers = source.slice(source.indexOf('// ---------- Auth / Landing ----------'), source.indexOf('$("logoutBtn").addEventListener'));
  const context = vm.createContext({ document: w.document, $: id => w.document.getElementById(id), bindTabs() {}, auth: {}, authStateGeneration: 1,
    sendPasswordResetEmail: (...args) => { calls.push(args); return new Promise((resolve, reject) => { finish = resolve; fail = reject; }); },
    prompt() { assert.fail('reset must use the real form, never a prompt'); }, toast() {}, authMessage: () => 'Bitte versuche es erneut.' });
  try {
    vm.runInContext(handlers, context);
    w.document.getElementById('resetEmail').value = ' teacher@example.test ';
    const submit = () => w.document.getElementById('resetForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    submit(); submit();
    assert.equal(calls.length, 1, 'repeat submit while awaiting provider must not send a second reset');
    assert.equal(calls[0][1], 'teacher@example.test');
    assert.equal(w.document.getElementById('resetSubmit').disabled, true);
    finish(); await new Promise(resolve => setImmediate(resolve));
    assert.match(w.document.getElementById('resetStatus').textContent, /Falls ein Konto/);
    assert.equal(w.document.getElementById('resetSubmit').disabled, false);
    w.document.getElementById('resetStatus').textContent = '';
    submit();
    w.document.getElementById('authView').dataset.entryState = 'login';
    const waitingStatus = w.document.getElementById('resetStatus').textContent;
    finish(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(w.document.getElementById('resetStatus').textContent, waitingStatus, 'late recovery response must not update a departed screen');
    w.document.getElementById('authView').dataset.entryState = 'reset';
    w.document.getElementById('authView').dataset.entryRevision = '1';
    submit();
    w.document.getElementById('authView').dataset.entryRevision = '2';
    w.document.getElementById('resetStatus').textContent = 'Neue Ansicht';
    finish(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(w.document.getElementById('resetStatus').textContent, 'Neue Ansicht', 'a late result must not overwrite a newly opened reset screen');
    submit(); fail({ code: 'auth/user-not-found', message: 'Account does not exist' });
    await new Promise(resolve => setImmediate(resolve));
    assert.match(w.document.getElementById('resetStatus').textContent, /Falls ein Konto/);
    submit(); fail({ code: 'auth/network-request-failed', message: 'sensitive provider details' });
    await new Promise(resolve => setImmediate(resolve));
    assert.match(w.document.getElementById('resetStatus').textContent, /versuche es erneut/);
    assert.doesNotMatch(w.document.getElementById('resetStatus').textContent, /sensitive|does not exist/);
    const count = calls.length;
    w.document.getElementById('resetEmail').value = 'invalid-email'; submit();
    assert.equal(calls.length, count, 'invalid email must not reach the provider');
  } finally { w.close(); }
});

test('registration submits to the existing Firebase provider and preserves the teacher profile contract', async () => {
  const dom = new JSDOM('<form id="loginForm"></form><form id="registerForm"><input id="registerName"><input id="registerEmail"><input id="registerPassword"><input id="registerPassword2"></form>');
  const w = dom.window;
  const calls = [], writes = [], profiles = [];
  const source = fs.readFileSync('app.js', 'utf8');
  const handlers = source.slice(source.indexOf('// ---------- Auth / Landing ----------'), source.indexOf('$("logoutBtn").addEventListener'));
  const context = vm.createContext({ document: w.document, $: id => w.document.getElementById(id), bindTabs() {}, auth: {}, db: {},
    createUserWithEmailAndPassword: async (...args) => { calls.push(args); return { user: { uid: 'synthetic-teacher' } }; },
    updateProfile: async (...args) => profiles.push(args), setDoc: async (...args) => writes.push(args), doc: (...args) => args,
    serverTimestamp: () => 'synthetic-time', APP_VERSION: 'test', DEFAULT_SETTINGS: {}, DEFAULT_SCALE: {}, deepClone: value => JSON.parse(JSON.stringify(value)),
    toast() {}, authMessage: () => 'Fehler' });
  try {
    vm.runInContext(handlers, context);
    for (const [id, value] of [['registerName', ' Test Teacher '], ['registerEmail', ' teacher@example.test '], ['registerPassword', 'local-only'], ['registerPassword2', 'different']]) w.document.getElementById(id).value = value;
    const submit = () => w.document.getElementById('registerForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    submit(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls.length, 0, 'mismatched password must not reach the provider');
    w.document.getElementById('registerPassword2').value = 'local-only';
    submit(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1], 'teacher@example.test');
    assert.equal(calls[0][2], 'local-only');
    assert.equal(profiles[0][1].displayName, 'Test Teacher');
    assert.equal(writes.length, 1);
    assert.equal(writes[0][0][1], 'users');
    assert.equal(writes[0][0][2], 'synthetic-teacher');
    assert.equal(writes[0][1].role, 'teacher');
    assert.equal(writes[0][1].status, 'active');
  } finally { w.close(); }
});

// First-paint and delayed-entry regressions exercise the real bootstrap document.
const firstPaintHtml = fs.readFileSync('index.html', 'utf8');
const baseStyles = fs.readFileSync('styles.css', 'utf8');

function fixture() {
  const dom = new JSDOM(firstPaintHtml, { url: 'https://gradecrew.example/', pretendToBeVisual: true });
  const style = dom.window.document.createElement('style');
  style.textContent = baseStyles;
  dom.window.document.head.append(style);
  const NativeObserver = dom.window.MutationObserver;
  dom.observers = [];
  dom.window.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); dom.observers.push(this); }
  };
  return dom;
}

function visibleText(node, window) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return '';
  for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
    const style = window.getComputedStyle(ancestor);
    if (ancestor.hidden || ancestor.classList.contains('hidden') || style.display === 'none' || style.visibility === 'hidden') return '';
  }
  return [...node.childNodes].map(child => visibleText(child, window)).join(' ');
}

test('before modules start the actual document shows a neutral loader, not legacy hero or unfinished forms', () => {
  const dom = fixture();
  try {
    const w = dom.window, auth = w.document.getElementById('authView');
    const initial = visibleText(auth, w);
    assert.doesNotMatch(initial, /Gute Tests|Weniger Aufwand|Testcode eingeben|Willkommen zurück/);
    assert.match(initial, /GradeCrew wird geladen/);
    assert.equal(auth.querySelector('img[src*="clay-welcome"]'), null, 'obsolete first-paint art must not be requested');
    for (const id of ['joinForm', 'loginForm', 'registerForm', 'loginTab', 'registerTab', 'forgotBtn']) {
      const control = w.document.getElementById(id);
      assert.ok(control, `bootstrap preserves ${id}`);
      assert.equal(visibleText(control, w).trim(), '', `${id} is not exposed before handlers are ready`);
    }
  } finally { dom.window.close(); }
});

test('real entry installation moves the same forms into the modern scene and keeps login, register, reset and join', async () => {
  const dom = fixture(), w = dom.window;
  const keys = ['window', 'document', 'MutationObserver', 'NodeFilter', 'HTMLImageElement', 'matchMedia', 'requestAnimationFrame'];
  const previous = Object.fromEntries(keys.map(key => [key, globalThis[key]]));
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  Object.assign(globalThis, { window: w, document: w.document, MutationObserver: w.MutationObserver,
    NodeFilter: w.NodeFilter, HTMLImageElement: w.HTMLImageElement,
    matchMedia: () => ({ matches: false, addEventListener() {} }), requestAnimationFrame: callback => w.setTimeout(callback, 0) });
  try {
    const forms = Object.fromEntries(['joinForm', 'loginForm', 'registerForm'].map(id => [id, w.document.getElementById(id)]));
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=7');
    assert.equal(installGradeCrewEntryFlow(), true);
    for (const [id, form] of Object.entries(forms)) assert.equal(w.document.getElementById(id), form);
    assert.ok(w.document.querySelector('#gcEntryStart .gcHeroArtwork[src*="crew-classroom-wide-v4"]'));
    assert.doesNotMatch(visibleText(w.document.getElementById('authView'), w), /GradeCrew wird geladen/);
    assert.ok(visibleText(forms.joinForm, w).includes('Test öffnen'));
    w.document.getElementById('gcEntryLoginOpen').click();
    assert.ok(visibleText(forms.loginForm, w).includes('Anmelden'));
    w.document.getElementById('gcEntrySwitchRegister').click();
    assert.ok(visibleText(forms.registerForm, w).includes('Konto erstellen'));
    w.document.getElementById('gcEntrySwitchLogin').click();
    w.document.getElementById('forgotBtn').click();
    assert.ok(visibleText(w.document.getElementById('gcEntryReset'), w).includes('Passwort vergessen'));
  } finally {
    dom.observers.forEach(observer => observer.disconnect());
    w.close();
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
  }
});

test('slow and failed entry imports keep an accessible status and usable retry instead of exposing legacy controls', async () => {
  const dom = fixture(), w = dom.window;
  const timers = new Map(); let nextTimer = 0, failEntry, reloads = 0;
  const entry = new Promise((_resolve, reject) => { failEntry = reject; });
  const context = { document: w.document, HTMLImageElement: w.HTMLImageElement, URL, URLSearchParams,
    location: { search: '', href: 'https://gradecrew.example/', reload: () => { reloads += 1; } },
    window: { setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; }, clearTimeout: id => timers.delete(id) },
    gradeCrewI18n: { t: (_key, _params, fallback) => fallback }, GRADECREW_ASSETS: { brand: {} },
    installStagingShortLogin: () => {}, console: { error() {}, warn() {} },
    loadModule: specifier => specifier.includes('gradecrew-entry-flow') ? entry : Promise.reject(new Error('Unexpected import')) };
  vm.createContext(context);
  const startup = fs.readFileSync('startup.js', 'utf8').replace(/^import .+;\n/gm, '').replace(/\bimport\(/g, 'loadModule(');
  const running = vm.runInContext(`(async () => { ${startup}\n })()`, context);
  try {
    const notice = w.document.getElementById('startupNotice');
    assert.ok(notice.classList.contains('hidden'));
    timers.values().next().value();
    assert.ok(visibleText(notice, w).includes('GradeCrew wird geladen'));
    failEntry(new Error('Simulated entry module download failure'));
    await running;
    assert.ok(visibleText(notice, w).includes('konnte nicht vollständig geladen'));
    const retry = w.document.getElementById('startupRetry');
    assert.ok(visibleText(retry, w).includes('Erneut laden'));
    retry.click();
    assert.equal(reloads, 1);
    assert.equal(visibleText(w.document.getElementById('loginForm'), w).trim(), '');
  } finally { w.close(); }
});
