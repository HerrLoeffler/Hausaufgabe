"use strict";
// Read-only diagnosis: real client/handler source, synthetic in-memory services.
// No Firebase SDK initialization, network access, real user data or product edits.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Module = require("node:module");
const root = path.resolve(__dirname, "../../..");
const fixturePath = path.join(root, "assessment-functions/test/security-audit-behavior.test.js");
const fixtureSource = fs.readFileSync(fixturePath, "utf8").split("\ntest(")[0];
const fixtureModule = new Module(fixturePath, module);
fixtureModule.filename = fixturePath;
fixtureModule.paths = Module._nodeModulePaths(path.dirname(fixturePath));
fixtureModule._compile(fixtureSource + "\nmodule.exports = fixture;", fixturePath);
const f = fixtureModule.exports();
const items = new Map();
const context = {
  crypto: require("node:crypto").webcrypto,
  btoa: value => Buffer.from(value, "binary").toString("base64"),
  localStorage: {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: key => items.delete(key)
  },
  getFunctions: () => ({}),
  httpsCallable: (_, name) => async data => ({ data: await f.exports[name](f.request(data)) })
};
const clientSource = fs.readFileSync(path.join(root, "secure-assessment-client.js"), "utf8")
  .replace(/^import .*;\s*/m, "")
  .replace("export function createSecureAssessmentClient", "function createSecureAssessmentClient");
vm.runInNewContext(clientSource + "\nthis.createClient = createSecureAssessmentClient;", context);

(async () => {
  let client = context.createClient({});
  const a = await client.start(f.quizId, "Person A");
  const credentialA = client.readSession(f.quizId);
  await client.submit(f.quizId, { q1: "4" });
  assert.equal(client.readSession(f.quizId).status, "submitted");
  const submissionA = JSON.stringify(f.docs.get(`quizzes/${f.quizId}/submissions/${a.attemptId}`));

  // New page/client instance, same browser storage and unchanged public run.
  client = context.createClient({});
  await client.getInfo(f.quizId);
  assert.equal(client.readSession(f.quizId).studentName, "Person A");
  const resumed = await client.resume(f.quizId);
  assert.equal(resumed.status, "submitted");
  assert.equal(resumed.attemptId, a.attemptId);
  assert.ok(resumed.receipt);
  await assert.rejects(client.start(f.quizId, "Person B"), { code: "permission-denied" });

  // Existing clear() API proves the identity boundary; this is a diagnosis,
  // not a proposed unguarded UI action. Future UI must revalidate A's receipt.
  const oldTabClient = context.createClient({});
  client.clear(f.quizId);
  const b = await client.start(f.quizId, "Person B");
  const credentialB = client.readSession(f.quizId);
  assert.notEqual(b.attemptId, a.attemptId);
  assert.notEqual(credentialB.clientAttemptId, credentialA.clientAttemptId);
  assert.notEqual(credentialB.attemptToken, credentialA.attemptToken);
  assert.equal(b.studentName, "Person B");
  // Relevant when designing a rotation UI: the present client follows global
  // storage even in an older page. A safe implementation must pin its identity.
  assert.equal((await oldTabClient.resume(f.quizId)).attemptId, b.attemptId);
  assert.equal(JSON.stringify(f.docs.get(`quizzes/${f.quizId}/submissions/${a.attemptId}`)), submissionA);
  await assert.rejects(f.exports.resumeAssessmentAttempt(f.request({
    attemptId: a.attemptId, attemptToken: credentialB.attemptToken
  })), { code: "permission-denied" });
  const quota = [...f.docs.entries()].filter(([key]) => key.startsWith("assessmentRateLimits/"));
  assert.equal(quota.length, 1);
  assert.equal(quota[0][1].count, 2);
  console.log(JSON.stringify({
    source: "338c0432645803a58f71531a0d016abb5a44cbf9",
    environment: "synthetic memory only; same 127.0.0.1 IP",
    assertions: [
      "A submitted; credential remains submitted in localStorage",
      "new client resumes A submitted receipt",
      "B with A credential rejected",
      "explicit credential rotation creates isolated B on same IP",
      "A submission unchanged",
      "B token cannot resume A",
      "single shared-IP quota counts both starts normally",
      "current old client follows replacement B credential: cross-tab guard required"
    ], result: "PASS", productCodeChanged: false, cloudCalls: 0
  }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
