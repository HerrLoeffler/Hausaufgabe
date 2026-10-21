"use strict";

// Explicit fields only: never copy request/auth objects, material uploads or image bytes.
function questionSnapshot(raw = {}) {
  let remaining = 18000;
  const text = value => {
    const result = String(value ?? "").slice(0, Math.min(3000, remaining));
    remaining -= result.length;
    return result;
  };
  const out = {};
  for (const key of ["type", "text", "points", "correctBoolean", "numericAnswer", "tolerance", "unit", "passage"]) {
    if (["string", "number", "boolean"].includes(typeof raw[key])) out[key] = text(raw[key]);
  }
  for (const key of ["acceptedAnswers", "items", "targetWords"]) {
    if (Array.isArray(raw[key])) out[key] = raw[key].slice(0, 30).map(text);
  }
  if (Array.isArray(raw.options)) out.options = raw.options.slice(0, 12).map(option => ({
    text: text(option?.text), correct: option?.correct === true, imageScene: text(option?.imageScene)
  }));
  if (Array.isArray(raw.pairs)) out.pairs = raw.pairs.slice(0, 30).map(pair => ({ left: text(pair?.left), right: text(pair?.right) }));
  if (Array.isArray(raw.groups)) out.groups = raw.groups.slice(0, 12).map(group => ({
    name: text(group?.name), items: Array.isArray(group?.items) ? group.items.slice(0, 30).map(text) : []
  }));
  if (raw.mediaIntent) out.mediaIntent = {
    kind: text(raw.mediaIntent.kind), prompt: text(raw.mediaIntent.prompt), altText: text(raw.mediaIntent.altText)
  };
  return out;
}

function requestSnapshot(input = {}) {
  const out = {};
  for (const key of ["subject", "grade", "topic", "difficulty", "schoolType", "region", "count", "points", "imageMode", "imageQuestionCount", "imageAnswerQuestionCount"]) {
    if (["string", "number", "boolean"].includes(typeof input[key])) out[key] = typeof input[key] === "string" ? input[key].slice(0, 1000) : input[key];
  }
  out.allowedTypes = Array.isArray(input.allowedTypes) ? input.allowedTypes.slice(0, 20).map(value => String(value).slice(0, 40)) : [];
  return out;
}

module.exports = { questionSnapshot, requestSnapshot };
