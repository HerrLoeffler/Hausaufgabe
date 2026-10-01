"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  CREW,
  crewAssistantSchema,
  cleanCrewRequest,
  crewSystemPrompt,
  crewUserPrompt,
  normalizeCrewResult
} = require("../lib/crew-assistant");

test("crew server contract contains all four assistants", () => {
  assert.deepEqual(Object.keys(CREW), ["coco", "remy", "emmi", "wilma"]);
});

test("request cleaning keeps only bounded product context", () => {
  const clean = cleanCrewRequest({
    crewId: "remy",
    text: "  Erstelle einen Test   über Farben  ",
    context: {
      screen: "ai_create",
      aiForm: { subject: "Englisch", grade: "4", count: 10, points: 20, topic: "" },
      shouldNotPass: "secret"
    }
  });
  assert.equal(clean.crewId, "remy");
  assert.equal(clean.text, "Erstelle einen Test über Farben");
  assert.equal(clean.context.screen, "ai_create");
  assert.equal(clean.context.aiForm.subject, "Englisch");
  assert.equal(Object.hasOwn(clean.context, "shouldNotPass"), false);
});

test("unknown crew id falls back to Coco", () => {
  const clean = cleanCrewRequest({ crewId: "unknown", text: "Hallo" });
  assert.equal(clean.crewId, "coco");
});

test("system prompt forbids destructive actions and raw student data workflows", () => {
  const prompt = crewSystemPrompt("wilma");
  assert.match(prompt, /Veröffentlichen, Löschen, Freigeben/);
  assert.match(prompt, /personenbezogenen Schülerdaten/);
  assert.match(prompt, /patch_ai_form/);
});

test("user prompt contains minimized current context", () => {
  const clean = cleanCrewRequest({ crewId: "remy", text: "Mach ihn leichter", context: { screen: "ai_create", aiForm: { subject: "Mathematik", grade: "7", difficulty: "mittel" } } });
  const prompt = crewUserPrompt(clean);
  assert.match(prompt, /Mathematik/);
  assert.match(prompt, /Mach ihn leichter/);
});

test("normalizer strips unsupported action types", () => {
  const result = normalizeCrewResult({
    reply: "Erledigt",
    intent: "delete_everything",
    cacheCandidate: true,
    action: { type: "delete_all", patch: { topic: "Brüche", allowedTypes: ["single", "invalid"] } }
  });
  assert.equal(result.action.type, "none");
  assert.deepEqual(result.action.patch.allowedTypes, ["single"]);
});

test("strict schema exposes only safe V1 action types", () => {
  assert.deepEqual(crewAssistantSchema.properties.action.properties.type.enum, ["none", "patch_ai_form"]);
});
