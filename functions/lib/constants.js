"use strict";

const REGION = "europe-west1";
const TEXT_MODEL = "gpt-5.6-luna";
const IMAGE_MODEL = "gpt-image-2";
const PROMPT_VERSION = "testify-ai-v13";
const AI_SCHEMA_VERSION = 3;
const QUESTION_TYPES = Object.freeze([
  "single", "multi", "text", "dropdown", "truefalse", "gapfill",
  "matching", "ordering", "grouping", "markwords", "number"
]);
const MATERIAL_MIME_TYPES = Object.freeze([
  "application/pdf", "image/jpeg", "image/png", "image/webp",
  "text/plain", "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
const LIMITS = Object.freeze({
  maxQuestions: 50,
  maxPromptChars: 6000,
  maxMaterials: 5,
  maxMaterialBytes: 15 * 1024 * 1024,
  maxVisualQuestions: 5,
  testPerMinute: 3,
  testPerDay: 40,
  questionPerMinute: 12,
  questionPerDay: 300,
  imagePerMinute: 28,
  imagePerDay: 80,
  materialPerMinute: 6,
  materialPerDay: 100
});

module.exports = { REGION, TEXT_MODEL, IMAGE_MODEL, PROMPT_VERSION, AI_SCHEMA_VERSION, QUESTION_TYPES, MATERIAL_MIME_TYPES, LIMITS };
