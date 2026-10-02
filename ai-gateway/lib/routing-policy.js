'use strict';
const { createHash, verify } = require('node:crypto');

const fail = code => { const error = new Error(code); error.code = code; throw error; };
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/+-]{0,159}$/.test(value);
const int = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= min && value <= max;
const digest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const brands = new WeakSet();

// Sign exact payload bytes, not a re-serialized object. Only a pinned Ed25519 key is accepted.
function readSignedPolicy(envelope, publicKey, now = Date.now()) {
  if (!envelope || typeof envelope.payload !== 'string' || envelope.payload.length > 1024 * 1024
    || typeof envelope.signature !== 'string' || !publicKey || publicKey.asymmetricKeyType !== 'ed25519') fail('INVALID_POLICY_SIGNATURE');
  if (!verify(null, Buffer.from(envelope.payload), publicKey, Buffer.from(envelope.signature, 'base64'))) fail('INVALID_POLICY_SIGNATURE');
  let data;
  try { data = JSON.parse(envelope.payload); } catch { fail('INVALID_POLICY'); }
  if (data.version !== 1 || !id(data.id) || !Number.isFinite(data.issuedAt) || data.issuedAt > now
    || !Number.isFinite(data.expiresAt) || data.expiresAt <= now || !Array.isArray(data.profiles)
    || data.profiles.length > 100 || !['USD', 'EUR'].includes(data.currency)) fail('INVALID_POLICY');
  if (!data.budgets || !['production', 'evaluation'].every(bucket => {
    const b = data.budgets[bucket];
    return b && int(b.dailyMicros) && int(b.monthlyMicros) && int(b.dailyCalls, 0, 100000);
  })) fail('INVALID_BUDGET');
  const profiles = new Set();
  for (const p of data.profiles) {
    if (!id(p.id) || profiles.has(p.id) || !id(p.job) || !id(p.dataPolicyId) || !validHash(p.scopeDigest)
      || !validHash(p.promptDigest) || !id(p.validatorVersion) || !['text'].includes(p.modality)
      || !['production', 'evaluation'].includes(p.bucket) || !int(p.maxCalls, 1, 2)
      || !int(p.maxInputBytes, 1, 100000) || !int(p.maxOutputTokens, 1, 16000)
      || !int(p.deadlineMs, 100, 55000) || !Array.isArray(p.routes) || !p.routes.length || p.routes.length > 10) fail('INVALID_PROFILE');
    profiles.add(p.id);
    const routes = new Set();
    for (const r of p.routes) {
      if (!id(r.id) || routes.has(r.id) || !id(r.provider) || !id(r.model)
        || r.dataPolicyId !== p.dataPolicyId || r.scopeDigest !== p.scopeDigest
        || r.validatorVersion !== p.validatorVersion || !id(r.evidenceId) || !validHash(r.evidenceDigest)
        || r.qualityEligible !== true || !Number.isFinite(r.expiresAt) || r.expiresAt <= now
        || !int(r.forecastMicros, 1) || typeof r.enabled !== 'boolean'
        || !(r.apiForecastMicros == null || int(r.apiForecastMicros))
        || !r.price || r.price.currency !== data.currency || !id(r.price.id)
        || !['input', 'output', 'cacheRead', 'cacheWrite'].every(k => int(r.price[k]))
        || !Number.isFinite(r.price.expiresAt) || r.price.expiresAt <= now) fail('UNQUALIFIED_ROUTE');
      routes.add(r.id);
    }
    if (!routes.has(p.baselineRouteId)) fail('MISSING_BASELINE');
    if (p.activeRouteId !== undefined && !routes.has(p.activeRouteId)) fail('MISSING_ACTIVE_ROUTE');
    if (p.minimumSavingsRatio !== undefined && (!Number.isFinite(p.minimumSavingsRatio) || p.minimumSavingsRatio < 0 || p.minimumSavingsRatio >= 1)) fail('INVALID_SWITCH_POLICY');
    if (p.switchAfter !== undefined && (!Number.isFinite(p.switchAfter) || p.switchAfter > data.expiresAt)) fail('INVALID_SWITCH_POLICY');
  }
  // Copies are frozen recursively so a trusted load cannot be changed by subsequent callers.
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  freeze(data); brands.add(data); return data;
}

function assertPolicy(policy, now) {
  if (!brands.has(policy) || policy.expiresAt <= now) fail('UNTRUSTED_OR_EXPIRED_POLICY');
}

function chooseRoutes(policy, profileId, scopeDigest, { now = Date.now(), disabledRoutes = [], availableProviders = [] } = {}) {
  assertPolicy(policy, now);
  const profile = policy.profiles.find(p => p.id === profileId);
  if (!profile || profile.scopeDigest !== scopeDigest) fail('UNKNOWN_OR_CHANGED_SCOPE');
  const routes = profile.routes.filter(r => r.enabled && !disabledRoutes.includes(r.id) && r.expiresAt > now
    && r.price.expiresAt > now && availableProviders.includes(r.provider))
    .sort((a, b) => a.forecastMicros - b.forecastMicros || a.id.localeCompare(b.id));
  if (!routes.length) fail('NO_QUALIFIED_ROUTE');
  const active = routes.find(r => r.id === (profile.activeRouteId || profile.baselineRouteId));
  const savingRatio = profile.minimumSavingsRatio ?? 0.05;
  const winner = active
    ? ((profile.switchAfter || 0) > now ? active : routes.find(r => r.forecastMicros < active.forecastMicros * (1 - savingRatio)) || active)
    : routes[0];
  const reason = !active ? 'qualified_fallback_active_unavailable'
    : winner !== active ? 'lowest_forecast_cost_among_qualified'
      : (profile.switchAfter || 0) > now ? 'keep_active_cooldown' : 'keep_active_switch_margin';
  return { profile, reason, routes: [winner, ...routes.filter(r => r !== winner)].slice(0, profile.maxCalls) };
}

module.exports = { readSignedPolicy, assertPolicy, chooseRoutes, digest, fail, id, int };
