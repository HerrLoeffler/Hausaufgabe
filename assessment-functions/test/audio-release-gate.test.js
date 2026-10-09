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

test("private audio is enabled only for the Staging project with verified deployed rules", () => {
  const modulePath = require.resolve("../lib/audio-release-gate");
  const keys = ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT", "FIREBASE_CONFIG"];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const cached = require.cache[modulePath];
  const load = env => {
    for (const key of keys) delete process.env[key];
    Object.assign(process.env, env);
    delete require.cache[modulePath];
    return require(modulePath);
  };
  try {
    for (const env of [{ GCLOUD_PROJECT: "hausaufgabe-staging" }, { FIREBASE_CONFIG: JSON.stringify({ projectId: "hausaufgabe-staging" }) }]) {
      const staging = load(env);
      assert.equal(staging.audioReleaseBlockedByMetadata({ requiresSecureAssessmentRules: true }), false);
      assert.equal(staging.audioReleaseBlockedByQuestions([{ audioAnswerMode: "audio-only" }, { audioPresentation: "listening-only" }]), false);
    }
    for (const env of [{}, { GCLOUD_PROJECT: "hausaufgabe-40294" }, { FIREBASE_CONFIG: "invalid-json" },
      { GCLOUD_PROJECT: "hausaufgabe-40294", FIREBASE_CONFIG: JSON.stringify({ projectId: "hausaufgabe-staging" }) },
      { GCLOUD_PROJECT: "hausaufgabe-staging", FIREBASE_CONFIG: JSON.stringify({ projectId: "hausaufgabe-40294" }) },
      { GCLOUD_PROJECT: "hausaufgabe-staging", GOOGLE_CLOUD_PROJECT: "hausaufgabe-40294" },
      { GCLOUD_PROJECT: "hausaufgabe-staging", FIREBASE_CONFIG: "invalid-json" }]) {
      const closed = load(env);
      assert.equal(closed.audioReleaseBlockedByMetadata({ requiresSecureAssessmentRules: true }), true);
      assert.equal(closed.audioReleaseBlockedByQuestions([{ audioAnswerMode: "audio-only" }]), true);
    }
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
    }
    require.cache[modulePath] = cached;
  }
});
