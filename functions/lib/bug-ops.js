"use strict";

const crypto = require("node:crypto");
const { FieldValue } = require("firebase-admin/firestore");

const BUG_INCIDENT_COLLECTION = "bugIncidents";
const RED_RISK_PATTERN = /(auth|login|permission|firestore|\brules?\b|security|payment|billing|grade|grading|submission|solution|assessment|attempt|rights|privacy|token|secret|\biam\b|restore|data[-_ ]?loss|delete|role|admin)/i;
const DATA_LOSS_PATTERN = /(data[-_ ]?loss|lost[-_ ]?data|datenverlust|submission[-_ ]?missing)/i;

function sha(value, length = 32) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, length);
}

function timestampMillis(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeTag(value, max = 100) {
  const text = String(value || "").trim().slice(0, max);
  return /^[a-zA-Z0-9._:/-]+$/.test(text) ? text : "";
}

function safeCommit(value) {
  const text = String(value || "").trim();
  return /^[a-f0-9]{7,40}$/i.test(text) ? text.toLowerCase() : "";
}

function safeFingerprint(value) {
  const text = String(value || "").trim().slice(0, 160);
  return text && !/[\r\n]/.test(text) ? text : "";
}

function incidentIdForFingerprint(fingerprint) {
  return `bug-${sha(fingerprint, 24)}`;
}

function reporterMarkerId(fingerprint, userId) {
  return userId ? sha(`${fingerprint}:${userId}`, 32) : "";
}

function cleanBugReport(data = {}) {
  if (data.category !== "app_error") return null;
  const fingerprint = safeFingerprint(data.fingerprint || data.errorCode);
  if (!fingerprint) return null;
  const errorCode = safeTag(data.errorCode, 100);
  const action = safeTag(data.action, 100);
  const environment = data.environment === "production" ? "production" : data.environment === "staging" ? "staging" : "unknown";
  const severity = data.severity === "error" || data.technicalDetails?.severity === "error" ? "error" : "warning";
  const occurrences = Math.max(1, Math.min(100000, Math.round(Number(data.technicalDetails?.occurrences) || 1)));
  const createdAtMs = timestampMillis(data.createdAt);
  const updatedAtMs = timestampMillis(data.updatedAt) || createdAtMs;
  const release = safeCommit(data.technicalDetails?.diagnostics?.release?.commit);
  const fixCommit = safeCommit(data.resolution?.fixCommit);
  const appVersion = safeTag(data.appVersion, 80);
  return {
    fingerprint,
    errorCode,
    action,
    environment,
    severity,
    occurrences,
    open: data.status !== "done",
    createdAtMs,
    updatedAtMs,
    release,
    fixCommit,
    reporterMarker: reporterMarkerId(fingerprint, data.userId),
    version: appVersion
  };
}

function mergeTags(existing = [], value, limit = 30) {
  const result = new Set((Array.isArray(existing) ? existing : []).map(String).filter(Boolean));
  if (value) result.add(value);
  return [...result].slice(0, limit);
}

function classifyIncident(input = {}) {
  const errorCodes = Array.isArray(input.errorCodes) ? input.errorCodes : [];
  const actions = Array.isArray(input.actions) ? input.actions : [];
  const tags = [...errorCodes, ...actions].join(" ");
  const risk = RED_RISK_PATTERN.test(tags) ? "red" : "green_candidate";
  const users = Math.max(0, Number(input.uniqueReporters) || 0);
  const hits = Math.max(0, Number(input.occurrences) || 0);
  const production = Math.max(0, Number(input.productionReports) || 0) > 0;
  let priority = "P3";
  if (DATA_LOSS_PATTERN.test(tags) || (production && (users >= 20 || hits >= 50))) priority = "P0";
  else if ((production && (users >= 3 || hits >= 10 || Number(input.errorSeverityReports || 0) > 0)) || users >= 5 || hits >= 15) priority = "P1";
  else if (users >= 2 || hits >= 3 || Number(input.errorSeverityReports || 0) > 0) priority = "P2";

  let notification = "digest";
  if (input.regressionAfterFix || priority === "P0") notification = "immediate";
  else if (priority === "P1" && production) notification = "immediate";
  else if (input.automationStage === "staging_verified") notification = "retest_ready";
  else if (risk === "red" && (priority === "P0" || priority === "P1")) notification = "action_needed";

  const lifecycle = input.regressionAfterFix
    ? "regressed"
    : input.automationStage === "staging_verified"
      ? "retest_required"
      : input.latestFixCommit
        ? (Number(input.openReports || 0) > 0 ? "fix_recorded" : "monitoring")
        : "open";

  return {
    risk,
    priority,
    notification,
    needsAttention: notification !== "digest",
    autopilot: risk === "green_candidate" ? "candidate" : "blocked",
    lifecycle
  };
}

function sourceVersion(clean) {
  return sha(JSON.stringify({
    occurrences: clean.occurrences,
    open: clean.open,
    environment: clean.environment,
    severity: clean.severity,
    errorCode: clean.errorCode,
    action: clean.action,
    release: clean.release,
    version: clean.version,
    fixCommit: clean.fixCommit,
    updatedAtMs: clean.updatedAtMs
  }), 40);
}

async function syncBugFeedback(db, feedbackId, rawAfter) {
  const clean = cleanBugReport(rawAfter);
  if (!clean) return { ignored: true };
  const incidentId = incidentIdForFingerprint(clean.fingerprint);
  const incidentRef = db.doc(`${BUG_INCIDENT_COLLECTION}/${incidentId}`);
  const sourceRef = incidentRef.collection("_sources").doc(String(feedbackId));
  const reporterRef = clean.reporterMarker ? incidentRef.collection("_reporters").doc(clean.reporterMarker) : null;
  const versionHash = sourceVersion(clean);

  return db.runTransaction(async tx => {
    const [incidentSnap, sourceSnap] = await Promise.all([tx.get(incidentRef), tx.get(sourceRef)]);
    const previousSource = sourceSnap.exists ? sourceSnap.data() : null;
    if (previousSource?.versionHash === versionHash) return { ignored: false, deduplicated: true, incidentId };

    const current = incidentSnap.exists ? incidentSnap.data() : {};
    const firstForReport = !previousSource;
    let reporterIsNew = false;
    if (firstForReport && reporterRef) {
      const reporterSnap = await tx.get(reporterRef);
      reporterIsNew = !reporterSnap.exists;
    }

    const reports = Math.max(0, Number(current.reports || 0) + (firstForReport ? 1 : 0));
    const occurrences = Math.max(0, Number(current.occurrences || 0) + clean.occurrences - Number(previousSource?.occurrences || 0));
    const openReports = Math.max(0, Number(current.openReports || 0) + Number(clean.open) - Number(previousSource?.open || 0));
    const productionReports = Math.max(0, Number(current.productionReports || 0) + Number(clean.environment === "production") - Number(previousSource?.environment === "production"));
    const stagingReports = Math.max(0, Number(current.stagingReports || 0) + Number(clean.environment === "staging") - Number(previousSource?.environment === "staging"));
    const errorSeverityReports = Math.max(0, Number(current.errorSeverityReports || 0) + Number(clean.severity === "error") - Number(previousSource?.severity === "error"));
    const uniqueReporters = Math.max(0, Number(current.uniqueReporters || 0) + Number(reporterIsNew));
    const firstSeenAtMs = current.firstSeenAtMs
      ? Math.min(Number(current.firstSeenAtMs), clean.createdAtMs || Number(current.firstSeenAtMs))
      : clean.createdAtMs;
    const lastSeenAtMs = Math.max(Number(current.lastSeenAtMs || 0), clean.createdAtMs || clean.updatedAtMs || 0);
    const errorCodes = mergeTags(current.errorCodes, clean.errorCode);
    const actions = mergeTags(current.actions, clean.action);
    const versions = mergeTags(current.versions, clean.version, 20);
    const releases = mergeTags(current.releases, clean.release, 10);
    const fixChanged = Boolean(clean.fixCommit && clean.fixCommit !== previousSource?.fixCommit);
    const latestFixCommit = fixChanged ? clean.fixCommit : String(current.latestFixCommit || "");
    const latestFixAtMs = fixChanged ? (clean.updatedAtMs || Date.now()) : Number(current.latestFixAtMs || 0);
    const regressionAfterFix = Boolean(current.regressionAfterFix)
      || Boolean(firstForReport && clean.open && latestFixAtMs && clean.createdAtMs > latestFixAtMs);

    const base = {
      reports,
      occurrences,
      openReports,
      productionReports,
      stagingReports,
      errorSeverityReports,
      uniqueReporters,
      errorCodes,
      actions,
      versions,
      releases,
      latestFixCommit,
      latestFixAtMs,
      regressionAfterFix,
      automationStage: String(current.automationStage || "")
    };
    const classification = classifyIncident(base);
    tx.set(incidentRef, {
      schemaVersion: 1,
      fingerprint: clean.fingerprint,
      ...base,
      ...classification,
      firstSeenAtMs,
      lastSeenAtMs,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    tx.set(sourceRef, {
      versionHash,
      occurrences: clean.occurrences,
      open: clean.open,
      environment: clean.environment,
      severity: clean.severity,
      fixCommit: clean.fixCommit,
      updatedAtMs: clean.updatedAtMs
    }, { merge: true });
    if (reporterIsNew && reporterRef) {
      tx.create(reporterRef, { createdAt: FieldValue.serverTimestamp() });
    }
    return { ignored: false, deduplicated: false, incidentId, ...classification };
  });
}

module.exports = {
  BUG_INCIDENT_COLLECTION,
  cleanBugReport,
  incidentIdForFingerprint,
  reporterMarkerId,
  classifyIncident,
  sourceVersion,
  syncBugFeedback
};
