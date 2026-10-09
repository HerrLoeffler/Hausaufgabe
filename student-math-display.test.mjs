import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { formatMathText } from './shared/math-display.mjs';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');

test('student math exponents render readably without interpreting authored HTML', () => {
  assert.equal(formatMathText('f(x)=x·e^{-x}'), 'f(x)=x·e<sup>-x</sup>');
  assert.equal(formatMathText('2^{x+1}=16'), '2<sup>x+1</sup>=16');
  assert.equal(formatMathText('a_{n+1} <script>'), 'a<sub>n+1</sub> &lt;script&gt;');
});

test('secure student paper displays formatted exponents in questions and answers', () => {
  const dom = new JSDOM('<main></main>');
  const context = { document: dom.window.document, currentQuiz: { contentLocale: 'de-DE' }, formatMathText,
    assessmentContentLabels: () => ({ answer: 'Antwort' }) };
  const secure = fs.readFileSync('secure-student.js', 'utf8');
  const secureStart = secure.indexOf('function questionShell(');
  vm.runInNewContext(secure.slice(secureStart, secure.indexOf('function memoLabel(', secureStart)), context);
  const question = { id: 'q1', type: 'single', text: 'Berechne 2^{x+1}.', points: 1,
    options: [{ id: 'a', text: 'e^{-x}' }, { id: 'b', text: '<script>' }] };
  const section = context.questionShell(question, 0);
  context.renderOptions(section, question);
  assert.equal(section.querySelector('h2').innerHTML, 'Berechne 2<sup>x+1</sup>.');
  assert.equal(section.querySelector('.secureChoice span span').innerHTML, 'e<sup>-x</sup>');
  assert.equal(section.querySelectorAll('script').length, 0);
  dom.window.close();
});
