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

test("understands the short spoken class-and-topic phrasing used in staging feedback", () => {
  const patch = parseTestRequest("Erstelle mir einen Test für die 4 Klasse für Farben, leichte Aufgaben");
  assert.equal(patch.grade, "4");
  assert.equal(patch.topic, "Farben");
  assert.equal(patch.difficulty, "leicht");
});

test("separates the real staging sentence into topic, difficulty and wishes", () => {
  const patch = parseTestRequest("Gymnasium Mathe 4 Klasse Prozent Thema Prozent einfache Aufgaben vor allem bitte machen");
  assert.equal(patch.schoolType, "Gymnasium");
  assert.equal(patch.subject, "Mathematik");
  assert.equal(patch.grade, "4");
  assert.equal(patch.topic, "Prozent");
  assert.equal(patch.difficulty, "leicht");
  assert.equal(patch.notes, "Vor allem einfache Aufgaben.");
});

test("keeps pedagogical style wishes out of the topic", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Prozentrechnung viele Alltagsbeispiele und wenig Text");
  assert.equal(patch.topic, "Prozentrechnung");
  assert.match(patch.notes, /Viele Alltagsbeispiele/);
  assert.match(patch.notes, /Wenig Text/);
});

test("keeps fachlich meaningful topic additions such as Rabatt and Mehrwertsteuer", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Prozent mit Rabatt und Mehrwertsteuer");
  assert.equal(patch.topic, "Prozent mit Rabatt und Mehrwertsteuer");
});

test("difficulty progression is a wish instead of a false global difficulty", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Brüche. Die ersten Aufgaben leicht, danach schwerer.");
  assert.equal(patch.topic, "Brüche");
  assert.equal(patch.difficulty, undefined);
  assert.match(patch.notes, /Zuerst leichte Aufgaben/);
});

test("keeps duration as an explicit request without inventing a form field", () => {
  const patch = parseTestRequest("Mathe Klasse 7 über Brüche, 15 Minuten");
  assert.equal(patch.subject, "Mathematik");
  assert.equal(patch.grade, "7");
  assert.equal(patch.durationMinutes, 15);
});

test("recognizes requested and excluded task types", () => {
  const patch = parseTestRequest("Deutsch Klasse 6 Thema Wortarten mit Multiple Choice und Zuordnung, ohne Freitext");
  assert.deepEqual(new Set(patch.allowedTypes), new Set(["multi", "matching"]));
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

test("clear Remy test command becomes a real form action", () => {
  const result = resolveLocalCrewRequest({ crewId: "remy", text: "Englisch Klasse 4 Thema Farben leicht" });
  assert.equal(result.handled, true);
  assert.equal(result.action.type, "patch_ai_form");
  assert.equal(result.action.patch.grade, "4");
  assert.equal(result.action.patch.topic, "Farben");
});

test("Coco routes test creation to Remy instead of navigating or patching the form", () => {
  const result = resolveLocalCrewRequest({ crewId: "coco", text: "Mach mir einen Test für Klasse 4 über Farben" });
  assert.equal(result.handled, true);
  assert.equal(result.intent, "route_remy");
  assert.equal(result.action, undefined);
  assert.match(result.reply, /Remy/);
});

test("unknown open conversation is delegated to AI fallback", () => {
  const result = resolveLocalCrewRequest({ crewId: "emmi", text: "Wie würdest du diese Aufgabe didaktisch verbessern?" });
  assert.equal(result.handled, false);
  assert.equal(result.needsAi, true);
});

test("only the first questions being easy does not change the whole test difficulty", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Brüche. Die ersten Aufgaben leicht.");
  assert.equal(patch.difficulty, undefined);
  assert.match(patch.notes, /ersten Aufgaben leicht/);
  const global = parseTestRequest("Ein mittlerer Test. Die ersten Aufgaben leicht.");
  assert.equal(global.difficulty, "mittel");
});

test("negation is preserved as a wish and never selects the rejected difficulty", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Brüche. Nicht leicht, sondern schwer.");
  assert.equal(patch.difficulty, "anspruchsvoll");
  assert.match(patch.notes, /Nicht leicht/);
  assert.equal(parseTestRequest("Mathe Klasse 7. Nicht zu schwer.").difficulty, undefined);
});

test("excluded compound task names are not requested and do not pollute the topic", () => {
  const patch = parseTestRequest("Deutsch Klasse 6 Thema Wortarten, keine Freitextaufgaben.");
  assert.equal(patch.topic, "Wortarten");
  assert.deepEqual(patch.excludeTypes, ["text"]);
  assert.equal(patch.allowedTypes, undefined);
});

test("many questions is a wish; exact counts use the real count field", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Prozent, viele Aufgaben.");
  assert.equal(patch.topic, "Prozent");
  assert.equal(patch.count, undefined);
  assert.equal(patch.notes, "Viele Aufgaben.");
  assert.equal(parseTestRequest("Thema Prozent, 20 Aufgaben.").count, 20);
});

test("punctuation before a meaningful topic extension must not delete subject matter", () => {
  const patch = parseTestRequest("Mathe Klasse 7 Thema Prozentrechnung, mit Rabatt und Mehrwertsteuer.");
  assert.equal(patch.topic, "Prozentrechnung, mit Rabatt und Mehrwertsteuer");
});


test("Remy extracts listening-task counts without polluting the topic", () => {
  const patch = parseTestRequest("Englisch 6. Klasse Shopping, 12 Aufgaben, davon 3 Höraufgaben.");
  assert.equal(patch.subject, "Englisch");
  assert.equal(patch.grade, "6");
  assert.equal(patch.topic, "Shopping");
  assert.equal(patch.count, 12);
  assert.equal(patch.audioQuestionCount, 3);
});


test("Remy separates listening audio and released solution audio counts", () => {
  const patch = parseTestRequest("Englisch 6. Klasse Shopping, 12 Aufgaben, davon 3 Höraufgaben und 2 Lösungen als Audio.");
  assert.equal(patch.subject, "Englisch");
  assert.equal(patch.grade, "6");
  assert.equal(patch.topic, "Shopping");
  assert.equal(patch.count, 12);
  assert.equal(patch.audioQuestionCount, 3);
  assert.equal(patch.solutionAudioQuestionCount, 2);
});


test("English Remy request maps to canonical form values without losing audio or exclusions", () => {
  const patch = parseTestRequest("Create a mathematics test for Year 7 about percentages, easy, 12 questions, 20 points, of those 2 listening questions, without free text.");
  assert.equal(patch.subject, "Mathematik");
  assert.equal(patch.grade, "7");
  assert.equal(patch.topic, "percentages");
  assert.equal(patch.difficulty, "leicht");
  assert.equal(patch.count, 12);
  assert.equal(patch.points, 20);
  assert.equal(patch.audioQuestionCount, 2);
  assert.deepEqual(patch.excludeTypes, ["text"]);
});

test("English local Crew responses use English UI copy while canonical patch values stay stable", () => {
  const greeting = resolveLocalCrewRequest({ crewId: "coco", text: "Hello", locale: "en-GB" });
  assert.equal(greeting.handled, true);
  assert.match(greeting.reply, /I'm Coco/);

  const result = resolveLocalCrewRequest({
    crewId: "remy",
    locale: "en-GB",
    text: "English Year 4 topic colours, medium, 10 questions, 2 listening questions"
  });
  assert.equal(result.action.type, "patch_ai_form");
  assert.equal(result.action.patch.subject, "Englisch");
  assert.equal(result.action.patch.grade, "4");
  assert.equal(result.action.patch.difficulty, "mittel");
  assert.equal(result.action.patch.audioQuestionCount, 2);
  assert.match(result.reply, /English/);
  assert.match(result.reply, /10 questions/);
  assert.match(result.reply, /2 listening questions/);
});

test("English difficulty progression remains a pedagogical note rather than a false global difficulty", () => {
  const patch = parseTestRequest("Math Year 7 topic fractions. Start with easy questions, then make them more challenging.");
  assert.equal(patch.difficulty, undefined);
  assert.match(patch.notes, /Zuerst leichte Aufgaben/);
});
