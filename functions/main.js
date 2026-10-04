"use strict";

// Wrapper entrypoint: keep every existing Firebase export from index.js intact and
// add focused assistant endpoints without modifying the large, proven generation module.
const existing = require("./index");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { REGION, TEXT_MODEL } = require("./lib/constants");
const { createAudioAsset } = require("./lib/audio-flow");
const { requireAiUser } = require("./lib/access");
const { consumeQuota, recordUsage } = require("./lib/usage");
const { getOpenAI } = require("./lib/openai-client");
const { syncBugFeedback, bugOpsAttentionSummary } = require("./lib/bug-ops");
const { requestStructured, AiResponseError } = require("./lib/structured-response");
const {
  crewAssistantSchema,
  cleanCrewRequest,
  crewSystemPrompt,
  crewUserPrompt,
  normalizeCrewResult
} = require("./lib/crew-assistant");
const {
  writeCrewMetric,
  recordCrewMetricSafe,
  crewTelemetrySummary,
  cleanupExpiredCrewTelemetry
} = require("./lib/crew-telemetry");
const {
  REVISION_VERSION,
  cleanWholeTestRevisionRequest,
  wholeTestRevisionSchema,
  WHOLE_TEST_REVISION_SYSTEM,
  wholeTestRevisionPrompt,
  finalizeWholeTestRevision
} = require("./lib/whole-test-revision");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const assistantOpts = {
  region: REGION,
  secrets: [OPENAI_API_KEY],
  timeoutSeconds: 120,
  memory: "512MiB",
  enforceAppCheck: false
};
const telemetryOpts = {
  region: REGION,
  timeoutSeconds: 60,
  memory: "256MiB",
  enforceAppCheck: false
};

function cleanAudioQuizId(value) {
  const quizId = String(value || "").trim();
  if (!/^[A-Z0-9_-]{4,40}$/i.test(quizId)) throw new HttpsError("invalid-argument", "Ungültige Test-ID.");
  return quizId;
}

function cleanAudioDrafts(value, { includeStale = false } = {}) {
  if (!Array.isArray(value) || value.length > 100) throw new HttpsError("invalid-argument", "Ungültige Hörtext-Liste.");
  const seen = new Set();
  return value.map(item => {
    const questionId = String(item?.questionId || "").trim();
    if (!/^[A-Z0-9_-]{2,80}$/i.test(questionId) || seen.has(questionId)) {
      throw new HttpsError("invalid-argument", "Ungültige oder doppelte Aufgaben-ID.");
    }
    seen.add(questionId);
    const script = String(item?.script || "").normalize("NFKC").replace(/\s+/g, " ").trim();
    if (script.length > 500) throw new HttpsError("invalid-argument", "Ein Hörtext ist länger als 500 Zeichen.");
    return { questionId, script, ...(includeStale ? { stale: item?.stale === true } : {}) };
  });
}

async function requireAudioQuizAccess(request, quizId, { write = false } = {}) {
  const { uid, profile } = await requireAiUser(request);
  const db = getFirestore();
  const quizRef = db.doc(`quizzes/${quizId}`);
  const snap = await quizRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Test nicht gefunden.");
  const quiz = snap.data() || {};
  const admin = profile.role === "admin";
  if (!admin && quiz.ownerId !== uid) throw new HttpsError("permission-denied", "Kein Zugriff auf diesen Test.");
  if (write && quiz.rightsHold === true) throw new HttpsError("failed-precondition", "Der Test ist wegen eines Rechtehinweises gesperrt.");
  if (write && quiz.published === true && quiz.ended !== true) {
    throw new HttpsError("failed-precondition", "Hörtexte können während eines laufenden veröffentlichten Tests nicht verändert werden.");
  }
  return { db, quizRef, quiz, uid, profile };
}

const getQuestionAudioDrafts = onCall(telemetryOpts, async request => {
  const quizId = cleanAudioQuizId(request.data?.quizId);
  const { quizRef } = await requireAudioQuizAccess(request, quizId);
  const snap = await quizRef.collection("audioScripts").get();
  const drafts = {};
  const solutionDrafts = {};
  const solutionAssets = {};
  for (const item of snap.docs.slice(0, 100)) {
    const data = item.data() || {};
    const script = String(data.script || "").normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, 500);
    const solutionScript = String(data.solutionScript || "").normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, 500);
    if (script) drafts[item.id] = script;
    if (solutionScript) solutionDrafts[item.id] = solutionScript;
    const solutionStale = data.solutionNeedsRegeneration === true;
    const audioDataUrl = String(data.solutionAudioDataUrl || "");
    if (!solutionStale && audioDataUrl.startsWith("data:audio/")) {
      solutionAssets[item.id] = {
        audioDataUrl,
        audioByteSize: Number(data.solutionAudioByteSize || 0),
        audioVoice: String(data.solutionAudioVoice || "").slice(0, 40),
        audioModel: String(data.solutionAudioModel || "").slice(0, 80),
        audioAiGenerated: data.solutionAudioAiGenerated !== false
      };
    }
  }
  return { drafts, solutionDrafts, solutionAssets };
});

const syncQuestionAudioDrafts = onCall(telemetryOpts, async request => {
  const quizId = cleanAudioQuizId(request.data?.quizId);
  const drafts = cleanAudioDrafts(request.data?.drafts || []);
  const solutionDrafts = cleanAudioDrafts(request.data?.solutionDrafts || [], { includeStale: true });
  const { db, quizRef } = await requireAudioQuizAccess(request, quizId, { write: true });
  const collectionRef = quizRef.collection("audioScripts");
  const existing = await collectionRef.get();
  const listening = new Map(drafts.filter(item => item.script).map(item => [item.questionId, item.script]));
  const solutions = new Map(solutionDrafts.filter(item => item.script).map(item => [item.questionId, { script: item.script, stale: item.stale === true }]));
  const existingById = new Map(existing.docs.map(item => [item.id, item]));
  const ids = new Set([...existingById.keys(), ...listening.keys(), ...solutions.keys()]);
  const batch = db.batch();
  for (const questionId of ids) {
    const oldDoc = existingById.get(questionId);
    const oldData = oldDoc?.data() || {};
    const script = listening.get(questionId) || "";
    const solutionDraft = solutions.get(questionId) || { script: "", stale: false };
    const solutionScript = solutionDraft.script;
    const ref = collectionRef.doc(questionId);
    if (!script && !solutionScript) {
      if (oldDoc) batch.delete(ref);
      continue;
    }
    const patch = {
      script: script || FieldValue.delete(),
      solutionScript: solutionScript || FieldValue.delete(),
      solutionNeedsRegeneration: solutionScript ? solutionDraft.stale === true : FieldValue.delete(),
      updatedAt: new Date()
    };
    if (solutionDraft.stale === true || String(oldData.solutionScript || "") !== solutionScript) {
      patch.solutionAudioDataUrl = FieldValue.delete();
      patch.solutionAudioByteSize = FieldValue.delete();
      patch.solutionAudioVoice = FieldValue.delete();
      patch.solutionAudioModel = FieldValue.delete();
      patch.solutionAudioAiGenerated = FieldValue.delete();
    }
    batch.set(ref, patch, { merge: true });
  }
  await batch.commit();
  return { ok: true, count: listening.size, solutionCount: solutions.size };
});

const generateQuestionSolutionAudio = onCall(assistantOpts, async request => {
  const quizId = cleanAudioQuizId(request.data?.quizId);
  const questionId = String(request.data?.questionId || "").trim();
  if (!/^[A-Z0-9_-]{2,80}$/i.test(questionId)) throw new HttpsError("invalid-argument", "Ungültige Aufgaben-ID.");
  const script = String(request.data?.script || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!script) throw new HttpsError("invalid-argument", "Lösungstext fehlt.");
  if (script.length > 500) throw new HttpsError("invalid-argument", "Lösungstext ist zu lang. Maximal 500 Zeichen.");
  const { quizRef, uid } = await requireAudioQuizAccess(request, quizId, { write: true });
  const questionSnap = await quizRef.collection("questions").doc(questionId).get();
  if (!questionSnap.exists) throw new HttpsError("not-found", "Aufgabe nicht gefunden.");
  const asset = await createAudioAsset({ uid, questionId: `solution-${questionId}`, script });
  await quizRef.collection("audioScripts").doc(questionId).set({
    solutionScript: script,
    solutionAudioDataUrl: asset.audioDataUrl,
    solutionAudioByteSize: asset.audioByteSize,
    solutionAudioVoice: asset.audioVoice,
    solutionAudioModel: asset.audioModel,
    solutionAudioAiGenerated: asset.audioAiGenerated !== false,
    solutionNeedsRegeneration: false,
    updatedAt: new Date()
  }, { merge: true });
  return { asset };
});

function patchMetricFields(patch = {}) {
  const fields = [];
  for (const key of ["subject", "grade", "schoolType", "region", "topic", "difficulty", "count", "points", "durationMinutes", "audioQuestionCount", "solutionAudioQuestionCount", "notes"]) {
    if (patch[key] !== undefined && patch[key] !== null && patch[key] !== "") fields.push(key);
  }
  if ((Array.isArray(patch.allowedTypes) && patch.allowedTypes.length) || (Array.isArray(patch.excludeTypes) && patch.excludeTypes.length)) fields.push("questionTypes");
  return fields;
}

const aggregateBugFeedback = onDocumentWritten({
  document: "feedback/{feedbackId}",
  region: REGION,
  timeoutSeconds: 60,
  memory: "256MiB"
}, async event => {
  const after = event.data?.after;
  if (!after?.exists) return;
  const data = after.data() || {};
  if (data.category !== "app_error") return;
  const result = await syncBugFeedback(getFirestore(), event.params.feedbackId, data);
  if (!result?.ignored && !result?.deduplicated) {
    console.log("BugOps-Incident aktualisiert.", {
      incidentId: result.incidentId,
      priority: result.priority,
      notification: result.notification,
      risk: result.risk
    });
  }
});

const getBugOpsSummary = onCall(telemetryOpts, async request => {
  const { profile } = await requireAiUser(request);
  if (profile.role !== "admin") throw new HttpsError("permission-denied", "Nur für Administratoren.");
  return bugOpsAttentionSummary(getFirestore());
});

const recordCrewTelemetry = onCall(telemetryOpts, async request => {
  const { uid } = await requireAiUser(request);
  await writeCrewMetric(uid, request.data || {}, { server: false });
  return { ok: true };
});

const getCrewTelemetrySummary = onCall(telemetryOpts, async request => {
  const { profile } = await requireAiUser(request);
  if (profile.role !== "admin") throw new HttpsError("permission-denied", "Nur für Administratoren.");
  const days = Math.max(1, Math.min(90, Number(request.data?.days) || 30));
  return crewTelemetrySummary(days);
});

const cleanupCrewTelemetry = onSchedule({
  region: REGION,
  schedule: "35 3 * * *",
  timeZone: "Europe/Berlin",
  timeoutSeconds: 120,
  memory: "256MiB"
}, async () => {
  const result = await cleanupExpiredCrewTelemetry();
  console.log("Crew-Telemetrie-Retention abgeschlossen.", result);
});

const crewAssistant = onCall(assistantOpts, async request => {
  const { uid } = await requireAiUser(request);
  let clean;
  try {
    clean = cleanCrewRequest(request.data || {});
  } catch (err) {
    throw new HttpsError("invalid-argument", String(err?.message || "Ungültige Anfrage.").slice(0, 240));
  }

  await consumeQuota(uid, "assistant");
  try {
    const { data, usage } = await requestStructured(
      params => getOpenAI().responses.create(params, { timeout: 90000, maxRetries: 2 }),
      {
        model: TEXT_MODEL,
        store: false,
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: [{ type: "input_text", text: crewSystemPrompt(clean.crewId, clean.uiLocale) }] },
          { role: "user", content: [{ type: "input_text", text: crewUserPrompt(clean) }] }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "gradecrew_crew_assistant_v1",
            strict: true,
            schema: crewAssistantSchema
          }
        }
      }
    );
    const result = normalizeCrewResult(data, clean.uiLocale);
    await recordUsage(uid, "assistant", usage, {
      crewId: clean.crewId,
      intent: result.intent,
      actionType: result.action.type,
      cacheCandidate: result.cacheCandidate,
      uiLocale: clean.uiLocale,
      assistantVersion: "crew-v1-i18n"
    });
    await recordCrewMetricSafe(uid, {
      event: "ai_fallback_completed",
      crewId: clean.crewId,
      source: "ai",
      fields: result.action.type === "patch_ai_form" ? patchMetricFields(result.action.patch) : [],
      parserVersion: "crew-ai-v1",
      screen: clean.context?.screen
    }, { server: true });
    return result;
  } catch (err) {
    const code = err instanceof AiResponseError ? err.code : "unavailable";
    await recordCrewMetricSafe(uid, {
      event: "ai_fallback_failed",
      crewId: clean.crewId,
      source: "ai",
      parserVersion: "crew-ai-v1",
      screen: clean.context?.screen,
      errorType: "unavailable"
    }, { server: true });
    console.warn("Crew Assistant fehlgeschlagen:", {
      code,
      crewId: clean.crewId,
      uiLocale: clean.uiLocale,
      name: err?.name,
      status: err?.status
    });
    throw new HttpsError(code === "failed-precondition" ? "failed-precondition" : "unavailable", "Die Crew-KI ist gerade nicht verfügbar. Bitte erneut versuchen.");
  }
});

const reviseWholeTest = onCall({ ...assistantOpts, timeoutSeconds: 300, memory: "1GiB" }, async request => {
  const { uid } = await requireAiUser(request);
  let clean;
  try {
    clean = cleanWholeTestRevisionRequest(request.data || {});
  } catch (err) {
    throw new HttpsError("invalid-argument", String(err?.message || "Ungültige Überarbeitung.").slice(0, 300));
  }

  // A whole-test revision is a test-level paid operation and intentionally uses
  // the existing test quota instead of creating a second unlimited allowance.
  await consumeQuota(uid, "test");
  try {
    const { data, usage } = await requestStructured(
      params => getOpenAI().responses.create(params, { timeout: 240000, maxRetries: 2 }),
      {
        model: TEXT_MODEL,
        store: false,
        reasoning: { effort: "medium" },
        input: [
          { role: "system", content: [{ type: "input_text", text: WHOLE_TEST_REVISION_SYSTEM }] },
          { role: "user", content: [{ type: "input_text", text: wholeTestRevisionPrompt(clean) }] }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "gradecrew_emmi_whole_test_v1",
            strict: true,
            schema: wholeTestRevisionSchema(clean)
          }
        }
      }
    );
    const result = finalizeWholeTestRevision(clean, data);
    await recordUsage(uid, "test", usage, {
      operation: "whole_test_revision",
      revisionVersion: REVISION_VERSION,
      questionCount: clean.test.questions.length,
      instructionLength: clean.instruction.length,
      changedCount: result.changedIndices.length,
      unchangedCount: result.unchangedIndices.length,
      lockedCount: result.lockedCount,
      invalidCount: result.invalidCount,
      model: TEXT_MODEL
    });
    return {
      ...result,
      meta: {
        model: TEXT_MODEL,
        revisionVersion: REVISION_VERSION
      }
    };
  } catch (err) {
    const code = err instanceof AiResponseError ? err.code : "unavailable";
    console.warn("Emmi-Gesamtüberarbeitung fehlgeschlagen:", {
      code,
      name: err?.name,
      status: err?.status,
      questionCount: clean.test.questions.length
    });
    throw new HttpsError(code === "failed-precondition" ? "failed-precondition" : "unavailable", "Emmi konnte den Test gerade nicht zuverlässig überarbeiten. Bitte erneut versuchen.");
  }
});

module.exports = {
  ...existing,
  aggregateBugFeedback,
  getBugOpsSummary,
  recordCrewTelemetry,
  getCrewTelemetrySummary,
  cleanupCrewTelemetry,
  getQuestionAudioDrafts,
  syncQuestionAudioDrafts,
  generateQuestionSolutionAudio,
  crewAssistant,
  reviseWholeTest
};
