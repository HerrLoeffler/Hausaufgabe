import test from 'node:test';
import assert from 'node:assert/strict';
import { executeBenchmark, planBenchmark, validateBenchmarkBundle, validatePriceSnapshot } from './run-provider-benchmark.mjs';

const plan = {
  phases: [{ id: 'phase-a-fast-low-risk', jobs: [{ job: 'crew_intent', riskTier: 'low', minimumReviewedCases: 40 }] }],
};
const snapshot = {
  schemaVersion: 1, id: 'prices-2026-10-04', currency: 'USD', reviewedAt: '2026-10-04T00:00:00Z',
  models: [
    { provider: 'openai', model: 'gpt-5.6-luna', scope: 'standard', input: 200000, output: 1200000, cacheRead: 20000, cacheWrite: 250000 },
    { provider: 'anthropic', model: 'claude-haiku-4-5', scope: 'standard', input: 1000000, output: 5000000, cacheRead: 100000, cacheWrite: 1250000 },
    { provider: 'gemini', model: 'gemini-3.5-flash-lite', scope: 'vertex-eu', input: 165000, output: 1375000, cacheRead: 16500, cacheWrite: 165000 },
    { provider: 'mistral', model: 'mistral-small-2603', scope: 'standard', input: 150000, output: 600000, cacheRead: 15000, cacheWrite: 150000 },
  ],
};
const bundle = {
  schemaVersion: 1, id: 'crew-intent-dev-v1', phaseId: 'phase-a-fast-low-risk', job: 'crew_intent',
  subject: 'cross-subject', taskType: 'form-patch', riskTier: 'low', promptVersion: 'crew-intent-v1',
  system: 'Extract only the requested GradeCrew form changes.', maxTokens: 64, reviewStatus: 'development',
  context: { uiLocale: 'de-DE', inputLocale: 'de-DE', contentLocale: 'de-DE', gradingLocale: 'de-DE',
    educationContextId: 'mittelschule-bayern', curriculumVersion: 'lehrplanplus-current', timeZone: 'Europe/Berlin' },
  providers: [
    { provider: 'openai', model: 'gpt-5.6-luna', roles: ['interpreter'] },
    { provider: 'anthropic', model: 'claude-haiku-4-5', roles: ['critic'] },
    { provider: 'gemini', model: 'gemini-3.5-flash-lite', roles: ['interpreter'] },
    { provider: 'mistral', model: 'mistral-small-2603', roles: ['interpreter'] },
  ],
  cases: [{ id: 'case-1', independenceUnit: 'teacher-request-1', messages: [{ role: 'user', content: 'Mach 8 Aufgaben, mittel.' }] }],
};

function memoryBudgetStore() {
  const reservations = new Map();
  return {
    reservations,
    async reserve(row) {
      if (reservations.has(row.operationId)) throw new Error('OPERATION_ALREADY_CLAIMED');
      reservations.set(row.operationId, { ...row, state: 'reserved' });
    },
    async settle(operationId, receipt) {
      reservations.set(operationId, { ...reservations.get(operationId), ...receipt, state: 'settled' });
    },
  };
}

test('benchmark bundle and prices are strict and role-oriented', () => {
  assert.equal(validateBenchmarkBundle(bundle, plan).providers.get('anthropic').roles[0], 'critic');
  assert.equal(validatePriceSnapshot(snapshot).models.get('mistral').cacheRead, 15000);
  assert.throws(() => validateBenchmarkBundle({ ...bundle, job: 'image_generation' }, plan), /BENCHMARK_PLAN_MISMATCH|INVALID_BENCHMARK_BUNDLE/);
  assert.throws(() => validatePriceSnapshot({ ...snapshot, models: snapshot.models.slice(1) }), /INVALID_PRICE_SNAPSHOT/);
});

test('planning is deterministically capped by calls and reserved cost', () => {
  const full = planBenchmark(bundle, plan, snapshot, { maxCalls: 4, maxReserveMicros: 100000 });
  assert.equal(full.calls.length, 4);
  assert.equal(full.deferred, 0);
  const capped = planBenchmark(bundle, plan, snapshot, { maxCalls: 2, maxReserveMicros: 100000 });
  assert.equal(capped.calls.length, 2);
  assert.equal(capped.deferred, 2);
  assert.equal(capped.calls[0].caseId, 'case-1');
  assert.notEqual(capped.calls[0].operationId, capped.calls[1].operationId);
});

test('execution requires a durable budget store and never retries providers', async () => {
  let calls = 0;
  await assert.rejects(executeBenchmark({
    bundle, plan, snapshot, gatewayUrl: 'https://gateway.test', idToken: 'token',
    budgetStore: null, budget: {}, maxCalls: 4, maxReserveMicros: 100000,
  }), /MISSING_EXECUTION_GUARD/);

  const store = memoryBudgetStore();
  const result = await executeBenchmark({
    bundle, plan, snapshot, gatewayUrl: 'https://gateway.test', idToken: 'token',
    budgetStore: store, budget: { dailyMicros: 100000, monthlyMicros: 1000000, dailyCalls: 100 },
    maxCalls: 4, maxReserveMicros: 100000,
    now: (() => { let n = 1000; return () => n += 10; })(),
    fetchImpl: async (_url, options) => {
      calls++;
      const request = JSON.parse(options.body);
      return Response.json({
        request_id: `r-${calls}`, latency_ms: 7, provider: request.provider, model: request.model,
        text: 'private output', stop_reason: 'end_turn',
        usage: { input_tokens: 20, output_tokens: 5, input_tokens_details: { cached_tokens: 0 } },
      });
    },
  });
  assert.equal(calls, 4);
  assert.equal(result.metrics.length, 4);
  assert.equal(result.privateReviewPacket.results.length, 4);
  assert.equal(result.privateReviewPacket.results[0].result.text, 'private output');
  assert.equal(JSON.stringify(result.metrics).includes('private output'), false);
  assert.equal([...store.reservations.values()].every(row => row.state === 'settled'), true);
});

test('provider errors are content-free in metrics and keep unknown cost', async () => {
  const store = memoryBudgetStore();
  const result = await executeBenchmark({
    bundle: { ...bundle, providers: [bundle.providers[0]] }, plan, snapshot,
    gatewayUrl: 'https://gateway.test', idToken: 'token',
    budgetStore: store, budget: { dailyMicros: 100000, monthlyMicros: 1000000, dailyCalls: 100 },
    maxCalls: 1, maxReserveMicros: 100000,
    fetchImpl: async () => Response.json({ error: 'PROVIDER_HTTP_ERROR', request_id: 'safe-id', private: 'do not copy' }, { status: 400 }),
  });
  assert.equal(result.metrics[0].status, 'PROVIDER_HTTP_ERROR');
  assert.equal(result.metrics[0].costMicros, null);
  assert.equal(JSON.stringify(result.metrics).includes('do not copy'), false);
});

test('returned model identity mismatch is never priced as the requested model', async () => {
  const store = memoryBudgetStore();
  const result = await executeBenchmark({
    bundle: { ...bundle, providers: [bundle.providers[0]] }, plan, snapshot,
    gatewayUrl: 'https://gateway.test', idToken: 'token',
    budgetStore: store, budget: { dailyMicros: 100000, monthlyMicros: 1000000, dailyCalls: 100 },
    maxCalls: 1, maxReserveMicros: 100000,
    fetchImpl: async () => Response.json({
      request_id: 'r', latency_ms: 5, provider: 'openai', model: 'different-expensive-model',
      text: 'answer', stop_reason: 'end_turn', usage: { input_tokens: 20, output_tokens: 5, input_tokens_details: { cached_tokens: 0 } },
    }),
  });
  assert.equal(result.metrics[0].status, 'identity_mismatch');
  assert.equal(result.metrics[0].costMicros, null);
});
