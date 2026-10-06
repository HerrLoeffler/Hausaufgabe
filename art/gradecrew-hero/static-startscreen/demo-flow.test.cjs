const test = require('node:test');
const assert = require('node:assert/strict');
let createDemoFlow;
try { ({ createDemoFlow } = require('./demo-flow.js')); } catch {}
function harness(reducedMotion = false) {
  assert.equal(typeof createDemoFlow, 'function', 'Demo controller must exist');
  let pending = null;
  let delay = null;
  let latest = null;
  const flow = createDemoFlow({ reducedMotion, onChange: state => latest = state,
    schedule: (fn, ms) => { pending = fn; delay = ms; return 1; }, cancel: () => { pending = null; } });
  return { flow, state: () => latest, scheduled: () => !!pending, delay: () => delay, tick: () => { const fn = pending; pending = null; fn?.(); } };
}
test('clicking a crew member reveals a finished example in three phases', () => {
  const h = harness(); h.flow.start('remy');
  assert.equal(h.state().phase, 0); assert.equal(h.delay(), 2600); h.tick(); assert.equal(h.state().phase, 1);
  h.tick(); assert.equal(h.state().phase, 2); assert.equal(h.state().running, false);
  assert.equal(h.scheduled(), false);
});
test('pause, replay and close prevent callbacks from continuing an old example', () => {
  const h = harness(); h.flow.start('emmi'); h.flow.togglePause();
  assert.equal(h.state().paused, true); assert.equal(h.scheduled(), false);
  h.flow.togglePause(); h.tick(); assert.equal(h.state().phase, 1);
  h.flow.replay(); assert.equal(h.state().phase, 0);
  h.flow.stop(); assert.equal(h.scheduled(), false);
});
test('Meet the crew starts a guided Remy → Emmi → Wilma tutorial', () => {
  const h = harness(); h.flow.start('remy', true);
  assert.equal(h.state().tutorial, true); assert.equal(h.state().index, 0);
  assert.equal(h.flow.next(), true); assert.equal(h.state().name, 'emmi');
  assert.equal(h.flow.next(), true); assert.equal(h.state().name, 'wilma');
  assert.equal(h.flow.next(), false); assert.equal(h.scheduled(), false);
});
test('reduced motion reveals the result immediately without scheduling animation', () => {
  const h = harness(true); h.flow.start('wilma');
  assert.equal(h.state().phase, 2); assert.equal(h.scheduled(), false);
  h.flow.replay(); assert.equal(h.scheduled(), false);
});
