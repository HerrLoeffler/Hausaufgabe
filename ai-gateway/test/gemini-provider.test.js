'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createGoogleAccessTokenProvider } = require('../lib/google-access-token');
const { createGeminiProvider, buildGenerateContentUrl } = require('../lib/providers/gemini');
const { readGeminiConfig, geminiConfigured, googleVertexBaseUrl } = require('../lib/config');
const { buildGateway, smokeRequestFor } = require('../server');

const geminiConfig = {
  projectId: 'hausaufgabe-staging',
  location: 'eu',
  baseUrl: 'https://aiplatform.eu.rep.googleapis.com',
  defaultModel: 'gemini-3.5-flash-lite',
  allowedModels: ['gemini-3.5-flash-lite'],
  metadataTokenUrl: 'http://metadata.test/token',
};

test('Gemini uses EU Vertex endpoint, service-account token and normalizes response', async () => {
  const calls = [];
  const provider = createGeminiProvider({
    config: geminiConfig,
    tokenProvider: { getAccessToken: async () => 'ya29.test' },
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({
        modelVersion: 'gemini-3.5-flash-lite',
        candidates: [{
          content: { role: 'model', parts: [{ text: 'GATEWAY_OK' }] },
          finishReason: 'STOP',
        }],
        usageMetadata: {
          promptTokenCount: 14,
          candidatesTokenCount: 8,
          totalTokenCount: 25,
          cachedContentTokenCount: 4,
          thoughtsTokenCount: 3,
        },
      });
    },
  });

  const result = await provider.generate({
    system: 'Return a concise result.',
    messages: [{ role: 'user', content: 'hello' }],
    max_tokens: 32,
    reasoning_effort: 'minimal',
    temperature: 0.4,
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://aiplatform.eu.rep.googleapis.com/v1/projects/hausaufgabe-staging/locations/eu/publishers/google/models/gemini-3.5-flash-lite:generateContent');
  assert.equal(calls[0].options.headers.authorization, 'Bearer ya29.test');
  const body = JSON.parse(calls[0].options.body);
  assert.deepEqual(body.systemInstruction, { parts: [{ text: 'Return a concise result.' }] });
  assert.deepEqual(body.contents, [{ role: 'user', parts: [{ text: 'hello' }] }]);
  assert.equal(body.generationConfig.maxOutputTokens, 32);
  assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'MINIMAL');
  assert.equal('temperature' in body.generationConfig, false);
  assert.equal(result.provider, 'gemini');
  assert.equal(result.model, 'gemini-3.5-flash-lite');
  assert.equal(result.text, 'GATEWAY_OK');
  assert.equal(result.stop_reason, 'end_turn');
  assert.equal(result.usage.input_tokens, 14);
  assert.equal(result.usage.output_tokens, 8);
  assert.equal(result.usage.input_tokens_details.cached_tokens, 4);
  assert.equal(result.usage.output_tokens_details.reasoning_tokens, 3);
});

test('Gemini validates model, output, history and capability before paid calls', async () => {
  let tokenCalls = 0;
  let providerCalls = 0;
  const provider = createGeminiProvider({
    config: geminiConfig,
    tokenProvider: { getAccessToken: async () => { tokenCalls++; return 'token'; } },
    fetchImpl: async () => { providerCalls++; throw new Error('should not run'); },
  });

  await assert.rejects(provider.generate({ model: 'gemini-expensive', messages: [{ role: 'user', content: 'x' }] }), /MODEL_NOT_ALLOWED/);
  await assert.rejects(provider.generate({ max_tokens: 0, messages: [{ role: 'user', content: 'x' }] }), /OUTPUT_LIMIT/);
  await assert.rejects(provider.generate({ messages: [{ role: 'assistant', content: 'x' }] }), /INVALID_MESSAGE_ORDER/);
  await assert.rejects(provider.generate({ messages: [{ role: 'user', content: [{ type: 'image', source: 'x' }] }] }), /UNSUPPORTED_CAPABILITY/);
  await assert.rejects(provider.generate({ reasoning_effort: 'ultra', messages: [{ role: 'user', content: 'x' }] }), /INVALID_REASONING_EFFORT/);
  assert.equal(tokenCalls, 0);
  assert.equal(providerCalls, 0);
});

test('Gemini provider errors and safety blocks do not expose provider payloads or prompts', async () => {
  const tokenProvider = { getAccessToken: async () => 'token' };
  const httpErrorProvider = createGeminiProvider({
    config: geminiConfig,
    tokenProvider,
    fetchImpl: async () => Response.json({ error: { message: 'private prompt and token' } }, { status: 429 }),
  });
  await assert.rejects(httpErrorProvider.generate({ messages: [{ role: 'user', content: 'private student text' }] }), /^Error: PROVIDER_HTTP_ERROR$/);

  const blockedProvider = createGeminiProvider({
    config: geminiConfig,
    tokenProvider,
    fetchImpl: async () => Response.json({ candidates: [], promptFeedback: { blockReason: 'SAFETY' } }),
  });
  await assert.rejects(blockedProvider.generate({ messages: [{ role: 'user', content: 'x' }] }), /^Error: PROVIDER_BLOCKED$/);
});

test('Google metadata access token is cached and metadata flavor is enforced', async () => {
  let now = 1_000_000;
  const calls = [];
  const tokenProvider = createGoogleAccessTokenProvider({
    tokenUrl: 'http://metadata.test/token',
    now: () => now,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return Response.json({ access_token: `token-${calls.length}`, expires_in: 300 });
    },
  });

  assert.equal(await tokenProvider.getAccessToken(), 'token-1');
  assert.equal(await tokenProvider.getAccessToken(), 'token-1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers['Metadata-Flavor'], 'Google');
  now += 250_000;
  assert.equal(await tokenProvider.getAccessToken(), 'token-2');
  assert.equal(calls.length, 2);
});

test('Gemini config is opt-in, EU by default, and model allowlist is fail-closed', () => {
  assert.equal(geminiConfigured({ GEMINI_PROJECT_ID: 'p' }), false);
  assert.equal(geminiConfigured({ GEMINI_ENABLED: 'true', GEMINI_PROJECT_ID: 'p' }), true);
  assert.equal(googleVertexBaseUrl('eu'), 'https://aiplatform.eu.rep.googleapis.com');
  assert.equal(googleVertexBaseUrl('global'), 'https://aiplatform.googleapis.com');
  const config = readGeminiConfig({ GEMINI_ENABLED: 'true', GEMINI_PROJECT_ID: 'p' });
  assert.equal(config.location, 'eu');
  assert.equal(config.defaultModel, 'gemini-3.5-flash-lite');
  assert.deepEqual(config.allowedModels, ['gemini-3.5-flash-lite']);
  assert.throws(() => readGeminiConfig({ GEMINI_PROJECT_ID: 'p', GEMINI_DEFAULT_MODEL: 'gemini-3.5-flash-lite', GEMINI_ALLOWED_MODELS: 'gemini-3.5-flash' }), /DEFAULT_MODEL_NOT_ALLOWED/);
});

test('gateway registers Gemini only when explicitly enabled and smoke endpoint stays tiny', () => {
  const env = {
    GEMINI_ENABLED: 'true',
    GEMINI_PROJECT_ID: 'hausaufgabe-staging',
    GEMINI_LOCATION: 'eu',
  };
  const gateway = buildGateway({ env, fetchImpl: async () => { throw new Error('no network in config test'); } });
  assert.deepEqual(gateway.status, { anthropic: 'unconfigured', openai: 'unconfigured', gemini: 'configured', mistral: 'unconfigured' });
  assert.deepEqual(gateway.router.listProviders(), [{ id: 'gemini', capabilities: ['text'] }]);
  const smoke = smokeRequestFor('/providers/gemini/test');
  assert.equal(smoke.provider, 'gemini');
  assert.equal(smoke.max_tokens, 32);
  assert.equal(smoke.reasoning_effort, 'minimal');
});

test('Gemini Vertex URL is deterministic and location-scoped', () => {
  assert.equal(
    buildGenerateContentUrl(geminiConfig, 'gemini-3.5-flash-lite'),
    'https://aiplatform.eu.rep.googleapis.com/v1/projects/hausaufgabe-staging/locations/eu/publishers/google/models/gemini-3.5-flash-lite:generateContent'
  );
});
