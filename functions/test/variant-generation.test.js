"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const { HttpsError } = require("firebase-functions/v2/https");
const { questionSchema, questionSchemaForType } = require("../lib/schemas");
const { validateQuestion, normalizeQuestion } = require("../lib/validation");
const { questionUserPrompt } = require("../lib/prompts");
const source = readFileSync(require.resolve("../index.js"), "utf8");
const handler = source.slice(source.indexOf("exports.regenerateQuestion ="), source.indexOf("\nexports.analyzeMaterial ="));

test("the actual variant handler constrains type and chosen image mode before calling the model", async () => {
  for (const mediaKind of ["none", "ai_generated"]) {
    let calls = 0;
    const current = { type: "gapfill", text: "Der Hund [bellt].", points: 1 };
    const replacement = { type: "gapfill", text: "Die Katze [schläft].", points: 1,
      mediaIntent: mediaKind === "none" ? { kind: "none" }
        : { kind: "ai_generated", prompt: "Eine schlafende Katze", altText: "Katze" } };
    const context = vm.createContext({
      exports: {}, onCall: (_options, callback) => callback, callableOpts: {}, HttpsError,
      QUESTION_TYPES: ["gapfill", "truefalse"], LIMITS: { maxPromptChars: 1000, maxQuestions: 100 },
      questionSchema, questionSchemaForType, questionUserPrompt, normalizeQuestion, validateQuestion,
      requireAiUser: async () => ({ uid: "teacher" }), consumeQuota: async () => {},
      sanitizeMaterials: () => [], loadQualityMemory: async () => ({ negativeQuestions: [], memoryVersion: 3, stats: {} }),
      qualityMemoryPrompt: () => "", teacherQualityGuide: () => "", variantRepeats: () => false, sameQuestion: () => false,
      structuredResponse: async ({ schema, userPrompt }) => {
        calls += 1;
        assert.deepEqual(schema.properties.type.enum, ["gapfill"]);
        assert.deepEqual(schema.properties.mediaIntent.properties.kind.enum, [mediaKind]);
        assert.ok(userPrompt.includes(`mediaIntent.kind=${mediaKind}`));
        return { data: replacement, usage: {} };
      },
      reviewDraft: async () => ({ data: { issues: [] }, usage: {} }), normalizeReviewIssues: () => [],
      recordUsage: async () => {}, reportAiError: error => error,
      TEXT_MODEL: "model", PROMPT_VERSION: "v15"
    });
    vm.runInContext(handler, context);
    const response = await context.exports.regenerateQuestion({ data: {
      question: current, variant: true, mediaKind, allowImages: mediaKind !== "none",
      allowedTypes: ["gapfill", "truefalse"], testContext: {}, materials: []
    } });
    assert.equal(calls, 1);
    assert.equal(response.question.type, "gapfill");
    assert.equal(response.question.mediaIntent.kind, mediaKind);
  }
});
