const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
const app = readFileSync(path.join(root, 'app.js'), 'utf8');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const fn = name => app.match(new RegExp(`function ${name}\\([^]*?\\n\\}`))?.[0];
function fixture(t, url = 'https://hausaufgabe-staging.web.app/') {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.$ = id => w.document.getElementById(id);
  w.state = { user: { uid: 'teacher-a' }, profile: { role: 'teacher', status: 'active' } };
  w.isAdmin = () => w.state.profile?.role === 'admin';
  w.isSuspended = () => w.state.profile?.status === 'suspended';
  w.eval(fn('setTeacherBar'));
  return w;
}

test('teacher feedback replaces the loopback developer link for teacher and admin sessions', t => {
  const w = fixture(t);
  const button = w.$('teacherFeedbackBtn');
  assert.ok(button, 'discoverable feedback action exists');
  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.type, 'button');
  assert.equal(button.getAttribute('aria-controls'), 'feedbackDialog');
  assert.equal(w.$('gradecrewEtLauncher'), null);
  assert.doesNotMatch(html, /127\.0\.0\.1:8772\/__dev/);
  for (const role of ['teacher', 'admin']) {
    w.state.profile.role = role;
    w.setTeacherBar();
    assert.equal(button.classList.contains('hidden'), false, role);
    assert.equal(w.$('adminTopBtn').classList.contains('hidden'), role !== 'admin');
  }
  w.history.replaceState({}, '', '/?test=demo');
  w.setTeacherBar();
  assert.equal(button.classList.contains('hidden'), true, 'student test route');
  w.history.replaceState({}, '', '/');
  w.state.profile.status = 'suspended';
  w.setTeacherBar();
  assert.equal(button.classList.contains('hidden'), true, 'suspended account');
  w.state.profile.status = 'active';
  w.state.user = null;
  w.setTeacherBar();
  assert.equal(button.classList.contains('hidden'), true, 'signed out');
});

test('feedback stays available locally without changing the separate local workbench', t => {
  const w = fixture(t, 'http://127.0.0.1:8772/');
  w.setTeacherBar();
  assert.equal(w.$('teacherFeedbackBtn').classList.contains('hidden'), false);
});

test('floating and footer actions open the existing bug dialog and preserve test context', t => {
  const w = fixture(t);
  w.state.currentQuiz = { id: 'SYNTHETIC' };
  w.updateFeedbackPrompt = () => {};
  w.safeDialogOpen = dialog => dialog.setAttribute('open', '');
  w.eval(fn('openFeedbackDialog'));
  for (const id of ['teacherFeedbackBtn', 'footerFeedbackBtn']) {
    const binding = app.split('\n').find(line => line.startsWith(`$("${id}")?.addEventListener("click",`));
    assert.ok(binding, `${id} is bound`);
    w.eval(binding);
    w.$('feedbackMessage').value = 'old text';
    w.$(id).click();
    assert.equal(w.$('feedbackDialog').hasAttribute('open'), true);
    assert.equal(w.$('feedbackCategory').value, 'bug');
    assert.equal(w.$('feedbackTestCode').value, 'SYNTHETIC');
    assert.equal(w.$('feedbackMessage').value, '');
    w.$('feedbackDialog').removeAttribute('open');
  }
});
