"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");

function load({ active = true } = {}) {
  const writes = [];
  const db = {
    doc(path) {
      return {
        get: async () => ({ data: () => path === "quizzes/ABCD" ? { ownerId: "teacher" } : undefined }),
        set: async value => writes.push({ path, value })
      };
    }
  };
  const module = { exports: {} };
  const req = id => {
    if (id === "firebase-admin/firestore") return { getFirestore: () => db, Timestamp: { fromMillis: ms => ({ ms }) } };
    if (id === "./telemetry-core") return {
      enabled: () => active,
      fingerprint: value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")
    };
    throw new Error(id);
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../lib/telemetry-server-recorder"), "utf8"), { require: req, module, exports: module.exports, Date, String, Number, Math, Set });
  return { record: module.exports.recordAssessmentServerOperation, writes };
}

test("server recorder stores only bounded operation metadata for a known quiz owner", async () => {
  const { record, writes } = load();
  const result = await record({
    request: { data: { quizId: "ABCD", studentName: "PRIVATE_NAME", attemptToken: "PRIVATE_TOKEN", answers: ["PRIVATE_ANSWER"] } },
    entry: { action: "startAssessmentAttempt", status: "failed", code: "permission-denied", durationMs: 55, reference: "ASM-test", revision: "rev" }
  });
  assert.equal(result.stored, true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].value.ownerId, "teacher");
  assert.equal(writes[0].value.quizId, "ABCD");
  assert.equal(writes[0].value.code, "permission-denied");
  assert.equal(JSON.stringify(writes[0].value).includes("PRIVATE"), false);
});

test("disabled telemetry and invalid quiz ids create no server-operation record", async () => {
  const disabled = load({ active: false });
  await disabled.record({ request: { data: { quizId: "ABCD" } }, entry: { action: "startAssessmentAttempt", status: "ok" } });
  assert.equal(disabled.writes.length, 0);
  const invalid = load();
  await invalid.record({ request: { data: { quizId: "bad!" } }, entry: { action: "startAssessmentAttempt", status: "ok" } });
  assert.equal(invalid.writes.length, 0);
});
