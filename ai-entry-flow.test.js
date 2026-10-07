const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = __dirname;
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const entry = read('gradecrew-entry-flow.js');
const css = read('gradecrew-auth-startscreen.css');
const polishCss = read('gradecrew-auth-startscreen-polish.css');
const heroCss = read('gradecrew-hero-scene.css');
const heroDemo = read('gradecrew-hero-demo.mjs');
const startup = read('startup.js');
const build = read('tools/build-staging.mjs');
const assets = JSON.parse(read('shared/gradecrew-design/assets.json'));

function blockBetween(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing start marker: ${start}`);
  assert.notEqual(to, -1, `missing end marker: ${end}`);
  return source.slice(from, to);
}

test('entry module has valid JavaScript syntax', () => {
  execFileSync(process.execPath, ['--check', path.join(root, 'gradecrew-entry-flow.js')], { stdio: 'pipe' });
});

test('public start is concise and keeps credentials out of the hero', () => {
  const start = blockBetween(entry, 'id="gcEntryStart"', 'id="gcEntryLogin"');
  assert.match(start, /Hi! Ich bin Coco\./);
  assert.match(start, /Willkommen bei<\/span> GradeCrew\./);
  assert.match(start, /Digitale Tests\. Schnell &amp; einfach\./);
  assert.match(start, /Crew kennenlernen/);
  assert.match(read('index.html'), /id="gcEntryLoginOpen"[^>]*data-i18n-key="hero.login"/);
  assert.doesNotMatch(start, /id="gcEntryLoginOpen"/);
  assert.match(start, /Schüler\? Testcode eingeben\./);
  assert.doesNotMatch(start, /Account erstellen/);
  assert.doesNotMatch(start, /loginEmail|loginPassword|registerEmail|registerPassword/);
});

test('public hero uses the approved scene and keeps named, accessible crew controls', () => {
  const start = blockBetween(entry, 'id="gcEntryStart"', 'id="gcEntryLogin"');
  assert.match(start, /crew-classroom-v3\.webp/);
  for (const name of ['remy', 'emmi', 'wilma']) {
    assert.match(start, new RegExp(`data-hero-crew="${name}"`));
    assert.match(start, new RegExp(`gcHeroHit-${name}`));
  }
  assert.match(start, /id="gcHeroDialog"/);
  assert.match(start, /role="status" aria-live="polite"/);
  assert.ok(fs.statSync(path.join(root, 'assets/gradecrew/crew-classroom-v3.webp')).size < 300_000);
  assert.ok(fs.statSync(path.join(root, 'assets/gradecrew/cuddly-hedgehog.webp')).size < 150_000);
  assert.doesNotMatch(entry, /falcon-create|generic.*mascot/i);
  assert.equal(assets.mascots.coco.animal, 'penguin');
  assert.equal(assets.mascots.remy.animal, 'elephant');
  assert.equal(assets.mascots.emmi.animal, 'fox');
  assert.equal(assets.mascots.wilma.animal, 'owl');
  assert.equal(assets.rules.singleSource, true);
});

test('existing auth and test-code forms are moved instead of cloned', () => {
  for (const id of ['joinForm', 'loginForm', 'registerForm', 'loginTab', 'registerTab']) {
    assert.match(entry, new RegExp(`\\$\\("${id}"\\)`));
  }
  assert.match(entry, /gcEntryJoinHost[^]*append\(joinForm\)/);
  assert.match(entry, /gcEntryLoginFormHost[^]*append\(loginForm\)/);
  assert.match(entry, /gcEntryRegisterFormHost[^]*append\(registerForm\)/);
  assert.match(entry, /joinSubmit\.setAttribute\("aria-label", "Test öffnen"\)/);
});

test('scene, existing entry handlers and separate crew examples are connected', () => {
  assert.doesNotMatch(entry, /nav\.innerHTML|data-entry-nav=/);
  assert.match(entry, /id="gcEntryBenefits"/);
  assert.match(entry, /id="gcHeroHint"/);
  assert.match(entry, /gcHeroArtwork/);
  assert.match(entry, /installHeroDemo\(\$\("gcEntryStart"\)\)/);
  assert.match(entry, /id="gcEntryTutorialStart"/);
  assert.match(entry, /\$\("gcEntryLoginOpen"\)\.addEventListener\("click", showLogin\)/);
  assert.match(heroDemo, /createDemoFlow/);
  assert.match(heroDemo, /gradecrew:ui-locale-changed/);
  assert.match(css, /\.gcPublicEntryMode \.shell/);
  assert.match(heroCss, /#authView \.gcHeroStage/);
  assert.match(blockBetween(entry, 'id="gcEntryStart"', 'id="gcEntryLogin"'), /gcEntryBenefits/);
});

test('responsive and accessibility contracts are explicit', () => {
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /grid-template-areas:[^}]*"lead"[^}]*"crew"[^}]*"actions"[^}]*"student"/);
  assert.match(entry, /aria-hidden/);
  assert.match(entry, /aria-live/);
});

test('public design stays away from dashboard and secure student selectors', () => {
  assert.doesNotMatch(css, /#dashboardView|#studentView|#secure|secureStudent|secure-student/);
  assert.match(css, /#authView/);
  assert.match(css, /\.gcPublicEntryMode/);
});

test('startup installs v6 entry before app handlers and staging packages all scene assets', () => {
  const entryImport = startup.indexOf('const { installGradeCrewEntryFlow } = await import("./gradecrew-entry-flow.js?v=6")');
  const installerCall = startup.indexOf('installGradeCrewEntryFlow();');
  const appImport = startup.indexOf('./app.js?v=2.3.1-gc28');
  assert.ok(entryImport >= 0, 'entry installer must be imported explicitly');
  assert.ok(installerCall > entryImport, 'entry installer must actually be called');
  assert.ok(appImport > installerCall, 'entry must be installed before app handlers bind');
  assert.match(startup, /if \(!entryInstalled\) throw new Error/);
  assert.match(build, /gradecrew-entry-flow\.js/);
  assert.match(build, /gradecrew-auth-startscreen-polish\.css/);
  for (const name of ['gradecrew-hero-copy.mjs', 'gradecrew-hero-demo.mjs', 'gradecrew-hero-demo-flow.mjs', 'gradecrew-hero-scene.css', 'crew-classroom-v3.webp', 'cuddly-hedgehog.webp']) {
    assert.ok(build.includes(name), `staging build missing ${name}`);
  }
  assert.match(startup, /auth-startscreen-v4/);
  assert.match(startup, /auth-startscreen-polish-v1/);
  assert.match(startup, /hero-scene-v2/);
  assert.match(polishCss, /gcPublicEntryMode/);
});

test('crew examples stay readable, pause cleanly and respect reduced motion', async () => {
  const { createDemoFlow } = await import('./gradecrew-hero-demo-flow.mjs?v=1');
  let pending = null;
  let delay = 0;
  let state = null;
  const flow = createDemoFlow({
    onChange: next => { state = next; },
    schedule: (callback, ms) => { pending = callback; delay = ms; return 1; },
    cancel: () => { pending = null; }
  });
  const tick = () => { const callback = pending; pending = null; callback?.(); };
  flow.start('remy');
  assert.equal(state.phase, 0);
  assert.equal(delay, 1800);
  assert.equal(flow.nextPhase(), true);
  assert.equal(state.phase, 1);
  flow.togglePause();
  assert.equal(pending, null);
  assert.equal(flow.nextPhase(), true);
  assert.equal(state.phase, 2);
  assert.equal(pending, null);
  assert.equal(flow.nextPhase(), false);
  flow.replay();
  tick();
  assert.equal(state.phase, 1);
  flow.stop();
  const reduced = createDemoFlow({ reducedMotion: true, onChange: next => { state = next; }, schedule: () => { throw Error('reduced motion scheduled a timer'); } });
  reduced.start('emmi');
  assert.equal(state.phase, 2);
});
