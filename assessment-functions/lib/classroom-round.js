"use strict";
function commonTiming(quiz) {
  const startedAt = quiz.startMode === "teacher"
    ? (typeof quiz.sessionStartedAt?.toMillis === "function" ? quiz.sessionStartedAt.toMillis() : Number(quiz.sessionStartedAt) || 0) : 0;
  const raw = Number(quiz.timeLimitMinutes);
  const minutes = Number.isFinite(raw) && raw > 0 ? Math.min(300, Math.round(raw)) : 0;
  return {startedAt: startedAt || null, deadlineAt: startedAt && minutes ? startedAt + minutes * 60000 : null};
}
// Same common start and normalized limit as the existing assessment lifecycle.
function commonDeadlineExpired(quiz, now) {
  const deadline = commonTiming(quiz).deadlineAt;
  return quiz.sessionState === "running" && deadline !== null && now >= deadline;
}
function roundDetails(quiz, now, sameRun = true) {
  const timing = commonTiming(quiz || {});
  const open = quiz && sameRun && quiz.published && !quiz.ended && !quiz.isDeleted && !quiz.rightsHold && !commonDeadlineExpired(quiz, now);
  const startMode = quiz?.startMode === "teacher" ? "teacher" : "student";
  const state = !open ? "closed" : startMode === "student" ? "open" : ["waiting", "running"].includes(quiz.sessionState) ? quiz.sessionState : "closed";
  return {state, startMode, ...timing, serverNow: now};
}
module.exports = {commonDeadlineExpired, roundDetails};
