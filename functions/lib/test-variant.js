"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { createHash } = require("node:crypto");
const { LIMITS, QUESTION_TYPES } = require("./constants");
const { normalizeContentLocale } = require("./content-locale");
const { hasAudioAnswerEntries } = require("./audio-answers");

const text = (value, max = 3000) => String(value || "").slice(0, max);
const comparable = value => text(value).normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("de-DE");
const hasImage = q => Boolean(q.imageDataUrl || q.imageUrl || q.mediaIntent?.kind === "ai_generated");
const hasAudio = (q, privateAudio) => Boolean(q.audioDataUrl || q.audioUrl || privateAudio?.script || q.audioIntent?.kind === "ai_generated");

function buildVariantInput(quiz, questions, privateAudios = new Map(), originalInput = {}) {
  if (!questions.length || questions.length > LIMITS.maxQuestions || questions.some(q => !QUESTION_TYPES.includes(q.type))) {
    throw new HttpsError("failed-precondition", "Der Ausgangstest enthält keine unterstützte vollständige Aufgabenliste.");
  }
  const sorted = [...questions].sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  if (sorted.some(q => (q.options || []).some(o => o.imageDataUrl || o.imageUrl))) {
    throw new HttpsError("failed-precondition", "Bildantworten im Ausgangstest werden von der aktuellen Erstellung nicht unterstützt.");
  }
  const context = { ...originalInput, ...quiz.creationContext };
  const field = (key, fallback) => text(quiz[key] || context[key] || fallback, 500);
  const sourceQuestions = sorted.map(q => {
    const privateAudio = privateAudios.get(q.id) || {};
    const projection = {};
    // Explicit authoring allowlist: never copy attempts, asset bytes, release state or IDs.
    for (const key of ["type", "text", "points", "acceptedAnswers", "manualReview", "correctBoolean", "pairs", "items", "acceptedOrders", "groups", "passage", "targetWords", "numericAnswer", "tolerance", "unit"]) {
      if (q[key] !== undefined) projection[key] = JSON.parse(JSON.stringify(q[key]));
    }
    if (q.options) projection.options = q.options.map(o => ({ text: text(o.text, 500), correct: o.correct === true }));
    projection.mediaIntent = hasImage(q) ? { kind: "ai_generated", prompt: text(q.imageScene || q.mediaIntent?.prompt || q.imageAlt), altText: text(q.imageAlt, 700) } : { kind: "none" };
    projection.audioIntent = hasAudio(q, privateAudio) ? { kind: "ai_generated", script: text(privateAudio.script || q.audioIntent?.script, LIMITS.maxAudioScriptChars), instruction: text(q.audioInstruction || q.audioIntent?.instruction, 1000).trim(), presentation: (q.audioPresentation || q.audioIntent?.presentation) === "listening-only" ? "listening-only" : "supplement" } : { kind: "none" };
    return projection;
  });
  const variantSlots = sorted.map((q, i) => ({ type: q.type, points: Number(q.points), mediaKind: sourceQuestions[i].mediaIntent.kind,
    audioKind: sourceQuestions[i].audioIntent.kind, audioPresentation: sourceQuestions[i].audioIntent.presentation || "supplement",
    answerAudio: q.audioAnswerMode === "audio-only", solutionAudio: Boolean(privateAudios.get(q.id)?.solutionAudioDataUrl || privateAudios.get(q.id)?.solutionScript) }));
  const imageQuestionCount = variantSlots.filter(s => s.mediaKind === "ai_generated").length;
  const audioQuestionCount = variantSlots.filter(s => s.audioKind === "ai_generated").length;
  const audioAnswerQuestionCount = variantSlots.filter(s => s.answerAudio).length;
  const solutionAudioQuestionCount = variantSlots.filter(s => s.solutionAudio).length;
  if ([imageQuestionCount, audioQuestionCount, audioAnswerQuestionCount, solutionAudioQuestionCount].some(n => n > 5)) {
    throw new HttpsError("failed-precondition", "Der Ausgangstest überschreitet das Medienlimit der aktuellen Erstellung.");
  }
  const points = sorted.reduce((sum, q) => sum + Number(q.points), 0);
  if (!Number.isFinite(points) || sorted.some(q => !Number.isFinite(Number(q.points)) || Number(q.points) < 0.5)) throw new HttpsError("failed-precondition", "Punktwerte im Ausgangstest sind unvollständig.");
  const learningGoals = quiz.learningGoals || context.learningGoals || [];
  const contentLocale = normalizeContentLocale(quiz.contentLocale || context.contentLocale);
  const scale = quiz.gradeScaleSnapshot;
  const gradeScaleSnapshot = Array.isArray(scale?.thresholds) && scale.thresholds.length === 6 && scale.thresholds.every(n => Number.isFinite(n))
    ? { id: text(scale.id, 100), name: text(scale.name, 100), thresholds: [...scale.thresholds] } : null;
  const variantQuizSettings = {
    contentLocale, gradingLocale: normalizeContentLocale(quiz.gradingLocale, contentLocale),
    gradeScaleId: text(quiz.gradeScaleId || gradeScaleSnapshot?.id || "standard", 100), gradeScaleSnapshot,
    description: text(quiz.description || "Viel Erfolg beim Test!", 3000),
    resultMode: text(quiz.resultMode || "points_grade", 100), showSolutions: Boolean(quiz.showSolutions),
    timeLimitMinutes: Number.isFinite(quiz.timeLimitMinutes) && quiz.timeLimitMinutes > 0 ? quiz.timeLimitMinutes : null,
    startMode: quiz.startMode === "teacher" ? "teacher" : "student", shuffleQuestions: Boolean(quiz.shuffleQuestions), shuffleAnswers: Boolean(quiz.shuffleAnswers)
  };
  const input = {
    schoolType: field("schoolType", "nicht gespeichert – aus Ausgangstest ableiten"), region: field("region", "nicht gespeichert"),
    subject: field("subject", "aus Ausgangstest ableiten"), grade: field("grade", "aus Ausgangstest ableiten"), topic: field("topic", quiz.title || "Ausgangstest"),
    difficulty: field("difficulty", "gleiches Niveau wie Ausgangstest"), learningGoals,
    count: sorted.length, points, allowedTypes: [...new Set(sorted.map(q => q.type))],
    imageQuestionCount, imageAnswerQuestionCount: 0, audioQuestionCount, audioAnswerQuestionCount, solutionAudioQuestionCount,
    notes: `[[GRADECREW_CONTENT_LOCALE=${contentLocale}]]\nKompetenzen und Anspruch vollständig erhalten; ALLE Aufgaben mit neuen Beispielen, Zahlen oder Kontexten. Keine Aufgabe oder Medienbeschreibung übernehmen.\nLernziele als Referenzdaten: ${JSON.stringify(learningGoals).slice(0, 2000)}`,
    materialMode: "inspiration", sourceTest: { title: text(quiz.title, 150), questions: sourceQuestions }, variantSlots, variantQuizSettings, generationMode: "variant"
  };
  input.variantSourceFingerprint = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  return input;
}

async function loadVariantInput(db, uid, sourceQuizId) {
  const ref = db.doc(`quizzes/${sourceQuizId}`);
  return db.runTransaction(async tx => {
    const source = await tx.get(ref);
    const quiz = source.data();
    if (!source.exists || quiz.ownerId !== uid || quiz.rightsHold || quiz.isDeleted || ["running", "failed"].includes(quiz.generationStatus)) throw new HttpsError("permission-denied", "Auf den vollständigen Ausgangstest kann nicht zugegriffen werden.");
    const questions = await tx.get(ref.collection("questions"));
    const audios = await tx.get(ref.collection("audioScripts"));
    const originalJob = quiz.generationJobId ? await tx.get(db.doc(`aiJobs/${quiz.generationJobId}`)) : null;
    const originalInput = originalJob?.data()?.ownerId === uid ? originalJob.data().input || {} : {};
    return buildVariantInput(quiz, questions.docs.map(q => ({ ...q.data(), id: q.id })), new Map(audios.docs.map(a => [a.id, a.data()])), originalInput);
  });
}

function variantQuestionErrors(question, index, input) {
  const slot = input?.variantSlots?.[index];
  if (!slot) return ["Vorgabe der Ausgangsaufgabe fehlt."];
  const errors = [];
  if (Number(question.points) !== slot.points) errors.push(`Punktwert muss ${slot.points} sein.`);
  if (question.type !== slot.type) errors.push(`Aufgabentyp muss ${slot.type} sein.`);
  if (slot.answerAudio && !hasAudioAnswerEntries(question)) errors.push("Vorgelesene Antworten brauchen geeignete, vollständig neue Antwortinhalte.");
  if ((question.mediaIntent?.kind || "none") !== slot.mediaKind) errors.push(`Bildart muss ${slot.mediaKind} sein.`);
  if ((question.audioIntent?.kind || "none") !== slot.audioKind) errors.push(`Audioart muss ${slot.audioKind} sein.`);
  if (slot.audioKind === "ai_generated" && (question.audioIntent?.presentation || "supplement") !== slot.audioPresentation) errors.push(`Audiomodus muss ${slot.audioPresentation} sein.`);
  for (const old of input.sourceTest.questions) {
    if (slot.mediaKind === "ai_generated" && old.mediaIntent?.prompt && comparable(old.mediaIntent.prompt) === comparable(question.mediaIntent?.prompt)) errors.push("Bildszene des Ausgangstests muss vollständig neu erzeugt werden.");
    if (slot.audioKind === "ai_generated" && old.audioIntent?.script && comparable(old.audioIntent.script) === comparable(question.audioIntent?.script)) errors.push("Hörtext des Ausgangstests muss neu formuliert werden.");
  }
  return errors;
}

function variantPrompt(input, offset = 0, count = input.count) {
  if (input.generationMode !== "variant") return "";
  const slots = input.variantSlots.slice(offset, offset + count);
  return `\nVerbindliche Variantenpositionen als Referenzdaten: ${JSON.stringify(slots)}\nErzeuge für JEDE Position vollständig neue fachlich gleichwertige Inhalte. Behalte Aufgabentyp, Punktgewicht, Bildart, Audioart und Audiopräsentation je Position bei. Alle Bildprompts und Hörtexte müssen zur neuen Aufgabe passen und sich vom Ausgangstest unterscheiden. Vorgelesene Antworten erhalten neue passende Antwortinhalte. Keine fehlenden Medien durch Text ersetzen.`;
}

function requireVariantMediaReady(input, completed) {
  if (completed.images !== input.imageQuestionCount || completed.audios !== input.audioQuestionCount || completed.answerAudios !== input.audioAnswerQuestionCount || completed.solutionAudios !== input.solutionAudioQuestionCount) {
    throw new HttpsError("failed-precondition", "Die neue Variante ist noch nicht vollständig: benötigte Medien konnten nicht neu erzeugt werden.");
  }
}

module.exports = { buildVariantInput, loadVariantInput, variantQuestionErrors, variantPrompt, requireVariantMediaReady };
