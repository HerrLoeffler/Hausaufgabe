import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  ASSESSMENT_LOCALE_SCHEMA_VERSION,
  DEFAULT_CONTENT_LOCALE,
  SUPPORTED_CONTENT_LOCALES,
  normalizeAssessmentLocale,
} from "./assessment-locale.mjs?v=3";

let pendingContentLocale = DEFAULT_CONTENT_LOCALE;
let currentQuizCode = "";
let loadedEditorLocale = DEFAULT_CONTENT_LOCALE;
let installed = false;
let editorLoadToken = 0;

const $ = selector => document.querySelector(selector);

function currentUiLocale() {
  return /^en(?:-|$)/i.test(String(window.GradeCrewI18n?.locale || "")) ? "en-GB" : "de-DE";
}

function uiText(german, english) {
  return currentUiLocale() === "en-GB" ? english : german;
}

function localeFieldCopy() {
  return currentUiLocale() === "en-GB"
    ? {
        label: "Test language",
        german: "German (Germany)",
        english: "English (UK)",
        hint: "Sets the language of questions and solutions. The GradeCrew interface can independently be German or English.",
      }
    : {
        label: "Testsprache",
        german: "Deutsch (Deutschland)",
        english: "English (UK)",
        hint: "Legt die Sprache der Aufgaben und Lösungen fest. Die GradeCrew-Oberfläche kann unabhängig davon Deutsch oder Englisch sein.",
      };
}

function optionMarkup(copy = localeFieldCopy()) {
  return `<option value="de-DE">${copy.german}</option><option value="en-GB">${copy.english}</option>`;
}

function createLocaleField(id, hintId) {
  const copy = localeFieldCopy();
  const label = document.createElement("label");
  label.className = "gradecrewAssessmentLocaleField span2";
  label.dataset.gradecrewLocaleField = "1";
  label.innerHTML = `<span class="gradecrewAssessmentLocaleLabel">${copy.label}</span>
    <select id="${id}" aria-describedby="${hintId}">${optionMarkup(copy)}</select>
    <small id="${hintId}" class="hint">${copy.hint}</small>`;
  return label;
}

function refreshLocaleFieldCopy() {
  const copy = localeFieldCopy();
  for (const field of document.querySelectorAll("[data-gradecrew-locale-field]")) {
    const select = field.querySelector("select");
    const value = select?.value;
    const label = field.querySelector(".gradecrewAssessmentLocaleLabel");
    const hint = field.querySelector(".hint");
    if (label) label.textContent = copy.label;
    if (select) {
      const de = select.querySelector('option[value="de-DE"]');
      const en = select.querySelector('option[value="en-GB"]');
      if (de) de.textContent = copy.german;
      if (en) en.textContent = copy.english;
      if (value) select.value = value;
    }
    if (hint) hint.textContent = copy.hint;
  }
}

function installStyles() {
  if (document.querySelector("style[data-gradecrew-assessment-locale]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewAssessmentLocale = "1";
  style.textContent = `
    .gradecrewAssessmentLocaleField{border:1px solid #dbe4ef;border-radius:13px;padding:10px 11px;background:#fbfdff}
    .gradecrewAssessmentLocaleField select{margin-top:5px}
    .gradecrewAssessmentLocaleField .hint{display:block;margin-top:5px;line-height:1.35}
    .editorAssessmentLocaleField{margin-top:2px}
  `;
  document.head.appendChild(style);
}

function ensureAiControl() {
  const grid = $("#aiView .formGrid2");
  if (!grid || $("#aiContentLocale")) return;
  const field = createLocaleField("aiContentLocale", "aiContentLocaleHint");
  grid.prepend(field);
  const select = field.querySelector("select");
  select.value = pendingContentLocale;
  select.addEventListener("change", () => {
    pendingContentLocale = normalizeAssessmentLocale(select.value);
  });
}

function ensureEditorControl() {
  const stack = $("#editorView .editorSettingsBody .stack.compact");
  if (!stack || $("#quizContentLocale")) return;
  const field = createLocaleField("quizContentLocale", "quizContentLocaleHint");
  field.classList.add("editorAssessmentLocaleField");
  const gradeLabel = $("#quizGrade")?.closest("label");
  if (gradeLabel?.nextSibling) stack.insertBefore(field, gradeLabel.nextSibling);
  else stack.prepend(field);
  const select = field.querySelector("select");
  select.value = DEFAULT_CONTENT_LOCALE;
  select.addEventListener("change", async () => {
    const next = normalizeAssessmentLocale(select.value);
    if (next === loadedEditorLocale) return;

    let reference = null;
    let persistedQuiz = null;
    if (currentQuizCode) {
      try {
        const db = getFirestore(getApp());
        reference = doc(db, "quizzes", currentQuizCode);
        const snap = await getDoc(reference);
        if (snap.exists()) persistedQuiz = snap.data() || {};
      } catch (error) {
        // A brand-new manual draft may not exist in Firestore yet. In that case
        // keep the locale locally; app.js persists it with the first normal save.
        console.debug("Testsprache wird mit dem nächsten Speichern übernommen:", error?.code || error);
      }
    }

    if (persistedQuiz?.published === true && persistedQuiz?.ended !== true) {
      select.value = loadedEditorLocale;
      window.alert(uiText(
        "Die Testsprache kann während eines veröffentlichten Tests nicht geändert werden. Beende den Test zuerst.",
        "The test language cannot be changed while a published test is running. End the test first."
      ));
      return;
    }

    const accepted = window.confirm(uiText(
      "Testsprache ändern? Vorhandene Aufgaben und Lösungen werden nicht übersetzt. Die neue Sprache gilt für künftige KI-Erstellungen und Überarbeitungen dieses Tests.",
      "Change test language? Existing questions and solutions will not be translated. The new language applies to future AI generation and revisions for this test."
    ));
    if (!accepted) {
      select.value = loadedEditorLocale;
      return;
    }

    loadedEditorLocale = next;
    pendingContentLocale = next;
    if (!reference || !persistedQuiz) return;
    try {
      await setDoc(reference, {
        contentLocale: next,
        localeContractVersion: ASSESSMENT_LOCALE_SCHEMA_VERSION,
      }, { merge: true });
    } catch (error) {
      console.warn("Testsprache konnte nicht gespeichert werden:", error);
      window.alert(uiText(
        "Die Testsprache konnte nicht gespeichert werden. Bitte erneut versuchen.",
        "The test language could not be saved. Please try again."
      ));
    }
  });
}

async function loadEditorLocale(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) return;
  const token = ++editorLoadToken;
  currentQuizCode = normalizedCode;
  ensureEditorControl();
  const select = $("#quizContentLocale");
  if (!select) return;
  try {
    const db = getFirestore(getApp());
    const reference = doc(db, "quizzes", normalizedCode);
    const snap = await getDoc(reference);
    if (token !== editorLoadToken || !snap.exists()) return;
    const data = snap.data() || {};
    const hasExplicitLocale = SUPPORTED_CONTENT_LOCALES.includes(String(data.contentLocale || ""));
    const locale = normalizeAssessmentLocale(data.contentLocale, DEFAULT_CONTENT_LOCALE);
    loadedEditorLocale = locale;
    pendingContentLocale = locale;
    select.value = locale;

    // Controlled migration: legacy assessments were created while GradeCrew was
    // German-only. Make that contract explicit without translating any content.
    if (!hasExplicitLocale) {
      await setDoc(reference, {
        contentLocale: DEFAULT_CONTENT_LOCALE,
        gradingLocale: DEFAULT_CONTENT_LOCALE,
        localeContractVersion: ASSESSMENT_LOCALE_SCHEMA_VERSION,
      }, { merge: true });
    }
  } catch (error) {
    console.warn("Testsprache konnte nicht geladen werden:", error);
    loadedEditorLocale = DEFAULT_CONTENT_LOCALE;
    pendingContentLocale = DEFAULT_CONTENT_LOCALE;
    select.value = DEFAULT_CONTENT_LOCALE;
  }
}

function getContentLocale() {
  const editorView = $("#editorView");
  const editorSelect = $("#quizContentLocale");
  if (editorView && !editorView.classList.contains("hidden") && editorSelect) {
    return normalizeAssessmentLocale(editorSelect.value);
  }
  const aiView = $("#aiView");
  const aiSelect = $("#aiContentLocale");
  if (aiView && !aiView.classList.contains("hidden") && aiSelect) {
    return normalizeAssessmentLocale(aiSelect.value);
  }
  return normalizeAssessmentLocale(pendingContentLocale);
}

function setPendingContentLocale(locale) {
  pendingContentLocale = normalizeAssessmentLocale(locale);
  const aiSelect = $("#aiContentLocale");
  if (aiSelect) aiSelect.value = pendingContentLocale;
  return pendingContentLocale;
}

function observeEditorQuiz() {
  const editorView = $("#editorView");
  if (!editorView) return;
  const read = () => {
    const code = String(editorView.dataset.quizId || "").trim();
    if (code && code !== currentQuizCode) void loadEditorLocale(code);
  };
  new MutationObserver(read).observe(editorView, { attributes: true, attributeFilter: ["data-quiz-id", "class"] });
  read();
}

function install() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  ensureAiControl();
  ensureEditorControl();
  observeEditorQuiz();
  window.addEventListener("gradecrew:ui-locale-changed", refreshLocaleFieldCopy);
  refreshLocaleFieldCopy();
  window.GradeCrewAssessmentLocale = Object.freeze({
    defaultContentLocale: DEFAULT_CONTENT_LOCALE,
    supportedContentLocales: [...SUPPORTED_CONTENT_LOCALES],
    getContentLocale,
    setPendingContentLocale,
    get currentQuizCode() { return currentQuizCode; },
  });
}

install();
