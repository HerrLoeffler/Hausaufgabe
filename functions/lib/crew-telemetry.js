"use strict";

const crypto = require("node:crypto");
const { HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { RETENTION } = require("./constants");

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CLIENT_EVENTS_PER_DAY = 1200;
const METRIC_VERSION = "crew-metrics-v1";
const RAW_COLLECTION = "crewTelemetryEvents";
const USER_MARKER_COLLECTION = "crewTelemetryUsers";
const DAILY_COLLECTION = "crewTelemetryDaily";
const EXPIRING_COLLECTIONS = Object.freeze([RAW_COLLECTION, USER_MARKER_COLLECTION]);
const CREW_IDS = new Set(["coco", "remy", "emmi", "wilma"]);
const FIELD_NAMES = new Set([
  "subject", "grade", "schoolType", "region", "topic", "difficulty",
  "count", "points", "durationMinutes", "audioQuestionCount", "notes", "questionTypes"
]);
const CLIENT_EVENTS = new Set([
  "input_submitted", "voice_started", "voice_stopped", "patch_applied",
  "field_corrected", "local_response", "ai_fallback_started", "request_failed"
]);
const SERVER_EVENTS = new Set(["ai_fallback_completed", "ai_fallback_failed"]);

function dayKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function expiry(days, now = Date.now()) { return Timestamp.fromMillis(now + days * DAY_MS); }
function safeEnum(value, allowed) { return allowed.includes(value) ? value : undefined; }
function uidHash(uid) { return crypto.createHash("sha256").update(String(uid)).digest("hex").slice(0, 32); }
function safeFields(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).filter(field => FIELD_NAMES.has(field)))].slice(0, 16);
}
function safeLatency(value) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) ? Math.max(0, Math.min(300000, number)) : undefined;
}
function safeParserVersion(value) {
  const text = String(value || "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 60);
  return text || undefined;
}

function cleanMetric(data = {}, { server = false } = {}) {
  const allowedEvents = server ? new Set([...CLIENT_EVENTS, ...SERVER_EVENTS]) : CLIENT_EVENTS;
  const event = String(data.event || "");
  if (!allowedEvents.has(event)) throw new HttpsError("invalid-argument", "Unbekanntes Crew-Metrikereignis.");
  const crewId = CREW_IDS.has(data.crewId) ? data.crewId : "remy";
  const inputMode = safeEnum(data.inputMode, ["voice", "text"]);
  const source = safeEnum(data.source, ["local", "ai"]);
  const fields = safeFields(data.fields);
  const correctedField = FIELD_NAMES.has(data.correctedField) ? data.correctedField : undefined;
  const errorType = safeEnum(data.errorType, ["network", "permission", "unsupported", "unavailable", "unknown"]);
  const latencyMs = safeLatency(data.latencyMs);
  const parserVersion = safeParserVersion(data.parserVersion);
  return {
    event, crewId, inputMode, source, fields, correctedField, errorType,
    latencyMs, parserVersion, hasNotes: data.hasNotes === true,
    screen: data.screen === "ai_create" ? "ai_create" : undefined
  };
}

function compactMetric(clean) {
  return Object.fromEntries(Object.entries(clean).filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0)));
}

async function consumeMetricQuota(uid, nowDate) {
  const db = getFirestore();
  const day = dayKey(nowDate);
  const ref = db.doc(`users/${uid}/crewTelemetryQuota/${day}`);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const count = Number(snap.data()?.count || 0);
    if (count >= MAX_CLIENT_EVENTS_PER_DAY) throw new HttpsError("resource-exhausted", "Zu viele Telemetrieereignisse.");
    tx.set(ref, { count: count + 1, updatedAt: Timestamp.now() }, { merge: true });
  });
}

async function writeCrewMetric(uid, raw = {}, options = {}) {
  const clean = cleanMetric(raw, { server: options.server === true });
  const db = getFirestore();
  const nowDate = new Date();
  const nowMs = nowDate.getTime();
  const day = dayKey(nowDate);
  const hashedUid = uidHash(uid);
  if (!options.server) await consumeMetricQuota(uid, nowDate);

  // Privacy boundary: analytics events never live below the raw uid and never store
  // user text, topics, wishes, audio or before/after values. The daily aggregate is
  // content-free and may be retained; raw events/unique-user markers are expiring.
  const eventRef = db.collection(RAW_COLLECTION).doc();
  const dailyRef = db.doc(`${DAILY_COLLECTION}/${day}`);
  const userMarkerRef = db.doc(`${USER_MARKER_COLLECTION}/${day}-${hashedUid}`);
  const batch = db.batch();
  const metric = compactMetric(clean);

  batch.set(eventRef, {
    ...metric,
    uidHash: hashedUid,
    day,
    metricVersion: METRIC_VERSION,
    createdAt: Timestamp.now(),
    expiresAt: expiry(RETENTION.aiEventDays || 30, nowMs)
  });

  const increments = {
    day,
    metricVersion: METRIC_VERSION,
    totalEvents: FieldValue.increment(1),
    [`event_${clean.event}`]: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp()
  };
  if (clean.event === "input_submitted" && clean.inputMode) increments[`submitted_${clean.inputMode}`] = FieldValue.increment(1);
  if (clean.event === "patch_applied" && clean.source) increments[`patch_${clean.source}`] = FieldValue.increment(1);
  if (clean.event === "patch_applied") {
    increments.patchedFieldCount = FieldValue.increment(clean.fields.length);
    for (const field of clean.fields) increments[`patched_${field}`] = FieldValue.increment(1);
  }
  if (clean.event === "field_corrected" && clean.correctedField) {
    increments.correctedFieldCount = FieldValue.increment(1);
    increments[`corrected_${clean.correctedField}`] = FieldValue.increment(1);
  }
  batch.set(dailyRef, increments, { merge: true });
  batch.set(userMarkerRef, {
    uidHash: hashedUid,
    crewId: clean.crewId,
    day,
    lastSeenAt: FieldValue.serverTimestamp(),
    expiresAt: expiry(90, nowMs)
  }, { merge: true });
  await batch.commit();
  return clean;
}

async function recordCrewMetricSafe(uid, raw = {}, options = {}) {
  try {
    await writeCrewMetric(uid, raw, options);
    return true;
  } catch (error) {
    console.warn("Crew-Telemetrie konnte nicht geschrieben werden:", {
      event: raw?.event, code: error?.code, name: error?.name
    });
    return false;
  }
}

async function deleteExpiredCollection(collectionName, now = Timestamp.now(), { batchSize = 350, maxBatches = 12 } = {}) {
  if (!EXPIRING_COLLECTIONS.includes(collectionName)) throw new Error("Collection ist nicht für Crew-Retention freigegeben.");
  const db = getFirestore();
  let deleted = 0;
  for (let batchIndex = 0; batchIndex < maxBatches; batchIndex += 1) {
    const snap = await db.collection(collectionName)
      .where("expiresAt", "<=", now)
      .limit(batchSize)
      .get();
    if (snap.empty) break;
    const batch = db.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);
    await batch.commit();
    deleted += snap.size;
    if (snap.size < batchSize) break;
  }
  return deleted;
}

async function cleanupExpiredCrewTelemetry(now = Timestamp.now()) {
  const [eventsDeleted, usersDeleted] = await Promise.all([
    deleteExpiredCollection(RAW_COLLECTION, now),
    deleteExpiredCollection(USER_MARKER_COLLECTION, now)
  ]);
  return { eventsDeleted, usersDeleted };
}

function dayKeys(days, now = new Date()) {
  const keys = [];
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let offset = days - 1; offset >= 0; offset -= 1) keys.push(new Date(end - offset * DAY_MS).toISOString().slice(0, 10));
  return keys;
}

async function crewTelemetrySummary(days = 30) {
  const safeDays = Math.max(1, Math.min(90, Math.round(Number(days) || 30)));
  const db = getFirestore();
  const keys = dayKeys(safeDays);
  const dailySnaps = await db.getAll(...keys.map(key => db.doc(`${DAILY_COLLECTION}/${key}`)));
  const totals = {};
  for (const snap of dailySnaps) {
    const data = snap.exists ? snap.data() || {} : {};
    for (const [key, value] of Object.entries(data)) if (typeof value === "number") totals[key] = (totals[key] || 0) + value;
  }

  const unique = new Set();
  const markers = await db.collection(USER_MARKER_COLLECTION)
    .where("day", ">=", keys[0])
    .where("day", "<=", keys[keys.length - 1])
    .get();
  for (const doc of markers.docs) unique.add(String(doc.data()?.uidHash || ""));

  const correctionsByField = {};
  const patchesByField = {};
  for (const field of FIELD_NAMES) {
    const corrected = Number(totals[`corrected_${field}`] || 0);
    const patched = Number(totals[`patched_${field}`] || 0);
    if (corrected) correctionsByField[field] = corrected;
    if (patched) patchesByField[field] = patched;
  }

  const submissions = Number(totals.event_input_submitted || 0);
  const voice = Number(totals.submitted_voice || 0);
  const text = Number(totals.submitted_text || 0);
  const localPatches = Number(totals.patch_local || 0);
  const aiPatches = Number(totals.patch_ai || 0);
  const aiFallbacks = Number(totals.event_ai_fallback_started || 0);
  const patchedFields = Number(totals.patchedFieldCount || 0);
  const correctedFields = Number(totals.correctedFieldCount || 0);

  return {
    metricVersion: METRIC_VERSION,
    days: safeDays,
    from: keys[0],
    to: keys[keys.length - 1],
    uniqueUsers: unique.size,
    submissions,
    inputModes: { voice, text },
    voiceShare: submissions ? voice / submissions : 0,
    localPatches,
    aiPatches,
    aiFallbacks,
    aiFallbackCompleted: Number(totals.event_ai_fallback_completed || 0),
    estimatedAiCallsSaved: localPatches,
    requestFailures: Number(totals.event_request_failed || 0),
    patchedFields,
    correctedFields,
    fieldCorrectionRate: patchedFields ? correctedFields / patchedFields : 0,
    correctionsByField,
    patchesByField
  };
}

module.exports = {
  METRIC_VERSION,
  FIELD_NAMES,
  CLIENT_EVENTS,
  RAW_COLLECTION,
  USER_MARKER_COLLECTION,
  DAILY_COLLECTION,
  EXPIRING_COLLECTIONS,
  cleanMetric,
  writeCrewMetric,
  recordCrewMetricSafe,
  crewTelemetrySummary,
  deleteExpiredCollection,
  cleanupExpiredCrewTelemetry,
  dayKey,
  uidHash
};
