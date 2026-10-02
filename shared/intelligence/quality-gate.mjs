import { exactKeys, identifier, validateContext, CONTEXT_KEYS } from './context-contract.mjs';

export const SCOPE_KEYS = Object.freeze([
  'job', 'subject', 'taskType', 'riskTier', 'datasetVersion', 'rubricVersion', 'promptVersion',
  'schemaVersion', 'validatorVersion', 'pipelineVersion', 'incumbent', 'candidate', ...CONTEXT_KEYS,
]);
const JOBS = ['test_generation', 'multiple_choice_generation', 'distractor_generation', 'solution_verification',
  'free_text_grading', 'curriculum_matching', 'student_tutoring', 'question_rewriting', 'quality_control',
  'image_generation', 'speech_recognition', 'text_to_speech', 'game_content_generation', 'game_hint', 'crew_intent'];
function reject(code) { throw new Error(code); }
function probability(x) { return Number.isFinite(x) && x > 0 && x < 1; }
function scope(value) {
  exactKeys(value, SCOPE_KEYS, 'INVALID_SCOPE');
  if (SCOPE_KEYS.some(key => !identifier(value[key]))) reject('INVALID_SCOPE');
  if (!JOBS.includes(value.job) || !['low', 'medium', 'high'].includes(value.riskTier)) reject('INVALID_SCOPE');
  const context = validateContext(Object.fromEntries(CONTEXT_KEYS.map(key => [key, value[key]])));
  return { ...value, ...context };
}

/** Exact one-sided Clopper-Pearson upper bound for an iid Bernoulli failure rate.
 * n is capped to bound CPU. The bound does NOT establish representativeness or independence.
 */
export function upperFailureBound(failures, n, alpha = 0.05) {
  if (!Number.isSafeInteger(n) || n < 1 || n > 100000 || !Number.isSafeInteger(failures)
    || failures < 0 || failures > n || !probability(alpha)) reject('INVALID_SAMPLE');
  if (failures === n) return 1;
  if (failures === 0) return -Math.expm1(Math.log(alpha) / n);
  function logCdf(p) {
    let term = n * Math.log1p(-p), sum = term;
    const odds = Math.log(p) - Math.log1p(-p);
    for (let k = 0; k < failures; k++) {
      term += Math.log(n - k) - Math.log(k + 1) + odds;
      const larger = Math.max(sum, term);
      sum = larger + Math.log1p(Math.exp(Math.min(sum, term) - larger));
    }
    return sum;
  }
  let low = 0, high = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (logCdf(mid) > Math.log(alpha)) low = mid; else high = mid;
  }
  return high;
}

/** OFFLINE review recommendation only. Caller must supply trusted policy and reviewed evidence.
 * Never use uploaded/client/model-generated records to authorize runtime model changes.
 */
export function evaluateQualityGate(policy, evidence, { now = Date.now() } = {}) {
  exactKeys(policy, ['id', 'scope', 'minimumSuccess', 'maximumRegression', 'familyAlpha', 'familyGateCount',
    'minimumCases', 'maximumAgeDays', 'maximumP95Ms', 'requireCostSaving'], 'INVALID_POLICY');
  if (!identifier(policy.id) || !probability(policy.minimumSuccess) || !probability(policy.maximumRegression)
    || !probability(policy.familyAlpha) || policy.familyAlpha > 0.1
    || !Number.isSafeInteger(policy.familyGateCount) || policy.familyGateCount < 2 || policy.familyGateCount > 10000
    || !Number.isSafeInteger(policy.minimumCases) || policy.minimumCases < 1 || policy.minimumCases > 100000
    || !Number.isFinite(policy.maximumAgeDays) || policy.maximumAgeDays <= 0 || policy.maximumAgeDays > 366
    || !Number.isFinite(policy.maximumP95Ms) || policy.maximumP95Ms <= 0
    || typeof policy.requireCostSaving !== 'boolean' || !Number.isFinite(now)) reject('INVALID_POLICY');
  const expected = scope(policy.scope);
  exactKeys(evidence, ['id', 'scope', 'completedAt', 'dataset', 'cases', 'cost'], 'INVALID_EVIDENCE');
  const actual = scope(evidence.scope);
  if (!identifier(evidence.id)) reject('INVALID_EVIDENCE');
  if (SCOPE_KEYS.some(key => actual[key] !== expected[key])) reject('SCOPE_MISMATCH');
  exactKeys(evidence.dataset, ['id', 'referenceReviewId', 'samplingReviewId', 'heldOut', 'expectedCases'], 'INVALID_DATASET');
  if (!identifier(evidence.dataset.id) || !identifier(evidence.dataset.referenceReviewId)
    || !identifier(evidence.dataset.samplingReviewId) || evidence.dataset.heldOut !== true) reject('UNREVIEWED_DATASET');
  const cases = evidence.cases;
  if (!Array.isArray(cases) || cases.length < 1 || cases.length > 100000
    || cases.length !== evidence.dataset.expectedCases) reject('INCOMPLETE_DATASET');
  const completed = Date.parse(evidence.completedAt);
  if (!Number.isFinite(completed) || completed > now || now - completed > policy.maximumAgeDays * 86400000) reject('STALE_EVIDENCE');
  const ids = new Set(), units = new Set(), latencies = [];
  let failures = 0, regressions = 0, criticalFailures = 0, incumbentFailures = 0;
  for (const row of cases) {
    exactKeys(row, ['id', 'independenceUnit', 'incumbentPass', 'candidatePass', 'criticalFailure', 'candidateDurationMs'], 'INVALID_CASE');
    if (!identifier(row.id) || !identifier(row.independenceUnit) || ids.has(row.id) || units.has(row.independenceUnit)) reject('DUPLICATE_OR_DEPENDENT_CASE');
    if (['incumbentPass', 'candidatePass', 'criticalFailure'].some(key => typeof row[key] !== 'boolean')
      || !Number.isFinite(row.candidateDurationMs) || row.candidateDurationMs < 0) reject('INVALID_CASE');
    ids.add(row.id); units.add(row.independenceUnit); latencies.push(row.candidateDurationMs);
    failures += Number(!row.candidatePass); incumbentFailures += Number(!row.incumbentPass);
    regressions += Number(row.incumbentPass && !row.candidatePass); criticalFailures += Number(row.criticalFailure);
  }
  // Bonferroni family budget; caller must include every tested slice/candidate before seeing outcomes.
  const alpha = policy.familyAlpha / policy.familyGateCount;
  const lowerSuccess = 1 - upperFailureBound(failures, cases.length, alpha);
  const upperRegression = upperFailureBound(regressions, cases.length, alpha);
  latencies.sort((a, b) => a - b);
  const p95Ms = latencies[Math.ceil(cases.length * 0.95) - 1];
  const reasons = [];
  if (cases.length < policy.minimumCases) reasons.push('INSUFFICIENT_CASES');
  if (criticalFailures) reasons.push('CRITICAL_FAILURE');
  if (lowerSuccess < policy.minimumSuccess) reasons.push('SUCCESS_BOUND_TOO_LOW');
  if (upperRegression > policy.maximumRegression) reasons.push('REGRESSION_BOUND_TOO_HIGH');
  if (p95Ms > policy.maximumP95Ms) reasons.push('LATENCY_BUDGET_EXCEEDED');
  let costRatio = null;
  if (evidence.cost !== null) {
    exactKeys(evidence.cost, ['currency', 'priceSnapshotId', 'accountingReviewId', 'includesRetriesAndReview', 'incumbentTotal', 'candidateTotal'], 'INVALID_COST');
    const cost = evidence.cost;
    if (!/^[A-Z]{3}$/.test(cost.currency) || !identifier(cost.priceSnapshotId) || !identifier(cost.accountingReviewId)
      || typeof cost.includesRetriesAndReview !== 'boolean'
      || !Number.isFinite(cost.incumbentTotal) || cost.incumbentTotal < 0
      || !Number.isFinite(cost.candidateTotal) || cost.candidateTotal < 0) reject('INVALID_COST');
    // Per accepted result, not per raw request; failed/retried/reviewed work remains in total cost.
    if (cost.includesRetriesAndReview && cases.length > failures && cases.length > incumbentFailures && cost.incumbentTotal > 0) {
      costRatio = (cost.candidateTotal / (cases.length - failures)) / (cost.incumbentTotal / (cases.length - incumbentFailures));
    }
  }
  if (policy.requireCostSaving && costRatio === null) reasons.push('MISSING_COMPLETE_COST');
  else if (policy.requireCostSaving && costRatio >= 1) reasons.push('NO_COST_SAVING');
  return Object.freeze({ schemaVersion: 1, policyId: policy.id, evidenceId: evidence.id,
    recommendation: reasons.length ? 'blocked' : 'eligible_for_review', runtimeAuthorized: false,
    cases: cases.length, failures, regressions, criticalFailures, lowerSuccess, upperRegression,
    alphaPerGate: alpha, p95Ms, costRatio, reasons: Object.freeze(reasons) });
}
