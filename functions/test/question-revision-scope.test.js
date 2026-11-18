"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const { HttpsError } = require("firebase-functions/v2/https");
const policy = require("../lib/question-revision-scope");
const { normalizeQuestion, validateQuestion } = require("../lib/validation");
const { questionSchema, questionSchemaForType } = require("../lib/schemas");
const { questionUserPrompt } = require("../lib/prompts");
const original = { id: "q1", type: "single", text: "Was ist die Hauptstadt von Frankreich?", points: 2,
  options: [{ text: "Paris", correct: true }, { text: "Berlin", correct: false }],
  mediaIntent: { kind: "none", altText: "original" }, audioIntent: { kind: "none" },
  rubric: { description: "unverändert" }, acceptedAnswers: ["Paris"], manualReview: false,
  markGroups: [{name:"Nomen", color:"blue", words:["Paris"]}], tolerance: 0.5 };
const revisionSource = { quizId: "quiz1", questionId: "q1", revision: "abc123" };
function data(scope = "answers", extra = {}) { return { question: JSON.parse(JSON.stringify(original)), revisionScope: scope, revisionScopeExplicit: true, revisionSource, instruction: "Bitte verbessern", ...extra }; }
function db(record = { ownerId: "teacher" }, exists = true) { return { collection: () => ({ doc: () => ({ get: async () => ({ exists, data: () => record }) }) }) }; }
function prepare(input, record, exists) { return policy.prepareScopedRevision(input, { uid: "teacher", db: db(record, exists), HttpsError }); }

test("scope inference, explicit choices and conflicts have identical clear boundaries", () => {
  for (const [wish, expected] of [["Frage lassen, neue Antworten", "answers"], ["Nur die Frage kürzer", "question"], ["Antworten nicht ändern", "question"], ["Fragetext nicht ändern", "answers"], ["Andere Zahlen", "whole"]]) assert.equal(policy.resolveQuestionRevisionScope(original, wish), expected);
  assert.equal(policy.resolveQuestionRevisionScope(original, "Kürzer", "question", true), "question");
  assert.throws(() => policy.resolveQuestionRevisionScope(original, "Frage lassen, neue Antworten", "question", true), /widersprechen/);
  assert.throws(() => policy.resolveQuestionRevisionScope(original, "Nur Antworten", "whole", true), /widersprechen/);
  assert.throws(() => policy.resolveQuestionRevisionScope(original, "Nur Frage und nur Antworten"), /widersprüchlich/);
});
test("answer-only is limited to textual choice types; inseparable question formats are unavailable", async () => {
  for (const type of ["single", "multi", "dropdown"]) assert.ok(await prepare(data("answers", { question: { ...original, type } })));
  for (const type of ["text", "truefalse", "number", "gapfill", "matching", "ordering", "grouping", "markwords"]) await assert.rejects(prepare(data("answers", { question: { ...original, type } })), /nicht verfügbar/);
  for (const extra of [{ audioAnswerMode: "audio-only" }, { imageChoicesOnly: true }, { options: [{text:"Bild",imageDataUrl:"data:image/png;base64,a"}] }]) await assert.rejects(prepare(data("answers", { question: { ...original, ...extra } })), /nicht verfügbar/);
  await assert.rejects(prepare(data("question", {question: {...original, type:"gapfill"}})), /verbunden/);
  await assert.rejects(prepare(data("question", {question: {...original, audioIntent:{kind:"ai_generated",presentation:"listening-only"}}})), /verbunden/);
});
test("scoped schemas exclude every protected component and merge preserves them exactly", async () => {
  for (const scope of ["question", "answers"]) {
    const p = await prepare(data(scope));
    assert.deepEqual(Object.keys(p.schema.properties), [p.field]);
    assert.equal(p.schema.additionalProperties, false);
    const patch = scope === "question" ? {text:"Welche Stadt ist die französische Hauptstadt?"} : {options:[{text:"Lyon",correct:false},{text:"Paris",correct:true},{text:"Rom",correct:false}]};
    const merged = policy.applyScopedRevision(original, patch, p);
    const expected = { ...original, ...patch };
    assert.deepEqual(merged, expected);
    assert.equal(merged.options.findIndex(o => o.correct), scope === "answers" ? 1 : 0);
    for (const protectedField of ["text", "points", "type", "mediaIntent", "audioIntent", "rubric", "acceptedAnswers", "markGroups", "manualReview", "tolerance"]) {
      if (protectedField === p.field) continue;
      assert.throws(() => policy.applyScopedRevision(original, { ...patch, [protectedField]: "hacked" }, p), /geschützte/);
    }
  }
});
test("ownership, active lifecycle, source identity, unsupported modes and scope conflicts fail before generation", async () => {
  for (const record of [{ownerId:"other"},{ownerId:"teacher",rightsHold:true},{ownerId:"teacher",isDeleted:true},{ownerId:"teacher",published:true,ended:false}]) await assert.rejects(prepare(data(), record));
  await assert.rejects(prepare(data(), undefined, false));
  for (const patch of [{revisionSource:null},{revisionSource:{...revisionSource,questionId:"other"}},{variant:true},{targetType:"text"},{requireDifferent:true},{instruction:"Nur Frage"}]) await assert.rejects(prepare(data("answers",patch)));
});

async function handler(input, model, record) {
  const src = fs.readFileSync(require.resolve("../index.js"), "utf8");
  const part = src.slice(src.indexOf("exports.regenerateQuestion ="), src.indexOf("\nexports.analyzeMaterial ="));
  const calls = [], reviews = [];
  const context = vm.createContext({ ...require("../lib/common-quality-rules"), exports:{}, onCall:(_o,fn)=>fn, callableOpts:{}, HttpsError,
    require: name => { assert.equal(name,"./lib/question-revision-scope");return policy; }, getFirestore:()=>db(record),
    QUESTION_TYPES:["single","multi","dropdown","text"], LIMITS:{maxPromptChars:3000,maxQuestions:100},
    questionSchema, questionSchemaForType, questionUserPrompt, normalizeQuestion, validateQuestion,
    requireAiUser: async()=>({uid:"teacher"}),consumeQuota:async()=>{},sanitizeMaterials:()=>[],
    loadQualityMemory:async()=>({negativeQuestions:[],stats:{}}),learningPrompt:()=>"",teacherQualityGuide:()=>"",sameQuestion:()=>false,
    structuredResponse:async args=>{calls.push(args);return {data: typeof model === "function" ? model(calls.length) : model,usage:{}};},
    reviewDraft:async draft=>{reviews.push(draft);return {data:{issues:[]},usage:{}};},normalizeReviewIssues:()=>[],recordUsage:async()=>true,reportAiError:e=>e,TEXT_MODEL:"fixture",PROMPT_VERSION:"fixture" });
  vm.runInContext(part,context);
  try { return {result:await context.exports.regenerateQuestion({data:input}),calls,reviews}; }
  catch (error) { return {error,calls,reviews}; }
}
test("actual handler accepts a coherent new choice key and preserves full source with a bound receipt", async () => {
  const patch = {options:[{text:"Lyon",correct:false},{text:"Paris",correct:true},{text:"Rom",correct:false}]};
  const h = await handler(data(),patch);
  assert.ifError(h.error); assert.equal(h.calls.length,1); assert.equal(h.reviews.length,1);
  assert.deepEqual(h.result.question,{...original,...patch});
  assert.deepEqual(JSON.parse(JSON.stringify(h.result.meta.revision)),{scope:"answers",source:revisionSource});
  assert.deepEqual(Object.keys(h.calls[0].schema.properties),["options"]);
});
test("actual handler rejects expanded output and invalid answer keys without weakening scope on retry", async () => {
  for (const patch of [{text:"Angriff",options:original.options},{options:[{text:"Lyon",correct:false},{text:"Rom",correct:false}]}]) {
    const h = await handler(data(),patch);
    assert.equal(h.error?.code,"failed-precondition"); assert.equal(h.calls.length,3);
    for (const call of h.calls) assert.deepEqual(Object.keys(call.schema.properties),["options"]);
  }
});
test("actual handler checks access before any provider call and retains whole-edit compatibility", async () => {
  const blocked = await handler(data(),{options:original.options},{ownerId:"other"});
  assert.equal(blocked.error?.code,"permission-denied"); assert.equal(blocked.calls.length,0);
  const h = await handler(data("whole", {instruction:"Kürzer"}),original);
  assert.ifError(h.error);assert.equal(h.result.meta.revision,undefined);
});

test("free status exposes scoped capability without invoking generation or consuming quota", async () => {
  const src = fs.readFileSync(require.resolve("../index.js"), "utf8");
  const start = src.indexOf("exports.getAiStatus =");
  const part = src.slice(start, src.indexOf("\n});", start) + 4);
  const c = vm.createContext({exports:{},onCall:(_o,fn)=>fn,callableOpts:{},requireAiUser:async()=>({profile:{role:"teacher"}}),TEXT_MODEL:"fixture",AUDIO_MODEL:"fixture",PROMPT_VERSION:"fixture",AI_SCHEMA_VERSION:1,MEMORY_VERSION:1});
  vm.runInContext(part,c);const result=await c.exports.getAiStatus({auth:{uid:"teacher"}});
  assert.deepEqual(Array.from(result.supportedRevisionScopes),["question","answers"]);
});
