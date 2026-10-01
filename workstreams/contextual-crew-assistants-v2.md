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

## Umsetzung

- `crew-assistant-ui.js`: globales Panel auf Coco reduziert; keine Crew-Tabs, Quick-Chips oder Footer-Hinweise; kein automatisches Öffnen/Navigieren zum Testformular.
- `remy-ai-help.js`: bisherige Remy-Erklärungstour durch kompaktes funktionales Remy-Feld direkt in `#aiView` ersetzt; Text/Diktat -> Partial-Patch der bestehenden Formularfelder; geänderte Felder werden kurz sichtbar markiert.
- `crew-assistant-core.mjs`: Testaktionen nur noch für Remy; Coco verweist lokal auf Remy; Parser versteht auch gesprochene Formulierungen wie `4. Klasse für Farben`.
- `emmi-whole-test-revision.mjs`: UI vereinfacht; Footer entfernt; robustere Diktiersteuerung.
- Cache-Versionen für Coco/Remy/Emmi auf V2 angehoben.
- Regressionstests prüfen den konkreten Staging-Sprachfall, Coco->Remy-Trennung, Emmi-Kontext sowie das direkte Befüllen des vorhandenen Testformulars.

## Branch / Integration / Nachweise

- Feature-Branch: `fix/contextual-crew-assistants-v2`
- Feature-Basis: `feature/gradecrew-app-integration@7063aee3815fc4f5a58e443318cf2c80839719a7`
- Feature-Head vor Dokumentationsupdate: `2a03cd31a69c3802028da5713ddab7d1ce3e2727`
- Feature-CI: `Crew Assistant Checks` Run `36941146019` ✅
- Integration mit paralleler de-DE-i18n-Arbeit: Merge `be2b90583e987add07c03acf8072ee578d7af3e4`
- veralteten Remy-UI-Test auf V2-Verhalten aktualisiert: Integration-Commit `a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- kompletter gemeinsamer Integrations-Gate: `AI Staging Checks` Run `36941486945` ✅
- Mobile-Tutorial-Gate auf dem V2-Produktstand vor dem reinen Test-Commit: Run `36941265518` ✅
- automatischer Hosting-Preview + Manifest-/Hash-Verifikation: Run `36941659842` ✅

## Verifizierter Staging-Preview

- Projekt: `hausaufgabe-staging`
- Firebase Hosting Preview-Kanal: `gradecrew-app-integration`
- URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- verifizierter Commit: `a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- verifizierte Dateien: `93`
- Gerätetest dieses V2-Stands: noch nicht durchgeführt
- Production: unverändert

## AI-Functions-Status

Auf `main` ist inzwischen ein separater, fail-closed Workflow `Automatic staging AI functions` vorhanden. Er darf ausschließlich `functions:ai` nach `hausaufgabe-staging` deployen, prüft den exakten grünen Integrations-SHA erneut und verifiziert danach `crewAssistant` sowie `reviseWholeTest`.

Für den aktuellen V2-Stand lief `Automatic staging AI functions` Run `36941659861`. Der eigentliche Deploy wurde bewusst übersprungen, weil die einmalige Repository-Variable `STAGING_FUNCTIONS_WIF_PROVIDER` noch nicht eingerichtet ist; der `setup-needed`-Job war grün. Dadurch wurden keine Functions und keine Production-Ressourcen verändert.

Die einmalige staging-only Einrichtung liegt in `tools/automation/setup-staging-functions-identity.sh`. Sie verwendet eine eigene Workload-Identity und ein eigenes Servicekonto ohne Service-Account-Key; Production, Hosting und Firestore Rules sind nicht Teil dieses Deploy-Pfads.

## Was im Preview bereits testbar ist

- Coco/Pinguin als globaler Helfer rechts unten
- Remy direkt auf `Test mit KI erstellen`
- Remy Text/Diktat -> lokale/deterministische Formular-Patches ohne Backend-Aufruf für klare Angaben
- konkreter Satz `Erstelle mir einen Englischtest für die 4 Klasse für Farben, leichte Aufgaben, 12 Aufgaben und 20 Punkte.` -> bestehende Formularfelder
- kein automatisches Wegnavigieren beim Remy-Patch
- längere Diktierphase mit automatischem Neustart nach kurzen Browser-/Sprechpausen
- vereinfachte Emmi-Oberfläche im Editor

## Noch nicht vollständig testbar

- offene Coco-KI-Fragen, die den `crewAssistant`-Callable benötigen
- Remy-Fallback bei komplexen/unklaren Wünschen, die lokal nicht sicher parsebar sind
- echte Emmi-Gesamtüberarbeitung via `reviseWholeTest`

Diese Punkte benötigen zuerst den verifizierten staging-only `functions:ai`-Deploy.

## Status

- Code Feature-Branch: **gesichert**
- Feature-CI: **grün**
- Web-Integration: **integriert**
- gemeinsamer Integrations-Gate: **grün**
- Staging Hosting Preview: **deployed und hash-verifiziert**
- Staging AI Functions: **noch nicht deployed; einmalige WIF-Einrichtung fehlt**
- V2-Gerätetest: **offen**
- Production: **unverändert / nicht deployed**

## Nächster Schritt

1. V2 im verifizierten Preview praktisch testen: Coco-Position, Remy-Formularfüllung, kurze Sprechpausen und Emmi-UI.
2. Einmalig `tools/automation/setup-staging-functions-identity.sh` in authentifizierter Google Cloud Shell ausführen und `STAGING_FUNCTIONS_WIF_PROVIDER` setzen lassen.
3. Danach einen exakten grünen Integrations-SHA über `Automatic staging AI functions` deployen/verifizieren und erst dann Coco-KI-Fallback sowie Emmi Runtime gegen Staging testen.
