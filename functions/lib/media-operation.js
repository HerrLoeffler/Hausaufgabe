"use strict";
const { createHash } = require("node:crypto");

function problem(code, message, operationId, state) {
  return Object.assign(new Error(message), { code, details: { operationId, mediaState: state } });
}
function timestampMillis(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.getTime === "function") return value.getTime();
  return Number(value?.seconds || 0) * 1000 + Number(value?.nanoseconds || 0) / 1000000;
}
function privateResultStore() {
  const bucket = require("firebase-admin/storage").getStorage().bucket();
  return {
    write: async (path, value) => bucket.file(path).save(JSON.stringify(value), { resumable: false, metadata: { contentType: "application/json", cacheControl: "private, no-store" } }),
    read: async path => {
      try {
        const [metadata] = await bucket.file(path).getMetadata();
        // Same configured cache retention enforced both here and by existing purge.
        const { RETENTION } = require("./constants");
        if (Date.parse(metadata.timeCreated) <= Date.now() - RETENTION.generatedMediaCacheDays * 86400000) return null;
        const [bytes] = await bucket.file(path).download();
        return JSON.parse(bytes.toString("utf8"));
      } catch (error) { if (Number(error.code) === 404) return null; throw error; }
    }
  };
}

async function runMediaOperation({ db, uid, operationId, request, scope, resultStore, kind = "image", retryFailed = false }, generate) {
  if (!uid || String(uid).includes("/") || !/^[a-zA-Z0-9_-]{8,80}$/.test(String(operationId || ""))) {
    throw problem("invalid-argument", "Ungültiger Bildauftrag.", "", "invalid");
  }
  const ref = db.doc(`users/${uid}/aiRuntime/media/requests/${operationId}`);
  const requestHash = request ? createHash("sha256").update(JSON.stringify(request)).digest("hex") : null;
  const expectedScope = scope || request;
  let record;
  if (request) {
    record = { ownerId: uid, quizId: request.quizId, questionId: request.questionId, requestHash, kind, attempt: 1, state: "running", createdAt: new Date(), updatedAt: new Date() };
    try { await ref.create(record); }
    catch (error) { if (error.code !== 6 && error.code !== "already-exists") throw error; record = null; }
  }
  const store = resultStore || privateResultStore();
  if (!record) {
    const existing = await ref.get();
    if (!existing.exists) throw problem("not-found", "Der Bildauftrag ist noch nicht hinterlegt. Es wurde keine neue Berechnung gestartet.", operationId, "missing");
    const previous = existing.data();
    if (previous.kind && previous.kind !== kind) throw problem("failed-precondition", "Dieser Medienauftrag gehört zu einer anderen Medienart.", operationId, "conflict");
    if (previous.ownerId !== uid || expectedScope && (previous.quizId !== expectedScope.quizId || previous.questionId !== expectedScope.questionId)) {
      throw problem("permission-denied", "Dieser Bildauftrag gehört zu einer anderen Aufgabe.", operationId, "conflict");
    }
    if (requestHash && previous.requestHash !== requestHash) throw problem("failed-precondition", "Diese Bildauftrags-ID gehört zu einem anderen Inhalt.", operationId, "conflict");
    if (previous.state === "ready") {
      const recovered = await store.read(previous.resultPath);
      if (kind === "plan" ? Array.isArray(recovered?.test?.questions) : kind === "audio" ? recovered?.asset?.audioDataUrl : recovered?.asset?.imageDataUrl) return recovered;
      throw problem("failed-precondition", "Das gespeicherte Bildergebnis ist abgelaufen. Es wird nicht automatisch neu berechnet.", operationId, "expired");
    }
    if (["running", "unknown"].includes(previous.state)) {
      throw problem("aborted", "Das Ergebnis dieses Bildauftrags ist noch unklar. Es wird kein zweites Bild berechnet. Bitte später Ergebnis prüfen.", operationId, previous.state);
    }
    if (previous.state === "deferred" || previous.state === "failed" && retryFailed && Number(previous.attempt || 1) < 2) {
      record = await db.runTransaction(async tx => {
        const current = (await tx.get(ref)).data();
        if (!["deferred", "failed"].includes(current?.state) || timestampMillis(current.updatedAt) !== timestampMillis(previous.updatedAt)) throw problem("aborted", "Der Medienauftrag wird bereits fortgesetzt.", operationId, "running");
        const next = { ...current, state: "running", attempt: Number(current.attempt || 1) + (current.state === "failed" ? 1 : 0), updatedAt: new Date() };
        tx.set(ref, next); return next;
      });
    } else throw problem("failed-precondition", "Dieser Medienversuch ist fehlgeschlagen. Ein neuer Versuch muss ausdrücklich gestartet werden.", operationId, "failed");
  }
  let result;
  try { result = await generate(request); }
  catch (error) {
    const deferred = error.details?.providerNotStarted === true && ["minute-limit", "pre-provider-guard"].includes(error.details?.reason);
    const knownFailure = ["image-mismatch", "resource-exhausted", "invalid-argument", "failed-precondition"].includes(error.code);
    await ref.set({ ...record, state: deferred ? "deferred" : knownFailure ? "failed" : "unknown", updatedAt: new Date() });
    error.details = { ...error.details, operationId, mediaState: deferred ? "deferred" : knownFailure ? "failed" : "unknown" }; throw error;
  }
  const valid = kind === "plan" ? Array.isArray(result?.test?.questions) : kind === "audio" ? result?.asset?.audioDataUrl : result?.asset?.imageDataUrl;
  if (!valid || Buffer.byteLength(JSON.stringify(result)) > (kind === "plan" ? 900 : 450) * 1024) {
    throw problem("failed-precondition", "Das Bildergebnis konnte nicht sicher übernommen werden. Es wird nicht erneut berechnet.", operationId, "unknown");
  }
  // Use the already private, already purged configured image cache, not a new
  // unbounded Firestore copy of teacher text or paid image bytes.
  const scopeHash = createHash("sha256").update(uid).digest("hex").slice(0, 24);
  const resultPath = `aiGeneratedCache/${scopeHash}/operation-${operationId}.json`;
  await store.write(resultPath, result);
  await ref.set({ ...record, state: "ready", resultPath, updatedAt: new Date() });
  return result;
}
module.exports = { runMediaOperation };
