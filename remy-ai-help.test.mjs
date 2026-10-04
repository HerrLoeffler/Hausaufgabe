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
      <label>Fach<input id="aiSubject"></label>
      <label>Klasse<input id="aiGrade"></label>
      <label>Schulart<input id="aiSchoolType"></label>
      <label>Region<input id="aiRegion"></label>
      <label>Thema<input id="aiTopic"></label>
      <label>Schwierigkeit<input id="aiDifficulty"></label>
      <label>Anzahl<input id="aiCount"></label>
      <label>Punkte<input id="aiPoints"></label>
      <label>Höraufgaben<input id="aiAudioQuestionCount"></label>\n      <label>Audio-Lösungen<input id="aiSolutionAudioQuestionCount"></label>
      <details><div id="aiTypeChecks"><label><input type="checkbox" value="single" checked>Single</label><label><input type="checkbox" value="multi">Multiple</label><label><input type="checkbox" value="text">Freitext</label></div></details>
      <label>Wünsche<textarea id="aiCustomNotes"></textarea></label>
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

  assert.equal(w.document.getElementById('aiSubject').value, 'Englisch');
  assert.equal(w.document.getElementById('aiGrade').value, '4');
  assert.equal(w.document.getElementById('aiTopic').value, 'Farben');
  assert.equal(w.document.getElementById('aiDifficulty').value, 'leicht');
  assert.equal(w.document.getElementById('aiCount').value, '12');
  assert.equal(w.document.getElementById('aiPoints').value, '20');
  assert.equal(w.document.getElementById('aiView').classList.contains('hidden'), false);
  assert.equal(w.document.getElementById('aiTopic').disabled, false);
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Eingetragen/);
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
  assert.equal(w.document.getElementById('aiSubject').value, 'Englisch');
  assert.equal(w.document.getElementById('aiGrade').value, '6');
  assert.equal(w.document.getElementById('aiTopic').value, 'Shopping');
  assert.equal(w.document.getElementById('aiCount').value, '12');
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '3');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /3 Höraufgaben/);
});


test('Remy fills listening and solution audio counts independently', async t => {
  const w = setup(t);
  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'Englisch 6. Klasse Shopping, 12 Aufgaben, davon 3 Höraufgaben und 2 Lösungen als Audio.';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '3');
  assert.equal(w.document.getElementById('aiSolutionAudioQuestionCount').value, '2');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /2 Audio-Lösungen/);
});


test('English UI sends an explicit assistant locale and keeps current Remy form behaviour', async t => {
  const w = setup(t);
  w.GradeCrewI18n.locale = 'en-GB';
  const input = w.document.getElementById('gcRemyCreateInput');
  input.value = 'English Year 4 topic colours, medium, 10 questions, 2 listening questions';
  w.document.getElementById('gcRemyCreateForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await settle(w);

  assert.equal(w.document.getElementById('aiSubject').value, 'Englisch');
  assert.equal(w.document.getElementById('aiGrade').value, '4');
  assert.equal(w.document.getElementById('aiTopic').value, 'colours');
  assert.equal(w.document.getElementById('aiDifficulty').value, 'mittel');
  assert.equal(w.document.getElementById('aiCount').value, '10');
  assert.equal(w.document.getElementById('aiAudioQuestionCount').value, '2');
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /Added/);
  assert.match(w.document.getElementById('gcRemyCreateStatus').textContent, /2 listening questions/);
});

test('Remy dictation follows an explicit voice locale instead of hard-coding German', () => {
  assert.match(source, /gradecrew\.voiceInputLocale/);
  assert.match(source, /active\.lang = currentVoiceInputLocale\(\)/);
  assert.match(source, /gradecrew:ui-locale-changed/);
  assert.doesNotMatch(source, /active\.lang = "de-DE"/);
});
