const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const app = fs.readFileSync(require('node:path').join(__dirname, '../../app.js'), 'utf8');
function harness(saved = true, blocked = false) {
  let handler, finish;
  const events = [];
  const tab = { closed: false, opener: {}, location: { replace: url => events.push(url) }, close() { this.closed = true; } };
  const button = { disabled: false, addEventListener: (_, fn) => handler = fn };
  const context = { extendedPreview: false, $: () => button, state: { isDirty: true, currentQuiz: { id: 'forty' }, user: { uid: 'teacher' }, questions: Array.from({ length: 40 }, () => ({})) }, window: { open: () => { events.push('open'); return blocked ? null : tab; } }, saveCurrentQuiz: () => { events.push('save'); return new Promise(resolve => finish = () => { context.state.currentQuiz = { ...context.state.currentQuiz }; resolve(saved); }); }, baseStudentUrl: () => '/?preview=forty', localStorage: { setItem() {} }, renderFirstTestGuide() {}, toast: message => events.push(message) };
  vm.runInNewContext(app.slice(app.indexOf('$("previewBtn").addEventListener'), app.indexOf('\nfunction newQuestion(')), context);
  return { run: () => handler(), finish: () => finish(), events, tab, button };
}
test('40-question preview reserves its tab before asynchronous save', async () => {
  const h = harness(); const pending = h.run();
  assert.deepEqual(h.events, ['open', 'save']); assert.equal(h.tab.opener, null);
  h.finish(); await pending; assert.equal(h.events.filter(event=>event==='save').length,1); assert.ok(h.events.includes('/?preview=forty')); assert.equal(h.button.disabled, false);
});
test('failed save closes reserved preview and restores button', async () => {
  const h = harness(false); const pending = h.run(); h.finish(); await pending;
  assert.equal(h.tab.closed, true); assert.equal(h.button.disabled, false); assert.ok(h.events.some(event=>/Schüleransicht.*Speichern/.test(event)));
});
test('blocked popup explains how to enable preview without a silent failure', async () => {
  const h = harness(true, true); await h.run();
  assert.ok(h.events.some(event => /Pop-up/.test(event))); assert.equal(h.button.disabled, false);
});

for (const published of [false,true]) test(`actual preview button click opens an unchanged saved ${published?'published quiz':'draft'} without repeated save writes`, async t => {
  const dom=new JSDOM('<button id="previewBtn" type="button">Schüleransicht</button>', {url:'https://example.test',runScripts:'outside-only'});t.after(()=>dom.window.close());
  const w=dom.window;const events=[];const tab={closed:false,opener:{},location:{replace:url=>events.push(url)},close(){this.closed=true;}};
  w.extendedPreview=false;w.$=id=>w.document.getElementById(id);w.state={isDirty:false,newManualQuiz:false,currentQuiz:{id:'published',published,ended:false},user:{uid:'teacher'}};
  w.open=()=>tab;w.saveCurrentQuiz=async()=>{events.push('FORBIDDEN_ACTIVE_AUDIO_SYNC');return false;};w.baseStudentUrl=()=>'/index.html?test=published&preview=1';w.renderFirstTestGuide=()=>{};w.toast=message=>events.push(message);
  w.eval(app.slice(app.indexOf('$("previewBtn").addEventListener'),app.indexOf('\nfunction newQuestion(')));
  w.$('previewBtn').click();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(events,['/index.html?test=published&preview=1']);assert.equal(tab.closed,false);assert.equal(w.$('previewBtn').disabled,false);
});
