(() => {
  const catalog = window.GRADECREW_COPY;
  const language = document.querySelector('#language');
  const dialog = document.querySelector('#detail');
  let activeDialog = null;
  let locale = 'de';
  const t = key => catalog[locale][key] ?? catalog.de[key] ?? key;
  function renderDialog() {
    document.querySelector('#detailTitle').textContent = t(`${activeDialog}Title`);
    document.querySelector('#detailBody').textContent = t(`${activeDialog}Body`);
    document.querySelector('#stagingLink').hidden = !['login', 'join'].includes(activeDialog);
  }
  function setLocale(next) {
    locale = Object.hasOwn(catalog, next) ? next : 'de';
    document.documentElement.lang = locale;
    document.title = t('title');
    language.value = locale;
    document.querySelectorAll('[data-copy]').forEach(el => el.textContent = t(el.dataset.copy));
    for (const [suffix, attr] of [['aria', 'aria-label'], ['alt', 'alt'], ['placeholder', 'placeholder']]) {
      document.querySelectorAll(`[data-copy-${suffix}]`).forEach(el => el.setAttribute(attr, t(el.getAttribute(`data-copy-${suffix}`))));
    }
    if (activeDialog) renderDialog();
    try { localStorage.setItem('gradecrew.hero-preview.locale', locale); } catch { /* Storage is optional. */ }
  }
  function openDialog(name) {
    activeDialog = name;
    renderDialog();
    dialog.showModal();
  }
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { activeDialog = null; });
  document.querySelector('#joinForm').addEventListener('submit', event => {
    event.preventDefault();
    // The visual review does not send/store student codes or impersonate app authentication.
    openDialog('join');
  });
  language.addEventListener('change', () => setLocale(language.value));
  let saved;
  try { saved = localStorage.getItem('gradecrew.hero-preview.locale'); } catch { /* Use document default. */ }
  setLocale(new URLSearchParams(location.search).get('lang') || saved || 'de');
})();
