import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const startup = fs.readFileSync("startup.js", "utf8");

test("normal public test link is handed to secure student page before app.js loads", () => {
  const redirect = startup.indexOf('new URL("./secure-student.html"');
  const appImport = startup.indexOf('await import("./app.js');
  assert.ok(redirect >= 0);
  assert.ok(appImport > redirect);
  assert.match(startup, /publicTestCode && !teacherPreview/);
  assert.match(startup, /location\.replace\(target\.href\)/);
});

test("teacher preview remains inside the existing author application", () => {
  assert.match(startup, /routeParams\.get\("preview"\) === "1"/);
  assert.match(startup, /if \(publicTestCode && !teacherPreview\)/);
  assert.match(startup, /else \{[\s\S]*await import\("\.\/app\.js/);
});
