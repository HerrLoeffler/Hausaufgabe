const ORIGIN_KEY = "gradecrew.variantOrigin.v1";
let origin = readOrigin();
let attentionTimer = null;
let queue = [];
let launchingQueued = false;
let autoLaunching = false;

function readOrigin() {
  try {
    const raw = sessionStorage.getItem(ORIGIN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Number.isInteger(parsed.position) ? parsed : null;
  } catch (_) {
    return null;
  }
}

function saveOrigin(next) {
  origin = next;
  try {
    if (next) sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(ORIGIN_KEY);
  } catch (_) {}
}

function compactText(value, max = 82) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function escapeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function progressHost() {
  const host = document.getElementById("variantBackgroundProgress");
  return host && !host.classList.contains("hidden") && host.textContent.trim() ? host : null;
}

function progressState(host = progressHost()) {
  if (!host) return { running: false, ready: 0, pending: false };
  const message = host.querySelector("strong")?.textContent || "";
  const running = /wird erstellt|wird geprüft|werden erstellt/i.test(message);
  const apply = host.querySelector(".applyVariants");
  const ready = apply ? Math.max(0, Number.parseInt(apply.textContent, 10) || 0) : 0;
  // A failed task with zero ready variants must not block the next queued request.
  const pending = running || ready > 0;
  return { running, ready, pending };
}

function questionMeta(button) {
  const card = button?.closest(".questionCard");
  const index = Number(card?.dataset.index);
  if (!card || !Number.isInteger(index) || index < 0) return null;
  const field = card.querySelector(".qText");
  const heading = card.querySelector(".questionTop strong, .questionTop h3, h3");
  const text = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
    ? field.value
    : heading?.textContent || "";
  return {
    id: String(card.dataset.id || ""),
    position: index + 1,
    text: compactText(text),
    createdAt: Date.now()
  };
}

function clearOutlineMarks() {
  document.querySelectorAll("#questionOutline .variantSourceOutline").forEach(node => node.classList.remove("variantSourceOutline"));
  document.querySelectorAll("#editorView .questionCard.variantSourceCard").forEach(node => node.classList.remove("variantSourceCard"));
}

function markOrigin() {
  clearOutlineMarks();
  if (!origin) return;
  const outline = document.querySelector(`#questionOutline [data-position="${origin.position}"]`);
  if (outline) {
    outline.classList.add("variantSourceOutline");
    outline.title = `Ausgangsaufgabe für Varianten · Aufgabe ${origin.position}`;
  }
  const card = document.querySelector(`#editorView .questionCard[data-index="${origin.position - 1}"]`);
  card?.classList.add("variantSourceCard");
}

function markQueuedOutlines() {
  document.querySelectorAll("#questionOutline .variantQueuedOutline").forEach(node => node.classList.remove("variantQueuedOutline"));
  queue.forEach(item => {
    const card = item.id ? document.querySelector(`#editorView .questionCard[data-id="${CSS.escape(item.id)}"]`) : null;
    const position = card ? Number(card.dataset.index) + 1 : item.position;
    document.querySelector(`#questionOutline [data-position="${position}"]`)?.classList.add("variantQueuedOutline");
  });
}

function jumpToOrigin() {
  if (!origin) return;
  const outline = document.querySelector(`#questionOutline [data-position="${origin.position}"]`);
  if (outline instanceof HTMLElement) outline.click();
  else document.querySelector(`#editorView .questionCard[data-index="${origin.position - 1}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  const card = document.querySelector(`#editorView .questionCard[data-index="${origin.position - 1}"]`);
  if (card) {
    card.classList.add("variantOriginFlash");
    window.setTimeout(() => card.classList.remove("variantOriginFlash"), 1800);
  }
}

function normalizeFinishedMessage(host, ready) {
  if (!ready) return;
  const strong = host.querySelector("strong");
  if (!strong) return;
  const message = strong.textContent || "";
  if (/\b(?:Variante|Varianten) (?:ist|sind) fertig\.?$/i.test(message) || /^\d+\s+Varianten?\s+sind?\s+fertig/i.test(message)) {
    strong.textContent = ready === 1 ? "1 Variante ist fertig." : `${ready} Varianten sind fertig.`;
  }
}

function ensureOriginMeta(host) {
  if (!origin || host.querySelector(".variantOriginMeta")) return;
  const meta = document.createElement("div");
  meta.className = "variantOriginMeta";
  meta.innerHTML = `<span>Ausgang: <strong>Aufgabe ${origin.position}</strong>${origin.text ? ` · ${escapeText(origin.text)}` : ""}</span><button type="button" class="variantOriginJump">Zur Aufgabe</button>`;
  const first = host.firstElementChild;
  if (first) first.after(meta);
  else host.prepend(meta);
  meta.querySelector(".variantOriginJump")?.addEventListener("click", jumpToOrigin);
}

function decorateDialog() {
  const dialogs = [...document.querySelectorAll("dialog.shareDialog")];
  const dialog = dialogs.find(node => node.querySelector("h2")?.textContent?.trim() === "Varianten hinzufügen");
  if (!dialog) return;
  dialog.classList.add("gradecrewVariantDialog");
  if (dialog.querySelector(".variantDialogOrigin") || !origin) return;
  const paragraph = dialog.querySelector("form > p");
  const note = document.createElement("div");
  note.className = "variantDialogOrigin";
  note.textContent = origin.text ? `Aufgabe ${origin.position}: ${origin.text}` : `Ausgangsaufgabe ${origin.position}`;
  paragraph?.after(note);
}

function decorateProgress() {
  const host = progressHost();
  if (!host) {
    clearOutlineMarks();
    renderQueuePanel();
    processQueue();
    return;
  }
  const status = progressState(host);
  const apply = host.querySelector(".applyVariants");
  if (apply instanceof HTMLElement) {
    apply.hidden = status.running;
    apply.setAttribute("aria-hidden", String(status.running));
  }
  if (!status.running) normalizeFinishedMessage(host, status.ready);
  ensureOriginMeta(host);
  markOrigin();
  renderQueuePanel();
  processQueue();
}

function queueAnchor() {
  return document.getElementById("variantBackgroundProgress") || document.querySelector("#editorView .questionList");
}

function ensureQueuePanel() {
  let panel = document.getElementById("variantQueuePanel");
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = "variantQueuePanel";
  panel.className = "variantQueuePanel hidden";
  const anchor = queueAnchor();
  if (anchor?.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
  return panel;
}

function renderQueuePanel() {
  const panel = ensureQueuePanel();
  if (!panel) return;
  markQueuedOutlines();
  if (!queue.length) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  panel.classList.remove("hidden");
  const status = progressState();
  panel.innerHTML = `<div class="variantQueueHead"><div><strong>Varianten-Warteschlange</strong><small>${queue.length} ${queue.length === 1 ? "Auftrag wartet" : "Aufträge warten"}${status.pending ? " · du kannst weiter prüfen" : ""}</small></div></div><div class="variantQueueItems">${queue.map((item, index) => `<div class="variantQueueItem"><span><b>Aufgabe ${item.position}</b>${item.text ? ` · ${escapeText(item.text)}` : ""}</span><span>${item.count}×</span><button type="button" data-queue-remove="${index}" aria-label="Aus Warteschlange entfernen">×</button></div>`).join("")}</div>${status.ready ? '<small class="variantQueueWaitHint">Übernimm oder verwirf zuerst die fertigen Varianten; danach läuft die Warteschlange automatisch weiter.</small>' : ""}`;
  panel.querySelectorAll("[data-queue-remove]").forEach(button => button.addEventListener("click", () => {
    queue.splice(Number(button.dataset.queueRemove), 1);
    renderQueuePanel();
  }));
}

function openQueueDialog(button) {
  const meta = questionMeta(button);
  if (!meta) return;
  const existing = document.querySelector("dialog.variantQueueDialog");
  existing?.remove();
  const maxCount = Math.max(1, Math.min(5, 100 - document.querySelectorAll("#editorView .questionCard").length));
  const dialog = document.createElement("dialog");
  dialog.className = "shareDialog variantQueueDialog";
  dialog.innerHTML = `<form class="stack compact"><h2>Variante vormerken</h2><p>Aufgabe ${meta.position} wird in die Warteschlange gelegt. Du kannst sofort weiter durch den Test gehen.</p><div class="variantDialogOrigin">${meta.text ? escapeText(meta.text) : `Aufgabe ${meta.position}`}</div><label>Anzahl<select name="count">${Array.from({ length: maxCount }, (_, i) => `<option value="${i + 1}">${i + 1} ${i ? "Varianten" : "Variante"}</option>`).join("")}</select></label><label>Bilder<select name="mediaKind"><option value="none">Ohne Bild</option><option value="ai_generated">Mit Bild zur Aufgabe</option></select></label><label>Eigener Wunsch <span class="optionalLabel">optional</span><textarea name="instruction" rows="3" maxlength="1200" placeholder="z. B. andere Wörter, neuer Kontext, schwieriger …"></textarea></label><div class="actions"><button type="button" class="button ghost queueCancel">Abbrechen</button><button type="submit" class="button primary">In Warteschlange</button></div></form>`;
  document.body.appendChild(dialog);
  dialog.querySelector(".queueCancel")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.querySelector("form")?.addEventListener("submit", event => {
    event.preventDefault();
    queue.push({ ...meta, count: Number(event.currentTarget.elements.count.value), mediaKind: event.currentTarget.elements.mediaKind.value, instruction: String(event.currentTarget.elements.instruction.value || "").trim() });
    dialog.close();
    renderQueuePanel();
    processQueue();
  });
  try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
}

function findQueuedSource(item) {
  if (item.id) {
    const card = document.querySelector(`#editorView .questionCard[data-id="${CSS.escape(item.id)}"]`);
    const button = card?.querySelector(".aiVariantQuestion");
    if (button) return button;
  }
  return document.querySelector(`#editorView .questionCard[data-index="${Math.max(0, item.position - 1)}"] .aiVariantQuestion`);
}

function waitForRealVariantDialog(attempt = 0) {
  return new Promise(resolve => {
    const dialog = [...document.querySelectorAll("dialog.shareDialog")].find(node => node.querySelector("h2")?.textContent?.trim() === "Varianten hinzufügen");
    if (dialog || attempt >= 12) return resolve(dialog || null);
    window.setTimeout(() => resolve(waitForRealVariantDialog(attempt + 1)), 35);
  });
}

async function launchQueuedItem(item) {
  const button = findQueuedSource(item);
  if (!button) return false;
  const currentMeta = questionMeta(button);
  if (currentMeta) saveOrigin(currentMeta);
  autoLaunching = true;
  button.click();
  const dialog = await waitForRealVariantDialog();
  autoLaunching = false;
  if (!dialog) return false;
  const form = dialog.querySelector("form");
  if (!form) return false;
  if (form.elements.count) form.elements.count.value = String(item.count);
  if (form.elements.mediaKind) form.elements.mediaKind.value = item.mediaKind;
  if (form.elements.variantInstruction) form.elements.variantInstruction.value = item.instruction || "";
  form.requestSubmit();
  return true;
}

async function processQueue() {
  if (launchingQueued || !queue.length) return;
  if (progressState().pending) return;
  launchingQueued = true;
  const item = queue.shift();
  renderQueuePanel();
  const launched = await launchQueuedItem(item);
  if (!launched) queue.unshift(item);
  launchingQueued = false;
  renderQueuePanel();
}

function blockPrematureApply(event, button) {
  const host = button.closest("#variantBackgroundProgress");
  const status = progressState(host);
  if (!status.running) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  host.classList.add("variantProgressAttention");
  host.scrollIntoView({ behavior: "smooth", block: "center" });
  if (attentionTimer) window.clearTimeout(attentionTimer);
  attentionTimer = window.setTimeout(() => host.classList.remove("variantProgressAttention"), 1800);
  return true;
}

function handleVariantClick(event, button) {
  if (autoLaunching) {
    const next = questionMeta(button);
    if (next) saveOrigin(next);
    return;
  }
  const status = progressState();
  if (status.pending || queue.length || launchingQueued) {
    event.preventDefault();
    event.stopImmediatePropagation();
    openQueueDialog(button);
    return;
  }
  const next = questionMeta(button);
  if (next) saveOrigin(next);
  window.setTimeout(() => {
    decorateDialog();
    decorateProgress();
  }, 0);
}

function handleApply(button) {
  const host = button.closest("#variantBackgroundProgress");
  const ready = progressState(host).ready;
  const sourcePosition = origin?.position || null;
  window.setTimeout(() => {
    if (sourcePosition) {
      const firstVariant = document.querySelector(`#editorView .questionCard[data-index="${sourcePosition}"]`);
      const target = firstVariant || document.querySelector(`#editorView .questionCard[data-index="${sourcePosition - 1}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      const outline = document.querySelector(`#questionOutline [data-position="${sourcePosition + (firstVariant ? 1 : 0)}"]`);
      outline?.classList.add("variantAcceptedOutline");
      target?.classList.add("variantOriginFlash");
      window.setTimeout(() => {
        outline?.classList.remove("variantAcceptedOutline");
        target?.classList.remove("variantOriginFlash");
      }, 2200);
    }
    if (!progressHost() || ready === 0) saveOrigin(null);
    decorateProgress();
    processQueue();
  }, 80);
}

function handleDiscard() {
  window.setTimeout(() => {
    if (!progressHost()) saveOrigin(null);
    decorateProgress();
    processQueue();
  }, 60);
}

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const apply = target.closest(".applyVariants");
  if (apply && blockPrematureApply(event, apply)) return;
  const variant = target.closest(".aiVariantQuestion");
  if (variant) {
    handleVariantClick(event, variant);
    return;
  }
  if (apply) handleApply(apply);
  if (target.closest(".discardVariants")) handleDiscard();
}, true);

const observer = new MutationObserver(() => {
  decorateDialog();
  decorateProgress();
  renderQueuePanel();
});

function start() {
  if (!document.getElementById("gradecrewVariantEnhancementStyles")) {
    const style = document.createElement("style");
    style.id = "gradecrewVariantEnhancementStyles";
    style.textContent = `
dialog.shareDialog.gradecrewVariantDialog,dialog.shareDialog.variantQueueDialog{position:fixed!important;inset:0!important;margin:auto!important;max-height:calc(100dvh - 32px)!important;overflow:auto!important}
#variantBackgroundProgress .variantOriginMeta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:5px;font-size:11px;color:#667085}
#variantBackgroundProgress .variantOriginMeta>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:min(620px,70vw)}
#variantBackgroundProgress .variantOriginMeta>span strong{font-size:inherit;color:#344054}
#variantBackgroundProgress .variantOriginJump{border:0;background:transparent;color:#2457c5;font:inherit;font-weight:750;cursor:pointer;padding:2px 0}
#variantBackgroundProgress.variantProgressAttention{outline:3px solid rgba(47,111,237,.18);outline-offset:3px;transition:outline-color .2s}
#questionOutline .questionOutlineItem.variantSourceOutline{position:relative;border-color:#6f95e8;box-shadow:0 0 0 2px rgba(47,111,237,.12)}
#questionOutline .questionOutlineItem.variantSourceOutline::after{content:"";position:absolute;right:3px;top:3px;width:5px;height:5px;border-radius:50%;background:#2f6fed}
#questionOutline .questionOutlineItem.variantQueuedOutline{position:relative;background:#f8fbff;border-color:#bfd1f5}
#questionOutline .questionOutlineItem.variantQueuedOutline::before{content:"";position:absolute;left:3px;top:3px;width:5px;height:5px;border-radius:50%;border:1px solid #2f6fed;background:#fff}
#questionOutline .questionOutlineItem.variantAcceptedOutline{background:#eef4ff;border-color:#2f6fed}
#editorView .questionCard.variantSourceCard{box-shadow:inset 3px 0 0 rgba(47,111,237,.38)}
#editorView .questionCard.variantOriginFlash{animation:variantOriginFlash 1.8s ease-out}
.variantDialogOrigin{margin:-2px 0 3px;padding:8px 10px;border-radius:9px;background:#f6f8fb;color:#59677b;font-size:11px;line-height:1.35}
.variantQueuePanel{margin:8px 0 12px;padding:10px 12px;border:1px solid #dce6f5;border-radius:12px;background:#fbfdff;box-shadow:0 5px 14px rgba(30,64,120,.04)}
.variantQueueHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.variantQueueHead>div{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.variantQueueHead strong{font-size:12px;color:#344054}.variantQueueHead small,.variantQueueWaitHint{font-size:10.5px;color:#7b8798}
.variantQueueItems{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.variantQueueItem{display:flex;align-items:center;gap:6px;max-width:100%;padding:5px 7px;border:1px solid #e1e8f2;border-radius:999px;background:#fff;font-size:10.5px;color:#657287}.variantQueueItem span:first-child{max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.variantQueueItem b{color:#344054}.variantQueueItem button{border:0;background:transparent;color:#98a2b3;cursor:pointer;padding:0 2px;font-size:15px;line-height:1}.variantQueueWaitHint{display:block;margin-top:7px}
.variantQueueDialog .optionalLabel{color:#7b8798;font-size:11px;font-weight:600}.variantQueueDialog textarea{min-height:76px}
@keyframes variantOriginFlash{0%,35%{box-shadow:0 0 0 4px rgba(47,111,237,.18)}100%{box-shadow:0 0 0 0 rgba(47,111,237,0)}}
`;
    document.head.appendChild(style);
  }
  decorateDialog();
  decorateProgress();
  renderQueuePanel();
  observer.observe(document.body, { childList: true, subtree: true });
  window.setInterval(processQueue, 700);
}

if (document.body) start();
else document.addEventListener("DOMContentLoaded", start, { once: true });
