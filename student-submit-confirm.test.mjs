import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { requestStudentSubmitConfirmation } from './student-submit-confirm.mjs';
import { enGBMessages } from './shared/i18n/messages-en-GB.mjs';

test('the outer submission action has an English translation', () => {
  assert.equal(enGBMessages['source:Test abgeben'], 'Submit test');
});

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');

function fixture(t) {
  const dom = new JSDOM('<!doctype html><html><body><button id="before">Vorher</button></body></html>', {
    url: 'https://example.test', pretendToBeVisual: true
  });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  document.querySelector('#before').focus();
  document.defaultView.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  document.defaultView.HTMLDialogElement.prototype.close = function () { this.open = false; };
  return document;
}

test('manual student confirmation uses an in-page dialog and restores focus after approval', async t => {
  const doc = fixture(t);
  const pending = requestStudentSubmitConfirmation('Alles bearbeitet. Test jetzt endgültig abgeben?', { doc });
  const dialog = doc.querySelector('dialog');
  assert.ok(dialog?.open);
  assert.match(dialog.textContent, /Alles bearbeitet/);
  assert.equal(dialog.getAttribute('aria-labelledby'), dialog.querySelector('h2').id);
  for (const label of ['Antworten abgeben', 'Abbrechen']) {
    assert.ok(enGBMessages[`source:${label}`], `English UI label missing: ${label}`);
  }
  assert.equal(doc.activeElement, dialog.querySelector('[data-action="cancel"]'));
  const word = dialog.querySelector('input');
  word.value = '  abgeben  ';
  word.dispatchEvent(new doc.defaultView.Event('input'));
  dialog.querySelector('[data-action="confirm"]').click();
  assert.equal(await pending, true);
  assert.equal(doc.querySelector('dialog'), null);
  assert.equal(doc.activeElement?.id, 'before');
});

test('cancel and Escape never approve a student submission', async t => {
  const doc = fixture(t);
  let pending = requestStudentSubmitConfirmation('Abgeben?', { doc });
  doc.querySelector('[data-action="cancel"]').click();
  assert.equal(await pending, false);
  pending = requestStudentSubmitConfirmation('Abgeben?', { doc });
  const event = new doc.defaultView.Event('cancel', { cancelable: true });
  doc.querySelector('dialog').dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(await pending, false);
  assert.equal(doc.querySelector('dialog'), null);
});

test('timer expiry aborts and removes an open confirmation', async t => {
  const doc = fixture(t);
  const controller = new AbortController();
  const pending = requestStudentSubmitConfirmation('Abgeben?', { doc, signal: controller.signal });
  assert.ok(doc.querySelector('dialog'));
  controller.abort();
  assert.equal(await pending, false);
  assert.equal(doc.querySelector('dialog'), null);
});

test('preview confirmation never claims it will save a final submission', async t => {
  const doc = fixture(t);
  const pending = requestStudentSubmitConfirmation('Alles bearbeitet. Vorschau jetzt auswerten?', { doc, preview: true });
  const dialog = doc.querySelector('dialog');
  assert.equal(dialog.querySelector('h2').textContent, 'Vorschau auswerten');
  assert.equal(dialog.querySelector('[data-action="confirm"]').textContent, 'Vorschau auswerten');
  assert.ok(enGBMessages['source:Vorschau auswerten']);
  dialog.querySelector('[data-action="cancel"]').click();
  assert.equal(await pending, false);
});

for (const [lang, word, label] of [['de-DE', 'ABGEBEN', 'Verbindlich abgeben'], ['en-GB', 'SUBMIT', 'Submit final answers']]) {
  test(`manual ${lang} confirmation shows counts, warning and requires the exact normalized word`, async t => {
    const doc = fixture(t); doc.documentElement.lang = lang;
    const pending = requestStudentSubmitConfirmation('', { doc, answered: 3, open: 2 });
    const dialog = doc.querySelector('dialog'), approve = dialog.querySelector('[data-action="confirm"]');
    assert.match(dialog.querySelector('[data-submit-counts]')?.textContent || '', /3.*2/);
    assert.ok(dialog.querySelector('[data-submit-warning]'));
    assert.equal(approve.textContent, label);
    const input = dialog.querySelector('input');
    assert.ok(input?.labels.length, 'word field has an accessible label');
    assert.equal(approve.disabled, true);
    input.value = 'wrong'; input.dispatchEvent(new doc.defaultView.Event('input'));
    assert.equal(approve.disabled, true);
    input.value = '  ' + word.toLowerCase() + '  '; input.dispatchEvent(new doc.defaultView.Event('input'));
    assert.equal(approve.disabled, false);
    input.value = ''; input.dispatchEvent(new doc.defaultView.Event('input'));
    assert.equal(approve.disabled, true);
    input.value = word; input.dispatchEvent(new doc.defaultView.Event('input'));
    approve.click(); assert.equal(await pending, true);
  });
}

test('all-answered confirmation still requires the word and does not show an open-task warning', async t => {
  const doc = fixture(t);
  const pending = requestStudentSubmitConfirmation('', { doc, answered: 5, open: 0 });
  assert.match(doc.querySelector('[data-submit-counts]')?.textContent || '', /5.*0/);
  assert.equal(doc.querySelector('[data-submit-warning]'), null);
  assert.equal(doc.querySelector('[data-action="confirm"]').disabled, true);
  doc.querySelector('[data-action="cancel"]').click(); assert.equal(await pending, false);
});
