# Aufgabe: GC-AUTOMATION-02

- Aktualisiert (UTC): 2026-10-02
- Verantwortlicher Chat / Auftrag: Einmalige staging-only Workload-Identity-Aktivierung für automatische `functions:ai`-Deploys reparieren und Ende-zu-Ende verifizieren.
- Aufgabenbranch: `chore/record-staging-functions-e2e`
- Basiscommit: `a20c5651892a616bbd20b238cfbfee48a628c57a`
- Betroffene Dateien: `GRADECREW_STATE.json`, `TODO.md`, diese Übergabe.
- Überschneidungen mit anderen Aufgaben: Release-Train-Koordination auf `main`; Produktcode auf `feature/gradecrew-app-integration` wurde nicht verändert.

## Ziel und gewünschtes Verhalten

Normale GradeCrew-Staging-Deploys der Firebase-Codebase `ai` sollen nach erfolgreicher Integrations-CI automatisch über GitHub Actions laufen. Cloud Shell soll nur für die einmalige IAM/WIF-Einrichtung oder spätere IAM-Reparaturen nötig sein.

## Umfang / nicht verändern

- Ziel ausschließlich `hausaufgabe-staging`.
- Deployscope ausschließlich `functions:ai`.
- Production `hausaufgabe-40294` bleibt ausgeschlossen und unverändert.
- Kein Hosting-, Firestore-Rules- oder Assessment-Deploy durch den Functions-Workflow.
- Keine Service-Account-Schlüssel.

## Akzeptanzkriterien

- Workload-Identity-Pool und Provider eingerichtet.
- GitHub-Variable `STAGING_FUNCTIONS_WIF_PROVIDER` gesetzt.
- Automatischer Workflow authentifiziert sich über WIF.
- Exakter grüner Integrations-SHA wird vor Deploy erneut geprüft; stale SHA wird abgelehnt.
- Functions-Tests laufen vor Cloud-Authentifizierung erneut.
- `functions:ai` wird nach Staging deployed.
- `crewAssistant` und `reviseWholeTest` werden nach Deploy in Staging verifiziert.
- Receipt-Artefakt wird geschrieben.
- Production bleibt unverändert.

## Zwischenstand

- Auf GitHub gesichert: WIF-Displaynamen-Fix über PR #22, Mergecommit `a20c5651892a616bbd20b238cfbfee48a628c57a`.
- Einmalige Cloud-Einrichtung: erfolgreich am 02.10.2026; Pool `gradecrew-functions-github`, Provider `staging-functions`, Serviceaccount `gradecrew-functions@hausaufgabe-staging.iam.gserviceaccount.com`, GitHub-Variable gesetzt.
- Integrations-CI: Run `36941486945`, Attempt 2, Commit `a61759db01e41f19b7d34e6eb0e88bac42484c1e`, erfolgreich.
- Automatischer Functions-E2E: Run `36943129026`, erfolgreich.
- Nach Deploy verifiziert: `crewAssistant`, `reviseWholeTest`.
- Receipt: Artifact ID `11200528486`, Name `staging-functions-receipt-a61759db01e41f19b7d34e6eb0e88bac42484c1e`.
- Staging-Hosting wurde durch diesen Functions-Deploy nicht verändert; Firestore Rules ebenfalls nicht.
- Production wurde nicht verändert.
- Gerätetest: für die Automationsaufgabe n. a.; Produkt-Runtime im Browser/iPad bleibt separat als Nutzertest offen.

## Offene Probleme und Unsicherheiten

Die Deployment-Automatik selbst ist Ende-zu-Ende verifiziert. Offen ist nicht mehr die Infrastruktur, sondern die praktische Produktabnahme von Coco/Remy/Emmi auf dem gemeinsamen Staging-Stand.

## Nächster konkreter Schritt

Martin testet den aktuellen gemeinsamen Staging-Stand im Browser/iPad: Coco/Remy-Fallback, Remy-Formularfüllung, Emmi-Gesamttestüberarbeitung und Tutorial. Produktfeatures erst nach dieser Abnahme auf `user_tested` setzen.

## Wiederaufnahme nach Abbruch

GC-AUTOMATION-02 kann als technisch abgeschlossen behandelt werden. Bei späteren Staging-AI-Deploys ist Cloud Shell nicht mehr Teil des normalen Ablaufs. Bei Fehlern zuerst den konkreten Actions-Run und das Receipt prüfen; nicht vorsorglich IAM neu aufbauen.
