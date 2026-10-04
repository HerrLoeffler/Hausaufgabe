"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { questionSchemaForType } = require("../lib/schemas");
const { normalizeQuestion, validateQuestion, validateTest } = require("../lib/validation");
const { planTestBatches } = require("../lib/test-batches");
const { storedAiQuestion, audioCount } = require("../lib/ai-job");

function baseQuestion(audioKind = "none") {
  return {
    type: "single",
    text: "Wann fährt der Zug ab?",
    points: 1,
    options: [
      { text: "Um acht Uhr.", correct: true },
      { text: "Um neun Uhr.", correct: false }
    ],
    acceptedAnswers: [],
    manualReview: false,
    correctBoolean: false,
    pairs: [],
    items: [],
    acceptedOrders: [],
    groups: [],
    passage: "",
    targetWords: [],
    numericAnswer: 0,
    tolerance: 0,
    unit: "",
    mediaIntent: { kind: "none", prompt: "", altText: "", count: 0, sourceMaterialId: "", reason: "" },
    audioIntent: audioKind === "ai_generated"
      ? { kind: "ai_generated", script: "Der Zug nach München fährt heute um acht Uhr ab.", reason: "Hörverstehen" }
      : { kind: "none", script: "", reason: "" }
  };
}

test("audio intent is part of strict question schemas", () => {
  const schema = questionSchemaForType("single", { allowAudio: true, audioKind: "ai_generated" });
  assert.ok(schema.required.includes("audioIntent"));
  assert.deepEqual(schema.properties.audioIntent.properties.kind.enum, ["ai_generated"]);
  assert.equal(schema.properties.audioIntent.properties.script.maxLength, 500);
});

test("normalization supplies audio intent for older questions", () => {
  const q = normalizeQuestion({ ...baseQuestion(), audioIntent: undefined });
  assert.deepEqual(q.audioIntent, { kind: "none", script: "", reason: "" });
});

test("audio validation requires script and exact test count", () => {
  const broken = baseQuestion("ai_generated");
  broken.audioIntent.script = "";
  assert.match(validateQuestion(broken).join(" "), /Hörtext fehlt/);
  const one = baseQuestion("ai_generated");
  const none = baseQuestion("none");
  assert.deepEqual(validateTest({ title: "Test", questions: [one, none] }, { audioQuestionCount: 1 }), []);
  assert.match(validateTest({ title: "Test", questions: [one, none] }, { audioQuestionCount: 2 }).join(" "), /2 Höraufgaben/);
});

test("batch planner preserves exact listening-task count", () => {
  const batches = planTestBatches({
    count: 24,
    points: 24,
    allowedTypes: ["single"],
    exactImageCounts: true,
    imageQuestionCount: 0,
    imageMode: "none",
    exactAudioCounts: true,
    audioQuestionCount: 5,
    audioMode: "exact"
  });
  assert.equal(batches.reduce((sum, batch) => sum + batch.audioQuestionCount, 0), 5);
  assert.equal(batches.reduce((sum, batch) => sum + batch.count, 0), 24);
});

test("stored AI question attaches generated audio and keeps teacher script", async () => {
  let generated = 0;
  const q = await storedAiQuestion(baseQuestion("ai_generated"), 0, {
    model: "test-model",
    promptVersion: "test",
    generateAudio: async ({ script }) => {
      generated += 1;
      assert.match(script, /acht Uhr/);
      return {
        audioDataUrl: "data:audio/mpeg;base64,QUJD",
        audioByteSize: 3,
        audioVoice: "marin",
        audioModel: "test-audio",
        audioAiGenerated: true
      };
    }
  });
  assert.equal(generated, 1);
  assert.equal(q.audioNeedsRegeneration, false);
  assert.match(q.audioScript, /acht Uhr/);
  assert.equal(q.audioDataUrl, "data:audio/mpeg;base64,QUJD");
  assert.equal(audioCount([baseQuestion("ai_generated"), baseQuestion("none")]), 1);
});
