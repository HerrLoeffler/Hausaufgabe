import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
import { getStorage, ref, uploadBytesResumable, deleteObject } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

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

export function createAiClient(app, getUid) {
  const functions = getFunctions(app, REGION);
  const storage = getStorage(app);
  const call = (name, timeoutMs = 180000) => async (payload) => {
    const fn = httpsCallable(functions, name, { timeout: timeoutMs });
    const result = await fn(payload);
    return result.data;
  };
  const api = {
    status: call("getAiStatus", 30000),
    reportRightsIssue: call("reportRightsIssue", 30000),
    generateTest: call("generateTest", 540000),
    startAiTestJob: call("startAiTestJob", 60000),
    regenerateQuestion: call("regenerateQuestion", 180000),
    analyzeMaterial: call("analyzeMaterial", 300000),
    generateQuestionMedia: call("generateQuestionMedia", 300000)
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
