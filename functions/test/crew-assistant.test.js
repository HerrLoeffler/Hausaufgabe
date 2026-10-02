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

test("crew server contract contains all four assistants", () => {
  assert.deepEqual(Object.keys(CREW), ["coco", "remy", "emmi", "wilma"]);
  assert.deepEqual(SUPPORTED_ASSISTANT_LOCALES, ["de-DE", "en-GB"]);
});

test("request cleaning keeps only bounded product context and explicit UI locale", () => {
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

test("system prompt forbids destructive actions and separates assistant reply language from assessment content", () => {
  const german = crewSystemPrompt("wilma", "de-DE");
  assert.match(german, /Veröffentlichen, Löschen, Freigeben/);
  assert.match(german, /personenbezogenen Schülerdaten/);
  assert.match(german, /patch_ai_form/);

  const english = crewSystemPrompt("remy", "en-GB");
  assert.match(english, /Reply in natural British English/);
  assert.match(english, /Prüfungsinhalte/);
  assert.match(english, /difficulty ist nur leicht, mittel, anspruchsvoll oder gemischt/);
});

test("user prompt contains minimized current context and UI reply locale", () => {
  const clean = cleanCrewRequest({ crewId: "remy", text: "Make it easier", uiLocale: "en-GB", context: { screen: "ai_create", aiForm: { subject: "Mathematik", grade: "7", difficulty: "mittel" } } });
  const prompt = crewUserPrompt(clean);
  assert.match(prompt, /Mathematik/);
  assert.match(prompt, /Make it easier/);
  assert.match(prompt, /en-GB/);
});

test("normalizer strips unsupported action types and localizes only the assistant fallback", () => {
  const result = normalizeCrewResult({
    reply: "Done",
    intent: "delete_everything",
    cacheCandidate: true,
    action: { type: "delete_all", patch: { topic: "Fractions", allowedTypes: ["single", "invalid"] } }
  }, "en-GB");
  assert.equal(result.action.type, "none");
  assert.deepEqual(result.action.patch.allowedTypes, ["single"]);
  assert.equal(normalizeCrewResult({}, "en-GB").reply, "I don't have a reliable answer for that yet.");
  assert.equal(normalizeCrewResult({}, "de-DE").reply, "Dazu habe ich gerade keine sichere Antwort.");
});

test("strict schema exposes only safe V1 action types", () => {
  assert.deepEqual(crewAssistantSchema.properties.action.properties.type.enum, ["none", "patch_ai_form"]);
});
