"use strict";

const crypto = require("node:crypto");

const STAGING_PROJECT_ID = "hausaufgabe-staging";
const POSTHOG_CAPTURE_URL = "https://eu.i.posthog.com/i/v0/e/";
const POSTHOG_EVENT_PREFIX = "gradecrew.crew.";
const DEFAULT_TIMEOUT_MS = 1200;

const ALLOWED_EVENTS = new Set([
  "input_submitted",
  "voice_started",
  "voice_stopped",
  "patch_applied",
  "field_corrected",
  "local_response",
  "ai_fallback_started",
  "request_failed",
  "ai_fallback_completed",
  "ai_fallback_failed"
]);

function runtimeProjectId(env = process.env) {
  for (const key of ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT", "GCP_PROJECT"]) {
    const value = String(env?.[key] || "").trim();
    if (value) return value;
  }
  try {
    const config = JSON.parse(String(env?.FIREBASE_CONFIG || ""));
    return String(config?.projectId || "").trim();
  } catch {
    return "";
  }
}

function projectToken(env = process.env) {
  return String(env?.POSTHOG_PROJECT_TOKEN || "").trim();
}

function isPosthogExportEnabled(env = process.env) {
  return runtimeProjectId(env) === STAGING_PROJECT_ID && Boolean(projectToken(env));
}

function safeDay(value) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

function dayScopedDistinctId(uid, day) {
  const normalizedDay = safeDay(day);
  return crypto
    .createHash("sha256")
    .update(`gradecrew-posthog-v1\0${normalizedDay}\0${String(uid || "")}`)
    .digest("hex")
    .slice(0, 32);
}

function compactProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

function buildPosthogCapture({ uid, day, eventId, metric = {}, metricVersion = "crew-metrics-v1" } = {}, env = process.env) {
  const event = String(metric.event || "");
  if (!ALLOWED_EVENTS.has(event)) throw new TypeError("Unsupported PostHog crew event");
  const token = projectToken(env);
  if (!token) throw new TypeError("Missing PostHog project token");

  const cleanDay = safeDay(day);
  const fields = Array.isArray(metric.fields)
    ? metric.fields.map(String).filter(Boolean).slice(0, 16)
    : undefined;

  const properties = compactProperties({
    "$process_person_profile": false,
    "$insert_id": String(eventId || "").slice(0, 120) || undefined,
    environment: "staging",
    source_system: "gradecrew",
    metric_version: String(metricVersion || "").slice(0, 80),
    crew_id: metric.crewId,
    input_mode: metric.inputMode,
    source: metric.source,
    fields,
    corrected_field: metric.correctedField,
    error_type: metric.errorType,
    latency_ms: Number.isFinite(metric.latencyMs) ? metric.latencyMs : undefined,
    parser_version: metric.parserVersion,
    has_notes: typeof metric.hasNotes === "boolean" ? metric.hasNotes : undefined,
    screen: metric.screen,
    server_day: cleanDay
  });

  return {
    api_key: token,
    distinct_id: dayScopedDistinctId(uid, cleanDay),
    event: `${POSTHOG_EVENT_PREFIX}${event}`,
    properties
  };
}

async function captureCrewMetricToPosthog(input = {}, options = {}) {
  const env = options.env || process.env;
  if (runtimeProjectId(env) !== STAGING_PROJECT_ID) return { sent: false, reason: "not-staging" };
  if (!projectToken(env)) return { sent: false, reason: "not-configured" };

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") return { sent: false, reason: "fetch-unavailable" };

  const timeoutMs = Math.max(250, Math.min(5000, Number(options.timeoutMs) || DEFAULT_TIMEOUT_MS));
  const payload = buildPosthogCapture(input, env);
  const response = await fetchImpl(POSTHOG_CAPTURE_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: globalThis.AbortSignal.timeout(timeoutMs)
  });

  if (!response?.ok) {
    const error = new Error("PostHog capture rejected");
    error.status = Number(response?.status || 0);
    throw error;
  }
  return { sent: true, status: Number(response.status || 200) };
}

async function captureCrewMetricToPosthogSafe(input = {}, options = {}) {
  try {
    return await captureCrewMetricToPosthog(input, options);
  } catch (error) {
    console.warn("PostHog-Telemetrie konnte nicht exportiert werden:", {
      name: error?.name,
      status: error?.status
    });
    return { sent: false, reason: "capture-failed" };
  }
}

module.exports = {
  STAGING_PROJECT_ID,
  POSTHOG_CAPTURE_URL,
  POSTHOG_EVENT_PREFIX,
  runtimeProjectId,
  projectToken,
  isPosthogExportEnabled,
  dayScopedDistinctId,
  buildPosthogCapture,
  captureCrewMetricToPosthog,
  captureCrewMetricToPosthogSafe
};
