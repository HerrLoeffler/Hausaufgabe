"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const main = fs.readFileSync(require.resolve("../main.js"), "utf8");
const submit = fs.readFileSync(require.resolve("../lib/secure-submit.js"), "utf8");

test("firebase entrypoint overrides the initial submit export with hardened handler", () => {
  assert.match(main, /const base = require\("\.\/index"\)/);
  assert.match(main, /require\("\.\/lib\/secure-submit"\)/);
  assert.match(main, /\.\.\.base/);
  assert.match(main, /submitAssessmentAttempt/);
});

test("authoritative submit decodes for teacher UI only after validating server-private paper mapping", () => {
  assert.match(submit, /assessmentPrivate/);
  assert.match(submit, /assertAttemptToken/);
  assert.match(submit, /buildAssessmentContract/);
  assert.match(submit, /sourceFingerprint/);
  assert.match(submit, /decodeSubmissionAnswers/);
  assert.match(submit, /answers: teacherAnswers/);
  assert.doesNotMatch(submit, /answers:\s*secureAnswers/);
});

test("authoritative submit is idempotent and removes live grading secrets", () => {
  assert.match(submit, /currentSubmissionSnap\.exists \|\| attempt\.status === "submitted"/);
  assert.match(submit, /tx\.create\(submissionRef, submission\)/);
  assert.match(submit, /status: "submitted"/);
  assert.match(submit, /gradingKey: FieldValue\.delete\(\)/);
  assert.match(submit, /paperSecret: FieldValue\.delete\(\)/);
  assert.match(submit, /sourceFingerprint: FieldValue\.delete\(\)/);
});

test("client-supplied grade fields cannot enter the stored submission", () => {
  assert.match(submit, /gradeSubmission\(privateData\.gradingKey, secureAnswers\)/);
  assert.doesNotMatch(submit, /request\.data\?\.(?:totalPoints|maxPoints|percent|grade|grading)/);
});
