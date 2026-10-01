"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const trackerModule = import("./teacher-active-time.mjs");

test("idle time is capped and not confused with active teacher work", async () => {
  const { createTeacherActiveTimeTracker } = await trackerModule;
  const tracker = createTeacherActiveTimeTracker({ idleAfterMs: 60_000, now: () => 0 });
  tracker.start(0);
  tracker.tick(30_000);
  tracker.tick(120_000);
  const result = tracker.finish(180_000);
  assert.equal(result.activeMs, 60_000);
  assert.equal(result.elapsedMs, 180_000);
  assert.equal(result.inactiveOrBackgroundMs, 120_000);
});

test("hidden time is excluded and returning to the editor begins a fresh active window", async () => {
  const { createTeacherActiveTimeTracker } = await trackerModule;
  const tracker = createTeacherActiveTimeTracker({ idleAfterMs: 60_000, now: () => 0 });
  tracker.start(0);
  tracker.setVisible(false, 10_000);
  tracker.setVisible(true, 70_000);
  tracker.tick(90_000);
  const result = tracker.finish(90_000);
  assert.equal(result.activeMs, 30_000);
  assert.equal(result.inactiveOrBackgroundMs, 60_000);
});

test("foreground AI waiting is measured separately and never counted as teacher active time", async () => {
  const { createTeacherActiveTimeTracker } = await trackerModule;
  const tracker = createTeacherActiveTimeTracker({ idleAfterMs: 60_000, now: () => 0 });
  tracker.start(0);
  tracker.setAiWaiting(true, 15_000);
  tracker.setAiWaiting(false, 55_000);
  tracker.tick(75_000);
  const result = tracker.finish(75_000);
  assert.equal(result.activeMs, 35_000);
  assert.equal(result.foregroundAiWaitMs, 40_000);
  assert.equal(result.inactiveOrBackgroundMs, 0);
});

test("non-monotonic timestamps fail instead of corrupting a duration", async () => {
  const { createTeacherActiveTimeTracker } = await trackerModule;
  const tracker = createTeacherActiveTimeTracker({ now: () => 0 });
  tracker.start(1000);
  assert.throws(() => tracker.tick(999), /monotonic/);
});
