"use strict";
const { createHash } = require("node:crypto");
const { HttpsError } = require("firebase-functions/v2/https");
const { runMediaOperation } = require("./media-operation");
const { MEDIA_POLICY } = require("./constants");
function millis(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.getTime === "function") return value.getTime();
  return Number(value?.seconds || 0) * 1000 + Number(value?.nanoseconds || 0) / 1000000;
}
function mediaJobFresh(job, now = Date.now()) {
  const created = millis(job.createdAt);
  if (job.input?.creationContractVersion < 2 || !job.input?.creationContractVersion) return now - created < 40 * 60000;
  return now - created < MEDIA_POLICY.maxJobHours * 3600000 && now - millis(job.updatedAt || job.createdAt) < 40 * 60000;
}
function continuationId(jobId, step) { return `${jobId}-media-${step}`; }
function createMediaJobRunner({ db, uid, jobId, jobRef, resultStore, retryFailed = false }) {
  async function guard() {
    const job = (await jobRef.get()).data();
    if (!job || job.ownerId !== uid) throw new HttpsError("permission-denied", "Kein Zugriff auf diesen Medienauftrag.");
    if (job.cancelRequested || job.status !== "running") throw new HttpsError("cancelled", "Medienerstellung wurde gestoppt. Fertige Spuren bleiben für eine ausdrückliche Fortsetzung erhalten.");
    const user = (await db.doc(`users/${uid}`).get()).data();
    const deletion = await db.doc(`accountDeletions/${uid}`).get();
    if (!user || deletion.exists || user.accountDeletionId || user.status && user.status !== "active") throw new HttpsError("permission-denied", "Konto nicht aktiv.");
    if (job.quizId) {
      const quiz = (await db.doc(`quizzes/${job.quizId}`).get()).data();
      if (!quiz || quiz.ownerId !== uid || quiz.rightsHold || quiz.isDeleted || quiz.published || quiz.generationStatus !== "running") throw new HttpsError("failed-precondition", "Der Test kann während dieses Medienauftrags nicht weiter verändert werden.");
    }
    return job;
  }
  async function run(kind, key, input, generate) {
    await guard();
    const operationId = createHash("sha256").update(`${jobId}:${kind}:${key}`).digest("hex");
    const result = await runMediaOperation({ db, uid, operationId, kind, resultStore, retryFailed: kind !== "plan" && retryFailed,
      request: { quizId: jobId, questionId: key, input } }, async () => {
      try { await guard(); }
      catch (error) {
        error.details = { ...error.details, providerNotStarted: true, reason: "pre-provider-guard" };
        throw error;
      }
      return generate();
    });
    await guard();
    return result;
  }
  return { run, guard };
}
module.exports = { createMediaJobRunner, mediaJobFresh, continuationId, millis };
