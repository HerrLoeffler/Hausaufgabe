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
    text: { type: "string", description: "Bei gapfill steht jede Lösung direkt in eckigen Klammern im Satz, z. B. Der Hund [bellt]." },
    points: { type: "number", minimum: 0.5, multipleOf: 0.5 },
    options: { type: "array", items: optionSchema },
    acceptedAnswers: { type: "array", items: { type: "string" } },
    manualReview: { type: "boolean" },
    correctBoolean: { type: "boolean", description: "Für truefalse zwingend true oder false, niemals null. Bei anderen Typen false." },
    pairs: { type: "array", items: pairSchema },
    items: { type: "array", items: { type: "string" } },
    groups: { type: "array", items: groupSchema },
    passage: { type: "string" },
    targetWords: { type: "array", items: { type: "string" } },
    numericAnswer: { type: "number", description: "Für number die richtige Zahl; bei anderen Typen 0." },
    tolerance: { type: "number", minimum: 0 },
    unit: { type: "string" },
    mediaIntent: mediaIntentSchema
  },
  required: ["type", "text", "points", "options", "acceptedAnswers", "manualReview", "correctBoolean", "pairs", "items", "groups", "passage", "targetWords", "numericAnswer", "tolerance", "unit", "mediaIntent"]
};
// Compact per-type schemas prevent irrelevant nullable fields from being used as
// missing answers. The root stays an object; unions are nested (Structured Outputs).
const NONEMPTY = { type: "string", pattern: "\\S" };
const TYPE_FIELDS = {
  single: ["options"], multi: ["options"], dropdown: ["options"],
  text: ["acceptedAnswers", "manualReview"], truefalse: ["correctBoolean"],
  gapfill: [], matching: ["pairs"], ordering: ["items"], grouping: ["groups"],
  markwords: ["passage", "targetWords"], number: ["numericAnswer", "tolerance", "unit"]
};
function questionSchemaForType(type, { allowImages = true, mediaKind } = {}) {
  if (!QUESTION_TYPES.includes(type)) throw new TypeError("Unbekannter Aufgabentyp");
  const fields = ["type", "text", "points", ...TYPE_FIELDS[type], "mediaIntent"];
  const properties = Object.fromEntries(fields.map(key => [key, JSON.parse(JSON.stringify(questionSchema.properties[key]))]));
  properties.type = { type: "string", enum: [type] };
  properties.text = { ...properties.text, ...NONEMPTY };
  const media = properties.mediaIntent;
  media.properties.kind.enum = mediaKind ? [mediaKind] : allowImages ? ["none", "ai_generated"] : ["none"];
  if (mediaKind === "ai_generated") media.properties.prompt = { ...NONEMPTY };
  if (["single", "multi", "dropdown"].includes(type)) {
    properties.options.minItems = 2;
    properties.options.maxItems = 8;
    properties.options.items.properties.text = { ...NONEMPTY };
  }
  if (type === "truefalse") properties.correctBoolean = { type: "boolean" };
  if (type === "gapfill") properties.text.pattern = "\\[[^\\[\\]]*[^\\s\\[\\]][^\\[\\]]*\\]";
  if (type === "matching") {
    properties.pairs.minItems = 2;
    properties.pairs.items.properties.left = { ...NONEMPTY };
    properties.pairs.items.properties.right = { ...NONEMPTY };
  }
  if (type === "ordering") { properties.items.minItems = 2; properties.items.items = { ...NONEMPTY }; }
  if (type === "grouping") {
    properties.groups.minItems = 2;
    properties.groups.items.properties.name = { ...NONEMPTY };
    properties.groups.items.properties.items.minItems = 1;
    properties.groups.items.properties.items.items = { ...NONEMPTY };
  }
  if (type === "markwords") {
    properties.passage = { ...NONEMPTY };
    properties.targetWords.minItems = 1;
    properties.targetWords.items = { ...NONEMPTY };
  }
  return { type: "object", additionalProperties: false, properties, required: fields };
}
function testSchemaForRequest({ count, allowedTypes = QUESTION_TYPES, allowImages = true } = {}) {
  const types = [...new Set(allowedTypes)].filter(type => QUESTION_TYPES.includes(type));
  if (!types.length) throw new TypeError("Mindestens ein Aufgabentyp ist erforderlich");
  if (count !== undefined && (!Number.isInteger(count) || count < 1 || count > 100)) throw new RangeError("Ungültige Aufgabenanzahl");
  return {
    type: "object", additionalProperties: false,
    properties: {
      title: { ...NONEMPTY }, subject: { type: "string" }, grade: { type: "string" }, description: { type: "string" },
      questions: { type: "array", minItems: count || 1, maxItems: count || 100,
        items: { anyOf: types.map(type => questionSchemaForType(type, { allowImages })) } }
    },
    required: ["title", "subject", "grade", "description", "questions"]
  };
}
const testSchema = testSchemaForRequest();

module.exports = { testSchema, questionSchema, questionSchemaForType, testSchemaForRequest };
