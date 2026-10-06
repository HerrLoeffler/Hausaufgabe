"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildPublicQuestion, assertNoSolutionLeak } = require("../lib/assessment-core");

const audioDataUrl = "data:audio/mpeg;base64,QUJD";
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
