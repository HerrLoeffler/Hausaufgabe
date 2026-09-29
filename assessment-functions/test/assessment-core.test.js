"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  tokenHash,
  secureTokenMatches,
  buildAssessmentContract,
  gradeSubmission,
  gradeFromPercent,
  sanitizeAnswersForStorage,
  assertNoSolutionLeak
} = require("../lib/assessment-core");

const TOKEN = "abcdefghijklmnopqrstuvwxyzABCDE_1234567890";

function sampleQuestions() {
  return [
    {
      id: "single", position: 1, type: "single", text: "Choose blue", points: 1,
      options: [{ text: "red", correct: false }, { text: "blue", correct: true }, { text: "green", correct: false }]
    },
    {
      id: "multi", position: 2, type: "multi", text: "Choose vowels", points: 2,
      options: [{ text: "A", correct: true }, { text: "B", correct: false }, { text: "E", correct: true }]
    },
    {
      id: "text", position: 3, type: "text", text: "Capital of Bavaria?", points: 1,
      acceptedAnswers: ["München", "Munich"], manualReview: false
    },
    {
      id: "manual", position: 4, type: "text", text: "Explain your reasoning.", points: 2,
      acceptedAnswers: [], manualReview: true
    },
    {
      id: "number", position: 5, type: "number", text: "2+2", points: 1,
      numericAnswer: 4, tolerance: 0, unit: ""
    },
    {
      id: "tf", position: 6, type: "truefalse", text: "Earth is round.", points: 1,
      correctBoolean: true
    },
    {
      id: "gap", position: 7, type: "gapfill", text: "I [am|'m] here and you [are|'re] there.", points: 2
    },
    {
      id: "match", position: 8, type: "matching", text: "Match", points: 2,
      pairs: [{ left: "Germany", right: "Berlin" }, { left: "France", right: "Paris" }]
    },
    {
      id: "order", position: 9, type: "ordering", text: "Put in order", points: 2,
      items: ["first", "second", "third"], acceptedOrders: [[0, 2, 1]]
    },
    {
      id: "group", position: 10, type: "grouping", text: "Group", points: 2,
      groups: [
        { name: "Animals", items: ["Dog", "Cat"] },
        { name: "Plants", items: ["Oak"] }
      ]
    },
    {
      id: "mark", position: 11, type: "markwords", text: "Mark nouns", points: 2,
      passage: "The dog runs to school.", targetWords: ["dog", "school"]
    }
  ];
}

test("attempt token is stored only as a one-way hash", () => {
  const hash = tokenHash(TOKEN);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, TOKEN);
  assert.equal(secureTokenMatches(TOKEN, hash), true);
  assert.equal(secureTokenMatches(`${TOKEN}x`, hash), false);
});

test("student paper contains no direct solution fields across every supported interaction", () => {
  const { paper } = buildAssessmentContract(sampleQuestions(), TOKEN);
  assert.equal(assertNoSolutionLeak(paper), true);
  const raw = JSON.stringify(paper);
  assert.doesNotMatch(raw, /acceptedAnswers|correctBoolean|numericAnswer|targetWords|acceptedOrders|gradingKey|answerKey/);
  assert.doesNotMatch(raw, /München|Munich/);
  assert.doesNotMatch(raw, /\[am\|'m\]|\[are\|'re\]/);
});

test("matching, grouping and ordering do not reveal their answer mapping through IDs or source order", () => {
  const { paper } = buildAssessmentContract(sampleQuestions(), TOKEN);
  const matching = paper.find(q => q.id === "match");
  assert.equal(matching.leftItems.length, 2);
  assert.equal(matching.rightItems.length, 2);
  assert.ok(matching.leftItems.every(x => !/^\d+$/.test(x.id)));
  assert.ok(matching.rightItems.every(x => !/^\d+$/.test(x.id)));
  assert.notDeepEqual(matching.leftItems.map(x => x.id), matching.rightItems.map(x => x.id));

  const grouping = paper.find(q => q.id === "group");
  assert.ok(grouping.groups.every(group => !group.items));
  assert.ok(grouping.items.every(item => !Object.hasOwn(item, "groupId")));

  const ordering = paper.find(q => q.id === "order");
  assert.ok(ordering.items.every(item => typeof item.id === "string" && item.id.length >= 10));
  assert.notDeepEqual(ordering.items.map(item => item.text), ["first", "second", "third"]);
});

test("same attempt token produces a stable paper; another attempt receives different opaque IDs and shuffle", () => {
  const one = buildAssessmentContract(sampleQuestions(), TOKEN);
  const again = buildAssessmentContract(sampleQuestions(), TOKEN);
  const other = buildAssessmentContract(sampleQuestions(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz123456");
  assert.deepEqual(one.paper, again.paper);
  assert.equal(one.sourceFingerprint, again.sourceFingerprint);
  assert.notDeepEqual(one.paper, other.paper);
  assert.notEqual(one.sourceFingerprint, other.sourceFingerprint);
});

test("server grading accepts opaque answers and never trusts client points", () => {
  const { paper, gradingKey } = buildAssessmentContract(sampleQuestions(), TOKEN);
  const byId = Object.fromEntries(paper.map(question => [question.id, question]));
  const answers = {};

  answers.single = byId.single.options.find(option => option.text === "blue").id;
  answers.multi = byId.multi.options.filter(option => ["A", "E"].includes(option.text)).map(option => option.id);
  answers.text = "Munich";
  answers.manual = "Because ...";
  answers.number = "4";
  answers.tf = "true";
  answers.gap = ["am", "are"];

  const matchQ = byId.match;
  const rightByText = Object.fromEntries(matchQ.rightItems.map(item => [item.text, item.id]));
  answers.match = {
    [matchQ.leftItems.find(item => item.text === "Germany").id]: rightByText.Berlin,
    [matchQ.leftItems.find(item => item.text === "France").id]: rightByText.Paris
  };

  const orderQ = byId.order;
  const orderByText = Object.fromEntries(orderQ.items.map(item => [item.text, item.id]));
  answers.order = [orderByText.first, orderByText.second, orderByText.third];

  const groupQ = byId.group;
  const groupByName = Object.fromEntries(groupQ.groups.map(group => [group.name, group.id]));
  const groupItemByText = Object.fromEntries(groupQ.items.map(item => [item.text, item.id]));
  answers.group = {
    [groupItemByText.Dog]: groupByName.Animals,
    [groupItemByText.Cat]: groupByName.Animals,
    [groupItemByText.Oak]: groupByName.Plants
  };
  answers.mark = ["1", "4"];

  const result = gradeSubmission(gradingKey, answers);
  assert.equal(result.maxPoints, 18);
  assert.equal(result.autoPoints, 16);
  assert.equal(result.needsReview, true);
  assert.equal(result.grading.manual.needsReview, true);
  assert.equal(result.grading.single.correct, true);
  assert.equal(result.grading.match.correct, true);
  assert.equal(result.grading.group.correct, true);
});

test("server grading rejects wrong opaque mappings even when displayed labels look plausible", () => {
  const { paper, gradingKey } = buildAssessmentContract(sampleQuestions(), TOKEN);
  const matchQ = paper.find(q => q.id === "match");
  const answers = {
    match: {
      [matchQ.leftItems[0].id]: matchQ.rightItems.find(item => item.text !== (matchQ.leftItems[0].text === "Germany" ? "Berlin" : "Paris")).id,
      [matchQ.leftItems[1].id]: matchQ.rightItems.find(item => item.text !== (matchQ.leftItems[1].text === "Germany" ? "Berlin" : "Paris")).id
    }
  };
  const result = gradeSubmission(gradingKey.filter(key => key.id === "match"), answers);
  assert.equal(result.autoPoints, 0);
  assert.equal(result.grading.match.correct, false);
});

test("answer storage drops unknown questions and clamps oversized values", () => {
  const { gradingKey } = buildAssessmentContract(sampleQuestions(), TOKEN);
  const stored = sanitizeAnswersForStorage(gradingKey, {
    single: "x".repeat(5000),
    unknown: "do not store",
    group: { ["a".repeat(300)]: "b".repeat(300) }
  });
  assert.equal(Object.hasOwn(stored, "unknown"), false);
  assert.equal(stored.single.length, 4000);
  assert.equal(Object.keys(stored.group)[0].length, 100);
  assert.equal(Object.values(stored.group)[0].length, 100);
});

test("grade thresholds preserve GradeCrew's six-grade scale", () => {
  const thresholds = [91, 77, 57, 39, 25, 0];
  assert.equal(gradeFromPercent(100, thresholds), 1);
  assert.equal(gradeFromPercent(91, thresholds), 1);
  assert.equal(gradeFromPercent(90, thresholds), 2);
  assert.equal(gradeFromPercent(24, thresholds), 6);
});
