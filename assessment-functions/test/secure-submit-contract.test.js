"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const main = fs.readFileSync(require.resolve("../main.js"), "utf8");
const lifecycle = fs.readFileSync(require.resolve("../lib/secure-lifecycle.js"), "utf8");
const cleanup = fs.readFileSync(require.resolve("../lib/cleanup.js"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

test("firebase package entrypoint exports hardened lifecycle and cleanup only", () => {
  assert.equal(pkg.main, "main.js");
  assert.match(main, /require\("\.\/lib\/secure-lifecycle"\)/);
  assert.match(main, /require\("\.\/lib\/cleanup"\)/);
  assert.doesNotMatch(main, /require\("\.\/index"\)/);
  assert.match(cleanup, /cleanupAssessmentPrivateOnQuizDelete/);
  assert.match(cleanup, /collection\("assessmentPrivate"\)\.where\("quizId", "==", quizId\)/);
});

test("authoritative lifecycle reads current quiz state inside submit transaction", () => {
  const submit = lifecycle.slice(lifecycle.indexOf("exports.submitAssessmentAttempt"), lifecycle.indexOf("exports.getAssessmentReceipt"));
  assert.match(submit, /const quizSnap = await tx\.get\(quizRef\)/);
  assert.match(submit, /validateSubmissionWindow\(quiz, attempt, nowMillis\)/);
  assert.match(submit, /assertSameRun\(attempt, quiz, quizId\)/);
  assert.match(submit, /decodeSubmissionAnswersFromShape/);
  assert.match(submit, /answers: teacherAnswers/);
  assert.doesNotMatch(submit, /answers:\s*secureAnswers/);
});

test("teacher-end race has a narrow grace only for already-running attempts", () => {
  assert.match(lifecycle, /END_SUBMIT_GRACE_SECONDS = 90/);
  const policy = lifecycle.slice(lifecycle.indexOf("function validateSubmissionWindow"), lifecycle.indexOf("function sessionMode"));
  assert.match(policy, /quiz\.ended === true/);
  assert.match(policy, /attempt\?\.status === "running"/);
  assert.match(policy, /quiz\.endedAt/);
  assert.match(policy, /END_SUBMIT_GRACE_SECONDS \* 1000/);
  assert.match(policy, /quiz\.isDeleted === true/);
  assert.match(policy, /quiz\.rightsHold === true/);
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

test("private assessment payload fails clearly before Firestore's one MiB limit", () => {
  assert.match(lifecycle, /PRIVATE_PAYLOAD_SOFT_LIMIT_BYTES = 850_000/);
  assert.match(lifecycle, /Buffer\.byteLength\(JSON\.stringify\(value\), "utf8"\)/);
  assert.match(lifecycle, /assertPrivatePayloadSafe\(privateData\)/);
  assert.match(lifecycle, /Bitte teile ihn in zwei kürzere Tests/);
});

test("receipt visibility follows the snapshotted GradeCrew result mode", () => {
  assert.match(lifecycle, /RESULT_MODES = new Set\(\["none", "points", "points_percent", "points_grade"\]\)/);
  assert.match(lifecycle, /\["points", "points_percent", "points_grade"\]\.includes\(mode\)/);
  assert.match(lifecycle, /\["points_percent", "points_grade"\]\.includes\(mode\)/);
  assert.match(lifecycle, /mode === "points_grade"/);
  assert.match(lifecycle, /resultMode = normalizeResultMode\(attempt\.resultMode\)/);
});

test("solutions are never released from trash or rights-hold state", () => {
  const receipt = lifecycle.slice(lifecycle.indexOf("function makeReceipt"), lifecycle.indexOf("function contractForQuestions"));
  assert.match(receipt, /quiz\?\.ended === true/);
  assert.match(receipt, /quiz\?\.isDeleted !== true/);
  assert.match(receipt, /quiz\?\.rightsHold !== true/);
  assert.match(receipt, /Array\.isArray\(privateData\?\.solutionSnapshot\)/);
});
