"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { preparePedagogicalPool } = require("../lib/pedagogical-pool");
const catalog = require("../data/pedagogical-pool.json");

test("the shipped catalog supplies real matching mathematics, text and listening profiles", () => {
  for (const input of [
    { subject: "Mathematik", grade: "9", topic: "Prozentrechnung und Zinsen", allowedTypes: ["number"] },
    { subject: "Deutsch", grade: "6", topic: "E-Mail schreiben", allowedTypes: ["text"] },
    { subject: "Deutsch", grade: "9", topic: "Hörverstehen Praktikum", allowedTypes: ["single"], audioQuestionCount: 1 },
    { subject: "DaZ", grade: "9", topic: "Grammatik Konjunktionen und Satzbau", allowedTypes: ["gapfill"] }
  ]) {
    const result = preparePedagogicalPool({ schoolType: "Mittelschule", region: "Bayern", ...input });
    assert.equal(result.meta.status, "used", JSON.stringify(input));
    assert.ok(result.meta.profileCount > 0);
  }
  assert.equal(preparePedagogicalPool({ subject: "Deutsch", schoolType: "Grundschule", region: "Bayern", grade: "4", topic: "Nomen", allowedTypes: ["matching"] }).prompt, "");
});

test("published profiles carry review and source evidence without original assets or bibliographic fields", () => {
  assert.ok(catalog.profiles.length > 0);
  assert.equal(new Set(catalog.profiles.map(p => p.id)).size, catalog.profiles.length);
  const fields = ["id", "reviewStatus", "mappingStatus", "subject", "schoolType", "region", "grades", "topics", "learningGoal", "taskPattern", "qualityHints", "modalities", "source", "supportedTypes"].sort();
  for (const p of catalog.profiles) {
    assert.deepEqual(Object.keys(p).sort(), fields);
    assert.equal(p.reviewStatus, "verified");
    assert.equal(p.mappingStatus, "confirmed");
    assert.match(p.source.contentId, /^[a-f0-9]{16}$/);
    assert.ok(p.source.page >= 1);
    assert.ok(p.supportedTypes.length > 0);
    assert.doesNotMatch(JSON.stringify(p), /data:(?:audio|image)|\/Users\/|\.pdf|\.mp3|\.zip|ISBN|Lizenzcode/);
  }
});
