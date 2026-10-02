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
    assert.match(d.getElementById('teacherAiGenerateBtn').textContent, /8 Escape-Aufgaben/);
    assert.equal(d.getElementById('teacherAiLogin'), null);
    assert.equal(d.getElementById('teacherAiEmail'), null);
    assert.equal(d.getElementById('teacherAiPassword'), null);
    assert.ok(d.getElementById('teacherAiConnection'));
  } finally {
    w.close();
  }
});

test('Coco generator uses one 16-question GradeCrew request for eight main-transfer pairs', () => {
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
    assert.equal(prepared.questions[0].remediation.transfer.prompt, 'Transfer 1');
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
