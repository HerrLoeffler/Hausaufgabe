'use strict';

const METADATA_IDENTITY_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity';
const TOKEN_PATH = '/v1/oauth/token';
const REFRESH_SKEW_SECONDS = 60;

function buildMetadataUrl(audience) {
  const url = new URL(METADATA_IDENTITY_URL);
  url.searchParams.set('audience', audience);
  url.searchParams.set('format', 'full');
  return url.toString();
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function describeFailure(prefix, response, body) {
  const requestId = body && body.request_id ? ` request_id=${body.request_id}` : '';
  const detail = body && body.error && body.error.message
    ? body.error.message
    : body && body.message
      ? body.message
      : body && body.raw
        ? body.raw.slice(0, 300)
        : response.statusText;
  return new Error(`${prefix}: HTTP ${response.status}${requestId}${detail ? ` - ${detail}` : ''}`);
}

function createAnthropicWifTokenProvider({ fetchImpl = fetch, now = () => Date.now(), config }) {
  let cached = null;
  let inflight = null;

  if (!config) throw new Error('Anthropic WIF config is required');

  async function exchange() {
    const metadataResponse = await fetchImpl(buildMetadataUrl(config.audience), {
      headers: { 'Metadata-Flavor': 'Google' },
    });
    if (!metadataResponse.ok) {
      const body = await readResponseBody(metadataResponse);
      throw describeFailure('Google identity token request failed', metadataResponse, body);
    }
    const assertion = (await metadataResponse.text()).trim();
    if (!assertion) throw new Error('Google metadata server returned an empty identity token');

    const exchangeBody = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
      federation_rule_id: config.federationRuleId,
      organization_id: config.organizationId,
      service_account_id: config.serviceAccountId,
    };
    if (config.workspaceId) exchangeBody.workspace_id = config.workspaceId;

    const tokenResponse = await fetchImpl(`${config.baseUrl}${TOKEN_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(exchangeBody),
    });
    const body = await readResponseBody(tokenResponse);
    if (!tokenResponse.ok) {
      throw describeFailure('Anthropic WIF token exchange failed', tokenResponse, body);
    }
    if (!body || typeof body.access_token !== 'string' || !body.access_token) {
      throw new Error('Anthropic WIF token exchange returned no access_token');
    }

    const expiresInSeconds = Number(body.expires_in || 3600);
    const expiresAt = now() + Math.max(60, expiresInSeconds) * 1000;
    cached = { accessToken: body.access_token, expiresAt, scope: body.scope || null };
    return cached.accessToken;
  }

  async function getAccessToken() {
    if (cached && cached.expiresAt - now() > REFRESH_SKEW_SECONDS * 1000) {
      return cached.accessToken;
    }
    if (!inflight) {
      inflight = exchange().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  function clearCache() {
    cached = null;
  }

  return { getAccessToken, clearCache };
}

module.exports = {
  METADATA_IDENTITY_URL,
  buildMetadataUrl,
  createAnthropicWifTokenProvider,
};
