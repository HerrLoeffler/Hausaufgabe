"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { aiBetaAllowed } = require("../lib/access");

test("admins have AI access", () => {
  assert.equal(aiBetaAllowed({ role: "admin" }), true);
});

test("all teachers have AI access without a beta flag", () => {
  assert.equal(aiBetaAllowed({ role: "teacher", aiBetaEnabled: true }), true);
  assert.equal(aiBetaAllowed({ role: "teacher", aiBetaEnabled: false }), true);
  assert.equal(aiBetaAllowed({ role: "teacher" }), true);
});

test("unknown roles do not get AI access", () => {
  assert.equal(aiBetaAllowed({ role: "student", aiBetaEnabled: true }), false);
  assert.equal(aiBetaAllowed({}), false);
});
