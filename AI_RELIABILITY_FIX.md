# KI-Erstellung: Reparatur vom 27.09.2026

## Ausgangslage und Grenze

Konkreter Bericht: `RPT-MUJS1QL5-01B32`, Job `a1397afb50982352d6761104a4c5e55ac8481dd9`, Prompt v13. Angefordert: Mittelschule Bayern, Deutsch Klasse 5, Satzbaustelle, 50 Aufgaben / 40 Punkte / keine Bilder. Gemeldet: fünf fehlende Richtig/Falsch-Lösungen und fünf Lückentexte ohne `[Lösung]`. Die zweite fehlgeschlagene Erstellung wurde ohne eigenen Bericht genannt; ihre Ursache ist noch nicht belegt.

Geprüfte Codebasis: GitHub-Branch `feature/ai-integration`, Stand `66352d921ddc733efe306d1e630271a06242d0b7`. Der laufende Functions-Stand weicht laut früherem Abgleich davon ab, insbesondere bei parallelen Aufträgen und Diagnosen. Daher wird dieser Fix separat vorbereitet und noch nicht deployed. Die Voll-Deployment-Sperre bleibt unverändert bestehen.

## Nachgewiesene Schwachstellen im verfügbaren Code

1. Das generische KI-Schema erlaubte `correctBoolean: null` auch für Richtig/Falsch. Für Lückentexte fehlte eine verbindliche Formatvorgabe im Systemprompt und im Schema.
2. Alle Aufgabentypen mussten sämtliche Felder erzeugen, auch irrelevante leere Felder. Bei 50 Aufgaben wurde eine große einzelne Antwort angefordert.
3. Lokale Reparaturen waren auch bei 50 Aufgaben auf 16 Versuche beschränkt. Drei frühe Fehlversuche pro Aufgabe konnten spätere Fehler verdrängen; ein neues vollständiges Ergebnis hatte danach eventuell kein Reparaturbudget mehr.
4. Eine reparierte fehlende Lösung bei identischem Fragetext wurde als zu ähnliche Ersatzaufgabe abgelehnt.
5. `Number(null)` akzeptierte eine fehlende Zahlenlösung als 0. `!!"false"` markierte eine falsche Textoption als richtig. Wortmarkierungen prüften nur, ob irgendein Zielwort als Teilzeichenfolge vorkam.
6. Leere/unvollständige erfolgreiche API-Antworten wurden nicht gezielt einmal wiederholt. Verschachtelte Fehlermeldungen überschrieben Phase und Referenz.

## Änderungen (Prompt v14 / Schema 4)

- Kompakte Schemas je Typ; echte Boolean-Lösung für truefalse; Klammerlösung für gapfill; genaue Aufgabenanzahl und erlaubte Typen im Anfrageschema. Bildantworten bleiben deaktiviert.
- Explizite Formatregeln für alle elf Typen im Systemprompt.
- Tests mit mehr als 20 Aufgaben entstehen in Blöcken von höchstens zehn. Anzahl, Halbpunkt-Raster und Bilderbudget bleiben exakt erhalten. Bereits erzeugte Aufgaben dienen zur Vermeidung von Wiederholungen. Danach wird der ganze Test validiert und fachlich geprüft.
- Reparaturbudget skaliert bis maximal 100 Versuche; alle defekten Positionen werden gleichmäßig berücksichtigt. Erfolgreiche Teilreparaturen bleiben erhalten, solange weitere lokale Reparaturen möglich sind.
- Fehlende oder mehrdeutige Lösungen werden nicht geraten. Eindeutige Boolean-Strings werden korrekt gelesen; kaputte verschachtelte Felder liefern Validierungsfehler statt Absturz.
- Einmalige Wiederholung leerer, unvollständiger oder unlesbarer erfolgreicher KI-Antworten für Text und Bildprüfung; Anbieter-Ablehnungen werden nicht wiederholt. Transportwiederholungen bleiben begrenzt beim SDK.
- Ungültige Prüferindizes und ungültige Bildurteile werden nicht als erfolgreiche Prüfung ausgegeben.

## Verifikation

- Bericht mit 50 Aufgaben / 40 Punkten / zehn konkret gemeldeten Strukturfehlern nachgestellt: Reparatur erfolgreich, bestehende gültige Inhalte erhalten.
- 50 defekte Positionen und ein erneut fehlerhafter erster Ersatz: jede Position bekommt eine Chance.
- Alle elf Typen gegen JSON Schema (Ajv) und Anwendungsvalidierung geprüft.
- Blockaufteilung für 1–50 Aufgaben, 0–5 Bilder und verschiedene Halbpunkt-Gesamtsummen geprüft.
- 50-Aufgaben-Abläufe mit 0, 1 und 5 Bildern bis zur Speicherung simuliert.
- Tatsächlicher generateTestForUser-Handler mit simuliertem Anbieter durchlaufen: Blöcke, Gesamtvalidierung, Qualitätsprüfung, Nutzungsprotokoll und Metadaten.
- Vorhandene Regressionstests, ESLint und Syntaxprüfungen bleiben enthalten.

Dies sind lokale automatisierte Prüfungen mit simuliertem Anbieter. Es wurden keine kostenpflichtigen echten KI-Anfragen, kein Firebase-Deployment und keine authentifizierte Browserabnahme ausgeführt. Eine 100-prozentige fachliche Richtigkeit oder Verfügbarkeit ist damit nicht belegt.

## Nächster Schritt: tatsächlichen Servercode übernehmen

`tools/collect-ai-source.py` liest ausschließlich das Projekt `hausaufgabe-staging`, Funktion `processAiTestJob`, Region `europe-west1`. Es nutzt die von Google gemeldete Quellarchiv-Version, exportiert ausgewählte Quellcodedateien aus dem Deployment und dem lokalen Cloud-Shell-Ordner und erzeugt eine ZIP-Datei im Home-Verzeichnis. `.env`, Abhängigkeiten und beliebige Konfigurations-/Credential-Dateien werden nicht aufgenommen. Es deployt und verändert keine Serverressourcen oder Repository-Dateien.

Nach Übernahme: neuere parallele Aufträge, Diagnosen, Bildprüfung mit Aufgabenbezug und bestehende Benutzerrechte erhalten; diese Änderungen gezielt zusammenführen; unter Node 22 prüfen; ausschließlich Staging deployen. Danach dieselbe Anfrage zweimal parallel sowie Bildfälle tatsächlich ausführen. Produktion erst nach eigener Freigabe.
