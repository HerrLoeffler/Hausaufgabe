'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createProviderRouter } = require('../lib/router');

function fakeProvider(id) {
  return {
    id,
    capabilities: ['text'],
    async generate(request) {
      return { provider: id, text: request.messages[0].content };
    },
  };
}

test('router requires explicit provider until evidence-based routing is enabled', async () => {
  const router = createProviderRouter({ providers: [fakeProvider('anthropic')] });
  await assert.rejects(
    router.generate({ job: 'question_rewriting', messages: [{ role: 'user', content: 'x' }] }),
    /provider is required/,
  );
});

test('router dispatches a known job to requested provider', async () => {
  const router = createProviderRouter({ providers: [fakeProvider('anthropic')] });
  const result = await router.generate({
    provider: 'anthropic',
    job: 'question_rewriting',
    messages: [{ role: 'user', content: 'rewrite me' }],
  });
  assert.equal(result.provider, 'anthropic');
  assert.equal(result.text, 'rewrite me');
});

test('router rejects unknown job kinds', async () => {
  const router = createProviderRouter({ providers: [fakeProvider('anthropic')] });
  await assert.rejects(
    router.generate({ provider: 'anthropic', job: 'mystery_job', messages: [{ role: 'user', content: 'x' }] }),
    /Unknown job kind/,
  );
});
