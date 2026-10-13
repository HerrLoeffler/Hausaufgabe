/* App-bundled presentation only. Authentication and tutorial actions stay owned by the web app. */
(() => {
  'use strict';
  const config = __GRADECREW_CONFIG__;
  if (!window.webkit?.messageHandlers?.gradecrewNative || window.top !== window.self || location.origin !== config.origin || window.GradeCrewNativeWorkspace) return;

  const storagePrefix = 'gradecrew.native.workspace.successfulLogins.v1:';
  const counts = new Map();
  let currentAccount = null;
  let scheduled = false;
  let started = false;
  const accountId = uid => typeof uid === 'string' && uid.length > 0 ? uid : null;

  function countFor(uid) {
    if (!uid) return 0;
    let count = counts.get(uid) || 0;
    try {
      const stored = Number(window.localStorage.getItem(storagePrefix + encodeURIComponent(uid)));
      if (Number.isFinite(stored) && stored >= 0) count = Math.max(count, Math.min(5, Math.floor(stored)));
    } catch { /* Storage can be unavailable; the account-scoped in-memory count still works. */ }
    counts.set(uid, count);
    return count;
  }

  function restoredAccount(uid) {
    currentAccount = accountId(uid);
    refresh();
  }

  function recordLogin(uid) {
    uid = accountId(uid);
    // The auth observer selects the account first. Late acknowledgements from another
    // account/logout cannot hide this account's entry or increment its count.
    if (!uid || uid !== currentAccount) return;
    const count = Math.min(5, countFor(uid) + 1);
    counts.set(uid, count);
    try { window.localStorage.setItem(storagePrefix + encodeURIComponent(uid), String(count)); } catch {}
    refresh();
  }

  Object.defineProperty(window, 'GradeCrewNativeWorkspace', {
    configurable: false, writable: false,
    value: Object.freeze({ restoredAccount, recordLogin })
  });

  const css = `
#dashboardView[data-gc-native-workspace] > .pageHead {
  display:block; min-height:0 !important; height:auto !important; padding:18px !important; margin:0; overflow:visible;
}
#dashboardView[data-gc-native-workspace] > .pageHead > div { width:100%; min-height:0; }
#dashboardView[data-gc-native-workspace] > .pageHead h1 { margin:4px 0; font-size:clamp(26px,5vw,34px); }
#dashboardView[data-gc-native-workspace] #dashboardOverview { margin-top:14px; display:flex; flex-wrap:wrap; gap:8px; }
#dashboardView[data-gc-native-workspace] .dashboardActions { display:block; width:100%; margin:16px 0 0; }
#dashboardView[data-gc-native-workspace] .dashboardPrimaryActions { display:flex !important; flex-direction:column !important; align-items:center !important; gap:10px !important; width:100% !important; height:auto !important; min-height:0 !important; }
#dashboardView[data-gc-native-workspace] #newQuizBtn {
  position:relative !important; display:flex; align-items:center; justify-content:center; gap:10px;
  width:100% !important; max-width:360px !important; height:72px !important; min-height:72px !important; max-height:72px !important; flex:0 0 auto !important; padding:6px 18px !important; overflow:hidden !important; font-size:15px;
}
#dashboardView[data-gc-native-workspace] #newQuizBtn > img {
  position:static !important; inset:auto !important; display:block; flex:0 0 54px; width:54px !important; height:58px !important; object-fit:contain;
}
#dashboardView[data-gc-native-workspace] #trashBtn { position:static !important; inset:auto !important; margin:0 !important; width:auto !important; max-width:100%; height:44px !important; flex:0 0 auto !important; background:var(--card,#fff) !important; display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:44px; padding:7px 12px; }
#dashboardView[data-gc-native-workspace] #trashBtn > img { width:28px !important; height:28px !important; object-fit:contain; }
#dashboardView[data-gc-native-workspace] > .gcWorkspaceCrewEntry {
  display:flex; flex-direction:column; align-items:center; gap:6px; width:100%; min-height:0 !important; height:auto !important;
  margin:0 0 12px; padding:12px; box-sizing:border-box; border:1px solid var(--line,#dfe5ec); border-radius:14px; background:var(--card,#fff);
}
#dashboardView[data-gc-native-workspace] > .gcWorkspaceCrewEntry[hidden] { display:none !important; }
#dashboardView[data-gc-native-workspace] > .gcWorkspaceCrewEntry .gcWorkspaceCrewPortraits { height:auto; min-height:0; }
#dashboardView[data-gc-native-workspace] > .gcWorkspaceCrewEntry .gcWorkspaceCrewPortraits img { display:block; width:min(240px,100%); height:auto; max-height:84px; object-fit:contain; }
#dashboardView[data-gc-native-workspace] #gradecrewTourBtn { min-height:44px; margin:0; }
#dashboardView[data-gc-native-workspace] > .gcWorkspaceCrewEntry > small { color:var(--muted,#5e6b7b); font-size:12px; }
#settingsView > .gcNativeTutorialReplay { display:flex; justify-content:flex-start; margin:0 0 16px; }
#settingsView #gcNativeSettingsTutorialBtn { min-height:44px; }
`;

  function english() { return document.documentElement.lang.toLowerCase().startsWith('en'); }

  function updateWorkspace() {
    const dashboard = document.getElementById('dashboardView');
    const hero = dashboard?.querySelector(':scope > .pageHead');
    if (!dashboard || !hero) return;
    dashboard.setAttribute('data-gc-native-workspace', '');
    const tutorial = document.getElementById('gradecrewTourBtn');
    if (tutorial && dashboard.contains(tutorial)) {
      let entry = tutorial.closest('.gcWorkspaceCrewEntry');
      if (!entry) {
        // If the tutorial arrives before the optional workspace upgrade, reuse its
        // real entry button and the same deployed Crew artwork; no tutorial clone.
        entry = document.createElement('div'); entry.className = 'gcWorkspaceCrewEntry';
        const portraits = document.createElement('div'); portraits.className = 'gcWorkspaceCrewPortraits'; portraits.setAttribute('aria-hidden', 'true');
        const image = document.createElement('img'); image.src = 'assets/gradecrew/crew-dashboard-lineup-c-r-e-w-alpha.png'; image.alt = ''; image.width = 288; image.height = 100;
        portraits.append(image); entry.append(portraits, tutorial);
      }
      if (entry.parentNode !== dashboard || entry.nextElementSibling !== hero) dashboard.insertBefore(entry, hero);
      const duration = tutorial.querySelector('small');
      if (duration) {
        for (const old of entry.querySelectorAll(':scope > small')) old.remove();
        entry.append(duration);
      }
      entry.hidden = !currentAccount || countFor(currentAccount) >= 5;
    }
    const overview = document.getElementById('dashboardOverview');
    const actions = dashboard.querySelector('.dashboardActions');
    if (overview && actions && (overview.nextElementSibling !== actions || overview.parentNode !== actions.parentNode)) overview.after(actions);
    const trash = document.getElementById('trashBtn');
    if (trash && dashboard.contains(trash)) {
      let label = trash.querySelector('[data-gc-native-trash-label]');
      if (!label) { label = document.createElement('span'); label.setAttribute('data-gc-native-trash-label', ''); trash.append(label); }
      const text = english() ? 'Trash' : 'Papierkorb';
      if (label.textContent !== text) label.textContent = text;
    }
  }

  function updateSettings() {
    const settings = document.getElementById('settingsView');
    if (!settings) return;
    let button = settings.querySelector('#gcNativeSettingsTutorialBtn');
    if (!button) {
      const row = document.createElement('div'); row.className = 'gcNativeTutorialReplay';
      button = document.createElement('button'); button.id = 'gcNativeSettingsTutorialBtn'; button.type = 'button'; button.className = 'button ghost';
      button.addEventListener('click', () => {
        const account = currentAccount;
        if (!account) return;
        const dashboard = document.getElementById('dashboardView');
        // The existing tutorial's start() explicitly requires the dashboard.
        // Reuse its normal back navigation before invoking the current handler.
        if (dashboard?.classList.contains('hidden')) document.getElementById('backFromSettings')?.click();
        const deadline = Date.now() + 10000;
        const open = () => {
          if (account !== currentAccount) return;
          const tutorial = document.getElementById('gradecrewTourBtn');
          if (dashboard && !dashboard.classList.contains('hidden') && tutorial) { tutorial.click(); return; }
          if (Date.now() < deadline) setTimeout(open, 100);
        };
        open();
      });
      row.append(button);
      const header = settings.querySelector(':scope > .pageHead');
      if (header) header.after(row); else settings.prepend(row);
    }
    const text = english() ? 'Start tutorial' : 'Tutorial starten';
    if (button.textContent !== text) button.textContent = text;
    button.disabled = !currentAccount || !document.getElementById('gradecrewTourBtn');
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; refresh(); });
  });

  function observe() {
    // Once mounted, watch only workspace, settings, locale, and direct view
    // replacement. Existing top controls and test generation stay owned by the app.
    const main = document.getElementById('mainContent');
    const dashboard = document.getElementById('dashboardView');
    const settings = document.getElementById('settingsView');
    if (!main || !dashboard || !settings) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
      return;
    }
    observer.observe(main, { childList: true });
    observer.observe(dashboard, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    observer.observe(settings, { childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function refresh() {
    if (!started) return;
    observer.disconnect();
    try { updateWorkspace(); updateSettings(); }
    finally { observe(); }
  }

  function start() {
    if (started) return;
    started = true;
    const style = document.createElement('style'); style.id = 'gcNativeWorkspaceStyle'; style.textContent = css;
    (document.head || document.documentElement).append(style);
    refresh();
    window.addEventListener('gradecrew:ui-locale-changed', refresh);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
