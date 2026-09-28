let studentCleanup = null;

function closestQuestionIndex(sections, offset) {
  let candidate = 0;
  let best = Infinity;
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < offset) return;
    const distance = Math.abs(rect.top - offset);
    if (distance < best) {
      best = distance;
      candidate = index;
    }
  });
  return candidate;
}

function enhanceStudentProgress(progress) {
  if (!(progress instanceof HTMLElement) || progress.dataset.compactEnhanced === "1") return;
  const nav = progress.querySelector("#studentQuestionNav");
  if (!nav) return;
  progress.dataset.compactEnhanced = "1";
  progress.classList.add("studentProgressCompact");

  const compact = document.createElement("div");
  compact.className = "studentCompactNav";
  compact.innerHTML = `
    <button class="studentCompactArrow studentPrevQuestion" type="button" aria-label="Vorherige Aufgabe">‹</button>
    <div class="studentCompactCurrent"><strong>Aufgabe <span class="studentCurrentNumber">1</span> von <span class="studentTotalNumber">–</span></strong><small>Direkt zwischen Aufgaben wechseln</small></div>
    <button class="studentOverviewToggle" type="button" aria-expanded="false">Übersicht <span aria-hidden="true">⌄</span></button>
    <button class="studentCompactArrow studentNextQuestion" type="button" aria-label="Nächste Aufgabe">›</button>`;
  nav.before(compact);

  const current = compact.querySelector(".studentCurrentNumber");
  const total = compact.querySelector(".studentTotalNumber");
  const previous = compact.querySelector(".studentPrevQuestion");
  const next = compact.querySelector(".studentNextQuestion");
  const toggle = compact.querySelector(".studentOverviewToggle");
  let index = 0;
  let ticking = false;

  const sections = () => Array.from(document.querySelectorAll(".studentQuestion[data-qid]"));
  const sync = () => {
    const items = sections();
    if (!items.length) return;
    const stickyBottom = progress.getBoundingClientRect().bottom + 18;
    index = closestQuestionIndex(items, stickyBottom);
    current.textContent = String(index + 1);
    total.textContent = String(items.length);
    previous.disabled = index <= 0;
    next.disabled = index >= items.length - 1;
    nav.querySelectorAll(".questionNavDot").forEach((button, buttonIndex) => button.classList.toggle("current", buttonIndex === index));
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sync(); });
  };
  const go = delta => {
    const items = sections();
    const target = items[Math.max(0, Math.min(items.length - 1, index + delta))];
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  previous.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  toggle.addEventListener("click", () => {
    const open = progress.classList.toggle("overviewOpen");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("span").textContent = open ? "⌃" : "⌄";
  });
  nav.addEventListener("click", event => {
    if (!event.target.closest(".questionNavDot")) return;
    progress.classList.remove("overviewOpen");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector("span").textContent = "⌄";
    setTimeout(sync, 350);
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  studentCleanup?.();
  studentCleanup = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
  setTimeout(sync, 0);
}

function scan(root = document) {
  const progress = root.querySelector?.("#studentProgressBar") || (root.id === "studentProgressBar" ? root : null);
  if (progress) enhanceStudentProgress(progress);
}

const observer = new MutationObserver(records => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      scan(node);
    }
  }
});

if (document.body) {
  scan();
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    scan();
    observer.observe(document.body, { childList: true, subtree: true });
  }, { once: true });
}

const style = document.createElement("style");
style.id = "testifyUiEnhancements";
style.textContent = `
.variantInstructionField{display:flex;flex-direction:column;gap:6px;color:#344054;font-size:13px;font-weight:650}
.variantInstructionField .optionalLabel{display:inline-block;margin-left:5px;color:#7b8798;font-size:11px;font-weight:600}
.variantInstructionField small{color:#7b8798;font-size:11px;font-weight:500;line-height:1.35}
.variantInstructionField textarea{min-height:76px;resize:vertical}
.studentProgressCompact{padding:10px 14px 11px}
.studentProgressCompact .studentProgressTrack{margin:7px 0 8px}
.studentCompactNav{display:grid;grid-template-columns:36px minmax(0,1fr) auto 36px;align-items:center;gap:8px}
.studentCompactArrow{width:36px;height:36px;border:1px solid #d9e1eb;border-radius:10px;background:#f8fafc;color:#355271;font-size:22px;line-height:1;cursor:pointer}
.studentCompactArrow:disabled{opacity:.35;cursor:default}
.studentCompactCurrent{display:flex;min-width:0;flex-direction:column;gap:1px}
.studentCompactCurrent strong{font-size:12px;color:#334155}.studentCompactCurrent small{font-size:10.5px;color:#8491a3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.studentOverviewToggle{border:1px solid #d9e1eb;border-radius:9px;background:#fff;color:#355271;padding:8px 10px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap}
.studentProgressCompact .studentQuestionNav{display:none;padding-top:10px;margin-top:9px;border-top:1px solid #edf1f5;max-height:150px;overflow:auto}
.studentProgressCompact.overviewOpen .studentQuestionNav{display:flex}
.studentProgressCompact .questionNavDot.current{border-color:#4d83e6;box-shadow:0 0 0 2px rgba(47,111,237,.16);color:#205bc7;background:#f4f8ff}
@media(max-width:560px){.studentCompactNav{grid-template-columns:34px minmax(0,1fr) auto 34px;gap:5px}.studentCompactArrow{width:34px;height:34px}.studentOverviewToggle{padding:7px 8px}.studentCompactCurrent small{display:none}.studentProgressCompact .studentQuestionNav{max-height:190px}}
`;
document.head.appendChild(style);
