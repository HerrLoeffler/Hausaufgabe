import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { JSDOM } from './tools/ui/node_modules/jsdom/lib/api.js';

test('app entry parses as the ES module used by the browser', () => {
  execFileSync(process.execPath, ['--input-type=module', '--check'], { input: fs.readFileSync('app.js'), stdio: 'pipe' });
});

test('public entry installs on the real app document and preserves auth controls', async () => {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url: 'https://gradecrew.example/' });
  const w = dom.window;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  const previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'NodeFilter', 'HTMLImageElement', 'matchMedia', 'requestAnimationFrame'].map(key => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: w, document: w.document, MutationObserver: w.MutationObserver,
    NodeFilter: w.NodeFilter, HTMLImageElement: w.HTMLImageElement,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: callback => w.setTimeout(callback, 0)
  });
  try {
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=6');
    assert.equal(installGradeCrewEntryFlow(), true);
    for (const id of ['loginForm', 'registerForm', 'joinForm', 'forgotBtn', 'loginEmail', 'loginPassword', 'registerName', 'registerEmail', 'registerPassword', 'registerPassword2', 'joinCode']) {
      assert.ok(w.document.getElementById(id), `${id} must survive entry installation`);
    }
    assert.equal(w.document.getElementById('gcPublicNav'), null);
    assert.equal(w.document.querySelectorAll('#gcEntryBenefits li').length, 4);
    assert.match(w.document.getElementById('gcHeroHint').textContent, /Remy, Emmi oder Wilma/);
    assert.match(w.document.querySelector('#joinForm label').textContent, /Testcode/);
    assert.match(w.document.querySelector('#joinForm button[type="submit"]').textContent, /Test öffnen/);
    assert.ok(w.document.getElementById('gcHeroDemoNext'));
    w.document.querySelector('[data-hero-crew="remy"]').click();
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.phase, '0');
    w.document.getElementById('gcHeroDemoNext').click();
    assert.equal(w.document.getElementById('gcHeroDialog').dataset.phase, '1');
    w.document.getElementById('gcHeroDialog').close();
    w.document.getElementById('gcEntryLoginOpen').click();
    assert.equal(w.document.getElementById('gcEntryLogin').classList.contains('hidden'), false);
    assert.equal(w.document.getElementById('loginForm').classList.contains('hidden'), false);
    w.document.getElementById('gcEntrySwitchRegister').click();
    assert.equal(w.document.getElementById('gcEntryRegister').classList.contains('hidden'), false);
    assert.equal(w.document.getElementById('registerForm').classList.contains('hidden'), false);
  } finally {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
    w.close();
  }
});

test('app bootstrap binds its real auth controls after public entry installation', async () => {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url: 'https://gradecrew.example/' });
  const w = dom.window;
  const previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'NodeFilter', 'HTMLImageElement', 'matchMedia', 'requestAnimationFrame'].map(key => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: w, document: w.document, MutationObserver: w.MutationObserver,
    NodeFilter: w.NodeFilter, HTMLImageElement: w.HTMLImageElement,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: callback => w.setTimeout(callback, 0)
  });
  try {
    const { installGradeCrewEntryFlow } = await import('./gradecrew-entry-flow.js?v=6');
    assert.equal(installGradeCrewEntryFlow(), true);
    const appSource = fs.readFileSync('app.js', 'utf8');
    const source = appSource.slice(0, appSource.indexOf('import { initializeApp')) + appSource.slice(appSource.indexOf('const diagnostics ='));
    const noop = () => {};
    const loginCalls = [];
    const bindings = {
      initializeApp: () => ({}), getAuth: () => ({}), getFirestore: () => ({}), createAiClient: () => ({}),
      signInWithEmailAndPassword: (...args) => { loginCalls.push(args); return Promise.resolve({ user: {} }); },
      createDiagnostics: () => ({ record: noop, setRelease: noop }), installDiagnostics: noop,
      installWorkspaceInteractions: noop, bindTabs: noop, onAuthStateChanged: noop,
      firebaseModule: { firebaseConfig: {} },
      document: w.document, window: w, location: w.location, navigator: w.navigator,
      localStorage: w.localStorage, sessionStorage: w.sessionStorage,
      MutationObserver: w.MutationObserver, ResizeObserver: undefined,
      Event: w.Event, Node: w.Node, HTMLElement: w.HTMLElement,
      fetch: async () => ({ ok: false }), console,
      setTimeout, clearTimeout, setInterval, clearInterval,
      requestAnimationFrame: callback => w.setTimeout(callback, 0)
    };
    vm.runInNewContext(source, bindings, { filename: 'app.js', timeout: 2000 });
    w.document.getElementById('loginEmail').value = 'teacher@example.test';
    w.document.getElementById('loginPassword').value = 'local-test-only';
    const submit = new w.Event('submit', { bubbles: true, cancelable: true });
    w.document.getElementById('loginForm').dispatchEvent(submit);
    assert.equal(submit.defaultPrevented, true);
    assert.equal(loginCalls.length, 1);
    assert.equal(loginCalls[0][1], 'teacher@example.test');
    assert.equal(loginCalls[0][2], 'local-test-only');
    await new Promise(resolve => setImmediate(resolve));
  } finally {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
    w.close();
  }
});
