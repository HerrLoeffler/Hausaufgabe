"use strict";
const { mergePaidPeriods } = require("./stripe-contracts");

const DAY_MS = 86400000;
const TRIAL_DAYS = 14;
const FREE_CREATIONS = 5;
const READ = ["test.read", "test.export"];
const FULL = [...READ, "test.edit", "test.create", "test.publish"];
const finiteTime = value => Number.isSafeInteger(value) && value >= 0;
const count = value => Number.isInteger(value) && value >= 0 && value <= FREE_CREATIONS;

function trialForRegistration(registeredAtMs) {
  if (!finiteTime(registeredAtMs) || !finiteTime(registeredAtMs + TRIAL_DAYS * DAY_MS)) throw new TypeError("Invalid registration time");
  return { version: 2, trialStartedAtMs: registeredAtMs, trialEndsAtMs: registeredAtMs + TRIAL_DAYS * DAY_MS, createdCount: 0, reservedCount: 0 };
}

function validTrial(account) {
  return account && finiteTime(account.trialStartedAtMs)
    && account.trialEndsAtMs === account.trialStartedAtMs + TRIAL_DAYS * DAY_MS
    && count(account.createdCount) && count(account.reservedCount)
    && account.createdCount + account.reservedCount <= FREE_CREATIONS;
}

function inPeriod(value, at, unbounded = false) {
  return value && finiteTime(value.startsAtMs) && value.startsAtMs <= at
    && ((unbounded && value.endsAtMs === null)
      || (finiteTime(value.endsAtMs) && value.startsAtMs < value.endsAtMs && at < value.endsAtMs));
}

function evaluateAccess({ person, scope, at, account, grants = [], memberships = [], periods = [], seats = [] } = {}) {
  if (!finiteTime(at)) throw new TypeError("Explicit current time required");
  const trialValid = validTrial(account);
  const base = {
    tier: "free", featureCodes: [], sourceIds: [], validUntil: null,
    trialEndsAtMs: trialValid ? account.trialEndsAtMs : null,
    freeCreationsRemaining: trialValid ? FREE_CREATIONS - account.createdCount - account.reservedCount : 0,
    trialCreationsUsed: trialValid ? account.createdCount : null,
    reasonCode: "authentication_required"
  };
  if (!person?.id) return base;
  if (!["teacher", "admin"].includes(person.role) || (person.status && person.status !== "active") || person.accountDeletionId || person.isTestAccountArchived) return { ...base, reasonCode: "account_suspended" };
  if (!scope || !["personal", "school"].includes(scope.kind) || typeof scope.id !== "string" || (scope.kind === "personal" && scope.id !== person.id)) return { ...base, reasonCode: "scope_forbidden" };
  if (scope.kind === "school") {
    const member = memberships.find(m => m.personId === person.id && m.schoolId === scope.id && m.status === "active" && ["teacher", "school_admin"].includes(m.role));
    if (!member) return { ...base, reasonCode: "school_membership_required" };
    const period = periods.filter(p => p.schoolId === scope.id && p.paymentStatus === "paid" && inPeriod(p, at))
      .find(p => seats.some(s => s.schoolId === scope.id && s.personId === person.id && s.periodId === p.id && s.status === "active"));
    if (!person.emailVerified) return { ...base, featureCodes: READ, reasonCode: "email_verification_required" };
    if (!period) return { ...base, featureCodes: READ, reasonCode: "school_seat_required" };
    return { ...base, tier: "school", featureCodes: FULL, sourceIds: [period.id], validUntil: period.endsAtMs, reasonCode: "allowed" };
  }
  if (person.emailVerified !== true) return { ...base, featureCodes: READ, reasonCode: "email_verification_required" };
  const personalGrants = grants.map(g => {
    if (g.source !== "stripe" || g.paidPeriods === undefined) return g;
    try {
      const current = mergePaidPeriods(g.paidPeriods).find(period => inPeriod(period, at));
      return current ? { ...g, ...current } : { ...g, startsAtMs: null, endsAtMs: null };
    } catch { return { ...g, startsAtMs: null, endsAtMs: null }; }
  });
  const active = personalGrants.filter(g => g.status === "active" && ["manual", "stripe"].includes(g.source)
    && g.scope?.kind === scope.kind && g.scope?.id === scope.id
    && inPeriod(g, at, g.source === "manual"));
  if (active.length) return {
    ...base, tier: active.some(g => g.source === "stripe") ? "personal_premium" : "complimentary",
    featureCodes: FULL, sourceIds: active.map(g => g.id),
    validUntil: active.some(g => g.endsAtMs === null) ? null : Math.max(...active.map(g => g.endsAtMs)), reasonCode: "allowed"
  };
  const schoolAccess = memberships.filter(m => m.personId === person.id && m.status === "active")
    .map(m => evaluateAccess({ person, account, scope: { kind: "school", id: m.schoolId }, at, memberships, periods, seats }))
    .filter(access => access.tier === "school")
    .sort((a, b) => b.validUntil - a.validUntil)[0];
  if (schoolAccess) return { ...schoolAccess, freeCreationsRemaining: base.freeCreationsRemaining, trialCreationsUsed: base.trialCreationsUsed };
  if (!trialValid) return { ...base, featureCodes: READ, reasonCode: "account_setup_required" };
  if (at < account.trialStartedAtMs) return { ...base, featureCodes: READ, reasonCode: "trial_not_started" };
  if (at >= account.trialEndsAtMs) return { ...base, featureCodes: READ, reasonCode: "trial_ended" };
  return {
    ...base, tier: "trial", validUntil: account.trialEndsAtMs,
    featureCodes: base.freeCreationsRemaining > 0 ? FULL : FULL.filter(f => f !== "test.create"),
    reasonCode: base.freeCreationsRemaining > 0 ? "allowed" : "quota_exhausted"
  };
}

module.exports = { evaluateAccess, trialForRegistration, TRIAL_DAYS, FREE_CREATIONS, DAY_MS };
