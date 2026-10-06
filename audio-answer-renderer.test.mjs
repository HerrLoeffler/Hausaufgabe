import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { assessmentContentLabels } from './shared/i18n/assessment-locale.mjs';
const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('secure-student.js', 'utf8');
const render = source.slice(source.indexOf('function renderOptions('), source.indexOf('function renderDropdown('));

test('four English spoken choices have separate players and selectable opaque IDs', () => {
  const dom = new JSDOM('<section></section>');
  const section = dom.window.document.querySelector('section');
  const question = { id: 'q1', audioAnswerMode: 'audio-only', options: [3, 5, 7, 19].map((x, i) => ({ id: `opaque-${i}`, text: `PRIVATE x=${x}`, audio: { src: `data:audio/mpeg;base64,QUJ${i}` } })) };
  vm.runInNewContext(render + '\nrenderOptions(section, question);', { document: dom.window.document, section, question, currentQuiz: { contentLocale: 'en-GB' }, assessmentContentLabels });
  const players = [...section.querySelectorAll('audio')];
  assert.equal(players.length, 4);
  assert.equal(section.querySelectorAll('input[type="radio"]').length, 4);
  assert.equal(new Set(players.map(p => p.src)).size, 4);
  assert.ok(players.every(p => p.controls && !p.autoplay && p.getAttribute('aria-label').startsWith('Answer ')));
  assert.doesNotMatch(section.textContent, /PRIVATE|Antwort|x=/);
  assert.match(section.textContent, /Answer 1/);
  section.querySelector('input[value="opaque-1"]').click();
  assert.equal(section.querySelector('input:checked').value, 'opaque-1');
  dom.window.close();
});
