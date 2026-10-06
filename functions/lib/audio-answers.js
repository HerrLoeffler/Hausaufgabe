"use strict";

const { planSolutionAudioIndexes } = require("./solution-audio");

const AUDIO_CHOICE_TYPES = new Set(["single", "multi"]);
const MAX_ANSWER_AUDIO_CHARS = 500;
const MAX_ANSWER_AUDIO_DATA_CHARS = 700000;

function answerAudioIndexes(questions, count) {
  const eligible = questions.map((question, index) => AUDIO_CHOICE_TYPES.has(question?.type) &&
    Array.isArray(question.options) && question.options.length >= 2 && question.options.length <= 4 &&
    question.options.every(option => !option?.imageDataUrl && !option?.imageUrl) ? index : -1)
    .filter(index => index >= 0);
  if (!Number.isInteger(count) || count < 0 || count > 5 || count > eligible.length) {
    throw new RangeError("Für Audioantworten fehlen geeignete Auswahlaufgaben.");
  }
  return planSolutionAudioIndexes(eligible.length, count).map(index => eligible[index]);
}

function answerAudioReady(question) {
  if (question?.audioAnswerMode !== "audio-only") return true;
  const options = question.options;
  return AUDIO_CHOICE_TYPES.has(question.type) && Array.isArray(options) && options.length >= 2 && options.length <= 4 &&
    options.every(option => !option?.imageDataUrl && !option?.imageUrl && String(option?.text || "").trim() &&
      String(option?.audioDataUrl || "").startsWith("data:audio/mpeg;base64,") &&
      option.audioNeedsRegeneration !== true) &&
    options.reduce((size, option) => size + String(option.audioDataUrl || "").length, String(question.audioDataUrl || "").length) <= MAX_ANSWER_AUDIO_DATA_CHARS;
}

async function generateAnswerAudios(question, generateAudio) {
  if (!AUDIO_CHOICE_TYPES.has(question?.type) || !Array.isArray(question.options) ||
      question.options.length < 2 || question.options.length > 4 ||
      question.options.some(option => option?.imageDataUrl || option?.imageUrl)) {
    throw new RangeError("Audioantworten brauchen zwei bis vier Auswahlmöglichkeiten.");
  }
  const assets = [];
  for (let index = 0; index < question.options.length; index += 1) {
    const script = String(question.options[index]?.text || "").replace(/\s+/g, " ").trim();
    if (!script || script.length > MAX_ANSWER_AUDIO_CHARS) throw new RangeError("Antworttext fehlt oder ist zu lang.");
    const asset = await generateAudio({ questionId: `answer-${question.id || "question"}-${index + 1}`, script });
    if (!String(asset?.audioDataUrl || "").startsWith("data:audio/mpeg;base64,")) throw new Error("Antwortaudio fehlt.");
    assets.push(asset);
    if (assets.reduce((total, entry) => total + entry.audioDataUrl.length, String(question.audioDataUrl || "").length) > MAX_ANSWER_AUDIO_DATA_CHARS) {
      throw new RangeError("Antwortaudios sind für eine Aufgabe zu groß. Bitte Antworttexte kürzen.");
    }
  }
  return assets;
}

module.exports = { answerAudioIndexes, answerAudioReady, generateAnswerAudios, MAX_ANSWER_AUDIO_DATA_CHARS };
