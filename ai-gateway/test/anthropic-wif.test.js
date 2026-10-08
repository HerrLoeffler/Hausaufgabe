'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMetadataUrl, createAnthropicWifTokenProvider } = require('../lib/anthropic-wif');

const config = {
  audience: 'https://api.anthropic.com',
  baseUrl: 'https://api.anthropic.com',
  federationRuleId: 'fdrl_test',
  organizationId: '00000000-0000-0000-0000-000000000000',
  serviceAccountId: 'svac_test',
  workspaceId: 'wrkspc_test',
};

test('metadata URL requests full Google identity token for Anthropic audience', () => {
  const url = new URL(buildMetadataUrl(config.audience));
  assert.equal(url.searchParams.get('audience'), config.audience);
  assert.equal(url.searchParams.get('format'), 'full');
});

test('WIF provider fetches Google identity and exchanges it once while cached', async () => {
  const calls = [];
  let now = 1_000_000;
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).startsWith('http://metadata.google.internal/')) {
      assert.equal(options.headers['Metadata-Flavor'], 'Google');
      return new Response('google-signed-jwt', { status: 200 });
    }
    assert.equal(String(url), 'https://api.anthropic.com/v1/oauth/token');
    const body = JSON.parse(options.body);
    assert.equal(body.grant_type, 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    assert.equal(body.assertion, 'google-signed-jwt');
    assert.equal(body.federation_rule_id, config.federationRuleId);
    assert.equal(body.organization_id, config.organizationId);
    assert.equal(body.service_account_id, config.serviceAccountId);
    assert.equal(body.workspace_id, config.workspaceId);
    return Response.json({ access_token: 'short-lived-token', token_type: 'Bearer', expires_in: 3600 });
  };

  const provider = createAnthropicWifTokenProvider({ fetchImpl, config, now: () => now });
  assert.equal(await provider.getAccessToken(), 'short-lived-token');
  now += 1000;
  assert.equal(await provider.getAccessToken(), 'short-lived-token');
  assert.equal(calls.length, 2);
});

test('WIF provider fails closed when exchange does not return an access token', async () => {
  const fetchImpl = async (url) => {
    if (String(url).startsWith('http://metadata.google.internal/')) {
      return new Response('google-signed-jwt', { status: 200 });
    }
    return Response.json({ token_type: 'Bearer', expires_in: 3600 }, { status: 200 });
  };
  const provider = createAnthropicWifTokenProvider({ fetchImpl, config });
  await assert.rejects(provider.getAccessToken(), /no access_token/);
});
