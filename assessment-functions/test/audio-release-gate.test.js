"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { audioReleaseBlockedByMetadata, audioReleaseBlockedByQuestions } = require("../lib/audio-release-gate");

test("private audio modes remain closed before verified rules cutover", () => {
  assert.equal(audioReleaseBlockedByMetadata({ requiresSecureAssessmentRules: true }), true);
  assert.equal(audioReleaseBlockedByMetadata({ audioAnswerQuestionCount: 1 }), true);
  assert.equal(audioReleaseBlockedByMetadata({ listeningOnlyQuestionCount: 1 }), true);
  assert.equal(audioReleaseBlockedByQuestions([{ audioPresentation: "listening-only" }]), true);
  assert.equal(audioReleaseBlockedByQuestions([{ audioAnswerMode: "audio-only" }]), true);
  assert.equal(audioReleaseBlockedByQuestions([{ audioAnswerMode: "audio-only", text: "x = 5", correct: true }]), true);
});

test("legacy listening and post-test solution audio do not trigger the new release gate", () => {
  assert.equal(audioReleaseBlockedByMetadata({ audioQuestionCount: 1, solutionAudioQuestionCount: 1 }), false);
  assert.equal(audioReleaseBlockedByQuestions([{ audioDataUrl: "data:audio/mpeg;base64,QUJD", solutionAudioDataUrl: "private" }]), false);
});
