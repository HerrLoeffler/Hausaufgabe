// Host integrates through its existing server-authorized admin loader; never connect a browser to Cloud Run credentials.
export function installAiRoutingAdmin({ host, loadSummary }) {
  if (!host || typeof loadSummary !== 'function') throw new Error('ADMIN_ADAPTER_REQUIRED');
  const doc = host.ownerDocument;
  const el = (tag, text) => { const node = doc.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  const panel = el('section'); panel.className = 'card';
  const title = el('h3', 'KI: Modelle, Qualität und Kosten');
  const note = el('p', 'API-Kosten laut erfasster Nutzung. Einsparungen sind Schätzungen gegenüber der freigegebenen Referenz. Fehlende Preisdaten sind keine kostenlosen Aufrufe.');
  const filter = el('input'); filter.type = 'search'; filter.placeholder = 'Aufgabe, Modell oder Route filtern'; filter.setAttribute('aria-label', 'KI-Statistik filtern');
  const sort = el('select'); sort.setAttribute('aria-label', 'KI-Statistik sortieren');
  for (const [value, label] of [['cost', 'Kosten absteigend'], ['requests', 'Aufrufe absteigend'], ['coverage', 'Preislücken zuerst']]) {
    const o = el('option', label); o.value = value; sort.append(o);
  }
  const reload = el('button', 'Statistik laden'); reload.type = 'button'; reload.className = 'button secondary';
  const status = el('p'); status.setAttribute('role', 'status');
  const wrap = el('div'); wrap.style.overflowX = 'auto';
  const table = el('table'); table.style.width = '100%'; const head = el('thead'), hr = el('tr');
  ['Aufgabe / Bereich', 'Modell / Auswahlgrund', 'Ergebnisse / API-Aufrufe', 'API-Kosten / Abdeckung', 'Geschätzte Ersparnis', 'Qualitäts- / Preisbelege'].forEach(t => { const th = el('th', t); th.scope = 'col'; hr.append(th); });
  head.append(hr); const body = el('tbody'); table.append(head, body); wrap.append(table);
  panel.append(title, note, filter, sort, reload, status, wrap); host.append(panel);
  let rows = [], disposed = false;
  const money = (value, currency) => value === null ? 'unbekannt' : new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 4 }).format(value / 1000000);
  const reasonLabels = { lowest_forecast_cost_among_qualified: 'günstigste qualifizierte Route laut Vergleich',
    keep_active_cooldown: 'bewährte Route während der Wartefrist', keep_active_switch_margin: 'kein ausreichender Kostenvorteil für einen Wechsel',
    qualified_fallback_active_unavailable: 'qualifizierter Ersatz für nicht verfügbare Route', qualified_fallback_after_validation: 'qualifizierter Ersatz nach ungültiger Antwort' };
  function render() {
    body.replaceChildren(); const query = filter.value.trim().toLocaleLowerCase('de');
    const visible = rows.filter(r => [r.profileId, r.job, r.bucket, r.routeId, ...r.models].join(' ').toLocaleLowerCase('de').includes(query));
    visible.sort((a, b) => sort.value === 'requests' ? b.requests - a.requests : sort.value === 'coverage' ? a.priceCoverage - b.priceCoverage : a.currency.localeCompare(b.currency) || b.actualMicros - a.actualMicros);
    for (const r of visible) {
      const tr = el('tr');
      [ `${r.profileId} · ${r.job} · ${r.bucket}`, `${r.models.join(', ') || 'kein Modellnachweis'} · ${r.reasons.map(reason => reasonLabels[reason] || reason).join(', ')}`,
        `${r.accepted}/${r.requests} akzeptiert · ${r.calls} API-Aufrufe`, `${r.pricedRequests ? money(r.actualMicros, r.currency) : 'unbekannt'} · ${(100 * r.priceCoverage).toFixed(0)} % bepreist`,
        `${money(r.estimatedSavingsMicros, r.currency)} · ${r.comparableRequests} vergleichbare Ergebnisse`, `${r.evidenceIds.join(', ')} / ${r.priceIds.join(', ')}` ].forEach(text => tr.append(el('td', text)));
      body.append(tr);
    }
    if (!visible.length) { const tr = el('tr'), td = el('td', 'Keine passenden Messdaten vorhanden.'); td.colSpan = 6; tr.append(td); body.append(tr); }
  }
  filter.addEventListener('input', render); sort.addEventListener('change', render);
  reload.addEventListener('click', async () => {
    reload.disabled = true; status.textContent = 'Wird geladen …';
    try { const summary = await loadSummary(); if (disposed) return;
      rows = summary.groups || []; render(); status.textContent = summary.truncated ? 'Begrenzter Ausschnitt. Nicht als Gesamtkosten verwenden.' : 'Nur erfasste Gateway-Anfragen; Bestands-KI und Infrastruktur sind nicht enthalten.';
    } catch { if (!disposed) status.textContent = 'Statistik nicht verfügbar. Anmeldung, Berechtigung und Backend prüfen.'; }
    finally { if (!disposed) reload.disabled = false; }
  });
  render(); return () => { disposed = true; panel.remove(); };
}
