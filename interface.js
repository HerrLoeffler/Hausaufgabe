// Shared interaction rules. No Firebase, network requests or content rewriting.
export function scrollBehavior(win = window) {
  return win.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}

export function selectTab(tablist, selected) {
  if (!tablist || !selected || !tablist.contains(selected)) return;
  for (const tab of tablist.querySelectorAll('[role="tab"]')) {
    const active = tab === selected;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = tab.ownerDocument.getElementById(tab.getAttribute("aria-controls"));
    panel?.classList.toggle("hidden", !active);
  }
}

export function bindTabs(tablist, onSelect = tab => selectTab(tablist, tab)) {
  if (!tablist) return;
  const activate = tab => { if (tab && !tab.disabled) onSelect(tab); };
  tablist.addEventListener("click", event => activate(event.target.closest('[role="tab"]')));
  tablist.addEventListener("keydown", event => {
    const current = event.target.closest('[role="tab"]');
    if (!current || event.altKey || event.ctrlKey || event.metaKey) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')].filter(tab => !tab.disabled);
    const index = tabs.indexOf(current);
    let next;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs.at(-1);
    if (!next) return;
    event.preventDefault();
    activate(next);
    next.focus();
  });
}

export function focusView(view) {
  if (!view || view.classList.contains("hidden")) return;
  const doc = view.ownerDocument;
  // Do not steal focus from an open native dialog or an input in this view.
  if (doc.querySelector("dialog[open]") || view.contains(doc.activeElement)) return;
  const target = view.querySelector("h1") || view;
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
}

export function setSaveState(element, state, message) {
  if (!element) return;
  element.dataset.state = state;
  if (element.textContent !== message) element.textContent = message;
}

export function watchStickyHeight(element, property) {
  if (!element) return () => {};
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  let last = -1;
  const measure = () => {
    const height = Math.ceil(element.getBoundingClientRect().height);
    if (height === last) return;
    last = height;
    doc.documentElement.style.setProperty(property, `${height}px`);
  };
  const observer = win.ResizeObserver ? new win.ResizeObserver(measure) : null;
  observer?.observe(element);
  win.addEventListener("resize", measure, { passive: true });
  measure();
  return () => {
    observer?.disconnect();
    win.removeEventListener("resize", measure);
  };
}

export function installWorkspaceInteractions(doc = document) {
  watchStickyHeight(doc.querySelector(".topbar"), "--topbar-height");
  watchStickyHeight(doc.querySelector(".compactEditorHead"), "--editor-head-height");
  const menuSelector = "details.editorMoreMenu, details.questionMore";
  doc.addEventListener("click", event => {
    for (const menu of doc.querySelectorAll(menuSelector)) {
      if (!menu.open) continue;
      const inside = menu.contains(event.target);
      if (!inside || event.target.closest("button")) menu.open = false;
      if (inside && !menu.open && menu.contains(doc.activeElement)) menu.querySelector("summary")?.focus();
    }
  });
  doc.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const menu = event.target.closest(menuSelector);
    if (!menu?.open) return;
    event.preventDefault();
    menu.open = false;
    menu.querySelector("summary")?.focus();
  });
}
