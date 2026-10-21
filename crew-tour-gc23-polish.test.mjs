import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('crew-tour-gc23-polish.js', 'utf8');

function fixture(t) {
  const dom = new JSDOM('<!doctype html><html><head></head><body class="gcRealTourActive"></body></html>', {
    url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = '1'; };
  w.eval(source.replace(/^export /gm, ''));
  return w;
}

function coach(w, title, text = 'Alt', { button = true } = {}) {
  const node = w.document.createElement('aside');
  node.className = 'gcRealCoach';
  node.innerHTML = `<h2>${title}</h2><p>${text}</p>${button ? '<button class="gcCoachNext" type="button">Weiter</button>' : ''}<small>Hinweis</small>`;
  return node;
}

async function settle(w) {
  await new Promise(resolve => w.setTimeout(resolve, 0));
  await Promise.resolve();
}

test('gc23 gives smileys, second warning, removal and handoff warmer final copy', async t => {
  const w = fixture(t);

  const good = coach(w, 'Diese Aufgabe gefällt uns.');
  w.document.body.append(good);
  await settle(w);
  assert.match(good.querySelector('h2').textContent, /grünen Smiley/i);
  assert.match(good.querySelector('p').textContent, /welche Aufgaben du gerne magst/);
  assert.match(good.querySelector('p').textContent, /nicht gespeichert/);

  good.remove();
  const warning = coach(w, 'Ein Hinweis wartet noch auf uns.');
  w.document.body.append(warning);
  await settle(w);
  assert.match(warning.querySelector('h2').textContent, /da war ja noch was/i);

  warning.remove();
  const remove = coach(w, 'Fehler melden und entfernen.');
  w.document.body.append(remove);
  await settle(w);
  assert.doesNotMatch(remove.querySelector('p').textContent, /Katze/i);
  assert.match(remove.querySelector('p').textContent, /Melden & entfernen/);

  remove.remove();
  const thanks = coach(w, 'Danke, Emmi!');
  w.document.body.append(thanks);
  await settle(w);
  assert.match(thanks.querySelector('p').textContent, /eine Aufgabe überarbeitet/);
  assert.match(thanks.querySelector('p').textContent, /eine Variante ergänzt/);
  assert.match(thanks.querySelector('p').textContent, /zehn Aufgaben/);
  assert.equal(thanks.querySelector('.gcCoachNext').textContent, 'Weiter');

  thanks.remove();
  const wilma = coach(w, 'Hallo, ich bin Wilma!');
  w.document.body.append(wilma);
  await settle(w);
  assert.match(wilma.querySelector('p').textContent, /Einstellungen für unseren Test/);
  assert.equal(wilma.querySelector('.gcCoachNext').textContent, 'Testeinstellungen ansehen');
});

test('gc23 turns the name prompt into a natural Coco aside', async t => {
  const w = fixture(t);
  const identity = w.document.createElement('aside');
  identity.className = 'gcRealCoach';
  identity.innerHTML = '<h2>Wie heißt du eigentlich?</h2><p>Ich bin Coco – und du?</p><p>Für Schülerinnen und Schüler reicht ein Kürzel.</p><label class="gcNamePrompt">Name oder Kürzel<input></label><button class="gcCoachNext">Weiter</button>';
  w.document.body.append(identity);
  await settle(w);

  assert.equal(identity.querySelector('h2').textContent, 'Ach, fast vergessen!');
  assert.match(identity.querySelector('p').textContent, /Wie unhöflich von mir/);
  assert.equal(identity.querySelectorAll(':scope > p').length, 1);
  assert.match(identity.querySelector('.gcNamePrompt').textContent, /Wie soll ich dich nennen/);
  assert.equal(identity.querySelector('input').placeholder, 'z. B. Martin, Herr Löffler oder ML');
});

test('gc23 shows Crew finale first, then returns the viewport to free response instead of task 10', async t => {
  const w = fixture(t);
  const review = w.document.createElement('div');
  review.id = 'reviewQuestions';
  review.innerHTML = `
    <div class="reviewQuestion" id="free"><strong>5. Write one colour in English.</strong><label>Punkte für Aufgabe 5</label><input class="manualPoints" value="1"></div>
    <div class="reviewQuestion" id="finale"><strong>10. Crew-Finale: Wer war zuerst da?</strong><input class="manualPoints" value="1.5"></div>`;
  w.document.body.append(review);
  const save = w.document.createElement('button');
  save.id = 'saveReview';
  save.className = 'gcTourTarget';
  save.textContent = 'Bewertung speichern';
  w.document.body.append(save);

  const first = coach(w, 'Automatisch, wo es eindeutig ist – du entscheidest beim Rest.', 'Schau dir Aufgabe 5 an.');
  const original = first.querySelector('.gcCoachNext');
  original.addEventListener('click', () => {
    first.remove();
    const next = coach(w, 'Dein Urteil zählt.', 'Prüfe die Antwort.', { button: false });
    w.document.body.append(next);
  });
  w.document.body.append(first);
  await settle(w);

  assert.equal(first.querySelector('h2').textContent, 'Erst unser Crew-Finale.');
  assert.match(first.querySelector('.gc23FinaleResult').textContent, /1,5 von 2 Punkten/);
  assert.equal(w.document.getElementById('finale').dataset.scrolled, '1');

  first.querySelector('.gcCoachNext').click();
  await settle(w);
  const next = w.document.querySelector('.gcRealCoach');
  assert.equal(next.querySelector('h2').textContent, 'Dein Urteil zählt.');
  assert.match(next.querySelector('p').textContent, /freie Antwort aus Aufgabe 5/);
  assert.ok(w.document.getElementById('free').classList.contains('gc23ReviewFocus'));
  assert.equal(w.document.getElementById('free').dataset.scrolled, '1');
  assert.ok(save.classList.contains('gc23SaveReviewFloating'));
  assert.ok(next.classList.contains('gc23FreeAnswerCoach'));
});
