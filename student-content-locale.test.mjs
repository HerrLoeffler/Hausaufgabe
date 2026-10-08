import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import * as assessmentLocale from "./shared/i18n/assessment-locale.mjs";
import { setActiveUiLocale, registerCatalog } from "./shared/i18n/browser-runtime.mjs";
import { enGBMessages, enGBSourcePatterns } from "./shared/i18n/messages-en-GB.mjs";
import { registerSourcePatterns } from "./shared/i18n/browser-runtime.mjs";
const require = createRequire(import.meta.url);
const { JSDOM } = require("./tools/ui/node_modules/jsdom");
const legacy = fs.readFileSync("app.js", "utf8");
const secure = fs.readFileSync("secure-student.js", "utf8");
registerCatalog("en-GB", enGBMessages);
registerSourcePatterns("en-GB", enGBSourcePatterns);

function render(runtime, quiz, questions) {
  const dom = new JSDOM('<div id="studentQuestions"></div><div id="secureQuestions"></div>', { url: "https://example.test" });
  const document = dom.window.document;
  const context = vm.createContext({ document, currentQuiz: quiz, quiz, questions,
    ownerPreview: true, ...assessmentLocale,
    $: id => document.getElementById(id),
    escapeHtml: value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]),
    getQuestionImageSrc: q => q.imageDataUrl || q.imageUrl,
    studentOptionEntries: (_, q) => q.options.map((option, originalIndex) => ({ option, originalIndex })).reverse(),
  });
  if (runtime === "legacy") {
    const mathStart = legacy.indexOf("function formatMathText(");
    vm.runInContext(legacy.slice(mathStart, legacy.indexOf("\nfunction ", mathStart + 1)), context);
    const start = legacy.indexOf('const qRoot = $("studentQuestions");', legacy.indexOf("function renderStudentQuiz"));
    const end = legacy.indexOf("  setupStudentProgress(questions);", start);
    vm.runInContext(`function renderQuestions() { ${legacy.slice(start, end)} }; renderQuestions();`, context);
  } else {
    const start = secure.indexOf("function questionShell");
    const end = secure.indexOf("function collectQuestionAnswer", start);
    vm.runInContext(secure.slice(start, end), context);
    const root = document.getElementById("secureQuestions");
    questions.forEach((q, index) => root.appendChild(context.renderQuestion(q, index)));
  }
  return dom;
}

for (const runtime of ["legacy", "secure"]) {
  for (const [contentLocale, uiLocale, expected] of [["en-GB", "de-DE", ["True", "False"]], ["de-DE", "en-GB", ["Richtig", "Falsch"]], [undefined, "en-GB", ["Richtig", "Falsch"]]]) {
    test(`${runtime}: true/false follows ${contentLocale || "legacy German default"} under ${uiLocale} UI`, async () => {
      setActiveUiLocale(uiLocale);
      const quiz = { contentLocale, gradingLocale: uiLocale };
      const question = { id: "tf", type: "truefalse", text: "Original question", points: 1 };
      const before = JSON.stringify({ quiz, question });
      const dom = render(runtime, quiz, [question]);
      assert.deepEqual([...dom.window.document.querySelectorAll('label > span')].map(x => x.textContent), expected);
      assert.deepEqual([...dom.window.document.querySelectorAll('input')].map(x => x.value), ["true", "false"]);
      dom.window.document.querySelector('input[value="false"]').checked = true;
      for (const key of ["document", "NodeFilter", "MutationObserver"]) globalThis[key] = dom.window[key];
      // The real DOM translator must leave these content labels and answer state intact.
      setActiveUiLocale(uiLocale === "en-GB" ? "de-DE" : "en-GB");
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.deepEqual([...dom.window.document.querySelectorAll('label > span')].map(x => x.textContent), expected);
      assert.equal(dom.window.document.querySelector('input[value="false"]').checked, true);
      assert.equal(JSON.stringify({ quiz, question }), before);
      setActiveUiLocale("de-DE");
      for (const key of ["document", "NodeFilter", "MutationObserver"]) delete globalThis[key];
      dom.window.close();
    });
  }

  test(`${runtime}: image labels follow content locale while IDs and authored descriptions survive`, () => {
    const question = runtime === "legacy"
      ? { id: "images", type: "single", text: "Original question", imageChoicesOnly: true, imageUrl: "https://example.test/q.png", imageAlt: "Authored question alt", options: [
          { text: "original A", imageDataUrl: "data:image/png;base64,AA", imageAlt: "Authored A" },
          { text: "original B", imageDataUrl: "data:image/png;base64,BB", imageAlt: "Authored B" }] }
      : { id: "images", type: "single", text: "Original question", imageChoicesOnly: true, image: { src: "https://example.test/q.png", alt: "Authored question alt" }, options: [
          { id: "opaque-b", text: "original B", image: { src: "https://example.test/b.png", alt: "Authored B" } },
          { id: "opaque-a", text: "original A", image: { src: "https://example.test/a.png", alt: "Authored A" } }] };
    const before = JSON.stringify(question);
    const dom = render(runtime, { contentLocale: "en-GB" }, [question]);
    const doc = dom.window.document;
    assert.deepEqual([...doc.querySelectorAll("label > span")].map(x => x.textContent), ["Image A", "Image B"]);
    assert.deepEqual([...doc.querySelectorAll("input")].map(x => x.value), runtime === "legacy" ? ["1", "0"] : ["opaque-b", "opaque-a"]);
    assert.equal(doc.querySelector("img").alt, "Authored question alt");
    assert.deepEqual([...doc.querySelectorAll("label img")].map(x => x.alt), ["Authored B", "Authored A"]);
    assert.equal(JSON.stringify(question), before);
    dom.window.close();
  });

  test(`${runtime}: absent question and choice image descriptions get English fallbacks`, () => {
    const question = runtime === "legacy"
      ? { id: "q", type: "single", text: "Authored text", imageUrl: "https://example.test/q.png", options: [{ text: "Untranslated choice", imageDataUrl: "data:image/png;base64,AA" }] }
      : { id: "q", type: "single", text: "Authored text", image: { src: "https://example.test/q.png" }, options: [{ id: "opaque", text: "Untranslated choice", image: { src: "https://example.test/a.png" } }] };
    const dom = render(runtime, { contentLocale: "en-GB" }, [question]);
    const images = [...dom.window.document.querySelectorAll("img")];
    assert.equal(images[0].alt, "Image for the question");
    assert.equal(images[1].alt, "Answer image");
    assert.equal(dom.window.document.querySelector("label > span").textContent, "Untranslated choice");
    dom.window.close();
  });
}

test("legacy result true/false display uses the same content locale without changing canonical values", () => {
  const context = vm.createContext({ ...assessmentLocale });
  vm.runInContext(legacy.slice(legacy.indexOf("function answerDisplay"), legacy.indexOf("function renderStudentResult")), context);
  const question = { type: "truefalse", correctBoolean: false };
  assert.equal(context.answerDisplay(question, "true", "en-GB"), "True");
  assert.equal(context.answerDisplay(question, "false", "en-GB"), "False");
  assert.equal(context.correctDisplay(question, "en-GB"), "False");
  assert.equal(context.answerDisplay(question, "true", "de-DE"), "Richtig");
  assert.equal(context.correctDisplay(question, "de-DE"), "Falsch");
});
