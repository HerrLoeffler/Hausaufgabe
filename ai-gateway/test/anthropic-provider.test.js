'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAnthropicProvider } = require('../lib/providers/anthropic');

test('Anthropic provider uses bearer WIF token and normalizes text/usage', async () => {
  const calls = [];
  const provider = createAnthropicProvider({
    config: { baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-haiku-4-5' },
    tokenProvider: { getAccessToken: async () => 'wif-access-token' },
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json({
        id: 'msg_test',
        model: 'claude-haiku-4-5',
        content: [{ type: 'text', text: 'GATEWAY_OK' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 7, output_tokens: 3 },
      });
    },
  });

  const result = await provider.generate({
    messages: [{ role: 'user', content: 'hello' }],
    max_tokens: 16,
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers.authorization, 'Bearer wif-access-token');
  assert.equal(calls[0].options.headers['anthropic-version'], '2023-06-01');
  assert.equal(JSON.parse(calls[0].options.body).model, 'claude-haiku-4-5');
  assert.equal(result.text, 'GATEWAY_OK');
  assert.equal(result.usage.output_tokens, 3);
});
