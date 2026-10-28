import { isCompactGuideViewport } from "./first-guide-responsive.js?v=2.3.1-gc28-mobile";

const MARGIN = 12;
let frame = 0;
let settleTimers = [];
let activeTarget = null;
let activeCoach = null;
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
    html:has(body.gcRealTourActive),body.gcRealTourActive,body.gcRealTourActive *{scroll-behavior:auto!important}
    html:has(body.gcRealTourActive.gcTourFlow),body.gcRealTourActive.gcTourFlow{overflow:auto!important;overscroll-behavior:auto!important;touch-action:pan-y!important}
    .gcRealCoach.gcCoachFlow{position:relative!important;inset:auto!important;transform:none!important;translate:none!important;width:100%!important;max-width:100%!important;max-height:none!important;grid-column:1/-1;margin:12px 0!important;box-sizing:border-box;transition:none}
    dialog.publishReview .gcCoachPublish{margin:0 0 16px!important;padding:12px!important;border-radius:12px!important;border:1px solid #cddcfb!important;box-shadow:none!important;scroll-margin-top:0}
    dialog.publishReview .gcCoachPublish .gcCoachIdentity img{width:42px!important;height:46px!important}
    dialog.publishReview .gcCoachPublish h2{font-size:18px}
    dialog.publishReview .gcCoachPublish p{font-size:13px;margin:8px 0 0}
    dialog.publishReview .gcCoachPublish>small{display:none}
    .gcRealTourActive :is(button,a,input[type=submit]).gcTourTarget{min-height:44px!important;min-width:44px!important}
    .gcRealCoach .gcEditArrow{width:32px;height:32px;justify-self:center;align-self:center}
    .gcRealCoach .gcCoachClose{display:grid!important;place-items:center;width:44px;height:44px;min-height:44px;top:4px;right:4px}
    .gcRealCoach .gcCoachIdentity{padding-right:28px}
    .gcRealCoach.gcResponsiveCoach {
      box-sizing: border-box !important;
      overflow-y: auto !important;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      transform: none !important;
      margin: 0 !important;
      transition:none!important;
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

function observeTarget(target,coach=null) {
  if (target === activeTarget && coach === activeCoach) return;
  activeTarget = target;
  activeCoach = coach;
  targetObserver?.disconnect();
  targetObserver = null;
  if ((target || coach) && "ResizeObserver" in window) {
    targetObserver = new ResizeObserver(settle);
    if(target)targetObserver.observe(target);
    if(coach)targetObserver.observe(coach);
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

// Clamp across an edge only: clamping toward the target was the old overlap bug.
export function computeCrewCoachPlacement({viewport,target,width,height,margin=MARGIN,gap=14}) {
  const left=viewport.left+margin,top=viewport.top+margin,right=viewport.left+viewport.width-margin,bottom=viewport.top+viewport.height-margin;
  if(width>right-left||height>bottom-top)return null;
  const clamp=(n,min,max)=>Math.max(min,Math.min(n,max));
  const x=clamp(target.left+(target.width-width)/2,left,right-width);
  const y=clamp(target.top+(target.height-height)/2,top,bottom-height);
  const candidates=[{left:target.right+gap,top:y},{left:target.left-width-gap,top:y},{left:x,top:target.bottom+gap},{left:x,top:target.top-height-gap}];
  return candidates.find(c=>c.left>=left&&c.top>=top&&c.left+width<=right&&c.top+height<=bottom)||null;
}

function flowCoach(coach,target) {
  const anchor=target.closest('.questionCard,.aiCreationPanel,.aiCreationFinish,.card')||target.closest('section.view')||target;
  // Reserve actual document space rather than covering a control on small screens.
  if(!anchor.parentElement||anchor.contains(coach))return;
  resetCoach(coach);
  coach.classList.add('gcCoachFlow');
  coach.dataset.gcPlacement='flow';
  coach.style.order=getComputedStyle(anchor).order;
  anchor.before(coach);
  document.body.classList.add('gcTourFlow');
}

export function layoutCrewCoach() {
  document.dispatchEvent(new window.Event('gradecrew:tour-anchor-refresh'));
  const coach = document.querySelector('.gcRealCoach');
  const target = document.querySelector('.gcRealTourActive .gcTourTarget');
  const viewport = viewportMetrics();
  if(!coach?.isConnected){observeTarget(null);document.body.classList.remove('gcTourFlow');return;}
  if(coach.classList.contains('gcCoachInlineStart')||coach.classList.contains('gc25InlineReviewCoach')||coach.classList.contains('gcCoachContext')){
    resetCoach(coach);observeTarget(target,coach);return;
  }
  if(coach.classList.contains('gcCoachFlow')){
    if(target===activeTarget)return;
    coach.classList.remove('gcCoachFlow');coach.style.removeProperty('order');document.body.append(coach);
  }
  document.body.classList.remove('gcTourFlow');installStyles();observeTarget(target,coach);
  if(coach.classList.contains('gcCoachCentered')||!target?.getClientRects().length){layoutCentered(coach,viewport);return;}
  coach.classList.add('gcResponsiveCoach');
  const compact=isCompactGuideViewport(viewport),width=Math.min(compact?560:360,viewport.width-MARGIN*2);
  coach.style.width=Math.max(1,width)+'px';
  coach.style.maxHeight=Math.max(1,Math.min(viewport.height-MARGIN*2,compact?Math.min(360,viewport.height*.44):viewport.height-MARGIN*2))+'px';
  const targetRect=(target.closest('.variantReviewBar')||target).getBoundingClientRect();
  const rect=coach.getBoundingClientRect();
  const plan=computeCrewCoachPlacement({viewport,target:targetRect,width:rect.width,height:rect.height});
  if(!plan){flowCoach(coach,target);return;}
  coach.dataset.gcPlacement='floating';coach.style.left=Math.round(plan.left)+'px';coach.style.top=Math.round(plan.top)+'px';
}

export function installCrewTourResponsiveLayout() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__gradecrewCrewTourResponsiveInstalled) return;
  window.__gradecrewCrewTourResponsiveInstalled = true;
  installStyles();

  // Watch structural/content changes only. Style/class writes from our own
  // layout pass must never retrigger the observer and create a feedback loop.
  if ("MutationObserver" in window) {
    const bodyObserver = new MutationObserver(settle);
    bodyObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  document.addEventListener("gradecrew:tour-layout", schedule);
  document.addEventListener("click", settle, true);
  document.addEventListener("focusin", settle, true);
  window.addEventListener("resize", settle, { passive: true });
  window.addEventListener("orientationchange", settle, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true, capture: true });
  window.visualViewport?.addEventListener("resize", settle, { passive: true });
  window.visualViewport?.addEventListener("scroll", schedule, { passive: true });
  settle();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  installCrewTourResponsiveLayout();
}

