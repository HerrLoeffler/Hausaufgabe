"use strict";
const EVENTS = new Set(["session_started", "activity_summary", "session_ended", "view_opened", "operation_finished", "feature_used"]);
const OPERATIONS = new Set(["none", "save", "publish", "results", "generate", "upload", "restore", "login", "tutorial"]);
const FEATURES = new Set(["none", "remy", "emmi", "coco", "upload", "image", "audio", "share", "duplicate", "manual_grade", "tutorial"]);
const VIEWS = new Set(["none", "dashboardView", "createView", "aiView", "editorView", "publishView", "resultsView", "settingsView"]);
const SERVER_EVENTS = new Set(["test_ready", "test_published", "submission_confirmed", "generation_started", "generation_completed", "generation_failed", "ai_usage_recorded"]);
function cleanTeacherEvent(input, now, {server = false} = {}) {
  const allowed = new Set(["id", "event", "release", "platform", "at", "elapsedMs", "activeMs", "foregroundAiWaitMs", "operation", "feature", "view", "outcome", "durationMs", "dropped"]);
  if (server) for (const key of ["entityId", "inputTokens", "outputTokens", "totalTokens", "cacheHit"]) allowed.add(key);
  if (!input || Array.isArray(input) || Object.keys(input).some(k => !allowed.has(k))) throw new TypeError("Unexpected telemetry fields");
  if (!/^[a-f0-9-]{36}$/.test(input.id) || !(EVENTS.has(input.event) || server && SERVER_EVENTS.has(input.event)) || !/^[a-f0-9]{40}$/.test(input.release)) throw new TypeError("Invalid event identity");
  if (!["web", "teacher_ios_web", ...(server ? ["server"] : [])].includes(input.platform) || !Number.isSafeInteger(input.at) || input.at <= 0 || input.at < now - 120000 || input.at > now + 10000) throw new TypeError("Invalid source or time");
  const output = { id: input.id, event: input.event, release: input.release, platform: input.platform, at: input.at };
  for (const key of ["elapsedMs", "activeMs", "foregroundAiWaitMs", "durationMs", "dropped"]) {
    const value = input[key] ?? 0;
    const max = key === "durationMs" ? 3600000 : key === "dropped" ? 10000 : 30000;
    if (!Number.isSafeInteger(value) || value < 0 || value > max) throw new TypeError("Invalid measurement");
    output[key] = value;
  }
  if (output.activeMs + output.foregroundAiWaitMs > output.elapsedMs) throw new TypeError("Overlapping time");
  for (const [key, values] of [["operation", OPERATIONS], ["feature", FEATURES], ["view", VIEWS]]) {
    const value = input[key] ?? "none";
    if (!values.has(value)) throw new TypeError("Invalid category");
    output[key] = value;
  }
  output.outcome = input.outcome ?? "none";
  if (!["none", "acknowledged", "failed", "cancelled"].includes(output.outcome)) throw new TypeError("Invalid outcome");
  if (server) {
    if (input.entityId !== undefined) {
      if (!/^[a-zA-Z0-9_-]{4,80}$/.test(input.entityId)) throw new TypeError("Invalid entity reference");
      output.entityId = input.entityId;
    }
    for (const key of ["inputTokens", "outputTokens", "totalTokens"]) {
      if (input[key] !== undefined) {
        if (!Number.isSafeInteger(input[key]) || input[key] < 0 || input[key] > 10000000) throw new TypeError("Invalid usage");
        output[key] = input[key];
      }
    }
    output.cacheHit = input.cacheHit === true;
  }
  return output;
}
function teacherChannel(profile, project) {
  if (!profile || profile.analyticsConsent !== true || !["teacher", "admin"].includes(profile.role) || profile.status && profile.status !== "active") return null;
  if (!["hausaufgabe-staging", "gradecrew-staging-2026"].includes(project)) return null;
  return project === "gradecrew-staging-2026" ? "synthetic" : profile.role === "admin" || profile.isTestAccount === true ? "internal" : "school";
}
function creditActivity(event, previous, now) {
  const budget = previous ? Math.min(30000, Math.max(0, now - previous.lastAt), event.elapsedMs) : 0;
  const activeMs = Math.min(event.activeMs, budget);
  return {activeMs, foregroundAiWaitMs: Math.min(event.foregroundAiWaitMs, budget - activeMs)};
}
module.exports = { cleanTeacherEvent, teacherChannel, creditActivity };
