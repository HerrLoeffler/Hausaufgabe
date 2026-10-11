"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const MAX_ACTIVE_JOBS = 2;

function isAlreadyEnqueuedTaskError(error) {
  return error?.code === "functions/task-already-exists" || error?.code === "task-already-exists";
}

function activeJobIds(lock = {}) {
  return [...new Set([...(Array.isArray(lock.activeJobIds) ? lock.activeJobIds : []), lock.activeJobId].filter(id => typeof id === "string" && id))];
}

async function reserveJob(db, { uid, jobRef, lockRef, now, jobData }) {
  return db.runTransaction(async tx => {
    const previous = await tx.get(jobRef);
    const previousData = previous.data() || {};
    const retryQueueFailure = previous.exists && previousData.ownerId === uid && previousData.status === "failed" && previousData.stage === "queue-failed";
    if (previous.exists && previousData.ownerId === uid && !retryQueueFailure) return { jobId: jobRef.id, resumed: true };
    const lock = await tx.get(lockRef);
    const snapshots = [];
    // Complete every read before scheduling writes, including legacy single-job locks.
    for (const id of activeJobIds(lock.data())) snapshots.push(await tx.get(db.collection("aiJobs").doc(id)));
    const running = snapshots.filter(snap => snap.exists && snap.data()?.ownerId === uid && ["queued", "running"].includes(snap.data()?.status));
    const active = running.filter(snap => now.toMillis() - (snap.data()?.createdAt?.toMillis() || 0) < 40 * 60 * 1000);
    if (active.length >= MAX_ACTIVE_JOBS) throw new HttpsError("resource-exhausted", "Es laufen bereits zwei Tests. Sobald einer fertig ist, kannst du den nächsten starten.", { reason: "active-job-limit", limit: MAX_ACTIVE_JOBS });
    for (const snap of running.filter(snap => !active.includes(snap))) tx.update(snap.ref, {
      status: "failed", stage: "failed", progressMessage: "Die Erstellung hat zu lange gedauert.", updatedAt: now
    });
    if (retryQueueFailure) tx.update(jobRef, { status: "queued", stage: "queued", dispatchState: "pending", progressMessage: "Erstellung wird erneut gestartet …", updatedAt: now });
    else tx.create(jobRef, jobData);
    tx.set(lockRef, { activeJobIds: [...active.map(snap => snap.id), jobRef.id], updatedAt: now });
    return { jobId: jobRef.id, resumed: retryQueueFailure };
  });
}

async function releaseJob(db, lockRef, jobId) {
  await db.runTransaction(async tx => {
    const snap = await tx.get(lockRef);
    const ids = activeJobIds(snap.data());
    if (!ids.includes(jobId)) return;
    const remaining = ids.filter(id => id !== jobId);
    if (remaining.length) tx.set(lockRef, { activeJobIds: remaining });
    else tx.delete(lockRef);
  });
}

async function markQueueDispatchEnqueued(db, jobRef, now) {
  return db.runTransaction(async tx => {
    const snap = await tx.get(jobRef);
    if (!snap.exists) throw new HttpsError("not-found", "Der KI-Auftrag wurde nicht gefunden.");
    const current = snap.data() || {};
    if (current.status === "queued" && current.dispatchState === "pending") {
      tx.update(jobRef, { dispatchState: "enqueued", updatedAt: now });
      return true;
    }
    if (current.dispatchState === "enqueued" || ["running", "ready"].includes(current.status)) return true;
    return false;
  });
}

async function markQueueDispatchFailed(db, jobRef, now) {
  return db.runTransaction(async tx => {
    const snap = await tx.get(jobRef);
    if (!snap.exists) return false;
    const current = snap.data() || {};
    if (current.status !== "queued" || current.dispatchState !== "pending") return false;
    // Enqueue errors can be ambiguous: another request may have created the task,
    // or Cloud Tasks may deliver it despite a lost acknowledgement. Keep the job
    // claimable and its slot reserved; recovery retries with the same task ID.
    tx.update(jobRef, { dispatchErrorAt: now, dispatchError: "enqueue-unconfirmed", updatedAt: now });
    return true;
  });
}

module.exports = { MAX_ACTIVE_JOBS, activeJobIds, reserveJob, releaseJob, markQueueDispatchEnqueued, markQueueDispatchFailed, isAlreadyEnqueuedTaskError };
