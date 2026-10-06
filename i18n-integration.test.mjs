import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");

const startup = read("./startup.js");
const entryFlow = read("./gradecrew-entry-flow.js");
const secureHtml = read("./secure-student.html");
const build = read("./tools/build-staging.mjs");
const browserRuntime = read("./shared/i18n/browser-runtime.mjs");
const core = read("./shared/i18n/i18n-core.mjs");
const germanCatalog = read("./shared/i18n/messages-de-DE.mjs");
const englishCatalog = read("./shared/i18n/messages-en-GB.mjs");
const englishCrewExtension = read("./shared/i18n/extensions-en-GB-crew.mjs");
const bootstrap = read("./shared/i18n/bootstrap.mjs");
const assessmentLocale = read("./shared/i18n/assessment-locale.mjs");
const assessmentLocaleUi = read("./shared/i18n/assessment-locale-ui.mjs");
const aiClient = read("./ai-client.js");
const aiPrompts = read("./functions/lib/prompts.js");
const aiJob = read("./functions/lib/ai-job.js");
const visualEnhancements = read("./visual-enhancements.js");
const remyHelp = read("./remy-ai-help.js");
const crewUi = read("./crew-assistant-ui.js");
const crewWrapper = read("./crew-assistant-core.js");
const crewServer = read("./functions/lib/crew-assistant.js");
const crewMain = read("./functions/main.js");
const app = read("./app.js");
const workspaceCss = read("./workspace.css");

test("teacher app installs shared i18n before importing the core app", () => {
  const i18nIndex = startup.indexOf('from "./shared/i18n/bootstrap.mjs?v=3"');
  const appIndex = startup.indexOf('await import("./app.js?v=2.3.1-gc28-i18n4")');
  assert.ok(i18nIndex >= 0, "startup must import the shared i18n bootstrap");
  assert.ok(appIndex > i18nIndex, "i18n must be ready before app.js starts");
});

test("secure student entry installs i18n before student runtime", () => {
  const i18nIndex = secureHtml.indexOf('./shared/i18n/bootstrap.mjs');
  const studentIndex = secureHtml.indexOf('./secure-student.js');
  assert.ok(i18nIndex >= 0, "secure student page must load the i18n bootstrap");
  assert.ok(studentIndex > i18nIndex, "i18n bootstrap must precede secure-student.js");
});

test("verified staging build ships both locale catalogs and every i18n runtime dependency", () => {
  for (const path of [
    "shared/i18n/i18n-core.mjs",
    "shared/i18n/browser-runtime.mjs",
    "shared/i18n/messages-de-DE.mjs",
    "shared/i18n/messages-en-GB.mjs",
    "shared/i18n/extensions-en-GB-crew.mjs",
    "shared/i18n/assessment-locale.mjs",
    "shared/i18n/assessment-locale-ui.mjs",
    "shared/i18n/bootstrap.mjs",
  ]) {
    assert.match(build, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${path} missing from staging build`);
  }
});

test("German and English are enabled browser UI locales", () => {
  assert.match(core, /SUPPORTED_UI_LOCALES\s*=\s*Object\.freeze\(\[DEFAULT_LOCALE,\s*"en-GB"\]\)/);
  assert.match(browserRuntime, /SUPPORTED_BROWSER_UI_LOCALES\s*=\s*Object\.freeze\(\[SOURCE_LOCALE,\s*ENGLISH_LOCALE\]\)/);
  assert.match(germanCatalog, /DE_DE_MESSAGES_VERSION\s*=\s*"de-DE@2"/);
  assert.match(englishCatalog, /EN_GB_MESSAGES_VERSION\s*=\s*"en-GB@2"/);
  assert.match(bootstrap, /registerCatalog\("en-GB", enGBMessages\)/);
  assert.match(bootstrap, /registerCatalog\("en-GB", enGBCrewMessages\)/);
  assert.match(bootstrap, /registerSourcePatterns\("en-GB", enGBSourcePatterns\)/);
  assert.match(bootstrap, /registerSourcePatterns\("en-GB", enGBCrewSourcePatterns\)/);
  assert.match(englishCrewExtension, /Ask Coco/);
});

test("public navigation uses semantic keys so rerenders do not depend on German source matching", () => {
  for (const [key, fallback] of [
    ["nav.features", "Funktionen"],
    ["nav.crew", "Die Crew"],
    ["nav.teachers", "Für Lehrkräfte"],
    ["nav.help", "Hilfe"],
  ]) {
    assert.ok(entryFlow.includes(`data-i18n-key="${key}"`), "missing semantic nav key: " + key);
    assert.ok(entryFlow.includes(`data-i18n-fallback="${fallback}"`), "missing German fallback: " + fallback);
    assert.ok(germanCatalog.includes(`"${key}"`), "German semantic nav label missing: " + key);
    assert.ok(englishCatalog.includes(`"${key}"`), "English semantic nav label missing: " + key);
  }
});

test("public startscreen copy is covered by the English UI catalog without translating assessment content", () => {
  for (const sourceText of [
    "Funktionen",
    "Die Crew",
    "Hilfe",
    "Hi! Ich bin Coco.",
    "Willkommen bei GradeCrew.",
    "Digitale Tests, schnell & einfach.",
    "Crew kennenlernen",
    "Direkt anmelden",
    "Schüler? Testcode eingeben.",
    "Schnell erstellt",
    "Einfach durchgeführt",
    "Direkt ausgewertet",
    "Für Lehrkräfte gemacht",
    "Wie dürfen wir dich nennen?",
    "Tutorial beginnen",
    "Möchtest du deinen Fortschritt speichern?",
    "Mit GradeCrew loslegen",
    "Coco, dein GradeCrew-Guide",
    "Praxisnah. Sicher. Zuverlässig.",
  ]) {
    const entrySourceText = sourceText === "Digitale Tests, schnell & einfach."
      ? "Digitale Tests, schnell &amp; einfach."
      : sourceText;
    assert.ok(entryFlow.includes(entrySourceText), "entry source missing: " + sourceText);
    assert.ok(englishCatalog.includes(sourceText), "English startscreen translation missing: " + sourceText);
  }
  assert.match(englishCatalog, /Schön, dass du da bist/);
  assert.match(englishCatalog, /keine Daten gespeichert/);
});
test("English activation does not collapse UI, assessment content and grading language into one setting", () => {
  assert.match(core, /uiLocale:/);
  assert.match(core, /contentLocale:/);
  assert.match(core, /gradingLocale:/);
  assert.match(browserRuntime, /PROTECTED_CONTENT_SELECTORS/);
  assert.match(browserRuntime, /#secureTitle/);
  assert.match(browserRuntime, /\.quizCard h3/);
  assert.match(browserRuntime, /#reviewHeading/);
  assert.match(browserRuntime, /\.gcCrewMsg\.user/);
  assert.doesNotMatch(englishCatalog, /source:Richtig"/);
  assert.doesNotMatch(englishCatalog, /source:Falsch"/);
});

test("Crew AI reply locale is explicit and does not become assessment language", () => {
  assert.match(crewServer, /SUPPORTED_ASSISTANT_LOCALES/);
  assert.match(crewServer, /Reply in natural British English/);
  assert.match(crewServer, /Fach, Testinhalt, Aufgaben, Lösungen und Bewertungssprache sind davon getrennt/);
  assert.match(crewMain, /crewSystemPrompt\(clean\.crewId, clean\.uiLocale\)/);
  assert.match(crewMain, /uiLocale: clean\.uiLocale/);
});

test("exactly German and English base message catalogs exist for the first bilingual release", () => {
  const entries = fs.readdirSync(new URL("./shared/i18n/", import.meta.url));
  const messageCatalogs = entries.filter(name => /^messages-.*\.mjs$/.test(name)).sort();
  assert.deepEqual(messageCatalogs, ["messages-de-DE.mjs", "messages-en-GB.mjs"]);
});


test("assessment language remains fixed per test and is not coupled to UI or grading locale", () => {
  assert.match(assessmentLocale, /SUPPORTED_CONTENT_LOCALES.*de-DE.*en-GB/s);
  assert.match(assessmentLocale, /assessmentLocaleSnapshot\(locale = DEFAULT_CONTENT_LOCALE, gradingLocale = locale\)/);
  assert.doesNotMatch(assessmentLocaleUi, /contentLocale: next,\s*gradingLocale: next/);
  assert.match(assessmentLocaleUi, /Vorhandene Aufgaben und Lösungen werden nicht übersetzt/);
  assert.match(assessmentLocaleUi, /Change test language\?/);
  assert.match(assessmentLocaleUi, /Test language/);
  assert.match(assessmentLocaleUi, /gradecrew:ui-locale-changed/);
  assert.match(aiClient, /withContentLocaleMarker/);
  assert.match(aiClient, /generateTest.*withGenerationLocale/);
  assert.match(aiPrompts, /contentLanguageInstruction\(contentLocale\)/);
  assert.match(aiJob, /contentLocale,/);
  assert.match(aiJob, /gradingLocale,/);
});




test("bilingual header gives the language selector a stable layout slot", () => {
  assert.match(browserRuntime, /gradecrewLanguageReady/);
  assert.match(browserRuntime, /grid-template-areas:"brand nav language" "user user user"/);
  assert.match(browserRuntime, />#gradecrewLanguageControl\{grid-area:language;justify-self:end\}/);
  assert.doesNotMatch(browserRuntime, /gradecrewLanguageControl\{[^}]*margin-left:8px/);
});

test("dynamic AI review and student-preview copy is covered in English", () => {
  for (const sourceText of [
    "Entwurf prüfen",
    "Teilentwurf öffnen",
    "KI-Entwurf prüfen",
    "Prüfung abgeschlossen",
    "Vorschau als Schüler",
    "Vorschau auswerten",
    "Vorschau ausgewertet – keine Abgabe gespeichert.",
  ]) {
    assert.ok(englishCatalog.includes(sourceText), "English dynamic translation missing: " + sourceText);
  }
});

test("teacher student preview evaluates locally and never creates a real submission", () => {
  assert.match(app, /submitStudentQuiz\(e, quiz, questions, \{ ownerPreview \}\)/);
  assert.match(app, /if \(ownerPreview\) \{[\s\S]*renderStudentResult\([\s\S]*preview: true[\s\S]*Vorschau ausgewertet – keine Abgabe gespeichert\.[\s\S]*return;/);
  const previewBranch = app.indexOf("if (ownerPreview) {", app.indexOf("async function submitStudentQuiz"));
  const submissionWrite = app.indexOf('addDoc(collection(db, "quizzes", quiz.id, "submissions")', previewBranch);
  assert.ok(previewBranch >= 0 && submissionWrite > previewBranch, "preview branch must exit before a submission write");
  assert.match(app, /studentPreviewNotice/);
  assert.match(workspaceCss, /\.studentPreviewNotice/);
});

test("assessment locale survives normal saves and cannot silently change during an active published test", () => {
  assert.match(app, /contentLocale,\s*gradingLocale,\s*localeContractVersion:/);
  assert.match(app, /contentLocale: source\.contentLocale/);
  assert.match(app, /contentLocale: quiz\.contentLocale/);
  assert.match(app, /const contentLocale = q\.contentLocale \|\| "de-DE"/);
  assert.match(app, /contentLocale, gradingLocale, localeContractVersion,/);
  assert.match(assessmentLocaleUi, /persistedQuiz\?\.published === true && persistedQuiz\?\.ended !== true/);
  assert.match(assessmentLocaleUi, /The test language cannot be changed while a published test is running/);
  assert.match(assessmentLocaleUi, /brand-new manual draft may not exist in Firestore yet/);
});

test("bilingual browser module graph is cache-busted consistently", () => {
  assert.match(startup, /bootstrap\.mjs\?v=3/);
  assert.match(startup, /gradecrew-entry-flow\.js\?v=5/);
  assert.match(startup, /assessment-locale-ui\.mjs\?v=3/);
  assert.match(secureHtml, /bootstrap\.mjs\?v=3/);
  assert.match(bootstrap, /browser-runtime\.mjs\?v=3/);
  assert.match(bootstrap, /messages-de-DE\.mjs\?v=3/);
  assert.match(bootstrap, /messages-en-GB\.mjs\?v=3/);
  assert.match(visualEnhancements, /remy-ai-help\.js\?v=4/);
  assert.match(visualEnhancements, /crew-assistant-ui\.js\?v=4/);
  assert.match(remyHelp, /crew-assistant-core\.js\?v=4/);
  assert.match(crewUi, /crew-assistant-core\.js\?v=4/);
  assert.match(crewWrapper, /crew-assistant-core\.mjs\?v=4/);
});
