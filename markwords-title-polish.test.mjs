import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from './tools/ui/node_modules/jsdom/lib/api.js';

test('only visible markwords headings lose stray object-replacement glyphs', async () => {
  const dom = new JSDOM('<div id="studentQuizCard"><section class="studentQuestion" data-type="markwords"><h3>Markiere alle\uFFFCVerben im Satz\uFFFC.</h3></section><section class="studentQuestion" data-type="single"><h3>Bild\uFFFC ansehen</h3></section></div>');
  const root = dom.window.document;
  const previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'HTMLDialogElement', 'Element'].map(key => [key, globalThis[key]]));
  Object.assign(globalThis, { window: dom.window, document: root, MutationObserver: dom.window.MutationObserver, HTMLDialogElement: dom.window.HTMLDialogElement, Element: dom.window.Element });
  try {
  const { cleanMarkwordsTitle, polishMarkwordsTitles, polishAiEditLabels } = await import('./teacher-copy-polish.js?markwords-title-test');
  assert.equal(cleanMarkwordsTitle('Markiere alle\uFFFCVerben im Satz\uFFFC.'), 'Markiere alle Verben im Satz.');
  polishMarkwordsTitles(root);
  assert.equal(root.querySelector('[data-type="markwords"] h3').textContent, 'Markiere alle Verben im Satz.');
  assert.equal(root.querySelector('[data-type="single"] h3').textContent, 'Bild\uFFFC ansehen');
  root.getElementById('studentQuizCard').insertAdjacentHTML('beforeend', '<section class="studentQuestion" data-type="markwords"><h3>Finde\uFFFCNomen.</h3></section>');
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert.equal(root.querySelectorAll('[data-type="markwords"] h3')[1].textContent, 'Finde Nomen.');
  root.documentElement.lang = 'en-GB';
  root.body.insertAdjacentHTML('beforeend', '<button class="aiEditQuestion"></button><div class="questionAiPanel"><strong></strong><button class="aiApply"></button></div>');
  polishAiEditLabels(root);
  assert.equal(root.querySelector('.aiEditQuestion').textContent, '✨ Improve');
  assert.equal(root.querySelector('.questionAiPanel .aiApply').textContent, 'Create revision');
  } finally {
    for (const [key, value] of Object.entries(previous)) value === undefined ? delete globalThis[key] : globalThis[key] = value;
  }
  dom.window.close();
});
