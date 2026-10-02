const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const iconPath = path.join(root, 'assets/gradecrew/brand-icon-v1.svg');
const hub = fs.readFileSync(path.join(root, 'lab/games-hub/index.html'), 'utf8');
const build = fs.readFileSync(path.join(root, 'tools/build-lab-games-hub.mjs'), 'utf8');
const brandCss = fs.readFileSync(path.join(root, 'lab/shared/brand-core.css'), 'utf8');

test('games use the canonical GradeCrew vector icon', () => {
  assert.ok(fs.existsSync(iconPath));
  const svg = fs.readFileSync(iconPath, 'utf8');
  assert.match(svg, /viewBox="142 125 971 971"/);
  assert.doesNotMatch(svg, /<image\b/i);
  assert.match(svg, /#812CFB/);
  assert.match(svg, /#002C6B/);
});

test('games hub and child build use one Brand Core asset path', () => {
  assert.match(hub, /assets\/gradecrew\/brand-icon-v1\.svg/);
  assert.match(hub, /shared\/brand-core\.css/);
  assert.match(build, /const brandIcon = 'assets\/gradecrew\/brand-icon-v1\.svg'/);
  assert.match(build, /gc-brand-icon/);
  assert.match(build, /rel=\\?"icon\\?"/);
  assert.match(build, /brand-core\.css/);
  assert.match(brandCss, /\.gc-brand-icon/);
});

test('games do not introduce a product-specific logo copy', () => {
  for (const forbidden of ['games-logo.svg', 'game-logo.svg', 'gradecrew-games-logo.svg']) {
    assert.equal(hub.includes(forbidden), false);
    assert.equal(build.includes(forbidden), false);
  }
});
