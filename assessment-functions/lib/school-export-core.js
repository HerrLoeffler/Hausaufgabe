"use strict";

const { gradeFromPercent } = require("./assessment-core");

function millis(value) {
  if (value == null) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const date = Date.parse(value);
  return Number.isFinite(date) ? date : null;
}

function validateCorrection(questions, points, submission) {
  if (!Array.isArray(questions) || !questions.length || !points || typeof points !== "object" || Array.isArray(points)) throw Error("Ungültige Punkte.");
  const ids = questions.map(q => String(q.id));
  if (new Set(ids).size !== ids.length || Object.keys(points).length !== ids.length || ids.some(id => !Object.hasOwn(points, id))) throw Error("Ungültige Punkte.");
  const grading = { ...(submission.grading || {}) };
  let totalPoints = 0, maxPoints = 0;
  for (const q of questions) {
    const max = Number(q.points);
    const awarded = points[q.id];
    if (!Number.isFinite(max) || max < 0 || typeof awarded !== "number" || !Number.isFinite(awarded) || awarded < 0 || awarded > max || awarded * 2 !== Math.round(awarded * 2)) throw Error("Ungültige Punkte.");
    grading[q.id] = { ...(grading[q.id] || {}), awardedPoints: awarded, maxPoints: max, needsReview: false };
    totalPoints += awarded;
    maxPoints += max;
  }
  totalPoints = Math.round(totalPoints * 10) / 10;
  maxPoints = Math.round(maxPoints * 10) / 10;
  const percent = maxPoints ? Math.round(totalPoints / maxPoints * 100) : 0;
  const scale = submission.gradeScaleSnapshot;
  if (!Array.isArray(scale?.thresholds) || scale.thresholds.length !== 6) throw Error("Notenschlüssel fehlt.");
  return { grading, totalPoints, maxPoints, percent, grade: gradeFromPercent(percent, scale.thresholds), gradeScaleSnapshot: scale, status: "graded" };
}

function buildExportRecord({ quizId, submissionId, quiz, submission, questions, events, exportedAtMillis }) {
  const gaps = [];
  const missing = (field, reason = "not-recorded") => gaps.push({ field, reason });
  if (!millis(submission.submittedAt)) missing("submittedAtServer");
  if (submission.startedAtServerMillis == null || !Number.isFinite(Number(submission.startedAtServerMillis))) missing("startedAtServer");
  if (!submission.secureAssessmentVersion) missing("secureAssessmentVersion");
  const frozen = questions.length > 0 && questions.every(q => q.source === "submission-snapshot");
  if (!frozen) missing("questionSnapshot", questions.length ? submission.questionSnapshotMissingReason || "historical-snapshot-not-recorded-or-incomplete" : "no-question-recorded");
  missing("aiSuggestions");
  if (!events.length) missing("manualCorrectionHistory", "no-event-recorded");
  return {
    schema: "gradecrew.school-work-export", schemaVersion: 1,
    exportedAtMillis, quiz: { id: quizId, title: quiz.title || "Test", subject: quiz.subject || null, contentLocale: quiz.contentLocale || "de-DE" },
    submission: {
      id: submissionId, studentName: submission.studentName || "", classroom: submission.classroom || null,
      answers: submission.answers || {}, grading: submission.grading || {}, totalPoints: submission.totalPoints ?? null,
      maxPoints: submission.maxPoints ?? null, percent: submission.percent ?? null, grade: submission.grade ?? null,
      gradeScaleSnapshot: submission.gradeScaleSnapshot || null, status: submission.status || null,
      submittedAtMillis: millis(submission.submittedAt), startedAtServerMillis: submission.startedAtServerMillis != null && Number.isFinite(Number(submission.startedAtServerMillis)) ? Number(submission.startedAtServerMillis) : null,
      elapsedSeconds: submission.elapsedSeconds ?? null, reviewedAtMillis: millis(submission.reviewedAt),
      reviewedBy: submission.reviewedBy || null, secureAssessmentVersion: submission.secureAssessmentVersion || null,
      schoolReviewLastKind: submission.schoolReviewLastKind || null,
      questionSnapshotVersion: submission.questionSnapshotVersion || null, questionSnapshotCount: submission.questionSnapshotCount ?? null,
      questionSnapshotMissingReason: submission.questionSnapshotMissingReason || null,
      autoPoints: submission.autoPoints ?? null, secureAnswerDigest: submission.secureAnswerDigest || null,
      sessionRunId: submission.sessionRunId || null, startMode: submission.startMode || null,
      timeLimitMinutes: submission.timeLimitMinutes ?? null, lateSeconds: submission.lateSeconds ?? null,
      autoSubmitted: submission.autoSubmitted === true, recoveryReviewRequired: submission.recoveryReviewRequired === true,
      recoveryReason: submission.recoveryReason || null
    },
    questions: questions.map(q => ({ id: q.id, source: q.source === "current-authoring" ? "current-authoring-unverified" : q.source || "submission-snapshot", recordedAtMillis: q.recordedAtMillis ?? null, data: q.data })),
    events: events.map(event => ({ id: event.id, kind: event.kind || "review", undoOf: event.undoOf || null, atMillis: millis(event.atMillis ?? event.at), sequence: event.sequence ?? null, actorUid: event.actorUid, reason: event.reason, before: event.before, after: event.after })),
    gaps
  };
}

module.exports = { millis, validateCorrection, buildExportRecord };
