"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { HttpsError } = require("firebase-functions/v2/https");
const { LIMITS } = require("../lib/constants");
const { cleanAudioScript, createAudioAsset } = require("../lib/audio-flow");

test("audio script is normalized and bounded", () => {
  assert.equal(cleanAudioScript("  Hallo   Welt.  "), "Hallo Welt.");
  assert.throws(() => cleanAudioScript(""), error => error instanceof HttpsError && error.code === "invalid-argument");
  assert.throws(() => cleanAudioScript("x".repeat(LIMITS.maxAudioScriptChars + 1)), error => error instanceof HttpsError);
});

test("audio generation records metadata but returns no transcript in asset", async () => {
  const calls = [];
  const result = await createAudioAsset(
    { uid: "u1", questionId: "q1", script: "Höre genau zu." },
    {
      consume: async (uid, kind) => calls.push(["quota", uid, kind]),
      synthesize: async ({ script, voice }) => {
        calls.push(["tts", script, voice]);
        return Buffer.alloc(120, 7);
      },
      record: async (uid, kind, usage, extra) => calls.push(["usage", uid, kind, extra.scriptChars, extra.audioBytes])
    }
  );
  assert.match(result.audioDataUrl, /^data:audio\/mpeg;base64,/);
  assert.equal(result.audioVoice, "marin");
  assert.equal(Object.hasOwn(result, "script"), false);
  assert.deepEqual(calls[0], ["quota", "u1", "audio"]);
  assert.equal(calls.at(-1)[1], "u1");
});

test("oversized generated audio is rejected before returning to Firestore", async () => {
  await assert.rejects(
    () => createAudioAsset(
      { uid: "u1", questionId: "q1", script: "Kurz." },
      {
        consume: async () => {},
        synthesize: async () => Buffer.alloc(LIMITS.maxAudioBytes + 1),
        record: async () => {}
      }
    ),
    error => error instanceof HttpsError && error.code === "failed-precondition"
  );
});
