import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('app.js', 'utf8');
const start = source.indexOf('function escapeHtml(');
const end = source.indexOf('\nfunction ', source.indexOf('function formatMathText(') + 1);

test('student math exponents render readably without interpreting authored HTML', () => {
  const context = {};
  vm.runInNewContext(source.slice(start, end), context);
  assert.equal(context.formatMathText('f(x)=x·e^{-x}'), 'f(x)=x·e<sup>-x</sup>');
  assert.equal(context.formatMathText('2^{x+1}=16'), '2<sup>x+1</sup>=16');
  assert.equal(context.formatMathText('a_{n+1} <script>'), 'a<sub>n+1</sub> &lt;script&gt;');
});
