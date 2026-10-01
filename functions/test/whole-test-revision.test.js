"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  cleanWholeTestRevisionRequest,
  explicitTypeChangeRequested,
  wholeTestRevisionSchema,
  finalizeWholeTestRevision
} = require("../lib/whole-test-revision");

function mediaNone() {
  return { kind: "none", prompt: "", altText: "", count: 0, sourceMaterialId: "", reason: "" };
}

function singleQuestion(text = "Welche Antwort ist richtig?", points = 2) {
  return {
    type: "single",
    text,
    points,
    options: [
      { text: "Richtig", correct: true },
      { text: "Falsch", correct: false }
    ],
    acceptedAnswers: [],
    manualReview: false,
    correctBoolean: false,
    pairs: [],
    items: [],
    acceptedOrders: [],
    groups: [],
    passage: "",
    targetWords: [],
    numericAnswer: 0,
    tolerance: 0,
    unit: "",
    mediaIntent: mediaNone()
  };
}

function request(questionOverrides = {}) {
  return cleanWholeTestRevisionRequest({
    instruction: "Formuliere den ganzen Test einfacher und klarer.",
    test: {
      title: "Probe",
      subject: "Deutsch",
      grade: "6",
      description: "Viel Erfolg",
      questions: [{ ...singleQuestion(), ...questionOverrides }]
    }
  });
}

test("requires a real teacher instruction and source questions", () => {
  assert.throws(() => cleanWholeTestRevisionRequest({ instruction: "", test: { questions: [singleQuestion()] } }), /beschreiben/i);
  assert.throws(() => cleanWholeTestRevisionRequest({ instruction: "Einfacher", test: { questions: [] } }), /keine Aufgaben/i);
});

test("detects explicit task-type changes but not ordinary difficulty wishes", () => {
  assert.equal(explicitTypeChangeRequested("Mach den Test schwieriger und kürzer"), false);
  assert.equal(explicitTypeChangeRequested("Mach zwei Aufgaben zu Multiple Choice"), true);
  assert.equal(explicitTypeChangeRequested("Nutze mehr Freitext"), true);
});

test("schema preserves exact whole-test question count", () => {
  const clean = request();
  const schema = wholeTestRevisionSchema(clean);
  assert.equal(schema.properties.questions.minItems, 1);
  assert.equal(schema.properties.questions.maxItems, 1);
});

test("valid revision changes content but preserves original points", () => {
  const clean = request();
  const revised = singleQuestion("Welche Formulierung passt am besten?", 9);
  revised.options = [
    { text: "Diese hier", correct: true },
    { text: "Die andere", correct: false }
  ];
  const result = finalizeWholeTestRevision(clean, {
    title: "Ignorierter neuer Titel",
    subject: "Deutsch",
    grade: "6",
    description: "",
    questions: [revised]
  });
  assert.equal(result.test.questions.length, 1);
  assert.equal(result.test.questions[0].points, 2);
  assert.equal(result.test.questions[0].text, "Welche Formulierung passt am besten?");
  assert.deepEqual(result.changedIndices, [0]);
});

test("invalid revision falls back to original question", () => {
  const clean = request();
  const invalid = singleQuestion("Kaputt");
  invalid.options = [{ text: "Nur eine Option", correct: true }];
  const result = finalizeWholeTestRevision(clean, { questions: [invalid] });
  assert.equal(result.test.questions[0].text, clean.test.questions[0].question.text);
  assert.equal(result.invalidCount, 1);
  assert.deepEqual(result.unchangedIndices, [0]);
});

test("locked question can never be changed by the model", () => {
  const clean = request({ locked: true });
  const revised = singleQuestion("Komplett andere Aufgabe");
  const result = finalizeWholeTestRevision(clean, { questions: [revised] });
  assert.equal(result.test.questions[0].text, clean.test.questions[0].question.text);
  assert.equal(result.lockedCount, 1);
  assert.deepEqual(result.unchangedIndices, [0]);
});

test("implicit type changes are rejected per question", () => {
  const clean = request();
  const changedType = {
    ...singleQuestion("Ist diese Aussage richtig?"),
    type: "truefalse",
    options: [],
    correctBoolean: true
  };
  const result = finalizeWholeTestRevision(clean, { questions: [changedType] });
  assert.equal(result.test.questions[0].type, "single");
  assert.deepEqual(result.unchangedIndices, [0]);
});
