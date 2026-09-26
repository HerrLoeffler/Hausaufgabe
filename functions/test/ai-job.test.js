"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { quizForGeneratedTest, storedAiQuestion, imageCount } = require("../lib/ai-job");
const { questionSchema } = require("../lib/schemas");

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

test("AI never generates answer images, including from an older queued job", async () => {
  let generated = false;
  const raw = {
    type: "single", text: "Welches Bild zeigt einen roten Ball?", points: 2,
    options: [{ text: "A", correct: true, imageScene: "roter Ball" }, { text: "B", correct: false, imageScene: "blauer Ball" }],
    mediaIntent: { kind: "image_choices" }
  };
  await assert.rejects(storedAiQuestion(raw, 3, {
    model: "model", promptVersion: "v1",
    generateMedia: async () => { generated = true; return {}; }
  }), /keine Bildantworten/);
  assert.equal(generated, false);
  assert.equal(imageCount([raw]), 0);
  assert.deepEqual(questionSchema.properties.mediaIntent.properties.kind.enum, ["none", "ai_generated"]);
  assert.deepEqual(questionSchema.properties.options.items.required, ["text", "correct"]);
});

test("an image in the question is still generated and saved", async () => {
  let completed = 0;
  const raw = { type: "single", text: "Was zeigt die Abbildung?", points: 1,
    options: [{ text: "Kreis", correct: true }, { text: "Rechteck", correct: false }],
    mediaIntent: { kind: "ai_generated", prompt: "Ein Kreis", altText: "Ein Kreis" } };
  const question = await storedAiQuestion(raw, 0, {
    model: "model", promptVersion: "v13",
    generateMedia: async () => ({ imageDataUrl: "data:image/webp;base64,abc" }),
    onImage: async () => { completed += 1; }
  });
  assert.equal(imageCount([raw]), 1);
  assert.equal(completed, 1);
  assert.equal(question.imageDataUrl, "data:image/webp;base64,abc");
  assert.equal(question.options[0].imageDataUrl, undefined);
});

test("a missing generated image fails the question instead of storing an empty asset", async () => {
  await assert.rejects(storedAiQuestion({
    type: "number", text: "Zähle die Bälle", points: 1, numericAnswer: 3, tolerance: 0, unit: "",
    mediaIntent: { kind: "ai_generated", prompt: "drei Bälle", altText: "Bälle" }
  }, 0, { model: "model", promptVersion: "v1", generateMedia: async () => ({}) }), /Bild zu Aufgabe 1 fehlt/);
});
