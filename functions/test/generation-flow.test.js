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
const { validateAndRepairTest } = require("../lib/repair-test");
const { reviewAndRepairTest } = require("../lib/quality");
const { generateTestInBatches } = require("../lib/test-batches");
const source = readFileSync(require.resolve("../index.js"), "utf8");
const handler = source.slice(source.indexOf("async function generateTestForUser("), source.indexOf("\nexports.generateTest ="));

test("actual generation handler connects constrained batches, validation, review and result metadata", async () => {
  for (const pictureCount of [0, 5]) {
    let generated = 0, calls = 0, reviewed = 0, cleaned = 0;
    const usage = [], progress = [];
    const context = vm.createContext({
      ...constants, ...validation, ...schemas, ...prompts, HttpsError,
      generateTestInBatches, validateAndRepairTest, reviewAndRepairTest,
      randomUUID: () => "test-request", cleanInput: data => data, sanitizeMaterials: () => [],
      consumeQuota: async () => {}, materialInputs: async () => [], qualityMemoryPrompt: () => "",
      loadQualityMemory: async () => ({ negativeQuestions: [], memoryVersion: 2, stats: { total: 0 } }),
      structuredResponse: async ({ schema, schemaName, userPrompt }) => {
        assert.equal(schemaName, "testify_test_v2"); calls++;
        assert.equal(schema.properties.questions.minItems, 10);
        assert.equal(schema.properties.questions.maxItems, 10);
        const images = Number(userPrompt.match(/Exakt (\d+) Aufgabe/)?.[1] || 0);
        const questions = Array.from({ length: 10 }, (_, i) => {
          const n = ++generated;
          return { type: i % 2 ? "truefalse" : "gapfill", text: i % 2 ? `Behauptung ${n}: Alle Sätze sind Fragen.` : `Rechne: ${n} plus 1 ergibt [${n + 1}].`, points: 1,
            ...(i % 2 ? { correctBoolean: false } : {}),
            mediaIntent: i < images ? { kind: "ai_generated", prompt: `Ein Hund neben einem Baum ${n}`, altText: "Hund" } : { kind: "none" } };
        });
        return { data: { title: "Satzbaustelle", subject: "Deutsch", grade: "5", description: "", questions }, usage: { total_tokens: 20 } };
      },
      reviewDraft: async draft => { reviewed++; assert.equal(draft.questions.length, 50); return { data: { issues: [] }, usage: { total_tokens: 30 } }; },
      recordUsage: async (...args) => { usage.push(args); },
      deleteUploadedMaterials: async () => { cleaned++; }, reportAiError: error => error,
      console: { info() {}, warn() {}, error() {} }
    });
    vm.runInContext(handler, context);
    const response = await context.generateTestForUser("teacher", {
      schoolType: "Mittelschule", region: "Bayern", subject: "Deutsch", grade: "5", topic: "Satzbaustelle", difficulty: "gemischt",
      count: 50, points: 40, allowedTypes: ["truefalse", "gapfill"], imageMode: pictureCount ? "exact" : "none",
      exactImageCounts: true, imageQuestionCount: pictureCount, imageAnswerQuestionCount: 0, maxVisualQuestions: pictureCount,
      materialMode: "inspiration", allowImageChoices: false
    }, async (...args) => { progress.push(args); });
    assert.equal(calls, 5); assert.equal(reviewed, 1); assert.equal(cleaned, 1);
    assert.equal(response.test.questions.length, 50);
    assert.equal(response.test.questions.reduce((sum, q) => sum + q.points, 0), 40);
    assert.equal(response.test.questions.filter(q => q.mediaIntent.kind === "ai_generated").length, pictureCount);
    assert.equal(response.meta.promptVersion, "testify-ai-v14");
    assert.equal(response.meta.qualityWarnings.length, 0);
    assert.equal(usage[0][2].total_tokens, 130);
    assert.ok(progress.some(([stage]) => stage === "quality-review"));
  }
});
