const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'Resources/gradecrew-native-bridge.js'), 'utf8');
const origin = 'https://hausaufgabe-staging.web.app';
function makeBridge(reply = async () => ({ ok: true, result: { accepted: true } })) {
  const requests = [];
  const window = { location: { origin }, webkit: { messageHandlers: { gradecrewNative: { postMessage: async request => { requests.push(request); return reply(request); } } } } };
  window.top = window; window.self = window;
  class Anchor { click() {} }
  vm.runInNewContext(source.replace('__GRADECREW_CONFIG__', JSON.stringify({ origin })), { window, location: window.location, document: { addEventListener() {} }, HTMLAnchorElement: Anchor, Blob, URL, crypto: require('node:crypto').webcrypto, AbortController, setTimeout, clearTimeout, fetch: async () => ({ ok: false }), console });
  return { window, requests };
}

test('Firebase auth state publishes only status and an account label to native', async () => {
  const bridge = makeBridge();
  await bridge.window.GradeCrewNative.setAuthState({ state: 'signedIn', accountLabel: 'Lehrkraft@example.de', accountChanged: true });
  assert.deepEqual(JSON.parse(JSON.stringify(bridge.requests[0])), {
    version: 1, id: bridge.requests[0].id, action: 'authState', payload: { state: 'signedIn', accountLabel: 'Lehrkraft@example.de', accountChanged: true }
  });
  assert.equal('uid' in bridge.requests[0].payload, false);
  await bridge.window.GradeCrewNative.refreshAuthState();
  assert.equal(bridge.requests[1].payload.accountChanged, false);
  await bridge.window.GradeCrewNative.setAuthState({ state: 'signedOut' });
  assert.equal(bridge.requests[2].payload.state, 'signedOut');
});

test('auth state reports native bridge errors to the caller', async () => {
  const bridge = makeBridge(async () => ({ ok: false, error: { code: 'forbidden', message: 'blocked' } }));
  await assert.rejects(bridge.window.GradeCrewNative.setAuthState({ state: 'signedOut' }), /blocked/);
});

test('a delayed signed-in acknowledgment cannot overwrite a newer signed-out state', async () => {
  let releaseSignedIn;
  const bridge = makeBridge(request => request.payload.state === 'signedIn'
    ? new Promise(resolve => { releaseSignedIn = () => resolve({ ok: true, result: {} }); })
    : Promise.resolve({ ok: true, result: {} }));
  const delayed = bridge.window.GradeCrewNative.setAuthState({ state: 'signedIn', accountLabel: 'Teacher A' });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(typeof releaseSignedIn, 'function');
  await bridge.window.GradeCrewNative.setAuthState({ state: 'signedOut' });
  releaseSignedIn();
  await delayed;
  await bridge.window.GradeCrewNative.refreshAuthState();
  assert.equal(bridge.requests.at(-1).payload.state, 'signedOut');
});
