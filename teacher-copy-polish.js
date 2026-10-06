let scheduled = 0;

// Only clean the visible title of a markwords card. The authored question and
// answer data stay untouched; U+FFFC renders as the small foreign glyph seen in previews.
export function cleanMarkwordsTitle(text) {
  const original = String(text ?? "");
  if (!original.includes("\uFFFC")) return original;
  return original.replace(/\s*\uFFFC\s*/gu, " ").replace(/ ([.,!?;:])/g, "$1");
}

export function polishMarkwordsTitles(root = document) {
  root.querySelectorAll?.('.studentQuestion[data-type="markwords"] h3').forEach(title => {
    const clean = cleanMarkwordsTitle(title.textContent);
    if (clean !== title.textContent) title.textContent = clean;
  });
}

function cleanAiStatus() {
  const notice = document.getElementById("aiBetaNotice");
  if (!notice) return;
  const text = notice.textContent || "";
  if (/KI-Beta/i.test(text)) {
    notice.textContent = "KI-Zugang ist aktiv.";
    notice.classList.remove("error");
  }
}

function removeInternalCostCopy() {
  document.querySelectorAll(".firstAiGuideCost").forEach(node => node.remove());

  document.querySelectorAll(".teacherTourBullet").forEach(node => {
    if (/\bkosten\b|kostenpflichtig/i.test(node.textContent || "")) node.remove();
  });

  document.querySelectorAll("#aiView p, #aiView small, #aiView .hint").forEach(node => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (/^(Jede )?KI-(Erstellung|Generierung)|^KI-Tests? und Bilder verursachen Kosten/i.test(text)) node.remove();
  });

  document.querySelectorAll(".aiImageComposer small").forEach(node => {
    node.textContent = "Kurz beschreiben. Die Beschreibung geht an OpenAI; bitte keine personenbezogenen Angaben.";
  });
}

function removeRedundantDraftAside() {
  const aiView = document.getElementById("aiView");
  if (!aiView) return;
  aiView.querySelectorAll(".infoBox,.aiHint,.aiAside,.aiCallout,aside,div,p,small").forEach(node => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 320) return;
    if (/^Entwurf bleibt bei dir\b/i.test(text) || /^Dein Entwurf bleibt bei dir\b/i.test(text)) node.remove();
  });
}

function compactTemplatePrivacyNote() {
  const card = document.querySelector("#createView .importChoiceCard");
  const strip = document.querySelector("#createView .privacyStrip");
  if (!card) return;

  let note = card.querySelector(".gcTemplatePrivacyNote");
  if (!note) {
    note = document.createElement("small");
    note.className = "gcTemplatePrivacyNote";
    note.textContent = "🔒 Keine Schülerdaten – nur Testinhalte werden kopiert.";
    card.appendChild(note);
  }
  strip?.remove();
}

function polishAiEditLabels(root = document) {
  const english = document.documentElement.lang.toLowerCase().startsWith("en");
  root.querySelectorAll?.(".aiEditQuestion").forEach(button => {
    button.textContent = english ? "✨ Improve" : "✨ Überarbeiten";
    button.title = english ? "Improve question" : "Aufgabe überarbeiten";
  });
  root.querySelectorAll?.(".questionAiPanel > strong").forEach(label => {
    label.textContent = english ? "✨ Improve question" : "✨ Aufgabe überarbeiten";
  });
  root.querySelectorAll?.(".questionAiPanel .aiApply").forEach(button => {
    button.textContent = "Überarbeitung erstellen";
  });
}

function suppressLegacyInfoTour() {
  const dialog = document.getElementById("teacherTourDialog");
  if (!(dialog instanceof HTMLDialogElement) || dialog.dataset.gradecrewSuppressed === "1") return;
  dialog.dataset.gradecrewSuppressed = "1";
  if (dialog.open) dialog.close();
  dialog.showModal = () => {};
  dialog.show = () => {};
}

function polishTeacherCopy() {
  scheduled = 0;
  suppressLegacyInfoTour();
  cleanAiStatus();
  removeInternalCostCopy();
  removeRedundantDraftAside();
  compactTemplatePrivacyNote();
  polishAiEditLabels();
  polishMarkwordsTitles();
}

function schedulePolish() {
  window.clearTimeout(scheduled);
  scheduled = window.setTimeout(polishTeacherCopy, 0);
}

function installTeacherCopyPolish() {
  polishTeacherCopy();
  document.addEventListener("click", () => {
    schedulePolish();
    window.setTimeout(polishTeacherCopy, 120);
  }, false);

  const status = document.getElementById("aiBetaNotice");
  if (status) {
    new MutationObserver(polishTeacherCopy).observe(status, { childList: true, characterData: true, subtree: true });
  }

  const questionList = document.getElementById("questionList");
  if (questionList) {
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node instanceof Element) polishAiEditLabels(node);
      }));
    }).observe(questionList, { childList: true, subtree: true });
  }
  const studentQuizCard = document.getElementById("studentQuizCard");
  if (studentQuizCard) {
    new MutationObserver(() => polishMarkwordsTitles(studentQuizCard)).observe(studentQuizCard, { childList: true, subtree: true });
  }
  window.addEventListener("gradecrew:ui-locale-changed", schedulePolish);
}

if (document.body) installTeacherCopyPolish();
else document.addEventListener("DOMContentLoaded", installTeacherCopyPolish, { once: true });

export { polishTeacherCopy };
