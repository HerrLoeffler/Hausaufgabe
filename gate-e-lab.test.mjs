import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./gate-e-lab.js", import.meta.url), "utf8");
const tour = fs.readFileSync(new URL("./gradecrew-tour-v8.js", import.meta.url), "utf8");
const build = fs.readFileSync(new URL("./tools/build-staging.mjs", import.meta.url), "utf8");

const expectedTypes = [
  "single", "multi", "text", "dropdown", "truefalse", "gapfill",
  "matching", "ordering", "grouping", "markwords", "number"
];

test("Gate E lab is staging-only and never targets production", () => {
  assert.match(source, /appEnvironment !== "staging"/);
  assert.match(source, /params\.get\("gateE"\) !== "1"/);
  assert.doesNotMatch(source, /hausaufgabe-40294/);
  assert.match(source, /Produktion wird nicht verwendet/);
});

test("Gate E lab creates one 11-type system test for 30 participants", () => {
  assert.match(source, /const PARTICIPANTS = 30/);
  assert.match(source, /questionCount: 11/);
  assert.match(source, /totalPoints: 11/);
  assert.match(source, /systemTestKind: "gate-e"/);
  for (const type of expectedTypes) assert.match(source, new RegExp(`type: "${type}"`));
});

test("Gate E lab exercises concurrency, polling, idempotency and solution protection", () => {
  assert.match(source, /Promise\.all\(students\.map/);
  assert.match(source, /POLL_ROUNDS = 3/);
  assert.match(source, /Doppelabgabe war nicht idempotent/);
  assert.match(source, /Lösung vor Testende ausgeliefert/);
  assert.match(source, /expected 11\/11|erwartete 11\/11/);
  assert.match(source, /maxPaperBytes/);
  assert.match(source, /p95/);
  assert.match(source, /p99/);
});

test("Gate E lab is reachable only through explicit staging debug URL and included in build", () => {
  assert.match(tour, /params|get\("gateE"\)|new URLSearchParams/);
  assert.match(tour, /import\("\.\/gate-e-lab\.js"\)/);
  assert.match(build, /'gate-e-lab\.js'/);
});
