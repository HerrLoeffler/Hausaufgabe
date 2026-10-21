import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise the actual report handler with a Firestore batch and a minimal card.
const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const handler = app.slice(app.indexOf("async function submitTechnicalErrorReport("), app.indexOf('\nwindow.addEventListener("error"'));
function setup({ rejectCommit = false, switchUser = false } = {}) {
  const writes = [];
  let removed = false, renders = 0;
  const button = {}, status = {};
  const state = { user: { uid: "teacher1" }, profile: {}, aiJobs: [{ id: "job1", status: "failed" }] };
  const card = {
    __reportPayload: { details: { jobId: "job1" }, errorCode: "AI-SIMILAR-001", userMessage: "unavailable" },
    querySelector: selector => selector === ".reportableErrorSend" ? button : status,
    classList: { add() {} }, remove() { removed = true; }
  };
  const context = vm.createContext({ state, crypto: { randomUUID: () => "abcde-12345" }, db: {},
    doc: (_, ...parts) => parts.join("/"), serverTimestamp: () => "server-time",
    writeBatch: () => ({ set: (...args) => writes.push(args), commit: async () => {
      if (switchUser) state.user = { uid: "teacher2" };
      if (rejectCommit) throw new Error("permission-denied");
    } }), console: { error() {} }, toast() {}, renderAiJobs() { renders++; }
  });
  vm.runInContext(handler, context);
  return { run: () => context.submitTechnicalErrorReport(card), state, writes, button, status,
    removed: () => removed, renders: () => renders };
}

test("report and acknowledgement are committed together before hiding the job", async () => {
  const h = setup(); await h.run();
  assert.equal(h.writes.length, 2);
  assert.match(h.writes[0][0], /^feedback\/err-rpt-/);
  assert.equal(h.writes[1][0], "users/teacher1");
  assert.equal(h.writes[1][1].aiJobNotices.job1.reportId, h.writes[0][1].reportId);
  assert.equal(h.writes[1][2].merge, true);
  assert.equal(h.state.profile.aiJobNotices.job1.reason, "reported");
  assert.equal(h.removed(), true);
  assert.equal(h.renders(), 1);
});

test("failed report stays visible and retryable without an acknowledgement", async () => {
  const h = setup({ rejectCommit: true }); await h.run();
  assert.equal(h.state.profile.aiJobNotices, undefined);
  assert.equal(h.removed(), false);
  assert.equal(h.button.disabled, false);
  assert.match(h.status.textContent, /fehlgeschlagen/);
  assert.equal(h.renders(), 0);
});

test("account switch during reporting cannot acknowledge another account's job", async () => {
  const h = setup({ switchUser: true }); await h.run();
  assert.equal(h.state.profile.aiJobNotices, undefined);
  assert.equal(h.writes[1][0], "users/teacher1");
  assert.equal(h.renders(), 0);
});
