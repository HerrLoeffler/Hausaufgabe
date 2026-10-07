/** Presentation-only dashboard enhancement. Never owns data, publishing or provider actions. */
import { registerCatalog, registerSourcePatterns } from './shared/i18n/browser-runtime.mjs?v=3';
registerCatalog('en-GB', Object.fromEntries(Object.entries({
  'Vollständigen Titel anzeigen': 'Show full title',
  'Auftrag im Detail': 'Request details',
  'Erstellung unterbrochen': 'Creation interrupted',
  'Als geprüft markieren': 'Mark as reviewed',
  'Wartet auf deine Prüfung': 'Waiting for your review',
  'Prüfhinweis': 'Review guidance',
  '1 Erstellung braucht deine Aufmerksamkeit.': '1 creation request needs your attention.',
  'Suche und Status filtern gespeicherte Tests. Erstellungsaufträge bleiben sichtbar.': 'Search and status filter saved tests. Creation requests stay visible.',
}).map(([source, target]) => ['source:' + source, target])));

registerSourcePatterns('en-GB', [{ pattern: /^(\d+) Erstellungen brauchen deine Aufmerksamkeit\.$/, replacement: '$1 creation requests need your attention.' }]);

const instances = new WeakMap();
const paths = {
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',
  plus: 'M12 5v14M5 12h14',
  edit: 'm14 5 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14z',
  results: 'M5 20V10M12 20V4M19 20v-7',
  share: 'M8 12h8M13 7l5 5-5 5M6 5H3v14h3',
  copy: 'M8 8h12v12H8zM16 8V4H4v12h4',
  check: 'm5 12 4 4L19 6',
  alert: 'M12 8v5M12 17h.01M10 4 2 19h20L14 4z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};
function icon(document, name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [k,v] of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false',class:'gcWorkspaceIcon'})) svg.setAttribute(k,v);
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d',paths[name]); svg.append(path); return svg;
}
function addIcon(element, name) {
  if (!element || element.querySelector(':scope > .gcWorkspaceIcon')) return;
  element.prepend(icon(element.ownerDocument, name));
}
function disclose(element, label, threshold, originalText = element?.textContent) {
  if (!element || element.textContent.trim().length <= threshold || element.nextElementSibling?.classList.contains('gcWorkspaceDisclosure')) return;
  const doc = element.ownerDocument;
  const details = doc.createElement('details'); details.className = 'gcWorkspaceDisclosure';
  const summary = doc.createElement('summary'); summary.textContent = label;
  const full = doc.createElement('p'); full.setAttribute('data-i18n-content', ''); full.textContent = originalText;
  details.append(summary, full); element.after(details);
  element.classList.add('gcWorkspaceBounded');
}

export function installWorkspaceUpgrade(document = globalThis.document) {
  const dashboard = document?.getElementById('dashboardView');
  if (!dashboard) return null;
  if (instances.has(dashboard)) return instances.get(dashboard);
  const window = document.defaultView;
  const decorated = new WeakSet();
  const toolbar = dashboard.querySelector('.dashboardToolbar');
  const jobs = document.getElementById('aiJobsList');
  if (toolbar && jobs) {
    dashboard.insertBefore(toolbar, jobs);
    const note = document.createElement('p'); note.className = 'gcWorkspaceFilterNote';
    note.textContent = 'Suche und Status filtern gespeicherte Tests. Erstellungsaufträge bleiben sichtbar.';
    toolbar.after(note);
  }
  dashboard.classList.add('gcWorkspace');
  const overview = document.getElementById('dashboardOverview');
  const filter = document.getElementById('quizFilter');
  if (overview && filter && !overview.querySelector('[data-filter="all"]')) {
    const all = document.createElement('button'); all.type = 'button'; all.className = 'dashboardMetric'; all.dataset.filter = 'all';
    const label = document.createElement('span'); label.textContent = 'Alle Tests';
    all.append(label); overview.prepend(all);
    // Existing delegated dashboard handler also handles this native button.
  }
  const heading = dashboard.querySelector('.pageHead > div:first-child');
  if (heading) {
    const artwork = document.createElement('img');
    artwork.className = 'gcWorkspaceGreeting';
    artwork.width = 96; artwork.height = 96; artwork.alt = ''; artwork.setAttribute('aria-hidden','true');
    heading.append(artwork);
  }
  const subtitle = heading?.querySelector(':scope > p');
  const defaultSubtitle = 'Alles für deinen nächsten Leistungsnachweis an einem Ort.';
  let previousFailedCount = 0;
  let greeted = false;
  const greet = () => {
    if (greeted || dashboard.classList.contains('hidden') || dashboard.hidden) return;
    greeted = true;
    const artwork = dashboard.querySelector('.gcWorkspaceGreeting');
    if (artwork) artwork.src = 'assets/gradecrew/coco-workspace-greeting.svg';
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) dashboard.classList.add('gcWorkspaceGreetingOnce');
  };
  const refresh = () => {
    const failedCount = jobs?.querySelectorAll('.aiJobFailed').length || 0;
    if (subtitle && failedCount !== previousFailedCount) {
      subtitle.textContent = failedCount === 1 ? '1 Erstellung braucht deine Aufmerksamkeit.'
        : failedCount > 1 ? `${failedCount} Erstellungen brauchen deine Aufmerksamkeit.` : defaultSubtitle;
      previousFailedCount = failedCount;
    }
    const all = overview?.querySelector('[data-filter="all"]');
    if (all) {
      const value = String(filter?.value === 'all');
      if (all.getAttribute('aria-pressed') !== value) all.setAttribute('aria-pressed',value);

    }
    for (const card of dashboard.querySelectorAll('.quizCard, .aiJobCard')) {
      if (decorated.has(card)) continue;
      decorated.add(card);
      const title = card.querySelector('.quizCardTop h3, .aiJobBody > strong, :scope > div:first-child > strong');
      const originalTitle = title?.textContent;
      if (title && card.querySelector('.aiJobBody')) {
        // Only a renderer's leading label changes; the authored text stays intact.
        const displayTitle = originalTitle.replace(/^(?:KI-Test|Test)\s*·\s*/, '');
        if (displayTitle !== originalTitle) {
          title.dataset.workspaceOriginalTitle = originalTitle;
          title.setAttribute('data-i18n-content', '');
          title.setAttribute('title', originalTitle);
          title.textContent = displayTitle;
        }
      }
      disclose(title, 'Vollständigen Titel anzeigen', 96, originalTitle);
      if (card.classList.contains('aiJobCard')) {
        const message = card.querySelector('.aiJobBody > p');
        if (card.classList.contains('aiJobReady')) {
          const complete = card.querySelector('.completeAiReview');
          if (complete) complete.textContent = 'Als geprüft markieren';
          const status = card.querySelector('.aiJobBody > small');
          if (status) status.textContent = 'Wartet auf deine Prüfung';
          if (message) {
            const note = document.createElement('details'); note.className = 'gcWorkspaceReviewNote';
            const summary = document.createElement('summary'); summary.textContent = 'Prüfhinweis';
            message.after(note); note.append(summary, message);
          }
        } else disclose(message, 'Auftrag im Detail', 180);
        if (card.classList.contains('aiJobFailed') && title) {
          const label = document.createElement('span'); label.className = 'gcWorkspaceJobLabel'; label.textContent = 'Erstellung unterbrochen'; title.before(label);
        }
      }
      for (const [selector,name] of [['.edit','edit'],['.results','results'],['.studentShare','share'],['.teacherShare','share'],['.duplicate','copy'],['.remove','trash'],['.openAiJob','edit'],['.completeAiReview','check'],['.reportAiJob','alert']]) addIcon(card.querySelector(selector),name);
      addIcon(card.querySelector('.quizMore > summary'), 'more');
    }
    const trash = document.getElementById('trashBtn');
    if (trash && !trash.querySelector('.gcWorkspaceIcon')) {
      for (const node of trash.childNodes) if (node.nodeType === 3) node.textContent = node.textContent.replace(/^\s*🗑\uFE0F?\s*/, '');
      addIcon(trash,'trash');
    }
    // The existing + label stays intact for its i18n source mapping.
    const loading = dashboard.querySelector('#quizList > .card:not(.quizCard)');
    if (loading && !loading.classList.contains('gcWorkspaceLoading')) { loading.classList.add('gcWorkspaceLoading'); loading.setAttribute('role','status'); }
    greet();
  };
  // Observe only this view, not the entire application. Disconnect during own writes.
  const observer = new window.MutationObserver(() => { observer.disconnect(); refresh(); observe(); });
  const observe = () => observer.observe(dashboard, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});
  const onFilter = () => refresh();
  filter?.addEventListener('change',onFilter);
  refresh(); observe();
  const api = { refresh, disconnect() { observer.disconnect(); filter?.removeEventListener('change',onFilter); } };
  instances.set(dashboard,api); return api;
}
if (globalThis.document) installWorkspaceUpgrade();
