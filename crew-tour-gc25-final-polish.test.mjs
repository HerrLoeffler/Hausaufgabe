import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('crew-tour-gc25-final-polish.js', 'utf8');

function setup(t) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <section id="aiView"><details class="gradecrewPreferenceDetails"><summary>Persönliche KI-Vorgaben <small>optional</small></summary><label class="aiNotesField">Vorgaben für meine Tests <small>(für künftige Tests)</small><textarea></textarea></label></details></section>
    <div id="reviewQuestions"><div class="reviewQuestion" id="free"><strong>5. Write one colour in English.</strong><label>Punkte für Aufgabe 5</label><input class="manualPoints" value="1"></div></div>
    <button id="saveReview">Bewertung speichern</button>
  </body></html>`, { url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = String(Number(this.dataset.scrolled || 0) + 1); };
  w.eval(source.replace(/^export /gm, ''));
  return w;
}

async function settle(w) {
  await new Promise(resolve => w.setTimeout(resolve, 0));
  await Promise.resolve();
}

function coach(w, title, text = 'Alt') {
  const node = w.document.createElement('aside');
  node.className = 'gcRealCoach';
  node.innerHTML = `<h2>${title}</h2><p>${text}</p><button class="gcCoachNext">Weiter</button>`;
  return node;
}

test('gc25 makes Remy own the material and preference language', async t => {
  const w = setup(t);
  await settle(w);
  assert.match(w.document.querySelector('.gradecrewPreferenceDetails > summary').textContent, /Vorgaben für Remy/);

  const images = coach(w, 'Bilder plane ich direkt mit ein.');
  w.document.body.append(images);
  await settle(w);
  assert.match(images.querySelector('p').textContent, /mir auch eigene PDFs/);
  assert.doesNotMatch(images.querySelector('p').textContent, /GradeCrew den Test/);

  images.remove();
  const prefs = coach(w, 'Noch ein Tipp für später.');
  w.document.body.append(prefs);
  await settle(w);
  assert.match(prefs.querySelector('p').textContent, /Vorgaben für Remy/);
  assert.doesNotMatch(prefs.querySelector('p').textContent, /KI-Vorgaben/);

  prefs.remove();
  const legacyPrefs = coach(w, 'Stopp – ein kleiner Unterschied!', 'Im Feld darunter kannst du später persönliche Vorlieben hinterlegen.');
  w.document.body.append(legacyPrefs);
  await settle(w);
  assert.match(legacyPrefs.querySelector('p').textContent, /Vorgaben für Remy/);
  assert.doesNotMatch(legacyPrefs.querySelector('p').textContent, /persönliche Vorlieben|KI-Vorgaben/i);
});

test('gc25 shortens Wilma test settings copy', async t => {
  const w = setup(t);
  const wilma = coach(w, 'So ist unser Probetest eingestellt.');
  w.document.body.append(wilma);
  await settle(w);
  assert.equal(wilma.querySelector('h2').textContent, 'So läuft unser Probetest.');
  assert.match(wilma.querySelector('p').textContent, /Zeit, Start, Reihenfolge und Ergebnisanzeige/);
  assert.doesNotMatch(wilma.querySelector('p').textContent, /nicht deine allgemeinen Einstellungen/);
});

test('gc25 puts free-response coach in normal document flow so controls cannot be covered', async t => {
  const w = setup(t);
  const review = coach(w, 'Dein Urteil zählt.');
  review.classList.add('gc23FreeAnswerCoach');
  w.document.body.append(review);
  await settle(w);

  const free = w.document.getElementById('free');
  assert.ok(review.classList.contains('gc25InlineReviewCoach'));
  assert.equal(review.parentElement, free.parentElement);
  assert.equal(review.nextElementSibling, free);
  assert.equal(review.classList.contains('gc23FreeAnswerCoach'), false);
  assert.ok(free.classList.contains('gc25ResponsiveReview'));
  assert.ok(Number(review.dataset.scrolled) >= 1);
  await new Promise(resolve => w.setTimeout(resolve, 40));
  const scrollCount = review.dataset.scrolled;
  w.innerHeight = 300;
  w.dispatchEvent(new w.Event('resize'));
  await new Promise(resolve => w.setTimeout(resolve, 40));
  assert.equal(review.dataset.scrolled, scrollCount, 'keyboard resize does not recenter the answer');
});
