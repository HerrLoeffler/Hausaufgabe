let queue = [];
let currentItem = null;
let launching = false;
let autoApplying = false;
let syncQueued = false;
const pendingReview = new Map();

function escapeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compactText(value, max = 74) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function editorIsOpen() {
  const view = document.getElementById("editorView");
  return Boolean(view && !view.classList.contains("hidden"));
}

function allQuestionCards() {
  return [...document.querySelectorAll("#editorView .questionCard")];
}

function cardById(id) {
  if (!id) return null;
  return allQuestionCards().find(card => card.dataset.id === id) || null;
}

function sourceMeta(button) {
  const card = button?.closest(".questionCard");
  const index = Number(card?.dataset.index);
  if (!card || !Number.isInteger(index) || index < 0) return null;
  const field = card.querySelector(".qText");
  return {
    quizId: document.getElementById("editorView")?.dataset.quizId || "",
    ownerId: document.getElementById("editorView")?.dataset.ownerId || "",
    id: String(card.dataset.id || ""),
    position: index + 1,
    text: compactText(field?.value || "")
  };
}

function progressHost() {
  const host = document.getElementById("variantBackgroundProgress");
  return host && !host.classList.contains("hidden") && host.textContent.trim() ? host : null;
}

function progressState(host = progressHost()) {
  if (!host) return { running: false, ready: 0, failed: false, pending: false };
  const running = host.dataset.running === "true";
  const apply = host.querySelector(".applyVariants");
  const ready = apply ? Math.max(0, Number(host.dataset.ready) || 0) : 0;
  const discard = host.querySelector(".discardVariants");
  const failed = !running && ready === 0 && Boolean(discard);
  return { running, ready, failed, pending: running || ready > 0 };
}

function outlineForCard(card) {
  const index = Number(card?.dataset.index);
  if (!Number.isInteger(index) || index < 0) return null;
  return document.querySelector(`#questionOutline [data-position="${index + 1}"]`);
}

function clearOutlineState() {
  document.querySelectorAll("#questionOutline .variantWorkingOutline, #questionOutline .variantQueuedOutline, #questionOutline .variantReviewOutline")
    .forEach(node => node.classList.remove("variantWorkingOutline", "variantQueuedOutline", "variantReviewOutline"));
}

function markOutlineState() {
  clearOutlineState();

  if (currentItem && itemInCurrentEditor(currentItem)) {
    const card = cardById(currentItem.id);
    const outline = outlineForCard(card);
    if (outline) {
      outline.classList.add("variantWorkingOutline");
      outline.title = "KI erstellt gerade Variante(n) zu dieser Aufgabe";
    }
  }

  queue.filter(itemInCurrentEditor).forEach(item => {
    const outline = outlineForCard(cardById(item.id));
    if (outline && !outline.classList.contains("variantWorkingOutline")) {
      outline.classList.add("variantQueuedOutline");
      outline.title = "Variante(n) vorgemerkt";
    }
  });

  pendingReview.forEach((item, id) => {
    if (!itemInCurrentEditor(item)) return;
    const outline = outlineForCard(cardById(id));
    if (outline) {
      outline.classList.add("variantReviewOutline");
      outline.title = "Neue KI-Variante prüfen";
    }
  });
}

function reservedVariantCount() {
  const queued = queue.filter(itemInCurrentEditor).reduce((sum, item) => sum + Number(item.count || 0), 0);
  const active = itemInCurrentEditor(currentItem) ? Number(currentItem.count || 0) : 0;
  return queued + active;
}

function maxVariantsAvailable() {
  return Math.max(0, Math.min(5, 100 - allQuestionCards().length - reservedVariantCount()));
}

function closeDialog(dialog) {
  try { dialog.close(); } catch (_) { dialog.removeAttribute("open"); }
}

function openRequestDialog(button) {
  const meta = sourceMeta(button);
  if (!meta) return;
  const available = maxVariantsAvailable();
  if (available < 1) {
    window.alert("Ein Test kann höchstens 100 Aufgaben enthalten.");
    return;
  }

  document.querySelector("dialog.variantRequestDialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "shareDialog variantRequestDialog";
  dialog.setAttribute("aria-labelledby", "variantRequestTitle");
  dialog.innerHTML = `
    <form class="stack compact">
      <div class="variantRequestHead"><div><h2 id="variantRequestTitle">Varianten hinzufügen</h2><span>Aufgabe ${meta.position}</span></div><button type="button" class="variantRequestClose" aria-label="Schließen">×</button></div>
      <label>Anzahl<select name="count">${Array.from({ length: available }, (_, i) => `<option value="${i + 1}">${i + 1} ${i === 0 ? "Variante" : "Varianten"}</option>`).join("")}</select></label>
      <label>Bild<select name="mediaKind"><option value="none">Ohne Bild</option><option value="ai_generated">Mit Bild</option></select></label>
      <label>Eigener Wunsch <span class="optionalLabel">optional</span><textarea name="instruction" rows="2" maxlength="1200" placeholder="z. B. andere Wörter, neuer Kontext, schwieriger …"></textarea></label>
      <div class="actions variantRequestActions"><button type="button" class="button ghost variantRequestCancel">Abbrechen</button><button type="submit" class="button primary">Erstellen</button></div>
    </form>`;
  document.body.appendChild(dialog);

  const cancel = () => closeDialog(dialog);
  dialog.querySelector(".variantRequestClose")?.addEventListener("click", cancel);
  dialog.querySelector(".variantRequestCancel")?.addEventListener("click", cancel);
  dialog.addEventListener("cancel", event => {
    // The mandatory Crew tour owns the modal while it is active.
    if (document.body.classList.contains("gcRealTourActive")) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    cancel();
  });
  dialog.addEventListener("close", () => dialog.remove());
  dialog.querySelector("form")?.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const item = {
      ...meta,
      count: Number(form.elements.count.value),
      mediaKind: String(form.elements.mediaKind.value || "none"),
      instruction: String(form.elements.instruction.value || "").trim(),
      queuedAt: Date.now(),
      launchAttempts: 0
    };
    queue.push(item);
    document.dispatchEvent(new CustomEvent("gradecrew:variant-submitted", { detail: { dialog, item } }));
    closeDialog(dialog);
    scheduleSync();
  });

  try { dialog.showModal(); } catch (_) { dialog.setAttribute("open", ""); }
  document.dispatchEvent(new CustomEvent("gradecrew:variant-dialog-opened", { detail: { dialog, meta } }));
}

function itemInCurrentEditor(item) {
  const view = document.getElementById("editorView");
  return Boolean(item && item.quizId === view?.dataset.quizId && item.ownerId === view?.dataset.ownerId);
}

function launchItem(item) {
  if (!itemInCurrentEditor(item) || !cardById(item.id)) return false;
  currentItem = { ...item, startedAt: Date.now(), phase: "submitted" };
  const request = { ...item, accepted: false };
  document.dispatchEvent(new CustomEvent("gradecrew:variant-request", { detail: request }));
  if (!request.accepted) currentItem = null;
  return request.accepted;
}

async function processQueue() {
  if (launching || currentItem || !queue.length || !editorIsOpen()) return;
  if (progressState().pending) return;

  launching = true;
  const nextIndex = queue.findIndex(itemInCurrentEditor);
  if (nextIndex < 0) { launching = false; return; }
  const [item] = queue.splice(nextIndex, 1);
  item.launchAttempts = Number(item.launchAttempts || 0) + 1;
  markOutlineState();
  const launched = await launchItem(item);
  launching = false;

  if (!launched && item.launchAttempts < 3 && cardById(item.id)) {
    queue.unshift(item);
    window.setTimeout(scheduleSync, 250);
  }
  scheduleSync();
}

function decorateProgress() {
  const host = progressHost();
  if (!host) return;
  host.classList.toggle("gradecrewManagedVariant", Boolean(currentItem));
  if (currentItem) host.setAttribute("aria-label", `KI erstellt Varianten zu Aufgabe ${currentItem.position}`);
}

function captureInsertedVariants(beforeIds, item, expectedCount) {
  const added = allQuestionCards().filter(card => card.dataset.id && !beforeIds.has(card.dataset.id));
  added.slice(0, expectedCount).forEach(card => {
    pendingReview.set(card.dataset.id, {
      quizId: item.quizId,
      ownerId: item.ownerId,
      sourceId: item.id,
      sourcePosition: item.position,
      createdAt: Date.now()
    });
  });
}

function autoFinishCurrent() {
  if (!currentItem || autoApplying || !editorIsOpen() || !itemInCurrentEditor(currentItem)) return;
  // During the guided tour the learner must explicitly click "Variante übernehmen".
  if (document.body.classList.contains("gcRealTourActive")) return;
  const host = progressHost();
  const status = progressState(host);

  if (status.running) {
    currentItem.phase = "running";
    return;
  }

  if (status.ready > 0 && host) {
    const apply = host.querySelector(".applyVariants");
    if (!apply) return;
    const sourceStillExists = Boolean(cardById(currentItem.id));
    if (!sourceStillExists) {
      host.querySelector(".discardVariants")?.click();
      currentItem = null;
      scheduleSync();
      return;
    }

    autoApplying = true;
    const item = currentItem;
    const beforeIds = new Set(allQuestionCards().map(card => card.dataset.id).filter(Boolean));
    const ready = status.ready;
    apply.click();
    window.setTimeout(() => {
      if (currentItem !== item || !itemInCurrentEditor(item)) { autoApplying = false; return; }
      captureInsertedVariants(beforeIds, item, ready);
      currentItem = null;
      autoApplying = false;
      scheduleSync();
    }, 120);
    return;
  }

  if (status.failed && host) {
    host.querySelector(".discardVariants")?.click();
    currentItem = null;
    scheduleSync();
    return;
  }

  if (!host && currentItem.phase === "running" && Date.now() - currentItem.startedAt > 250) {
    currentItem = null;
    scheduleSync();
  }
}

function decorateReviewCard(card, id) {
  if (card.querySelector(".variantReviewBar")) return;
  const bar = document.createElement("div");
  bar.className = "variantReviewBar";
  bar.innerHTML = `<span>Neue KI-Variante</span><div><button type="button" class="variantKeep">✓ Behalten</button><button type="button" class="variantEdit">Ändern</button><button type="button" class="variantRemove">Entfernen</button></div>`;
  const top = card.querySelector(".questionTop");
  top?.after(bar);

  bar.querySelector(".variantKeep")?.addEventListener("click", () => {
    const item = pendingReview.get(id);
    pendingReview.delete(id);
    bar.remove();
    document.dispatchEvent(new CustomEvent("gradecrew:variant-kept", { detail: { ...item, id } }));
    scheduleSync();
  });
  bar.querySelector(".variantEdit")?.addEventListener("click", () => card.querySelector(".aiEditQuestion")?.click());
  bar.querySelector(".variantRemove")?.addEventListener("click", () => {
    card.querySelector(".deleteQuestion")?.click();
    window.setTimeout(() => {
      if (!cardById(id)) pendingReview.delete(id);
      scheduleSync();
    }, 80);
  });
}

function decoratePendingReviews() {
  pendingReview.forEach((item, id) => {
    if (!itemInCurrentEditor(item)) return;
    const card = cardById(id);
    if (card) decorateReviewCard(card, id);
  });
}

function scheduleSync() {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
    syncQueued = false;
    decorateProgress();
    decoratePendingReviews();
    markOutlineState();
    autoFinishCurrent();
    void processQueue();
  });
}

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const variantButton = target.closest(".aiVariantQuestion");
  if (!variantButton || variantButton.disabled || !sourceMeta(variantButton)?.quizId || document.getElementById("editorView")?.dataset.variantAllowed === "false") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openRequestDialog(variantButton);
}, true);

document.addEventListener("gradecrew:account-changed", () => {
  queue = [];
  currentItem = null;
  pendingReview.clear();
  scheduleSync();
});

const observer = new MutationObserver(() => scheduleSync());
function start() {
  // Observe only the three small surfaces this enhancement owns. A full-body
  // subtree observer caused unnecessary work in earlier staging builds.
  for (const id of ["variantBackgroundProgress", "questionList", "questionOutline"]) {
    const node = document.getElementById(id);
    if (node) observer.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "data-running", "data-ready"] });
  }
  scheduleSync();
}

if (document.body) start();
else document.addEventListener("DOMContentLoaded", start, { once: true });