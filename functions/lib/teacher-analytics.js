"use strict";
const {randomUUID, createHash, createHmac} = require("node:crypto");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const {HttpsError} = require("firebase-functions/v2/https");
const {cleanTeacherEvent, teacherChannel, creditActivity} = require("./teacher-analytics-core");
const {runtimeProjectId, projectToken, POSTHOG_CAPTURE_URL} = require("./posthog-telemetry");
const hash = value => createHash("sha256").update(value).digest("hex");
const DAY = 86400000;
async function recordTeacherEvent(uid, profile, raw, {env = process.env, db = getFirestore(), now = Date.now(), fetchImpl = globalThis.fetch, server = false} = {}) {
  const project = runtimeProjectId(env), channel = teacherChannel(profile, project);
  // Explicit purpose and deployment gates; defaults preserve existing collection behavior.
  if (!channel || env.GC_TEACHER_ANALYTICS_ENABLED !== "true" || !projectToken(env)) return {ok: true, disabled: true};
  let event;
  try { event = cleanTeacherEvent(raw, raw?.at, {server}); } catch { throw new HttpsError("invalid-argument", "Ungültige Messdaten."); }
  if (server && event.at < now - 30 * DAY) return {ok: true, expired: true};
  const actorKey = hash(`${project}:${uid}`), day = new Date(now).toISOString().slice(0, 10);
  const ref = db.doc(`teacherTelemetryEvents/${hash(`${actorKey}:${event.id}`)}`);
  const actorRef = db.doc(`teacherTelemetryActors/${actorKey}`);
  const budgetRef = db.doc(`teacherTelemetryBudget/${actorKey}-${day}`);
  const payloadHash = hash(JSON.stringify(event));
  let stored;
  await db.runTransaction(async tx => {
    const [existing, actor, budget] = await Promise.all([tx.get(ref), tx.get(actorRef), tx.get(budgetRef)]);
    if (existing.exists) {
      stored = existing.data();
      if (stored.payloadHash !== payloadHash) throw new HttpsError("already-exists", "Widersprüchliche Messkennung.");
      return;
    }
    if (!server) cleanTeacherEvent(raw, now, {server}); // Freshness applies only to new canonical events.
    const previous = budget.exists ? budget.data() : null;
    if (Number(previous?.count || 0) >= 3000) throw new HttpsError("resource-exhausted", "Messlimit erreicht.");
    const actorData = actor.data();
    const currentActor = actorData && actorData.expiresAt.toMillis() > now ? actorData : {id: randomUUID(), ownerId: uid, expiresAt: Timestamp.fromMillis(now + 90 * DAY)};
    const credited = event.event === "activity_summary" ? creditActivity(event, previous, now) : {activeMs: 0, foregroundAiWaitMs: 0};
    stored = {payloadHash, delivered: false, actor: currentActor.id, actorKey, channel, sourceProject: project, receivedAt: now, authority: server ? "server" : "client",
      event: {...event, ...credited}, expiresAt: Timestamp.fromMillis(now + 30 * DAY)};
    tx.create(ref, stored);
    tx.set(actorRef, currentActor);
    tx.set(budgetRef, {count: Number(previous?.count || 0) + 1, lastAt: event.event === "activity_summary" || !previous ? now : previous.lastAt, expiresAt: Timestamp.fromMillis(now + 2 * DAY)});
  });
  if (stored.expiresAt.toMillis() <= now) {await ref.update({delivered: true, suppressed: true});return {ok: true, expired: true};}
  if (stored.delivered) return {ok: true, duplicate: true};
  return deliverTeacherEvent(ref, stored, profile, {env, fetchImpl});
}
async function deliverTeacherEvent(ref, stored, profile, {env = process.env, fetchImpl = globalThis.fetch} = {}) {
  const project = runtimeProjectId(env);
  if (!teacherChannel(profile, project) || !projectToken(env) || env.GC_TEACHER_ANALYTICS_ENABLED !== "true") return {ok: true, disabled: true};
  const e = stored.event;
  const properties = {"$process_person_profile": false, "$insert_id": ref.id,
    source_project: stored.sourceProject, environment: project === "hausaufgabe-staging" ? "school" : "staging",
    source_release: e.release, platform: e.platform, event_schema_version: 2, measurement_channel: stored.channel,
    role: profile.role, purpose_version: "teacher-product-opt-in-v1", measurement_coverage: stored.authority === "server" ? "server_confirmed" : "client_estimate_server_capped",
    active_ms: e.activeMs, foreground_ai_wait_ms: e.foregroundAiWaitMs, elapsed_ms: e.elapsedMs,
    operation: e.operation, feature: e.feature, view: e.view, outcome: e.outcome, duration_ms: e.durationMs, dropped: e.dropped,
    ...(stored.authority === "server" ? {input_tokens: e.inputTokens, output_tokens: e.outputTokens, total_tokens: e.totalTokens, cache_hit: e.cacheHit,
      test_ref: e.entityId ? createHmac("sha256", stored.actor).update(e.entityId).digest("hex").slice(0, 32) : undefined,
      cost_coverage: "unknown_no_price_table"} : {})};
  try {
    const response = await fetchImpl(POSTHOG_CAPTURE_URL, {method: "POST", headers: {"content-type": "application/json"},
      body: JSON.stringify({api_key: projectToken(env), distinct_id: stored.actor, event: `gradecrew.teacher.${e.event}`, timestamp: new Date(stored.receivedAt).toISOString(), properties}), signal: globalThis.AbortSignal.timeout(1200)});
    if (!response.ok) return {ok: false, pending: true};
    await ref.update({delivered: true});
    return {ok: true};
  } catch { return {ok: false, pending: true}; }
}
async function retryTeacherEvents({env = process.env, db = getFirestore(), now = Date.now(), fetchImpl = globalThis.fetch} = {}) {
  if (env.GC_TEACHER_ANALYTICS_ENABLED !== "true" || !projectToken(env)) return {disabled: true};
  const pending = await db.collection("teacherTelemetryEvents").where("delivered", "==", false).limit(100).get();
  let delivered = 0, suppressed = 0;
  for (const document of pending.docs) {
    const stored = document.data();
    if (stored.expiresAt.toMillis() <= now) {await document.ref.update({delivered: true, suppressed: true});suppressed++;continue;}
    const actor = (await db.doc(`teacherTelemetryActors/${stored.actorKey}`).get()).data();
    if (!actor?.ownerId) {await document.ref.update({delivered: true, suppressed: true});suppressed++;continue;}
    const profile = (await db.doc(`users/${actor.ownerId}`).get()).data();
    if (!teacherChannel(profile, runtimeProjectId(env))) {
      await document.ref.update({delivered: true, suppressed: true}); suppressed++; continue;
    }
    const result = await deliverTeacherEvent(document.ref, stored, profile, {env, fetchImpl});
    if (result.ok) delivered++;
  }
  return {checked: pending.size, delivered, suppressed};
}
module.exports = {recordTeacherEvent, retryTeacherEvents};
