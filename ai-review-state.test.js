import test from "node:test";
import assert from "node:assert/strict";
import { isAiReviewPending, shouldShowAiJob } from "./ai-review-state.js";

const readyJob = { status: "ready", quizId: "TEST1234" };
const readyQuiz = { id: "TEST1234", generationJobId: "JOB123", generationStatus: "ready", published: false };

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
