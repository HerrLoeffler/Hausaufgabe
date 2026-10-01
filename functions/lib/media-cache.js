"use strict";

const { createHash } = require("node:crypto");
const { getStorage } = require("firebase-admin/storage");
const { IMAGE_MODEL, PROMPT_VERSION, RETENTION } = require("./constants");

const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_VERSION = 1;

function hash(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}

function imageCachePath({ uid, prompt, expectedScene = "", questionText = "", altText = "", maxBytes = 280 * 1024 }) {
  if (!uid) return "";
  const scope = hash(uid).slice(0, 24);
  const key = hash(JSON.stringify({
    version: CACHE_VERSION,
    model: IMAGE_MODEL,
    promptVersion: PROMPT_VERSION,
    prompt: String(prompt || ""),
    expectedScene: String(expectedScene || ""),
    questionText: String(questionText || ""),
    altText: String(altText || ""),
    maxBytes: Number(maxBytes) || 0
  }));
  return `aiGeneratedCache/${scope}/${key}.webp`;
}

async function loadVerifiedImageCache(context, bucket = null, now = Date.now()) {
  const path = imageCachePath(context);
  if (!path) return null;
  const store = bucket || getStorage().bucket();
  const file = store.file(path);
  try {
    const [meta] = await file.getMetadata();
    const createdAt = Date.parse(meta?.timeCreated || "");
    if (!Number.isFinite(createdAt) || createdAt <= now - RETENTION.generatedMediaCacheDays * DAY_MS) return null;
    const [buf] = await file.download();
    if (!buf?.length || buf.length > Math.max(Number(context.maxBytes) || 0, 130 * 1024)) return null;
    return {
      imageDataUrl: `data:image/webp;base64,${buf.toString("base64")}`,
      imageAlt: String(context.altText || "Abbildung zur Aufgabe"),
      imageByteSize: buf.length,
      cacheHit: true,
      verifiedCache: true
    };
  } catch (err) {
    if (Number(err?.code) !== 404) {
      console.warn("KI-Bildcache konnte nicht gelesen werden; Bild wird normal erzeugt:", { code: err?.code, name: err?.name });
    }
    return null;
  }
}

async function saveVerifiedImageCache(asset, context, bucket = null) {
  if (!asset?.imageDataUrl || asset.cacheHit || !context?.uid) return false;
  const match = /^data:image\/webp;base64,(.+)$/s.exec(String(asset.imageDataUrl));
  if (!match) return false;
  const buf = Buffer.from(match[1], "base64");
  if (!buf.length || buf.length > Math.max(Number(context.maxBytes) || 0, 130 * 1024)) return false;
  const store = bucket || getStorage().bucket();
  try {
    await store.file(imageCachePath(context)).save(buf, {
      resumable: false,
      metadata: {
        contentType: "image/webp",
        cacheControl: "private, max-age=86400",
        metadata: {
          cacheVersion: String(CACHE_VERSION),
          verified: "true",
          model: IMAGE_MODEL,
          promptVersion: PROMPT_VERSION
        }
      }
    });
    return true;
  } catch (err) {
    // Caching is optional. Never discard an already verified paid-for image.
    console.warn("KI-Bildcache konnte nicht gespeichert werden:", { code: err?.code, name: err?.name });
    return false;
  }
}

module.exports = { imageCachePath, loadVerifiedImageCache, saveVerifiedImageCache };
