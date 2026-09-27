import test from "node:test";
import assert from "node:assert/strict";
import { isAiReviewPending, shouldShowAiJob, buildQualityReviewReport, currentQualityIssues, questionReviewKey, editorQuestionIndex } from "./ai-review-state.js";

const readyJob = { status: "ready", quizId: "TEST1234" };
const readyQuiz = { id: "TEST1234", generationJobId: "JOB123", generationStatus: "ready", published: false };

test("legacy warnings bind once to identity and follow reordered tasks through saving and reopening", () => {
  const questions = [{ id: "q1", text: "Erste", type: "truefalse", correctBoolean: false }, { id: "q2", text: "Zweite" }];
  const quiz = { ...readyQuiz, qualityWarnings: ["Aufgabe 1: incorrect: Lösung prüfen."] };
  const report = buildQualityReviewReport(quiz, quiz.id, questions);
  const moved = [questions[1], questions[0]];
  const issues = currentQualityIssues(report.issues, moved);
  assert.equal(issues[0].questionId, "q1");
  assert.equal(issues[0].questionPosition, 2);
  const saved = { ...quiz, qualityIssues: issues, qualityWarnings: ["Aufgabe 2: incorrect: Lösung prüfen."] };
  assert.equal(buildQualityReviewReport(saved, quiz.id, moved).issues.length, 1);
  assert.equal(currentQualityIssues(issues, [questions[1]]).length, 0);
});

test("editing content marks warnings stale without losing them; moving does not", () => {
  const q = { id: "q1", type: "truefalse", text: "Aussage", correctBoolean: false };
  const issue = { questionId: q.id, questionPosition: 1, reviewKey: questionReviewKey(q) };
  assert.equal(currentQualityIssues([issue], [{ ...q, position: 2 }])[0].changed, false);
  assert.equal(currentQualityIssues([issue], [{ ...q, correctBoolean: true }])[0].changed, true);
});

test("an async AI result follows identity and rejects changed content, accounts, tests and published quizzes", () => {
  const q = { id: "q1", text: "Frage", type: "text" };
  const target = { quizId: "quiz", uid: "teacher", questionId: q.id, reviewKey: questionReviewKey(q) };
  const state = { currentQuiz: { id: "quiz" }, user: { uid: "teacher" }, questions: [{ id: "other" }, q] };
  assert.equal(editorQuestionIndex(state, target), 1);
  for (const changed of [
    { questions: [{ ...q, text: "Meine Änderung" }] }, { questions: [] },
    { user: { uid: "someone-else" } }, { currentQuiz: { id: "other" } },
    { currentQuiz: { id: "quiz", published: true, ended: false } }
  ]) assert.equal(editorQuestionIndex({ ...state, ...changed }, target), -1);
});

test("a new AI draft prompts for review", () => {
  assert.equal(isAiReviewPending(readyQuiz), true);
  assert.equal(shouldShowAiJob(readyJob, readyQuiz), true);
});

test("review acknowledgement stays hidden when the quiz is loaded again", () => {
  const reloadedQuiz = { ...readyQuiz, aiReviewAcknowledgedAt: { seconds: 1790454000 } };
  assert.equal(isAiReviewPending(reloadedQuiz), false);
  assert.equal(shouldShowAiJob(readyJob, reloadedQuiz), false);
});

test("publishing or deleting a quiz removes its ready reminder", () => {
  for (const changed of [{ published: true }, { isDeleted: true }]) {
    const quiz = { ...readyQuiz, ...changed };
    assert.equal(isAiReviewPending(quiz), false);
    assert.equal(shouldShowAiJob(readyJob, quiz), false);
  }
});

test("running jobs and failed jobs remain visible for recovery", () => {
  const reviewedQuiz = { ...readyQuiz, aiReviewAcknowledgedAt: { seconds: 1790454000 } };
  assert.equal(shouldShowAiJob({ status: "running" }, reviewedQuiz), true);
  assert.equal(shouldShowAiJob({ status: "failed" }, reviewedQuiz), true);
});

test("reported and dismissed failures stay hidden after profile reload", () => {
  const failed = { status: "failed", quizId: readyQuiz.id };
  for (const reason of ["reported", "dismissed"]) {
    const savedNotice = JSON.parse(JSON.stringify({ reason, at: 1790454000 }));
    assert.equal(shouldShowAiJob(failed, readyQuiz, savedNotice), false);
    assert.equal(shouldShowAiJob(failed, undefined, savedNotice), false);
  }
  assert.equal(shouldShowAiJob(failed, readyQuiz), true);
});

test("acknowledgements never hide running work or a successful retry", () => {
  const notice = { reason: "reported" };
  for (const status of ["queued", "running", "ready"]) {
    assert.equal(shouldShowAiJob({ ...readyJob, status }, readyQuiz, notice), true);
  }
});

test("deleting a partial result hides its failed card without hiding other jobs", () => {
  assert.equal(shouldShowAiJob({ status: "failed" }, { isDeleted: true }), false);
  assert.equal(shouldShowAiJob({ status: "failed", sourceQuizId: "DELETED_SOURCE" }, undefined), true);
  assert.equal(shouldShowAiJob({ status: "failed" }, readyQuiz, { reason: "unknown" }), true);
});
