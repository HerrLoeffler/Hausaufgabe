import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("./gate-e-load-test.mjs", import.meta.url), "utf8");
const tour = await readFile(new URL("../gradecrew-tour-v8.js", import.meta.url), "utf8");

test("Gate E runner is fail-closed to staging and bounded", () => {
  assert.match(source, /const PROJECT_ID = "hausaufgabe-staging"/);
  assert.match(source, /const REGION = "europe-west1"/);
  assert.match(source, /const MAX_PARTICIPANTS = 50/);
  assert.match(source, /const DEFAULT_PARTICIPANTS = 30/);
  assert.doesNotMatch(source, /PROJECT_ID\s*=\s*"hausaufgabe-40294"/);
  assert.match(source, /startMode !== "student"/);
});

test("Gate E verifies concurrency, idempotency and solution boundaries", () => {
  assert.match(source, /startAssessmentAttempt/);
  assert.match(source, /resumeAssessmentAttempt/);
  assert.match(source, /submitAssessmentAttempt/);
  assert.match(source, /getAssessmentReceipt/);
  assert.match(source, /Promise\.all\(\[\s*call\("submitAssessmentAttempt"/s);
  assert.match(source, /non-idempotent-receipt/);
  assert.match(source, /early-solutions/);
  assert.match(source, /state-only-paper-leak/);
  assert.match(source, /solution-leak/);
  assert.match(source, /uniqueAttemptIds/);
});

test("Gate E report contains latency and payload evidence without participant secrets", () => {
  assert.match(source, /latencyMs: metricSummary\(latencies\)/);
  assert.match(source, /responsePayloads: sizeSummary\(responseSizes\)/);
  assert.match(source, /maxPaperBytes/);
  const participantReport = source.match(/participants: active\.map\([\s\S]*?\n    \}\)\)/)?.[0] || "";
  assert.ok(participantReport, "participant report block missing");
  assert.doesNotMatch(participantReport, /attemptToken/);
  assert.doesNotMatch(participantReport, /clientAttemptId/);
});

test("iPad tutorial fallback waits, targets only the submitted practice result and never saves grading", () => {
  assert.match(tour, /tutorialSubmissionId/);
  assert.match(tour, /20_000/);
  assert.match(tour, /#resultsTableWrap \.reviewBtn/);
  assert.match(tour, /node\.dataset\.id === tutorialSubmissionId/);
  assert.match(tour, /button\.click\(\)/);
  assert.match(tour, /event === "review-opened" \|\| event === "review-saved"/);
  assert.doesNotMatch(tour, /saveReview\(/);
});
