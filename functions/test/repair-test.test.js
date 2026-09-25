"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateTest, normalizeQuestion } = require("../lib/validation");
const { validateAndRepairTest } = require("../lib/repair-test");

function question(n, kind = "none") {
  return normalizeQuestion({
    type: "single", text: "Wie viel sind " + n + " + 1?", points: 1,
    options: [{ text: String(n + 1), correct: true }, { text: String(n + 2), correct: false }],
    mediaIntent: { kind, prompt: kind === "ai_generated" ? "Unbeschriftete Illustration von " + n + " Äpfeln" : "", count: kind === "ai_generated" ? 1 : 0 }
  });
}
const options = count => ({ allowedTypes: ["single", "text"], allowImages: true, allowImageChoices: false, expectedCount: count, targetPoints: count, imageQuestionCount: 0, imageAnswerQuestionCount: 0 });

test("screenshot case: replaces only task 20 with duplicate answers and duplicate content", async () => {
  const questions = Array.from({ length: 20 }, (_, i) => question(i + 1));
  questions[19] = { ...question(9), options: [{ text: "Schal", correct: true }, { text: "schal!", correct: false }] };
  const draft = { title: "Mathematik", questions };
  assert.equal(validateTest(draft, options(20)).filter(e => e.startsWith("Aufgabe 20")).length, 2);
  let calls = 0;
  const result = await validateAndRepairTest(draft, options(20), {
    generateQuestion: async ({ index, reasons }) => {
      calls += 1;
      assert.equal(index, 19);
      assert.ok(reasons.some(reason => reason.includes("eindeutig")));
      assert.ok(reasons.some(reason => reason.includes("Aufgabe 9")));
      return { ...question(101), points: 2 };
    },
    regenerateTest: async () => { throw new Error("Full test repair must not be necessary"); }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions.length, 20);
  assert.equal(result.test.questions[19].points, 1);
  assert.equal(result.test.questions[8], questions[8]);
  assert.equal(result.replaced, 1);
  assert.equal(calls, 1);
});

test("screenshot case: retries task 7 with duplicate answers and preserves exact image count", async () => {
  const goodImage = question(1, "ai_generated");
  const bad = question(7);
  bad.options = [{ text: "gleich", correct: true }, { text: "gleich!", correct: false }];
  const opts = { ...options(7), imageQuestionCount: 1 };
  let calls = 0;
  const result = await validateAndRepairTest({ title: "Bilder", questions: [goodImage, ...[2, 3, 4, 5, 6].map(question), bad] }, opts, {
    generateQuestion: async ({ index, reasons, attempt }) => {
      assert.equal(index, 6);
      calls += 1;
      if (attempt === 1) return question(1); // duplicates the already valid visual task
      assert.ok(reasons.some(reason => reason.includes("wiederholt")));
      return question(20);
    },
    regenerateTest: async () => { throw new Error("Full test repair must not be necessary"); }
  });
  assert.equal(calls, 2);
  assert.equal(result.replaced, 1);
  assert.equal(result.test.questions[0], goodImage);
  assert.deepEqual(result.errors, []);
});

test("repairs a global question-count error with one complete regeneration", async () => {
  const opts = options(3);
  const result = await validateAndRepairTest({ title: "A", questions: [question(1), question(2)] }, opts, {
    generateQuestion: async () => { throw new Error("Local replacement cannot fix total count"); },
    regenerateTest: async (_draft, errors) => {
      assert.ok(errors.some(e => e.includes("Erwartet 3 Aufgaben")));
      return { title: "A", questions: [question(1), question(2), question(3)] };
    }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.fullRepair, true);
  assert.equal(result.questionAttempts, 0);
});

test("does not return a broken test after the bounded repair budget", async () => {
  const bad = question(1);
  bad.options = [{ text: "gleich", correct: true }, { text: "gleich", correct: false }];
  let calls = 0;
  let full = 0;
  const result = await validateAndRepairTest({ title: "A", questions: [bad] }, options(1), {
    generateQuestion: async () => { calls += 1; return question(1); },
    regenerateTest: async draft => { full += 1; return draft; },
    maxQuestionAttempts: 4
  });
  assert.equal(calls, 4);
  assert.equal(full, 1);
  assert.ok(result.errors.some(e => e.includes("eindeutig")));
});
