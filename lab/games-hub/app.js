(() => {
  'use strict';
  const { games, modes } = window.GradeCrewGames;
  const FAVORITES_KEY = 'gradecrew-games-favorites-v1';
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const state = { mode: modes.some(mode => mode.id === params.get('mode')) ? params.get('mode') : 'practice', subject: 'all', query: '', favoritesOnly: false };
  let favorites = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    if (Array.isArray(saved)) favorites = new Set(saved.filter(id => games.some(game => game.id === id)));
  } catch { /* The hub also works when browser storage is unavailable. */ }
  const icons = {
    math: '<circle cx="48" cy="52" r="26"/><path d="M48 24v-8m-10 0h20M48 52l15-10M20 34h14M27 27v14M64 66h14M68 58l8 16"/>',
    german: '<path d="M24 18h39a7 7 0 0 1 7 7v45H24zM34 34h25M34 45h18M34 56h22"/><circle cx="64" cy="61" r="13"/><path d="m73 70 10 10M57 61h14"/>',
    english: '<rect x="17" y="24" width="43" height="31" rx="7"/><rect x="36" y="42" width="43" height="31" rx="7"/><path d="M26 36h25M45 54h25M23 67c7 8 17 12 28 12M73 31c-7-8-17-12-28-12"/>',
    escape: '<rect x="25" y="15" width="46" height="66" rx="5"/><circle cx="59" cy="49" r="3"/><path d="M38 15v-4a10 10 0 0 1 20 0v4M17 48h16m-8-8 8 8-8 8"/>'
  };
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function saveFavorites() {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])); } catch { /* Session-only favorites remain usable. */ }
  }
  function renderCard(game) {
    const card = node('article', `gameCard ${game.subjectId}`);
    card.dataset.game = game.id;
    const titleId = `title-${game.id}`;
    card.setAttribute('aria-labelledby', titleId);
    const top = node('div', 'gameTop');
    const star = node('button', 'favoriteButton', favorites.has(game.id) ? '★' : '☆');
    star.type = 'button';
    star.setAttribute('aria-label', `${game.name} als Favorit`);
    star.setAttribute('aria-pressed', String(favorites.has(game.id)));
    star.addEventListener('click', () => {
      if (favorites.has(game.id)) favorites.delete(game.id); else favorites.add(game.id);
      saveFavorites();
      render();
      ($('gameGrid').querySelector(`[data-game="${game.id}"] .favoriteButton`) || $('favoritesOnly')).focus({ preventScroll: true });
    });
    top.append(node('span', 'subject', game.subject.toLocaleUpperCase('de-DE')), star);
    const visual = node('div', 'gameVisual');
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = `<svg viewBox="0 0 96 96">${icons[game.icon] || ''}</svg>`;
    const title = node('h3', '', game.name);
    title.id = titleId;
    const features = node('div', 'featureLine');
    game.features.forEach(feature => features.append(node('span', '', feature)));
    const mode = modes.find(item => item.id === state.mode);
    const action = node('a', 'primary', mode.action);
    action.href = `${game.id}/?mode=${mode.id}`;
    action.setAttribute('aria-label', `${mode.action}: ${game.name}`);
    const arrow = node('span', '', '→');
    arrow.setAttribute('aria-hidden', 'true');
    action.append(arrow);
    const overview = node('a', 'gameHomeLink', 'Spielübersicht öffnen');
    overview.href = `${game.id}/`;
    overview.setAttribute('aria-label', `Spielübersicht: ${game.name}`);
    card.append(top, visual, title, node('p', '', game.description), features, action, overview);
    return card;
  }
  function render() {
    const query = state.query.trim().toLocaleLowerCase('de-DE');
    const visible = games.filter(game => game.modes.includes(state.mode)
      && (state.subject === 'all' || game.subjectId === state.subject)
      && (!state.favoritesOnly || favorites.has(game.id))
      && [game.name, game.subject, game.description, ...game.topics].join(' ').toLocaleLowerCase('de-DE').includes(query));
    $('gameGrid').replaceChildren(...visible.map(renderCard));
    $('gameCount').textContent = `${visible.length} ${visible.length === 1 ? 'Spiel' : 'Spiele'}`;
    $('emptyState').hidden = visible.length > 0;
    $('modeDescription').textContent = modes.find(mode => mode.id === state.mode).description;
    $('resultsStatus').textContent = `${visible.length} ${visible.length === 1 ? 'Spiel verfügbar' : 'Spiele verfügbar'}.`;
    $('subjectFilters').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.subject === state.subject)));
    $('favoritesOnly').setAttribute('aria-pressed', String(state.favoritesOnly));
  }
  function setMode(mode) {
    state.mode = mode;
    const url = new URL(location.href);
    if (mode === 'practice') url.searchParams.delete('mode'); else url.searchParams.set('mode', mode);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    render();
  }
  games.filter(game => game.modes.includes('live')).forEach(game => {
    const option = node('option', '', game.name);
    option.value = game.id;
    $('joinGame').append(option);
  });
  new Map(games.map(game => [game.subjectId, game.subject])).forEach((label, id) => {
    const button = node('button', '', label);
    button.type = 'button';
    button.dataset.subject = id;
    button.setAttribute('aria-pressed', 'false');
    $('subjectFilters').append(button);
  });
  $('subjectFilters').addEventListener('click', event => {
    const button = event.target.closest('[data-subject]');
    if (button) { state.subject = button.dataset.subject; render(); }
  });
  $('gameSearch').addEventListener('input', event => { state.query = event.target.value; render(); });
  $('favoritesOnly').addEventListener('click', () => { state.favoritesOnly = !state.favoritesOnly; render(); });
  $('resetFilters').addEventListener('click', () => {
    state.subject = 'all'; state.query = ''; state.favoritesOnly = false;
    $('gameSearch').value = '';
    render();
    $('subjectFilters').querySelector('button').focus({ preventScroll: true });
  });
  document.querySelectorAll('input[name="hub-mode"]').forEach(input => {
    input.checked = input.value === state.mode;
    input.addEventListener('change', () => setMode(input.value));
  });
  $('joinCode').addEventListener('input', event => { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6); });
  $('joinForm').addEventListener('submit', event => {
    event.preventDefault();
    const game = games.find(item => item.id === $('joinGame').value && item.modes.includes('live'));
    const code = $('joinCode').value;
    if (!game || !/^\d{6}$/.test(code)) { $('joinForm').reportValidity(); return; }
    location.assign(`${game.id}/?join=${code}`);
  });
  window.addEventListener('storage', event => {
    if (event.key !== FAVORITES_KEY) return;
    try {
      const saved = JSON.parse(event.newValue || '[]');
      favorites = new Set(Array.isArray(saved) ? saved.filter(id => games.some(game => game.id === id)) : []);
    } catch { favorites = new Set(); }
    render();
  });
  render();
})();
