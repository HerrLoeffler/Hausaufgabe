"use strict";

const crypto = require("node:crypto");

const STAGING_PROJECT_ID = "gradecrew-staging-2026";
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
  const values = ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT", "GCP_PROJECT"]
    .map(key => String(env?.[key] || "").trim()).filter(Boolean);
  try {
    const config = JSON.parse(String(env?.FIREBASE_CONFIG || "{}"));
    if (config.projectId) values.push(String(config.projectId).trim());
  } catch { return ""; }
  return new Set(values).size === 1 ? values[0] : "";
}

function projectToken(env = process.env) {
  const project = runtimeProjectId(env);
  if (project === STAGING_PROJECT_ID) return String(env?.POSTHOG_PROJECT_TOKEN || "").trim();
  if (project === "hausaufgabe-staging" && env.POSTHOG_SCHOOL_ENABLED === "true") {
    const token = String(env.POSTHOG_SCHOOL_PROJECT_TOKEN || "").trim();
    return token && token !== String(env.POSTHOG_PROJECT_TOKEN || "").trim() ? token : "";
  }
  return "";
}

function isPosthogExportEnabled(env = process.env) {
  return Boolean(projectToken(env));
}

const FIELD_NAMES = new Set(["subject", "grade", "schoolType", "region", "topic", "difficulty", "count", "points", "durationMinutes", "imageQuestionCount", "audioQuestionCount", "audioAnswerQuestionCount", "solutionAudioQuestionCount", "notes", "questionTypes"]);
const member = (value, allowed) => allowed.includes(value) ? value : undefined;
function releaseRef(env) {
  const value = String(env.GC_SOURCE_RELEASE || "");
  return /^[a-f0-9]{40}$/.test(value) ? value : "unknown";
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

function buildPosthogCapture({ uid, day, eventId, metric = {}, metricVersion = "crew-metrics-v1", profile } = {}, env = process.env) {
  const event = String(metric.event || "");
  if (!ALLOWED_EVENTS.has(event)) throw new TypeError("Unsupported PostHog crew event");
  if (runtimeProjectId(env) === "hausaufgabe-staging" && !require("./teacher-analytics-core").teacherChannel(profile, "hausaufgabe-staging")) throw new TypeError("School analytics purpose not enabled");
  const token = projectToken(env);
  if (!token) throw new TypeError("Missing PostHog project token");

  const cleanDay = safeDay(day);
  const fields = Array.isArray(metric.fields)
    ? [...new Set(metric.fields.filter(field => FIELD_NAMES.has(field)))].slice(0, 16)
    : undefined;

  const properties = compactProperties({
    "$process_person_profile": false,
    "$insert_id": String(eventId || "").slice(0, 120) || undefined,
    environment: runtimeProjectId(env) === STAGING_PROJECT_ID ? "staging" : "school",
    source_project: runtimeProjectId(env),
    source_release: releaseRef(env),
    event_schema_version: 2,
    platform: "web",
    measurement_channel: runtimeProjectId(env) === STAGING_PROJECT_ID ? "synthetic" : require("./teacher-analytics-core").teacherChannel(profile, "hausaufgabe-staging"),
    role: member(profile?.role, ["teacher", "admin"]),
    source_system: "gradecrew",
    metric_version: String(metricVersion || "").slice(0, 80),
    crew_id: member(metric.crewId, ["remy", "emmi", "coco", "wilma"]),
    input_mode: member(metric.inputMode, ["voice", "text"]),
    source: member(metric.source, ["local", "ai"]),
    fields,
    corrected_field: FIELD_NAMES.has(metric.correctedField) ? metric.correctedField : undefined,
    error_type: member(metric.errorType, ["network", "permission", "unsupported", "unavailable", "unknown"]),
    latency_ms: Number.isFinite(metric.latencyMs) ? Math.max(0, Math.min(300000, metric.latencyMs)) : undefined,
    parser_version: /^[a-zA-Z0-9._-]{1,60}$/.test(metric.parserVersion || "") ? metric.parserVersion : undefined,
    has_notes: typeof metric.hasNotes === "boolean" ? metric.hasNotes : undefined,
    screen: member(metric.screen, ["ai_create"]),
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
  if (![STAGING_PROJECT_ID, "hausaufgabe-staging"].includes(runtimeProjectId(env))) return { sent: false, reason: "not-staging" };
  if (!projectToken(env)) return { sent: false, reason: "not-configured" };

  if (runtimeProjectId(env) === "hausaufgabe-staging" && !require("./teacher-analytics-core").teacherChannel(input.profile, "hausaufgabe-staging")) return {sent: false, reason: "purpose-not-enabled"};
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
