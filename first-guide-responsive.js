const DEFAULT_MARGIN = 12;
const DEFAULT_GAP = 14;
const COMPACT_MAX_WIDTH = 720;
const COMPACT_MAX_HEIGHT = 700;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function isCompactGuideViewport(viewport) {
  return viewport.width <= COMPACT_MAX_WIDTH || viewport.height <= COMPACT_MAX_HEIGHT;
}

export function computeAdaptiveGuidePlan({
  viewport,
  target,
  cardHeight,
  placement,
  margin = DEFAULT_MARGIN,
  gap = DEFAULT_GAP
}) {
  const viewportBottom = viewport.top + viewport.height;
  const maxCardHeight = clamp(
    viewport.height * (viewport.height < 520 ? 0.38 : 0.44),
    Math.min(150, viewport.height - margin * 2),
    Math.min(360, viewport.height - margin * 2)
  );
  const effectiveCardHeight = Math.min(Math.max(1, cardHeight || maxCardHeight), maxCardHeight);
  const targetCenter = target.top + target.height / 2;
  const viewportCenter = viewport.top + viewport.height / 2;
  const resolvedPlacement = placement || (targetCenter >= viewportCenter ? "top" : "bottom");

  const cardTop = resolvedPlacement === "top"
    ? viewport.top + margin
    : viewportBottom - margin - effectiveCardHeight;

  const availableTop = resolvedPlacement === "top"
    ? cardTop + effectiveCardHeight + gap
    : viewport.top + margin;
  const availableBottom = resolvedPlacement === "top"
    ? viewportBottom - margin
    : cardTop - gap;
  const availableHeight = Math.max(1, availableBottom - availableTop);
  const desiredCenter = availableTop + availableHeight / 2;

  let scrollDelta = 0;
  if (target.height <= availableHeight) {
    if (target.top < availableTop || target.top + target.height > availableBottom) {
      scrollDelta = targetCenter - desiredCenter;
    }
  } else if (resolvedPlacement === "top") {
    scrollDelta = target.top - availableTop;
  } else {
    scrollDelta = target.top + target.height - availableBottom;
  }

  return {
    placement: resolvedPlacement,
    cardTop,
    maxCardHeight,
    availableTop,
    availableBottom,
    scrollDelta
  };
}

function viewportMetrics() {
  const vv = window.visualViewport;
  const width = vv?.width || window.innerWidth;
  const height = vv?.height || window.innerHeight;
  const left = vv?.offsetLeft || 0;
  const top = vv?.offsetTop || 0;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

function installStyles() {
  if (document.querySelector("style[data-gradecrew-first-guide-responsive]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewFirstGuideResponsive = "1";
  style.textContent = `
    .firstAiGuideCard.gcFirstGuideAdaptive {
      box-sizing: border-box !important;
      overflow-y: auto !important;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      transform: none !important;
      margin: 0 !important;
      right: auto !important;
      bottom: auto !important;
      padding-bottom: max(16px, env(safe-area-inset-bottom, 0px)) !important;
    }
    .firstAiGuideCard.gcFirstGuideAdaptive .firstAiGuideActions {
      position: sticky;
      bottom: -1px;
      z-index: 2;
      margin-left: -4px;
      margin-right: -4px;
      padding: 10px 4px 1px;
      background: linear-gradient(to bottom, rgba(255,255,255,.86), #fff 28%);
    }
    .firstAiGuideCard.gcFirstGuideAdaptive .button { min-height: 44px; }
    .firstAiGuideCard.gcFirstGuideAdaptive[data-gc-placement="top"] { transform-origin: top center; }
    .firstAiGuideCard.gcFirstGuideAdaptive[data-gc-placement="bottom"] { transform-origin: bottom center; }
    @media (max-width: 720px), (max-height: 700px) {
      .firstAiGuideCard.gcFirstGuideAdaptive {
        border-radius: 18px !important;
        padding: 14px 15px max(15px, env(safe-area-inset-bottom, 0px)) !important;
      }
      .firstAiGuideCard.gcFirstGuideAdaptive h2 { font-size: clamp(18px, 5vw, 21px); line-height: 1.18; }
      .firstAiGuideCard.gcFirstGuideAdaptive p { font-size: 13px; line-height: 1.48; margin-bottom: 10px; }
      .firstAiGuideCard.gcFirstGuideAdaptive .firstAiGuidePointer { margin-top: 7px; padding: 8px 9px; }
      .firstAiGuideCard.gcFirstGuideAdaptive .gradecrewGuideHeader img { width: 38px; height: 38px; }
      .firstAiGuideSpotlight { scroll-margin-top: 18px !important; scroll-margin-bottom: 18px !important; }
    }
    @media (max-height: 520px) {
      .firstAiGuideCard.gcFirstGuideAdaptive .gradecrewGuideHeader { display: none; }
      .firstAiGuideCard.gcFirstGuideAdaptive { padding-top: 11px !important; }
      .firstAiGuideCard.gcFirstGuideAdaptive h2 { margin-top: 4px; }
    }
  `;
  document.head.appendChild(style);
}

let frame = 0;
let currentTarget = null;
let compactPlacement = null;
let targetResizeObserver = null;
let cardObserver = null;
let bodyObserver = null;
let settleTimers = [];

function clearSettleTimers() {
  settleTimers.forEach(timer => window.clearTimeout(timer));
  settleTimers = [];
}

function scheduleLayout() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    layoutActiveGuide();
  });
}

function scheduleSettledLayout() {
  scheduleLayout();
  clearSettleTimers();
  for (const delay of [70, 180, 360]) {
    settleTimers.push(window.setTimeout(scheduleLayout, delay));
  }
}

function observeTarget(target) {
  if (target === currentTarget) return;
  currentTarget = target;
  compactPlacement = null;
  targetResizeObserver?.disconnect();
  targetResizeObserver = null;
  if (target && "ResizeObserver" in window) {
    targetResizeObserver = new ResizeObserver(scheduleLayout);
    targetResizeObserver.observe(target);
  }
}

function resetAdaptiveCard(card) {
  card.classList.remove("gcFirstGuideAdaptive");
  card.removeAttribute("data-gc-placement");
  for (const property of ["max-height", "overflow-y", "width", "right", "bottom"]) {
    card.style.removeProperty(property);
  }
}

function layoutCenteredCard(card, viewport) {
  card.classList.add("gcFirstGuideAdaptive");
  card.dataset.gcPlacement = "center";
  const margin = DEFAULT_MARGIN;
  card.style.width = `${Math.max(1, viewport.width - margin * 2)}px`;
  card.style.left = `${viewport.left + margin}px`;
  card.style.maxHeight = `${Math.max(1, viewport.height - margin * 2)}px`;
  card.style.top = `${viewport.top + margin}px`;
  const height = Math.min(card.getBoundingClientRect().height, viewport.height - margin * 2);
  card.style.top = `${Math.round(viewport.top + Math.max(margin, (viewport.height - height) / 2))}px`;
}

function layoutActiveGuide() {
  const card = document.getElementById("firstAiGuideCard");
  if (!card || card.classList.contains("hidden")) {
    observeTarget(null);
    return;
  }

  const viewport = viewportMetrics();
  if (!isCompactGuideViewport(viewport)) {
    resetAdaptiveCard(card);
    observeTarget(document.querySelector(".firstAiGuideSpotlight"));
    return;
  }

  const target = document.querySelector(".firstAiGuideSpotlight");
  observeTarget(target);
  installStyles();

  if (!target || !target.getClientRects().length || card.classList.contains("centered")) {
    layoutCenteredCard(card, viewport);
    return;
  }

  card.classList.add("gcFirstGuideAdaptive");
  const margin = DEFAULT_MARGIN;
  card.style.width = `${Math.max(1, viewport.width - margin * 2)}px`;
  card.style.left = `${viewport.left + margin}px`;
  const maxCardHeight = clamp(
    viewport.height * (viewport.height < 520 ? 0.38 : 0.44),
    Math.min(150, viewport.height - margin * 2),
    Math.min(360, viewport.height - margin * 2)
  );
  card.style.maxHeight = `${Math.max(1, maxCardHeight)}px`;
  card.style.top = `${viewport.top + margin}px`;

  const targetRect = target.getBoundingClientRect();
  const cardHeight = Math.min(card.getBoundingClientRect().height, maxCardHeight);
  if (!compactPlacement) {
    compactPlacement = targetRect.top + targetRect.height / 2 >= viewport.top + viewport.height / 2 ? "top" : "bottom";
  }
  const plan = computeAdaptiveGuidePlan({
    viewport,
    target: { top: targetRect.top, height: targetRect.height },
    cardHeight,
    placement: compactPlacement
  });

  card.dataset.gcPlacement = plan.placement;
  card.style.top = `${Math.round(plan.cardTop)}px`;

  if (Math.abs(plan.scrollDelta) > 1) {
    window.scrollBy({ top: plan.scrollDelta, left: 0, behavior: "auto" });
    window.requestAnimationFrame(scheduleLayout);
  }
}

function observeGuideCard(card) {
  if (!card || cardObserver) return;
  if ("MutationObserver" in window) {
    cardObserver = new MutationObserver(scheduleSettledLayout);
    // Observe guide content changes, not our own class/style positioning writes.
    cardObserver.observe(card, { childList: true, subtree: true, characterData: true });
  }
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(card);
  }
  scheduleSettledLayout();
}

export function installFirstGuideResponsiveLayout() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__gradecrewFirstGuideResponsiveInstalled) return;
  window.__gradecrewFirstGuideResponsiveInstalled = true;
  installStyles();

  const existingCard = document.getElementById("firstAiGuideCard");
  if (existingCard) observeGuideCard(existingCard);
  else if ("MutationObserver" in window) {
    bodyObserver = new MutationObserver(() => {
      const card = document.getElementById("firstAiGuideCard");
      if (!card) return;
      bodyObserver.disconnect();
      bodyObserver = null;
      observeGuideCard(card);
    });
    bodyObserver.observe(document.body, { childList: true });
  }

  document.addEventListener("click", scheduleSettledLayout, true);
  document.addEventListener("focusin", scheduleSettledLayout, true);
  window.addEventListener("resize", scheduleSettledLayout, { passive: true });
  window.addEventListener("orientationchange", scheduleSettledLayout, { passive: true });
  window.addEventListener("scroll", scheduleLayout, { passive: true, capture: true });
  window.visualViewport?.addEventListener("resize", scheduleSettledLayout, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleLayout, { passive: true });
  scheduleSettledLayout();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  installFirstGuideResponsiveLayout();
}
