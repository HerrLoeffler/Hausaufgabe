import test from "node:test";
import assert from "node:assert/strict";
import { classifyFreeTextAnswer, freeTextSimilarity, normalizeFreeText, summarizeFreeTextClassifications } from "./free-text-review.mjs";

test("normalisiert Großschreibung, Satzzeichen und Leerzeichen", () => {
  assert.equal(normalizeFreeText("  Paris!  "), "paris");
});

test("exakter akzeptierter Freitext ist grün", () => {
  const result = classifyFreeTextAnswer({ given: "Paris.", acceptedAnswers: ["Paris"], maxPoints: 2 });
  assert.equal(result.level, "green");
  assert.equal(result.suggestedPoints, 2);
  assert.equal(result.requiresTeacherReview, false);
});

test("manuelle Prüfung bleibt trotz exaktem Treffer erhalten", () => {
  const result = classifyFreeTextAnswer({ given: "Photosynthese", acceptedAnswers: ["Photosynthese"], manualReview: true, maxPoints: 1 });
  assert.equal(result.level, "green");
  assert.equal(result.requiresTeacherReview, true);
});

test("kleine Tippfehler werden zur Prüfung markiert", () => {
  const result = classifyFreeTextAnswer({ given: "Bundesrepublik Deutchland", acceptedAnswers: ["Bundesrepublik Deutschland"], maxPoints: 1 });
  assert.equal(result.level, "yellow");
  assert.ok(result.confidence >= 0.72);
});

test("deutlich abweichende Antwort ist rot, aber nicht automatisch als falsch bezeichnet", () => {
  const result = classifyFreeTextAnswer({ given: "Mond", acceptedAnswers: ["Paris"], maxPoints: 1 });
  assert.equal(result.level, "red");
  assert.match(result.reason, /kann trotzdem fachlich richtig sein/i);
  assert.equal(result.requiresTeacherReview, true);
});

test("leere Antwort ist rot und braucht keine fachliche Prüfung", () => {
  const result = classifyFreeTextAnswer({ given: "", acceptedAnswers: ["Paris"], maxPoints: 1 });
  assert.equal(result.level, "red");
  assert.equal(result.label, "Keine Antwort");
  assert.equal(result.suggestedPoints, 0);
  assert.equal(result.requiresTeacherReview, false);
});

test("fehlende Musterlösung wird als kritische Prüfstelle erkannt", () => {
  const result = classifyFreeTextAnswer({ given: "Eine plausible Antwort", acceptedAnswers: [], maxPoints: 2 });
  assert.equal(result.level, "red");
  assert.match(result.reason, /keine Musterlösung/i);
});

test("Zusammenfassung zählt Ampelstufen", () => {
  assert.deepEqual(summarizeFreeTextClassifications([{ level: "green" }, { level: "yellow" }, { level: "red" }, { level: "red" }]), { green: 1, yellow: 1, red: 2 });
});

test("Ähnlichkeitswert ist symmetrisch genug für kurze Tippfehler", () => {
  const a = freeTextSimilarity("Deutchland", "Deutschland");
  const b = freeTextSimilarity("Deutschland", "Deutchland");
  assert.ok(Math.abs(a - b) < 0.0001);
});
