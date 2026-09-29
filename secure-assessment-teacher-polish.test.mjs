import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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

test("dashboard cannot turn an active published test back into a draft", () => {
  assert.match(source, /function patchDashboardPublishToggles/);
  assert.match(source, /\.dashboardPublishToggle/);
  assert.match(source, /const activePublished = toggle\.checked === true/);
  assert.match(source, /toggle\.disabled = true/);
  assert.match(source, /über „Beenden“ geschlossen/);
});

test("secure teacher policy is loaded only on the normal teacher app path", () => {
  const redirectIndex = startup.indexOf("location.replace(target.href)");
  const importIndex = startup.indexOf("secure-assessment-teacher-polish.js");
  assert.ok(redirectIndex >= 0 && importIndex > redirectIndex);
  assert.match(startup, /if \(publicTestCode && !teacherPreview\)/);
});
