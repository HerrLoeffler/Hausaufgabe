"use strict";

const DEFAULT_CONTENT_LOCALE = "de-DE";
const SUPPORTED_CONTENT_LOCALES = Object.freeze(["de-DE", "en-GB"]);
const MARKER_PATTERN = /\[\[GRADECREW_CONTENT_LOCALE=(de-DE|en-GB)\]\]/g;

function normalizeContentLocale(value, fallback = DEFAULT_CONTENT_LOCALE) {
  const raw = String(value || "").trim();
  if (/^en(?:-|$)/i.test(raw)) return "en-GB";
  if (/^de(?:-|$)/i.test(raw)) return "de-DE";
  return SUPPORTED_CONTENT_LOCALES.includes(fallback) ? fallback : DEFAULT_CONTENT_LOCALE;
}

function extractContentLocale(value = "", fallback = DEFAULT_CONTENT_LOCALE) {
  const match = String(value || "").match(/\[\[GRADECREW_CONTENT_LOCALE=(de-DE|en-GB)\]\]/);
  return normalizeContentLocale(match?.[1], fallback);
}

function stripContentLocaleMarker(value = "") {
  return String(value || "")
    .replace(MARKER_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function contentLanguageInstruction(locale = DEFAULT_CONTENT_LOCALE) {
  return normalizeContentLocale(locale) === "en-GB"
    ? "Verbindliche Inhaltssprache: Britisches Englisch (en-GB). Verfasse ALLE schülerseitigen Testtexte in natürlichem britischem Englisch: Titel, Fragen, Antwortoptionen, Lückentexte, Zuordnungen, Gruppen, Lösungen und Bild-Alternativtexte. Lehrerwünsche oder Systemregeln dürfen auf Deutsch vorliegen; sie bestimmen nicht die Ausgabesprache. Interne Enum-/Typwerte bleiben unverändert."
    : "Verbindliche Inhaltssprache: Deutsch (de-DE). Verfasse ALLE schülerseitigen Testtexte in natürlichem Deutsch: Titel, Fragen, Antwortoptionen, Lückentexte, Zuordnungen, Gruppen, Lösungen und Bild-Alternativtexte. Interne Enum-/Typwerte bleiben unverändert.";
}

module.exports = {
  DEFAULT_CONTENT_LOCALE,
  SUPPORTED_CONTENT_LOCALES,
  normalizeContentLocale,
  extractContentLocale,
  stripContentLocaleMarker,
  contentLanguageInstruction,
};
