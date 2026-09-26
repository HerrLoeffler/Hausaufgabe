"use strict";

const { QUESTION_TYPES } = require("./constants");

const optionSchema = {
  type: "object", additionalProperties: false,
  properties: {
    text: { type: "string" },
    correct: { type: "boolean" }
  },
  required: ["text", "correct"]
};
const pairSchema = {
  type: "object", additionalProperties: false,
  properties: { left: { type: "string" }, right: { type: "string" } },
  required: ["left", "right"]
};
const groupSchema = {
  type: "object", additionalProperties: false,
  properties: { name: { type: "string" }, items: { type: "array", items: { type: "string" } } },
  required: ["name", "items"]
};
const mediaIntentSchema = {
  type: "object", additionalProperties: false,
  properties: {
    kind: { type: "string", enum: ["none", "ai_generated"] },
    prompt: { type: "string" },
    altText: { type: "string" },
    count: { type: "integer", minimum: 0, maximum: 4 },
    sourceMaterialId: { type: "string" },
    reason: { type: "string" }
  },
  required: ["kind", "prompt", "altText", "count", "sourceMaterialId", "reason"]
};
const questionSchema = {
  type: "object", additionalProperties: false,
  properties: {
    type: { type: "string", enum: QUESTION_TYPES },
    text: { type: "string" },
    points: { type: "number", minimum: 0.5 },
    options: { type: "array", items: optionSchema },
    acceptedAnswers: { type: "array", items: { type: "string" } },
    manualReview: { type: "boolean" },
    correctBoolean: { type: ["boolean", "null"] },
    pairs: { type: "array", items: pairSchema },
    items: { type: "array", items: { type: "string" } },
    groups: { type: "array", items: groupSchema },
    passage: { type: "string" },
    targetWords: { type: "array", items: { type: "string" } },
    numericAnswer: { type: ["number", "null"] },
    tolerance: { type: "number", minimum: 0 },
    unit: { type: "string" },
    mediaIntent: mediaIntentSchema
  },
  required: ["type", "text", "points", "options", "acceptedAnswers", "manualReview", "correctBoolean", "pairs", "items", "groups", "passage", "targetWords", "numericAnswer", "tolerance", "unit", "mediaIntent"]
};
const testSchema = {
  type: "object", additionalProperties: false,
  properties: {
    title: { type: "string" },
    subject: { type: "string" },
    grade: { type: "string" },
    description: { type: "string" },
    questions: { type: "array", minItems: 1, maxItems: 50, items: questionSchema }
  },
  required: ["title", "subject", "grade", "description", "questions"]
};

module.exports = { testSchema, questionSchema };
