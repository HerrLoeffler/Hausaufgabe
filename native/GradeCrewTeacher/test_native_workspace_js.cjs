const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require(require.resolve('jsdom', { paths: [__dirname, path.join(__dirname, '../../tools/ui')] }));
const resource = path.join(__dirname, 'Resources/gradecrew-native-workspace.js');
const origin = 'https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app';

// The relevant actual staging structure; original controls carry real click handlers.
const html = `<!doctype html><html lang="de"><head></head><body>
<header class="topbar"><div id="userBar"><span id="userLabel">Teacher</span>
<button id="adminTopBtn" class="button ghost hidden">Administration</button>
<button id="settingsTopBtn">Einstellungen</button><button id="logoutBtn">Abmelden</button></div></header>
<main id="mainContent"><section id="dashboardView" class="view">
<div class="pageHead"><div><span class="eyebrow">Dein Arbeitsbereich</span><h1>Meine Tests</h1><p>Alles an einem Ort.</p>
<div id="dashboardOverview"><button class="dashboardMetric">Entwürfe</button></div></div>
<div class="actions dashboardActions"><div class="gcWorkspaceCrewEntry"><div class="gcWorkspaceCrewPortraits"><img src="crew.png"></div>
<button id="gradecrewTourBtn"><span>Crew kennenlernen</span></button><small>Tutorial · ca. 6–7 Minuten</small></div>
<div class="dashboardPrimaryActions"><button id="newQuizBtn" style="position:relative;overflow:visible;padding-left:66px"><img src="remy.png" style="position:absolute;left:-12px;bottom:-2px;width:78px;height:86px">+ Neuer Test</button>
<button id="trashBtn" class="compactTrashBtn" aria-label="Papierkorb – gelöschte Tests"><img src="trash.png"></button></div></div></div>
<div id="quizList"></div></section><section id="settingsView" class="view hidden"><div class="pageHead"><h1>Einstellungen</h1><button id="saveSettingsBtn">Speichern</button></div><div class="settingsPageGrid"></div></section>
<section id="aiView"><button id="aiGenerateBtn">Generieren</button><p id="remyAudit">Audit bleibt</p></section></main>
<div id="cocoAssistant">Coco</div><footer id="appFooter">Status</footer></body></html>`;

function browser(t, { native = true, currentOrigin = origin, frame = false, storage = {}, markup = html } = {}) {
  const dom = new JSDOM(markup, { url: currentOrigin, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  t.after(() => w.close());
  if (native) w.webkit = { messageHandlers: { gradecrewNative: { postMessage() {} } } };
  for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value);
  const controls = {}, clicks = {};
  for (const id of ['gradecrewTourBtn', 'newQuizBtn', 'trashBtn', 'settingsTopBtn', 'logoutBtn', 'saveSettingsBtn', 'aiGenerateBtn']) {
    const node = w.document.getElementById(id); controls[id] = node; clicks[id] = 0;
    if (node) node.onclick = () => { clicks[id]++; };
  }
  const source = fs.existsSync(resource) ? fs.readFileSync(resource, 'utf8') : '';
  // A foreign-frame execution exercises the same early guard with actual DOM otherwise.
  w.eval(source.replace('__GRADECREW_CONFIG__', JSON.stringify({ origin })).replace('window.top !== window.self', frame ? 'true' : 'window.top !== window.self'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return { w, doc: w.document, api: w.GradeCrewNativeWorkspace, controls, clicks };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 30));
const large = b => b.doc.querySelector('.gcWorkspaceCrewEntry');

test('ordinary browsers, other origins and subframes receive no native presentation or login policy', t => {
  for (const options of [{ native: false }, { currentOrigin: 'https://example.org' }, { frame: true }]) {
    const b = browser(t, options);
    assert.equal(b.api, undefined);
    assert.equal(large(b).parentNode.className, 'actions dashboardActions');
    assert.equal(b.doc.getElementById('gcNativeSettingsTutorialBtn'), null);
  }
});

test('the original Crew entry precedes the compact hero and original actions follow metrics', t => {
  const b = browser(t);
  assert.ok(b.api, 'Native workspace presentation must be installed');
  b.api.restoredAccount('teacher-a');
  const dashboard = b.doc.getElementById('dashboardView');
  assert.equal(dashboard.firstElementChild, large(b));
  assert.equal(large(b).nextElementSibling, dashboard.querySelector('.pageHead'));
  const overview = b.doc.getElementById('dashboardOverview');
  assert.ok(overview.nextElementSibling.contains(b.controls.newQuizBtn));
  for (const id of ['gradecrewTourBtn', 'newQuizBtn', 'trashBtn']) {
    assert.equal(b.doc.getElementById(id), b.controls[id]);
    b.doc.getElementById(id).click(); assert.equal(b.clicks[id], 1);
  }
  assert.match(b.controls.trashBtn.textContent, /Papierkorb/);
  assert.equal(b.controls.trashBtn.parentNode.contains(b.controls.newQuizBtn), true);
  assert.equal(b.doc.getElementById('aiView').innerHTML, '<button id="aiGenerateBtn">Generieren</button><p id="remyAudit">Audit bleibt</p>');
  assert.equal(b.doc.getElementById('cocoAssistant').textContent, 'Coco');
  assert.equal(b.doc.getElementById('appFooter').textContent, 'Status');
});

test('restores and page reloads never count; the fifth acknowledged login hides only the large entry', t => {
  const b = browser(t); assert.ok(b.api);
  for (let i = 0; i < 12; i++) b.api.restoredAccount('teacher-a');
  assert.equal(large(b).hidden, false);
  for (let i = 1; i <= 4; i++) { b.api.recordLogin('teacher-a'); assert.equal(large(b).hidden, false); }
  b.api.recordLogin('teacher-a'); assert.equal(large(b).hidden, true);
  const snapshot = Object.fromEntries(Object.keys(b.w.localStorage).map(key => [key, b.w.localStorage.getItem(key)]));
  const reloaded = browser(t, { storage: snapshot }); reloaded.api.restoredAccount('teacher-a');
  assert.equal(large(reloaded).hidden, true);
  const replay = reloaded.doc.getElementById('gcNativeSettingsTutorialBtn');
  assert.ok(replay); assert.equal(replay.hidden, false); assert.equal(replay.disabled, false);
  replay.click(); assert.equal(reloaded.clicks.gradecrewTourBtn, 1);
  assert.equal(large(reloaded).hidden, true);
});

test('account changes and logout reject stale login acknowledgements and keep counts isolated', t => {
  const b = browser(t); assert.ok(b.api);
  b.api.restoredAccount('teacher-a');
  for (let i = 0; i < 5; i++) b.api.recordLogin('teacher-a');
  b.api.restoredAccount('teacher-b'); assert.equal(large(b).hidden, false);
  for (let i = 0; i < 10; i++) b.api.recordLogin('teacher-a');
  assert.equal(large(b).hidden, false);
  b.api.recordLogin('teacher-b'); b.api.restoredAccount(null);
  for (let i = 0; i < 10; i++) b.api.recordLogin('teacher-b');
  b.api.restoredAccount('teacher-b');
  for (let i = 0; i < 3; i++) b.api.recordLogin('teacher-b');
  assert.equal(large(b).hidden, false);
  b.api.recordLogin('teacher-b'); assert.equal(large(b).hidden, true);
  b.api.restoredAccount('teacher-a'); assert.equal(large(b).hidden, true);
});

test('settings replay follows the current original tutorial handler even after a renderer replaces the button', async t => {
  const b = browser(t); assert.ok(b.api); b.api.restoredAccount('teacher-a');
  for (let i = 0; i < 5; i++) b.api.recordLogin('teacher-a');
  let starts = 0;
  const replacement = b.doc.createElement('button'); replacement.id = 'gradecrewTourBtn'; replacement.onclick = () => { starts++; };
  b.controls.gradecrewTourBtn.replaceWith(replacement);
  await settle();
  b.doc.getElementById('gcNativeSettingsTutorialBtn').click();
  assert.equal(starts, 1); assert.equal(b.clicks.gradecrewTourBtn, 0);
  assert.equal(large(b).hidden, true);
});

test('teachers retain original top settings and logout while admin visibility stays owned by the web app', async t => {
  const b = browser(t); assert.ok(b.api);
  const admin = b.doc.getElementById('adminTopBtn');
  assert.equal(admin.classList.contains('hidden'), true);
  for (const id of ['settingsTopBtn', 'logoutBtn']) {
    assert.equal(b.doc.getElementById(id), b.controls[id]);
    assert.notEqual(b.w.getComputedStyle(b.controls[id]).display, 'none');
    assert.ok(b.controls[id].compareDocumentPosition(large(b)) & b.w.Node.DOCUMENT_POSITION_FOLLOWING);
    b.controls[id].click(); assert.equal(b.clicks[id], 1);
  }
  admin.classList.remove('hidden'); await settle();
  assert.notEqual(b.w.getComputedStyle(b.controls.settingsTopBtn).display, 'none');
  assert.notEqual(b.w.getComputedStyle(b.controls.logoutBtn).display, 'none');
  assert.equal(admin.classList.contains('hidden'), false);
  admin.hidden = true; await settle();
  assert.equal(admin.hidden, true);
});

test('repeated dashboard renders and locale observations remain idempotent and refresh labels', async t => {
  const b = browser(t); assert.ok(b.api); b.api.restoredAccount('teacher-a');
  for (let i = 0; i < 8; i++) {
    b.controls.gradecrewTourBtn.innerHTML = '<span>Crew kennenlernen</span><small>Tutorial · ca. 6–7 Minuten</small>';
    b.doc.getElementById('quizList').append(b.doc.createElement('article'));
    await settle();
  }
  assert.equal(b.doc.querySelectorAll('.gcWorkspaceCrewEntry').length, 1);
  assert.equal(b.doc.querySelectorAll('#gcNativeSettingsTutorialBtn').length, 1);
  assert.equal(b.doc.querySelectorAll('[data-gc-native-trash-label]').length, 1);
  assert.equal(large(b).querySelectorAll(':scope > small').length, 1);
  b.doc.documentElement.lang = 'en-GB'; await settle();
  assert.equal(b.doc.getElementById('gcNativeSettingsTutorialBtn').textContent, 'Start tutorial');
  assert.match(b.controls.trashBtn.textContent, /Trash/);
  b.controls.gradecrewTourBtn.click(); assert.equal(b.clicks.gradecrewTourBtn, 1);
  b.controls.newQuizBtn.click(); assert.equal(b.clicks.newQuizBtn, 1);
});

test('late tutorial mounting and blocked storage still support account-scoped replay and five logins', async t => {
  const b = browser(t, { markup: html.replace(/<div class="gcWorkspaceCrewEntry">[\s\S]*?<\/small><\/div>/, '') });
  assert.ok(b.api);
  Object.defineProperty(b.w, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  b.api.restoredAccount('teacher-a');
  const button = b.doc.createElement('button'); button.id = 'gradecrewTourBtn'; let starts = 0; button.onclick = () => { starts++; };
  b.doc.querySelector('.dashboardActions').append(button); await settle();
  assert.equal(b.doc.getElementById('dashboardView').firstElementChild, large(b));
  for (let i = 0; i < 5; i++) b.api.recordLogin('teacher-a');
  assert.equal(large(b).hidden, true);
  b.api.restoredAccount('teacher-b'); assert.equal(large(b).hidden, false);
  b.api.restoredAccount('teacher-a'); assert.equal(large(b).hidden, true);
  b.doc.getElementById('gcNativeSettingsTutorialBtn').click(); assert.equal(starts, 1);
});


test('settings replay returns through the shared back handler before the real dashboard-only tutorial guard', async t => {
  const b = browser(t); b.api.restoredAccount('teacher-a');
  const dashboard = b.doc.getElementById('dashboardView'); dashboard.classList.add('hidden');
  const back = b.doc.createElement('button'); back.id = 'backFromSettings';
  let returns = 0, starts = 0;
  back.onclick = () => { returns++; dashboard.classList.remove('hidden'); };
  b.doc.getElementById('settingsView').append(back);
  b.controls.gradecrewTourBtn.onclick = () => { if (!dashboard.classList.contains('hidden')) starts++; };
  b.doc.getElementById('gcNativeSettingsTutorialBtn').click();
  await settle();
  assert.equal(returns, 1); assert.equal(starts, 1);
});
