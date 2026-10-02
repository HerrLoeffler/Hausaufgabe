const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'lab', 'escape-room');

function openEscape() {
  const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'https://games.example/escape-room/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const w = dom.window;
  w.alert = message => { throw new Error('Unexpected alert: ' + message); };
  w.confirm = () => true;
  w.setInterval = () => 1;
  w.clearInterval = () => {};
  w.setTimeout = callback => { callback(); return 1; };
  w.GradeCrewEscapeAiBridge = { generateTest: async () => { throw new Error('Network must not run in unit tests'); } };

  if (w.HTMLDialogElement) {
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  }

  for (const file of [
    'escape-data.js',
    'gradecrew-question-adapter.js',
    'gradecrew-escape-builder.js',
    'escape-tutor.js',
    'app.js',
    'escape-teacher-compact.js',
    'escape-coco-ai.js',
    'escape-remy-voice.js',
    'escape-teacher-flow.js'
  ]) {
    w.eval(fs.readFileSync(path.join(source, file), 'utf8'));
  }
  return { dom, w, d: w.document };
}

function single(text, answer) {
  return {
    type: 'single',
    text,
    points: 1,
    options: [
      { text: answer, correct: true },
      { text: `${answer} falsch 1`, correct: false },
      { text: `${answer} falsch 2`, correct: false },
      { text: `${answer} falsch 3`, correct: false }
    ],
    mediaIntent: { kind: 'none' }
  };
}

test('Escape presents the canonical Coco artwork and compact AI teacher controls', () => {
  const { w, d } = openEscape();
  try {
    assert.equal(d.getElementById('remyHelpTitle').textContent, 'Frag Coco');
    assert.equal(d.getElementById('remyAskBtn').textContent, 'Coco fragen');
    assert.match(d.querySelector('.remyAvatar img').getAttribute('src'), /penguin-guide\.svg#pose-4/);
    assert.match(d.querySelector('#explorer img').getAttribute('src'), /penguin-guide\.svg#pose-5/);
    const cocoSvg = fs.readFileSync(path.join(root, 'assets', 'gradecrew', 'penguin-guide.svg'), 'utf8');
    assert.match(cocoSvg, /<view id="pose-1"/);
    assert.match(cocoSvg, /<view id="pose-6"/);
    assert.doesNotMatch(cocoSvg, /Reduzierte Editorial-Illustration/);
    assert.ok(d.getElementById('teacherAiCard'));
    assert.ok(d.getElementById('teacherAiSubject'));
    assert.ok(d.getElementById('teacherAiGrade'));
    assert.ok(d.getElementById('teacherAiTopic'));
    assert.ok(d.getElementById('teacherAiDifficulty'));
    assert.ok(d.getElementById('teacherAiNotes'));
    assert.match(d.getElementById('teacherAiGenerateBtn').textContent, /Remy/);
    assert.match(d.querySelector('.teacherAiRemy img').getAttribute('src'), /clay-remy-writing\.svg/);
    assert.equal(d.querySelector('.teacherAiRemy img').getAttribute('alt'), 'Remy');
    assert.match(d.querySelector('#teacherAiCard h3').textContent, /Remy/);
    assert.ok(d.getElementById('teacherAiRemyMic'));
    const remySvg = fs.readFileSync(path.join(root, 'assets', 'gradecrew', 'elephant-create.svg'), 'utf8');
    assert.match(remySvg, /<view id="pose-1"/);
    assert.match(remySvg, /<view id="pose-6"/);
    assert.doesNotMatch(remySvg, /Reduzierte Editorial-Illustration/);
    assert.equal(d.getElementById('teacherAiLogin'), null);
    assert.equal(d.getElementById('teacherAiEmail'), null);
    assert.equal(d.getElementById('teacherAiPassword'), null);
    assert.ok(d.getElementById('teacherAiConnection'));
  } finally {
    w.close();
  }
});

test('Remy generator uses one 16-question GradeCrew request for eight main-transfer pairs', () => {
  const { w } = openEscape();
  try {
    const payload = w.GradeCrewEscapeAiGenerator.generationPayload({
      subject: 'Mathematik', grade: '7', topic: 'Prozentrechnung', difficulty: 'mittel', notes: 'alltagsnah'
    });
    assert.equal(payload.count, 16);
    assert.equal(payload.points, 16);
    assert.equal(payload.imageQuestionCount, 0);
    assert.deepEqual(Array.from(payload.allowedTypes), ['single', 'truefalse', 'number']);
    assert.match(payload.notes, /ersten 8 sind die Hauptaufgaben/);
    assert.match(payload.notes, /Aufgaben 9–16/);
  } finally {
    w.close();
  }
});

test('generated GradeCrew questions become eight validated Escape slots with paired transfers', () => {
  const { w } = openEscape();
  try {
    const mains = Array.from({ length: 8 }, (_, index) => single(`Hauptaufgabe ${index + 1}`, `Lösung ${index + 1}`));
    const transfers = Array.from({ length: 8 }, (_, index) => single(`Transfer ${index + 1}`, `Transferlösung ${index + 1}`));
    const prepared = w.GradeCrewEscapeAiGenerator.prepareGeneratedTest(
      { test: { title: 'KI Escape', subject: 'Deutsch', grade: '7', questions: [...mains, ...transfers] } },
      { subject: 'Deutsch', grade: '7', topic: 'Wortarten' }
    );

    assert.equal(prepared.ok, true);
    assert.equal(prepared.questions.length, 8);
    assert.equal(prepared.questions[0].prompt, 'Hauptaufgabe 1');
    assert.match(prepared.questions[0].remediation.transfer.prompt, /^Transfer 1\nAntwortmöglichkeiten:/);
    assert.match(prepared.questions[0].remediation.transfer.prompt, /Transferlösung 1 falsch 3/);
    assert.ok(prepared.questions[0].remediation.transfer.acceptedAnswers.includes('Transferlösung 1'));
    assert.match(prepared.questions[0].hint, /Wortarten/);
  } finally {
    w.close();
  }
});

test('non-numeric subjects keep the AI type set automatically checkable and compact', () => {
  const { w } = openEscape();
  try {
    assert.deepEqual(Array.from(w.GradeCrewEscapeAiGenerator.safeTypes('Deutsch')), ['single', 'dropdown', 'truefalse']);
    assert.deepEqual(Array.from(w.GradeCrewEscapeAiGenerator.safeTypes('Mathematik')), ['single', 'truefalse', 'number']);
  } finally {
    w.close();
  }
});


test('teacher preparation is the only new-run entry point before the Escape starts', () => {
  const { w, d } = openEscape();
  try {
    const start = d.getElementById('startBtn');
    const preview = d.getElementById('teacherPreviewBtn');
    const teacherStart = d.getElementById('teacherStartBtn');
    assert.equal(start.textContent.trim(), 'Escape vorbereiten');
    assert.equal(preview.hidden, true);
    assert.ok(teacherStart);
    assert.equal(d.getElementById('gameView').hidden, true);

    start.click();
    assert.equal(d.getElementById('teacherDialog').open, true);
    assert.equal(d.getElementById('gameView').hidden, true);

    teacherStart.click();
    assert.equal(d.getElementById('gameView').hidden, false);
    assert.equal(d.getElementById('teacherDialog').open, false);
  } finally {
    w.close();
  }
});

test('standalone Escape AI client has no Firebase login dependency', () => {
  const sourceJs = fs.readFileSync(path.join(source, 'escape-coco-ai.js'), 'utf8');
  assert.doesNotMatch(sourceJs, /firebase-auth/);
  assert.doesNotMatch(sourceJs, /signInWithEmailAndPassword/);
  assert.doesNotMatch(sourceJs, /teacherAiLogin/);
  assert.match(sourceJs, /GradeCrewEscapeAiBridge/);
});

test('standalone lab keeps the Remy preparation action clickable without faking AI generation', () => {
  const { w, d } = openEscape();
  try {
    delete w.GradeCrewEscapeAiBridge;
    w.dispatchEvent(new w.Event('gradecrew:escape-ai-bridge-ready'));
    const button = d.getElementById('teacherAiGenerateBtn');
    assert.equal(button.disabled, false);
    assert.match(button.textContent, /Remy-Vorschau/);
    d.getElementById('teacherAiSubject').value = 'Deutsch';
    d.getElementById('teacherAiGrade').value = '5';
    d.getElementById('teacherAiTopic').value = 'Wortarten';
    button.click();
    assert.match(d.getElementById('teacherContentProfile').textContent, /Deutsch · Klasse 5 · Wortarten/);
    assert.match(d.getElementById('teacherAiStatus').textContent, /keine echte KI-Erstellung vortäuschen/);
    assert.equal(button.disabled, false);
    d.getElementById('teacherAiTopic').value = 'Verben';
    button.click();
    assert.match(d.getElementById('teacherContentProfile').textContent, /Verben/);
  } finally {
    w.close();
  }
});

test('Remy voice control is present and fails locally when browser speech recognition is unavailable', () => {
  const { w, d } = openEscape();
  try {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    d.getElementById('teacherAiRemyMic').click();
    assert.match(d.getElementById('teacherAiVoiceStatus').textContent, /Browser noch nicht unterstützt/);
    const voiceSource = fs.readFileSync(path.join(source, 'escape-remy-voice.js'), 'utf8');
    assert.match(voiceSource, /SpeechRecognition/);
    assert.doesNotMatch(voiceSource, /localStorage|sessionStorage|MediaRecorder/);
  } finally {
    w.close();
  }
});

test('Remy generator exposes a role-correct API while keeping the legacy alias compatible', () => {
  const { w } = openEscape();
  try {
    assert.ok(w.GradeCrewEscapeRemyGenerator);
    assert.equal(w.GradeCrewEscapeRemyGenerator, w.GradeCrewEscapeAiGenerator);
  } finally {
    w.close();
  }
});

test('transfer questions use the same strict type and image validation as main questions', () => {
  const { w } = openEscape();
  try {
    const api = w.GradeCrewEscapeAiGenerator;
    for (const question of [
      { type: 'truefalse', text: 'Unvollständig' },
      { type: 'number', text: 'Leere Zahl', numericAnswer: null },
      { type: 'text', text: 'Manuell', acceptedAnswers: ['X'], manualReview: true },
      { ...single('Bildfrage', 'X'), imageUrl: 'https://example.invalid/required.png' },
      { type: 'multi', text: 'Mehrfach', options: [{ text: 'X', correct: true }] }
    ]) {
      const questions = Array.from({ length: 16 }, (_, i) => single('Frage ' + i, 'A'));
      questions[8] = question;
      assert.equal(api.prepareGeneratedTest({ questions }, { topic: 'Test' }).ok, false);
    }
    const questions = Array.from({ length: 16 }, (_, i) => single('Frage ' + i, 'A'));
    questions[8] = { type: 'number', text: 'Runde auf eine Nachkommastelle', numericAnswer: 1.25, tolerance: 0.1 };
    const transfer = api.prepareGeneratedTest({ questions }, { topic: 'Runden' }).questions[0].remediation.transfer;
    assert.equal(transfer.numericAnswer, 1.25);
    assert.equal(transfer.tolerance, 0.1);
    assert.equal(transfer.answerMode, 'number');
  } finally { w.close(); }
});

test('bridge ready events cannot double-generate and outdated form results are not applied', async () => {
  const { w, d } = openEscape();
  try {
    let resolve, calls = 0;
    w.GradeCrewEscapeAiBridge.generateTest = () => { calls++; return new Promise(r => { resolve = r; }); };
    const button = d.getElementById('teacherAiGenerateBtn');
    const pending = button.onclick();
    w.dispatchEvent(new w.Event('gradecrew:escape-ai-bridge-ready'));
    assert.equal(button.disabled, true);
    await button.onclick();
    assert.equal(calls, 1);
    d.getElementById('teacherAiTopic').value = 'Neues Thema';
    resolve({ questions: [] });
    await pending;
    assert.equal(button.disabled, false);
    assert.match(d.getElementById('teacherAiStatus').textContent, /ältere Ergebnis wurde nicht übernommen/);
  } finally { w.close(); }
});

test('speech final results survive Stop but stale sessions and manual edits are protected', () => {
  const { w, d } = openEscape();
  try {
    const sessions = [];
    w.SpeechRecognition = class {
      constructor() { sessions.push(this); }
      start() {}
      stop() { this.stopped = true; }
      abort() { this.aborted = true; }
    };
    const mic = d.getElementById('teacherAiRemyMic'), notes = d.getElementById('teacherAiNotes');
    const result = (session, text) => session.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] });
    mic.click(); mic.click();
    assert.equal(sessions[0].stopped, true);
    result(sessions[0], 'Erster Wunsch'); sessions[0].onend();
    assert.equal(notes.value, 'Erster Wunsch');
    mic.click(); mic.click(); mic.click();
    const current = sessions[2];
    result(sessions[1], 'VERALTET'); sessions[1].onend();
    assert.equal(mic.getAttribute('aria-pressed'), 'true');
    result(current, 'Neuer Wunsch');
    notes.value = 'Manuell korrigiert';
    notes.dispatchEvent(new w.Event('input'));
    result(current, 'SPÄT');
    assert.equal(notes.value, 'Manuell korrigiert');
    assert.equal(current.aborted, true);
    mic.click();
    d.getElementById('teacherDialog').dispatchEvent(new w.Event('close'));
    assert.equal(sessions[3].aborted, true);
    assert.equal(mic.getAttribute('aria-pressed'), 'false');
  } finally { w.close(); }
});

