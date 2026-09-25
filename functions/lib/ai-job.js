"use strict";

const DEFAULT_SCALE = { id: "standard", name: "Standard", thresholds: [91, 77, 57, 39, 25, 0] };

function quizForGeneratedTest(test, input, profile = {}, sourceQuiz = null) {
  const settings = profile.settings || {};
  const scales = Array.isArray(profile.gradeScales) ? profile.gradeScales : [];
  const selectedScale = scales.find(scale => scale?.id === settings.defaultGradeScaleId) || scales[0] || DEFAULT_SCALE;
  const inheritedScale = sourceQuiz?.gradeScaleSnapshot?.thresholds?.length === 6
    ? sourceQuiz.gradeScaleSnapshot : selectedScale;
  return {
    title: String(test.title || "KI-Test"), subject: String(test.subject || input.subject || ""),
    grade: String(test.grade || input.grade || ""),
    description: String(settings.defaultDescription || "Viel Erfolg beim Test!"),
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

async function storedAiQuestion(raw, index, { model, promptVersion, kind = "generated", generateMedia, onImage = async () => {} }) {
  const q = {
    type: raw.type, text: String(raw.text || "").trim(), points: Number(raw.points), position: index + 1,
    aiOrigin: { kind, model, promptVersion }
  };
  const intent = raw.mediaIntent || { kind: "none" };
  if (["single", "multi", "dropdown"].includes(q.type)) {
    q.options = raw.options.map(o => ({ text: String(o.text || "").trim(), correct: Boolean(o.correct) }));
    if (intent.kind === "image_choices") {
      q.imageChoicesOnly = true;
      for (let i = 0; i < q.options.length; i += 1) {
        const scene = String(raw.options[i].imageScene || "").trim();
        const prompt = `Erzeuge ausschließlich diese konkrete Antwortszene: „${scene}“. Kontext der Frage: „${raw.text}“. Zeige genau die in dieser Antwort beschriebenen Gegenstände und ihre räumliche Beziehung; tausche keinen Gegenstand gegen einen anderen aus. Kein Text, keine Beschriftung und keine Markierung der Lösung. Einheitlicher sachlicher Stil, quadratisch.`;
        const asset = await generateMedia({ questionId: `q${index + 1}-opt-${i}`, prompt, expectedScene: scene, altText: `Bildantwort ${i + 1}`, maxBytes: 95 * 1024 });
        if (!asset?.imageDataUrl) throw new Error(`Bildantwort ${i + 1} fehlt.`);
        q.options[i].imageDataUrl = asset.imageDataUrl;
        q.options[i].imageAlt = `Bildantwort ${i + 1}`;
        await onImage();
      }
    }
  }
  if (intent.kind === "ai_generated") {
    const asset = await generateMedia({ questionId: `q${index + 1}`, prompt: String(intent.prompt), expectedScene: String(intent.prompt), altText: String(intent.altText || "Abbildung zur Aufgabe"), maxBytes: 280 * 1024 });
    if (!asset?.imageDataUrl) throw new Error(`Bild zu Aufgabe ${index + 1} fehlt.`);
    Object.assign(q, asset);
    await onImage();
  }
  if (q.type === "text") { q.acceptedAnswers = raw.acceptedAnswers; q.manualReview = Boolean(raw.manualReview); }
  if (q.type === "truefalse") q.correctBoolean = raw.correctBoolean;
  if (q.type === "matching") q.pairs = raw.pairs;
  if (q.type === "ordering") q.items = raw.items;
  if (q.type === "grouping") q.groups = raw.groups;
  if (q.type === "markwords") { q.passage = raw.passage; q.targetWords = raw.targetWords; }
  if (q.type === "number") { q.numericAnswer = raw.numericAnswer; q.tolerance = raw.tolerance; q.unit = raw.unit; }
  return q;
}

function imageCount(questions) {
  return questions.reduce((sum, q) => sum + (q.mediaIntent?.kind === "ai_generated" ? 1
    : q.mediaIntent?.kind === "image_choices" ? q.options.length : 0), 0);
}

module.exports = { quizForGeneratedTest, storedAiQuestion, imageCount };
