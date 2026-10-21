"use strict";

const MAX_CONVERSATION_CHARS = 2500;
const MAX_QUESTION_CHARS = 280;
const REQUIRED_FIELDS = new Set(["subject", "grade", "topic", "count"]);
const REQUEST_ID = /^[a-zA-Z0-9-]{1,40}$/;

function invalid(message) {
  const error = new Error(message);
  error.code = "invalid-argument";
  return error;
}

function normalizeRequestId(value) {
  if (typeof value !== "string" || !REQUEST_ID.test(value)) throw invalid("Ungültige Anfrage-ID.");
  return value;
}

function normalizeText(value, field, maximum) {
  if (typeof value !== "string") throw invalid(`${field} fehlt.`);
  const text = value.trim();
  if (!text || text.length > maximum) throw invalid(`${field} ist ungültig.`);
  return text;
}

function normalizeKnownFields(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid("Remys bisherige Testangaben sind ungültig.");
  const known = {};
  for (const [field, maximum] of [["subject", 120], ["grade", 60], ["topic", 500]]) {
    const item = value[field];
    if (item === undefined || item === null) continue;
    if (typeof item !== "string" || item.trim().length > maximum) throw invalid(`Remys Angabe für ${field} ist ungültig.`);
    if (item.trim()) known[field] = item.trim();
  }
  if (value.count !== undefined && value.count !== null) {
    if (!Number.isInteger(value.count) || value.count < 1 || value.count > 100) throw invalid("Remys Aufgabenzahl ist ungültig.");
    known.count = value.count;
  }
  return known;
}

function normalizePrepareRequest(data = {}) {
  return {
    requestId: normalizeRequestId(data.requestId),
    conversationText: normalizeText(data.conversationText, "Sprachtext", MAX_CONVERSATION_CHARS),
    knownFields: normalizeKnownFields(data.knownFields)
  };
}

function normalizePreparedRequest(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) value = {};
  const subject = normalizeText(value.subject, "Fach", 120);
  const grade = normalizeText(value.grade, "Klasse", 60);
  const topic = normalizeText(value.topic, "Thema", 500);
  const count = value.count;
  if (!Number.isInteger(count) || count < 1 || count > 100) throw invalid("Die Aufgabenzahl muss zwischen 1 und 100 liegen.");
  return { subject, grade, topic, count };
}

function normalizeDraft(value = {}) {
  if (value !== undefined && value !== null && (typeof value !== "object" || Array.isArray(value))) throw invalid("Remys Entwurf ist ungültig.");
  const source = value || {};
  const draft = {};
  for (const [field, maximum] of [["subject", 120], ["grade", 60], ["topic", 500]]) {
    const item = source[field];
    if (item !== undefined && item !== null && (typeof item !== "string" || item.trim().length > maximum)) throw invalid(`Remys Entwurf für ${field} ist ungültig.`);
    draft[field] = typeof item === "string" ? item.trim() : "";
  }
  const count = source.count;
  if (count !== undefined && count !== null && (!Number.isInteger(count) || count < 1 || count > 100)) throw invalid("Remys Entwurf für Aufgaben ist ungültig.");
  draft.count = count ?? null;
  return draft;
}

function normalizePrepareResult(value = {}) {
  if (value.status === "ready") {
    const preparedRequest = normalizePreparedRequest(value.preparedRequest);
    return { status: "ready", preparedRequest, draft: preparedRequest };
  }
  if (value.status !== "needsInfo" || !Array.isArray(value.missingFields) || value.missingFields.length < 1 || value.missingFields.length > REQUIRED_FIELDS.size) {
    throw invalid("Ungültige Remy-Rückfrage.");
  }
  const missingFields = [...new Set(value.missingFields)];
  if (missingFields.length !== value.missingFields.length || missingFields.some(field => !REQUIRED_FIELDS.has(field))) {
    throw invalid("Die Rückfrage enthält unbekannte Pflichtfelder.");
  }
  return {
    status: "needsInfo",
    missingFields,
    question: normalizeText(value.question, "Rückfrage", MAX_QUESTION_CHARS),
    draft: normalizeDraft(value.draft)
  };
}

function buildPrepareResult(extracted = {}, defaults = {}, knownFields = {}) {
  const count = extracted.count === null || extracted.count === undefined
    ? (knownFields.count ?? defaults.count)
    : extracted.count;
  if (count !== undefined && count !== null && (!Number.isInteger(count) || count < 1 || count > 100)) {
    throw invalid("Die Aufgabenzahl muss zwischen 1 und 100 liegen.");
  }
  const preparedRequest = {
    subject: typeof extracted.subject === "string" && extracted.subject.trim() ? extracted.subject.trim() : (knownFields.subject || defaults.subject || ""),
    grade: typeof extracted.grade === "string" && extracted.grade.trim() ? extracted.grade.trim() : (knownFields.grade || defaults.grade || ""),
    topic: typeof extracted.topic === "string" && extracted.topic.trim() ? extracted.topic.trim() : (knownFields.topic || ""),
    count: count ?? null
  };
  const missingFields = [...REQUIRED_FIELDS].filter(field => field === "count"
    ? !Number.isInteger(preparedRequest.count) : !preparedRequest[field]);
  if (!missingFields.length) return normalizePrepareResult({ status: "ready", preparedRequest });
  const prompts = { subject: "welches Fach", grade: "welche Klasse", topic: "welches Thema", count: "wie viele Aufgaben" };
  const parts = missingFields.map(field => prompts[field]);
  const question = missingFields.length === 1 && missingFields[0] === "count" ? "Wie viele Aufgaben soll ich erstellen?"
    : missingFields.length === 1 ? `${parts[0][0].toLocaleUpperCase("de-DE")}${parts[0].slice(1)}?`
      : `${parts.slice(0, -1).join(", ")} und ${parts.at(-1)}`;
  const completeQuestion = missingFields.length === 1 ? question : `${question[0].toLocaleUpperCase("de-DE")}${question.slice(1)} soll ich verwenden?`;
  return normalizePrepareResult({ status: "needsInfo", missingFields, question: completeQuestion, draft: preparedRequest });
}

function normalizeSubmitRequest(data = {}) {
  return {
    requestId: normalizeRequestId(data.requestId),
    preparedRequest: normalizePreparedRequest(data.preparedRequest)
  };
}

function normalizeRecoveryRequest(data = {}) {
  return { requestId: normalizeRequestId(data.requestId) };
}

module.exports = {
  MAX_CONVERSATION_CHARS,
  normalizePrepareRequest,
  normalizeKnownFields,
  normalizePrepareResult,
  buildPrepareResult,
  normalizeSubmitRequest,
  normalizeRecoveryRequest
};
