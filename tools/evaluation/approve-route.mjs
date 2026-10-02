import { evaluateQualityGate, SCOPE_KEYS } from '../../shared/intelligence/quality-gate.mjs';
import { createHash } from 'node:crypto';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function scopeDigest(scope) {
  return hash(Object.fromEntries(SCOPE_KEYS.filter(k => !['incumbent', 'candidate'].includes(k)).sort().map(k => [k, scope[k]])));
}

/** Trusted evaluation worker only: result is input to the signed release manifest, never a client API. */
export function approveRoute({ policy, evidence, route, now = Date.now() }) {
  const report = evaluateQualityGate(policy, evidence, { now });
  if (report.recommendation !== 'eligible_for_review') throw new Error('QUALITY_GATE_BLOCKED');
  if (evidence.scope.candidate !== `${route.provider}/${route.model}`) throw new Error('MODEL_EVIDENCE_MISMATCH');
  if (!evidence.cost || !evidence.cost.includesRetriesAndReview || evidence.cost.currency !== route.price?.currency
    || evidence.cases.every(row => !row.candidatePass)) throw new Error('MISSING_COMPARABLE_COST');
  const accepted = evidence.cases.filter(row => row.candidatePass).length;
  const forecastMicros = Math.max(1, Math.ceil(evidence.cost.candidateTotal * 1000000 / accepted));
  if (!Number.isSafeInteger(forecastMicros)) throw new Error('INVALID_FORECAST');
  return { ...route, scopeDigest: scopeDigest(evidence.scope), validatorVersion: evidence.scope.validatorVersion,
    forecastMicros,
    evidenceId: evidence.id, evidenceDigest: hash(evidence), qualityEligible: true,
    expiresAt: Math.min(route.expiresAt, Date.parse(evidence.completedAt) + policy.maximumAgeDays * 86400000) };
}
