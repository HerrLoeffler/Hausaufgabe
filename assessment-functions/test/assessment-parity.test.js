"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildAssessmentContract,
  gradeSubmission,
  authoringFingerprint
} = require("../lib/assessment-core");

const SECRET = "secure_server_paper_secret_ABCDEFGHIJKLMNOPQRSTUVWXYZ_123456";

function questions() {
  return [
    {
      id: "q1", position: 1, type: "single", text: "Farbe?", points: 1,
      options: [
        { text: "Rot", correct: false },
        { text: "Blau", correct: true },
        { text: "Grün", correct: false }
      ]
    },
    {
      id: "q2", position: 2, type: "matching", text: "Ordne zu", points: 2,
      pairs: [
        { left: "A", right: "1" },
        { left: "B", right: "2" },
        { left: "C", right: "3" }
      ]
    },
    {
      id: "q3", position: 3, type: "truefalse", text: "Stimmt?", points: 1,
      correctBoolean: false
    }
  ];
}

test("secure partial scoring stays on GradeCrew's 0.5 point grid", () => {
  const { paper, gradingKey } = buildAssessmentContract(questions(), SECRET);
  const match = paper.find(question => question.id === "q2");
  const answers = { q2: {} };
  const rightOne = match.rightItems.find(item => item.text === "1").id;
  const leftA = match.leftItems.find(item => item.text === "A").id;
  answers.q2[leftA] = rightOne;
  const result = gradeSubmission(gradingKey.filter(key => key.id === "q2"), answers);
  assert.equal(result.autoPoints, 0.5);
  assert.equal(result.grading.q2.awardedPoints, 0.5);
  assert.equal((result.autoPoints * 2) % 1, 0);
});

test("question and answer shuffle settings are honored and stable for an attempt", () => {
  const natural = buildAssessmentContract(questions(), SECRET, { shuffleQuestions: false, shuffleAnswers: false });
  const shuffled = buildAssessmentContract(questions(), SECRET, { shuffleQuestions: true, shuffleAnswers: true });
  const again = buildAssessmentContract(questions(), SECRET, { shuffleQuestions: true, shuffleAnswers: true });

  assert.deepEqual(natural.paper.map(question => question.id), ["q1", "q2", "q3"]);
  assert.deepEqual(natural.paper.find(question => question.id === "q1").options.map(option => option.text), ["Rot", "Blau", "Grün"]);
  assert.notDeepEqual(shuffled.paper.map(question => question.id), ["q1", "q2", "q3"]);
  assert.notDeepEqual(shuffled.paper.find(question => question.id === "q1").options.map(option => option.text), ["Rot", "Blau", "Grün"]);
  assert.deepEqual(shuffled.paper, again.paper);
});

test("authoring fingerprint changes with content or shuffle policy but not paper secret", () => {
  const base = questions();
  const first = authoringFingerprint(base, { shuffleQuestions: false, shuffleAnswers: false });
  const same = buildAssessmentContract(base, SECRET, { shuffleQuestions: false, shuffleAnswers: false }).authoringFingerprint;
  const changedPolicy = authoringFingerprint(base, { shuffleQuestions: true, shuffleAnswers: false });
  const changedContent = authoringFingerprint(base.map(question => question.id === "q1" ? { ...question, text: "Andere Frage" } : question));

  assert.equal(first, same);
  assert.notEqual(first, changedPolicy);
  assert.notEqual(first, changedContent);
});
