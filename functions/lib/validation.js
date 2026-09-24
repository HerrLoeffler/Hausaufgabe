"use strict";

const { QUESTION_TYPES, LIMITS } = require("./constants");

function roundHalf(value) { return Math.round(Number(value) * 2) / 2; }
function normalizeText(value) { return String(value ?? "").trim(); }

function validateQuestion(q, { allowedTypes = QUESTION_TYPES, allowImages = true, allowImageChoices = true, materialIds = [] } = {}) {
  const errors = [];
  if (!q || typeof q !== "object") return ["Aufgabe fehlt."];
  if (!allowedTypes.includes(q.type)) errors.push(`Nicht erlaubter Aufgabentyp: ${q.type}`);
  if (!normalizeText(q.text)) errors.push("Fragetext fehlt.");
  if (!(Number(q.points) >= 0.5) || Math.abs(Number(q.points) * 2 - Math.round(Number(q.points) * 2)) > 1e-9) errors.push("Punkte müssen positive 0,5-Schritte sein.");
  if (["single", "dropdown", "multi"].includes(q.type)) {
    const opts = Array.isArray(q.options) ? q.options : [];
    if (opts.length < 2 || opts.some(o => !normalizeText(o.text))) errors.push("Antwortoptionen unvollständig.");
    const correct = opts.filter(o => o.correct).length;
    if (q.type === "multi" ? correct < 1 : correct !== 1) errors.push(q.type === "multi" ? "Multiple Choice braucht mindestens eine richtige Antwort." : "Genau eine Antwort muss richtig sein.");
  }
  if (q.type === "text" && !q.manualReview && !(Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.some(normalizeText))) errors.push("Freitext braucht Lösungen oder manuelle Prüfung.");
  if (q.type === "truefalse" && typeof q.correctBoolean !== "boolean") errors.push("Richtig/Falsch-Lösung fehlt.");
  if (q.type === "gapfill" && !/\[[^\]]+\]/.test(q.text || "")) errors.push("Lückentext enthält keine [Lösung].");
  if (q.type === "matching" && (!Array.isArray(q.pairs) || q.pairs.length < 2 || q.pairs.some(p => !normalizeText(p.left) || !normalizeText(p.right)))) errors.push("Zuordnung braucht mindestens zwei vollständige Paare.");
  if (q.type === "ordering" && (!Array.isArray(q.items) || q.items.length < 2 || q.items.some(x => !normalizeText(x)))) errors.push("Sortierung braucht mindestens zwei Elemente.");
  if (q.type === "grouping" && (!Array.isArray(q.groups) || q.groups.length < 2 || q.groups.some(g => !normalizeText(g.name) || !Array.isArray(g.items) || !g.items.length))) errors.push("Gruppierung braucht mindestens zwei vollständige Gruppen.");
  if (q.type === "markwords") {
    if (!normalizeText(q.passage)) errors.push("Markiertext fehlt.");
    const targets = Array.isArray(q.targetWords) ? q.targetWords.filter(normalizeText) : [];
    if (!targets.length) errors.push("Zielwörter fehlen.");
    const haystack = normalizeText(q.passage).toLocaleLowerCase("de");
    if (targets.length && !targets.some(w => haystack.includes(normalizeText(w).toLocaleLowerCase("de")))) errors.push("Kein Zielwort kommt im Markiertext vor.");
  }
  if (q.type === "number" && !Number.isFinite(Number(q.numericAnswer))) errors.push("Numerische Lösung fehlt.");
  const mi = q.mediaIntent || { kind: "none" };
  if (!allowImages && mi.kind !== "none") errors.push("Bilder sind für diesen Test deaktiviert.");
  if (!allowImageChoices && mi.kind === "image_choices") errors.push("Bildantworten sind deaktiviert.");
  if (mi.kind === "uploaded_crop" && (!mi.sourceMaterialId || !materialIds.includes(mi.sourceMaterialId))) errors.push("Upload-Ausschnitt verweist auf kein freigegebenes Material.");
  if (mi.kind === "image_choices" && (mi.count < 2 || mi.count > 4)) errors.push("Bildantworten brauchen 2–4 Bilder.");
  return errors;
}

function normalizeQuestion(q) {
  const copy = JSON.parse(JSON.stringify(q));
  copy.points = Math.max(0.5, roundHalf(copy.points || 1));
  copy.text = normalizeText(copy.text);
  copy.options = Array.isArray(copy.options) ? copy.options.map(o => ({ text: normalizeText(o.text), correct: !!o.correct })) : [];
  copy.acceptedAnswers = Array.isArray(copy.acceptedAnswers) ? copy.acceptedAnswers.map(normalizeText).filter(Boolean) : [];
  copy.pairs = Array.isArray(copy.pairs) ? copy.pairs.map(p => ({ left: normalizeText(p.left), right: normalizeText(p.right) })) : [];
  copy.items = Array.isArray(copy.items) ? copy.items.map(normalizeText).filter(Boolean) : [];
  copy.groups = Array.isArray(copy.groups) ? copy.groups.map(g => ({ name: normalizeText(g.name), items: Array.isArray(g.items) ? g.items.map(normalizeText).filter(Boolean) : [] })) : [];
  copy.targetWords = Array.isArray(copy.targetWords) ? copy.targetWords.map(normalizeText).filter(Boolean) : [];
  copy.passage = normalizeText(copy.passage);
  copy.unit = normalizeText(copy.unit);
  copy.tolerance = Math.max(0, Number(copy.tolerance) || 0);
  copy.mediaIntent = copy.mediaIntent || { kind: "none", prompt: "", altText: "", count: 0, sourceMaterialId: "", reason: "" };
  return copy;
}

function validateTest(test, opts = {}) {
  const errors = [];
  if (!test || typeof test !== "object") return ["Test fehlt."];
  if (!normalizeText(test.title)) errors.push("Titel fehlt.");
  const qs = Array.isArray(test.questions) ? test.questions : [];
  if (!qs.length || qs.length > LIMITS.maxQuestions) errors.push("Ungültige Aufgabenanzahl.");
  qs.forEach((q, i) => validateQuestion(q, opts).forEach(e => errors.push(`Aufgabe ${i + 1}: ${e}`)));
  const normalizedTexts = qs.map(q => normalizeText(q.text).toLocaleLowerCase("de")).filter(Boolean);
  const duplicate = normalizedTexts.find((x, i) => normalizedTexts.indexOf(x) !== i);
  if (duplicate) errors.push("Mindestens zwei Aufgaben sind identisch.");
  if (opts.expectedCount && qs.length !== opts.expectedCount) errors.push(`Erwartet ${opts.expectedCount} Aufgaben, erhalten ${qs.length}.`);
  if (opts.targetPoints) {
    const sum = roundHalf(qs.reduce((s, q) => s + Number(q.points || 0), 0));
    if (sum !== roundHalf(opts.targetPoints)) errors.push(`Gesamtpunkte ${sum} statt ${roundHalf(opts.targetPoints)}.`);
  }
  if (opts.maxVisualQuestions != null) {
    const count = qs.filter(q => q.mediaIntent?.kind && q.mediaIntent.kind !== "none").length;
    if (count > opts.maxVisualQuestions) errors.push(`Zu viele visuelle Aufgaben (${count}/${opts.maxVisualQuestions}).`);
  }
  return errors;
}

module.exports = { validateQuestion, validateTest, normalizeQuestion, roundHalf };