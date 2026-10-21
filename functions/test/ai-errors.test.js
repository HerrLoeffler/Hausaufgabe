"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyAiFailure } = require("../lib/ai-errors");

test("model rate limits and unavailable models do not become INTERNAL", () => {
  assert.equal(classifyAiFailure({ status: 429 }).code, "resource-exhausted");
  assert.equal(classifyAiFailure({ status: 403 }).code, "unavailable");
  assert.equal(classifyAiFailure({ status: 400 }).code, "failed-precondition");
  assert.equal(classifyAiFailure(new SyntaxError("Invalid JSON")).code, "unavailable");
});
