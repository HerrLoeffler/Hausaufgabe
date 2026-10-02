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

test('primary GradeCrew logo is a canonical manifest asset', () => {
  assert.equal(manifest.version, '1.1.0');
  assert.equal(manifest.brand.primary, 'brand-primary-v1.svg');
  assert.equal(manifest.brand.icon, manifest.brand.primary);
  assert.equal(manifest.brand.favicon, manifest.brand.primary);
  assert.equal(manifest.rules.singleSource, true);
  assert.ok(fs.existsSync(primary), `missing ${primary}`);
});

test('generated web and native maps expose the same semantic brand asset', () => {
  assert.match(generated, /"primary": "assets\/gradecrew\/brand-primary-v1\.svg"/);
  assert.match(generated, /"favicon": "assets\/gradecrew\/brand-primary-v1\.svg"/);
  assert.match(swift, /enum Brand/);
  assert.match(swift, /static let primary = "assets\/gradecrew\/brand-primary-v1\.svg"/);
  assert.match(swift, /static let favicon = "assets\/gradecrew\/brand-primary-v1\.svg"/);
});

test('normal web app mounts header and favicon from generated asset map', () => {
  assert.match(startup, /generated\/gradecrew-assets\.js/);
  assert.match(startup, /GRADECREW_ASSETS\.brand\?\.primary/);
  assert.match(startup, /GRADECREW_ASSETS\.brand\?\.favicon/);
  assert.match(startup, /\.brandMark, \[data-gradecrew-brand-mark\]/);
  assert.match(startup, /gradecrew-logo\.css/);
  assert.match(logoCss, /data-gradecrew-brand-ready/);
});

test('staging build carries brand runtime and canonical SVG', () => {
  assert.match(build, /generated\/gradecrew-assets\.js/);
  assert.match(build, /gradecrew-logo\.css/);
  assert.match(build, /assets\/gradecrew/);
});
