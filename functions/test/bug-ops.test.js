"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  cleanBugReport,
  incidentIdForFingerprint,
  reporterMarkerId,
  classifyIncident,
  sourceVersion,
  safeIncidentSummary
} = require("../lib/bug-ops");

function report(overrides = {}) {
  return {
    category: "app_error",
    fingerprint: "abc1234",
    errorCode: "APP-UNEXPECTED-001",
    action: "render_card",
    userId: "teacher-1",
    status: "new",
    environment: "production",
    severity: "warning",
    appVersion: "2.3.1-gc28",
    createdAt: 1000,
    updatedAt: 1000,
    technicalDetails: {
      occurrences: 3,
      diagnostics: { release: { commit: "a".repeat(40) } }
    },
    ...overrides
  };
}

test("cleanBugReport keeps technical fields but no user identity or message", () => {
  const clean = cleanBugReport({ ...report(), message: "personal free text", email: "teacher@example.org" });
  assert.equal(clean.fingerprint, "abc1234");
  assert.equal(clean.occurrences, 3);
  assert.equal(clean.release, "a".repeat(40));
  assert.equal("userId" in clean, false);
  assert.equal("message" in clean, false);
  assert.equal("email" in clean, false);
  assert.match(clean.reporterMarker, /^[a-f0-9]{32}$/);
});

test("same fingerprint maps to stable incident id and reporter marker is incident-local", () => {
  assert.equal(incidentIdForFingerprint("same"), incidentIdForFingerprint("same"));
  assert.notEqual(reporterMarkerId("one", "u1"), reporterMarkerId("two", "u1"));
});

test("large production issue is P0 immediate", () => {
  const state = classifyIncident({
    uniqueReporters: 25, occurrences: 60, productionReports: 25,
    errorCodes: ["APP-UNEXPECTED-001"], actions: ["render_card"]
  });
  assert.equal(state.priority, "P0");
  assert.equal(state.notification, "immediate");
  assert.equal(state.needsAttention, true);
});

test("assessment, auth and rules incidents are blocked from autopilot", () => {
  for (const action of ["assessment_submit", "auth_login", "firestore_rules"]) {
    const state = classifyIncident({ uniqueReporters: 10, occurrences: 20, productionReports: 10, actions: [action] });
    assert.equal(state.risk, "red");
    assert.equal(state.autopilot, "blocked");
  }
});

test("staging verified issue becomes retest ready", () => {
  const state = classifyIncident({
    uniqueReporters: 1, occurrences: 1, productionReports: 0,
    actions: ["render_card"], automationStage: "staging_verified"
  });
  assert.equal(state.notification, "retest_ready");
  assert.equal(state.lifecycle, "retest_required");
});

test("sourceVersion changes only when incident-relevant report state changes", () => {
  const a = cleanBugReport(report());
  const b = cleanBugReport(report({ message: "different free text" }));
  assert.equal(sourceVersion(a), sourceVersion(b));
  const c = cleanBugReport(report({ status: "done" }));
  assert.notEqual(sourceVersion(a), sourceVersion(c));
});


test("safeIncidentSummary exposes only bounded technical incident fields", () => {
  const summary = safeIncidentSummary("bug-1", {
    priority: "P1",
    notification: "action_needed",
    lifecycle: "open",
    risk: "red",
    uniqueReporters: 7,
    occurrences: 19,
    lastSeenAtMs: 1234,
    errorCodes: ["APP-UNEXPECTED-001"],
    actions: ["render_card"],
    message: "raw customer text",
    email: "private@example.org",
    userId: "teacher-1"
  });
  assert.equal(summary.priority, "P1");
  assert.equal(summary.uniqueReporters, 7);
  assert.equal("message" in summary, false);
  assert.equal("email" in summary, false);
  assert.equal("userId" in summary, false);
});
