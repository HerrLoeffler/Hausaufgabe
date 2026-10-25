"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const topics = require("../data/learning-brain-catalog.json").topics;
const modulePath = path.join(path.dirname(module.filename), "../lib/learning-brain/competencies56.js");
function build(input = topics) {
  assert.ok(fs.existsSync(modulePath), "5/6 source-linked competency builder must exist");
  return require(modulePath).buildCompetencies(input);
}
function slug(c) { return c.parentTopicId.split(":").at(-1); }

test("every one of the 113 grade5/6 source anchors has 2–4 observable practice children", () => {
  const result = build();
  const parents = topics.filter((t) => [5, 6].includes(t.grade) && t.track === "R");
  assert.equal(parents.length, 113);
  assert.equal(result.coverage56.anchors.length, 113);
  assert.equal(result.coverage56.parentCount, 113);
  assert.equal(result.coverage56.competencyCount, result.competencies.length);
  assert.match(result.version, /56/);
  const ids = new Set(result.competencies.map((c) => c.id));
  const goals = new Set(result.competencies.map((c) => c.goal));
  assert.equal(ids.size, result.competencies.length);
  assert.equal(goals.size, result.competencies.length, "not duplicated generic goals");
  for (const p of parents) {
    const children = result.competencies.filter((c) => c.parentTopicId === p.id);
    assert.ok(children.length >= 2 && children.length <= 4, p.id);
    assert.deepEqual(result.coverage56.anchors.find((a) => a.parentTopicId === p.id).competencyIds, children.map((c) => c.id));
    children.forEach((c, i) => {
      assert.equal(c.id, `${p.id}:k${i + 1}`);
      assert.deepEqual(c.source, p.source, "preserve unreviewed source status and digest");
      assert.equal(c.grade, p.grade);
      assert.equal(c.subject, p.subject);
      assert.ok(c.title.length > 8 && c.goal.length > 40 && c.evidenceBoundary.length > 40, c.id);
      assert.equal(c.learningPlan.levels.length, 4);
      assert.equal(new Set(c.learningPlan.levels).size, 4);
      assert.equal(c.learningPlan.help.length, 3);
      assert.equal(new Set(c.learningPlan.help).size, 3);
      assert.ok(["text", "visual", "listen", "speak"].includes(c.delivery));
      assert.ok(["digital", "preparation", "human-observation"].includes(c.assessmentScope));
    });
  }
});

test("prerequisite navigation is a source-consistent acyclic graph of actual child IDs", () => {
  const {competencies} = build();
  const index = new Map(competencies.map((c) => [c.id, c]));
  const visiting = new Set(); const done = new Set();
  function visit(c) {
    assert.ok(!visiting.has(c.id), `cycle ${c.id}`);
    if (done.has(c.id)) return;
    visiting.add(c.id);
    c.prerequisites.forEach((id) => {
      assert.ok(index.has(id), `dangling ${id}`);
      const p = index.get(id);
      assert.equal(p.subject, c.subject);
      assert.ok(p.grade <= c.grade, c.id);
      assert.ok(c.prerequisiteRationales[id].length > 20);
      visit(p);
    });
    visiting.delete(c.id); done.add(c.id);
  }
  competencies.forEach(visit);
  const pick = (s, n) => competencies.find((c) => c.subject === "math" && slug(c) === s && c.id.endsWith(`:k${n}`));
  assert.ok(pick("B12", 1).prerequisites.includes(pick("B07", 1).id), "common measure needs value-preserving expansion");
  assert.ok(pick("B12", 2).prerequisites.includes(pick("B11", 1).id), "addition after common measure needs same-denominator addition");
  assert.ok(pick("quaderoberflaechen-berechnen", 2).prerequisites.includes(pick("rechteckflaechen-verstehen", 2).id));
  assert.ok(pick("volumenformeln-umkehren", 1).prerequisites.includes(pick("volumen-mit-einheitswuerfeln", 2).id));
});

test("audio, speaking, handwriting and geometry retain their actual evidence boundaries", () => {
  const {competencies} = build();
  const oralParents = topics.filter((t) => t.subject === "german" && [5, 6].includes(t.grade) && t.modality === "speaking");
  for (const p of oralParents) {
    const cs = competencies.filter((c) => c.parentTopicId === p.id);
    assert.ok(cs.some((c) => c.assessmentScope === "preparation" || c.assessmentScope === "human-observation"));
    assert.ok(cs.every((c) => c.assessmentScope !== "digital" || c.goal.startsWith("Als Vorbereitung") || c.delivery === "listen"), p.id);
    assert.ok(cs.every((c) => /belegt|Nachweis|Beobachtung|Vorbereitung/.test(c.evidenceBoundary)));
  }
  for (const c of competencies.filter((c) => c.delivery === "listen")) {
    assert.match(c.evidenceBoundary, /Audio/);
    assert.match(c.evidenceBoundary, /Transkript/);
  }
  for (const c of competencies.filter((c) => slug(c) === "lesbare-handschrift" && c.delivery === "speak")) assert.fail(c.id);
  for (const key of ["winkel-messen-und-zeichnen", "koordinaten-in-vier-quadranten", "koerper-und-netze-erkennen", "daten-und-darstellungen-vergleichen"]) {
    assert.ok(competencies.filter((c) => slug(c) === key).every((c) => c.delivery === "visual"), key);
  }
});

test("building a reordered catalogue is stable, does not mutate parents and excludes years7–10", () => {
  const before = JSON.stringify(topics);
  const a = build(); const b = build([...topics].reverse());
  assert.deepEqual([...a.competencies].sort((x, y) => x.id.localeCompare(y.id)), [...b.competencies].sort((x, y) => x.id.localeCompare(y.id)));
  assert.equal(JSON.stringify(topics), before);
  assert.ok(a.competencies.every((c) => [5, 6].includes(c.grade) && c.track === "R"));
});

test('expansion starts with the actual whole-fraction action; help removes the denominator coordination',()=>{
 const c=build().competencies.find(c=>c.didacticFamily==='expand');
 assert.match(c.learningPlan.levels[0],/Zähler und Nenner/);
 assert.match(c.learningPlan.levels[0],/angeben/);
 assert.match(c.learningPlan.help[0],/Nur die Zähler/);
 assert.doesNotMatch(c.learningPlan.help[0],/Faktor.*selbst/);
});
