const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'Sources/TeacherWebPortalView.swift'), 'utf8');
const script = source.split('webView.callAsyncJavaScript("""')[1].split('""",')[0];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
function fixture({ fail = false, assistant } = {}) {
  const elements = new Map();
  const classes = new Set();
  const aiView = { classList: { contains: x => classes.has(x) } };
  const errors = new Set();
  const progress = { textContent: '', classList: { contains: x => errors.has(x), remove: x => errors.delete(x) } };
  const button = { disabled: false, click() { setTimeout(() => { if (fail) { progress.textContent = 'Das KI-Limit ist erreicht.'; errors.add('error'); } else classes.add('hidden'); }, 25); } };
  elements.set('aiView', aiView); elements.set('generateAiTestBtn', button); elements.set('aiProgress', progress);
  const document = { getElementById: id => elements.get(id), querySelectorAll: () => [] };
  const execute = new AsyncFunction('action','payload','document','window','Event', script);
  return { elements, run: (action, payload = {}) => execute(action, payload, document, { __gradeCrewRemyFieldVerifier: assistant, GradeCrewRemyAudit: { session: async () => 'current-session', prepare: async expected => ({expected}), remember: async () => {} } }, Event) };
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

test('form read-back rejects a dropped audio count before starting a test', async () => {
  const f = fixture();
  f.elements.set('aiAudioQuestionCount', { value: '0' });
  await assert.rejects(f.run('verifyAiForm', { draft: { audioQuestionCount: 2 } }), /Höraufgaben/);
  f.elements.get('aiAudioQuestionCount').value = '2';
  assert.equal((await f.run('verifyAiForm', { draft: { audioQuestionCount: 2 } })).status, 'checked');
});
test('independent Remy channel receives the actual utterance and existing native fields', async () => {
  const patch = { subject: null, grade: null, schoolType: null, region: null, topic: 'Wortarten und Satzglieder', difficulty: null, count: null, points: null, durationMinutes: null, imageQuestionCount: 2, audioQuestionCount: 2, audioAnswerQuestionCount: null, solutionAudioQuestionCount: null, notes: 'Lustige Sätze', allowedTypes: [], excludeTypes: [] };
  let request;
  const f = fixture({ assistant: async payload => { request = payload; return { data: { reply: 'Eingetragen', intent: 'create_test', cacheCandidate: false, action: { type: 'patch_ai_form', patch } } }; } });
  const text = 'Deutsch achte Klasse Wortarten und Satzglieder 15 Aufgaben zwei Bilder zwei Hör Aufgaben, lustige Sätze';
  const result = await f.run('verifyDraft', { conversationText: text, draft: { subject: 'Deutsch', grade: '8', count: 15, imageQuestionCount: 2, audioQuestionCount: 2 } });
  assert.equal(request.crewId, 'remy');
  assert.equal(request.text, text);
  assert.equal(request.context.screen, 'ai_create');
  assert.equal(request.context.aiForm.audioQuestionCount, 2);
  assert.equal(result.status, 'checked');
  assert.equal(result.patch.notes, 'Lustige Sätze');
});
test('a callback from an old account cannot populate the new account form', async () => {
  const f=fixture();
  await assert.rejects(f.run('populateAiForm',{ formSession:'old-session',draft:{ subject:'Deutsch' } }), /Konto wurde gewechselt/);
});

test('opening the workspace after Remy restores hidden form elements and returns to the dashboard', async () => {
  const hidden = [{ hidden: true, dataset: { nativeQuickRemyHidden: 'true' } }, { hidden: true, dataset: { nativeQuickRemyHidden: 'true' } }];
  let disconnected = false;
  let clicked = false;
  const dashboard = { classList: { contains: () => !clicked } };
  const document = {
    querySelectorAll: selector => selector === '[data-native-quick-remy-hidden]' ? hidden : [],
    getElementById: id => id === 'dashboardView' ? dashboard : id === 'backFromAi' ? { click() { clicked = true; } } : null
  };
  const execute = new AsyncFunction('action', 'payload', 'document', 'window', 'Event', script);
  const window = { __gradeCrewQuickRemyObserver: { disconnect() { disconnected = true; } }, scrollTo() {} };
  assert.equal((await execute('openWorkspace', {}, document, window, Event)).status, 'ready');
  assert.equal(clicked, true, 'Use the existing authenticated dashboard handler');
  assert.equal(disconnected, true);
  assert.equal(hidden.every(element => element.hidden === false && !element.dataset.nativeQuickRemyHidden), true);
});
