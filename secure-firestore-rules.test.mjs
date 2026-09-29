import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const rules = fs.readFileSync("firestore.secure-assessment.rules", "utf8");

function block(start, next) {
  const from = rules.indexOf(start);
  assert.ok(from >= 0, `missing block ${start}`);
  const to = next ? rules.indexOf(next, from + start.length) : rules.length;
  assert.ok(to > from, `missing end marker ${next}`);
  return rules.slice(from, to);
}

test("secure cutover removes anonymous quiz metadata reads", () => {
  const quizzes = block("match /quizzes/{quizId}", "match /questions/{questionId}");
  assert.match(quizzes, /allow get: if ownsQuiz\(quizId\) \|\| quizShared\(quizId\) \|\| isAdmin\(\)/);
  assert.doesNotMatch(quizzes, /published\s*==\s*true/);
  assert.match(rules, /Join-Metadaten kommen ausschließlich über die/);
});

test("published students cannot read authoring question documents", () => {
  const questions = block("match /questions/{questionId}", "match /attempts/{attemptId}");
  assert.match(questions, /allow read: if ownsQuiz\(quizId\) \|\| quizShared\(quizId\) \|\| isAdmin\(\)/);
  assert.doesNotMatch(questions, /quizPublished|published\s*==\s*true/);
});

test("active published assessment content is immutable to ordinary teacher clients", () => {
  assert.match(rules, /function quizContentEditable\(quizId\)/);
  assert.match(rules, /quiz\.get\('published', false\) != true \|\| quiz\.get\('ended', false\) == true/);
  const questions = block("match /questions/{questionId}", "match /attempts/{attemptId}");
  assert.match(questions, /allow create, update, delete: if quizContentEditable\(quizId\) \|\| isAdmin\(\)/);
});

test("active assessment lifecycle cannot be pushed back to an editable draft", () => {
  assert.match(rules, /function ownerQuizUpdateAllowed\(\)/);
  const lifecycle = block("function ownerQuizUpdateAllowed()", "match /users/{userId}");
  assert.match(lifecycle, /resource\.data\.get\('published', false\) == true/);
  assert.match(lifecycle, /resource\.data\.get\('ended', false\) == false/);
  assert.match(lifecycle, /affectedKeys\(\)\.hasOnly/);
  assert.match(lifecycle, /'sessionState'/);
  assert.match(lifecycle, /'endedAt'/);
  assert.match(lifecycle, /request\.resource\.data\.get\('published', false\) == true/);
  assert.match(lifecycle, /request\.resource\.data\.get\('ended', false\) == true/);
  const quizzes = block("match /quizzes/{quizId}", "match /questions/{questionId}");
  assert.match(quizzes, /&& ownerQuizUpdateAllowed\(\)/);
});

test("anonymous students cannot write attempts; only active owner self-test may create one", () => {
  assert.match(rules, /function ownerSelfTestAllowed\(quizId\)/);
  const attempts = block("match /attempts/{attemptId}", "match /submissions/{submissionId}");
  assert.match(attempts, /allow create: if ownerSelfTestAllowed\(quizId\)/);
  assert.match(attempts, /allow get, list, delete: if ownsQuiz\(quizId\) \|\| isAdmin\(\)/);
  assert.match(attempts, /allow update: if false/);
  assert.doesNotMatch(attempts, /quizPublished/);
});

test("anonymous students cannot create submissions; owner self-test remains narrowly available", () => {
  const submissions = block("match /submissions/{submissionId}", "match /assessmentPrivate/{privateId}");
  assert.match(submissions, /allow create: if ownerSelfTestAllowed\(quizId\)/);
  assert.match(submissions, /request\.resource\.data\.answers is map/);
  assert.doesNotMatch(submissions, /quizPublished/);
});

test("teacher review cannot rewrite original student answers or secure receipt metadata", () => {
  const submissions = block("match /submissions/{submissionId}", "match /assessmentPrivate/{privateId}");
  assert.match(submissions, /affectedKeys\(\)\.hasOnly/);
  for (const field of ["grading", "totalPoints", "maxPoints", "percent", "grade", "gradeScaleSnapshot", "status", "reviewedAt", "reviewedBy"]) {
    assert.match(submissions, new RegExp(`'${field}'`));
  }
  assert.doesNotMatch(submissions, /'answers'/);
  assert.doesNotMatch(submissions, /'attemptId'/);
  assert.doesNotMatch(submissions, /'secureAnswerDigest'/);
});

test("assessment secrets and rate limits are never client-readable or writable", () => {
  const privateBlock = block("match /assessmentPrivate/{privateId}", "match /assessmentRateLimits/{rateId}");
  const rateBlock = block("match /assessmentRateLimits/{rateId}", "match /announcements/{announcementId}");
  assert.match(privateBlock, /allow read, write: if false/);
  assert.match(rateBlock, /allow read, write: if false/);
});

test("legacy top-level submissions stay closed", () => {
  const legacy = block("match /submissions/{legacyId}", null);
  assert.match(legacy, /allow read, write: if false/);
});
