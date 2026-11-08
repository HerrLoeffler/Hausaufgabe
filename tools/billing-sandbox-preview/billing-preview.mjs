// Layout-only navigation. Deliberately no Auth, storage, database or HTTP APIs.
const byId = (id) => document.getElementById(id);
const show = (id) => {
  for (const view of document.querySelectorAll('main > section.view')) {
    view.classList.toggle('hidden', view.id !== id);
  }
  const heading = byId(id)?.querySelector('h1');
  heading?.setAttribute('tabindex', '-1');
  heading?.focus();
};
byId('settingsTopBtn')?.addEventListener('click', () => show('settingsView'));
byId('backFromSettings')?.addEventListener('click', () => show('dashboardView'));
byId('brandBtn')?.addEventListener('click', () => show('dashboardView'));
byId('userLabel').textContent = 'Vorschau ohne Konto';
byId('logoutBtn').textContent = 'Anmeldung noch nicht verbunden';
byId('emptyQuizState')?.classList.remove('hidden');
for (const id of ['publishedQuizCount', 'draftQuizCount', 'endedQuizCount']) byId(id).textContent = '0';
byId('emptyQuizState').querySelector('p').textContent = 'Hier werden später deine Tests angezeigt. In dieser Vorschau werden keine Tests angelegt.';
byId('settingsView').querySelector('.pageHead p').textContent = 'Vorschau auf Zugang, Abrechnung und deine bisherigen Einstellungen.';
const summary = document.createElement('section');
summary.className = 'card billingPreviewSummary';
summary.innerHTML = '<div><h2>Dein Zugang</h2><p>Geplant: 3 kostenlose Tests zum Einstieg. Hier wurde noch kein Guthaben vergeben.</p></div><button id="billingPreviewOpen" class="button secondary" type="button">Zugang ansehen</button>';
byId('dashboardView').querySelector('.pageHead').after(summary);
byId('billingPreviewOpen').addEventListener('click', () => show('settingsView'));
const billing = document.createElement('article');
billing.className = 'card billingPreviewCard';
billing.innerHTML = `
  <h2>Zugang &amp; Abrechnung</h2>
  <p>So wird die Verwaltung in deinen vorhandenen Arbeitsbereich eingebunden.</p>
  <dl><div><dt>Kontostand</dt><dd>Noch kein Testkonto verbunden</dd></div>
  <div><dt>Kostenloser Einstieg</dt><dd>3 Tests vorgesehen · noch nicht gutgeschrieben</dd></div>
  <div><dt>Monatlicher Testtarif</dt><dd>1,00 € Testbetrag · 12 Beispieltests vorgesehen</dd></div>
  <div><dt>Zahlungsanbindung</dt><dd>Noch nicht eingerichtet</dd></div></dl>
  <p class="billingPreviewNotice">Die Zahlen sind Vorschläge für den Testlauf. Es besteht kein Abo und es wird kein Geld eingezogen.</p>
  <div class="actions"><button class="button primary" disabled>Stripe-Testzahlung noch nicht verfügbar</button>
  <button class="button secondary" disabled>Testrechnung</button><button class="button secondary" disabled>Abo verwalten</button></div>
  <p class="hint">PayPal, Überweisung und Lastschrift sind noch nicht angebunden. Eine Freischaltung folgt später erst nach bestätigtem Zahlungseingang.</p>`;
byId('settingsView').querySelector('.pageHead').after(billing);
document.addEventListener('submit', (event) => event.preventDefault());
