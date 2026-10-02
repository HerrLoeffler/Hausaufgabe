"use strict";

function normalizeRole(value) {
  return value === "admin" ? "admin" : "teacher";
}

function canChangeRole({ actorUid, targetUid, currentRole, nextRole, isTestAccount }) {
  if (!actorUid || !targetUid) return { ok: false, reason: "missing-user" };
  if (actorUid === targetUid && nextRole !== "admin") return { ok: false, reason: "self-demotion" };
  if (nextRole === "admin" && isTestAccount === true) return { ok: false, reason: "test-admin" };
  if (!["teacher", "admin"].includes(currentRole || "teacher")) return { ok: false, reason: "invalid-current-role" };
  return { ok: true };
}

function canSetTestAccount({ actorUid, targetUid, targetRole, nextValue }) {
  if (!actorUid || !targetUid) return { ok: false, reason: "missing-user" };
  if (nextValue === true && targetRole === "admin") return { ok: false, reason: "admin-test-account" };
  return { ok: true };
}

function canDeleteTestAccount({ actorUid, targetUid, targetRole, isTestAccount, ownedQuizCount = 0, deleteData = false }) {
  if (!actorUid || !targetUid) return { ok: false, reason: "missing-user" };
  if (actorUid === targetUid) return { ok: false, reason: "self-delete" };
  if (targetRole === "admin") return { ok: false, reason: "admin-delete" };
  if (isTestAccount !== true) return { ok: false, reason: "not-test-account" };
  if (ownedQuizCount > 0 && deleteData !== true) return { ok: false, reason: "has-data" };
  return { ok: true };
}

module.exports = {
  normalizeRole,
  canChangeRole,
  canSetTestAccount,
  canDeleteTestAccount
};
