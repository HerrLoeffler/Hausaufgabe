'use strict';

const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { anthropicConfigured, readAnthropicConfig } = require('./lib/config');
const { createAnthropicWifTokenProvider } = require('./lib/anthropic-wif');
const { createAnthropicProvider } = require('./lib/providers/anthropic');
const { JOB_KINDS, createProviderRouter } = require('./lib/router');

const SERVICE = 'gradecrew-ai-gateway';
const VERSION = '0.1.0';
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
  return String(error && error.message ? error.message : 'request failed')
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, '<redacted>')
    .slice(0, 600);
}

function buildGateway({ fetchImpl = fetch, env = process.env } = {}) {
  const providers = [];
  let anthropicState = 'unconfigured';

  if (anthropicConfigured(env)) {
    const config = readAnthropicConfig(env);
    const tokenProvider = createAnthropicWifTokenProvider({ fetchImpl, config });
    providers.push(createAnthropicProvider({ fetchImpl, tokenProvider, config }));
    anthropicState = 'configured';
  }

  const router = createProviderRouter({ providers });

  return {
    router,
    status: {
      anthropic: anthropicState,
    },
  };
}

function createHandler({ fetchImpl = fetch, env = process.env } = {}) {
  const gateway = buildGateway({ fetchImpl, env });

  return async function handler(req, res) {
    const requestId = randomUUID();
    const url = new URL(req.url, 'http://gateway.local');

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, {
        ok: true,
        service: SERVICE,
        version: VERSION,
        providers: gateway.status,
      });
    }

    if (req.method === 'GET' && url.pathname === '/providers') {
      return sendJson(res, 200, {
        providers: gateway.router.listProviders(),
        jobs: JOB_KINDS,
      });
    }

    if (req.method === 'POST' && (url.pathname === '/v1/generate' || url.pathname === '/providers/anthropic/test')) {
      const startedAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const body = url.pathname === '/providers/anthropic/test'
          ? {
              provider: 'anthropic',
              job: 'quality_control',
              max_tokens: 16,
              messages: [{ role: 'user', content: 'Reply with exactly: GATEWAY_OK' }],
            }
          : await readJson(req);

        const result = await gateway.router.generate(body, { signal: controller.signal });
        const latencyMs = Date.now() - startedAt;
        console.log(JSON.stringify({
          event: 'ai_gateway_request',
          request_id: requestId,
          provider: result.provider,
          model: result.model,
          job: body.job || null,
          latency_ms: latencyMs,
          input_tokens: result.usage && result.usage.input_tokens || null,
          output_tokens: result.usage && result.usage.output_tokens || null,
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
        });
      } catch (error) {
        const latencyMs = Date.now() - startedAt;
        console.error(JSON.stringify({
          event: 'ai_gateway_error',
          request_id: requestId,
          latency_ms: latencyMs,
          error: safeErrorMessage(error),
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
  const server = http.createServer(createHandler());
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
  startServer,
};
