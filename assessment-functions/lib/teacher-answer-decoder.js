"use strict";

const { opaqueId } = require("./assessment-core");

function stringValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

function buildTeacherDecoderShape(questions) {
  return (Array.isArray(questions) ? questions : []).filter(question => question?.id).map(question => ({
    id: String(question.id),
    type: String(question.type || "text"),
    optionCount: Array.isArray(question.options) ? question.options.length : 0,
    pairCount: Array.isArray(question.pairs) ? question.pairs.length : 0,
    itemCount: Array.isArray(question.items) ? question.items.length : 0,
    groupItemCounts: Array.isArray(question.groups)
      ? question.groups.map(group => Array.isArray(group?.items) ? group.items.length : 0)
      : []
  }));
}

function optionIndexMapFromCount(questionId, count, secret) {
  return new Map(Array.from({ length: Math.max(0, Number(count) || 0) }, (_, index) => [
    opaqueId(secret, questionId, "option", index),
    String(index)
  ]));
}

function decodeQuestionAnswerFromShape(shape, given, secret) {
  const type = shape.type;
  const questionId = shape.id;
  if (["text", "number", "truefalse"].includes(type)) return stringValue(given);
  if (type === "gapfill" || type === "markwords") return Array.isArray(given) ? given.map(stringValue) : [];

  if (["single", "dropdown"].includes(type)) {
    return optionIndexMapFromCount(questionId, shape.optionCount, secret).get(stringValue(given)) || "";
  }

  if (type === "multi") {
    const map = optionIndexMapFromCount(questionId, shape.optionCount, secret);
    return (Array.isArray(given) ? given : []).map(value => map.get(stringValue(value))).filter(value => value !== undefined);
  }

  if (type === "matching") {
    const count = Math.max(0, Number(shape.pairCount) || 0);
    const source = given && typeof given === "object" && !Array.isArray(given) ? given : {};
    const rightIndexes = new Map(Array.from({ length: count }, (_, index) => [
      opaqueId(secret, questionId, "matching-right", index), String(index)
    ]));
    const result = {};
    for (let index = 0; index < count; index += 1) {
      const leftId = opaqueId(secret, questionId, "matching-left", index);
      result[index] = rightIndexes.get(stringValue(source[leftId])) || "";
    }
    return result;
  }

  if (type === "ordering") {
    const count = Math.max(0, Number(shape.itemCount) || 0);
    const indexes = new Map(Array.from({ length: count }, (_, index) => [
      opaqueId(secret, questionId, "ordering-item", index), String(index)
    ]));
    return (Array.isArray(given) ? given : []).map(value => indexes.get(stringValue(value))).filter(value => value !== undefined);
  }

  if (type === "grouping") {
    const counts = Array.isArray(shape.groupItemCounts) ? shape.groupItemCounts.map(value => Math.max(0, Number(value) || 0)) : [];
    const source = given && typeof given === "object" && !Array.isArray(given) ? given : {};
    const groupIndexes = new Map(counts.map((_, index) => [opaqueId(secret, questionId, "group", index), String(index)]));
    const result = {};
    counts.forEach((itemCount, sourceGroupIndex) => {
      for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
        const itemId = opaqueId(secret, questionId, `group-item-${sourceGroupIndex}`, itemIndex);
        result[`g${sourceGroupIndex}_i${itemIndex}`] = groupIndexes.get(stringValue(source[itemId])) || "";
      }
    });
    return result;
  }

  return given ?? "";
}

function decodeSubmissionAnswersFromShape(decoderShape, answers, secret) {
  const source = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
  const out = {};
  for (const shape of Array.isArray(decoderShape) ? decoderShape : []) {
    if (!shape?.id) continue;
    out[shape.id] = decodeQuestionAnswerFromShape(shape, source[shape.id], secret);
  }
  return out;
}

// Compatibility helpers for tests and one-off migrations. The secure lifecycle
// persists only the compact decoder shape, never the current authoring document.
function decodeQuestionAnswer(question, given, secret) {
  const shape = buildTeacherDecoderShape([question])[0] || { id: String(question?.id || ""), type: String(question?.type || "text") };
  return decodeQuestionAnswerFromShape(shape, given, secret);
}

function decodeSubmissionAnswers(questions, answers, secret) {
  return decodeSubmissionAnswersFromShape(buildTeacherDecoderShape(questions), answers, secret);
}

module.exports = {
  buildTeacherDecoderShape,
  decodeQuestionAnswerFromShape,
  decodeSubmissionAnswersFromShape,
  decodeQuestionAnswer,
  decodeSubmissionAnswers
};
