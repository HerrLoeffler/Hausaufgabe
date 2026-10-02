"use strict";

const { questionSnapshot } = require("./diagnostics");
const { extractContentLocale } = require("./content-locale");

const DEFAULT_SCALE = { id: "standard", name: "Standard", thresholds: [91, 77, 57, 39, 25, 0] };

function quizForGeneratedTest(test, input, profile = {}, sourceQuiz = null) {
  const settings = profile.settings || {};
  const scales = Array.isArray(profile.gradeScales) ? profile.gradeScales : [];
  const selectedScale = scales.find(scale => scale?.id === settings.defaultGradeScaleId) || scales[0] || DEFAULT_SCALE;
  const inheritedScale = sourceQuiz?.gradeScaleSnapshot?.thresholds?.length === 6
    ? sourceQuiz.gradeScaleSnapshot : selectedScale;
  const contentLocale = sourceQuiz?.contentLocale || extractContentLocale(input?.notes);
  const gradingLocale = sourceQuiz?.gradingLocale || contentLocale;
  return {
    title: String(test.title || "KI-Test"), subject: String(test.subject || input.subject || ""),
    grade: String(test.grade || input.grade || ""),
    description: String(settings.defaultDescription || "Viel Erfolg beim Test!"),
    contentLocale,
    gradingLocale,
    localeContractVersion: 1,
    gradeScaleId: sourceQuiz?.gradeScaleId || inheritedScale.id,
    gradeScaleSnapshot: inheritedScale,
    resultMode: sourceQuiz?.resultMode || settings.defaultResultMode || "points_grade",
    showSolutions: sourceQuiz?.showSolutions ?? Boolean(settings.defaultShowSolutions),
    timeLimitMinutes: sourceQuiz?.timeLimitMinutes || null,
    startMode: sourceQuiz?.startMode === "teacher" ? "teacher" : "student",
    shuffleQuestions: Boolean(sourceQuiz?.shuffleQuestions), shuffleAnswers: Boolean(sourceQuiz?.shuffleAnswers),
    sessionState: "open", sessionRunId: null, sessionStartedAt: null,
    published: false, ended: false, isDeleted: false, rightsHold: false, shareEnabled: false,
    questionCount: 0, totalPoints: 0, generationStatus: "running"
  };
}

function isProgrammingMediaError(err) {
  return ["ReferenceError", "TypeError", "SyntaxError"].includes(String(err?.name || ""));
}

function fallbackQuestionText(text, intent = {}) {
  const description = String(intent.altText || intent.prompt || "Illustration zur Aufgabe").trim().slice(0, 700);
  const rewritten = String(text || "").trim()
    .replace(/\bauf dem bild\b/giu, "in der Beschreibung")
    .replace(/\bim bild\b/giu, "in der Beschreibung")
    .replace(/\bdas bild\b/giu, "die Beschreibung")
    .replace(/\bdie abbildung\b/giu, "die Beschreibung")
    .replace(/\bauf der abbildung\b/giu, "in der Beschreibung")
    .replace(/\bin der abbildung\b/giu, "in der Beschreibung");
  const sentence = rewritten ? rewritten.charAt(0).toLocaleUpperCase("de-DE") + rewritten.slice(1) : "";
  return `Beschreibung statt Bild: ${description}\n\n${sentence}`.trim();
}

async function storedAiQuestion(raw, index, { model, promptVersion, kind = "generated", generateMedia, onImage = async () => {}, onImageFallback = async () => {} }) {
  const q = {
    type: raw.type, text: String(raw.text || "").trim(), points: Number(raw.points), position: index + 1,
    aiOrigin: { kind, model, promptVersion }
  };
  const media = async options => {
    try { return await generateMedia(options); }
    catch (err) {
      err.diagnostic = { ...err.diagnostic, questionPosition: index + 1,
        question: questionSnapshot(raw), optionPosition: options.optionPosition || null };
      throw err;
    }
  };
  const intent = raw.mediaIntent || { kind: "none" };
  if (intent.kind === "image_choices") throw new Error("Die KI erzeugt keine Bildantworten mehr.");
  if (["single", "multi", "dropdown"].includes(q.type)) {
    q.options = raw.options.map(o => ({ text: String(o.text || "").trim(), correct: Boolean(o.correct) }));
  }
  if (intent.kind === "ai_generated") {
    try {
      const asset = await media({ questionId: `q${index + 1}`, prompt: String(intent.prompt), expectedScene: String(intent.prompt), questionText: q.text, altText: String(intent.altText || "Abbildung zur Aufgabe"), maxBytes: 280 * 1024 });
      if (!asset?.imageDataUrl) throw new Error(`Bild zu Aufgabe ${index + 1} fehlt.`);
      Object.assign(q, asset);
      q.aiOrigin.mediaStatus = "ready";
      await onImage();
    } catch (err) {
      if (isProgrammingMediaError(err)) throw err;
      const reason = String(err?.lastIssue || err?.message || "Bild konnte nicht zuverlässig erzeugt werden.").slice(0, 500);
      q.text = fallbackQuestionText(q.text, intent);
      q.aiOrigin.mediaStatus = "omitted";
      q.aiOrigin.mediaReason = reason;
      q.aiMediaWarning = "Das vorgesehene KI-Bild konnte nicht zuverlässig erzeugt werden. Testify hat die Bildbeschreibung stattdessen direkt in die Aufgabe übernommen; bitte vor dem Veröffentlichen kurz prüfen.";
      await onImageFallback({ index, reason, diagnostic: err?.diagnostic || null });
    }
  }
  if (q.type === "text") { q.acceptedAnswers = raw.acceptedAnswers; q.manualReview = Boolean(raw.manualReview); }
  if (q.type === "truefalse") q.correctBoolean = raw.correctBoolean;
  if (q.type === "matching") q.pairs = raw.pairs;
  if (q.type === "ordering") { q.items = raw.items; q.acceptedOrders = raw.acceptedOrders || []; q.manualReview = Boolean(raw.manualReview); }
  if (q.type === "grouping") q.groups = raw.groups;
  if (q.type === "markwords") { q.passage = raw.passage; q.targetWords = raw.targetWords; }
  if (q.type === "number") { q.numericAnswer = raw.numericAnswer; q.tolerance = raw.tolerance; q.unit = raw.unit; }
  return q;
}

function imageCount(questions) {
  return questions.filter(q => q.mediaIntent?.kind === "ai_generated").length;
}

module.exports = { quizForGeneratedTest, storedAiQuestion, imageCount, fallbackQuestionText };
