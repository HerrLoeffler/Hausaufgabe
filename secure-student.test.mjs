import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const js = fs.readFileSync("secure-student.js", "utf8");
const html = fs.readFileSync("secure-student.html", "utf8");

test("secure student page uses only the assessment callable client, never Firestore", () => {
  assert.match(js, /createSecureAssessmentClient/);
  assert.doesNotMatch(js, /firebase-firestore\.js|\bgetFirestore\b|\bgetDocs\b|\baddDoc\b|\bsetDoc\b|\bupdateDoc\b|\bonSnapshot\b/);
  assert.match(html, /secure-student\.js/);
});

test("secure student renderer supports every GradeCrew assessment question type", () => {
  for (const type of ["single", "multi", "text", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords", "number"]) {
    assert.match(js, new RegExp(`["']${type}["']`), `missing secure renderer/collector for ${type}`);
  }
});

test("secure student never evaluates answers or sends trusted score fields", () => {
  assert.doesNotMatch(js, /evaluateAnswer|gradeFromPercent|correctOptionIds|acceptedAnswers|numericAnswer|targetWords|acceptedOrders|gradingKey|paperSecret/);
  const submitBlock = js.slice(js.indexOf("async function submitAssessment"), js.indexOf("async function restoreOrShowIntro"));
  assert.match(submitBlock, /api\.submit/);
  assert.doesNotMatch(submitBlock, /totalPoints\s*:|maxPoints\s*:|percent\s*:|grade\s*:|grading\s*:/);
});

test("teacher-controlled flow waits for the server and timed flow uses server deadline", () => {
  assert.match(js, /api\.resume\(quizId\)/);
  assert.match(js, /response\.status === "ready"/);
  assert.match(js, /response\.deadlineAtMillis/);
  assert.match(js, /submitAssessment\(true\)/);
});

test("answers survive reload only inside the browser tab and are cleared after receipt", () => {
  assert.match(js, /sessionStorage\.setItem/);
  assert.match(js, /sessionStorage\.removeItem/);
  assert.doesNotMatch(js, /localStorage\.setItem\([^\n]*answers/);
});
