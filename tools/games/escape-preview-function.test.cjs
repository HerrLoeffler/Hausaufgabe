const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '../..');

async function moduleUnderTest() {
  return import(pathToFileURL(path.join(root, 'tools', 'build-escape-preview-function.mjs')).href + `?t=${Date.now()}`);
}

test('preview function patch reuses GradeCrew generation and hard-limits the public staging surface', async () => {
  const { patchFunctionsIndex } = await moduleUnderTest();
  const source = [
    'const { onCall, HttpsError } = require("firebase-functions/v2/https");',
    'async function generateTestForUser(uid, data) { return { uid, data }; }',
    'function reportAiError(error) { return error; }',
    'function aiJobLock(uid) { return uid; }'
  ].join('\n');
  const patched = patchFunctionsIndex(source);
  assert.match(patched, /onCall, onRequest, HttpsError/);
  assert.match(patched, /exports\.generateEscapePreview = onRequest/);
  assert.match(patched, /generateTestForUser\("escape-preview-staging", payload\)/);
  assert.match(patched, /count: 16/);
  assert.match(patched, /imageQuestionCount: 0/);
  assert.match(patched, /ESCAPE_PREVIEW_GLOBAL_DAILY_LIMIT = 30/);
  assert.match(patched, /ESCAPE_PREVIEW_SOURCE_DAILY_LIMIT = 10/);
  assert.match(patched, /ESCAPE_PREVIEW_SOURCE_MINUTE_LIMIT = 2/);
  assert.match(patched, /hausaufgabe-staging--gradecrew-escape-dev-/);
  assert.doesNotMatch(patched, /OPENAI_API_KEY\.value\(\)/);
});

test('real GradeCrew function source has stable patch markers', async () => {
  const { patchFunctionsIndex } = await moduleUnderTest();
  const source = fs.readFileSync(path.join(root, 'functions', 'index.js'), 'utf8');
  const patched = patchFunctionsIndex(source);
  assert.match(patched, /exports\.generateTest = onCall/);
  assert.match(patched, /exports\.generateEscapePreview = onRequest/);
  assert.match(patched, /const OPENAI_API_KEY = defineSecret\("OPENAI_API_KEY"\)/);
});
