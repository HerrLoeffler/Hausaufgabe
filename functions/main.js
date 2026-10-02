"use strict";

// Wrapper entrypoint: keep every existing Firebase export from index.js intact and
// add focused assistant endpoints without modifying the large, proven generation module.
const existing = require("./index");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { REGION, TEXT_MODEL } = require("./lib/constants");
const { requireAiUser } = require("./lib/access");
const { consumeQuota, recordUsage } = require("./lib/usage");
const { getOpenAI } = require("./lib/openai-client");
const { requestStructured, AiResponseError } = require("./lib/structured-response");
const {
  crewAssistantSchema,
  cleanCrewRequest,
  crewSystemPrompt,
  crewUserPrompt,
  normalizeCrewResult
} = require("./lib/crew-assistant");
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
    return result;
  } catch (err) {
    const code = err instanceof AiResponseError ? err.code : "unavailable";
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

module.exports = { ...existing, crewAssistant, reviseWholeTest };
