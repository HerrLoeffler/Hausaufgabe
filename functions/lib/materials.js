"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { LIMITS, MATERIAL_MIME_TYPES } = require("./constants");

function sanitizeMaterials(materials, uid) {
  const list = Array.isArray(materials) ? materials.slice(0, LIMITS.maxMaterials) : [];
  return list.map((m, index) => {
    const id = String(m?.id || `material-${index + 1}`);
    const storagePath = String(m?.storagePath || "");
    const mimeType = String(m?.mimeType || "");
    if (!storagePath.startsWith(`aiUploads/${uid}/`)) throw new HttpsError("permission-denied", "Ungültiger Materialpfad.");
    if (!MATERIAL_MIME_TYPES.includes(mimeType)) throw new HttpsError("invalid-argument", `Nicht unterstützter Dateityp: ${mimeType}`);
    return { id, storagePath, mimeType, name: String(m?.name || "Material") };
  });
}

async function materialInputs(materials, uid) {
  const safe = sanitizeMaterials(materials, uid); const bucket = getStorage().bucket(); const out = [];
  for (const m of safe) {
    const file = bucket.file(m.storagePath); const [meta] = await file.getMetadata();
    if (Number(meta.size || 0) > LIMITS.maxMaterialBytes) throw new HttpsError("invalid-argument", `${m.name} ist zu groß.`);
    const [buf] = await file.download();
    const base64 = buf.toString("base64");
    if (m.mimeType.startsWith("image/")) {
      out.push({ type: "input_image", image_url: `data:${m.mimeType};base64,${base64}`, detail: "high" });
    } else {
      out.push({ type: "input_file", filename: m.name, file_data: `data:${m.mimeType};base64,${base64}` });
    }
  }
  return out;
}

async function deleteUploadedMaterials(materials) {
  if (!materials.length) return;
  const bucket = getStorage().bucket();
  const results = await Promise.allSettled(materials.map(async m => {
    try { await bucket.file(m.storagePath).delete(); }
    catch (err) { if (Number(err?.code) !== 404) throw err; }
  }));
  const failed = results.filter(result => result.status === "rejected").length;
  if (failed) console.error(`KI-Material: ${failed} von ${materials.length} Uploads konnten nicht gelöscht werden.`);
}

module.exports = { sanitizeMaterials, materialInputs, deleteUploadedMaterials };
