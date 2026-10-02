const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
let temporary, output;

before(async () => {
  temporary = await fsp.mkdtemp(path.join(os.tmpdir(), 'gradecrew-games-design.'));
  execFileSync(process.execPath, [path.join(root, 'tools/build-lab-games-hub.mjs'), temporary]);
  output = path.join(temporary, 'public');
});
after(async () => { if (temporary) await fsp.rm(temporary, { recursive: true, force: true }); });

function runLocalScripts(relative) {
  const page = path.join(output, relative, 'index.html');
  const html = fs.readFileSync(page, 'utf8');
  const dom = new JSDOM(html, { url: `https://games.example/${relative ? relative + '/' : ''}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.scrollTo = () => {};
  w.fetch = async () => new Response(JSON.stringify({ ok: true, data: { leaderboard: [], entries: [] } }), { headers: { 'Content-Type': 'application/json' } });
  w.QRCode = Object.assign(function () {}, { CorrectLevel: { M: 0 } });
  for (const script of w.document.querySelectorAll('script[src]')) {
    const src = script.getAttribute('src');
    if (/^https?:/.test(src)) continue;
    w.eval(fs.readFileSync(path.resolve(path.dirname(page), src), 'utf8'));
  }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return { dom, w, document: w.document };
}

test('shared Games Design System assets and living preview are in the isolated build', () => {
  for (const file of ['shared/games-design-system.css', 'shared/games-design-system.js', 'design-system/index.html', 'design-system/preview.css']) {
    assert.ok(fs.existsSync(path.join(output, file)), file);
  }
  const preview = fs.readFileSync(path.join(output, 'design-system/index.html'), 'utf8');
  for (const marker of ['Games Design System', 'Kopfrechnen', 'Runden', 'Block & Stift', 'Weitere Einstellungen']) assert.match(preview, new RegExp(marker));
});

test('all canonical game pages consume the same shared Games Design System layer', () => {
  for (const game of ['fast-quiz', 'fehlerjagd-deutsch', 'vocab-rush']) {
    const html = fs.readFileSync(path.join(output, game, 'index.html'), 'utf8');
    assert.match(html, /\.\.\/shared\/games-design-system\.css/);
    assert.match(html, /\.\.\/shared\/games-design-system\.js/);
    const release = JSON.parse(fs.readFileSync(path.join(output, game, 'lab-release.json'), 'utf8'));
    assert.equal(release.gamesDesignSystemVersion, '0.1.0');
    assert.equal(release.hubShellFormat, 2);
  }
  const rootRelease = JSON.parse(fs.readFileSync(path.join(output, 'lab-release.json'), 'utf8'));
  assert.equal(rootRelease.gamesDesignSystemVersion, '0.1.0');
  assert.equal(rootRelease.features.sharedGamesDesignSystem, true);
  assert.equal(rootRelease.features.designSystemPreview, true);
});

test('games semantic CSS aliases product-wide GradeCrew tokens instead of replacing them', () => {
  const css = fs.readFileSync(path.join(root, 'lab/shared/games-design-system.css'), 'utf8');
  for (const token of ['--gc-colors-background', '--gc-colors-surface', '--gc-colors-primary', '--gc-radius-card', '--gc-spacing-xl', '--gc-layout-minimum-touch-target']) {
    assert.ok(css.includes(`var(${token},`), token);
  }
  assert.match(css, /\.gcg-advanced/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-height:var\(--gcg-touch/);
});

test('living preview exposes the design version and keeps choice state synchronized', () => {
  const { w, document: d } = runLocalScripts('design-system');
  try {
    assert.equal(d.documentElement.getAttribute('data-gcg-version'), '0.1.0');
    assert.equal(w.GradeCrewGamesDesign.version, '0.1.0');
    const radios = [...d.querySelectorAll('input[name="profile"]')];
    const choices = radios.map(input => input.closest('.gcg-choice'));
    assert.equal(choices[0].dataset.selected, 'true');
    radios[1].checked = true;
    radios[1].dispatchEvent(new w.Event('change', { bubbles: true }));
    assert.equal(choices[0].dataset.selected, 'false');
    assert.equal(choices[1].dataset.selected, 'true');
  } finally { w.close(); }
});

test('shared helper stores namespaced local preferences and fails safely on missing values', () => {
  const { w } = runLocalScripts('design-system');
  try {
    assert.equal(w.GradeCrewGamesDesign.saveLocalPreference('fast-quiz', 'last-setup', { mode: 'mental' }), true);
    const saved = w.GradeCrewGamesDesign.loadLocalPreference('fast-quiz', 'last-setup');
    assert.equal(saved.mode, 'mental');
    assert.equal(Object.keys(saved).length, 1);
    assert.equal(w.GradeCrewGamesDesign.loadLocalPreference('fast-quiz', 'missing', 'fallback'), 'fallback');
    assert.throws(() => w.GradeCrewGamesDesign.saveLocalPreference('../bad', 'x', {}));
  } finally { w.close(); }
});
