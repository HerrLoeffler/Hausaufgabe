"use strict";
const { HttpsError } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { LIMITS, MATERIAL_MIME_TYPES } = require("./constants");
const sharp = require("sharp");

// Remove identifying upload filenames and image metadata before provider calls.
// This deliberately makes no claim to anonymize names inside documents/pixels.
async function prepareMaterialInput(buf, mimeType, index) {
  if (mimeType.startsWith("image/")) {
    const expected = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" }[mimeType];
    const source = sharp(buf, { limitInputPixels: 40000000 });
    if (!expected || (await source.metadata()).format !== expected) throw new HttpsError("invalid-argument", "Dateityp und Bildinhalt stimmen nicht überein.");
    const clean = await source.rotate().toFormat(expected, { quality: 95 }).toBuffer();
    if (clean.length > LIMITS.maxMaterialBytes) throw new HttpsError("invalid-argument", "Das aufbereitete Bild ist zu groß. Bitte verkleinern.");
    return { type: "input_image", image_url: `data:${mimeType};base64,${clean.toString("base64")}`, detail: "high" };
  }
  const extensions = { "application/pdf": "pdf", "text/plain": "txt", "text/csv": "csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx" };
  if (!extensions[mimeType]) throw new HttpsError("invalid-argument", "Nicht unterstütztes Materialformat.");
  return { type: "input_file", filename: `unterrichtsmaterial-${index + 1}.${extensions[mimeType]}`, file_data: `data:${mimeType};base64,${buf.toString("base64")}` };
}

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
    out.push(await prepareMaterialInput(buf, m.mimeType, out.length));
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

module.exports = { sanitizeMaterials, materialInputs, deleteUploadedMaterials, prepareMaterialInput };
