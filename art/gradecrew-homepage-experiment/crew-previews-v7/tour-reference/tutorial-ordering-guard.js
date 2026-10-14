// Tutorial-only hardening for the final Crew ordering task.
// Real student ordering tasks keep their normal drag + arrow behaviour.

const FINALE_TEXT = "Crew-Finale";
const STYLE_ID = "gcTutorialOrderingGuardStyles";
const BODY_CLASS = "gcTutorialFinaleOrdering";
const PIN_CLASS = "gcTutorialFinaleSubmitPinned";
const ROW_CLASS = "gcTutorialOrderingArrowOnly";
const HINT_CLASS = "gcTutorialOrderingArrowHint";
const ORIGINAL_DRAG_ATTR = "gcTutorialOriginalDraggable";
const MISSING_ATTR = "__missing__";

function injectStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
body.${BODY_CLASS} .${ROW_CLASS}{cursor:default!important;touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;-webkit-user-drag:none!important}
body.${BODY_CLASS} .${ROW_CLASS} .sortGrip{display:none!important}
body.${BODY_CLASS} .${ROW_CLASS}{grid-template-columns:minmax(0,1fr) auto!important}
body.${BODY_CLASS} .${ROW_CLASS} .sortText{grid-column:1;min-width:0;overflow-wrap:anywhere}
body.${BODY_CLASS} .${ROW_CLASS} .sortButtons{grid-column:2;justify-self:end}
body.${BODY_CLASS} .${ROW_CLASS} .sortButtons,
body.${BODY_CLASS} .${ROW_CLASS} .sortButtons button,
body.${BODY_CLASS} .${ROW_CLASS} button.iconButton{touch-action:manipulation!important}
body.${BODY_CLASS} .${HINT_CLASS}{display:block;margin:8px 0 10px;padding:8px 10px;border:1px solid #cbd9ff;border-radius:10px;background:#f4f7ff;color:#35528a;font-size:12px;font-weight:750;line-height:1.35}
body.${PIN_CLASS} #studentSubmitBtn{position:fixed!important;left:50%!important;bottom:max(12px,env(safe-area-inset-bottom))!important;transform:translateX(-50%)!important;z-index:2147481500!important;width:min(420px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;box-shadow:0 12px 34px rgba(23,55,90,.28),0 0 0 5px rgba(255,255,255,.92)!important}
body.${PIN_CLASS} #studentForm{padding-bottom:max(92px,calc(80px + env(safe-area-inset-bottom)))!important}
@media(max-width:640px){body.${PIN_CLASS} #studentSubmitBtn{bottom:max(9px,env(safe-area-inset-bottom))!important;width:calc(100vw - 20px)!important}}
`;
  (doc.head || doc.documentElement).appendChild(style);
}

function containsFinaleText(node) {
  return String(node?.textContent || "").includes(FINALE_TEXT);
}

function findFinale(doc) {
  for (const list of doc.querySelectorAll(".sortableList")) {
    let node = list.parentElement;
    let fallback = null;
    while (node && node !== doc.body) {
      if (containsFinaleText(node)) {
        fallback = node;
        if (node.matches?.(".question, .studentQuestion, .questionCard, .studentQuestionCard, [data-qid], [data-question-id]")) {
          return { list, container: node };
        }
      }
      if (node.id === "studentForm") break;
      node = node.parentElement;
    }
    if (fallback) return { list, container: fallback };
  }
  return null;
}

function eventElement(event) {
  const node = event?.target;
  return node?.nodeType === 1 ? node : node?.parentElement || null;
}

export function installTutorialOrderingGuard(doc = globalThis.document, win = globalThis.window) {
  if (!doc?.documentElement || !doc.body || !win) return () => {};
  if (doc.documentElement.dataset.gcTutorialOrderingGuardInstalled === "1") return () => {};
  doc.documentElement.dataset.gcTutorialOrderingGuardInstalled = "1";
  injectStyles(doc);

  let current = null;
  let engaged = false;
  let raf = 0;
  let recoverRequested = false;
  let recovering = false;
  let observer = null;

  const requestFrame = win.requestAnimationFrame?.bind(win) || (callback => win.setTimeout(callback, 16));
  const cancelFrame = win.cancelAnimationFrame?.bind(win) || (id => win.clearTimeout(id));

  const active = () => doc.body.classList.contains("gcRealTourActive") && doc.body.classList.contains("gcTourAnswering");

  function restoreRows(entry = current) {
    if (!entry) return;
    for (const row of entry.list.querySelectorAll(`.${ROW_CLASS}`)) {
      const original = row.dataset[ORIGINAL_DRAG_ATTR];
      if (original === MISSING_ATTR) row.removeAttribute("draggable");
      else if (original != null) row.setAttribute("draggable", original);
      delete row.dataset[ORIGINAL_DRAG_ATTR];
      row.classList.remove(ROW_CLASS);
      row.querySelector(".sortGrip")?.removeAttribute("aria-hidden");
    }
    entry.container.querySelector(`.${HINT_CLASS}`)?.remove();
  }

  function detachCurrent() {
    if (!current) return;
    current.list.removeEventListener("dragstart", current.onDragStart, true);
    current.list.removeEventListener("touchmove", current.onTouchMove, true);
    current.list.removeEventListener("wheel", current.onWheel, true);
    current.list.removeEventListener("pointerdown", current.onPointerDown, true);
    current.list.removeEventListener("click", current.onClick, true);
    restoreRows(current);
    current = null;
    engaged = false;
  }

  function clearState() {
    detachCurrent();
    doc.body.classList.remove(BODY_CLASS, PIN_CLASS);
  }

  function ensureRows(entry) {
    for (const row of entry.list.querySelectorAll(".sortItem")) {
      if (row.dataset[ORIGINAL_DRAG_ATTR] == null) {
        row.dataset[ORIGINAL_DRAG_ATTR] = row.hasAttribute("draggable") ? String(row.getAttribute("draggable")) : MISSING_ATTR;
      }
      row.draggable = false;
      row.setAttribute("draggable", "false");
      row.classList.add(ROW_CLASS);
      row.querySelector(".sortGrip")?.setAttribute("aria-hidden", "true");
    }
    if (!entry.container.querySelector(`.${HINT_CLASS}`)) {
      const hint = doc.createElement("small");
      hint.className = HINT_CLASS;
      hint.textContent = "Reihenfolge nur mit den Pfeilen ↑ und ↓ ändern.";
      entry.list.before(hint);
    }
  }

  function visiblePixels(rect, viewportHeight) {
    return Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
  }

  function maybeRecover(entry, force = false) {
    if (!engaged || recovering || !entry?.container?.isConnected) return;
    const rect = entry.container.getBoundingClientRect();
    const viewportHeight = win.innerHeight || doc.documentElement.clientHeight || 768;
    const minimumVisible = Math.min(110, Math.max(48, (rect.height || 240) * 0.2));
    if (!force && visiblePixels(rect, viewportHeight) >= minimumVisible) return;
    if (visiblePixels(rect, viewportHeight) >= minimumVisible && force) return;
    if (typeof entry.container.scrollIntoView !== "function") return;
    recovering = true;
    entry.container.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    win.setTimeout(() => { recovering = false; scheduleSync(false); }, 260);
  }

  function updatePinnedSubmit(entry) {
    const viewportHeight = win.innerHeight || doc.documentElement.clientHeight || 768;
    const finaleRect = entry.container.getBoundingClientRect();
    const finaleVisible = visiblePixels(finaleRect, viewportHeight) > 48;
    const submitArea = doc.getElementById("studentSubmitArea");
    if (!finaleVisible || !submitArea) {
      doc.body.classList.remove(PIN_CLASS);
      return;
    }
    // The submit area itself stays in document flow even when only its button is pinned,
    // so this measurement cannot oscillate between fixed and non-fixed layouts.
    const submitRect = submitArea.getBoundingClientRect();
    const normallyVisible = submitRect.top >= 0 && submitRect.top <= viewportHeight - 72 && submitRect.bottom > 0;
    doc.body.classList.toggle(PIN_CLASS, !normallyVisible);
  }

  function attachCurrent(found) {
    if (current?.list === found.list) return;
    detachCurrent();
    const entry = { ...found };

    const ownsFinaleRow = event => {
      const node = eventElement(event);
      return Boolean(node?.closest?.(".sortItem") && entry.list.contains(node.closest(".sortItem")));
    };
    const markEngaged = () => { engaged = true; };
    const blockGesture = event => {
      if (!active() || !ownsFinaleRow(event)) return;
      markEngaged();
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      scheduleSync(true);
    };

    entry.onDragStart = blockGesture;
    entry.onTouchMove = blockGesture;
    entry.onWheel = blockGesture;
    entry.onPointerDown = event => {
      if (!active() || !ownsFinaleRow(event)) return;
      markEngaged();
      scheduleSync(false);
    };
    entry.onClick = event => {
      if (!active()) return;
      const node = eventElement(event);
      if (!node?.closest?.(".sortButtons button, button.iconButton.up, button.iconButton.down")) return;
      markEngaged();
      win.setTimeout(() => scheduleSync(true), 0);
    };

    entry.list.addEventListener("dragstart", entry.onDragStart, true);
    entry.list.addEventListener("touchmove", entry.onTouchMove, { capture: true, passive: false });
    entry.list.addEventListener("wheel", entry.onWheel, { capture: true, passive: false });
    entry.list.addEventListener("pointerdown", entry.onPointerDown, true);
    entry.list.addEventListener("click", entry.onClick, true);
    current = entry;
  }

  function sync(shouldRecover = false) {
    if (!active()) {
      clearState();
      return;
    }
    const found = findFinale(doc);
    if (!found) {
      clearState();
      return;
    }
    attachCurrent(found);
    doc.body.classList.add(BODY_CLASS);
    ensureRows(current);
    updatePinnedSubmit(current);
    maybeRecover(current, shouldRecover);
  }

  function scheduleSync(shouldRecover = false) {
    recoverRequested ||= shouldRecover;
    if (raf) return;
    raf = requestFrame(() => {
      raf = 0;
      const recover = recoverRequested;
      recoverRequested = false;
      sync(recover);
    });
  }

  const onScroll = () => scheduleSync(engaged);
  const onResize = () => scheduleSync(false);
  win.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("resize", onResize, { passive: true });

  if (win.MutationObserver) {
    observer = new win.MutationObserver(() => scheduleSync(false));
    observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  sync(false);

  return () => {
    if (raf) cancelFrame(raf);
    raf = 0;
    observer?.disconnect();
    win.removeEventListener("scroll", onScroll);
    win.removeEventListener("resize", onResize);
    clearState();
    delete doc.documentElement.dataset.gcTutorialOrderingGuardInstalled;
  };
}
