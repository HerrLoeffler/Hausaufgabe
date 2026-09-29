"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { REGION } = require("./lib/constants");
const {
  normalizeCode,
  cleanStudentName,
  randomToken,
  hashSecret,
  buildSecureExamPayload,
  sanitizeAnswers,
  gradeSecureAnswers,
  quizScale,
  gradeFromPercent,
  safeQuizMetadata
} = require("./lib/secure-exam-core");

const ALLOWED_ORIGINS = new Set([
  "https://hausaufgabe-staging.web.app",
  "https://hausaufgabe-40294.web.app"
]);
const ATTEMPT_TTL_HOURS = 8;
const OFFLINE_SUBMIT_GRACE_SECONDS = 5 * 60;

function projectId() {
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  try { return JSON.parse(process.env.FIREBASE_CONFIG || "{}").projectId || ""; } catch (_) { return ""; }
}

function stagingPilotAllowed() {
  return projectId() === "hausaufgabe-staging";
}

function setCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (origin && ALLOWED_ORIGINS.has(origin)) res.set("Access-Control-Allow-Origin", origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Cache-Control", "no-store");
  res.set("X-Content-Type-Options", "nosniff");
}

function send(res, status, body) {
  res.status(status).json(body);
}

function error(res, status, code, message) {
  send(res, status, { ok: false, error: code, message });
}

function timestampMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  return null;
}

function quizAvailable(quiz) {
  return quiz && quiz.published === true && quiz.ended !== true && quiz.isDeleted !== true && quiz.rightsHold !== true;
}

async function loadQuiz(db, code) {
  const ref = db.doc(`quizzes/${code}`);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { ref, data: snap.data() || {} };
}

function secureAllowed(quiz) {
  return quiz?.secureExamEnabled === true || stagingPilotAllowed();
}

async function authenticateAttempt(db, code, attemptId, attemptToken) {
  const safeCode = normalizeCode(code);
  const safeAttemptId = String(attemptId || "");
  const token = String(attemptToken || "");
  if (!safeCode || !/^secure_[A-Za-z0-9_-]{12,80}$/.test(safeAttemptId) || token.length < 24) return null;
  const ref = db.doc(`quizzes/${safeCode}/secureAttempts/${safeAttemptId}`);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  if (data.tokenHash !== hashSecret(token)) return null;
  return { ref, data, code: safeCode, attemptId: safeAttemptId };
}

async function loadSnapshot(attemptRef) {
  const snap = await attemptRef.collection("snapshot").orderBy("displayPosition").get();
  const publicQuestions = [];
  const gradingKeys = {};
  snap.docs.forEach(doc => {
    const row = doc.data() || {};
    if (row.publicQuestion) publicQuestions.push(row.publicQuestion);
    if (row.gradingKey) gradingKeys[doc.id] = row.gradingKey;
  });
  return { publicQuestions, gradingKeys };
}

async function actionPreflight(db, body, res) {
  const code = normalizeCode(body.code);
  if (!code) return error(res, 400, "invalid-code", "Der Testcode ist ungültig.");
  const quiz = await loadQuiz(db, code);
  if (!quiz || !quizAvailable(quiz.data)) return error(res, 404, "test-unavailable", "Dieser Test ist nicht verfügbar.");
  if (!secureAllowed(quiz.data)) return error(res, 409, "secure-disabled", "Für diesen Test ist GradeCrew Secure nicht freigegeben.");
  const meta = safeQuizMetadata(code, quiz.data);
  send(res, 200, {
    ok: true,
    test: meta,
    canPrepare: true,
    canStartNow: meta.startMode !== "teacher" || meta.sessionState === "running",
    pilot: quiz.data.secureExamEnabled !== true && stagingPilotAllowed()
  });
}

async function actionPrepare(db, body, res) {
  const code = normalizeCode(body.code);
  const studentName = cleanStudentName(body.studentName);
  if (!code) return error(res, 400, "invalid-code", "Der Testcode ist ungültig.");
  if (!studentName) return error(res, 400, "invalid-name", "Bitte Name oder Kürzel eingeben.");
  const quiz = await loadQuiz(db, code);
  if (!quiz || !quizAvailable(quiz.data)) return error(res, 404, "test-unavailable", "Dieser Test ist nicht verfügbar.");
  if (!secureAllowed(quiz.data)) return error(res, 409, "secure-disabled", "Für diesen Test ist GradeCrew Secure nicht freigegeben.");

  const attemptId = `secure_${randomToken(16)}`;
  const attemptToken = randomToken(32);
  const attemptRef = quiz.ref.collection("secureAttempts").doc(attemptId);
  const mirrorRef = quiz.ref.collection("attempts").doc(attemptId);
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + ATTEMPT_TTL_HOURS * 60 * 60 * 1000);
  const meta = safeQuizMetadata(code, quiz.data);
  const status = meta.startMode === "teacher" && meta.sessionState !== "running" ? "ready" : "prepared";
  const runId = quiz.data.sessionRunId || null;
  const scale = quizScale(quiz.data);

  const batch = db.batch();
  batch.create(attemptRef, {
    schemaVersion: 1,
    source: "gradecrew-secure",
    studentName,
    status,
    mode: meta.startMode,
    sessionRunId: runId,
    tokenHash: hashSecret(attemptToken),
    clientRevision: 0,
    answers: {},
    gradeScaleSnapshot: scale,
    resultMode: String(quiz.data.resultMode || "points_grade"),
    showSolutions: false,
    createdAt: now,
    preparedAt: now,
    expiresAt,
    lastSeenAt: now
  });
  batch.set(mirrorRef, {
    studentName,
    mode: meta.startMode,
    status,
    secure: true,
    sessionRunId: runId,
    timeLimitMinutes: meta.timeLimitMinutes,
    joinedAt: now,
    createdAtLocal: null
  });
  await batch.commit();

  send(res, 200, {
    ok: true,
    attemptId,
    attemptToken,
    test: meta,
    status,
    canStartNow: meta.startMode !== "teacher" || meta.sessionState === "running"
  });
}

async function actionStatus(db, body, res) {
  const auth = await authenticateAttempt(db, body.code, body.attemptId, body.attemptToken);
  if (!auth) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  const quiz = await loadQuiz(db, auth.code);
  if (!quiz || !quizAvailable(quiz.data)) return error(res, 409, "test-unavailable", "Dieser Test ist nicht mehr verfügbar.");
  const meta = safeQuizMetadata(auth.code, quiz.data);
  const currentRunId = quiz.data.sessionRunId || null;
  if (auth.data.sessionRunId && currentRunId && auth.data.sessionRunId !== currentRunId) {
    return error(res, 409, "run-changed", "Die Testrunde wurde geändert. Bitte neu beitreten.");
  }
  send(res, 200, {
    ok: true,
    status: auth.data.status,
    canStartNow: meta.startMode !== "teacher" || meta.sessionState === "running",
    test: meta,
    startedAt: timestampMillis(auth.data.startedAt),
    deadlineAt: timestampMillis(auth.data.deadlineAt)
  });
}

async function acquireStart(db, auth) {
  const nonce = randomToken(12);
  return db.runTransaction(async tx => {
    const snap = await tx.get(auth.ref);
    if (!snap.exists || snap.data()?.tokenHash !== auth.data.tokenHash) throw new Error("invalid-attempt");
    const data = snap.data() || {};
    if (["running", "submitted"].includes(data.status)) return { state: data.status, data };
    if (data.status === "starting") return { state: "starting", data };
    if (!["prepared", "ready"].includes(data.status)) return { state: data.status, data };
    tx.update(auth.ref, { status: "starting", startNonce: nonce, startRequestedAt: FieldValue.serverTimestamp(), lastSeenAt: FieldValue.serverTimestamp() });
    return { state: "acquired", nonce, data };
  });
}

async function actionStart(db, body, res) {
  const auth = await authenticateAttempt(db, body.code, body.attemptId, body.attemptToken);
  if (!auth) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  const quiz = await loadQuiz(db, auth.code);
  if (!quiz || !quizAvailable(quiz.data)) return error(res, 409, "test-unavailable", "Dieser Test ist nicht mehr verfügbar.");
  if (!secureAllowed(quiz.data)) return error(res, 409, "secure-disabled", "GradeCrew Secure ist für diesen Test nicht freigegeben.");
  if (auth.data.sessionRunId && quiz.data.sessionRunId && auth.data.sessionRunId !== quiz.data.sessionRunId) {
    return error(res, 409, "run-changed", "Die Testrunde wurde geändert. Bitte neu beitreten.");
  }
  if (quiz.data.startMode === "teacher" && quiz.data.sessionState !== "running") {
    return send(res, 200, { ok: true, waiting: true, status: "ready", test: safeQuizMetadata(auth.code, quiz.data) });
  }

  const lock = await acquireStart(db, auth);
  if (lock.state === "submitted") return actionVerify(db, body, res);
  if (lock.state === "running") {
    const current = await auth.ref.get();
    const snapshot = await loadSnapshot(auth.ref);
    return send(res, 200, {
      ok: true,
      status: "running",
      test: safeQuizMetadata(auth.code, quiz.data),
      questions: snapshot.publicQuestions,
      savedAnswers: current.data()?.answers || {},
      clientRevision: Number(current.data()?.clientRevision || 0),
      startedAt: timestampMillis(current.data()?.startedAt),
      deadlineAt: timestampMillis(current.data()?.deadlineAt)
    });
  }
  if (lock.state === "starting") return send(res, 202, { ok: true, status: "starting", retryAfterMs: 700 });
  if (lock.state !== "acquired") return error(res, 409, "invalid-state", "Diese Prüfung kann nicht gestartet werden.");

  try {
    const qs = await quiz.ref.collection("questions").orderBy("position").get();
    if (qs.empty) throw new Error("Der Test enthält keine Aufgaben.");
    const rows = qs.docs.map(doc => ({ id: doc.id, data: doc.data() || {} }));
    const payload = buildSecureExamPayload(quiz.data, rows);
    const position = new Map(payload.publicQuestions.map((question, index) => [question.id, index]));
    const batch = db.batch();
    for (const question of payload.publicQuestions) {
      batch.set(auth.ref.collection("snapshot").doc(question.id), {
        publicQuestion: question,
        gradingKey: payload.gradingKeys[question.id],
        displayPosition: position.get(question.id) || 0,
        startNonce: lock.nonce
      });
    }
    await batch.commit();

    const now = Timestamp.now();
    const minutes = Number(quiz.data.timeLimitMinutes) > 0 ? Number(quiz.data.timeLimitMinutes) : null;
    let startedAt = now;
    if (quiz.data.startMode === "teacher" && quiz.data.sessionStartedAt?.toMillis) startedAt = quiz.data.sessionStartedAt;
    const deadlineAt = minutes ? Timestamp.fromMillis(startedAt.toMillis() + Math.round(minutes * 60 * 1000)) : null;
    await db.runTransaction(async tx => {
      const snap = await tx.get(auth.ref);
      const data = snap.data() || {};
      if (data.status !== "starting" || data.startNonce !== lock.nonce) throw new Error("start-race");
      tx.update(auth.ref, {
        status: "running",
        startedAt,
        deadlineAt,
        maxPoints: payload.maxPoints,
        questionCount: payload.publicQuestions.length,
        startNonce: FieldValue.delete(),
        lastSeenAt: FieldValue.serverTimestamp()
      });
      tx.set(quiz.ref.collection("attempts").doc(auth.attemptId), {
        status: "running",
        startedAt,
        secure: true,
        sessionRunId: quiz.data.sessionRunId || null
      }, { merge: true });
    });

    send(res, 200, {
      ok: true,
      status: "running",
      test: safeQuizMetadata(auth.code, quiz.data),
      questions: payload.publicQuestions,
      savedAnswers: {},
      clientRevision: 0,
      startedAt: startedAt.toMillis(),
      deadlineAt: deadlineAt?.toMillis() || null
    });
  } catch (err) {
    console.error("Secure exam start failed", { code: auth.code, attemptId: auth.attemptId, message: err?.message });
    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(auth.ref);
        if (snap.exists && snap.data()?.status === "starting" && snap.data()?.startNonce === lock.nonce) {
          tx.update(auth.ref, { status: "prepared", startNonce: FieldValue.delete(), lastSeenAt: FieldValue.serverTimestamp() });
        }
      });
    } catch (_) {}
    error(res, 500, "start-failed", "Der sichere Test konnte nicht vorbereitet werden. Bitte erneut versuchen.");
  }
}

async function actionSave(db, body, res) {
  const auth = await authenticateAttempt(db, body.code, body.attemptId, body.attemptToken);
  if (!auth) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  const snapshot = await loadSnapshot(auth.ref);
  if (!Object.keys(snapshot.gradingKeys).length) return error(res, 409, "not-started", "Die Prüfung wurde noch nicht gestartet.");
  const revision = Math.max(0, Math.min(1_000_000_000, Math.trunc(Number(body.clientRevision) || 0)));
  const answers = sanitizeAnswers(snapshot.gradingKeys, body.answers);
  const result = await db.runTransaction(async tx => {
    const snap = await tx.get(auth.ref);
    if (!snap.exists || snap.data()?.tokenHash !== auth.data.tokenHash) return { unauthorized: true };
    const data = snap.data() || {};
    if (data.status !== "running") return { status: data.status, revision: Number(data.clientRevision || 0) };
    const deadline = timestampMillis(data.deadlineAt);
    if (deadline && Date.now() > deadline) return { expired: true, revision: Number(data.clientRevision || 0) };
    const storedRevision = Number(data.clientRevision || 0);
    if (revision <= storedRevision) return { status: "running", revision: storedRevision, duplicate: true };
    tx.update(auth.ref, { answers, clientRevision: revision, lastSavedAt: FieldValue.serverTimestamp(), lastSeenAt: FieldValue.serverTimestamp() });
    return { status: "running", revision };
  });
  if (result.unauthorized) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  send(res, 200, { ok: true, ...result });
}

async function actionSubmit(db, body, res) {
  const auth = await authenticateAttempt(db, body.code, body.attemptId, body.attemptToken);
  if (!auth) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  const quiz = await loadQuiz(db, auth.code);
  if (!quiz) return error(res, 404, "test-unavailable", "Dieser Test ist nicht mehr verfügbar.");
  const snapshot = await loadSnapshot(auth.ref);
  if (!Object.keys(snapshot.gradingKeys).length) return error(res, 409, "not-started", "Die Prüfung wurde noch nicht gestartet.");

  const attemptSnap = await auth.ref.get();
  const attempt = attemptSnap.data() || {};
  if (attempt.status === "submitted") return actionVerify(db, body, res);
  if (attempt.status !== "running") return error(res, 409, "invalid-state", "Diese Prüfung kann nicht abgegeben werden.");

  const deadline = timestampMillis(attempt.deadlineAt);
  const withinOfflineGrace = !deadline || Date.now() <= deadline + OFFLINE_SUBMIT_GRACE_SECONDS * 1000;
  const incomingRevision = Math.max(0, Math.min(1_000_000_000, Math.trunc(Number(body.clientRevision) || 0)));
  const storedRevision = Number(attempt.clientRevision || 0);
  const incomingAnswers = sanitizeAnswers(snapshot.gradingKeys, body.answers);
  const finalAnswers = withinOfflineGrace && incomingRevision >= storedRevision ? incomingAnswers : (attempt.answers || {});
  const result = gradeSecureAnswers(snapshot.gradingKeys, finalAnswers);
  const scale = attempt.gradeScaleSnapshot || quizScale(quiz.data);
  const grade = result.needsReview ? null : gradeFromPercent(result.percent, scale);
  const receipt = randomToken(24);
  const submissionRef = quiz.ref.collection("submissions").doc(auth.attemptId);
  const now = Timestamp.now();
  const elapsedSeconds = timestampMillis(attempt.startedAt) ? Math.max(0, Math.round((now.toMillis() - timestampMillis(attempt.startedAt)) / 1000)) : null;

  const committed = await db.runTransaction(async tx => {
    const currentAttempt = await tx.get(auth.ref);
    if (!currentAttempt.exists || currentAttempt.data()?.tokenHash !== auth.data.tokenHash) return { unauthorized: true };
    const current = currentAttempt.data() || {};
    const existingSubmission = await tx.get(submissionRef);
    if (current.status === "submitted" && existingSubmission.exists) {
      return { duplicate: true, submission: existingSubmission.data() || {} };
    }
    if (current.status !== "running") return { invalidState: current.status };
    const submission = {
      source: "gradecrew-secure",
      secure: true,
      studentName: current.studentName,
      answers: finalAnswers,
      grading: result.grading,
      autoPoints: result.points,
      totalPoints: result.points,
      maxPoints: result.maxPoints,
      percent: result.percent,
      grade,
      gradeScaleSnapshot: scale,
      status: result.needsReview ? "review" : "graded",
      timeLimitMinutes: Number(quiz.data.timeLimitMinutes) > 0 ? Number(quiz.data.timeLimitMinutes) : null,
      attemptId: auth.attemptId,
      sessionRunId: current.sessionRunId || quiz.data.sessionRunId || null,
      startMode: current.mode || (quiz.data.startMode === "teacher" ? "teacher" : "student"),
      startedAtServerMillis: timestampMillis(current.startedAt),
      elapsedSeconds,
      autoSubmitted: Boolean(body.autoSubmitted) || Boolean(deadline && now.toMillis() >= deadline),
      submittedAt: now,
      receipt
    };
    tx.set(submissionRef, submission);
    tx.update(auth.ref, {
      status: "submitted",
      answers: finalAnswers,
      clientRevision: Math.max(storedRevision, incomingRevision),
      submittedAt: now,
      receipt,
      lastSeenAt: now
    });
    tx.set(quiz.ref.collection("attempts").doc(auth.attemptId), { status: "submitted", submittedAt: now, secure: true }, { merge: true });
    return { submission };
  });
  if (committed.unauthorized) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  if (committed.invalidState) return error(res, 409, "invalid-state", "Diese Prüfung kann nicht abgegeben werden.");
  const submission = committed.submission;
  send(res, 200, {
    ok: true,
    submitted: true,
    duplicate: Boolean(committed.duplicate),
    receipt: submission.receipt,
    summary: {
      points: submission.totalPoints,
      maxPoints: submission.maxPoints,
      percent: submission.percent,
      grade: submission.grade ?? null,
      needsReview: submission.status === "review",
      resultMode: attempt.resultMode || quiz.data.resultMode || "points_grade"
    }
  });
}

async function actionVerify(db, body, res) {
  const auth = await authenticateAttempt(db, body.code, body.attemptId, body.attemptToken);
  if (!auth) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  const attemptSnap = await auth.ref.get();
  const attempt = attemptSnap.data() || {};
  if (attempt.status !== "submitted" || !attempt.receipt) return send(res, 200, { ok: true, submitted: false, status: attempt.status || "unknown" });
  const submissionSnap = await db.doc(`quizzes/${auth.code}/submissions/${auth.attemptId}`).get();
  if (!submissionSnap.exists || submissionSnap.data()?.receipt !== attempt.receipt) {
    return error(res, 409, "receipt-mismatch", "Die Serverquittung konnte nicht bestätigt werden.");
  }
  const submission = submissionSnap.data() || {};
  send(res, 200, {
    ok: true,
    submitted: true,
    receipt: attempt.receipt,
    summary: {
      points: submission.totalPoints,
      maxPoints: submission.maxPoints,
      percent: submission.percent,
      grade: submission.grade ?? null,
      needsReview: submission.status === "review"
    }
  });
}

async function actionAbort(db, body, res) {
  const auth = await authenticateAttempt(db, body.code, body.attemptId, body.attemptToken);
  if (!auth) return error(res, 401, "invalid-attempt", "Prüfungssitzung ist ungültig.");
  await db.runTransaction(async tx => {
    const snap = await tx.get(auth.ref);
    if (!snap.exists) return;
    const status = snap.data()?.status;
    if (["submitted", "aborted"].includes(status)) return;
    tx.update(auth.ref, { status: "aborted", abortedAt: FieldValue.serverTimestamp(), lastSeenAt: FieldValue.serverTimestamp() });
    tx.set(db.doc(`quizzes/${auth.code}/attempts/${auth.attemptId}`), { status: "aborted", secure: true }, { merge: true });
  });
  send(res, 200, { ok: true, status: "aborted" });
}

exports.secureExamApi = onRequest({ region: REGION, timeoutSeconds: 60, memory: "512MiB", cors: false }, async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  const origin = String(req.headers.origin || "");
  if (origin && !ALLOWED_ORIGINS.has(origin)) return error(res, 403, "origin-denied", "Diese Herkunft ist nicht zugelassen.");
  if (req.method !== "POST") return error(res, 405, "method-not-allowed", "Nur POST ist erlaubt.");
  if (!req.is("application/json")) return error(res, 415, "json-required", "JSON erwartet.");
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const action = String(body.action || "");
  const db = getFirestore();
  try {
    if (action === "preflight") return await actionPreflight(db, body, res);
    if (action === "prepare") return await actionPrepare(db, body, res);
    if (action === "status") return await actionStatus(db, body, res);
    if (action === "start" || action === "resume") return await actionStart(db, body, res);
    if (action === "save") return await actionSave(db, body, res);
    if (action === "submit") return await actionSubmit(db, body, res);
    if (action === "verify") return await actionVerify(db, body, res);
    if (action === "abort") return await actionAbort(db, body, res);
    return error(res, 400, "unknown-action", "Unbekannte Secure-Aktion.");
  } catch (err) {
    console.error("secureExamApi failed", { action, message: err?.message, stack: String(err?.stack || "").split("\n").slice(0, 4).join("\n") });
    return error(res, 500, "internal", "GradeCrew Secure konnte die Anfrage nicht abschließen.");
  }
});
