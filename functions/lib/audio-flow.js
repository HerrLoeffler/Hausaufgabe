"use strict";

const { HttpsError } = require("firebase-functions/v2/https");
const { AUDIO_MODEL, PROMPT_VERSION, LIMITS } = require("./constants");
const { consumeQuota, recordUsage } = require("./usage");
const { getOpenAI } = require("./openai-client");

const DEFAULT_VOICE = "marin";

function cleanAudioScript(value) {
  const script = String(value || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!script) throw new HttpsError("invalid-argument", "Hörtext fehlt.");
  if (script.length > LIMITS.maxAudioScriptChars) {
    throw new HttpsError("invalid-argument", `Hörtext ist zu lang. Maximal ${LIMITS.maxAudioScriptChars} Zeichen.`);
  }
  return script;
}

async function synthesizeSpeech({ script, voice = DEFAULT_VOICE }, client = getOpenAI()) {
  const response = await client.audio.speech.create({
    model: AUDIO_MODEL,
    voice,
    input: script,
    instructions: "Sprich exakt den bereitgestellten Hörtext in dessen Sprache. Natürlich, klar und schulgeeignet. Keine Einleitung, keine zusätzlichen Wörter, keine Geräusche oder Kommentare.",
    response_format: "mp3"
  });
  return Buffer.from(await response.arrayBuffer());
}

async function createAudioAsset(input, options = {}) {
  const { uid, questionId } = input || {};
  if (!uid) throw new HttpsError("unauthenticated", "Anmeldung erforderlich.");
  const script = cleanAudioScript(input?.script);
  const voice = DEFAULT_VOICE;
  const consume = options.consume || consumeQuota;
  const synthesize = options.synthesize || synthesizeSpeech;
  const record = options.record || recordUsage;

  await consume(uid, "audio");
  const bytes = await synthesize({ script, voice });
  if (!Buffer.isBuffer(bytes) || bytes.length < 100) throw new Error("Die Sprachausgabe war leer.");
  if (bytes.length > LIMITS.maxAudioBytes) {
    await record(uid, "audio", {}, {
      model: AUDIO_MODEL, promptVersion: PROMPT_VERSION, questionId,
      scriptChars: script.length, audioBytes: bytes.length, oversized: true
    });
    throw new HttpsError("failed-precondition", "Der erzeugte Hörtext ist als Audiodatei zu groß. Bitte den Hörtext kürzen.");
  }

  const asset = {
    audioDataUrl: `data:audio/mpeg;base64,${bytes.toString("base64")}`,
    audioByteSize: bytes.length,
    audioVoice: voice,
    audioModel: AUDIO_MODEL,
    audioAiGenerated: true
  };
  await record(uid, "audio", {}, {
    model: AUDIO_MODEL, promptVersion: PROMPT_VERSION, questionId,
    scriptChars: script.length, audioBytes: bytes.length
  });
  return asset;
}

module.exports = { DEFAULT_VOICE, cleanAudioScript, synthesizeSpeech, createAudioAsset };
