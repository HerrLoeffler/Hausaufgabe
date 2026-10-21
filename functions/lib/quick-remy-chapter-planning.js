"use strict";
const { normalizeContentLocale } = require("./content-locale");
const { randomUUID } = require("node:crypto");
function invalid() { return Object.assign(new Error("Der Kapitelplan muss gültige Kapitel und die vereinbarten Aufgaben und Punkte enthalten."), { code: "invalid-argument" }); }
function halfPoints(n) { return typeof n === "number" && Number.isFinite(n) && n > 0 && Number.isInteger(n * 2); }
function spokenChapterCount(conversationText) {
  const words = { ein: 1, eine: 1, eins: 1, einen: 1, one: 1, zwei: 2, two: 2, drei: 3, three: 3, vier: 4, four: 4, fünf: 5, fuenf: 5, five: 5, sechs: 6, six: 6, sieben: 7, seven: 7, acht: 8, eight: 8, neun: 9, nine: 9, zehn: 10, ten: 10, elf: 11, eleven: 11, zwölf: 12, zwoelf: 12, twelve: 12, dreizehn: 13, thirteen: 13, vierzehn: 14, fourteen: 14, fünfzehn: 15, fifteen: 15, sechzehn: 16, sixteen: 16, siebzehn: 17, seventeen: 17, achtzehn: 18, eighteen: 18, neunzehn: 19, nineteen: 19, zwanzig: 20, twenty: 20, hundert: 100, hundred: 100 };
  // Only quantities preceding the noun count; "Kapitel 1 ... Kapitel 2" lists do not.
  const pattern = /(?:^|[^\p{L}\p{N}])([\p{L}]+|\d+)\s+(?:kapitel|chapters?)\b/giu;
  const counts = new Set();
  for (const match of String(conversationText || "").matchAll(pattern)) {
    const key = match[1].toLocaleLowerCase("de-DE");
    const count = /^\d+$/.test(key) ? Number(key) : words[key];
    if (count !== undefined) counts.add(count);
  }
  if (counts.size > 1) throw Object.assign(new Error("Bitte eine eindeutige Kapitelanzahl angeben."), { code: "invalid-argument" });
  return counts.size ? [...counts][0] : undefined;
}
function normalizeChapterPlanning(value, known, conversationText) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !halfPoints(value.points) || value.points > 1000 || value.points < known.count * 0.5 || !known.subject || !known.grade || !known.topic || !Number.isInteger(known.count)) throw invalid();
  const result = { points: value.points, contentLocale: normalizeContentLocale(value.contentLocale) };
  for (const key of ["schoolType", "region"]) {
    if (value[key] !== undefined && (typeof value[key] !== "string" || value[key].trim().length > 120)) throw invalid();
    result[key] = (value[key] || "").trim();
  }
  const chapterCount = value.chapterCount === undefined ? spokenChapterCount(conversationText) : value.chapterCount;
  if (chapterCount !== undefined) {
    if (!Number.isInteger(chapterCount) || chapterCount < 1 || chapterCount > Math.min(known.count, 100)) throw invalid();
    result.chapterCount = chapterCount;
  }
  return result;
}
function buildChapterPlan(value, input, pedagogicalContext) {
  const items = value?.chapters;
  if (!Array.isArray(items) || items.length < 1 || items.length > Math.min(input.knownFields.count, 100) || (input.chapterPlanning.chapterCount !== undefined && items.length !== input.chapterPlanning.chapterCount)) throw invalid();
  const chapters = [], chapterPlan = [], titles = new Set(), topics = new Set();
  let count = 0, points = 0;
  for (const item of items) {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const topic = typeof item?.topic === "string" ? item.topic.trim() : "";
    if (!title || title.length > 120 || !topic || topic.length > 500 || titles.has(title.toLocaleLowerCase("de-DE")) || topics.has(topic.toLocaleLowerCase("de-DE")) || !Number.isInteger(item.count) || item.count < 1 || item.count > 100 || !halfPoints(item.points) || item.points < item.count * 0.5) throw invalid();
    titles.add(title.toLocaleLowerCase("de-DE")); topics.add(topic.toLocaleLowerCase("de-DE"));
    const id = `ch_${randomUUID()}`;
    chapters.push({ id, title, position: chapters.length + 1 });
    chapterPlan.push({ chapterId: id, topic, count: item.count, points: item.points, materialIds: [] });
    count += item.count; points += item.points;
  }
  if (count !== input.knownFields.count || points !== input.chapterPlanning.points) throw invalid();
  return { status: "chapterPlan", chapterSchemaVersion: 1, chapters, chapterPlan, pedagogicalContext };
}
const CHAPTER_PLANNING_SCHEMA = {
  type: "object", additionalProperties: false, required: ["chapters"], properties: { chapters: { type: "array", minItems: 1, maxItems: 100, items: {
    type: "object", additionalProperties: false, required: ["title", "topic", "count", "points"], properties: { title: { type: "string", minLength: 1, maxLength: 120 }, topic: { type: "string", minLength: 1, maxLength: 500 }, count: { type: "integer", minimum: 1, maximum: 100 }, points: { type: "number", minimum: 0.5, maximum: 1000 } }
  } } }
};
module.exports = { normalizeChapterPlanning, buildChapterPlan, CHAPTER_PLANNING_SCHEMA };
