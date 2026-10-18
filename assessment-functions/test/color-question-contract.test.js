"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildPublicQuestion, buildGradingKey, buildAssessmentContract, gradeQuestion, authoringFingerprint, assertNoSolutionLeak, sanitizeAnswersForStorage } = require("../lib/assessment-core");
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

test("gap colors stay private in public paper while grading and authoring fingerprint retain them", () => {
  const q = { id: "gaps", type: "gapfill", text: "Der [Igel] [schläft|ruht].", points: 2, gapColors: ["blue", "green"] };
  const paper = buildPublicQuestion(q, "synthetic-secret");
  assert.deepEqual(paper.segments.filter(segment => segment.type === "gap").map(segment => segment.color), [undefined, undefined]);
  assertNoSolutionLeak(paper);
  assert.doesNotMatch(JSON.stringify(paper), /Igel|schläft|ruht/);
  assert.equal(gradeQuestion(buildGradingKey(q, "synthetic-secret"), ["Igel", "ruht"]).awardedPoints, 2);
  assert.notEqual(authoringFingerprint([q]), authoringFingerprint([{ ...q, gapColors: ["orange", "green"] }]));
});

test("existing colored-gap attempts keep their source fingerprint after removing public color hints", () => {
  const q = { id: "gaps", position: 1, type: "gapfill", text: "The sun is [yellow]. The grass is [green].", points: 2, gapColors: ["blue", "green"] };
  const contract = buildAssessmentContract([q], "a".repeat(48));
  assert.equal(contract.sourceFingerprint, "75714dd3907ef88856cca0a32186b479486d1417b801a31405eac85147bea2f3");
  assert.deepEqual(contract.paper[0].segments.filter(segment => segment.type === "gap").map(segment => segment.color), [undefined, undefined]);
});

test("legacy fingerprints keep each authored gap color when question IDs repeat and questions shuffle", () => {
  const questions = [
    { id: "same", position: 1, type: "gapfill", text: "Sun [yellow].", points: 1, gapColors: ["blue"] },
    { id: "same", position: 2, type: "gapfill", text: "Grass [green].", points: 1, gapColors: ["green"] },
    { id: "same", position: 3, type: "gapfill", text: "Rose [red].", points: 1, gapColors: ["orange"] }
  ];
  const secret = "b".repeat(48);
  assert.equal(buildAssessmentContract(questions, secret).sourceFingerprint,
    "c037a5660b334f4a59ef92534e091b17f8c8c6147effd8ca3ec713e2099726c3");
  const shuffled = buildAssessmentContract(questions, secret, { shuffleQuestions: true });
  assert.equal(shuffled.sourceFingerprint,
    "fe20dd771008524d407950efaa78ee4c53ea849e294e88446337dbd0ee56a336");
  assert.ok(shuffled.paper.every(q => q.segments.every(segment => !Object.hasOwn(segment, "color"))));
});

test("legacy fingerprint retains gap colors when a public question ID is shortened", () => {
  const q = { id: "q".repeat(121), position: 1, type: "gapfill", text: "Sky [blue].", points: 1, gapColors: ["blue"] };
  const contract = buildAssessmentContract([q], "a".repeat(48));
  assert.equal(contract.sourceFingerprint,
    "8e4d3949278eb6c30d306fb6a5505a544aa0874f9a37e73dc5538936aa2961bf");
  assert.equal(contract.paper[0].id.length, 120);
  assert.equal(contract.paper[0].segments.find(segment => segment.type === "gap").color, undefined);
});

test("submitted color maps survive bounded answer storage before server grading", () => {
  const key=buildGradingKey(question(),"synthetic-secret");
  const stored=sanitizeAnswersForStorage([key],{colors:{1:"orange",2:"blue",3:"green"},foreignQuestion:{1:"blue"}});
  assert.deepEqual(stored,{colors:{1:"orange",2:"blue",3:"green"}});
  assert.equal(gradeQuestion(key,stored.colors).awardedPoints,3);
  assert.equal(gradeQuestion(key,sanitizeAnswersForStorage([key],{colors:{0:"blue",1:"orange",2:"blue",3:"green"}}).colors).awardedPoints,2);
});
