# Quellgebundenes Mathe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reale Test-/Remy-/Lehrplanquellen in vier Schritten für eine fortlaufend wertbare Mathe-Runde vorbereiten.
**Architecture:** Neues v2-Runtime-Modul erhält unveränderliche serverseitige Quellsnapshots und validierte deterministische Familien; der historische v1-Vertrag bleibt separat testbar. Dieselbe private Reihenfolge für alle, fester Roster, Einmalwertung und gemeinsame Serverfrist.
**Tech Stack:** Bestehendes VanillaJS/Node22/Firebase Admin, bestehende GradeCrew Firebase-Anmeldung und startAiTestJob.
**Spec:** PR239 docs/games/learning-ux-20261015/QUELLENBASIERTES-MATHE-SPIEL-20261018.md plus Ausführungsbriefing18Oct.

## Global Constraints
- GC-GAMES-LEARNING-UX-01 / PR240 / Branch feat/math-classroom-learning-ux-20261016 beibehalten.
- Nur gradecrew-staging-2026; hausaufgabe-staging ist Schul-Live. Keine Kundenquellen kopieren.
- Kein Testmodus/Testspieler/Joinfix; private Lösungsschlüssel, keine neue Provider-/Authkonfiguration.
- Dauer60–1200 ganze Sekunden, Presets1/3/5/10min;2/3/4Teams Default4.
- Kopf100%H, Papier Präfix35%P. Ungeeignete Quellen blockieren statt Stoffwechsel.
- Keine Volllehrplanbehauptung; veröffentlichte Teilkompetenzen mit amtlicher Quelle ausweisen.

## Review Focus
- Fremder/gesperrter/aktiver Test oder geänderte Quellrevision darf nicht starten.
- Unvariierbare Wissensfragen dürfen keinen numerischen Ersatz erhalten.
- Doppelrequest/alte Runde/Endfrist müssen idempotent und privat bleiben.
- Ungleiche Teams und manuelle Lobbyzuordnung erhalten feste Nenner.
- Providerfehler und Vorratsmangel dürfen keinen Erfolg behaupten.

### Task1: Quellen und geprüfte Varianten
Files: classroom-sources.js (neu); classroom-v2.test.cjs (neu).
Interface: compileSource(source), preparePlan(source,config), taskAt(plan,index,seed), publicReview(plan).
- [x] Verhaltensfälle vor Implementierung schreiben und RED sehen:2Originalaufgaben→600Varianten, Fremdformat/knapperVorrat blockiert, Kopf/SB-Präfix, amtlicheKlassen/Züge.
- [x] Kleinste quellentreue Familien und unabhängige Kontrollrechnung implementieren.
- [x] Fokusprüfung grün; Checkpoint.

### Task2: Private kontinuierliche Klassenrunde
Files: classroom-v2.js (neu), index.js; Test wie Task1.
Interface: createApi deps inkl sourceRepo/verifyIdentity; classroomV2* HTTP-Routen.
- [ ] RED: sechste Antwort wertbar, freie20–60s, exakteFrist/nachträglichesLernfeedback, feste2/4Teams/Name/Normierung.
- [ ] Runtime/Auth/Quellrevision/Rate/Replay implementieren.
- [ ] Gesamte Games-Tests; Checkpoint.

### Task3: Vier Schritte und bestehende Anmeldung/Remy
Files: classroom.js, classroom.css, source-client.mjs, build-lab-fast-quiz.mjs.
- [ ] Browserprobe vor Änderung auf4Schritte/Quelle/Dauer/2Teams ergänzen→RED.
- [ ] GradeCrew-Tokens behalten; Herkunft/Eignung/Beispiele, Quellenwahl, SDK-Auth und vorhandenen startAiTestJob einbinden.
- [ ] Browser1440/768/390px inkl Lehrer/Schüler/Reload/Teamnamen; Checkpoint.

### Task4: Exakte CI, Review, isoliertes Staging
Files: deployment-wrapper, eigene Übergabe/Receipts.
- [ ] Sämtliche betroffenen Tests/Build/Syntax und exakteCI; Root unabhängigen Review anfordern.
- [ ] Saubere gepinnteQuelle nur fastquiz+eigenerHostingkanal in gradecrew-staging-2026 deployen.
- [ ] ÖffentlichesManifest/Hashes/Functionhash+synthetischeLiveQA prüfen; offene Auth-/Remy-/Gerätebelege ehrlich sichern.

Ruling18Oct: Nach vollständig geprüftem Variantenzyklus wiederkehrende Festigungsinstanzen erlauben (Rootpräzisierung), transparent inPrepare; keineunendlicheEinzigartigkeit. UngeeigneteQuellen/Familienweiterblockiert.
