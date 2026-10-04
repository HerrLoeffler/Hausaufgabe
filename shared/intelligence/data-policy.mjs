import { exactKeys, identifier } from './context-contract.mjs';

export const DATA_CLASSES = Object.freeze([
  'public_instruction',
  'teacher_content',
  'student_pseudonymous',
  'student_identifiable',
  'grading_record',
]);

function fail(code) { throw new Error(code); }

export function validateDataPolicyMatrix(matrix) {
  if (!Array.isArray(matrix) || !matrix.length || matrix.length > 1000) fail('INVALID_DATA_POLICY');
  const seen = new Set();
  const rows = matrix.map(row => {
    exactKeys(row, [
      'id', 'provider', 'job', 'dataClass', 'requestedRegion', 'status',
      'evidenceId', 'reviewedAt', 'expiresAt', 'retentionClass',
    ], 'INVALID_DATA_POLICY_ROW');
    if (!identifier(row.id) || !identifier(row.provider) || !identifier(row.job)
      || !DATA_CLASSES.includes(row.dataClass) || !identifier(row.requestedRegion)
      || !['approved', 'blocked'].includes(row.status)
      || !identifier(row.evidenceId) || !identifier(row.retentionClass)
      || !Number.isFinite(Date.parse(row.reviewedAt)) || !Number.isFinite(Date.parse(row.expiresAt))
      || Date.parse(row.expiresAt) <= Date.parse(row.reviewedAt)) fail('INVALID_DATA_POLICY_ROW');
    const key = [row.provider, row.job, row.dataClass, row.requestedRegion].join('|');
    if (seen.has(key)) fail('DUPLICATE_DATA_POLICY_ROW');
    seen.add(key);
    return Object.freeze({ ...row });
  });
  return Object.freeze(rows);
}

export function authorizeProviderDataRoute(request, matrix, now = Date.now()) {
  exactKeys(request, ['provider', 'job', 'dataClass', 'requestedRegion'], 'INVALID_DATA_ROUTE_REQUEST');
  if (!identifier(request.provider) || !identifier(request.job) || !DATA_CLASSES.includes(request.dataClass)
    || !identifier(request.requestedRegion) || !Number.isFinite(now)) fail('INVALID_DATA_ROUTE_REQUEST');
  const rows = validateDataPolicyMatrix(matrix);
  const row = rows.find(item => item.provider === request.provider
    && item.job === request.job
    && item.dataClass === request.dataClass
    && item.requestedRegion === request.requestedRegion);
  if (!row) return Object.freeze({ allowed: false, reason: 'NO_EXPLICIT_POLICY', policyId: null, evidenceId: null });
  if (row.status !== 'approved') return Object.freeze({ allowed: false, reason: 'POLICY_BLOCKED', policyId: row.id, evidenceId: row.evidenceId });
  if (Date.parse(row.expiresAt) <= now) return Object.freeze({ allowed: false, reason: 'POLICY_EXPIRED', policyId: row.id, evidenceId: row.evidenceId });
  if (Date.parse(row.reviewedAt) > now) return Object.freeze({ allowed: false, reason: 'POLICY_NOT_YET_VALID', policyId: row.id, evidenceId: row.evidenceId });
  return Object.freeze({ allowed: true, reason: 'APPROVED', policyId: row.id, evidenceId: row.evidenceId,
    retentionClass: row.retentionClass });
}
