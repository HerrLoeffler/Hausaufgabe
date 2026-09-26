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
