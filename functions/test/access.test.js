"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { aiBetaAllowed } = require("../lib/access");

test("admins always have AI beta access", () => {
  assert.equal(aiBetaAllowed({ role: "admin" }), true);
});

test("teachers need explicit AI beta flag", () => {
  assert.equal(aiBetaAllowed({ role: "teacher", aiBetaEnabled: true }), true);
  assert.equal(aiBetaAllowed({ role: "teacher", aiBetaEnabled: false }), false);
  assert.equal(aiBetaAllowed({ role: "teacher" }), false);
});

test("unknown roles do not get AI beta access", () => {
  assert.equal(aiBetaAllowed({ role: "student", aiBetaEnabled: true }), false);
  assert.equal(aiBetaAllowed({}), false);
});
