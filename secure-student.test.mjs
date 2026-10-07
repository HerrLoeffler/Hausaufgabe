import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const js = fs.readFileSync("secure-student.js", "utf8");
const html = fs.readFileSync("secure-student.html", "utf8");

test("secure student page uses only the assessment callable client, never Firestore", () => {
  assert.match(js, /createSecureAssessmentClient/);
  assert.doesNotMatch(js, /firebase-firestore\.js|\bgetFirestore\b|\bgetDocs\b|\baddDoc\b|\bsetDoc\b|\bupdateDoc\b|\bonSnapshot\b/);
  assert.match(html, /secure-student\.js/);
});

test("secure student renderer supports every GradeCrew assessment question type", () => {
  for (const type of ["single", "multi", "text", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords", "number"]) {
    assert.match(js, new RegExp(`["']${type}["']`), `missing secure renderer/collector for ${type}`);
  }
});

test("secure student never evaluates answers or sends trusted score fields", () => {
  assert.doesNotMatch(js, /evaluateAnswer|gradeFromPercent|correctOptionIds|acceptedAnswers|numericAnswer|targetWords|acceptedOrders|gradingKey|paperSecret/);
  const submitBlock = js.slice(js.indexOf("async function submitAssessment"), js.indexOf("async function restoreOrShowIntro"));
  assert.match(submitBlock, /api\.submit/);
  assert.doesNotMatch(submitBlock, /totalPoints\s*:|maxPoints\s*:|percent\s*:|grade\s*:|grading\s*:/);
});

test("teacher-controlled flow waits for the server and timed flow uses server deadline", () => {
  assert.match(js, /api\.resume\(quizId\)/);
  assert.match(js, /response\.status === "ready"/);
  assert.match(js, /response\.deadlineAtMillis/);
  assert.match(js, /submitAssessment\(true\)/);
});

test("answers survive reload only inside the browser tab and are cleared after receipt", () => {
  assert.match(js, /sessionStorage\.setItem/);
  assert.match(js, /sessionStorage\.removeItem/);
  assert.doesNotMatch(js, /localStorage\.setItem\([^\n]*answers/);
});


test("teacher-end watcher freezes answers and retries the same snapshot", async () => {
  const { default: vm } = await import('node:vm');
  let callback;
  let ended = false;
  const controls = [{ disabled: false }];
  const form = { inert: false, querySelectorAll: () => controls };
  let answers = { q: 'first' };
  const submissions = [];
  const context = {
    frozenAnswers: null, runningPoll: null, submitting: false, quizId: 'AUDIT1',
    $: () => form, collectAnswers: () => answers,
    setInterval: fn => { callback = fn; return 1; },
    api: { resume: async (id, options) => { assert.equal(options.stateOnly, true); return { quiz: { ended } }; } },
    submitAssessment: async () => { submissions.push(JSON.stringify(context.frozenAnswers)); },
    setConnection: () => {}, saveDraft: () => {}, clearTimers: () => {}, showError: error => { throw error; }, showReceipt: () => {}
  };
  vm.createContext(context);
  vm.runInContext(js.slice(js.indexOf('function freezeAnswers'), js.indexOf('function draftKey')), context);
  context.watchRunningAssessment();
  await callback(); assert.equal(submissions.length, 0);
  ended = true; await callback();
  assert.equal(form.inert, true); assert.equal(controls[0].disabled, true);
  answers = { q: 'changed after end' }; await callback();
  assert.deepEqual(submissions, ['{"q":"first"}', '{"q":"first"}']);
});

test("countdown uses server time plus monotonic elapsed time", () => {
  assert.match(js, /serverNowMillis/);
  assert.match(js, /serverNow \+ performance\.now\(\) - receivedAt/);
  assert.doesNotMatch(js, /Number\(response\.deadlineAtMillis\) - Date\.now\(\)/);
});


test("secure student renders listening audio as an explicit player without autoplay", () => {
  assert.match(js, /question\.audio\?\.src/);
  assert.match(js, /audio\.controls = true/);
  assert.match(js, /audio\.preload = "metadata"/);
  assert.doesNotMatch(js, /KI-generierte Stimme/);
  assert.doesNotMatch(js, /\.autoplay\s*=\s*true|autoplay=/);
  assert.doesNotMatch(js, /audioScript|audioTranscript/);
});
