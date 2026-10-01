"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { summarizeAiEvents, summarizeTeacherFeedback } = require("../lib/telemetry-ai-core");

test("AI summary separates missing legacy token evidence from real positive usage", () => {
  const summary = summarizeAiEvents([
    { kind: "test", model: "gpt-x", promptVersion: "p1", inputTokens: 100, outputTokens: 20, totalTokens: 120, failed: false, questionCount: 10, replacedQuestions: 2 },
    { kind: "test", model: "gpt-x", promptVersion: "p1", inputTokens: 0, outputTokens: 0, totalTokens: 0, failed: true }
  ]);
  assert.equal(summary.tokens.recordsWithPositiveUsage, 1);
  assert.equal(summary.tokens.recordsWithAmbiguousZeroOrMissingUsage, 1);
  assert.equal(summary.tokens.total, 120);
  assert.equal(summary.tokens.estimatedCost, null);
  assert.equal(summary.outcome.succeeded, 1);
  assert.equal(summary.outcome.failed, 1);
  assert.equal(summary.repair.generatedQuestions, 10);
  assert.equal(summary.repair.replacedQuestions, 2);
});

test("feedback summary reports rated feedback but never invents an acceptance rate", () => {
  const summary = summarizeTeacherFeedback([
    { category: "ai_question", verdict: "good", promptVersion: "p1" },
    { category: "ai_question", verdict: "bad", reason: "ambiguous", promptVersion: "p1" },
    { category: "ai_question", reviewOutcome: "false_positive", reviewerReason: "incorrect" }
  ], { truncated: true });
  assert.equal(summary.ratedFeedbackCount, 2);
  assert.equal(summary.verdicts.good, 1);
  assert.equal(summary.verdicts.bad, 1);
  assert.equal(summary.badReasons.ambiguous, 1);
  assert.equal(summary.reviewerOutcomes.false_positive, 1);
  assert.equal(summary.acceptanceRate, null);
  assert.equal(summary.truncated, true);
});
