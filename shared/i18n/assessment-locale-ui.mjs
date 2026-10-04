import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  ASSESSMENT_LOCALE_SCHEMA_VERSION,
  DEFAULT_CONTENT_LOCALE,
  SUPPORTED_CONTENT_LOCALES,
  normalizeAssessmentLocale,
} from "./assessment-locale.mjs";

let pendingContentLocale = DEFAULT_CONTENT_LOCALE;
let currentQuizCode = "";
let loadedEditorLocale = DEFAULT_CONTENT_LOCALE;
let installed = false;
let editorLoadToken = 0;

const $ = selector => document.querySelector(selector);

function optionMarkup() {
  return '<option value="de-DE">Deutsch (Deutschland)</option><option value="en-GB">English (UK)</option>';
}

function createLocaleField(id, hintId) {
  const label = document.createElement("label");
  label.className = "gradecrewAssessmentLocaleField span2";
  label.innerHTML = `Testsprache
    <select id="${id}" aria-describedby="${hintId}">${optionMarkup()}</select>
    <small id="${hintId}" class="hint">Legt die Sprache der Aufgaben und Lösungen fest. Die GradeCrew-Oberfläche kann unabhängig davon Deutsch oder Englisch sein.</small>`;
  return label;
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
    const accepted = window.confirm(
      "Testsprache ändern? Vorhandene Aufgaben und Lösungen werden nicht übersetzt. Die neue Sprache gilt für künftige KI-Erstellungen und Überarbeitungen dieses Tests."
    );
    if (!accepted) {
      select.value = loadedEditorLocale;
      return;
    }
    loadedEditorLocale = next;
    pendingContentLocale = next;
    if (!currentQuizCode) return;
    try {
      const db = getFirestore(getApp());
      await setDoc(doc(db, "quizzes", currentQuizCode), {
        contentLocale: next,
        gradingLocale: next,
        localeContractVersion: ASSESSMENT_LOCALE_SCHEMA_VERSION,
      }, { merge: true });
    } catch (error) {
      console.warn("Testsprache konnte nicht gespeichert werden:", error);
      window.alert("Die Testsprache konnte nicht gespeichert werden. Bitte erneut versuchen.");
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
  window.GradeCrewAssessmentLocale = Object.freeze({
    defaultContentLocale: DEFAULT_CONTENT_LOCALE,
    supportedContentLocales: [...SUPPORTED_CONTENT_LOCALES],
    getContentLocale,
    setPendingContentLocale,
    get currentQuizCode() { return currentQuizCode; },
  });
}

install();
