"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeQuestion, validateTest } = require("../lib/validation");
const { validateAndRepairTest } = require("../lib/repair-test");
const { feedbackMemory, reviewPrompt, normalizeReviewIssues, reviewAndRepairTest, verifyImageScene } = require("../lib/quality");

function question(n) {
  return normalizeQuestion({
    type: "single", text: `Wie viel sind ${n} + 1?`, points: 1,
    options: [{ text: String(n + 1), correct: true }, { text: String(n + 2), correct: false }],
    mediaIntent: { kind: "none", prompt: "", count: 0 }
  });
}
const options = { expectedCount: 1, targetPoints: 1, allowedTypes: ["single"], allowImages: false };

test("negative feedback blocks the teacher's recurring task; categories guide review without sending notes", async () => {
  const bad = { category: "ai_question", verdict: "bad", reason: "incorrect", teacherComment: "Private Notiz 123", questionSnapshot: question(2) };
  const memory = feedbackMemory([bad], [bad, { ...bad, verdict: "good", questionSnapshot: question(3) }]);
  assert.deepEqual(memory.priorityReasons, ["incorrect"]);
  assert.equal(memory.negativeQuestions.length, 1);
  assert.ok(validateTest({ title: "Mathe", questions: [question(2)] }, { ...options, negativeQuestions: memory.negativeQuestions }).some(error => error.includes("fehlerhaft bewertet")));
  assert.deepEqual(validateTest({ title: "Mathe", questions: [question(3)] }, { ...options, negativeQuestions: memory.negativeQuestions }), []);
  assert.equal(reviewPrompt({ subject: "Mathe", grade: "9", questions: [question(5)] }, memory).includes("Private Notiz 123"), false);
  const replacement = await validateAndRepairTest({ title: "Mathe", questions: [question(2)] }, { ...options, negativeQuestions: memory.negativeQuestions }, {
    generateQuestion: async () => question(4), regenerateTest: async () => { throw new Error("Unnecessary full repair"); }
  });
  assert.deepEqual(replacement.errors, []);
  assert.equal(replacement.test.questions[0].text, question(4).text);
});

test("independent review replaces a semantically wrong task and reviews the repaired result", async () => {
  let reviews = 0, replacements = 0;
  const result = await reviewAndRepairTest({ title: "Mathe", questions: [question(2)] }, options, {
    review: async draft => {
      reviews += 1;
      return { issues: draft.questions[0].text === question(2).text
        ? [{ index: 0, reason: "incorrect", detail: "Das Ergebnis der Rechnung passt nicht zur Frage." }] : [] };
    },
    generateQuestion: async ({ reasons }) => {
      replacements += 1;
      assert.ok(reasons.some(reason => reason.includes("Qualitätsprüfung")));
      return question(7);
    },
    regenerateTest: async () => { throw new Error("Unnecessary full repair"); }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.reviewPasses, 2);
  assert.equal(replacements, 1);
  assert.equal(reviews, 2);
  assert.equal(result.test.questions[0].text, question(7).text);
});

test("a persistent review failure never releases the draft", async () => {
  let attempt = 0;
  const result = await reviewAndRepairTest({ title: "Mathe", questions: [question(2)] }, options, {
    maxReviews: 2,
    review: async () => ({ issues: [{ index: 0, reason: "ambiguous", detail: "Mehr als eine Antwort ist fachlich richtig." }] }),
    generateQuestion: async () => question(++attempt + 10),
    regenerateTest: async () => { throw new Error("Unnecessary full repair"); }
  });
  assert.equal(result.errors.length, 1);
  assert.equal(result.replaced, 1);
});

test("invalid reviewer indices fail instead of silently passing", () => {
  assert.throws(() => normalizeReviewIssues({ issues: [{ index: 9, reason: "incorrect", detail: "Falsche Lösung" }] }, { questions: [question(1)] }), /ungültige Aufgabenindizes/);
});

test("wrong image scene is regenerated once and checked again", async () => {
  const attempts = [], scenes = [];
  const result = await verifyImageScene("Buch unter dem Tisch", {
    generate: async (attempt, issue) => { attempts.push({ attempt, issue }); return { imageDataUrl: `image-${attempt}` }; },
    inspect: async asset => { scenes.push(asset.imageDataUrl); return asset.imageDataUrl === "image-2" ? { matches: true, reason: "" } : { matches: false, reason: "Ball statt Buch" }; }
  });
  assert.deepEqual(scenes, ["image-1", "image-2"]);
  assert.deepEqual(attempts, [{ attempt: 1, issue: "" }, { attempt: 2, issue: "Ball statt Buch" }]);
  assert.equal(result.asset.imageDataUrl, "image-2");
});

test("two wrong images are rejected and images without an expected scene skip visual QA", async () => {
  let generated = 0, inspected = 0;
  await assert.rejects(verifyImageScene("Buch unter dem Tisch", {
    generate: async () => { generated += 1; return {}; },
    inspect: async () => { inspected += 1; return { matches: false, reason: "Falsches Bild" }; }
  }), error => error.code === "image-mismatch");
  assert.equal(generated, 2);
  assert.equal(inspected, 2);
  await verifyImageScene("", { generate: async () => { generated += 1; return {}; }, inspect: async () => { throw new Error("Should skip vision"); } });
  assert.equal(generated, 3);
});
