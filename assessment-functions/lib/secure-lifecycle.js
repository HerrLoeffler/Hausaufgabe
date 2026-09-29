"use strict";

const { randomBytes } = require("node:crypto");
const { initializeApp, getApps } = require("firebase-admin/app");
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
} = require("./assessment-core");
const {
  buildTeacherDecoderShape,
  decodeSubmissionAnswersFromShape
} = require("./teacher-answer-decoder");

if (!getApps().length) initializeApp();

const REGION = "europe-west1";
const callableOpts = {
  region: REGION,
  timeoutSeconds: 60,
  memory: "256MiB",
  enforceAppCheck: false
};
const START_RATE_LIMIT_PER_DAY = 250;
const SUBMIT_GRACE_SECONDS = 30;
const END_SUBMIT_GRACE_SECONDS = 90;
const PRIVATE_PAYLOAD_SOFT_LIMIT_BYTES = 850_000;
const RESULT_MODES = new Set(["none", "points", "points_percent", "points_grade"]);

function cleanQuizId(value) {
  const quizId = String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{4,16}$/.test(quizId)) throw new HttpsError("invalid-argument", "Ungültiger Testcode.");
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

function normalizeResultMode(value) {
  const mode = String(value || "points_grade");
  return RESULT_MODES.has(mode) ? mode : "points_grade";
}

function validateQuizOpen(quiz) {
  if (!quiz) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
  if (quiz.isDeleted === true) throw new HttpsError("not-found", "Dieser Test ist nicht verfügbar.");
  if (quiz.rightsHold === true) throw new HttpsError("failed-precondition", "Dieser Test ist vorübergehend gesperrt.");
  if (quiz.published !== true) throw new HttpsError("failed-precondition", "Dieser Test ist noch nicht veröffentlicht.");
  if (quiz.ended === true) throw new HttpsError("failed-precondition", "Dieser Test wurde beendet.");
}

function validateSubmissionWindow(quiz, attempt, nowMillis) {
  if (!quiz) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
  if (quiz.isDeleted === true) throw new HttpsError("not-found", "Dieser Test ist nicht verfügbar.");
  if (quiz.rightsHold === true) throw new HttpsError("failed-precondition", "Dieser Test ist vorübergehend gesperrt.");
  if (quiz.published === true && quiz.ended !== true) return;
  const endedAtMillis = toMillis(quiz.endedAt);
  if (
    quiz.ended === true
    && attempt?.status === "running"
    && Number.isFinite(endedAtMillis)
    && nowMillis <= endedAtMillis + END_SUBMIT_GRACE_SECONDS * 1000
  ) return;
  throw new HttpsError("failed-precondition", "Dieser Test wurde beendet.");
}

function sessionMode(quiz) {
  return quiz.startMode === "teacher" ? "teacher" : "student";
}

function effectiveRunId(quiz, quizId) {
  if (sessionMode(quiz) === "teacher") {
    const explicit = String(quiz.sessionRunId || "").trim();
    if (!explicit) throw new HttpsError("failed-precondition", "Die gemeinsame Testrunde ist unvollständig. Bitte den Test erneut veröffentlichen.");
    return explicit;
  }
  const epochs = [quiz.reopenedAt, quiz.publishedAt].map(toMillis).filter(Number.isFinite);
  const epoch = epochs.length ? Math.max(...epochs) : toMillis(quiz.createdAt);
  const seed = Number.isFinite(epoch) ? String(epoch) : sha256(`${quizId}:${String(quiz.accessCode || "")}`).slice(0, 20);
  return `student_${seed}`;
}

function publicQuizState(quiz, quizId) {
  return {
    ...publicQuizMetadata(quiz, quizId),
    sessionRunId: effectiveRunId(quiz, quizId),
    resultMode: normalizeResultMode(quiz.resultMode)
  };
}

function contractOptions(quiz) {
  return {
    shuffleQuestions: quiz.shuffleQuestions === true,
    shuffleAnswers: quiz.shuffleAnswers === true
  };
}

function contractOptionsEqual(a, b) {
  return a.shuffleQuestions === b.shuffleQuestions && a.shuffleAnswers === b.shuffleAnswers;
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

function cleanDisplay(value, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

function gapSolutionDisplay(text) {
  const values = [];
  const visible = String(text || "").replace(/\[([^\]]+)\]/g, (_, inside) => {
    values.push(String(inside).split("|").map(value => value.trim()).filter(Boolean).join(" / "));
    return "____";
  });
  return {
    visible: cleanDisplay(visible, 1500),
    answer: cleanDisplay(values.map((value, index) => `Lücke ${index + 1}: ${value}`).join("; "), 5000)
  };
}

function buildSolutionSnapshot(questions) {
  return (Array.isArray(questions) ? questions : []).map((question, index) => {
    const type = String(question?.type || "text");
    let prompt = type === "gapfill" ? "Lückentext" : cleanDisplay(question?.text, 1500);
    let answer = "";
    if (["single", "multi", "dropdown"].includes(type)) {
      answer = (Array.isArray(question.options) ? question.options : [])
        .filter(option => option?.correct === true)
        .map(option => cleanDisplay(option?.text, 500))
        .filter(Boolean)
        .join(", ");
    } else if (type === "text") {
      answer = question.manualReview === true
        ? "wird von der Lehrkraft geprüft"
        : (Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : []).map(value => cleanDisplay(value, 500)).filter(Boolean).join(" / ");
    } else if (type === "number") {
      const number = Number(question.numericAnswer);
      const unit = cleanDisplay(question.unit, 60);
      const tolerance = Math.max(0, Number(question.tolerance) || 0);
      answer = `${Number.isFinite(number) ? number : ""}${unit ? ` ${unit}` : ""}${tolerance ? ` (±${tolerance})` : ""}`.trim();
    } else if (type === "truefalse") {
      answer = question.correctBoolean === true ? "Richtig" : "Falsch";
    } else if (type === "gapfill") {
      const gap = gapSolutionDisplay(question.text);
      prompt = gap.visible || "Lückentext";
      answer = gap.answer;
    } else if (type === "matching") {
      answer = (Array.isArray(question.pairs) ? question.pairs : [])
        .map(pair => `${cleanDisplay(pair?.left, 400)} → ${cleanDisplay(pair?.right, 400)}`)
        .join("; ");
    } else if (type === "ordering") {
      const items = Array.isArray(question.items) ? question.items.map(value => cleanDisplay(value, 500)) : [];
      const primary = items.map((_, itemIndex) => itemIndex);
      const alternatives = [primary, ...(Array.isArray(question.acceptedOrders) ? question.acceptedOrders : [])]
        .filter(order => Array.isArray(order) && order.length === items.length && new Set(order).size === items.length && order.every(itemIndex => Number.isInteger(itemIndex) && itemIndex >= 0 && itemIndex < items.length));
      const unique = [...new Map(alternatives.map(order => [order.join(","), order])).values()];
      answer = unique.map(order => order.map(itemIndex => items[itemIndex]).join(" → ")).join(" / ");
    } else if (type === "grouping") {
      answer = (Array.isArray(question.groups) ? question.groups : [])
        .map(group => `${cleanDisplay(group?.name, 300)}: ${(Array.isArray(group?.items) ? group.items : []).map(item => cleanDisplay(item, 400)).join(", ")}`)
        .join("; ");
    } else if (type === "markwords") {
      answer = [...new Set((Array.isArray(question.targetWords) ? question.targetWords : []).map(value => cleanDisplay(value, 300)).filter(Boolean))].join(", ");
    }
    return {
      id: cleanDisplay(question?.id || `q${index + 1}`, 120),
      position: Number(question?.position) || index + 1,
      prompt,
      answer: cleanDisplay(answer || "–", 5000)
    };
  });
}

function privatePayloadBytes(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function assertPrivatePayloadSafe(privateData) {
  if (privatePayloadBytes(privateData) > PRIVATE_PAYLOAD_SOFT_LIMIT_BYTES) {
    throw new HttpsError(
      "failed-precondition",
      "Dieser Test ist für den sicheren Prüfungsmodus zu umfangreich. Bitte teile ihn in zwei kürzere Tests."
    );
  }
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
    quiz: publicQuizState(quiz, attempt.quizId)
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

function deriveAttemptId(quizId, runId, clientAttemptId) {
  return `a_${sha256(`gradecrew-attempt:v2:${quizId}:${runId}:${clientAttemptId}`).slice(0, 28)}`;
}

function createPaperSecret() {
  return randomBytes(32).toString("base64url");
}

function assertAttemptToken(privateData, token) {
  if (!secureTokenMatches(token, privateData?.tokenHash)) {
    throw new HttpsError("permission-denied", "Dieser Bearbeitungsversuch gehört nicht zu diesem Browser.");
  }
}

function assertSameRun(attempt, quiz, quizId) {
  const currentRun = effectiveRunId(quiz, quizId);
  const attemptRun = String(attempt.sessionRunId || "");
  if (!attemptRun || currentRun !== attemptRun) {
    throw new HttpsError("failed-precondition", "Für diesen Test wurde eine neue Runde gestartet. Bitte neu beitreten.");
  }
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

function makeReceipt(submission, quiz = null, privateData = null) {
  const mode = normalizeResultMode(submission?.resultMode);
  const configured = submission?.showSolutionsAfterEnd === true && mode !== "none";
  const released = configured
    && quiz?.ended === true
    && quiz?.isDeleted !== true
    && quiz?.rightsHold !== true
    && Array.isArray(privateData?.solutionSnapshot);
  const receipt = {
    submissionId: submission?.attemptId || submission?.id || null,
    attemptId: submission?.attemptId || null,
    status: submission?.status || "graded",
    needsReview: submission?.status === "review",
    resultMode: mode,
    submittedAtMillis: toMillis(submission?.submittedAt),
    solutionsConfigured: configured,
    solutionsReleased: released
  };
  if (["points", "points_percent", "points_grade"].includes(mode)) {
    receipt.totalPoints = Number(submission?.totalPoints) || 0;
    receipt.maxPoints = Number(submission?.maxPoints) || 0;
  }
  if (["points_percent", "points_grade"].includes(mode)) receipt.percent = Number(submission?.percent) || 0;
  if (mode === "points_grade" && submission?.grade != null) receipt.grade = Number(submission.grade);
  if (released) receipt.solutions = privateData.solutionSnapshot;
  return receipt;
}

function contractForQuestions(questions, privateData) {
  if (!privateData?.paperSecret) throw new HttpsError("data-loss", "Die sichere Aufgabenabbildung fehlt.");
  const options = {
    shuffleQuestions: privateData.shuffleQuestions === true,
    shuffleAnswers: privateData.shuffleAnswers === true
  };
  const contract = buildAssessmentContract(questions, privateData.paperSecret, options);
  assertNoSolutionLeak(contract.paper);
  if (privateData.authoringFingerprint && contract.authoringFingerprint !== privateData.authoringFingerprint) {
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
  return { quiz: publicQuizState(quiz, quizId) };
});

exports.startAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const studentName = cleanStudentName(request.data?.studentName);
  const clientAttemptId = cleanClientAttemptId(request.data?.clientAttemptId);
  const attemptToken = cleanAttemptToken(request.data?.attemptToken);
  const db = getFirestore();
  const { ref: quizRef, data: initialQuiz } = await readQuiz(quizId);
  validateQuizOpen(initialQuiz);
  const initialRunId = effectiveRunId(initialQuiz, quizId);
  const initialOptions = contractOptions(initialQuiz);
  const questions = await readQuestions(quizId);
  if (!questions.length) throw new HttpsError("failed-precondition", "Dieser Test enthält keine Aufgaben.");

  const id = deriveAttemptId(quizId, initialRunId, clientAttemptId);
  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  const newPaperSecret = createPaperSecret();
  const newContract = buildAssessmentContract(questions, newPaperSecret, initialOptions);
  assertNoSolutionLeak(newContract.paper);
  const newDecoderShape = buildTeacherDecoderShape(questions);
  const newSolutionSnapshot = buildSolutionSnapshot(questions);
  let storedAttempt;
  let storedPrivate;
  let currentQuiz;
  let createdNew = false;

  await db.runTransaction(async tx => {
    const quizSnap = await tx.get(quizRef);
    const existingAttempt = await tx.get(aRef);
    const existingPrivate = await tx.get(pRef);
    if (!quizSnap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
    currentQuiz = quizSnap.data();
    validateQuizOpen(currentQuiz);
    const currentRunId = effectiveRunId(currentQuiz, quizId);
    if (currentRunId !== initialRunId || !contractOptionsEqual(contractOptions(currentQuiz), initialOptions)) {
      throw new HttpsError("aborted", "Der Test wurde gerade geändert. Bitte erneut starten.");
    }

    if (existingAttempt.exists || existingPrivate.exists) {
      if (!existingAttempt.exists || !existingPrivate.exists) throw new HttpsError("data-loss", "Der Bearbeitungsversuch ist unvollständig gespeichert.");
      storedAttempt = existingAttempt.data();
      storedPrivate = existingPrivate.data();
      assertAttemptToken(storedPrivate, attemptToken);
      if (String(storedAttempt.studentName || "") !== studentName) {
        throw new HttpsError("permission-denied", "Dieser Bearbeitungsversuch wurde bereits mit einem anderen Kürzel gestartet.");
      }
      assertSameRun(storedAttempt, currentQuiz, quizId);
      return;
    }

    await rateLimitStart(request, quizId, tx);
    const now = Date.now();
    const mode = sessionMode(currentQuiz);
    const status = attemptStatusForStart(currentQuiz);
    const startedAtMillis = attemptStartMillis(currentQuiz, now);
    const limit = timeLimitMinutes(currentQuiz);
    const deadlineAt = deadlineMillis(startedAtMillis, limit);
    const scale = gradingScaleSnapshot(currentQuiz);
    const resultMode = normalizeResultMode(currentQuiz.resultMode);
    const showSolutionsAfterEnd = currentQuiz.showSolutions === true && resultMode !== "none";
    const created = {
      attemptId: id,
      quizId,
      studentName,
      mode,
      status,
      sessionRunId: currentRunId,
      timeLimitMinutes: limit,
      joinedAt: Timestamp.now(),
      startedAt: timestampFromMillis(startedAtMillis),
      deadlineAt: timestampFromMillis(deadlineAt),
      gradeScaleSnapshot: scale,
      resultMode,
      showSolutionsAfterEnd,
      questionCount: newContract.paper.length,
      maxPoints: newContract.gradingKey.reduce((sum, key) => sum + Number(key.points || 0), 0),
      secureAssessmentVersion: 2,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const privateData = {
      quizId,
      attemptId: id,
      tokenHash: tokenHash(attemptToken),
      paperSecret: newPaperSecret,
      sourceFingerprint: newContract.sourceFingerprint,
      authoringFingerprint: newContract.authoringFingerprint,
      gradingKey: newContract.gradingKey,
      decoderShape: newDecoderShape,
      solutionSnapshot: showSolutionsAfterEnd ? newSolutionSnapshot : null,
      shuffleQuestions: initialOptions.shuffleQuestions,
      shuffleAnswers: initialOptions.shuffleAnswers,
      sessionRunId: currentRunId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    assertPrivatePayloadSafe(privateData);
    tx.create(aRef, created);
    tx.create(pRef, privateData);
    storedAttempt = created;
    storedPrivate = privateData;
    createdNew = true;
  });

  const contract = createdNew ? newContract : contractForQuestions(questions, storedPrivate);
  return attemptPublicState(storedAttempt, currentQuiz || initialQuiz, storedAttempt.status === "running" ? contract.paper : null);
});

exports.resumeAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const db = getFirestore();
  const { ref: quizRef, data: initialQuiz } = await readQuiz(quizId);
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
      ...attemptPublicState(attempt, initialQuiz, null),
      receipt: makeReceipt({ id: submissionSnap.id, ...submissionSnap.data() }, initialQuiz, privateData)
    };
  }

  validateQuizOpen(initialQuiz);
  assertSameRun(attempt, initialQuiz, quizId);
  let currentQuiz = initialQuiz;
  if (attempt.mode === "teacher" && attempt.status === "ready" && initialQuiz.sessionState === "running") {
    await db.runTransaction(async tx => {
      const quizSnap = await tx.get(quizRef);
      const currentAttempt = await tx.get(aRef);
      const currentPrivate = await tx.get(pRef);
      if (!quizSnap.exists || !currentAttempt.exists || !currentPrivate.exists) {
        throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
      }
      currentQuiz = quizSnap.data();
      const data = currentAttempt.data();
      const secretData = currentPrivate.data();
      assertAttemptToken(secretData, token);
      validateQuizOpen(currentQuiz);
      assertSameRun(data, currentQuiz, quizId);
      if (data.status === "ready") {
        if (currentQuiz.sessionState !== "running") return;
        const startedAtMillis = toMillis(currentQuiz.sessionStartedAt) || Date.now();
        tx.update(aRef, {
          status: "running",
          startedAt: timestampFromMillis(startedAtMillis),
          deadlineAt: timestampFromMillis(deadlineMillis(startedAtMillis, data.timeLimitMinutes)),
          updatedAt: Timestamp.now()
        });
      }
    });
    [attemptSnap, privateSnap] = await Promise.all([aRef.get(), pRef.get()]);
    attempt = attemptSnap.data();
    privateData = privateSnap.data();
    assertAttemptToken(privateData, token);
  }

  let paper = null;
  if (attempt.status === "running") {
    const questions = await readQuestions(quizId);
    paper = contractForQuestions(questions, privateData).paper;
  }
  return attemptPublicState(attempt, currentQuiz, paper);
});

exports.submitAssessmentAttempt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const autoSubmitted = request.data?.autoSubmitted === true;
  const db = getFirestore();
  const quizRef = db.doc(`quizzes/${quizId}`);
  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  const sRef = submissionRef(quizId, id);
  let receipt;

  await db.runTransaction(async tx => {
    const quizSnap = await tx.get(quizRef);
    const attemptSnap = await tx.get(aRef);
    const privateSnap = await tx.get(pRef);
    const existingSubmission = await tx.get(sRef);
    if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
    const attempt = attemptSnap.data();
    const privateData = privateSnap.data();
    assertAttemptToken(privateData, token);
    if (existingSubmission.exists || attempt.status === "submitted") {
      if (!existingSubmission.exists) throw new HttpsError("data-loss", "Die abgeschlossene Abgabe fehlt.");
      receipt = makeReceipt({ id: existingSubmission.id, ...existingSubmission.data() }, quizSnap.exists ? quizSnap.data() : null, privateData);
      return;
    }
    if (!quizSnap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht mehr.");
    const quiz = quizSnap.data();
    const nowMillis = Date.now();
    validateSubmissionWindow(quiz, attempt, nowMillis);
    assertSameRun(attempt, quiz, quizId);
    if (attempt.status !== "running") throw new HttpsError("failed-precondition", "Der Test wurde für diesen Versuch noch nicht gestartet.");

    const startedAtMillis = toMillis(attempt.startedAt);
    const deadlineAtMillis = toMillis(attempt.deadlineAt) || deadlineMillis(startedAtMillis, attempt.timeLimitMinutes);
    if (deadlineAtMillis && nowMillis > deadlineAtMillis + SUBMIT_GRACE_SECONDS * 1000) {
      throw new HttpsError("deadline-exceeded", "Die serverseitige Abgabefrist ist abgelaufen. Bitte wende dich an deine Lehrkraft.");
    }
    const gradingKey = Array.isArray(privateData.gradingKey) ? privateData.gradingKey : [];
    const decoderShape = Array.isArray(privateData.decoderShape) ? privateData.decoderShape : [];
    const paperSecret = String(privateData.paperSecret || "");
    if (!gradingKey.length || !decoderShape.length || !paperSecret) {
      throw new HttpsError("data-loss", "Der serverseitige Bewertungsschlüssel fehlt.");
    }

    const secureAnswers = sanitizeAnswersForStorage(gradingKey, request.data?.answers);
    const result = gradeSubmission(gradingKey, secureAnswers);
    const teacherAnswers = decodeSubmissionAnswersFromShape(decoderShape, secureAnswers, paperSecret);
    const scale = attempt.gradeScaleSnapshot?.thresholds?.length === 6 ? attempt.gradeScaleSnapshot : gradingScaleSnapshot(quiz);
    const grade = result.needsReview ? null : gradeFromPercent(result.percent, scale.thresholds);
    const resultMode = normalizeResultMode(attempt.resultMode);
    const submittedAt = Timestamp.now();
    const elapsedSeconds = startedAtMillis ? Math.max(0, Math.round((nowMillis - startedAtMillis) / 1000)) : null;
    const lateSeconds = deadlineAtMillis ? Math.max(0, Math.round((nowMillis - deadlineAtMillis) / 1000)) : 0;
    const submission = {
      attemptId: id,
      studentName: attempt.studentName,
      answers: teacherAnswers,
      grading: result.grading,
      autoPoints: result.autoPoints,
      totalPoints: result.totalPoints,
      maxPoints: result.maxPoints,
      percent: result.percent,
      grade,
      gradeScaleSnapshot: scale,
      resultMode,
      showSolutionsAfterEnd: attempt.showSolutionsAfterEnd === true,
      status: result.needsReview ? "review" : "graded",
      timeLimitMinutes: attempt.timeLimitMinutes || null,
      sessionRunId: attempt.sessionRunId || null,
      startMode: attempt.mode,
      startedAtServerMillis: startedAtMillis,
      elapsedSeconds,
      autoSubmitted,
      lateSeconds,
      secureAssessmentVersion: 2,
      secureAnswerDigest: sha256(JSON.stringify(secureAnswers)),
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
      decoderShape: FieldValue.delete(),
      paperSecret: FieldValue.delete(),
      sourceFingerprint: FieldValue.delete(),
      authoringFingerprint: FieldValue.delete(),
      updatedAt: submittedAt
    });
    receipt = makeReceipt(submission, quiz, privateData);
  });
  return { receipt };
});

exports.getAssessmentReceipt = onCall(callableOpts, async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const [quizSnap, attemptSnap, privateSnap, submissionSnap] = await Promise.all([
    getFirestore().doc(`quizzes/${quizId}`).get(),
    attemptRef(quizId, id).get(),
    assessmentPrivateRef(quizId, id).get(),
    submissionRef(quizId, id).get()
  ]);
  if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
  assertAttemptToken(privateSnap.data(), token);
  if (!submissionSnap.exists) throw new HttpsError("failed-precondition", "Für diesen Versuch liegt noch keine Abgabe vor.");
  return {
    receipt: makeReceipt(
      { id: submissionSnap.id, ...submissionSnap.data() },
      quizSnap.exists ? quizSnap.data() : null,
      privateSnap.data()
    )
  };
});
