"use strict";

// Wrapper entrypoint: keep every existing Firebase export from index.js intact and
// add the Crew Assistant without modifying the large, proven generation module.
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
          { role: "system", content: [{ type: "input_text", text: crewSystemPrompt(clean.crewId) }] },
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
    const result = normalizeCrewResult(data);
    await recordUsage(uid, "assistant", usage, {
      crewId: clean.crewId,
      intent: result.intent,
      actionType: result.action.type,
      cacheCandidate: result.cacheCandidate,
      assistantVersion: "crew-v1"
    });
    return result;
  } catch (err) {
    const code = err instanceof AiResponseError ? err.code : "unavailable";
    console.warn("Crew Assistant fehlgeschlagen:", {
      code,
      crewId: clean.crewId,
      name: err?.name,
      status: err?.status
    });
    throw new HttpsError(code === "failed-precondition" ? "failed-precondition" : "unavailable", "Die Crew-KI ist gerade nicht verfügbar. Bitte erneut versuchen.");
  }
});

module.exports = { ...existing, crewAssistant };
