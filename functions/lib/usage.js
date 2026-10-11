"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { LIMITS, RETENTION } = require("./constants");

const DAY_MS = 24 * 60 * 60 * 1000;
const map = {
  test: [LIMITS.testPerMinute, LIMITS.testPerDay],
  question: [LIMITS.questionPerMinute, LIMITS.questionPerDay],
  image: [LIMITS.imagePerMinute, LIMITS.imagePerDay],
  audio: [LIMITS.audioPerMinute, LIMITS.audioPerDay],
  material: [LIMITS.materialPerMinute, LIMITS.materialPerDay],
  assistant: [LIMITS.assistantPerMinute, LIMITS.assistantPerDay],
  quickRemy: [LIMITS.quickRemyPerMinute, LIMITS.quickRemyPerDay]
};
function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
function minuteKey(d = new Date()) { return d.toISOString().slice(0, 16); }
function monthKey(d = new Date()) { return d.toISOString().slice(0, 7); }
function safeKind(value) {
  return String(value || "unknown").toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 48) || "unknown";
}
function expiryTimestamp(days, nowMs = Date.now()) {
  return Timestamp.fromMillis(nowMs + Math.max(1, Number(days) || 1) * DAY_MS);
}
function usageNumbers(usage = {}) {
  return {
    inputTokens: Math.max(0, Number(usage.input_tokens) || 0),
    outputTokens: Math.max(0, Number(usage.output_tokens) || 0),
    totalTokens: Math.max(0, Number(usage.total_tokens) || 0)
  };
}
function compactExtra(extra = {}) {
  const out = {};
  for (const [key, value] of Object.entries(extra || {})) {
    if (value === undefined) continue;
    if (typeof value === "string") out[key] = value.slice(0, 2000);
    else out[key] = value;
  }
  return out;
}

async function consumeQuota(uid, kind) {
  const limits = map[kind];
  if (!limits) throw new Error(`Unknown quota kind ${kind}`);
  const db = getFirestore();
  const nowDate = new Date();
  const ref = db.doc(`users/${uid}/aiUsage/${dayKey(nowDate)}`);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref); const data = snap.data() || {};
    const minute = minuteKey(nowDate);
    const kindMinuteKey = `${kind}MinuteKey`;
    const daily = Number(data[`${kind}Count`] || 0);
    const burst = data[kindMinuteKey] === minute ? Number(data[`${kind}MinuteCount`] || 0) : 0;
    if (daily >= limits[1] || burst >= limits[0]) throw new HttpsError("resource-exhausted", "KI-Limit erreicht. Bitte später erneut versuchen.");
    const patch = {
      updatedAt: Timestamp.now(),
      expiresAt: expiryTimestamp(RETENTION.aiQuotaDays, nowDate.getTime())
    };
    patch[kindMinuteKey] = minute;
    patch[`${kind}Count`] = daily + 1;
    patch[`${kind}MinuteCount`] = burst + 1;
    tx.set(ref, patch, { merge: true });
  });
}

async function logUsage(uid, kind, usage = {}, extra = {}) {
  const db = getFirestore();
  const nowDate = new Date();
  const numbers = usageNumbers(usage);
  const eventRef = db.collection(`users/${uid}/aiEvents`).doc();
  const normalizedKind = safeKind(kind);
  const rollupRef = db.doc(`users/${uid}/aiUsageRollups/${monthKey(nowDate)}-${normalizedKind}`);
  const details = compactExtra(extra);
  const batch = db.batch();

  batch.set(eventRef, {
    ...details,
    kind: String(kind || "unknown").slice(0, 80),
    ...numbers,
    createdAt: Timestamp.now(),
    expiresAt: expiryTimestamp(RETENTION.aiEventDays, nowDate.getTime())
  });

  const rollup = {
    month: monthKey(nowDate),
    kind: normalizedKind,
    requestCount: FieldValue.increment(1),
    inputTokens: FieldValue.increment(numbers.inputTokens),
    outputTokens: FieldValue.increment(numbers.outputTokens),
    totalTokens: FieldValue.increment(numbers.totalTokens),
    cacheHits: FieldValue.increment(details.cacheHit === true ? 1 : 0),
    updatedAt: FieldValue.serverTimestamp()
  };
  if (typeof details.model === "string" && details.model) rollup.lastModel = details.model.slice(0, 120);
  if (typeof details.promptVersion === "string" && details.promptVersion) rollup.lastPromptVersion = details.promptVersion.slice(0, 120);
  batch.set(rollupRef, rollup, { merge: true });
  await batch.commit();
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

module.exports = {
  consumeQuota, logUsage, recordUsage,
  dayKey, minuteKey, monthKey, safeKind, expiryTimestamp, usageNumbers
};
