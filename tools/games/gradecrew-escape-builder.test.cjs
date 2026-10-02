const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'lab', 'escape-room');

function loadBuilder() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
  const w = dom.window;
  for (const file of ['escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js']) {
    w.eval(fs.readFileSync(path.join(source, file), 'utf8'));
  }
  return { w };
}

function supports(w) {
  return w.GradeCrewEscapePrototype.questions.map(question => ({
    learningGoal: question.learningGoal,
    hint: question.hint,
    explanation: question.explanation,
    remediation: JSON.parse(JSON.stringify(question.remediation)),
    tutorAnswers: JSON.parse(JSON.stringify(question.tutorAnswers || []))
  }));
}

function single(text, correct = 0) {
  return {
    type: 'single',
    text,
    points: 1,
    options: ['A', 'B', 'C', 'D'].map((label, index) => ({ text: `${label} ${text}`, correct: index === correct })),
    mediaIntent: { kind: 'none' }
  };
}

test('builder prepares an eight-question GradeCrew test for teacher review and launch', () => {
  const { w } = loadBuilder();
  try {
    const questions = Array.from({ length: 8 }, (_, index) => single(`Frage ${index + 1}`, index % 4));
    questions[2] = { type: 'text', text: 'Nenne eine Lösung.', acceptedAnswers: ['Beispiel'], manualReview: false, mediaIntent: { kind: 'none' } };
    questions[3] = { type: 'number', text: 'Wie viel?', numericAnswer: 12.5, tolerance: 0.1, unit: 'cm', mediaIntent: { kind: 'none' } };

    const result = w.GradeCrewEscapeBuilder.prepare(
      { title: 'Prozent-Training', subject: 'Mathematik', grade: '7', topic: 'Prozentrechnung', questions },
      { supports: supports(w) }
    );

    assert.equal(result.ok, true);
    assert.equal(result.stage, 'ready');
    assert.equal(result.questions.length, 8);
    assert.equal(result.teacherReview.questions.length, 8);
    assert.equal(result.teacherReview.route.length, 3);
    assert.equal(result.teacherReview.questions[2].answer, 'Beispiel');
    assert.match(result.teacherReview.questions[3].answer, /12\.5 cm/);
    assert.equal(result.launchPayload.worldId, 'locked-school-v1');
    assert.equal(result.profile.subject, 'Mathematik');
  } finally {
    w.close();
  }
});

test('builder fails before launch when adapter safety rules reject a question', () => {
  const { w } = loadBuilder();
  try {
    const questions = Array.from({ length: 8 }, (_, index) => single(`Frage ${index + 1}`));
    questions[4] = { type: 'text', text: 'Begründe ausführlich.', acceptedAnswers: ['x'], manualReview: true, mediaIntent: { kind: 'none' } };
    const result = w.GradeCrewEscapeBuilder.prepare({ questions }, { supports: supports(w) });
    assert.equal(result.ok, false);
    assert.equal(result.stage, 'adapter');
    assert.ok(result.errors.some(error => error.code === 'manual_review_required'));
  } finally {
    w.close();
  }
});

test('prepared package can only be applied when the Escape runtime is present', () => {
  const { w } = loadBuilder();
  try {
    const questions = Array.from({ length: 8 }, (_, index) => single(`Frage ${index + 1}`));
    const prepared = w.GradeCrewEscapeBuilder.prepare({ questions }, { supports: supports(w) });
    assert.equal(prepared.ok, true);
    const withoutRuntime = w.GradeCrewEscapeBuilder.apply(prepared);
    assert.equal(withoutRuntime.ok, false);
    assert.equal(withoutRuntime.errors[0].code, 'runtime_missing');

    let received = null;
    w.GradeCrewEscapeIntegration = { replaceQuestionSet(value) { received = value; return { ok: true, errors: [], warnings: [] }; } };
    const applied = w.GradeCrewEscapeBuilder.apply(prepared);
    assert.equal(applied.ok, true);
    assert.equal(received.length, 8);
  } finally {
    w.close();
  }
});
