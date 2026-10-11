import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { getStorage, ref, uploadBytesResumable, deleteObject } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";
import {
  DEFAULT_CONTENT_LOCALE,
  normalizeAssessmentLocale,
  withContentLocaleMarker,
} from "./shared/i18n/assessment-locale.mjs?v=2";

const REGION = "europe-west1";
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain", "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

function safeName(name) {
  return String(name || "material").normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "material";
}
function randomId(prefix = "m") { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`; }

function activeContentLocale() {
  try {
    return normalizeAssessmentLocale(window.GradeCrewAssessmentLocale?.getContentLocale?.(), DEFAULT_CONTENT_LOCALE);
  } catch (_) {
    return DEFAULT_CONTENT_LOCALE;
  }
}

function markPendingLocale(locale) {
  try { window.GradeCrewAssessmentLocale?.setPendingContentLocale?.(locale); } catch (_) {}
}

function withGenerationLocale(payload = {}) {
  const locale = activeContentLocale();
  markPendingLocale(locale);
  return { ...payload, notes: withContentLocaleMarker(payload?.notes || "", locale) };
}

function withInstructionLocale(payload = {}) {
  const locale = activeContentLocale();
  return { ...payload, instruction: withContentLocaleMarker(payload?.instruction || "", locale) };
}

export function createAiClient(app, getUid) {
  const functions = getFunctions(app, REGION);
  const storage = getStorage(app);
  const call = (name, timeoutMs = 180000, transform = payload => payload) => async (payload) => {
    const fn = httpsCallable(functions, name, { timeout: timeoutMs });
    const result = await fn(transform(payload || {}));
    return result.data;
  };
  const regenerateQuestion = call("regenerateQuestion", 180000, withInstructionLocale);
  const api = {
    reviewMode: call("reviewMode", 30000),
    status: call("getAiStatus", 30000),
    reportRightsIssue: call("reportRightsIssue", 30000),
    generateTest: call("generateTest", 540000, withGenerationLocale),
    startAiTestJob: call("startAiTestJob", 60000, withGenerationLocale),
    prepareQuickRemy: call("prepareQuickRemy", 60000),
    submitQuickRemy: call("submitQuickRemy", 60000),
    getQuickRemySubmission: call("getQuickRemySubmission", 30000),
    regenerateQuestion,
    reviseWholeTest: call("reviseWholeTest", 360000, withInstructionLocale),
    analyzeMaterial: call("analyzeMaterial", 300000),
    generateQuestionMedia: call("generateQuestionMedia", 300000),
    generateQuestionAudio: call("generateQuestionAudio", 180000),
    generateQuestionSolutionAudio: call("generateQuestionSolutionAudio", 180000),
    getQuestionAudioDrafts: call("getQuestionAudioDrafts", 60000),
    getBugOpsSummary: call("getBugOpsSummary", 30000),
    syncQuestionAudioDrafts: call("syncQuestionAudioDrafts", 60000)
  };
  async function uploadMaterial(file, onProgress = () => {}) {
    const uid = getUid();
    if (!uid) throw new Error("Bitte zuerst anmelden.");
    if (!ALLOWED_MIME.has(file.type)) throw new Error("Dieser Dateityp wird für KI-Material noch nicht unterstützt.");
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("Datei zu groß. Maximal 15 MB pro Material.");
    const id = randomId();
    const storagePath = `aiUploads/${uid}/${id}/${safeName(file.name)}`;
    const task = uploadBytesResumable(ref(storage, storagePath), file, { contentType: file.type, customMetadata: { ownerId: uid, materialId: id } });
    await new Promise((resolve, reject) => task.on("state_changed", snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)), reject, resolve));
    return { id, storagePath, mimeType: file.type, name: file.name, size: file.size };
  }
  async function removeMaterial(material) {
    if (!material?.storagePath) return;
    try { await deleteObject(ref(storage, material.storagePath)); }
    catch (err) { if (err?.code !== "storage/object-not-found") throw err; }
  }
  return { ...api, uploadMaterial, removeMaterial };
}
