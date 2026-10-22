"use strict";

// Runtime data is a versioned derivative of the existing read-only archive.
// Content-review and media requirements travel with each goal; a menu entry is
// neither an approved task family nor evidence of learner proficiency.
const data = require("../../data/learning-brain-catalog.json");

function freezeTree(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freezeTree);
  return Object.freeze(value);
}

const {eligibility,plan}=require("./planning");
const catalog = freezeTree({...data,version:data.version+"-workshop1",topics:data.topics.map(t=>({...t,practice:{...eligibility(t),preferredTool:plan({topic:t,phase:"practice",level:0}).preferredTool}}))});
const topicsById = new Map(catalog.topics.map((topic) => [topic.id, topic]));

function getCatalog() {
  return catalog;
}

function getTopic(id) {
  return typeof id === "string" ? topicsById.get(id) || null : null;
}

module.exports = {getCatalog, getTopic};
