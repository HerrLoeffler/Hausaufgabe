# GC-CLASSROOM-01 Implementation Plan

## Präzisierung: echter Lehreraccount und vorhandene Tests — 18. Oktober 2026

Der normale lokale Einstieg muss den bestehenden Firebase-SDK, Login, Account, Testbestand und alle bisherigen Testaktionen verwenden. Eine lokale Beispielanmeldung erfüllt diesen Auftrag nicht.

- Der Server liefert unter `/` die vollständige App mit ihrer unveränderten bestehenden Testbackend-Konfiguration (`hausaufgabe-staging`). Er injiziert dort weder Demo-SDK noch Classroom-Previewflag. Die Webadresse bleibt lokal; kein Hosting-/Rules-/Functionsdeploy.
- Die bisherige synthetische Probe bleibt ausschließlich als ausdrücklich getrennte Datei `/classroom-demo.html` verfügbar. Ihre SDK-Sperre bleibt erhalten. Sie wird nicht als Anmeldung mit dem echten Lehreraccount dargestellt.
- Ein kleiner Account-Workspace-Port gibt ausschließlich angemeldete Accountmetadaten, vorhandene Testmetadaten und bestehende Navigationsaktionen an eine additive Seitennavigation weiter. Keine künstliche Sitzung, kein zweiter Testbestand, keine Interception von Erstellung, Speichern, Veröffentlichen oder Einstellungen.
- Die linke Navigation erscheint nur nach echter Anmeldung. „Meine Tests“ öffnet weiterhin den bisherigen Dashboardpfad. „Klassen“ gruppiert die vorhandenen Tests nach ihren bereits gespeicherten Klassenangaben und öffnet denselben Editor/dieselbe Auswertung. Diese Gruppierung ist noch kein verifizierter schulischer Mitgliederbestand.
- „Schüler:innen“ erhält einen ehrlichen Leerzustand, solange noch keine echte schulische Mitglieder-/Identitätsanbindung implementiert ist. Keine erfundenen Beispielpersonen im echten Account, keine Ableitung von Personen aus Leistungsdaten, keine improvisierte Speicherung in Userprofilen oder Testdokumenten.
- Beim Accountwechsel/Abmelden verschwinden Accountdaten aus den Zusatzansichten. Die Originalanmeldung wird im Browser mit echtem SDK geprüft; die erfolgreiche Anmeldung und tatsächliche vorhandene Tests müssen vom Nutzer selbst bestätigt werden, da der Agent keine Zugangsdaten benötigt.
- Prüfungen: Serverauslieferung trennt verbundenen Accountbetrieb von isolierter Probe; Authform/ursprüngliche Dashboardknoten bleiben unverändert; Sidebar erst nach echter Sitzung; Klassen aus echten Testmetadaten; Accountwechsel entfernt alte Daten; Original-Auth-/Publishregressionen bleiben grün.

## Verbindliche Bedienkorrektur vom 18. Oktober 2026

Martin lehnt die sofortige Classroom-Demoübersicht ab. Die vollständige Website ist der Einstieg, nicht ein hinter einem Testwerkzeug versteckter Zusatz.

1. Beim Öffnen der lokalen Adresse bleibt die originale GradeCrew-Startseite mit Crew, Animation, Testcode und Anmelden sichtbar. Keine automatische Lehrkraftauswahl oder Weiterleitung in Classroom.
2. Die originale Anmeldeseite bleibt erreichbar. Eine ausdrücklich lokale Testanmeldung öffnet eine RAM-Sitzung mit synthetischer Lehrkraft; echte Firebase-Anmeldung bleibt eine getrennte Backendaufgabe. Die Testanmeldung braucht keine echten Zugangsdaten.
3. Nach Anmeldung startet der originale Bereich „Meine Tests“ mit bestehender Suche, Filtern, Erstellen, Editor und Einstellungen. Die Benutzerleiste einschließlich Abmelden bleibt sichtbar.
4. Eine linke Navigation ergänzt „Meine Tests“, „Klassen“, „Schüler:innen“ und die optionale Übersicht. Klassen- und Schülerlisten nutzen dieselben vorhandenen Zuständigkeitsprüfungen. Editor und Erstellungsansicht bleiben innerhalb dieser Hülle.
5. Persönlicher Schülerzugang ist ein eigener Einstieg neben dem spontanen Testcode. Die lokale Probe erklärt ihre Beispielcodes; nach Anmeldung zeigt sie nur die persönlichen Zuweisungen.
6. Die große Rollen-Testleiste entfällt aus dem normalen Ablauf. Erweiterte Testoptionen sind eingeklappt in der Navigation erreichbar. Abmelden führt zur vollständigen ursprünglichen Startseite; Neuladen beginnt ebenfalls dort.
7. Neue Regressionen prüfen den öffentlichen Einstieg, lokale Anmeldung, originales Testdashboard, linke Navigation, Schülerliste und Abmelden. Die bestehende CSV-/Zuweisungslogik bleibt erhalten. Browserprüfung lokal auf Port 8782; kein Stagingaufruf oder Deployment.

Die früheren grünen Funktionsnachweise belegen diese Bedienanforderung nicht. Diese Korrektur erhält eigene Nachweise und bleibt bis dahin offen.

> For agentic workers: use superpowers:executing-plans. Ein Writer im isolierten Checkout; unabhängiger Review an fixiertem SHA. Dieser einzige Umsetzungsplan konkretisiert die 14 am16.10.2026 von der Zentrale veröffentlichten Schritte. Historische Implementierungsverbote im Konzept gelten für die damaligen Aufträge und sind für diesen ausdrücklich autorisierten lokalen Lieferblock abgelöst.

**Goal:** In der vollständigen aktuellen GradeCrew-App Klassen, lokale ASV-Beispielimporte und explizite Testzuweisungen mit persönlichen Schüleransichten erproben.

**Architecture:** Originale index.html/startup.js/app.js, bestehende Tokens, Assets, Editor und Übungsport bleiben maßgeblich. Ein ausschließlich expliziter lokaler Testserver setzt vor Modulinitialisierung eine Importmap auf einen blockierenden Demo-SDK-Adapter und eine restriktive CSP. Neue fachliche Daten leben nur im RAM; die bestehende App bekommt einen kleinen Port für Navigation und echte Editor-Test-IDs. Kein zweiter Editor oder Bewertungsserver.

**Tech Stack:** Vorhandenes Browser-ESM, CSS, Node24 TestRunner/HTTP, vorhandenes jsdom/Playwright; keine neuen Produktabhängigkeiten.

**Spec:** ../CLASSROOM_TEACHER_UX_V1.md hat Vorrang vor älteren Navigationsteilen in ../CLASSROOM_STUDENT_MASTERPROJECT_V1.md. Identität/ASV: ../privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md und CLASSROOM_ASV_IMPORT_PRIVACY.md, Quellstand 9b23052e7bb3a8e6009cca64a7498d942cd7bc1d. Nutzerauftrag16.10 ergänzt und autorisiert lokale Umsetzung, keinen Deploy.

## Global Constraints

- Base8f8697901f8c1aea89897be855ca2872c82d0f2b / gc39, Stage canonical hausaufgabe-staging.web.app. Alter Standalone-Mock17fc427 ist historische Evidenz, keine Codebasis.
- Eigener Branch feature/classroom-integrated-preview-20261016. Ports8779/8780/8781 fremd; eigener Port8782 nur127.0.0.1.
- Vollständige Original-App laden; bestehende Homepage, Animation,29CrewPNGs, Coco,Remy,Mülleimer,ET,Upload10,Audio,Lösungsfreigabe erhalten. Keine fremden Branches cherry-picken.
- Im Testmodus keine Remote-Authentifizierung,Firestore,Storage,Functions,AI,Analytics; keine echten Schülerdaten. Wechsel der UI-Testansicht ist Wechsel der Testansicht, keine Anmeldung/Autorisierung.
- CSV-Rohdateien, Namen und Rohkennungen nurBrowser-Arbeitsspeicher. Kein localStorage/IndexedDB/Log/URL/Server/AI/Analytics. Nur synthetische herunterladbare Beispiele; tatsächliches ASV-Schema unbekannt.
- schulbezogenes HMAC mit schulischem Schlüssel, Recovery und Codeexchange sind Zielarchitektur, nicht durch fest eingebauten Demoschlüssel simuliert.
- Kein Merge, Deployment oder Productionzugriff, kein echter Mail-/Provider-/Accountaufruf, keine JDK-Installation. Release bleibt branch_only.
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
| classroom/controller.mjs | Original-App-Navigation,Klassenansichten,Importdialog,Zuweisungsdialog,MeineTests/Testwerkzeug |
| classroom/classroom.css | nur neue Klassenlayoutregeln auf bestehenden --gc-*Tokens/Komponenten |
| app.js | expliziter lokaler App-Port und Wiederverwendung bestehender Editor-/Publish-/Guestpfade |
| guest-tour-port.mjs | vorhandenen Memoryport zu mehreren QuizIDs erweiterbar halten, LegacyTourvertrag unverändert |
| startup.js | imLoopbackTestmodus DemoController nach echter Appinstallation laden |
| classroom/*.test.mjs | echte Domain/CSV/Repository-Verhaltenstests, keine bloßen Quelltextspiegel |
| tools/classroom-preview/browser-check.mjs | echte lokale Browserclicks,Request/Storagebelege,Desktop/MobileScreenshots |
| workstreams/classroom-student-management-v1.md | bestehende Übergabe,ein Ledger,Quellen,Nachweise,Grenzen |

App-Port: listQuizzes()->Quiz[]; openQuiz(quizId)->Promise<void>; createQuiz({title,subject,grade})->Promise<quizId>; getQuiz(quizId)->Quiz; publishQuiz(quizId)->void; showDashboard()->void. Alle basieren auf bestehendem Appzustand und guestTourRepo, kein Parallelquiz im Controller. Repository: getState(); listClasses(actor,year); listCourses(actor,classId); listStudentTests(studentId,now); assign(actor,{quizId,classId,courseId,startsAt,endsAt,recipientIds}); addRecipient(actor,assignmentId,studentId); canStart(studentId,assignmentId,now); applyImport({kind,headers,rows,mapping,full,schoolId,year}); transferTeachingGrant({grantId,toTeacherId,effectiveAt}); rollover({fromYear,toYear}). PseudonymeIDs sind zufällige interneDemoschlüssel; roheQuellkennungen bleiben ausschließlich imRAM-Abgleichindex.


## Verbindliche Präzisierungen nach Quellen- und Vertragsprüfung

Der am 16. Oktober beschriebene Schülerexport wird ausschließlich seiner Struktur nach berücksichtigt. Das synthetische Prüfprofil hat zehn durch Pipe-Zeichen getrennte Spalten und keine Kopfzeile. Die erste Datenzeile bleibt erhalten. Die Zuordnung lautet im Beispielprofil: Spalte 1 Schulkennung, Spalte 2 mögliche Personenkennung, Spalte 3 Nachname, Spalte 4 Vorname, Spalte 8 Klasse. Die übrigen Spalten bleiben unbekannt oder werden nicht benötigt und deshalb nicht übernommen. Aus der Form der zweiten Spalte folgt kein Beleg für ein stabiles ASV-Differenzierungsmerkmal. Namen und reale Kennungen werden weder in Plan, Repository noch Nachweis kopiert.

Die Importoberfläche bietet vor dem Parsen die Einstellung „Datei hat eine Kopfzeile“. Für das zehnspaltige Pipeprofil wird sie ausgeschaltet und das Trennzeichen ausdrücklich auf Pipe gesetzt. Jeder Datensatz muss seine eigenen Zeilenumbrüche besitzen. Zusammengefügte Chatzeilen werden nicht anhand von Leerzeichen rekonstruiert: Mehrwortnamen machen diese Methode unzuverlässig. Leere Felder und zusätzliche Spalten bleiben im Parser erhalten; nur ausdrücklich zugeordnete benötigte Felder gelangen in den lokalen Importplan. Die Beispiele sind vollständig erfunden und enthalten Umlaute, Mehrwortnamen und führende Nullen.

Alle administrativen Mutationen erhalten die aktuell gewählte Identität ausdrücklich als ersten Parameter. Die maßgeblichen Schnittstellen sind `applyImport(actorId, preview)`, `transferTeachingGrant(actorId, transfer)` und `rollover(actorId, schoolYear)`. Die Prüfung verlangt ein verifiziertes Verwaltungskonto derselben Schule. Verwaltungsrechte in Schule Nord erlauben keine Änderungen in Schule Süd. Eine fachliche Lehrkraftzuständigkeit allein genügt nicht. Diese Bedingungen sind lokale Vertragsprüfungen und werden nicht als nachgewiesene Serversicherheit bezeichnet.

Ein Importplan trägt die Revision, aus der seine Vorschau entstanden ist. Hat sich der Bestand danach verändert, wird die Übernahme abgewiesen und eine neue Vorschau verlangt. Die Übernahme ist eine atomare Transaktion im Arbeitsspeicher: scheitert beispielsweise die zweite Unterrichtszeile an einer fehlenden Lehrkraft, werden auch Änderungen aus der ersten Zeile zurückgenommen. Es gibt keine stille Teilübernahme. Ein abweichender Teilplan müsste zuerst ausdrücklich angezeigt und bestätigt werden.

Die Wiedererkennung einer Person ist schul- und quellbezogen. Der Jahreskontext gehört zusätzlich zur Mitgliedschaft. Derselbe synthetische Personenbezug und dasselbe Klassenlabel in einem neuen Schuljahr behalten deshalb dieselbe Identität, erzeugen aber eine neue Jahresmitgliedschaft. Ein Schuljahreswechsel der Verwaltung Nord verändert weder Klassen noch Mitgliedschaften der Schule Süd. Bereits veröffentlichte Empfängersnapshots und historische Testzuweisungen bleiben unverändert.

Die Schülerprojektion enthält ausschließlich die für „Meine Tests“ benötigten eigenen Felder: Zuweisungs-ID, Test-ID, Klassenkontext, Zeitraum, Status sowie getrennte Ergebnis- und Lösungsfreigaben. Testmetadaten beschränken sich auf Titel und Fach. Die vollständige Empfängerliste, fremde Schüler- und Mitgliedschaftskennungen, fremde Aliase und private Autorenfelder werden nicht ausgegeben.

Die Standard-Testansicht „Toni · Technik“ besitzt ausschließlich die Fachzuständigkeit 9b/Technik. „Kim · Englisch“ besitzt ausschließlich 9b/Englisch. Weitere Beispielklassen verwenden eine getrennte, ausdrücklich benannte Lehrkraft. So bleiben der positive Zuweisungsfall und der negative Fall zwischen zwei Fachlehrkräften für Martin leicht überprüfbar.

Der bestehende GradeCrew-Ablauf bleibt auch beim Erstellen neuer Tests erhalten: Klasse und Fach auswählen, die vorhandene Erstellungsansicht öffnen, „Manuell erstellen“ wählen, im vorhandenen Editor eine Aufgabe anlegen, speichern und anschließend ausdrücklich zuweisen. Die neu erzeugte Test-ID muss in Editor, Zuweisung und Schüleransicht identisch bleiben. KI-Schaltflächen erklären im lokalen Modus ihre Sperre und starten keinen Provideraufruf. Ein bereits vorhandenes QTECH-Beispiel allein genügt nicht als Nachweis dieses neuen Erstellungsablaufs.

Die lokale Vorschau enthält die bestehenden Startseiten-, Editor-, Navigations-, Crew- und Designquellen aus gc39. Ein Quellvergleich allein belegt keine identische Darstellung. Deshalb werden zusätzlich die tatsächlich geladene lokale Startseite und der tatsächliche Editor aufgenommen und mit einer anonymen, nur lesend geöffneten kanonischen Staging-Startseite verglichen. Eine durch Anmeldung bedingte Abwesenheit von Coco oder Administration wird als Grenze benannt; es werden keine echten Konten für diesen Vergleich verwendet.

Die UI-Sprachauswahl Deutsch/Englisch wird mit der vorhandenen GradeCrew-Übersetzungsinfrastruktur verwendet. Der neue Katalog deckt die Grundnavigation und zentrale Dialogtexte ab. Fachliche Testinhalte und synthetische Aliase werden nicht durch die UI-Sprache umgeschrieben. Ein begrenzter Englisch-Smoke ist kein Beleg für eine vollständige sprachliche Abnahme aller Fehler- und Sonderzustände.

## Task1: Quellen und Erhaltung (Root-Schritt 1)

- [x] frische mainRegeln, STATE/TODO/Registry, Live Development Status 38809750925 lesen; Primary+1/-134 undDraft141 abgleichen.
- [x] isolierten8fCheckout erstellen; fremde dirtyWorktrees,Audio/CrewV3 und Ports nicht verändern.
- [x] fünf bestehende Konzept/HDFDateien mit Quellstand  übernehmen, Historie unverändert erhalten;16OctÜbernahme ergänzen.
- [x] Baseline29Tests ausführen; jsdom-Abhängigkeit vorhandenenInstallationspfad nutzen. Existierende Teardown-Konsolenmeldung separat dokumentieren.
- [ ] Plan/HDF/TODO checkpointen und remote sichern. Bei DNSConnector verwenden; unklarer Schreibausgang zuerst abgleichen.

## Task2: Sichere vollständige lokale App (Root-Schritt 2)

Files: server.mjs,demo-sdk.mjs,startup.js,app.js.
- [ ] RED: Server aufLoopback, keineUploadroute; DemoSDKCallable/DB/Authoperationen werfen; fremderHost/Testflag verweigert. Original-index.html/startup/app müssen geliefert werden.
- [ ] GREEN: Server injiziert nur explizitem lokalenTeststart Importmap für exaktFirebase12.4.0-Module vor Modulscript. CSP connect-src self,keinRemote-SDK; AuthState initialnull,keineRemote-SDKinitialisierung.
- [ ] Originalstartup EntryFlow,Tokens,Brand,app undWorkspace laden; App-Port installieren. Keine globaleFetch-Sperre als einziger Schutz.
- [ ] Browseranfragen und CSP prüfen: kein fremderOrigin, keineSocket-/Firestore-/Functions-/Telemetryaufrufe. Testmodus sichtbarerHinweis mitReset/Testansicht.

## Task3: Navigation und Klassen (Root-Schritt e3/4)

- [ ] RED: Klassen/Kurse nur zu eigenen wirksamenGrants; Adminrolle allein keinFachgrant. EinQuiz mit mehrerenZuweisungen bleibt eineID.
- [ ] GREEN: Übersicht/Klassen/Tests in Originalshell; Klassenseite Übersicht/Schüler/Tests. BestehendeToolbar/Editor/Backnavigation weiterverwenden.
- [ ] Fixtures: SchulenNord/Süd,5a/9b/9c,Technik/Englisch/Deutsch,zweiFachlehrer derselben9b,Admin+Stellvertretung ohneAutomatikrechte.
- [ ] Trennung schoolTeacher record,verifiedLoginLink,teachingGrant undclassMembership inRepository sichtbarprüfen.
- [ ] Prüfung node --test classroom/*.test.mjs; BrowserDashboard/ClassTabs; kurzerCommit.

## Task4: DreiCodearten und Testansichten (Root-Schritt 5)

- [ ] UI erklärt persönlicherZugangscode/Klassencode/Testcode getrennt. Demoansichten enthalten nur markierteTestcodes; keineechtenLoginversprechen.
- [ ] SchülerIdentity ist klassenunabhängig,Alias proMembership; Alias nie HTMLinterpretieren. Testwerkzeug wählt Schüler ohne Authclaim.
- [ ] RED/GREEN: leererSchüler siehtkeinenDraft/keineAssignments; Schul-/Klassenfremder keinedeniedDaten inListen.

## Task5: BrowserCSVImport (Root-Schritt e6/8)

- [ ] RED: UTF8/BOM,Semikolon/Komma/Tab,quotedSeparator,escapedQuote,quotedNewline,CRLF/Umlaute,führendeNullen,fehlende/duplicateID,kaputteQuotes,ungültigesEncoding,übergroßeDatei mit klarerZeile.
- [ ] GREEN: echter input[type=file],TextDecoder UTF8 fatal,expliziteWindows1252Option,Delimiterwahl. KeineautoUmdeutungvonIDs zuNumber,keineNameFallbacks.
- [ ] Schüler/Teacher/UnterrichtDownloadCSV synthetisch über statischenDownload. Mapping wählt stabileID,Klasse/Jahr bzwTeacher/Fach; Pflichfelder validieren.
- [ ] Vorschau nennt neu/unverändert/Wechsel/Konflikt und relevanteFehlerzeilen; Apply erst explizitnachVorschau; Cancel/Reset verwirftRAM-Rohdaten.
- [ ] Keine Dateiinhalte inURL,Console,Serverrequest,Storage. Browserbeleg Network+Storage mitsynthetischemMarkereintrag undReset.

## Task6: Wiederimport und Jahreswechsel (Root-Schritt 7)

- [ ] RED: gleicherImport zweimal erzeugtkeineIdentities/Membershipsduplikate; andereSchule gleicherRohID bleibt getrennt; KonflikteblockierenbetroffeneApply.
- [ ] GREEN: matchIndex nurinRAM mitschool/source/kind/rawId-Domäne; vorApplyRevisionprüfen; RohIDsnieautomatischalsstabileASVIDbehaupten.
- [ ] Teilimportentferntniemand. VollimportzeigtfehlendealsPrüfkandidaten,keineMassenlöschung. Wechsel legtneueMembership/anundbeendetaltebewusst; AuditHistoryohneKlarnamen.
- [ ] RollOvervon2026/27nach2027/28 behältIdentityundhistorischeSnapshots,neueJahresklasse+Membership; alteKlasseArchivkontext.
- [ ] HMAC/TresorRecovery/offizielleASV-Exportspalten bleibenZiel/offen, kein eingebauterProduktionsschlüssel.

## Task7: EchterEditor und Zuweisung (Root-Schritt 9)

- [ ] RED: existingApp-Port erstelltQuizID undliefertdieselbeIDnachEdit/Save/Assign. Draft niemalsStudentList,unberechtigterTeacher/anderesFach/SchuleAssignverweigert.
- [ ] GREEN: OriginalopenCreate/openEditor/Save mitguestTourRepository nutzen; KontextKlasse/FachbeimCreate alsMetadatenübernehmen. KeinzweitesEditorformular.
- [ ] ZuweisenundVeröffentlichenDialog zeigtTitel,Klasse/Fach,Zeitraum,expliziteEmpfängerliste. Bestätigen speichertAudienceSnapshoterstvollständig,dannaktiv; AbortkeineZuweisung.
- [ ] ExistingpracticeSolutionPublication imnormalenModus unverändert; Demo assignment istUXVertrag,keinServerpublishnachweis. Testcode/VorlagenkodekeinepersönlicheCredential.

## Task8: Schüleransicht und Zugriff (Root-Schritt 10)

- [ ] RED: Anstehend vorStart,Jetzt imZeitfenster,Erledigt nachlokalerMarkierung; richtige9bTechnik siehtTest,9c/Südnicht. NeueMembershipnachSnapshotnichtautomatischberechtigt.
- [ ] GREEN: MeineTests mitErklärungbeiLeerzustand. StartprüftaktiveIdentity,Membership,School,Snapshot,ZeitraumundAssignmentzustandjedesMal.
- [ ] Nachzügler nurexplizitesNachtragen. EntfernteMembershipkeinNeustart; existierendeAttempt-/Historie nichtals gelöschtbehaupten.
- [ ] Ergebnisse/Lösungen getrennteFreigabeschalter; keine automatischeLösungsausgabe. KeinezweiteBewertungimplementieren.

## Task9: Lehrkraftwechsel (Root-Schritt 11)

- [ ] RED:9bEnglisch-TransferabStichtag nimmtaltemTeacherexactGrant,neuerbekommtihn; andereFächerbleiben; privateEntwürfe/HistoricalResultskeinPauschaltransfer.
- [ ] GREEN: ausgewählterGrant+Nachfolger+Stichtag+Vorschau,Bestätigung; lokaleEveryOperationRightsPrüfungbelegbar,keineServerbehauptung.
- [ ] SchülerIdentity/Memberships/Codeshistorie unverändert,Adminbenennung/RecoverybleibenorganisatorischeZielvoraussetzung.

## Task10: Getrennte echte Backendfolgephase — NICHT im ersten Lieferblock (Root-Schritt 12)

- [ ] offen: lokalesJDK/FirebaseAuth+Functions+Firestore-Emulatorqualifizieren; derzeitJavaStub,keinInstallationsauftrag.
- [ ] offen: neue serververwalteteSchools/Identities/CodeIndex/TeacherGrant/Assignments; deniesfürdirekteReadsWrites,serverseitigeCallablesundProjektionen.
- [ ] offen: assessment-functions/main.js→lib/secure-lifecycle.js bewahren. Info/Start/Resume/Submit/Receipt prüfen aktuelleIdentity,Membership,Snapshot,Grant,Run/Zeitraum. runId ausLiveQuiz,keinenblindClienttrustedRun.
- [ ] offen: persönlicherCodeexchange mitCSPRNG/HMACserversecret/versioniertemIndex,RateLimitvorReads,Revoke/RefreshTokenwiderruf,neutralemFehler. KeineClaimsmitKlasse/Noten.
- [ ] offen: secure-student benannteFirebaseApp erhältbewussteauthentifizierteSchülersitzung,Logout/Accountwechsel löscht inFlight/Quizcredential; gegenwärtigerquizIdlocalStorageKeykeinIdentitätsschutz.
- [ ] offen: Browser→Callable→Auth-Emulator→RulesE2E nebenvorhandenen Handler.runTests. ZweiAccounts/Schulen,manipulierteUID/Grant/Run/Score,expired/revokedCodes,parallel/idempotentSubmit,privateLösungen.
- [ ] ErstmitdiesenBelegenBackendintegration/Sicherheitbewerten. LokaleDemoTests ersetzenkeinedieserGates.

## Task11: Akzeptanzmatrix (Root-Schritt 13)

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

## Task12: Sicherung und Übergabe (Root-Schritt 14)

- [ ] SinnvolleZwischencommits nachBoundary/DomainCSV/UI. PushvorlangenTests; GitDNSFehlernichtmitSecretsprobesumgehen,ConnectorTrees/Commit/RefalsFallbackmitexakterParentprüfung.
- [ ] TODOfrischmainlesenundnurGC-CLASSROOM-ZeileimBranchfortführen. Statebleibtbranch_only; RegistrykeineSHA-Duplikation,Integrationszielunverändert.
- [ ] NachTestsfixiertenSHAanclassroom_contract_review/Rootübergeben; unabhängigeFindingsprüfen,gezielteRED→GREENFixes.
- [ ] FinaleURL127.0.0.1:8782,synthetischeCSVDownloads,kurzerKlickpfad,Code/CI/Deploy/Gerätetestgetrennt. KeinPRMerge/StagingDeploy.

## Planprüfung

Alle14Root-Schritt e sindobenTaskszugeordnet;EmulatoristbewusstoffeneFolgephase. GemeinsameSchnittstellen: App-PortliefertQuizID→AssignmentSnapshotreferenziertID→SchülerlisteprüftSnapshot+Membership; CSVliefertnormalisierteTextzeilen→Repositoryimportvergleichtschool/source/rawId→RollOverbehältIdentity. KeineNamezuIDFallbacks,keineProduktkeys,keineautorisierendenUIClaims. KleineImplementierungsdetailsentscheidetalleinigerWriter mitbegründetemEintraginderbestehendenÜbergabe.


## Ausführungsabschluss des ersten Lieferblocks

Am16.10.2026 wurde der lokale Lieferblock aus den Schritten1–11 und14 umgesetzt und geprüft; die ausdrücklich getrennte Backendfolgephase in Schritt12 bleibt offen. Der finale Produktkandidat ist0d99b33c7752563d7aa5e72768893c55ad4a464f. Die vorhandene App lädt tatsächlich ihre ursprünglichen Startup-, Editor-, Design- und Crew-Quellen. Der neue manuelle Testablauf erzeugt eine neue ID, die nach Speichern und ausdrücklicher Zuweisung unverändert in der persönlichen Testliste steht. Der Parser übernimmt ausschließlich lokal ausgewählte synthetische Dateien. Ein geänderter Unterrichtsbezug mit derselben Quellkennung ist ein sichtbarer, blockierender Konflikt.

Autorbelege:18Browserfälle,44gezielteRegressionsprüfungen,329Root-Prüfungen und erfolgreicher Build mit171Dateien. Unabhängiger Endreview PASS am Produktkandidaten, einschließlich44eigenenTests und vier gezielten Importfällen. Das sind Nachweise für diesen lokalen Lieferblock. Echte Authentifizierung, Serverrechte, reale ASV-Stabilität, schulischer Schlüsselbetrieb, physische Geräte, Deployment und Production wurden damit nicht bestätigt. Die vollständigen Belege, zeitliche Bindung und Grenzen stehen in der bestehenden Workstream-Übergabe und in evidence/20261016-browser-report.json sowie evidence/20261016-independent-review.json.
