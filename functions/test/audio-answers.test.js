"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { answerAudioIndexes, answerAudioReady, generateAnswerAudios } = require("../lib/audio-answers");

test("grouping voice memos use every existing word as a separate script", async () => {
  const grouping = { id: "q-group", type: "grouping", groups: [{ name: "Nomen", items: ["Zauberhut", "Känguru"] }, { name: "Verben", items: ["schnarcht", "hüpft"] }, { name: "Adjektive", items: ["glitzernd", "mutig"] }] };
  const scripts = [];
  const assets = await generateAnswerAudios(grouping, async ({ script }) => { scripts.push(script); return { audioDataUrl: "data:audio/mpeg;base64,QUJD" }; });
  assert.deepEqual(scripts, ["Zauberhut", "Känguru", "schnarcht", "hüpft", "glitzernd", "mutig"]);
  assert.equal(assets.length, 6);
  assert.deepEqual(answerAudioIndexes([grouping], 1), [0]);
});
const { planTestBatches } = require("../lib/test-batches");
const { validateTest } = require("../lib/validation");
const { questionSchemaForType } = require("../lib/schemas");

const audioDataUrl = "data:audio/mpeg;base64,QUJD";

test("exact answer-audio allocation uses complete short choices including dropdown", () => {
  const questions = [
    { type: "text" },
    { type: "single", options: [{ text: "A" }, { text: "B" }] },
    { type: "number" },
    { type: "multi", options: [{ text: "A" }, { text: "B" }, { text: "C" }] },
    { type: "dropdown", options: [{ text: "A" }, { text: "B" }] }
  ];
  assert.deepEqual(answerAudioIndexes(questions, 2), [1, 4]);
  assert.deepEqual(answerAudioIndexes(questions, 3), [1, 3, 4]);
  assert.throws(() => answerAudioIndexes(questions, 4), /fehlen geeignete/);
  assert.deepEqual(answerAudioIndexes(questions, 0), []);
});

test("batch planner and final validation preserve the requested audio-answer count", () => {
  const batches = planTestBatches({ count: 25, points: 25, imageMode: "none", audioMode: "none", audioAnswerQuestionCount: 5 });
  assert.equal(batches.reduce((sum, batch) => sum + batch.audioAnswerQuestionCount, 0), 5);
  const base = { text: "Wähle die Zahl.", points: 1, options: [{ text: "Drei", correct: true }, { text: "Vier", correct: false }], mediaIntent: { kind: "none" }, audioIntent: { kind: "none" } };
  const questions = [{ ...base, type: "single" }, { ...base, type: "number", numericAnswer: 3 }];
  assert.match(validateTest({ title: "Test", questions }, { audioAnswerQuestionCount: 2 }).join(" "), /fehlen geeignete Auswahlaufgaben/);
});

test("generated listening tasks choose a presentation mode explicitly", () => {
  const schema = questionSchemaForType("single").properties.audioIntent;
  assert.ok(schema.required.includes("presentation"));
  assert.deepEqual(schema.properties.presentation.enum, ["supplement", "listening-only"]);
});

test("each answer receives its own speech asset without exposing a solution key", async () => {
  const calls = [];
  const question = { id: "q001", type: "single", options: [
    { text: "x = 3", correct: false }, { text: "x = 5", correct: true },
    { text: "x = 7", correct: false }, { text: "x = 19", correct: false }
  ] };
  const assets = await generateAnswerAudios(question, async args => {
    calls.push(args);
    return { audioDataUrl };
  });
  assert.deepEqual(calls.map(call => call.script), question.options.map(option => option.text));
  assert.equal(assets.length, 4);
  assert.ok(assets.every(asset => !Object.hasOwn(asset, "correct")));
  assert.equal(question.options[1].correct, true);
  assert.equal(answerAudioReady({ ...question, audioAnswerMode: "audio-only", options: question.options.map(option => ({ ...option, audioDataUrl })) }), true);
});

test("failed or stale option audio leaves the question unpublished", async () => {
  const question = { type: "multi", audioAnswerMode: "audio-only", options: [
    { text: "A", audioDataUrl }, { text: "B", audioDataUrl, audioNeedsRegeneration: true }
  ] };
  assert.equal(answerAudioReady(question), false);
  await assert.rejects(() => generateAnswerAudios(question, async ({ script }) => script === "B" ? null : { audioDataUrl }), /fehlt/);
  assert.equal(question.options[0].audioDataUrl, audioDataUrl);
  assert.equal(question.options[1].audioNeedsRegeneration, true);
});

test("normal text choices and legacy solution audio do not require answer audio", () => {
  assert.equal(answerAudioReady({ type: "single", options: [{ text: "A" }, { text: "B" }] }), true);
  assert.equal(answerAudioReady({ type: "single", solutionAudioDataUrl: audioDataUrl, options: [{ text: "A" }, { text: "B" }] }), true);
});

test("spoken choices reject oversized, mixed-image and excessive option payloads", async () => {
  const options = [{ text: "A", audioDataUrl }, { text: "B", audioDataUrl }];
  assert.equal(answerAudioReady({ type: "single", audioAnswerMode: "audio-only", options: [...options, ...options, options[0]] }), false);
  assert.equal(answerAudioReady({ type: "single", audioAnswerMode: "audio-only", options: [{ ...options[0], imageDataUrl: "data:image/png;base64,AA==" }, options[1]] }), false);
  assert.equal(answerAudioReady({ type: "single", audioAnswerMode: "audio-only", audioDataUrl: "x".repeat(700000), options }), false);
  await assert.rejects(() => generateAnswerAudios({ type: "single", options: [...options, ...options, options[0]] }, async () => ({ audioDataUrl })), /zwei bis vier/);
});
