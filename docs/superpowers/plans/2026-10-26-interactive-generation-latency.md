# Schnellere interaktive KI Erstellung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after the implementation scope is authorized. Steps use checkbox syntax for tracking.

**Goal:** Wiederholte KI-Arbeit und strukturelle Fehler reduzieren, damit interaktive Tests schneller bei gleicher geprüfter Qualität entstehen.

**Architecture:** Bestehende Queue und sichere Bewertung behalten. Passende Erzeugungsregeln auswählen, kleine fachliche Dreisatzentwürfe durch einen gemeinsamen Builder expandieren und erst danach unabhängige Blöcke begrenzt parallelisieren.

**Tech Stack:** Vorhandenes Node.js22/CommonJS, Browser-ES-Module, bestehende OpenAI-Anbindung und Firebase-Staging. Keine neue Bibliothek, kein neuer Provider.

**Spec:** [Design und gemessener Ausgangspunkt](../specs/2026-10-26-interactive-generation-latency-design.md).

## Global Constraints

Nur separates Staging; Production ausgeschlossen. Alte Aufgabenverträge, private Lösungen, feldweise Punkte, vier Pfeilmodi, sechs Zahlvorgaben, normaler Lehrkraftablauf und Klassenraum-Abgabe bleiben erhalten. Keine neue bezahlte Anfrage im Planungsauftrag. Keine Rohinhalte in Telemetrie. Keine Prüfungen zur Beschleunigung abschalten. Die normale Erstellung wählt passende qualifizierte Aufgabenrezepte selbst; kein zusätzlicher Formatklick je Aufgabe und keine neue KI-Anfrage je Einzelentscheidung. Vor jeder Ausführung aktuelle Integration und tatsächlichen Hosting-/Functionsstand erneut prüfen; eine alte Quelle nicht über aktuelle Klassenraumänderungen veröffentlichen.

## Review Focus

- Exakt20Aufgaben sind aktuell ein einzelner großer Block;21Aufgaben werden anders geteilt. Grenzen1/20/21/40/100 ausdrücklich testen.
- Teilpunkte können nach Änderungen der offenen Felder von der Auftragsangabe abweichen;0,5P-Feldangaben und Gesamtbudget gemeinsam prüfen.
- Zwei parallele Blöcke können dieselbe Aufgabe oder widersprüchliche Medienquoten liefern; globale Validierung erhalten.
- Gleichwertige Operatoren, freie Operationen, Null/negative Werte und umgekehrter Dreisatz dürfen nicht versehentlich umgedeutet werden.
- Timeout, unklarer Providerausgang oder Wiederaufnahme dürfen keinen zweiten bezahlten Auftrag und keine Veröffentlichung eines Teiltests auslösen.

## Task0: Fachlich passende Rezepte automatisch auswählen

**Files:** Vorhandenes functions/data/interactive-task-blueprints.v1.json und docs/learning/homepage-task-blueprints.v1.json bewusst synchron halten; functions/lib/interactive-authoring.js; functions/lib/prompts.js; functions/lib/schemas.js; functions/lib/ai-job.js; interactive-task-authoring.mjs. Neue Tests: functions/test/automatic-task-selection.test.js; bestehende interactive-authoring.test.js und interactive-authoring-ui.test.mjs. Keine bestehende Blueprint-ID umdeuten.

**Interfaces:** selectTaskProfiles(context,{catalog,allowedTypes,allowedVisualFormats}) → begrenzte Liste qualifizierter Rezeptkandidaten mit Version, Lernhandlung, Voraussetzungen und Gegenfällen. validateTaskPlan(input,slots,profiles) prüft Eignung, ausdrückliche Ausschlüsse, Daten/Medien, Punkte und tatsächlich vorhandene Builder. Die konkreten Slotfelder mit Task3 gemeinsam festlegen; ein einziger gemeinsamer Vertrag statt paralleler Planstrukturen.

- [ ] Die Anforderungen und Gegenfälle aus [AUTOMATIC_TASK_SELECTION.md](../../learning/AUTOMATIC_TASK_SELECTION.md) übernehmen. Der normale Einstieg braucht keinen zusätzlichen Formatklick; bestehende explizite Einschränkungen bleiben bindend.
- [ ] Zuerst fehlschlagende Auswahltests: Prozentrechnung mit Lernziel mehrstufiger proportionaler Rechenweg → Dreisatzkandidat; Anteile darstellen → Raster; Werte verorten → Skala; umgekehrte Proportionalität → passendes Gegenlaufrezept. Derselbe Themenbegriff bei anderem Lernziel darf zu einem anderen Kandidaten führen.
- [ ] Negative Fälle: „Satzglieder“ und „Satz des Pythagoras“ lösen keinen Dreisatz aus; Wahlanteile nicht allein wegen „Prozent“ als Dreisatz behandeln; unbekanntes Herz-/Blattquerschnittsmotiv nicht mit vorhandenen Pflanzenregionen erzeugen; ausgeschlossene table-/visual-Formate niemals erzwingen.
- [ ] Vorhandene Rezeptdaten nur mit nachgewiesener Lernhandlung, prerequisites/whenNotToUse, unterstützt vorhandenen Buildern/Medien und Testfällen qualifizieren. Prototypenstatus und pädagogische Poolzulassung getrennt halten; keinen neuen konkurrierenden Wissenspool schaffen.
- [ ] Innerhalb der bestehenden KI-Erstellung aus geeigneten Kandidaten wählen und den Slot vor Expansion validieren. Keine zusätzliche Planungsanfrage je Aufgabe und keine Pflichtzahl beliebiger interaktiver Aufgaben.
- [ ] Normale UI-Regression: Standardauswahl erlaubt weiterhin alle acht qualifizierten Formate; keine neue Bedienpflicht. Fach-/Klassen-/Lernzielauftrag reicht. Manuelle Eingrenzung gilt auch für Reparaturen und Varianten.
- [ ] Auswahlgrund/Rezeptversion ausschließlich in privaten Authoring-Metadaten sichern; alte Aufgaben bleiben unverändert lesbar. Keine neuen personenbezogenen Lernsignale oder automatisches Modelltraining.
- [ ] Ausführen: node --test functions/test/automatic-task-selection.test.js functions/test/interactive-authoring.test.js interactive-authoring-ui.test.mjs. Danach direkte/umgekehrte Rechenwege und Bewertung aus Task2 prüfen.
- [ ] Nachweis und verbleibende Grenzen im Workstream sichern. Erst bestätigte Änderungen über bestehende Feedback-/Reviewwege in die Rezepte übernehmen.

## Task1: Messung und gezielter Kontext

**Files:** functions/index.js; functions/lib/structured-response.js; functions/lib/prompts.js; functions/lib/visual-prompts.js; functions/lib/repair-test.js; functions/lib/usage.js. Neue Tests: functions/test/generation-performance.test.js; vorhandene interactive-authoring.test.js und repair-test.test.js.

**Interfaces:** Neuer optionaler Hook observeGenerationStep({phase,durationMs,batchSize,formatCounts,reasonCodes,requestId,status}); keine Inhaltstexte. buildSystemPrompt({allowedTypes,allowedVisualFormats}) liefert allgemeinen Kern plus passende geprüfte Regeln; vorhandene Exporte bleiben kompatibel.

- [ ] Zuerst fehlschlagende Tests: Ersatzanfrage behält explizit table/coordinate-Auswahl; nur erlaubte Formatregeln werden beigefügt; klassischer Test enthält keine visuellen Beispiele; reine Strukturfehler verlangen keinen neuen fachlichen Kontext.
- [ ] Fake-Uhr und Fake-Provider prüfen: Dauer pro Phase, logische versus interne Anfragen, unbekannter Transportausgang und begrenzte sichere Fehlercodes; keine Texte, Lösungen oder Token protokolliert.
- [ ] Auswahl von Regeln und Beispielen implementieren. Nicht ausgewählte Formate bleiben für historische gespeicherte Aufgaben lesbar. Medien-/Sprach-/Sicherheitsregeln erhalten.
- [ ] Metriken im bestehenden Nutzungsnachweis ergänzen; keine neue Analyseplattform aktivieren.
- [ ] Mit bestehendem Node ausführen: node --test functions/test/generation-performance.test.js functions/test/interactive-authoring.test.js functions/test/repair-test.test.js. Erwartet: alle grün, einschließlich alter Quoten-/Variantenfälle.
- [ ] Zusammenhängenden Zwischencommit und Übergabe sichern.

## Task2: Kleine Dreisatzentwürfe sicher expandieren

**Files:** dreisatz.mjs; neue shared/dreisatz-builder.js und functions/lib/dreisatz-draft.js; functions/lib/schemas.js; functions/lib/visual-prompts.js; functions/index.js; tools/build-staging.mjs. Neue Tests: functions/test/dreisatz-draft.test.js; vorhandene tools/ui/staging-dreisatz-contract.test.mjs und Assessment-Visualtests.

**Interfaces:** expandDreisatzDraft(draft,questionContext) → vollständige bisherige visualTask. draft enthält labels[2],values[6],operations[4],modes[4],givens[6]. Öffentliche Aufgaben bleiben beim bisherigen Vertrag; der kompakte Entwurf ist nur interne Erzeugungseingabe. Schema/Feldgrenzen vor Umsetzung mit der bestehenden geschlossenen Schemaerzeugung abgleichen.

- [ ] Gemeinsamen reinen Builder aus createDreisatz wiederverwenden; Server und Browser dürfen keinen getrennten Rechenalgorithmus erhalten. Staging-Paket enthält denselben Builder.
- [ ] Zuerst Tests: alle vier Pfeilmodi, sechs individuelle Vorgaben, direkter/umgekehrter Weg, Operatoraliasen, Dezimalkomma, unmögliche Rechnungen und fehlende Werte.
- [ ] Punkte testen: offenes Rechenzeichen und Zahl sind getrennte Felder; eine freie Rechnung ein Feld. Bei verlangten0,5P/Feld einen widersprüchlichen Punkteauftrag ablehnen oder an der vorher festgelegten Slotplanung berichtigen, niemals still anders benoten.
- [ ] Kompakten Entwurf validieren und lokal in den bestehenden Vertrag expandieren. Keine freie Textausführung und keine stillschweigende Erfindung fehlender fachlicher Werte.
- [ ] Vorhandene60Aufgaben offline in fachliche Einstellungen überführen und wieder expandieren. Semantik, Vorgaben, Lösungen, öffentliche Bereinigung und korrekte/falsche/leere/alternative Teilantworten vergleichen.
- [ ] Ausführen: node --test functions/test/dreisatz-draft.test.js functions/test/interactive-visual-contract.test.js assessment-functions/test/interactive-visual-contract.test.js; Browservertrag zusätzlich mit vorhandenen UI-Abhängigkeiten prüfen. Erwartet: keine Bewertungs- oder Hilfestufendrift.
- [ ] Zwischencommit, Paketnachweis und verbleibende Grenzen sichern.

## Task3: Begrenzte Parallelität mit stabilen Slots

**Files:** functions/lib/test-batches.js; functions/lib/repair-test.js; functions/index.js. Tests: functions/test/test-batches.test.js; functions/test/repair-test.test.js; neue functions/test/generation-concurrency.test.js.

**Interfaces:** generateTestInBatches(input,generate,{concurrency:1|2,slots}) bleibt für alte zweiparametrige Aufrufer sequenziell kompatibel. Slots legen Thema/Lernziel, Format, Punkte und Medien fest; Ergebnisreihenfolge folgt dem Slot, nicht der Fertigstellung.

- [ ] Vor Parallelisierung aus Task1 prüfen, ob sie nach Fehlerreduktion überhaupt noch einen wesentlichen Engpass betrifft.
- [ ] Zuerst Fake-Provider-Tests: maximal zwei gleichzeitige Aufrufe je Job, vertauschte Fertigstellung,1/20/21/40/100Aufgaben, exakte halbe Punkte und Medienquoten. Bei zwei bestehenden Queue-Arbeitern höchstens vier gleichzeitig erzeugende Unteranfragen; keine unbeschränkte Fächerung.
- [ ] Einen kleinen deterministischen Slotplan erstellen; unterschiedliche Lernziele/Arbeitsweisen zuordnen, keine unpassende Formatquote erzwingen.
- [ ] Parallele unabhängige Blöcke und gegebenenfalls voneinander unabhängige Reparaturen begrenzen. Nach jeder Zusammenführung globale Dopplungs-/Punkte-/Medienprüfung ausführen; Ersatz von sich gegenseitig wiederholenden Aufgaben darf nicht oszillieren.
- [ ] Timeout/Wiederaufnahme testen: erfolgreiche Teilblöcke intern wiederverwenden, unklare Dispatches nicht automatisch wiederholen, niemals Teiltests als ready veröffentlichen.
- [ ] Ausführen: node --test functions/test/test-batches.test.js functions/test/generation-concurrency.test.js functions/test/repair-test.test.js. Erwartet: alle Vertrags-/Retryfälle grün.
- [ ] Zwischencommit und unabhängige Prüfung vor Stagingintegration sichern.

## Task4: Wirkung und Qualität nachweisen

**Files:** tools/visual-pilot/normal-staging-repair-run.cjs beziehungsweise eigener begrenzter Vergleichslauf; docs/evidence/interactive-generation-performance-20261026/; bestehende Übergabe und GRADECREW_STATE.json.

- [ ] Zuerst alle vorhandenen60Aufgaben offline und die passenden Web-/Functions-/Assessmenttests ausführen; korrekte Anzahl/Punkte, falsches Zeichen bei korrekter Zahl, Wiederaufnahme, Redaction, Idempotenz und erhaltene Classroombindung prüfen.
- [ ] Aktuellen Zielbranch/Deployment abgleichen, unabhängiger Review, unveränderlichen Kandidaten und selektiven Stagingumfang dokumentieren. Keine alte Hostingbasis erneut veröffentlichen.
- [ ] Vorgeschlagenes separates Pilotbudget vor externem Start festlegen: höchstens zwei neue vergleichbare20/40-Aufträge, Request-IDs vorher sichern; kein Blindretry. Kosten als tatsächliche Nutzung erfassen, nicht schätzen.
- [ ] Gesamtdauer, Phasendauer, Eingabe-/Ausgabetokens, erfasste Providerantworten, Fehlerkategorien, Korrekturzahl und Endqualität vergleichen. Beide Varianten mit denselben Fach-/Klassen-/Punktevorgaben und Modellparametern vergleichen.
- [ ] Pilotziele prüfen: mindestens90%strukturell gültige Erstaufgaben; höchstens4/8Reparaturversuche für20/40; mindestens50%weniger Gesamtdauer. Als Ziele, nicht als bereits erreichte Werte berichten. Keine allgemeine95%-Laufzeit aus nur zwei Proben behaupten.
- [ ] Bei Zielverfehlung konkrete Kategorien auswerten; kein pauschaler Modellwechsel und kein Abschalten der Qualitätssicherung. Erst danach weitere Formate oder Modelle getrennt qualifizieren.
- [ ] Ergebnis, tatsächliche Quelle, CI/Review/Hosting/Functions und Grenzen im bestehenden Workstream sichern. P1 erst nach überprüfter Wirkung schließen.

## Selbstprüfung und nächster Schritt

Designziele sind Task0 bis Task4 zugeordnet; externe Laufzeitmessung ist ausdrücklich von Offlineprüfungen getrennt. Keine Runtime wurde durch diesen Plan verändert. Nächster ausführbarer Schritt ist die gemeinsame Eingangsstrecke aus Task0/Task1: Auswahltests und qualifizierte Rezeptkandidaten, sichere Zeit-/Fehlerklassifizierung und ausgewählte Formatregeln. Task2/3 erst nach dessen Befund; bezahlte Vergleichsläufe erst nach vereinbartem Budget. Der genaue Anteil der bisherigen Fehlertypen bleibt bis zur Messung offen.
