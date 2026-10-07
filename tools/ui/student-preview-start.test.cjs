const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync(require('node:path').join(__dirname, '../../app.js'), 'utf8');
function harness(saved = true, blocked = false) {
  let handler, finish;
  const events = [];
  const tab = { closed: false, opener: {}, location: { replace: url => events.push(url) }, close() { this.closed = true; } };
  const button = { disabled: false, addEventListener: (_, fn) => handler = fn };
  const context = { $: () => button, state: { currentQuiz: { id: 'forty' }, user: { uid: 'teacher' }, questions: Array.from({ length: 40 }, () => ({})) }, window: { open: () => { events.push('open'); return blocked ? null : tab; } }, saveCurrentQuiz: () => { events.push('save'); return new Promise(resolve => finish = () => { context.state.currentQuiz = { ...context.state.currentQuiz }; resolve(saved); }); }, baseStudentUrl: () => '/?preview=forty', localStorage: { setItem() {} }, renderFirstTestGuide() {}, toast: message => events.push(message) };
  vm.runInNewContext(app.slice(app.indexOf('$("previewBtn").addEventListener'), app.indexOf('\nfunction newQuestion(')), context);
  return { run: () => handler(), finish: () => finish(), events, tab, button };
}
test('40-question preview reserves its tab before asynchronous save', async () => {
  const h = harness(); const pending = h.run();
  assert.deepEqual(h.events, ['open', 'save']); assert.equal(h.tab.opener, null);
  h.finish(); await pending; assert.ok(h.events.includes('/?preview=forty')); assert.equal(h.button.disabled, false);
});
test('failed save closes reserved preview and restores button', async () => {
  const h = harness(false); const pending = h.run(); h.finish(); await pending;
  assert.equal(h.tab.closed, true); assert.equal(h.button.disabled, false);
});
test('blocked popup explains how to enable preview without a silent failure', async () => {
  const h = harness(true, true); await h.run();
  assert.ok(h.events.some(event => /Pop-up/.test(event))); assert.equal(h.button.disabled, false);
});
