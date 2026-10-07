"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  CREW,
  SUPPORTED_ASSISTANT_LOCALES,
  crewAssistantSchema,
  cleanCrewRequest,
  crewSystemPrompt,
  crewUserPrompt,
  normalizeCrewResult
} = require("../lib/crew-assistant");

test("crew server contract contains all four assistants and two UI reply locales", () => {
  assert.deepEqual(Object.keys(CREW), ["coco", "remy", "emmi", "wilma"]);
  assert.deepEqual(SUPPORTED_ASSISTANT_LOCALES, ["de-DE", "en-GB"]);
});

test("request cleaning keeps only bounded product context", () => {
  const clean = cleanCrewRequest({
    crewId: "remy",
    text: "  Create an English test about colours  ",
    uiLocale: "en-US",
    context: {
      screen: "ai_create",
      aiForm: { subject: "Englisch", grade: "4", count: 10, points: 20, topic: "" },
      shouldNotPass: "secret"
    }
  });
  assert.equal(clean.crewId, "remy");
  assert.equal(clean.text, "Create an English test about colours");
  assert.equal(clean.uiLocale, "en-GB");
  assert.equal(clean.context.screen, "ai_create");
  assert.equal(clean.context.aiForm.subject, "Englisch");
  assert.equal(Object.hasOwn(clean.context, "shouldNotPass"), false);
});

test("unknown crew id and unsupported locale fall back safely", () => {
  const clean = cleanCrewRequest({ crewId: "unknown", text: "Hallo", uiLocale: "fr-FR" });
  assert.equal(clean.crewId, "coco");
  assert.equal(clean.uiLocale, "de-DE");
});

test("empty numeric context stays unknown instead of inventing one question and half a point", () => {
  for (const value of [undefined, null, "", " ", false, true]) {
    const clean = cleanCrewRequest({ text: "Hallo", context: { aiForm: { count: value, points: value } } });
    assert.equal(clean.context.aiForm.count, null);
    assert.equal(clean.context.aiForm.points, null);
  }
  const clean = cleanCrewRequest({ text: "Hallo", context: { aiForm: { count: "20", points: 10.5 } } });
  assert.equal(clean.context.aiForm.count, 20);
  assert.equal(clean.context.aiForm.points, 10.5);
});

test("system prompt forbids destructive actions and separates reply locale from assessment content", () => {
  const german = crewSystemPrompt("wilma", "de-DE");
  assert.match(german, /Veröffentlichen, Löschen, Freigeben/);
  assert.match(german, /personenbezogenen Schülerdaten/);
  assert.match(german, /patch_ai_form/);
  const english = crewSystemPrompt("remy", "en-GB");
  assert.match(english, /Reply in natural British English/);
  assert.match(english, /Testinhalt|assessment content/);
  assert.match(english, /difficulty ist nur leicht, mittel, anspruchsvoll oder gemischt/);
});

test("user prompt contains minimized current context and explicit UI reply locale", () => {
  const clean = cleanCrewRequest({ crewId: "remy", text: "Make it easier", uiLocale: "en-GB", context: { screen: "ai_create", aiForm: { subject: "Mathematik", grade: "7", difficulty: "mittel" } } });
  const prompt = crewUserPrompt(clean);
  assert.match(prompt, /Mathematik/);
  assert.match(prompt, /Make it easier/);
  assert.match(prompt, /en-GB/);
});

test("normalizer strips unsupported action types and localizes only its fallback", () => {
  const result = normalizeCrewResult({
    reply: "Done",
    intent: "delete_everything",
    cacheCandidate: true,
    action: { type: "delete_all", patch: { topic: "Brüche", allowedTypes: ["single", "invalid"] } }
  });
  assert.equal(result.action.type, "none");
  assert.deepEqual(result.action.patch.allowedTypes, ["single"]);
  assert.equal(normalizeCrewResult({}, "en-GB").reply, "I don't have a reliable answer for that yet.");
  assert.equal(normalizeCrewResult({}, "de-DE").reply, "Dazu habe ich gerade keine sichere Antwort.");
});

test("strict schema exposes only safe V1 action types", () => {
  assert.deepEqual(crewAssistantSchema.properties.action.properties.type.enum, ["none", "patch_ai_form", "navigate_create", "navigate_tests", "navigate_settings", "choose_editor", "choose_results", "show_delete_question", "show_delete_test"]);
});

test("Remy fallback keeps image, listening and spoken-answer counts distinct", () => {
  const properties = crewAssistantSchema.properties.action.properties.patch.properties;
  for (const field of ["imageQuestionCount", "audioQuestionCount", "audioAnswerQuestionCount", "solutionAudioQuestionCount"]) {
    assert.ok(Object.hasOwn(properties, field));
  }
  const cleaned = cleanCrewRequest({ text: "Drei Hörantworten", context: { aiForm: {
    imageQuestionCount: 1, audioQuestionCount: 2, audioAnswerQuestionCount: 3, solutionAudioQuestionCount: 0
  } } });
  assert.equal(cleaned.context.aiForm.audioAnswerQuestionCount, 3);
  assert.equal(cleaned.context.aiForm.solutionAudioQuestionCount, 0);
  const patch = normalizeCrewResult({ action: { type: "patch_ai_form", patch: { audioAnswerQuestionCount: 4 } } }).action.patch;
  assert.equal(patch.audioAnswerQuestionCount, 4);
  assert.equal(patch.solutionAudioQuestionCount, null);
  assert.match(crewSystemPrompt("remy"), /audioAnswerQuestionCount/);
});

test('Coco fallback retains bounded conversation context and only fixed navigation actions', () => {
  const request = cleanCrewRequest({crewId:'coco',text:'Bring mich zu ihm',context:{lastCrew:'remy',history:Array.from({length:10},()=>({role:'assistant',text:'Remy '.repeat(1000)}))}});
  assert.equal(request.context.lastCrew,'remy');assert.equal(request.context.history.length,6);assert.ok(request.context.history.every(m=>m.text.length<=1400));
  assert.equal(normalizeCrewResult({action:{type:'navigate_create'}}).action.type,'navigate_create');
  assert.equal(normalizeCrewResult({action:{type:'javascript:delete()'}}).action.type,'none');
});
