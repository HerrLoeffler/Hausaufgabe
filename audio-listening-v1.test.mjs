import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const client = fs.readFileSync("ai-client.js", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");
const secureRules = fs.readFileSync("firestore.secure-assessment.rules", "utf8");
const assessmentCore = fs.readFileSync("assessment-functions/lib/assessment-core.js", "utf8");

test("AI form and client expose listening-task generation", () => {
  assert.match(html, /id="aiAudioQuestionCount"[^>]*max="5"/);
  assert.match(client, /generateQuestionAudio: call\("generateQuestionAudio"/);
  assert.match(app, /audioQuestionCount/);
});

test("teacher transcript is stored in a private subcollection, never in the public saved question", () => {
  const sanitizeStart = app.indexOf("function sanitizeQuestionForSave");
  const sanitizeEnd = app.indexOf("async function saveCurrentQuiz", sanitizeStart);
  const sanitize = app.slice(sanitizeStart, sanitizeEnd);
  assert.match(sanitize, /audioDataUrl/);
  assert.doesNotMatch(sanitize, /base\.audioScript|audioScript\s*:/);
  assert.match(app, /"audioScripts", q\.id/);
  assert.match(rules, /match \/audioScripts\/\{questionId\}/);
  assert.match(secureRules, /match \/audioScripts\/\{questionId\}/);
});

test("publication is fail-closed while listening audio is stale", () => {
  assert.match(app, /state\.currentQuiz\.audioReady === false/);
  assert.match(app, /q\.audioNeedsRegeneration = true/);
  assert.match(app, /questionAudioReady/);
});

test("secure assessment sends audio but explicitly rejects transcript fields", () => {
  assert.match(assessmentCore, /function safeAudio/);
  assert.match(assessmentCore, /audio: safeAudio\(question\)/);
  assert.match(assessmentCore, /"audioScript", "transcript", "audioTranscript"/);
});

test("audio UI is teacher-reviewable and student playback never autostarts", () => {
  assert.match(app, /Hörtext <small>nur für Lehrkraft\/Admin/);
  assert.match(app, /Die erzeugte Stimme ist KI-generiert/);
  assert.match(app, /audio\.controls = true/);
  assert.doesNotMatch(app, /\.autoplay\s*=\s*true|autoplay=/);
});
