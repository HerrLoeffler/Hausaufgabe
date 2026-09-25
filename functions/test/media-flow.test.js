"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { IMAGE_MODEL, TEXT_MODEL } = require("../lib/constants");
const { createVerifiedMedia } = require("../lib/media-flow");
const { recordUsage } = require("../lib/usage");

test("a generated image reaches the teacher after image and review accounting", async () => {
  const calls = [];
  const result = await createVerifiedMedia({
    uid: "teacher", questionId: "q1", prompt: "Ein Buch auf einem Tisch", expectedScene: "Ein Buch auf einem Tisch", altText: "Buch", maxBytes: 95000
  }, {
    consume: async (...args) => calls.push(["quota", ...args]),
    generate: async args => { calls.push(["generate", args.prompt]); return { imageDataUrl: "data:image/webp;base64,dGVzdA==" }; },
    inspect: async () => ({ verdict: { matches: true, reason: "" }, usage: { input_tokens: 7 } }),
    record: async (_uid, kind, _usage, extra) => calls.push(["usage", kind, extra.model])
  });
  assert.equal(result.asset.imageDataUrl, "data:image/webp;base64,dGVzdA==");
  assert.deepEqual(calls, [
    ["quota", "teacher", "image"],
    ["generate", "Ein Buch auf einem Tisch"],
    ["usage", "image", IMAGE_MODEL],
    ["usage", "image_review", TEXT_MODEL]
  ]);
});

test("a failed usage write does not discard a paid-for image", async () => {
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args);
  try {
    const result = await createVerifiedMedia({ uid: "teacher", questionId: "q2", prompt: "Buch", expectedScene: "", altText: "", maxBytes: 95000 }, {
      consume: async () => {},
      generate: async () => ({ imageDataUrl: "generated" }),
      record: (...args) => recordUsage(...args, async () => { throw Object.assign(new Error("Firestore unavailable"), { code: "unavailable" }); })
    });
    assert.equal(result.asset.imageDataUrl, "generated");
    assert.equal(errors.length, 1);
    assert.equal(errors[0][1].kind, "image");
  } finally {
    console.error = original;
  }
});
