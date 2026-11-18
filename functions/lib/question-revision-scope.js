"use strict";

const { questionSchema } = require("./schemas");
const { normalizeQuestion } = require("./validation");

function inferQuestionRevisionScope(instruction) {
  const text = String(instruction || "").normalize("NFKC").toLowerCase();
  const answers = /(?:nur|neue|andere)\s+(?:die\s+)?antwort(?:en|optionen|möglichkeiten)|frage(?:stellung)?\s+(?:so\s+)?(?:lassen|beibehalten|unverändert)|(?:frage(?:stellung)?|fragetext)\s+nicht\s+(?:ändern|verändern)/u.test(text);
  const question = /nur\s+(?:die\s+)?(?:frage(?:stellung)?|fragetext)|antwort(?:en|optionen|möglichkeiten)\s+(?:so\s+)?(?:lassen|beibehalten|unverändert)|antwort(?:en|optionen|möglichkeiten)\s+nicht\s+(?:ändern|verändern)/u.test(text);
  if (answers && question) throw new Error("Dein Wunsch nennt widersprüchliche Bereiche. Bitte wähle einen Bereich und passe den Text an.");
  return answers ? "answers" : question ? "question" : null;
}

function questionRevisionUnavailable(q, scope) {
  if (scope === "question" && (q.type === "gapfill" || (q.audioPresentation === "listening-only" || q.audioIntent?.presentation === "listening-only"))) return "Bei Lückentexten und reinen Höraufgaben sind Frage und Lösung bzw. Höranweisung verbunden. Bitte die ganze Aufgabe oder manuell bearbeiten.";
  if (scope === "answers" && (!["single", "multi", "dropdown"].includes(q.type) || q.imageChoicesOnly || q.audioAnswerMode === "audio-only" || q.options?.some(o => o.imageDataUrl || o.audioDataUrl))) return "Nur Antworten ist bei dieser Aufgabe nicht verfügbar. Unterstützt werden Auswahlaufgaben mit Textantworten; Freitextlösungen und Medien bitte über die ganze Aufgabe oder manuell bearbeiten.";
  return "";
}

function resolveQuestionRevisionScope(q, instruction, selection = "whole", explicit = false) {
  const inferred = inferQuestionRevisionScope(instruction);
  if (explicit && inferred && inferred !== selection) throw new Error("Auswahl und Änderungswunsch widersprechen sich. Bitte den Bereich oder den Text anpassen.");
  const scope = inferred || selection;
  if (!["whole", "question", "answers"].includes(scope)) throw new Error("Bitte einen gültigen Bereich wählen.");
  const unavailable = questionRevisionUnavailable(q, scope);
  if (unavailable) throw new Error(unavailable);
  return scope;
}

async function prepareScopedRevision(data, { uid, db, HttpsError }) {
  let scope;
  try { scope = resolveQuestionRevisionScope(data.question, data.instruction, data.revisionScope, data.revisionScopeExplicit === true); }
  catch (err) { throw new HttpsError("invalid-argument", err.message); }
  if (scope === "whole") return null;
  if (data.variant || data.requireDifferent || data.targetType) throw new HttpsError("invalid-argument", "Eine Teilüberarbeitung kann keine Variante, Ersatzaufgabe oder Typänderung sein.");
  const source = data.revisionSource;
  if (!source || !/^[A-Z0-9_-]{4,40}$/i.test(source.quizId || "") || !/^[A-Z0-9_-]{2,80}$/i.test(source.questionId || "") || !/^[a-f0-9]{1,16}$/i.test(source.revision || "") || (data.question.id && data.question.id !== source.questionId)) throw new HttpsError("invalid-argument", "Die Quelle der Überarbeitung fehlt oder ist ungültig.");
  const quiz = await db.collection("quizzes").doc(source.quizId).get();
  const record = quiz.data();
  if (!quiz.exists || record?.ownerId !== uid || record.rightsHold || record.isDeleted) throw new HttpsError("permission-denied", "Auf diesen Test kann nicht zugegriffen werden.");
  if (record.published && !record.ended) throw new HttpsError("failed-precondition", "Ein laufender Test darf nicht überarbeitet werden.");
  const field = scope === "question" ? "text" : "options";
  const property = JSON.parse(JSON.stringify(questionSchema.properties[field]));
  if (field === "text") { property.pattern = "\\S"; property.maxLength = 12000; }
  else { property.minItems = 2; property.maxItems = 8; }
  const schema = { type: "object", additionalProperties: false, properties: { [field]: property }, required: [field] };
  const rule = scope === "question"
    ? "Ändere ausschließlich den Fragetext. Alle Antworten, Lösungsschlüssel, Punkte, Aufgabentyp, Medien, Hörtexte und Bewertungsregeln bleiben exakt erhalten. Der neue Fragetext muss zu den unveränderten Antworten und Lösungen passen."
    : "Ändere ausschließlich Textantwortoptionen und deren correct-Lösungsschlüssel. Der Fragetext, Aufgabentyp, Punkte, Medien, Hörtexte und Bewertungsregeln bleiben exakt erhalten. Erzeuge passende, eindeutige Antworten zur unveränderten Frage und prüfe den passenden Lösungsschlüssel neu.";
  return { scope, field, schema, source: { quizId: source.quizId, questionId: source.questionId, revision: source.revision }, rule };
}

function applyScopedRevision(question, patch, policy) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch) || Object.keys(patch).length !== 1 || !Object.hasOwn(patch, policy.field)) throw new Error("Die Antwort verändert geschützte Teile oder enthält nicht den gewählten Bereich.");
  if (policy.field === "text" && (typeof patch.text !== "string" || !patch.text.trim())) throw new Error("Der Fragetext fehlt.");
  if (policy.field === "options" && (!Array.isArray(patch.options) || patch.options.length < 2 || patch.options.length > 8 || patch.options.some(option => !option || Object.keys(option).length !== 2 || typeof option.text !== "string" || typeof option.correct !== "boolean"))) throw new Error("Die Antwortoptionen sind ungültig.");
  const normalized = normalizeQuestion({ ...question, ...patch });
  const value = policy.field === "options" ? normalized.options.map(({ text, correct }) => ({ text, correct })) : normalized.text;
  return { ...JSON.parse(JSON.stringify(question)), [policy.field]: value };
}

module.exports = { inferQuestionRevisionScope, resolveQuestionRevisionScope, questionRevisionUnavailable, prepareScopedRevision, applyScopedRevision };
