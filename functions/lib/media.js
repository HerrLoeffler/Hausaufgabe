"use strict";
const sharp = require("sharp");
const { getOpenAI } = require("./openai-client");
const { IMAGE_MODEL } = require("./constants");

async function generateImageAsset({ prompt, altText, maxBytes = 280 * 1024 }) {
  const result = await getOpenAI().images.generate({ model: IMAGE_MODEL, prompt, size: "1024x1024", quality: "low", output_format: "webp", n: 1 });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("Bildmodell lieferte kein Bild.");
  let quality = 78;
  let width = 1100;
  let optimized = Buffer.from(b64, "base64");
  for (let i = 0; i < 5; i += 1) {
    optimized = await sharp(Buffer.from(b64, "base64")).resize({ width, height: width, fit: "inside", withoutEnlargement: true }).webp({ quality }).toBuffer();
    if (optimized.length <= maxBytes) break;
    width = Math.max(560, Math.round(width * 0.82)); quality = Math.max(48, quality - 8);
  }
  if (optimized.length > Math.max(maxBytes, 130 * 1024)) throw new Error("Generiertes Bild ist nach Optimierung zu groß.");
  return { imageDataUrl: `data:image/webp;base64,${optimized.toString("base64")}`, imageAlt: String(altText || "Abbildung zur Aufgabe"), imageByteSize: optimized.length };
}
module.exports = { generateImageAsset };