'use strict';

function summarizeRouting(rows, { truncated = false } = {}) {
  const groups = new Map();
  for (const row of rows) {
    // Currency/budget/profile/route is an explicit dimension; no mixing EUR and USD or lab and production.
    const routeId = row.attempts?.at(-1)?.routeId || 'unresolved';
    const key = JSON.stringify([row.currency, row.bucket, row.profileId, routeId]);
    if (!groups.has(key)) groups.set(key, { currency: row.currency, bucket: row.bucket, profileId: row.profileId,
      routeId, job: row.job || 'unknown', requests: 0, accepted: 0, calls: 0, reservedMicros: 0,
      pricedRequests: 0, actualMicros: 0, comparableRequests: 0, baselineEstimateMicros: 0,
      comparableActualMicros: 0, reasons: new Set(), models: new Set(), priceIds: new Set(), evidenceIds: new Set() });
    const g = groups.get(key); g.requests++; g.accepted += Number(row.outcome === 'accepted');
    g.calls += row.attempts?.length || 0; g.reservedMicros += row.reservedMicros || 0;
    if (typeof row.reason === 'string') g.reasons.add(row.reason);
    for (const a of row.attempts || []) { g.models.add(`${a.provider}/${a.model}`); g.priceIds.add(a.priceId); g.evidenceIds.add(a.evidenceId); }
    const priced = row.costKnown === true && Number.isSafeInteger(row.actualMicros) && row.actualMicros >= 0;
    if (priced) { g.pricedRequests++; g.actualMicros += row.actualMicros; }
    if (priced && row.outcome === 'accepted' && Number.isSafeInteger(row.baselineEstimateMicros) && row.baselineEstimateMicros >= 0) {
      g.comparableRequests++; g.baselineEstimateMicros += row.baselineEstimateMicros;
      g.comparableActualMicros += row.actualMicros;
    }
  }
  return { version: 1, coverage: 'gateway_ledger_only', truncated: Boolean(truncated), invoiceVerified: false,
    groups: [...groups.values()].map(g => ({ ...g, reasons: [...g.reasons], models: [...g.models], priceIds: [...g.priceIds], evidenceIds: [...g.evidenceIds],
      priceCoverage: g.pricedRequests / g.requests,
      estimatedSavingsMicros: g.comparableRequests ? g.baselineEstimateMicros - g.comparableActualMicros : null })) };
}
module.exports = { summarizeRouting };
