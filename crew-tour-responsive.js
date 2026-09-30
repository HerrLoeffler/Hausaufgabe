import { computeAdaptiveGuidePlan, isCompactGuideViewport } from "./first-guide-responsive.js?v=2.3.1-gc28-mobile";

const MARGIN = 12;
let frame = 0;
let settleTimers = [];
let activeTarget = null;
let placement = null;
let coachObserver = null;
let targetObserver = null;

function viewportMetrics() {
  const vv = window.visualViewport;
  const left = vv?.offsetLeft || 0;
  const top = vv?.offsetTop || 0;
  const width = vv?.width || window.innerWidth;
  const height = vv?.height || window.innerHeight;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

function clearTimers() {
  settleTimers.forEach(timer => window.clearTimeout(timer));
  settleTimers = [];
}

function schedule() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    layoutCrewCoach();
  });
}

function settle() {
  schedule();
  clearTimers();
  for (const delay of [40, 120, 260, 420]) settleTimers.push(window.setTimeout(schedule, delay));
}

function installStyles() {
  if (document.querySelector("style[data-gradecrew-crew-tour-responsive]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewCrewTourResponsive = "1";
  style.textContent = `
    .gcRealCoach.gcResponsiveCoach {
      box-sizing: border-box !important;
      overflow-y: auto !important;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      transform: none !important;
      margin: 0 !important;
      padding-bottom: max(17px, env(safe-area-inset-bottom, 0px)) !important;
    }
    .gcRealCoach.gcResponsiveCoach .gcCoachNext,
    .gcRealCoach.gcResponsiveCoach .button { min-height: 44px; }
    @media (max-width: 720px), (max-height: 700px) {
      .gcRealCoach.gcResponsiveCoach {
        width: calc(100vw - 24px) !important;
        max-width: 560px !important;
        border-radius: 18px !important;
        padding: 14px 15px max(15px, env(safe-area-inset-bottom, 0px)) !important;
      }
      .gcRealCoach.gcResponsiveCoach h2 { font-size: clamp(18px, 5vw, 21px); line-height: 1.18; }
      .gcRealCoach.gcResponsiveCoach p { font-size: 13px; line-height: 1.48; margin: 9px 0; }
      .gcRealCoach.gcResponsiveCoach .gcCoachIdentity img { width: 52px; height: 58px; }
      .gcRealTourActive .gcTourTarget { scroll-margin-top: 18px !important; scroll-margin-bottom: 18px !important; }
    }
    @media (max-height: 520px) {
      .gcRealCoach.gcResponsiveCoach:not(.gcCoachCentered) .gcCoachIdentity img { width: 42px; height: 46px; }
      .gcRealCoach.gcResponsiveCoach:not(.gcCoachCentered) > small { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

function observeTarget(target) {
  if (target === activeTarget) return;
  activeTarget = target;
  placement = null;
  targetObserver?.disconnect();
  targetObserver = null;
  if (target && "ResizeObserver" in window) {
    targetObserver = new ResizeObserver(settle);
    targetObserver.observe(target);
  }
}

function resetCoach(coach) {
  coach.classList.remove("gcResponsiveCoach");
  coach.removeAttribute("data-gc-placement");
  for (const property of ["max-height", "overflow-y", "width", "left", "top", "right", "bottom"]) {
    coach.style.removeProperty(property);
  }
}

function layoutCentered(coach, viewport) {
  coach.classList.add("gcResponsiveCoach");
  coach.dataset.gcPlacement = "center";
  const maxWidth = Math.min(680, viewport.width - MARGIN * 2);
  coach.style.width = `${Math.max(1, maxWidth)}px`;
  coach.style.maxHeight = `${Math.max(1, viewport.height - MARGIN * 2)}px`;
  coach.style.left = `${Math.round(viewport.left + (viewport.width - maxWidth) / 2)}px`;
  coach.style.top = `${viewport.top + MARGIN}px`;
  const height = Math.min(coach.getBoundingClientRect().height, viewport.height - MARGIN * 2);
  coach.style.top = `${Math.round(viewport.top + Math.max(MARGIN, (viewport.height - height) / 2))}px`;
}

function layoutCrewCoach() {
  const coach = document.querySelector(".gcRealCoach");
  const target = document.querySelector(".gcRealTourActive .gcTourTarget");
  const viewport = viewportMetrics();

  if (!coach || !coach.isConnected) {
    observeTarget(null);
    return;
  }

  // These two scenes intentionally live in normal document flow.
  if (coach.classList.contains("gcCoachInlineStart") || coach.classList.contains("gc25InlineReviewCoach")) {
    resetCoach(coach);
    observeTarget(target);
    return;
  }

  if (!isCompactGuideViewport(viewport)) {
    coach.classList.remove("gcResponsiveCoach");
    coach.removeAttribute("data-gc-placement");
    coach.style.removeProperty("max-height");
    coach.style.removeProperty("overflow-y");
    observeTarget(target);
    return;
  }

  installStyles();
  observeTarget(target);

  if (coach.classList.contains("gcCoachCentered") || !target || !target.getClientRects().length) {
    layoutCentered(coach, viewport);
    return;
  }

  coach.classList.add("gcResponsiveCoach");
  const width = Math.min(560, viewport.width - MARGIN * 2);
  coach.style.width = `${Math.max(1, width)}px`;
  coach.style.left = `${Math.round(viewport.left + (viewport.width - width) / 2)}px`;
  const maxHeight = Math.max(130, Math.min(360, viewport.height * (viewport.height < 520 ? 0.38 : 0.44)));
  coach.style.maxHeight = `${Math.min(maxHeight, viewport.height - MARGIN * 2)}px`;
  coach.style.top = `${viewport.top + MARGIN}px`;

  const targetRect = (target.closest(".variantReviewBar") || target).getBoundingClientRect();
  const coachHeight = Math.min(coach.getBoundingClientRect().height, maxHeight);
  if (!placement) {
    placement = targetRect.top + targetRect.height / 2 >= viewport.top + viewport.height / 2 ? "top" : "bottom";
  }
  const plan = computeAdaptiveGuidePlan({
    viewport,
    target: { top: targetRect.top, height: targetRect.height },
    cardHeight: coachHeight,
    placement,
    margin: MARGIN,
    gap: 14
  });

  coach.dataset.gcPlacement = plan.placement;
  coach.style.top = `${Math.round(plan.cardTop)}px`;

  if (Math.abs(plan.scrollDelta) > 1) {
    window.scrollBy({ top: plan.scrollDelta, left: 0, behavior: "auto" });
    window.requestAnimationFrame(schedule);
  }
}

function observeCoach() {
  const coach = document.querySelector(".gcRealCoach");
  if (!coach) return;
  if (!coachObserver && "MutationObserver" in window) {
    coachObserver = new MutationObserver(settle);
    coachObserver.observe(coach, { attributes: true, childList: true, subtree: true, characterData: true });
  }
  settle();
}

export function installCrewTourResponsiveLayout() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__gradecrewCrewTourResponsiveInstalled) return;
  window.__gradecrewCrewTourResponsiveInstalled = true;
  installStyles();

  if ("MutationObserver" in window) {
    const bodyObserver = new MutationObserver(() => {
      if (document.querySelector(".gcRealCoach")) observeCoach();
      settle();
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("click", settle, true);
  document.addEventListener("focusin", settle, true);
  window.addEventListener("resize", settle, { passive: true });
  window.addEventListener("orientationchange", settle, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true, capture: true });
  window.visualViewport?.addEventListener("resize", settle, { passive: true });
  window.visualViewport?.addEventListener("scroll", schedule, { passive: true });
  observeCoach();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  installCrewTourResponsiveLayout();
}
