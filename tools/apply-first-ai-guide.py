from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, text):
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def replace_regex_once(text, pattern, repl, label):
    new, count = re.subn(pattern, lambda _m: repl, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one regex match, found {count}")
    return new


app = read("app.js")

GUIDE = r'''const FIRST_AI_GUIDE_VERSION = "first-ai-test-v1";
let firstAiGuideStep = "";
let firstAiGuideTarget = null;
let firstAiGuideResizeHandler = null;
let firstAiGuideOfferTimer = null;

function firstTestGuideKey() {
  return state.user ? `firstAiGuide:${state.user.uid}:${FIRST_AI_GUIDE_VERSION}` : "";
}

function firstAiGuideDone() {
  try { return localStorage.getItem(firstTestGuideKey()) === "done"; } catch (_) { return false; }
}

function firstAiGuideSkippedThisSession() {
  try { return sessionStorage.getItem(`${firstTestGuideKey()}:skip`) === "1"; } catch (_) { return false; }
}

function firstAiGuideEligible() {
  if (!state.user || isSuspended() || firstAiGuideDone() || firstAiGuideSkippedThisSession()) return false;
  const quizzes = activeQuizzes().filter(q => q.generationStatus !== "running");
  const hasAiWork = state.aiJobs.some(job => ["queued", "running", "ready"].includes(job.status));
  return quizzes.length === 0 && !hasAiWork;
}

function ensureFirstAiGuideUi() {
  let backdrop = $("firstAiGuideBackdrop");
  let card = $("firstAiGuideCard");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "firstAiGuideBackdrop";
    backdrop.className = "firstAiGuideBackdrop hidden";
    document.body.appendChild(backdrop);
  }
  if (!card) {
    card = document.createElement("section");
    card.id = "firstAiGuideCard";
    card.className = "firstAiGuideCard hidden";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-live", "polite");
    document.body.appendChild(card);
  }
  return { backdrop, card };
}

function clearFirstAiGuideTarget() {
  firstAiGuideTarget?.classList.remove("firstAiGuideSpotlight");
  firstAiGuideTarget = null;
  if (firstAiGuideResizeHandler) {
    window.removeEventListener("resize", firstAiGuideResizeHandler);
    window.removeEventListener("scroll", firstAiGuideResizeHandler, true);
    firstAiGuideResizeHandler = null;
  }
}

function hideFirstAiGuide() {
  clearFirstAiGuideTarget();
  const { backdrop, card } = ensureFirstAiGuideUi();
  backdrop.classList.add("hidden");
  card.classList.add("hidden");
  card.classList.remove("centered");
}

function skipFirstAiGuideForSession() {
  try { sessionStorage.setItem(`${firstTestGuideKey()}:skip`, "1"); } catch (_) {}
  firstAiGuideStep = "";
  hideFirstAiGuide();
}

function markFirstAiGuideDone() {
  try { localStorage.setItem(firstTestGuideKey(), "done"); } catch (_) {}
  firstAiGuideStep = "";
  hideFirstAiGuide();
}

function firstAiGuideTargetFor(step) {
  if (step === "new") return $("newQuizBtn");
  if (step === "ai") return $("createAiBtn");
  if (step === "details") return $("aiTopic")?.closest("article.card") || $("aiTopic");
  if (step === "generate") return $("generateAiTestBtn");
  if (step === "running") return $("aiJobsList");
  return null;
}

function positionFirstAiGuideCard() {
  const card = $("firstAiGuideCard");
  if (!card || card.classList.contains("hidden") || !firstAiGuideTarget) return;
  const rect = firstAiGuideTarget.getBoundingClientRect();
  const gap = 14;
  const margin = 12;
  const cardRect = card.getBoundingClientRect();
  const width = Math.min(cardRect.width || 360, window.innerWidth - margin * 2);
  let left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
  let top = rect.bottom + gap;
  if (top + cardRect.height > window.innerHeight - margin) top = Math.max(margin, rect.top - cardRect.height - gap);
  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(top)}px`;
}

function firstAiGuideCardHtml({ eyebrow, title, text, extra = "", action = "", showLater = true }) {
  return `<div class="firstAiGuideHead"><span class="eyebrow">${escapeHtml(eyebrow)}</span><button class="firstAiGuideClose" type="button" aria-label="Für jetzt schließen">×</button></div>
    <h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p>${extra}
    <div class="firstAiGuideActions">${showLater ? '<button class="button ghost firstAiGuideLater" type="button">Später</button>' : ""}${action}</div>`;
}

function bindFirstAiGuideCommon(card) {
  card.querySelector(".firstAiGuideClose")?.addEventListener("click", skipFirstAiGuideForSession);
  card.querySelector(".firstAiGuideLater")?.addEventListener("click", skipFirstAiGuideForSession);
}

function renderFirstAiGuideStep(step) {
  const { backdrop, card } = ensureFirstAiGuideUi();
  clearFirstAiGuideTarget();
  firstAiGuideStep = step;
  backdrop.classList.remove("hidden");
  card.classList.remove("hidden", "centered");

  if (step === "intro") {
    card.classList.add("centered");
    card.style.left = "";
    card.style.top = "";
    card.innerHTML = firstAiGuideCardHtml({
      eyebrow: "Dein erster Test",
      title: "Erstelle deinen ersten Test mit KI",
      text: "Ich führe dich direkt durch die echte Erstellung. Du klickst und füllst die markierten Bereiche selbst aus – in vier kurzen Schritten.",
      extra: '<div class="firstAiGuideMiniFlow"><span>+ Neuer Test</span><b>→</b><span>Mit KI</span><b>→</b><span>Angaben</span><b>→</b><span>Erstellen</span></div>',
      action: '<button class="button primary firstAiGuideStart" type="button">Los geht’s</button>'
    });
    bindFirstAiGuideCommon(card);
    card.querySelector(".firstAiGuideStart")?.addEventListener("click", () => renderFirstAiGuideStep("new"));
    return;
  }

  firstAiGuideTarget = firstAiGuideTargetFor(step);
  if (!firstAiGuideTarget || firstAiGuideTarget.classList.contains("hidden")) {
    hideFirstAiGuide();
    return;
  }
  firstAiGuideTarget.classList.add("firstAiGuideSpotlight");
  firstAiGuideTarget.scrollIntoView({ behavior: "smooth", block: "center" });

  if (step === "new") {
    card.innerHTML = firstAiGuideCardHtml({
      eyebrow: "Schritt 1 von 4",
      title: "Starte einen neuen Test",
      text: "Klicke jetzt auf den markierten Button „+ Neuer Test“.",
      extra: '<div class="firstAiGuidePointer">Klicke auf den hervorgehobenen Bereich.</div>'
    });
  } else if (step === "ai") {
    card.innerHTML = firstAiGuideCardHtml({
      eyebrow: "Schritt 2 von 4",
      title: "Wähle „Mit KI erstellen“",
      text: "So erstellt Testify den ersten Entwurf für dich. Danach kannst du jede Aufgabe normal bearbeiten.",
      extra: '<div class="firstAiGuidePointer">Klicke auf „Mit KI erstellen“.</div>'
    });
  } else if (step === "details") {
    card.innerHTML = firstAiGuideCardHtml({
      eyebrow: "Schritt 3 von 4",
      title: "Beschreibe deinen Test",
      text: "Trage Fach, Klasse und vor allem das Thema ein. Aufgabenanzahl, Schwierigkeit und Punkte kannst du direkt anpassen.",
      extra: '<div id="firstAiGuideValidation" class="firstAiGuideValidation hidden"></div>',
      action: '<button class="button primary firstAiGuideNext" type="button">Weiter</button>'
    });
  } else if (step === "generate") {
    card.innerHTML = firstAiGuideCardHtml({
      eyebrow: "Schritt 4 von 4",
      title: "Jetzt mit KI erstellen",
      text: "Klicke auf „Test erstellen“. Testify erzeugt den Entwurf im Hintergrund und prüft ihn anschließend automatisch.",
      extra: '<div class="firstAiGuideCost"><strong>⚠ Kostenhinweis</strong><span>Jede KI-Generierung verursacht Kosten. Bitte KI-Funktionen gezielt und sparsam nutzen.</span></div><div class="firstAiGuidePointer">Zum Starten den markierten Button anklicken.</div>'
    });
  } else if (step === "running") {
    card.innerHTML = firstAiGuideCardHtml({
      eyebrow: "Geschafft",
      title: "Dein KI-Test wird erstellt",
      text: "Die Erstellung läuft im Hintergrund. Du kannst weiterarbeiten oder die Seite verlassen. Sobald der Test fertig ist, öffnest du hier „Entwurf prüfen“.",
      action: '<button class="button primary firstAiGuideFinish" type="button">Verstanden</button>',
      showLater: false
    });
    card.querySelector(".firstAiGuideFinish")?.addEventListener("click", hideFirstAiGuide);
  }

  bindFirstAiGuideCommon(card);
  card.querySelector(".firstAiGuideNext")?.addEventListener("click", () => {
    const subject = $("aiSubject")?.value.trim();
    const grade = $("aiGrade")?.value.trim();
    const topic = $("aiTopic")?.value.trim();
    if (!subject || !grade || !topic) {
      const validation = $("firstAiGuideValidation");
      if (validation) {
        validation.textContent = "Bitte zuerst Fach, Klasse und Thema eintragen.";
        validation.classList.remove("hidden");
      }
      (!subject ? $("aiSubject") : !grade ? $("aiGrade") : $("aiTopic"))?.focus();
      return;
    }
    renderFirstAiGuideStep("generate");
  });

  requestAnimationFrame(() => {
    positionFirstAiGuideCard();
    firstAiGuideResizeHandler = positionFirstAiGuideCard;
    window.addEventListener("resize", firstAiGuideResizeHandler);
    window.addEventListener("scroll", firstAiGuideResizeHandler, true);
  });
}

function scheduleFirstAiGuideOffer(attempt = 0) {
  clearTimeout(firstAiGuideOfferTimer);
  if (!firstAiGuideEligible() || $("dashboardView")?.classList.contains("hidden")) return;
  firstAiGuideOfferTimer = setTimeout(() => {
    if (!firstAiGuideEligible()) return;
    if (document.querySelector("dialog[open]")) {
      if (attempt < 40) scheduleFirstAiGuideOffer(attempt + 1);
      return;
    }
    renderFirstAiGuideStep("intro");
  }, attempt ? 500 : 650);
}

function renderFirstTestGuide() {
  if (firstAiGuideStep) requestAnimationFrame(positionFirstAiGuideCard);
}

let teacherTourIndex = 0;'''

app = replace_regex_once(
    app,
    r'function firstTestGuideKey\(\) \{.*?\nlet teacherTourIndex = 0;',
    GUIDE,
    "guided first AI test block"
)

app = replace_once(
    app,
    '  showView("createView");\n}',
    '  showView("createView");\n  if (firstAiGuideStep === "new") setTimeout(() => renderFirstAiGuideStep("ai"), 80);\n}',
    "advance guide to AI choice"
)

app = replace_once(
    app,
    '    const tourOpened = maybeShowTeacherTour();\n    if (!tourOpened) await loadAnnouncements();',
    '    const tourOpened = maybeShowTeacherTour();\n    if (!tourOpened) await loadAnnouncements();\n    scheduleFirstAiGuideOffer();',
    "offer first AI guide after dashboard onboarding"
)

app = replace_once(
    app,
    '  showView("aiView");\n  setAiProgress("");\n  renderAiJobs();',
    '  showView("aiView");\n  setAiProgress("");\n  renderAiJobs();\n  if (firstAiGuideStep === "ai") setTimeout(() => renderFirstAiGuideStep("details"), 100);',
    "advance guide to AI details"
)

app = replace_once(
    app,
    '    if (!response?.jobId) throw new Error("Der Hintergrundauftrag wurde nicht bestätigt.");\n    if (!state.aiJobs.some(job => job.id === response.jobId)) state.aiJobs.push({',
    '    if (!response?.jobId) throw new Error("Der Hintergrundauftrag wurde nicht bestätigt.");\n    const guidedFirstTest = !similar && firstAiGuideStep === "generate";\n    if (guidedFirstTest) markFirstAiGuideDone();\n    if (!state.aiJobs.some(job => job.id === response.jobId)) state.aiJobs.push({',
    "mark guide complete after job start"
)

app = replace_once(
    app,
    '    toast(response.resumed ? "Dein laufender KI-Auftrag ist unter „Meine Tests“ sichtbar." : "Erstellung gestartet. Den Fortschritt findest du unter „Meine Tests“.");\n    await loadDashboard();',
    '    toast(response.resumed ? "Dein laufender KI-Auftrag ist unter „Meine Tests“ sichtbar." : "Erstellung gestartet. Den Fortschritt findest du unter „Meine Tests“.");\n    await loadDashboard();\n    if (guidedFirstTest) setTimeout(() => renderFirstAiGuideStep("running"), 180);',
    "show final background progress guide"
)

app = app.replace('const APP_VERSION = "2.3.1-ai29";', 'const APP_VERSION = "2.3.1-ai30";', 1)
app = app.replace('?v=2.3.1-ai29', '?v=2.3.1-ai30')
write("app.js", app)

styles = read("styles.css")
if ".firstAiGuideBackdrop{" in styles:
    raise RuntimeError("guided onboarding styles already present")
styles += r'''

/* ===== Guided first AI test ===== */
.firstAiGuideBackdrop{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:1000;backdrop-filter:blur(1px)}
.firstAiGuideSpotlight{position:relative!important;z-index:1002!important;box-shadow:0 0 0 5px rgba(255,255,255,.96),0 0 0 9px rgba(23,105,224,.78),0 18px 46px rgba(15,23,42,.28)!important;border-radius:12px;animation:firstAiGuidePulse 1.5s ease-in-out infinite}
.firstAiGuideCard{position:fixed;z-index:1004;width:min(380px,calc(100vw - 24px));background:#fff;border:1px solid #dbe7f7;border-radius:16px;box-shadow:0 24px 70px rgba(15,23,42,.28);padding:18px 18px 16px;color:var(--text)}
.firstAiGuideCard.centered{left:50%!important;top:50%!important;transform:translate(-50%,-50%);width:min(520px,calc(100vw - 28px));padding:24px}
.firstAiGuideCard h2{margin:7px 0 8px;font-size:21px}.firstAiGuideCard p{margin:0 0 13px;font-size:14px}.firstAiGuideHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.firstAiGuideClose{border:0;background:transparent;font-size:23px;line-height:1;color:#667085;cursor:pointer;padding:0 3px}.firstAiGuideActions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px}.firstAiGuidePointer{margin-top:10px;padding:9px 10px;border-radius:9px;background:#edf5ff;color:#1557ad;font-size:12px;font-weight:750}.firstAiGuideMiniFlow{display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;margin:16px 0 6px;padding:12px;border-radius:11px;background:#f7f9fc;border:1px solid var(--line)}.firstAiGuideMiniFlow span{font-size:12px;font-weight:750;color:#344054}.firstAiGuideMiniFlow b{color:#98a2b3}.firstAiGuideCost{display:flex;gap:9px;flex-direction:column;margin-top:10px;padding:11px 12px;border:1px solid #f0cf7a;border-radius:10px;background:#fff9e8;color:#694c00}.firstAiGuideCost strong{font-size:12px}.firstAiGuideCost span{font-size:12px;line-height:1.45}.firstAiGuideValidation{margin-top:10px;padding:9px 10px;border-radius:9px;background:#fff1f1;color:#9f2525;font-size:12px;font-weight:700}
@keyframes firstAiGuidePulse{0%,100%{box-shadow:0 0 0 5px rgba(255,255,255,.96),0 0 0 9px rgba(23,105,224,.66),0 18px 46px rgba(15,23,42,.25)}50%{box-shadow:0 0 0 5px rgba(255,255,255,.96),0 0 0 13px rgba(23,105,224,.3),0 20px 52px rgba(15,23,42,.3)}}
@media(max-width:620px){.firstAiGuideCard{left:12px!important;right:12px!important;width:auto!important}.firstAiGuideCard.centered{left:14px!important;right:14px!important;top:50%!important;transform:translateY(-50%)}.firstAiGuideActions .button{flex:1}}
'''
write("styles.css", styles)

index = read("index.html")
index = index.replace('2.3.1-ai29', '2.3.1-ai30')
write("index.html", index)

# Lightweight source-level regression tests for the guided flow.
test = r'''"use strict";
const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");

const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");

test("first test guide drives the real AI creation path", () => {
  for (const marker of [
    'renderFirstAiGuideStep("new")',
    'renderFirstAiGuideStep("ai")',
    'renderFirstAiGuideStep("details")',
    'renderFirstAiGuideStep("generate")',
    'renderFirstAiGuideStep("running")',
    '$("newQuizBtn")',
    '$("createAiBtn")',
    '$("generateAiTestBtn")'
  ]) assert.ok(app.includes(marker), marker);
});

test("guide only completes after an AI background job was confirmed", () => {
  const confirmed = app.indexOf('if (!response?.jobId) throw new Error("Der Hintergrundauftrag wurde nicht bestätigt.")');
  const done = app.indexOf('if (guidedFirstTest) markFirstAiGuideDone();');
  assert.ok(confirmed >= 0 && done > confirmed);
});

test("guide contains cost warning and visible spotlight styling", () => {
  assert.match(app, /Jede KI-Generierung verursacht Kosten/);
  assert.match(css, /\.firstAiGuideSpotlight\{/);
  assert.match(css, /\.firstAiGuideBackdrop\{/);
});
'''
write("ai-first-guide.test.js", test)

print("Guided first AI test onboarding applied.")
