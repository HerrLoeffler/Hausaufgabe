"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");
const { prepareMaterialInput, sanitizeMaterials } = require("../lib/materials");

test("material provider requests use neutral filenames with the correct format", async () => {
  for (const [mime, ext] of [["application/pdf", "pdf"], ["text/plain", "txt"], ["text/csv", "csv"]]) {
    const payload = await prepareMaterialInput(Buffer.from("fixture"), mime, 0);
    assert.equal(payload.filename, `unterrichtsmaterial-1.${ext}`);
    assert.ok(payload.file_data.startsWith(`data:${mime};base64,`));
  }
});

test("image orientation is applied before stripping EXIF metadata and the pixels remain readable", async () => {
  const original = await sharp({ create: { width: 20, height: 10, channels: 3, background: "white" } })
    .jpeg().withMetadata({ orientation: 6 }).withExif({ IFD0: { Artist: "PRIVATE NAME" } }).toBuffer();
  assert.ok((await sharp(original).metadata()).exif);
  const payload = await prepareMaterialInput(original, "image/jpeg", 0);
  const clean = Buffer.from(payload.image_url.split(",")[1], "base64");
  const meta = await sharp(clean).metadata();
  assert.equal(meta.width, 10); assert.equal(meta.height, 20);
  assert.equal(meta.exif, undefined); assert.equal(meta.orientation, undefined);
  assert.equal(clean.includes(Buffer.from("PRIVATE NAME")), false);
});

test("a declared image MIME cannot conceal another image format", async () => {
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(prepareMaterialInput(png, "image/jpeg", 0), /Dateityp/);
});

 test("material sanitizer keeps ten images or documents and retains existing overflow truncation", () => {
 for (const mimeType of ["image/png", "application/pdf"]) {
 const files=Array.from({length:11},(_,i)=>({id:`m${i}`,storagePath:`aiUploads/teacher/m${i}`,mimeType,name:`fixture${i}`}));
 assert.equal(sanitizeMaterials(files.slice(0,10),"teacher").length,10);
 assert.deepEqual(sanitizeMaterials(files,"teacher").map(x=>x.id),files.slice(0,10).map(x=>x.id));
 }
 });
