"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const { HttpsError } = require("firebase-functions/v2/https");
const source = fs.readFileSync(require.resolve("../index.js"), "utf8");
const startRoutes = source.slice(source.indexOf("exports.startAiTestJob ="), source.indexOf("\nconst QUIZ_ALPHABET"));
function fixture() {
  const jobs = [], access = [];
  const context = vm.createContext({ exports: {}, callableOpts: {}, HttpsError, onCall: (_options, handler) => handler,
    requireAiUser: async request => { access.push(request.auth?.uid); if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Login"); return { uid: request.auth.uid }; },
    startAiTestJobForUser: async (uid, data) => { jobs.push({ uid, data }); return { jobId: "0123456789abcdef0123456789abcdef01234567" }; }
  });
  vm.runInContext(startRoutes, context);
  return { context, jobs, access };
}
test("dedicated callable forces only variant mode and returns explicit public contract acknowledgement", async () => {
  const f = fixture();
  assert.equal(typeof f.context.exports.startAiTestVariantJob, "function");
  const response = await f.context.exports.startAiTestVariantJob({ auth: { uid: "teacher" }, data: { sourceQuizId: "SOURCE01", clientRequestId: "request-id", allowedTypes: ["text"], count: 99, sourceTest: { privateKey: "ignored" } } });
  assert.equal(f.jobs.length, 1); assert.equal(f.jobs[0].uid, "teacher");
  assert.deepEqual({ ...f.jobs[0].data }, { sourceQuizId: "SOURCE01", clientRequestId: "request-id", generationMode: "variant" });
  assert.deepEqual({ ...response }, { jobId: "0123456789abcdef0123456789abcdef01234567", generationMode: "variant", contractVersion: 1 });
});
test("variant-only route rejects other modes and missing auth before any ordinary job call", async () => {
  const f = fixture();
  assert.equal(typeof f.context.exports.startAiTestVariantJob, "function");
  await assert.rejects(f.context.exports.startAiTestVariantJob({ auth: { uid: "teacher" }, data: { generationMode: "generated", sourceQuizId: "SOURCE01", clientRequestId: "request-id" } }), error => error.code === "invalid-argument");
  await assert.rejects(f.context.exports.startAiTestVariantJob({ data: { sourceQuizId: "SOURCE01", clientRequestId: "request-id" } }), error => error.code === "unauthenticated");
  assert.equal(f.jobs.length, 0);
});
test("generic callable keeps ordinary jobs and denies accidental variant routing", async () => {
  const f = fixture();
  await f.context.exports.startAiTestJob({ auth: { uid: "teacher" }, data: { topic: "Regular", count: 10 } });
  await assert.rejects(f.context.exports.startAiTestJob({ auth: { uid: "teacher" }, data: { generationMode: "variant", sourceQuizId: "SOURCE01", clientRequestId: "request-id" } }), error => error.code === "invalid-argument");
  assert.equal(f.jobs.length, 1); assert.equal(f.jobs[0].data.topic, "Regular");
});
test("a legacy deployment without the distinct endpoint cannot dispatch a paid generic job", async () => {
  let ordinaryCalls = 0;
  const legacy = { startAiTestJob: async () => { ordinaryCalls++; return { jobId: "ordinary-job" }; } };
  const invoke = async name => { if (!legacy[name]) throw new HttpsError("not-found", "Callable not deployed"); return legacy[name](); };
  await assert.rejects(invoke("startAiTestVariantJob"), error => error.code === "not-found");
  assert.equal(ordinaryCalls, 0);
});
