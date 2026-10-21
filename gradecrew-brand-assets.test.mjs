import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('shared/gradecrew-design/assets.json', 'utf8'));
const startup = fs.readFileSync('startup.js', 'utf8');
const generated = fs.readFileSync('generated/gradecrew-assets.js', 'utf8');
const swift = fs.readFileSync('native/Shared/GradeCrewAssets.swift', 'utf8');
const build = fs.readFileSync('tools/build-staging.mjs', 'utf8');
const logoCss = fs.readFileSync('gradecrew-logo.css', 'utf8');

const primary = `${manifest.root}/${manifest.brand.primary}`;
const icon = `${manifest.root}/${manifest.brand.icon}`;
const favicon = `${manifest.root}/${manifest.brand.favicon}`;
const legacyFavicon = `${manifest.root}/penguin-icon.svg`;

test('GradeCrew Brand Core is the canonical cross-product source', () => {
  assert.equal(manifest.version, '1.2.0');
  assert.equal(manifest.brand.primary, 'brand-primary-v1.svg');
  assert.equal(manifest.brand.icon, 'brand-icon-v1.svg');
  assert.equal(manifest.brand.favicon, manifest.brand.icon);
  assert.equal(manifest.rules.singleSource, true);
  assert.equal(manifest.rules.noProductSpecificCopies, true);
  assert.equal(manifest.rules.newCodeMustUseManifestNames, true);
  assert.deepEqual(manifest.rules.brandCoreRequiredFor, ['web', 'teacherApp', 'games', 'live', 'student']);
  assert.equal(manifest.rules.secureUsesDedicatedVariant, true);
  assert.ok(fs.existsSync(primary), `missing ${primary}`);
  assert.ok(fs.existsSync(icon), `missing ${icon}`);
  assert.ok(fs.existsSync(favicon), `missing ${favicon}`);
});

test('browser icon is the supplied vector artwork, tightly cropped and raster-free', () => {
  const iconSvg = fs.readFileSync(icon, 'utf8');
  assert.match(iconSvg, /viewBox="142 125 971 971"/);
  assert.doesNotMatch(iconSvg, /<image\b/i);
  assert.doesNotMatch(iconSvg, /<path fill="white" d="M0 0L1254/);
  assert.match(iconSvg, /#812CFB/);
  assert.match(iconSvg, /#002C6B/);
  assert.equal(fs.readFileSync(legacyFavicon, 'utf8'), iconSvg, 'legacy first-paint favicon must mirror Brand Core icon');
});

test('generated web and native maps expose the same semantic brand assets', () => {
  assert.match(generated, /"primary": "assets\/gradecrew\/brand-primary-v1\.svg"/);
  assert.match(generated, /"icon": "assets\/gradecrew\/brand-icon-v1\.svg"/);
  assert.match(generated, /"favicon": "assets\/gradecrew\/brand-icon-v1\.svg"/);
  assert.match(swift, /enum Brand/);
  assert.match(swift, /static let primary = "assets\/gradecrew\/brand-primary-v1\.svg"/);
  assert.match(swift, /static let icon = "assets\/gradecrew\/brand-icon-v1\.svg"/);
  assert.match(swift, /static let favicon = "assets\/gradecrew\/brand-icon-v1\.svg"/);
});

test('normal web app mounts header and favicon from generated asset map', () => {
  assert.match(startup, /generated\/gradecrew-assets\.js\?v=1\.2\.0/);
  assert.match(startup, /GRADECREW_ASSETS\.brand\?\.primary/);
  assert.match(startup, /GRADECREW_ASSETS\.brand\?\.favicon/);
  assert.match(startup, /\.brandMark, \[data-gradecrew-brand-mark\]/);
  assert.match(startup, /gradecrew-logo\.css/);
  assert.match(logoCss, /data-gradecrew-brand-ready/);
});

test('staging build carries brand runtime and canonical SVG assets', () => {
  assert.match(build, /generated\/gradecrew-assets\.js/);
  assert.match(build, /gradecrew-logo\.css/);
  assert.match(build, /assets\/gradecrew/);
});
