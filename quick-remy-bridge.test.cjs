const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('./quick-remy-bridge.js'), 'utf8')
  .replace('export { createQuickRemyBridge, validatePrepareResult };', 'module.exports = { createQuickRemyBridge, validatePrepareResult };');
const context = vm.createContext({ module: { exports: {} }, Map, Promise, Set, Error, Object, Number, String, RegExp });
vm.runInContext(source, context);
const { createQuickRemyBridge } = context.module.exports;

test('authenticated web bridge calls the intended callables without forwarding UID or token', async () => {
  const calls = [];
  const bridge = createQuickRemyBridge({
    auth: { currentUser: { uid: 'private-user-id' } },
    api: {
      prepareQuickRemy: async payload => { calls.push(['prepare', payload]); return { status: 'needsInfo', missingFields: ['topic'], question: 'Welches Thema?' }; },
      submitQuickRemy: async payload => { calls.push(['submit', payload]); return { status: 'accepted', jobId: 'job-1234567890' }; }
    }
  });
  assert.equal(JSON.stringify(await bridge.prepare({ requestId: 'voice-1', conversationText: ' Mathe, Klasse 6 ' })), JSON.stringify({ status: 'needsInfo', missingFields: ['topic'], question: 'Welches Thema?' }));
  assert.equal(JSON.stringify(await bridge.submit({ requestId: 'voice-1', preparedRequest: { subject: 'Mathematik', grade: '6', topic: 'Brüche', count: 8, uid: 'spoofed' } })), JSON.stringify({ status: 'accepted', jobId: 'job-1234567890' }));
  assert.equal(JSON.stringify(calls), JSON.stringify([
    ['prepare', { requestId: 'voice-1', conversationText: 'Mathe, Klasse 6' }],
    ['submit', { requestId: 'voice-1', preparedRequest: { subject: 'Mathematik', grade: '6', topic: 'Brüche', count: 8 } }]
  ]));
});

test('bridge rejects unauthenticated, malformed, oversized, and invalid success replies', async () => {
  const bridge = createQuickRemyBridge({ auth: { currentUser: null }, api: {} });
  assert.throws(() => bridge.prepare({ requestId: 'voice-1', conversationText: 'Mathe' }), { code: 'unauthenticated' });
  const authenticated = createQuickRemyBridge({ auth: { currentUser: { uid: 'teacher-1' } }, api: {
    prepareQuickRemy: async () => ({ status: 'needsInfo', missingFields: ['uid'], question: 'Wer?' }),
    submitQuickRemy: async () => ({ status: 'accepted', jobId: '' })
  } });
  assert.throws(() => authenticated.prepare({ requestId: 'voice-1', conversationText: 'x'.repeat(2501) }));
  await assert.rejects(authenticated.prepare({ requestId: 'voice-1', conversationText: 'Mathe' }));
  await assert.rejects(authenticated.submit({ requestId: 'voice-1', preparedRequest: { subject: 'Ma', grade: '6', topic: 'Brüche', count: 8 } }));
});

test('bridge accepts a follow-up covering all four required fields', async () => {
  const bridge = createQuickRemyBridge({ auth: { currentUser: { uid: 'teacher-1' } }, api: {
    prepareQuickRemy: async () => ({ status: 'needsInfo', missingFields: ['subject', 'grade', 'topic', 'count'], question: 'Welches Fach, welche Klasse, welches Thema und wie viele Aufgaben?' })
  } });
  assert.equal(JSON.stringify(await bridge.prepare({ requestId: 'voice-1', conversationText: 'Ich möchte einen Test erstellen.' })), JSON.stringify({
    status: 'needsInfo', missingFields: ['subject', 'grade', 'topic', 'count'], question: 'Welches Fach, welche Klasse, welches Thema und wie viele Aufgaben?'
  }));
});

test('duplicate taps share one in-flight callable and keep server request ID stable', async () => {
  let calls = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const bridge = createQuickRemyBridge({ auth: { currentUser: { uid: 'teacher-1' } }, api: {
    submitQuickRemy: async payload => { calls += 1; assert.equal(payload.requestId, 'voice-1'); await gate; return { status: 'accepted', jobId: 'job-1234567890' }; }
  } });
  const input = { requestId: 'voice-1', preparedRequest: { subject: 'Ma', grade: '6', topic: 'Brüche', count: 8 } };
  const first = bridge.submit(input);
  const second = bridge.submit(input);
  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  assert.deepEqual(await first, await second);
});

test('a deferred preparation is rejected if Firebase changes accounts before dispatch', async () => {
  const auth = { currentUser: { uid: 'teacher-a' } };
  let calls = 0;
  const bridge = createQuickRemyBridge({ auth, api: { prepareQuickRemy: async () => { calls += 1; return { status: 'ready', preparedRequest: { subject: 'Ma', grade: '6', topic: 'Brüche', count: 8 } }; } } });
  const pending = bridge.prepare({ requestId: 'voice-1', conversationText: 'Mathe Klasse 6 Brüche' });
  bridge.authChanged({ uid: 'teacher-b' });
  await assert.rejects(pending, /Konto wurde gewechselt/);
  assert.equal(calls, 0);
});

test('a delayed callable result from a previous Firebase account cannot advance the flow', async () => {
  const auth = { currentUser: { uid: 'teacher-a' } };
  let release;
  const bridge = createQuickRemyBridge({ auth, api: { prepareQuickRemy: async () => new Promise(resolve => { release = resolve; }) } });
  const pending = bridge.prepare({ requestId: 'voice-1', conversationText: 'Mathe Klasse 6 Brüche' });
  await Promise.resolve();
  bridge.authChanged({ uid: 'teacher-b' });
  release({ status: 'ready', preparedRequest: { subject: 'Ma', grade: '6', topic: 'Brüche', count: 8 } });
  await assert.rejects(pending, /Konto wurde gewechselt/);
});

test('pending submission recovery is account-scoped and stores only an opaque request ID', async () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const auth = { currentUser: { uid: 'teacher-a' } };
  const requests = [];
  let pendingAtDispatch;
  const bridge = createQuickRemyBridge({ auth, storage, api: {
    submitQuickRemy: async payload => { pendingAtDispatch = values.get('gradecrew.quickRemy.pending:teacher-a'); requests.push(['submit', payload]); return { status: 'accepted', jobId: 'job-1234567890' }; },
    getQuickRemySubmission: async payload => { requests.push(['recover', payload]); return { status: 'accepted', jobId: 'job-1234567890' }; }
  } });
  await bridge.submit({ requestId: 'voice-1', preparedRequest: { subject: 'Ma', grade: '6', topic: 'Brüche', count: 8 } });
  assert.equal(pendingAtDispatch, 'voice-1');
  assert.equal(values.size, 0);

  values.set('gradecrew.quickRemy.pending:teacher-a', 'voice-2');
  auth.currentUser = { uid: 'teacher-b' };
  assert.equal(JSON.stringify(await bridge.recoverPending()), JSON.stringify({ status: 'none' }));
  assert.equal(values.get('gradecrew.quickRemy.pending:teacher-a'), 'voice-2');
  auth.currentUser = { uid: 'teacher-a' };
  assert.equal(JSON.stringify(await bridge.recoverPending()), JSON.stringify({ status: 'accepted', jobId: 'job-1234567890' }));
  assert.equal(values.has('gradecrew.quickRemy.pending:teacher-a'), false);
  assert.equal(requests.at(-1)[1].requestId, 'voice-2');
});
