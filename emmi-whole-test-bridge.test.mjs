import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const app = fs.readFileSync("app.js", "utf8");
const client = fs.readFileSync("ai-client.js", "utf8");
const visual = fs.readFileSync("visual-enhancements.js", "utf8");
const panel = fs.readFileSync("emmi-whole-test-revision.mjs", "utf8");

test("editor state exposes whole-test revision state and handlers", () => {
  assert.match(app, /emmiRevisionRunning:\s*false/);
  assert.match(app, /emmiRevisionUndo:\s*null/);
  assert.match(app, /function wholeTestRevisionFingerprint\(\)/);
  assert.match(app, /async function handleEmmiWholeTestRequest\(event\)/);
  assert.match(app, /gradecrew:emmi-whole-test-request/);
  assert.match(app, /gradecrew:emmi-whole-test-undo/);
});

test("editor applies one bundled backend call and keeps a whole-test undo snapshot", () => {
  assert.match(app, /await aiApi\.reviseWholeTest\(/);
  assert.match(app, /state\.emmiRevisionUndo\s*=\s*\{/);
  assert.match(app, /state\.questions\s*=\s*nextQuestions/);
  assert.match(app, /renderQuestions\(\);/);
  assert.match(app, /markDirty\(\);/);
});

test("client and visual loader expose Emmi in the editor surface", () => {
  assert.match(client, /reviseWholeTest:\s*call\("reviseWholeTest"/);
  assert.match(visual, /Emmi-Gesamttest/);
  assert.match(visual, /emmi-whole-test-revision\.mjs/);
  assert.match(panel, /Emmi hilft dir beim Überarbeiten\./);
  assert.match(panel, /Mit Emmi überarbeiten/);
  assert.match(panel, /Ganze Überarbeitung rückgängig/);
});

test("Emmi panel never auto-saves or auto-publishes", () => {
  assert.doesNotMatch(panel, /saveQuizBtn|publishBtn|saveCurrentQuiz|publishCurrentQuiz/);
  assert.match(panel, /Bitte prüfe den Test vor dem Speichern/i);
});
