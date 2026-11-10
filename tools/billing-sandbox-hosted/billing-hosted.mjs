const banner = document.querySelector('.billingPreviewBanner');
banner.querySelector('strong').textContent = 'Testumgebung · Stripe Sandbox';
banner.querySelector('span').textContent = 'Nur freigegebene Testkonten und simulierte Zahlungen.';
const label = document.getElementById('userLabel');
document.getElementById('logoutBtn').remove();
const summary = document.querySelector('.billingPreviewSummary p');
const card = document.querySelector('.billingPreviewCard');
const prefix = '/billing-test/api';
card.innerHTML = `
  <h2>Zugang &amp; Abrechnung</h2>
  <form id="billingLogin">
    <label>Testkonto
      <select name="account"><option value="premium">Lehrkraft</option><option value="school">Musterschule</option></select>
    </label>
    <label>Testpasswort <input name="password" type="password" required autocomplete="current-password"></label>
    <button class="button primary" type="submit">Anmelden</button>
  </form>
  <p id="billingStatus" role="status">Anmeldung wird geprüft …</p>
  <div class="actions" id="billingActions" hidden>
    <a id="billingPayment" class="button secondary" rel="noreferrer">Stripe-Testzahlung öffnen</a>
    <button id="billingLogout" class="button secondary" type="button">Abmelden</button>
  </div>
`;
const form = document.getElementById('billingLogin');
const status = document.getElementById('billingStatus');
const actions = document.getElementById('billingActions');
const payment = document.getElementById('billingPayment');
let timer;
let viewVersion = 0;

function render(message, account) {
  status.textContent = summary.textContent = message;
  label.textContent = account?.kind === 'school' ? 'Musterschule' : account ? 'Test-Lehrkraft' : 'Testkonto';
  actions.hidden = !account;
  form.hidden = Boolean(account);
  payment.hidden = !account?.url;
  if (account?.url) payment.href = account.url;
  else payment.removeAttribute('href');
}

async function refresh() {
  window.clearTimeout(timer);
  const version = ++viewVersion;
  try {
    const response = await fetch(prefix + '/access', {cache: 'no-store'});
    if (version !== viewVersion) return;
    if (response.status === 401) {
      render('Melde dich mit deinem Testkonto an.');
      return;
    }
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (version !== viewVersion) return;
    const active = data.state === 'active';
    const message = data.kind === 'school'
      ? (active ? 'Schulzugang aktiv' : 'Schulzugang gesperrt · Rechnung offen')
      : (active ? 'Premium aktiv' : 'Kostenlos · Zahlung offen');
    payment.textContent = data.kind === 'school' ? 'Testrechnung öffnen' : 'Mit Test-PayPal zahlen';
    render(message, data);
  } catch {
    if (version !== viewVersion) return;
    render('Die Testanbindung ist gerade nicht verfügbar.');
  }
  timer = window.setTimeout(refresh, 5000);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  window.clearTimeout(timer);
  const version = ++viewVersion;
  const data = Object.fromEntries(new FormData(form));
  form.elements.password.value = '';
  try {
    const response = await fetch(prefix + '/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data),
    });
    if (version !== viewVersion) return;
    if (!response.ok) {
      render(response.status === 401 ? 'Testkonto oder Passwort stimmt nicht.' : 'Anmeldung gerade nicht verfügbar.');
      return;
    }
    await refresh();
  } catch {
    if (version !== viewVersion) return;
    render('Anmeldung gerade nicht verfügbar.');
  }
});

document.getElementById('billingLogout').addEventListener('click', async () => {
  window.clearTimeout(timer);
  const version = ++viewVersion;
  try {
    const response = await fetch(prefix + '/logout', {method: 'POST'});
    if (version !== viewVersion) return;
    if (!response.ok) throw new Error();
    await refresh();
  } catch {
    if (version !== viewVersion) return;
    render('Abmeldung gerade nicht verfügbar.');
  }
});

if (new URLSearchParams(window.location.search).has('billing')) {
  document.getElementById('billingPreviewOpen').click();
}
refresh();
