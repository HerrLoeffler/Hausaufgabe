'use strict';

const DEFAULT_METADATA_TOKEN_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
const REFRESH_MARGIN_MS = 60_000;

function createGoogleAccessTokenProvider({
  fetchImpl = fetch,
  tokenUrl = DEFAULT_METADATA_TOKEN_URL,
  now = () => Date.now(),
} = {}) {
  let cached = null;
  let inflight = null;

  async function fetchToken(signal) {
    const response = await fetchImpl(tokenUrl, {
      method: 'GET',
      headers: { 'Metadata-Flavor': 'Google' },
      signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error('PROVIDER_AUTH_FAILED');
    const accessToken = String(payload?.access_token || '').trim();
    const expiresIn = Number(payload?.expires_in);
    if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) throw new Error('PROVIDER_AUTH_FAILED');
    cached = {
      accessToken,
      expiresAt: now() + Math.floor(expiresIn * 1000),
    };
    return accessToken;
  }

  async function getAccessToken({ signal } = {}) {
    if (signal?.aborted) throw new Error('CANCELLED');
    if (cached && cached.expiresAt - REFRESH_MARGIN_MS > now()) return cached.accessToken;
    if (!inflight) {
      inflight = fetchToken(signal).finally(() => { inflight = null; });
    }
    return inflight;
  }

  function clearCache() {
    cached = null;
  }

  return { getAccessToken, clearCache };
}

module.exports = {
  DEFAULT_METADATA_TOKEN_URL,
  REFRESH_MARGIN_MS,
  createGoogleAccessTokenProvider,
};
