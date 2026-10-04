import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planBenchmark, validateBenchmarkBundle, validatePriceSnapshot } from '../run-provider-benchmark.mjs';

const base = new URL('../', import.meta.url);
async function json(name) {
  return JSON.parse(await readFile(new URL(name, base), 'utf8'));
}

test('all Phase A development bundles match the benchmark plan and current price snapshot', async () => {
  const [plan, prices, crew, rewrite, hint] = await Promise.all([
    json('provider-benchmark-plan.v1.json'),
    json('provider-price-snapshot.2026-10-04.json'),
    json('cases/phase-a-crew-intent.de.dev.v1.json'),
    json('cases/phase-a-question-rewriting.de.dev.v1.json'),
    json('cases/phase-a-game-hint.de.dev.v1.json'),
  ]);
  validatePriceSnapshot(prices);
  for (const bundle of [crew, rewrite, hint]) {
    const validated = validateBenchmarkBundle(bundle, plan);
    assert.equal(validated.reviewStatus, 'development');
    assert.equal(validated.cases.length, 12);
    assert.equal(validated.providers.size, 4);
    const pilot = planBenchmark(bundle, plan, prices, { maxCalls: 8, maxReserveMicros: 500000 });
    assert.equal(pilot.calls.length, 8);
    assert.equal(pilot.deferred, 40);
    assert.ok(pilot.reservedMicros > 0);
  }
});

test('Phase A reference material is explicitly non-authorizing and covers leak-sensitive hint cases', async () => {
  const ref = await json('cases/phase-a-development-reference.de.v1.json');
  assert.equal(ref.status, 'development_only');
  assert.equal(ref.runtimeAuthorized, false);
  assert.ok(ref.caseChecks['gh-01'].forbiddenFinalAnswers.includes('20'));
  assert.ok(ref.rubrics.game_hint.critical.some(value => value.includes('final answer')));
});
