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
test("frontend audio publication opens for verified Staging, while other projects stay closed", () => {
  const start = appSource.indexOf('const SECURE_AUDIO_PUBLICATION_ENABLED =');
  const code = appSource.slice(start, appSource.indexOf('const app =', start));
  for (const projectId of ['hausaufgabe-staging', 'hausaufgabe-40294', 'unknown']) {
    const context = { firebaseConfig: { projectId }, isSecureAudioPublicationBlocked: secureAudioPublicationBlocked };
    const blocked = vm.runInNewContext(code + '\nsecureAudioPublicationBlocked({requiresSecureAssessmentRules: true});', context);
    assert.equal(blocked, projectId !== 'hausaufgabe-staging');
  }
});
test("dashboard reopening delegates to common editor review and never publishes immediately", async () => {
  const calls=[];
  const context={publicationReviewBusy:false,state:{quizzes:[{id:'TEST',published:false,ended:true}]},openEditor:async id=>{calls.push(['open',id]);context.state.currentQuiz={id};},publishCurrentQuiz:async()=>calls.push(['review']),toast(){}};
  vm.createContext(context);const start=appSource.indexOf('async function reopenQuiz(');vm.runInContext(appSource.slice(start,appSource.indexOf('\n}',start)+2),context);
  await context.reopenQuiz('TEST');assert.deepEqual(calls,[['open','TEST'],['review']]);
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
