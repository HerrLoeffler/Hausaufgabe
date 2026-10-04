import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";

import { PARSER_VERSION } from "./crew-assistant-core.mjs?v=3";
const FIELD_SELECTORS = Object.freeze({
  subject: "#aiSubject",
  grade: "#aiGrade",
  schoolType: "#aiSchoolType",
  region: "#aiRegion",
  topic: "#aiTopic",
  difficulty: "#aiDifficulty",
  count: "#aiCount",
  points: "#aiPoints",
  audioQuestionCount: "#aiAudioQuestionCount",
  solutionAudioQuestionCount: "#aiSolutionAudioQuestionCount",
  notes: "#aiCustomNotes"
});

let activePatch = null;
let listenersInstalled = false;

function fieldNamesFromPatch(patch = {}) {
  const fields = [];
  for (const key of Object.keys(FIELD_SELECTORS)) {
    if (patch[key] !== undefined && patch[key] !== null && patch[key] !== "") fields.push(key);
  }
  if (patch.durationMinutes) fields.push("durationMinutes");
  if ((Array.isArray(patch.allowedTypes) && patch.allowedTypes.length) || (Array.isArray(patch.excludeTypes) && patch.excludeTypes.length)) fields.push("questionTypes");
  return [...new Set(fields)];
}

function snapshotField(field) {
  if (field === "questionTypes") {
    return Array.from(document.querySelectorAll('#aiTypeChecks input[type="checkbox"]:checked')).map(box => box.value).sort().join("|");
  }
  if (field === "durationMinutes") return "note";
  const node = document.querySelector(FIELD_SELECTORS[field]);
  return String(node?.value || "");
}

function inferField(target) {
  if (!(target instanceof Element)) return null;
  if (target.closest("#aiTypeChecks")) return "questionTypes";
  for (const [field, selector] of Object.entries(FIELD_SELECTORS)) if (target.matches(selector)) return field;
  return null;
}

export function recordRemyMetric(event, metadata = {}) {
  try {
    const functions = getFunctions(getApp(), "europe-west1");
    const callable = httpsCallable(functions, "recordCrewTelemetry", { timeout: 15000 });
    void callable({
      event,
      crewId: "remy",
      screen: "ai_create",
      parserVersion: PARSER_VERSION,
      inputMode: metadata.inputMode,
      source: metadata.source,
      fields: Array.isArray(metadata.fields) ? metadata.fields : undefined,
      correctedField: metadata.correctedField,
      hasNotes: metadata.hasNotes === true,
      latencyMs: metadata.latencyMs,
      errorType: metadata.errorType
    }).catch(error => {
      console.debug("Remy-Metrik nicht verfügbar:", error?.code || error?.message || error);
    });
  } catch (error) {
    console.debug("Remy-Metrik konnte nicht gestartet werden:", error?.message || error);
  }
}

export function recordRemySubmission(inputMode) {
  recordRemyMetric("input_submitted", { inputMode });
}

export function recordRemyPatch(patch, { inputMode = "text", source = "local", latencyMs } = {}) {
  const fields = fieldNamesFromPatch(patch);
  activePatch = {
    createdAt: Date.now(),
    fields: new Set(fields),
    corrected: new Set(),
    snapshots: new Map(fields.map(field => [field, snapshotField(field)]))
  };
  recordRemyMetric("patch_applied", {
    inputMode,
    source,
    fields,
    hasNotes: Boolean(patch?.notes),
    latencyMs
  });
}

function onPossibleCorrection(event) {
  if (!event.isTrusted || !activePatch || Date.now() - activePatch.createdAt > 10 * 60 * 1000) return;
  const field = inferField(event.target);
  if (!field || !activePatch.fields.has(field) || activePatch.corrected.has(field)) return;
  const before = activePatch.snapshots.get(field);
  const after = snapshotField(field);
  if (before === after) return;
  activePatch.corrected.add(field);
  recordRemyMetric("field_corrected", { correctedField: field });
}

export function installRemyCorrectionTracking() {
  if (listenersInstalled || typeof document === "undefined") return;
  listenersInstalled = true;
  document.addEventListener("change", onPossibleCorrection, true);
  document.addEventListener("input", onPossibleCorrection, true);
}

export function resetRemyTelemetryContext() {
  activePatch = null;
}

installRemyCorrectionTracking();
