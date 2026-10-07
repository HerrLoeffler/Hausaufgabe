# Expedition Amazonas — GradeCrew-Live-Brücke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Die native Expedition nutzt acht von der Lehrkraft geprüfte bestehende GradeCrew-Fragen, serverseitige slotweise Bewertung und sichere Fortsetzung statt lokaler Demo-Lösungen.
**Architecture:** Eigenständiger Practice-/Escape-Lifecycle neben dem unveränderten Assessment-Lifecycle. Vorhandene GradeCrew-Erstellung und assessment-core-Bewertung bleiben fachliche Quelle. Native HTTP spricht klar begrenzte FirebaseCallable-Endpunkte; unveränderliche Paketrevision und Antwortbelege verbinden Plattform und Spiel.
**Tech Stack:** Vorhandene Node/Firebase-Dependencies, node:test/FirebaseEmulator, Unreal HTTP/Json; keine zusätzlichen Bibliotheken, neuen Provider oder API-Key-Einrichtung.
**Spec:** ../specs/2026-10-07-expedition-amazonas-unreal-design.md
**Prerequisite:** 2026-10-07-expedition-amazonas-unreal.md Tasks 1–5 stellen Provider-/Sessioninterfaces bereit.
**Status:** Plan zur Nutzerprüfung. Kein Backendcode/Deploy/Provideraufruf ausgeführt.

## Global Constraints

- Genau acht explizit bestätigte passende Fragen, zwei Camp/dreiUfer/dreiStation.
- Bestehende KI-Testerstellung wiederverwenden; keine separate nativeGenerierung.
- Unterstützt single/dropdown/truefalse/automatisch eindeutiges text/number. Manuelle/Bild-/komplexe Typen fail-closed.
- Lösungsschlüssel und privateRate-Daten nie an Schüler liefern; keine ungeprüften Inhalte als ausführbaren Code akzeptieren.
- Session/Paketrevision unveränderlich; Attempt-Abgabe idempotent, keine doppelte Fortschrittsvergabe.
- Hilfe allein schaltet nicht frei; Main/Hint/WorkedExample/Transfer gemäß Spec.
- Funktionen/Rules/Staging/Device/Production als getrennte Nachweise; Production braucht ausdrückliche Freigabe.
- Keine Schülernamen/Rohantworten in Run-/Testlogs; synthetischeTestdaten.

## Review Focus

1. Lehrkraft wählt denselben Index zweimal, neun oder nur siebenFragen: Task 1 RejectSelection.
2. Fragen/Hilfen ändern sich während Paketstart/Session: Task 1 FreezeRevision und Task 2 StaleRevision.
3. Unbefugte Lehrkraft/erratenerLaunchcode/ungültigeCapability: Task 2 Capability.
4. Parallel-Submit/Retry mit anderer Antwort unter derselbenID: Task 2 ReceiptReplay.
5. HTTPTimeout oder200mit fehlerhaftemCallableBody, veralteteCallback nachSessionwechsel: Task 3 NativeFailure.

## Prüfbasis und Isolation

Aktuelle Assessment-Exports aus assessment-functions/lib/secure-lifecycle.js@67b396cd: getAssessmentInfo/startAssessmentAttempt/resumeAssessmentAttempt/submitAssessmentAttempt/getAssessmentReceipt. submitAssessmentAttempt schließt den gesamten Testversuch ab und entfernt dessen Bewertungsschlüssel. **Diesen Endpunkt nicht achtmal für Lernslots verwenden oder seine Prüfungsregeln lockern.** assessment-core hat buildAssessmentContract, gradeSubmission und assertNoSolutionLeak. Vor Änderungen Branchspitze frisch lesen; ihre Tests erhalten.

Vorhandener Browseradapter lab/escape-room/gradecrew-question-adapter.js@f87a5309 kennt geprüfteFragentypen und genau acht ausgewähltePositionen plus vollständige Lernpakete; diese geleseneQuelle ist semantische Referenz. Nicht den Browser-IIFE direkt in Node importieren.

Eigener Servicebranch **feature/escape-expedition-gradecrew-bridge-v1** vom frischen **feature/gradecrew-app-integration**; Web-/Assessment-/Functions-Dateiüberschneidungen vor Schreiben abgleichen. NativeBridge-Dateien auf dem Unrealbranch, klare Eigentümerschaft. Integration/Deployment nur nach frischem Zielabgleich und bestehendenStagingGates.

## Task 1: Autorisierte Paketvorbereitung und Lehrkraftvorschau

**Files:** Create assessment-functions/lib/escape-package.js, assessment-functions/test/escape-package.test.js, gradecrew-escape-launcher.js, gradecrew-escape-launcher.css. Modify assessment-functions/main.js, index.html und tools/build-staging.mjs ausschließlich neueModulaufnahme; vorhandene Test-/Editorhandler erhalten.

**Interfaces:** buildEscapePackage(authorQuestions,selectedPositions,supports,profile)->{revision,publicPaper,privateKey,errors}. PublicPaper enthält packageId/revision/schemaVersion=1, type/prompt/options/unit und erlaubteHilfemetadaten; keine Lösungen, targetWords/numericAnswer/acceptedAnswers/CorrectOption-Felder. privateKey enthält reguläreBewertungsschlüssel plus geprüfteTransferpakete. prepareEscapePackage({quizId,positions,supports,expectedSourceRevision}) ist teacher-authenticated Callable und liefert vollständige Lehrkraftvorschau plus publicRevision. GleicheQuelle erlaubt Reuse vorhandenerFragen; Hilfepakete werden über vorhandeneErstellung erzeugt/bearbeitet, nicht frei vom Schülerclient akzeptiert.

- [ ] Write RejectSelection:7/9/doppelte/out-of-rangePositionen, manuelleBewertung und bildabhängigeFrage→errors, kein startbaresPaket. Number/Text-Typen behalten Schema/Einheit/Toleranz im privateKey.
- [ ] Write FreezeRevision: Quelländerung während Transaktion→aborted; teacherPreview und paper teilen Revision; ein aktivesPaket lässt sich nicht nachträglich ändern. assertNoSolutionLeak(publicPaper) in jedem Positivtest.
- [ ] Run `node --test assessment-functions/test/escape-package.test.js` RED; implement pureBuilder und owner/admin-geprüften PrepareEndpoint; speichern unter escapePackages/{id} publicManifest und escapePrivate/{id} nur serverseitig.
- [ ] Implement Lehrerzugang aus vorhandenem Testeditor: genau8Fragen anklicken, Lernhilfe/Transfer anzeigen, Stationszuordnung prüfen, Fehler erklären und explizit Start wählen. Kontext-/KI-Erstellung bleiben vorhandeneHandler. Kein Schülerexport des teacherPreview.
- [ ] Run GREEN + bestehendeAssessmentCoreTests; lokal gerenderteLehrkraftauswahl mit synthetischemTest prüfen; Commit+push. BuildManifest neueDateien bewusst aufnehmen.

## Task 2: Practice-Session, slotweise Bewertung und Wiederaufnahme

**Files:** Create assessment-functions/lib/escape-lifecycle.js, test/escape-lifecycle.test.js, test/escape-lifecycle-emulator.test.js; Modify main.js um separatenEscapeExport, firestore.rules nur explizitesDeny für neuePrivate-/Sessionpfade, bestehendeRulesTests.

**Interfaces:** startEscapeSession({launchCode,clientAttemptId,attemptToken})->{sessionId,packageRevision,publicPaper,completedSlots,sessionRevision}; resumeEscapeSession({sessionId,attemptToken})->sameSnapshot; submitEscapeSlot({sessionId,attemptToken,packageRevision,slotId,phase,answer,submissionId})->{sessionId,packageRevision,slotId,submissionId,passed,phase,feedback,sessionRevision}. Teacher-authenticated createEscapeLaunch({packageId,revision})->{launchCode,expiresAt}; jederCode gilt nur für ein geprüftesPaket, hat mindestens128Bit Zufall,24hExpiry und keineTeacherberechtigungen. Capabilities256Bit vom NativeClient vor Start erzeugt, nurHash serverseitig. sessionId stabil aus Code/Paket/ClientAttemptID.

- [ ] Write Capability: fremdeLehrkraft kann keinLaunch erzeugen; falscherToken/Code abgelaufen→permission-denied/failed-precondition; direkteClientReads privateKey/session/outbox geblockt. BestehendeAssessment-Finalisierung unverändert.
- [ ] Write ReceiptReplay: paralleleidentischeSubmissionID→einReceipt/eineSlotbestätigung; gleicheIDmit andererAntwort→failed-precondition; falscheSession/PaketRevision→keineÄnderung. Adversarialanswer-Payload begrenzen und sanitizeAnswersForStorage verwenden.
- [ ] Write HintTransfer: falscheMainversuche/WorkedExample/Transfer serverseitig festhalten, Lernen nie perClientPassedFlag; transfergrade über vorhandenenCore auf privatenSnapshot. KeinTransfer mit manualReview.
- [ ] Run unit+emulatorTests RED; implement Firestoretransaktion mit quota/token-Check vor privatemFragenlesen, immutablepackageSnapshot, stabilesReceipt und serverseitigerErgebnisbewertung. LiveCapability nicht in Log/Feedback; aufrufbedingteRateDaten privat.
- [ ] Run GREEN sowie bestehendeLifecycle/Rules-Regressionen; Commit+push. KeinDeployment aus reinemTesterfolg ableiten.

## Task 3: Native HTTP-Provider und sichere lokale Fortsetzung

**Files:** Create games/escape-expedition-unreal/Source/Expedition/GradeCrewBridge.h/.cpp, PlatformCredentialStore.h/.cpp, Source/Expedition/Tests/BridgeAutomation.cpp, ContentSource/live-endpoints.example.json; Modify LearningSession, ExpeditionHUD, ExpeditionSaveGame und Build.cs.

**Interfaces:** UGradeCrewBridge implementiert IExpeditionLearningProvider. Configure(endpointBase,launchCode); Start(clientAttemptId); Resume(sessionId); Submit(slotId,phase,answer,submissionId); CancelSession(). ParseCallableResponse(FString body)->FBridgeResult{status, optionalReceipt, feedback, optionalSnapshot}; EBridgeStatus={Ok,TransportError,CallableError,InvalidPayload,StaleSession}. FNativeSessionSnapshot enthält sessionId, packageRevision, completedSlots und sessionRevision. PlatformCredentialStore::Write(sessionId,token)/Read(sessionId)/Delete(sessionId); AppleKeychain via Security.framework, keineDrittbibliothek. AnderePlattform ohne CredentialStore blockiert persistentenLiveResume, keine Klartextfallback. EndpointConfig ausschließlich zulässigehttpsStaginghosts/localhostEmulator; keineSecrets inRepository.

- [ ] Write NativeFailure mitFakeTransport: Timeout, non200,200mit{"error":...}, fehlendeFelder, Antwort nachCancelSession und RevisionMismatch→kein AcceptReceipt; Retry nutzt dieselbeSubmissionID.
- [ ] Write SnapshotReconciliation: nativeSave behauptet gelöstenSlot, Serverbestätigt ihn nicht→Weltfortschritt zurückhalten; serverbestätigteSlotrevision rekonstruieren, Weltfakten konsistent laden.
- [ ] Run NativeTests RED; implement FirebaseCallableJSON per Unreal HTTP, Tokens nurCredentialStore/Arbeitsspeicher, CallableFehler verständlich inUI; Standardprotokoll auth/context nicht selbst aufweiten.
- [ ] Schüler startet perLehrkraftLaunchcode; switchDemo/Live aufStartscreen eindeutig. LivePaperparser lehnt privateSolutionfelder ab. Verbindungsausfall zeigt „Antwort noch nicht bestätigt“ und Retry; keine lokaleBewertungsabkürzung.
- [ ] Run GREEN, lokalemEmulator durch echteHTTP zeigen TeacherPrepare→NativeStart→SlotRetry→Resume. KeineAPI-/Launch-/AttemptTokens inScreenshots/Logs. Commit+push.

## Task 4: Staging-E2E und volle Abnahme

**Files:** Create docs/games/EXPEDITION_UNREAL_LIVE_BRIDGE.md, tools/games/escape-launcher.test.cjs, eigenerStagingRequest/Receipt im bestehendenDeploymentformat; Modify eigeneWorkstream-/TODO-/Statezeile und nativeProduction/ACCEPTANCE.md.

- [ ] Run alle paket-/lifecycle-/rules-/nativeTests und vorhandeneWebbuildChecks auf exactSHA; echteCaller-/SecurityBelege erhalten, nicht nurFakeTransport.
- [ ] Im frischenIntegrationsstand gemeinsameDateien abgleichen, unabhängigreviewen und bestätigteStagingpipeline nutzen. VorStart Ziel/SHA sichern; Hosting/AssessmentFunctions/Rules jeweils getrennteRun-/ReceiptIDs festhalten. KeineProduction.
- [ ] Mit synthetischerLehrkraft einen bestehenden oder neu über vorhandeneGradeCrew-Erstellung erzeugten Wortarten-/Prozenttest prüfen,8Fragen und Hilfen freigeben; normaleNativeApp starten und alle dreiRätsel plus servergeprüfte8Slots bisFinale spielen.
- [ ] Online/offlineRetry, echterAppneustart und ungültigerLaunch prüfen. Screenshots zeigen keineSchlüssel; LehrerFragenvorschau stimmt mitNativePaper überein.
- [ ] Zeit/Lernquote und benanntesphysischesTouchgerät separat prüfen. OhneLive/Devicebeleg offeneGates nennen; keineGesamtfertigmeldung aus lokalemDemo.
- [ ] Quellencommits, CI/DeployReceipts, verbleibendeRisiken und Nutzerabnahme sichern. Genau nächsten offenenSchritt benennen; bestehendeVersuche/Budgets nicht zurücksetzen.

## Plan-Selbstprüfung

NativeInterfaces entsprechen erstemPlan. Alle fünfReviewFocus-Klassen besitzen benannte Tests. Prüfungs-/Practice-Lifecycle bleiben getrennt, fachlicheBewertung wird wiederverwendet. Sämtliche Live-/Security-/Webdateien auf eigenemServicebranch; nativeSlots bleiben 0–7. Credentials/Provider werden nicht neu eingerichtet. Der volle Auftrag ist erst nach lokalerSpielabnahme plus echterGradeCrew-/Geräteabnahme erfüllt. Planprüfung/Ausführungswahl noch offen.
