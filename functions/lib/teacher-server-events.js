"use strict";
function quizTransitions(before = {}, after = {}) {
  const events = [];
  if (after.generationStatus === "ready" && before.generationStatus !== "ready") events.push("test_ready");
  if (after.published === true && before.published !== true && !after.rightsHold && !after.isDeleted) events.push("test_published");
  return events;
}
function jobTransition(before, after) {
  if (before === after) return null;
  return {running: "generation_started", ready: "generation_completed", failed: "generation_failed"}[after] || null;
}
function usageMetric(data = {}) {
  const result = {};
  for (const key of ["inputTokens", "outputTokens", "totalTokens"]) result[key] = Number.isSafeInteger(data[key]) && data[key] >= 0 && data[key] <= 10000000 ? data[key] : 0;
  result.cacheHit = data.cacheHit === true;
  return result;
}
module.exports = {quizTransitions, jobTransition, usageMetric};
