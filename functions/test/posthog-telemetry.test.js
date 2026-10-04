"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  POSTHOG_CAPTURE_URL,
  runtimeProjectId,
  isPosthogExportEnabled,
  dayScopedDistinctId,
  buildPosthogCapture,
  captureCrewMetricToPosthog
} = require("../lib/posthog-telemetry");

const stagingEnv = Object.freeze({
  GCLOUD_PROJECT: "hausaufgabe-staging",
  POSTHOG_PROJECT_TOKEN: "unit-test-project-token"
});

test("PostHog export activates only for configured staging runtime", () => {
  assert.equal(runtimeProjectId(stagingEnv), "hausaufgabe-staging");
  assert.equal(isPosthogExportEnabled(stagingEnv), true);
  assert.equal(isPosthogExportEnabled({ ...stagingEnv, GCLOUD_PROJECT: "hausaufgabe-40294" }), false);
  assert.equal(isPosthogExportEnabled({ GCLOUD_PROJECT: "hausaufgabe-staging" }), false);
});

test("PostHog distinct ids are stable only within the same day", () => {
  const a = dayScopedDistinctId("teacher-123", "2026-10-04");
  const b = dayScopedDistinctId("teacher-123", "2026-10-04");
  const c = dayScopedDistinctId("teacher-123", "2026-10-05");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(a.length, 32);
  assert.notEqual(a, "teacher-123");
});

test("PostHog payload contains only allowlisted metadata and no person profile", () => {
  const payload = buildPosthogCapture({
    uid: "teacher-123",
    day: "2026-10-04",
    eventId: "event-1",
    metricVersion: "crew-metrics-v1",
    metric: {
      event: "patch_applied",
      crewId: "remy",
      inputMode: "voice",
      source: "local",
      fields: ["topic", "notes"],
      latencyMs: 125,
      hasNotes: true,
      parserVersion: "remy-structure-v2",
      screen: "ai_create",
      text: "must never leave GradeCrew",
      topic: "Prozentrechnung",
      email: "student@example.test"
    }
  }, stagingEnv);

  assert.equal(payload.event, "gradecrew.crew.patch_applied");
  assert.equal(payload.api_key, "unit-test-project-token");
  assert.equal(payload.properties.$process_person_profile, false);
  assert.equal(payload.properties.environment, "staging");
  assert.equal(payload.properties.crew_id, "remy");
  assert.equal(payload.properties.input_mode, "voice");
  assert.deepEqual(payload.properties.fields, ["topic", "notes"]);
  assert.equal(payload.properties.has_notes, true);
  assert.equal(Object.hasOwn(payload.properties, "text"), false);
  assert.equal(Object.hasOwn(payload.properties, "topic"), false);
  assert.equal(Object.hasOwn(payload.properties, "email"), false);
  assert.equal(Object.hasOwn(payload.properties, "uid"), false);
  assert.equal(Object.hasOwn(payload.properties, "uidHash"), false);
  assert.equal(payload.distinct_id.length, 32);
});

test("PostHog exporter never calls the network outside staging", async () => {
  let calls = 0;
  const result = await captureCrewMetricToPosthog({
    uid: "teacher-123",
    day: "2026-10-04",
    eventId: "event-1",
    metric: { event: "input_submitted", crewId: "remy", inputMode: "text" }
  }, {
    env: { ...stagingEnv, GCLOUD_PROJECT: "hausaufgabe-40294" },
    fetchImpl: async () => { calls += 1; return { ok: true, status: 200 }; }
  });

  assert.equal(result.sent, false);
  assert.equal(result.reason, "not-staging");
  assert.equal(calls, 0);
});

test("PostHog exporter sends one personless custom event to the EU endpoint", async () => {
  const requests = [];
  const result = await captureCrewMetricToPosthog({
    uid: "teacher-123",
    day: "2026-10-04",
    eventId: "event-1",
    metricVersion: "crew-metrics-v1",
    metric: { event: "input_submitted", crewId: "remy", inputMode: "text", hasNotes: false }
  }, {
    env: stagingEnv,
    fetchImpl: async (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return { ok: true, status: 200 };
    }
  });

  assert.equal(result.sent, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, POSTHOG_CAPTURE_URL);
  assert.equal(requests[0].options.method, "POST");
  assert.equal(requests[0].body.event, "gradecrew.crew.input_submitted");
  assert.equal(requests[0].body.properties.$process_person_profile, false);
});
