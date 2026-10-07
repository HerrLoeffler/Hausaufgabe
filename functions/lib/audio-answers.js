"use strict";

const { planSolutionAudioIndexes } = require("./solution-audio");

const AUDIO_CHOICE_TYPES = new Set(["single", "multi", "dropdown"]);
const MAX_ANSWER_AUDIO_CHARS = 500;
const MAX_ANSWER_AUDIO_DATA_CHARS = 700000;

function answerAudioEntries(question) {
  let entries = [];
  if (AUDIO_CHOICE_TYPES.has(question?.type)) entries = (question.options || []).map((option, index) => ({ key: `o${index}`, sourceText: option?.text, asset: option, image: option?.imageDataUrl || option?.imageUrl }));
  if (question?.type === "grouping") entries = (question.groups || []).flatMap((group, gi) => (group.items || []).map((text, ii) => ({ key: `g${gi}_i${ii}`, sourceText: text })));
  if (question?.type === "matching") entries = (question.pairs || []).map((pair, index) => ({ key: `p${index}`, sourceText: pair?.right }));
  if (question?.type === "ordering") entries = (question.items || []).map((text, index) => ({ key: `i${index}`, sourceText: text }));
  return entries.map(entry => ({ ...entry, sourceText: String(entry.sourceText || "").replace(/\s+/g, " ").trim(), asset: entry.asset || (question.audioAnswerItems || []).find(item => item.key === entry.key) }));
}

function hasAudioAnswerEntries(question) {
  const entries = answerAudioEntries(question);
  const max = AUDIO_CHOICE_TYPES.has(question?.type) ? 4 : 12;
  return entries.length >= 2 && entries.length <= max && entries.every(entry => entry.sourceText && entry.sourceText.length <= MAX_ANSWER_AUDIO_CHARS && !entry.image);
}

function setAnswerAudioAssets(question, assets, { incomplete = false } = {}) {
  const entries = answerAudioEntries(question);
  if (AUDIO_CHOICE_TYPES.has(question.type)) question.options = question.options.map((option, index) => ({ ...option, ...assets[index], audioNeedsRegeneration: incomplete }));
  else question.audioAnswerItems = entries.map((entry, index) => ({ key: entry.key, sourceText: entry.sourceText, audioDataUrl: assets[index]?.audioDataUrl || "", audioNeedsRegeneration: incomplete }));
}

function answerAudioIndexes(questions, count) {
  const eligible = questions.map((question, index) => hasAudioAnswerEntries(question) ? index : -1)
    .filter(index => index >= 0);
  if (!Number.isInteger(count) || count < 0 || count > 5 || count > eligible.length) {
    throw new RangeError("Für Audioantworten fehlen geeignete Auswahlaufgaben.");
  }
  return planSolutionAudioIndexes(eligible.length, count).map(index => eligible[index]);
}

function answerAudioReady(question) {
  if (question?.audioAnswerMode !== "audio-only") return true;
  const entries = answerAudioEntries(question);
  return hasAudioAnswerEntries(question) && entries.every(entry => String(entry.asset?.audioDataUrl || "").startsWith("data:audio/mpeg;base64,") && entry.asset.audioNeedsRegeneration !== true && (!entry.asset.sourceText || entry.asset.sourceText === entry.sourceText)) &&
    entries.reduce((size, entry) => size + String(entry.asset?.audioDataUrl || "").length, String(question.audioDataUrl || "").length) <= MAX_ANSWER_AUDIO_DATA_CHARS;
}

async function generateAnswerAudios(question, generateAudio) {
  if (!hasAudioAnswerEntries(question)) {
    throw new RangeError("Audioantworten brauchen zwei bis vier Auswahlmöglichkeiten.");
  }
  const assets = [];
  const entries = answerAudioEntries(question);
  for (let index = 0; index < entries.length; index += 1) {
    const script = entries[index].sourceText;
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

module.exports = { answerAudioEntries, hasAudioAnswerEntries, setAnswerAudioAssets, answerAudioIndexes, answerAudioReady, generateAnswerAudios, MAX_ANSWER_AUDIO_DATA_CHARS };
