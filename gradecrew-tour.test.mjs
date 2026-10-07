import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { assessmentContentLabels } from './shared/i18n/assessment-locale.mjs';
import { createLocalTourRepository } from './guest-tour-port.mjs';

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
  w.assessmentContentLabels = assessmentContentLabels;
  t.after(() => w.close());
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.CSS = { escape: value => String(value) };
  w.scrollTo = () => {};
  w.guestTourRepo = null;
  w.tourUid = () => w.state?.user?.uid || '';
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
    focusReviewQuestion: () => {}
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

test('Public wrapper keeps live flags; Coco introduces Remy and onboarding never starts a provider job', async t => {
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
  assert.equal(handoff.querySelectorAll('.gcHandoffFaces img').length, 2);
  assert.match(handoff.querySelectorAll('.gcHandoffFaces img')[0].src, /penguin-guide/);
  assert.match(handoff.querySelectorAll('.gcHandoffFaces img')[1].src, /elephant-create/);
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

for (const finishAction of ['create', 'settings', 'guest']) test(`Public journey: variant, practice feedback, assessment and ${finishAction} finish`, async t => {
  const w = fixture(t, { publicEntry: true });
  const nativeTimeout = w.setTimeout.bind(w);
  w.setTimeout = (callback, delay, ...args) => nativeTimeout(callback, Math.min(delay, 2), ...args);
  const api = adapter(w);
  let completions = 0, newTests = 0;
  let guestExits = 0;
  api.completeTour = async () => { completions++; };
  api.startNewTest = () => { newTests++; };
  api.isGuest = () => finishAction === 'guest';
  api.exitTour = () => { guestExits++; };
  let nextId = 0, providers = 0, persistedDraft;
  const guestRepo = finishAction === 'guest' ? createLocalTourRepository() : null;
  const state = { user: { uid: api.uid() }, currentQuiz: { id: 'DEMO1', published: false, tutorialVersion: 'v8' }, questions: [] };
  const feedbackWrites = [];
  api.checkDemo = () => state.questions.length === 10 ? null : 'Expected ten questions';
  const el = id => w.document.getElementById(id);
  const render = () => {
    const host = el('questionList'); host.replaceChildren();
    const outline = el('questionOutline'); outline.replaceChildren();
    state.questions.forEach((q, index) => {
      const card = w.document.createElement('article');
      card.className = 'questionCard'; card.dataset.id = q.id; card.dataset.index = String(index);
      card.innerHTML = '<div class="questionTop"></div><div class="questionGrid"><textarea class="qText"></textarea></div><button class="aiEditQuestion">Edit</button><button class="aiVariantQuestion">Variant</button><button class="aiFeedbackGood">Good</button><button class="aiFeedbackBad">Bad</button><button class="deleteQuestion">Delete</button>';
      for (const verdict of ['Good', 'Bad']) card.querySelector(`.aiFeedback${verdict}`).classList.toggle('hidden', !q.aiOrigin);
      card.querySelector('.qText').value = q.text;
      if (q.imageUrl) { const img = w.document.createElement('img'); img.src = q.imageUrl; card.append(img); }
      card.querySelector('.deleteQuestion').onclick = () => {
        state.questions = state.questions.filter(item => item.id !== q.id); render();
        tour.notify('question-deleted', { quizId: 'DEMO1', questionId: q.id });
      };
      if (q.aiOrigin) {
        card.querySelector('.aiFeedbackGood').onclick = () => w.submitAiQuestionFeedback(q, index, { verdict:'good' });
        card.querySelector('.aiFeedbackBad').onclick = () => w.toggleAiQualityPanel(card, q, index);
      }
      host.append(card);
      const button = w.document.createElement('button'); button.className = 'questionOutlineItem'; button.dataset.position = String(index + 1); outline.append(button);
    });
  };
  api.createDemo = async payload => {
    persistedDraft = payload;
    if (guestRepo) {
      guestRepo.create(payload);
      state.questions = guestRepo.getQuestions(guestRepo.code);
    } else state.questions = payload.questions.map((q, i) => ({ ...q, id: `tutorial-${i + 1}`,
      aiOrigin: { kind: 'tutorial', model: 'prepared-tutorial', promptVersion: 'gradecrew-live-tour-v8' } }));
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
    updateDoc: async (ref, data) => feedbackWrites.push(data), serverTimestamp: () => 123,
    aiQuestionFeedbackSnapshot: q => ({ text:q.text, type:q.type }), AI_QUALITY_REASONS: { incorrect:'Falsche Lösung', other:'Anderer Grund' },
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
    'handleVariantRequest', 'handleVariantKept', 'submitTutorialQuestionFeedback', 'submitAiQuestionFeedback', 'toggleAiQualityPanel', 'sanitizeQuestionForSave', 'studentOptionEntries', 'shuffled',
    'renderGapfillStudent', 'renderOrderingStudent', 'renderMarkwordsStudent', 'tokenizeWords', 'getQuestionImageSrc', 'getQuestionAudioSrc', 'questionAnswerAudioEntries', 'questionHasAudioAnswerEntries', 'questionAnswerAudioReady', 'questionStudentAudioReady', 'audioOperations', 'makeDragItem', 'makeAudioDragItem', 'renderStudentQuiz'].map(fn).join('\n'));
  w.document.addEventListener('gradecrew:variant-request', w.handleVariantRequest);
  w.document.addEventListener('gradecrew:variant-kept', w.handleVariantKept);
  const productionStyle = w.document.createElement('style');
  productionStyle.textContent = fs.readFileSync('workspace.css', 'utf8');
  w.document.head.append(productionStyle);
  w.eval(variantEnhancements);
  const next = () => { const button = w.document.querySelector('.gcCoachNext'); assert.ok(button); button.click(); };
  tour.start(); next(); tour.notify('view', { id: 'createView' }); next();
  tour.notify('view', { id: 'aiView' }); next();
  await until(() => /Bilder plane/.test(w.document.querySelector('.gcRealCoach h2')?.textContent), 'ghost-filled form');
  assert.equal(el('aiGrade').value, '4'); next();
  await until(() => /Stopp/.test(w.document.querySelector('.gcRealCoach h2')?.textContent), 'preferences explanation pauses');
  assert.match(w.document.querySelector('.gcRealCoach').textContent, /allen deinen KI-Tests/);
  assert.ok(w.document.querySelector('.gcRealCoach').classList.contains('gcCoachContext'));
  assert.ok(el('aiCustomNotes').value.length > 100);
  await new Promise(resolve => w.setTimeout(resolve, 50));
  assert.match(w.document.querySelector('.gcRealCoach h2').textContent, /Stopp/, 'wishes explanation cannot auto-advance');
  next();
  assert.match(w.document.querySelector('.gcRealCoach h2').textContent, /Perfekt/);
  await w.generateAiTestNative();
  assert.equal(persistedDraft.questions.length, 10);
  assert.equal(persistedDraft.questions.filter(q => q.imageUrl).length, 4);
  assert.match(persistedDraft.questions[5].text, /Bleistift/);
  assert.equal(tour.ownsQuiz('DEMO1'), true);
  next(); next(); // Remy introduces Emmi, then Emmi appears alone.
  assert.match(w.document.querySelector('.gcRealCoach h2').textContent, /Hallo, ich bin Emmi/);
  assert.equal(w.document.querySelectorAll('.gcRealCoach img').length, 1);
  assert.match(w.document.querySelector('.gcRealCoach img').src, /fox-improve/);
  next(); next(); // Emmi -> quality warning.
  w.document.querySelector('.questionOutlineItem.gcTourTarget').click();
  await until(() => w.document.querySelector('.aiEditQuestion.gcTourTarget'), 'edit source');
  tour.notify('edited', { quizId: 'DEMO1' }); next(); next();
  w.document.querySelector('.aiVariantQuestion.gcTourTarget').click();
  await until(() => w.document.querySelector('dialog .gcTourTarget[type="submit"]'), 'variant ghost fill');
  assert.equal(w.document.querySelector('.gcRealCoach'), null, 'only the modal mentor is visible');
  assert.equal(w.document.querySelector('dialog [name="mediaKind"]').value, 'ai_generated');
  w.document.querySelector('dialog .gcTourTarget[type="submit"]').click();
  await until(() => w.document.querySelector('.questionOutlineItem.variantReviewOutline.gcTourTarget'), 'automatically inserted variant in green outline');
  assert.equal(w.document.querySelector('.applyVariants.gcTourTarget'), null, 'tour never asks for the CSS-hidden Apply button');
  assert.equal(w.document.querySelector('.gcVariantReadyPreview'), null, 'no decorative pseudo-button');
  // Keeping a pending review must not continuously remove/re-add its classes.
  let outlineMutations = 0;
  const outlineObserver = new w.MutationObserver(records => { outlineMutations += records.length; });
  outlineObserver.observe(el('questionOutline'), { subtree:true, attributes:true });
  await new Promise(resolve => setTimeout(resolve, 80));
  outlineObserver.disconnect();
  assert.equal(outlineMutations, 0, 'green review markers settle without a rendering loop');
  w.document.querySelector('.questionOutlineItem.variantReviewOutline.gcTourTarget').click();
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
  await until(() => w.document.querySelector('.aiFeedbackGood.gcTourTarget'), 'green smiley after Keep rerender');
  w.document.querySelector('.aiFeedbackGood.gcTourTarget').click();
  await until(() => /Ein Hinweis wartet/.test(w.document.querySelector('.gcRealCoach h2')?.textContent), 'pause at second warning');
  assert.equal(feedbackWrites.length, 0, 'practice rating does not write data');
  next();w.document.querySelector('.questionOutlineItem.gcTourTarget').click();
  await until(() => w.document.querySelector('.aiFeedbackBad.gcTourTarget'), 'second flagged question');
  const badFeedback = w.document.querySelector('.aiFeedbackBad.gcTourTarget');
  assert.equal(badFeedback.classList.contains('hidden'), false, 'the guest tour must expose the actual red feedback control');
  badFeedback.click();
  await until(() => w.document.querySelector('.aiQualityRemove.gcTourTarget'), 'real negative-feedback panel');
  assert.equal(w.document.querySelector('.aiQualityReason').value, 'incorrect');
  w.document.querySelector('.aiQualityRemove.gcTourTarget').click();
  await until(() => state.questions.length === 10, 'negative feedback saved and faulty question removed');
  assert.equal(feedbackWrites.length, 0);
  assert.equal(state.questions.length, 10);
  assert.equal(state.questions.filter(q => q.imageUrl?.endsWith('demo-cat.svg')).length, 1);
  assert.match(w.document.querySelector('.gcRealCoach h2').textContent, /Danke, Emmi/);
  next();next();next(); // Coco thanks Emmi, introduces Wilma, Wilma explains settings.
  assert.match(w.document.querySelector('.gcRealCoach').textContent, /Mischen/);
  next(); tour.notify('published', { quizId: 'DEMO1' });
  if (finishAction === 'guest') assert.match(w.document.querySelector('.gcRealCoach').textContent, /ohne öffentlichen Link/);
  w.renderStudentQuiz({ ...persistedDraft, id: 'DEMO1', startMode: 'student' }, state.questions);
  assert.equal(w.document.querySelectorAll('.studentQuestion').length, 10);
  assert.equal(w.document.querySelectorAll('.studentQuestionImage img').length, 5);
  assert.equal(w.document.querySelectorAll('.studentQuestionImage img[src$="demo-cat.svg"]').length, 1);
  assert.match(w.document.querySelector('.gcRealCoach').textContent, /Ich darf doch du sagen/);
  w.document.querySelector('.gcNamePrompt input').value = 'ML'; next();
  assert.equal(el('studentName').value, 'ML');
  const startCoach = w.document.querySelector('.gcCoachInlineStart');
  assert.ok(startCoach, 'start explanation is in document flow');
  assert.equal(startCoach.nextElementSibling.id, 'studentStartGate');
  assert.equal(w.document.documentElement.classList.contains('gcTourScrollLocked'), false);
  assert.equal(w.document.body.classList.contains('gcTourInlineStart'), true);
  w.innerWidth = 375; w.innerHeight = 420;
  w.dispatchEvent(new w.Event('resize'));
  await new Promise(resolve => w.setTimeout(resolve, 30));
  assert.equal(startCoach.style.top, '', 'small viewport cannot turn guide into an overlapping overlay');
  assert.equal(el('studentStartBtn').disabled, false);
  tour.notify('student-started', { quizId: 'DEMO1' });
  assert.equal(w.document.documentElement.classList.contains('gcTourScrollLocked'), false);
  assert.equal(w.document.body.classList.contains('gcTourAnswering'), true);
  assert.equal(w.document.querySelector('.gcCoachInlineStart'), null);
  assert.equal(w.document.body.classList.contains('gcTourInlineStart'), false);
  tour.notify('submitted', { quizId: 'DEMO1', submissionId: 'saved-answer' });
  assert.equal(w.document.body.classList.contains('gcTourAnswering'), false);
  el('resultsTableWrap').innerHTML = '<button class="reviewBtn" data-id="saved-answer">Bewerten</button>';
  tour.notify('results-ready', { quizId: 'DEMO1' });
  assert.ok(w.document.querySelector('.reviewBtn.gcTourTarget'));
  tour.notify('review-opened', { submissionId: 'saved-answer' });
  assert.match(w.document.querySelector('.gcRealCoach').textContent, /Aufgabe 5/);
  const panel = el('reviewPanel');
  panel.innerHTML = '<div id="reviewQuestions"><div class="reviewQuestion"><strong>5. Write one colour in English.</strong><input class="manualPoints" data-qid="tutorial-5"></div></div><div id="saveOrigin"><button id="saveReview">Bewertung speichern</button></div>';
  let saves = 0;
  const save = el('saveReview');
  save.addEventListener('click', () => saves++);
  next();
  const freeCard = panel.querySelector('.reviewQuestion');
  assert.equal(freeCard.nextElementSibling, save, 'real save button follows free answer');
  assert.ok(w.document.body.classList.contains('gcTourInlineReview'));
  assert.equal(w.document.documentElement.classList.contains('gcTourScrollLocked'), false);
  save.click();
  assert.equal(saves, 1, 'moving the button preserves its listener');
  tour.notify('review-saved', { submissionId: 'saved-answer' });
  assert.equal(save.parentElement.id, 'saveOrigin', 'save button restored after review');
  assert.equal(w.document.body.classList.contains('gcTourInlineReview'), false);
  assert.ok(w.document.querySelector('.gcFinishCrew'));
  assert.match(w.document.querySelector('.gcRealCoach').textContent, /\d+:\d{2} Minuten/);
  if (finishAction === 'guest') {
    assert.doesNotMatch(w.document.querySelector('.gcFinishChoices').textContent, /Einstellungen kurz kennenlernen/);
    assert.match(w.document.querySelector('.gcRealCoach').textContent, /Zur Anmeldung/);
  }
  if(finishAction==='create') {
    next();await until(()=>!tour.active,'finish');assert.equal(newTests,1);
  } else if (finishAction === 'settings') {
    w.document.querySelector('.gcFinishChoices button').click();
    await until(()=>/Reihenfolge mischen/.test(w.document.querySelector('.gcRealCoach h2')?.textContent),'optional settings');
    next();assert.match(w.document.querySelector('.gcRealCoach h2').textContent,/Ergebnisse/);next();
    assert.equal(newTests,0);
  } else {
    next(); await until(() => !tour.active, 'guest finish');
    assert.equal(guestExits, 1);
    assert.equal(newTests, 0);
    assert.equal(w.localStorage.getItem(`gradecrew-live-tour-v7:${api.uid()}`), null);
  }
  assert.equal(completions,1);
  assert.equal(tour.active, false);
  assert.equal(providers, 0);
});

test('Tutorial smileys demonstrate the controls without storing ratings', async t => {
  const w=fixture(t);const question={id:'q1'};const events=[];
  Object.assign(w,{state:{user:{uid:'a'},currentQuiz:{id:'DEMO',tutorialVersion:'v8'},questions:[question]},
    renderQuestions:()=>{},markDirty:()=>{},toast:()=>{},updateDoc:()=>assert.fail('No persistence during practice'),
    crewTour:{ownsQuiz:id=>id==='DEMO',notify:(...args)=>events.push(args)}});
  w.eval(fn('submitTutorialQuestionFeedback'));
  assert.equal(await w.submitTutorialQuestionFeedback(question,{verdict:'good',action:'keep'}),true);
  assert.equal(question._aiFeedbackVerdict,'good');
  assert.equal(w.state.questions.length,1);
  await w.submitTutorialQuestionFeedback(question,{verdict:'bad',action:'remove'});
  assert.equal(w.state.questions.length,0);
  assert.equal(events.length,2);
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

test('Prepared tutorial test is deterministic: grade 4, ten tasks, four images and one deliberate AI-style error', t => {
  const w = fixture(t);
  assert.equal(w.tourVersion, 'gradecrew-live-tour-v7');
  assert.equal(w.demo.grade, '4');
  assert.equal(w.demo.questions.length, 10);
  assert.equal(w.demo.timeLimitMinutes, 1);
  assert.equal(w.demo.questions.reduce((sum, q) => sum + q.points, 0), 10);
  const pictures = w.demo.questions.filter(q => q.imageUrl);
  assert.equal(pictures.length, 4);
  pictures.forEach(q => assert.ok(fs.existsSync('.' + q.imageUrl), q.imageUrl));
  assert.ok(fs.existsSync('./assets/gradecrew/demo-cat.svg'));
  const faulty = w.demo.questions[8];
  assert.match(faulty.text, /gelb/);
  assert.equal(faulty.options.find(option => option.correct)?.text, 'blue');
  assert.equal(w.demo.questions[4].manualReview, true);
  assert.equal(w.demo.questions[9].type, "ordering");
  assert.equal(w.demo.questions[9].items.join(","), "Coco,Remy,Emmi,Wilma");
  assert.match(w.demo.questions[6].text, /^Decide/);
  assert.match(w.demo.questions[5].text, /Vogel/);
  assert.equal(w.demo.questions[7].type, "markwords");
});

test('Tutorial keeps real AI concepts but uses deterministic dog edit and cat variant without provider calls', t => {
  const w = fixture(t);
  const dog = w.response(w.demo.questions[3], { variant: false });
  const cat = w.response(w.demo.questions[5], { variant: true, mediaKind: 'ai_generated' });
  assert.equal(dog.question.text, 'Choose the English word for „Hund“.');
  assert.equal(cat.question.text, 'Look at the picture. Which animal can you see?');
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
  assert.match(source, /Danke, Emmi/);
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
  assert.match(source, /gradecrew:variants-inserted/);
  assert.match(source, /variantReviewOutline/);
  assert.doesNotMatch(source, /showVariantApplyStep/);
  assert.match(source, /variant-review/);
  assert.match(source, /demo-cat\.svg/);
  assert.match(source, /Der grüne Eintrag links/);
  assert.match(variantEnhancements, /displayMediaKind/);
  assert.match(variantEnhancements, /captureInsertedVariants\(beforeIds, item, ready\)/);
  assert.match(variantEnhancements, /gradecrew:variants-inserted/);
  assert.doesNotMatch(variantEnhancements, /observer\.observe\(document\.body, \{ childList: true, subtree: true \}\)/);
});

test('Teacher polish keeps the privacy note while using shorter editor action labels', () => {
  assert.match(copyPolish, /Keine Schülerdaten – nur Testinhalte werden kopiert/);
  assert.match(copyPolish, /\.privacyStrip/);
  assert.match(copyPolish, /Aufgabe überarbeiten/);
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
  w.eval(fn('getQuestionAudioSrc') + '\n' + fn('questionAudioReady') + '\n' + fn('sanitizeQuestionForSave') + '\n' + fn('createTutorialQuiz'));
  assert.equal(await w.createTutorialQuiz(w.demo), 'DEMO');
  assert.equal(writes[0].timeLimitMinutes, 1);
  assert.equal(writes.length, 11);
  assert.equal(writes.slice(1).filter(q => q.imageUrl).length, 4);
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

test('Real student renderer uses ten widgets, four persisted images and a gated one-minute start', t => {
  const w = fixture(t);
  const events = [];
  Object.assign(w, {
    $: id => w.document.getElementById(id), stopStudentTimer: () => {}, clearStudentSubscriptions: () => {}, readStoredTimer: () => null,
    escapeHtml: value => String(value).replaceAll('"', '&quot;'), round1: number => number, setupStudentProgress: () => {},
    crewTour: { notify: event => events.push(event) }, startTimedStudentQuiz: () => {}, refreshStudentProgress: () => {}
  });
  w.eval(['studentOptionEntries', 'shuffled', 'renderGapfillStudent', 'renderOrderingStudent', 'renderMarkwordsStudent', 'tokenizeWords', 'getQuestionImageSrc', 'getQuestionAudioSrc', 'questionAnswerAudioEntries', 'questionHasAudioAnswerEntries', 'questionAnswerAudioReady', 'questionStudentAudioReady', 'audioOperations', 'makeDragItem', 'makeAudioDragItem', 'renderStudentQuiz'].map(fn).join('\n'));
  const questions = w.demo.questions.map((q, i) => ({ ...q, id: `q${i}` }));
  w.renderStudentQuiz({ ...w.demo, id: 'DEMO', startMode: 'student' }, questions);
  assert.equal(w.document.querySelectorAll('.studentQuestion').length, 10);
  assert.equal(w.document.querySelectorAll('.studentQuestionImage img').length, 4);
  assert.equal(w.document.querySelectorAll('.sortableList .sortItem').length, 4);
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
    studentSubmissionBusy: new Set(), studentConfirmationPending: new Map(), completedStudentSubmissions: new Set(), readStoredTimer: () => null, readStudentAnswer: () => 'blue',
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

test('manual tutorial submission waits for in-page approval and saves only once after repeated taps', async t => {
  const w = fixture(t);
  w.document.body.insertAdjacentHTML('beforeend', '<form id="studentForm"><input id="studentName" value="ML"><button id="studentSubmitBtn" type="submit">Antworten abgeben</button></form>');
  const writes = [];
  let approve;
  let confirmations = 0;
  Object.assign(w, {
    $: id => w.document.getElementById(id),
    confirm: () => { throw new Error('native confirm must not be called'); },
    requestStudentSubmitConfirmation: () => { confirmations++; return new Promise(resolve => { approve = resolve; }); },
    state: { studentAttempt: { attemptId: 'attempt-manual', startedAt: 1000 } },
    studentSubmissionBusy: new Set(), studentConfirmationPending: new Map(), completedStudentSubmissions: new Set(),
    readStoredTimer: () => null, getUnansweredQuestions: () => [], readStudentAnswer: () => 'blue',
    evaluateAnswer: () => ({ awarded: 1, max: 1, needsReview: false }), round1: number => number,
    deepClone: value => value, getQuizScale: () => ({ name: 'Standard' }), gradeFromPercent: () => 1,
    studentTimerKey: id => id, stopStudentTimer: () => {}, db: {}, collection: (...x) => x,
    serverTimestamp: () => 1, addDoc: async (_ref, data) => { writes.push(data); return { id: 'saved-manual' }; },
    clearStudentSubscriptions: () => {}, renderStudentResult: () => {}, toast: () => {}, crewTour: { notify: () => {} }
  });
  w.eval(fn('submitStudentQuiz'));
  const quiz = { id: 'DEMO', timeLimitMinutes: 0, tutorialVersion: 'v8' };
  const questions = [{ id: 'q1' }];
  const first = w.submitStudentQuiz(null, quiz, questions);
  const second = w.submitStudentQuiz(null, quiz, questions);
  assert.equal(confirmations, 1, 'repeated taps share one pending decision');
  assert.equal(writes.length, 0, 'nothing is saved before approval');
  approve(true);
  await Promise.all([first, second]);
  assert.equal(writes.length, 1);
});

test('timer expiry can submit while a manual confirmation is still open', async t => {
  const w = fixture(t);
  w.document.body.insertAdjacentHTML('beforeend', '<form id="studentForm"><input id="studentName" value="ML"><button id="studentSubmitBtn" type="submit">Antworten abgeben</button></form>');
  const writes = [];
  let approve;
  let pendingSignal;
  Object.assign(w, {
    $: id => w.document.getElementById(id),
    confirm: () => { throw new Error('native confirm must not be called'); },
    requestStudentSubmitConfirmation: (_message, { signal }) => { pendingSignal = signal; return new Promise(resolve => { approve = resolve; }); },
    state: { studentAttempt: { attemptId: 'attempt-timed', startedAt: 1000 } },
    studentSubmissionBusy: new Set(), studentConfirmationPending: new Map(), completedStudentSubmissions: new Set(),
    readStoredTimer: () => null, getUnansweredQuestions: () => [], readStudentAnswer: () => 'blue',
    evaluateAnswer: () => ({ awarded: 1, max: 1, needsReview: false }), round1: number => number,
    deepClone: value => value, getQuizScale: () => ({ name: 'Standard' }), gradeFromPercent: () => 1,
    studentTimerKey: id => id, stopStudentTimer: () => {}, db: {}, collection: (...x) => x,
    serverTimestamp: () => 1, addDoc: async (_ref, data) => { writes.push(data); return { id: 'saved-timed' }; },
    clearStudentSubscriptions: () => {}, renderStudentResult: () => {}, toast: () => {}, crewTour: { notify: () => {} }
  });
  w.eval(fn('submitStudentQuiz'));
  const quiz = { id: 'DEMO', timeLimitMinutes: 1, tutorialVersion: 'v8' };
  const questions = [{ id: 'q1' }];
  const manual = w.submitStudentQuiz(null, quiz, questions);
  await w.submitStudentQuiz(null, quiz, questions, { force: true, autoSubmitted: true, startedAt: 1000 });
  assert.equal(pendingSignal.aborted, true, 'timer expiry closes the pending decision');
  approve(true);
  await manual;
  assert.equal(writes.length, 1, 'expired attempt is not written twice after late approval');
  assert.equal(writes[0].autoSubmitted, true);
});

test('manual confirmation cannot submit after its student form is replaced', async t => {
  const w = fixture(t);
  w.document.body.insertAdjacentHTML('beforeend', '<form id="studentForm"><input id="studentName" value="ML"></form>');
  let approve;
  let writes = 0;
  Object.assign(w, {
    $: id => w.document.getElementById(id),
    requestStudentSubmitConfirmation: () => new Promise(resolve => { approve = resolve; }),
    state: { studentAttempt: { attemptId: 'old-attempt', startedAt: 1000 } },
    studentSubmissionBusy: new Set(), studentConfirmationPending: new Map(), completedStudentSubmissions: new Set(),
    readStoredTimer: () => null, getUnansweredQuestions: () => [], round1: number => number,
    deepClone: value => value, getQuizScale: () => ({}), gradeFromPercent: () => 1,
    stopStudentTimer: () => {}, db: {}, collection: (...x) => x, serverTimestamp: () => 1,
    addDoc: () => { writes++; return Promise.resolve({ id: 'stale' }); },
    studentTimerKey: id => id, clearStudentSubscriptions: () => {}, renderStudentResult: () => {}, toast: () => {}, crewTour: null
  });
  w.eval(fn('submitStudentQuiz'));
  const pending = w.submitStudentQuiz(null, { id: 'OLD' }, []);
  w.$('studentForm').remove();
  w.document.body.insertAdjacentHTML('beforeend', '<form id="studentForm"><input id="studentName" value="Other"></form>');
  approve(true);
  await pending;
  assert.equal(writes, 0);
});
