export function secureAudioPublicationBlocked(quiz, questions = [], rulesVerified = false) {
  if (rulesVerified) return false;
  if (quiz?.requiresSecureAssessmentRules === true ||
      Number(quiz?.audioAnswerQuestionCount || 0) > 0 ||
      Number(quiz?.listeningOnlyQuestionCount || 0) > 0) return true;
  return (Array.isArray(questions) ? questions : []).some(question =>
    question?.audioPresentation === "listening-only" || question?.audioAnswerMode === "audio-only");
}

export function dashboardPublicationAction(quiz, wantsPublished) {
  if (wantsPublished) return "publish";
  return quiz?.published === true && quiz?.ended !== true ? "end" : "noop";
}
