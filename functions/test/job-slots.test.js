"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { reserveJob, releaseJob, markQueueDispatchEnqueued, markQueueDispatchFailed, isAlreadyEnqueuedTaskError } = require("../lib/job-slots");

function firestore(initial = {}) {
  const documents = new Map(Object.entries(initial));
  const ref = id => ({ id, key: id });
  const db = {
    collection: () => ({ doc: id => ref(id) }),
    runTransaction: async callback => {
      let written = false;
      const actions = [];
      const tx = {
        get: async doc => {
          assert.equal(written, false, "Firestore requires all reads before writes");
          const value = documents.get(doc.key);
          return { id: doc.id, ref: doc, exists: value !== undefined, data: () => value };
        },
        create: (doc, data) => { written = true; actions.push(() => documents.set(doc.key, data)); },
        set: (doc, data) => { written = true; actions.push(() => documents.set(doc.key, data)); },
        update: (doc, data) => { written = true; actions.push(() => documents.set(doc.key, { ...documents.get(doc.key), ...data })); },
        delete: doc => { written = true; actions.push(() => documents.delete(doc.key)); }
      };
      const result = await callback(tx);
      actions.forEach(action => action());
      return result;
    }
  };
  return { db, documents, ref };
}

test("a legacy single-job lock migrates to two distinct jobs, resumes duplicate requests and releases independently", async () => {
  const now = { toMillis: () => 100000 };
  const active = { ownerId: "teacher", status: "running", createdAt: { toMillis: () => 90000 } };
  const { db, documents, ref } = firestore({ old: active, current: { activeJobId: "old" } });
  const reservation = id => reserveJob(db, {
    uid: "teacher", now, jobRef: ref(id), lockRef: ref("current"),
    jobData: { ownerId: "teacher", status: "queued", createdAt: now }
  });
  assert.deepEqual(await reservation("new"), { jobId: "new", resumed: false });
  assert.deepEqual(documents.get("current").activeJobIds, ["old", "new"]);
  assert.deepEqual(await reservation("new"), { jobId: "new", resumed: true });
  await assert.rejects(reservation("third"), { code: "resource-exhausted" });
  assert.equal(documents.has("third"), false);
  await releaseJob(db, ref("current"), "old");
  assert.deepEqual(documents.get("current").activeJobIds, ["new"]);
  await releaseJob(db, ref("current"), "new");
  assert.equal(documents.has("current"), false);
});

test("expired jobs free a slot and are recorded as failed", async () => {
  const now = { toMillis: () => 50 * 60 * 1000 };
  const { db, documents, ref } = firestore({ old: { ownerId: "teacher", status: "running", createdAt: { toMillis: () => 0 } }, current: { activeJobIds: ["old"] } });
  await reserveJob(db, { uid: "teacher", now, jobRef: ref("fresh"), lockRef: ref("current"), jobData: { ownerId: "teacher", status: "queued" } });
  assert.equal(documents.get("old").status, "failed");
  assert.deepEqual(documents.get("current").activeJobIds, ["fresh"]);
});

test("a failed queue dispatch can reacquire its slot and reuse the same job ID", async () => {
  const now = { toMillis: () => 100000 };
  const failed = { ownerId: "teacher", status: "failed", stage: "queue-failed", createdAt: now, input: { topic: "Brüche" } };
  const { db, documents, ref } = firestore({ retry: failed });
  const result = await reserveJob(db, {
    uid: "teacher", now, jobRef: ref("retry"), lockRef: ref("current"),
    jobData: { ownerId: "teacher", status: "queued", createdAt: now, input: { topic: "Different content must not replace the original" } }
  });
  assert.deepEqual(result, { jobId: "retry", resumed: true });
  assert.equal(documents.get("retry").status, "queued");
  assert.deepEqual(documents.get("retry").input, { topic: "Brüche" });
  assert.deepEqual(documents.get("current").activeJobIds, ["retry"]);
});

test("concurrent queue failure cannot overwrite an already enqueued or running job", async () => {
  const now = { toMillis: () => 100000 };
  const { db, documents, ref } = firestore({ queued: { ownerId: "teacher", status: "queued", stage: "queued", dispatchState: "pending" } });
  assert.equal(await markQueueDispatchEnqueued(db, ref("queued"), now), true);
  assert.equal(await markQueueDispatchFailed(db, ref("queued"), now), false);
  assert.equal(documents.get("queued").status, "queued");
  assert.equal(documents.get("queued").dispatchState, "enqueued");
  documents.set("queued", { ...documents.get("queued"), status: "running", stage: "starting" });
  assert.equal(await markQueueDispatchFailed(db, ref("queued"), now), false);
  assert.equal(documents.get("queued").status, "running");
});

test("an ambiguous enqueue failure leaves the reserved job claimable for worker or recovery retry", async () => {
  const now = { toMillis: () => 100000 };
  const { db, documents, ref } = firestore({ queued: { ownerId: "teacher", status: "queued", stage: "queued", dispatchState: "pending" } });
  assert.equal(await markQueueDispatchFailed(db, ref("queued"), now), true);
  assert.equal(documents.get("queued").status, "queued");
  assert.equal(documents.get("queued").dispatchState, "pending");
  assert.equal(documents.get("queued").dispatchError, "enqueue-unconfirmed");
  assert.equal(await markQueueDispatchEnqueued(db, ref("queued"), now), true);
  assert.equal(documents.get("queued").dispatchState, "enqueued");
});

test("a delayed enqueue acknowledgement cannot revive a terminal worker failure", async () => {
  const now = { toMillis: () => 100000 };
  const { db, documents, ref } = firestore({ queued: { ownerId: "teacher", status: "queued", stage: "queued", dispatchState: "pending" } });
  documents.set("queued", { ...documents.get("queued"), status: "failed", stage: "failed", dispatchState: "pending" });
  assert.equal(await markQueueDispatchEnqueued(db, ref("queued"), now), false);
  assert.equal(documents.get("queued").status, "failed");
  assert.equal(documents.get("queued").stage, "failed");
});

test("queue failure marking cannot overwrite a terminal worker failure", async () => {
  const now = { toMillis: () => 100000 };
  const { db, documents, ref } = firestore({ queued: { ownerId: "teacher", status: "failed", stage: "failed", dispatchState: "pending" } });
  assert.equal(await markQueueDispatchFailed(db, ref("queued"), now), false);
  assert.equal(documents.get("queued").stage, "failed");
});

test("Firebase task-already-exists is treated as an existing dispatch while the worker can claim the queued job", async () => {
  const now = { toMillis: () => 100000 };
  const { db, documents, ref } = firestore({ queued: { ownerId: "teacher", status: "queued", stage: "queued", dispatchState: "pending" } });
  let releaseFirst;
  const taskCreated = new Promise(resolve => { releaseFirst = resolve; });
  let enqueues = 0;
  const enqueue = async () => {
    enqueues += 1;
    if (enqueues === 1) return taskCreated;
    const error = new Error("task exists");
    error.code = "functions/task-already-exists";
    throw error;
  };
  const first = enqueue();
  const duplicate = enqueue().catch(async error => {
    assert.equal(isAlreadyEnqueuedTaskError(error), true);
    if (!isAlreadyEnqueuedTaskError(error)) await markQueueDispatchFailed(db, ref("queued"), now);
    await markQueueDispatchEnqueued(db, ref("queued"), now);
  });
  await Promise.resolve();
  const workerCanClaim = documents.get("queued").status === "queued";
  assert.equal(workerCanClaim, true);
  await duplicate;
  documents.set("queued", { ...documents.get("queued"), status: "running", stage: "starting" });
  releaseFirst();
  await first;
  assert.equal(await markQueueDispatchEnqueued(db, ref("queued"), now), true);
  assert.equal(documents.get("queued").status, "running");
});
