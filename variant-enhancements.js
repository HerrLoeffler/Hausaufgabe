const ORIGIN_KEY = "gradecrew.variantOrigin.v1";
let origin = readOrigin();
let attentionTimer = null;

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
  const pending = running || ready > 0 || Boolean(host.querySelector(".discardVariants"));
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
  return { position: index + 1, text: compactText(text), createdAt: Date.now() };
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

function jumpToOrigin() {
  if (!origin) return;
  const outline = document.querySelector(`#questionOutline [data-position="${origin.position}"]`);
  if (outline instanceof HTMLElement) {
    outline.click();
  } else {
    document.querySelector(`#editorView .questionCard[data-index="${origin.position - 1}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
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

function escapeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureBlockedHint(host, running) {
  let hint = host.querySelector(".variantPendingHint");
  if (!hint) {
    hint = document.createElement("div");
    hint.className = "variantPendingHint";
    host.appendChild(hint);
  }
  hint.textContent = running
    ? "Für diesen Test läuft bereits eine Varianten-Erstellung. Warte kurz, bis sie abgeschlossen ist."
    : "Es warten noch fertige Varianten. Übernimm oder verwerfe sie zuerst; danach kannst du bei jeder Aufgabe neue Varianten starten.";
}

function drawAttention(host, running) {
  ensureBlockedHint(host, running);
  host.classList.add("variantProgressAttention");
  host.scrollIntoView({ behavior: "smooth", block: "center" });
  if (attentionTimer) window.clearTimeout(attentionTimer);
  attentionTimer = window.setTimeout(() => host.classList.remove("variantProgressAttention"), 1800);
}

function decorateDialog() {
  const dialogs = [...document.querySelectorAll("dialog.shareDialog")];
  const dialog = dialogs.find(node => node.querySelector("h2")?.textContent?.trim() === "Varianten hinzufügen");
  if (!dialog || dialog.querySelector(".variantDialogOrigin") || !origin) return;
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
}

function blockPrematureApply(event, button) {
  const host = button.closest("#variantBackgroundProgress");
  const status = progressState(host);
  if (!status.running) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  drawAttention(host, true);
  return true;
}

function handleVariantClick(event, button) {
  const host = progressHost();
  const status = progressState(host);
  if (host && status.pending) {
    event.preventDefault();
    event.stopImmediatePropagation();
    drawAttention(host, status.running);
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
  }, 60);
}

function handleDiscard() {
  window.setTimeout(() => {
    if (!progressHost()) saveOrigin(null);
    decorateProgress();
  }, 30);
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
});

function start() {
  if (!document.getElementById("gradecrewVariantEnhancementStyles")) {
    const style = document.createElement("style");
    style.id = "gradecrewVariantEnhancementStyles";
    style.textContent = `
#variantBackgroundProgress .variantOriginMeta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:5px;font-size:11px;color:#667085}
#variantBackgroundProgress .variantOriginMeta>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:min(620px,70vw)}
#variantBackgroundProgress .variantOriginMeta>span strong{font-size:inherit;color:#344054}
#variantBackgroundProgress .variantOriginJump{border:0;background:transparent;color:#2457c5;font:inherit;font-weight:750;cursor:pointer;padding:2px 0}
#variantBackgroundProgress .variantPendingHint{flex-basis:100%;margin-top:7px;padding:7px 9px;border-radius:9px;background:#f7f9fc;color:#59677b;font-size:11px;line-height:1.35}
#variantBackgroundProgress.variantProgressAttention{outline:3px solid rgba(47,111,237,.18);outline-offset:3px;transition:outline-color .2s}
#questionOutline .questionOutlineItem.variantSourceOutline{position:relative;border-color:#6f95e8;box-shadow:0 0 0 2px rgba(47,111,237,.12)}
#questionOutline .questionOutlineItem.variantSourceOutline::after{content:"";position:absolute;right:3px;top:3px;width:5px;height:5px;border-radius:50%;background:#2f6fed}
#questionOutline .questionOutlineItem.variantAcceptedOutline{background:#eef4ff;border-color:#2f6fed}
#editorView .questionCard.variantSourceCard{box-shadow:inset 3px 0 0 rgba(47,111,237,.38)}
#editorView .questionCard.variantOriginFlash{animation:variantOriginFlash 1.8s ease-out}
.variantDialogOrigin{margin:-2px 0 3px;padding:8px 10px;border-radius:9px;background:#f6f8fb;color:#59677b;font-size:11px;line-height:1.35}
@keyframes variantOriginFlash{0%,35%{box-shadow:0 0 0 4px rgba(47,111,237,.18)}100%{box-shadow:0 0 0 0 rgba(47,111,237,0)}}
`;
    document.head.appendChild(style);
  }
  decorateDialog();
  decorateProgress();
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.body) start();
else document.addEventListener("DOMContentLoaded", start, { once: true });
