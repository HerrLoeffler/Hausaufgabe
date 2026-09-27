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
  let receivedQuestionText = "";
  const raw = { type: "single", text: "Was zeigt die Abbildung?", points: 1,
    options: [{ text: "Kreis", correct: true }, { text: "Rechteck", correct: false }],
    mediaIntent: { kind: "ai_generated", prompt: "Ein Kreis", altText: "Ein Kreis" } };
  const question = await storedAiQuestion(raw, 0, {
    model: "model", promptVersion: "v13",
    generateMedia: async options => { receivedQuestionText = options.questionText; return { imageDataUrl: "data:image/webp;base64,abc" }; },
    onImage: async () => { completed += 1; }
  });
  assert.equal(imageCount([raw]), 1);
  assert.equal(completed, 1);
  assert.equal(receivedQuestionText, raw.text);
  assert.equal(question.imageDataUrl, "data:image/webp;base64,abc");
  assert.equal(question.aiOrigin.mediaStatus, "ready");
  assert.equal(question.options[0].imageDataUrl, undefined);
});

test("a missing generated image no longer aborts the background test", async () => {
  let fallbacks = 0;
  const question = await storedAiQuestion({
    type: "number", text: "20 Hefte bilden die Grundmenge. Ein Viertel davon ist markiert. Wie viel Prozent sind markiert?", points: 1, numericAnswer: 25, tolerance: 0, unit: "%",
    mediaIntent: { kind: "ai_generated", prompt: "Schulhefte auf einem Tisch", altText: "Hefte" }
  }, 0, {
    model: "model", promptVersion: "v1", generateMedia: async () => ({}),
    onImageFallback: async () => { fallbacks += 1; }
  });
  assert.equal(fallbacks, 1);
  assert.equal(question.imageDataUrl, undefined);
  assert.equal(question.aiOrigin.mediaStatus, "omitted");
  assert.match(question.aiMediaWarning, /ohne Bild gespeichert/);
  assert.equal(question.numericAnswer, 25);
});

test("an operational image failure keeps the question and diagnostic reason instead of aborting", async () => {
  const raw = { type: "number", text: "Wie viel sind 25 Prozent von 20?", points: 1, numericAnswer: 5,
    mediaIntent: { kind: "ai_generated", prompt: "Schulhefte", altText: "Hefte" } };
  const error = Object.assign(new Error("Bild passte nach drei Versuchen nicht"), { code: "image-mismatch", lastIssue: "falsche Anzahl", diagnostic: { attempts: [1, 2, 3] } });
  const question = await storedAiQuestion(raw, 4, {
    model: "model", promptVersion: "v15", generateMedia: async () => { throw error; }
  });
  assert.equal(question.position, 5);
  assert.equal(question.aiOrigin.mediaStatus, "omitted");
  assert.equal(question.aiOrigin.mediaReason, "falsche Anzahl");
  assert.match(question.aiMediaWarning, /bitte vor dem Veröffentlichen kurz prüfen/);
});

test("programming errors in image handling are still surfaced", async () => {
  const raw = { type: "number", text: "Wie viel sind 25 Prozent von 20?", points: 1, numericAnswer: 5,
    mediaIntent: { kind: "ai_generated", prompt: "Schulhefte", altText: "Hefte" } };
  await assert.rejects(storedAiQuestion(raw, 0, {
    model: "model", promptVersion: "v15", generateMedia: async () => { throw new TypeError("kaputte Implementierung"); }
  }), error => error instanceof TypeError && error.diagnostic.questionPosition === 1);
});
