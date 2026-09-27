"use strict";

// Transport failures are retried by the SDK. Only unusable *successful* responses
// get one extra request here; an explicit refusal never triggers another call.
class AiResponseError extends Error {
  constructor(reason, message, response = {}) {
    super(message);
    this.name = "AiResponseError";
    this.code = reason === "refusal" ? "failed-precondition" : "unavailable";
    this.details = { reason, responseStatus: response.status || "", providerResponseId: response.id || "" };
  }
}
function parseStructuredResponse(response) {
  if (response?.output?.some(item => item.content?.some(part => part.type === "refusal"))) {
    throw new AiResponseError("refusal", "Die KI konnte diese Anfrage nicht bearbeiten.", response);
  }
  if (!response || (response.status && response.status !== "completed")) {
    throw new AiResponseError(`response-${response?.status || "missing"}`, "Die KI-Antwort wurde nicht vollständig abgeschlossen.", response);
  }
  if (!String(response.output_text || "").trim()) throw new AiResponseError("empty-response", "Die KI hat keine verwertbare Antwort geliefert.", response);
  try {
    const data = JSON.parse(response.output_text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("object-required");
    return data;
  } catch (_) {
    throw new AiResponseError("invalid-json", "Die KI hat kein vollständiges Datenformat geliefert.", response);
  }
}
async function requestStructured(create, request) {
  const usage = {};
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await create(request);
    for (const key of ["input_tokens", "output_tokens", "total_tokens"]) usage[key] = Number(usage[key] || 0) + Number(response?.usage?.[key] || 0);
    try { return { data: parseStructuredResponse(response), usage }; }
    catch (err) {
      // Content-filter/incomplete requests must not bypass the provider's decision.
      const filtered = response?.incomplete_details?.reason === "content_filter";
      if (attempt || err.details?.reason === "refusal" || filtered) { err.usage = usage; throw err; }
    }
  }
}
module.exports = { parseStructuredResponse, requestStructured, AiResponseError };
