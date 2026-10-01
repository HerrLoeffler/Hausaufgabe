"use strict";
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { enabled } = require("./telemetry-core");
const { summarizeServerOperations } = require("./telemetry-server-core");

const opts = { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB", enforceAppCheck: false };
function gate() { if (!enabled()) throw new HttpsError("failed-precondition", "Die Staging-Messung ist nicht aktiviert."); }
async function profile(db, uid) {
  const snap = await db.doc(`users/${uid}`).get();
  const value = snap.data();
  if (!value || value.status === "suspended") throw new HttpsError("permission-denied", "Kein aktiver Zugriff.");
}

exports.getAssessmentServerOperationSummary = onCall(opts, async request => {
  gate();
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Bitte anmelden.");
  const days = request.data?.days ?? 7;
  if (!Number.isInteger(days) || days < 1 || days > 30 || Object.keys(request.data || {}).some(key => key !== "days")) {
    throw new HttpsError("invalid-argument", "Ungültiger Zeitraum.");
  }
  const db = getFirestore();
  await profile(db, request.auth.uid);
  const snap = await db.collection("telemetryPrivateServerOperations").where("ownerId", "==", request.auth.uid).limit(3001).get();
  const now = Date.now();
  const cutoff = now - days * 86_400_000;
  const rows = snap.docs.slice(0, 3000).map(doc => doc.data()).filter(row => row.receivedAtMs >= cutoff && row.expiresAtMs > now);
  return { ...summarizeServerOperations(rows, { truncated: snap.size > 3000 }), days, receivedRecords: rows.length };
});

exports.expireAssessmentServerTelemetry = onSchedule({ region: "europe-west1", schedule: "every 24 hours" }, async () => {
  if (!enabled()) return;
  const db = getFirestore();
  const snap = await db.collection("telemetryPrivateServerOperations").where("expiresAt", "<=", Timestamp.now()).limit(400).get();
  if (!snap.size) return;
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
});
