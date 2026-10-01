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

test("foundation exposes only de-DE as active UI locale", () => {
  assert.equal(DEFAULT_LOCALE, "de-DE");
  assert.deepEqual(SUPPORTED_UI_LOCALES, ["de-DE"]);
  assert.equal(canonicalizeLocale("de-de"), "de-DE");
  assert.equal(canonicalizeLocale("not_a_locale"), null);
});

test("UI locale resolution follows user -> school -> device -> default", () => {
  assert.deepEqual(resolveUiLocale({ userLocale: "de-DE", schoolLocale: "en-GB", deviceLocale: "fr-FR" }), {
    locale: "de-DE", source: "user", requestedLocale: "de-DE", fallbackUsed: false,
  });
  assert.deepEqual(resolveUiLocale({ userLocale: "en-GB", schoolLocale: "de-AT" }), {
    locale: "de-DE", source: "school", requestedLocale: "de-AT", fallbackUsed: true,
  });
  assert.equal(resolveUiLocale({ userLocale: "en-GB", schoolLocale: "fr-FR" }).locale, "de-DE");
});

test("content and grading locale remain separate from UI locale", () => {
  const context = createLocaleContext({
    uiLocale: "de-DE",
    contentLocale: "en-GB",
    gradingLocale: "en-GB",
    educationContextId: "DE-BY",
  });
  assert.equal(context.uiLocale, "de-DE");
  assert.equal(context.contentLocale, "en-GB");
  assert.equal(context.gradingLocale, "en-GB");
  assert.equal(normalizeContentLocale("fr-fr"), "fr-FR");
});

test("assessment locale snapshot is explicit and reproducible", () => {
  const snapshot = createAssessmentLocaleSnapshot({
    localeContext: { uiLocale: "de-DE", contentLocale: "en-GB", gradingLocale: "en-GB" },
    messagesVersion: "de-DE@1",
    gradingPolicyVersion: "grading@7",
    curriculumVersion: "de-by-ms@2026",
    createdAt: "2026-10-02T00:00:00.000Z",
  });
  assert.deepEqual(snapshot, {
    schemaVersion: 1,
    uiLocale: "de-DE",
    contentLocale: "en-GB",
    gradingLocale: "en-GB",
    educationContextId: "DE-BY",
    timeZone: "Europe/Berlin",
    messagesVersion: "de-DE@1",
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
});
