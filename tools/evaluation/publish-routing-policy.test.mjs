import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createHash } from 'node:crypto';
import { approveRoute, scopeDigest } from './approve-route.mjs';
import { publishRoutingPolicy } from './publish-routing-policy.mjs';
import { createRequire } from 'node:module';
const { readSignedPolicy } = createRequire(import.meta.url)('../../ai-gateway/lib/routing-policy.js');
const now = Date.now();
const digest = s => createHash('sha256').update(s).digest('hex');
function fixture() {
  const scope = { job: 'game_hint', subject: 'math', taskType: 'number', riskTier: 'low', datasetVersion: 'fixture-v1', rubricVersion: 'v1', promptVersion: 'v1', schemaVersion: 'v1', validatorVersion: 'v1', pipelineVersion: 'v1',
    incumbent: 'anthropic/old-model', candidate: 'anthropic/new-model', uiLocale: 'de-DE', inputLocale: 'de-DE', contentLocale: 'de-DE', gradingLocale: 'de-DE', educationContextId: 'DE-BY', curriculumVersion: 'fixture', timeZone: 'Europe/Berlin' };
  const policy = { id: 'fixture', scope, minimumSuccess: 0.95, maximumRegression: 0.05, familyAlpha: 0.05, familyGateCount: 2, minimumCases: 100, maximumAgeDays: 7, maximumP95Ms: 1000, requireCostSaving: true };
  const evidence = { id: 'fixture', scope, completedAt: new Date(now).toISOString(), dataset: { id: 'fixture', referenceReviewId: 'fixture', samplingReviewId: 'fixture', heldOut: true, expectedCases: 100 },
    cases: Array.from({ length: 100 }, (_, i) => ({ id: `case-${i}`, independenceUnit: `unit-${i}`, incumbentPass: true, candidatePass: true, criticalFailure: false, candidateDurationMs: 100 })),
    cost: { currency: 'USD', priceSnapshotId: 'fixture', accountingReviewId: 'fixture', includesRetriesAndReview: true, incumbentTotal: 2, candidateTotal: 1 } };
  const route = { id: 'new', provider: 'anthropic', model: 'new-model', dataPolicyId: 'fixture', expiresAt: now + 10000, enabled: true,
    price: { id: 'fixture', currency: 'USD', expiresAt: now + 10000, input: 1000, output: 1000, cacheRead: 100, cacheWrite: 2000 } };
  return { policy, evidence, route };
}
test('approved route is bound to measured model/scope and derives full cost forecast', () => {
  const f = fixture(); const r = approveRoute({ ...f, now });
  assert.equal(r.forecastMicros, 10000); assert.equal(r.apiForecastMicros, null); assert.equal(r.scopeDigest, scopeDigest(f.evidence.scope));
  assert.throws(() => approveRoute({ ...f, route: { ...f.route, model: 'other-model' }, now }), /MODEL_EVIDENCE_MISMATCH/);
  f.evidence.cases[0].criticalFailure = true; assert.throws(() => approveRoute({ ...f, now }), /QUALITY_GATE_BLOCKED/);
});
test('API-only savings require separate matching evidence; total review cost is never used as API baseline', () => {
  const f = fixture(); const evidence = { evidenceId: 'fixture', currency: 'USD', reviewId: 'fixture-review', totalMicros: 1000 };
  assert.equal(approveRoute({ ...f, apiCostEvidence: evidence, now }).apiForecastMicros, 10);
  assert.throws(() => approveRoute({ ...f, apiCostEvidence: { ...evidence, currency: 'EUR' }, now }), /INVALID_API_COST_EVIDENCE/);
});
test('trusted evaluation worker can publish a verified policy without manual per-model or per-request approval', () => {
  const f = fixture(), { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const manifest = { version: 1, id: 'fixture', issuedAt: now, expiresAt: now + 10000, currency: 'USD',
    budgets: { production: { dailyMicros: 100, monthlyMicros: 1000, dailyCalls: 10 }, evaluation: { dailyMicros: 10, monthlyMicros: 100, dailyCalls: 2 } },
    profiles: [{ id: 'hint', job: 'game_hint', scopeDigest: scopeDigest(f.evidence.scope), promptDigest: digest('system'), dataPolicyId: 'fixture', validatorVersion: 'v1', modality: 'text', bucket: 'production',
      maxCalls: 1, maxInputBytes: 1000, maxOutputTokens: 100, deadlineMs: 1000, baselineRouteId: 'new', routes: [{ malicious: 'ignored' }] }] };
  const input = { manifest, evaluations: [{ profileId: 'hint', ...f }] };
  const envelope = publishRoutingPolicy(input, privateKey, now);
  assert.equal(readSignedPolicy(envelope, publicKey, now).profiles[0].routes[0].qualityEligible, true);
  f.evidence.cases[0].criticalFailure = true;
  assert.throws(() => publishRoutingPolicy(input, privateKey, now), /QUALITY_GATE_BLOCKED/);
});
