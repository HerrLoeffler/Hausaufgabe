// An AI job describes creation; the quiz records whether its review reminder is done.
export function isAiReviewPending(quiz) {
  return Boolean(quiz?.generationJobId && quiz.generationStatus === "ready"
    && !quiz.published && !quiz.aiReviewAcknowledgedAt && !quiz.isDeleted);
}

export function shouldShowAiJob(job, quiz, notice) {
  // A notice never hides work that is still running or a later successful result.
  if (["queued", "running"].includes(job.status)) return true;
  if (job.status === "failed") return !["reported", "dismissed"].includes(notice?.reason) && !quiz?.isDeleted;
  if (job.status !== "ready" || !quiz) return true;
  return !quiz.isDeleted && !quiz.published && !quiz.aiReviewAcknowledgedAt;
}
