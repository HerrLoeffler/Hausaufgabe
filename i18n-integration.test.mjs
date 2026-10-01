import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");

const startup = read("./startup.js");
const secureHtml = read("./secure-student.html");
const build = read("./tools/build-staging.mjs");
const browserRuntime = read("./shared/i18n/browser-runtime.mjs");
const germanCatalog = read("./shared/i18n/messages-de-DE.mjs");

test("teacher app installs shared i18n before importing the core app", () => {
  const i18nIndex = startup.indexOf('from "./shared/i18n/bootstrap.mjs?v=1"');
  const appIndex = startup.indexOf('await import("./app.js?v=2.3.1-gc28")');
  assert.ok(i18nIndex >= 0, "startup must import the shared i18n bootstrap");
  assert.ok(appIndex > i18nIndex, "i18n must be ready before app.js starts");
});

test("secure student entry installs i18n before student runtime", () => {
  const i18nIndex = secureHtml.indexOf('./shared/i18n/bootstrap.mjs');
  const studentIndex = secureHtml.indexOf('./secure-student.js');
  assert.ok(i18nIndex >= 0, "secure student page must load the i18n bootstrap");
  assert.ok(studentIndex > i18nIndex, "i18n bootstrap must precede secure-student.js");
});

test("verified staging build ships every i18n runtime dependency", () => {
  for (const path of [
    "shared/i18n/i18n-core.mjs",
    "shared/i18n/browser-runtime.mjs",
    "shared/i18n/messages-de-DE.mjs",
    "shared/i18n/bootstrap.mjs",
  ]) {
    assert.match(build, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${path} missing from staging build`);
  }
});

test("German is the only enabled browser UI locale before language two", () => {
  assert.match(browserRuntime, /SUPPORTED_BROWSER_UI_LOCALES\s*=\s*Object\.freeze\(\["de-DE"\]\)/);
  assert.doesNotMatch(browserRuntime, /SUPPORTED_BROWSER_UI_LOCALES[^\n]*en-/);
  assert.match(germanCatalog, /DE_DE_MESSAGES_VERSION\s*=\s*"de-DE@1"/);
});

test("the migration does not introduce a second locale catalog", () => {
  const entries = fs.readdirSync(new URL("./shared/i18n/", import.meta.url));
  const messageCatalogs = entries.filter(name => /^messages-.*\.mjs$/.test(name));
  assert.deepEqual(messageCatalogs, ["messages-de-DE.mjs"]);
});
