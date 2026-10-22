"use strict";
// Match the existing assessment deadline: common start plus the normalized limit.
// No limit means the teacher intentionally keeps the round open.
function commonDeadlineExpired(quiz, now) {
  if (quiz.startMode !== "teacher" || quiz.sessionState !== "running") return false;
  const started = typeof quiz.sessionStartedAt?.toMillis === "function"
    ? quiz.sessionStartedAt.toMillis() : Number(quiz.sessionStartedAt) || 0;
  const raw = Number(quiz.timeLimitMinutes);
  const minutes = Number.isFinite(raw) && raw > 0 ? Math.min(300, Math.round(raw)) : 0;
  return Boolean(started && minutes && now >= started + minutes * 60000);
}
module.exports = {commonDeadlineExpired};
