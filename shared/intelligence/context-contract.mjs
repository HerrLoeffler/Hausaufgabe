/** Offline contract. This module grants no permissions and does not change app routing. */
export const CONTEXT_KEYS = Object.freeze([
  'uiLocale', 'inputLocale', 'contentLocale', 'gradingLocale',
  'educationContextId', 'curriculumVersion', 'timeZone',
]);

function fail(code) { throw new Error(code); }
export function exactKeys(value, keys, code = 'INVALID_FIELDS') {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !keys.includes(key))
    || keys.some(key => !Object.hasOwn(value, key))) fail(code);
}
export function identifier(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,159}$/.test(value);
}

export function validateContext(input) {
  exactKeys(input, CONTEXT_KEYS, 'INVALID_CONTEXT_FIELDS');
  const result = {};
  for (const key of CONTEXT_KEYS.filter(key => key.endsWith('Locale'))) {
    try {
      if (typeof input[key] !== 'string' || input[key].length > 80) fail('INVALID_LOCALE');
      const [canonical] = Intl.getCanonicalLocales(input[key]);
      if (!canonical || new Intl.Locale(canonical).baseName !== canonical) fail('INVALID_LOCALE');
      result[key] = canonical;
    } catch { fail('INVALID_LOCALE'); }
  }
  for (const key of ['educationContextId', 'curriculumVersion']) {
    if (!identifier(input[key])) fail('INVALID_EDUCATION_CONTEXT');
    result[key] = input[key];
  }
  try {
    if (typeof input.timeZone !== 'string' || input.timeZone.length > 80) fail('INVALID_TIME_ZONE');
    result.timeZone = new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).resolvedOptions().timeZone;
  } catch { fail('INVALID_TIME_ZONE'); }
  return Object.freeze(result);
}

export const CAPABILITIES = Object.freeze([
  'ui', 'speech_recognition', 'test_generation', 'free_text_grading', 'text_to_speech', 'game_content',
]);

/** Matrix must be supplied by trusted server/release config, never by a model/client. */
export function evaluateCapability(context, capability, matrix, now = Date.now()) {
  const normalized = validateContext(context);
  if (!CAPABILITIES.includes(capability) || !Array.isArray(matrix) || !Number.isFinite(now)) fail('INVALID_CAPABILITY_REQUEST');
  const locale = normalized[{
    ui: 'uiLocale', speech_recognition: 'inputLocale', test_generation: 'contentLocale',
    free_text_grading: 'gradingLocale', text_to_speech: 'contentLocale', game_content: 'contentLocale',
  }[capability]];
  const entry = matrix.find(row => row.capability === capability && row.locale === locale
    && row.educationContextId === normalized.educationContextId
    && row.curriculumVersion === normalized.curriculumVersion);
  const allowed = Boolean(entry && entry.status === 'approved' && identifier(entry.evidenceId)
    && Number.isFinite(Date.parse(entry.expiresAt)) && Date.parse(entry.expiresAt) > now);
  return Object.freeze({ allowed, capability, locale, reason: allowed ? 'APPROVED' : 'MISSING_VALID_APPROVAL' });
}

/** Exact bounded payload for an existing Crew form patch; never an execution/authorization token. */
export function validateVoicePatch(envelope, currentRevision) {
  exactKeys(envelope, ['schemaVersion', 'requestId', 'baseRevision', 'context', 'patch'], 'INVALID_PATCH_FIELDS');
  if (envelope.schemaVersion !== 1 || !identifier(envelope.requestId)) fail('INVALID_PATCH_VERSION');
  if (!Number.isSafeInteger(currentRevision) || currentRevision < 0
    || envelope.baseRevision !== currentRevision) fail('STALE_FORM_REVISION');
  const context = validateContext(envelope.context);
  const patch = envelope.patch;
  const keys = ['subject', 'schoolType', 'region', 'grade', 'topic', 'difficulty', 'count', 'points', 'duration', 'allowedTypes', 'excludeTypes'];
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) || !Object.keys(patch).length
    || Object.keys(patch).some(key => !keys.includes(key))) fail('INVALID_PATCH_FIELDS');
  for (const [key, value] of Object.entries(patch)) {
    if (['count', 'points', 'duration'].includes(key)) {
      const [min, max] = { count: [1, 100], points: [0.5, 500], duration: [1, 300] }[key];
      if (!Number.isFinite(value) || value < min || value > max || (key !== 'points' && !Number.isInteger(value))) fail('INVALID_PATCH_VALUE');
    } else if (['allowedTypes', 'excludeTypes'].includes(key)) {
      const types = ['single', 'multi', 'text', 'dropdown', 'truefalse', 'gapfill', 'matching', 'ordering', 'grouping', 'markwords', 'number'];
      if (!Array.isArray(value) || value.length > types.length || new Set(value).size !== value.length
        || value.some(type => !types.includes(type))) fail('INVALID_PATCH_VALUE');
    } else if (typeof value !== 'string' || !value.trim() || value.length > (key === 'topic' ? 220 : 80)
      || /[\u0000-\u001f\u007f]/.test(value)) fail('INVALID_PATCH_VALUE');
  }
  if (patch.grade !== undefined && !/^(?:[1-9]|1[0-3])$/.test(patch.grade)) fail('INVALID_PATCH_VALUE');
  if (patch.difficulty !== undefined && !['leicht', 'mittel', 'anspruchsvoll', 'gemischt'].includes(patch.difficulty)) fail('INVALID_PATCH_VALUE');
  if (patch.allowedTypes?.some(type => patch.excludeTypes?.includes(type))) fail('CONFLICTING_TYPES');
  const safePatch = Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, Array.isArray(value) ? Object.freeze([...value]) : value]));
  return Object.freeze({ schemaVersion: 1, requestId: envelope.requestId, baseRevision: currentRevision,
    context, patch: Object.freeze(safePatch) });
}
