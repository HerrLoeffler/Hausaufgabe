# Kontextbezogene Crew-Assistenten V2

Task: `GC-CREW-AI-03`

## Anlass

Staging-Nutzertest am 02.10.2026: Spracheingabe selbst funktioniert, aber der gemeinsame Crew-Chat entspricht nicht dem gewünschten Produktfluss. Beim Senden eines Testwunsches wirkt die Navigation wie ein Ein-/Ausloggen; das Mikro beendet die Aufnahme bei kurzen Sprechpausen zu früh.

## Produktentscheidung

- Coco/Pinguin bleibt als allgemeiner Helfer dauerhaft rechts unten.
- Remy gehört direkt auf die Seite `Test mit KI erstellen` und füllt dort das bestehende normale Testformular sichtbar aus.
- Remy erzeugt keinen zweiten versteckten Testflow und navigiert beim Anwenden eines Testwunsches nicht weg.
- Emmi bleibt direkt im Editor für Überarbeitungen.
- Wilma wird später kontextbezogen in der Auswertung angebunden.
- Die gemeinsamen Core-/Backend-Verträge dürfen intern wiederverwendet werden; die Oberfläche zeigt aber nicht alle Crew-Mitglieder gleichzeitig.
- Zusatztexte/Erklärleisten unter Coco/Remy/Emmi werden im funktionalen V2-Entwurf weggelassen.
- Diktieren bleibt bis zum manuellen Stop aktiv und startet sich nach browserbedingten kurzen Pausen neu; Sicherheitsstopp nach 60 Sekunden.

## Branch

- Branch: `fix/contextual-crew-assistants-v2`
- Basis: `feature/gradecrew-app-integration@7063aee3815fc4f5a58e443318cf2c80839719a7`
- Production: unverändert

## Umsetzung

- `crew-assistant-ui.js`: globales Panel auf Coco reduziert; keine Crew-Tabs, Quick-Chips oder Footer-Hinweise; kein automatisches Öffnen/Navigieren zum Testformular.
- `remy-ai-help.js`: bisherige Remy-Erklärungstour durch kompaktes funktionales Remy-Feld direkt in `#aiView` ersetzt; Text/Diktat -> Partial-Patch der bestehenden Formularfelder; geänderte Felder werden kurz sichtbar markiert.
- `crew-assistant-core.mjs`: Testaktionen nur noch für Remy; Coco verweist lokal auf Remy; Parser versteht auch gesprochene Formulierungen wie `4. Klasse für Farben`.
- `emmi-whole-test-revision.mjs`: UI vereinfacht; Footer entfernt; robustere Diktiersteuerung.
- Cache-Versionen für Crew/Remy/Emmi auf V2 angehoben.
- Regressionstests um den konkreten Staging-Sprachfall und die Coco->Remy-Trennung ergänzt.

## Bekannter Infrastrukturpunkt

Der zuvor getestete Hosting-Preview hatte laut zentralem Release-Status die neuen AI-Callables noch nicht auf `hausaufgabe-staging` deployed. Deshalb funktionieren lokale/deterministische Remy-Kommandos ohne Backend, offene Coco-/Remy-Anfragen und Emmi-Gesamtüberarbeitung benötigen aber einen gesondert verifizierten Staging-Functions-Deploy.

## Status

- Code: vorbereitet auf eigenem Branch
- CI: ausstehend
- Integration: ausstehend
- Staging Hosting: ausstehend
- Staging Functions: ausstehend / separat prüfen
- Nutzertest: ausstehend
- Production: nicht verändert

## Nächster Schritt

Branch committen/pushen, Crew-/Emmi-Tests und Syntaxchecks ausführen; erst bei grüner CI gegen den aktuellen Integrationsbranch vergleichen und kontrolliert in den Staging-Release-Train übernehmen.
