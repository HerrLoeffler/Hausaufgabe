"use strict";

// Staging cutover verified on 2026-10-09: authored/private reads and forged
// writes receive HTTP403. Other projects require their own deployed-rule proof.
let firebaseProject = "";
let configValid = true;
try {
  const config = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
  configValid = config !== null && typeof config === "object" && !Array.isArray(config);
  firebaseProject = configValid ? config.projectId || "" : "";
} catch { configValid = false; }
const runtimeProjects = [process.env.GCLOUD_PROJECT, process.env.GOOGLE_CLOUD_PROJECT, firebaseProject].filter(Boolean);
const SECURE_AUDIO_RULES_VERIFIED = configValid && runtimeProjects.length > 0
  && runtimeProjects.every(project => project === "hausaufgabe-staging");

function audioReleaseBlockedByMetadata(quiz) {
  return !SECURE_AUDIO_RULES_VERIFIED && (quiz?.requiresSecureAssessmentRules === true ||
    Number(quiz?.audioAnswerQuestionCount || 0) > 0 || Number(quiz?.listeningOnlyQuestionCount || 0) > 0);
}

function audioReleaseBlockedByQuestions(questions) {
  return !SECURE_AUDIO_RULES_VERIFIED && (Array.isArray(questions) ? questions : []).some(question =>
    question?.audioPresentation === "listening-only" || question?.audioAnswerMode === "audio-only");
}

module.exports = { audioReleaseBlockedByMetadata, audioReleaseBlockedByQuestions };
