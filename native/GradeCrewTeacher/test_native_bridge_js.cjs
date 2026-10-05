const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourcePath = path.join(__dirname, 'Resources/gradecrew-native-bridge.js');
assert.ok(fs.existsSync(sourcePath), 'Native JavaScript bridge is not implemented yet');
const source = fs.readFileSync(sourcePath, 'utf8');
const origin = 'https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app';

function browser({ native = true, currentOrigin = origin, reply = async () => ({ ok: true, result: { status: 'completed' } }), blob = new Blob(['Änne;10'], { type: 'text/csv' }), manifest = null } = {}) {
  const requests = [], messages = [], events = {};
  class Anchor { constructor() { this.href = 'blob:' + origin + '/fixture'; this.download = 'Ergebnisse.csv'; this.originalClicks = 0; } click() { this.originalClicks++; this.lastClickedURL = this.href; } }
  const originalClick = Anchor.prototype.click;
  const window = { location: { origin: currentOrigin }, alert: message => messages.push(message),
    webkit: native ? { messageHandlers: { gradecrewNative: { postMessage: async request => { requests.push(request); return reply(request); } } } } : undefined };
  window.top = window; window.self = window;
  const context = { window, location: window.location, document: { addEventListener: (name, fn) => events[name] = fn },
    HTMLAnchorElement: Anchor, Blob, URL, crypto: require('node:crypto').webcrypto, btoa, Uint8Array,
    AbortController, WeakSet, setTimeout: (...args) => { const timer = setTimeout(...args); timer.unref(); return timer; }, clearTimeout,
    fetch: async () => ({ ok: true, status: 200, blob: async () => blob, json: async () => manifest }), console };
  vm.runInNewContext(source.replace('__GRADECREW_CONFIG__', JSON.stringify({ origin })), context);
  return { window, Anchor, requests, messages, originalClick, events };
}

test('browser without native handler retains the original anchor behavior', () => {
  const b = browser({ native: false }); const a = new b.Anchor(); a.click();
  assert.equal(a.originalClicks, 1); assert.equal(b.Anchor.prototype.click, b.originalClick);
  assert.equal(b.window.GradeCrewNative, undefined);
});
test('a different loaded origin receives no bridge or export interception', () => {
  const b = browser({ currentOrigin: 'https://example.com' });
  assert.equal(b.window.GradeCrewNative, undefined); assert.equal(b.Anchor.prototype.click, b.originalClick);
});
test('shareFile sends unchanged UTF-8 bytes and a versioned request', async () => {
  const b = browser(); const result = await b.window.GradeCrewNative.shareFile(new Blob(['Änne;10'], { type: 'text/csv' }), 'Ergebnisse.csv');
  assert.equal(result.status, 'completed'); assert.equal(b.requests.length, 1);
  const request = b.requests[0]; assert.equal(request.version, 1); assert.equal(request.action, 'shareFile');
  assert.equal(request.payload.filename, 'Ergebnisse.csv'); assert.equal(Buffer.from(request.payload.base64, 'base64').toString(), 'Änne;10');
});
test('oversized blobs are rejected before native transmission', async () => {
  const b = browser(); await assert.rejects(b.window.GradeCrewNative.shareFile(new Blob([new Uint8Array(12 * 1024 * 1024 + 1)], { type: 'text/csv' }), 'large.csv'), /groß/);
  assert.equal(b.requests.length, 0);
});
test('cancellation of an existing blob export produces no duplicate browser download', async () => {
  const b = browser({ reply: async () => ({ ok: true, result: { status: 'cancelled' } }) });
  const a = new b.Anchor(); a.click(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(b.requests.length, 1); assert.equal(a.originalClicks, 0); assert.equal(b.messages.length, 0);
});
test('HTTP downloads and foreign blob origins keep the original download path', () => {
  const b = browser(); const a = new b.Anchor(); a.href = origin + '/file.pdf'; a.click();
  assert.equal(a.originalClicks, 1); a.href = 'blob:https://example.com/id'; a.click(); assert.equal(a.originalClicks, 2);
});
test('native rejection surfaces a useful error without re-exporting', async () => {
  const b = browser({ reply: async () => ({ ok: false, error: { code: 'busy', message: 'Bitte zuerst das Teilen-Menü schließen.' } }) });
  const a = new b.Anchor(); a.click(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(a.originalClicks, 0); assert.equal(b.messages.length, 1); assert.match(b.messages[0], /Teilen-Menü/);
});
test('a real delegated anchor click is intercepted once', async () => {
  const b = browser(); const a = new b.Anchor(); let prevented = 0;
  b.events.click({ defaultPrevented: false, button: 0, target: { closest: () => a }, preventDefault() { prevented++; }, stopImmediatePropagation() {} });
  await new Promise(resolve => setImmediate(resolve)); assert.equal(prevented, 1); assert.equal(b.requests.length, 1);
});
test('capabilities and diagnostics use their explicit native actions', async () => {
  const b = browser({ reply: async req => ({ ok: true, result: { action: req.action } }) });
  assert.equal((await b.window.GradeCrewNative.capabilities()).action, 'capabilities');
  assert.equal((await b.window.GradeCrewNative.diagnostics()).action, 'diagnostics');
});
test('diagnostics reports only a valid staging manifest SHA and marks missing evidence', async () => {
  const commit = '1234567890abcdef1234567890abcdef12345678';
  const valid = browser({ manifest: { project: 'hausaufgabe-staging', commit } });
  assert.equal((await valid.window.GradeCrewNative.diagnostics()).webManifestCommit, commit);
  const missing = browser(); assert.equal((await missing.window.GradeCrewNative.diagnostics()).webManifestCommit, null);
  const wrong = browser({ manifest: { project: 'hausaufgabe-40294', commit } });
  assert.equal((await wrong.window.GradeCrewNative.diagnostics()).webManifestCommit, null);
});
test('unhandled ZIP and DOCX blob exports retain the original download behavior', () => {
  const b = browser();
  for (const extension of ['zip', 'docx']) { const a = new b.Anchor(); a.download = 'Export.' + extension; a.click(); assert.equal(a.originalClicks, 1); }
  assert.equal(b.requests.length, 0);
});
test('an unsupported MIME falls back using a fresh blob URL and unchanged file bytes', async () => {
  const b = browser({ blob: new Blob(['original bytes'], { type: 'application/octet-stream' }) });
  const a = new b.Anchor(); a.click(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(a.originalClicks, 1); assert.equal(b.requests.length, 0); assert.equal(b.messages.length, 0);
  assert.equal(await (await fetch(a.lastClickedURL)).text(), 'original bytes');
  URL.revokeObjectURL(a.lastClickedURL);
});
