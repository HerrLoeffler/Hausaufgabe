// Render the access decision from the loopback test server.
const banner = document.querySelector('.billingPreviewBanner');
banner.querySelector('strong').textContent = 'Testumgebung · Stripe Sandbox';
banner.querySelector('span').textContent = 'Fiktive Lehrkraft und Schule. Keine echten Zahlungen.';
document.getElementById('userLabel').textContent = 'Lokale Testkonten';
const summary = document.querySelector('.billingPreviewSummary p');
const card = document.querySelector('.billingPreviewCard');
card.innerHTML = `
  <h2>Zugang &amp; Abrechnung</h2>
  <p>Der Testserver prüft den Zahlungseingang bei Stripe und schaltet den passenden Zugang automatisch frei.</p>
  <dl>
    <div><dt>Persönlicher Zugang</dt><dd id="testPremiumState">Wird geprüft …</dd></div>
    <div><dt>Musterschule</dt><dd id="testSchoolState">Wird geprüft …</dd></div>
  </dl>
  <div class="actions">
    <a id="testPremiumLink" class="button primary" rel="noreferrer" hidden>1 € per Test-PayPal zahlen</a>
    <a id="testSchoolLink" class="button secondary" rel="noreferrer" hidden>30-€-Testrechnung ansehen</a>
  </div>
`;
const items = {
  premium: {state: 'testPremiumState', link: 'testPremiumLink', pending: 'Kostenlos · Zahlung offen', active: 'Premium aktiv'},
  school: {state: 'testSchoolState', link: 'testSchoolLink', pending: 'Schulzugang gesperrt · Rechnung offen', active: 'Schulzugang aktiv'},
};

async function refresh() {
  try {
    const response = await fetch('/api/access', {cache: 'no-store'});
    if (!response.ok) throw new Error('Status nicht erreichbar');
    const statuses = await response.json();
    for (const [kind, item] of Object.entries(items)) {
      const {state, url} = statuses[kind];
      document.getElementById(item.state).textContent =
        state === 'active' ? item.active : state === 'pending' ? item.pending : 'Wird geprüft …';
      const link = document.getElementById(item.link);
      link.href = url;
      link.hidden = kind === 'premium' && state !== 'pending';
      if (kind === 'school') link.hidden = state === 'checking';
    }
    summary.textContent = [
      statuses.premium.state === 'active' ? items.premium.active : 'Persönlicher Zugang · Kostenlos',
      statuses.school.state === 'active' ? items.school.active : 'Schulzugang · gesperrt',
    ].join(' · ');
  } catch {
    summary.textContent = 'Verbindung zum Testserver unterbrochen.';
    for (const item of Object.values(items)) {
      document.getElementById(item.state).textContent = 'Status derzeit nicht verfügbar';
      document.getElementById(item.link).hidden = true;
    }
  }
  window.setTimeout(refresh, 1500);
}
refresh();
