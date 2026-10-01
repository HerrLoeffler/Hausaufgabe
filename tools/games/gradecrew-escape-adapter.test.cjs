const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'lab', 'escape-room');

function loadAdapter() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
  const w = dom.window;
  w.eval(fs.readFileSync(path.join(source, 'escape-data.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(source, 'gradecrew-question-adapter.js'), 'utf8'));
  return { dom, w };
}

function supportsFromCanonical(w) {
  return w.GradeCrewEscapePrototype.questions.map(question => ({
    learningGoal: question.learningGoal,
    hint: question.hint,
    explanation: question.explanation,
    remediation: JSON.parse(JSON.stringify(question.remediation)),
    tutorAnswers: JSON.parse(JSON.stringify(question.tutorAnswers || []))
  }));
}

function single(text, correct = 1, type = 'single') {
  return {
    type,
    text,
    points: 1,
    options: ['A', 'B', 'C', 'D'].map((value, index) => ({ text: `${value} ${text}`, correct: index === correct })),
    mediaIntent: { kind: 'none' }
  };
}

test('GradeCrew adapter maps eight safe choice questions without inventing game logic', () => {
  const { w } = loadAdapter();
  try {
    const questions = Array.from({ length: 8 }, (_, index) => single(`Frage ${index + 1}`, index % 4));
    questions[1] = single('Dropdown', 2, 'dropdown');
    questions[2] = { type: 'truefalse', text: 'Die Erde ist rund.', points: 1, correctBoolean: true, mediaIntent: { kind: 'none' } };

    const result = w.GradeCrewEscapeQuestionAdapter.adaptTest(
      { title: 'Test', subject: 'GPG', grade: '7', questions },
      { supports: supportsFromCanonical(w) }
    );

    assert.equal(result.ok, true);
    assert.equal(result.questions.length, 8);
    assert.equal(result.questions[0].id, 'q1');
    assert.equal(result.questions[0].answerMode, 'choice');
    assert.equal(result.questions[1].options.length, 4);
    assert.deepEqual(Array.from(result.questions[2].options), ['Richtig', 'Falsch']);
    assert.equal(result.questions[2].correctIndex, 0);
    assert.equal(result.questions[0].source.system, 'gradecrew');
    assert.equal(result.profile.subject, 'GPG');
  } finally {
    w.close();
  }
});

test('adapter requires exactly eight selected questions and eight support packs', () => {
  const { w } = loadAdapter();
  try {
    const seven = Array.from({ length: 7 }, (_, index) => single(`Frage ${index + 1}`));
    const tooFew = w.GradeCrewEscapeQuestionAdapter.adaptTest(
      { questions: seven },
      { supports: supportsFromCanonical(w).slice(0, 7) }
    );
    assert.equal(tooFew.ok, false);
    assert.equal(tooFew.errors[0].code, 'select_eight');

    const eight = [...seven, single('Frage 8')];
    const noSupport = w.GradeCrewEscapeQuestionAdapter.adaptTest({ questions: eight }, { supports: [] });
    assert.equal(noSupport.ok, false);
    assert.equal(noSupport.errors[0].code, 'support_count');
  } finally {
    w.close();
  }
});

test('adapter fails closed for free text, number and complex question types until their engine modes are tested', () => {
  const { w } = loadAdapter();
  try {
    const support = supportsFromCanonical(w)[0];

    const text = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(
      { type: 'text', text: 'Nenne die Hauptstadt.', acceptedAnswers: ['München'], manualReview: false },
      support, 'q1', 0
    );
    assert.equal(text.errors[0].code, 'answer_mode_not_ready');

    const number = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(
      { type: 'number', text: '2 + 2 = ?', numericAnswer: 4, tolerance: 0, unit: '' },
      support, 'q1', 0
    );
    assert.equal(number.errors[0].code, 'answer_mode_not_ready');

    const multi = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(
      { type: 'multi', text: 'Wähle alle.', options: [{ text: 'A', correct: true }, { text: 'B', correct: true }] },
      support, 'q1', 0
    );
    assert.equal(multi.errors[0].code, 'unsupported_type');
  } finally {
    w.close();
  }
});

test('adapter rejects image-dependent source questions instead of silently dropping the visual', () => {
  const { w } = loadAdapter();
  try {
    const visual = single('Was zeigt das Bild?');
    visual.imageUrl = 'https://example.invalid/image.png';
    const result = w.GradeCrewEscapeQuestionAdapter.adaptQuestion(
      visual,
      supportsFromCanonical(w)[0],
      'q1',
      0
    );
    assert.equal(result.errors[0].code, 'visual_dependency');
  } finally {
    w.close();
  }
});
