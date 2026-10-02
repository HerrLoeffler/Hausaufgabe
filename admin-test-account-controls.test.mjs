import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./admin-test-account-controls.mjs", import.meta.url), "utf8");
const bootstrap = fs.readFileSync(new URL("./admin-test-account-bootstrap.mjs", import.meta.url), "utf8");
const visual = fs.readFileSync(new URL("./visual-enhancements.js", import.meta.url), "utf8");
const build = fs.readFileSync(new URL("./tools/build-staging.mjs", import.meta.url), "utf8");

test("admin test-account controls are wired into the staging UI through an auth-ready bootstrap", () => {
  assert.match(visual, /admin-test-account-bootstrap\.mjs\?v=2/);
  assert.doesNotMatch(visual, /Admin-Testkonten[^\n]*admin-test-account-controls\.mjs/);
  assert.match(build, /'admin-test-account-bootstrap\.mjs'/);
  assert.match(build, /'admin-test-account-controls\.mjs'/);
});

test("bootstrap waits for Firebase auth instead of giving up during startup", () => {
  assert.match(bootstrap, /onAuthStateChanged/);
  assert.match(bootstrap, /if \(auth\.currentUser\)/);
  assert.match(bootstrap, /if \(user\) void loadAdminControls\(\)/);
  assert.match(bootstrap, /admin-test-account-controls\.mjs\?v=2/);
});

test("role and test-account controls are admin-gated", () => {
  assert.match(source, /snap\.data\(\)\?\.role === "admin"/);
  assert.match(source, /gcAdminRoleSelect/);
  assert.match(source, /isTestAccount/);
  assert.match(source, /Als Testkonto markieren/);
});

test("archive is reversible and suspends login instead of deleting data", () => {
  assert.match(source, /isTestAccountArchived/);
  assert.match(source, /status: nextArchived \? "suspended" : "active"/);
  assert.match(source, /Testkonto wieder aktivieren/);
  assert.doesNotMatch(source, /deleteUser|deleteDoc|recursiveDelete/);
});

test("admins cannot accidentally mark an admin as a test account through the UI", () => {
  assert.match(source, /id="gcToggleTestAccount" \$\{isAdmin \|\| isArchived \? "disabled" : ""\}/);
  assert.match(source, /Ein Testkonto kann nicht gleichzeitig Admin sein/);
});

test("detail controls render idempotently to avoid mutation-observer loops", () => {
  assert.match(source, /dataset\.signature === signature/);
  assert.match(source, /existing\?\.remove\(\)/);
});
