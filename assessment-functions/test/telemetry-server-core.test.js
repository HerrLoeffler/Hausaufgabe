"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { summarizeServerOperations } = require("../lib/telemetry-server-core");

test("server summary keeps backend evidence separate and reports failure codes and latency", () => {
  const summary = summarizeServerOperations([
    { schemaVersion: 1, source: "server_operation", environment: "staging", action: "startAssessmentAttempt", status: "ok", code: "none", durationMs: 80 },
    { schemaVersion: 1, source: "server_operation", environment: "staging", action: "startAssessmentAttempt", status: "failed", code: "permission-denied", durationMs: 120 },
    { schemaVersion: 1, source: "client_reported", environment: "staging", action: "join", status: "failed", durationMs: 5 }
  ]);
  assert.equal(summary.records, 2);
  assert.equal(summary.operations.startAssessmentAttempt.count, 2);
  assert.equal(summary.operations.startAssessmentAttempt.ok, 1);
  assert.equal(summary.operations.startAssessmentAttempt.failed, 1);
  assert.equal(summary.operations.startAssessmentAttempt.p50Ms, 80);
  assert.equal(summary.operations.startAssessmentAttempt.p95Ms, 120);
  assert.equal(summary.failureCodes["permission-denied"], 1);
});
