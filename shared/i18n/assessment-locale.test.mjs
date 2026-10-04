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

test("content language instruction changes student-facing output language without changing enums", () => {
  const english = contentLanguageInstruction("en-GB");
  assert.match(english, /British English/);
  assert.match(english, /canonical internal enum\/type values unchanged/);
  const german = contentLanguageInstruction("de-DE");
  assert.match(german, /natürlichem Deutsch/);
});
