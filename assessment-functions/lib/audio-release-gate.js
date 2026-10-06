"use strict";

// This release switch stays closed until the deployed Firestore rules have been
// verified to deny student reads of authored question documents.
const SECURE_AUDIO_RULES_VERIFIED = false;

function audioReleaseBlockedByMetadata(quiz) {
  return !SECURE_AUDIO_RULES_VERIFIED && (quiz?.requiresSecureAssessmentRules === true ||
    Number(quiz?.audioAnswerQuestionCount || 0) > 0 || Number(quiz?.listeningOnlyQuestionCount || 0) > 0);
}

function audioReleaseBlockedByQuestions(questions) {
  return !SECURE_AUDIO_RULES_VERIFIED && (Array.isArray(questions) ? questions : []).some(question =>
    question?.audioPresentation === "listening-only" || question?.audioAnswerMode === "audio-only");
}

module.exports = { audioReleaseBlockedByMetadata, audioReleaseBlockedByQuestions };
