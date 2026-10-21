"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const testDirectory = path.dirname(module.filename);
const catalogPath = path.join(testDirectory, "../lib/learning-brain/catalog.js");
// These checks detect omitted source contexts, falsely certified content, broken
// prerequisite navigation, and a text-only substitution for oral assessment.
const sourceIds = ["BY-59e19c7b9df3", "BY-4419bfcf4cb3", "BY-22562f2e3b80", "BY-be53dd90c7b8", "BY-3a9dc43ec30c", "BY-b630dae33f32", "BY-2fd15684d59a", "BY-8f0c1e392b32", "BY-4fd8f18a1dc6", "BY-38ada466aa58", "BY-3dcd29f28ce3", "BY-ae8afea3657c", "BY-37af8b8c14a6", "BY-9845e2bae409", "BY-6db3f7dbf98c", "BY-e98cd916f02a", "BY-ae7a6aa84fde", "BY-e56feb597d1b"];
function api() {
  assert.ok(fs.existsSync(catalogPath), "The source-derived catalog API must exist");
  return require(catalogPath);
}

test("catalog offers all 12 subject-grade pairs and 18 distinct source contexts", () => {
  const c = api().getCatalog();
  assert.deepEqual(c.subjects.map((s) => s.id).sort(), ["german", "math"]);
  assert.equal(new Set(c.topics.map((t) => `${t.subject}:${t.grade}`)).size, 12);
  assert.equal(c.contexts.length, 18);
  assert.deepEqual([...new Set(c.topics.map((t) => t.source.id))].sort(), [...sourceIds].sort());
  for (const subject of ["math", "german"]) {
    for (let grade = 5; grade <= 10; grade++) {
      const tracks = c.contexts.filter((x) => x.subject === subject && x.grade === grade).map((x) => x.track).sort();
      assert.deepEqual(tracks, grade < 7 ? ["R"] : grade === 10 ? ["M"] : ["M", "R"]);
    }
  }
});

test("every topic has a stable source-qualified ID and resolves through getTopic", () => {
  const {getCatalog, getTopic} = api();
  const c = getCatalog();
  const ids = new Set(c.topics.map((t) => t.id));
  assert.equal(ids.size, c.topics.length);
  assert.ok(c.topics.length >= 250, "Fine goals must go beyond a broad menu of curriculum areas");
  for (const t of c.topics) {
    assert.ok(t.id.startsWith(`${t.source.id}:${t.subject}:${t.grade}:${t.track}:v1:`), t.id);
    for (const key of ["title", "area", "goal", "guidance"]) assert.ok(typeof t[key] === "string" && t[key].length > 8, `${t.id} ${key}`);
    assert.deepEqual(getTopic(t.id), t);
    assert.ok(["text", "audio", "speaking", "visual"].includes(t.modality));
    assert.equal(t.source.status, "volltext_extrahiert_inhaltliche_Pruefung_offen");
    assert.match(t.source.url, /^https:\/\/www\.lehrplanplus\.bayern\.de\/fachlehrplan\/mittelschule\//);
    assert.ok(t.source.anchor && t.source.sha256.length === 64);
    assert.ok(c.contexts.some((x) => x.subject === t.subject && x.grade === t.grade && x.track === t.track && x.sourceId === t.source.id));
    for (const prereq of t.prerequisites) {
      assert.ok(ids.has(prereq), `${t.id} -> missing ${prereq}`);
      assert.notEqual(prereq, t.id);
      const p = getTopic(prereq);
      assert.equal(p.subject, t.subject);
      assert.ok(p.grade <= t.grade);
      assert.ok(p.track === t.track || p.grade < 7, "No silent R/M prerequisite mixing");
    }
  }
  assert.equal(getTopic("unknown"), null);
  assert.equal(getTopic("__proto__"), null);
  assert.equal(getTopic(null), null);
});

test("all 105 source learning areas and 132 subareas are represented with traceable goals", () => {
  const c = api().getCatalog();
  assert.equal(c.provenance.sources.length, 18);
  assert.equal(c.provenance.sources.reduce((n, s) => n + s.learningAreas.length, 0), 105);
  assert.equal(c.provenance.sources.reduce((n, s) => n + s.subareas.length, 0), 132);
  for (const s of c.provenance.sources) {
    const topics = c.topics.filter((t) => t.source.id === s.id);
    for (const area of s.learningAreas) assert.ok(topics.some((t) => t.area === area), `${s.id}: ${area}`);
    for (const anchor of s.subareas) assert.ok(topics.some((t) => t.source.anchor === anchor), `${s.id}: ${anchor}`);
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    assert.ok(!visiting.has(id), `Prerequisite cycle: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const p of api().getTopic(id).prerequisites) visit(p);
    visiting.delete(id);
    visited.add(id);
  }
  c.topics.forEach((t) => visit(t.id));
});

test("oral and visual goals carry explicit medium requirements and no answer keys", () => {
  const c = api().getCatalog();
  for (const source of c.provenance.sources.filter((s) => s.subject === "german")) {
    const topics = c.topics.filter((t) => t.source.id === source.id);
    assert.ok(topics.some((t) => t.modality === "audio" && t.source.anchor.includes("1.1")));
    assert.ok(topics.some((t) => t.modality === "speaking" && t.source.anchor.includes("1.2")));
  }
  for (const t of c.topics) {
    if (["audio", "speaking"].includes(t.modality)) {
      assert.match(t.guidance, /nicht.*Text|Text.*nicht/);
      assert.equal(t.availability, "requires_media_adapter");
    }
    if (t.modality === "visual") assert.match(t.guidance, /Darstellung|Skala|Bild|Zeichnung|Layout/);
  }
  function inspect(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!/^(answer|answers|acceptedAnswers|answerKey|solution|solutions|privateRubric|privateRubrics|contextText|fulltext)$/i.test(key), key);
      inspect(child);
    }
  }
  inspect(c);
});

test("caller mutation cannot corrupt later catalog or topic reads", () => {
  const {getCatalog, getTopic} = api();
  const c = getCatalog();
  const id = c.topics[0].id;
  try { c.topics[0].title = "changed"; } catch (_) { /* Read-only values may throw. */ }
  try { c.topics.length = 0; } catch (_) { /* Read-only values may throw. */ }
  assert.notEqual(getTopic(id).title, "changed");
  assert.ok(getCatalog().topics.length >= 250);
});

const projectRoot = path.resolve(testDirectory, "../../../../..");
const auditFile = path.join(projectRoot, "work/GC-ADAPTIVE-PRACTICE-01-prototype/repo/docs/concepts/adaptive-practice-01-existing-foundation.json");
test("existing source bytes, hashes, all area and subarea headers match the independent audit", {skip: !fs.existsSync(auditFile) && "Original read-only source archive is not part of the deployable app checkout"}, () => {
  const c = api().getCatalog();
  const audit = JSON.parse(fs.readFileSync(auditFile, "utf8"));
  for (const s of audit.sources) {
    const bytes = fs.readFileSync(path.join(projectRoot, s.existingFile));
    const digest = crypto.createHash("sha256").update(bytes).digest("hex");
    assert.equal(digest, s.sha256);
    const manifest = c.provenance.sources.find((x) => x.id === s.sourceId);
    assert.equal(manifest.sha256, digest);
    assert.deepEqual(manifest.learningAreas, s.learningAreas);
    const text = bytes.toString("utf8");
    const headers = text.split(/\r?\n/).filter((line) => /^[DM]\d+ \d+\.\d+ /.test(line));
    assert.deepEqual(manifest.subareas, headers);
    for (const t of c.topics.filter((x) => x.source.id === s.sourceId)) {
      assert.ok(text.split(/\r?\n/).includes(t.source.anchor), t.source.anchor);
      assert.ok(!text.includes(t.goal), "Goals must be short original paraphrases rather than copied curriculum paragraphs");
    }
  }
});
