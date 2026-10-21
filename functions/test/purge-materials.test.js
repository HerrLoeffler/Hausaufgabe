"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { purgeExpiredMaterials, RETENTION_MS, MEDIA_CACHE_RETENTION_MS } = require("../lib/purge-materials");

test("removes expired AI uploads across pages and keeps recent files", async () => {
  const now = Date.parse("2026-09-24T12:00:00Z");
  const old = { metadata: { timeCreated: new Date(now - RETENTION_MS - 1).toISOString() }, async delete() { this.deleted = true; } };
  const recent = { metadata: { timeCreated: new Date(now - RETENTION_MS + 1).toISOString() }, async delete() { this.deleted = true; } };
  const unknown = { metadata: {}, async delete() { this.deleted = true; } };
  const pages = [[old, recent], [unknown]];
  const bucket = { async getFiles(opts) {
    assert.equal(opts.autoPaginate, false);
    if (opts.prefix === "aiGeneratedCache/") return [[], null, {}];
    assert.equal(opts.prefix, "aiUploads/");
    const page = opts.pageToken ? 1 : 0;
    return [pages[page], null, { nextPageToken: page === 0 ? "next" : undefined }];
  } };
  const result = await purgeExpiredMaterials(bucket, now, { db: null });
  assert.deepEqual({ scanned: result.scanned, deleted: result.deleted, failed: result.failed }, { scanned: 3, deleted: 1, failed: 0 });
  assert.equal(old.deleted, true);
  assert.equal(recent.deleted, undefined);
  assert.equal(unknown.deleted, undefined);
});

test("counts unexpected upload deletion errors so the scheduled job reports failure", async () => {
  const now = Date.now();
  const bucket = { async getFiles({ prefix }) {
    if (prefix === "aiGeneratedCache/") return [[], null, {}];
    return [[{ metadata: { timeCreated: new Date(now - RETENTION_MS - 1).toISOString() }, async delete() { throw new Error("storage unavailable"); } }], null, {}];
  } };
  const result = await purgeExpiredMaterials(bucket, now, { db: null });
  assert.deepEqual({ scanned: result.scanned, deleted: result.deleted, failed: result.failed }, { scanned: 1, deleted: 0, failed: 1 });
});

test("orphan uploads and verified image cache use different retention windows", async () => {
  const now = Date.parse("2026-10-02T12:00:00Z");
  function fakeFile(ageMs) {
    return {
      metadata: { timeCreated: new Date(now - ageMs).toISOString() },
      deleted: 0,
      async delete() { this.deleted += 1; }
    };
  }
  const oldUpload = fakeFile(RETENTION_MS + 1);
  const freshUpload = fakeFile(2 * 60 * 60 * 1000);
  const oldCache = fakeFile(MEDIA_CACHE_RETENTION_MS + 1);
  const freshCache = fakeFile(2 * 24 * 60 * 60 * 1000);
  const bucket = { async getFiles({ prefix }) {
    if (prefix === "aiUploads/") return [[oldUpload, freshUpload], null, {}];
    if (prefix === "aiGeneratedCache/") return [[oldCache, freshCache], null, {}];
    throw new Error(`unexpected prefix ${prefix}`);
  } };

  const result = await purgeExpiredMaterials(bucket, now, { db: null });
  assert.equal(oldUpload.deleted, 1);
  assert.equal(freshUpload.deleted, 0);
  assert.equal(oldCache.deleted, 1);
  assert.equal(freshCache.deleted, 0);
  assert.equal(result.cacheDeleted, 1);
  assert.equal(result.cleanupFailed, false);
});
