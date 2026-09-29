"use strict";

const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const {
  sha256,
  validAttemptToken,
  secureTokenMatches,
  buildAssessmentContract,
  gradeSubmission,
  gradeFromPercent,
  sanitizeAnswersForStorage,
  assertNoSolutionLeak
} = require("./assessment-core");
const { decodeSubmissionAnswers } = require("./teacher-answer-decoder");

const SUBMIT_GRACE_SECONDS = 30;
const callableOpts = {
  region: "europe-west1",
  timeoutSeconds: 60,
  memory: "256MiB",
  enforceAppCheck: false
};

function cleanQuizId(value) {
  const quizId = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{3,100}$/.test(quizId)) throw new HttpsError("invalid-argument", "Ungültiger Testcode.");
  return quizId;
}

function cleanAttemptId(value) {
  const id = String(value || "").trim();
  if (!/^a_[a-f0-9]{28}$/.test(id)) throw new HttpsError("invalid-argument", "Ungültiger Bearbeitungsversuch.");
  return id;
}

function cleanAttemptToken(value) {
  const token = String(value || "").trim();
  if (!validAttemptToken(token)) throw new HttpsError("invalid-argument", "Ungültiger Bearbeitungsschlüssel.");
  return token;
}

function toMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (Number.isFinite(Number(value))) return Number(value);
  return null;
}

function validateQuizOpen(quiz) {
  if (!quiz) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
  if (quiz.isDeleted === true) throw new HttpsError("not-found", "Dieser Test ist nicht verfügbar.");
  if (quiz.rightsHold === true) throw new HttpsError("failed-precondition", "Dieser Test ist vorübergehend gesperrt.");
  if (quiz.published !== true) throw new HttpsError("failed-precondition", "Dieser Test ist noch nicht veröffentlicht.");
  if (quiz.ended === true) throw new HttpsError("failed-precondition", "Dieser Test wurde beendet.");
}

function assertAttemptToken(privateData, token) {
  if (!secureTokenMatches(token, privateData?.tokenHash)) {
    throw new HttpsError("permission-denied", "Dieser Bearbeitungsversuch gehört nicht zu diesem Browser.");
  }
}

function assertSameRun(attempt, quiz) {
  if (attempt.mode !== "teacher") return;
  const currentRun = String(quiz.sessionRunId || "");
  const attemptRun = String(attempt.sessionRunId || "");
  if (!currentRun || !attemptRun || currentRun !== attemptRun) {
    throw new HttpsError("failed-precondition", "Für diesen Test wurde eine neue Runde gestartet. Bitte neu beitreten.");
  }
}

function deadlineMillis(attempt) {
  const direct = toMillis(attempt.deadlineAt);
  if (direct) return direct;
  const started = toMillis(attempt.startedAt);
  const minutes = Number(attempt.timeLimitMinutes);
  return started && minutes > 0 ? started + minutes * 60_000 : null;
}

function gradingScaleSnapshot(quiz) {
  const thresholds = Array.isArray(quiz.gradeScaleSnapshot?.thresholds) && quiz.gradeScaleSnapshot.thresholds.length === 6
    ? quiz.gradeScaleSnapshot.thresholds.map(Number)
    : [91, 77, 57, 39, 25, 0];
  return {
    id: String(quiz.gradeScaleSnapshot?.id || quiz.gradeScaleId || "standard").slice(0, 80),
    name: String(quiz.gradeScaleSnapshot?.name || "Standard").slice(0, 120),
    thresholds
  };
}

function makeReceipt(submission, quiz) {
  const mode = String(quiz?.resultMode || "points_grade");
  const receipt = {
    submissionId: submission.attemptId || submission.id || null,
    attemptId: submission.attemptId || null,
    status: submission.status,
    needsReview: submission.status === "review",
    resultMode: mode,
    submittedAtMillis: toMillis(submission.submittedAt),
    solutionsReleased: false
  };
  if (mode !== "none") {
    receipt.totalPoints = Number(submission.totalPoints) || 0;
    receipt.maxPoints = Number(submission.maxPoints) || 0;
    receipt.percent = Number(submission.percent) || 0;
  }
  if (["points_grade", "grade"].includes(mode)) receipt.grade = submission.grade ?? null;
  return receipt;
}

async function readQuestions(quizId) {
  const snap = await getFirestore().collection(`quizzes/${quizId}/questions`).orderBy("position").get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const submitAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const attemptId = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const autoSubmitted = request.data?.autoSubmitted === true;
  const db = getFirestore();
  const quizRef = db.doc(`quizzes/${quizId}`);
  const attemptRef = db.doc(`quizzes/${quizId}/attempts/${attemptId}`);
  const privateRef = db.doc(`assessmentPrivate/${quizId}_${attemptId}`);
  const submissionRef = db.doc(`quizzes/${quizId}/submissions/${attemptId}`);

  // Build the teacher-compatible display answers before the transaction. The
  // transaction below revalidates the same private fingerprint and paper secret
  // before these values are committed.
  const [quizSnap, attemptSnap, privateSnap, existingSnap] = await Promise.all([
    quizRef.get(), attemptRef.get(), privateRef.get(), submissionRef.get()
  ]);
  if (!quizSnap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
  if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
  const quiz = quizSnap.data();
  const initialAttempt = attemptSnap.data();
  const initialPrivate = privateSnap.data();
  assertAttemptToken(initialPrivate, token);
  if (existingSnap.exists || initialAttempt.status === "submitted") {
    if (!existingSnap.exists) throw new HttpsError("data-loss", "Die abgeschlossene Abgabe fehlt.");
    return { receipt: makeReceipt({ id: existingSnap.id, ...existingSnap.data() }, quiz) };
  }
  validateQuizOpen(quiz);
  assertSameRun(initialAttempt, quiz);
  if (!initialPrivate.paperSecret || !Array.isArray(initialPrivate.gradingKey)) {
    throw new HttpsError("data-loss", "Der serverseitige Bewertungsschlüssel fehlt.");
  }

  const questions = await readQuestions(quizId);
  const contract = buildAssessmentContract(questions, initialPrivate.paperSecret);
  assertNoSolutionLeak(contract.paper);
  if (contract.sourceFingerprint !== initialPrivate.sourceFingerprint) {
    throw new HttpsError("failed-precondition", "Der Test wurde während deiner Bearbeitung verändert. Bitte wende dich an deine Lehrkraft.");
  }
  const secureAnswers = sanitizeAnswersForStorage(initialPrivate.gradingKey, request.data?.answers);
  const teacherAnswers = decodeSubmissionAnswers(questions, secureAnswers, initialPrivate.paperSecret);
  const secureAnswerDigest = sha256(JSON.stringify(secureAnswers));

  let receipt;
  await db.runTransaction(async tx => {
    const currentAttemptSnap = await tx.get(attemptRef);
    const currentPrivateSnap = await tx.get(privateRef);
    const currentSubmissionSnap = await tx.get(submissionRef);
    if (!currentAttemptSnap.exists || !currentPrivateSnap.exists) {
      throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
    }
    const attempt = currentAttemptSnap.data();
    const privateData = currentPrivateSnap.data();
    assertAttemptToken(privateData, token);

    if (currentSubmissionSnap.exists || attempt.status === "submitted") {
      if (!currentSubmissionSnap.exists) throw new HttpsError("data-loss", "Die abgeschlossene Abgabe fehlt.");
      receipt = makeReceipt({ id: currentSubmissionSnap.id, ...currentSubmissionSnap.data() }, quiz);
      return;
    }

    validateQuizOpen(quiz);
    assertSameRun(attempt, quiz);
    if (attempt.status !== "running") throw new HttpsError("failed-precondition", "Der Test wurde für diesen Versuch noch nicht gestartet.");
    if (privateData.paperSecret !== initialPrivate.paperSecret || privateData.sourceFingerprint !== initialPrivate.sourceFingerprint) {
      throw new HttpsError("aborted", "Der Bearbeitungsversuch wurde gleichzeitig verändert. Bitte erneut abgeben.");
    }
    if (!Array.isArray(privateData.gradingKey)) throw new HttpsError("data-loss", "Der serverseitige Bewertungsschlüssel fehlt.");

    const deadlineAtMillis = deadlineMillis(attempt);
    const nowMillis = Date.now();
    if (deadlineAtMillis && nowMillis > deadlineAtMillis + SUBMIT_GRACE_SECONDS * 1000) {
      throw new HttpsError("deadline-exceeded", "Die serverseitige Abgabefrist ist abgelaufen. Bitte wende dich an deine Lehrkraft.");
    }

    const result = gradeSubmission(privateData.gradingKey, secureAnswers);
    const scale = attempt.gradeScaleSnapshot?.thresholds?.length === 6 ? attempt.gradeScaleSnapshot : gradingScaleSnapshot(quiz);
    const grade = result.needsReview ? null : gradeFromPercent(result.percent, scale.thresholds);
    const submittedAt = Timestamp.now();
    const startedAtMillis = toMillis(attempt.startedAt);
    const elapsedSeconds = startedAtMillis ? Math.max(0, Math.round((nowMillis - startedAtMillis) / 1000)) : null;
    const lateSeconds = deadlineAtMillis ? Math.max(0, Math.round((nowMillis - deadlineAtMillis) / 1000)) : 0;
    const submission = {
      attemptId,
      studentName: attempt.studentName,
      // Existing teacher UI and CSV consume this legacy-shaped answer map.
      answers: teacherAnswers,
      secureAnswerDigest,
      grading: result.grading,
      autoPoints: result.autoPoints,
      totalPoints: result.totalPoints,
      maxPoints: result.maxPoints,
      percent: result.percent,
      grade,
      gradeScaleSnapshot: scale,
      status: result.needsReview ? "review" : "graded",
      timeLimitMinutes: attempt.timeLimitMinutes || null,
      sessionRunId: attempt.sessionRunId || null,
      startMode: attempt.mode,
      startedAtServerMillis: startedAtMillis,
      elapsedSeconds,
      autoSubmitted,
      lateSeconds,
      secureAssessmentVersion: 1,
      answerTransportVersion: 1,
      submittedAt
    };

    tx.create(submissionRef, submission);
    tx.update(attemptRef, {
      status: "submitted",
      submittedAt,
      submissionId: attemptId,
      updatedAt: submittedAt
    });
    tx.update(privateRef, {
      gradingKey: FieldValue.delete(),
      paperSecret: FieldValue.delete(),
      sourceFingerprint: FieldValue.delete(),
      updatedAt: submittedAt
    });
    receipt = makeReceipt(submission, quiz);
  });

  return { receipt };
});

module.exports = { submitAssessmentAttempt };
