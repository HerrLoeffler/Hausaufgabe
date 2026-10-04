'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createMistralProvider } = require('../lib/providers/mistral');
const { readMistralConfig, mistralConfigured } = require('../lib/config');
const { priceUsage } = require('../lib/routing-cost');
const { buildGateway, smokeRequestFor } = require('../server');

const mistralConfig = {
  apiKey: 'mistral-test-only',
  baseUrl: 'https://api.mistral.ai',
  defaultModel: 'mistral-small-2603',
  allowedModels: ['mistral-small-2603'],
};

test('Mistral uses chat completions, standard tier and normalizes response', async () => {
  const calls = [];
  const provider = createMistralProvider({
    config: mistralConfig,
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({
        id: 'mistral-test',
        model: 'mistral-small-2603',
        choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: 'GATEWAY_OK' } }],
        usage: {
          prompt_tokens: 80,
          completion_tokens: 8,
          total_tokens: 88,
          prompt_tokens_details: { cached_tokens: 64 },
        },
      });
    },
  });

  const result = await provider.generate({
    system: 'Return a concise result.',
    messages: [{ role: 'user', content: 'hello' }],
    max_tokens: 32,
    reasoning_effort: 'minimal',
    temperature: 0.2,
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.mistral.ai/v1/chat/completions');
  assert.equal(calls[0].options.headers.authorization, 'Bearer mistral-test-only');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'mistral-small-2603');
  assert.equal(body.max_tokens, 32);
  assert.equal(body.stream, false);
  assert.equal(body.service_tier, 'standard_only');
  assert.equal(body.reasoning_effort, 'minimal');
  assert.equal(body.temperature, 0.2);
  assert.deepEqual(body.messages, [
    { role: 'system', content: 'Return a concise result.' },
    { role: 'user', content: 'hello' },
  ]);
  assert.equal(result.provider, 'mistral');
  assert.equal(result.text, 'GATEWAY_OK');
  assert.equal(result.stop_reason, 'end_turn');
  assert.equal(result.usage.input_tokens, 80);
  assert.equal(result.usage.output_tokens, 8);
  assert.equal(result.usage.input_tokens_details.cached_tokens, 64);
});

test('Mistral rejects expensive models and unsupported inputs before paid calls', async () => {
  let calls = 0;
  const provider = createMistralProvider({
    config: mistralConfig,
    fetchImpl: async () => { calls++; throw new Error('should not run'); },
  });
  await assert.rejects(provider.generate({ model: 'mistral-medium-3-5', messages: [{ role: 'user', content: 'x' }] }), /MODEL_NOT_ALLOWED/);
  await assert.rejects(provider.generate({ max_tokens: 0, messages: [{ role: 'user', content: 'x' }] }), /OUTPUT_LIMIT/);
  await assert.rejects(provider.generate({ temperature: 1.5, messages: [{ role: 'user', content: 'x' }] }), /INVALID_TEMPERATURE/);
  await assert.rejects(provider.generate({ reasoning_effort: 'xhigh', messages: [{ role: 'user', content: 'x' }] }), /INVALID_REASONING_EFFORT/);
  await assert.rejects(provider.generate({ messages: [{ role: 'user', content: [{ type: 'image', source: 'x' }] }] }), /UNSUPPORTED_CAPABILITY/);
  assert.equal(calls, 0);
});

test('Mistral provider errors never echo provider payloads or prompts', async () => {
  const provider = createMistralProvider({
    config: mistralConfig,
    fetchImpl: async () => Response.json({ message: 'private student text and key' }, { status: 429 }),
  });
  await assert.rejects(provider.generate({ messages: [{ role: 'user', content: 'private student text' }] }), /^Error: PROVIDER_HTTP_ERROR$/);
});

test('Mistral config and allowlist are fail-closed', () => {
  assert.equal(mistralConfigured({}), false);
  assert.equal(mistralConfigured({ MISTRAL_API_KEY: 'x' }), true);
  const config = readMistralConfig({ MISTRAL_API_KEY: 'x' });
  assert.equal(config.baseUrl, 'https://api.mistral.ai');
  assert.equal(config.defaultModel, 'mistral-small-2603');
  assert.deepEqual(config.allowedModels, ['mistral-small-2603']);
  assert.throws(() => readMistralConfig({
    MISTRAL_API_KEY: 'x',
    MISTRAL_DEFAULT_MODEL: 'mistral-small-2603',
    MISTRAL_ALLOWED_MODELS: 'mistral-medium-3-5',
  }), /DEFAULT_MODEL_NOT_ALLOWED/);
});

test('gateway registers Mistral only with runtime secret and smoke stays tiny', () => {
  const gateway = buildGateway({
    env: { MISTRAL_API_KEY: 'x' },
    fetchImpl: async () => { throw new Error('no network in config test'); },
  });
  assert.deepEqual(gateway.status, {
    anthropic: 'unconfigured',
    openai: 'unconfigured',
    gemini: 'unconfigured',
    mistral: 'configured',
  });
  assert.deepEqual(gateway.router.listProviders(), [{ id: 'mistral', capabilities: ['text'] }]);
  const smoke = smokeRequestFor('/providers/mistral/test');
  assert.equal(smoke.provider, 'mistral');
  assert.equal(smoke.max_tokens, 32);
  assert.equal(smoke.reasoning_effort, 'minimal');
});

test('Mistral cached tokens are not double-counted in cost accounting', () => {
  const price = { input: 150000, output: 600000, cacheRead: 15000, cacheWrite: 0 };
  const usage = { input_tokens: 80, output_tokens: 8, input_tokens_details: { cached_tokens: 64 } };
  assert.equal(priceUsage('mistral', usage, price), 9);
  assert.equal(priceUsage('gemini', usage, price), 9);
  assert.equal(priceUsage('mistral', { ...usage, input_tokens_details: { cached_tokens: 81 } }, price), null);
});
