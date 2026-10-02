import test from "node:test";
import assert from "node:assert/strict";
import {
  SOURCE_LOCALE,
  supportedUiLocales,
  isSupportedUiLocale,
  registerCatalog,
  registerSourcePatterns,
  setActiveUiLocale,
  getActiveUiLocale,
  t,
  translateSource,
  resolveBrowserUiLocale,
  PROTECTED_CONTENT_SELECTORS,
} from "./browser-runtime.mjs";

registerCatalog("de-DE", { "system.loading": "GradeCrew wird geladen …", count: "{count} Aufgaben" });
registerCatalog("en-GB", {
  "system.loading": "GradeCrew is loading …",
  count: "{count} questions",
  "source:Neuer Test": "New test",
  "source:Speichern": "Save",
});
registerSourcePatterns("en-GB", [
  { pattern: /^Aufgabe (\d+)$/, replacement: "Question $1" },
  { pattern: /^Antwort: (.*)$/s, replacement: "Answer: $1" },
]);

test("German and English are enabled UI locales", () => {
  assert.equal(SOURCE_LOCALE, "de-DE");
  assert.deepEqual(supportedUiLocales(), ["de-DE", "en-GB"]);
  assert.equal(isSupportedUiLocale("de-DE"), true);
  assert.equal(isSupportedUiLocale("en-GB"), true);
  assert.equal(isSupportedUiLocale("en-US"), true);
  assert.equal(isSupportedUiLocale("fr-FR"), false);
});

test("English browser/device locale resolves to en-GB while unsupported languages fall back to German", () => {
  assert.equal(resolveBrowserUiLocale({ userLocale: "en-US", schoolLocale: "", deviceLocale: "de-DE" }), "en-GB");
  assert.equal(resolveBrowserUiLocale({ userLocale: "", schoolLocale: "", deviceLocale: "en-US" }), "en-GB");
  assert.equal(resolveBrowserUiLocale({ userLocale: "fr-FR", schoolLocale: "", deviceLocale: "fr-FR" }), "de-DE");
});

test("English translates exact UI source strings and dynamic UI patterns", () => {
  setActiveUiLocale("en-GB");
  assert.equal(translateSource("Neuer Test"), "New test");
  assert.equal(translateSource("Aufgabe 3"), "Question 3");
  assert.equal(translateSource("Antwort: London"), "Answer: London");
  assert.equal(t("count", { count: 2 }), "2 questions");
});

test("switching back to German restores source behavior", () => {
  setActiveUiLocale("en-US");
  assert.equal(getActiveUiLocale(), "en-GB");
  assert.equal(translateSource("Speichern"), "Save");
  setActiveUiLocale("de-DE");
  assert.equal(getActiveUiLocale(), "de-DE");
  assert.equal(translateSource("Speichern"), "Speichern");
  assert.equal(translateSource("Aufgabe 3"), "Aufgabe 3");
  assert.equal(t("system.loading", {}, "fallback"), "GradeCrew wird geladen …");
});

test("unsupported UI locale cannot be activated accidentally", () => {
  assert.throws(() => setActiveUiLocale("fr-FR"), /not enabled/);
  assert.equal(getActiveUiLocale(), "de-DE");
});

test("assessment and user-authored content selectors remain explicitly protected", () => {
  for (const selector of [
    "#secureTitle",
    "#secureDescription",
    "#secureQuestions .secureChoice > span > span",
    ".quizCard h3",
    "#editorHeading",
    "#resultsHeading",
    "#reviewHeading",
    "#announcementDialogText",
  ]) {
    assert.ok(PROTECTED_CONTENT_SELECTORS.includes(selector), `missing protected content selector: ${selector}`);
  }
});
