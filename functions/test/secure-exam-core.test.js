"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../lib/secure-exam-core");

test("secure payload strips answer keys from every supported question family", () => {
  const quiz = { shuffleQuestions: true, shuffleAnswers: true };
  const questions = [
    { id: "single", data: { type: "single", text: "2+2?", points: 1, options: [{ text: "4", correct: true }, { text: "5", correct: false }] } },
    { id: "multi", data: { type: "multi", text: "Primzahlen", points: 2, options: [{ text: "2", correct: true }, { text: "3", correct: true }, { text: "4", correct: false }] } },
    { id: "text", data: { type: "text", text: "Hauptstadt?", points: 1, acceptedAnswers: ["Berlin"] } },
    { id: "number", data: { type: "number", text: "3+4", points: 1, numericAnswer: 7, tolerance: 0 } },
    { id: "tf", data: { type: "truefalse", text: "Wasser ist nass", points: 1, correctBoolean: true } },
    { id: "gap", data: { type: "gapfill", text: "Ich [gehe|laufe] heim.", points: 1 } },
    { id: "match", data: { type: "matching", text: "Ordne", points: 2, pairs: [{ left: "A", right: "1" }, { left: "B", right: "2" }] } },
    { id: "order", data: { type: "ordering", text: "Sortiere", points: 2, items: ["A", "B", "C"] } },
    { id: "group", data: { type: "grouping", text: "Gruppiere", points: 2, groups: [{ name: "X", items: ["a"] }, { name: "Y", items: ["b"] }] } },
    { id: "mark", data: { type: "markwords", text: "Markiere", points: 1, passage: "Der Hund rennt.", targetWords: ["Hund"] } }
  ];
  const payload = core.buildSecureExamPayload(quiz, questions);
  const publicJson = JSON.stringify(payload.publicQuestions);
  for (const forbidden of ["correctBoolean", "acceptedAnswers", "numericAnswer", "tolerance", "targetWords", "acceptedOrders", '"correct"']) {
    assert.equal(publicJson.includes(forbidden), false, `leaked ${forbidden}`);
  }
  assert.equal(publicJson.includes("gehe|laufe"), false);
  const matching = payload.publicQuestions.find(q => q.id === "match");
  assert.ok(matching.leftItems?.length === 2 && matching.rightItems?.length === 2);
  assert.equal(JSON.stringify(matching).includes('"pairs"'), false);
  const grouping = payload.publicQuestions.find(q => q.id === "group");
  assert.ok(grouping.groups.every(g => !("items" in g)));
});

test("server grading reproduces full-credit semantics without exposing solutions", () => {
  const questions = [
    { id: "q1", data: { type: "single", text: "x", points: 1, options: [{ text: "A", correct: false }, { text: "B", correct: true }] } },
    { id: "q2", data: { type: "gapfill", text: "Ich [gehe|laufe] heim.", points: 1 } },
    { id: "q3", data: { type: "matching", text: "Ordne", points: 2, pairs: [{ left: "A", right: "1" }, { left: "B", right: "2" }] } },
    { id: "q4", data: { type: "ordering", text: "Sortiere", points: 2, items: ["a", "b", "c"] } },
    { id: "q5", data: { type: "grouping", text: "Gruppiere", points: 2, groups: [{ name: "X", items: ["a"] }, { name: "Y", items: ["b"] }] } },
    { id: "q6", data: { type: "markwords", text: "Markiere", points: 1, passage: "Der Hund rennt.", targetWords: ["Hund"] } },
    { id: "q7", data: { type: "number", text: "x", points: 1, numericAnswer: 3.5, tolerance: 0.1 } }
  ];
  const payload = core.buildSecureExamPayload({}, questions);
  const answers = {};
  for (const [id, key] of Object.entries(payload.gradingKeys)) {
    if (key.type === "single") answers[id] = key.correctOptionIds[0];
    if (key.type === "gapfill") answers[id] = ["gehe"];
    if (key.type === "matching") answers[id] = { ...key.matches };
    if (key.type === "ordering") answers[id] = [...key.acceptedOrders[0]];
    if (key.type === "grouping") answers[id] = { ...key.itemGroups };
    if (key.type === "markwords") answers[id] = [...key.correctIndexes];
    if (key.type === "number") answers[id] = "3,5";
  }
  const result = core.gradeSecureAnswers(payload.gradingKeys, answers);
  assert.equal(result.points, result.maxPoints);
  assert.equal(result.percent, 100);
  assert.equal(result.needsReview, false);
});

test("manual text remains pending and client answers are constrained to known questions", () => {
  const payload = core.buildSecureExamPayload({}, [
    { id: "manual", data: { type: "text", text: "Begründe", points: 3, manualReview: true } }
  ]);
  const result = core.gradeSecureAnswers(payload.gradingKeys, { manual: "Eine Antwort", injected: "evil" });
  assert.equal(result.points, 0);
  assert.equal(result.maxPoints, 3);
  assert.equal(result.needsReview, true);
  assert.deepEqual(Object.keys(result.answers), ["manual"]);
});
