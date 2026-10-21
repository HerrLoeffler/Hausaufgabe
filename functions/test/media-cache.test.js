"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { imageCachePath } = require("../lib/media-cache");

const base = {
  uid: "teacher-123",
  prompt: "Ein Buch auf einem Tisch",
  expectedScene: "Ein Buch auf einem Tisch",
  questionText: "Welcher Gegenstand liegt auf dem Tisch?",
  altText: "Buch",
  maxBytes: 95000
};

test("verified image cache keys are stable but scoped to the teacher and exact task context", () => {
  const first = imageCachePath(base);
  const second = imageCachePath({ ...base });
  assert.equal(first, second);
  assert.match(first, /^aiGeneratedCache\/[a-f0-9]{24}\/[a-f0-9]{64}\.webp$/);
  assert.notEqual(first, imageCachePath({ ...base, uid: "teacher-456" }));
  assert.notEqual(first, imageCachePath({ ...base, questionText: "Wo liegt das Buch?" }));
  assert.notEqual(first, imageCachePath({ ...base, expectedScene: "Ein Buch unter einem Tisch" }));
});

test("image cache is disabled without an authenticated user scope", () => {
  assert.equal(imageCachePath({ ...base, uid: "" }), "");
});
