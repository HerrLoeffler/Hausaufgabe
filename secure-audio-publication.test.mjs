import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { dashboardPublicationAction, secureAudioPublicationBlocked } from "./secure-audio-publication.mjs";

test("publication guard catches private audio modes from quiz metadata and question documents", () => {
  assert.equal(secureAudioPublicationBlocked({ requiresSecureAssessmentRules: true }), true);
  assert.equal(secureAudioPublicationBlocked({ audioAnswerQuestionCount: 1 }), true);
  assert.equal(secureAudioPublicationBlocked({ listeningOnlyQuestionCount: 1 }), true);
  assert.equal(secureAudioPublicationBlocked({}, [{ audioPresentation: "listening-only" }]), true);
  assert.equal(secureAudioPublicationBlocked({}, [{ audioAnswerMode: "audio-only" }]), true);
});

test("supplementary audio remains publishable and an explicitly verified rules cutover opens the guard", () => {
  const supplement = [{ audioPresentation: "supplement", audioAnswerMode: "none" }];
  assert.equal(secureAudioPublicationBlocked({ audioQuestionCount: 1 }, supplement), false);
  assert.equal(secureAudioPublicationBlocked({}, [{ audioAnswerMode: "audio-only" }], true), false);
});

test("turning off an active publication uses the safe end lifecycle instead of reverting to draft", () => {
  assert.equal(dashboardPublicationAction({ published: true, ended: false }, false), "end");
  assert.equal(dashboardPublicationAction({ published: false, ended: false }, true), "publish");
  assert.equal(dashboardPublicationAction({ published: false, ended: false }, false), "noop");
});

const appSource = fs.readFileSync("app.js", "utf8");
function publicationHarness(questions, { failRead = false } = {}) {
  const writes = [];
  const context = { state: { quizzes: [{ id: "TEST", published: false, ended: true }] }, db: {},
    secureAudioPublicationBlocked, secureAudioPublicationMessage: "Private audio is not released",
    collection: () => ({}), firestoreGetDocs: async () => {
      if (failRead) throw new Error("offline");
      return { docs: questions.map(q => ({ data: () => q })) };
    }, toast() {}, showReportableError() {}, REPORTABLE_ERROR_CODES: { dataLoad: "load" },
    randomId: () => "run", doc: () => ({}), serverTimestamp: () => "now",
    updateDoc: async (_, patch) => writes.push(patch), loadDashboard: async () => {}, console };
  vm.createContext(context);
  const preflight = appSource.slice(appSource.indexOf("async function checkQuizAudioPublication("), appSource.indexOf("async function toggleDashboardPublished("));
  const reopen = appSource.slice(appSource.indexOf("async function reopenQuiz("), appSource.indexOf("async function shareQuizTemplate("));
  vm.runInContext(preflight + reopen, context);
  return { context, writes };
}

test("reopening catches private question modes when older quiz metadata is absent", async () => {
  for (const question of [{ audioPresentation: "listening-only" }, { audioAnswerMode: "audio-only" }]) {
    const h = publicationHarness([question]);
    await h.context.reopenQuiz("TEST");
    assert.equal(h.writes.length, 0);
  }
});

test("reopening supplementary audio works, but a failed preflight never changes publication", async () => {
  const allowed = publicationHarness([{ audioPresentation: "supplement" }]);
  await allowed.context.reopenQuiz("TEST");
  assert.equal(allowed.writes.length, 1);
  assert.equal(allowed.writes[0].published, true);
  const failed = publicationHarness([], { failRead: true });
  await failed.context.reopenQuiz("TEST");
  assert.equal(failed.writes.length, 0);
});

test("publication remains locked throughout asynchronous preflight and rejects a second interaction", async () => {
  let release;
  let calls = 0;
  const waiting = new Promise(resolve => { release = resolve; });
  const context = { applyDashboardPublication: async () => { calls++; await waiting; } };
  vm.createContext(context);
  const start = appSource.indexOf("async function toggleDashboardPublished(");
  vm.runInContext(appSource.slice(start, appSource.indexOf("async function applyDashboardPublication(", start)), context);
  const toggle = { disabled: false, isConnected: true };
  const first = context.toggleDashboardPublished({}, toggle);
  assert.equal(toggle.disabled, true);
  await context.toggleDashboardPublished({}, toggle);
  assert.equal(calls, 1);
  release();
  await first;
  assert.equal(toggle.disabled, false);
});
