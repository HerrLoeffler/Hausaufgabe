import assert from "node:assert/strict";
import test from "node:test";
import { CREW_MEMBERS, parseTestRequest, resolveLocalCrewRequest } from "./crew-assistant-core.mjs";

test("all four GradeCrew members are addressable", () => {
  assert.deepEqual(Object.keys(CREW_MEMBERS), ["coco", "remy", "emmi", "wilma"]);
  for (const member of Object.values(CREW_MEMBERS)) {
    assert.ok(member.name);
    assert.ok(member.asset.includes("assets/gradecrew/"));
  }
});

test("parses a natural Remy test request into a partial form patch", () => {
  const patch = parseTestRequest("Erstelle mir einen Englischtest für die 4. Klasse zum Thema Farben, leichte Aufgaben, 12 Aufgaben und 20 Punkte.");
  assert.equal(patch.subject, "Englisch");
  assert.equal(patch.grade, "4");
  assert.equal(patch.topic, "Farben");
  assert.equal(patch.difficulty, "leicht");
  assert.equal(patch.count, 12);
  assert.equal(patch.points, 20);
});

test("keeps duration as an explicit request without inventing a form field", () => {
  const patch = parseTestRequest("Mathe Klasse 7 über Brüche, 15 Minuten");
  assert.equal(patch.subject, "Mathematik");
  assert.equal(patch.grade, "7");
  assert.equal(patch.durationMinutes, 15);
});

test("recognizes requested and excluded task types", () => {
  const patch = parseTestRequest("Deutsch Klasse 6 Thema Wortarten mit Multiple Choice und Zuordnung, ohne Freitext");
  assert.deepEqual(new Set(patch.allowedTypes), new Set(["multi", "matching", "text"]));
  assert.deepEqual(patch.excludeTypes, ["text"]);
});

test("separates a trailing difficulty word from a short topic", () => {
  const patch = parseTestRequest("Englisch Klasse 4 Thema Farben leicht");
  assert.equal(patch.topic, "Farben");
  assert.equal(patch.difficulty, "leicht");
});

test("common questions stay local and do not request AI", () => {
  const result = resolveLocalCrewRequest({ crewId: "coco", text: "Was kannst du?" });
  assert.equal(result.handled, true);
  assert.equal(result.source, "local");
  assert.equal(result.intent, "capabilities");
  assert.equal(result.needsAi, undefined);
});

test("clear test command becomes a real form action", () => {
  const result = resolveLocalCrewRequest({ crewId: "remy", text: "Englisch Klasse 4 Thema Farben leicht" });
  assert.equal(result.handled, true);
  assert.equal(result.action.type, "patch_ai_form");
  assert.equal(result.action.patch.grade, "4");
  assert.equal(result.action.patch.topic, "Farben");
});

test("unknown open conversation is delegated to AI fallback", () => {
  const result = resolveLocalCrewRequest({ crewId: "emmi", text: "Wie würdest du diese Aufgabe didaktisch verbessern?" });
  assert.equal(result.handled, false);
  assert.equal(result.needsAi, true);
});
