import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "./tools/ui/node_modules/jsdom/lib/api.js";
import { answerIsComplete, paintAnswerCompletion } from "./shared/answer-completion.mjs";
import { mountSecureQuestionNavigation } from "./secure-student-navigation.mjs";

test("completion handles every question type without reading the grading key", () => {
  for (const type of ["text", "number", "single", "truefalse", "dropdown"]) {
    assert.equal(answerIsComplete({ type }, ""), false);
    assert.equal(answerIsComplete({ type }, "   "), false);
    assert.equal(answerIsComplete({ type }, 0), true);
    assert.equal(answerIsComplete({ type }, "any choice"), true);
  }
  for (const type of ["multi", "markwords"]) {
    assert.equal(answerIsComplete({ type }, []), false);
    assert.equal(answerIsComplete({ type }, ["wrong choice"]), true);
  }
  for (const question of [
    { type: "gapfill", text: "A [one] and [two]." },
    { type: "gapfill", segments: [{ type: "gap" }, { type: "text" }, { type: "gap" }] }
  ]) {
    assert.equal(answerIsComplete(question, ["one"]), false);
    assert.equal(answerIsComplete(question, ["one", ""]), false);
    assert.equal(answerIsComplete(question, ["wrong", "wrong"]), true);
  }
  for (const question of [
    { type: "matching", pairs: [{}, {}] },
    { type: "matching", leftItems: [{}, {}] },
    { type: "grouping", groups: [{ items: ["a", "b"] }] },
    { type: "grouping", items: [{}, {}] }
  ]) {
    assert.equal(answerIsComplete(question, {}), false);
    assert.equal(answerIsComplete(question, { a: "x" }), false);
    assert.equal(answerIsComplete(question, { a: "x", b: "" }), false);
    assert.equal(answerIsComplete(question, { a: "x", b: "y" }), true);
  }
  assert.equal(answerIsComplete({ type: "ordering", items: [1, 2] }, ["2", "1"]), true);
  assert.equal(answerIsComplete({ type: "ordering", items: [1, 2] }, ["2", "1"], { orderingTouched: false }), false);
  assert.equal(answerIsComplete({ type: "markwords", markGroups: [{}] }, { 0: "blue" }), true);
  assert.equal(answerIsComplete({ type: "markwords", markGroups: [{}] }, { 0: "" }), false);
  for (const type of ["matching", "grouping", "ordering", "gapfill", "unknown"]) assert.equal(answerIsComplete({ type }, []), false);
});

test("progress marker includes a visible check and accessible state and resets on clearing", () => {
  const dom = new JSDOM("<button></button>");
  const button = dom.window.document.querySelector("button");
  paintAnswerCompletion(button, 1, true);
  assert.equal(button.textContent, "2 ✓");
  assert.equal(button.getAttribute("aria-label"), "Aufgabe 2 · beantwortet");
  assert.ok(button.classList.contains("complete"));
  paintAnswerCompletion(button, 1, false);
  assert.equal(button.textContent, "2");
  assert.equal(button.getAttribute("aria-label"), "Aufgabe 2 · offen");
  assert.ok(!button.classList.contains("complete"));
  dom.window.close();
});

test("Secure overview follows actual progress updates and forgets completed state after clearing", () => {
  const dom = new JSDOM(fs.readFileSync("secure-student.html", "utf8"), { pretendToBeVisual: true });
  const d = dom.window.document;
  const question = d.createElement("section");
  question.className = "secureQuestion";
  question.dataset.qid = "one";
  d.getElementById("secureQuestions").append(question);
  const cleanup = mountSecureQuestionNavigation(d, dom.window);
  const button = d.querySelector("#secureQuestionOverview button");
  assert.equal(button.dataset.answerState, "open");
  question.dataset.answerState = "answered";
  d.dispatchEvent(new dom.window.Event("gradecrew:student-progress"));
  assert.equal(button.dataset.answerState, "answered");
  assert.equal(button.textContent, "1 ✓");
  question.dataset.answerState = "open";
  d.dispatchEvent(new dom.window.Event("gradecrew:student-progress"));
  assert.equal(button.dataset.answerState, "open");
  assert.equal(button.textContent, "1");
  cleanup();
  dom.window.close();
});

test('unchanged progress preserves the number text node during a pointer click', () => {
  const dom = new JSDOM('<button></button>');
  const button=dom.window.document.querySelector('button');
  paintAnswerCompletion(button,29,false);
  const text=button.firstChild;
  paintAnswerCompletion(button,29,false);
  assert.equal(button.firstChild,text,'a blur-triggered progress refresh must not replace the pointer target');
  paintAnswerCompletion(button,29,true);
  assert.equal(button.textContent,'30 ✓');
  dom.window.close();
});
