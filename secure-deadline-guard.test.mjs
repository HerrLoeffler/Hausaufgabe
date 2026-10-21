import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("secure-deadline-guard.js", "utf8");

test("deadline guard freezes one immutable answer snapshot at 00:00", () => {
  assert.match(source, /frozenAnswers\s*=\s*cloneSnapshot\(captureAnswers\(\)\)/);
  assert.match(source, /form\.inert\s*=\s*true/);
  assert.match(source, /control\.disabled\s*=\s*true/);
  assert.match(source, /00:00/);
  assert.match(source, /handleDeadline\(\)/);
});

test("deadline retry submits only the frozen snapshot and marks it auto-submitted", () => {
  const retryBlock = source.slice(source.indexOf("async function submitFrozenSnapshot"), source.indexOf("function handleDeadline"));
  assert.match(retryBlock, /api\.submit\(quizId, frozenAnswers, \{ autoSubmitted: true \}\)/);
  assert.doesNotMatch(retryBlock, /captureAnswers\(/);
  assert.match(retryBlock, /error\?\.code === "unavailable"/);
});

test("deadline guard remains callable-only and never opens a Firestore bypass", () => {
  assert.match(source, /createSecureAssessmentClient/);
  assert.doesNotMatch(source, /firebase-firestore\.js|\bgetFirestore\b|\bgetDocs\b|\baddDoc\b|\bsetDoc\b|\bupdateDoc\b/);
});
