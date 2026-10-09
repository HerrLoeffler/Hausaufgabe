import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("secure-assessment-teacher-polish.js", "utf8");
const startup = fs.readFileSync("startup.js", "utf8");

test("teacher setting states that solutions are released only after test end", () => {
  assert.match(source, /quizShowSolutions/);
  assert.match(source, /Richtige Lösungen nach Testende anzeigen/);
  assert.match(source, /erst freigegeben, wenn du den Test beendest/);
  assert.match(source, /nicht unverändert mit einer weiteren Gruppe verwenden/);
});

test("active published editor becomes read-only until teacher ends test", () => {
  assert.match(source, /endQuizBtn/);
  assert.match(source, /layout\.inert = locked/);
  assert.match(source, /saveButton\.disabled = true/);
  assert.match(source, /Veröffentlichter Test ist geschützt/);
  assert.match(source, /Beende den Test zuerst/);
});

test("dashboard publish switch stays operable and directs users to the safe end action", () => {
  const start = source.indexOf("function patchDashboardPublishToggles()");
  const end = source.indexOf("function patchAll()", start);
  const toggle = { checked: true, disabled: false, dataset: {}, setAttribute(name, value) { this[name] = value; } };
  const context = { document: { querySelectorAll: () => [toggle] }, Object };
  vm.runInNewContext(source.slice(start, end), context);
  context.patchDashboardPublishToggles();
  assert.equal(toggle.disabled, false);
  assert.match(toggle.title, /beendet den Test sicher/);
  assert.match(toggle["aria-label"], /Ausschalten/);
  assert.match(fs.readFileSync("app.js", "utf8"), /if \(action === "end"\)[\s\S]*?return endQuiz\(q\.id\)/);
});

test("secure teacher policy is loaded only on the normal teacher app path", () => {
  const redirectIndex = startup.indexOf("location.replace(target.href)");
  const importIndex = startup.indexOf("secure-assessment-teacher-polish.js");
  assert.ok(redirectIndex >= 0 && importIndex > redirectIndex);
  assert.match(startup, /if \(publicTestCode && !teacherPreview\)/);
});
