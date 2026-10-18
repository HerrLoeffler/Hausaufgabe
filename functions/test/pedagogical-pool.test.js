"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { preparePedagogicalPool } = require("../lib/pedagogical-pool");

const input = { subject: "Deutsch", grade: "9", schoolType: "Mittelschule", region: "Bayern", topic: "Hörverstehen: Praktikum", audioQuestionCount: 2, materialMode: "inspiration" };
const profile = { id: "pp-1234567890abcdef", reviewStatus: "verified", mappingStatus: "confirmed", subject: "Deutsch", schoolType: "Mittelschule", region: "Bayern", grades: [9], topics: ["hörverstehen", "praktikum"], learningGoal: "Informationen gezielt entnehmen.", taskPattern: "Neue kurze Nachricht mit unterscheidbaren Angaben erstellen.", qualityHints: ["Die Lösung muss aus dem Hörtext folgen."], modalities: ["audio"], source: { contentId: "1234567890abcdef", page: 2 } };
const catalog = { version: "test-v1", profiles: [profile] };

test("matching verified profiles are projected into bounded generation context", () => {
  const result = preparePedagogicalPool(input, catalog);
  assert.deepEqual(result.meta.profileIds, ["pp-1234567890abcdef"]);
  assert.equal(result.meta.status, "used");
  assert.match(result.prompt, /Informationen gezielt entnehmen/);
  assert.match(result.prompt, /neue/i);
});

test("different subject, grade, school or region cannot use a profile", () => {
  for (const change of [{ subject: "Mathematik" }, { grade: "6" }, { schoolType: "Gymnasium" }, { region: "Berlin" }]) {
    const result = preparePedagogicalPool({ ...input, ...change }, catalog);
    assert.equal(result.prompt, "");
    assert.equal(result.meta.profileCount, 0);
  }
});

test("unreviewed, ambiguous and provisionally mapped records stay out", () => {
  for (const change of [{ reviewStatus: "candidate" }, { reviewStatus: "verified_with_issue" }, { mappingStatus: "provisional" }, { grades: [9, "unknown"] }, { source: { contentId: "../secret", page: 2 } }]) {
    assert.equal(preparePedagogicalPool(input, { ...catalog, profiles: [{ ...profile, ...change }] }).prompt, "");
  }
});

test("unrelated topic produces the ordinary no-match path", () => {
  const result = preparePedagogicalPool({ ...input, topic: "Grammatik: Adjektive", notes: "" }, catalog);
  assert.equal(result.prompt, "");
  assert.equal(result.meta.status, "no_match");
});

test("school and grade normalization accepts labels but not ambiguous year ranges", () => {
  assert.equal(preparePedagogicalPool({ ...input, schoolType: " mittelschule ", grade: "Klasse 9" }, catalog).meta.profileCount, 1);
  assert.equal(preparePedagogicalPool({ ...input, grade: "9. Klasse" }, catalog).meta.profileCount, 1);
  for (const grade of ["9/10", "9 und 10", "neun", "", "19", "9xyz"]) {
    assert.equal(preparePedagogicalPool({ ...input, grade }, catalog).prompt, "");
  }
});

test("DaZ aliases normalize without silently mixing ordinary Deutsch", () => {
  const daz = { ...profile, subject: "Deutsch als Zweitsprache" };
  assert.equal(preparePedagogicalPool({ ...input, subject: "DaZ" }, { ...catalog, profiles: [daz] }).meta.profileCount, 1);
  assert.equal(preparePedagogicalPool(input, { ...catalog, profiles: [daz] }).meta.profileCount, 0);
});

test("teacher material-only and source-test requests keep their existing content boundary", () => {
  assert.equal(preparePedagogicalPool({ ...input, materialMode: "only" }, catalog).prompt, "");
  assert.equal(preparePedagogicalPool({ ...input, sourceTest: { questions: [] } }, catalog).prompt, "");
});

test("audio patterns do not add listening content to a test without audio", () => {
  assert.equal(preparePedagogicalPool({ ...input, audioQuestionCount: 0 }, catalog).prompt, "");
  const text = { ...profile, modalities: ["text"] };
  assert.equal(preparePedagogicalPool({ ...input, audioQuestionCount: 0 }, { ...catalog, profiles: [text] }).meta.profileCount, 1);
});

test("a writing profile cannot influence an exclusively numeric test", () => {
  const writing = { ...profile, modalities: ["text"], supportedTypes: ["text"] };
  assert.equal(preparePedagogicalPool({ ...input, allowedTypes: ["number"] }, { ...catalog, profiles: [writing] }).prompt, "");
  assert.equal(preparePedagogicalPool({ ...input, allowedTypes: ["text"] }, { ...catalog, profiles: [writing] }).meta.profileCount, 1);
});

test("budget caps, duplicate IDs and topic ranking keep context small and relevant", () => {
  const many = Array.from({ length: 30 }, (_, i) => ({ ...profile, id: `pp-${String(i).padStart(16, "0")}`, taskPattern: "Neues Beispiel mit klarer Lösung. ".repeat(100) }));
  many.unshift({ ...profile, id: "pp-ffffffffffffffff", topics: ["hörverstehen", "praktikum", "beruf"] });
  many.push(many[0]);
  const result = preparePedagogicalPool({ ...input, topic: "Hörverstehen Praktikum Beruf" }, { ...catalog, profiles: many });
  assert.equal(result.meta.profileIds[0], "pp-ffffffffffffffff");
  assert.ok(result.meta.profileCount <= 6);
  assert.equal(new Set(result.meta.profileIds).size, result.meta.profileCount);
  assert.ok(result.prompt.length <= 6000);
});

test("metadata and prompt omit hidden source fields and do not reveal a stored answer", () => {
  const dirty = { ...profile, author: "PRIVATE-AUTHOR", rawText: "PRIVATE-ORIGINAL", answer: "PRIVATE-ANSWER", source: { ...profile.source, filePath: "/private/source.pdf" } };
  const result = preparePedagogicalPool(input, { ...catalog, profiles: [dirty] });
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE-|\/private\//);
  assert.deepEqual(Object.keys(result.meta).sort(), ["profileCount", "profileIds", "status", "version"]);
});

test("malformed catalog and missing context fail softly without blocking generation", () => {
  for (const broken of [null, {}, { version: "test", profiles: null }, { version: "test", profiles: [null, {}] }]) {
    const result = preparePedagogicalPool(input, broken);
    assert.equal(result.prompt, "");
    assert.equal(result.meta.profileCount, 0);
  }
  assert.equal(preparePedagogicalPool({}, catalog).prompt, "");
});
