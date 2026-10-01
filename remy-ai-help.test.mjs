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
      <details><div id="aiTypeChecks"><label><input type="checkbox" value="single" checked>Single</label><label><input type="checkbox" value="multi">Multiple</label><label><input type="checkbox" value="text">Freitext</label></div></details>
      <label>Wünsche<textarea id="aiCustomNotes"></textarea></label>
      <button id="generateAiTestBtn">Test erstellen</button>
    </section>
  </body></html>`, { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = '1'; };

  w.CREW_MEMBERS = CREW_MEMBERS;
  w.patchSummary = patchSummary;
  w.resolveLocalCrewRequest = resolveLocalCrewRequest;
  w.getApp = () => ({});
  w.getFunctions = () => ({});
  w.httpsCallable = () => async () => ({ data: {} });

  const executable = source
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
