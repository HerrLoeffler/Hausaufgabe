"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { planTestBatches, generateTestInBatches } = require("../lib/test-batches");
const { normalizeQuestion, validateTest } = require("../lib/validation");
const { balanceTestPoints } = require("../lib/repair-test");
const { storedAiQuestion } = require("../lib/ai-job");

test("all sizes preserve count, half-step points and exact image allocation", () => {
  for (let count = 1; count <= 100; count++) for (let images = 0; images <= Math.min(5, count); images++) for (const points of [count / 2, count / 2 + 0.5, count + 3.5]) {
    const batches = planTestBatches({ count, points, exactImageCounts: true, imageQuestionCount: images, imageMode: images ? "exact" : "none" });
    assert.equal(batches.reduce((n, b) => n + b.count, 0), count);
    assert.equal(batches.reduce((n, b) => n + b.points, 0), points);
    assert.equal(batches.reduce((n, b) => n + b.imageQuestionCount, 0), images);
    for (const batch of batches) {
      assert.ok(batch.points >= batch.count / 2);
      assert.ok(batch.imageQuestionCount <= batch.count);
      assert.equal((batch.points * 2) % 1, 0);
      if (count > 20) assert.ok(batch.count <= 10);
    }
  }
});
test("50-task generation assembles and stores the draft with zero, one and five images", async () => {
  for (const images of [0, 1, 5]) {
    const input = { count: 50, points: 40, exactImageCounts: true, imageQuestionCount: images, imageMode: images ? "exact" : "none" };
    let calls = 0, imageCalls = 0;
    const output = await generateTestInBatches(input, async (batch, prior) => {
      assert.equal(prior.length, batch.batchOffset); calls++;
      return { data: { title: "Satzbaustelle", subject: "Deutsch", grade: "5", description: "",
        questions: Array.from({ length: batch.count }, (_, i) => ({ type: "truefalse", text: `Aussage ${batch.batchOffset + i + 1}: Ein Satz enthält Satzglieder.`, points: 1, correctBoolean: false,
          mediaIntent: i < batch.imageQuestionCount ? { kind: "ai_generated", prompt: "Ein Baum", altText: "Baum" } : { kind: "none" } })) }, usage: { total_tokens: 10 } };
    });
    const draft = balanceTestPoints({ ...output.data, questions: output.data.questions.map(normalizeQuestion) }, 40);
    assert.deepEqual(validateTest(draft, { expectedCount: 50, targetPoints: 40, imageQuestionCount: images, imageAnswerQuestionCount: 0 }), []);
    const stored = [];
    for (let i = 0; i < draft.questions.length; i++) stored.push(await storedAiQuestion(draft.questions[i], i, {
      model: "mock", promptVersion: "v14", generateMedia: async () => { imageCalls++; return { imageDataUrl: "data:image/webp;base64,abc" }; }
    }));
    assert.equal(calls, 5); assert.equal(output.usage.total_tokens, 50);
    assert.equal(imageCalls, images); assert.equal(stored.length, 50);
    assert.ok(stored.every(q => q.correctBoolean === false));
  }
});


test("100-task generation is split into ten bounded batches", async () => {
  const input = { count: 100, points: 50, exactImageCounts: true, imageQuestionCount: 5, imageMode: "exact" };
  let calls = 0;
  const output = await generateTestInBatches(input, async (batch, prior) => {
    calls += 1;
    assert.ok(batch.count <= 10);
    assert.equal(prior.length, batch.batchOffset);
    return { data: { title: "Großer Test", subject: "Deutsch", grade: "5", description: "", questions: Array.from({ length: batch.count }, (_, i) => ({ type: "truefalse", text: `Aussage ${batch.batchOffset + i + 1}`, points: 0.5, correctBoolean: true, mediaIntent: { kind: i < batch.imageQuestionCount ? "ai_generated" : "none", prompt: i < batch.imageQuestionCount ? "Schulszene" : "" } })) }, usage: {} };
  });
  assert.equal(calls, 10);
  assert.equal(output.data.questions.length, 100);
});
