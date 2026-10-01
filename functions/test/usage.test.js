"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { RETENTION } = require("../lib/constants");
const { monthKey, safeKind, expiryTimestamp, usageNumbers, recordUsage } = require("../lib/usage");

test("usage rollup keys stay compact and deterministic", () => {
  assert.equal(monthKey(new Date("2026-10-02T12:34:00Z")), "2026-10");
  assert.equal(safeKind("image_review"), "image_review");
  assert.equal(safeKind(" Strange Kind! "), "-strange-kind-");
});

test("raw AI events receive the configured bounded retention horizon", () => {
  const now = Date.parse("2026-10-02T00:00:00Z");
  assert.equal(
    expiryTimestamp(RETENTION.aiEventDays, now).toMillis(),
    now + RETENTION.aiEventDays * 24 * 60 * 60 * 1000
  );
});

test("token usage is normalized to non-negative numbers", () => {
  assert.deepEqual(usageNumbers({ input_tokens: "12", output_tokens: -3, total_tokens: 14 }), {
    inputTokens: 12,
    outputTokens: 0,
    totalTokens: 14
  });
});

test("telemetry persistence failure never discards an already paid-for response", async () => {
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args);
  try {
    const ok = await recordUsage("teacher", "test", { total_tokens: 10 }, {}, async () => {
      throw Object.assign(new Error("offline"), { code: "unavailable" });
    });
    assert.equal(ok, false);
    assert.equal(errors.length, 1);
  } finally {
    console.error = original;
  }
});
