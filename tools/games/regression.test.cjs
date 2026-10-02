const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
let temporary, output;

before(async () => {
  temporary = await fsp.mkdtemp(path.join(os.tmpdir(), 'gradecrew-games-regression.'));
  execFileSync(process.execPath, [path.join(root, 'tools/build-lab-games-hub.mjs'), temporary]);
  output = path.join(temporary, 'public');
});
after(async () => { if (temporary) await fsp.rm(temporary, { recursive: true, force: true }); });

async function openPage(relative = '', query = '', setup) {
  const html = fs.readFileSync(path.join(output, relative, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://games.example/' + (relative ? relative + '/' : '') + query, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const errors = [], requests = [];
  const observers = [], NativeObserver = w.MutationObserver, close = w.close.bind(w);
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  w.close = () => { observers.forEach(observer => observer.disconnect()); close(); };
  w.addEventListener('error', event => errors.push(event.error || event.message));
  w.scrollTo = () => {};
  // JSDOM exposes <dialog> but not the modal methods used by real browsers.
  // Keep this compatibility shim test-only so product code still exercises the native API.
  if (w.HTMLDialogElement) {
    w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  }
  w.fetch = async (url, init) => {
    const body = JSON.parse(init?.body || '{}');
    requests.push({ url, ...body });
    return new Response(JSON.stringify({ ok: true, data: { leaderboard: [], entries: [] } }), { headers: { 'Content-Type': 'application/json' } });
  };
  w.QRCode = Object.assign(function () {}, { CorrectLevel: { M: 0 } });
  if (setup) setup(w);
  try {
    for (const script of w.document.querySelectorAll('script[src]')) {
      const src = script.getAttribute('src');
      if (/^https?:/.test(src)) continue;
      w.eval(fs.readFileSync(path.resolve(output, relative, src), 'utf8'));
    }
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 35));
    assert.equal(errors.length, 0, errors.map(String).join('\n'));
  } catch (error) { w.close(); throw error; }
  return { dom, w, document: w.document, requests };
}
function change(w, element, value) {
  element.value = value;
  element.dispatchEvent(new w.Event('input', { bubbles: true }));
}

test('hub filters by subject and topic, resets an empty result, and updates direct mode links', async () => {
  const { w, document: d } = await openPage();
  try {
    assert.equal(d.querySelectorAll('.gameCard').length, 4);
    assert.equal(d.querySelector('[data-game="escape-room"]') !== null, true);
    assert.equal(d.querySelector('#joinGame option[value="escape-room"]'), null);
    d.querySelector('[data-subject="german"]').click();
    assert.equal(d.querySelector('.gameCard').dataset.game, 'fehlerjagd-deutsch');
    change(w, d.getElementById('gameSearch'), 'Brüche');
    assert.equal(d.getElementById('emptyState').hidden, false);
    d.getElementById('resetFilters').click();
    change(w, d.getElementById('gameSearch'), 'Runden');
    assert.equal(d.querySelectorAll('.gameCard').length, 1);
    assert.equal(d.querySelector('.gameCard').dataset.game, 'fast-quiz');
    const live = d.querySelector('[name="hub-mode"][value="live"]');
    live.checked = true;
    live.dispatchEvent(new w.Event('change', { bubbles: true }));
    assert.equal(d.querySelector('[data-game="escape-room"]'), null);
    assert.match(d.querySelector('.gameCard .primary').href, /fast-quiz\/\?mode=live$/);
    assert.equal(w.location.search, '?mode=live');
  } finally { w.close(); }
});
test('favorites persist, retain keyboard focus, and can be removed inside the favorites filter', async () => {
  const { w, document: d } = await openPage();
  try {
    d.querySelector('[data-game="vocab-rush"] .favoriteButton').click();
    assert.equal(d.activeElement.getAttribute('aria-label'), 'Vocab Rush als Favorit');
    assert.equal(w.localStorage.getItem('gradecrew-games-favorites-v1'), '["vocab-rush"]');
    d.getElementById('favoritesOnly').click();
    assert.equal(d.querySelectorAll('.gameCard').length, 1);
    d.querySelector('.favoriteButton').click();
    assert.equal(d.getElementById('emptyState').hidden, false);
    assert.equal(d.activeElement.id, 'favoritesOnly');
    assert.equal(w.localStorage.getItem('gradecrew-games-favorites-v1'), '[]');
  } finally { w.close(); }
});
test('invalid or inaccessible storage does not stop the hub', async () => {
  for (const value of ['broken json', '{"not":"an array"}', '["unknown-game"]']) {
    const { w, document: d } = await openPage('', '', w => w.localStorage.setItem('gradecrew-games-favorites-v1', value));
    try { assert.equal(d.querySelectorAll('.gameCard').length, 4); } finally { w.close(); }
  }
  const { w, document: d } = await openPage('', '', w => {
    Object.defineProperty(w, 'localStorage', { get() { throw new w.DOMException('Disabled', 'SecurityError'); } });
  });
  try { d.querySelector('.favoriteButton').click(); assert.equal(d.querySelector('.favoriteButton').getAttribute('aria-pressed'), 'true'); }
  finally { w.close(); }
});
test('joining preserves leading zeroes and requires both a live-capable game and exactly six digits', async () => {
  const { w, document: d } = await openPage();
  try {
    const form = d.getElementById('joinForm'), code = d.getElementById('joinCode');
    assert.equal(form.checkValidity(), false);
    assert.equal([...d.getElementById('joinGame').options].some(option => option.value === 'escape-room'), false);
    d.getElementById('joinGame').value = 'vocab-rush';
    change(w, code, '00 1-234');
    assert.equal(code.value, '001234');
    assert.equal(form.checkValidity(), true);
    change(w, code, '123');
    assert.equal(form.checkValidity(), false);
  } finally { w.close(); }
});

for (const game of ['fast-quiz', 'fehlerjagd-deutsch', 'vocab-rush']) {
  for (const mode of ['practice', 'highscore', 'live']) {
    test(game + ' enters ' + mode + ' through the complete addon chain', async () => {
      const { w, document: d, requests } = await openPage(game, '?mode=' + mode);
      try {
        const view = d.getElementById(mode === 'highscore' ? 'highscoreView' : 'setupView');
        assert.equal(view.hidden, false);
        assert.equal(d.getElementById('homeView').hidden, true);
        if (mode !== 'highscore') assert.equal(d.getElementById(game === 'fast-quiz' ? 'teacherOnlyRules' : 'teacherRules').hidden, mode !== 'live');
        else assert.ok(requests.some(request => request.action === (game === 'fast-quiz' ? 'highscoreBoard' : 'leaderboard')));
        if (game === 'vocab-rush' && mode === 'highscore') assert.ok(d.getElementById('vrHighscoreOptions'));
        if (game === 'fast-quiz' && mode !== 'highscore') assert.ok(d.querySelector('[name="operation"][value="round"]'));
        assert.equal(w.location.search, '');
        assert.match(d.querySelector('.gc-games-home').href, new RegExp('\\?mode=' + mode + '$'));
      } finally { w.close(); }
    });
  }
  test(game + ' keeps a QR join link ahead of a conflicting mode parameter', async () => {
    const { w, document: d, requests } = await openPage(game, '?join=001234&mode=live');
    try {
      assert.equal(d.getElementById('joinView').hidden, false);
      assert.equal(d.getElementById('joinCode').value, '001234');
      assert.equal(d.getElementById('setupView').hidden, true);
      assert.equal(requests.length, 0);
      assert.equal(w.location.search, '?join=001234');
    } finally { w.close(); }
  });
}

test('escape room enters practice through the shared shell and keeps the teacher preview available', async () => {
  const { w, document: d } = await openPage('escape-room', '?mode=practice');
  try {
    assert.equal(d.getElementById('gameView').hidden, false);
    assert.equal(d.getElementById('homeView').hidden, true);
    assert.equal(d.querySelectorAll('.gc-games-nav').length, 1);
    assert.ok(d.getElementById('teacherPreviewBtn'));
    assert.equal(w.location.search, '');
  } finally { w.close(); }
});

test('built engines and applications match their canonical sources byte for byte', async () => {
  for (const [game, files] of Object.entries({
    'fast-quiz': ['app-v4.js', 'math-engine-v4.js', 'rounding-plus.js'],
    'fehlerjagd-deutsch': ['app.js', 'deutsch-engine.js', 'task-integrity.js', 'feedback-polish.js'],
    'vocab-rush': ['app.js', 'curriculum.js', 'library-plus.js', 'mode-consistency.js', 'learning-plus.js', 'ux-polish.js', 'camera-plus.js', 'crop-universal.js'],
    'escape-room': ['app.js', 'escape-data.js']
  })) {
    for (const file of files) assert.deepEqual(fs.readFileSync(path.join(output, game, file)), fs.readFileSync(path.join(root, 'lab', game, file)));
  }
});
test('root and child release manifests verify the actual files including the shared shell', () => {
  const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  for (const dir of ['', 'fast-quiz', 'fehlerjagd-deutsch', 'vocab-rush', 'escape-room']) {
    const release = JSON.parse(fs.readFileSync(path.join(output, dir, 'lab-release.json')));
    for (const [file, hash] of Object.entries(release.files)) assert.equal(sha(path.join(output, dir, file)), hash, dir + '/' + file);
    for (const [file, hash] of Object.entries(release.sharedFiles || {})) assert.equal(sha(path.join(output, 'shared', file)), hash);
  }
  const config = JSON.parse(fs.readFileSync(path.join(temporary, 'firebase.json')));
  assert.equal(config.hosting.site, 'hausaufgabe-staging');
  assert.equal(config.functions, undefined);
  assert.equal(config.firestore, undefined);
});