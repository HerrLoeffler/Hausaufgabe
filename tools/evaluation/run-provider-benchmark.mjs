import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const gatewayRequire = createRequire(new URL('../../ai-gateway/package.json', import.meta.url));
const { priceUsage, reserveForRoute } = require('../../ai-gateway/lib/routing-cost.js');

const PROVIDERS = Object.freeze(['openai', 'anthropic', 'gemini', 'mistral']);
const JOBS = Object.freeze([
  'test_generation', 'multiple_choice_generation', 'distractor_generation', 'solution_verification',
  'free_text_grading', 'curriculum_matching', 'student_tutoring', 'question_rewriting', 'quality_control',
  'game_content_generation', 'game_hint', 'crew_intent',
]);
const MAX_CASES = 200;
const MAX_MESSAGES = 16;
const MAX_BODY_BYTES = 128 * 1024;

function fail(code) { throw new Error(code); }
function id(value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,159}$/.test(value); }
function int(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}
function digest(value) { return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex'); }

function exactKeys(value, allowed, required, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code);
  const keys = Object.keys(value);
  if (keys.some(key => !allowed.includes(key)) || required.some(key => !Object.hasOwn(value, key))) fail(code);
}

export function validatePriceSnapshot(snapshot) {
  exactKeys(snapshot, ['schemaVersion', 'id', 'currency', 'reviewedAt', 'models', 'sources'],
    ['schemaVersion', 'id', 'currency', 'reviewedAt', 'models'], 'INVALID_PRICE_SNAPSHOT');
  if (snapshot.schemaVersion !== 1 || !id(snapshot.id) || snapshot.currency !== 'USD'
    || !Number.isFinite(Date.parse(snapshot.reviewedAt)) || !Array.isArray(snapshot.models)
    || snapshot.models.length !== PROVIDERS.length) fail('INVALID_PRICE_SNAPSHOT');
  const seen = new Set();
  const models = new Map();
  for (const row of snapshot.models) {
    exactKeys(row, ['provider', 'model', 'scope', 'input', 'output', 'cacheRead', 'cacheWrite'],
      ['provider', 'model', 'scope', 'input', 'output', 'cacheRead', 'cacheWrite'], 'INVALID_PRICE_ROW');
    if (!PROVIDERS.includes(row.provider) || !id(row.model) || !id(row.scope)
      || seen.has(row.provider) || !['input', 'output', 'cacheRead', 'cacheWrite'].every(k => int(row[k], 0))) {
      fail('INVALID_PRICE_ROW');
    }
    seen.add(row.provider);
    models.set(row.provider, Object.freeze({ ...row, id: `${snapshot.id}:${row.provider}`, currency: snapshot.currency,
      expiresAt: Date.parse(snapshot.reviewedAt) + 31 * 86400000 }));
  }
  return Object.freeze({ ...snapshot, models });
}

export function validateBenchmarkBundle(bundle, plan) {
  exactKeys(bundle,
    ['schemaVersion', 'id', 'phaseId', 'job', 'subject', 'taskType', 'riskTier', 'promptVersion', 'system',
      'maxTokens', 'context', 'providers', 'cases', 'reviewStatus'],
    ['schemaVersion', 'id', 'phaseId', 'job', 'subject', 'taskType', 'riskTier', 'promptVersion', 'system',
      'maxTokens', 'context', 'providers', 'cases', 'reviewStatus'], 'INVALID_BENCHMARK_BUNDLE');
  if (bundle.schemaVersion !== 1 || !id(bundle.id) || !id(bundle.phaseId) || !JOBS.includes(bundle.job)
    || !id(bundle.subject) || !id(bundle.taskType) || !['low', 'medium', 'high'].includes(bundle.riskTier)
    || !id(bundle.promptVersion) || typeof bundle.system !== 'string' || !bundle.system.trim()
    || Buffer.byteLength(bundle.system) > 32 * 1024 || !int(bundle.maxTokens, 1, 4096)
    || !['development', 'held_out_reviewed'].includes(bundle.reviewStatus)) fail('INVALID_BENCHMARK_BUNDLE');

  const phase = plan?.phases?.find(row => row.id === bundle.phaseId);
  const job = phase?.jobs?.find(row => row.job === bundle.job);
  if (!phase || !job || job.riskTier !== bundle.riskTier) fail('BENCHMARK_PLAN_MISMATCH');

  exactKeys(bundle.context,
    ['uiLocale', 'inputLocale', 'contentLocale', 'gradingLocale', 'educationContextId', 'curriculumVersion', 'timeZone'],
    ['uiLocale', 'inputLocale', 'contentLocale', 'gradingLocale', 'educationContextId', 'curriculumVersion', 'timeZone'],
    'INVALID_BENCHMARK_CONTEXT');
  for (const key of ['uiLocale', 'inputLocale', 'contentLocale', 'gradingLocale', 'educationContextId', 'curriculumVersion', 'timeZone']) {
    if (typeof bundle.context[key] !== 'string' || !bundle.context[key] || bundle.context[key].length > 160) fail('INVALID_BENCHMARK_CONTEXT');
  }

  if (!Array.isArray(bundle.providers) || !bundle.providers.length || bundle.providers.length > PROVIDERS.length) fail('INVALID_BENCHMARK_PROVIDERS');
  const providers = new Map();
  for (const row of bundle.providers) {
    exactKeys(row, ['provider', 'model', 'roles'], ['provider', 'model', 'roles'], 'INVALID_BENCHMARK_PROVIDER');
    if (!PROVIDERS.includes(row.provider) || !id(row.model) || providers.has(row.provider)
      || !Array.isArray(row.roles) || !row.roles.length || row.roles.length > 8
      || row.roles.some(role => !id(role))) fail('INVALID_BENCHMARK_PROVIDER');
    providers.set(row.provider, Object.freeze({ ...row, roles: Object.freeze([...row.roles]) }));
  }

  if (!Array.isArray(bundle.cases) || !bundle.cases.length || bundle.cases.length > MAX_CASES) fail('INVALID_BENCHMARK_CASES');
  const caseIds = new Set(), units = new Set();
  const cases = bundle.cases.map(row => {
    exactKeys(row, ['id', 'independenceUnit', 'messages'], ['id', 'independenceUnit', 'messages'], 'INVALID_BENCHMARK_CASE');
    if (!id(row.id) || !id(row.independenceUnit) || caseIds.has(row.id) || units.has(row.independenceUnit)
      || !Array.isArray(row.messages) || !row.messages.length || row.messages.length > MAX_MESSAGES) fail('INVALID_BENCHMARK_CASE');
    caseIds.add(row.id); units.add(row.independenceUnit);
    for (const message of row.messages) {
      exactKeys(message, ['role', 'content'], ['role', 'content'], 'INVALID_BENCHMARK_MESSAGE');
      if (!['user', 'assistant'].includes(message.role) || typeof message.content !== 'string'
        || !message.content || Buffer.byteLength(message.content) > 64 * 1024) fail('INVALID_BENCHMARK_MESSAGE');
    }
    const bytes = Buffer.byteLength(JSON.stringify({ system: bundle.system, messages: row.messages }));
    if (bytes > MAX_BODY_BYTES) fail('BENCHMARK_INPUT_TOO_LARGE');
    return Object.freeze({ ...row, messages: Object.freeze(row.messages.map(m => Object.freeze({ ...m }))), inputBytes: bytes });
  });

  return Object.freeze({ ...bundle, providers, cases: Object.freeze(cases), planJob: job });
}

export function planBenchmark(bundle, plan, snapshot, { maxCalls, maxReserveMicros } = {}) {
  const validated = validateBenchmarkBundle(bundle, plan);
  const prices = validatePriceSnapshot(snapshot);
  if (!int(maxCalls, 1, 500) || !int(maxReserveMicros, 1)) fail('INVALID_RUN_BUDGET');

  const calls = [];
  let reservedMicros = 0;
  for (const benchmarkCase of validated.cases) {
    for (const provider of validated.providers.values()) {
      const price = prices.models.get(provider.provider);
      if (!price || price.model !== provider.model) fail('PRICE_MODEL_MISMATCH');
      const reserve = reserveForRoute({ price }, benchmarkCase.inputBytes, validated.maxTokens);
      if (!int(reserve, 1)) fail('INVALID_PRICE_RESERVATION');
      if (calls.length + 1 > maxCalls || reservedMicros + reserve > maxReserveMicros) {
        return Object.freeze({ calls: Object.freeze(calls), reservedMicros, deferred: validated.cases.length * validated.providers.size - calls.length });
      }
      calls.push(Object.freeze({
        operationId: `bench-${digest(`${validated.id}:${benchmarkCase.id}:${provider.provider}:${provider.model}`).slice(0, 32)}`,
        bundleId: validated.id,
        caseId: benchmarkCase.id,
        independenceUnit: benchmarkCase.independenceUnit,
        provider: provider.provider,
        model: provider.model,
        roles: provider.roles,
        reservedMicros: reserve,
        inputBytes: benchmarkCase.inputBytes,
        maxTokens: validated.maxTokens,
      }));
      reservedMicros += reserve;
    }
  }
  return Object.freeze({ calls: Object.freeze(calls), reservedMicros, deferred: 0 });
}

async function callGateway({ gatewayUrl, idToken, request, timeoutMs, fetchImpl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${gatewayUrl.replace(/\/$/, '')}/v1/generate`, {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${idToken}`, 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, status: response.status, error: payload?.error || 'GATEWAY_HTTP_ERROR', requestId: payload?.request_id || null };
    return { ok: true, status: response.status, payload };
  } catch (error) {
    return { ok: false, status: null, error: error?.name === 'AbortError' ? 'EVALUATION_TIMEOUT' : 'EVALUATION_NETWORK_ERROR', requestId: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function executeBenchmark({ bundle, plan, snapshot, gatewayUrl, idToken, budgetStore, budget,
  maxCalls, maxReserveMicros, timeoutMs = 60000, fetchImpl = fetch, now = Date.now }) {
  if (!gatewayUrl?.startsWith('https://') || !idToken || !budgetStore?.reserve || !budgetStore?.settle
    || !budget || !int(timeoutMs, 1000, 120000)) fail('MISSING_EXECUTION_GUARD');

  const validated = validateBenchmarkBundle(bundle, plan);
  const prices = validatePriceSnapshot(snapshot);
  const planned = planBenchmark(bundle, plan, snapshot, { maxCalls, maxReserveMicros });
  if (!planned.calls.length) fail('EMPTY_EVALUATION_PLAN');

  const caseMap = new Map(validated.cases.map(row => [row.id, row]));
  const privateResults = [];
  const metrics = [];
  for (const item of planned.calls) {
    const benchmarkCase = caseMap.get(item.caseId);
    const price = prices.models.get(item.provider);
    const fingerprint = digest({ bundleId: validated.id, caseId: item.caseId, provider: item.provider, model: item.model,
      promptVersion: validated.promptVersion, systemDigest: digest(validated.system), messagesDigest: digest(benchmarkCase.messages) });
    const startedAt = now();
    try {
      await budgetStore.reserve({
        operationId: item.operationId, fingerprint, policyId: `benchmark:${validated.phaseId}`,
        profileId: validated.id, bucket: 'evaluation', currency: prices.currency,
        amount: item.reservedMicros, calls: 1, budget, now: startedAt,
      });
    } catch (error) {
      metrics.push({ caseId: item.caseId, provider: item.provider, model: item.model, roles: item.roles,
        status: error?.message || 'BUDGET_RESERVATION_FAILED', latencyMs: 0, costMicros: null,
        inputTokens: null, outputTokens: null, requestId: null });
      continue;
    }

    const result = await callGateway({
      gatewayUrl, idToken, timeoutMs, fetchImpl,
      request: { provider: item.provider, model: item.model, job: validated.job, max_tokens: validated.maxTokens,
        system: validated.system, messages: benchmarkCase.messages },
    });

    const elapsed = Math.max(0, now() - startedAt);
    let costMicros = null, status = 'provider_error', safeResult = null;
    if (result.ok) {
      const payload = result.payload;
      if (payload.provider === item.provider && payload.model === item.model) {
        costMicros = priceUsage(item.provider, payload.usage, price);
        status = payload.stop_reason === 'end_turn' ? 'completed' : 'incomplete';
        safeResult = {
          requestId: payload.request_id || null,
          provider: payload.provider, model: payload.model, text: payload.text,
          stopReason: payload.stop_reason || null, usage: payload.usage || null,
          latencyMs: payload.latency_ms ?? elapsed, costMicros,
        };
      } else {
        status = 'identity_mismatch';
      }
    } else {
      status = result.error;
    }

    const receipt = { job: validated.job, scopeDigest: digest({ subject: validated.subject, taskType: validated.taskType, context: validated.context }),
      actualMicros: costMicros, baselineEstimateMicros: null,
      attempts: [{ routeId: item.operationId, provider: item.provider, model: item.model,
        evidenceId: 'benchmark-pending-review', priceId: price.id, costMicros, status }],
      outcome: status === 'completed' ? 'accepted' : 'failed', durationMs: elapsed };
    try { await budgetStore.settle(item.operationId, receipt); } catch { status = 'accounting_error'; }

    metrics.push({
      caseId: item.caseId, provider: item.provider, model: item.model, roles: item.roles, status,
      latencyMs: safeResult?.latencyMs ?? elapsed, costMicros,
      inputTokens: safeResult?.usage?.input_tokens ?? null, outputTokens: safeResult?.usage?.output_tokens ?? null,
      requestId: safeResult?.requestId || result.requestId || null,
    });
    privateResults.push({
      caseId: item.caseId, independenceUnit: item.independenceUnit,
      provider: item.provider, model: item.model, roles: item.roles,
      messages: benchmarkCase.messages, result: safeResult, status,
    });
  }

  return Object.freeze({
    metadata: Object.freeze({
      schemaVersion: 1, bundleId: validated.id, phaseId: validated.phaseId, job: validated.job,
      reviewStatus: validated.reviewStatus, priceSnapshotId: prices.id, currency: prices.currency,
      plannedCalls: planned.calls.length, deferredCalls: planned.deferred, reservedMicros: planned.reservedMicros,
      contentFreeMetrics: true, runtimeAuthorized: false,
    }),
    metrics: Object.freeze(metrics),
    privateReviewPacket: Object.freeze({
      schemaVersion: 1, bundleId: validated.id, job: validated.job, system: validated.system,
      context: validated.context, results: Object.freeze(privateResults),
      warning: 'PRIVATE_REVIEW_PACKET_CONTAINS_PROMPTS_AND_MODEL_OUTPUTS_DO_NOT_COMMIT',
    }),
  });
}

export async function writeBenchmarkOutputs(result, outputDir) {
  const dir = resolve(outputDir);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const metricsPath = resolve(dir, 'benchmark-metrics.json');
  const reviewPath = resolve(dir, 'benchmark-private-review.json');
  await writeFile(metricsPath, JSON.stringify({ ...result.metadata, metrics: result.metrics }, null, 2) + '\n', { mode: 0o600 });
  await writeFile(reviewPath, JSON.stringify(result.privateReviewPacket, null, 2) + '\n', { mode: 0o600 });
  await chmod(metricsPath, 0o600); await chmod(reviewPath, 0o600);
  return { metricsPath, reviewPath };
}

async function readJson(path) {
  const data = await readFile(path);
  if (data.length > 4 * 1024 * 1024) fail('BENCHMARK_FILE_TOO_LARGE');
  try { return JSON.parse(data.toString('utf8')); } catch { fail('INVALID_JSON'); }
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const positional = args.filter(arg => !arg.startsWith('--'));
  if (positional.length !== 3) {
    console.error('Usage: node tools/evaluation/run-provider-benchmark.mjs bundle.json plan.json prices.json [--execute]');
    process.exitCode = 2; return;
  }
  const [bundlePath, planPath, pricePath] = positional;
  try {
    const [bundle, plan, snapshot] = await Promise.all([readJson(bundlePath), readJson(planPath), readJson(pricePath)]);
    const maxCalls = Number(process.env.GC_EVALUATION_MAX_CALLS || 0);
    const maxReserveMicros = Number(process.env.GC_EVALUATION_MAX_MICRO_USD || 0);
    const planned = planBenchmark(bundle, plan, snapshot, { maxCalls, maxReserveMicros });
    if (!execute) {
      console.log(JSON.stringify({ mode: 'dry-run', bundleId: bundle.id, calls: planned.calls.length,
        deferred: planned.deferred, reservedMicros: planned.reservedMicros, runtimeAuthorized: false }, null, 2));
      return;
    }
    if (process.env.GC_EVALUATION_EXECUTE !== 'true') fail('EXECUTION_NOT_CONFIRMED');
    if (process.env.GCLOUD_PROJECT !== 'hausaufgabe-staging') fail('STAGING_PROJECT_REQUIRED');

    const { initializeApp, getApps } = gatewayRequire('firebase-admin/app');
    const { getFirestore } = gatewayRequire('firebase-admin/firestore');
    const { createRoutingStore } = require('../../ai-gateway/lib/routing-store.js');
    if (!getApps().length) initializeApp({ projectId: 'hausaufgabe-staging' });
    const budgetStore = createRoutingStore(getFirestore());
    const budget = {
      dailyMicros: Number(process.env.GC_EVALUATION_DAILY_MICROS || 0),
      monthlyMicros: Number(process.env.GC_EVALUATION_MONTHLY_MICROS || 0),
      dailyCalls: Number(process.env.GC_EVALUATION_DAILY_CALLS || 0),
    };
    if (!int(budget.dailyMicros, 1) || !int(budget.monthlyMicros, 1) || !int(budget.dailyCalls, 1)) fail('INVALID_RUN_BUDGET');

    const result = await executeBenchmark({
      bundle, plan, snapshot,
      gatewayUrl: process.env.GC_GATEWAY_URL,
      idToken: process.env.GC_GATEWAY_ID_TOKEN,
      budgetStore, budget, maxCalls, maxReserveMicros,
    });
    const paths = await writeBenchmarkOutputs(result, process.env.GC_EVALUATION_OUTPUT_DIR || './.private-evaluation');
    console.log(JSON.stringify({ mode: 'executed', bundleId: bundle.id, calls: result.metrics.length,
      deferred: result.metadata.deferredCalls, reservedMicros: result.metadata.reservedMicros,
      metricsPath: paths.metricsPath, reviewPath: paths.reviewPath, runtimeAuthorized: false }, null, 2));
  } catch (error) {
    const code = /^[A-Z_]{3,80}$/.test(error?.message || '') ? error.message : 'EVALUATION_WORKER_FAILED';
    console.error(JSON.stringify({ error: code, runtimeAuthorized: false }));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
