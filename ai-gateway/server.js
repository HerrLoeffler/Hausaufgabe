'use strict';

const http = require('node:http');
const { randomUUID } = require('node:crypto');
const {
  anthropicConfigured, readAnthropicConfig,
  openaiConfigured, readOpenAIConfig,
} = require('./lib/config');
const { createAnthropicWifTokenProvider } = require('./lib/anthropic-wif');
const { createAnthropicProvider } = require('./lib/providers/anthropic');
const { createOpenAIProvider } = require('./lib/providers/openai');
const { JOB_KINDS, createProviderRouter } = require('./lib/router');

const SERVICE = 'gradecrew-ai-gateway';
const VERSION = '0.2.0';
const MAX_BODY_BYTES = 256 * 1024;
const REQUEST_TIMEOUT_MS = 60_000;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('request body too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('invalid JSON body');
  }
}

function safeErrorMessage(error) {
  const known = new Set([
    'UNSUPPORTED_CAPABILITY', 'OUTPUT_LIMIT', 'INVALID_TEMPERATURE', 'INVALID_REASONING_EFFORT', 'MODEL_NOT_ALLOWED',
    'INVALID_ROUTING_REQUEST', 'PROMPT_VERSION_MISMATCH', 'MISSING_VALIDATOR', 'INPUT_LIMIT', 'BUDGET_EXHAUSTED',
    'OPERATION_ALREADY_CLAIMED', 'OPERATION_ID_CONFLICT', 'DEADLINE_EXCEEDED', 'CANCELLED', 'VALIDATION_FAILED',
    'PROVIDER_FAILED', 'PROVIDER_HTTP_ERROR', 'INVALID_PROVIDER_RESPONSE', 'NO_QUALIFIED_ROUTE',
    'UNKNOWN_OR_CHANGED_SCOPE', 'UNTRUSTED_OR_EXPIRED_POLICY', 'INVALID_POLICY_SIGNATURE',
    'AUTOMATIC_ROUTING_UNCONFIGURED', 'AUTOMATIC_ROUTE_REQUIRED',
  ]);
  return known.has(error?.message) ? error.message : 'GATEWAY_REQUEST_FAILED';
}

function buildGateway({ fetchImpl = fetch, env = process.env } = {}) {
  const providers = [];
  const status = { anthropic: 'unconfigured', openai: 'unconfigured' };

  if (anthropicConfigured(env)) {
    const config = readAnthropicConfig(env);
    const tokenProvider = createAnthropicWifTokenProvider({ fetchImpl, config });
    providers.push(createAnthropicProvider({ fetchImpl, tokenProvider, config }));
    status.anthropic = 'configured';
  }

  if (openaiConfigured(env)) {
    const config = readOpenAIConfig(env);
    providers.push(createOpenAIProvider({ fetchImpl, config }));
    status.openai = 'configured';
  }

  return { router: createProviderRouter({ providers }), providers, status };
}

function smokeRequestFor(pathname) {
  if (pathname === '/providers/anthropic/test') {
    return {
      provider: 'anthropic', job: 'quality_control', max_tokens: 16,
      messages: [{ role: 'user', content: 'Reply with exactly: GATEWAY_OK' }],
    };
  }
  if (pathname === '/providers/openai/test') {
    return {
      provider: 'openai', job: 'quality_control', max_tokens: 32,
      messages: [{ role: 'user', content: 'Reply with exactly: GATEWAY_OK' }],
    };
  }
  return null;
}

function createHandler({ fetchImpl = fetch, env = process.env, orchestrator = null, routingSummary = null } = {}) {
  const gateway = buildGateway({ fetchImpl, env });

  return async function handler(req, res) {
    const requestId = randomUUID();
    const url = new URL(req.url, 'http://gateway.local');

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, service: SERVICE, version: VERSION, providers: gateway.status });
    }

    if (req.method === 'GET' && url.pathname === '/providers') {
      return sendJson(res, 200, { providers: gateway.router.listProviders(), jobs: JOB_KINDS });
    }

    // Cloud Run IAM protects this service. A browser-facing proxy must additionally check GradeCrew admin role.
    if (req.method === 'GET' && url.pathname === '/v1/routing/statistics') {
      if (!routingSummary) return sendJson(res, 503, { error: 'AUTOMATIC_ROUTING_UNCONFIGURED', request_id: requestId });
      try { return sendJson(res, 200, await routingSummary()); }
      catch { return sendJson(res, 503, { error: 'STATISTICS_UNAVAILABLE', request_id: requestId }); }
    }

    const generationPaths = ['/v1/generate', '/v1/route', '/providers/anthropic/test', '/providers/openai/test'];
    if (req.method === 'POST' && generationPaths.includes(url.pathname)) {
      const startedAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        // Once automatic routing is active, callers cannot bypass it through the generic endpoint.
        // Provider-specific smoke endpoints remain available for operators behind Cloud Run IAM.
        if (orchestrator && url.pathname === '/v1/generate') throw new Error('AUTOMATIC_ROUTE_REQUIRED');
        const smoke = smokeRequestFor(url.pathname);
        const body = smoke || await readJson(req);

        if (url.pathname === '/v1/route' && !orchestrator) throw new Error('AUTOMATIC_ROUTING_UNCONFIGURED');
        const result = url.pathname === '/v1/route'
          ? await orchestrator.generate(body, { signal: controller.signal })
          : await gateway.router.generate(body, { signal: controller.signal });
        const latencyMs = Date.now() - startedAt;
        console.log(JSON.stringify({
          event: 'ai_gateway_request', request_id: requestId,
          provider: result.provider, model: result.model, job: body.job || null,
          latency_ms: latencyMs,
          input_tokens: result.usage?.input_tokens ?? null,
          output_tokens: result.usage?.output_tokens ?? null,
        }));
        return sendJson(res, 200, {
          request_id: requestId,
          latency_ms: latencyMs,
          provider: result.provider,
          model: result.model,
          id: result.id,
          text: result.text,
          stop_reason: result.stop_reason,
          usage: result.usage,
          routing: result.routing || null,
        });
      } catch (error) {
        const latencyMs = Date.now() - startedAt;
        console.error(JSON.stringify({
          event: 'ai_gateway_error', request_id: requestId,
          latency_ms: latencyMs, error: safeErrorMessage(error),
        }));
        const statusCode = error && error.name === 'AbortError' ? 504 : 400;
        return sendJson(res, statusCode, {
          error: statusCode === 504 ? 'provider timeout' : safeErrorMessage(error),
          request_id: requestId,
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    return sendJson(res, 404, { error: 'not found', request_id: requestId });
  };
}

function startServer() {
  const port = Number(process.env.PORT || 8080);
  let automatic = null;
  if (process.env.GC_AUTOMATIC_ROUTING === 'true') {
    const { initializeApp, getApps } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { createAutomaticRuntime } = require('./lib/automatic-runtime');
    if (process.env.GCLOUD_PROJECT !== 'hausaufgabe-staging') throw new Error('STAGING_PROJECT_REQUIRED');
    if (!getApps().length) initializeApp({ projectId: 'hausaufgabe-staging' });
    if (!process.env.GC_ROUTING_VALIDATORS_MODULE) throw new Error('MISSING_VALIDATOR');
    const validators = require(process.env.GC_ROUTING_VALIDATORS_MODULE);
    automatic = createAutomaticRuntime({ providers: buildGateway().providers, db: getFirestore(), validators });
  }
  const server = http.createServer(createHandler({ orchestrator: automatic?.orchestrator, routingSummary: automatic?.summary }));
  server.listen(port, '0.0.0.0', () => {
    console.log(JSON.stringify({ event: 'ai_gateway_started', service: SERVICE, version: VERSION, port }));
  });
  return server;
}

if (require.main === module) startServer();

module.exports = {
  MAX_BODY_BYTES,
  REQUEST_TIMEOUT_MS,
  buildGateway,
  createHandler,
  readJson,
  safeErrorMessage,
  smokeRequestFor,
  startServer,
};
