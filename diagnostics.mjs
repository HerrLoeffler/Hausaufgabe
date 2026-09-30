// Bounded technical breadcrumbs. Never collect input values, DOM text or request bodies.
export function redactTechnicalText(value, max = 2000) {
  return String(value ?? '')
    .replace(/data:[^\s"']+/gi, '[Bilddaten entfernt]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [entfernt]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[E-Mail entfernt]')
    .replace(/https?:\/\/[^\s)"']+/g, raw => { try { const u = new URL(raw); return u.origin + u.pathname; } catch { return '[URL]'; } })
    .replace(/\b(token|password|secret|authorization|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, '$1=[entfernt]')
    .slice(0, max);
}
export function diagnosticSeverity(code = '') {
  return /internal|data-loss|unexpected|unknown/i.test(code) ? 'error' : 'warning';
}
export function createDiagnostics({ now = () => Date.now(), capacity = 40 } = {}) {
  const started = now(); const events = []; let release = {};
  function record(type, details = {}) {
    const safe = { atMs: Math.max(0, now() - started), type: String(type).replace(/[^a-z0-9_.-]/gi, '').slice(0, 40) };
    for (const key of ['view', 'action', 'stage', 'code', 'status']) {
      if (details[key] != null) safe[key] = String(details[key]).replace(/[^a-z0-9_.:-]/gi, '').slice(0, 100);
    }
    const previous = events.at(-1);
    if (previous && previous.type === safe.type && JSON.stringify({ ...previous, atMs: 0 }) === JSON.stringify({ ...safe, atMs: 0 })) return;
    events.push(safe); while (events.length > Math.max(1, Math.min(60, capacity))) events.shift();
  }
  return {
    record,
    setRelease(value) { release = { commit: /^[a-f0-9]{40}$/.test(value?.commit || '') ? value.commit : '', version: String(value?.version || '').slice(0, 60) }; },
    clear() { events.length = 0; },
    snapshot() { return { schemaVersion: 1, release: { ...release }, breadcrumbs: events.map(e => ({ ...e })) }; }
  };
}
export function installDiagnostics(recorder, doc = document, win = window) {
  const actions = new Set(['generateAiTestBtn', 'saveTest', 'publishTest', 'saveReview', 'studentStartBtn', 'loginBtn', 'createTestBtn', 'secureSubmitBtn']);
  doc.addEventListener('click', event => {
    const control = event.target?.closest?.('button');
    if (actions.has(control?.id)) recorder.record('ui.action', { action: control.id });
    else if (control?.classList.contains('gcCoachNext')) recorder.record('tour.continue');
  }, true);
  doc.addEventListener('gradecrew:tour-step', event => recorder.record('tour.step', { stage: event.detail?.stage, action: event.detail?.role }));
  doc.addEventListener('gradecrew:account-changed', () => recorder.clear());
  doc.addEventListener('gradecrew:signed-out', () => recorder.clear());
  win.addEventListener('online', () => recorder.record('network', { status: 'online' }));
  win.addEventListener('offline', () => recorder.record('network', { status: 'offline' }));
}
