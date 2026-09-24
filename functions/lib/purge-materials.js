"use strict";

const RETENTION_MS = 24 * 60 * 60 * 1000;

async function purgeExpiredMaterials(bucket, now = Date.now()) {
  let pageToken;
  let scanned = 0;
  let deleted = 0;
  let failed = 0;
  do {
    const [files, , response] = await bucket.getFiles({ prefix: "aiUploads/", maxResults: 500, autoPaginate: false, ...(pageToken ? { pageToken } : {}) });
    for (const file of files) {
      scanned += 1;
      const createdAt = Date.parse(file.metadata?.timeCreated || "");
      if (!Number.isFinite(createdAt) || createdAt > now - RETENTION_MS) continue;
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

module.exports = { purgeExpiredMaterials, RETENTION_MS };
