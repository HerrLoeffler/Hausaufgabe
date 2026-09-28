let tutorialItem = null;
let fallbackBusy = false;

function tourActive() {
  return document.body?.classList.contains("gcRealTourActive");
}

function cards() {
  return [...document.querySelectorAll("#editorView .questionCard")];
}

function cardById(id) {
  return cards().find(card => card.dataset.id === id) || null;
}

function newCardSince(beforeIds) {
  return cards().find(card => card.dataset.id && !beforeIds.has(card.dataset.id)) || null;
}

function dispatchInput(input, value) {
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function catFigure() {
  const figure = document.createElement("figure");
  figure.className = "gcTutorialCatFigure";
  figure.innerHTML = '<img src="/assets/gradecrew/demo-cat.svg" alt="Sehr niedliche orangefarbene Katze"><figcaption>Katze-Variante · Tutorial-Bild</figcaption>';
  return figure;
}

function decorateCatCard(card) {
  if (!card?.isConnected) return;
  if (!card.querySelector(".gcTutorialCatFigure")) {
    const grid = card.querySelector(".questionGrid");
    grid?.insertAdjacentElement("afterend", catFigure());
  }
}

function addReviewBar(card, item) {
  if (!card?.isConnected || card.querySelector(".variantReviewBar")) return;
  const bar = document.createElement("div");
  bar.className = "variantReviewBar gcTutorialFallbackReview";
  bar.innerHTML = '<span>Neue KI-Variante</span><div><button type="button" class="variantKeep">✓ Behalten</button><button type="button" class="variantEdit">Ändern</button><button type="button" class="variantRemove">Entfernen</button></div>';
  card.querySelector(".questionTop")?.after(bar);

  bar.querySelector(".variantKeep")?.addEventListener("click", () => {
    bar.remove();
    document.dispatchEvent(new CustomEvent("gradecrew:variant-kept", {
      detail: {
        quizId: item?.quizId || "",
        ownerId: item?.ownerId || "",
        sourceId: item?.id || "",
        sourcePosition: item?.position || 6,
        id: card.dataset.id || ""
      }
    }));
  });
  bar.querySelector(".variantEdit")?.addEventListener("click", () => card.querySelector(".aiEditQuestion")?.click());
  bar.querySelector(".variantRemove")?.addEventListener("click", () => card.querySelector(".deleteQuestion")?.click());
}

function setCatQuestion(card) {
  if (!card?.isConnected) return null;

  dispatchInput(card.querySelector(".qText"), 'Choose the English word for „Katze“.');

  const rows = [...card.querySelectorAll(".optionRow")];
  const labels = ["dog", "bird", "cat"];
  rows.slice(0, 3).forEach((row, index) => {
    const text = row.querySelector('input:not([type="radio"]):not([type="checkbox"])');
    if (text) {
      text.value = labels[index];
      text.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  const third = rows[2]?.querySelector('input[type="radio"], input[type="checkbox"]');
  if (third) {
    third.checked = true;
    third.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const id = card.dataset.id;
  return id ? cardById(id) : card;
}

async function duplicatePreparedVariant(item, beforeIds) {
  if (fallbackBusy || !tourActive()) return null;
  fallbackBusy = true;
  try {
    const source = cardById(item?.id);
    const duplicate = source?.querySelector(".duplicateQuestion");
    if (!source || !duplicate) return null;

    // The normal tutorial result is deterministic. If the background variant
    // pipeline did not insert it, duplicate the source through the real editor
    // action so the new question is also present in GradeCrew's internal state.
    duplicate.click();
    await new Promise(resolve => setTimeout(resolve, 40));
    let card = newCardSince(beforeIds);
    if (!card) return null;

    card = setCatQuestion(card) || card;
    await new Promise(resolve => setTimeout(resolve, 40));
    card = cardById(card.dataset.id) || card;
    decorateCatCard(card);
    addReviewBar(card, item);
    card.dataset.tutorialVariantFallback = "true";
    card.scrollIntoView?.({ block: "center", behavior: "smooth" });
    return card;
  } finally {
    fallbackBusy = false;
  }
}

function ensureExistingTutorialVariant(item, beforeIds) {
  const added = newCardSince(beforeIds);
  if (!added) return null;
  decorateCatCard(added);
  return added;
}

document.addEventListener("gradecrew:variant-submitted", event => {
  if (!tourActive()) return;
  tutorialItem = event.detail?.item || null;
});

document.addEventListener("click", event => {
  if (!tourActive() || fallbackBusy || !tutorialItem) return;
  const target = event.target instanceof Element ? event.target : null;
  const apply = target?.closest("#variantBackgroundProgress .applyVariants");
  if (!apply) return;

  const item = tutorialItem;
  const beforeIds = new Set(cards().map(card => card.dataset.id).filter(Boolean));

  // Let the real apply handler run first. If it succeeds, we only decorate the
  // inserted card. If it fails to insert anything, create the fixed tutorial
  // result through the editor's own duplicate action as a reliable fallback.
  window.setTimeout(async () => {
    if (!tourActive()) return;
    const existing = ensureExistingTutorialVariant(item, beforeIds);
    if (existing) {
      tutorialItem = null;
      return;
    }
    const inserted = await duplicatePreparedVariant(item, beforeIds);
    if (inserted) tutorialItem = null;
  }, 220);
}, true);

document.addEventListener("gradecrew:account-changed", () => {
  tutorialItem = null;
  fallbackBusy = false;
});
