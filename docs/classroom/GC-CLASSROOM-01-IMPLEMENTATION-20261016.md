# GC-CLASSROOM-01 Implementation Plan

> For agentic workers: use superpowers:executing-plans. Ein Writer im isolierten Checkout; unabhängiger Review an fixiertem SHA. Dieser einzige Umsetzungsplan konkretisiert die 14 am16.10.2026 von der Zentrale veröffentlichten Schritte. Historische Implementierungsverbote im Konzept gelten für die damaligen Aufträge und sind für diesen ausdrücklich autorisierten lokalen Lieferblock abgelöst.

**Goal:** In der vollständigen aktuellen GradeCrew-App Klassen, lokale ASV-Beispielimporte und explizite Testzuweisungen mit persönlichen Schüleransichten erproben.

**Architecture:** Originale index.html/startup.js/app.js, bestehende Tokens, Assets, Editor und Übungsport bleiben maßgeblich. Ein ausschließlich expliziter Loopback-Testserver setzt vor Modulinitialisierung eine Importmap auf einen blockierenden Demo-SDK-Adapter und eine restriktive CSP. Neue fachliche Daten leben nur im RAM; die bestehende App bekommt einen kleinen Port für Navigation und echte Editor-Test-IDs. Kein zweiter Editor oder Bewertungsserver.

**Tech Stack:** Vorhandenes Browser-ESM, CSS, Node24 TestRunner/HTTP, vorhandenes jsdom/Playwright; keine neuen Produktabhängigkeiten.

**Spec:** ../CLASSROOM_TEACHER_UX_V1.md hat Vorrang vor älteren Navigationsteilen in ../CLASSROOM_STUDENT_MASTERPROJECT_V1.md. Identität/ASV: ../privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md und CLASSROOM_ASV_IMPORT_PRIVACY.md, Quellhead9b23052e7bb3a8e6009cca64a7498d942cd7bc1d. Nutzerauftrag16.10 ergänzt und autorisiert lokale Umsetzung, keinen Deploy.

## Global Constraints

- Base8f8697901f8c1aea89897be855ca2872c82d0f2b / gc39, Stage canonical hausaufgabe-staging.web.app. Alter Standalone-Mock17fc427 ist historische Evidenz, keine Codebasis.
- Eigener Branch feature/classroom-integrated-preview-20261016. Ports8779/8780/8781 fremd; eigener Port8782 nur127.0.0.1.
- Vollständige Originalapp laden; bestehende Homepage, Animation,29CrewPNGs, Coco,Remy,Mülleimer,ET,Upload10,Audio,Lösungsfreigabe erhalten. Keine fremden Branches cherry-picken.
- Im Testmodus keine Remoteauth,Firestore,Storage,Functions,AI,Analytics; keine echten Schülerdaten. UI-Rollenwechsel ist Testansichtswechsel, keine Anmeldung/Autorisierung.
- CSV-Rohdateien,Namen,RohIDs nurBrowserRAM. Kein localStorage/IndexedDB/Log/URL/Server/AI/Analytics. Nur synthetische herunterladbare Beispiele; tatsächliches ASV-Schema unbekannt.
- Schul-HMAC mit schulischem Schlüssel, Recovery und Codeexchange sind Zielarchitektur, nicht durch fest eingebauten Demoschlüssel simuliert.
- Kein Merge/Deploy/Production, kein echter Mail-/Provider-/Accountaufruf, keine JDK-Installation. Release bleibt branch_only.
- Task/Versuche/Budget/Historie erhalten. Codecheckpoint vor langen Tests, HDF/TODO im Aufgabenbranch, keine zentrale Main-Schreibarbeit.

## Review Focus

1. CSV mit führenden Nullen, BOM, Quotes/Zeilenumbrüchen, alternativen Separatoren, Encodingfehlern: Textidentität erhalten oder mit Zeile ablehnen; kein Namensfallback.
2. Zwei Lehrkräfte, zwei Schulen und fremde Klasse: keine unberechtigten Listen/Starts/Entwürfe; Testansicht darf Sicherheitsnachweis nicht vortäuschen.
3. Nachträgliches Mitglied und Lehrkraftwechsel während Sitzung: Snapshots unverändert, aktive Mitgliedschaft bei jedem Start, Rechte zum Stichtag neu prüfen.
4. Reload/Reset/Abbruch: CSV verschwindet ausRAM, keine Browserpersistenz oder Remoteübertragung, offener Dialog löscht transiente Rohdaten beim Zurücksetzen.
5. Tatsächlicher Editorfluss: dieselbe quizId wird bearbeitet, gespeichert, zugewiesen und angezeigt; private Lösung und Bewertungen werden nicht als SecureAssessment-E2E ausgegeben.

## Dateiverantwortung und Schnittstellen

| Datei | Verantwortung |
|---|---|
| tools/classroom-preview/server.mjs | NurLoopback-HTTP,Originaldateien,vorInitImportmap,CSP,synthetischeDownloads,keine Uploadroute |
| classroom/demo-sdk.mjs | FirebaseSDK-Imports lokal abfangen; alle Auth/DB/Callable/Storageoperationen failclosed; keine Secrets/Claims |
| classroom/domain.mjs | pure TeacherGrant-,Membership-,Snapshot-,Zeitraum-,Transfer-,RollOver-Verträge |
| classroom/repository.mjs | synthetischer RAM-Zustand, Klassen/Kurse,Schulpersonal,Identities,Assignments,Importrevisionen |
| classroom/csv.mjs | Textdecoder,CSVParser,Mapping,Validierung,unveränderteTextIDs |
| classroom/controller.mjs | Originalapp-Navigation,Klassenansichten,Importdialog,Zuweisungsdialog,MeineTests/Testwerkzeug |
| classroom/classroom.css | nur neue Klassenlayoutregeln auf bestehenden --gc-*Tokens/Komponenten |
| app.js | expliziter lokaler AppPort und Wiederverwendung bestehender Editor-/Publish-/Guestpfade |
| guest-tour-port.mjs | vorhandenen Memoryport zu mehreren QuizIDs erweiterbar halten, LegacyTourvertrag unverändert |
| startup.js | imLoopbackTestmodus DemoController nach echter Appinstallation laden |
| classroom/*.test.mjs | echte Domain/CSV/Repository-Verhaltenstests, keine bloßen Quelltextspiegel |
| tools/classroom-preview/browser-check.mjs | echte lokale Browserclicks,Request/Storagebelege,Desktop/MobileScreenshots |
| workstreams/classroom-student-management-v1.md | bestehende Übergabe,ein Ledger,Quellen,Nachweise,Grenzen |

AppPort: listQuizzes()->Quiz[]; openQuiz(quizId)->Promise<void>; createQuiz({title,subject,grade})->Promise<quizId>; getQuiz(quizId)->Quiz; publishQuiz(quizId)->void; showDashboard()->void. Alle basieren auf bestehendem Appzustand und guestTourRepo, kein Parallelquiz im Controller. Repository: getState(); listClasses(actor,year); listCourses(actor,classId); listStudentTests(studentId,now); assign(actor,{quizId,classId,courseId,startsAt,endsAt,recipientIds}); addRecipient(actor,assignmentId,studentId); canStart(studentId,assignmentId,now); applyImport({kind,headers,rows,mapping,full,schoolId,year}); transferTeachingGrant({grantId,toTeacherId,effectiveAt}); rollover({fromYear,toYear}). PseudonymeIDs sind zufällige interneDemoschlüssel; roheQuellIDs bleiben ausschließlich imRAM-Abgleichindex.

## Task1: Quellen und Erhaltung (Rootschritt1)

- [x] frische mainRegeln, STATE/TODO/Registry, LiveStatus38809750925 lesen; Primary+1/-134 undDraft141 abgleichen.
- [x] isolierten8fCheckout erstellen; fremde dirtyWorktrees,Audio/CrewV3 und Ports nicht verändern.
- [x] fünf bestehende Konzept/HDFDateien mit Quellhead übernehmen, Historie unverändert erhalten;16OctÜbernahme ergänzen.
- [x] Baseline29Tests ausführen; jsdom-Abhängigkeit vorhandenenInstallationspfad nutzen. Existierende Teardown-Konsolenmeldung separat dokumentieren.
- [ ] Plan/HDF/TODO checkpointen und remote sichern. Bei DNSConnector verwenden; unklarer Schreibausgang zuerst abgleichen.

## Task2: Sichere vollständige lokale App (Rootschritt2)

Files: server.mjs,demo-sdk.mjs,startup.js,app.js.
- [ ] RED: Server aufLoopback, keineUploadroute; DemoSDKCallable/DB/Authoperationen werfen; fremderHost/Testflag verweigert. Originalindex/startup/app müssen geliefert werden.
- [ ] GREEN: Server injiziert nur explizitem lokalenTeststart Importmap für exaktFirebase12.4.0-Module vor Modulscript. CSP connect-src self,keinRemoteSDK; AuthState initialnull,keineRemoteSDKinitialisierung.
- [ ] Originalstartup EntryFlow,Tokens,Brand,app undWorkspace laden; AppPort installieren. Keine globaleFetch-Sperre als einziger Schutz.
- [ ] Browserrequests und CSP prüfen: kein fremderOrigin, keineSocket-/Firestore-/Functions-/Telemetryaufrufe. Testmodus sichtbarerHinweis mitReset/Testansicht.

## Task3: Navigation und Klassen (Rootschritte3/4)

- [ ] RED: Klassen/Kurse nur zu eigenen wirksamenGrants; Adminrolle allein keinFachgrant. EinQuiz mit mehrerenZuweisungen bleibt eineID.
- [ ] GREEN: Übersicht/Klassen/Tests in Originalshell; Klassenseite Übersicht/Schüler/Tests. BestehendeToolbar/Editor/Backnavigation weiterverwenden.
- [ ] Fixtures: SchulenNord/Süd,5a/9b/9c,Technik/Englisch/Deutsch,zweiFachlehrer derselben9b,Admin+Stellvertretung ohneAutomatikrechte.
- [ ] Trennung schoolTeacher record,verifiedLoginLink,teachingGrant undclassMembership inRepository sichtbarprüfen.
- [ ] Prüfung node --test classroom/*.test.mjs; BrowserDashboard/ClassTabs; kurzerCommit.

## Task4: DreiCodearten und Testansichten (Rootschritt5)

- [ ] UI erklärt persönlicherZugangscode/Klassencode/Testcode getrennt. Demoansichten enthalten nur markierteTestcodes; keineechtenLoginversprechen.
- [ ] SchülerIdentity ist klassenunabhängig,Alias proMembership; Alias nie HTMLinterpretieren. Testwerkzeug wählt Schüler ohne Authclaim.
- [ ] RED/GREEN: leererSchüler siehtkeinenDraft/keineAssignments; Schul-/Klassenfremder keinedeniedDaten inListen.

## Task5: BrowserCSVImport (Rootschritte6/8)

- [ ] RED: UTF8/BOM,Semikolon/Komma/Tab,quotedSeparator,escapedQuote,quotedNewline,CRLF/Umlaute,führendeNullen,fehlende/duplicateID,kaputteQuotes,ungültigesEncoding,übergroßeDatei mit klarerZeile.
- [ ] GREEN: echter input[type=file],TextDecoder UTF8 fatal,expliziteWindows1252Option,Delimiterwahl. KeineautoUmdeutungvonIDs zuNumber,keineNameFallbacks.
- [ ] Schüler/Teacher/UnterrichtDownloadCSV synthetisch über statischenDownload. Mapping wählt stabileID,Klasse/Jahr bzwTeacher/Fach; Pflichfelder validieren.
- [ ] Vorschau nennt neu/unverändert/Wechsel/Konflikt und relevanteFehlerzeilen; Apply erst explizitnachVorschau; Cancel/Reset verwirftRAM-Rohdaten.
- [ ] Keine Dateiinhalte inURL,Console,Serverrequest,Storage. Browserbeleg Network+Storage mitsynthetischemMarkereintrag undReset.

## Task6: Wiederimport und Jahreswechsel (Rootschritt7)

- [ ] RED: gleicherImport zweimal erzeugtkeineIdentities/Membershipsduplikate; andereSchule gleicherRohID bleibt getrennt; KonflikteblockierenbetroffeneApply.
- [ ] GREEN: matchIndex nurinRAM mitschool/source/kind/rawId-Domäne; vorApplyRevisionprüfen; RohIDsnieautomatischalsstabileASVIDbehaupten.
- [ ] Teilimportentferntniemand. VollimportzeigtfehlendealsPrüfkandidaten,keineMassenlöschung. Wechsel legtneueMembership/anundbeendetaltebewusst; AuditHistoryohneKlarnamen.
- [ ] RollOvervon2026/27nach2027/28 behältIdentityundhistorischeSnapshots,neueJahresklasse+Membership; alteKlasseArchivkontext.
- [ ] HMAC/TresorRecovery/offizielleASV-Exportspalten bleibenZiel/offen, kein eingebauterProduktionsschlüssel.

## Task7: EchterEditor und Zuweisung (Rootschritt9)

- [ ] RED: existingAppPort erstelltQuizID undliefertdieselbeIDnachEdit/Save/Assign. Draft niemalsStudentList,unberechtigterTeacher/anderesFach/SchuleAssignverweigert.
- [ ] GREEN: OriginalopenCreate/openEditor/Save mitguestTourRepository nutzen; KontextKlasse/FachbeimCreate alsMetadatenübernehmen. KeinzweitesEditorformular.
- [ ] ZuweisenundVeröffentlichenDialog zeigtTitel,Klasse/Fach,Zeitraum,expliziteEmpfängerliste. Bestätigen speichertAudienceSnapshoterstvollständig,dannaktiv; AbortkeineZuweisung.
- [ ] ExistingpracticeSolutionPublication imnormalenModus unverändert; Demo assignment istUXVertrag,keinServerpublishnachweis. Testcode/VorlagenkodekeinepersönlicheCredential.

## Task8: Schüleransicht und Zugriff (Rootschritt10)

- [ ] RED: Anstehend vorStart,Jetzt imZeitfenster,Erledigt nachlokalerMarkierung; richtige9bTechnik siehtTest,9c/Südnicht. NeueMembershipnachSnapshotnichtautomatischberechtigt.
- [ ] GREEN: MeineTests mitErklärungbeiLeerzustand. StartprüftaktiveIdentity,Membership,School,Snapshot,ZeitraumundAssignmentzustandjedesMal.
- [ ] Nachzügler nurexplizitesNachtragen. EntfernteMembershipkeinNeustart; existierendeAttempt-/Historie nichtals gelöschtbehaupten.
- [ ] Ergebnisse/Lösungen getrennteFreigabeschalter; keine automatischeLösungsausgabe. KeinezweiteBewertungimplementieren.

## Task9: Lehrkraftwechsel (Rootschritt11)

- [ ] RED:9bEnglisch-TransferabStichtag nimmtaltemTeacherexactGrant,neuerbekommtihn; andereFächerbleiben; privateEntwürfe/HistoricalResultskeinPauschaltransfer.
- [ ] GREEN: ausgewählterGrant+Nachfolger+Stichtag+Vorschau,Bestätigung; lokaleEveryOperationRightsPrüfungbelegbar,keineServerbehauptung.
- [ ] SchülerIdentity/Memberships/Codeshistorie unverändert,Adminbenennung/RecoverybleibenorganisatorischeZielvoraussetzung.

## Task10: Getrennte echte Backendfolgephase — NICHT im ersten Lieferblock (Rootschritt12)

- [ ] offen: lokalesJDK/FirebaseAuth+Functions+FirestoreEmulatorqualifizieren; derzeitJavaStub,keinInstallationsauftrag.
- [ ] offen: neue serververwalteteSchools/Identities/CodeIndex/TeacherGrant/Assignments; deniesfürdirekteReadsWrites,serverseitigeCallablesundProjektionen.
- [ ] offen: assessment-functions/main.js→lib/secure-lifecycle.js bewahren. Info/Start/Resume/Submit/Receipt prüfen aktuelleIdentity,Membership,Snapshot,Grant,Run/Zeitraum. runId ausLiveQuiz,keinenblindClienttrustedRun.
- [ ] offen: persönlicherCodeexchange mitCSPRNG/HMACserversecret/versioniertemIndex,RateLimitvorReads,Revoke/RefreshTokenwiderruf,neutralemFehler. KeineClaimsmitKlasse/Noten.
- [ ] offen: secure-student benannteFirebaseApp erhältbewussteauthentifizierteSchülersitzung,Logout/Accountwechsel löscht inFlight/Quizcredential; gegenwärtigerquizIdlocalStorageKeykeinIdentitätsschutz.
- [ ] offen: Browser→Callable→AuthEmulator→RulesE2E nebenvorhandenen Handler.runTests. ZweiAccounts/Schulen,manipulierteUID/Grant/Run/Score,expired/revokedCodes,parallel/idempotentSubmit,privateLösungen.
- [ ] ErstmitdiesenBelegenBackendintegration/Sicherheitbewerten. LokaleDemoTests ersetzenkeinedieserGates.

## Task11: Akzeptanzmatrix (Rootschritt13)

| Fall | Browseraktion | Erwartete Beobachtung |
|---|---|---|
| CSVApply | Beispieldownload,Dateiauswahl,Mapping,Vorschau,Bestätigen | neuepseudonymeMitglieder,Bestandszahlen,keinRemote |
| Reimport/Teilbestand | gleicheCSVzweimal,kleinereCSVteilimport | keineDuplikate/keineAbgänge |
| ZweiFächer | Technik-/Englischteacherwechseln | gleicheKlasse,erlaubteFächer/Tests,keinAdminAutogrant |
| Draft | echtesEditoröffnenändernspeichern | gleicheID,Schülerleer |
| Assign |9bTechnikAudience+Zeitenbestätigen | passendeSchülerAnstehend/Jetzt,9c/Südleer |
| LateJoin | MitgliednachAssignanlegen | keinAutozugriff,expliziterNachtragändertnurEmpfänger |
| Removed | Mitgliedschaftbeenden,Startwiederholen | abgewiesen |
| Transfer |9bEnglischStichtagwechsel | alterGrantende,anderesFach/Entwürfeerhalten |
| RollOver | neuesJahrerzeugen | gleicheIdentity,neueMembership,Archivunverändert |
| Reset | synthetischenCSVMarkerimportieren,Reset/Reload | RAMgelöscht,StoragekeinCSVMarker,keineNetzwerkübertragung |
| Darstellung | Desktop/Mobile,Keyboard,DE/EN | Originalassets/tokens,Focus/Dialogsbedienbar,keinefalschenAuthtexte |
| Erhaltung | gc39StagingScreenshot+lokalerOriginalstart | Logo,Crew,Startscreen/OriginalEditorerhalten,keinStandaloneMock |

Authorbrowser,unabhängigerReview,menschlicherNutzertestundphysischerGerätetestwerdengetrenntbelegt. Übersetzungsgrenzenoffennennen; keineautomatischevolleEN-Abnahme.

## Task12: Sicherung und Übergabe (Rootschritt14)

- [ ] SinnvolleZwischencommits nachBoundary/DomainCSV/UI. PushvorlangenTests; GitDNSFehlernichtmitSecretsprobesumgehen,ConnectorTrees/Commit/RefalsFallbackmitexakterParentprüfung.
- [ ] TODOfrischmainlesenundnurGC-CLASSROOM-ZeileimBranchfortführen. Statebleibtbranch_only; RegistrykeineSHA-Duplikation,Integrationszielunverändert.
- [ ] NachTestsfixiertenSHAanclassroom_contract_review/Rootübergeben; unabhängigeFindingsprüfen,gezielteRED→GREENFixes.
- [ ] FinaleURL127.0.0.1:8782,synthetischeCSVDownloads,kurzerKlickpfad,Code/CI/Deploy/Gerätetestgetrennt. KeinPRMerge/StagingDeploy.

## Planprüfung

Alle14Rootschritte sindobenTaskszugeordnet;EmulatoristbewusstoffeneFolgephase. GemeinsameSchnittstellen: AppPortliefertQuizID→AssignmentSnapshotreferenziertID→SchülerlisteprüftSnapshot+Membership; CSVliefertnormalisierteTextzeilen→Repositoryimportvergleichtschool/source/rawId→RollOverbehältIdentity. KeineNamezuIDFallbacks,keineProduktkeys,keineautorisierendenUIClaims. KleineImplementierungsdetailsentscheidetalleinigerWriter mitbegründetemEintraginderbestehendenÜbergabe.
