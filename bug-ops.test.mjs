import test from "node:test";
import assert from "node:assert/strict";
import { buildBugIncidents, bugOpsOverview, guardianIncidentPayload } from "./bug-ops.mjs";

function row(id, overrides = {}) {
  return {
    id,
    category: "app_error",
    fingerprint: "F-1",
    errorCode: "APP-UNEXPECTED-001",
    action: "render_card",
    userId: "u-" + id,
    status: "new",
    environment: "production",
    severity: "warning",
    createdAt: 1000,
    technicalDetails: { occurrences: 1, diagnostics: { release: { commit: "a".repeat(40) } } },
    ...overrides
  };
}

test("same fingerprint becomes one incident with distinct reporters and occurrences", () => {
  const incidents = buildBugIncidents([row("1"), row("2", { technicalDetails: { occurrences: 4 } })]);
  assert.equal(incidents.length, 1);
  assert.equal(incidents[0].reports, 2);
  assert.equal(incidents[0].occurrences, 5);
  assert.equal(incidents[0].uniqueReporters, 2);
});

test("large production cluster escalates to P0 and immediate notification", () => {
  const rows = Array.from({ length: 20 }, (_, i) => row(String(i), { technicalDetails: { occurrences: 3 } }));
  const [incident] = buildBugIncidents(rows);
  assert.equal(incident.priority, "P0");
  assert.equal(incident.notification, "immediate");
});

test("security and assessment signals are never autopilot candidates", () => {
  const [incident] = buildBugIncidents([row("1", { action: "assessment_submit" })]);
  assert.equal(incident.risk, "red");
  assert.equal(incident.autopilot, "blocked");
});

test("new report after recorded fix is a regression and immediate", () => {
  const fixed = row("old", { status: "done", createdAt: 1000, updatedAt: 2000, resolution: { fixCommit: "abc" } });
  const again = row("new", { createdAt: 3000 });
  const [incident] = buildBugIncidents([fixed, again]);
  assert.equal(incident.regressionAfterFix, true);
  assert.equal(incident.notification, "immediate");
});

test("overview counts decision inbox without exposing identities", () => {
  const incidents = buildBugIncidents([row("1"), row("2", { fingerprint: "F-2", environment: "staging" })]);
  const overview = bugOpsOverview(incidents);
  assert.equal(overview.total, 2);
  const payload = guardianIncidentPayload(incidents[0]);
  assert.equal("userId" in payload, false);
  assert.equal("message" in payload, false);
  assert.deepEqual(payload.releases, ["a".repeat(40)]);
});
