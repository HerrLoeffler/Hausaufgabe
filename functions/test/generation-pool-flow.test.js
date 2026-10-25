"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const { HttpsError } = require("firebase-functions/v2/https");
const constants = require("../lib/constants");
const validation = require("../lib/validation");
const schemas = require("../lib/schemas");
const prompts = require("../lib/prompts");
const { variantPrompt } = require("../lib/test-variant");
const { preparePedagogicalPool } = require("../lib/pedagogical-pool");
const { validateAndRepairTest } = require("../lib/repair-test");
const { reviewAndRepairTest } = require("../lib/quality");
const { generateTestInBatches } = require("../lib/test-batches");
const source = readFileSync(require.resolve("../index.js"), "utf8");
const handler = source.slice(source.indexOf("async function generateTestForUser("), source.indexOf("\nexports.generateTest ="));
const catalog = { version: "fixture-v1", profiles: [{ id: "pp-1234567890abcdef", subject: "Mathematik", schoolType: "Mittelschule", region: "Bayern", grades: [9], reviewStatus: "verified", mappingStatus: "confirmed", topics: ["prozent", "rabatt"], learningGoal: "Prozentwert in einem neuen Kaufkontext bestimmen.", taskPattern: "Eigenen Preis mit neuem Rabatt wählen.", qualityHints: ["Grundwert und Prozentwert unterscheiden."], modalities: ["text"], source: { contentId: "1234567890abcdef", page: 1 } }] };
const input = { subject: "Mathematik", schoolType: "Mittelschule", region: "Bayern", grade: "9", topic: "Prozent und Rabatt", difficulty: "mittel", count: 1, points: 1, allowedTypes: ["number"], imageMode: "none", audioMode: "none", audioQuestionCount: 0, materialMode: "inspiration" };
const q = { type: "number", text: "Ein Artikel kostet 80 Euro. Wie viele Euro entsprechen 25 Prozent davon?", numericAnswer: 20, tolerance: 0, unit: "Euro", points: 1, mediaIntent: { kind: "none" }, audioIntent: { kind: "none" } };

async function run(change = {}, broken = false, queued = false) {
  const calls = [], logs = []; let repairs = 0;
  const context = vm.createContext({ ...constants, ...validation, ...schemas, ...prompts, HttpsError, variantPrompt,
    generateTestInBatches, validateAndRepairTest, reviewAndRepairTest,
    preparePedagogicalPool: data => preparePedagogicalPool(data, catalog),
    randomUUID: () => "pool-test", cleanSourceTest: () => null,
    sanitizeMaterials: () => [], materialInputs: async () => [], consumeQuota: async () => {},
    learningPrompt: require("../lib/feedback-learning").learningPrompt, qualityMemoryPrompt: () => "", teacherQualityGuide: () => "",
    loadQualityMemory: async () => ({ negativeQuestions: [], memoryVersion: 3, stats: { total: 0 } }),
    structuredResponse: async request => {
      calls.push(request);
      if (request.schemaName === "testify_test_question_replacement_v2") {
        repairs++;
        return { data: { ...q, numericAnswer: null }, usage: { total_tokens: 5 } };
      }
      return { data: { title: "Rabatte", subject: "Mathematik", grade: "9", description: "", questions: [{ ...q, ...(broken && request.schemaName !== "testify_test_repair_v2" ? { numericAnswer: null } : {}) }] }, usage: { total_tokens: 10 } };
    },
    reviewDraft: async () => ({ data: { issues: [] }, usage: { total_tokens: 1 } }),
    recordUsage: async (...args) => logs.push(args), deleteUploadedMaterials: async () => {}, reportAiError: err => err,
    console: { info() {}, warn() {} }
  });
  vm.runInContext(source.slice(source.indexOf("function cleanInput("), source.indexOf("\nasync function structuredResponse(")), context);
  vm.runInContext(handler, context);
  const raw = { ...input, ...change };
  const cleaned = context.cleanInput(raw);
  const request = queued ? { ...Object.fromEntries(Object.entries(cleaned).filter(([, v]) => v !== undefined)), pedagogicalContextKnown: cleaned.pedagogicalContextKnown === true } : raw;
  const result = await context.generateTestForUser("u", request);
  return { result, calls, logs, repairs, cleaned: context.cleanInput({ ...input, ...change }) };
}

test("actual handler passes selected profiles to the provider and returns safe provenance", async () => {
  const { result, calls } = await run();
  assert.equal(result.meta.pedagogicalPool?.profileCount, 1);
  assert.deepEqual(Array.from(result.meta.pedagogicalPool.profileIds), ["pp-1234567890abcdef"]);
  assert.match(calls[0].userPrompt, /Prozentwert in einem neuen Kaufkontext/);
  assert.equal(calls[0].content.length, 0);
  assert.equal(result.test.questions.length, 1);
  assert.equal(result.test.questions[0].points, 1);
  assert.equal(result.test.questions[0].mediaIntent.kind, "none");
});

test("individual replacement and full repair keep the same reviewed pool context", async () => {
  const { result, calls, repairs } = await run({}, true);
  assert.ok(repairs > 0);
  assert.ok(calls.some(c => c.schemaName === "testify_test_repair_v2"));
  for (const call of calls) assert.match(call.userPrompt, /Prozentwert in einem neuen Kaufkontext/);
  assert.equal(result.test.questions[0].numericAnswer, 20);
  assert.equal(result.meta.fullRepair, true);
});

test("no match keeps the original first-generation prompt byte-for-byte", async () => {
  const { result, calls, cleaned } = await run({ grade: "4" });
  assert.equal(calls[0].userPrompt, `${prompts.testUserPrompt(cleaned)}\n`);
  assert.equal(result.meta.pedagogicalPool?.profileCount, 0);
});

test("actual input defaults do not masquerade as confirmed pool school or region", async () => {
  for (const change of [{ schoolType: undefined }, { region: undefined }, { schoolType: undefined, region: undefined }, { schoolType: "" }, { region: "" }]) {
    const { result, calls, cleaned } = await run(change);
    assert.equal(cleaned.schoolType, "Mittelschule");
    assert.equal(cleaned.region, "Bayern");
    assert.equal(result.meta.pedagogicalPool.profileCount, 0);
    assert.equal(calls[0].userPrompt, `${prompts.testUserPrompt(cleaned)}\n`);
  }
});

test("normalization across queued jobs preserves whether curriculum context was actually provided", async () => {
  for (const change of [{ schoolType: undefined }, { region: undefined }, { schoolType: "" }, { region: "" }]) {
    const { result } = await run(change, false, true);
    assert.equal(result.meta.pedagogicalPool.profileCount, 0);
  }
  const { result } = await run({}, false, true);
  assert.equal(result.meta.pedagogicalPool.profileCount, 1);
});
