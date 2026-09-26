// An AI job describes creation; the quiz records whether its review reminder is done.
export function isAiReviewPending(quiz) {
  return Boolean(quiz?.generationJobId && quiz.generationStatus === "ready"
    && !quiz.published && !quiz.aiReviewAcknowledgedAt && !quiz.isDeleted);
}

export function shouldShowAiJob(job, quiz) {
  if (job.status !== "ready" || !quiz) return true;
  return !quiz.isDeleted && !quiz.published && !quiz.aiReviewAcknowledgedAt;
}
