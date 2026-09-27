"use strict";
const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");

const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");

test("first test guide drives the real AI creation path", () => {
  for (const marker of [
    'renderFirstAiGuideStep("new")',
    'renderFirstAiGuideStep("ai")',
    'renderFirstAiGuideStep("details")',
    'renderFirstAiGuideStep("generate")',
    'renderFirstAiGuideStep("running")',
    '$("newQuizBtn")',
    '$("createAiBtn")',
    '$("generateAiTestBtn")'
  ]) assert.ok(app.includes(marker), marker);
});

test("guide only completes after an AI background job was confirmed", () => {
  const confirmed = app.indexOf('if (!response?.jobId) throw new Error("Der Hintergrundauftrag wurde nicht bestätigt.")');
  const done = app.indexOf('if (guidedFirstTest) markFirstAiGuideDone();');
  assert.ok(confirmed >= 0 && done > confirmed);
});

test("guide contains cost warning and visible spotlight styling", () => {
  assert.match(app, /Jede KI-Generierung verursacht Kosten/);
  assert.match(css, /\.firstAiGuideSpotlight\{/);
  assert.match(css, /\.firstAiGuideBackdrop\{/);
});
