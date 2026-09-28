import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('gradecrew-tour-v7.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const copyPolish = fs.readFileSync('teacher-copy-polish.js', 'utf8');
const variantEnhancements = fs.readFileSync('variant-enhancements.js', 'utf8');

function fn(name) {
  let start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  if (app.slice(start - 6, start) === 'async ') start -= 6;
  return app.slice(start, app.indexOf('\n}', start) + 2);
}

function fixture(t, { publicEntry = false } = {}) {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), {
    url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.CSS = { escape: value => String(value) };
  w.scrollTo = () => {};
  w.eval(source.replace(/^export /gm, '') + '\nwindow.demo=DEMO_TEST;window.install=installCrewTour;window.response=preparedResponse;window.crew=CREW;window.tourVersion=TOUR_VERSION;');
  if (publicEntry) {
    // Follow the shipped public entry point, including its wrapper. Testing only
    // V7 missed V8 spreading and freezing the active/creating accessors.
    const entry = fs.readFileSync('gradecrew-tour.js', 'utf8');
    const modulePath = entry.match(/from "\.\/(.*?)\?/)[1];
    const wrapper = fs.readFileSync(modulePath, 'utf8')
      .replace(/^import \{[\s\S]*?\} from .*?;\n/, '')
      .replace(/^export \{ CREW \};\n/m, '').replace(/^export /gm, '');
    w.eval(`(() => { const installV7=window.install, CREW=window.crew, V7_DEMO_TEST=window.demo;\n${wrapper}\nwindow.demo=DEMO_TEST;window.install=installCrewTour;window.response=preparedResponse;window.tourVersion=TOUR_VERSION; })()`);
  }
  return w;
}

function adapter(w) {
  let uid = 'teacher-a';
  const calls = [];
  return {
    calls,
    uid: () => uid,
    setUid: value => { uid = value; },
    isDashboard: () => true,
    beginRun: () => calls.push('begin'),
    createDemo: async () => { calls.push('persist'); return 'DEMO1'; },
    openEditor: async () => calls.push('editor'),
    isEditor: () => true,
    questionId: index => `tutorial-${index + 1}`,
    focusQuestion: () => {},
    showSettings: () => {},
    checkDemo: () => null,
    focusReviewLast: () => {}
  };
}

async function until(predicate, label, timeout = 4000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.fail(`Timed out: ${label}`);
}

test('Public wrapper keeps live flags; Remy appears alone and onboarding never starts a provider job', async t => {
  const w = fixture(t, { publicEntry: true });
  const api = adapter(w);
  const tour = w.install(api);
  let providerCalls = 0, preparedCalls = 0;
  Object.assign(w, {
    crewTour: tour, toast: () => {}, collectAiRequest: () => ({}),
    saveAiPreferences: async () => {}, startAiCreationJob: async () => providerCalls++
  });
  w.eval(fn('generateAiTestNative'));
  assert.equal(tour.active, false);
  tour.start();
  assert.equal(tour.active, true);
  await w.generateAiTestNative(); // Wrong tutorial stage must fail closed.
  assert.equal(providerCalls, 0);
  w.document.querySelector('.gcCoachNext').click();
  tour.notify('view', { id: 'createView' });
  const handoff = w.document.querySelector('.gcCoachHandoff');
  assert.equal(handoff.querySelectorAll('img').length, 1);
  assert.match(handoff.querySelector('img').src, /elephant-create/);
  handoff.querySelector('.gcCoachNext').click();
  tour.notify('view', { id: 'aiView' });
  assert.equal(tour.creating, true);
  tour.create = async () => preparedCalls++;
  await w.generateAiTestNative();
  assert.equal(preparedCalls, 1);
  assert.equal(providerCalls, 0);
  w.document.dispatchEvent(new w.CustomEvent('gradecrew:account-changed'));
  assert.equal(tour.active, false);
  assert.equal(tour.creating, false);
  await w.generateAiTestNative();
  assert.equal(providerCalls, 1, 'ordinary creation still reaches its normal backend');
});

test('Public journey and real variant queue: prepared cat persists once, targeted Keep continues to real student/results flow', async t => {
  const w = fixture(t, { publicEntry: true });
  const nativeTimeout = w.setTimeout.bind(w);
  w.setTimeout = (callback, delay, ...args) => nativeTimeout(callback, Math.min(delay, 2), ...args);
  const api = adapter(w);
  let nextId = 0, providers = 0, persistedDraft;
  const state = { user: { uid: api.uid() }, currentQuiz: { id: 'DEMO1', published: false }, questions: [] };
  const el = id => w.document.getElementById(id);
  const render = () => {
    const host = el('questionList'); host.replaceChildren();
    const outline = el('questionOutline'); outline.replaceChildren();
    state.questions.forEach((q, index) => {
      const card = w.document.createElement('article');
      card.className = 'questionCard'; card.dataset.id = q.id; card.dataset.index = String(index);
      card.innerHTML = '<div class="questionTop"></div><textarea class="qText"></textarea><button class="aiEditQuestion">Edit</button><button class="aiVariantQuestion">Variant</button><button class="deleteQuestion">Delete</button>';
      card.querySelector('.qText').value = q.text;
      if (q.imageUrl) { const img = w.document.createElement('img'); img.src = q.imageUrl; card.append(img); }
      card.querySelector('.deleteQuestion').onclick = () => {
        state.questions = state.questions.filter(item => item.id !== q.id); render();
        tour.notify('question-deleted', { quizId: 'DEMO1', questionId: q.id });
      };
      host.append(card);
      const button = w.document.createElement('button'); button.className = 'questionOutlineItem'; outline.append(button);
    });
  };
  api.createDemo = async payload => {
    persistedDraft = payload;
    state.questions = payload.questions.map((q, i) => ({ ...q, id: `tutorial-${i + 1}` }));
    return 'DEMO1';
  };
  api.openEditor = async () => {
    Object.assign(el('editorView').dataset, { quizId: 'DEMO1', ownerId: api.uid(), variantAllowed: 'true' });
    el('editorView').classList.remove('hidden'); render();
    tour.notify('view', { id: 'editorView' });
  };
  const tour = w.install(api);
  const noProvider = async () => { providers++; throw new Error('Tutorial reached a provider'); };
  Object.assign(w, {
    state, crewTour: tour, $: el, db: {}, collection: (...args) => args, doc: () => ({ id: `new-${++nextId}` }),
    questionForAi: q => ({ ...q }), questionContext: () => ({ existingQuestions: [] }),
    // The import layer deliberately strips auxiliary metadata, as production does.
    normalizeImportedQuestion: q => ({ type: q.type, text: q.text, points: q.points, options: q.options }),
    renderQuestions: render, markDirty: () => {}, toast: () => {}, escapeHtml: value => String(value), round1: n => n,
    aiFriendlyError: error => error.message, REPORTABLE_ERROR_CODES: { aiVariant: 'variant' },
    showReportableError: report => assert.fail(report.message),
    aiApi: { regenerateQuestion: noProvider }, applyGeneratedMedia: noProvider,
    collectAiRequest: () => ({}), saveAiPreferences: noProvider, startAiCreationJob: noProvider
  });
  Object.assign(w, {
    stopStudentTimer: () => {}, clearStudentSubscriptions: () => {}, readStoredTimer: () => null,
    setupStudentProgress: () => {}, startTimedStudentQuiz: () => {}, refreshStudentProgress: () => {}
  });
  w.eval(['generateAiTestNative', 'renderVariantProgress', 'createQuestionVariants', 'applyPendingVariants',
    'handleVariantRequest', 'handleVariantKept', 'sanitizeQuestionForSave', 'studentOptionEntries', 'shuffled',
    'renderGapfillStudent', 'renderOrderingStudent', 'getQuestionImageSrc', 'renderStudentQuiz'].map(fn).join('\n'));
  w.document.addEventListener('gradecrew:variant-request', w.handleVariantRequest);
  w.document.addEventListener('gradecrew:variant-kept', w.handleVariantKept);
  w.eval(variantEnhancements);
  const next = () => { const button = w.document.querySelector('.gcCoachNext'); assert.ok(button); button.click(); };
  tour.start(); next(); tour.notify('view', { id: 'createView' }); next();
  tour.notify('view', { id: 'aiView' }); next();
  await until(() => /Bilder plane/.test(w.document.querySelector('.gcRealCoach h2')?.textContent), 'ghost-filled form');
  assert.equal(el('aiGrade').value, '4'); next();
  await until(() => /Perfekt/.test(w.document.querySelector('.gcRealCoach h2')?.textContent), 'ghost-filled preferences');
  await w.generateAiTestNative();
  assert.equal(persistedDraft.questions.length, 10);
  assert.equal(persistedDraft.questions.filter(q => q.imageUrl).length, 3);
  assert.match(persistedDraft.questions[5].text, /Bleistift/);
  assert.equal(tour.ownsQuiz('DEMO1'), true);
  next(); next(); next(); // Remy -> Emmi -> quality warning.
  w.document.querySelector('.questionOutlineItem.gcTourTarget').click();
  await until(() => w.document.querySelector('.aiEditQuestion.gcTourTarget'), 'edit source');
  tour.notify('edited', { quizId: 'DEMO1' }); next(); next();
  w.document.querySelector('.aiVariantQuestion.gcTourTarget').click();
  await until(() => w.document.querySelector('dialog .gcTourTarget[type="submit"]'), 'variant ghost fill');
  assert.equal(w.document.querySelector('.gcRealCoach'), null, 'only the modal mentor is visible');
  assert.equal(w.document.querySelector('dialog [name="mediaKind"]').value, 'ai_generated');
  w.document.querySelector('dialog .gcTourTarget[type="submit"]').click();
  await until(() => w.document.querySelector('.applyVariants.gcTourTarget'), 'live Apply target after final render');
  assert.equal(state.questions.length, 10, 'ready variant is staged outside editor');
  assert.equal(state.variantTask.questions[0].imageUrl, '/assets/gradecrew/demo-cat.svg');
  w.document.querySelector('.applyVariants.gcTourTarget').click();
  await until(() => w.document.querySelector('.variantKeep.gcTourTarget'), 'new variant review');
  assert.equal(state.questions.length, 11);
  const cat = state.questions.find(q => q.id.startsWith('new-'));
  assert.ok(cat);
  assert.equal(w.document.querySelector('.variantKeep.gcTourTarget').closest('.questionCard').dataset.id, cat.id);
  w.document.dispatchEvent(new w.CustomEvent('gradecrew:variant-kept', { detail: { id: 'wrong', quizId: 'DEMO1', ownerId: api.uid() } }));
  assert.ok(w.document.querySelector('.variantKeep.gcTourTarget'), 'unrelated Keep cannot advance tour');
  w.document.querySelector('.variantKeep.gcTourTarget').click();
  assert.equal(cat.aiVariantKept, true);
  const reloaded = JSON.parse(JSON.stringify(w.sanitizeQuestionForSave(cat)));
  assert.equal(reloaded.imageUrl, '/assets/gradecrew/demo-cat.svg');
  assert.equal(reloaded.options.find(o => o.correct).text, 'cat');
  assert.equal(reloaded.aiVariantKept, true);
  next(); w.document.querySelector('.deleteQuestion.gcTourTarget').click();
  assert.equal(state.questions.length, 10);
  assert.equal(state.questions.filter(q => /Katze/.test(q.text)).length, 1);
  next(); tour.notify('published', { quizId: 'DEMO1' });
  w.renderStudentQuiz({ ...persistedDraft, id: 'DEMO1', startMode: 'student' }, state.questions);
  assert.equal(w.document.querySelectorAll('.studentQuestion').length, 10);
  assert.equal(w.document.querySelectorAll('.studentQuestionImage img').length, 4);
  assert.equal(w.document.querySelectorAll('.studentQuestionImage img[src$="demo-cat.svg"]').length, 1);
  w.document.querySelector('.gcNamePrompt input').value = 'ML'; next();
  assert.equal(el('studentName').value, 'ML');
  tour.notify('student-started', { quizId: 'DEMO1' });
  assert.equal(w.document.documentElement.classList.contains('gcTourScrollLocked'), false);
  assert.equal(w.document.body.classList.contains('gcTourAnswering'), true);
  tour.notify('submitted', { quizId: 'DEMO1', submissionId: 'saved-answer' });
  assert.equal(w.document.body.classList.contains('gcTourAnswering'), false);
  el('resultsTableWrap').innerHTML = '<button class="reviewBtn" data-id="saved-answer">Bewerten</button>';
  tour.notify('results-ready', { quizId: 'DEMO1' }); next();
  assert.ok(w.document.querySelector('.reviewBtn.gcTourTarget'));
  tour.notify('review-opened', { submissionId: 'saved-answer' });
  tour.notify('review-saved', { submissionId: 'saved-answer' }); next();
  assert.equal(tour.active, false);
  assert.equal(providers, 0);
});

test('Crew journey explains GradeCrew, introduces the complete Crew, then points to the real New Test action', t => {
  const w = fixture(t);
  const api = adapter(w);
  const tour = w.install(api);
  tour.dashboard({ uid: api.uid(), firstVisit: false });
  w.document.getElementById('gradecrewTourBtn').click();
  let coach = w.document.querySelector('.gcRealCoach');
  assert.ok(coach);
  assert.match(coach.textContent, /Willkommen bei GradeCrew/);
  assert.match(coach.textContent, /digitale Tests und Übungen/);
  assert.equal(coach.querySelectorAll('.gcCrewIntroMember').length, 4);
  assert.match(coach.textContent, /Ich begleite dich Schritt für Schritt/);
  assert.match(coach.textContent, /Ich erstelle den ersten Entwurf/);
  assert.match(coach.textContent, /Überarbeiten und bei Varianten/);
  assert.match(coach.textContent, /Prüfen und Bewerten/);
  assert.equal(coach.querySelector('.gcCoachClose'), null);
  assert.ok(w.document.documentElement.classList.contains('gcTourScrollLocked'));
  coach.querySelector('.gcCoachNext').click();
  coach = w.document.querySelector('.gcRealCoach');
  assert.match(coach.textContent, /Neuer Test/);
  assert.ok(w.document.getElementById('newQuizBtn').classList.contains('gcTourTarget'));
  assert.equal(tour.active, true);
});

test('Prepared tutorial test is deterministic: grade 4, ten tasks, three images and one deliberate AI-style error', t => {
  const w = fixture(t);
  assert.equal(w.tourVersion, 'gradecrew-live-tour-v7');
  assert.equal(w.demo.grade, '4');
  assert.equal(w.demo.questions.length, 10);
  assert.equal(w.demo.timeLimitMinutes, 1);
  assert.equal(w.demo.questions.reduce((sum, q) => sum + q.points, 0), 10);
  const pictures = w.demo.questions.filter(q => q.imageUrl);
  assert.equal(pictures.length, 3);
  pictures.forEach(q => assert.ok(fs.existsSync('.' + q.imageUrl), q.imageUrl));
  assert.ok(fs.existsSync('./assets/gradecrew/demo-cat.svg'));
  const faulty = w.demo.questions[8];
  assert.match(faulty.text, /gelb/);
  assert.equal(faulty.options.find(option => option.correct)?.text, 'blue');
  assert.equal(w.demo.questions[9].manualReview, true);
  assert.match(w.demo.questions[4].text, /^Decide/);
  assert.match(w.demo.questions[5].text, /Vogel/);
  assert.match(w.demo.questions[7].text, /^Put/);
});

test('Tutorial keeps real AI concepts but uses deterministic dog edit and cat variant without provider calls', t => {
  const w = fixture(t);
  const dog = w.response(w.demo.questions[3], { variant: false });
  const cat = w.response(w.demo.questions[5], { variant: true, mediaKind: 'ai_generated' });
  assert.equal(dog.question.text, 'Choose the English word for „Hund“.');
  assert.equal(cat.question.text, 'Choose the English word for „Katze“.');
  assert.equal(cat.question.options.find(option => option.correct)?.text, 'cat');
  assert.equal(cat.question.tutorialImageUrl, '/assets/gradecrew/demo-cat.svg');
  assert.equal(cat.question.mediaIntent.kind, 'none');
  assert.equal(cat.meta.model, 'prepared-tutorial');
  assert.doesNotMatch(source, /aiApi\./);
  assert.match(app, /await aiApi\.regenerateQuestion/);
});

test('Tour is mandatory, quality-led and contains the intended Crew handoffs', () => {
  assert.match(source, /blockOutsideTour/);
  assert.match(source, /stopImmediatePropagation/);
  assert.match(source, /targetInteractive/);
  assert.match(source, /freeRegion/);
  assert.doesNotMatch(source, /gcCoachClose/);
  assert.match(source, /handoff\("guide","create"/);
  assert.match(source, /handoff\("create","improve"/);
  assert.match(source, /handoff\("guide","grade"/);
  assert.doesNotMatch(source, /handoff\("guide","improve"/);
  assert.match(source, /Danke, Remy!/);
  assert.match(source, /Bilder plane ich direkt mit ein/);
  assert.match(source, /eigene PDFs, Fotos, Arbeitsblätter oder Texte hochladen/);
  assert.match(source, /Perfekt – alle nötigen Informationen sind eingetragen/);
  assert.match(source, /Die Überarbeitung hat geklappt/);
  assert.match(source, /Qualität geht immer vor/);
  assert.match(source, /setTimeout\(resolve,3000\)/);
  assert.match(source, /ensureOrderingStartsUnsorted/);
  assert.match(source, /gcTourScrollLocked/);
  assert.doesNotMatch(source, /bewusst vorgefertigt|sicheren Ablauf|Sprachtests/);
  assert.doesNotMatch(source, /MutationObserver/);
});

test('Edit and variant use two different tutorial tasks and variant gets its own scene', () => {
  assert.match(source, /editSourceId = api\.questionId\(3\)/);
  assert.match(source, /variantSourceId = api\.questionId\(5\)/);
  assert.match(source, /Die hier gefällt mir gut/);
  assert.match(source, /Aufgabe 6/);
  assert.match(source, /Choose the English word for „Vogel“/);
  assert.match(source, /gcEditPreview/);
  assert.match(source, /Was heißt „Hund“ auf Englisch\?/);
  assert.match(source, /Choose the English word for „Hund“\./);
  assert.match(source, /Die Aufgabe war grundsätzlich gut/);
});

test('Variant tutorial uses one modal layer, shows a picture choice and blocks progress until actual apply and review', () => {
  assert.match(variantEnhancements, /gradecrew:variant-dialog-opened/);
  assert.match(variantEnhancements, /gradecrew:variant-submitted/);
  assert.match(source, /gradecrew:variant-dialog-opened/);
  assert.match(source, /\[name="instruction"\]/);
  assert.match(source, /event\.type === "submit"/);
  assert.match(source, /Erstelle eine Variante mit dem Wort „Katze“/);
  assert.match(source, /Diesmal nehmen wir direkt ein Bild dazu/);
  assert.match(source, /1 Variante · mit Bild/);
  assert.match(source, /waitForElement\("#variantBackgroundProgress \.applyVariants"/);
  assert.match(source, /variant-review/);
  assert.match(source, /demo-cat\.svg/);
  assert.match(source, /Erst wenn die neue Aufgabe wirklich im Test angekommen ist/);
  assert.match(variantEnhancements, /displayMediaKind/);
  assert.match(variantEnhancements, /captureInsertedVariants\(beforeIds, item, ready\)/);
  assert.match(variantEnhancements, /gcRealTourActive/);
  assert.doesNotMatch(variantEnhancements, /observer\.observe\(document\.body, \{ childList: true, subtree: true \}\)/);
});

test('Teacher polish attaches the privacy note to colleague import and renames AI editing without removing AI', () => {
  assert.match(copyPolish, /Keine Schülerdaten – nur Testinhalte werden kopiert/);
  assert.match(copyPolish, /\.privacyStrip/);
  assert.match(copyPolish, /Mit KI überarbeiten/);
  assert.match(copyPolish, /Überarbeitung erstellen/);
  assert.doesNotMatch(copyPolish, /KI bearbeiten/);
});

test('Core persists tutorial questions with images and a one-minute test; no fake result rows are written', async t => {
  const w = fixture(t);
  const writes = [];
  Object.assign(w, {
    state: { user: { uid: 'a' } }, crewTour: { creating: true }, tutorialDraft: null,
    isSuspended: () => false,
    createQuizDocument: async base => { writes.push(base); return { code: 'DEMO' }; },
    quizDefaults: () => ({ ownerId: 'a', published: false }), deepClone: value => JSON.parse(JSON.stringify(value)),
    writeBatch: () => ({ set: (_ref, data) => writes.push(data), update: () => {}, commit: async () => {} }),
    db: {}, doc: (...parts) => parts.join('/'), serverTimestamp: () => 123, round1: number => number,
    orderingNeedsReview: () => false, validOrder: () => true
  });
  w.eval(fn('sanitizeQuestionForSave') + '\n' + fn('createTutorialQuiz'));
  assert.equal(await w.createTutorialQuiz(w.demo), 'DEMO');
  assert.equal(writes[0].timeLimitMinutes, 1);
  assert.equal(writes.length, 11);
  assert.equal(writes.slice(1).filter(q => q.imageUrl).length, 3);
  assert.ok(writes.slice(1).every(q => q.aiOrigin.kind === 'tutorial'));
  assert.doesNotMatch(source, /Beispiel A|Beispiel B/);
});

test('Actual countdown auto-submits once at sixty seconds, never on first tick', t => {
  const w = fixture(t);
  let clock = 1000, tick, submits = 0;
  w.Date.now = () => clock;
  Object.assign(w, {
    $: id => w.document.getElementById(id), state: {}, stopStudentTimer: () => {}, toast: () => {},
    submitStudentQuiz: (_e, _q, _questions, opts) => { submits += 1; assert.equal(opts.autoSubmitted, true); assert.equal(opts.force, true); }
  });
  w.setInterval = callback => { tick = callback; return 1; };
  w.eval(fn('runStudentTimer'));
  w.runStudentTimer({ timeLimitMinutes: 1 }, [], 1000);
  assert.equal(submits, 0);
  clock = 60000; tick(); assert.equal(submits, 0);
  clock = 61000; tick(); tick(); assert.equal(submits, 1);
});

test('Real student renderer uses ten widgets, three persisted images and a gated one-minute start', t => {
  const w = fixture(t);
  const events = [];
  Object.assign(w, {
    $: id => w.document.getElementById(id), stopStudentTimer: () => {}, clearStudentSubscriptions: () => {}, readStoredTimer: () => null,
    escapeHtml: value => String(value).replaceAll('"', '&quot;'), round1: number => number, setupStudentProgress: () => {},
    crewTour: { notify: event => events.push(event) }, startTimedStudentQuiz: () => {}, refreshStudentProgress: () => {}
  });
  w.eval(['studentOptionEntries', 'shuffled', 'renderGapfillStudent', 'renderOrderingStudent', 'getQuestionImageSrc', 'renderStudentQuiz'].map(fn).join('\n'));
  const questions = w.demo.questions.map((q, i) => ({ ...q, id: `q${i}` }));
  w.renderStudentQuiz({ ...w.demo, id: 'DEMO', startMode: 'student' }, questions);
  assert.equal(w.document.querySelectorAll('.studentQuestion').length, 10);
  assert.equal(w.document.querySelectorAll('.studentQuestionImage img').length, 3);
  assert.equal(w.document.querySelectorAll('.sortableList .sortItem').length, 3);
  assert.ok(w.$('studentQuestions').classList.contains('hidden'));
  assert.equal(w.$('studentTimerText').textContent, '01:00');
  assert.deepEqual(events, ['student-ready']);
});

test('Actual submission emits the tour transition only after Firestore confirms the write', async t => {
  const w = fixture(t);
  const writes = [], events = [];
  w.document.body.insertAdjacentHTML('beforeend', '<form id="studentForm"><input id="studentName" value="ML"><button id="studentSubmitBtn"></button></form>');
  let finish;
  Object.assign(w, {
    $: id => w.document.getElementById(id), state: { studentAttempt: { attemptId: 'attempt-a', startedAt: 1000 } },
    studentSubmissionBusy: new Set(), completedStudentSubmissions: new Set(), readStoredTimer: () => null, readStudentAnswer: () => 'blue',
    evaluateAnswer: () => ({ awarded: 1, max: 1, needsReview: false }), round1: number => number, deepClone: value => value,
    getQuizScale: () => ({ name: 'Standard' }), gradeFromPercent: () => 1, studentTimerKey: id => id, stopStudentTimer: () => {}, db: {}, collection: (...x) => x,
    serverTimestamp: () => 1, addDoc: (ref, data) => { writes.push({ ref, data }); return new Promise(resolve => { finish = resolve; }); },
    clearStudentSubscriptions: () => {}, renderStudentResult: () => {}, toast: () => {}, crewTour: { notify: (event, data) => events.push({ event, data }) }
  });
  w.eval(fn('submitStudentQuiz'));
  const quiz = { id: 'DEMO', timeLimitMinutes: 1, tutorialVersion: 'v7' };
  const questions = [{ id: 'q1' }];
  const pending = w.submitStudentQuiz(null, quiz, questions, { force: true, autoSubmitted: true });
  assert.equal(events.length, 0);
  finish({ id: 'saved-submission' });
  await pending;
  assert.equal(writes.length, 1);
  assert.equal(writes[0].data.answers.q1, 'blue');
  assert.equal(events[0].data.submissionId, 'saved-submission');
});
