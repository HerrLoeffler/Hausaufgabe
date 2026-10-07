# GradeCrew Überarbeitungsmodus – Implementierungsplan

Task: GC-WEB-REPAIR-20261007. Autorisiert durch Martins Auftrag vom 07.10.2026; Umsetzung in diesem Chat.
Spec: docs/review-mode/concept.txt (freigegebenes Konzept).
Ziel: Elementbezogene Hinweise, explizite Lehrerfreigaben, abarbeitbare Ampel und lokale wiederaufnehmbare Prüfszenen.
Architektur: Kleine Vanilla-JS-Module; server-only Firebase Callables mit separaten Review-Collections, keine Rules-Erweiterung. Lokale Vorschau verwendet isolierte Adapter statt Firebase. Bestehende Testkatalog-IDs bleiben erhalten.

## Grenzen
Staging/localhost, niemals Production. Keine bezahlten Provideraufrufe, keine automatische KI pro Hinweis. Keine Aufweichung privater Audio-Gates. Keine Produktions-/Schülerdaten im lokalen Prüfmodus. Die Ampel unterscheidet manuelle Abnahme, automatisierte Prüfung und historischen Quellstand.

## Review-Fokus
Rechteentzug während Offline-Sync; nachträglich veränderte freigegebene Hinweise; doppeltes Senden; Konto-/Buildwechsel; Markierklick während modaler Tutorialschritte. Diese Fälle in den zuständigen Tests abdecken.

## Task 1: Serververtrag und Ampelkatalog
Dateien: functions/lib/review-mode.js, functions/review-mode-callables.js, functions/main.js, functions/test/review-mode.test.js, review-checks.json.
Interface: createReviewService({store, projectId, now}).execute({uid, data}); Store atomare Transaktion mit get/set/list. Aktionen access, grant, list, create, edit, transition, approve, batch, check. Server prüft Rolle/aktiven Status und separate Freischaltung bei jedem Zugriff, Quizreferenz zusätzlich. Content-Revision getrennt von Schreibrevision; Statushistorie append-only. Idempotenz über author/clientRequestId, Konflikt bei anderer Payload. Batch nur freigegebene exakte Revisionen.
- [x] Vertragstests zuerst: keine Rechte, Lehrerfreigabe, Fremdquiz, Revision/Replay, Status/Checknachweise.
- [x] Ausführen: node --test functions/test/review-mode.test.js (zuerst rot, danach grün).
- [x] Callables mit Firebase-Transaktionsadapter verbinden, serverseitig Production ablehnen.
- [x] Zwischencommit sichern.

## Task 2: Reviewpanel und persistente Ausgangswarteschlange
Dateien: review-mode.mjs, review-store.mjs, review-mode.css, tools/ui/review-mode.test.cjs, app.js, ai-client.js, tools/build-staging.mjs.
Interface: installReviewMode({document, api, getContext, storage, openScene}); controller.setSession({uid}), dispose(). API execute(data) entspricht Task1. IndexedDB nach Umgebung/Nutzer; Entwurf/Outbox atomar, kein stilles Verwerfen, bestätigtes Online erst nach Antwort.
- [x] Verhaltenstests: Markieren verhindert ursprüngliche Aktion; Tastatur/Schließen; Draftreload/Syncfehler; Kontoisolation und Reviewrechte; Hinweise als Text, kein HTML.
- [x] Panel mit Hinweisen, Freigaben, Mitgliederverwaltung, manueller Batchabfrage und Ampel; Daten nur beim Öffnen/Aktualisieren, kein Hintergrundagent.
- [x] Build und fokussierte UI-Tests ausführen; Zwischencommit sichern.

## Task 3: Isolierte Live-Vorschau und Szenen
Dateien: tools/review-preview/server.mjs, firebase-fixture.mjs, review-preview-client.mjs, review-scenes.mjs, gradecrew-tour-v7.js, app.js, tools/review-preview/server.test.mjs.
Interface: fester Szenenkatalog welcome/remy/editor/student/submit/results/finish. app-Adapter stellt lokale Tourrepo und Voraussetzungen her; keine beliebigen internen Zustände aus Kommentaren. Loopbackserver liefert isolierte Firebase-Stubs und verhindert externe Verbindungen. Nur feste lokale Tests startbar, ohne freie Befehle; Ergebnisse mit Build/Fingerprint, Laufstatus und echter Exitcode-Auswertung. Dateibeobachtung aktualisiert CSS bzw. lädt mit gespeichertem Szenencheckpoint neu.
- [x] Tests zuerst: Schema-/Szenenvalidierung, kein Firebasezugriff, lokale API-Originprüfung, automatischer Check nur Allowlist, Restore derselben Szene.
- [x] Echten App-/Tourrenderer mit Fixtureadapter anschließen; Controller erlaubt Reviewpanel im Prüfmodus.
- [ ] Lokale Browservorschau auf Desktop/kleiner Breite prüfen und öffnen. BLOCKIERT: Chrome-Bridge fehlgeschlagen, Browser-Policyprüfung nicht verfügbar; keine Umgehung.

## Task 4: Gesamtprüfung und Sicherung
- [x] Server-/UI-/Szenentests sowie Stagingbuild, relevante bestehende Regressionen.
- [x] Unabhängiger abschließender Code-Review; wichtige Befunde beheben und Regressionen testen.
- [x] Branch remote sichern, PR an bestehendes Integrationsziel; CI/Deploy getrennt ausweisen.
- [x] TODO/STATE/Workstream aktualisieren. Kein fertiges Staging behaupten ohne Deployreceipt.

## Entscheidungen / Ledger
- Bestehender isolierter Checkout wird unter neuem Reviewbranch weiterverwendet. Der bereits gesicherte Benefit-Strip bleibt enthalten; Basisbaum auf GitHub geprüft.
- Live Development Audit ausgeführt, aber eingeschränkte Fetch-Refspec meldet fehlende Branches. GitHub-API bestätigt Integrationshead6390766 und offene PRs; kein paralleler Reviewmodus-PR vorhanden. Audio/Security-PR146 und i18nPR137 werden nicht übernommen.
- Prüfung bewusst manuell starten; keine Scheduler-/Chat-Automation.

## Ausführung 2026-10-07
PR167 integriert als fa51e2781a8e00b219892fdceb2d25fb88203ff5. CandidateCI37629871764 und MergeCI37630241490 bestanden. Hostingpreview37630432043 und Functions37630432069 laufen. 179 Functions-,54 UI-,48 bestehende App- und5 Previewtests sowie127-Dateien-Build lokal bestanden. Wichtige unabhängige Reviewbefunde in einem Reparaturdurchlauf behoben. TODO/STATE/Workstream auf main gesichert. Kein Browser-/Gerätenachweis. ReviewpanelDeutsch; allgemeine Zustandswiederherstellung und Cloudbackup-Restore bleiben offen.
