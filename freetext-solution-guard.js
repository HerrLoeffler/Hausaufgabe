import { getApps } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const dashboardBypass = new WeakSet();
let decorateQueued = false;

function showMessage(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("error", "show");
  toast.classList.remove("success");
  window.setTimeout(() => toast.classList.remove("show"), 4200);
}

function quizCodeFromCard(card) {
  const match = String(card?.textContent || "").match(/\bCode\s+([A-Z0-9-]{4,40})\b/i);
  return match?.[1] || "";
}

function textQuestionCards() {
  return [...document.querySelectorAll("#editorView .questionCard")].filter(card => card.querySelector(".qType")?.value === "text");
}

function solutionInput(card) {
  return card.querySelector('.answerEditor input[type="text"]');
}

function decorateEditor() {
  textQuestionCards().forEach(card => {
    const input = solutionInput(card);
    if (!input) return;
    input.classList.add("gcFreeTextSolutionInput");
    input.setAttribute("aria-required", "true");
    const label = input.closest("label");
    const caption = label?.querySelector("span");
    if (caption && !caption.dataset.gcFreeTextSolutionLabel) {
      caption.dataset.gcFreeTextSolutionLabel = "1";
      caption.innerHTML = `Muster-/Referenzantwort <strong class="gcRequiredMark">Pflicht</strong> <small>(mehrere Kurzvarianten durch Kommas trennen)</small>`;
    }
    let hint = label?.querySelector(".gcFreeTextSolutionHint");
    if (!hint && label) {
      hint = document.createElement("small");
      hint.className = "hint gcFreeTextSolutionHint";
      hint.textContent = "Auch bei manueller Prüfung braucht jede Freitextaufgabe eine fachlich korrekte Musterlösung. Sie dient der Prüfhilfe und wird Schülerinnen und Schülern nicht als Lösung angezeigt.";
      label.appendChild(hint);
    }
    const missing = !String(input.value || "").trim();
    input.classList.toggle("gcMissingSolution", missing);
    input.setAttribute("aria-invalid", String(missing));

    const manual = card.querySelector('.answerEditor .manualRow');
    if (manual && !manual.dataset.gcFreeTextManualCopy) {
      manual.dataset.gcFreeTextManualCopy = "1";
      const checkbox = manual.querySelector('input[type="checkbox"]');
      manual.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = " Antwort zusätzlich durch die Lehrkraft prüfen";
      });
      if (checkbox) checkbox.title = "Die Musterlösung bleibt auch bei manueller Prüfung erforderlich.";
    }
  });
}

function firstMissingEditorSolution() {
  return textQuestionCards().map((card, index) => ({ card, input: solutionInput(card), index }))
    .find(item => !String(item.input?.value || "").trim()) || null;
}

function blockEditorSaveIfNeeded(event) {
  const target = event.target instanceof Element ? event.target.closest("#saveQuizBtn, #publishBtn") : null;
  if (!target) return;
  decorateEditor();
  const missing = firstMissingEditorSolution();
  if (!missing) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  missing.input?.classList.add("gcMissingSolution");
  missing.input?.focus({ preventScroll: true });
  missing.card?.scrollIntoView({ behavior: "smooth", block: "center" });
  const number = missing.card?.querySelector(".questionNumber")?.textContent || `Aufgabe ${missing.index + 1}`;
  showMessage(`${number}: Bitte eine Muster-/Referenzantwort für den Freitext hinterlegen.`);
}

async function dashboardQuizHasMissingSolution(code) {
  const app = getApps()[0];
  if (!app || !code) return false;
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "quizzes", code, "questions"));
  return snap.docs.some(question => {
    const data = question.data() || {};
    return data.type === "text" && !(Array.isArray(data.acceptedAnswers) && data.acceptedAnswers.some(answer => String(answer || "").trim()));
  });
}

async function guardDashboardPublish(event) {
  const toggle = event.target instanceof Element ? event.target.closest(".dashboardPublishToggle") : null;
  if (!toggle || dashboardBypass.has(toggle) || !toggle.checked) return;
  const card = toggle.closest(".quizCard");
  const code = quizCodeFromCard(card);
  if (!code) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  toggle.disabled = true;
  try {
    const missing = await dashboardQuizHasMissingSolution(code);
    if (missing) {
      toggle.checked = false;
      showMessage("Dieser Test enthält mindestens eine Freitextaufgabe ohne Musterlösung. Bitte zuerst im Editor ergänzen.");
      card?.querySelector(".edit")?.focus({ preventScroll: true });
      return;
    }
    dashboardBypass.add(toggle);
    toggle.disabled = false;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));
    queueMicrotask(() => dashboardBypass.delete(toggle));
  } catch (error) {
    console.warn("Freitext-Lösungsprüfung vor Veröffentlichung fehlgeschlagen:", error);
    toggle.checked = false;
    showMessage("Die Freitext-Lösungen konnten vor der Veröffentlichung nicht geprüft werden. Bitte Test im Editor öffnen und erneut versuchen.");
  } finally {
    if (toggle.isConnected && !dashboardBypass.has(toggle)) toggle.disabled = false;
  }
}

function scheduleDecorate() {
  if (decorateQueued) return;
  decorateQueued = true;
  requestAnimationFrame(() => {
    decorateQueued = false;
    decorateEditor();
  });
}

document.addEventListener("click", blockEditorSaveIfNeeded, true);
document.addEventListener("change", event => { guardDashboardPublish(event); }, true);
document.addEventListener("input", event => {
  const input = event.target instanceof Element ? event.target.closest(".gcFreeTextSolutionInput") : null;
  if (!input) return;
  const missing = !String(input.value || "").trim();
  input.classList.toggle("gcMissingSolution", missing);
  input.setAttribute("aria-invalid", String(missing));
}, true);

const observer = new MutationObserver(scheduleDecorate);
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleDecorate();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleDecorate();
  }, { once: true });
}

const style = document.createElement("style");
style.dataset.gradecrewFreeTextSolutionGuard = "1";
style.textContent = `
.gcRequiredMark{display:inline-flex;margin-left:5px;padding:2px 6px;border-radius:999px;background:#edf2ff;color:#3159a7;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
.gcFreeTextSolutionHint{display:block;margin-top:5px;line-height:1.4}
.gcFreeTextSolutionInput.gcMissingSolution{border-color:#d85151!important;box-shadow:0 0 0 2px rgba(216,81,81,.08)!important}
`;
document.head.appendChild(style);
