'use strict';
const { chooseRoutes, digest, fail, id } = require('./routing-policy');
const { priceUsage, reserveForRoute } = require('./routing-cost');

function abortable(work, signal) {
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new Error('DEADLINE_EXCEEDED'));
    if (signal.aborted) return onAbort();
    signal.addEventListener('abort', onAbort, { once: true });
    Promise.resolve().then(work).then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

function createOrchestrator({ loadPolicy, store, providers, validators, now = Date.now, disabledRoutes = () => [] }) {
  if (!loadPolicy || !store?.reserve || !store?.settle) fail('MISSING_ROUTING_DEPENDENCY');
  const adapters = new Map(providers.map(p => [p.id, p]));
  async function generate(request, { signal } = {}) {
    const allowed = ['operationId', 'profileId', 'scopeDigest', 'system', 'messages'];
    if (!request || Object.keys(request).some(k => !allowed.includes(k)) || !id(request.operationId)
      || !id(request.profileId) || typeof request.system !== 'string' || !Array.isArray(request.messages)
      || !request.messages.length || request.messages.length > 16
      || request.messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string'
        || Object.keys(m).some(k => !['role', 'content'].includes(k)))) fail('INVALID_ROUTING_REQUEST');
    const policy = await loadPolicy();
    const { profile, routes } = chooseRoutes(policy, request.profileId, request.scopeDigest,
      { now: now(), disabledRoutes: disabledRoutes(), availableProviders: [...adapters.keys()] });
    if (digest(request.system) !== profile.promptDigest) fail('PROMPT_VERSION_MISMATCH');
    const validate = validators[profile.validatorVersion];
    if (typeof validate !== 'function') fail('MISSING_VALIDATOR');
    if (routes.some(r => !adapters.get(r.provider).capabilities?.includes(profile.modality))) fail('UNSUPPORTED_CAPABILITY');
    const inputBytes = Buffer.byteLength(JSON.stringify({ system: request.system, messages: request.messages }));
    if (inputBytes > profile.maxInputBytes) fail('INPUT_LIMIT');
    const reservation = routes.reduce((sum, r) => sum + reserveForRoute(r, inputBytes, profile.maxOutputTokens), 0);
    const started = now();
    if (signal?.aborted) fail('CANCELLED');
    await store.reserve({ operationId: request.operationId, fingerprint: digest(request), policyId: policy.id,
      profileId: profile.id, bucket: profile.bucket, currency: policy.currency,
      amount: reservation, calls: routes.length, budget: policy.budgets[profile.bucket], now: started });
    const receipt = { job: profile.job, scopeDigest: profile.scopeDigest, reason: 'lowest_forecast_cost_among_qualified',
      actualMicros: 0, baselineEstimateMicros: profile.routes.find(r => r.id === profile.baselineRouteId).forecastMicros,
      attempts: [], outcome: 'failed', durationMs: 0 };
    let output, errorCode = 'NO_ACCEPTED_RESULT';
    const deadline = AbortSignal.timeout(profile.deadlineMs);
    const combined = signal ? AbortSignal.any([signal, deadline]) : deadline;
    for (const route of routes) {
      if (combined.aborted) { errorCode = 'DEADLINE_EXCEEDED'; break; }
      if (route.expiresAt <= now() || route.price.expiresAt <= now() || policy.expiresAt <= now()) { errorCode = 'NO_QUALIFIED_ROUTE'; break; }
      const attempt = { routeId: route.id, provider: route.provider, model: route.model,
        evidenceId: route.evidenceId, priceId: route.price.id, costMicros: null, status: 'unknown' };
      receipt.attempts.push(attempt);
      try {
        // No SDK retries here. A second call is an explicit, budgeted qualified fallback.
        const result = await abortable(() => adapters.get(route.provider).generate({ provider: route.provider, job: profile.job,
          model: route.model, max_tokens: profile.maxOutputTokens, system: request.system, messages: request.messages }, { signal: combined }), combined);
        attempt.costMicros = priceUsage(result.provider, result.usage, route.price);
        if (attempt.costMicros === null) receipt.actualMicros = null;
        else if (receipt.actualMicros !== null) receipt.actualMicros += attempt.costMicros;
        const valid = result.provider === route.provider && result.model === route.model
          && result.stop_reason === 'end_turn' && await abortable(() => validate(result, { profile, request }), combined) === true;
        if (valid && !combined.aborted) {
          attempt.status = 'accepted'; receipt.outcome = 'accepted'; output = result; break;
        }
        attempt.status = 'validation_failed'; errorCode = 'VALIDATION_FAILED';
        if (attempt.costMicros === null) break;
      } catch {
        // Unknown charge/timeouts are not automatically retried. Retain full reservation and stop.
        receipt.actualMicros = null; attempt.status = combined.aborted ? 'timeout' : 'provider_error';
        errorCode = combined.aborted ? 'DEADLINE_EXCEEDED' : 'PROVIDER_FAILED'; break;
      }
    }
    receipt.durationMs = now() - started;
    let accountingRecorded = true;
    try { await store.settle(request.operationId, receipt); } catch { accountingRecorded = false; }
    // A ledger outage must not turn an already accepted, paid response into a paid client retry.
    if (!output) fail(errorCode);
    return { ...output, routing: { policyId: policy.id, profileId: profile.id,
      routeId: receipt.attempts.at(-1).routeId, reason: receipt.reason, attempts: receipt.attempts.length,
      actualMicros: receipt.actualMicros, currency: policy.currency, accountingRecorded } };
  }
  return { generate };
}
module.exports = { createOrchestrator };
