import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateContext, validateVoicePatch, evaluateCapability } from '../context-contract.mjs';
import { evaluateQualityGate, upperFailureBound } from '../quality-gate.mjs';

const now = Date.parse('2026-10-02T00:00:00Z');
const context = { uiLocale: 'de-DE', inputLocale: 'de-DE', contentLocale: 'en-GB', gradingLocale: 'en-GB',
  educationContextId: 'DE-BY', curriculumVersion: 'fixture-v1', timeZone: 'Europe/Berlin' };
function fixture(n = 100) {
  const scope = { ...context, job: 'test_generation', subject: 'english', taskType: 'single', riskTier: 'medium',
    datasetVersion: 'synthetic-v1', rubricVersion: 'v1', promptVersion: 'v1', schemaVersion: 'v1',
    validatorVersion: 'v1', pipelineVersion: 'v1', incumbent: 'provider-a/model-20260101', candidate: 'provider-b/model-20260101' };
  return { policy: { id: 'synthetic-only', scope, minimumSuccess: 0.95, maximumRegression: 0.05,
    familyAlpha: 0.05, familyGateCount: 2, minimumCases: 100, maximumAgeDays: 7, maximumP95Ms: 2000, requireCostSaving: true },
  evidence: { id: 'synthetic-only', scope: { ...scope }, completedAt: '2026-10-01T00:00:00Z',
    dataset: { id: 'synthetic-only', referenceReviewId: 'fixture-review', samplingReviewId: 'fixture-sampling', heldOut: true, expectedCases: n },
    cases: Array.from({ length: n }, (_, i) => ({ id: `case-${i}`, independenceUnit: `family-${i}`,
      incumbentPass: true, candidatePass: true, criticalFailure: false, candidateDurationMs: 1000 })),
    cost: { currency: 'EUR', priceSnapshotId: 'fixture-price', accountingReviewId: 'fixture-review',
      includesRetriesAndReview: true, incumbentTotal: 10, candidateTotal: 5 } } };
}
const run = ({ policy, evidence }) => evaluateQualityGate(policy, evidence, { now });

test('locale context keeps four independent language decisions', () => {
  assert.deepEqual(validateContext(context), context);
  assert.throws(() => validateContext({ ...context, contentLocale: 'en_XX' }), /INVALID_LOCALE/);
  assert.throws(() => validateContext({ ...context, contentLocale: 'en-US-u-nu-arab' }), /INVALID_LOCALE/);
  assert.throws(() => validateContext({ ...context, timeZone: 'Not/AZone' }), /INVALID_TIME_ZONE/);
  assert.throws(() => validateContext({ ...context, transcript: 'private' }), /INVALID_CONTEXT_FIELDS/);
});
test('voice patch is bounded, immutable and rejects stale revisions and authorization fields', () => {
  const envelope = { schemaVersion: 1, requestId: 'request-1', baseRevision: 4, context, patch: { topic: 'Fractions', count: 8, allowedTypes: ['single'] } };
  const result = validateVoicePatch(envelope, 4);
  assert.deepEqual(result.patch, envelope.patch);
  envelope.patch.allowedTypes.push('multi');
  assert.deepEqual(result.patch.allowedTypes, ['single']);
  assert.throws(() => validateVoicePatch(envelope, 5), /STALE_FORM_REVISION/);
  assert.throws(() => validateVoicePatch({ ...envelope, confirmationRequired: false }, 4), /INVALID_PATCH_FIELDS/);
  assert.throws(() => validateVoicePatch({ ...envelope, patch: { publish: true } }, 4), /INVALID_PATCH_FIELDS/);
  for (const patch of [{ count: 101 }, { count: 1.5 }, { points: 0 }, { duration: NaN }, { grade: '14' },
    { allowedTypes: ['unknown'] }, { allowedTypes: ['single'], excludeTypes: ['single'] }, { topic: '' }]) {
    assert.throws(() => validateVoicePatch({ ...envelope, patch }, 4));
  }
});
test('capability approval never transfers from UI to grading or between curricula', () => {
  const matrix = [{ capability: 'ui', locale: 'de-DE', educationContextId: 'DE-BY', curriculumVersion: 'fixture-v1',
    status: 'approved', evidenceId: 'ui-review', expiresAt: '2026-11-01T00:00:00Z' }];
  assert.equal(evaluateCapability(context, 'ui', matrix, now).allowed, true);
  assert.equal(evaluateCapability(context, 'free_text_grading', matrix, now).allowed, false);
  assert.equal(evaluateCapability({ ...context, educationContextId: 'AT' }, 'ui', matrix, now).allowed, false);
  assert.equal(evaluateCapability(context, 'ui', matrix, now + 40 * 86400000).allowed, false);
});
test('exact binomial bounds match independently solvable small cases and published zero-failure formula', () => {
  assert.equal(upperFailureBound(1, 1), 1);
  assert.ok(Math.abs(upperFailureBound(0, 10) - (1 - 0.05 ** 0.1)) < 1e-14);
  // P(X <= 1 | n=2) = 1-p^2, so its alpha root is sqrt(1-alpha).
  assert.ok(Math.abs(upperFailureBound(1, 2) - Math.sqrt(0.95)) < 1e-12);
  // P(X <= n-1) = 1-p^n.
  assert.ok(Math.abs(upperFailureBound(9, 10) - 0.95 ** 0.1) < 1e-12);
  assert.ok(1 - upperFailureBound(0, 29955) < 0.9999);
  assert.ok(1 - upperFailureBound(0, 29956) >= 0.9999);
  for (const args of [[-1, 10], [11, 10], [0, 0], [0, 100001], [0, 10, 0], [0, 10, NaN]]) assert.throws(() => upperFailureBound(...args));
});
test('passing synthetic evidence can only recommend review, never authorize runtime', () => {
  const result = run(fixture());
  assert.equal(result.recommendation, 'eligible_for_review');
  assert.equal(result.runtimeAuthorized, false);
  assert.equal(result.costRatio, 0.5);
  assert.equal(result.alphaPerGate, 0.025);
  assert.ok(!JSON.stringify(result).includes('family-'));
});
test('small perfect benchmark cannot substantiate 99.99%', () => {
  const f = fixture(); f.policy.minimumSuccess = 0.9999;
  assert.ok(run(f).reasons.includes('SUCCESS_BOUND_TOO_LOW'));
});
test('critical errors block even when reported pass and low price look excellent', () => {
  const f = fixture(); f.evidence.cases[0].criticalFailure = true;
  assert.ok(run(f).reasons.includes('CRITICAL_FAILURE'));
});
test('candidate regressions and latency cannot be bought off with savings', () => {
  const f = fixture();
  f.evidence.cases.slice(0, 10).forEach(row => { row.candidatePass = false; row.candidateDurationMs = 5000; });
  const result = run(f);
  assert.ok(result.reasons.includes('REGRESSION_BOUND_TOO_HIGH'));
  assert.ok(result.reasons.includes('LATENCY_BUDGET_EXCEEDED'));
});
test('duplicate IDs, shared source families, omitted cases and extra content are rejected', () => {
  for (const key of ['id', 'independenceUnit']) {
    const f = fixture(); f.evidence.cases[1][key] = f.evidence.cases[0][key];
    assert.throws(() => run(f), /DUPLICATE_OR_DEPENDENT_CASE/);
  }
  const incomplete = fixture(); incomplete.evidence.cases.pop();
  assert.throws(() => run(incomplete), /INCOMPLETE_DATASET/);
  const content = fixture(); content.evidence.cases[0].answer = 'student answer';
  assert.throws(() => run(content), /INVALID_CASE/);
});
test('any scope revision invalidates prior evidence', () => {
  for (const [key, value] of Object.entries({ candidate: 'changed', contentLocale: 'fr-FR', gradingLocale: 'de-DE',
    educationContextId: 'AT', curriculumVersion: 'v2', promptVersion: 'v2', validatorVersion: 'v2', pipelineVersion: 'v2', taskType: 'multi' })) {
    const f = fixture(); f.evidence.scope[key] = value;
    assert.throws(() => run(f), /SCOPE_MISMATCH/, key);
  }
});
test('stale, future and unreviewed evidence fails closed', () => {
  for (const date of ['2025-01-01T00:00:00Z', '2026-11-01T00:00:00Z', 'invalid']) {
    const f = fixture(); f.evidence.completedAt = date; assert.throws(() => run(f), /STALE_EVIDENCE/);
  }
  const f = fixture(); f.evidence.dataset.heldOut = false; assert.throws(() => run(f), /UNREVIEWED_DATASET/);
  f.evidence.dataset.heldOut = true; f.evidence.dataset.referenceReviewId = ''; assert.throws(() => run(f), /UNREVIEWED_DATASET/);
});
test('unknown cost is never zero; retries/review and accepted output denominator matter', () => {
  const f = fixture(); f.evidence.cost = null; assert.ok(run(f).reasons.includes('MISSING_COMPLETE_COST'));
  const g = fixture(); g.evidence.cost.includesRetriesAndReview = false;
  assert.ok(run(g).reasons.includes('MISSING_COMPLETE_COST'));
  const h = fixture(); h.evidence.cost.candidateTotal = 10; h.evidence.cases[0].candidatePass = false;
  assert.ok(run(h).reasons.includes('NO_COST_SAVING')); assert.ok(run(h).costRatio > 1);
});
test('one confidence family includes both statistical gates at minimum', () => {
  const f = fixture(); f.policy.familyGateCount = 1; assert.throws(() => run(f), /INVALID_POLICY/);
  f.policy.familyGateCount = 20;
  assert.ok(run(f).lowerSuccess < run(fixture()).lowerSuccess);
});

test('CLI suppresses raw malformed content and distinguishes blocked and reviewable evidence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gradecrew-quality-'));
  try {
    const policyFile = join(dir, 'policy.json'), evidenceFile = join(dir, 'evidence.json');
    const f = fixture(); f.evidence.completedAt = new Date().toISOString();
    const execute = () => spawnSync(process.execPath, [new URL('../../../tools/evaluation/check-quality.mjs', import.meta.url).pathname, policyFile, evidenceFile], { encoding: 'utf8' });
    await writeFile(policyFile, JSON.stringify(f.policy)); await writeFile(evidenceFile, JSON.stringify(f.evidence));
    const valid = execute(); assert.equal(valid.status, 0); assert.equal(JSON.parse(valid.stdout).runtimeAuthorized, false);
    f.evidence.cases[0].criticalFailure = true; await writeFile(evidenceFile, JSON.stringify(f.evidence));
    assert.equal(execute().status, 1);
    await writeFile(evidenceFile, '{"private_transcript":"DO_NOT_LOG_THIS",bad');
    const invalid = execute(); assert.equal(invalid.status, 2);
    assert.ok(!invalid.stderr.includes('DO_NOT_LOG_THIS')); assert.ok(!invalid.stdout.includes('DO_NOT_LOG_THIS'));
    assert.equal(JSON.parse(invalid.stderr).error, 'INVALID_INPUT');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
