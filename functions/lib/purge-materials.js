"use strict";

const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { RETENTION } = require("./constants");

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RETENTION_MS = RETENTION.orphanUploadHours * HOUR_MS;
const MEDIA_CACHE_RETENTION_MS = RETENTION.generatedMediaCacheDays * DAY_MS;

async function purgeStoragePrefix(bucket, { prefix, maxAgeMs, now = Date.now() }) {
  let pageToken;
  let scanned = 0;
  let deleted = 0;
  let failed = 0;
  do {
    const [files, , response] = await bucket.getFiles({
      prefix, maxResults: 500, autoPaginate: false, ...(pageToken ? { pageToken } : {})
    });
    for (const file of files) {
      scanned += 1;
      const createdAt = Date.parse(file.metadata?.timeCreated || "");
      if (!Number.isFinite(createdAt) || createdAt > now - maxAgeMs) continue;
      try {
        await file.delete();
        deleted += 1;
      } catch (err) {
        if (Number(err?.code) === 404) { deleted += 1; continue; }
        failed += 1;
      }
    }
    pageToken = response?.nextPageToken;
  } while (pageToken);
  return { scanned, deleted, failed };
}

async function purgeExpiredDocuments(db, collectionId, now = Date.now(), batchSize = 400) {
  let scanned = 0;
  let deleted = 0;
  for (let page = 0; page < 100; page += 1) {
    const snap = await db.collectionGroup(collectionId)
      .where("expiresAt", "<=", Timestamp.fromMillis(now))
      .limit(batchSize)
      .get();
    if (snap.empty) break;
    scanned += snap.size;
    const batch = db.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);
    await batch.commit();
    deleted += snap.size;
    if (snap.size < batchSize) break;
  }
  return { scanned, deleted };
}

async function purgeExpiredMaterials(bucket, now = Date.now(), options = {}) {
  const uploads = await purgeStoragePrefix(bucket, {
    prefix: "aiUploads/", maxAgeMs: RETENTION_MS, now
  });
  const mediaCache = await purgeStoragePrefix(bucket, {
    prefix: "aiGeneratedCache/", maxAgeMs: MEDIA_CACHE_RETENTION_MS, now
  });

  // Raw AI telemetry and per-day quota documents are intentionally short-lived.
  // Cleanup is best-effort: a telemetry cleanup issue must never prevent orphaned
  // material uploads from being removed.
  let aiEvents = { scanned: 0, deleted: 0 };
  let aiUsage = { scanned: 0, deleted: 0 };
  let cleanupFailed = false;
  try {
    const db = Object.hasOwn(options, "db") ? options.db : getFirestore();
    if (db) {
      aiEvents = await purgeExpiredDocuments(db, "aiEvents", now);
      aiUsage = await purgeExpiredDocuments(db, "aiUsage", now);
    }
  } catch (err) {
    cleanupFailed = true;
    console.warn("KI-Telemetrie-Bereinigung fehlgeschlagen; Upload-Bereinigung bleibt gültig:", {
      code: err?.code, name: err?.name
    });
  }
  if (mediaCache.failed) {
    console.warn(`KI-Bildcache: ${mediaCache.failed} alte Cache-Dateien konnten nicht gelöscht werden.`);
  }

  return {
    // Keep the historic fields stable for the existing scheduled function.
    scanned: uploads.scanned,
    deleted: uploads.deleted,
    failed: uploads.failed,
    cacheScanned: mediaCache.scanned,
    cacheDeleted: mediaCache.deleted,
    cacheFailed: mediaCache.failed,
    aiEventsDeleted: aiEvents.deleted,
    aiUsageDeleted: aiUsage.deleted,
    cleanupFailed
  };
}

module.exports = {
  purgeExpiredMaterials, purgeStoragePrefix, purgeExpiredDocuments,
  RETENTION_MS, MEDIA_CACHE_RETENTION_MS
};
