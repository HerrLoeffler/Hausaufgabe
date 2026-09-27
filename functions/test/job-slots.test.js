"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { reserveJob, releaseJob } = require("../lib/job-slots");

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
