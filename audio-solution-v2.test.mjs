import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const client = fs.readFileSync("ai-client.js", "utf8");
const main = fs.readFileSync("functions/main.js", "utf8");
const worker = fs.readFileSync("functions/index.js", "utf8");
const lifecycle = fs.readFileSync("assessment-functions/lib/secure-lifecycle.js", "utf8");
const solutionUi = fs.readFileSync("secure-solution-release.js", "utf8");

test("AI creation exposes exact 0-5 solution audio beside listening audio", () => {
  assert.match(html, /id="aiSolutionAudioQuestionCount"[^>]*max="5"/);
  assert.match(app, /solutionAudioQuestionCount/);
  assert.match(worker, /solutionAudioQuestionCount/);
  assert.match(worker, /planSolutionAudioIndexes/);
});

test("solution audio is private and never serialized into public question saves", () => {
  const start = app.indexOf("function sanitizeQuestionForSave");
  const end = app.indexOf("async function saveCurrentQuiz", start);
  const sanitize = app.slice(start, end);
  assert.doesNotMatch(sanitize, /solutionAudioDataUrl|solutionAudioScript/);
  assert.match(main, /solutionAudioDataUrl/);
  assert.match(main, /generateQuestionSolutionAudio/);
  assert.match(client, /generateQuestionSolutionAudio: call\("generateQuestionSolutionAudio"/);
});

test("stale solution audio is invalidated and publishing fails closed", () => {
  assert.match(main, /solutionNeedsRegeneration/);
  assert.match(main, /solutionDraft\.stale === true/);
  assert.match(app, /q\.solutionAudioNeedsRegeneration = true/);
  assert.match(app, /solutionAudioReady === false/);
});

test("secure assessment attaches solution audio only after the existing solution gate", () => {
  assert.match(lifecycle, /if \(!receipt\?\.solutionsReleased/);
  assert.match(lifecycle, /solutionNeedsRegeneration === true/);
  assert.match(lifecycle, /attachReleasedSolutionAudio\(quizId, receipt\)/);
  assert.match(solutionUi, /solution\.audio\?\.src/);
  assert.match(solutionUi, /audio\.controls = true/);
  assert.doesNotMatch(solutionUi, /\.autoplay\s*=\s*true|autoplay=/);
});

test("Remy can fill both listening and solution audio counts", () => {
  const core = fs.readFileSync("crew-assistant-core.mjs", "utf8");
  const remy = fs.readFileSync("remy-ai-help.js", "utf8");
  assert.match(core, /solutionAudioQuestionCount/);
  assert.match(remy, /#aiSolutionAudioQuestionCount/);
});
