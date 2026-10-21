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
import { enGBMessages, enGBSourcePatterns, EN_GB_MESSAGES_VERSION } from "./messages-en-GB.mjs";

registerCatalog("de-DE", { "system.loading": "GradeCrew wird geladen …", count: "{count} Aufgaben" });
registerCatalog("en-GB", { ...enGBMessages, count: "{count} questions" });
registerSourcePatterns("en-GB", enGBSourcePatterns);

test("German and English are enabled UI locales", () => {
  assert.equal(SOURCE_LOCALE, "de-DE");
  assert.equal(EN_GB_MESSAGES_VERSION, "en-GB@2");
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

test("English translates real GradeCrew UI strings and dynamic UI patterns", () => {
  setActiveUiLocale("en-GB");
  assert.equal(translateSource("+ Neuer Test"), "+ New test");
  assert.equal(translateSource("Speichern"), "Save");
  assert.equal(translateSource("Aufgabe 3"), "Question 3");
  assert.equal(translateSource("Antwort: London"), "Answer: London");
  assert.equal(translateSource("Entwurf prüfen"), "Review draft");
  assert.equal(translateSource("Vorschau auswerten"), "Evaluate preview");
  assert.equal(translateSource("Alles bearbeitet. Vorschau jetzt auswerten?"), "Everything is complete. Evaluate the preview now?");
  assert.equal(translateSource("2 Aufgaben sind noch offen. Vorschau trotzdem auswerten?"), "2 questions are still unanswered. Evaluate the preview anyway?");
  assert.equal(t("system.loading", {}, "fallback"), "GradeCrew is loading …");
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
