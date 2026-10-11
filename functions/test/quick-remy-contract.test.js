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
  assert.deepEqual(normalizePrepareRequest({ requestId: "voice-123", conversationText: "  Mathe, Klasse 6: Brüche  ", knownFields: { subject: " Englisch ", grade: "4", unknown: "ignored" }, uid: "spoofed" }), {
    requestId: "voice-123",
    conversationText: "Mathe, Klasse 6: Brüche",
    knownFields: { subject: "Englisch", grade: "4" }
  });
  assert.throws(() => normalizePrepareRequest({ requestId: "voice/123", conversationText: "Thema" }), { code: "invalid-argument" });
  assert.throws(() => normalizePrepareRequest({ requestId: "voice-123", conversationText: "Thema", knownFields: { count: 101 } }), { code: "invalid-argument" });
  assert.throws(() => normalizePrepareRequest({ requestId: "voice-123", conversationText: "x".repeat(2501) }), { code: "invalid-argument" });
});

test("prepare result asks only for genuinely missing required values and uses explicit defaults", () => {
  assert.deepEqual(buildPrepareResult({ subject: null, grade: null, topic: null }, { subject: "Mathematik", grade: "6" }), {
    status: "needsInfo", missingFields: ["topic", "count"], question: "Welches Thema und wie viele Aufgaben soll ich verwenden?",
    draft: { subject: "Mathematik", grade: "6", topic: "", count: null }
  });
  assert.deepEqual(buildPrepareResult({ subject: "Deutsch", grade: null, topic: "Märchen", count: null }, {}), {
    status: "needsInfo", missingFields: ["grade", "count"], question: "Welche Klasse und wie viele Aufgaben soll ich verwenden?",
    draft: { subject: "Deutsch", grade: "", topic: "Märchen", count: null }
  });
  assert.match(buildPrepareResult({ subject: null, grade: null, topic: "Brüche" }, {}).question, /^Welches Fach, welche Klasse und wie viele Aufgaben/);
  assert.match(buildPrepareResult({ subject: null, grade: null, topic: null }, {}).question, /Fach, welche Klasse, welches Thema und wie viele Aufgaben/);
  assert.deepEqual(buildPrepareResult({ subject: "Ma", grade: "6", topic: "Brüche", count: null }, {}), {
    status: "needsInfo", missingFields: ["count"], question: "Wie viele Aufgaben soll ich erstellen?",
    draft: { subject: "Ma", grade: "6", topic: "Brüche", count: null }
  });
  assert.equal(buildPrepareResult({ subject: "Ma", grade: "6", topic: "Brüche", count: null }, { count: 12 }).preparedRequest.count, 12);
});

test("prepare results accept every missing required field and preserve partial drafts", () => {
  assert.deepEqual(normalizePrepareResult({ status: "needsInfo", missingFields: ["subject", "grade"], question: "Welches Fach und welche Klasse?", draft: { subject: "Englisch", grade: "", topic: "Farben", count: null } }), {
    status: "needsInfo", missingFields: ["subject", "grade"], question: "Welches Fach und welche Klasse?", draft: { subject: "Englisch", grade: "", topic: "Farben", count: null }
  });
  assert.deepEqual(normalizePrepareResult({ status: "needsInfo", missingFields: ["subject", "grade", "topic", "count"], question: "Bitte ergänzen." }), {
    status: "needsInfo", missingFields: ["subject", "grade", "topic", "count"], question: "Bitte ergänzen.",
    draft: { subject: "", grade: "", topic: "", count: null }
  });
  assert.throws(() => normalizePrepareResult({ status: "needsInfo", missingFields: ["uid"], question: "Wer bist du?" }), { code: "invalid-argument" });
});

test("prepare asks for all four fields when no safe defaults or details are present", () => {
  assert.deepEqual(buildPrepareResult({}, {}), {
    status: "needsInfo",
    missingFields: ["subject", "grade", "topic", "count"],
    question: "Welches Fach, welche Klasse, welches Thema und wie viele Aufgaben soll ich verwenden?",
    draft: { subject: "", grade: "", topic: "", count: null }
  });
});

test("a count-only follow-up retains the original English grade and topic in the ready draft", () => {
  const original = { subject: "Englisch", grade: "4", topic: "Farben und Schulsachen", count: null };
  const followUp = buildPrepareResult({ subject: null, grade: null, topic: null, count: 5 }, {}, original);
  assert.deepEqual(followUp, {
    status: "ready",
    preparedRequest: { subject: "Englisch", grade: "4", topic: "Farben und Schulsachen", count: 5 },
    draft: { subject: "Englisch", grade: "4", topic: "Farben und Schulsachen", count: 5 }
  });
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
