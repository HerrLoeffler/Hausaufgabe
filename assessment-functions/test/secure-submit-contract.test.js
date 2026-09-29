"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const main = fs.readFileSync(require.resolve("../main.js"), "utf8");
const lifecycle = fs.readFileSync(require.resolve("../lib/secure-lifecycle.js"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

test("firebase package entrypoint is exactly the hardened lifecycle", () => {
  assert.equal(pkg.main, "main.js");
  assert.match(main, /module\.exports = require\("\.\/lib\/secure-lifecycle"\)/);
  assert.doesNotMatch(main, /require\("\.\/index"\)/);
});

test("authoritative lifecycle reads current quiz state inside submit transaction", () => {
  const submit = lifecycle.slice(lifecycle.indexOf("exports.submitAssessmentAttempt"), lifecycle.indexOf("exports.getAssessmentReceipt"));
  assert.match(submit, /const quizSnap = await tx\.get\(quizRef\)/);
  assert.match(submit, /validateQuizOpen\(quiz\)/);
  assert.match(submit, /assertSameRun\(attempt, quiz, quizId\)/);
  assert.match(submit, /decodeSubmissionAnswersFromShape/);
  assert.match(submit, /answers: teacherAnswers/);
  assert.doesNotMatch(submit, /answers:\s*secureAnswers/);
});

test("authoritative submit is idempotent and removes live grading secrets", () => {
  const submit = lifecycle.slice(lifecycle.indexOf("exports.submitAssessmentAttempt"), lifecycle.indexOf("exports.getAssessmentReceipt"));
  assert.match(submit, /existingSubmission\.exists \|\| attempt\.status === "submitted"/);
  assert.match(submit, /tx\.create\(sRef, submission\)/);
  assert.match(submit, /status: "submitted"/);
  assert.match(submit, /gradingKey: FieldValue\.delete\(\)/);
  assert.match(submit, /decoderShape: FieldValue\.delete\(\)/);
  assert.match(submit, /paperSecret: FieldValue\.delete\(\)/);
  assert.match(submit, /authoringFingerprint: FieldValue\.delete\(\)/);
});

test("client-supplied grade fields cannot enter the stored submission", () => {
  const submit = lifecycle.slice(lifecycle.indexOf("exports.submitAssessmentAttempt"), lifecycle.indexOf("exports.getAssessmentReceipt"));
  assert.match(submit, /gradeSubmission\(gradingKey, secureAnswers\)/);
  assert.doesNotMatch(submit, /request\.data\?\.(?:totalPoints|maxPoints|percent|grade|grading)/);
});

test("receipt visibility follows the snapshotted GradeCrew result mode", () => {
  assert.match(lifecycle, /RESULT_MODES = new Set\(\["none", "points", "points_percent", "points_grade"\]\)/);
  assert.match(lifecycle, /\["points", "points_percent", "points_grade"\]\.includes\(mode\)/);
  assert.match(lifecycle, /\["points_percent", "points_grade"\]\.includes\(mode\)/);
  assert.match(lifecycle, /mode === "points_grade"/);
  assert.match(lifecycle, /resultMode = normalizeResultMode\(attempt\.resultMode\)/);
});
