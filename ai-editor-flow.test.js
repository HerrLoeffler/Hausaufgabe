import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { questionReviewKey, editorQuestionIndex } from "./ai-review-state.js";

const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const handlers = app.slice(app.indexOf("function renderVariantProgress("), app.indexOf("function moveQuestion("));
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function setup() {
  let renders = 0, dirty = 0, id = 0;
  const notices = [], reports = [];
  const source = { id: "q1", type: "truefalse", text: "Ausgangsfrage", correctBoolean: false, points: 1 };
  const state = { user: { uid: "teacher" }, currentQuiz: { id: "quiz" }, questions: [source] };
  const host = { dataset: {}, classList: { add() {}, remove() {} }, querySelector: () => ({ addEventListener() {} }) };
  const request = deferred();
  const context = vm.createContext({ state, db: {}, guestTourRepo: null, tourUid: () => state.user?.uid || "", $: () => host, QUESTION_TYPES: [["truefalse"]],
    questionReviewKey, editorQuestionIndex,
    questionForAi: q => ({ ...q }), questionContext: () => ({ existingQuestions: [] }),
    normalizeImportedQuestion: q => ({ ...q }),
    doc: () => ({ id: `new-${++id}` }), collection: () => ({}),
    aiApi: { regenerateQuestion: () => request.promise },
    applyGeneratedMedia: async () => {}, applyGeneratedAudio: async () => {}, getQuestionAudioSrc: () => "",
    renderQuestions: () => { renders++; }, markDirty: () => { dirty++; }, resolveQualityIssues() {},
    toast: (...args) => notices.push(args), showReportableError: error => reports.push(error),
    escapeHtml: value => String(value), aiFriendlyError: error => error.message,
    deepClone: value => structuredClone(value), CSS: { escape: value => value },
    document: { querySelector: () => null }, console
  });
  vm.runInContext(handlers, context);
  return { context, state, source, request, notices, reports, renders: () => renders, dirty: () => dirty };
}
const result = { question: { type: "truefalse", text: "Neue Variante", correctBoolean: true, points: 1, mediaIntent: { kind: "none" } }, meta: {} };

test("variants wait outside the editor state and preserve typing until explicitly accepted", async () => {
  const h = setup();
  const running = h.context.createQuestionVariants(h.source, { count: 1, mediaKind: "none" });
  h.source.text = "Währenddessen selbst bearbeitet";
  h.state.questions.unshift({ id: "another", text: "Andere Aufgabe" });
  h.request.resolve(result); await running;
  assert.equal(h.renders(), 0);
  assert.equal(h.dirty(), 0);
  assert.equal(h.state.questions.length, 2);
  assert.equal(h.state.variantTask.questions.length, 1);
  h.context.applyPendingVariants();
  assert.equal(h.state.questions.length, 3);
  assert.equal(h.state.questions[1].text, "Währenddessen selbst bearbeitet");
  assert.equal(h.state.questions[2].text, "Neue Variante");
  assert.equal(h.renders(), 1);
  assert.equal(h.state.variantTask, null);
});

test("variant insertion respects the current limit and retains unapplied results", async () => {
  const h = setup();
  const running = h.context.createQuestionVariants(h.source, { count: 2, mediaKind: "none" });
  h.request.resolve(result); await running;
  h.state.questions.push(...Array.from({ length: 98 }, (_, i) => ({ id: `q${i + 2}` })));
  h.context.applyPendingVariants();
  assert.equal(h.state.questions.length, 100);
  assert.equal(h.state.variantTask.questions.length, 1);
});

test("switching quizzes or accounts cannot insert variants into another test", async () => {
  const h = setup();
  const running = h.context.createQuestionVariants(h.source, { count: 1, mediaKind: "none" });
  h.state.currentQuiz = { id: "different" };
  h.request.resolve(result); await running;
  h.context.applyPendingVariants();
  assert.equal(h.state.questions.length, 1);
  h.state.user = { uid: "different" };
  h.state.currentQuiz = { id: "quiz" };
  h.context.applyPendingVariants();
  assert.equal(h.state.questions.length, 1);
});

test("editing a moved task applies the result by id, not its old index", async () => {
  const h = setup();
  const running = h.context.regenerateQuestionWithAi(h.source, 0, { instruction: "Verbessern" });
  h.state.questions.unshift({ id: "other", text: "Unberührt" });
  h.request.resolve(result); await running;
  assert.equal(h.state.questions[0].text, "Unberührt");
  assert.equal(h.state.questions[1].id, "q1");
  assert.equal(h.state.questions[1].text, "Neue Variante");
});

test("a delayed edit never overwrites a newer manual edit or another quiz", async () => {
  for (const changed of [h => { h.source.text = "Manuelle Änderung"; }, h => { h.state.currentQuiz.id = "other"; }]) {
    const h = setup();
    const running = h.context.regenerateQuestionWithAi(h.source, 0, { instruction: "Verbessern" });
    changed(h); h.request.resolve(result); await running;
    assert.notEqual(h.state.questions[0].text, "Neue Variante");
    assert.equal(h.renders(), 0);
  }
});
