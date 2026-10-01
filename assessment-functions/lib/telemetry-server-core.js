"use strict";

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)];
}

function summarizeServerOperations(rows = [], { truncated = false } = {}) {
  const operations = {};
  const codes = {};
  let included = 0;

  for (const raw of rows) {
    const row = raw && typeof raw === "object" ? raw : {};
    if (row.schemaVersion !== 1 || row.source !== "server_operation" || row.environment !== "staging") continue;
    const action = String(row.action || "unknown").slice(0, 60) || "unknown";
    const item = operations[action] ||= { count: 0, ok: 0, failed: 0, durations: [] };
    item.count++;
    included++;
    if (row.status === "ok") item.ok++;
    else if (row.status === "failed") item.failed++;
    const duration = Number(row.durationMs);
    if (Number.isFinite(duration) && duration >= 0 && duration <= 86_400_000) item.durations.push(duration);
    if (row.status === "failed") {
      const code = String(row.code || "unknown").slice(0, 40) || "unknown";
      codes[code] = Number(codes[code] || 0) + 1;
    }
  }

  for (const item of Object.values(operations)) {
    item.p50Ms = percentile(item.durations, 0.5);
    item.p95Ms = percentile(item.durations, 0.95);
    delete item.durations;
  }

  return {
    schemaVersion: 1,
    source: "server_operation",
    coverage: "stored-valid-quiz-invocations-only",
    truncated: Boolean(truncated),
    records: included,
    operations,
    failureCodes: codes
  };
}

module.exports = { summarizeServerOperations };
