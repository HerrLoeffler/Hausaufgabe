"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { solutionAnswerText, solutionAudioScript, planSolutionAudioIndexes } = require("../lib/solution-audio");

test("solution audio text is deterministic and based on the stored answer key", () => {
  assert.equal(solutionAudioScript({
    type: "single",
    options: [{ text: "25 %", correct: true }, { text: "30 %", correct: false }]
  }), "Die richtige Lösung ist: 25 %");
  assert.equal(solutionAnswerText({ type: "truefalse", correctBoolean: false }), "Falsch.");
  assert.match(solutionAudioScript({ type: "number", numericAnswer: 12.5, unit: "€" }), /12\.5 €/);
});

test("exact solution audio count is distributed without duplicate positions", () => {
  assert.deepEqual(planSolutionAudioIndexes(10, 0), []);
  assert.equal(planSolutionAudioIndexes(10, 3).length, 3);
  assert.equal(new Set(planSolutionAudioIndexes(10, 5)).size, 5);
  assert.deepEqual(planSolutionAudioIndexes(2, 5), [0, 1]);
});
