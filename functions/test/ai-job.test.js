"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { quizForGeneratedTest, storedAiQuestion, imageCount } = require("../lib/ai-job");

test("a background test starts unpublished and inherits a similar test's settings", () => {
  const quiz = quizForGeneratedTest({ title: "Neue Variante", subject: "Deutsch", grade: "9" },
    { subject: "Deutsch", grade: "9" }, { settings: { defaultDescription: "Hallo" } },
    { gradeScaleId: "local", gradeScaleSnapshot: { id: "local", name: "Schlüssel", thresholds: [90, 80, 70, 60, 50, 0] },
      startMode: "teacher", shuffleQuestions: true, resultMode: "points" });
  assert.equal(quiz.published, false);
  assert.equal(quiz.generationStatus, "running");
  assert.equal(quiz.questionCount, 0);
  assert.equal(quiz.gradeScaleId, "local");
  assert.equal(quiz.startMode, "teacher");
  assert.equal(quiz.shuffleQuestions, true);
});

test("image answers are stored on their options and counted before the job advances", async () => {
  const sceneCalls = [];
  let completed = 0;
  const raw = {
    type: "single", text: "Welches Bild zeigt einen roten Ball?", points: 2,
    options: [{ text: "A", correct: true, imageScene: "roter Ball" }, { text: "B", correct: false, imageScene: "blauer Ball" }],
    mediaIntent: { kind: "image_choices" }
  };
  const question = await storedAiQuestion(raw, 3, {
    model: "model", promptVersion: "v1",
    generateMedia: async ({ questionId, expectedScene }) => {
      sceneCalls.push({ questionId, expectedScene });
      return { imageDataUrl: `data:image/webp;base64,${sceneCalls.length}` };
    },
    onImage: async () => { completed += 1; }
  });
  assert.equal(imageCount([raw]), 2);
  assert.equal(completed, 2);
  assert.deepEqual(sceneCalls.map(call => call.questionId), ["q4-opt-0", "q4-opt-1"]);
  assert.deepEqual(sceneCalls.map(call => call.expectedScene), ["roter Ball", "blauer Ball"]);
  assert.equal(question.options[0].imageDataUrl, "data:image/webp;base64,1");
  assert.equal(question.options[1].correct, false);
  assert.equal(question.imageChoicesOnly, true);
  assert.equal(question.position, 4);
});

test("a missing generated image fails the question instead of storing an empty asset", async () => {
  await assert.rejects(storedAiQuestion({
    type: "number", text: "Zähle die Bälle", points: 1, numericAnswer: 3, tolerance: 0, unit: "",
    mediaIntent: { kind: "ai_generated", prompt: "drei Bälle", altText: "Bälle" }
  }, 0, { model: "model", promptVersion: "v1", generateMedia: async () => ({}) }), /Bild zu Aufgabe 1 fehlt/);
});
