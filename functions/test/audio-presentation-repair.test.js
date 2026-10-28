"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { normalizeQuestion, validateTest } = require("../lib/validation");
const { validateAndRepairTest } = require("../lib/repair-test");
const question = n => normalizeQuestion({ type: "single", text: `Welche Zahl folgt auf ${n}?`, points: 1,
  options: [{ text: String(n + 1), correct: true }, { text: String(n + 2), correct: false }], mediaIntent: { kind: "none" },
  audioIntent: n < 5 ? { kind: "ai_generated", script: `Die gesuchte Zahl folgt auf ${n}. Welche Zahl ist gemeint?`, presentation: n < 4 ? "listening-only" : "supplement", instruction: "Höre die Aufnahme und wähle eine Antwort.", reason: "Hören" } : { kind: "none" } });
const clone = value => JSON.parse(JSON.stringify(value));
const draft = () => ({ title: "Zahlen", questions: Array.from({ length: 20 }, (_, i) => question(i + 1)) });
const options = { expectedCount: 20, targetPoints: 20, allowedTypes: ["single"], allowImages: false, allowAudio: true,
  audioQuestionCount: 4, audioAnswerQuestionCount: 4, fullAudioQuestionCount: 2, audioPresentationPolicy: "visible-plus-full" };
const noProvider = { generateQuestion: async () => { throw Error("Unnecessary paid question repair"); }, regenerateTest: async () => { throw Error("Unnecessary paid full repair"); } };

test("f382ba09 contract: excess hidden question becomes visible before review without regenerating content", async () => {
  const input = draft(), saved = clone(input);
  assert.ok(validateTest(input, options).some(e => e.startsWith("Hörmodus:")));
  const result = await validateAndRepairTest(input, options, noProvider);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(validateTest(result.test, options), []);
  assert.equal(result.test.questions.filter(q => q.audioIntent.presentation === "listening-only").length, 2);
  assert.equal(result.test.questions.filter(q => q.audioIntent.kind === "ai_generated").length, 4);
  for (let i = 0; i < 20; i++) {
    const actual = clone(result.test.questions[i]);
    if (Object.hasOwn(saved.questions[i].audioIntent, "presentation")) actual.audioIntent.presentation = saved.questions[i].audioIntent.presentation;
    else delete actual.audioIntent.presentation;
    assert.deepEqual(actual, saved.questions[i]);
  }
  assert.deepEqual(input, saved);
  assert.equal(result.fullRepair, false);
});

test("explicit zero demotes hidden audio; legacy presentation remains untouched", async () => {
  const input = draft();
  const zero = await validateAndRepairTest(input, { ...options, audioAnswerQuestionCount: 0, fullAudioQuestionCount: 0 }, noProvider);
  assert.equal(zero.test.questions.filter(q => q.audioIntent.presentation === "listening-only").length, 0);
  const legacy = { ...options }; delete legacy.audioPresentationPolicy; delete legacy.fullAudioQuestionCount;
  const result = await validateAndRepairTest(input, legacy, noProvider);
  assert.deepEqual(result.test, input);
});

test("missing full tasks and invalid answer content still fail closed", async () => {
  const input = draft(); input.questions[0].options = [];
  input.questions[1].audioIntent.presentation = "supplement";
  let attempts = 0;
  const result = await validateAndRepairTest(input, options, { generateQuestion: async () => { attempts++; return input.questions[0]; }, regenerateTest: async () => input, maxQuestionAttempts: 1 });
  assert.ok(result.errors.length);
  assert.ok(result.errors.some(e => /vollständige Audioaufgaben/.test(e)));
  assert.ok(attempts <= 1);
});

test("quality replacement cannot turn a visible audio question into an extra full task", async () => {
  const { reviewAndRepairTest } = require("../lib/quality");
  const input = draft(); input.questions[2].audioIntent.presentation = "supplement";
  let reviews = 0, calls = 0;
  const result = await reviewAndRepairTest(input, options, {
    review: async current => {
      reviews++;
      assert.deepEqual(validateTest(current, options), []);
      return { issues: current.questions[3].text === input.questions[3].text
        ? [{ index: 3, reason: "incorrect", detail: "Synthetic content defect" }] : [] };
    },
    generateQuestion: async () => {
      calls++;
      const replacement = question(101);
      replacement.audioIntent = { ...input.questions[3].audioIntent, script: "Welche Zahl folgt auf einhunderteins?", presentation: "listening-only" };
      return replacement;
    },
    regenerateTest: noProvider.regenerateTest
  });
  assert.equal(calls, 1); assert.equal(reviews, 2);
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions[3].audioIntent.presentation, "supplement");
  assert.notEqual(result.test.questions[3].text, input.questions[3].text);
});
