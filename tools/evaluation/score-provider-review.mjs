import { exactKeys, identifier } from '../../shared/intelligence/context-contract.mjs';

function fail(code) { throw new Error(code); }
function boundedString(value, max = 200000) {
  return typeof value === 'string' && Buffer.byteLength(value) <= max;
}
function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}
function normalizeText(value) {
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ');
}
function stripFence(text) {
  const trimmed = String(text || '').trim();
  const match = trimmed.match(/^\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`$/i);
  return match ? match[1].trim() : trimmed;
}
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function safeJson(text) {
  try {
    const parsed = JSON.parse(stripFence(text));
    return plainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function phrasePresent(text, phrase) {
  const haystack = normalizeText(text).toLocaleLowerCase('de-DE');
  const needle = normalizeText(phrase).toLocaleLowerCase('de-DE');
  if (!needle) return false;
  if (/^[+-]?\d+(?:[.,]\d+)?(?:\s*[€%a-z]+)?$/iu.test(needle)) {
    const escaped = needle.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
    return new RegExp('(^|[^\\p{L}\\p{N}])' + escaped + '($|[^\\p{L}\\p{N}])', 'iu').test(haystack);
  }
  return haystack.includes(needle);
}
function flattenValues(value, out = []) {
  if (Array.isArray(value)) value.forEach(item => flattenValues(item, out));
  else if (plainObject(value)) Object.values(value).forEach(item => flattenValues(item, out));
  else out.push(value);
  return out;
}

export function validatePrivateReviewPacket(packet) {
  exactKeys(packet, ['schemaVersion', 'bundleId', 'job', 'system', 'context', 'results', 'warning'], 'INVALID_REVIEW_PACKET');
  if (packet.schemaVersion !== 1 || !identifier(packet.bundleId) || !identifier(packet.job)
    || !boundedString(packet.system, 64 * 1024) || !plainObject(packet.context)
    || !Array.isArray(packet.results) || !packet.results.length || packet.results.length > 1000
    || typeof packet.warning !== 'string') fail('INVALID_REVIEW_PACKET');
  const keys = new Set();
  for (const row of packet.results) {
    exactKeys(row, ['caseId', 'independenceUnit', 'provider', 'model', 'roles', 'messages', 'result', 'status'], 'INVALID_REVIEW_RESULT');
    const key = [row.caseId, row.provider, row.model].join('|');
    if (!identifier(row.caseId) || !identifier(row.independenceUnit) || !identifier(row.provider) || !identifier(row.model)
      || keys.has(key) || !Array.isArray(row.roles) || !row.roles.length || row.roles.some(role => !identifier(role))
      || !Array.isArray(row.messages) || !row.messages.length || typeof row.status !== 'string') fail('INVALID_REVIEW_RESULT');
    keys.add(key);
    if (row.result !== null) {
      exactKeys(row.result, ['requestId', 'provider', 'model', 'text', 'stopReason', 'usage', 'latencyMs', 'costMicros'], 'INVALID_REVIEW_RESULT');
      if (row.result.provider !== row.provider || row.result.model !== row.model || !boundedString(row.result.text)
        || !Number.isFinite(row.result.latencyMs) || row.result.latencyMs < 0
        || !(row.result.costMicros === null || (Number.isSafeInteger(row.result.costMicros) && row.result.costMicros >= 0))) {
        fail('INVALID_REVIEW_RESULT');
      }
    }
  }
  return packet;
}

export function validateDevelopmentReference(reference) {
  exactKeys(reference, ['schemaVersion', 'id', 'status', 'runtimeAuthorized', 'warning', 'rubrics', 'caseChecks'], 'INVALID_REFERENCE');
  if (reference.schemaVersion !== 1 || !identifier(reference.id) || reference.status !== 'development_only'
    || reference.runtimeAuthorized !== false || !plainObject(reference.rubrics) || !plainObject(reference.caseChecks)) fail('INVALID_REFERENCE');
  return reference;
}

function scoreCrewIntent(text, check) {
  const findings = [];
  const parsed = safeJson(text);
  if (!parsed || !plainObject(parsed.patch)) {
    return { automatedStatus: 'fail_checks', criticalFailure: true,
      findings: ['invalid_structured_patch'], parsed: null, manualRequired: true };
  }
  const patch = parsed.patch;
  const allowed = new Set([
    'subject', 'grade', 'schoolType', 'region', 'topic', 'difficulty',
    'count', 'points', 'duration', 'allowedTypes', 'excludeTypes',
  ]);
  if (Object.keys(parsed).some(key => key !== 'patch') || Object.keys(patch).some(key => !allowed.has(key))) {
    findings.push('unexpected_patch_field');
  }
  if (check.expectedPatch) {
    for (const [key, expected] of Object.entries(check.expectedPatch)) {
      if (!Object.hasOwn(patch, key) || !deepEqual(patch[key], expected)) findings.push('expected_' + key + '_mismatch');
    }
  }
  for (const key of check.mustNotChange || []) {
    if (Object.hasOwn(patch, key)) findings.push('unexpected_change_' + key);
  }
  if (Array.isArray(check.mustNotUse) && check.mustNotUse.length) {
    const values = flattenValues(patch).map(value => String(value));
    for (const forbidden of check.mustNotUse) {
      if (values.includes(String(forbidden))) findings.push('uses_superseded_value');
    }
  }
  return {
    automatedStatus: findings.length ? 'fail_checks' : (check.expectedMeaning ? 'manual_required' : 'pass_checks'),
    criticalFailure: findings.some(item => item.startsWith('expected_')
      || item.startsWith('unexpected_change_') || item === 'uses_superseded_value'),
    findings,
    parsed: { patch },
    manualRequired: true,
  };
}

function scoreRewrite(text, check) {
  const findings = [];
  for (const phrase of check.mustPreserve || []) {
    if (!normalizeText(text).toLocaleLowerCase('de-DE').includes(normalizeText(phrase).toLocaleLowerCase('de-DE'))) {
      findings.push('required_constraint_not_preserved');
    }
  }
  return {
    automatedStatus: findings.length ? 'fail_checks' : 'manual_required',
    criticalFailure: findings.length > 0,
    findings,
    parsed: null,
    manualRequired: true,
  };
}

function scoreHint(text, check) {
  const findings = [];
  for (const forbidden of check.forbiddenFinalAnswers || []) {
    if (phrasePresent(text, forbidden)) findings.push('final_answer_leak');
  }
  return {
    automatedStatus: findings.length ? 'fail_checks' : 'manual_required',
    criticalFailure: findings.includes('final_answer_leak'),
    findings,
    parsed: null,
    manualRequired: true,
  };
}

export function scoreDevelopmentPacket(packet, reference) {
  validatePrivateReviewPacket(packet);
  validateDevelopmentReference(reference);
  const rows = packet.results.map(row => {
    const check = reference.caseChecks[row.caseId] || {};
    if (row.status !== 'completed' || !row.result) {
      return Object.freeze({
        caseId: row.caseId, independenceUnit: row.independenceUnit, provider: row.provider, model: row.model,
        roles: Object.freeze([...row.roles]), technicalStatus: row.status, automatedStatus: 'technical_failure',
        criticalFailure: false, findings: Object.freeze([]), manualRequired: true,
        latencyMs: row.result?.latencyMs ?? null, costMicros: row.result?.costMicros ?? null,
      });
    }
    let scored;
    if (packet.job === 'crew_intent') scored = scoreCrewIntent(row.result.text, check);
    else if (packet.job === 'question_rewriting') scored = scoreRewrite(row.result.text, check);
    else if (packet.job === 'game_hint') scored = scoreHint(row.result.text, check);
    else fail('UNSUPPORTED_DEVELOPMENT_SCORER');
    return Object.freeze({
      caseId: row.caseId, independenceUnit: row.independenceUnit, provider: row.provider, model: row.model,
      roles: Object.freeze([...row.roles]), technicalStatus: row.status,
      automatedStatus: scored.automatedStatus, criticalFailure: scored.criticalFailure,
      findings: Object.freeze([...scored.findings]), manualRequired: scored.manualRequired,
      latencyMs: row.result.latencyMs, costMicros: row.result.costMicros,
    });
  });
  return Object.freeze({
    schemaVersion: 1,
    bundleId: packet.bundleId,
    job: packet.job,
    status: 'development_signal_only',
    runtimeAuthorized: false,
    rows: Object.freeze(rows),
  });
}

export function validateManualReview(review, scored) {
  exactKeys(review, ['schemaVersion', 'id', 'bundleId', 'reviewerId', 'completedAt', 'rows'], 'INVALID_MANUAL_REVIEW');
  if (review.schemaVersion !== 1 || !identifier(review.id) || review.bundleId !== scored.bundleId
    || !identifier(review.reviewerId) || !Number.isFinite(Date.parse(review.completedAt))
    || !Array.isArray(review.rows) || !review.rows.length || review.rows.length > scored.rows.length) fail('INVALID_MANUAL_REVIEW');
  const source = new Map(scored.rows.map(row => [[row.caseId, row.provider, row.model].join('|'), row]));
  const seen = new Set();
  for (const row of review.rows) {
    exactKeys(row, ['caseId', 'provider', 'model', 'pass', 'criticalFailure', 'issueCodes'], 'INVALID_MANUAL_REVIEW_ROW');
    const key = [row.caseId, row.provider, row.model].join('|');
    if (!source.has(key) || seen.has(key) || typeof row.pass !== 'boolean' || typeof row.criticalFailure !== 'boolean'
      || !Array.isArray(row.issueCodes) || row.issueCodes.length > 20
      || row.issueCodes.some(code => !/^[a-z0-9_]{1,80}$/.test(code))) fail('INVALID_MANUAL_REVIEW_ROW');
    seen.add(key);
  }
  return review;
}

export function buildCompetencyMatrix(scored, manualReview = null) {
  if (!scored || scored.schemaVersion !== 1 || scored.runtimeAuthorized !== false || !Array.isArray(scored.rows)) fail('INVALID_SCORED_PACKET');
  const manual = new Map();
  if (manualReview) {
    validateManualReview(manualReview, scored);
    for (const row of manualReview.rows) manual.set([row.caseId, row.provider, row.model].join('|'), row);
  }

  const buckets = new Map();
  for (const row of scored.rows) {
    for (const role of row.roles) {
      const key = [row.provider, row.model, role].join('|');
      if (!buckets.has(key)) buckets.set(key, {
        provider: row.provider, model: row.model, role,
        cases: 0, technicalCompleted: 0, automatedCriticalFailures: 0,
        manualReviewed: 0, manualPasses: 0, manualCriticalFailures: 0,
        latencyTotal: 0, latencyCount: 0, knownCostMicros: 0, knownCostCases: 0,
      });
      const bucket = buckets.get(key);
      bucket.cases++;
      if (row.technicalStatus === 'completed') bucket.technicalCompleted++;
      if (row.criticalFailure) bucket.automatedCriticalFailures++;
      if (Number.isFinite(row.latencyMs)) { bucket.latencyTotal += row.latencyMs; bucket.latencyCount++; }
      if (Number.isSafeInteger(row.costMicros)) { bucket.knownCostMicros += row.costMicros; bucket.knownCostCases++; }
      const reviewed = manual.get([row.caseId, row.provider, row.model].join('|'));
      if (reviewed) {
        bucket.manualReviewed++;
        bucket.manualPasses += Number(reviewed.pass);
        bucket.manualCriticalFailures += Number(reviewed.criticalFailure);
      }
    }
  }

  const roles = [...buckets.values()].map(row => Object.freeze({
    provider: row.provider,
    model: row.model,
    role: row.role,
    cases: row.cases,
    technicalCompletionRate: row.cases ? row.technicalCompleted / row.cases : null,
    automatedCriticalFailures: row.automatedCriticalFailures,
    manualReviewed: row.manualReviewed,
    manualPassRate: row.manualReviewed ? row.manualPasses / row.manualReviewed : null,
    manualCriticalFailures: row.manualCriticalFailures,
    averageLatencyMs: row.latencyCount ? Math.round(row.latencyTotal / row.latencyCount) : null,
    knownCostMicros: row.knownCostMicros,
    knownCostCoverage: row.cases ? row.knownCostCases / row.cases : 0,
    evidenceStatus: row.manualReviewed === row.cases && row.cases > 0 ? 'review_complete_development' : 'review_incomplete',
    runtimeAuthorized: false,
  })).sort((a, b) => a.role.localeCompare(b.role) || a.provider.localeCompare(b.provider));

  return Object.freeze({
    schemaVersion: 1,
    bundleId: scored.bundleId,
    job: scored.job,
    status: 'development_competency_matrix',
    globalWinner: null,
    runtimeAuthorized: false,
    roles: Object.freeze(roles),
  });
}
