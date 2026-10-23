/* Hub-only adapter: use the game's existing buttons after all its addons loaded. */
(() => {
  'use strict';
  function init() {
    const catalog = window.GradeCrewGames;
    const nav = document.querySelector('[data-gc-game]');
    const game = catalog?.games.find(item => item.id === nav?.dataset.gcGame);
    if (!game) return;
    const params = new URLSearchParams(location.search);
    let mode = params.get('mode');
    if (!game.modes.includes(mode)) mode = 'practice';
    const homeLink = nav.querySelector('.gc-games-home');
    function setMode(nextMode) {
      if (!game.modes.includes(nextMode)) return;
      mode = nextMode;
      homeLink.href = `../?mode=${mode}`;
      nav.querySelectorAll('[data-gc-switch]').forEach(link => {
        link.href = `../${link.dataset.gcSwitch}/?mode=${mode}`;
      });
    }
    setMode(mode);
    document.querySelectorAll(`[${game.entry.modeAttribute}]`).forEach(button => button.addEventListener('click', () => {
      setMode(button.getAttribute(game.entry.modeAttribute));
    }));
    // Valid QR links always take precedence; the native game already opened them.
    const join = params.get('join');
    if (!/^\d{6}$/.test(join || '')) {
      if (params.get('mode') === 'join') document.getElementById('quickJoinBtn')?.click();
      else if (game.modes.includes(params.get('mode'))) {
        document.querySelector(`[${game.entry.modeAttribute}="${mode}"]`)?.click();
      }
    }
    // Entry parameters are consumed once. Returning to the game home stays there.
    params.delete('mode');
    const query = params.toString();
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
    document.querySelectorAll('[data-home],[data-back-home],#homeBtn').forEach(button => {
      button.addEventListener('click', () => history.replaceState(null, '', location.pathname));
    });
    const dialog = document.getElementById('gcLeaveDialog');
    let destination = null;
    function visible(id) {
      const view = document.getElementById(id);
      return Boolean(view && !view.hidden);
    }
    function hasRound() {
      return [game.entry.gameView, game.entry.teacherView, 'waitingView'].some(visible);
    }
    nav.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || !hasRound() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      destination = link.href;
      const host = visible(game.entry.teacherView);
      dialog.querySelector('p').textContent = host
        ? 'Beim Wechsel wird deine Lehrkraftansicht geschlossen. Die Live-Runde wird dadurch nicht beendet.'
        : 'Beim Wechsel verlässt du diese Runde. Dein aktueller Versuch lässt sich danach nicht fortsetzen.';
      dialog.returnValue = '';
      dialog.showModal();
    });
    dialog.addEventListener('close', () => {
      const target = destination;
      destination = null;
      if (dialog.returnValue === 'leave' && target) location.assign(target);
    });
    document.addEventListener('click', event => {
      const picker = nav.querySelector('details');
      if (picker.open && !picker.contains(event.target)) picker.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') nav.querySelector('details').open = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
