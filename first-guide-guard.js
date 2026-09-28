let installed = false;

function activeGuideParts() {
  const backdrop = document.getElementById("firstAiGuideBackdrop");
  const card = document.getElementById("firstAiGuideCard");
  const target = document.querySelector(".firstAiGuideSpotlight");
  const active = Boolean(backdrop && !backdrop.classList.contains("hidden") && card && !card.classList.contains("hidden"));
  return { active, card, target };
}

function isAllowedNode(node, parts) {
  if (!(node instanceof Node)) return false;
  return Boolean(parts.card?.contains(node) || parts.target?.contains(node));
}

function blockOutsideGuide(event) {
  const parts = activeGuideParts();
  if (!parts.active || isAllowedNode(event.target, parts)) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function keepKeyboardInsideGuide(event) {
  const parts = activeGuideParts();
  if (!parts.active || isAllowedNode(event.target, parts)) return;

  // Prevent accidental activation of whatever had focus before the guide opened.
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }
}

function installFirstGuideGuard() {
  if (installed || typeof document === "undefined") return;
  installed = true;

  // Capture before application handlers. The legacy guide backdrop is visual
  // only; interaction is allowed exclusively inside its card or spotlight.
  for (const type of ["pointerdown", "click", "dblclick", "contextmenu"]) {
    document.addEventListener(type, blockOutsideGuide, true);
  }
  document.addEventListener("keydown", keepKeyboardInsideGuide, true);
}

installFirstGuideGuard();

export { installFirstGuideGuard };
