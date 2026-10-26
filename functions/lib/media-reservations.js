"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { LIMITS, MEDIA_POLICY, RETENTION } = require("./constants");
const { requireAccountWrite } = require("./account-state");
const dayKey = now => new Date(now).toISOString().slice(0, 10);
const budgetRef = (db, uid, jobId) => db.doc(`users/${uid}/aiRuntime/mediaBudgets/requests/${jobId}`);
const quotaRef = (db, uid, day) => db.doc(`users/${uid}/aiUsage/${day}`);
const total = (reservations, kind, except = "") => Object.entries(reservations || {}).reduce((sum, [id, value]) => sum + (id === except ? 0 : Number(value?.[kind] || 0)), 0);
function targetFor(input) {
  const target = {
    image: Number(input.imageQuestionCount ?? input.maxVisualQuestions ?? 0) * MEDIA_POLICY.maxImageAttempts,
    audio: Number(input.audioQuestionCount || 0) + Number(input.audioAnswerQuestionCount || 0) * 4 + Number(input.solutionAudioQuestionCount || 0)
  };
  if (Object.values(target).some(value => !Number.isInteger(value) || value < 0) || target.image > LIMITS.imagePerDay || target.audio > LIMITS.audioPerDay) throw new HttpsError("resource-exhausted", "Der Medienauftrag überschreitet das begrenzte Tagesbudget. Bitte die Auswahl verkleinern.");
  return target;
}
async function reserveMediaBudget(db, { uid, jobId, input, now = Date.now() }) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(jobId)) throw new HttpsError("invalid-argument", "Ungültiger Medienauftrag.");
  const day = dayKey(now), target = targetFor(input), ref = budgetRef(db, uid, jobId);
  return db.runTransaction(async tx => {
    await requireAccountWrite(tx, db, uid);
    const previous = (await tx.get(ref)).data();
    const dailyRef = quotaRef(db, uid, day), daily = (await tx.get(dailyRef)).data() || {};
    const oldRef = previous?.day && previous.day !== day ? quotaRef(db, uid, previous.day) : null;
    const old = oldRef ? (await tx.get(oldRef)).data() : null;
    if (previous && JSON.stringify(previous.target) !== JSON.stringify(target)) throw new HttpsError("failed-precondition", "Dieser Medienauftrag gehört zu einer anderen Auswahl.");
    const remaining = previous?.remaining || target;
    const reservations = { ...(daily.mediaReservations || {}) };
    for (const kind of ["image", "audio"]) {
      const limit = LIMITS[`${kind}PerDay`];
      if (Number(daily[`${kind}Count`] || 0) + total(reservations, kind, jobId) + remaining[kind] > limit) throw new HttpsError("resource-exhausted", "Für diese Medienauswahl reicht das verbleibende Tagesbudget noch nicht aus. Es wurde keine neue KI-Erstellung gestartet.", { reason: "media-daily-budget", kind, required: remaining[kind], limit });
    }
    reservations[jobId] = remaining;
    tx.set(dailyRef, { ...daily, mediaReservations: reservations, expiresAt: new Date(now + RETENTION.aiQuotaDays * 86400000) });
    if (old) { const oldReservations = { ...(old.mediaReservations || {}) }; delete oldReservations[jobId]; tx.set(oldRef, { ...old, mediaReservations: oldReservations }); }
    tx.set(ref, { target, remaining, day, state: "active", updatedAt: new Date(now) });
    return remaining;
  });
}
// Called inside consumeQuota's existing account/quota transaction. All required
// reads finish before either the quota or the reservation is changed.
async function consumeMediaReservation(tx, db, { uid, jobId, kind, quota, now = Date.now() }) {
  if (!["image", "audio"].includes(kind)) return {};
  const reservations = { ...(quota.mediaReservations || {}) };
  if (!jobId) {
    if (Number(quota[`${kind}Count`] || 0) + total(reservations, kind) >= LIMITS[`${kind}PerDay`]) throw new HttpsError("resource-exhausted", "Das Medienbudget ist für laufende Aufträge reserviert. Bitte später erneut versuchen.", { reason: "media-daily-budget", kind });
    return {};
  }
  const ref = budgetRef(db, uid, jobId), budget = (await tx.get(ref)).data();
  if (budget?.state !== "active" || budget.day !== dayKey(now) || !reservations[jobId] || !(budget.remaining?.[kind] > 0)) throw new HttpsError("failed-precondition", "Der Medienauftrag hat keine aktive Reservierung. Bitte seinen Status prüfen.", { reason: "media-reservation-inactive", providerNotStarted: true });
  const remaining = { ...budget.remaining, [kind]: budget.remaining[kind] - 1 };
  reservations[jobId] = remaining;
  tx.set(ref, { ...budget, remaining, updatedAt: new Date(now) });
  return { mediaReservations: reservations };
}
async function releaseMediaBudget(db, { uid, jobId }) {
  const ref = budgetRef(db, uid, jobId);
  await db.runTransaction(async tx => {
    const budget = (await tx.get(ref)).data();
    if (!budget || budget.state !== "active") return;
    const dailyRef = quotaRef(db, uid, budget.day), daily = (await tx.get(dailyRef)).data();
    if (daily) { const reservations = { ...(daily.mediaReservations || {}) }; delete reservations[jobId]; tx.set(dailyRef, { ...daily, mediaReservations: reservations }); }
    tx.set(ref, { ...budget, state: "released", updatedAt: new Date() });
  });
}
module.exports = { reserveMediaBudget, consumeMediaReservation, releaseMediaBudget, targetFor };
