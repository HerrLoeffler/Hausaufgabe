"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { cleanMetric, uidHash } = require("../lib/crew-telemetry");

test("Crew telemetry accepts only allowlisted technical metadata", () => {
  const clean = cleanMetric({
    event: "patch_applied",
    crewId: "remy",
    inputMode: "voice",
    source: "local",
    fields: ["topic", "notes", "evil", "topic"],
    parserVersion: "remy-structure-v2",
    latencyMs: 123.4,
    hasNotes: true,
    screen: "ai_create",
    text: "Darf niemals gespeichert werden",
    topic: "Prozentrechnung"
  });
  assert.equal(clean.event, "patch_applied");
  assert.equal(clean.inputMode, "voice");
  assert.equal(clean.source, "local");
  assert.deepEqual(clean.fields, ["topic", "notes"]);
  assert.equal(clean.latencyMs, 123);
  assert.equal(clean.hasNotes, true);
  assert.equal(Object.hasOwn(clean, "text"), false);
  assert.equal(Object.hasOwn(clean, "topic"), false);
});

test("field corrections store the field name, never old or new values", () => {
  const clean = cleanMetric({
    event: "field_corrected",
    correctedField: "topic",
    previousValue: "Prozent",
    nextValue: "Prozentrechnung"
  });
  assert.equal(clean.correctedField, "topic");
  assert.equal(Object.hasOwn(clean, "previousValue"), false);
  assert.equal(Object.hasOwn(clean, "nextValue"), false);
});

test("client cannot forge server-only AI completion events", () => {
  assert.throws(() => cleanMetric({ event: "ai_fallback_completed" }), /Unbekanntes Crew-Metrikereignis/);
  assert.equal(cleanMetric({ event: "ai_fallback_completed" }, { server: true }).event, "ai_fallback_completed");
});

test("user ids are pseudonymized deterministically for unique-user markers", () => {
  const a = uidHash("teacher-123");
  const b = uidHash("teacher-123");
  assert.equal(a, b);
  assert.equal(a.length, 32);
  assert.notEqual(a, "teacher-123");
});
