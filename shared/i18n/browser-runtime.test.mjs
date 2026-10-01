import test from "node:test";
import assert from "node:assert/strict";
import {
  SOURCE_LOCALE,
  supportedUiLocales,
  isSupportedUiLocale,
  registerCatalog,
  setActiveUiLocale,
  getActiveUiLocale,
  t,
  translateSource,
  resolveBrowserUiLocale,
} from "./browser-runtime.mjs";

test("German remains the only enabled UI locale", () => {
  assert.equal(SOURCE_LOCALE, "de-DE");
  assert.deepEqual(supportedUiLocales(), ["de-DE"]);
  assert.equal(isSupportedUiLocale("de-DE"), true);
  assert.equal(isSupportedUiLocale("en-GB"), false);
});

test("unsupported browser/device locale falls back to German", () => {
  assert.equal(resolveBrowserUiLocale({ userLocale: "", schoolLocale: "", deviceLocale: "en-US" }), "de-DE");
  assert.equal(resolveBrowserUiLocale({ userLocale: "de-DE", deviceLocale: "en-US" }), "de-DE");
});

test("source text remains identical while only German is active", () => {
  setActiveUiLocale("de-DE");
  assert.equal(translateSource("Neuer Test"), "Neuer Test");
  assert.equal(translateSource("Noch {count} Aufgaben", { count: 3 }), "Noch 3 Aufgaben");
});

test("semantic messages preserve German fallback and interpolation", () => {
  registerCatalog("de-DE", { "system.loading": "GradeCrew wird geladen …", count: "{count} Aufgaben" });
  assert.equal(t("system.loading", {}, "fallback"), "GradeCrew wird geladen …");
  assert.equal(t("count", { count: 2 }), "2 Aufgaben");
});

test("unsupported UI locale cannot be activated accidentally", () => {
  assert.throws(() => setActiveUiLocale("en-US"), /not enabled/);
  assert.equal(getActiveUiLocale(), "de-DE");
});
