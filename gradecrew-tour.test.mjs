import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('gradecrew-tour.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const copyPolish = fs.readFileSync('teacher-copy-polish.js', 'utf8');
const variantEnhancements = fs.readFileSync('variant-enhancements.js', 'utf8');

function fn(name) {
  let start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  if (app.slice(start - 6, start) === 'async ') start -= 6;
  return app.slice(start, app.indexOf('\n}', start) + 2);
}

function fixture(t) {
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

test('Crew journey starts with the complete Crew, then points to the real New Test action', t => {
  const w = fixture(t);
  const api = adapter(w);
  const tour = w.install(api);
  tour.dashboard({ uid: api.uid(), firstVisit: false });
  w.document.getElementById('gradecrewTourBtn').click();
  let coach = w.document.querySelector('.gcRealCoach');
  assert.ok(coach);
  assert.match(coach.textContent, /Willkommen bei GradeCrew/);
  assert.equal(coach.querySelectorAll('.gcCrewIntroMember').length, 4);
  assert.match(coach.textContent, /Coco/);
  assert.match(coach.textContent, /Remy/);
  assert.match(coach.textContent, /Emmi/);
  assert.match(coach.textContent, /Wilma/);
  assert.equal(coach.querySelector('.gcCoachClose'), null);
  coach.querySelector('.gcCoachNext').click();
  coach = w.document.querySelector('.gcRealCoach');
  assert.match(coach.textContent, /Neuer Test/);
  assert.ok(w.document.getElementById('newQuizBtn').classList.contains('gcTourTarget'));
  assert.equal(tour.active, true);
});

test('Prepared tutorial test is deterministic: grade 4, ten tasks, three images and one deliberate AI-style error', t => {
  const w = fixture(t);
  assert.equal(w.tourVersion, 'gradecrew-live-tour-v5');
  assert.equal(w.demo.grade, '4');
  assert.equal(w.demo.questions.length, 10);
  assert.equal(w.demo.timeLimitMinutes, 1);
  assert.equal(w.demo.questions.reduce((sum, q) => sum + q.points, 0), 10);
  const pictures = w.demo.questions.filter(q => q.imageUrl);
  assert.equal(pictures.length, 3);
  pictures.forEach(q => assert.ok(fs.existsSync('.' + q.imageUrl), q.imageUrl));
  const faulty = w.demo.questions[8];
  assert.match(faulty.text, /gelb/);
  assert.equal(faulty.options.find(option => option.correct)?.text, 'blue');
  assert.equal(w.demo.questions[9].manualReview, true);
  assert.match(w.demo.questions[4].text, /^Decide/);
  assert.match(w.demo.questions[7].text, /^Put/);
});

test('Tutorial keeps real AI concepts but uses deterministic dog edit and cat variant without provider calls', t => {
  const w = fixture(t);
  const dog = w.response(w.demo.questions[3], { variant: false });
  const cat = w.response(w.demo.questions[3], { variant: true, mediaKind: 'none' });
  assert.equal(dog.question.text, 'Choose the English word for „Hund“.');
  assert.equal(cat.question.text, 'Choose the English word for „Katze“.');
  assert.equal(cat.question.options.find(option => option.correct)?.text, 'cat');
  assert.equal(cat.meta.model, 'prepared-tutorial');
  assert.throws(() => w.response(w.demo.questions[3], { variant: true, mediaKind: 'ai_generated' }), /ohne zusätzliches Bild/);
  assert.doesNotMatch(source, /aiApi\./);
  assert.match(app, /await aiApi\.regenerateQuestion/);
});

test('Tour is mandatory, quality-led and contains the intended Crew handoffs', () => {
  assert.match(source, /blockOutsideTour/);
  assert.match(source, /stopImmediatePropagation/);
  assert.match(source, /targetInteractive/);
  assert.match(source, /freeRegion/);
  assert.doesNotMatch(source, /gcCoachClose/);
  assert.match(source, /handoff\("guide", "create"/);
  assert.match(source, /handoff\("create", "improve"/);
  assert.match(source, /handoff\("guide", "grade"/);
  assert.doesNotMatch(source, /handoff\("guide", "improve"/);
  assert.match(source, /Danke, Remy!/);
  assert.match(source, /Bilder kann ich gleich mitplanen/);
  assert.match(source, /Super – die KI-Überarbeitung hat geklappt/);
  assert.match(source, /KI kann Fehler machen/);
  assert.match(source, /setTimeout\(resolve, 3000\)/);
  assert.match(source, /ensureOrderingStartsUnsorted/);
  assert.doesNotMatch(source, /bewusst vorgefertigt|sicheren Ablauf/);
  assert.doesNotMatch(source, /MutationObserver/);
});

test('Variant tutorial uses one modal interaction layer and explicitly permits its submit event', () => {
  assert.match(variantEnhancements, /gradecrew:variant-dialog-opened/);
  assert.match(variantEnhancements, /gradecrew:variant-submitted/);
  assert.match(source, /gradecrew:variant-dialog-opened/);
  assert.match(source, /\[name="instruction"\]/);
  assert.match(source, /event\.type === "submit"/);
  assert.match(source, /Nutze statt „Hund“ das Wort „Katze“/);
  assert.match(source, /Für diese Variante brauchen wir kein zusätzliches Bild/);
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
    state: { user: { uid: 'a' } },
    crewTour: { creating: true },
    tutorialDraft: null,
    isSuspended: () => false,
    createQuizDocument: async base => { writes.push(base); return { code: 'DEMO' }; },
    quizDefaults: () => ({ ownerId: 'a', published: false }),
    deepClone: value => JSON.parse(JSON.stringify(value)),
    writeBatch: () => ({ set: (_ref, data) => writes.push(data), update: () => {}, commit: async () => {} }),
    db: {},
    doc: (...parts) => parts.join('/'),
    serverTimestamp: () => 123,
    round1: number => number,
    orderingNeedsReview: () => false,
    validOrder: () => true
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
    $: id => w.document.getElementById(id),
    state: {},
    stopStudentTimer: () => {},
    toast: () => {},
    submitStudentQuiz: (_e, _q, _questions, opts) => {
      submits += 1;
      assert.equal(opts.autoSubmitted, true);
      assert.equal(opts.force, true);
    }
  });
  w.setInterval = callback => { tick = callback; return 1; };
  w.eval(fn('runStudentTimer'));
  w.runStudentTimer({ timeLimitMinutes: 1 }, [], 1000);
  assert.equal(submits, 0);
  clock = 60000; tick(); assert.equal(submits, 0);
  clock = 61000; tick(); tick(); assert.equal(submits, 1);
});

test('Real student renderer uses ten widgets, three images and a gated one-minute start', t => {
  const w = fixture(t);
  const events = [];
  Object.assign(w, {
    $: id => w.document.getElementById(id),
    stopStudentTimer: () => {},
    clearStudentSubscriptions: () => {},
    readStoredTimer: () => null,
    escapeHtml: value => String(value).replaceAll('"', '&quot;'),
    round1: number => number,
    setupStudentProgress: () => {},
    crewTour: { notify: event => events.push(event) },
    startTimedStudentQuiz: () => {},
    refreshStudentProgress: () => {}
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
    $: id => w.document.getElementById(id),
    state: { studentAttempt: { attemptId: 'attempt-a', startedAt: 1000 } },
    studentSubmissionBusy: new Set(), completedStudentSubmissions: new Set(),
    readStoredTimer: () => null, readStudentAnswer: () => 'blue',
    evaluateAnswer: () => ({ awarded: 1, max: 1, needsReview: false }),
    round1: number => number, deepClone: value => value,
    getQuizScale: () => ({ name: 'Standard' }), gradeFromPercent: () => 1,
    studentTimerKey: id => id, stopStudentTimer: () => {}, db: {}, collection: (...x) => x,
    serverTimestamp: () => 1,
    addDoc: (ref, data) => { writes.push({ ref, data }); return new Promise(resolve => { finish = resolve; }); },
    clearStudentSubscriptions: () => {}, renderStudentResult: () => {}, toast: () => {},
    crewTour: { notify: (event, data) => events.push({ event, data }) }
  });
  w.eval(fn('submitStudentQuiz'));
  const quiz = { id: 'DEMO', timeLimitMinutes: 1, tutorialVersion: 'v5' };
  const questions = [{ id: 'q1' }];
  const pending = w.submitStudentQuiz(null, quiz, questions, { force: true, autoSubmitted: true });
  assert.equal(events.length, 0);
  finish({ id: 'saved-submission' });
  await pending;
  assert.equal(writes.length, 1);
  assert.equal(writes[0].data.answers.q1, 'blue');
  assert.equal(events[0].data.submissionId, 'saved-submission');
});
