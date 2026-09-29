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
  assert.doesNotMatch(quizzes, /ended/);
  assert.match(rules, /Join-Metadaten kommen ausschließlich über die/);
});

test("published students cannot read authoring question documents", () => {
  const questions = block("match /questions/{questionId}", "match /attempts/{attemptId}");
  assert.match(questions, /allow read: if ownsQuiz\(quizId\) \|\| quizShared\(quizId\) \|\| isAdmin\(\)/);
  assert.doesNotMatch(questions, /quizPublished|published\s*==\s*true/);
});

test("students cannot create or update attempts directly", () => {
  const attempts = block("match /attempts/{attemptId}", "match /submissions/{submissionId}");
  assert.match(attempts, /allow create, update: if false/);
  assert.match(attempts, /allow get, list, delete: if ownsQuiz\(quizId\) \|\| isAdmin\(\)/);
});

test("students cannot create submissions directly", () => {
  const submissions = block("match /submissions/{submissionId}", "match /assessmentPrivate/{privateId}");
  assert.match(submissions, /allow create: if false/);
  assert.match(submissions, /allow read, update, delete: if ownsQuiz\(quizId\) \|\| isAdmin\(\)/);
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
