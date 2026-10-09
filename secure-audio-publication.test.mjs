import test from "node:test";
import assert from "node:assert/strict";
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
