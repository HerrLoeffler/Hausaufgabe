"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
class HttpsError extends Error { constructor(code, message, details) { super(message); this.code = code; this.details = details; } }
function load() {
  const module = { exports: {} };
  const exports = module.exports;
  const req = id => {
    if (id === "node:crypto") return require("node:crypto");
    if (id === "./telemetry-server-recorder") return { recordAssessmentServerOperation: async () => ({ stored: false }) };
    throw new Error(id);
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../lib/observability"), "utf8"), { require: req, exports, module, process });
  return module.exports.observeAssessment;
}
function logger() { const entries = []; return { entries, api: Object.fromEntries(["info","warn","error"].map(level => [level, (name, data) => entries.push({ level, name, data })])) }; }

test("server recorder receives only the wrapper operation entry and a recorder failure cannot fail an assessment", async () => {
  const observe = load();
  const log = logger();
  let captured;
  const call = observe("submitAssessmentAttempt", async () => ({ ok: true }), {
    logger: log.api, HttpsError, now: (() => { const values = [100, 140]; return () => values.shift() ?? 140; })(), reference: () => "ASM-test",
    record: async payload => { captured = payload; throw new Error("telemetry down"); }
  });
  const result = await call({ data: { quizId: "ABCD", studentName: "PRIVATE", attemptToken: "PRIVATE" } });
  assert.equal(result.ok, true);
  assert.equal(captured.entry.action, "submitAssessmentAttempt");
  assert.equal(captured.entry.status, "ok");
  assert.equal(Object.hasOwn(captured.entry, "studentName"), false);
  assert.equal(Object.hasOwn(captured.entry, "attemptToken"), false);
  assert.equal(log.entries.some(entry => entry.name === "assessment.telemetry_write_failed"), true);
});

test("failed start is offered to the recorder before the safe public error is returned", async () => {
  const observe = load();
  const log = logger();
  let captured;
  const call = observe("startAssessmentAttempt", async () => { throw new HttpsError("permission-denied", "Nein"); }, {
    logger: log.api, HttpsError, now: () => 100, reference: () => "ASM-fail", record: async payload => { captured = payload; }
  });
  await assert.rejects(call({ data: { quizId: "ABCD", studentName: "PRIVATE" } }), error => error.code === "permission-denied");
  assert.equal(captured.entry.status, "failed");
  assert.equal(captured.entry.code, "permission-denied");
  assert.equal(JSON.stringify(captured.entry).includes("PRIVATE"), false);
});
