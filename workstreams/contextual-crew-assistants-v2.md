# Kontextbezogene Crew-Assistenten V2

Task: `GC-CREW-AI-03`

## Zielbild

- Coco/Pinguin bleibt als allgemeiner Helfer dauerhaft rechts unten.
- Remy sitzt direkt auf `Test mit KI erstellen` und füllt das vorhandene normale Testformular per Text oder Diktat sichtbar aus.
- Remy navigiert beim Anwenden eines Testwunsches nicht weg und erzeugt keinen zweiten versteckten Testflow.
- Emmi bleibt direkt im Editor für Überarbeitungen.
- Wilma wird später kontextbezogen in der Auswertung angebunden.
- Die Oberfläche zeigt nicht mehr alle Crew-Mitglieder gleichzeitig.
- Zusatztexte/Erklärleisten werden im funktionalen V2-Entwurf weggelassen.
- Diktieren übersteht kurze Sprech-/Browserpausen durch automatischen Neustart; manueller Stop bleibt möglich, Sicherheitsstopp nach 60 Sekunden.

## Anlass

Staging-Nutzertest am 02.10.2026: Spracheingabe funktionierte, aber der gemeinsame Crew-Chat entsprach nicht dem gewünschten Produktfluss. Senden eines Testwunsches wirkte wie ein Ein-/Ausloggen, und das Mikro beendete die Aufnahme bei kurzen Pausen zu früh.

## Umsetzung

- `crew-assistant-ui.js`: globaler Coco-Helfer, keine Crew-Tabs, Quick-Chips oder Footer-Hinweise, keine automatische Navigation zum Testformular.
- `remy-ai-help.js`: funktionales Remy-Feld direkt in `#aiView`; Text/Diktat -> Partial-Patch der bestehenden Formularfelder; Änderungen werden kurz markiert.
- `crew-assistant-core.mjs`: Testaktionen nur für Remy; Coco verweist auf Remy; Parser versteht u. a. `4. Klasse für Farben`.
- `emmi-whole-test-revision.mjs`: vereinfachte UI und robustere Diktiersteuerung.
- Cache-Versionen für Coco/Remy/Emmi auf V2 angehoben.

## Nachweise

- Feature-Branch: `fix/contextual-crew-assistants-v2`
- Feature-Code-Head: `2a03cd31a69c3802028da5713ddab7d1ce3e2727`
- Feature-CI `Crew Assistant Checks` Run `36941146019` ✅
- Integration-Merge: `be2b90583e987add07c03acf8072ee578d7af3e4`
- V2-Remy-Regressionsupdate: `a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- gemeinsamer `AI Staging Checks` Run `36941486945` ✅
- Mobile-Tutorial-Gate auf gleichem V2-Produktcode: Run `36941265518` ✅
- Hosting-Preview + Manifest-/Hash-Verifikation: Run `36941659842` ✅

## Staging

- Projekt: `hausaufgabe-staging`
- Preview-Kanal: `gradecrew-app-integration`
- URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- verifizierter Commit: `a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- verifizierte Dateien: `93`
- V2-Gerätetest: noch offen

Klare Remy-Testwünsche werden lokal/deterministisch geparst und füllen das vorhandene Formular ohne Backend-Aufruf. Dadurch ist der zentrale neue Remy-Fluss bereits im Hosting-Preview testbar.

## AI-Functions

Der staging-only Workflow `Automatic staging AI functions` ist auf `main` vorhanden und darf ausschließlich `functions:ai` nach `hausaufgabe-staging` deployen. Für den aktuellen Stand lief Run `36941659861`; `deploy-ai-functions` wurde bewusst übersprungen, weil `STAGING_FUNCTIONS_WIF_PROVIDER` noch nicht einmalig eingerichtet ist. Der `setup-needed`-Job war erfolgreich.

Bis zur WIF-Einrichtung sind daher noch nicht vollständig testbar:

- offene Coco-KI-Fragen via `crewAssistant`
- Remy-KI-Fallback bei lokal nicht sicher parsebaren Wünschen
- echte Emmi-Gesamtüberarbeitung via `reviseWholeTest`

Die einmalige staging-only Einrichtung liegt in `tools/automation/setup-staging-functions-identity.sh`. Production, Hosting und Firestore Rules gehören nicht zum Functions-Deploy-Pfad.

## Status

- Feature-Code: **gesichert**
- Feature-CI: **grün**
- Web-Integration: **integriert**
- gemeinsamer Integrations-Gate: **grün**
- Staging Hosting Preview: **deployed und hash-verifiziert**
- Staging AI Functions: **noch nicht deployed; WIF-Einrichtung fehlt**
- V2-Gerätetest: **offen**
- Production: **unverändert / nicht deployed**

## Nächster Schritt

1. V2 praktisch im Preview testen: Coco rechts unten, Remy-Formularfüllung, kurze Sprechpausen, Emmi-UI.
2. Einmalig `tools/automation/setup-staging-functions-identity.sh` in authentifizierter Google Cloud Shell ausführen.
3. Danach `functions:ai` für einen exakten grünen Integrations-SHA automatisch deployen/verifizieren und Coco-Fallback/Emmi Runtime testen.
