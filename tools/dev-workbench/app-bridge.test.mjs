import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { appendWorkbenchAppBridge } from './app-bridge-source.mjs';

const { JSDOM } = createRequire(new URL('../ui/review-scenes.test.cjs', import.meta.url))('jsdom');

function installBridge({ view = 'authView', dirty = false, typed = false } = {}) {
  const dom = new JSDOM(`
    <main>
      <section id="authView"><input id="email"><input id="password" type="password"></section>
      <section id="editorView" class="hidden"></section>
      <section id="studentView" class="hidden"></section>
      <section id="aiView" class="hidden"></section>
      <section id="settingsView" class="hidden"></section>
      <section id="dashboardView" class="hidden"></section>
      <section id="resultsView" class="hidden"></section>
      <section id="publishView" class="hidden"></section>
    </main>`, { url: 'http://127.0.0.1:8772', runScripts: 'outside-only' });
  for (const section of dom.window.document.querySelectorAll('main section')) section.classList.toggle('hidden', section.id !== view);
  dom.window.document.getElementById('email').value = typed ? 'typed@example.invalid' : '';
  dom.window.document.getElementById('password').value = typed ? 'DO_NOT_CAPTURE' : '';
  let bridge;
  const state = { isDirty: dirty, currentQuiz: { id: 'quiz-123' }, currentResultsQuiz: null, user: null, profile: null };
  const window = { GradeCrewDev: { registerAdapter(value) { bridge = value; } } };
  const document = dom.window.document;
  const views = ['authView', 'editorView', 'studentView', 'aiView', 'settingsView', 'dashboardView', 'resultsView', 'publishView'];
  vm.runInNewContext(appendWorkbenchAppBridge('', { homepage: true, dataMode: 'staging', name: 'app.js' }), {
    window, document, location: dom.window.location, views, state, appEnvironment: 'staging', crewTour: null,
    $: id => document.getElementById(id), currentViewId: () => views.find(id => !document.getElementById(id)?.classList.contains('hidden')) || 'unknown',
    Event: dom.window.Event, Date, setTimeout,
    openEditor: async () => {}, openResults: async () => {}, showPublish: async () => {}, loadDashboard: async () => {}, showView: () => {},
  });
  return { dom, bridge };
}

test('the bridge is injected only for the loopback staging homepage app.js response', () => {
  const original = 'const appLoaded = true;';
  const served = appendWorkbenchAppBridge(original, { homepage: true, dataMode: 'staging', name: 'app.js' });
  assert.match(served, /Local development navigation bridge/);
  assert.equal(appendWorkbenchAppBridge(original, { homepage: false, dataMode: 'staging', name: 'app.js' }), original);
  assert.equal(appendWorkbenchAppBridge(original, { homepage: true, dataMode: 'fixtures', name: 'app.js' }), original);
  assert.equal(appendWorkbenchAppBridge(original, { homepage: true, dataMode: 'staging', name: 'other.js' }), original);
});

test('the app adapter blocks dirty/auth/student/AI state and exposes no typed values', () => {
  const auth = installBridge({ view: 'authView', typed: true });
  try {
    assert.equal(auth.bridge.isDirty(), true);
    assert(!JSON.stringify(auth.bridge.captureContext()).includes('DO_NOT_CAPTURE'));
    assert(!JSON.stringify(auth.bridge.captureCheckpoint()).includes('DO_NOT_CAPTURE'));
    assert(!JSON.stringify(auth.bridge.captureContext()).includes('typed@example.invalid'));
  } finally { auth.dom.window.close(); }

  for (const view of ['editorView', 'studentView', 'aiView', 'settingsView']) {
    const installed = installBridge({ view, dirty: view === 'editorView' });
    try {
      assert.equal(installed.bridge.isDirty(), true, `${view} must not be reloaded automatically`);
      const serialized = JSON.stringify(installed.bridge.captureCheckpoint());
      assert(!serialized.includes('DO_NOT_CAPTURE'));
      assert(!serialized.includes('typed@example.invalid'));
    } finally { installed.dom.window.close(); }
  }
});
