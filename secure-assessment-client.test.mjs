import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("secure-assessment-client.js", "utf8");

test("secure assessment client uses callable functions and never imports Firestore", () => {
  assert.match(source, /firebase-functions\.js/);
  assert.doesNotMatch(source, /firebase-firestore\.js/);
  assert.doesNotMatch(source, /\bgetFirestore\b|\bgetDocs\b|\baddDoc\b|\bsetDoc\b|\bupdateDoc\b/);
  for (const name of [
    "getAssessmentInfo",
    "startAssessmentAttempt",
    "resumeAssessmentAttempt",
    "submitAssessmentAttempt",
    "getAssessmentReceipt"
  ]) assert.match(source, new RegExp(`httpsCallable\\(functions, ["']${name}["']\\)`));
});

test("browser stores only its opaque attempt credential, never grading material", () => {
  assert.match(source, /clientAttemptId/);
  assert.match(source, /attemptToken/);
  assert.doesNotMatch(source, /gradingKey|paperSecret|correctOptionIds|acceptedAnswers|numericAnswer|correctBoolean|targetWords|acceptedOrders/);
});

test("submission sends answers but never client-computed points, grade or grading", () => {
  const submitBlock = source.slice(source.indexOf("async function submit("), source.indexOf("async function getReceipt("));
  assert.match(submitBlock, /answers:/);
  assert.match(submitBlock, /autoSubmitted:/);
  assert.doesNotMatch(submitBlock, /totalPoints|autoPoints|maxPoints|percent|grade:|grading:/);
});
