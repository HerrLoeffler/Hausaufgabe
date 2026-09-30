export function logMillis(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const n = typeof value === 'number' ? value : Date.parse(value || '');
  return Number.isFinite(n) ? n : 0;
}
export function occurrences(row) { return Math.max(1, Number(row.technicalDetails?.occurrences) || 1); }
export function filterLogs(rows, filters = {}, now = Date.now()) {
  const term = String(filters.term || '').toLowerCase().trim();
  const from = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : 0;
  const until = filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : Infinity;
  const result = rows.filter(row => {
    const t = row.technicalDetails || {};
    const date = logMillis(row.createdAt);
    if (date < from || date > until) return false;
    if (filters.days && date < now - Number(filters.days) * 86400000) return false;
    for (const [key, actual] of [['status', row.status || 'new'], ['category', row.category], ['environment', row.environment || 'unknown'], ['severity', row.severity || t.severity || 'unknown']]) {
      if (filters[key] && filters[key] !== 'all' && filters[key] !== actual) return false;
    }
    if (filters.version && !String(row.appVersion || '').toLowerCase().includes(filters.version.toLowerCase())) return false;
    if (filters.action && !String(row.action || '').toLowerCase().includes(filters.action.toLowerCase())) return false;
    if (filters.fingerprint && (row.fingerprint || row.errorCode || 'unknown') !== filters.fingerprint) return false;
    const searchable = [row.id, row.displayName, row.email, row.adminEmail, row.adminUid, row.message, row.testCode, row.questionSnapshot?.text, row.errorCode, row.reportId, row.fingerprint, row.action, t.rawMessage, t.serverReference, t.stage, t.diagnostics?.release?.commit, row.resolution?.rootCause, row.resolution?.fixCommit, JSON.stringify(row.details || {})].join(' ').toLowerCase();
    return !term || searchable.includes(term);
  });
  const order = filters.sort || 'newest';
  return result.sort((a, b) => {
    if (order === 'oldest') return logMillis(a.createdAt) - logMillis(b.createdAt);
    if (order === 'frequent') return occurrences(b) - occurrences(a) || logMillis(b.createdAt) - logMillis(a.createdAt);
    if (order === 'priority') return Number(b.category === 'rights' && b.status !== 'done') - Number(a.category === 'rights' && a.status !== 'done') || Number(b.severity === 'error') - Number(a.severity === 'error') || logMillis(b.createdAt) - logMillis(a.createdAt);
    return logMillis(b.createdAt) - logMillis(a.createdAt);
  });
}
export function groupErrors(rows) {
  const groups = new Map();
  for (const row of rows.filter(r => r.category === 'app_error')) {
    const key = row.fingerprint || row.errorCode || 'unknown';
    const group = groups.get(key) || { fingerprint: key, reports: 0, occurrences: 0, open: 0, lastAt: 0 };
    group.reports++; group.occurrences += occurrences(row); group.open += row.status !== 'done' ? 1 : 0;
    group.lastAt = Math.max(group.lastAt, logMillis(row.createdAt)); groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.occurrences - a.occurrences || b.lastAt - a.lastAt);
}
export function supportExport(rows) {
  // Export technical reports without account/name/email, test contents or AI material snapshots.
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), scope: 'filtered-loaded-records', count: rows.length,
    reports: rows.map(r => ({ id: r.id, reportId: r.reportId || '', category: r.category, status: r.status,
      errorCode: r.errorCode || '', fingerprint: r.fingerprint || '', action: r.action || '', appVersion: r.appVersion || '', environment: r.environment || '',
      createdAtMillis: logMillis(r.createdAt), occurrences: occurrences(r), diagnostics: r.technicalDetails?.diagnostics || null,
      serverReference: r.technicalDetails?.serverReference || '', resolution: r.resolution || null })) };
}
