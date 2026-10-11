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

function normalizePrepareRequest(data = {}) {
  return {
    requestId: normalizeRequestId(data.requestId),
    conversationText: normalizeText(data.conversationText, "Sprachtext", MAX_CONVERSATION_CHARS)
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

function normalizePrepareResult(value = {}) {
  if (value.status === "ready") {
    return { status: "ready", preparedRequest: normalizePreparedRequest(value.preparedRequest) };
  }
  if (value.status !== "needsInfo" || !Array.isArray(value.missingFields) || value.missingFields.length < 1 || value.missingFields.length > 3) {
    throw invalid("Ungültige Remy-Rückfrage.");
  }
  const missingFields = [...new Set(value.missingFields)];
  if (missingFields.length !== value.missingFields.length || missingFields.some(field => !REQUIRED_FIELDS.has(field))) {
    throw invalid("Die Rückfrage enthält unbekannte Pflichtfelder.");
  }
  return {
    status: "needsInfo",
    missingFields,
    question: normalizeText(value.question, "Rückfrage", MAX_QUESTION_CHARS)
  };
}

function buildPrepareResult(extracted = {}, defaults = {}) {
  const count = extracted.count === null || extracted.count === undefined ? defaults.count : extracted.count;
  if (count !== undefined && count !== null && (!Number.isInteger(count) || count < 1 || count > 100)) {
    throw invalid("Die Aufgabenzahl muss zwischen 1 und 100 liegen.");
  }
  const preparedRequest = {
    subject: typeof extracted.subject === "string" && extracted.subject.trim() ? extracted.subject.trim() : defaults.subject,
    grade: typeof extracted.grade === "string" && extracted.grade.trim() ? extracted.grade.trim() : defaults.grade,
    topic: typeof extracted.topic === "string" && extracted.topic.trim() ? extracted.topic.trim() : "",
    count
  };
  const missingFields = [...REQUIRED_FIELDS].filter(field => field === "count"
    ? !Number.isInteger(preparedRequest.count) : !preparedRequest[field]);
  if (!missingFields.length) return normalizePrepareResult({ status: "ready", preparedRequest });
  const prompts = { subject: "welches Fach", grade: "welche Klasse", topic: "welches Thema", count: "wie viele Aufgaben" };
  const askedFields = missingFields.slice(0, 3);
  const parts = askedFields.map(field => prompts[field]);
  const prefix = parts.slice(0, -1).join(", ");
  const question = askedFields.length === 1 && askedFields[0] === "count" ? "Wie viele Aufgaben soll ich erstellen?"
    : parts.length === 1 ? `${parts[0][0].toLocaleUpperCase("de-DE")}${parts[0].slice(1)}?`
      : `${prefix[0].toLocaleUpperCase("de-DE")}${prefix.slice(1)} und ${parts.at(-1)} soll ich verwenden?`;
  return normalizePrepareResult({ status: "needsInfo", missingFields: askedFields, question });
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
  normalizePrepareResult,
  buildPrepareResult,
  normalizeSubmitRequest,
  normalizeRecoveryRequest
};
