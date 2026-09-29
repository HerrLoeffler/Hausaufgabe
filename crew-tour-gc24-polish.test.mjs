import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('crew-tour-gc24-polish.js', 'utf8');

function setup(t) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="quizList"><article class="quizCard"><button class="end">Beenden</button><button class="reopen">Erneut öffnen</button></article></div>
    <button id="settingsTopBtn">Einstellungen</button>
    <section id="settingsView" class="hidden"><div class="settingsPageGrid"><article>Standardwerte</article><article>Notenschlüssel</article></div></section>
    <button id="backFromSettings">Zurück</button>
  </body></html>`, { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = '1'; };
  w.document.getElementById('settingsTopBtn').addEventListener('click', () => w.document.getElementById('settingsView').classList.remove('hidden'));
  w.eval(source.replace(/^export /gm, ''));
  return w;
}

async function settle(w, ms = 0) {
  await new Promise(resolve => w.setTimeout(resolve, ms));
  await Promise.resolve();
}

function coach(w, title, body = '<p>Alt</p><button class="gcCoachNext">Weiter</button>') {
  const node = w.document.createElement('aside');
  node.className = 'gcRealCoach';
  node.innerHTML = `<h2>${title}</h2>${body}`;
  return node;
}

test('gc24 keeps the yellow correction obvious but deliberately demonstrates the red smiley', async t => {
  const w = setup(t);
  const node = coach(w, 'Schauen wir noch auf den zweiten Hinweis.');
  w.document.body.append(node);
  await settle(w);
  const text = node.querySelector('p').textContent;
  assert.match(text, /einfach „yellow“ als richtige Antwort markieren/);
  assert.match(text, /roten Smiley/);
  assert.match(text, /insgesamt nicht zufrieden/);
});

test('gc24 makes Coco ask for a name naturally and keeps the du joke', async t => {
  const w = setup(t);
  const node = coach(w, 'Ach, fast vergessen!', '<p>Alt</p><label class="gcNamePrompt">Name <input></label><button class="gcCoachNext">Weiter</button>');
  w.document.body.append(node);
  await settle(w);
  assert.match(node.querySelector('p').textContent, /Wie unhöflich von mir/);
  assert.match(node.querySelector('p').textContent, /Ich darf doch du sagen, oder\?/);
  assert.equal(node.querySelector('input').placeholder, 'z. B. Martin, Herr Löffler oder ML');
});

test('gc24 finish highlights elapsed time, removes the redundant finish action and opens only general settings', async t => {
  const w = setup(t);
  let completed = 0;
  const node = coach(w, 'Super – du gehörst jetzt zur Crew!', `
    <p>In 4:12 Minuten hast du deinen Übungstest erstellt, überarbeitet, selbst ausgefüllt und bewertet.</p>
    <button class="gcCoachNext">Eigenen Test erstellen</button>
    <div class="gcFinishChoices">
      <button>Einstellungen kurz kennenlernen</button>
      <button class="plainFinish">Tour abschließen</button>
    </div>`);
  node.querySelector('.plainFinish').onclick = () => { completed += 1; };
  w.document.body.append(node);
  await settle(w);

  assert.equal(node.querySelector('.gc24TimeHero strong').textContent, '4:12 Minuten');
  assert.match(node.textContent, /Viel Spaß beim Erkunden von GradeCrew/);
  assert.doesNotMatch(node.textContent, /Tour abschließen/);
  assert.equal(node.querySelector('.gcCoachNext').textContent, 'Eigenen Test erstellen');
  const settings = [...node.querySelectorAll('button')].find(button => /Zu den allgemeinen Einstellungen/.test(button.textContent));
  assert.ok(settings);

  settings.click();
  await settle(w, 10);
  assert.equal(completed, 1);
  assert.equal(w.document.getElementById('settingsView').classList.contains('hidden'), false);
  const guide = w.document.querySelector('.gc24SettingsGuide');
  assert.ok(guide);
  assert.match(guide.textContent, /Standardwerte/);
  assert.doesNotMatch(guide.textContent, /Einstellungen dieses Tests/);
});

test('gc24 removes obsolete end and reopen card actions', t => {
  const w = setup(t);
  assert.equal(w.document.querySelector('#quizList .quizCard .end'), null);
  assert.equal(w.document.querySelector('#quizList .quizCard .reopen'), null);
});
