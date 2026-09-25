"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateTest, normalizeQuestion } = require("../lib/validation");
const { balanceTestPoints, validateAndRepairTest } = require("../lib/repair-test");

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

test("screenshot case: fixes 20.5 instead of 20 points and replaces invalid task 8", async () => {
  const questions = Array.from({ length: 10 }, (_, index) => ({ ...question(index + 1), points: 2 }));
  questions[0].points = 4;
  questions[1].points = 0.5;
  questions[7].options = [{ text: "gleich", correct: true }, { text: "gleich!", correct: false }];
  const opts = { ...options(10), targetPoints: 20 };
  assert.ok(validateTest({ title: "Mathematik", questions }, opts).some(e => e.includes("Gesamtpunkte 20.5 statt 20")));
  let calls = 0;
  const result = await validateAndRepairTest({ title: "Mathematik", questions }, opts, {
    generateQuestion: async ({ index, original }) => {
      calls += 1;
      assert.equal(index, 7);
      assert.equal(original.points, 2);
      return { ...question(101), points: 1 };
    },
    regenerateTest: async () => { throw new Error("No full-test regeneration needed for points"); }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(calls, 1);
  assert.equal(result.test.questions[0].points, 3.5);
  assert.equal(result.test.questions[7].points, 2);
  assert.equal(result.test.questions.reduce((sum, q) => sum + q.points, 0), 20);
});

test("fixes a pure point mismatch without spending another AI request", async () => {
  const testDraft = { title: "A", questions: [question(1), question(2), { ...question(3), points: 1.5 }] };
  const result = await validateAndRepairTest(testDraft, options(3), {
    generateQuestion: async () => { throw new Error("No question needs regeneration"); },
    regenerateTest: async () => { throw new Error("No full-test regeneration needed"); }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions.reduce((sum, q) => sum + q.points, 0), 3);
});

test("points cannot be balanced below 0.5 per task", () => {
  assert.throws(() => balanceTestPoints({ title: "A", questions: [question(1), question(2), question(3)] }, 1), /mindestens 0,5 Punkte/);
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

test("regenerates an excessive question count instead of failing during point balancing", async () => {
  const opts = options(2);
  const result = await validateAndRepairTest({ title: "A", questions: [1, 2, 3, 4, 5].map(question) }, opts, {
    generateQuestion: async () => { throw new Error("Not a question error"); },
    regenerateTest: async () => ({ title: "A", questions: [question(1), question(2)] })
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.fullRepair, true);
});

test("report AI-CREATE-001: 16 tasks for 15 with duplicate answers in task 11", async () => {
  const questions = Array.from({ length: 16 }, (_, index) => question(index + 1));
  questions[10].options = [{ text: "Schal", correct: true }, { text: "schal!", correct: false }];
  const result = await validateAndRepairTest({ title: "Deutsch", questions }, options(15), {
    generateQuestion: async () => { throw new Error("The faulty surplus task should be removed"); },
    regenerateTest: async () => { throw new Error("A complete regeneration is unnecessary"); }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions.length, 15);
  assert.equal(result.test.questions.reduce((sum, q) => sum + q.points, 0), 15);
  assert.equal(result.test.questions[10], questions[11]);
  assert.equal(result.fullRepair, false);
  assert.equal(result.questionAttempts, 0);
});

test("a full regeneration with one extra task is trimmed and remaining invalid questions repaired", async () => {
  const regenerated = Array.from({ length: 16 }, (_, index) => question(index + 1));
  regenerated[10].options = [{ text: "Schal", correct: true }, { text: "schal!", correct: false }];
  let attempts = 0;
  const result = await validateAndRepairTest({ title: "Deutsch", questions: [question(1)] }, options(15), {
    generateQuestion: async () => { attempts += 1; throw new Error("No replacement needed"); },
    regenerateTest: async () => ({ title: "Deutsch", questions: regenerated })
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions.length, 15);
  assert.equal(attempts, 0);
  assert.equal(result.fullRepair, true);
});

test("trimming an extra task preserves required image tasks and repairs the remaining faulty task", async () => {
  const questions = [question(1, "ai_generated"), question(2), question(3), question(4)];
  questions[2].options = [{ text: "gleich", correct: true }, { text: "gleich!", correct: false }];
  const opts = { ...options(3), imageQuestionCount: 1 };
  let indexToRepair = -1;
  const result = await validateAndRepairTest({ title: "Bilder", questions }, opts, {
    generateQuestion: async ({ index }) => { indexToRepair = index; return question(30); },
    regenerateTest: async () => { throw new Error("A full regeneration is unnecessary"); }
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions.length, 3);
  assert.equal(result.test.questions[0], questions[0]);
  assert.equal(indexToRepair, -1); // The invalid non-image task was removed.

  const extraImage = question(5, "ai_generated");
  const second = await validateAndRepairTest({ title: "Bilder", questions: [...questions.slice(0, 3), extraImage] }, opts, {
    generateQuestion: async ({ index }) => { indexToRepair = index; return question(30); },
    regenerateTest: async () => { throw new Error("The extra image and local error can be fixed without a full regeneration"); }
  });
  assert.deepEqual(second.errors, []);
  assert.equal(indexToRepair, 2);
  assert.equal(second.test.questions[0], questions[0]);
  assert.equal(second.test.questions.filter(q => q.mediaIntent.kind === "ai_generated").length, 1);
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


test("larger tests get a larger local repair budget", async () => {
  const questions = Array.from({ length: 20 }, (_, index) => question(index + 1));
  for (const index of [2, 5, 8, 11, 14, 17, 19]) {
    questions[index].options = [{ text: "gleich", correct: true }, { text: "gleich!", correct: false }];
  }
  let calls = 0;
  const result = await validateAndRepairTest({ title: "Großer Test", questions }, options(20), {
    generateQuestion: async ({ index }) => {
      calls += 1;
      return question(200 + index);
    },
    regenerateTest: async () => { throw new Error("Local repairs should be sufficient for seven broken tasks"); }
  });
  assert.equal(calls, 7);
  assert.equal(result.replaced, 7);
  assert.deepEqual(result.errors, []);
});


test("regression: image answer placeholders are repaired instead of aborting the whole test", async () => {
  const questions = Array.from({ length: 10 }, (_, index) => question(index + 1));
  const badImageQuestion = normalizeQuestion({
    type: "single",
    text: "Welche Abbildung zeigt das Buch unter dem Tisch?",
    points: 1,
    options: [
      { text: "Bild A", correct: true, imageScene: "Bild A" },
      { text: "Bild B", correct: false, imageScene: "Ein rotes Buch liegt auf einem Holztisch." }
    ],
    mediaIntent: { kind: "image_choices", prompt: "", altText: "", count: 2, sourceMaterialId: "", reason: "" }
  });
  questions[7] = badImageQuestion;
  const opts = {
    ...options(10),
    allowImageChoices: true,
    imageAnswerQuestionCount: 1
  };
  let calls = 0;
  const result = await validateAndRepairTest({ title: "Deutsch", questions }, opts, {
    generateQuestion: async ({ index, reasons, attempt }) => {
      assert.equal(index, 7);
      calls += 1;
      assert.ok(reasons.some(reason => reason.includes("Szenenbeschreibung")));
      if (attempt === 1) {
        return {
          ...badImageQuestion,
          options: [
            { text: "Bild A", correct: true, imageScene: "Abbildung 1" },
            { text: "Bild B", correct: false, imageScene: "Ein rotes Buch liegt auf einem Holztisch." }
          ]
        };
      }
      return {
        ...badImageQuestion,
        options: [
          { text: "Bild A", correct: true, imageScene: "Ein rotes Buch liegt vollständig unter einem Holztisch." },
          { text: "Bild B", correct: false, imageScene: "Ein rotes Buch liegt vollständig auf einem Holztisch." }
        ]
      };
    },
    regenerateTest: async () => { throw new Error("The whole test must not be regenerated for one bad image scene"); }
  });
  assert.equal(calls, 2);
  assert.equal(result.replaced, 1);
  assert.deepEqual(result.errors, []);
  assert.equal(result.test.questions.length, 10);
  assert.equal(result.test.questions[7].options[0].text, "Bild A");
  assert.match(result.test.questions[7].options[0].imageScene, /Buch.*unter.*Tisch/i);
});
