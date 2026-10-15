export const ASSESSMENT_LOCALE_SCHEMA_VERSION = 1;
export const DEFAULT_CONTENT_LOCALE = "de-DE";
export const SUPPORTED_CONTENT_LOCALES = Object.freeze(["de-DE", "en-GB"]);
export const CONTENT_LOCALE_MARKER_PREFIX = "[[GRADECREW_CONTENT_LOCALE=";
const CONTENT_LOCALE_MARKER_PATTERN = /\[\[GRADECREW_CONTENT_LOCALE=(de-DE|en-GB)\]\]/g;

export function normalizeAssessmentLocale(value, fallback = DEFAULT_CONTENT_LOCALE) {
  const raw = String(value || "").trim();
  if (/^en(?:-|$)/i.test(raw)) return "en-GB";
  if (/^de(?:-|$)/i.test(raw)) return "de-DE";
  return SUPPORTED_CONTENT_LOCALES.includes(fallback) ? fallback : DEFAULT_CONTENT_LOCALE;
}

// These labels belong to the fixed assessment content, never to the UI catalog.
const CONTENT_LABELS = Object.freeze({
  "de-DE": Object.freeze({ listeningTrueFalseInstruction: "Höre die Aufnahme. Entscheide: Richtig oder falsch?", missingListeningInstruction: "Diese Aufgabe ist noch nicht bereit. Die Lehrkraft muss den Arbeitsauftrag ergänzen.", listeningInstruction: "Höre dir die Aufnahme an und beantworte die Frage.", listeningImageInstruction: "Höre dir die Aufnahme unter dem Bild an und beantworte die Frage.", trueLabel: "Richtig", falseLabel: "Falsch", questionImage: "Abbildung zur Aufgabe", answerImage: "Antwortabbildung", answer: "Antwort", imageChoice: index => `Bild ${String.fromCharCode(65 + index)}` }),
  "en-GB": Object.freeze({ listeningTrueFalseInstruction: "Listen to the recording. Decide: true or false?", missingListeningInstruction: "This question is not ready yet. The teacher needs to add the task instructions.", listeningInstruction: "Listen to the recording and answer the question.", listeningImageInstruction: "Listen to the recording below the picture and answer the question.", trueLabel: "True", falseLabel: "False", questionImage: "Image for the question", answerImage: "Answer image", answer: "Answer", imageChoice: index => `Image ${String.fromCharCode(65 + index)}` }),
});

export function assessmentContentLabels(contentLocale) {
  return CONTENT_LABELS[normalizeAssessmentLocale(contentLocale)];
}

export function contentLocaleMarker(locale = DEFAULT_CONTENT_LOCALE) {
  return `${CONTENT_LOCALE_MARKER_PREFIX}${normalizeAssessmentLocale(locale)}]]`;
}

export function stripContentLocaleMarker(value = "") {
  return String(value || "")
    .replace(CONTENT_LOCALE_MARKER_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractContentLocale(value = "", fallback = DEFAULT_CONTENT_LOCALE) {
  const text = String(value || "");
  const match = text.match(/\[\[GRADECREW_CONTENT_LOCALE=(de-DE|en-GB)\]\]/);
  return normalizeAssessmentLocale(match?.[1], fallback);
}

export function withContentLocaleMarker(value = "", locale = DEFAULT_CONTENT_LOCALE) {
  const clean = stripContentLocaleMarker(value);
  return [clean, contentLocaleMarker(locale)].filter(Boolean).join("\n");
}

export function contentLanguageInstruction(locale = DEFAULT_CONTENT_LOCALE) {
  return normalizeAssessmentLocale(locale) === "en-GB"
    ? "Write every student-facing assessment text in natural British English. This includes the test title, question text, answer options, gap text, matching/group labels, solution text and image alt text. Keep canonical internal enum/type values unchanged."
    : "Verfasse alle schülerseitigen Prüfungsinhalte in natürlichem Deutsch. Dazu gehören Testtitel, Fragetexte, Antwortoptionen, Lückentexte, Zuordnungen/Gruppen, Lösungstexte und Bild-Alternativtexte. Interne kanonische Enum-/Typwerte bleiben unverändert.";
}

export function assessmentLocaleSnapshot(locale = DEFAULT_CONTENT_LOCALE, gradingLocale = locale) {
  const contentLocale = normalizeAssessmentLocale(locale);
  return Object.freeze({
    schemaVersion: ASSESSMENT_LOCALE_SCHEMA_VERSION,
    contentLocale,
    gradingLocale: normalizeAssessmentLocale(gradingLocale, contentLocale),
  });
}

// Known missing/procedural text is not a concrete question. This is deliberately
// a bounded check, not a semantic assessment of arbitrary school questions.
export function missingTaskInstruction(value) {
  const text = String(value || "").normalize("NFKC").toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return !text || /^(?:(?:der genaue )?arbeitsauftrag fehlt|(?:the )?task instructions are missing|diese aufgabe ist noch nicht bereit|this question is not ready yet)/u.test(text)
    || /^(?:bitte )?frage? deine lehrkraft$/u.test(text)
    || /^(?:please )?ask your teacher$/u.test(text)
    || ["höre dir die aufnahme an und beantworte die frage", "höre dir die aufnahme unter dem bild an und beantworte die frage", "listen to the recording and answer the question", "listen to the recording below the picture and answer the question"].includes(text);
}

export function listeningScript(intent = {}) {
  const script = String(intent.script || "").trim();
  const instruction = String(intent.instruction || "").trim();
  const spokenScript = script.replace(/\s+/g, " ");
  const spokenInstruction = instruction.replace(/\s+/g, " ");
  if (intent.presentation !== "listening-only" || !instruction || spokenScript.endsWith(spokenInstruction)) return script;
  return `${script}\n\n${instruction}`;
}
