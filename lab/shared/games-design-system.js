(() => {
  'use strict';

  const VERSION = '0.1.0';
  const ROOT_ATTR = 'data-gcg-version';

  function markDocument() {
    document.documentElement.setAttribute(ROOT_ATTR, VERSION);
  }

  function syncChoice(choice) {
    const input = choice.querySelector('input[type="radio"],input[type="checkbox"]');
    if (!input) return;
    choice.dataset.selected = String(Boolean(input.checked));
    choice.dataset.disabled = String(Boolean(input.disabled));
  }

  function enhanceChoices(root = document) {
    root.querySelectorAll('.gcg-choice').forEach(choice => {
      if (choice.dataset.gcgBound === 'true') { syncChoice(choice); return; }
      choice.dataset.gcgBound = 'true';
      const input = choice.querySelector('input[type="radio"],input[type="checkbox"]');
      if (!input) return;
      syncChoice(choice);
      input.addEventListener('change', () => {
        if (input.type === 'radio' && input.name) {
          root.querySelectorAll(`.gcg-choice input[type="radio"][name="${CSS.escape(input.name)}"]`).forEach(other => {
            const owner = other.closest('.gcg-choice');
            if (owner) syncChoice(owner);
          });
        } else syncChoice(choice);
      });
    });
  }

  function createAdvancedDisclosure({ title = 'Weitere Einstellungen', content, open = false, className = '' } = {}) {
    if (!(content instanceof Node)) throw new TypeError('content must be a DOM node');
    const details = document.createElement('details');
    details.className = `gcg-advanced${className ? ` ${className}` : ''}`;
    details.open = Boolean(open);
    const summary = document.createElement('summary');
    summary.textContent = title;
    const body = document.createElement('div');
    body.className = 'gcg-advanced__body';
    body.append(content);
    details.append(summary, body);
    return details;
  }

  function setRoundSummary(target, parts) {
    if (!target) return;
    const values = (Array.isArray(parts) ? parts : []).map(value => String(value || '').trim()).filter(Boolean);
    const text = values.join(' · ');
    const output = target.querySelector?.('[data-gcg-summary-text]') || target;
    output.textContent = text || 'Noch nichts ausgewählt';
    target.dataset.empty = String(!values.length);
  }

  function announce(message, { politeness = 'polite', timeoutMs = 1800 } = {}) {
    let region = document.getElementById('gcgLiveRegion');
    if (!region) {
      region = document.createElement('div');
      region.id = 'gcgLiveRegion';
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'true');
      Object.assign(region.style, {
        position: 'fixed', width: '1px', height: '1px', overflow: 'hidden',
        clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap'
      });
      document.body.append(region);
    }
    region.setAttribute('aria-live', politeness);
    region.textContent = '';
    requestAnimationFrame(() => { region.textContent = String(message || ''); });
    window.setTimeout(() => { if (region.textContent === String(message || '')) region.textContent = ''; }, timeoutMs);
  }

  function storageKey(gameId, name) {
    if (!/^[a-z0-9-]+$/i.test(String(gameId || ''))) throw new Error('invalid gameId');
    if (!/^[a-z0-9-]+$/i.test(String(name || ''))) throw new Error('invalid storage name');
    return `gradecrew-games:${gameId}:${name}:v1`;
  }

  function saveLocalPreference(gameId, name, value) {
    try { localStorage.setItem(storageKey(gameId, name), JSON.stringify(value)); return true; }
    catch { return false; }
  }

  function loadLocalPreference(gameId, name, fallback = null) {
    try {
      const raw = localStorage.getItem(storageKey(gameId, name));
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  }

  markDocument();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhanceChoices(), { once: true });
  else enhanceChoices();

  window.GradeCrewGamesDesign = Object.freeze({
    version: VERSION,
    enhanceChoices,
    createAdvancedDisclosure,
    setRoundSummary,
    announce,
    saveLocalPreference,
    loadLocalPreference
  });
})();
