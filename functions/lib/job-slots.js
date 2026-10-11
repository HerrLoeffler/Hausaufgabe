"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const MAX_ACTIVE_JOBS = 2;

function activeJobIds(lock = {}) {
  return [...new Set([...(Array.isArray(lock.activeJobIds) ? lock.activeJobIds : []), lock.activeJobId].filter(id => typeof id === "string" && id))];
}

async function reserveJob(db, { uid, jobRef, lockRef, now, jobData, beforeReserve }) {
  return db.runTransaction(async tx => {
    if (beforeReserve) await beforeReserve(tx);
    const previous = await tx.get(jobRef);
    if (previous.exists && previous.data()?.ownerId === uid) return { jobId: jobRef.id, resumed: true };
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
    tx.create(jobRef, jobData);
    tx.set(lockRef, { activeJobIds: [...active.map(snap => snap.id), jobRef.id], updatedAt: now });
    return { jobId: jobRef.id, resumed: false };
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

module.exports = { MAX_ACTIVE_JOBS, activeJobIds, reserveJob, releaseJob };
