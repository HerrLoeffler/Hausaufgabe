const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'Sources/TeacherWebPortalView.swift'), 'utf8');
const script = source.split('webView.callAsyncJavaScript("""')[1].split('""",')[0];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
function fixture({ fail = false } = {}) {
  const elements = new Map();
  const classes = new Set();
  const aiView = { classList: { contains: x => classes.has(x) } };
  const errors = new Set();
  const progress = { textContent: '', classList: { contains: x => errors.has(x), remove: x => errors.delete(x) } };
  const button = { disabled: false, click() { setTimeout(() => { if (fail) { progress.textContent = 'Das KI-Limit ist erreicht.'; errors.add('error'); } else classes.add('hidden'); }, 25); } };
  elements.set('aiView', aiView); elements.set('generateAiTestBtn', button); elements.set('aiProgress', progress);
  const document = { getElementById: id => elements.get(id), querySelectorAll: () => [] };
  const execute = new AsyncFunction('action','payload','document','window','Event', script);
  return { elements, run: (action, payload = {}) => execute(action, payload, document, {}, Event) };
}
test('creation waits for acknowledged background start before returning home', async () => {
  const f = fixture(); let resolved = false;
  const pending = f.run('createAiTest').then(result => { resolved = true; return result; });
  await new Promise(r => setTimeout(r, 5));
  assert.equal(resolved, false, 'clicking the button alone is not acceptance');
  assert.equal((await pending).status, 'accepted');
});
test('creation surfaces a backend failure instead of acknowledging the click', async () => {
  await assert.rejects(fixture({ fail: true }).run('createAiTest'), /KI-Limit/);
});
test('native audio settings and cleared wishes reach the existing test form', async () => {
  const f = fixture();
  for (const id of ['aiAudioQuestionCount','aiAudioAnswerQuestionCount','aiCustomNotes','aiPersonalPreferences']) {
    f.elements.set(id, { value: 'old', dispatchEvent() {} });
  }
  await f.run('populateAiForm', { draft: { audioQuestionCount: 2, audioAnswerQuestionCount: 3, customNotes: '', personalPreferences: 'Kurze Sätze' } });
  assert.equal(f.elements.get('aiAudioQuestionCount').value, '2');
  assert.equal(f.elements.get('aiAudioAnswerQuestionCount').value, '3');
  assert.equal(f.elements.get('aiCustomNotes').value, '');
  assert.equal(f.elements.get('aiPersonalPreferences').value, 'Kurze Sätze');
});
function uploadFixture() {
  const entries = [];
  let received;
  const confirmation = { checked: false };
  const input = { files: [], dispatchEvent() { received = this.files[0]; setTimeout(() => entries.push(received.name), 10); } };
  const document = {
    getElementById: id => ({ aiMaterialInput: input, aiMaterialConfirmed: confirmation, aiProgress: { classList: { contains: () => false } } })[id],
    querySelectorAll: selector => selector.endsWith('strong') ? entries.map(name => ({ textContent: name })) : entries.map((name, index) => ({
      classList: { contains: () => true }, querySelector: () => ({ click() { setTimeout(() => entries.splice(index, 1), 10); } })
    }))
  };
  class Transfer { constructor() { this.files = []; this.items = { add: file => this.files.push(file) }; } }
  const execute = new AsyncFunction('action','payload','document','window','Event','DataTransfer','File', script);
  return { run: (action, payload) => execute(action, payload, document, {}, Event, Transfer, require('node:buffer').File), received: () => received, confirmation };
}
test('material handoff preserves file bytes and waits for the existing uploader', async () => {
  const f = uploadFixture();
  const result = await f.run('uploadMaterial', { confirmed: true, name: 'Farben.txt', mimeType: 'text/plain', base64: Buffer.from('Rot, Grün, Blau').toString('base64') });
  assert.deepEqual(result.materialNames, ['Farben.txt']);
  assert.equal(await f.received().text(), 'Rot, Grün, Blau');
  assert.equal(f.confirmation.checked, true);
  const removed = await f.run('removeMaterial', { index: 0 });
  assert.deepEqual(removed.materialNames, []);
});
test('material upload refuses unconfirmed rights before reading a file', async () => {
  await assert.rejects(uploadFixture().run('uploadMaterial', { confirmed: false }), /Materialprüfung/);
});
