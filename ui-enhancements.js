import { scrollBehavior, watchStickyHeight } from "./interface.js?v=2.3.1-gc2";

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripDuplicatePassage(prompt, passage) {
  const rawPrompt = String(prompt || "").trim();
  const rawPassage = String(passage || "").trim();
  if (!rawPrompt || !rawPassage) return rawPrompt;
  const promptFlat = cleanText(rawPrompt);
  const passageFlat = cleanText(rawPassage);
  if (!promptFlat.toLocaleLowerCase("de").includes(passageFlat.toLocaleLowerCase("de"))) return rawPrompt;
  const index = promptFlat.toLocaleLowerCase("de").lastIndexOf(passageFlat.toLocaleLowerCase("de"));
  if (index < 0) return rawPrompt;
  // Never remove instructions that follow a quoted passage.
  if (promptFlat.slice(index + passageFlat.length).trim()) return rawPrompt;
  return promptFlat.slice(0, index).replace(/[\s:–—-]+$/g, "").trim();
}

function cleanStudentMarkword(card) {
  if (!(card instanceof HTMLElement) || card.dataset.type !== "markwords") return;
  const heading = card.querySelector(":scope > h3, .studentQuestionHead + h3");
  const passageHost = card.querySelector(".markWordsBox, .markwordsBox, [data-markwords], .markWordsText");
  const passage = passageHost?.textContent?.trim();
  if (!heading || !passage) return;
  const cleaned = stripDuplicatePassage(heading.textContent, passage);
  if (cleaned && cleanText(cleaned) !== cleanText(heading.textContent)) heading.textContent = cleaned;
}

function cleanMarkwordDuplicates(root = document) {
  if (root.matches?.('.studentQuestion[data-type="markwords"]')) cleanStudentMarkword(root);
  root.querySelectorAll?.('.studentQuestion[data-type="markwords"]').forEach(cleanStudentMarkword);
  // Editor content is changed only by an explicit edit or import normalization.
}

let studentCleanup = null;

function closestQuestionIndex(sections, offset) {
  let candidate = 0;
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= offset) candidate = index;
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
    <button class="studentOverviewToggle" type="button" aria-expanded="false" aria-controls="studentQuestionNav">Übersicht <span aria-hidden="true">⌄</span></button>
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
    const stickyBottom = Math.max(0, progress.getBoundingClientRect().bottom,
      document.querySelector(".topbar")?.getBoundingClientRect().bottom || 0,
      document.getElementById("studentTimerBar")?.getBoundingClientRect().bottom || 0) + 18;
    index = closestQuestionIndex(items, stickyBottom);
    if (current.textContent !== String(index + 1)) current.textContent = String(index + 1);
    if (total.textContent !== String(items.length)) total.textContent = String(items.length);
    previous.disabled = index <= 0;
    next.disabled = index >= items.length - 1;
    nav.querySelectorAll(".questionNavDot").forEach((button, buttonIndex) => {
      button.classList.toggle("current", buttonIndex === index);
      if (buttonIndex === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sync(); });
  };
  const go = delta => {
    const items = sections();
    const target = items[Math.max(0, Math.min(items.length - 1, index + delta))];
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); target.scrollIntoView({ behavior: scrollBehavior(), block: "start" }); }
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
    // Apply the collapsed height before the core click handler scrolls a question.
    document.documentElement.style.setProperty("--student-progress-height", `${Math.ceil(progress.getBoundingClientRect().height)}px`);
    setTimeout(sync, 350);
  }, true);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  studentCleanup?.();
  const stopProgressHeight = watchStickyHeight(progress, "--student-progress-height");
  const stopTimerHeight = watchStickyHeight(document.getElementById("studentTimerBar"), "--student-timer-height");
  studentCleanup = () => {
    stopProgressHeight();
    stopTimerHeight();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
  setTimeout(sync, 0);
}

function scan(root = document) {
  cleanMarkwordDuplicates(root);
  const progress = root.querySelector?.("#studentProgressBar") || (root.id === "studentProgressBar" ? root : null);
  if (progress) enhanceStudentProgress(progress);
}

const observer = new MutationObserver(records => {
  if (!document.getElementById("studentProgressBar")) { studentCleanup?.(); studentCleanup = null; }
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      scan(node);
    }
  }
});

if (document.body) {
  scan();
  observer.observe(document.getElementById("studentQuizCard"), { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    scan();
    observer.observe(document.getElementById("studentQuizCard"), { childList: true, subtree: true });
  }, { once: true });
}
