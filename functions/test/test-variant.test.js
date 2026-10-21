"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildVariantInput, loadVariantInput, variantQuestionErrors, requireVariantMediaReady } = require("../lib/test-variant");
const { validateTest } = require("../lib/validation");
const { validateAndRepairTest } = require("../lib/repair-test");
const q = (n, extras = {}) => ({ id: `q${n}`, position: n, type: "number", text: `Berechne ${n} Prozent von 100.`, numericAnswer: n, points: 2, ...extras });

test("server source blueprint preserves actual points/context/media and strips assets and lifecycle", () => {
  const source = { title: "Prozentrechnung", subject: "Mathe", grade: "7", contentLocale: "en", published: true, showSolutions: true };
  const input = buildVariantInput(source, [q(2, { imageDataUrl: "old", imageScene: "Apples", audioDataUrl: "old", audioPresentation: "listening-only" }), q(1)], new Map([["q2", { script: "Old listening script", solutionAudioDataUrl: "old" }]]), { schoolType: "Realschule", region: "Berlin", difficulty: "leicht", learningGoals: ["Grundwert"] });
  assert.equal(input.count, 2); assert.equal(input.points, 4);
  assert.equal(input.schoolType, "Realschule"); assert.equal(input.region, "Berlin"); assert.equal(input.difficulty, "leicht");
  assert.equal(input.imageQuestionCount, 1); assert.equal(input.audioQuestionCount, 1); assert.equal(input.solutionAudioQuestionCount, 1);
  assert.equal(input.variantSlots[1].audioPresentation, "listening-only");
  assert.match(input.notes, /en/); assert.match(input.notes, /Grundwert/);
  assert.equal(JSON.stringify(input).includes("DataUrl"), false); assert.equal(JSON.stringify(input).includes("published"), false);
  assert.equal(source.published, true);
  assert.match(input.variantSourceFingerprint, /^[0-9a-f]{64}$/);
});
test("legacy context does not invent a school, region or difficulty", () => {
  const input = buildVariantInput({ title: "Prozentrechnung", subject: "Mathe", grade: "7" }, [q(1)], new Map());
  assert.equal(input.schoolType, "nicht gespeichert – aus Ausgangstest ableiten");
  assert.equal(input.region, "nicht gespeichert"); assert.match(input.difficulty, /Ausgangstest/);
  assert.equal(input.imageQuestionCount, 0); assert.equal(input.audioQuestionCount, 0); assert.equal(input.audioAnswerQuestionCount, 0);
});
test("owner access and rights hold are checked before source questions or private audio are read", async () => {
  for (const quiz of [{ ownerId: "other" }, { ownerId: "teacher", rightsHold: true }, { ownerId: "teacher", generationStatus: "running" }, { ownerId: "teacher", isDeleted: true }]) {
    let reads = 0;
    const db = { doc: () => ({}), runTransaction: async fn => fn({ get: async () => { reads++; return { exists: true, data: () => quiz }; } }) };
    await assert.rejects(loadVariantInput(db, "teacher", "SOURCE01"), error => error.code === "permission-denied");
    assert.equal(reads, 1);
  }
});
test("legacy image answers and excessive media are explicitly rejected before generation", () => {
  assert.throws(() => buildVariantInput({ title: "Legacy" }, [q(1, { type: "single", options: [{ text: "A", imageDataUrl: "old", correct: true }, { text: "B", correct: false }] })]), /Bildantworten/);
  assert.throws(() => buildVariantInput({ title: "Legacy" }, Array.from({ length: 6 }, (_, i) => q(i + 1, { imageDataUrl: "old" }))), /Medienlimit/);
});
test("fresh constraints reject copied tasks/prompts/scripts and preserve per-task modalities", () => {
  const input = buildVariantInput({ title: "Mathe" }, [q(1, { imageDataUrl: "old", imageScene: "Three apples" })], new Map());
  const candidate = { ...q(1), mediaIntent: { kind: "ai_generated", prompt: "Three apples" }, audioIntent: { kind: "none" } };
  assert.ok(variantQuestionErrors(candidate, 0, input).some(e => /Bild/.test(e)));
  assert.ok(validateTest({ title: "New", questions: [candidate] }, { requireFreshVariant: true, variantInput: input, referenceQuestions: input.sourceTest.questions }).some(e => /Ausgangstest/.test(e)));
  const fresh = { ...q(8), mediaIntent: { kind: "ai_generated", prompt: "Eight pears" }, audioIntent: { kind: "none" } };
  assert.deepEqual(variantQuestionErrors(fresh, 0, input), []);
});
test("recursive local repair replaces a copied image scene before final validation", async () => {
  const input = buildVariantInput({ title: "Mathe" }, [q(1, { imageDataUrl: "old", imageScene: "Three apples" })], new Map());
  const candidate = { ...q(8), mediaIntent: { kind: "ai_generated", prompt: "Three apples" }, audioIntent: { kind: "none" } };
  let repaired = 0;
  const result = await validateAndRepairTest({ title: "New", questions: [candidate] }, { requireFreshVariant: true, variantInput: input, referenceQuestions: input.sourceTest.questions, allowedTypes: ["number"], allowImages: true, expectedCount: 1, targetPoints: 2, imageQuestionCount: 1 }, {
    generateQuestion: async () => { repaired++; return { ...q(12), mediaIntent: { kind: "ai_generated", prompt: "Twelve pears" }, audioIntent: { kind: "none" } }; },
    regenerateTest: async () => { throw new Error("Must repair locally"); }
  });
  assert.equal(repaired, 1); assert.deepEqual(result.errors, []);
});
test("a missing required image/audio is an unfinished variant, never ready", () => {
  assert.throws(() => requireVariantMediaReady({ imageQuestionCount: 1, audioQuestionCount: 0, audioAnswerQuestionCount: 0, solutionAudioQuestionCount: 0 }, { images: 0, audios: 0, answerAudios: 0, solutionAudios: 0 }), /Medien/);
});
test("a structured variant can repair copied pairs while retaining a generic instruction", async () => {
  const old = { id: "q1", position: 1, type: "matching", text: "Ordne die Wörter zu.", points: 2, pairs: [{ left: "cat", right: "Katze" }, { left: "dog", right: "Hund" }], mediaIntent: { kind: "none" }, audioIntent: { kind: "none" } };
  const input = buildVariantInput({ title: "Wörter", subject: "Englisch", grade: "5" }, [old]);
  const fresh = { ...old, pairs: [{ left: "house", right: "Haus" }, { left: "tree", right: "Baum" }] };
  const result = await validateAndRepairTest({ title: "New", questions: [old] }, { requireFreshVariant: true, variantInput: input, referenceQuestions: input.sourceTest.questions, allowedTypes: ["matching"], expectedCount: 1, targetPoints: 2 }, {
    generateQuestion: async () => fresh, regenerateTest: async () => ({ title: "New", questions: [old] })
  });
  assert.deepEqual(result.errors, []); assert.deepEqual(result.test.questions[0].pairs, fresh.pairs);
});
test("source per-task points are mandatory even when the total is unchanged, and deterministic repair uses them", async () => {
  const originals = [q(1), q(2, { points: 4 })];
  const input = buildVariantInput({ title: "Mathe" }, originals);
  const draft = { title: "New", questions: [q(10, { points: 1 }), q(20, { points: 5 })] };
  const options = { requireFreshVariant: true, variantInput: input, referenceQuestions: input.sourceTest.questions, expectedCount: 2, targetPoints: 6 };
  assert.ok(validateTest(draft, options).some(e => /Punkt/.test(e)));
  const repaired = await validateAndRepairTest(draft, options, { generateQuestion: async () => { throw new Error("No provider call for points"); }, regenerateTest: async () => { throw new Error("No provider call for points"); } });
  assert.deepEqual(repaired.errors, []); assert.deepEqual(repaired.test.questions.map(task => task.points), [2, 4]);
});
test("variant batches preserve positional image/audio/answer budget and point sums from source slots", () => {
  const { planTestBatches } = require("../lib/test-batches");
  const originals = Array.from({ length: 30 }, (_, i) => q(i + 1, { points: i < 10 ? 1 : 3, ...(i === 0 ? { imageDataUrl: "old-image", audioDataUrl: "old-audio" } : {}) }));
  const input = { ...buildVariantInput({ title: "Mathe" }, originals), exactImageCounts: true, exactAudioCounts: true, imageMode: "exact", audioMode: "exact" };
  const batches = planTestBatches(input);
  assert.deepEqual(batches.map(b => b.imageQuestionCount), [1, 0, 0]);
  assert.deepEqual(batches.map(b => b.audioQuestionCount), [1, 0, 0]);
  assert.deepEqual(batches.map(b => b.points), [10, 30, 30]);
  assert.equal(batches[0].imageMode, "exact"); assert.equal(batches[0].audioMode, "exact");
  const { testSchemaForRequest } = require("../lib/schemas");
  const schemas = batches.map(batch => testSchemaForRequest({ count: batch.count, allowedTypes: input.allowedTypes, allowImages: batch.imageMode !== "none", allowAudio: batch.audioMode !== "none" }));
  assert.ok(schemas[0].properties.questions.items.anyOf[0].properties.mediaIntent.properties.kind.enum.includes("ai_generated"));
  assert.ok(schemas[0].properties.questions.items.anyOf[0].properties.audioIntent.properties.kind.enum.includes("ai_generated"));
  assert.deepEqual(schemas[1].properties.questions.items.anyOf[0].properties.mediaIntent.properties.kind.enum, ["none"]);
  assert.deepEqual(schemas[1].properties.questions.items.anyOf[0].properties.audioIntent.properties.kind.enum, ["none"]);
});
test("variant draft metadata belongs to initial source snapshot even after live source settings change", () => {
  const { quizForGeneratedTest } = require("../lib/ai-job");
  const source = { title: "Mathe", subject: "Mathematik", grade: "7", contentLocale: "de-DE", gradingLocale: "de-DE", timeLimitMinutes: 30, startMode: "teacher", showSolutions: false, shuffleQuestions: true, gradeScaleId: "original", gradeScaleSnapshot: { id: "original", name: "Original", thresholds: [91, 77, 57, 39, 25, 0] } };
  const input = buildVariantInput(source, [q(1)]);
  const changed = { ...source, contentLocale: "en-GB", gradingLocale: "en-GB", timeLimitMinutes: 90, showSolutions: true, shuffleQuestions: false, gradeScaleId: "changed", gradeScaleSnapshot: { id: "changed", thresholds: [95, 80, 60, 40, 20, 0] } };
  const result = quizForGeneratedTest({ title: "Neue Variante" }, input, {}, changed);
  assert.equal(result.contentLocale, "de-DE"); assert.equal(result.gradingLocale, "de-DE"); assert.equal(result.timeLimitMinutes, 30);
  assert.equal(result.showSolutions, false); assert.equal(result.shuffleQuestions, true); assert.equal(result.gradeScaleId, "original");
  assert.deepEqual(result.gradeScaleSnapshot, source.gradeScaleSnapshot);
  assert.notEqual(buildVariantInput(changed, [q(1)]).variantSourceFingerprint, input.variantSourceFingerprint);
});
test("listening variants retain explicit public selection criteria without promoting private teacher text", () => {
  const instruction = "Welche zwei Wörter sind Konjunktionen? Wähle genau zwei Antworten aus.";
  const question = q(1, { audioDataUrl: "private-clip", audioPresentation: "listening-only", text: "PRIVATE_TRANSCRIPT_AND_SOLUTION", audioInstruction: instruction });
  const input = buildVariantInput({ title: "Hören" }, [question], new Map([["q1", { script: "Neuer kurzer Hörtext." }]]));
  assert.equal(input.sourceTest.questions[0].audioIntent.instruction, instruction);
  const legacy = buildVariantInput({ title: "Hören" }, [{ ...question, audioInstruction: undefined }]);
  assert.equal(legacy.sourceTest.questions[0].audioIntent.instruction, "");
  assert.notEqual(legacy.sourceTest.questions[0].audioIntent.instruction, question.text);
});
test("changing the public listening selection criterion invalidates the variant source fingerprint", () => {
  const question = q(1, { audioDataUrl: "private-clip", audioPresentation: "listening-only", audioInstruction: "Wähle genau zwei Konjunktionen aus." });
  const first = buildVariantInput({ title: "Hören" }, [question]);
  const changed = buildVariantInput({ title: "Hören" }, [{ ...question, audioInstruction: "Wähle genau drei Adjektive aus." }]);
  assert.notEqual(changed.variantSourceFingerprint, first.variantSourceFingerprint);
});

test('variant blueprint respects an explicitly cleared question over nested legacy instruction', () => {
  const source = q(1, { audioPresentation: 'listening-only', audioDataUrl: 'old', audioInstruction: '', audioIntent: { instruction: 'Superseded legacy criterion' } });
  const input = buildVariantInput({ title: 'Synthetic' }, [source], new Map());
  assert.equal(input.sourceTest.questions[0].audioIntent.instruction, '');
});
