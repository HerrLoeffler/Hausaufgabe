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
const detailed=require("./competencies56").buildCompetencies(data.topics);
const withPractice=t=>({...t,practice:{...eligibility(t),preferredTool:plan({topic:t,phase:"practice",level:0}).preferredTool}});
const competencies=detailed.competencies.map(withPractice);
const topics=data.topics.map(t=>{const children=competencies.filter(c=>c.parentTopicId===t.id);return children.length?{...t,practice:{available:children.some(c=>c.practice.available),reason:children.some(c=>c.practice.available)?"":"Die tatsächliche Arbeit wird gemeinsam mit deiner Lehrkraft beobachtet.",preferredTool:"none"}}:withPractice(t);});
const catalog=freezeTree({...data,version:data.version+"-"+detailed.version,competencyVersion:detailed.version,coverage56:detailed.coverage56,competencies,topics});
const topicsById = new Map([...catalog.topics,...catalog.competencies].map((topic) => [topic.id, topic]));

function getCatalog() {
  return catalog;
}

function getTopic(id) {
  return typeof id === "string" ? topicsById.get(id) || null : null;
}

module.exports = {getCatalog, getTopic};
