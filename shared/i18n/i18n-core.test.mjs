import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  SUPPORTED_UI_LOCALES,
  canonicalizeLocale,
  createAssessmentLocaleSnapshot,
  createLocaleContext,
  formatLocaleNumber,
  normalizeContentLocale,
  parseLocaleNumber,
  resolveUiLocale,
} from "./i18n-core.mjs";

test("foundation exposes German and British English UI locales", () => {
  assert.equal(DEFAULT_LOCALE, "de-DE");
  assert.deepEqual(SUPPORTED_UI_LOCALES, ["de-DE", "en-GB"]);
  assert.equal(canonicalizeLocale("de-de"), "de-DE");
  assert.equal(canonicalizeLocale("en-gb"), "en-GB");
  assert.equal(canonicalizeLocale("not_a_locale"), null);
});

test("UI locale resolution follows user -> school -> device -> default", () => {
  assert.deepEqual(resolveUiLocale({ userLocale: "en-US", schoolLocale: "de-DE", deviceLocale: "fr-FR" }), {
    locale: "en-GB", source: "user", requestedLocale: "en-US", fallbackUsed: true,
  });
  assert.deepEqual(resolveUiLocale({ userLocale: "fr-FR", schoolLocale: "de-AT" }), {
    locale: "de-DE", source: "school", requestedLocale: "de-AT", fallbackUsed: true,
  });
  assert.equal(resolveUiLocale({ userLocale: "fr-FR", schoolLocale: "it-IT" }).locale, "de-DE");
});

test("content and grading locale remain separate from UI locale", () => {
  const germanUiEnglishAssessment = createLocaleContext({
    uiLocale: "de-DE",
    contentLocale: "en-GB",
    gradingLocale: "en-GB",
    educationContextId: "DE-BY",
  });
  assert.equal(germanUiEnglishAssessment.uiLocale, "de-DE");
  assert.equal(germanUiEnglishAssessment.contentLocale, "en-GB");
  assert.equal(germanUiEnglishAssessment.gradingLocale, "en-GB");

  const englishUiGermanAssessment = createLocaleContext({
    uiLocale: "en-GB",
    contentLocale: "de-DE",
    gradingLocale: "de-DE",
    educationContextId: "DE-BY",
  });
  assert.equal(englishUiGermanAssessment.uiLocale, "en-GB");
  assert.equal(englishUiGermanAssessment.contentLocale, "de-DE");
  assert.equal(englishUiGermanAssessment.gradingLocale, "de-DE");
  assert.equal(normalizeContentLocale("fr-fr"), "fr-FR");
});

test("assessment locale snapshot is explicit and reproducible", () => {
  const snapshot = createAssessmentLocaleSnapshot({
    localeContext: { uiLocale: "en-GB", contentLocale: "de-DE", gradingLocale: "de-DE" },
    gradingPolicyVersion: "grading@7",
    curriculumVersion: "de-by-ms@2026",
    createdAt: "2026-10-02T00:00:00.000Z",
  });
  assert.deepEqual(snapshot, {
    schemaVersion: 1,
    uiLocale: "en-GB",
    contentLocale: "de-DE",
    gradingLocale: "de-DE",
    educationContextId: "DE-BY",
    timeZone: "Europe/Berlin",
    messagesVersion: "en-GB@1",
    gradingPolicyVersion: "grading@7",
    curriculumVersion: "de-by-ms@2026",
    createdAt: "2026-10-02T00:00:00.000Z",
  });
  assert.equal(Object.isFrozen(snapshot), true);
});

test("German number parsing accepts locale form and rejects ambiguous decimal input", () => {
  assert.deepEqual(parseLocaleNumber("1,5", "de-DE"), { ok: true, value: 1.5, normalized: "1.5" });
  assert.deepEqual(parseLocaleNumber("1.500,25", "de-DE"), { ok: true, value: 1500.25, normalized: "1500.25" });
  assert.deepEqual(parseLocaleNumber("1.5", "de-DE"), { ok: false, reason: "ambiguous-separator" });
  assert.equal(formatLocaleNumber(1.5, "de-DE"), "1,5");
});

test("English number parsing stays independent from German formatting", () => {
  assert.deepEqual(parseLocaleNumber("1.5", "en-GB"), { ok: true, value: 1.5, normalized: "1.5" });
  assert.deepEqual(parseLocaleNumber("1,500.25", "en-GB"), { ok: true, value: 1500.25, normalized: "1500.25" });
  assert.deepEqual(parseLocaleNumber("1,5", "en-GB"), { ok: false, reason: "ambiguous-separator" });
  assert.equal(formatLocaleNumber(1.5, "en-GB"), "1.5");
});
