"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { questionSchemaForType } = require("../lib/schemas");

test("Freitext-Schema verlangt mindestens eine Musterlösung", () => {
  const schema = questionSchemaForType("text", { allowImages: false });
  assert.deepEqual(schema.required, ["type", "text", "points", "acceptedAnswers", "manualReview", "mediaIntent"]);
  assert.equal(schema.properties.acceptedAnswers.minItems, 1);
  assert.equal(schema.properties.acceptedAnswers.maxItems, 8);
  assert.equal(schema.properties.acceptedAnswers.items.pattern, "\\S");
});

test("manuelle Prüfung ersetzt die Musterlösung im Schema nicht", () => {
  const schema = questionSchemaForType("text");
  assert.equal(schema.properties.manualReview.type, "boolean");
  assert.equal(schema.properties.acceptedAnswers.minItems, 1);
});
