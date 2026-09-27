"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Ajv = require("ajv");
const { questionSchemaForType, testSchemaForRequest } = require("../lib/schemas");
const { validateQuestion, normalizeQuestion } = require("../lib/validation");
const ajv = new Ajv({ allErrors: true });
const mediaIntent = { kind: "none", prompt: "", altText: "", count: 0, sourceMaterialId: "", reason: "" };
const samples = {
  single: { text: "Welches Wort ist ein Nomen?", options: [{ text: "Hund", correct: true }, { text: "laufen", correct: false }] },
  multi: { text: "Markiere die Nomen.", options: [{ text: "Haus", correct: true }, { text: "Baum", correct: true }, { text: "schnell", correct: false }] },
  dropdown: { text: "Welcher Artikel passt zu Haus?", options: [{ text: "das", correct: true }, { text: "die", correct: false }] },
  truefalse: { text: "Jeder Satz endet mit einem Fragezeichen.", correctBoolean: false },
  gapfill: { text: "Der Hund [bellt]." },
  number: { text: "Berechne 4 minus 4.", numericAnswer: 0, unit: "", tolerance: 0 },
  text: { text: "Nenne das Gegenteil von hell.", acceptedAnswers: ["dunkel"], manualReview: false },
  matching: { text: "Ordne die Artikel zu.", pairs: [{ left: "Haus", right: "das" }, { left: "Baum", right: "der" }] },
  ordering: { text: "Ordne die Zahlen aufsteigend.", items: ["1", "2", "3"] },
  grouping: { text: "Ordne nach Wortart.", groups: [{ name: "Nomen", items: ["Baum", "Haus"] }, { name: "Verben", items: ["laufen", "singen"] }] },
  markwords: { text: "Markiere die Nomen.", passage: "Der Hund spielt im Garten.", targetWords: ["Hund", "Garten"] }
};
function sample(type, extra = {}) { return { type, text: "", points: 1, ...samples[type], mediaIntent, ...extra }; }

test("every permitted type validates against its compact schema and application contract", () => {
  for (const type of Object.keys(samples)) {
    const check = ajv.compile(questionSchemaForType(type));
    const q = sample(type);
    assert.equal(check(q), true, `${type}: ${JSON.stringify(check.errors)}`);
    assert.deepEqual(validateQuestion(normalizeQuestion(q)), [], type);
  }
});
test("report RPT-MUJS1QL5-01B32: null true/false answers and gapfill without solutions are rejected by schema", () => {
  const tf = ajv.compile(questionSchemaForType("truefalse"));
  for (const answer of [null, "false", "true", 0, undefined]) assert.equal(tf(sample("truefalse", { correctBoolean: answer })), false);
  assert.equal(tf(sample("truefalse", { correctBoolean: false })), true);
  const gap = ajv.compile(questionSchemaForType("gapfill"));
  for (const text of ["Der Hund ___.", "Der Hund [].", "Der Hund [   ]."]) assert.equal(gap(sample("gapfill", { text })), false, text);
  assert.equal(gap(sample("gapfill", { text: "[Heute] gehen wir [nach Hause|heim]." })), true);
});
test("request schema enforces exact count, permitted types and no image mode", () => {
  const check = ajv.compile(testSchemaForRequest({ count: 2, allowedTypes: ["truefalse", "gapfill"], allowImages: false }));
  const draft = { title: "Deutsch", subject: "Deutsch", grade: "5", description: "", questions: [sample("truefalse"), sample("gapfill")] };
  assert.equal(check(draft), true, JSON.stringify(check.errors));
  assert.equal(check({ ...draft, questions: [...draft.questions, sample("number")] }), false);
  assert.equal(check({ ...draft, questions: [sample("number"), sample("gapfill")] }), false);
  assert.equal(check({ ...draft, questions: [sample("truefalse", { mediaIntent: { ...mediaIntent, kind: "ai_generated", prompt: "Hund" } }), sample("gapfill")] }), false);
});
test("replacement image schema requires its scene and half-step points", () => {
  const check = ajv.compile(questionSchemaForType("number", { mediaKind: "ai_generated" }));
  assert.equal(check(sample("number", { mediaIntent: { ...mediaIntent, kind: "ai_generated", prompt: "" } })), false);
  assert.equal(check(sample("number", { points: 0.7, mediaIntent: { ...mediaIntent, kind: "ai_generated", prompt: "Baum" } })), false);
  assert.equal(check(sample("number", { mediaIntent: { ...mediaIntent, kind: "ai_generated", prompt: "Baum" } })), true);
});
test("a variant keeps the chosen question type and image mode in the provider schema", () => {
  const withoutImage = ajv.compile(questionSchemaForType("gapfill", { mediaKind: "none" }));
  const withImage = ajv.compile(questionSchemaForType("gapfill", { mediaKind: "ai_generated" }));
  const q = sample("gapfill");
  assert.equal(withoutImage(q), true);
  assert.equal(withImage(q), false);
  const picture = { ...q, mediaIntent: { ...mediaIntent, kind: "ai_generated", prompt: "Ein Hund neben einer Hundehütte" } };
  assert.equal(withImage(picture), true);
  assert.equal(withoutImage(picture), false);
  assert.equal(withImage({ ...picture, type: "truefalse", correctBoolean: false }), false);
});
