# Remy Points Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neue Remy-Tests starten standardmäßig mit automatisch aus den Einzelaufgaben ermittelten Gesamtpunkten. Lehrkräfte können mit dem kompakten Auto-Schalter auf eine feste Gesamtpunktzahl wechseln.

**Architecture:** Ein explizites `pointsMode` trennt die zwei Verträge am Formular und an der Servergrenze. Der feste Pfad bleibt unverändert; der automatische Pfad verzichtet auf ein Zielbudget, verwendet die vorhandenen Einzelpunkte und summiert sie nach Prüfung/Reparatur. Entwurf, Editor und Veröffentlichung nutzen weiterhin die bestehenden Punktefelder.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, Firebase Functions (Node 22), Firestore, `node --test`, vorhandene Web-/Browserprüfungen.

**Spec:** `docs/superpowers/specs/2026-10-28-remy-points-mode-design.md`

## Global Constraints

- Task `GC-REMY-POINTS-20261028`; vor Umsetzung aktuelle `START_HERE.md`, `AGENTS.md`, Release- und Writerlage neu prüfen. Dieser Plan ist kein Deployauftrag.
- `pointsMode` ist `"fixed"` oder `"auto"`; fehlendes Feld bedeutet aus Kompatibilitätsgründen `"fixed"`.
- Fest: `points` ist positiv, in 0,5er-Schritten und mindestens `count / 2`; bestehender Punktausgleich und exakte Schlussprüfung bleiben.
- Automatisch: `points` fehlt; es gibt keine implizite Gesamtzahl und keinen Punktausgleich. Pro Aufgabe weiterhin mindestens 0,5 Punkte und 0,5er-Schritte.
- Varianten/ähnliche Tests behalten die Punkte ihrer Vorlage. Bestehende Tests, Notenschlüssel, Bewertungen und Abgaben nicht migrieren oder umrechnen.
- Keine neuen KI-Aufrufe für Punktvergabe; keine echte Providerprobe ohne gesonderten Testauftrag. Martins ausdrückliche Freigabe für gradecrew.de vom 28.10.2026 liegt vor; Funktionen vor Hosting ausrollen und beide Stufen nachweisen.
- UI auf Deutsch und Englisch, Tastaturbedienung und bestehende veröffentlichungsnahe Entwurfsprüfung erhalten.

## Review Focus

1. Altes Client-Payload ohne `pointsMode`: exakt bisheriger fester Pfad; Test in Task 2.
2. `auto` mit versehentlich mitgesendeten `points`: eindeutiger Eingabefehler statt verstecktem Ziel; Test in Task 2.
3. 21–100 Aufgaben: Batchaufteilung ohne Punktbudget und korrekte Gesamtsumme; Test in Task 3.
4. Ersatzaufgabe nach Reparatur: Punkte bleiben gültig, Endsumme entspricht gespeicherten Aufgaben; Test in Task 3.
5. Umschalten der UI-Modi, leere Punktzahl und alter Variantenpfad: kein unerwarteter Start oder Punkteverlust; Test in Tasks 1 und 4.

---

## Dateigrenzen und Reihenfolge

`index.html` enthält die Auswahl; `app.js` verwaltet Anzeige, Prüfung und Request. `functions/index.js` normalisiert den Punktevertrag in `cleanInput` beim Auftragsstart **und** bei der späteren Generierung. `functions/lib/test-batches.js`, `prompts.js`, `repair-test.js` und `validation.js` trennen die Punktepfade. Die vorhandenen Schemas für Einzelpunkte bleiben. Tests liegen neben den jeweiligen bestehenden Funktions- und UI-Tests. Kein Refactor des Bewertungsservers.

### Task 1: Formular und eindeutiger Request

**Files:** Modify `index.html` (bei `aiPoints`), `app.js` (`updateAiPointsControls`, Anforderungszusammenfassung, `collectAiRequest`), gegebenenfalls `styles.css` und die vorhandenen DE/EN-Kataloge. Test: vorhandene Web-/Browser-Tests zur KI-Erstellung plus ein fokussierter Moduswechseltest.

**Interface:** `collectAiRequest()` liefert bei festem Modus `{pointsMode:"fixed", points:number, ...}` und bei Automodus `{pointsMode:"auto", ...}` ohne `points`-Eigenschaft.

- [ ] Fehlenden UI-Test schreiben: Standard ist blaues `Auto` mit Strich und `pointsMode:auto` ohne `points`; Ausschalten stellt den letzten festen Wert wieder her und erzeugt `fixed` mit Punktzahl. Leeres festes Feld startet keinen Job.
- [ ] Fokussierten UI-Test ausführen und das erwartete Scheitern festhalten.
- [ ] Einen zugänglich beschrifteten kompakten Auto-Schalter in `index.html` ergänzen; aktiv ist er blau, das Punktefeld zeigt einen Strich. `app.js` bindet Anzeige, Validierung und Zusammenfassung an den Modus. Der feste Zahlenwert bleibt lokal erhalten.
- [ ] Test erneut ausführen; DE/EN-Anzeige und Tastaturbedienung im vorhandenen Browserlauf prüfen. Commit für die UI-Scheibe.

### Task 2: Serververtrag und rückwärtskompatible Eingabe

**Files:** Modify `functions/index.js` (`cleanInput`, Aufrufoptionen, Job-Eingabe) und ergänze gezielte Tests in `functions/test/audio-total-budget.test.js`.

**Interface:** `cleanInput(data)` liefert `{pointsMode:"fixed",points:number}` oder `{pointsMode:"auto"}` und wirft bei ungültiger Eingabe einen `HttpsError("invalid-argument", ...)`. Der normalisierte Wert wird im persistierten Job und beim Resume identisch verwendet.

- [ ] Servertests für fehlenden Modus, explizit festes 20/35, automatisches 20 ohne `points`, widersprüchliches `auto` mit `points`, ungültigen Modus und `auto` bei Variante schreiben. Zweimalige Normalisierung der gespeicherten Eingabe muss denselben Wert liefern.
- [ ] Diese Tests ausführen und erwartete Fehler prüfen.
- [ ] `cleanInput` für beide Modi erweitern: alten Code nur für `fixed` ausführen; für `auto` `points` verbieten und nicht auf 20 zurückfallen; Variante `auto` zurückweisen. Keine Änderung an Medien-, Material- oder Aufgabenlimits.
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
- [ ] Vorschau mit Release- und Dateihashes prüfen. Live-Funktionen nach der erteilten Freigabe gezielt zuerst ausrollen und aktive Hashes belegen; erst danach Hosting veröffentlichen. Anschließend Live-Manifest und Dateien verifizieren. Lehrerabnahme am editierbaren Entwurf bleibt eigener Schritt.
- [ ] TODO, Übergabe und `GRADECREW_STATE.json` nur mit den wirklich erreichten Stufen aktualisieren. Im Abschlussbericht offene Fairnessgrenze nennen: Ohne zusätzliche fachliche Rubrikprüfung bleibt die automatische Gewichtung ein überprüfbarer KI-Vorschlag.

## Abnahmebeispiele

- **Fest:** 20 Aufgaben, 35 Punkte → Entwurf hat genau 20 Aufgaben und exakt 35 Punkte; alte Clients ohne `pointsMode` verhalten sich genauso.
- **Automatisch:** 20 Aufgaben, kein Punktwert im Request → Remy vergibt gültige Einzelpunkte, z. B. zusammen 31,5; kein automatischer Ausgleich auf 20 oder 35.
- **Bearbeitung:** Lehrkraft ändert eine Aufgabe von 1 auf 1,5 Punkte → angezeigte und gespeicherte Summe steigt um 0,5, bevor der Test veröffentlicht wird.
- **Bestehende Inhalte:** Variante und vorhandene veröffentlichte Tests behalten ihre bisherigen Punkte; keine Änderung an Schülerabgaben.

## Umsetzungshandoff

Planstatus: Umsetzung in PR #377 auf dem aktuellen Live-Basiscommit und PR #376 für die spätere Integration; lokale Tests, unabhängiger Review und befristete Staging-Vorschau sind erfolgt. Release-Nachweise stehen in der Aufgabenübergabe. Martins ausdrückliche Live-Freigabe vom 28.10. liegt vor.
