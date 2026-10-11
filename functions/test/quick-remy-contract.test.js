"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizePrepareRequest,
  normalizePrepareResult,
  buildPrepareResult,
  normalizeSubmitRequest
} = require("../lib/quick-remy-contract");

test("prepare request trims text, bounds length, and ignores client ownership fields", () => {
  assert.deepEqual(normalizePrepareRequest({ requestId: "voice-123", conversationText: "  Mathe, Klasse 6: Brüche  ", uid: "spoofed" }), {
    requestId: "voice-123",
    conversationText: "Mathe, Klasse 6: Brüche"
  });
  assert.throws(() => normalizePrepareRequest({ requestId: "voice/123", conversationText: "Thema" }), { code: "invalid-argument" });
  assert.throws(() => normalizePrepareRequest({ requestId: "voice-123", conversationText: "x".repeat(2501) }), { code: "invalid-argument" });
});

test("prepare result asks only for genuinely missing required values and uses explicit defaults", () => {
  assert.deepEqual(buildPrepareResult({ subject: null, grade: null, topic: null }, { subject: "Mathematik", grade: "6" }), {
    status: "needsInfo", missingFields: ["topic", "count"], question: "Welches Thema und wie viele Aufgaben soll ich verwenden?"
  });
  assert.deepEqual(buildPrepareResult({ subject: "Deutsch", grade: null, topic: "Märchen", count: null }, {}), {
    status: "needsInfo", missingFields: ["grade", "count"], question: "Welche Klasse und wie viele Aufgaben soll ich verwenden?"
  });
  assert.match(buildPrepareResult({ subject: null, grade: null, topic: "Brüche" }, {}).question, /^Welches Fach, welche Klasse und wie viele Aufgaben/);
  assert.match(buildPrepareResult({ subject: null, grade: null, topic: null }, {}).question, /Fach, welche Klasse und welches Thema/);
  assert.deepEqual(buildPrepareResult({ subject: "Ma", grade: "6", topic: "Brüche", count: null }, {}), {
    status: "needsInfo", missingFields: ["count"], question: "Wie viele Aufgaben soll ich erstellen?"
  });
  assert.equal(buildPrepareResult({ subject: "Ma", grade: "6", topic: "Brüche", count: null }, { count: 12 }).preparedRequest.count, 12);
});

test("prepare results accept at most three known required fields and bounded questions", () => {
  assert.deepEqual(normalizePrepareResult({ status: "needsInfo", missingFields: ["subject", "grade"], question: "Welches Fach und welche Klasse?" }), {
    status: "needsInfo", missingFields: ["subject", "grade"], question: "Welches Fach und welche Klasse?"
  });
  assert.throws(() => normalizePrepareResult({ status: "needsInfo", missingFields: ["topic", "subject", "grade", "count"], question: "Bitte ergänzen." }), { code: "invalid-argument" });
  assert.throws(() => normalizePrepareResult({ status: "needsInfo", missingFields: ["uid"], question: "Wer bist du?" }), { code: "invalid-argument" });
});

test("submit request contains validated job inputs and never an owner UID", () => {
  assert.deepEqual(normalizeSubmitRequest({
    requestId: "voice-123",
    preparedRequest: { subject: "Mathematik", grade: "6", topic: "Brüche", count: 10, uid: "spoofed" }
  }), {
    requestId: "voice-123",
    preparedRequest: { subject: "Mathematik", grade: "6", topic: "Brüche", count: 10 }
  });
  assert.throws(() => normalizeSubmitRequest({ requestId: "voice-123", preparedRequest: { subject: "Mathematik", grade: "6", topic: "" } }), { code: "invalid-argument" });
  assert.throws(() => normalizeSubmitRequest({ requestId: "voice-123", preparedRequest: { subject: "Mathematik", grade: "6", topic: "Brüche", count: "10" } }), { code: "invalid-argument" });
});
