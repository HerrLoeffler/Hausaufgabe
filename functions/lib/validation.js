"use strict";

const { QUESTION_TYPES, LIMITS } = require("./constants");

function roundHalf(value) { return Math.round(Number(value) * 2) / 2; }
function normalizeText(value) { return String(value ?? "").trim(); }
function comparable(value) {
  return normalizeText(value).normalize("NFKC").toLocaleLowerCase("de").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}
function comparableAnswer(value) { return comparable(value).replace(/^(?:a|an|the|ein|eine|einen|einem|eines|der|die|das) /, ""); }
const INSTRUCTION_WORDS = new Set("welche welcher welches welchen wähle waehle kreuze an zu aus richtige richtiges richtigen antwort bild abbildung zeigt sehen sie du das die der den dem ein eine einen einem eines ist sind wird werden auf im in mit und oder welche bilder choice choose select identify which what is the a an of shown picture image correct answer item".split(" "));
function keyTerms(text) { return [...new Set(comparable(text).split(" ").filter(w => w.length > 1 && !INSTRUCTION_WORDS.has(w)))]; }
function answerKey(q) {
  if (["single", "dropdown", "multi"].includes(q.type)) return (q.options || []).filter(o => o.correct).map(o => comparableAnswer(o.text)).sort().join("|");
  if (q.type === "text") return (q.acceptedAnswers || []).map(comparableAnswer).sort().join("|");
  if (q.type === "gapfill") return [...String(q.text || "").matchAll(/\[([^\]]+)\]/g)].map(m => comparable(m[1].split("|")[0])).join("|");
  if (q.type === "number") return `${q.numericAnswer}:${comparable(q.unit)}`;
  return "";
}
function sameQuestion(a, b) {
  if (!a || !b || !a.text || !b.text) return false;
  const family = t => ["single", "dropdown"].includes(t) ? "choice" : t;
  const sameFormat = family(a.type) === family(b.type) && (a.mediaIntent?.kind || "none") === (b.mediaIntent?.kind || "none");
  const stemA = comparable(a.text), stemB = comparable(b.text);
  const keyA = answerKey(a), keyB = answerKey(b);
  if (stemA === stemB) return sameFormat || Boolean(keyA && keyA === keyB);
  if (!keyA || keyA !== keyB) return false;
  const termsA = keyTerms(a.text), termsB = keyTerms(b.text);
  if (!termsA.length || !termsB.length) return false;
  const overlap = termsA.filter(x => termsB.includes(x)).length;
  return overlap / Math.max(termsA.length, termsB.length) >= (sameFormat ? 0.8 : 0.9);
}

function validateQuestion(q, { allowedTypes = QUESTION_TYPES, allowImages = true, allowImageChoices = true } = {}) {
  const errors = [];
  if (!q || typeof q !== "object") return ["Aufgabe fehlt."];
  if (!allowedTypes.includes(q.type)) errors.push(`Nicht erlaubter Aufgabentyp: ${q.type}`);
  if (!normalizeText(q.text)) errors.push("Fragetext fehlt.");
  if (!(Number(q.points) >= 0.5) || Math.abs(Number(q.points) * 2 - Math.round(Number(q.points) * 2)) > 1e-9) errors.push("Punkte müssen positive 0,5-Schritte sein.");
  if (["single", "dropdown", "multi"].includes(q.type)) {
    const opts = Array.isArray(q.options) ? q.options : [];
    if (opts.length < 2 || opts.some(o => !normalizeText(o.text))) errors.push("Antwortoptionen unvollständig.");
    const labels = opts.map(o => comparableAnswer(o.text)).filter(Boolean);
    if (new Set(labels).size !== labels.length) errors.push("Antwortoptionen müssen eindeutig sein.");
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
  if (q.type === "number" && /\b(?:wie viele|anzahl der)\s+komma(?:s|ta)?\b/i.test(q.text || "")) {
    const quotedSentences = [...String(q.text).matchAll(/„([^“]+)“|"([^"]+)"/g)].map(match => match[1] || match[2]);
    const sentence = quotedSentences.length ? quotedSentences.join(" ") : String(q.text).split(/[?:]/).slice(1).join(" ");
    if (sentence.includes(",")) errors.push("Bei einer Frage nach der Anzahl der Kommas darf der zu prüfende Satz noch keine Kommas enthalten.");
  }
  const mi = q.mediaIntent || { kind: "none" };
  if (!allowImages && mi.kind !== "none") errors.push("Bilder sind für diesen Test deaktiviert.");
  if (!allowImageChoices && mi.kind === "image_choices") errors.push("Bildantworten sind deaktiviert.");
  if (mi.kind === "ai_generated" && !normalizeText(mi.prompt)) errors.push("Bildbeschreibung fehlt.");
  if (mi.kind === "uploaded_crop") errors.push("Upload-Ausschnitte werden derzeit nicht automatisch erstellt.");
  if (mi.kind === "image_choices") {
    if (!["single", "multi"].includes(q.type)) errors.push("Bildantworten brauchen Single Choice oder Multiple Choice.");
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4 || mi.count !== q.options.length) errors.push("Bildantworten brauchen genau 2–4 Bilder, eines pro Antwortoption.");
    if ((q.options || []).some(o => /^(?:bild|abbildung)\s*[a-d1-4]?\s*$/i.test(o.text || ""))) errors.push("Jede Bildantwort braucht eine konkrete, eigene Szenenbeschreibung.");
    const stem = comparable(q.text);
    const stemTerms = keyTerms(q.text);
    if (/\b(wieder|erneut|noch einmal)\b/.test(stem) && /\b(bedeutung|abbildung|bild|zeigt)\b/.test(stem)) {
      errors.push("Die zeitliche Bedeutung von ‚wieder‘ ist aus einem einzelnen Bild nicht eindeutig erkennbar.");
    }
    if (/welche pr[aä]position/.test(stem) && /\b(unter|auf|ueber|über|neben|zwischen|hinter|vor)\b/.test(stem)) {
      errors.push("Der Fragetext nennt bereits die gesuchte räumliche Beziehung.");
    }
    if (!/\bwelche[sr]?\s+(abbildung|bild)\b/.test(stem) && (q.options || []).filter(o => o.correct).some(o => {
      const terms = keyTerms(o.text).filter(term => term.length >= 3);
      return terms.length && terms.every(term => stemTerms.includes(term)) && (terms.length >= 2 || /\b(welche|welches|welcher)\b/.test(stem));
    })) errors.push("Die Lösung der Bildantwort steht bereits im Fragetext.");
  }
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
  for (let i = 0; i < qs.length; i += 1) {
    const prior = qs.findIndex((q, j) => j < i && sameQuestion(q, qs[i]));
    if (prior >= 0) errors.push(`Aufgabe ${i + 1} wiederholt inhaltlich Aufgabe ${prior + 1}.`);
    if (Array.isArray(opts.referenceQuestions) && opts.referenceQuestions.some(q => sameQuestion(q, qs[i]))) errors.push(`Aufgabe ${i + 1} wiederholt eine Aufgabe des Ausgangstests.`);
    if (opts.negativeQuestions?.some(q => sameQuestion(q, qs[i]))) errors.push(`Aufgabe ${i + 1}: Eine ähnliche Aufgabe wurde zuvor als fehlerhaft bewertet.`);
    for (const issue of opts.reviewIssues || []) {
      if (issue.index === i && comparable(issue.text) === comparable(qs[i].text)) errors.push(`Aufgabe ${i + 1}: Qualitätsprüfung: ${issue.detail}`);
    }
  }
  if (opts.expectedCount && qs.length !== opts.expectedCount) errors.push(`Erwartet ${opts.expectedCount} Aufgaben, erhalten ${qs.length}.`);
  if (opts.targetPoints) {
    const sum = roundHalf(qs.reduce((s, q) => s + Number(q.points || 0), 0));
    if (sum !== roundHalf(opts.targetPoints)) errors.push(`Gesamtpunkte ${sum} statt ${roundHalf(opts.targetPoints)}.`);
  }
  if (opts.maxVisualQuestions != null) {
    const count = qs.filter(q => q.mediaIntent?.kind && q.mediaIntent.kind !== "none").length;
    if (count > opts.maxVisualQuestions) errors.push(`Zu viele visuelle Aufgaben (${count}/${opts.maxVisualQuestions}).`);
  }
  if (opts.imageQuestionCount != null) {
    const count = qs.filter(q => q.mediaIntent?.kind === "ai_generated").length;
    if (count !== opts.imageQuestionCount) errors.push(`Erwartet ${opts.imageQuestionCount} Aufgaben mit einem Bild, erhalten ${count}.`);
  }
  if (opts.imageAnswerQuestionCount != null) {
    const count = qs.filter(q => q.mediaIntent?.kind === "image_choices").length;
    if (count !== opts.imageAnswerQuestionCount) errors.push(`Erwartet ${opts.imageAnswerQuestionCount} Aufgaben mit Bildantworten, erhalten ${count}.`);
  }
  return errors;
}

module.exports = { validateQuestion, validateTest, normalizeQuestion, roundHalf, sameQuestion };
