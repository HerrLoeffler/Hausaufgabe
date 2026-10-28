"use strict";
const { createHash } = require("node:crypto");

function problem(code, message, operationId, state) {
  return Object.assign(new Error(message), { code, details: { operationId, mediaState: state } });
}
function privateResultStore() {
  const bucket = require("firebase-admin/storage").getStorage().bucket();
  return {
    write: async (path, value) => bucket.file(path).save(JSON.stringify(value), { resumable: false, metadata: { contentType: "application/json", cacheControl: "private, no-store" } }),
    remove: async path => bucket.file(path).delete({ignoreNotFound:true}),
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

async function runMediaOperation({ db, uid, operationId, request, scope, resultStore }, generate) {
  if (!uid || String(uid).includes("/") || !/^[a-zA-Z0-9_-]{8,80}$/.test(String(operationId || ""))) {
    throw problem("invalid-argument", "Ungültiger Bildauftrag.", "", "invalid");
  }
  const ref = db.doc(`users/${uid}/aiRuntime/media/requests/${operationId}`);
  const requestHash = request ? createHash("sha256").update(JSON.stringify(request)).digest("hex") : null;
  const expectedScope = scope || request;
  let record;
  if (request) {
    record = { ownerId: uid, quizId: request.quizId, questionId: request.questionId, requestHash, state: "running", createdAt: new Date(), updatedAt: new Date() };
    try { await ref.create(record); }
    catch (error) { if (error.code !== 6 && error.code !== "already-exists") throw error; record = null; }
  }
  const store = resultStore || privateResultStore();
  if (!record) {
    const existing = await ref.get();
    if (!existing.exists) throw problem("not-found", "Der Bildauftrag ist noch nicht hinterlegt. Es wurde keine neue Berechnung gestartet.", operationId, "missing");
    const previous = existing.data();
    if (previous.ownerId !== uid || expectedScope && (previous.quizId !== expectedScope.quizId || previous.questionId !== expectedScope.questionId)) {
      throw problem("permission-denied", "Dieser Bildauftrag gehört zu einer anderen Aufgabe.", operationId, "conflict");
    }
    if (requestHash && previous.requestHash !== requestHash) throw problem("failed-precondition", "Diese Bildauftrags-ID gehört zu einem anderen Inhalt.", operationId, "conflict");
    if (previous.state === "ready") {
      const recovered = await store.read(previous.resultPath);
      if (recovered?.asset?.imageDataUrl) return recovered;
      throw problem("failed-precondition", "Das gespeicherte Bildergebnis ist abgelaufen. Es wird nicht automatisch neu berechnet.", operationId, "expired");
    }
    if (["running", "unknown"].includes(previous.state)) {
      throw problem("aborted", "Das Ergebnis dieses Bildauftrags ist noch unklar. Es wird kein zweites Bild berechnet. Bitte später Ergebnis prüfen.", operationId, previous.state);
    }
    throw problem("failed-precondition", "Dieser Bildversuch ist fehlgeschlagen. Ein neuer Versuch muss ausdrücklich gestartet werden.", operationId, "failed");
  }
  let result;
  try { result = await generate(request); }
  catch (error) {
    const knownFailure = ["image-mismatch", "resource-exhausted", "invalid-argument", "failed-precondition"].includes(error.code);
    await ref.set({ ...record, state: knownFailure ? "failed" : "unknown", updatedAt: new Date() });
    error.details = { ...error.details, operationId, mediaState: knownFailure ? "failed" : "unknown" }; throw error;
  }
  if (!result?.asset?.imageDataUrl || Buffer.byteLength(JSON.stringify(result)) > 450 * 1024) {
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
module.exports = { runMediaOperation, privateResultStore };
