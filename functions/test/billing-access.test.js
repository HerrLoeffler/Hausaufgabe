"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateAccess, trialForRegistration } = require("../lib/billing/domain/access");
const start = Date.UTC(2026, 0, 1);
const day = 86400000;
const person = { id: "teacher", role: "teacher", status: "active", emailVerified: true };
const trial = { trialStartedAtMs: start, trialEndsAtMs: start + 14 * day, createdCount: 0, reservedCount: 0 };
const scope = { kind: "personal", id: "teacher" };
const input = changes => ({ person, scope, at: start + day, account: trial, grants: [], memberships: [], periods: [], seats: [], ...changes });
test("Stripe grants use paid interval unions without bridging a future gap", () => {
  const grants = [{ id: "subscription", personId: "teacher", source: "stripe", scope, status: "active", paidPeriods: [{ startsAtMs: start, endsAtMs: start + 30 * day }, { startsAtMs: start + 40 * day, endsAtMs: start + 60 * day }] }];
  assert.equal(evaluateAccess(input({ grants })).validUntil, start + 30 * day);
  assert.equal(evaluateAccess(input({ grants, at: start + 30 * day })).tier, "free");
  assert.equal(evaluateAccess(input({ grants, at: start + 40 * day })).validUntil, start + 60 * day);
});
test("registration grants a fourteen-day trial without a subscription", () => {
  assert.deepEqual(trialForRegistration(start), { ...trial, version: 2 });
});
test("trial allows five new tests and editing", () => {
  const access = evaluateAccess(input());
  assert.equal(access.freeCreationsRemaining, 5);
  assert.equal(access.tier, "trial");
  assert.ok(access.featureCodes.includes("test.create"));
  assert.ok(access.featureCodes.includes("test.edit"));
});
test("five saved tests exhaust creations while edits and exports remain available", () => {
  const access = evaluateAccess(input({ account: { ...trial, createdCount: 5 } }));
  assert.equal(access.freeCreationsRemaining, 0);
  assert.equal(access.featureCodes.includes("test.create"), false);
  assert.ok(access.featureCodes.includes("test.edit"));
  assert.ok(access.featureCodes.includes("test.export"));
  assert.equal(access.reasonCode, "quota_exhausted");
});
test("pending reservation cannot overspend the last free creation", () => {
  const access = evaluateAccess(input({ account: { ...trial, createdCount: 4, reservedCount: 1 } }));
  assert.equal(access.featureCodes.includes("test.create"), false);
});
test("the exact end of day fourteen is read-only even with unused tests", () => {
  const access = evaluateAccess(input({ at: start + 14 * day }));
  assert.equal(access.tier, "free");
  assert.deepEqual(access.featureCodes, ["test.read", "test.export"]);
  assert.equal(access.reasonCode, "trial_ended");
});
test("editing does not renew an expired trial", () => {
  const access = evaluateAccess(input({ at: start + 90 * day, account: { ...trial, createdCount: 1 } }));
  assert.equal(access.featureCodes.includes("test.edit"), false);
  assert.equal(access.trialEndsAtMs, start + 14 * day);
});
test("a colleague grant works without any payment and survives trial expiry", () => {
  const grants = [{ id: "manual", source: "manual", scope, startsAtMs: start, endsAtMs: null, status: "active" }];
  const access = evaluateAccess(input({ at: start + 90 * day, grants }));
  assert.equal(access.tier, "complimentary");
  assert.ok(access.featureCodes.includes("test.create"));
  assert.equal(access.freeCreationsRemaining, 5);
});
test("paid periods are inclusive at start and exclusive at end", () => {
  const grants = [{ id: "paid", source: "stripe", scope, startsAtMs: start + day, endsAtMs: start + 30 * day, status: "active" }];
  assert.equal(evaluateAccess(input({ at: start, grants })).tier, "trial");
  assert.equal(evaluateAccess(input({ grants })).tier, "personal_premium");
  assert.equal(evaluateAccess(input({ at: start + 30 * day, grants })).tier, "free");
});
test("suspension, deletion and unverified email cannot be bypassed by a grant", () => {
  const grants = [{ id: "manual", source: "manual", scope, startsAtMs: start, endsAtMs: null, status: "active" }];
  for (const patch of [{ status: "suspended" }, { accountDeletionId: "op" }, { isTestAccountArchived: true }]) {
    assert.deepEqual(evaluateAccess(input({ person: { ...person, ...patch }, grants })).featureCodes, []);
  }
  assert.equal(evaluateAccess(input({ person: { ...person, emailVerified: false }, grants })).featureCodes.includes("test.create"), false);
});
test("school access requires its own membership, seat and paid period", () => {
  const schoolScope = { kind: "school", id: "school-a" };
  const membership = { personId: "teacher", schoolId: "school-a", status: "active", role: "teacher" };
  const seat = { personId: "teacher", schoolId: "school-a", periodId: "year", status: "active" };
  const period = { id: "year", schoolId: "school-a", paymentStatus: "paid", startsAtMs: start, endsAtMs: start + 365 * day };
  const good = input({ scope: schoolScope, memberships: [membership], seats: [seat], periods: [period] });
  assert.equal(evaluateAccess(good).tier, "school");
  assert.equal(evaluateAccess({ ...good, periods: [{ ...period, paymentStatus: "open" }] }).featureCodes.includes("test.create"), false);
  assert.equal(evaluateAccess({ ...good, seats: [] }).featureCodes.includes("test.create"), false);
  assert.equal(evaluateAccess({ ...good, memberships: [{ ...membership, role: "billing" }] }).featureCodes.includes("test.create"), false);
});
test("another school and a departed member cannot borrow a paid seat", () => {
  const access = evaluateAccess(input({ scope: { kind: "school", id: "other" }, memberships: [{ personId: "teacher", schoolId: "school-a", status: "active", role: "teacher" }] }));
  assert.deepEqual(access.featureCodes, []);
});
test("ending one grant preserves another source and never replenishes the trial", () => {
  const grants = [{ id: "revoked", source: "manual", scope, status: "revoked", startsAtMs: start, endsAtMs: null }, { id: "paid", source: "stripe", scope, status: "active", startsAtMs: start, endsAtMs: start + 40 * day }];
  const access = evaluateAccess(input({ at: start + 20 * day, account: { ...trial, createdCount: 5 }, grants }));
  assert.equal(access.tier, "personal_premium");
  assert.equal(access.freeCreationsRemaining, 0);
  assert.deepEqual(access.sourceIds, ["paid"]);
});
test("malformed trial state fails closed instead of minting starter credit", () => {
  for (const account of [null, {}, { ...trial, createdCount: -1 }, { ...trial, trialEndsAtMs: start + 100 * day }, { ...trial, reservedCount: 0.5 }]) {
    const access = evaluateAccess(input({ account }));
    assert.equal(access.featureCodes.includes("test.create"), false);
  }
});
