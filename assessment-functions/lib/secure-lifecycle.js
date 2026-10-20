"use strict";
const {snapshotChapterQuestions}=require("./chapter-media");
const {reviewChapterResults}=require("./chapter-results");
const {aggregateChapterResults}=require("./shared/chapter-contract");

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
  authoringFingerprint,
  gradeSubmission,
  gradeFromPercent,
  sanitizeAnswersForStorage,
  publicQuizMetadata,
  assertNoSolutionLeak
} = require("./assessment-core");
const {offlineRecovery}=require("./offline-recovery-policy");
const { audioReleaseBlockedByMetadata, audioReleaseBlockedByQuestions } = require("./audio-release-gate");
const {
  buildTeacherDecoderShape,
  decodeSubmissionAnswersFromShape
} = require("./teacher-answer-decoder");

if (!getApps().length) initializeApp();

const logger = require("firebase-functions/logger");
const { observeAssessment } = require("./observability");
const observed = (action, handler) => observeAssessment(action, handler, { logger, HttpsError });

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

const PRACTICE_MODE = "practice_after_submit";

function publicationRevision(quiz, fingerprint, audioDocs = []) {
  return sha256(JSON.stringify({
    version: 1, fingerprint,
    solutionReleaseMode: quiz.solutionReleaseMode || "exam_after_end",
    showSolutions: quiz.showSolutions === true,
    resultMode: normalizeResultMode(quiz.resultMode),
    startMode: sessionMode(quiz), timeLimitMinutes: timeLimitMinutes(quiz),
    gradeScaleSnapshot: gradingScaleSnapshot(quiz),
    contentLocale: quiz.contentLocale || "de-DE", gradingLocale: quiz.gradingLocale || quiz.contentLocale || "de-DE",
    audio: audioDocs.map(item => [item.id, sha256(String(item.data()?.solutionAudioDataUrl || "")), item.data()?.solutionNeedsRegeneration === true]).sort((a, b) => a[0].localeCompare(b[0]))
  }));
}

async function readSolutionAudio(quizId, tx) {
  return (await tx.get(getFirestore().collection(`quizzes/${quizId}/audioScripts`))).docs;
}

function snapshotSolutionAudio(quizId, revision, solutions, audioDocs) {
  const audio = new Map(audioDocs.map(item => [item.id, item.data()]));
  const refs = {};
  const assets = [];
  for (const solution of solutions) {
    const data = audio.get(solution.id);
    const src = String(data?.solutionAudioDataUrl || "");
    if (data?.solutionNeedsRegeneration === true || !src.startsWith("data:audio/") || Buffer.byteLength(src) > 950_000) continue;
    const digest = sha256(src);
    const assetId = sha256(`${quizId}:${revision}:${solution.id}:${digest}`);
    refs[solution.id] = { assetId, digest, revision };
    assets.push({ assetId, data: { quizId, revision, questionId: solution.id, digest, audio: { src, aiGenerated: data.solutionAudioAiGenerated !== false } } });
  }
  return { refs, assets };
}

async function persistSolutionAssets(quizId, assets) {
  // Only final, committed attempt bytes reach this writer. Separate bounded
  // commits avoid Firestore's 10 MiB request limit; the quiz read prevents
  // recreating orphaned assets after a concurrent hard deletion or hold.
  const db = getFirestore();
  let chunk = [];
  let bytes = 0;
  const commit = entries => db.runTransaction(async tx => {
    const quiz = await tx.get(db.doc(`quizzes/${quizId}`));
    if (!quiz.exists || quiz.data()?.isDeleted === true || quiz.data()?.rightsHold === true) {
      throw new HttpsError("failed-precondition", "Dieser Test ist nicht mehr verfügbar.");
    }
    for (const asset of entries) tx.set(db.doc(`assessmentSolutionAssets/${asset.assetId}`), asset.data);
  });
  for (const asset of assets || []) {
    const size = Buffer.byteLength(JSON.stringify(asset.data)) + 1024;
    if (chunk.length && (bytes + size > 7_500_000 || chunk.length >= 400)) {
      await commit(chunk); chunk = []; bytes = 0;
    }
    chunk.push(asset); bytes += size;
  }
  if (chunk.length) await commit(chunk);
}

async function authorizePolicyTeacher(request, quiz, tx) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Bitte als Lehrkraft anmelden.");
  const ownerId = String(quiz?.ownerId || "");
  if (!ownerId) throw new HttpsError("permission-denied", "Die zuständige Lehrkraft fehlt.");
  const [user, deletion, owner, ownerDeletion] = await Promise.all([
    tx.get(getFirestore().doc(`users/${uid}`)), tx.get(getFirestore().doc(`accountDeletions/${uid}`)),
    tx.get(getFirestore().doc(`users/${ownerId}`)), tx.get(getFirestore().doc(`accountDeletions/${ownerId}`))
  ]);
  const data = user.data() || {};
  if (!user.exists || deletion.exists || (data.status || "active") !== "active"
    || data.accountDeletionId || !["teacher", "admin"].includes(data.role || "teacher")
    || (uid !== ownerId && data.role !== "admin")
    || !owner.exists || ownerDeletion.exists || owner.data()?.accountDeletionId
    || (owner.data()?.status || "active") !== "active") {
    throw new HttpsError("permission-denied", "Für diesen Test fehlt die Berechtigung zur Lösungsfreigabe.");
  }
}

// Private publication evidence cannot be forged through client quiz writes.
// A draft practice flag is never itself an authorization.
async function configurePracticeSolutionReleaseHandler(request) {
  const quizId = cleanQuizId(request.data?.quizId);
  const action = request.data?.action;
  if (!["prepare", "publish", "release"].includes(action)) throw new HttpsError("invalid-argument", "Ungültige Freigabeaktion.");
  const db = getFirestore();
  const quizRef = db.doc(`quizzes/${quizId}`);
  const policyRef = db.doc(`assessmentPolicies/${quizId}`);
  return db.runTransaction(async tx => {
    const quizSnap = await tx.get(quizRef);
    if (!quizSnap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
    const quiz = quizSnap.data();
    await authorizePolicyTeacher(request, quiz, tx);
    if (quiz.isDeleted === true || quiz.rightsHold === true) throw new HttpsError("failed-precondition", "Dieser Test ist gesperrt.");
    if (action === "release") {
      const saved = await tx.get(policyRef);
      const policy = saved.data();
      if (!saved.exists || policy.version !== 1 || policy.mode !== PRACTICE_MODE
        || policy.sessionRunId !== effectiveRunId(quiz, quizId)) {
        throw new HttpsError("failed-precondition", "Diese Testrunde wurde nicht als Übung veröffentlicht.");
      }
      if (request.data?.expectedRevision !== policy.revision) throw new HttpsError("aborted", "Die Übungsrunde wurde geändert.");
      if (request.data?.confirmAfterSubmit !== true) throw new HttpsError("failed-precondition", "Bitte die Sichtbarkeit nach Abgabe bestätigen.");
      // Do not read current questions or keys: existing private attempt snapshots
      // are the only source for an already submitted practice attempt.
      tx.update(policyRef, { released: true, updatedAt: Timestamp.now() });
      tx.update(quizRef, { practiceSolutionsReleased: true, updatedAt: Timestamp.now() });
      return { revision: policy.revision, released: true };
    }
    if (quiz.chapterSchemaVersion != null && quiz.chapterSchemaVersion !== 1) throw new HttpsError("failed-precondition","Diese Kapitelversion wird noch nicht unterstützt.");
    if (quiz.chapterSchemaVersion === 1 && quiz.solutionReleaseMode !== PRACTICE_MODE) {
      if (quiz.published === true && quiz.ended !== true) throw new HttpsError("failed-precondition","Die laufende Runde ist unveränderlich.");
      if (audioReleaseBlockedByMetadata(quiz) || quiz.audioReady === false || quiz.showSolutions === true && quiz.solutionAudioReady === false) throw new HttpsError("failed-precondition","Bitte die Audios vor Veröffentlichung prüfen.");
      const questions=await readQuestions(quizId,tx);
      let revision;
      try { revision=authoringFingerprint(questions,contractOptions(quiz)); } catch { throw new HttpsError("failed-precondition","Bitte Kapiteltitel und Aufgabenzuordnung prüfen."); }
      if(action==="prepare") return {revision,needsConfirmation:false};
      if(request.data?.expectedRevision!==revision) throw new HttpsError("aborted","Der Test wurde geändert. Bitte erneut prüfen.");
      const now=Timestamp.now();const runId=sessionMode(quiz)==="teacher"?`run_${randomBytes(16).toString("hex")}`:null;
      const patch={published:true,ended:false,publishedAt:now,reopenedAt:now,chapterPublicationRevision:revision,sessionState:sessionMode(quiz)==="teacher"?"waiting":"open",sessionRunId:runId,sessionStartedAt:null,updatedAt:now};
      tx.update(quizRef,patch);return {...patch,revision};
    }
    if (quiz.solutionReleaseMode !== PRACTICE_MODE) throw new HttpsError("failed-precondition", "Bitte ausdrücklich den Übungsmodus wählen.");
    if (quiz.published === true && quiz.ended !== true) throw new HttpsError("failed-precondition", "Die laufende Runde darf nicht umgestellt werden.");
    if (audioReleaseBlockedByMetadata(quiz) || quiz.audioReady === false
      || quiz.showSolutions === true && quiz.solutionAudioReady === false) throw new HttpsError("failed-precondition", "Die Audios sind noch nicht bereit.");
    const questions = await readQuestions(quizId, tx);
    if (!questions.length) throw new HttpsError("failed-precondition", "Dieser Test enthält keine Aufgaben.");
    const audio = await readSolutionAudio(quizId, tx);
    const revision = publicationRevision(quiz, authoringFingerprint(questions, contractOptions(quiz)), audio);
    const needsConfirmation = quiz.showSolutions === true;
    if (action === "prepare") return { revision, needsConfirmation };
    if (request.data?.expectedRevision !== revision) throw new HttpsError("aborted", "Inhalt oder Einstellungen wurden geändert. Bitte erneut veröffentlichen.");
    if (needsConfirmation && request.data?.confirmAfterSubmit !== true) throw new HttpsError("failed-precondition", "Bitte die Sichtbarkeit nach Abgabe bestätigen.");
    const now = Timestamp.now();
    const runId = sessionMode(quiz) === "teacher" ? `run_${randomBytes(16).toString("hex")}` : null;
    const publishedQuiz = { ...quiz, publishedAt: now, reopenedAt: now, sessionRunId: runId };
    const policy = { version: 1, mode: PRACTICE_MODE, revision, sessionRunId: effectiveRunId(publishedQuiz, quizId), released: needsConfirmation, updatedAt: now };
    tx.set(policyRef, policy);
    const patch = {
      published: true, ended: false, publishedAt: now, reopenedAt: now,
      sessionState: sessionMode(quiz) === "teacher" ? "waiting" : "open", sessionRunId: runId, sessionStartedAt: null,
      ...(quiz.chapterSchemaVersion===1?{chapterPublicationRevision:authoringFingerprint(questions,contractOptions(quiz))}:{}),
      practiceSolutionRevision: revision, practiceSolutionsReleased: needsConfirmation,
      contentLocale: quiz.contentLocale || "de-DE", gradingLocale: quiz.gradingLocale || quiz.contentLocale || "de-DE",
      localeContractVersion: Number(quiz.localeContractVersion) || 1, updatedAt: now
    };
    tx.update(quizRef, patch);
    return { revision, published: true, sessionRunId: runId, sessionState: patch.sessionState, practiceSolutionsReleased: needsConfirmation };
  });
}
exports.configurePracticeSolutionRelease=onCall(callableOpts,observed("configurePracticeSolutionRelease",configurePracticeSolutionReleaseHandler));
exports.publishChapterAssessment=onCall(callableOpts,observed("publishChapterAssessment",configurePracticeSolutionReleaseHandler));

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
  if (audioReleaseBlockedByMetadata(quiz)) throw new HttpsError("failed-precondition", "Diese Audioaufgaben sind noch nicht für Schüler freigegeben.");
  if (quiz.audioReady === false) throw new HttpsError("failed-precondition", "Audios dieses Tests müssen vor dem Start vervollständigt werden.");
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
    ...(quiz.chapterSchemaVersion != null ? {chapterSchemaVersion:quiz.chapterSchemaVersion,chapters:quiz.chapters}:{}),
    shuffleQuestions: quiz.shuffleQuestions === true,
    shuffleAnswers: quiz.shuffleAnswers === true
  };
}

function contractOptionsEqual(a, b) {
  return a.shuffleQuestions === b.shuffleQuestions && a.shuffleAnswers === b.shuffleAnswers && JSON.stringify(a.chapters||null)===JSON.stringify(b.chapters||null) && a.chapterSchemaVersion===b.chapterSchemaVersion;
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
      const extras = (Array.isArray(question.acceptedOrders) ? question.acceptedOrders : [])
        .map(order => Array.isArray(order) ? order : order?.indices).filter(Array.isArray);
      const alternatives = [primary, ...extras]
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
    serverNowMillis: Date.now(),
    timeLimitMinutes: attempt.timeLimitMinutes || null,
    ...(attempt.chapterContractVersion===1?{chapterContractVersion:1,chapters:attempt.chapters}:{}),
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

async function readQuestions(quizId, tx = null) {
  const query = getFirestore().collection(`quizzes/${quizId}/questions`).orderBy("position");
  const snap = await (tx ? tx.get(query) : query.get());
  const questions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (audioReleaseBlockedByQuestions(questions)) throw new HttpsError("failed-precondition", "Diese Audioaufgaben sind noch nicht für Schüler freigegeben.");
  return questions;
}

async function readStartQuota(request, quizId, tx) {
  const ip = String(request.rawRequest?.ip || "unknown");
  const day = new Date().toISOString().slice(0, 10);
  const rateId = sha256(`assessment-start:v1:${day}:${quizId}:${ip}`);
  const ref = getFirestore().doc(`assessmentRateLimits/${day}-${rateId}`);
  const snap = await tx.get(ref);
  const count = Number(snap.data()?.count || 0);
  if (count >= START_RATE_LIMIT_PER_DAY) {
    throw new HttpsError("resource-exhausted", "Für diesen Test wurden von diesem Anschluss heute ungewöhnlich viele Starts angefordert.");
  }
  // Firestore requires every read before the first write. The caller writes this
  // increment atomically with the new attempt after reading/building its paper.
  return { ref, data: { count: count + 1, quizId, day, updatedAt: Timestamp.now() } };
}

function makeReceipt(submission, quiz = null, privateData = null, publicationPolicy = null) {
  const mode = normalizeResultMode(submission?.resultMode);
  const frozen = privateData?.solutionPolicy;
  const practice = frozen?.version === 1 && frozen.mode === PRACTICE_MODE
    && submission?.solutionPolicy?.version === 1 && submission.solutionPolicy.mode === PRACTICE_MODE
    && frozen.revision === submission.solutionPolicy.revision
    && frozen.sessionRunId === submission.sessionRunId && frozen.sessionRunId === privateData.sessionRunId
    && privateData.attemptId === submission.attemptId;
  const practiceReleased = practice && (frozen.enabled === true || publicationPolicy?.version === 1
    && publicationPolicy.mode === PRACTICE_MODE && publicationPolicy.revision === frozen.revision
    && publicationPolicy.sessionRunId === frozen.sessionRunId && publicationPolicy.released === true);
  const configured = practice || submission?.showSolutionsAfterEnd === true && mode !== "none";
  const endedAtMillis = toMillis(quiz?.endedAt);
  const examReleased = !practice && configured
    && quiz?.ended === true
    && Number.isFinite(endedAtMillis)
    && Date.now() > endedAtMillis + END_SUBMIT_GRACE_SECONDS * 1000;
  const released = (practiceReleased || examReleased)
    && quiz != null
    && quiz?.isDeleted !== true
    && quiz?.rightsHold !== true
    && !(submission?.recoveryReviewRequired === true && submission?.status === "review")
    && Array.isArray(privateData?.solutionSnapshot);
  const receipt = {
    submissionId: submission?.attemptId || submission?.id || null,
    attemptId: submission?.attemptId || null,
    status: submission?.status || "graded",
    needsReview: submission?.status === "review",
    resultMode: mode,
    submittedAtMillis: toMillis(submission?.submittedAt),
    solutionsConfigured: configured,
    solutionReleaseMode: practice ? PRACTICE_MODE : "exam_after_end",
    solutionsReleased: released
  };
  if (!receipt.needsReview && ["points", "points_percent", "points_grade"].includes(mode)) {
    receipt.totalPoints = Number(submission?.totalPoints) || 0;
    receipt.maxPoints = Number(submission?.maxPoints) || 0;
    if(submission?.chapterSnapshot) receipt.chapterResults=aggregateChapterResults(submission.chapterSnapshot,submission.grading).map(result=>{const safe={chapterId:result.chapterId,title:result.title,awardedPoints:result.awardedPoints,maxPoints:result.maxPoints};if(["points_percent","points_grade"].includes(mode))safe.percent=result.percent;return safe;});
  }
  if (!receipt.needsReview && ["points_percent", "points_grade"].includes(mode)) receipt.percent = Number(submission?.percent) || 0;
  if (!receipt.needsReview && mode === "points_grade" && submission?.grade != null) receipt.grade = Number(submission.grade);
  if (released) receipt.solutions = privateData.solutionSnapshot;
  return receipt;
}

async function attachReleasedSolutionAudio(quizId, receipt, privateData) {
  if (!receipt?.solutionsReleased || !Array.isArray(receipt.solutions) || !receipt.solutions.length) return receipt;
  // Legacy attempts have no immutable audio evidence. Never attach current
  // author audio merely because its question id matches an older solution.
  const refs = privateData?.solutionAudioRefs || {};
  let audioBytes = 0;
  let partial = false;
  const solutions = [];
  for (const solution of receipt.solutions) {
    const ref = refs[String(solution?.id || "")];
    if (!ref || !/^[a-f0-9]{64}$/.test(ref.assetId || "")) { solutions.push(solution); continue; }
    const snapshot = await getFirestore().doc(`assessmentSolutionAssets/${ref.assetId}`).get();
    const asset = snapshot.data();
    if (!snapshot.exists || asset.quizId !== quizId || asset.revision !== ref.revision
      || asset.questionId !== solution.id || asset.digest !== ref.digest
      || sha256(String(asset.audio?.src || "")) !== ref.digest) { solutions.push(solution); continue; }
    const size = Buffer.byteLength(String(asset.audio?.src || ""));
    if (audioBytes + size > 8_000_000) { partial = true; solutions.push(solution); continue; }
    audioBytes += size;
    solutions.push({ ...solution, audio: asset.audio });
  }
  return { ...receipt, solutions, ...(partial ? { solutionAudioPartial: true } : {}) };
}

async function buildReleasedReceipt(quizId, submission, quiz, privateData) {
  const policy = privateData?.solutionPolicy?.mode === PRACTICE_MODE
    ? (await getFirestore().doc(`assessmentPolicies/${quizId}`).get()).data() : null;
  return attachReleasedSolutionAudio(quizId, makeReceipt(submission, quiz, privateData, policy), privateData);
}

function contractForQuestions(questions, privateData) {
  if (!privateData?.paperSecret) throw new HttpsError("data-loss", "Die sichere Aufgabenabbildung fehlt.");
  const options = {
    ...(privateData.chapterSnapshot?{chapterSchemaVersion:1,chapters:privateData.chapterSnapshot.chapters}:{}),
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

exports.getAssessmentInfo = onCall(callableOpts, observed("getAssessmentInfo", async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const { data: quiz } = await readQuiz(quizId);
  validateQuizOpen(quiz);
  return { quiz: publicQuizState(quiz, quizId), capabilities: { offlineRecovery: 1, chapters: 1 } };
}));

exports.startAssessmentAttempt = onCall(callableOpts, observed("startAssessmentAttempt", async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const studentName = cleanStudentName(request.data?.studentName);
  const clientAttemptId = cleanClientAttemptId(request.data?.clientAttemptId);
  const attemptToken = cleanAttemptToken(request.data?.attemptToken);
  const db = getFirestore();
  const { ref: quizRef, data: initialQuiz } = await readQuiz(quizId);
  validateQuizOpen(initialQuiz);
  if(initialQuiz.chapterSchemaVersion != null && (initialQuiz.chapterSchemaVersion!==1 || request.data?.clientCapabilities?.chapters!==1)) throw new HttpsError("failed-precondition","Bitte öffne diesen Kapiteltest in der aktuellen GradeCrew-Webversion.");
  const initialRunId = effectiveRunId(initialQuiz, quizId);
  const initialOptions = contractOptions(initialQuiz);
  const id = deriveAttemptId(quizId, initialRunId, clientAttemptId);
  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  // Only the final, committed callback result may escape a transaction retry.
  const { storedAttempt, storedPrivate, currentQuiz, newContract, solutionAssets } = await db.runTransaction(async tx => {
    const quizSnap = await tx.get(quizRef);
    const existingAttempt = await tx.get(aRef);
    const existingPrivate = await tx.get(pRef);
    if (!quizSnap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht.");
    const currentQuiz = quizSnap.data();
    validateQuizOpen(currentQuiz);
    const currentRunId = effectiveRunId(currentQuiz, quizId);
    if (currentRunId !== initialRunId || !contractOptionsEqual(contractOptions(currentQuiz), initialOptions)) {
      throw new HttpsError("aborted", "Der Test wurde gerade geändert. Bitte erneut starten.");
    }

    if (existingAttempt.exists || existingPrivate.exists) {
      if (!existingAttempt.exists || !existingPrivate.exists) throw new HttpsError("data-loss", "Der Bearbeitungsversuch ist unvollständig gespeichert.");
      const storedAttempt = existingAttempt.data();
      const storedPrivate = existingPrivate.data();
      assertAttemptToken(storedPrivate, attemptToken);
      if (String(storedAttempt.studentName || "") !== studentName) {
        throw new HttpsError("permission-denied", "Dieser Bearbeitungsversuch wurde bereits mit einem anderen Kürzel gestartet.");
      }
      assertSameRun(storedAttempt, currentQuiz, quizId);
      let solutionAssets = [];
      if (Object.keys(storedPrivate.solutionAudioRefs || {}).length) {
        const audio = await readSolutionAudio(quizId, tx);
        const revision = Object.values(storedPrivate.solutionAudioRefs)[0].revision;
        const candidates = snapshotSolutionAudio(quizId, revision, storedPrivate.solutionSnapshot || [], audio).assets;
        // Repair only the exact old media bytes, never newly edited author audio.
        for (const asset of candidates) {
          if (storedPrivate.solutionAudioRefs[asset.data.questionId]?.assetId === asset.assetId
            && !(await tx.get(db.doc(`assessmentSolutionAssets/${asset.assetId}`))).exists) solutionAssets.push(asset);
        }
      }
      if(storedPrivate.chapterSnapshot) {
        const refs=new Set((storedPrivate.chapterQuestions||[]).map(q=>q.reviewMediaAssetId).filter(Boolean));
        solutionAssets.push(...snapshotChapterQuestions(quizId,await readQuestions(quizId,tx)).assets.filter(a=>refs.has(a.assetId)));
      }
      return { storedAttempt, storedPrivate, currentQuiz, newContract: null, solutionAssets };
    }

    // Quota/authentication must precede the expensive author-question query.
    const quota = await readStartQuota(request, quizId, tx);
    const policySnap = currentQuiz.solutionReleaseMode === PRACTICE_MODE ? await tx.get(db.doc(`assessmentPolicies/${quizId}`)) : null;
    const questions = await readQuestions(quizId, tx);
    if (!questions.length) throw new HttpsError("failed-precondition", "Dieser Test enthält keine Aufgaben.");
    const newPaperSecret = createPaperSecret();
    const newContract = buildAssessmentContract(questions, newPaperSecret, initialOptions);
    assertNoSolutionLeak(newContract.paper);
    if(newContract.chapterSnapshot && currentQuiz.chapterPublicationRevision!==newContract.authoringFingerprint) throw new HttpsError("failed-precondition","Die Kapitelveröffentlichung muss erneut geprüft werden.");
    const newDecoderShape = buildTeacherDecoderShape(questions);
    const newSolutionSnapshot = buildSolutionSnapshot(questions);
    const now = Date.now();
    const mode = sessionMode(currentQuiz);
    const status = attemptStatusForStart(currentQuiz);
    const startedAtMillis = attemptStartMillis(currentQuiz, now);
    const limit = timeLimitMinutes(currentQuiz);
    const deadlineAt = deadlineMillis(startedAtMillis, limit);
    const scale = gradingScaleSnapshot(currentQuiz);
    const resultMode = normalizeResultMode(currentQuiz.resultMode);
    const showSolutionsAfterEnd = currentQuiz.solutionReleaseMode !== PRACTICE_MODE && currentQuiz.showSolutions === true && resultMode !== "none";
    const publicationPolicy = policySnap?.data();
    let solutionPolicy = null;
    let solutionSnapshot = showSolutionsAfterEnd ? newSolutionSnapshot : null;
    let audioSnapshot = { refs: {}, assets: [] };
    const snapshotAudio = currentQuiz.solutionReleaseMode === PRACTICE_MODE || showSolutionsAfterEnd;
    const audio = snapshotAudio ? await readSolutionAudio(quizId, tx) : [];
    if (currentQuiz.solutionReleaseMode === PRACTICE_MODE && publicationPolicy?.version === 1 && publicationPolicy.mode === PRACTICE_MODE && publicationPolicy.sessionRunId === currentRunId) {
      if (publicationPolicy.revision !== publicationRevision(currentQuiz, newContract.authoringFingerprint, audio)) {
        throw new HttpsError("failed-precondition", "Die veröffentlichte Übung wurde geändert. Bitte die Lehrkraft um eine neue Veröffentlichung bitten.");
      }
      solutionPolicy = { version: 1, mode: PRACTICE_MODE, revision: publicationPolicy.revision, sessionRunId: currentRunId, enabled: publicationPolicy.released === true };
      solutionSnapshot = newSolutionSnapshot;
    }
    if (solutionSnapshot) audioSnapshot = snapshotSolutionAudio(quizId, solutionPolicy?.revision || newContract.authoringFingerprint, solutionSnapshot, audio);
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
      solutionPolicy,
      questionCount: newContract.paper.length,
      maxPoints: newContract.gradingKey.reduce((sum, key) => sum + Number(key.points || 0), 0),
      ...(newContract.chapterSnapshot?{chapterContractVersion:1,chapters:newContract.chapterSnapshot.chapters}:{}),
      secureAssessmentVersion: 2,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const privateData = {
      quizId,
      attemptId: id,
      tokenHash: tokenHash(attemptToken),
      paperSecret: newPaperSecret,
      ...(newContract.chapterSnapshot?{chapterSnapshot:newContract.chapterSnapshot,chapterQuestions:snapshotChapterQuestions(quizId,questions).questions}:{}),
      sourceFingerprint: newContract.sourceFingerprint,
      authoringFingerprint: newContract.authoringFingerprint,
      gradingKey: newContract.gradingKey,
      decoderShape: newDecoderShape,
      solutionSnapshot,
      solutionPolicy,
      solutionAudioRefs: audioSnapshot.refs,
      shuffleQuestions: initialOptions.shuffleQuestions,
      shuffleAnswers: initialOptions.shuffleAnswers,
      sessionRunId: currentRunId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    assertPrivatePayloadSafe(privateData);
    tx.set(quota.ref, quota.data, { merge: true });
    tx.create(aRef, created);
    tx.create(pRef, privateData);
    return { storedAttempt: created, storedPrivate: privateData, currentQuiz, newContract, solutionAssets: [...audioSnapshot.assets,...(newContract.chapterSnapshot?snapshotChapterQuestions(quizId,questions).assets:[])] };
  });

  await persistSolutionAssets(quizId, solutionAssets);

  if (storedAttempt.status === "submitted") {
    const saved = await submissionRef(quizId, id).get();
    if (!saved.exists) throw new HttpsError("data-loss", "Die abgeschlossene Abgabe fehlt.");
    return {
      ...attemptPublicState(storedAttempt, currentQuiz || initialQuiz, null),
      receipt: await buildReleasedReceipt(quizId, { id: saved.id, ...saved.data() }, currentQuiz || initialQuiz, storedPrivate)
    };
  }
  const contract = newContract || contractForQuestions(await readQuestions(quizId), storedPrivate);
  return attemptPublicState(storedAttempt, currentQuiz || initialQuiz, storedAttempt.status === "running" ? contract.paper : null);
}));

exports.resumeAssessmentAttempt = onCall(callableOpts, observed("resumeAssessmentAttempt", async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const stateOnly = request.data?.stateOnly === true;
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
      receipt: await buildReleasedReceipt(quizId, { id: submissionSnap.id, ...submissionSnap.data() }, initialQuiz, privateData)
    };
  }

  if (stateOnly) validateSubmissionWindow(initialQuiz, attempt, Date.now());
  else validateQuizOpen(initialQuiz);
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
  if (attempt.status === "running" && !stateOnly) {
    const questions = await readQuestions(quizId);
    paper = contractForQuestions(questions, privateData).paper;
  }
  return attemptPublicState(attempt, currentQuiz, paper);
}));

exports.submitAssessmentAttempt = onCall(callableOpts, observed("submitAssessmentAttempt", async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const autoSubmitted = request.data?.autoSubmitted === true;
  const db = getFirestore();
  const quizRef = db.doc(`quizzes/${quizId}`);
  const aRef = attemptRef(quizId, id);
  const pRef = assessmentPrivateRef(quizId, id);
  const sRef = submissionRef(quizId, id);
  const receiptContext = await db.runTransaction(async tx => {
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
      return { submission: { id: existingSubmission.id, ...existingSubmission.data() }, quiz: quizSnap.exists ? quizSnap.data() : null, privateData };
    }
    if (!quizSnap.exists) throw new HttpsError("not-found", "Dieser Test existiert nicht mehr.");
    const quiz = quizSnap.data();
    const nowMillis = Date.now();
    const startedAtMillis = toMillis(attempt.startedAt);
    const deadlineAtMillis = toMillis(attempt.deadlineAt) || deadlineMillis(startedAtMillis, attempt.timeLimitMinutes);
    let recovery;
    try {
      recovery=offlineRecovery({requested:request.data?.recoverySubmission,now:nowMillis,startedAt:startedAtMillis,
        deadlineAt:deadlineAtMillis,quiz,sameRun:effectiveRunId(quiz,quizId)===attempt.sessionRunId,
        status:attempt.status,reason:request.data?.recoveryReason});
    } catch(error) { throw new HttpsError(error.code||"failed-precondition",error.message); }
    if (!recovery?.review) {
      validateSubmissionWindow(quiz, attempt, nowMillis);
      assertSameRun(attempt, quiz, quizId);
    }
    if (attempt.status !== "running") throw new HttpsError("failed-precondition", "Der Test wurde für diesen Versuch noch nicht gestartet.");
    if (!recovery?.review && deadlineAtMillis && nowMillis > deadlineAtMillis + SUBMIT_GRACE_SECONDS * 1000) {
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
    const needsReview = result.needsReview || recovery?.review === true;
    const grade = needsReview ? null : gradeFromPercent(result.percent, scale.thresholds);
    const resultMode = normalizeResultMode(attempt.resultMode);
    const submittedAt = Timestamp.now();
    const elapsedSeconds = startedAtMillis ? Math.max(0, Math.round((nowMillis - startedAtMillis) / 1000)) : null;
    const lateSeconds = deadlineAtMillis ? Math.max(0, Math.round((nowMillis - deadlineAtMillis) / 1000)) : 0;
    const submission = {
      attemptId: id,
      studentName: attempt.studentName,
      answers: teacherAnswers,
      grading: result.grading,
      ...(privateData.chapterSnapshot?{chapterSnapshot:privateData.chapterSnapshot,chapterQuestions:privateData.chapterQuestions||[],chapterResults:aggregateChapterResults(privateData.chapterSnapshot,result.grading),reviewRevision:0}:{}),
      autoPoints: result.autoPoints,
      totalPoints: result.totalPoints,
      maxPoints: result.maxPoints,
      percent: result.percent,
      grade,
      gradeScaleSnapshot: scale,
      resultMode,
      showSolutionsAfterEnd: attempt.showSolutionsAfterEnd === true,
      solutionPolicy: privateData.solutionPolicy || null,
      status: needsReview ? "review" : "graded",
      recoveryReviewRequired: recovery?.review === true,
      recoveryReason: recovery?.reason || null,
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
    return { submission, quiz, privateData };
  });
  return { receipt: await buildReleasedReceipt(quizId, receiptContext.submission, receiptContext.quiz, receiptContext.privateData) };
}));

exports.getAssessmentReceipt = onCall(callableOpts, observed("getAssessmentReceipt", async request => {
  const quizId = cleanQuizId(request.data?.quizId);
  const id = cleanAttemptId(request.data?.attemptId);
  const token = cleanAttemptToken(request.data?.attemptToken);
  const [quizSnap, attemptSnap, privateSnap, submissionSnap, policySnap] = await Promise.all([
    getFirestore().doc(`quizzes/${quizId}`).get(),
    attemptRef(quizId, id).get(),
    assessmentPrivateRef(quizId, id).get(),
    submissionRef(quizId, id).get(),
    getFirestore().doc(`assessmentPolicies/${quizId}`).get()
  ]);
  if (!attemptSnap.exists || !privateSnap.exists) throw new HttpsError("not-found", "Dieser Bearbeitungsversuch existiert nicht mehr.");
  assertAttemptToken(privateSnap.data(), token);
  if (!submissionSnap.exists) throw new HttpsError("failed-precondition", "Für diesen Versuch liegt noch keine Abgabe vor.");
  const receipt = makeReceipt(
    { id: submissionSnap.id, ...submissionSnap.data() },
    quizSnap.exists ? quizSnap.data() : null,
    privateSnap.data(),
    policySnap.exists ? policySnap.data() : null
  );
  return { receipt: await attachReleasedSolutionAudio(quizId, receipt, privateSnap.data()) };
}));

exports.reviewChapterAssessment=onCall(callableOpts,observed("reviewChapterAssessment",async request=>{
  const quizId=cleanQuizId(request.data?.quizId),id=cleanAttemptId(request.data?.submissionId),db=getFirestore();
  return db.runTransaction(async tx=>{
    const quizRef=db.doc(`quizzes/${quizId}`),sRef=submissionRef(quizId,id);
    const quizSnap=await tx.get(quizRef),submissionSnap=await tx.get(sRef);
    if(!quizSnap.exists||!submissionSnap.exists)throw new HttpsError("not-found","Die Abgabe existiert nicht.");
    const quiz=quizSnap.data();await authorizePolicyTeacher(request,quiz,tx);
    if(quiz.isDeleted===true||quiz.rightsHold===true)throw new HttpsError("failed-precondition","Dieser Test ist gesperrt.");
    const submission=submissionSnap.data();let patch;
    try{patch=reviewChapterResults(submission,request.data?.awards,request.data?.expectedReviewRevision);}catch(error){throw new HttpsError(error.code||"invalid-argument",error.message);}
    const scale=submission.gradeScaleSnapshot?.thresholds?.length===6?submission.gradeScaleSnapshot:gradingScaleSnapshot(quiz);
    patch.grade=gradeFromPercent(patch.percent,scale.thresholds);patch.reviewedAt=Timestamp.now();patch.reviewedBy=request.auth.uid;
    tx.update(sRef,patch);return {reviewRevision:patch.reviewRevision};
  });
}));
