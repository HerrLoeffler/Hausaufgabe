"use strict";
// Verification of existing archived code only; no compatibility wrapper is
// shipped. Remote provider traffic is disabled for this local evidence run.
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const net = require("node:net"), http2 = require("node:http2");
function localOnly(value) {
  const host = typeof value === "string" ? new URL(value).hostname : value?.host || value?.hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) throw new Error("Remote network disabled in legacy verification");
}
const nativeFetch = globalThis.fetch; globalThis.fetch = (value, ...args) => { localOnly(typeof value === "string" ? value : value.url || String(value)); return nativeFetch(value, ...args); };
const nativeHttp2 = http2.connect; http2.connect = (authority, ...args) => { localOnly(String(authority)); return nativeHttp2(authority, ...args); };
const nativeConnect = net.connect; net.connect = (...args) => { if (typeof args[0] === "object") localOnly(args[0]); else localOnly({ host: args[1] }); return nativeConnect(...args); };
net.createConnection = net.connect;
process.env.OPENAI_API_KEY = "local-verification-invalid-provider-key";
for (const name of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"]) assert.match(process.env[name] || "", /^(127\.0\.0\.1|localhost):\d+$/);
const req = require("node:module").createRequire(path.resolve(__dirname, "../../functions/package.json"));
const { initializeApp, deleteApp } = req("firebase-admin/app"), { getFirestore } = req("firebase-admin/firestore");
const app = initializeApp(), db = getFirestore(app);
assert.equal(app.options.projectId, "demo-gradecrew-billing");
const root = process.env.GRADECREW_BILLING_LEGACY_SOURCE_ROOT, identityFile = process.env.GRADECREW_BILLING_TEST_IDENTITY_FILE, mapFile = process.env.GRADECREW_BILLING_LEGACY_SOURCE_MAP;
for (const value of [root, identityFile, mapFile]) assert.ok(value && path.isAbsolute(value));
const identity = JSON.parse(fs.readFileSync(identityFile, "utf8"));
assert.equal(identity.project, "gradecrew-staging-2026"); assert.equal(identity.profileRole, "teacher"); assert.match(identity.uid, /^[A-Za-z0-9_-]{1,128}$/);
const rows = JSON.parse(fs.readFileSync(mapFile, "utf8")); assert.equal(rows.length, 33);
function verifiedFile(folder, relative, receipt) {
  const content = fs.readFileSync(path.join(folder, relative)); assert.equal(crypto.createHash("sha256").update(content).digest("hex"), receipt.files[relative]); return content.toString("utf8");
}
test.before(async () => { await db.doc("users/" + identity.uid).set({ role: "teacher", status: "active" }); await db.doc("quizzes/LEGACY01").set({ ownerId: identity.uid, published: false, title: "Local legacy eligibility probe" }); });
test.after(async () => { await db.terminate(); await deleteApp(app); });
for (const row of rows.filter(r => !r.name.endsWith("ProcessAiTestJob"))) test("existing " + row.name + " denies the normal closed-pilot teacher", async () => {
  const folder = path.join(root, row.name), receipt = JSON.parse(fs.readFileSync(path.join(folder, "SOURCE_RECEIPT.json"), "utf8"));
  assert.equal(String(receipt.source.generation), String(row.generation)); assert.equal(receipt.source.object, row.name + "/function-source.zip");
  const packageInfo = JSON.parse(verifiedFile(folder, "package.json", receipt)); verifiedFile(folder, packageInfo.main, receipt);
  const accessFile = row.name.endsWith("ConfigurePracticeSolutionRelease") ? "lib/secure-lifecycle.js" : "lib/access.js";
  const access = verifiedFile(folder, accessFile, receipt); assert.ok(access.includes("previewAccountAllowed"));
  const module = require(path.join(folder, packageInfo.main)), endpoint = module[row.name]; assert.equal(typeof endpoint?.run, "function");
  await assert.rejects(endpoint.run({ auth: { uid: identity.uid, token: { email_verified: true } }, data: { quizId: "LEGACY01" } }), error => error.code === "permission-denied");
  assert.equal((await db.doc("quizzes/LEGACY01").get()).data().published, false);
});
