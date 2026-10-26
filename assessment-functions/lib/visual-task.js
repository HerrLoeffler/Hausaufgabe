"use strict";

// Closed data contract around the approved Prototype 02 deterministic model.
// Kept in each independently deployed codebase; never evaluate task markup.
const core = require("./visual/core");
const VISUAL_FORMATS = Object.freeze(core.formats.filter(format => !["single", "multi", "number"].includes(format)));
const MAX_VISUAL_CHARS = 20000;
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value);
const safeId = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,60}$/.test(value) && !["__proto__", "prototype", "constructor"].includes(value);
function keys(value, allowed, label) {
  if (!plain(value) || Object.keys(value).some(key => !allowed.split(" ").includes(key))) throw new Error(`Ungültige Felder: ${label}.`);
}
function inspect(value, depth = 0) {
  if (depth > 8) throw new Error("Visuelle Aufgabe ist zu stark verschachtelt.");
  if (typeof value === "string" && (value.length > 4000 || /[<>]|(?:javascript|data|vbscript):/i.test(value))) throw new Error("Markup oder unsicherer Text in visueller Aufgabe.");
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Ungültige Zahl.");
  if (Array.isArray(value)) {
    if (value.length > 100) throw new Error("Zu viele visuelle Elemente.");
    value.forEach(child => inspect(child, depth + 1));
  } else if (plain(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (!safeId(key)) throw new Error("Unsicherer Feldname.");
      inspect(child, depth + 1);
    }
  }
}
const SPEC_FIELDS = {
  hotspot: "scene regions maxSelections", labeling: "scene regions items",
  scale: "context min max step majorStep unit card", angle: "degrees instrument min max",
  grid: "rows columns", chart: "min max step unit categories",
  connections: "directed nodes", coordinate: "mode minX maxX minY maxY step labels",
  evidence: "tokens", range: "min max step majorStep unit context startInclusive endInclusive",
  table: "columns rows answerMode numericForm", correction: "rows answerMode numericForm caseSensitive",
  timeline: "min max unit ticks events", sequence: "family items"
};
const SOLUTION_FIELDS = {
  hotspot: "regions text", labeling: "assignments", scale: "value tolerance", angle: "value tolerance",
  grid: "count", chart: "values", connections: "edges", coordinate: "points",
  evidence: "selections", range: "start end", table: "cells", correction: "rowId accepted",
  timeline: "assignments", sequence: "order"
};
function parseVisualTask(raw, { points } = {}) {
  if (typeof raw !== "string" || !raw || raw.length > MAX_VISUAL_CHARS) throw new Error("Visuelle Aufgabe muss begrenzter JSON-Text sein.");
  let task;
  try { task = JSON.parse(raw); } catch { throw new Error("Visuelle Aufgabe enthält ungültiges JSON."); }
  inspect(task);
  keys(task, "schemaVersion id revision format title subject grade prompt hint maxPoints objective rationale sourceNote spec solution provenance review", "Aufgabe");
  if (!VISUAL_FORMATS.includes(task.format) || !safeId(task.id) || !Number.isInteger(task.revision) || task.revision < 0 || task.revision > 1000000) throw new Error("Ungültiges visuelles Format oder ID.");
  for (const field of ["hint", "sourceNote"]) if (task[field] !== undefined && typeof task[field] !== "string") throw new Error("Ungültiger Aufgabentext.");
  keys(task.spec, SPEC_FIELDS[task.format], "Darstellung");
  keys(task.solution, SOLUTION_FIELDS[task.format], "Lösung");
  if (task.provenance !== undefined) keys(task.provenance, "kind offline model createdAt requestId", "Herkunft");
  if (task.review !== undefined) {
    keys(task.review, "status summary warnings teacherApprovalRequired", "Prüfung");
    if (task.review.warnings !== undefined) {
      if (!Array.isArray(task.review.warnings)) throw new Error("Ungültige Warnungen.");
      task.review.warnings.forEach(warning => keys(warning, "index severity code message", "Warnung"));
    }
  }
  for (const metadata of [task.provenance, task.review]) {
    if (metadata) for (const [key, value] of Object.entries(metadata)) {
      if (key === "warnings") continue;
      if (typeof value !== (["offline", "teacherApprovalRequired"].includes(key) ? "boolean" : "string")) throw new Error("Ungültige Metadaten.");
    }
  }
  const spec = task.spec, solution = task.solution;
  if (Object.hasOwn(spec, "caseSensitive") && typeof spec.caseSensitive !== "boolean") throw new Error("Ungültiger Groß-/Kleinschreibungsmodus.");
  for (const field of ["context", "unit", "card", "instrument", "mode", "answerMode", "numericForm", "scene", "family"]) {
    if (Object.hasOwn(spec, field) && typeof spec[field] !== "string") throw new Error("Ungültiger Darstellungstext.");
  }
  if (Object.hasOwn(solution, "text") && typeof solution.text !== "string") throw new Error("Ungültiger Lösungstext.");
  if (task.format === "correction" && (!Array.isArray(solution.accepted) || solution.accepted.some(value => typeof value !== "string" || !value.trim()))) throw new Error("Korrekturlösungen müssen Text sein.");
  const records = (values, allowed) => {
    if (!Array.isArray(values)) throw new Error("Visuelle Elemente fehlen.");
    values.forEach(value => { keys(value, allowed, "Element"); if (!safeId(value.id)) throw new Error("Unsichere Element-ID."); });
  };
  if (task.format === "labeling") records(spec.items, "id text");
  if (task.format === "timeline") {
    records(spec.ticks, "id value label");
    records(spec.events, "id text");
  }
  if (task.format === "sequence") records(spec.items, "id illustration caption");
  if (task.format === "chart") {
    records(spec.categories, "id label value");
    if (spec.categories.some(category => typeof category.label !== "string" || !category.label.trim())) throw new Error("Diagrammbeschriftung fehlt.");
  }
  if (task.format === "connections") {
    records(spec.nodes, "id label shortLabel x y");
    if (typeof spec.directed !== "boolean") throw new Error("Verbindungsrichtung fehlt.");
  }
  if (task.format === "evidence") records(spec.tokens, "id text");
  if (task.format === "correction") records(spec.rows, "id text");
  if (task.format === "table") {
    if (!Array.isArray(spec.rows) || !spec.rows.every(Array.isArray)) throw new Error("Ungültige Tabelle.");
    records(spec.rows.flat(), "id text input"); records(solution.cells, "id accepted");
    if (spec.rows.flat().some(cell => typeof cell.input !== "boolean" || typeof cell.text !== "string" || (cell.input && cell.text !== ""))) throw new Error("Tabellen-Eingabezellen müssen leer sein.");
    if (!spec.columns.every(column => typeof column === "string" && column.trim())) throw new Error("Tabellenspalten fehlen.");
  }
  for (const values of [task.format === "labeling" ? spec.items : null, spec.events, spec.tokens, task.format === "correction" ? spec.rows : null]) {
    if (values && values.some(value => typeof value.text !== "string" || !value.text.trim())) throw new Error("Elementtext fehlt.");
  }
  if (task.format === "coordinate") {
    if (!Array.isArray(solution.points)) throw new Error("Punkte fehlen.");
    solution.points.forEach(point => keys(point, "x y", "Punkt"));
    if (!Array.isArray(spec.labels) || spec.labels.some(label => typeof label !== "string" || !label.trim()) || [spec.minX, spec.maxX, spec.minY, spec.maxY].some(n => Math.abs(n) > 10000)) throw new Error("Ungültige Koordinatenbeschriftung oder Grenzen.");
  }
  if (["scale", "range"].includes(task.format) && !["numberline", "timeline", "temperature"].includes(spec.context)) throw new Error("Unbekannte Skala.");
  if (task.format === "angle" && (spec.min !== 0 || spec.max !== 180)) throw new Error("Ungültiger Winkelbereich.");
  const errors = core.validate(task);
  if (errors.length) throw new Error(errors.join(" "));
  if (points !== undefined && task.maxPoints !== Number(points)) throw new Error("Visuelle Punktzahl stimmt nicht mit Aufgabe überein.");
  return task;
}
function withQuestionPoints(question, points) {
  const changed = { ...question, points };
  if (question.type === "visual") {
    // Preserve malformed data for the normal validation/repair path.
    try {
      const task = parseVisualTask(question.visualTask);
      task.maxPoints = points;
      changed.visualTask = JSON.stringify(task);
    } catch { /* Validation reports the original malformed task. */ }
  }
  return changed;
}
function publicVisualTask(raw, options) { return JSON.stringify(core.publicTask(parseVisualTask(raw, options))); }
function serializeVisualAnswer(answer) {
  try {
    const serialized = JSON.stringify(answer ?? null);
    if (!serialized || serialized.length > MAX_VISUAL_CHARS) return "null";
    inspect(JSON.parse(serialized));
    return serialized;
  } catch { return "null"; }
}
function decodeVisualAnswer(answer) {
  if (typeof answer !== "string") return answer;
  try { return JSON.parse(answer); } catch { return answer; }
}
module.exports = { core, VISUAL_FORMATS, MAX_VISUAL_CHARS, parseVisualTask, publicVisualTask, serializeVisualAnswer, decodeVisualAnswer, withQuestionPoints };
