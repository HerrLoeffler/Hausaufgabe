"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const { createHash } = require("node:crypto");
const { HttpsError } = require("firebase-functions/v2/https");
const variants = require("../lib/test-variant");
const source = fs.readFileSync(require.resolve("../index.js"), "utf8");
const clean = source.slice(source.indexOf("function cleanSourceTest("), source.indexOf("async function structuredResponse("));
const start = source.slice(source.indexOf("async function startAiTestJobForUser("), source.indexOf("\nexports.startAiTestJob ="));
const blueprint = () => variants.buildVariantInput({ title: "Prozentrechnung", subject: "Mathe", grade: "7", contentLocale: "de-DE" }, [{ id: "q1", type: "number", position: 1, text: "Berechne 10% von 100", points: 2, numericAnswer: 10 }]);

function startFixture(previous = null) {
  const jobs = [], enqueued = [], loaded = [];
  const sourceRef = { get: async () => ({ exists: true, data: () => ({ ownerId: "teacher" }) }) };
  const db = { doc: () => sourceRef, collection: () => ({ doc: id => ({ id, get: async () => ({ data: () => previous || {} }) }) }) };
  const context = vm.createContext({ require: name => require(name.startsWith("./lib/") ? `../${name.slice(2)}` : name), ...require("../lib/constants"), ...variants, HttpsError, createHash,
    getFirestore: () => db, randomUUID: () => "generated-request", Timestamp: { now: () => ({}) }, aiJobLock: () => ({}),
    sanitizeMaterials: () => [], requireAccountWrite: async () => {},
    loadVariantInput: async (_db, uid, id) => { loaded.push([uid, id]); return blueprint(); },
    reserveJob: async (_db, options) => { await options.beforeReserve({ get: async ref => ref === sourceRef ? { exists: true, data: () => ({ ownerId: "teacher" }) } : { exists: !!previous, data: () => previous } }); jobs.push(options.jobData); return { resumed: !!previous }; },
    enqueueAiTestJob: async ref => { enqueued.push(ref.id); }
  });
  vm.runInContext(clean + start, context);
  return { context, jobs, enqueued, loaded };
}
test("variant callable accepts source ID alone and derives immutable blueprint server-side", async () => {
  const f = startFixture();
  const result = await f.context.startAiTestJobForUser("teacher", { generationMode: "variant", sourceQuizId: "SOURCE01", clientRequestId: "click-1", count: 99, points: 99, sourceTest: { title: "Injected", questions: [] } });
  assert.equal(result.jobId.length, 40); assert.deepEqual(f.loaded, [["teacher", "SOURCE01"]]);
  assert.equal(f.jobs[0].input.count, 1); assert.equal(f.jobs[0].input.points, 2);
  assert.equal(f.jobs[0].input.generationMode, "variant"); assert.equal(f.jobs[0].input.sourceTest.title, "Prozentrechnung");
  assert.equal(f.enqueued.length, 1);
});
test("same request ID cannot be rebound to a different source or normal generation", async () => {
  const f = startFixture({ ownerId: "teacher", status: "ready", generationMode: "variant", sourceQuizId: "OTHER001" });
  await assert.rejects(f.context.startAiTestJobForUser("teacher", { generationMode: "variant", sourceQuizId: "SOURCE01", clientRequestId: "click-1" }), /anderen Auftrag/);
  assert.equal(f.enqueued.length, 0);
});
test("same request ID resumes a completed job without dispatching or replacing its source snapshot", async () => {
  const f = startFixture({ ownerId: "teacher", status: "ready", generationMode: "variant", sourceQuizId: "SOURCE01", sourceFingerprint: "original-snapshot" });
  const result = await f.context.startAiTestJobForUser("teacher", { generationMode: "variant", sourceQuizId: "SOURCE01", clientRequestId: "click-1" });
  assert.equal(result.jobId, createHash("sha256").update("teacher:click-1").digest("hex").slice(0, 40));
  assert.equal(f.enqueued.length, 0);
});
test("variant requests require an exact source and stable client ID before any provider work", async () => {
  for (const request of [{ generationMode: "variant", sourceQuizId: "../source", clientRequestId: "request" }, { generationMode: "variant", sourceQuizId: "SOURCE01" }]) {
    const f = startFixture();
    await assert.rejects(f.context.startAiTestJobForUser("teacher", request), error => error.code === "invalid-argument");
    assert.equal(f.loaded.length, 0); assert.equal(f.enqueued.length, 0);
  }
});

const worker = source.slice(source.indexOf("exports.processAiTestJob ="), source.indexOf("\n// A killed worker"));
async function workerFixture({ failImage = false, heldSource = false } = {}) {
  const old = { id: "q1", position: 1, type: "single", text: "Wie viel sind 10 Prozent von 100?", points: 2, options: [{ text: "10", correct: true }, { text: "20", correct: false }], imageDataUrl: "old-image", imageScene: "Ten apples", audioDataUrl: "old-audio", audioPresentation: "listening-only", audioAnswerMode: "audio-only" };
  const original = { title: "Mathe", subject: "Mathematik", grade: "7", ownerId: "teacher", published: true, rightsHold: heldSource, solutionAudioReleased: true };
  const input = variants.buildVariantInput(original, [old], new Map([["q1", { script: "Old heard question", solutionAudioDataUrl: "old-solution" }]]));
  const generated = { type: "single", text: "Wie viel sind 30 Prozent von 200?", points: 2, options: [{ text: "60", correct: true }, { text: "30", correct: false }], mediaIntent: { kind: "ai_generated", prompt: "Thirty pears", altText: "Pears" }, audioIntent: { kind: "ai_generated", script: "New heard question: thirty percent of two hundred.", presentation: "listening-only" } };
  let current = { ownerId: "teacher", status: "queued", generationMode: "variant", input, materials: [], sourceQuizId: "SOURCE01" };
  const questions = new Map(), privateAudio = new Map(), quizUpdates = [], calls = [], quizBases = [];
  const jobRef = { id: "0000000000", update: async update => { current = { ...current, ...update }; } };
  const quizRef = { update: async update => { quizUpdates.push(update); }, collection: name => ({ doc: id => ({ create: async value => { questions.set(id, value); }, set: async value => { privateAudio.set(id, value); } }) }) };
  const db = { collection: name => ({ doc: () => name === "aiJobs" ? jobRef : { get: async () => ({ exists: true, data: () => original }) } }), runTransaction: async callback => callback({ get: async () => ({ exists: true, data: () => current }), update: (_ref, update) => { current = { ...current, ...update }; } }) };
  const context = vm.createContext({ ...require("../lib/constants"), ...variants, ...require("../lib/ai-job"), ...require("../lib/solution-audio"), ...require("../lib/audio-answers"), HttpsError, require: name => require(name.startsWith("./lib/") ? `../${name.slice(2)}` : name),
    exports: {}, OPENAI_API_KEY: "mock-secret-reference", onTaskDispatched: (_options, fn) => fn, getFirestore: () => db, Timestamp: { now: () => ({ synthetic: true }) },
    requireAiUser: async () => ({ profile: {} }),
    generateTestForUser: async () => ({ test: { title: "Neue Variante", questions: [generated] }, meta: {} }),
    createAiQuiz: async (_db, _uid, _jobId, base) => { quizBases.push(base); return { code: "NEWCODE1", ref: quizRef }; },
    createVerifiedMedia: async (_input, options) => { calls.push("image"); assert.equal(await options.cacheLoad({}), null); assert.equal(await options.cacheSave({}), false); if (failImage) throw new Error("Synthetic unavailable image"); return { asset: { imageDataUrl: "new-image" } }; },
    createAudioAsset: async ({ questionId, script }) => { calls.push({ questionId, script }); return { audioDataUrl: "data:audio/mpeg;base64,AAAA", audioAiGenerated: true }; },
    reportAiError: error => error, releaseAiJob: async () => { calls.push("released"); }, questionSnapshot: () => ({}), requestSnapshot: () => ({}),
    console: { info() {}, warn() {}, error() {} }
  });
  vm.runInContext(worker, context);
  await context.exports.processAiTestJob({ data: { jobId: jobRef.id } });
  return { current, questions, privateAudio, quizUpdates, calls, quizBases, original, old };
}
test("actual worker creates a separate private draft with fresh images, heard answers and private solution audio", async () => {
  const f = await workerFixture();
  assert.equal(f.current.status, "ready"); assert.equal(f.current.quizId, "NEWCODE1");
  assert.equal(f.quizBases[0].published, false); assert.equal(f.quizBases[0].shareEnabled, false); assert.equal(f.quizBases[0].sessionRunId, null);
  assert.equal(f.quizBases[0].solutionAudioReleased, undefined);
  assert.equal(f.original.published, true); assert.equal(f.old.imageDataUrl, "old-image");
  const publicQuestion = f.questions.get("q001"), privateAudio = f.privateAudio.get("q001");
  assert.equal(publicQuestion.imageDataUrl, "new-image"); assert.equal(publicQuestion.audioPresentation, "listening-only"); assert.equal(publicQuestion.audioAnswerMode, "audio-only");
  assert.equal(publicQuestion.audioScript, undefined); assert.equal(publicQuestion.solutionAudioDataUrl, undefined);
  assert.match(privateAudio.script, /New heard/); assert.equal(privateAudio.solutionAudioDataUrl, "data:audio/mpeg;base64,AAAA");
  assert.equal(f.calls.filter(c => typeof c === "object").length, 4); // question + 2 answers + protected solution
  assert.equal(f.calls.at(-1), "released");
});
test("actual worker never reports an image fallback as a completed fresh variant", async () => {
  const f = await workerFixture({ failImage: true });
  assert.equal(f.current.status, "failed"); assert.match(f.current.progressMessage, /Medien/);
  assert.equal(f.quizUpdates.at(-1).generationStatus, "failed");
  assert.equal(f.quizUpdates.some(update => update.generationStatus === "ready"), false);
});
test("a rights hold applied after enqueue prevents generation and private draft writes", async () => {
  const f = await workerFixture({ heldSource: true });
  assert.equal(f.current.status, "failed"); assert.equal(f.current.errorCode, "permission-denied");
  assert.equal(f.quizBases.length, 0); assert.equal(f.questions.size, 0); assert.deepEqual(f.calls, ["released"]);
});
