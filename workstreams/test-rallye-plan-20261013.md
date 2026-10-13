# GC-GAMES-TEST-RALLYE-01 — Test-Rallye Planungsentwurf

- Aktualisiert (UTC): 2026-10-13
- Verantwortlicher Chat / Auftrag: ausführender Dokumentations-Fachagent der Games-Zentrale; Nutzerauftrag: erst Plan erstellen, danach offene Fragen besprechen
- Chat-Bezeichnung / Link (falls bekannt, sonst unbekannt): GC · Games-Zentrale (Zentralen-Thread-ID 01a11864-3ec7-7091-acc0-9ff292f530f3); ausführender Chat-Link unbekannt
- Vorheriger Chat / Übernahmezeitpunkt (UTC, falls übernommen): nicht zutreffend
- Arbeitszustand (aktiv / pausiert / blockiert / zur Übernahme bereit / abgeschlossen): aktiv — reine Planung, Produktentscheidungen offen
- Aufgabenbranch: docs/test-rallye-plan-20261013
- Basiscommit: aktueller main zum Branchstart; SHA nicht vom Branch-Create-Endpunkt geliefert
- Integrationsziel: main
- PR (URL / Nummer oder keiner): Draft-PR wird nach Dokumentationssicherung erstellt
- Betroffene Dateien: docs/games/test-rallye-plan-20261013.md; workstreams/test-rallye-plan-20261013.md; TODO.md; workstreams/registry.json
- Überschneidungen mit anderen Aufgaben: games-structure (lab/games-structure → lab/vocab-rush), bestehendes FastQuiz PR224 / Task GC-GAMES-FASTQUIZ-BINOMIAL-20261012. Dieser Eintrag plant ein anderes Spiel und verändert diese Dateien oder Branches nicht.

## Ziel und gewünschtes Verhalten

Vorschlag einer vierten GradeCrew-Webspielkachel „Test-Rallye“, die einen vorhandenen oder im bestehenden Editor erstellten Test mit vorhandenen Aufgabentypen in einen gemeinsamen Rundenfluss bringt. Vollständiger Plan: [docs/games/test-rallye-plan-20261013.md](../docs/games/test-rallye-plan-20261013.md).

## Umfang / nicht verändern

Nur Planungsdokumentation und Task-Zuordnung. Keine Produkt-/Spiel-/Testdatei, keine Bewertungslogik, API, Rules, Lobby, Games-Registry selbst oder Release-Stufe ändern. Kein Build, Test, Deploy, Merge, KI-Generator oder Schülerdatenzugriff. Keine Production-Freigabe.

## Akzeptanzkriterien

- Vorschlag als Entwurf markiert; drei offene Produktfragen sichtbar.
- Vorhandene Aufgabenformate und bestehender Editor sind Ausgangspunkt; keine erzwungene MC-Konvertierung.
- Bewertungsvertrag und Notwendigkeit einer neuen serverseitigen Spiel-Abgabe ehrlich beschrieben.
- Referenzrunde und separate Touch/Tastatur-, QR- und iPad-Prüfungen benannt.
- Task-ID, TODO-Zeile, Registry-Zuordnung und Übergabe auf eigenem Docs-Branch gesichert.

## Zwischenstand

- Lokal geändert: keine lokale Checkout-Änderung; Dokumentation wird über GitHub-API auf eigenem Branch angelegt.
- Auf GitHub gesichert (Commit): nach dem Schreiben einzutragen.
- Geprüft (Befehl / CI-Link / Ergebnis / Commit): keine Produktprüfungen ausgeführt oder beauftragt; Dokumentationsinhalt und PR-Diff nach dem Schreiben lesend prüfen.
- Deployed (Ziel / URL / Commit / Nachweis): nicht zutreffend.
- Gerätetest (Gerät / Version / Ergebnis): nicht zutreffend.

## Offene Probleme und Unsicherheiten

Offen: nach falscher Antwort weiter oder später Wiederholungsmodus; Teilpunkte und Sperre bei Teilfehlern; Freitext im ersten Spiel. Zusätzlich „weiß nicht“, alternative Antworten, Bild/Audio-Unterstützung und Zeitbonus-Konfiguration. Der Bewertungsvertrag sowie eine neue serverseitige Spiel-Abgabe sind vor Umsetzung am Code zu belegen; keine API wird hier als vorhanden vorausgesetzt.

## Nächster konkreter Schritt

Planungsentwurf in PR prüfen und anschließend die drei offenen Produktfragen mit dem Nutzer besprechen. Erst nach Entscheidungen einen gesonderten Implementierungsauftrag samt aktuellem Code-/Branch-/Development-Status erstellen.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt / Zeitpunkt (UTC): Task-ID auf aktuellem main gegen TODO/Registry/Status ohne Treffer geprüft; isolierter Docs-Branch angelegt; gemeinsame TODO-/Registry-/FastQuiz-/Games-Vorlagen auf main gelesen. Dokumentationsschreiben in diesem Turn.
- Gepushter Codecommit / Remote-Branch: Code nicht geändert; docs/test-rallye-plan-20261013; Dokumentationscommit nach Erstellung einzutragen.
- Ungesicherte Änderungen / Checkout-Pfad (oder keine / unbekannt): keine lokale Arbeitskopie; Connector-Schreibvorgänge.
- Laufende oder unklare Vorgänge (Run-/Request-ID, URL, Ergebnis; oder keine / unbekannt): kein Build/Test/Deploy gestartet.
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: GitHub-Dokumentationsbranch; keine Kostenreservierung.
- Was darf noch nicht als erledigt gelten? Umsetzung, sichere serverseitige Bewertung, UX/Devices, Freitextregeln, Testlauf, CI, Integration, Staging, Nutzertest und Production.
- Was muss vor Wiederholung geprüft werden? PR/Branch und Actions-Stand, damit Dokumentationsschritte nicht doppelt angelegt werden.
- Genau ein nächster ausführbarer Schritt: offene Produktfragen besprechen und akzeptierte Entscheidungen in Plan/Übergabe aktualisieren.
