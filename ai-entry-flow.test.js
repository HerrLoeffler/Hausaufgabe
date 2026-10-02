const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = __dirname;
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const entry = read('gradecrew-entry-flow.js');
const css = read('gradecrew-auth-startscreen.css');
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

test('public start is a distinct, minimal state without auth credential fields', () => {
  const start = blockBetween(entry, 'id="gcEntryStart"', 'id="gcEntryLogin"');
  assert.match(start, /Hi! Ich bin Coco\./);
  assert.match(start, /Willkommen bei GradeCrew\./);
  assert.match(start, /Digitale Tests, schnell &amp; einfach\./);
  assert.match(start, /Crew kennenlernen/);
  assert.match(start, /Direkt anmelden/);
  assert.match(start, /Schüler\? Testcode eingeben\./);
  assert.doesNotMatch(start, /Account erstellen/);
  assert.doesNotMatch(start, /loginEmail|loginPassword|registerEmail|registerPassword/);
});

test('public hero uses canonical current brand and crew assets', () => {
  const start = blockBetween(entry, 'id="gcEntryStart"', 'id="gcEntryLogin"');
  assert.match(start, /GRADECREW_ASSETS\.brand\.primary/);
  assert.match(start, /GRADECREW_ASSETS\.mascots\.coco\.welcome/);
  assert.match(entry, /\["remy", "Remy", "Erstellen"\]/);
  assert.match(entry, /\["emmi", "Emmi", "Verbessern"\]/);
  assert.match(entry, /\["wilma", "Wilma", "Prüfen"\]/);
  assert.doesNotMatch(entry, /falcon-create|generic.*mascot/i);
});

test('existing forms and test-code form are moved instead of cloned', () => {
  for (const id of ['joinForm', 'loginForm', 'registerForm', 'loginTab', 'registerTab']) {
    assert.match(entry, new RegExp(`\\$\\("${id}"\\)`));
  }
  assert.match(entry, /gcEntryJoinHost[^]*append\(joinForm\)/);
  assert.match(entry, /gcEntryLoginFormHost[^]*append\(loginForm\)/);
  assert.match(entry, /gcEntryRegisterFormHost[^]*append\(registerForm\)/);
});

test('canonical design manifest and existing tutorial data are the only entry sources', () => {
  assert.match(entry, /GRADECREW_ASSETS/);
  assert.match(entry, /CREW, DEMO_TEST/);
  assert.equal(assets.mascots.coco.animal, 'penguin');
  assert.equal(assets.mascots.remy.animal, 'elephant');
  assert.equal(assets.mascots.emmi.animal, 'fox');
  assert.equal(assets.mascots.wilma.animal, 'owl');
  assert.equal(assets.rules.singleSource, true);
});

test('guest tutorial asks only for display name before the experience', () => {
  const name = blockBetween(entry, 'id="gcEntryTutorialName"', 'id="gcEntryTutorial"');
  assert.match(name, /Wie dürfen wir dich nennen/);
  assert.match(name, /Name oder Anzeigename/);
  assert.doesNotMatch(name, /type="email"|Passwort wiederholen|registerEmail/);
  assert.match(entry, /DEMO_TEST\.questions/);
});

test('account gate happens after tutorial and offers register, login and later', () => {
  const gate = blockBetween(entry, 'id="gcEntryAccountGate"', '</div>`;');
  assert.match(gate, /Fortschritt speichern/);
  assert.match(gate, /Account erstellen/);
  assert.match(gate, /Anmelden/);
  assert.match(gate, /Später/);
});

test('student access is visually separated and concise benefits stay secondary', () => {
  assert.match(css, /\.gcEntryStudent[^]*background:\s*linear-gradient/);
  assert.match(css, /\.gcEntryBenefits/);
  assert.match(entry, /Schnell erstellt/);
  assert.match(entry, /Einfach durchgeführt/);
  assert.match(entry, /Direkt ausgewertet/);
});

test('responsive and accessibility contracts are explicit', () => {
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(entry, /aria-hidden/);
  assert.match(entry, /aria-live/);
  assert.match(entry, /id=\"gcEntryTutorialTitle\"/);
  assert.match(css, /grid-template-areas:\s*"lead" "crew" "actions" "student" "benefits"/);
});

test('new public styling cannot target secure student screens', () => {
  assert.doesNotMatch(css, /secureStudent|secure-student|studentView/);
  assert.match(css, /#authView/);
});

test('startup installs entry before app handlers and staging packages it', () => {
  assert.ok(startup.indexOf('gradecrew-entry-flow.js') < startup.indexOf('./app.js?v=2.3.1-gc28'));
  assert.match(build, /gradecrew-entry-flow\.js/);
  assert.match(startup, /auth-startscreen-v3/);
  assert.match(startup, /gradecrew-entry-flow\.js\?v=2/);
});
