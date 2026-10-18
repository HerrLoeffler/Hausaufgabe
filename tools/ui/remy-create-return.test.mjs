import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appSource = readFileSync(path.join(repoRoot, "app.js"), "utf8");
const start = appSource.indexOf("async function startAiCreationJob(");
const end = appSource.indexOf("\nfunction generateAiPrompt()", start);
assert.ok(start >= 0 && end > start, "startAiCreationJob source is available for the focused flow test");
const functionSource = appSource.slice(start, end).trim();

function harness({ response, error } = {}) {
  const calls = { dashboard: 0, resets: 0, errors: 0 };
  const generateButton = { disabled: false };
  const state = {
    aiStarting: false,
    aiJobs: [{ id: "already-running", status: "running" }],
    aiMaterials: []
  };
  const context = {
    state,
    firstAiGuideStep: null,
    crypto: { randomUUID: () => "12345678-1234-1234-1234-123456789abc" },
    aiApi: {
      startAiTestJob: async () => {
        if (error) throw error;
        return response;
      }
    },
    $: id => id === "generateAiTestBtn" ? generateButton : { id },
    setAiProgress() {},
    markFirstAiGuideDone() {},
    renderAiMaterials() {},
    resetAiFormForNewTest() { calls.resets += 1; },
    toast() {},
    loadDashboard: async () => { calls.dashboard += 1; },
    renderAiJobs() {
      const active = state.aiJobs.filter(job => ["queued", "running"].includes(job.status)).length;
      generateButton.disabled = active >= 2;
    },
    aiFriendlyError: err => String(err?.message || "error"),
    showReportableError() { calls.errors += 1; },
    REPORTABLE_ERROR_CODES: { aiCreate: "aiCreate", aiSimilar: "aiSimilar" }
  };
  const run = vm.runInNewContext(`(${functionSource.replace(/^async function startAiCreationJob/, "async function")})`, context);
  return { run, calls, state, generateButton };
}

const successful = harness({ response: { jobId: "new-job" } });
await successful.run({ topic: "Brüche", count: 8, materials: [] });
assert.equal(successful.calls.dashboard, 1, "confirmed start returns to Meine Tests");
assert.equal(successful.state.aiJobs[0].id, "already-running", "an existing active job remains tracked");
assert.equal(successful.state.aiJobs[1].id, "new-job", "the confirmed job is queued for background progress");
assert.equal(successful.calls.resets, 1, "successful start resets the form only after confirmation");
assert.equal(successful.state.aiStarting, false);
assert.equal(successful.generateButton.disabled, true, "the existing two-active-job limit still applies after return");

const failed = harness({ error: new Error("offline") });
const request = { topic: "Satzglieder", count: 7, materials: [] };
await failed.run(request);
assert.equal(failed.calls.dashboard, 0, "failed start keeps the teacher on the creation view");
assert.equal(failed.calls.resets, 0, "failed start preserves the form contents");
assert.equal(failed.state.aiJobs.length, 1, "failed start does not add an optimistic queue item");
assert.equal(failed.calls.errors, 1, "failure remains reportable");
assert.equal(failed.state.aiStarting, false);
assert.equal(failed.generateButton.disabled, false);

console.log("Remy create return flow: 2/2 passed");
