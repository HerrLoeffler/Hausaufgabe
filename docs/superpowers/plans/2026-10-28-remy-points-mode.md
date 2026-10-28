# Remy Points Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lehrkräfte wählen bei neuen KI-Tests zwischen einer festen Gesamtpunktzahl und automatisch aus den Einzelaufgaben ermittelten Gesamtpunkten.

**Architecture:** Ein explizites `pointsMode` trennt die zwei Verträge am Formular und an der Servergrenze. Der feste Pfad bleibt unverändert; der automatische Pfad verzichtet auf ein Zielbudget, verwendet die vorhandenen Einzelpunkte und summiert sie nach Prüfung/Reparatur. Entwurf, Editor und Veröffentlichung nutzen weiterhin die bestehenden Punktefelder.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, Firebase Functions (Node 22), Firestore, `node --test`, vorhandene Web-/Browserprüfungen.

**Spec:** `docs/superpowers/specs/2026-10-28-remy-points-mode-design.md`

## Global Constraints

- Task `GC-REMY-POINTS-20261028`; vor Umsetzung aktuelle `START_HERE.md`, `AGENTS.md`, Release- und Writerlage neu prüfen. Dieser Plan ist kein Deployauftrag.
- `pointsMode` ist `"fixed"` oder `"auto"`; fehlendes Feld bedeutet aus Kompatibilitätsgründen `"fixed"`.
- Fest: `points` ist positiv, in 0,5er-Schritten und mindestens `count / 2`; bestehender Punktausgleich und exakte Schlussprüfung bleiben.
- Automatisch: `points` fehlt; es gibt keine implizite Gesamtzahl und keinen Punktausgleich. Pro Aufgabe weiterhin mindestens 0,5 Punkte und 0,5er-Schritte.
- Varianten/ähnliche Tests behalten die Punkte ihrer Vorlage. Bestehende Tests, Notenschlüssel, Bewertungen und Abgaben nicht migrieren oder umrechnen.
- Keine neuen KI-Aufrufe für Punktvergabe; keine echte Providerprobe ohne gesonderten Testauftrag. Production nur mit ausdrücklicher Freigabe.
- UI auf Deutsch und Englisch, Tastaturbedienung und bestehende veröffentlichungsnahe Entwurfsprüfung erhalten.

## Review Focus

1. Altes Client-Payload ohne `pointsMode`: exakt bisheriger fester Pfad; Test in Task 2.
2. `auto` mit versehentlich mitgesendeten `points`: eindeutiger Eingabefehler statt verstecktem Ziel; Test in Task 2.
3. 21–100 Aufgaben: Batchaufteilung ohne Punktbudget und korrekte Gesamtsumme; Test in Task 3.
4. Ersatzaufgabe nach Reparatur: Punkte bleiben gültig, Endsumme entspricht gespeicherten Aufgaben; Test in Task 3.
5. Umschalten der UI-Modi, leere Punktzahl und alter Variantenpfad: kein unerwarteter Start oder Punkteverlust; Test in Tasks 1 und 4.

---

## Dateigrenzen und Reihenfolge

`index.html` enthält die Auswahl; `app.js` verwaltet Anzeige, Prüfung und Request. Ein kleiner neuer Helfer `functions/lib/points-mode.js` normalisiert nur den Punktevertrag; `functions/index.js` verwendet ihn beim Auftragsstart **und** bei der späteren Generierung. `functions/lib/test-batches.js`, `prompts.js`, `repair-test.js` und `validation.js` trennen die Punktepfade. Die vorhandenen Schemas für Einzelpunkte bleiben. Tests liegen neben den jeweiligen bestehenden Funktions- und UI-Tests. Kein Refactor des Bewertungsservers.

### Task 1: Formular und eindeutiger Request

**Files:** Modify `index.html` (bei `aiPoints`), `app.js` (`updateAiPointsControls`, Anforderungszusammenfassung, `collectAiRequest`), gegebenenfalls `styles.css` und die vorhandenen DE/EN-Kataloge. Test: vorhandene Web-/Browser-Tests zur KI-Erstellung plus ein fokussierter Moduswechseltest.

**Interface:** `collectAiRequest()` liefert bei festem Modus `{pointsMode:"fixed", points:number, ...}` und bei Automodus `{pointsMode:"auto", ...}` ohne `points`-Eigenschaft.

- [ ] Fehlenden UI-Test schreiben: Standard ist „Gesamtpunkte festlegen“; 20/35 erzeugt `fixed` und `points:35`; Umschalten auf automatisch erzeugt `auto` ohne `points`; zurückschalten stellt 35 wieder her. Leeres festes Feld startet keinen Job.
- [ ] Fokussierten UI-Test ausführen und das erwartete Scheitern festhalten.
- [ ] Zwei zugänglich beschriftete Auswahlfelder und Hinweis in `index.html` ergänzen; `app.js` bindet Anzeige, Validierung und Zusammenfassung an die Wahl. Das bestehende Zahlenfeld bleibt beim automatischen Modus inaktiv, sein Wert bleibt lokal erhalten.
- [ ] Test erneut ausführen; DE/EN-Anzeige und Tastaturbedienung im vorhandenen Browserlauf prüfen. Commit für die UI-Scheibe.

### Task 2: Serververtrag und rückwärtskompatible Eingabe

**Files:** Create `functions/lib/points-mode.js`, `functions/test/points-mode.test.js`; modify `functions/index.js` (`cleanInput`, Aufrufoptionen, Job-Eingabe).

**Interface:** `normalizePointRequest({pointsMode, points, count, generationMode})` in `points-mode.js` liefert `{pointsMode:"fixed",points:number}` oder `{pointsMode:"auto"}` und wirft bei ungültiger Eingabe einen `HttpsError("invalid-argument", ...)`. `cleanInput(data)` übernimmt dieses Ergebnis. Der normalisierte Wert wird im persistierten Job und beim Resume identisch verwendet.

- [ ] Servertests für fehlenden Modus, explizit festes 20/35, automatisches 20 ohne `points`, widersprüchliches `auto` mit `points`, ungültigen Modus und `auto` bei Variante schreiben. Zweimalige Normalisierung der gespeicherten Eingabe muss denselben Wert liefern.
- [ ] Diese Tests ausführen und erwartete Fehler prüfen.
- [ ] `normalizePointRequest` implementieren und in `cleanInput` verwenden: alten Code nur für `fixed` ausführen; für `auto` `points` verbieten und nicht auf 20 zurückfallen; Variante `auto` zurückweisen. Keine Änderung an Medien-, Material- oder Aufgabenlimits.
- [ ] Tests grün ausführen und prüfen, dass ein gespeicherter Autopunkt-Job beim Resume denselben Modus hat. Commit für den Serververtrag.

### Task 3: Generator ohne verstecktes Gesamtbudget

**Files:** Modify `functions/lib/test-batches.js`, `functions/lib/prompts.js`, `functions/lib/repair-test.js`, `functions/index.js` (Validator-Optionen/Endsumme); `functions/lib/validation.js` nur soweit nötig. Tests: `functions/test/test-batches.test.js`, `functions/test/repair-test.test.js`, neuer Modusvertragstest.

**Interface:** `planTestBatches(input)` gibt im Automodus Blöcke ohne `points` zurück. `validateAndRepairTest(..., {targetPoints:undefined})` behält Einzelpunkte, ohne `balanceTestPoints` aufzurufen. `validateTest` prüft im festen Modus die Zielsumme; im Automodus die Einzelpunkte und Struktur. Der gespeicherte `totalPoints`-Wert ist die Summe der finalen Fragen.

- [ ] Tests schreiben: 20/35 bleibt ein Block mit 35 und endet exakt bei 35; 20/auto enthält kein Batch-Punktbudget; 40/auto bleibt auch über mehrere Blöcke ohne Budget; nach einer Ersatzaufgabe stimmt `totalPoints` mit der Summe der gespeicherten Einzelpunkte überein.
- [ ] Fokussierte Tests ausführen und das erwartete Scheitern prüfen.
- [ ] Batchplanung und Erstellungsprompt je Modus verzweigen. Automodus verlangt 0,5er-Schritte und Gewichtung nach unabhängig bewertbaren Teilantworten, Denkschritten und Arbeitsaufwand; Aufgabentyp/Medien allein sind keine Punktebegründung. Bei Festmodus bleibt „exakt N Gesamtpunkte“ bestehen.
- [ ] In Reparatur und Schlussprüfung nur bei `fixed` `targetPoints` setzen. Die vorhandene pro-Aufgabe-Normalisierung und fachliche Prüfung beibehalten; nach Reparatur Summenwert aus finalen Einzelpunkten bilden. Keine zusätzliche Modellrunde.
- [ ] Tests grün ausführen; zusätzlich Fälle mit ungültigen Einzelpunkten, Rundung und kompletter Neugenerierung prüfen. Commit für die Generator-Scheibe.

### Task 4: Entwurf, Variante und Veröffentlichung erhalten

**Files:** `app.js` und passende vorhandene UI-/Functions-Tests; Produktcode hier nur ändern, wenn der Test eine echte Lücke zeigt.

**Interface:** Im Editor sind alle `q.points` und die daraus berechnete Summe sichtbar und vor Veröffentlichung editierbar. Ähnliche Tests lesen weiterhin die Punkte der Vorlage und verwenden den festen Variantenvertrag.

- [ ] Integrationsprüfung ohne Provider schreiben: automatische Antwort mit z. B. 20 Aufgaben und 31,5 Punkten wird als Entwurf mit 31,5 angezeigt; Änderung eines Einzelwerts aktualisiert die Summe; Veröffentlichung speichert diese Summe. Der Notenschlüssel bleibt derselbe gewählte Schlüssel und wird nicht neu definiert.
- [ ] Regression für Variante aus bestehendem Test: gleiche Einzelpunkte wie Vorlage, kein automatischer Modus. Bereits veröffentlichte Tests und vorhandene Abgaben bleiben unverändert.
- [ ] Fokussierte Prüfungen ausführen; nur belegte Lücken korrigieren. Commit für die Integrationsscheibe.

### Task 5: Review, CI und begrenzte Freigabe

**Files:** Tests, `TODO.md`, eigene Workstream-Übergabe und Release-Status nur entsprechend tatsächlichem Stufenwechsel.

- [ ] Aktuellen Entwicklungsstatus und Writerüberschneidungen zu `app.js`, `index.html`, `functions/index.js`, `prompts.js`, `repair-test.js`, `test-batches.js` vor Integration erneut prüfen. Vorhandene Audio-/Editoränderungen erhalten.
- [ ] `cd functions && npm test && npm run check` sowie die relevanten Web-/Browserprüfungen auf dem exakten Commit ausführen. Synthetischer End-to-End-Fall für beide Modi, große Tests und Resume; keine bezahlten Provideraufrufe.
- [ ] Unabhängige Prüfung auf Rückwärtskompatibilität, Punkteidentität, Notenschlüssel, Varianten und Veröffentlichung durchführen; Befunde beheben und exakte CI auf dem finalen SHA abwarten.
- [ ] Vorschau mit Release- und Dateihashes prüfen. Live-Functions- und Hosting-Schritte getrennt planen und erst nach ausdrücklicher Freigabe für das Ziel ausführen. Danach Quelle/aktive Funktionen/Hosting erneut belegen; Lehrerabnahme am editierbaren Entwurf bleibt eigener Schritt.
- [ ] TODO, Übergabe und `GRADECREW_STATE.json` nur mit den wirklich erreichten Stufen aktualisieren. Im Abschlussbericht offene Fairnessgrenze nennen: Ohne zusätzliche fachliche Rubrikprüfung bleibt die automatische Gewichtung ein überprüfbarer KI-Vorschlag.

## Abnahmebeispiele

- **Fest:** 20 Aufgaben, 35 Punkte → Entwurf hat genau 20 Aufgaben und exakt 35 Punkte; alte Clients ohne `pointsMode` verhalten sich genauso.
- **Automatisch:** 20 Aufgaben, kein Punktwert im Request → Remy vergibt gültige Einzelpunkte, z. B. zusammen 31,5; kein automatischer Ausgleich auf 20 oder 35.
- **Bearbeitung:** Lehrkraft ändert eine Aufgabe von 1 auf 1,5 Punkte → angezeigte und gespeicherte Summe steigt um 0,5, bevor der Test veröffentlicht wird.
- **Bestehende Inhalte:** Variante und vorhandene veröffentlichte Tests behalten ihre bisherigen Punkte; keine Änderung an Schülerabgaben.

## Umsetzungshandoff

Planstatus: nur geschrieben, nicht implementiert oder getestet. Bei Beginn einen frischen isolierten Checkout vom geprüften Zielbranch und eine eigene Übergabe verwenden. Vor jedem Deployment ist Martins ausdrückliche Freigabe erforderlich.
