import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CONTENT_LOCALE,
  SUPPORTED_CONTENT_LOCALES,
  normalizeAssessmentLocale,
  contentLocaleMarker,
  stripContentLocaleMarker,
  extractContentLocale,
  withContentLocaleMarker,
  contentLanguageInstruction,
  assessmentLocaleSnapshot,
} from "./assessment-locale.mjs";

test("assessment locale supports German and British English independently from UI locale", () => {
  assert.equal(DEFAULT_CONTENT_LOCALE, "de-DE");
  assert.deepEqual(SUPPORTED_CONTENT_LOCALES, ["de-DE", "en-GB"]);
  assert.equal(normalizeAssessmentLocale("en-US"), "en-GB");
  assert.equal(normalizeAssessmentLocale("de-AT"), "de-DE");
});

test("content locale marker is deterministic, replaceable and invisible to teacher notes", () => {
  const marked = withContentLocaleMarker("Viele Alltagsbeispiele", "en-GB");
  assert.match(marked, /GRADECREW_CONTENT_LOCALE=en-GB/);
  assert.equal(extractContentLocale(marked), "en-GB");
  assert.equal(stripContentLocaleMarker(marked), "Viele Alltagsbeispiele");
  const changed = withContentLocaleMarker(marked, "de-DE");
  assert.equal(extractContentLocale(changed), "de-DE");
  assert.equal((changed.match(/GRADECREW_CONTENT_LOCALE/g) || []).length, 1);
  assert.equal(contentLocaleMarker("en-US"), "[[GRADECREW_CONTENT_LOCALE=en-GB]]");
});

test("assessment and grading locale snapshots can intentionally diverge", () => {
  const sameByDefault = assessmentLocaleSnapshot("en-GB");
  assert.equal(sameByDefault.contentLocale, "en-GB");
  assert.equal(sameByDefault.gradingLocale, "en-GB");

  const independent = assessmentLocaleSnapshot("en-GB", "de-DE");
  assert.equal(independent.contentLocale, "en-GB");
  assert.equal(independent.gradingLocale, "de-DE");
});

test("unsupported grading locale falls back to the fixed assessment content locale, never the UI locale", () => {
  const snapshot = assessmentLocaleSnapshot("en-GB", "fr-FR");
  assert.equal(snapshot.contentLocale, "en-GB");
  assert.equal(snapshot.gradingLocale, "en-GB");
});

test("content language instruction changes student-facing output language without changing enums", () => {
  const english = contentLanguageInstruction("en-GB");
  assert.match(english, /British English/);
  assert.match(english, /canonical internal enum\/type values unchanged/);
  const german = contentLanguageInstruction("de-DE");
  assert.match(german, /natürlichem Deutsch/);
});

test("generated assessment labels use content locale even with opposite UI and grading locales", async () => {
  const { assessmentContentLabels } = await import("./assessment-locale.mjs");
  const { setActiveUiLocale } = await import("./browser-runtime.mjs");
  setActiveUiLocale("de-DE");
  const english = assessmentContentLabels("en-GB");
  assert.equal(english.trueLabel, "True");
  assert.equal(english.falseLabel, "False");
  assert.equal(english.imageChoice(0), "Image A");
  assert.equal(english.imageChoice(1), "Image B");
  assert.equal(english.questionImage, "Image for the question");
  assert.equal(english.answerImage, "Answer image");
  setActiveUiLocale("en-GB");
  const german = assessmentContentLabels("de-DE");
  assert.equal(german.trueLabel, "Richtig");
  assert.equal(german.falseLabel, "Falsch");
  assert.equal(german.imageChoice(0), "Bild A");
  assert.equal(german.questionImage, "Abbildung zur Aufgabe");
  for (const missing of [undefined, null, "", "fr-FR"]) {
    assert.equal(assessmentContentLabels(missing).trueLabel, "Richtig");
  }
  assert.equal(assessmentContentLabels("en-US").trueLabel, "True");
  setActiveUiLocale("de-DE");
});
