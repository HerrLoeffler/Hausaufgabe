"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const core = require("../lib/telemetry-ai-core");

class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }

function setup({ active = true } = {}) {
  const data = new Map([
    ["users/teacher", { status: "active", role: "teacher" }],
    ["users/teacher/aiEvents/e1", { kind: "test", model: "gpt-x", promptVersion: "p1", inputTokens: 100, outputTokens: 20, totalTokens: 120, failed: false, questionCount: 10 }],
    ["users/other/aiEvents/e2", { kind: "test", model: "private", totalTokens: 999 }],
    ["feedback/f1", { category: "ai_question", userId: "teacher", verdict: "good", promptVersion: "p1" }],
    ["feedback/f2", { category: "ai_question", userId: "other", verdict: "bad", reason: "incorrect" }]
  ]);
  const snap = path => ({ exists: data.has(path), data: () => structuredClone(data.get(path)) });
  const db = {
    doc: path => ({ get: async () => snap(path) }),
    collection: path => {
      const filters = [];
      let bound = Infinity;
      const q = {
        where: (field, op, value) => { filters.push([field, op, value]); return q; },
        select: () => q,
        limit: n => { bound = n; return q; },
        get: async () => {
          let rows = [...data].filter(([key]) => key.startsWith(path + "/") && !key.slice(path.length + 1).includes("/"));
          for (const [field, op, value] of filters) rows = rows.filter(([, row]) => op === "==" && row[field] === value);
          rows = rows.slice(0, bound);
          return { size: rows.length, docs: rows.map(([, row]) => ({ data: () => structuredClone(row) })) };
        }
      };
      return q;
    }
  };
  const exports = {};
  const req = id => {
    if (id === "firebase-admin/firestore") return { getFirestore: () => db };
    if (id === "firebase-functions/v2/https") return { onCall: (_opts, handler) => handler, HttpsError };
    if (id === "./telemetry-core") return { enabled: () => active };
    if (id === "./telemetry-ai-core") return core;
    throw new Error(id);
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("../lib/telemetry-ai"), "utf8"), { require: req, exports, Object, Promise });
  return { handlers: exports, data };
}

test("summary is authenticated and scoped to the requesting teacher", async () => {
  const { handlers } = setup();
  const result = await handlers.getExistingAiTelemetrySummary({ auth: { uid: "teacher" }, data: {} });
  assert.equal(result.aiUsage.eventCount, 1);
  assert.equal(result.aiUsage.byModel["gpt-x"], 1);
  assert.equal(result.aiUsage.byModel.private, undefined);
  assert.equal(result.teacherFeedback.feedbackCount, 1);
  assert.equal(result.teacherFeedback.verdicts.good, 1);
  assert.equal(result.teacherFeedback.acceptanceRate, null);
  assert.equal(result.cost, null);
});

test("endpoint is staging-gated, rejects anonymous access and unexpected parameters", async () => {
  const disabled = setup({ active: false });
  await assert.rejects(disabled.handlers.getExistingAiTelemetrySummary({ auth: { uid: "teacher" }, data: {} }), error => error.code === "failed-precondition");
  const active = setup();
  await assert.rejects(active.handlers.getExistingAiTelemetrySummary({ data: {} }), error => error.code === "unauthenticated");
  await assert.rejects(active.handlers.getExistingAiTelemetrySummary({ auth: { uid: "teacher" }, data: { days: 7 } }), error => error.code === "invalid-argument");
});
