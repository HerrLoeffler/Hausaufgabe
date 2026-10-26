import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { CREW_MEMBERS, patchSummary, resolveLocalCrewRequest } from './crew-assistant-core.mjs';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('remy-ai-help.js', 'utf8');

function setup(t) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <section id="aiView">
      <div class="pageHead"><h1>Test mit KI erstellen</h1></div>
      <label>Testsprache<select id="aiContentLocale"><option value="de-DE">Deutsch</option><option value="en-GB">English</option></select></label><label>Fach<input id="aiSubject"></label>
      <label>Klasse<input id="aiGrade"></label>
      <label>Schulart<input id="aiSchoolType"></label>
      <label>Region<input id="aiRegion"></label>
      <label>Thema<input id="aiTopic"></label>
      <label>Schwierigkeit<input id="aiDifficulty"></label>
      <label>Anzahl<input id="aiCount"></label>
      <label>Punkte<input id="aiPoints"></label>
      <label>Bilder<input id="aiImageQuestionCount"></label>
      <label>Höraufgaben<input id="aiAudioQuestionCount"></label>\n      <label>Audio-Lösungen<input id="aiSolutionAudioQuestionCount"></label>
      <label>Audio-Antworten<input id="aiAudioAnswerQuestionCount"></label>
      <details><div id="aiTypeChecks"><label><input type="checkbox" value="single" checked>Single</label><label><input type="checkbox" value="multi">Multiple</label><label><input type="checkbox" value="text">Freitext</label></div></details>
      <details class="aiOptionalTestOptions"><summary>Aufgabentypen und Wünsche <small>optional</small></summary><label>Wünsche <small>(optional)</small><textarea id="aiCustomNotes"></textarea></label></details>
      <button id="generateAiTestBtn">Test erstellen</button>
    </section>
  </body></html>`, { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = '1'; };

  w.GradeCrewI18n = { locale: 'de-DE' };
  w.CREW_MEMBERS = CREW_MEMBERS;
  w.patchSummary = patchSummary;
  w.resolveLocalCrewRequest = resolveLocalCrewRequest;
  w.getApp = () => ({});
  w.getFunctions = () => ({});
  w.httpsCallable = () => async () => ({ data: {} });
  w.recordRemyMetric = () => {};
  w.recordRemySubmission = () => {};
  w.recordRemyPatch = () => {};
  w.resetRemyTelemetryContext = () => {};

  const executable = source
    .replace(/import\s+\{[\s\S]*?\}\s+from\s+["']\.\/crew-telemetry-client\.mjs(?:\?[^"']*)?["'];\s*/, '')
    .replace(/^import .*;\s*$/gm, '')
    .replace(/^export /gm, '');
  w.eval(executable);
  return w;
}

async function settle(w, ms = 20) {
  await new Promise(resolve => w.setTimeout(resolve, ms));
}

function acceptProposal(w) {
  w.document.getElementById('gcRemyProposalApply')?.click();
}

test('the spoken fractions request previews and applies listening audio and personal wishes together', async t => {
  const w = setup(t);
  const collect = installCollector(w);
  const notes = w.document.getElementById('aiCustomNotes');
  notes.value = 'Vorhandener Wunsch.';
  w.document.getElementById('gcRemyCreateInput').value = 'mathe 5 Klasse Thema Bruchrechnen kürzen und erweitern 15 Aufgaben zwei Bilder zwei Audios gerne ihr einfache Aufgaben';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  assert.equal(w.document.querySelector('[data-proposal-key="audioQuestionCount"]')?.value, '2');
  assert.match(w.document.querySelector('[data-proposal-key="notes"]')?.value || '', /einfache Aufgaben/i);
  assert.equal(notes.value, 'Vorhandener Wunsch.');
  acceptProposal(w);
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '2');
  assert.equal(w.document.getElementById('aiCount').value, '15');
  assert.equal(w.document.getElementById('aiImageQuestionCount').value, '2');
  assert.equal(w.document.getElementById('aiTopic').value, 'Bruchrechnen kürzen und erweitern');
  assert.match(notes.value, /^Vorhandener Wunsch\.[\s\S]*einfache Aufgaben/i);
  assert.equal(w.document.querySelector('.aiOptionalTestOptions').open, true);
  const status = w.document.getElementById('gcRemyCreateStatus').textContent;
  assert.match(status, /Höraufgaben/);
  assert.match(status, /Eigene Wünsche/);
  const request = collect();
  assert.equal(request.audioQuestionCount, 2);
  assert.equal(request.imageQuestionCount, 2);
  assert.equal(request.count, 15);
  assert.match(request.notes, /einfache Aufgaben/i);
});

function installCollector(w) {
  const app = fs.readFileSync('app.js', 'utf8');
  const start = app.indexOf('function collectAiRequest()');
  const end = app.indexOf('\n}', start) + 2;
  w.eval(`$ = id => document.getElementById(id); state = { aiMaterials: [] }; ${app.slice(start, end)}; window.collectAiRequest = collectAiRequest;`);
  const values = { aiCount: '5', aiPoints: '10', aiImageQuestionCount: '0', aiAudioQuestionCount: '0', aiAudioAnswerQuestionCount: '0', aiSolutionAudioQuestionCount: '0' };
  Object.entries(values).forEach(([id, value]) => { w.document.getElementById(id).value = value; });
  if (!w.document.getElementById('aiTopic').value) w.document.getElementById('aiTopic').value = 'Testthema';
  const materialMode = w.document.createElement('select');
  materialMode.id = 'aiMaterialMode';
  materialMode.innerHTML = '<option value="inspiration" selected>Als Anregung</option>';
  w.document.body.append(materialMode);
  return w.collectAiRequest;
}

test('a confirmed new-test reset clears Remy dictation and its old success summary', async t => {
  const w = setup(t);
  w.document.getElementById('gcRemyCreateInput').value = 'Englischtest von gerade';
  const status = w.document.getElementById('gcRemyCreateStatus');
  status.textContent = 'Eingetragen: Englisch';
  w.document.dispatchEvent(new w.CustomEvent('gradecrew:ai-form-reset'));
  assert.equal(w.document.getElementById('gcRemyCreateInput').value, '');
  assert.equal(status.textContent, '');
});

test('structured Remy suggestions stay pending until accepted and can be adjusted first', async t => {
  const w = setup(t);
  w.httpsCallable = () => async () => ({ data: { action: { type: 'patch_ai_form', patch: { subject: 'Deutsch', topic: 'Wortarten', notes: 'Nur Tierbeispiele verwenden.' } } } });
  w.document.getElementById('gcRemyCreateInput').value = 'Bitte gestalte einen Test mit einem bestimmten Wunsch';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  const apply = w.document.getElementById('gcRemyProposalApply');
  assert.ok(apply);
  assert.equal(w.document.getElementById('aiSubject').value, '');
  assert.equal(w.document.getElementById('aiCustomNotes').value, '');
  assert.match(w.document.getElementById('gcRemyProposal').textContent, /Fach/);
  w.document.getElementById('gcRemyProposalEdit').click();
  const topic = w.document.querySelector('[data-proposal-key="topic"]');
  assert.equal(topic.disabled, false);
  topic.value = 'Satzglieder';
  assert.equal(w.document.getElementById('aiTopic').value, '');
  assert.equal(w.document.getElementById('aiCustomNotes').value, '');
  apply.click();
  assert.equal(w.document.getElementById('aiSubject').value, 'Deutsch');
  assert.equal(w.document.getElementById('aiTopic').value, 'Satzglieder');
  assert.equal(w.document.getElementById('aiCustomNotes').value, 'Nur Tierbeispiele verwenden.');
  assert.equal(w.document.querySelector('.aiOptionalTestOptions').open, true);
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Eigene Wünsche/);
  apply.click();
  assert.equal(w.document.getElementById('aiCustomNotes').value, 'Nur Tierbeispiele verwenden.');
  assert.equal(w.document.getElementById('gcRemyProposal'), null);

  const collect = installCollector(w);
  assert.equal(collect().notes, 'Nur Tierbeispiele verwenden.');
});

test('the wishes microphone appends speech to Eigene Wünsche and leaves the final prompt untouched', async t => {
  const w = setup(t);
  let recognition;
  class MockSpeechRecognition {
    constructor() { recognition = this; }
    start() {}
    stop() {}
  }
  w.SpeechRecognition = MockSpeechRecognition;
  const notes = w.document.getElementById('aiCustomNotes');
  notes.value = 'Vorhandener Wunsch';
  const prompt = w.document.getElementById('gcRemyCreateInput');
  prompt.value = 'Englisch Klasse 5';
  w.document.getElementById('gcRemyNotesMic').click();
  assert.equal(notes.value, 'Vorhandener Wunsch');
  assert.equal(prompt.value, 'Englisch Klasse 5');
  assert.match(w.document.getElementById('gcRemyNotesMicStatus').textContent, /höre zu/i);
  recognition.onresult({ resultIndex: 0, results: [{ 0: { transcript: 'Nur Tierbeispiele verwenden.' }, isFinal: true }] });
  assert.equal(notes.value, 'Vorhandener Wunsch Nur Tierbeispiele verwenden.');
  assert.equal(prompt.value, 'Englisch Klasse 5');
});

test('the main Remy microphone click sends speech to the test request field', t => {
  const w = setup(t);
  let recognition;
  class MockSpeechRecognition {
    constructor() { recognition = this; }
    start() {}
    stop() {}
  }
  w.SpeechRecognition = MockSpeechRecognition;
  const prompt = w.document.getElementById('gcRemyCreateInput');
  const notes = w.document.getElementById('aiCustomNotes');
  prompt.value = 'Vorhandener Testwunsch';
  notes.value = 'Nur für Eigene Wünsche';

  w.document.getElementById('gcRemyCreateMic').click();
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /höre zu/i);
  assert.doesNotThrow(() => recognition.onresult({ resultIndex: 0, results: [{ 0: { transcript: 'Deutsch Klasse fünf' }, isFinal: true }] }));
  assert.equal(prompt.value, 'Vorhandener Testwunsch Deutsch Klasse fünf');
  assert.equal(notes.value, 'Nur für Eigene Wünsche');
});

test('the wishes microphone sits beside its optional label', t => {
  const w = setup(t);
  const mic = w.document.getElementById('gcRemyNotesMic');
  const heading = mic.parentElement;
  const optional = heading.querySelector('small');
  assert.ok(optional);
  assert.equal(optional.nextElementSibling, mic);
  assert.notEqual(mic.style.marginLeft, 'auto');
});

test('speech errors are visible and stopping or switching microphones preserves field text', async t => {
  const unsupported = setup(t);
  unsupported.document.getElementById('aiCustomNotes').value = 'Vorhanden';
  unsupported.document.getElementById('gcRemyNotesMic').click();
  assert.match(unsupported.document.getElementById('gcRemyNotesMicStatus').textContent, /nicht unterstützt/i);
  assert.equal(unsupported.document.getElementById('aiCustomNotes').value, 'Vorhanden');

  const w = setup(t);
  let recognition;
  class MockSpeechRecognition {
    constructor() { recognition = this; }
    start() {}
    stop() { this.stopped = true; }
  }
  w.SpeechRecognition = MockSpeechRecognition;
  const notes = w.document.getElementById('aiCustomNotes');
  notes.value = 'Schon da';
  const notesMic = w.document.getElementById('gcRemyNotesMic');
  notesMic.click();
  recognition.onerror({ error: 'not-allowed' });
  assert.match(w.document.getElementById('gcRemyNotesMicStatus').textContent, /Berechtigung/i);
  assert.equal(notes.value, 'Schon da');
  notesMic.click();
  notesMic.click();
  assert.equal(recognition.stopped, true);
  assert.match(w.document.getElementById('gcRemyNotesMicStatus').textContent, /Diktat beendet/i);
});

test('a plain Remy reply stays a question until the teacher chooses the original-text route', async t => {
  const w = setup(t);
  w.httpsCallable = () => async () => ({ data: { reply: 'Soll ich diesen Wunsch als Zusatzhinweis aufnehmen?' } });
  w.document.getElementById('gcRemyCreateInput').value = 'Bitte hilf mir mit einem ungewöhnlichen Test';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  assert.equal(w.document.getElementById('gcRemyProposal'), null);
  assert.ok(w.document.getElementById('gcRemyOriginalWish'));
  assert.equal(w.document.getElementById('aiCustomNotes').value, '');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Soll ich diesen Wunsch/);
});

test('the screenshot-style reply offers the exact original request and applies only after confirmation', async t => {
  const w = setup(t);
  w.resolveLocalCrewRequest = () => ({ handled: false });
  w.httpsCallable = () => async () => ({ data: { reply: 'Soll ich diese Bitte als Zusatzhinweis aufnehmen?' } });
  const original = ('Die Aufgaben sollen lange Sätze enthalten und Fachbegriffe der Prozentrechnung nutzen. ' + 'Weitere konkrete Vorgabe für die Aufgaben. '.repeat(46)).trim();
  assert.ok(original.length > 1500);
  w.document.getElementById('gcRemyCreateInput').value = original;
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  assert.equal(w.document.getElementById('aiCustomNotes').value, '');
  w.document.getElementById('gcRemyOriginalWish').click();
  const proposal = w.document.getElementById('gcRemyProposal');
  assert.equal(proposal.querySelector('[data-proposal-key="notes"]').value, original);
  assert.match(proposal.textContent, /Soll ich diese Bitte/);
  assert.equal(proposal.querySelector('#gcRemyProposalApply').textContent, 'Als Wunsch übernehmen');
  const collect = installCollector(w);
  assert.equal(collect().notes, '');
  w.document.getElementById('gcRemyProposalEdit').click();
  const note = proposal.querySelector('[data-proposal-key="notes"]');
  note.value = 'Lange Sätze und Fachbegriffe aus der Prozentrechnung.';
  assert.equal(collect().notes, '');
  w.document.getElementById('gcRemyProposalApply').click();
  assert.equal(collect().notes, 'Lange Sätze und Fachbegriffe aus der Prozentrechnung.');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Eigene Wünsche/);
});

test('a wish that would exceed the existing notes limit stays editable and is not partially applied', async t => {
  const w = setup(t);
  w.resolveLocalCrewRequest = () => ({ handled: false });
  w.httpsCallable = () => async () => ({ data: { reply: 'Soll ich diese Bitte aufnehmen?' } });
  const existing = 'Schon vorhandener Wunsch. ' + 'x'.repeat(5930);
  const original = 'Bitte berücksichtige zusätzlich diese konkrete Vorgabe.';
  w.document.getElementById('aiCustomNotes').value = existing;
  w.document.getElementById('gcRemyCreateInput').value = original;
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  w.document.getElementById('gcRemyOriginalWish').click();
  const proposal = w.document.getElementById('gcRemyProposal');
  assert.equal(proposal.querySelector('[data-proposal-key="notes"]').value, original);
  const collect = installCollector(w);
  w.document.getElementById('gcRemyProposalApply').click();
  assert.equal(w.document.getElementById('aiCustomNotes').value, existing);
  assert.ok(w.document.getElementById('gcRemyProposal'));
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /6.000 Zeichen/);
  w.document.getElementById('gcRemyProposalEdit').click();
  proposal.querySelector('[data-proposal-key="notes"]').value = 'Kürzere zusätzliche Vorgabe.';
  w.document.getElementById('gcRemyProposalApply').click();
  assert.equal(collect().notes, existing + '\nKürzere zusätzliche Vorgabe.');
  assert.ok(collect().notes.length <= 6000);
});

test('Remy lives inside AI creation and fills the existing form without navigation', async t => {
  const w = setup(t);
  const panel = w.document.getElementById('gcRemyCreatePanel');
  assert.ok(panel);
  assert.match(panel.textContent, /Remy/);
  assert.equal(w.document.getElementById('gcRemyHelpLauncher'), null);

  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'Erstelle mir einen Englischtest für die 4 Klasse für Farben, leichte Aufgaben, 12 Aufgaben und 20 Punkte.';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  acceptProposal(w);

  assert.equal(w.document.getElementById('aiSubject').value, 'Englisch');
  assert.equal(w.document.getElementById('aiGrade').value, '4');
  assert.equal(w.document.getElementById('aiTopic').value, 'Farben');
  assert.equal(w.document.getElementById('aiDifficulty').value, 'leicht');
  assert.equal(w.document.getElementById('aiCount').value, '12');
  assert.equal(w.document.getElementById('aiPoints').value, '20');
  assert.equal(w.document.getElementById('aiView').classList.contains('hidden'), false);
  assert.equal(w.document.getElementById('aiTopic').disabled, false);
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Übernommen in/);
});

test('Remy dictation is designed to survive short browser speech pauses', () => {
  assert.match(source, /active\.continuous = true/);
  assert.match(source, /active\.onend = \(\) =>/);
  assert.match(source, /setTimeout\(startRecognitionCycle, 180\)/);
  assert.doesNotMatch(source, /gcRemyHelpLauncher|createAiBtn/);
});


test('Remy fills an explicit listening-task count into the existing audio field', async t => {
  const w = setup(t);
  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'Englisch 6. Klasse Shopping, 12 Aufgaben, davon 3 Höraufgaben.';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  acceptProposal(w);
  assert.equal(w.document.getElementById('aiSubject').value, 'Englisch');
  assert.equal(w.document.getElementById('aiGrade').value, '6');
  assert.equal(w.document.getElementById('aiTopic').value, 'Shopping');
  assert.equal(w.document.getElementById('aiCount').value, '12');
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '3');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Höraufgaben/);
});


test('Remy fills listening and solution audio counts independently', async t => {
  const w = setup(t);
  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'Englisch 6. Klasse Shopping, 12 Aufgaben, davon 3 Höraufgaben und 2 Lösungen als Audio.';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  acceptProposal(w);
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '3');
  assert.equal(w.document.getElementById('aiAudioAnswerQuestionCount').value, '2');
  assert.equal(w.document.getElementById('aiSolutionAudioQuestionCount').value, '');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /vorgelesenen Antwortoptionen/);
});

test('Remy fills picture, listening and spoken-answer counts in their own form fields', async t => {
  const w = setup(t);
  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'Deutsch 5. Klasse Thema Wortarten und Satzglieder bitte lustige Sätze einbauen und auch zwei Bilder und zwei Hör Aufgaben und zwei Aufgaben mit vorgelesenen Antwortoptionen';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  acceptProposal(w);
  assert.equal(w.document.getElementById('aiSubject').value, 'Deutsch');
  assert.equal(w.document.getElementById('aiTopic').value, 'Wortarten und Satzglieder');
  assert.equal(w.document.getElementById('aiImageQuestionCount').value, '2');
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '2');
  assert.equal(w.document.getElementById('aiAudioAnswerQuestionCount').value, '2');
  assert.equal(w.document.getElementById('aiSolutionAudioQuestionCount').value, '');
  assert.match(w.document.getElementById('aiCustomNotes').value, /lustige Sätze/i);
});


test('English UI sends an explicit assistant locale and keeps current Remy form behaviour', async t => {
  const w = setup(t);
  w.GradeCrewI18n.locale = 'en-GB';
  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'English Year 4 topic colours, medium, 10 questions, 2 listening questions';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  acceptProposal(w);

  assert.equal(w.document.getElementById('aiSubject').value, 'Englisch');
  assert.equal(w.document.getElementById('aiGrade').value, '4');
  assert.equal(w.document.getElementById('aiTopic').value, 'colours');
  assert.equal(w.document.getElementById('aiDifficulty').value, 'mittel');
  assert.equal(w.document.getElementById('aiCount').value, '10');
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '2');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Applied to/);
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Listening tasks/);
});

test('Remy dictation follows an explicit voice locale instead of hard-coding German', () => {
  assert.match(source, /gradecrew\.voiceInputLocale/);
  assert.match(source, /active\.lang = currentVoiceInputLocale\(\)/);
  assert.match(source, /gradecrew:ui-locale-changed/);
  assert.doesNotMatch(source, /active\.lang = "de-DE"/);
});

test('explicit English test language reaches the form and emits the locale change event', async t => {
  const w=setup(t);const language=w.document.getElementById('aiContentLocale');let changed='';
  language.addEventListener('change',()=>{changed=language.value;});
  w.document.getElementById('gcRemyCreateInput').value='Mathematik Klasse 5 Test auf Englisch';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await settle(w);acceptProposal(w);assert.equal(language.value,'en-GB');assert.equal(changed,'en-GB');
  assert.equal(w.GradeCrewI18n.locale,'de-DE');
});

// Regression: the live form must expose test-specific instructions without opening optional settings.
test('actual Remy form keeps instructions next to the topic and adds dictation without an accordion', async t => {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url: 'https://example.test', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const d = dom.window.document;
  const field = d.getElementById('aiCustomNotes');
  const label = field.closest('label');
  assert.equal(label.previousElementSibling, d.getElementById('aiTopic').closest('label'));
  assert.equal(field.closest('details'), null);
  assert.equal(d.querySelectorAll('#aiCustomNotes').length, 1);
  const w = setup(t);
  w.document.querySelector('#aiTopic').closest('label').after(w.document.querySelector('#aiCustomNotes').closest('label'));
  w.document.getElementById('gcRemyNotesMic').click();
  assert.equal(w.document.getElementById('gcRemyNotesMic').type, 'button');
  assert.ok(w.document.getElementById('gcRemyNotesMicStatus'));
});
