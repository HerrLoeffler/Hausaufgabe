"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildPublicQuestion, buildGradingKey, gradeQuestion, authoringFingerprint, assertNoSolutionLeak, sanitizeAnswersForStorage } = require("../lib/assessment-core");
const question = () => ({ id: "colors", type: "markwords", text: "Ordne die Wortarten zu.", passage: "Der kleine Igel schläft.", points: 3, targetWords: ["kleine", "Igel", "schläft"], markGroups: [{ name: "Adjektive", color: "orange", words: ["kleine"] }, { name: "Nomen", color: "blue", words: ["Igel"] }, { name: "Verben", color: "green", words: ["schläft"] }] });

test("colored marking publishes a named palette without word-to-color solutions", () => {
  const paper = buildPublicQuestion(question(), "synthetic-secret");
  assert.deepEqual(paper.markGroups, [{ name: "Adjektive", color: "orange" }, { name: "Nomen", color: "blue" }, { name: "Verben", color: "green" }]);
  assertNoSolutionLeak(paper);
  assert.equal(paper.targetWords, undefined);
  assert.ok(paper.markGroups.every(group => !Object.hasOwn(group, "words")));
  assert.equal(paper.correctWordColors, undefined);
});

test("server grades both the selected word and its color, penalizing extra or incorrect assignments", () => {
  const key = buildGradingKey(question(), "synthetic-secret");
  assert.equal(gradeQuestion(key, { 1: "orange", 2: "blue", 3: "green" }).awardedPoints, 3);
  assert.equal(gradeQuestion(key, { 1: "orange", 2: "green", 3: "green" }).awardedPoints, 1);
  assert.equal(gradeQuestion(key, { 0: "blue", 1: "orange", 2: "blue", 3: "green" }).awardedPoints, 2);
  assert.equal(gradeQuestion(key, ["1", "2", "3"]).awardedPoints, 0);
});

test("color-only assignment changes invalidate new papers while empty legacy color fields do not", () => {
  const q = question();
  const changed = { ...q, markGroups: q.markGroups.map(group => ({ ...group, color: group.color === "blue" ? "purple" : group.color })) };
  assert.notEqual(authoringFingerprint([q]), authoringFingerprint([changed]));
  const legacy = { ...q }; delete legacy.markGroups;
  assert.equal(authoringFingerprint([legacy]), authoringFingerprint([{ ...legacy, markGroups: [], gapColors: [] }]));
});

test("gap colors survive public projection without exposing bracket answers and affect the fingerprint", () => {
  const q = { id: "gaps", type: "gapfill", text: "Der [Igel] [schläft|ruht].", points: 2, gapColors: ["blue", "green"] };
  const paper = buildPublicQuestion(q, "synthetic-secret");
  assert.deepEqual(paper.segments.filter(segment => segment.type === "gap").map(segment => segment.color), ["blue", "green"]);
  assertNoSolutionLeak(paper);
  assert.doesNotMatch(JSON.stringify(paper), /Igel|schläft|ruht/);
  assert.equal(gradeQuestion(buildGradingKey(q, "synthetic-secret"), ["Igel", "ruht"]).awardedPoints, 2);
  assert.notEqual(authoringFingerprint([q]), authoringFingerprint([{ ...q, gapColors: ["orange", "green"] }]));
});

test("submitted color maps survive bounded answer storage before server grading", () => {
  const key=buildGradingKey(question(),"synthetic-secret");
  const stored=sanitizeAnswersForStorage([key],{colors:{1:"orange",2:"blue",3:"green"},foreignQuestion:{1:"blue"}});
  assert.deepEqual(stored,{colors:{1:"orange",2:"blue",3:"green"}});
  assert.equal(gradeQuestion(key,stored.colors).awardedPoints,3);
  assert.equal(gradeQuestion(key,sanitizeAnswersForStorage([key],{colors:{0:"blue",1:"orange",2:"blue",3:"green"}}).colors).awardedPoints,2);
});
