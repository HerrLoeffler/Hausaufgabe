"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { LIMITS } = require("./constants");

const map = {
  test: [LIMITS.testPerMinute, LIMITS.testPerDay],
  question: [LIMITS.questionPerMinute, LIMITS.questionPerDay],
  image: [LIMITS.imagePerMinute, LIMITS.imagePerDay],
  material: [LIMITS.materialPerMinute, LIMITS.materialPerDay]
};
function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
function minuteKey(d = new Date()) { return d.toISOString().slice(0, 16); }

async function consumeQuota(uid, kind) {
  const limits = map[kind];
  if (!limits) throw new Error(`Unknown quota kind ${kind}`);
  const db = getFirestore();
  const ref = db.doc(`users/${uid}/aiUsage/${dayKey()}`);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref); const data = snap.data() || {};
    const minute = minuteKey();
    const daily = Number(data[`${kind}Count`] || 0);
    const burst = data.minuteKey === minute ? Number(data[`${kind}MinuteCount`] || 0) : 0;
    if (daily >= limits[1] || burst >= limits[0]) throw new HttpsError("resource-exhausted", "KI-Limit erreicht. Bitte später erneut versuchen.");
    const patch = { updatedAt: Timestamp.now(), minuteKey: minute };
    patch[`${kind}Count`] = daily + 1;
    patch[`${kind}MinuteCount`] = burst + 1;
    tx.set(ref, patch, { merge: true });
  });
}

async function logUsage(uid, kind, usage = {}, extra = {}) {
  const ref = getFirestore().collection(`users/${uid}/aiEvents`).doc();
  await ref.set({ kind, inputTokens: usage.input_tokens || 0, outputTokens: usage.output_tokens || 0, totalTokens: usage.total_tokens || 0, ...extra, createdAt: FieldValue.serverTimestamp() });
}

// Quotas are enforced before an AI call. A later telemetry write must not discard
// the paid-for response or trigger a second generation on the client's retry.
async function recordUsage(uid, kind, usage = {}, extra = {}, write = logUsage) {
  try {
    await write(uid, kind, usage, extra);
    return true;
  } catch (err) {
    console.error("KI-Nutzungsprotokoll konnte nicht geschrieben werden:", {
      kind, code: err?.code, name: err?.name
    });
    return false;
  }
}

module.exports = { consumeQuota, logUsage, recordUsage };
