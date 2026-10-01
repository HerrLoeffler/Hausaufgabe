"use strict";
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { enabled, fingerprint } = require("./telemetry-core");

const ALWAYS = new Set(["getAssessmentInfo", "startAssessmentAttempt", "submitAssessmentAttempt", "getAssessmentReceipt"]);

function cleanQuizId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^[A-Z0-9]{4,16}$/.test(id) ? id : null;
}

function cleanCode(value) {
  const code = String(value || "none").trim().toLowerCase();
  return /^[a-z][a-z0-9-]{0,39}$/.test(code) ? code : "unknown";
}

async function recordAssessmentServerOperation({ request, entry }) {
  if (!enabled()) return { stored: false, reason: "disabled" };
  if (!entry || typeof entry !== "object") return { stored: false, reason: "invalid-entry" };
  if (!ALWAYS.has(entry.action) && !(entry.action === "resumeAssessmentAttempt" && entry.status === "failed")) {
    return { stored: false, reason: "not-selected" };
  }
  const quizId = cleanQuizId(request?.data?.quizId);
  if (!quizId) return { stored: false, reason: "invalid-quiz" };

  const db = getFirestore();
  const quiz = (await db.doc(`quizzes/${quizId}`).get()).data();
  const ownerId = String(quiz?.ownerId || "").slice(0, 128);
  if (!ownerId) return { stored: false, reason: "unknown-owner" };

  const now = Date.now();
  const reference = /^ASM-[A-Za-z0-9-]{1,100}$/.test(String(entry.reference || "")) ? String(entry.reference) : "ASM-unknown";
  const ref = db.doc(`telemetryPrivateServerOperations/${fingerprint([ownerId, quizId, reference])}`);
  await ref.set({
    schemaVersion: 1,
    source: "server_operation",
    environment: "staging",
    ownerId,
    quizId,
    action: String(entry.action || "unknown").slice(0, 60),
    status: entry.status === "ok" ? "ok" : "failed",
    code: entry.status === "ok" ? "none" : cleanCode(entry.code),
    durationMs: Math.max(0, Math.min(86_400_000, Math.round(Number(entry.durationMs) || 0))),
    reference,
    revision: String(entry.revision || "unknown").slice(0, 120),
    receivedAtMs: now,
    expiresAtMs: now + 30 * 86_400_000,
    expiresAt: Timestamp.fromMillis(now + 30 * 86_400_000)
  });
  return { stored: true };
}

module.exports = { recordAssessmentServerOperation };
