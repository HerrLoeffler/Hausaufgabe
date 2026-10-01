"use strict";

function boundedKey(value, max = 80) {
  const text = String(value || "unknown").trim().slice(0, max);
  return text || "unknown";
}

function nonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function bump(target, key) {
  target[key] = Number(target[key] || 0) + 1;
}

function summarizeAiEvents(rows = [], { truncated = false } = {}) {
  const byKind = {};
  const byModel = {};
  const byPromptVersion = {};
  const outcome = { succeeded: 0, failed: 0, unknown: 0 };
  const tokens = {
    recordsWithPositiveUsage: 0,
    recordsWithAmbiguousZeroOrMissingUsage: 0,
    input: 0,
    output: 0,
    total: 0,
    semantics: "legacy-zero-may-mean-missing",
    estimatedCost: null,
    estimatedCostReason: "stored-events-do-not-contain-versioned-price-evidence"
  };
  const repair = {
    replacedQuestions: 0,
    questionRepairAttempts: 0,
    qualityReviewPasses: 0,
    generatedQuestions: 0,
    recordsWithRepairEvidence: 0
  };

  for (const raw of rows) {
    const row = raw && typeof raw === "object" ? raw : {};
    bump(byKind, boundedKey(row.kind, 30));
    bump(byModel, boundedKey(row.model));
    bump(byPromptVersion, boundedKey(row.promptVersion));

    if (row.failed === true) outcome.failed++;
    else if (row.failed === false) outcome.succeeded++;
    else outcome.unknown++;

    const input = nonNegativeNumber(row.inputTokens);
    const output = nonNegativeNumber(row.outputTokens);
    const total = nonNegativeNumber(row.totalTokens);
    const hasPositiveUsage = [input, output, total].some(value => value !== null && value > 0);
    if (hasPositiveUsage) {
      tokens.recordsWithPositiveUsage++;
      tokens.input += input || 0;
      tokens.output += output || 0;
      tokens.total += total || 0;
    } else {
      tokens.recordsWithAmbiguousZeroOrMissingUsage++;
    }

    let hasRepairEvidence = false;
    for (const [source, target] of [
      ["replacedQuestions", "replacedQuestions"],
      ["questionRepairAttempts", "questionRepairAttempts"],
      ["qualityReviewPasses", "qualityReviewPasses"],
      ["questionCount", "generatedQuestions"]
    ]) {
      const value = nonNegativeNumber(row[source]);
      if (value !== null) {
        repair[target] += value;
        hasRepairEvidence = true;
      }
    }
    if (hasRepairEvidence) repair.recordsWithRepairEvidence++;
  }

  return {
    schemaVersion: 1,
    source: "stored-ai-events",
    coverage: "stored-events-only",
    truncated: Boolean(truncated),
    eventCount: rows.length,
    byKind,
    byModel,
    byPromptVersion,
    outcome,
    tokens,
    repair
  };
}

function summarizeTeacherFeedback(rows = [], { truncated = false } = {}) {
  const verdicts = { good: 0, bad: 0, other: 0 };
  const badReasons = {};
  const byPromptVersion = {};
  const reviewerOutcomes = {};
  let rated = 0;

  for (const raw of rows) {
    const row = raw && typeof raw === "object" ? raw : {};
    if (row.category && row.category !== "ai_question") continue;
    if (row.verdict === "good" || row.verdict === "bad") {
      verdicts[row.verdict]++;
      rated++;
      bump(byPromptVersion, boundedKey(row.promptVersion));
      if (row.verdict === "bad") bump(badReasons, boundedKey(row.reason, 40));
    } else {
      verdicts.other++;
    }
    if (row.reviewOutcome) bump(reviewerOutcomes, boundedKey(row.reviewOutcome, 40));
  }

  return {
    schemaVersion: 1,
    source: "teacher-ai-question-feedback",
    coverage: "submitted-feedback-only",
    truncated: Boolean(truncated),
    feedbackCount: rows.length,
    ratedFeedbackCount: rated,
    verdicts,
    badReasons,
    byPromptVersion,
    reviewerOutcomes,
    acceptanceRate: null,
    acceptanceRateReason: "no-complete-generation-to-feedback-and-use-denominator"
  };
}

module.exports = { summarizeAiEvents, summarizeTeacherFeedback };
