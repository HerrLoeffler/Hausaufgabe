let installed = false;
let polishTimer = 0;
let shadeFrame = 0;
let guideShades = [];

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

function removeGuideShades() {
  guideShades.forEach(node => node.remove());
  guideShades = [];
}

function makeShade() {
  const node = document.createElement("div");
  node.className = "gcFirstGuideShade";
  Object.assign(node.style, {
    position: "fixed",
    zIndex: "1000",
    pointerEvents: "none",
    background: "rgba(15, 23, 42, .52)",
    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)"
  });
  document.body.appendChild(node);
  return node;
}

function syncGuideSpotlight() {
  shadeFrame = 0;
  const { active, backdrop, target } = activeGuideParts();
  if (backdrop) {
    // Keep the legacy backdrop as a lifecycle marker only. The real dimming is
    // drawn around the target so the actionable control stays fully bright.
    backdrop.style.background = "transparent";
    backdrop.style.backdropFilter = "none";
    backdrop.style.webkitBackdropFilter = "none";
  }
  if (!active || !target || !target.getClientRects().length) {
    removeGuideShades();
    return;
  }

  if (guideShades.length !== 4) {
    removeGuideShades();
    guideShades = Array.from({ length: 4 }, makeShade);
  }

  const rect = target.getBoundingClientRect();
  const pad = 10;
  const left = Math.max(0, rect.left - pad);
  const top = Math.max(0, rect.top - pad);
  const right = Math.min(window.innerWidth, rect.right + pad);
  const bottom = Math.min(window.innerHeight, rect.bottom + pad);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  const [north, south, west, east] = guideShades;

  Object.assign(north.style, { left: "0px", top: "0px", width: "100vw", height: `${top}px` });
  Object.assign(south.style, { left: "0px", top: `${bottom}px`, width: "100vw", height: `${Math.max(0, window.innerHeight - bottom)}px` });
  Object.assign(west.style, { left: "0px", top: `${top}px`, width: `${left}px`, height: `${height}px` });
  Object.assign(east.style, { left: `${right}px`, top: `${top}px`, width: `${Math.max(0, window.innerWidth - right)}px`, height: `${height}px` });
}

function scheduleSpotlightSync() {
  if (shadeFrame) return;
  shadeFrame = requestAnimationFrame(syncGuideSpotlight);
}

function isElephantStep(card) {
  const eyebrow = card?.querySelector(".eyebrow")?.textContent || "";
  const title = card?.querySelector("h2")?.textContent || "";
  return /Schritt\s+[234]\s+von\s+4/i.test(eyebrow) || /KI-Test wird erstellt/i.test(title) || /Jetzt mit KI erstellen/i.test(title);
}

function polishGuideCopy() {
  polishTimer = 0;
  const { active, card } = activeGuideParts();
  if (!active || !card) {
    scheduleSpotlightSync();
    return;
  }

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
  scheduleSpotlightSync();
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

  // Update only at real guide events, resize and scroll; never observe the
  // entire application DOM.
  document.addEventListener("click", schedulePolish, false);
  window.addEventListener("resize", scheduleSpotlightSync, { passive: true });
  window.addEventListener("scroll", scheduleSpotlightSync, { passive: true, capture: true });
  schedulePolish();
}

installFirstGuideGuard();

export { installFirstGuideGuard };
