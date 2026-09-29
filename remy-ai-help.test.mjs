import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('remy-ai-help.js', 'utf8');

function setup(t) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <section id="createView"><div class="createChoiceGrid"><button id="createAiBtn">Mit KI erstellen</button><button id="createManualBtn">Manuell</button><article class="importChoiceCard"></article></div></section>
    <section id="aiView" class="hidden"><div class="aiGrid"><article><input id="aiSubject"><textarea id="aiCustomNotes"></textarea><details class="gradecrewPreferenceDetails"></details></article><article><input id="aiImageQuestionCount"></article></div><button id="generateAiTestBtn">Test erstellen</button></section>
  </body></html>`, { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = '1'; };
  w.document.getElementById('createAiBtn').addEventListener('click', () => w.document.getElementById('aiView').classList.remove('hidden'));
  w.eval(source.replace(/^export /gm, ''));
  return w;
}

async function settle(w, ms = 10) {
  await new Promise(resolve => w.setTimeout(resolve, ms));
}

test('Remy help is optional, opens AI creation and never locks form controls', async t => {
  const w = setup(t);
  const launcher = w.document.getElementById('gcRemyHelpLauncher');
  assert.ok(launcher);
  assert.match(launcher.textContent, /Remy hilft/);

  launcher.click();
  await settle(w, 80);
  assert.equal(w.document.getElementById('aiView').classList.contains('hidden'), false);
  assert.ok(w.document.querySelector('.gcRemyGuide'));
  assert.match(w.document.querySelector('.gcRemyGuide').textContent, /Du kannst während meiner Hilfe alles frei anklicken/);
  assert.equal(w.document.getElementById('aiSubject').disabled, false);

  w.document.querySelector('.gcRemyNext').click();
  await settle(w);
  assert.ok(w.document.getElementById('aiCustomNotes').classList.contains('gcRemyHelpTarget'));

  w.document.querySelector('.gcRemyStop').click();
  assert.equal(w.document.querySelector('.gcRemyGuide'), null);
  assert.equal(w.document.querySelector('.gcRemyHelpTarget'), null);
});
