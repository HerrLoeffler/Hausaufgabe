"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const requireFunctions = require("node:module").createRequire(require("node:path").resolve(__dirname, "../../functions/package.json"));
const { initializeApp, deleteApp } = requireFunctions("firebase-admin/app");
const { getFirestore } = requireFunctions("firebase-admin/firestore");
const { createBillingService } = requireFunctions("./lib/billing/application");
const { createPilotHandler } = requireFunctions("./lib/billing/handlers");
const { createFirestoreBillingStore } = requireFunctions("./lib/billing/firestore-store");
assert.match(process.env.FIRESTORE_EMULATOR_HOST || "", /^(127\.0\.0\.1|localhost):\d+$/);
const app = initializeApp({ projectId: "demo-gradecrew-billing" }, "billing-service");
const db = getFirestore(app);
const start = Date.UTC(2026, 10, 1);
let time = start + 86400000;
const identities = new Map();
const service = createBillingService({ store: createFirestoreBillingStore(db), now: () => time, projectId: "demo-gradecrew-billing", getIdentity: async uid => {
  const identity = identities.get(uid);
  if (!identity) throw new Error("Unknown identity");
  return identity;
} });
const request = (uid, data = {}) => ({ auth: { uid, token: { auth_time: Math.floor(time / 1000) } }, data });
async function seed() {
  time = start + 86400000;
  for (const collection of ["users", "accountDeletions", "appConfig", "billingV2Accounts", "billingV2Grants", "billingV2Ledger", "billingV2Schools", "billingV2Memberships", "billingV2Periods", "billingV2Invitations", "billingV2Audit", "quizzes"]) await db.recursiveDelete(db.collection(collection));
  identities.clear();
  for (const uid of ["admin", "teacher", "other", "third"]) {
    identities.set(uid, { uid, emailVerified: true, disabled: false, email: uid + "@example.invalid", metadata: { creationTime: new Date(start).toISOString() } });
    await db.doc("users/" + uid).set({ role: uid === "admin" ? "admin" : "teacher", status: "active", email: uid + "@example.invalid" });
  }
  await db.doc("appConfig/billingProduct").set({ enabled: true, allowedUids: ["admin", "teacher", "other", "third"] });
}
test.after(async () => { await db.terminate(); await deleteApp(app); });
test("normal account gets an anchored fourteen-day trial, which cannot reset on login", async () => {
  await seed();
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 5);
  time = start + 15 * 86400000;
  const access = await service.getAccess(request("teacher"));
  assert.equal(access.reasonCode, "trial_ended");
  assert.equal(access.trialEndsAtMs, start + 14 * 86400000);
});
test("five files including copies and imports consume credit, deleting one never refunds it", async () => {
  await seed();
  for (let i = 0; i < 5; i++) {
    const made = await service.createQuiz(request("teacher", { requestId: "new-test-" + i, kind: ["manual", "copy", "import", "ai", "manual"][i], quiz: { title: "Synthetic " + i } }));
    if (i === 0) await db.doc("quizzes/" + made.code).delete();
  }
  await assert.rejects(service.createQuiz(request("teacher", { requestId: "sixth-test", kind: "manual", quiz: { title: "Denied" } })), error => error.details?.reasonCode === "quota_exhausted");
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 5);
});
test("concurrent last-slot creations cannot create a sixth file", async () => {
  await seed();
  for (let i = 0; i < 4; i++) await service.createQuiz(request("teacher", { requestId: "seed-test-" + i, kind: "manual", quiz: { title: "Synthetic" } }));
  const results = await Promise.allSettled(["one", "two"].map(id => service.createQuiz(request("teacher", { requestId: "last-test-" + id, kind: "manual", quiz: { title: id } }))));
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal((await db.collection("quizzes").get()).size, 5);
});
test("replayed creation returns the same file and rejects a different payload", async () => {
  await seed();
  const req = request("teacher", { requestId: "same-request", kind: "manual", quiz: { title: "Once" } });
  const [a, b] = await Promise.all([service.createQuiz(req), service.createQuiz(req)]);
  assert.equal(a.code, b.code);
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 1);
  await assert.rejects(service.createQuiz(request("teacher", { ...req.data, quiz: { title: "Different" } })), { code: "already-exists" });
});
test("reserved AI job releases credit on failure and commits exactly once with the ready quiz", async () => {
  await seed();
  await service.reserveGeneration("teacher", "job-one");
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 4);
  await service.releaseGeneration("teacher", "job-one");
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 5);
  await service.reserveGeneration("teacher", "job-two");
  await db.doc("quizzes/READYABC").set({ ownerId: "teacher", generationJobId: "job-two", generationStatus: "running" });
  await service.finalizeGeneration("teacher", "job-two", "READYABC", { generationStatus: "ready", questionCount: 2 });
  await service.finalizeGeneration("teacher", "job-two", "READYABC", { generationStatus: "ready", questionCount: 2 });
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 1);
  assert.equal((await db.doc("quizzes/READYABC").get()).data().billingCreationState, "committed");
});
test("unverified, suspended, unenrolled and spoofed profile users cannot create", async () => {
  await seed();
  identities.get("teacher").emailVerified = false;
  await assert.rejects(service.createQuiz(request("teacher", { requestId: "blocked-one", kind: "manual", quiz: { title: "No" } })), { code: "permission-denied" });
  identities.get("teacher").emailVerified = true;
  await db.doc("users/teacher").update({ status: "suspended" });
  await assert.rejects(service.getAccess(request("teacher")), { code: "permission-denied" });
  await db.doc("appConfig/billingProduct").update({ allowedUids: ["admin"] });
  await assert.rejects(service.getAccess(request("other")), { code: "failed-precondition" });
});
test("only an active fresh administrator can grant complimentary Premium", async () => {
  await seed();
  const data = { personId: "teacher", requestId: "colleague-grant", reason: "Synthetic colleague", endsAtMs: null };
  await assert.rejects(service.grantPremium(request("other", data)), { code: "permission-denied" });
  const stale = request("admin", data); stale.auth.token.auth_time -= 3600;
  await assert.rejects(service.grantPremium(stale), { code: "permission-denied" });
  const grant = await service.grantPremium(request("admin", data));
  time = start + 40 * 86400000;
  assert.equal((await service.getAccess(request("teacher"))).tier, "complimentary");
  assert.equal((await db.collection("billingV2Audit").get()).size, 1);
  await service.revokePremium(request("admin", { grantId: grant.grantId, reason: "Synthetic end" }));
  assert.equal((await service.getAccess(request("teacher"))).tier, "free");
});
test("new quiz strips privileged and supplied owner fields", async () => {
  await seed();
  const made = await service.createQuiz(request("teacher", { requestId: "safe-fields", kind: "manual", quiz: { title: "Safe", ownerId: "other", published: true, billingCreationState: "committed", accessCode: "GUESS" } }));
  const data = (await db.doc("quizzes/" + made.code).get()).data();
  assert.equal(data.ownerId, "teacher"); assert.equal(data.published, false); assert.equal(data.accessCode, made.code);
});
test("write permission projection expires and is immediately removed when a grant is revoked", async () => {
  await seed();
  await service.getAccess(request("teacher"));
  assert.equal((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs, start + 14 * 86400000);
  const grant = await service.grantPremium(request("admin", { personId: "teacher", requestId: "projection-grant", reason: "Synthetic", endsAtMs: null }));
  time = start + 40 * 86400000;
  assert.ok((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs > time);
  await service.revokePremium(request("admin", { grantId: grant.grantId, reason: "Synthetic revoked" }));
  assert.equal((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs, 0);
});
test("malformed and foreign scopes are rejected without changing credit", async () => {
  await seed();
  for (const scope of [null, {}, {kind:"personal",id:"other"}, {kind:"school",id:"../escape"}]) {
    await assert.rejects(service.getAccess(request("teacher", { scope })), error => ["invalid-argument","permission-denied"].includes(error.code));
  }
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 5);
});
test("pilot actions use the authenticated identity and reject arbitrary method dispatch", async () => {
  await seed();
  const handle = createPilotHandler(service);
  const made = await handle(request("teacher", { action: "createQuiz", personId: "other", ownerId: "other", requestId: "handler-new-test", kind: "manual", quiz: { title: "Own" } }));
  assert.equal((await db.doc("quizzes/" + made.code).get()).data().ownerId, "teacher");
  for (const action of ["constructor", "__proto__", "reserveGeneration", "setPaid"]) {
    await assert.rejects(handle(request("teacher", { action })), { code: "invalid-argument" });
  }
  await assert.rejects(handle({ data: { action: "access" } }), { code: "unauthenticated" });
});
test("only administrators can inspect a teacher's trial and complimentary sources, even when suspended", async () => {
  await seed();
  await assert.rejects(service.inspectAccess(request("other", {personId:"teacher"})), {code:"permission-denied"});
  const detail=await service.inspectAccess(request("admin", {personId:"teacher"}));
  assert.equal(detail.access.tier,"trial");
  await db.doc("users/teacher").update({status:"suspended"});
  const suspended=await service.inspectAccess(request("admin", {personId:"teacher"}));
  assert.equal(suspended.access.reasonCode,"account_suspended");
  assert.deepEqual(suspended.access.featureCodes,[]);
});
