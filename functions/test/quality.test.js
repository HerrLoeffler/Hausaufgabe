"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeQuestion, validateTest } = require("../lib/validation");
const { validateAndRepairTest } = require("../lib/repair-test");
const { MEMORY_VERSION, feedbackMemory, qualityMemoryPrompt, questionForReview, reviewPrompt, normalizeReviewIssues, reviewAndRepairTest, verifyImageScene } = require("../lib/quality");

function question(n) {
  return normalizeQuestion({
    type: "single", text: `Wie viel sind ${n} + 1?`, points: 1,
    options: [{ text: String(n + 1), correct: true }, { text: String(n + 2), correct: false }],
    mediaIntent: { kind: "none", prompt: "", count: 0 }
  });
}
const options = { expectedCount: 1, targetPoints: 1, allowedTypes: ["single"], allowImages: false };

test("feedback from another teacher blocks a recurring error, while only error types guide review", async () => {
  const bad = { category: "ai_question", userId: "teacher-A", verdict: "bad", reason: "incorrect", teacherComment: "Private Notiz 123", questionSnapshot: question(2) };
  const memory = feedbackMemory([
    bad, { ...bad, userId: "teacher-B", verdict: "good", questionSnapshot: question(3) },
    { ...bad, userId: "teacher-C", reason: "duplicate", questionSnapshot: question(4) },
    { ...bad, userId: "teacher-D", reason: "image_mismatch", questionSnapshot: question(5) }
  ]);
  assert.deepEqual(new Set(memory.priorityReasons), new Set(["incorrect", "duplicate", "image_mismatch"]));
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

test("quality memory v2 learns positive patterns and recurring scoped errors without leaking comments", () => {
  const green = (teacher, n, version = "testify-ai-v10") => ({
    category: "ai_question", userId: teacher, verdict: "good", reason: "",
    subject: "Deutsch", grade: "9", questionType: "single", promptVersion: version,
    teacherComment: "PRIVATE GOOD NOTE", questionSnapshot: question(n)
  });
  const bad = (teacher, n) => ({
    category: "ai_question", userId: teacher, verdict: "bad", reason: "answer_leak",
    subject: "Deutsch", grade: "9", questionType: "single", promptVersion: "testify-ai-v10",
    teacherComment: "PRIVATE BAD NOTE", questionSnapshot: question(n)
  });
  const memory = feedbackMemory([
    green("teacher-A", 2), green("teacher-B", 3),
    bad("teacher-A", 4), bad("teacher-B", 5), bad("teacher-C", 6),
    { ...bad("teacher-X", 7), subject: "Mathematik", reason: "incorrect" }
  ], { subject: "Deutsch", grade: "9", questionType: "single" });

  assert.equal(memory.memoryVersion, MEMORY_VERSION);
  assert.equal(memory.positivePatterns[0].reports, 2);
  assert.equal(memory.positivePatterns[0].teachers, 2);
  assert.equal(memory.priorityReasons[0], "answer_leak");
  assert.ok(memory.ruleCandidates.some(candidate => candidate.reason === "answer_leak" && candidate.reports === 3 && candidate.teachers === 3));
  assert.equal(memory.versionStats["testify-ai-v10"].good, 2);
  assert.equal(memory.versionStats["testify-ai-v10"].bad, 4);

  const prompt = qualityMemoryPrompt(memory, { questionType: "single" });
  assert.match(prompt, /Positiv bewertete Strukturmuster/);
  assert.match(prompt, /Wiederkehrende Warnmuster/);
  assert.equal(prompt.includes("PRIVATE GOOD NOTE"), false);
  assert.equal(prompt.includes("PRIVATE BAD NOTE"), false);
  assert.equal(prompt.includes(question(2).text), false);
});

test("one teacher alone cannot create a recurring rule candidate", () => {
  const reports = [1, 2, 3, 4].map(n => ({
    category: "ai_question", userId: "teacher-A", verdict: "bad", reason: "ambiguous",
    subject: "Deutsch", grade: "9", questionType: "text", questionSnapshot: question(n)
  }));
  const memory = feedbackMemory(reports, { subject: "Deutsch", grade: "9" });
  assert.equal(memory.ruleCandidates.length, 0);
});

test("the global memory considers reports after the old 300-report cutoff and deduplicates tasks", () => {
  const reports = Array.from({ length: 350 }, (_, index) => ({
    category: "ai_question", userId: `teacher-${index}`, verdict: "bad", reason: "incorrect",
    questionSnapshot: question(index + 1)
  }));
  reports.push({ ...reports[349], userId: "teacher-351" });
  const memory = feedbackMemory(reports);
  assert.equal(memory.negativeQuestions.length, 350);
  assert.ok(validateTest({ title: "Mathe", questions: [question(350)] }, { ...options, negativeQuestions: memory.negativeQuestions }).some(error => error.includes("fehlerhaft bewertet")));
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

test("an independently reviewed ordering suggestion becomes an accepted answer without replacing the task", async () => {
  const original = normalizeQuestion({ type: "ordering", text: "Baue einen grammatisch richtigen Satz.", points: 1,
    items: ["The", "purple", "cars", "are", "not", "hungry"], acceptedOrders: [], manualReview: true });
  let reviews = 0;
  const result = await reviewAndRepairTest({ title: "English", questions: [original] },
    { expectedCount: 1, targetPoints: 1, allowedTypes: ["ordering"], allowImages: false }, {
      review: async draft => {
        reviews += 1;
        return { issues: draft.questions[0].acceptedOrders.length ? [] : [{
          index: 0, reason: "ambiguous", detail: "Auch The hungry cars are not purple ist grammatisch richtig.",
          suggestedAcceptedOrder: [0, 5, 2, 3, 4, 1]
        }] };
      },
      generateQuestion: async () => { throw new Error("The original task should remain unchanged"); },
      regenerateTest: async () => { throw new Error("A complete regeneration is unnecessary"); }
    });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.test.questions[0].acceptedOrders, [[0, 5, 2, 3, 4, 1]]);
  assert.deepEqual(result.test.questions[0].items, original.items);
  assert.equal(result.replaced, 0);
  assert.equal(reviews, 2);
});

test("invalid or irrelevant ordering suggestions cannot change the answer key", () => {
  const ordering = normalizeQuestion({ type: "ordering", text: "Baue einen Satz.", points: 1,
    items: ["Mia", "spielt", "heute"], acceptedOrders: [], manualReview: true });
  const draft = { questions: [ordering, question(2)] };
  const issues = normalizeReviewIssues({ issues: [
    { index: 0, reason: "ambiguous", detail: "Ungültige Reihenfolge", suggestedAcceptedOrder: [0, 0, 2] },
    { index: 1, reason: "ambiguous", detail: "Keine Reihenfolge", suggestedAcceptedOrder: [2, 1, 0] }
  ] }, draft);
  assert.equal(issues.every(issue => !issue.suggestedAcceptedOrder), true);
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
  assert.equal(result.replaced, 2);
  assert.equal(result.reviewPasses, 3);
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
  }), error => error.code === "image-mismatch" && error.lastIssue === "Falsches Bild");
  assert.equal(generated, 2);
  assert.equal(inspected, 2);
  await verifyImageScene("", { generate: async () => { generated += 1; return {}; }, inspect: async () => { throw new Error("Should skip vision"); } });
  assert.equal(generated, 3);
});


test("quality prompt knows that gapfill brackets are hidden from pupils", () => {
  const prompt = reviewPrompt({ subject: "Deutsch", grade: "5", questions: [{ type: "gapfill", text: "Ich helfe [dem] Kind.", points: 1, mediaIntent: { kind: "none" } }] }, {});
  assert.match(prompt, /KEIN answer_leak/);
  assert.match(prompt, /leere Eingabefelder/);
});

test("reported gapfill solutions are only in the answer key, never in the student view", () => {
  for (const text of ["Ich helfe [dem] Kind.", "Lina [räumt] das Zimmer [auf].", "Wann [beginnt] der Unterricht?", "Heute [besichtigt] er das Schloss.", "[der neugierige Tim] fragt nach."]) {
    const q = { type: "gapfill", text };
    const projected = questionForReview(q, 0);
    assert.equal(projected.studentView.text.includes("["), false);
    assert.equal(projected.answerKey.gaps.length, [...text.matchAll(/\[/g)].length);
    const issues = normalizeReviewIssues({ issues: [{ index: 0, reason: "answer_leak", detail: "Steht in eckigen Klammern.", evidence: text.match(/\[[^\]]+\]/)[0] }] }, { questions: [q] });
    assert.deepEqual(issues, []);
  }
});

test("a genuinely visible answer leak is retained and repaired", () => {
  const q = { type: "gapfill", text: "Nutze dem. Ich helfe [dem] Kind." };
  const issues = normalizeReviewIssues({ issues: [{ index: 0, reason: "answer_leak", detail: "Die Anweisung gibt die einzige Lösung vor.", evidence: "Nutze dem." }] }, { questions: [q] });
  assert.equal(issues.length, 1);
});

test("truefalse and ordering separate deliberate falsehoods and stored order from the pupil view", () => {
  const q = questionForReview({ type: "truefalse", text: "In jeder Frage steht das Verb zuerst.", correctBoolean: false }, 0);
  assert.equal(q.answerKey.correctBoolean, false);
  assert.equal(Object.hasOwn(q.studentView, "correctBoolean"), false);
  const sorted = questionForReview({ type: "ordering", text: "Ordne", items: ["B", "A"] }, 1);
  assert.deepEqual(sorted.answerKey.orderedItems, ["B", "A"]);
  assert.deepEqual(sorted.studentView.items, ["A", "B"]);
  assert.equal(sorted.studentView.displayOrder, "shuffled");
});

test("rejecting a reviewer warning teaches reviewer caution without blacklisting or endorsing the question", () => {
  const memory = feedbackMemory([{ category: "ai_question", verdict: "good", reviewOutcome: "false_positive", reviewerReason: "answer_leak", questionType: "gapfill", subject: "Deutsch", userId: "teacher", questionSnapshot: question(1), teacherComment: "PRIVATE" }], { subject: "Deutsch" });
  assert.deepEqual(memory.negativeQuestions, []);
  assert.deepEqual(memory.positivePatterns, []);
  assert.equal(memory.stats.total, 0);
  assert.deepEqual(memory.reviewerFalsePositives, [{ type: "gapfill", reason: "answer_leak", reports: 1 }]);
  const prompt = reviewPrompt({ questions: [] }, memory);
  assert.ok(prompt.includes("zurückgewiesene Prüferwarnungen"));
  assert.equal(prompt.includes("PRIVATE"), false);
});

test('listening review receives the complete audible context without treating it as visible text or an answer key', () => {
  const q = question(3);
  q.text = 'Which animal did Mia see?';
  q.options = [{ text: 'A penguin', correct: true }, { text: 'An elephant', correct: false }];
  q.audioIntent = { kind: 'ai_generated', script: 'Mia saw a penguin at the zoo.', presentation: 'supplement' };
  const projected = questionForReview(q, 0);
  assert.equal(projected.studentView.audioTranscript, q.audioIntent.script);
  assert.equal(projected.studentView.text, q.text);
  assert.deepEqual(projected.studentView.options, ['A penguin', 'An elephant']);
  assert.equal(Object.hasOwn(projected.studentView, 'correctOptions'), false);
  q.audioIntent.presentation = 'listening-only';
  assert.equal(questionForReview(q, 0).studentView.text, '');
  assert.equal(questionForReview(q, 0).studentView.audioTranscript, q.audioIntent.script);
  q.audioIntent.kind = 'none';
  assert.equal(Object.hasOwn(questionForReview(q, 0).studentView, 'audioTranscript'), false);
});
