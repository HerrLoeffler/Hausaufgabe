'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createOpenAIProvider } = require('../lib/providers/openai');
const { createAnthropicProvider } = require('../lib/providers/anthropic');
const { priceUsage } = require('../lib/routing-cost');
const { buildGateway } = require('../server');

const openaiConfig = {
  apiKey: 'sk-test-only',
  baseUrl: 'https://api.openai.com',
  defaultModel: 'gpt-5.6-luna',
  allowedModels: ['gpt-5.6-luna'],
  projectId: null,
  organizationId: null,
};

test('OpenAI provider uses Responses API, store=false and normalizes result', async () => {
  const calls = [];
  const provider = createOpenAIProvider({
    config: openaiConfig,
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({
        id: 'resp_test', model: 'gpt-5.6-luna', status: 'completed',
        output: [{ type: 'message', content: [{ type: 'output_text', text: 'GATEWAY_OK' }] }],
        usage: { input_tokens: 15, output_tokens: 7, total_tokens: 22, input_tokens_details: { cached_tokens: 5 } },
      });
    },
  });
  const result = await provider.generate({
    system: 'Return a concise result.',
    messages: [{ role: 'user', content: 'hello' }],
    max_tokens: 32,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(calls[0].options.headers.authorization, 'Bearer sk-test-only');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.store, false);
  assert.equal(body.model, 'gpt-5.6-luna');
  assert.equal(body.max_output_tokens, 32);
  assert.equal(body.instructions, 'Return a concise result.');
  assert.equal(result.provider, 'openai');
  assert.equal(result.text, 'GATEWAY_OK');
  assert.equal(result.stop_reason, 'end_turn');
  assert.equal(result.usage.input_tokens_details.cached_tokens, 5);
});

test('OpenAI provider maps incomplete output and validates limits before any paid call', async () => {
  let calls = 0;
  const provider = createOpenAIProvider({
    config: openaiConfig,
    fetchImpl: async () => { calls++; return Response.json({
      id: 'resp_short', model: 'gpt-5.6-luna', status: 'incomplete',
      incomplete_details: { reason: 'max_output_tokens' }, output: [],
      usage: { input_tokens: 3, output_tokens: 1 },
    }); },
  });
  await assert.rejects(provider.generate({ model: 'gpt-6-astra', messages: [{ role: 'user', content: 'x' }] }), /MODEL_NOT_ALLOWED/);
  await assert.rejects(provider.generate({ max_tokens: 0, messages: [{ role: 'user', content: 'x' }] }), /OUTPUT_LIMIT/);
  await assert.rejects(provider.generate({ reasoning_effort: 'ultra', messages: [{ role: 'user', content: 'x' }] }), /INVALID_REASONING_EFFORT/);
  assert.equal(calls, 0);
  const result = await provider.generate({ messages: [{ role: 'user', content: 'x' }] });
  assert.equal(result.stop_reason, 'max_tokens');
  assert.equal(calls, 1);
});

test('OpenAI text adapter fails closed on image/non-text blocks', async () => {
  let called = false;
  const provider = createOpenAIProvider({ config: openaiConfig, fetchImpl: async () => { called = true; } });
  await assert.rejects(provider.generate({
    messages: [{ role: 'user', content: [{ type: 'image', source: 'x' }] }],
  }), /UNSUPPORTED_CAPABILITY/);
  assert.equal(called, false);
});

test('provider errors never echo provider payload or prompts', async () => {
  const provider = createOpenAIProvider({
    config: openaiConfig,
    fetchImpl: async () => Response.json({ error: { message: 'private prompt and key' } }, { status: 429 }),
  });
  await assert.rejects(provider.generate({ messages: [{ role: 'user', content: 'private student text' }] }), /^Error: PROVIDER_HTTP_ERROR$/);
});

test('OpenAI cached tokens are not double-counted in cost accounting', () => {
  const price = { input: 1000000, output: 2000000, cacheRead: 100000, cacheWrite: 0 };
  const usage = { input_tokens: 110, output_tokens: 10, input_tokens_details: { cached_tokens: 100 } };
  assert.equal(priceUsage('openai', usage, price), 40);
  assert.equal(priceUsage('openai', { ...usage, input_tokens_details: { cached_tokens: 111 } }, price), null);
  assert.equal(priceUsage('unknown', usage, price), null);
});

test('Anthropic and OpenAI reject models outside explicit allowlists before external calls', async () => {
  let anthropicTokens = 0;
  const anthropic = createAnthropicProvider({
    config: { baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-haiku-4-5', allowedModels: ['claude-haiku-4-5'] },
    tokenProvider: { getAccessToken: async () => { anthropicTokens++; return 'secret'; } },
    fetchImpl: async () => { throw new Error('should not run'); },
  });
  await assert.rejects(anthropic.generate({ model: 'claude-expensive', messages: [{ role: 'user', content: 'x' }] }), /MODEL_NOT_ALLOWED/);
  assert.equal(anthropicTokens, 0);
});

test('gateway registers both providers only when their runtime credentials exist', () => {
  const env = {
    ANTHROPIC_FEDERATION_RULE_ID: 'fdrl_test',
    ANTHROPIC_ORGANIZATION_ID: 'org_test',
    ANTHROPIC_SERVICE_ACCOUNT_ID: 'svac_test',
    ANTHROPIC_WORKSPACE_ID: 'wrkspc_test',
    OPENAI_API_KEY: 'sk-test-only',
  };
  const gateway = buildGateway({ env, fetchImpl: async () => { throw new Error('no network in config test'); } });
  assert.deepEqual(gateway.status, { anthropic: 'configured', openai: 'configured' });
  assert.deepEqual(gateway.router.listProviders().map(p => p.id).sort(), ['anthropic', 'openai']);
});
