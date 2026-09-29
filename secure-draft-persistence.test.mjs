import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("secure-draft-persistence.js", "utf8");
const clientSource = fs.readFileSync("secure-assessment-client.js", "utf8");

test("persistent draft is scoped to canonical quiz and attempt and expires", () => {
  assert.match(source, /gradecrew_secure_answers_persist/);
  assert.match(source, /normalizeQuizId/);
  assert.match(source, /toUpperCase\(\)\.replace\(\/\[\^A-Z0-9\]\/g, ""\)/);
  assert.match(source, /attemptId/);
  assert.match(source, /MAX_AGE_MS = 12 \* 60 \* 60 \* 1000/);
  assert.match(source, /clearExpiredDrafts/);
});

test("draft restore uses the exact secure client credential version", () => {
  const clientVersion = clientSource.match(/const STORAGE_VERSION = "([^"]+)"/)?.[1];
  const draftVersion = source.match(/const SESSION_VERSION = "([^"]+)"/)?.[1];
  assert.ok(clientVersion, "secure client storage version missing");
  assert.equal(draftVersion, clientVersion);
  assert.match(source, /normalizeQuizId\(value\.quizId\) !== quizId/);
});

test("persistent draft contains answers only and never solution or grading material", () => {
  const writeBlock = source.slice(source.indexOf("function persistCurrentDraft"), source.indexOf("function clearCurrentPersistentDraft"));
  assert.match(writeBlock, /answers/);
  assert.doesNotMatch(writeBlock, /gradingKey|solutionSnapshot|paperSecret|correctOptionIds|grade:|percent:|totalPoints/);
});

test("successful result removes persistent draft", () => {
  assert.match(source, /clearCurrentPersistentDraft/);
  assert.match(source, /!result\.classList\.contains\("hidden"\)/);
});

test("module never opens a Firestore or Functions bypass", () => {
  assert.doesNotMatch(source, /firebase-firestore|firebase-functions|getFirestore|httpsCallable|addDoc|setDoc|updateDoc/);
});
