import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./gradecrew-tour.js', import.meta.url), 'utf8');

test('Crew tour uses the elephant creator role', () => {
  assert.match(source, /asset:\s*"elephant-create"/);
  assert.match(source, /Großer Kopf, viel Platz zum Denken/);
});

test('Crew tour imports a prepared demo instead of starting paid AI generation', () => {
  assert.match(source, /#importJsonBtn/);
  assert.match(source, /JSON\.stringify\(DEMO_TEST\)/);
  assert.doesNotMatch(source, /generateAiTestBtn[^\n]*\.click\(/);
  assert.doesNotMatch(source, /startAiTestJob/);
});

test('Demo feedback and AI-edit actions are intercepted before app handlers', () => {
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(source, /#?\.aiEditQuestion|\.aiEditQuestion/);
  assert.match(source, /#?\.aiVariantQuestion|\.aiVariantQuestion/);
  assert.match(source, /aiFeedbackSelected/);
});

test('The demo covers creation, improvement, preview, publish, live status and results', () => {
  for (const marker of ['#createAiBtn', '#previewBtn', '#publishBtn', '#liveResultsBtn', 'showFoxIntro', 'showVariantStep', 'showResultsExample']) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
