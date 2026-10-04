"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const main = fs.readFileSync(require.resolve("../main.js"), "utf8");

test("private listening drafts are exposed only through authenticated owner/admin callables", () => {
  assert.match(main, /const getQuestionAudioDrafts = onCall/);
  assert.match(main, /const syncQuestionAudioDrafts = onCall/);
  assert.match(main, /requireAiUser\(request\)/);
  assert.match(main, /quiz\.ownerId !== uid/);
  assert.match(main, /profile\.role === "admin"/);
});

test("private draft writes are bounded and blocked during active published assessments", () => {
  assert.match(main, /value\.length > 100/);
  assert.match(main, /script\.length > 500/);
  assert.match(main, /quiz\.published === true && quiz\.ended !== true/);
  assert.match(main, /quiz\.rightsHold === true/);
});

test("server sync deletes private audio drafts only when neither listening nor solution content remains", () => {
  assert.match(main, /const ids = new Set\(\[\.\.\.existingById\.keys\(\), \.\.\.listening\.keys\(\), \.\.\.solutions\.keys\(\)\]\)/);
  assert.match(main, /if \(!script && !solutionScript\)/);
  assert.match(main, /if \(oldDoc\) batch\.delete\(ref\)/);
  assert.match(main, /batch\.set\(ref, patch, \{ merge: true \}\)/);
  assert.doesNotMatch(main, /console\.(?:log|warn|error)[^\n]*script/);
});
