let installed = false;
let polishTimer = 0;

function activeGuideParts() {
  const backdrop = document.getElementById("firstAiGuideBackdrop");
  const card = document.getElementById("firstAiGuideCard");
  const target = document.querySelector(".firstAiGuideSpotlight");
  const active = Boolean(backdrop && !backdrop.classList.contains("hidden") && card && !card.classList.contains("hidden"));
  return { active, backdrop, card, target };
}

function isAllowedNode(node, parts) {
  if (!(node instanceof Node)) return false;
  return Boolean(parts.card?.contains(node) || parts.target?.contains(node));
}

function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function blockOutsideGuide(event) {
  const parts = activeGuideParts();
  if (!parts.active || isAllowedNode(event.target, parts)) return;
  stopEvent(event);
}

function visibleFocusable(root) {
  if (!(root instanceof Element)) return [];
  const nodes = [];
  if (root.matches('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')) nodes.push(root);
  nodes.push(...root.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
  return nodes.filter(node => !node.disabled && node.getClientRects().length && getComputedStyle(node).visibility !== "hidden");
}

function guideFocusables(parts) {
  return [...visibleFocusable(parts.target), ...visibleFocusable(parts.card)];
}

function keepFocusInsideGuide(event) {
  const parts = activeGuideParts();
  if (!parts.active || isAllowedNode(event.target, parts)) return;
  const first = guideFocusables(parts)[0] || parts.card;
  first?.focus?.({ preventScroll: true });
}

function keepKeyboardInsideGuide(event) {
  const parts = activeGuideParts();
  if (!parts.active) return;

  if (event.key === "Tab") {
    const focusables = guideFocusables(parts);
    if (!focusables.length) return stopEvent(event);
    const current = focusables.indexOf(document.activeElement);
    let nextIndex;
    if (event.shiftKey) nextIndex = current <= 0 ? focusables.length - 1 : current - 1;
    else nextIndex = current < 0 || current >= focusables.length - 1 ? 0 : current + 1;
    stopEvent(event);
    focusables[nextIndex]?.focus({ preventScroll: true });
    return;
  }

  if (isAllowedNode(event.target, parts)) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (["Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
    stopEvent(event);
  }
}

function isElephantStep(card) {
  const eyebrow = card?.querySelector(".eyebrow")?.textContent || "";
  const title = card?.querySelector("h2")?.textContent || "";
  return /Schritt\s+[234]\s+von\s+4/i.test(eyebrow) || /KI-Test wird erstellt/i.test(title) || /Jetzt mit KI erstellen/i.test(title);
}

function polishGuideCopy() {
  polishTimer = 0;
  const { active, card } = activeGuideParts();
  if (!active || !card) return;

  // Cost information is an operator concern, not part of the teacher journey.
  card.querySelectorAll(".firstAiGuideCost").forEach(node => node.remove());

  const elephant = isElephantStep(card);
  const header = card.querySelector(".gradecrewGuideHeader");
  const image = header?.querySelector("img");
  const label = header?.querySelector("span");
  if (image) image.src = elephant ? "/assets/gradecrew/elephant-create.svg" : "/assets/gradecrew/penguin-guide.svg";
  if (label) label.textContent = elephant ? "Elefant · Erstellen" : "Deine Starthilfe";

  const title = card.querySelector("h2")?.textContent || "";
  const paragraph = card.querySelector("h2 + p");
  if (paragraph && /Wähle\s+[„\"]Mit KI erstellen/i.test(title)) {
    paragraph.textContent = "Ab hier übernimmt unser Elefant. Er hilft dir, aus deinen Vorgaben einen passenden Test zu erstellen.";
  }
}

function schedulePolish() {
  window.clearTimeout(polishTimer);
  polishTimer = window.setTimeout(polishGuideCopy, 0);
}

function installFirstGuideGuard() {
  if (installed || typeof document === "undefined") return;
  installed = true;

  // The page stays visible as context, but only the current spotlight and the
  // guide card are interactive. This keeps the tour state deterministic.
  for (const type of ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "dblclick", "contextmenu", "submit"]) {
    document.addEventListener(type, blockOutsideGuide, { capture: true });
  }
  for (const type of ["touchstart", "touchmove", "wheel"]) {
    document.addEventListener(type, blockOutsideGuide, { capture: true, passive: false });
  }
  document.addEventListener("keydown", keepKeyboardInsideGuide, true);
  document.addEventListener("focusin", keepFocusInsideGuide, true);

  // The guide changes after the allowed click. Polish only then instead of
  // observing the entire application DOM continuously.
  document.addEventListener("click", schedulePolish, false);
  schedulePolish();
}

installFirstGuideGuard();

export { installFirstGuideGuard };
