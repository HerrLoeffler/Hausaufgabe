"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createQuickRemyService } = require("../lib/quick-remy-flow");

function fixture(overrides = {}) {
  const calls = [];
  const service = createQuickRemyService({
    requireUser: async request => {
      if (!request.auth?.uid) throw Object.assign(new Error("Bitte anmelden."), { code: "unauthenticated" });
      const profile = request.profile || { role: "teacher", settings: { defaultSubject: "Mathematik", defaultGrade: "6" } };
      if (!['teacher', 'admin'].includes(profile.role)) throw Object.assign(new Error("Nicht erlaubt."), { code: "permission-denied" });
      return { uid: request.auth.uid, profile };
    },
    consumeQuota: async (uid, kind) => calls.push(["quota", uid, kind]),
    interpret: async args => { calls.push(["interpret", args]); return { data: { status: "ready", preparedRequest: { subject: "Mathematik", grade: "6", topic: "Brüche", count: 8 } }, usage: { total_tokens: 14 } }; },
    recordUsage: async (...args) => calls.push(["usage", ...args]),
    startJob: async (...args) => { calls.push(["startJob", ...args]); return { jobId: "job-1234567890" }; },
    findSubmission: async (uid, requestId) => { calls.push(["findSubmission", uid, requestId]); return null; },
    ...overrides
  });
  return { service, calls };
}
const prepareRequest = { auth: { uid: "teacher-1" }, data: { requestId: "voice-1", conversationText: "Mathe Klasse 6 Brüche" } };
const submitRequest = { auth: { uid: "teacher-1" }, data: { requestId: "voice-1", preparedRequest: { subject: "Mathematik", grade: "6", topic: "Brüche", count: 8 } } };

test("prepare interprets authenticated text, uses only explicit safe defaults, and records no transcript", async () => {
  const { service, calls } = fixture();
  const result = await service.prepare(prepareRequest);
  assert.deepEqual(result, { status: "ready", preparedRequest: { subject: "Mathematik", grade: "6", topic: "Brüche", count: 8 } });
  assert.deepEqual(calls[0], ["quota", "teacher-1", "quickRemy"]);
  const args = calls.find(call => call[0] === "interpret")[1];
  assert.equal(args.uid, "teacher-1");
  assert.equal(args.conversationText, "Mathe Klasse 6 Brüche");
  assert.deepEqual(args.defaults, { subject: "Mathematik", grade: "6" });
  const usage = calls.find(call => call[0] === "usage");
  assert.equal(usage[2], "quickRemy");
  assert.equal(JSON.stringify(usage).includes("Mathe Klasse"), false);
});

test("prepare asks one combined question for every missing field without starting a test job", async () => {
  const { service, calls } = fixture({ interpret: async () => ({ data: { status: "needsInfo", missingFields: ["subject", "grade", "topic", "count"], question: "Welches Fach, welche Klasse, welches Thema und wie viele Aufgaben?" }, usage: {} }) });
  const result = await service.prepare(prepareRequest);
  assert.equal(result.status, "needsInfo");
  assert.equal(result.missingFields.length, 4);
  assert.equal(calls.some(call => call[0] === "startJob"), false);
  assert.equal(calls.some(call => call[0] === "quota" && call[2] === "test"), false);
});

test("prepare fails closed for missing auth, denied roles, malformed input, and quota limits", async () => {
  const { service } = fixture();
  await assert.rejects(service.prepare({ data: prepareRequest.data }), { code: "unauthenticated" });
  await assert.rejects(service.prepare({ ...prepareRequest, profile: { role: "student" } }), { code: "permission-denied" });
  await assert.rejects(service.prepare({ ...prepareRequest, data: { ...prepareRequest.data, conversationText: "x".repeat(2501) } }), { code: "invalid-argument" });
  const limited = fixture({ consumeQuota: async () => { throw Object.assign(new Error("limit"), { code: "resource-exhausted" }); } });
  await assert.rejects(limited.service.prepare(prepareRequest), { code: "resource-exhausted" });
  assert.equal(limited.calls.some(call => call[0] === "interpret"), false);
});

test("submit forwards only validated fields and derives owner from authenticated user", async () => {
  const { service, calls } = fixture();
  assert.deepEqual(await service.submit({ ...submitRequest, data: { ...submitRequest.data, uid: "spoofed" } }), { status: "accepted", jobId: "job-1234567890" });
  assert.deepEqual(calls.find(call => call[0] === "startJob"), ["startJob", "teacher-1", {
    subject: "Mathematik", grade: "6", topic: "Brüche", count: 8, clientRequestId: "voice-1",
    allowedTypes: ["single", "multi", "text", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords", "number"],
    points: 8, imageMode: "none"
  }]);
  await assert.rejects(service.submit({ ...submitRequest, profile: { role: "student" } }), { code: "permission-denied" });
  await assert.rejects(service.submit({ ...submitRequest, data: { ...submitRequest.data, preparedRequest: { ...submitRequest.data.preparedRequest, uid: "spoofed", topic: "" } } }), { code: "invalid-argument" });
});

test("repeated request IDs are passed unchanged for existing server idempotency", async () => {
  const jobs = new Map();
  const startJob = async (uid, input) => {
    const key = `${uid}:${input.clientRequestId}`;
    if (!jobs.has(key)) jobs.set(key, { jobId: `job-${jobs.size + 1}-12345678` });
    return jobs.get(key);
  };
  const { service } = fixture({ startJob });
  const [first, second] = await Promise.all([service.submit(submitRequest), service.submit(submitRequest)]);
  assert.deepEqual(first, second);
  assert.equal(jobs.size, 1);
  await service.submit({ ...submitRequest, data: { ...submitRequest.data, requestId: "voice-2" } });
  await service.submit({ ...submitRequest, auth: { uid: "teacher-2" } });
  assert.equal(jobs.size, 3, "different request IDs and authenticated owners get distinct jobs");
});

test("submission recovery is authenticated, owner-scoped, and returns only accepted job metadata", async () => {
  const job = { id: "job-1234567890", ownerId: "teacher-1", status: "running" };
  const { service, calls } = fixture({ findSubmission: async (uid, requestId) => {
    calls.push(["findSubmission", uid, requestId]);
    return uid === job.ownerId ? job : { ...job, ownerId: "someone-else" };
  } });
  assert.deepEqual(await service.recover({ ...prepareRequest, data: { requestId: "voice-1" } }), { status: "accepted", jobId: job.id });
  assert.deepEqual(calls.find(call => call[0] === "findSubmission"), ["findSubmission", "teacher-1", "voice-1"]);
  assert.deepEqual(await service.recover({ auth: { uid: "teacher-2" }, data: { requestId: "voice-1" } }), { status: "notFound" });
  await assert.rejects(service.recover({ data: { requestId: "voice-1" } }), { code: "unauthenticated" });
  await assert.rejects(service.recover({ ...prepareRequest, data: { requestId: "bad/id" } }), { code: "invalid-argument" });
});

test("recovery repairs an orphaned pending queue dispatch before confirming acceptance", async () => {
  let job = { id: "job-1234567890", ownerId: "teacher-1", status: "queued", dispatchState: "pending" };
  let repairs = 0;
  const { service } = fixture({
    findSubmission: async uid => uid === job.ownerId ? job : null,
    ensureDispatch: async (uid, recovered) => {
      assert.equal(uid, "teacher-1");
      assert.equal(recovered.id, job.id);
      repairs += 1;
      job = { ...job, dispatchState: "enqueued" };
    }
  });
  assert.deepEqual(await service.recover({ ...prepareRequest, data: { requestId: "voice-1" } }), { status: "accepted", jobId: job.id });
  assert.equal(repairs, 1);
});

test("provider failures are recorded without transcript or generated content and never create jobs", async () => {
  const { service, calls } = fixture({ interpret: async () => { throw Object.assign(new Error("offline"), { code: "unavailable" }); } });
  await assert.rejects(service.prepare(prepareRequest), { code: "unavailable" });
  const log = calls.find(call => call[0] === "usage");
  assert.equal(log[4].failed, true);
  assert.equal(JSON.stringify(log).includes("Mathe Klasse"), false);
  assert.equal(calls.some(call => call[0] === "startJob"), false);
});

test("a queue failure never returns an accepted status", async () => {
  const { service } = fixture({ startJob: async () => { throw Object.assign(new Error("queue down"), { code: "unavailable" }); } });
  await assert.rejects(service.submit(submitRequest), { code: "unavailable" });
});
