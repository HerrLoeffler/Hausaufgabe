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

export function parseStoredQualityIssue(value) {
  if (!value) return null;
  if (typeof value === "object" && Number.isInteger(Number(value.questionPosition)) && Number(value.questionPosition) > 0) {
    return { questionPosition: Number(value.questionPosition), questionId: String(value.questionId || ""),
      reviewKey: String(value.reviewKey || ""), reason: String(value.reason || "other"),
      detail: String(value.detail || "").replace(/^[a-z_]+:\s*/i, "").trim() };
  }
  if (typeof value !== "string") return null;
  const match = value.replace(/^KI-Qualitätsprüfung:\s*/i, "").trim()
    .match(/^Aufgabe\s+(\d+):\s*(?:(incorrect|answer_leak|image_mismatch|ambiguous|duplicate|multiple):\s*)?(.*)$/i);
  return match && Number(match[1]) > 0 ? { questionPosition: Number(match[1]), questionId: "", reviewKey: "", reason: match[2] || "other", detail: match[3].trim() } : null;
}

// A content version for editor conflict detection; not an authentication token.
export function questionReviewKey(question) {
  const fields = ["type", "text", "options", "correctBoolean", "acceptedAnswers", "manualReview", "numericAnswer", "unit", "tolerance", "pairs", "items", "groups", "passage", "targetWords", "imageDataUrl", "imageUrl", "imageAlt"];
  const text = JSON.stringify(fields.map(key => question?.[key] ?? null));
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

export function buildQualityReviewReport(quiz, code, questions = []) {
  if (!quiz || quiz.aiReviewAcknowledgedAt || quiz.published) return null;
  const structured = (Array.isArray(quiz.qualityIssues) ? quiz.qualityIssues : []).map(parseStoredQualityIssue).filter(Boolean);
  const warnings = Array.isArray(quiz.qualityWarnings) ? quiz.qualityWarnings : [];
  const seen = new Set();
  const issues = [...structured, ...warnings.map(parseStoredQualityIssue).filter(Boolean)].filter(issue => {
    const key = `${issue.questionPosition}:${issue.reason}:${issue.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(issue => {
    const question = issue.questionId ? questions.find(q => q.id === issue.questionId) : questions[issue.questionPosition - 1];
    return { ...issue, questionId: issue.questionId || question?.id || "", reviewKey: issue.reviewKey || (question ? questionReviewKey(question) : "") };
  });
  const generalWarnings = warnings.filter(warning => !parseStoredQualityIssue(warning));
  if (!issues.length && !generalWarnings.length && !isAiReviewPending(quiz)) return null;
  return { quizId: code, issues, warnings: generalWarnings, repairs: [] };
}

export function currentQualityIssues(issues, questions) {
  return (issues || []).flatMap(issue => {
    const index = questions.findIndex(question => question.id === issue.questionId);
    if (index < 0) return [];
    return [{ ...issue, questionPosition: index + 1, changed: Boolean(issue.reviewKey && issue.reviewKey !== questionReviewKey(questions[index])) }];
  }).sort((a, b) => a.questionPosition - b.questionPosition);
}

export function editorQuestionIndex(state, { quizId, uid, questionId, reviewKey }) {
  if (state.currentQuiz?.id !== quizId || state.user?.uid !== uid || (state.currentQuiz.published && !state.currentQuiz.ended)) return -1;
  return state.questions.findIndex(q => q.id === questionId && (!reviewKey || questionReviewKey(q) === reviewKey));
}
