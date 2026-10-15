"use strict";

// Known missing/procedural text is not a concrete question. This is deliberately
// a bounded check, not a semantic assessment of arbitrary school questions.
function missingTaskInstruction(value) {
  const text = String(value || "").normalize("NFKC").toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return !text || /^(?:(?:der genaue )?arbeitsauftrag fehlt|(?:the )?task instructions are missing|diese aufgabe ist noch nicht bereit|this question is not ready yet)/u.test(text)
    || /^(?:bitte )?frage? deine lehrkraft$/u.test(text)
    || /^(?:please )?ask your teacher$/u.test(text)
    || ["höre dir die aufnahme an und beantworte die frage", "höre dir die aufnahme unter dem bild an und beantworte die frage", "listen to the recording and answer the question", "listen to the recording below the picture and answer the question"].includes(text);
}

function listeningScript(intent = {}) {
  const script = String(intent.script || "").trim();
  const instruction = String(intent.instruction || "").trim();
  const spokenScript = script.replace(/\s+/g, " ");
  const spokenInstruction = instruction.replace(/\s+/g, " ");
  if (intent.presentation !== "listening-only" || !instruction || spokenScript.endsWith(spokenInstruction)) return script;
  return `${script}\n\n${instruction}`;
}

module.exports = { missingTaskInstruction, listeningScript };
