"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { purgeExpiredMaterials, RETENTION_MS } = require("../lib/purge-materials");

test("removes expired AI uploads across pages and keeps recent files", async () => {
  const now = Date.parse("2026-09-24T12:00:00Z");
  const old = { metadata: { timeCreated: new Date(now - RETENTION_MS - 1).toISOString() }, async delete() { this.deleted = true; } };
  const recent = { metadata: { timeCreated: new Date(now - RETENTION_MS + 1).toISOString() }, async delete() { this.deleted = true; } };
  const unknown = { metadata: {}, async delete() { this.deleted = true; } };
  const pages = [[old, recent], [unknown]];
  const bucket = { async getFiles(opts) {
    assert.equal(opts.prefix, "aiUploads/");
    assert.equal(opts.autoPaginate, false);
    const page = opts.pageToken ? 1 : 0;
    return [pages[page], null, { nextPageToken: page === 0 ? "next" : undefined }];
  } };
  assert.deepEqual(await purgeExpiredMaterials(bucket, now), { scanned: 3, deleted: 1, failed: 0 });
  assert.equal(old.deleted, true);
  assert.equal(recent.deleted, undefined);
  assert.equal(unknown.deleted, undefined);
});

test("counts unexpected deletion errors so the scheduled job reports failure", async () => {
  const now = Date.now();
  const bucket = { async getFiles() { return [[{ metadata: { timeCreated: new Date(now - RETENTION_MS - 1).toISOString() }, async delete() { throw new Error("storage unavailable"); } }], null, {}]; } };
  assert.deepEqual(await purgeExpiredMaterials(bucket, now), { scanned: 1, deleted: 0, failed: 1 });
});
