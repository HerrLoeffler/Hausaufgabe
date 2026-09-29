"use strict";

const { opaqueId } = require("./assessment-core");

function stringValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

function optionIndexMap(question, secret) {
  return new Map((Array.isArray(question.options) ? question.options : []).map((_, index) => [
    opaqueId(secret, question.id, "option", index),
    String(index)
  ]));
}

function decodeQuestionAnswer(question, given, secret) {
  const type = question.type;
  if (["text", "number", "truefalse"].includes(type)) return stringValue(given);
  if (type === "gapfill" || type === "markwords") return Array.isArray(given) ? given.map(stringValue) : [];

  if (["single", "dropdown"].includes(type)) {
    return optionIndexMap(question, secret).get(stringValue(given)) || "";
  }

  if (type === "multi") {
    const map = optionIndexMap(question, secret);
    return (Array.isArray(given) ? given : []).map(value => map.get(stringValue(value))).filter(value => value !== undefined);
  }

  if (type === "matching") {
    const pairs = Array.isArray(question.pairs) ? question.pairs : [];
    const source = given && typeof given === "object" && !Array.isArray(given) ? given : {};
    const rightIndexes = new Map(pairs.map((_, index) => [opaqueId(secret, question.id, "matching-right", index), String(index)]));
    const result = {};
    pairs.forEach((_, index) => {
      const leftId = opaqueId(secret, question.id, "matching-left", index);
      result[index] = rightIndexes.get(stringValue(source[leftId])) || "";
    });
    return result;
  }

  if (type === "ordering") {
    const items = Array.isArray(question.items) ? question.items : [];
    const indexes = new Map(items.map((_, index) => [opaqueId(secret, question.id, "ordering-item", index), String(index)]));
    return (Array.isArray(given) ? given : []).map(value => indexes.get(stringValue(value))).filter(value => value !== undefined);
  }

  if (type === "grouping") {
    const groups = Array.isArray(question.groups) ? question.groups : [];
    const source = given && typeof given === "object" && !Array.isArray(given) ? given : {};
    const groupIndexes = new Map(groups.map((_, index) => [opaqueId(secret, question.id, "group", index), String(index)]));
    const result = {};
    groups.forEach((group, sourceGroupIndex) => {
      (Array.isArray(group?.items) ? group.items : []).forEach((_, itemIndex) => {
        const itemId = opaqueId(secret, question.id, `group-item-${sourceGroupIndex}`, itemIndex);
        result[`g${sourceGroupIndex}_i${itemIndex}`] = groupIndexes.get(stringValue(source[itemId])) || "";
      });
    });
    return result;
  }

  return given ?? "";
}

function decodeSubmissionAnswers(questions, answers, secret) {
  const source = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
  const out = {};
  for (const question of Array.isArray(questions) ? questions : []) {
    if (!question?.id) continue;
    out[question.id] = decodeQuestionAnswer(question, source[question.id], secret);
  }
  return out;
}

module.exports = { decodeQuestionAnswer, decodeSubmissionAnswers };
