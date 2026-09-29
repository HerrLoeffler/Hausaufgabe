"use strict";

const { randomBytes } = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const {
  sha256,
  tokenHash,
  validAttemptToken,
  secureTokenMatches,
  buildAssessmentContract,
  gradeSubmission,
  gradeFromPercent,
  sanitizeAnswersForStorage,
  publicQuizMetadata,
  assertNoSolutionLeak
} = require("./lib/assessment-core");

initializeApp();

const REGION = "europe-west1";
const callableOpts = {
  region: REGION,
  timeoutSeconds: 60,
  memory: "256MiB",
  enforceAppCheck: false
};
const START_RATE_LIMIT_PER_DAY = 250;
const SUBMIT_GRACE_SECONDS = 30;

function cleanQuizId(value) {
  const quizId = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{3,100}$/.test(quizId)) throw new HttpsError("invalid-argument", "Ungültiger Testcode.");
  return quizId;
}

function cleanStudentName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  if (!name || name.length > 120) throw new HttpsError("invalid-argument", "Bitte einen gültigen Namen oder ein Kürzel eingeben.");
  return name;
}

function cleanClientAttemptId(value) {
  const id = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(id)) throw new HttpsError("invalid-argument", "Ungültige Sitzungskennung.");
  return id;
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

function timestampFromMillis(value) {
  return Number.isFinite(Number(value)) ? Timestamp.fromMillis(Number(value)) : null;
}

function validateQuizOpen(quiz) {
  if (!quiz) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
  if (quiz.isDeleted === true) throw new HttpsError("not-found", "Dieser Test ist nicht verfügbar.");
  if (quiz.rightsHold === true) throw new HttpsError("failed-precondition", "Dieser Test ist vorübergehend gesperrt.");
  if (quiz.published !== true) throw new HttpsError("failed-precondition", "Dieser Test ist noch nicht veröffentlicht.");
  if (quiz.ended === true) throw new HttpsError("failed-precondition", "Dieser Test wurde beendet.");
}

async function readQuiz(quizId) {
  const snap = await getFirestore().doc(`quizzes/${quizId}`).get();
  if (!snap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
  return { ref: snap.ref, data: snap.data() };
}

async function readQuestions(quizId) {
  const snap = await getFirestore().collection(`quizzes/${quizId}/questions`).orderBy("position").get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function sessionMode(quiz) {
  return quiz.startMode === "teacher" ? "teacher" : "student";
}

function attemptStatusForStart(quiz) {
  if (sessionMode(quiz) === "teacher" && quiz.sessionState !== "running") return "ready";
  return "running";
}

function attemptStartMillis(quiz, nowMillis) {
  if (sessionMode(quiz) === "teacher") {
    if (quiz.sessionState !== "running") return null;
    return toMillis(quiz.sessionStartedAt) || nowMillis;
  }
  return nowMillis;
}

function timeLimitMinutes(quiz) {
  const value = Number(quiz.timeLimitMinutes);
  return Number.isFinite(value) && value > 0 ? Math.min(300, Math.round(value)) : null;
}

function deadlineMillis(startedAtMillis, minutes) {
  return startedAtMillis && minutes ? startedAtMillis + minutes * 60_000 : null;
}

function attemptPublicState(attempt, quiz, paper = null) {
  const startedAtMillis = toMillis(attempt.startedAt);
  const deadlineAtMillis = toMillis(attempt.deadlineAt) || deadlineMillis(startedAtMillis, attempt.timeLimitMinutes);
  return {
    attemptId: attempt.attemptId,
    studentName: attempt.studentName,
    status: attempt.status,
    mode: attempt.mode,
    sessionRunId: attempt.sessionRunId || null,
    startedAtMillis,
    deadlineAtMillis,
    timeLimitMinutes: attempt.timeLimitMinutes || null,
    paper: attempt.status === "running" ? paper : null,
    quiz: publicQuizMetadata(quiz, attempt.quizId)
  };
}

function attemptRef(quizId, attemptId) {
  return getFirestore().doc(`quizzes/${quizId}/attempts/${attemptId}`);
}

function submissionRef(quizId, attemptId) {
  return getFirestore().doc(`quizzes/${quizId}/submissions/${attemptId}`);
}

function assessmentPrivateRef(quizId, attemptId) {
  return getFirestore().doc(`assessmentPrivate/${quizId}_${attemptId}`);
}

function deriveAttemptId(quizId, clientAttemptId) {
  return `a_${sha256(`gradecrew-attempt:v1:${quizId}:${clientAttemptId}`).slice(0, 28)}`;
}

function createPaperSecret() {
  return randomBytes(32).toString("base64url");
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

async function rateLimitStart(request, quizId, tx) {
  const ip = String(request.rawRequest?.ip || "unknown");
  const day = new Date().toISOString().slice(0, 10);
  const rateId = sha256(`assessment-start:v1:${day}:${quizId}:${ip}`);
  const ref = getFirestore().doc(`assessmentRateLimits/${day}-${rateId}`);
  const snap = await tx.get(ref);
  const count = Number(snap.data()?.count || 0);
  if (count >= START_RATE_LIMIT_PER_DAY) {
    throw new HttpsError("resource-exhausted", "Für diesen Test wurden von diesem Anschluss heute ungewöhnlich viele Starts angefordert.");
  }
  tx.set(ref, { count: count + 1, quizId, day, updatedAt: Timestamp.now() }, { merge: true });
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

async function contractForExistingAttempt(quizId, paperSecret, expectedFingerprint) {
  if (!paperSecret) throw new HttpsError("data-loss", "Die sichere Aufgabenabbildung fehlt.");
  const questions = await readQuestions(quizId);
  const contract = buildAssessmentContract(questions, paperSecret);
  assertNoSolutionLeak(contract.paper);
  if (expectedFingerprint && contract.sourceFingerprint !== expectedFingerprint) {
    throw new HttpsError(
      "failed-precondition",
      "Der Test wurde während deiner Bearbeitung verändert. Bitte wende dich an deine Lehrkraft, bevor du fortfährst."
    );
  }
  return contract;
}

exports.getAssessmentInfo = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const { data: quiz } = await readQuiz(quizId);
  validateQuizOpen(quiz);
  return { quiz: publicQuizMetadata(quiz, quizId) };
});

exports.startAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const studentName = cleanStudentName(request.data?.studentName);
  const clientAttemptId = cleanClientAttemptId(request.data?.clientAttemptId);
  const attemptToken = cleanAttemptToken(request.data?.attemptToken);
  const id = deriveAttemptId(quizId, clientAttemptId);
  const db = getFirestore();
  const { data: quiz } = await readQuiz(quizId);
  validateQuizOpen(quiz);
  const questions = await readQuestions(quizId);
  if (!questions.length) throw new HttpsError("failed-precondition", "Dieser Test enthält keine Aufgaben.");

  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  const now = Date.now();
  const mode = sessionMode(quiz);
  const desiredStatus = attemptStatusForStart(quiz);
  const startedAtMillis = attemptStartMillis(quiz, now);
  const limit = timeLimitMinutes(quiz);
  const deadlineAt = deadlineMillis(startedAtMillis, limit);
  const scale = gradingScaleSnapshot(quiz);
  const newPaperSecret = createPaperSecret();
  const newContract = buildAssessmentContract(questions, newPaperSecret);
  assertNoSolutionLeak(newContract.paper);

  let storedAttempt;
  let storedPrivate;
  let createdNew = false;
  await db.runTransaction(async tx => {
    const existingAttempt = await tx.get(aRef);
    const existingPrivate = await tx.get(pRef);
    if (existingAttempt.exists || existingPrivate.exists) {
      if (!existingAttempt.exists || !existingPrivate.exists) throw new HttpsError("data-loss", "Der Bearbeitungsversuch ist unvollständig gespeichert.");
      storedAttempt = existingAttempt.data();
      storedPrivate = existingPrivate.data();
      assertAttemptToken(storedPrivate, attemptToken);
      if (String(storedAttempt.studentName || "") !== studentName) {
        throw new HttpsError("permission-denied", "Dieser Bearbeitungsversuch wurde bereits mit einem anderen Kürzel gestartet.");
      }
      return;
    }

    await rateLimitStart(request, quizId, tx);
    const created = {
      attemptId: id,
      quizId,
      studentName,
      mode,
      status: desiredStatus,
      sessionRunId: mode === "teacher" ? String(quiz.sessionRunId || "") || null : null,
      timeLimitMinutes: limit,
      joinedAt: Timestamp.now(),
      startedAt: timestampFromMillis(startedAtMillis),
      deadlineAt: timestampFromMillis(deadlineAt),
      gradeScaleSnapshot: scale,
      resultMode: String(quiz.resultMode || "points_grade").slice(0, 40),
      questionCount: newContract.paper.length,
      maxPoints: newContract.gradingKey.reduce((sum, key) => sum + Number(key.points || 0), 0),
      secureAssessmentVersion: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const privateData = {
      quizId,
      attemptId: id,
      tokenHash: tokenHash(attemptToken),
      paperSecret: newPaperSecret,
      sourceFingerprint: newContract.sourceFingerprint,
      gradingKey: newContract.gradingKey,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    tx.create(aRef, created);
    tx.create(pRef, privateData);
    storedAttempt = created;
    storedPrivate = privateData;
    createdNew = true;
  });

  assertSameRun(storedAttempt, quiz);
  const contract = createdNew
    ? newContract
    : await contractForExistingAttempt(quizId, storedPrivate.paperSecret, storedPrivate.sourceFingerprint);
  return attemptPublicState(storedAttempt, quiz, storedAttempt.status === "running" ? contract.paper : null);
});

exports.resumeAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const db = getFirestore();
  const { data: quiz } = await readQuiz(quizId);
  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  let [attemptSnap, privateSnap] = await Promise.all([aRef.get(), pRef.get()]);
  if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
  let attempt = attemptSnap.data();
  let privateData = privateSnap.data();
  assertAttemptToken(privateData, token);

  if (attempt.status === "submitted") {
    const submissionSnap = await submissionRef(quizId, id).get();
    if (!submissionSnap.exists) throw new HttpsError("data-loss", "Die Abgabe konnte nicht geladen werden.");
    return {
      ...attemptPublicState(attempt, quiz, null),
      receipt: makeReceipt({ id: submissionSnap.id, ...submissionSnap.data() }, quiz)
    };
  }

  validateQuizOpen(quiz);
  assertSameRun(attempt, quiz);

  if (attempt.mode === "teacher" && attempt.status === "ready" && quiz.sessionState === "running") {
    const startedAtMillis = toMillis(quiz.sessionStartedAt) || Date.now();
    const deadlineAt = deadlineMillis(startedAtMillis, attempt.timeLimitMinutes);
    await db.runTransaction(async tx => {
      const current = await tx.get(aRef);
      if (!current.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
      const data = current.data();
      if (data.status === "ready") {
        tx.update(aRef, {
          status: "running",
          startedAt: timestampFromMillis(startedAtMillis),
          deadlineAt: timestampFromMillis(deadlineAt),
          updatedAt: Timestamp.now()
        });
      }
    });
    [attemptSnap, privateSnap] = await Promise.all([aRef.get(), pRef.get()]);
    attempt = attemptSnap.data();
    privateData = privateSnap.data();
    assertAttemptToken(privateData, token);
  }

  const contract = attempt.status === "running"
    ? await contractForExistingAttempt(quizId, privateData.paperSecret, privateData.sourceFingerprint)
    : null;
  return attemptPublicState(attempt, quiz, contract?.paper || null);
});

exports.submitAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const autoSubmitted = request.data?.autoSubmitted === true;
  const db = getFirestore();
  const { data: quiz } = await readQuiz(quizId);
  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  const sRef = submissionRef(quizId, id);

  let receipt;
  await db.runTransaction(async tx => {
    const attemptSnap = await tx.get(aRef);
    const privateSnap = await tx.get(pRef);
    const existingSubmission = await tx.get(sRef);
    if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
    const attempt = attemptSnap.data();
    const privateData = privateSnap.data();
    assertAttemptToken(privateData, token);

    if (existingSubmission.exists || attempt.status === "submitted") {
      if (!existingSubmission.exists) throw new HttpsError("data-loss", "Die abgeschlossene Abgabe fehlt.");
      receipt = makeReceipt({ id: existingSubmission.id, ...existingSubmission.data() }, quiz);
      return;
    }

    validateQuizOpen(quiz);
    assertSameRun(attempt, quiz);
    if (attempt.status !== "running") throw new HttpsError("failed-precondition", "Der Test wurde für diesen Versuch noch nicht gestartet.");

    const startedAtMillis = toMillis(attempt.startedAt);
    const deadlineAtMillis = toMillis(attempt.deadlineAt) || deadlineMillis(startedAtMillis, attempt.timeLimitMinutes);
    const nowMillis = Date.now();
    if (deadlineAtMillis && nowMillis > deadlineAtMillis + SUBMIT_GRACE_SECONDS * 1000) {
      throw new HttpsError("deadline-exceeded", "Die serverseitige Abgabefrist ist abgelaufen. Bitte wende dich an deine Lehrkraft.");
    }

    const gradingKey = Array.isArray(privateData.gradingKey) ? privateData.gradingKey : [];
    if (!gradingKey.length) throw new HttpsError("data-loss", "Der serverseitige Bewertungsschlüssel fehlt.");
    const answers = sanitizeAnswersForStorage(gradingKey, request.data?.answers);
    const result = gradeSubmission(gradingKey, answers);
    const scale = attempt.gradeScaleSnapshot?.thresholds?.length === 6 ? attempt.gradeScaleSnapshot : gradingScaleSnapshot(quiz);
    const grade = result.needsReview ? null : gradeFromPercent(result.percent, scale.thresholds);
    const submittedAt = Timestamp.now();
    const elapsedSeconds = startedAtMillis ? Math.max(0, Math.round((nowMillis - startedAtMillis) / 1000)) : null;
    const lateSeconds = deadlineAtMillis ? Math.max(0, Math.round((nowMillis - deadlineAtMillis) / 1000)) : 0;
    const submission = {
      attemptId: id,
      studentName: attempt.studentName,
      answers,
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
      submittedAt
    };
    tx.create(sRef, submission);
    tx.update(aRef, {
      status: "submitted",
      submittedAt,
      submissionId: id,
      updatedAt: submittedAt
    });
    tx.update(pRef, {
      gradingKey: FieldValue.delete(),
      paperSecret: FieldValue.delete(),
      sourceFingerprint: FieldValue.delete(),
      updatedAt: submittedAt
    });
    receipt = makeReceipt(submission, quiz);
  });

  return { receipt };
});

exports.getAssessmentReceipt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const [quizResult, attemptSnap, privateSnap, submissionSnap] = await Promise.all([
    readQuiz(quizId),
    attemptRef(quizId, id).get(),
    assessmentPrivateRef(quizId, id).get(),
    submissionRef(quizId, id).get()
  ]);
  if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
  assertAttemptToken(privateSnap.data(), token);
  if (!submissionSnap.exists) throw new HttpsError("failed-precondition", "Für diesen Versuch liegt noch keine Abgabe vor.");
  return { receipt: makeReceipt({ id: submissionSnap.id, ...submissionSnap.data() }, quizResult.data) };
});
