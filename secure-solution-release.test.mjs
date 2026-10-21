import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("secure-solution-release.js", "utf8");
const html = fs.readFileSync("secure-student.html", "utf8");
const lifecycle = fs.readFileSync("assessment-functions/lib/secure-lifecycle.js", "utf8");

test("solution UI uses only the token-protected receipt callable and never Firestore", () => {
  assert.match(source, /createSecureAssessmentClient/);
  assert.match(source, /api\.getReceipt\(quizId\)/);
  assert.doesNotMatch(source, /firebase-firestore\.js|\bgetFirestore\b|\bgetDocs\b|\bdoc\b|\bonSnapshot\b/);
  assert.match(html, /secure-solution-release\.js/);
});

test("student UI renders solutions only when server marks them released", () => {
  assert.match(source, /receipt\.solutionsReleased\s*&&\s*Array\.isArray\(receipt\.solutions\)/);
  assert.match(source, /bis zum Testende und dem Ablauf der kurzen Abgabe-Nachfrist geschützt/);
  assert.match(source, /Lösungsfreigabe prüfen/);
});

test("server release requires snapshotted teacher opt-in and ended quiz", () => {
  assert.match(lifecycle, /submission\?\.showSolutionsAfterEnd\s*===\s*true\s*&&\s*mode\s*!==\s*"none"/);
  assert.match(lifecycle, /configured\s*&&\s*quiz\?\.ended\s*===\s*true/);
  assert.match(lifecycle, /quiz\?\.isDeleted\s*!==\s*true/);
  assert.match(lifecycle, /quiz\?\.rightsHold\s*!==\s*true/);
  assert.match(lifecycle, /solutionSnapshot/);
  assert.doesNotMatch(source, /showSolutionsAfterEnd/);
});



test("released solution audio stays behind the same server gate and never autoplays", () => {
  assert.match(lifecycle, /async function attachReleasedSolutionAudio/);
  assert.match(lifecycle, /!receipt\?\.solutionsReleased/);
  assert.match(lifecycle, /solutionAudioDataUrl/);
  assert.match(source, /solution\.audio\?\.src/);
  assert.match(source, /audio\.controls = true/);
  assert.doesNotMatch(source, /\.autoplay\s*=\s*true|autoplay=/);
});
