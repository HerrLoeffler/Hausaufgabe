"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeRightsReport } = require("../lib/rights-report");

test("a public rights notice needs enough information to review and match its quiz", () => {
  const input = { target: "https://example.org/?test=ABCD2345", work: "Arbeitsblatt", email: " TEST@EXAMPLE.ORG ", explanation: "Ich vertrete den Rechteinhaber und beanstande die veröffentlichte Aufgabe." };
  const report = normalizeRightsReport(input);
  assert.equal(report.testCode, "ABCD2345");
  assert.equal(report.email, "test@example.org");
  assert.throws(() => normalizeRightsReport({ ...input, explanation: "" }), /Bitte Testcode/);
  assert.throws(() => normalizeRightsReport({ ...input, email: "ungültig" }), /Bitte Testcode/);
  assert.throws(() => normalizeRightsReport(null), /Bitte Testcode/);
});
