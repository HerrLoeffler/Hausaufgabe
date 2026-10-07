"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildPublicQuestion, assertNoSolutionLeak, authoringFingerprint } = require("../lib/assessment-core");

const audioDataUrl = "data:audio/mpeg;base64,QUJD";
const grouping = {
  id: "grouping1", type: "grouping", text: "Ordne die gehörten Wörter zu.", points: 6, audioAnswerMode: "audio-only",
  groups: [{ name: "Nomen", items: ["Zauberhut", "Känguru"] }, { name: "Verben", items: ["schnarcht", "hüpft"] }, { name: "Adjektive", items: ["glitzernd", "mutig"] }],
  audioAnswerItems: [
    ["g0_i0", "Zauberhut"], ["g0_i1", "Känguru"], ["g1_i0", "schnarcht"], ["g1_i1", "hüpft"], ["g2_i0", "glitzernd"], ["g2_i1", "mutig"]
  ].map(([key, sourceText], index) => ({ key, sourceText, audioDataUrl: `${audioDataUrl}${index}`, audioNeedsRegeneration: false }))
};

test("grouping has six opaque playable memos without written words or category membership", () => {
  const paper = buildPublicQuestion(grouping, "secret");
  assert.equal(paper.audioAnswerMode, "audio-only");
  assert.equal(paper.items.length, 6);
  assert.ok(paper.items.every(item => item.text === "" && item.audio?.src));
  assert.equal(new Set(paper.items.map(item => item.audio.src)).size, 6);
  assertNoSolutionLeak(paper);
  assert.doesNotMatch(JSON.stringify(paper), /Zauberhut|Känguru|schnarcht|mutig|g0_i0|sourceText|audioAnswerItems/);
});

test("missing or stale grouping audio cannot produce a paper that falls back to written words", () => {
  assert.throws(() => buildPublicQuestion({ ...grouping, audioAnswerItems: grouping.audioAnswerItems.slice(1) }, "secret"), /Audio answer/);
  assert.throws(() => buildPublicQuestion({ ...grouping, audioAnswerItems: grouping.audioAnswerItems.map((entry, i) => i === 2 ? { ...entry, sourceText: "alter Text" } : entry) }, "secret"), /Audio answer/);
});

test("changing a structured memo changes the frozen authoring fingerprint", () => {
  const changed={...grouping,audioAnswerItems:grouping.audioAnswerItems.map((item,i)=>i===0?{...item,audioDataUrl:'data:audio/mpeg;base64,TkVX'}:item)};
  assert.notEqual(authoringFingerprint([grouping]),authoringFingerprint([changed]));
});
const choice = {
  id: "q1", type: "single", text: "Welche Zahl löst die Gleichung?",
  points: 1, audioDataUrl, audioPresentation: "listening-only", audioScript: "privater Hörtext",
  audioAnswerMode: "audio-only", solutionAudioDataUrl: "data:audio/mpeg;base64,U09MVVRJT04=",
  options: [
    { text: "x = 3", correct: false, audioDataUrl },
    { text: "x = 5", correct: true, audioDataUrl },
    { text: "x = 7", correct: false, audioDataUrl },
    { text: "x = 19", correct: false, audioDataUrl }
  ]
};

test("secure paper hides listening-only transcript and spoken answer texts", () => {
  const paper = buildPublicQuestion(choice, "secret", { shuffleAnswers: true });
  assert.equal(paper.text, "");
  assert.equal(paper.audioPresentation, "listening-only");
  assert.equal(paper.audioAnswerMode, "audio-only");
  assert.equal(paper.options.length, 4);
  assert.ok(paper.options.every(option => option.text === "" && option.audio?.src === audioDataUrl));
  assertNoSolutionLeak(paper);
  const serialized = JSON.stringify(paper);
  assert.doesNotMatch(serialized, /x = 5|privater Hörtext|solutionAudio|correct/);
});

test("supplement keeps written question while audio text remains private", () => {
  const paper = buildPublicQuestion({ ...choice, audioPresentation: "supplement", audioAnswerMode: "none" }, "secret");
  assert.equal(paper.text, choice.text);
  assert.equal(paper.options[1].text, "x = 5");
  assert.equal(paper.options[1].audio, undefined);
  assertNoSolutionLeak(paper);
});

test("missing spoken answer blocks the secure paper without revealing answer text", () => {
  const incomplete = { ...choice, options: choice.options.map((option, index) => index === 2 ? { ...option, audioDataUrl: "" } : option) };
  assert.throws(() => buildPublicQuestion(incomplete, "secret"), /Audio answer choices are incomplete/);
  assert.throws(() => buildPublicQuestion({ ...choice, audioDataUrl: "" }, "secret"), /Listening-only question has no playable audio/);
});

test("legacy listening audio with no presentation flag keeps visible question", () => {
  const paper = buildPublicQuestion({ ...choice, audioPresentation: undefined, audioAnswerMode: undefined }, "secret");
  assert.equal(paper.text, choice.text);
  assert.equal(paper.audio?.src, audioDataUrl);
});

test("text-dependent tasks cannot hide their question while leaking authored segments", () => {
  assert.throws(() => buildPublicQuestion({ ...choice, type: "gapfill", text: "Das ist [falsch]." }, "secret"), /unsupported/);
  assert.throws(() => buildPublicQuestion({ ...choice, type: "markwords", passage: "Geheime Wörter" }, "secret"), /unsupported/);
});
