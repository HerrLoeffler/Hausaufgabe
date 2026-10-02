'use strict';

function normalizedUsage(provider, usage) {
  if (!usage || provider !== 'anthropic') return null;
  const n = key => Number.isSafeInteger(usage[key]) && usage[key] >= 0 ? usage[key] : null;
  const input = n('input_tokens'), output = n('output_tokens');
  const cacheRead = usage.cache_read_input_tokens === undefined ? 0 : n('cache_read_input_tokens');
  const cacheWrite = usage.cache_creation_input_tokens === undefined ? 0 : n('cache_creation_input_tokens');
  if ([input, output, cacheRead, cacheWrite].some(v => v === null)) return null;
  // Cache writes with different TTLs require a future separate price adapter. Do not underprice them.
  if (cacheWrite > 0) return null;
  return { input, output, cacheRead, cacheWrite };
}

// Prices: integer micro-currency units per million tokens. Amounts: integer micro-currency units.
function priceUsage(provider, usage, price) {
  const normalized = normalizedUsage(provider, usage);
  if (!normalized) return null;
  const amount = Math.ceil(Object.entries(normalized).reduce((sum, [kind, n]) => sum + n * price[kind] / 1000000, 0));
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

function reserveForRoute(route, inputBytes, outputTokens) {
  // Text only. UTF-8 bytes plus framing allowance are a conservative token estimate, not an invoice guarantee.
  return Math.max(1, Math.ceil(((inputBytes + 4096) * Math.max(route.price.input, route.price.cacheRead, route.price.cacheWrite)
    + outputTokens * route.price.output) / 1000000));
}
module.exports = { normalizedUsage, priceUsage, reserveForRoute };
