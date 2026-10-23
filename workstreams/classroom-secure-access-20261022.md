# GC-CLASSROOM-01 · Secure 2026 Testkandidat

Owner: ausführender Classroom-Chat mit Martin; Chatlink unbekannt. Runtime Modell/Aufwand unknown. Bestehende Task-/Versuchs-/Budgethistorie unverändert.

## Stand 22.10.2026

Eigener isolierter Branch feature/classroom-secure-access-20261022 auf nativer Integration b9edcd6. Kein Schreiben im fremden iPhone-Checkout. Webzweig feature/classroom-integrated-preview-20261016 bleibt getrennt.

Gesichert: Wartender Secure-Client fragt monoton jede Sekunde, aktiv alle fünf Sekunden, ohne Burst nach Sleep; klarer Wartetext. 29 Swift-Tests bestanden, regulärer unsigned Live-Simulatorbuild bestanden. Voriger Codecheckpoint lokal 0d207ec / remote 523a95ae, identischer Tree d5521844.

Neues Release-Delta: explizite manuelle Workflowauswahl staging2026 wählt ausschließlich SecureStaging / GradeCrew Secure Staging / staging-exam / gradecrew-staging-2026. Bestehende automatische Pushes bleiben Live; manuelle unbekannte Ziele brechen ab. Alle Layout-, Renderer-, Signierungs- und AAC-/Profilgates bleiben vorgeschaltet. Keine Integration in nativen Releasebranch, um unbeabsichtigten Live-Upload zu vermeiden. Sichtbare TESTUMGEBUNG 2026 nur im Stagingbuild. Gleiche Bundleidentität: TestFlight-Testbuild ersetzt bestehende Secure-Installation, keine zweite isolierte App behaupten.

Prüfungen: Releasewahl zuerst fehlendes Modul RED, danach vollständige Python-Skriptsuite 23/23 PASS (/private/tmp/gc-2026-release-tests.log). Staging-Simulatorbuild zunächst sandboxbedingt Swift-Macro-/Simulatordienstfehler; mit freigegebenem Xcode-Dienstzugriff BUILD SUCCEEDED (/private/tmp/gc-classroom-staging-build-approved.log). Enger unabhängiger Release-Review ohne P1/P2; eigener Releasewahltest und diff-check bestanden. Kein TestFlight-Upload aus diesen lokalen Nachweisen ableiten.

## Tatsächlicher Internetbeleg

User erlaubt beliebiges fiktives Testkonto. Über unveränderte 2026-Weboberfläche Test SYSTEMTEST · Secure 2026 · Gemeinsamer Start veröffentlicht, Code Z4VM7PVQ, SingleChoice 2+2. Originaler nativer SecureAssessmentAPI-Client mit GRADECREW_STAGING: TEST01 startete ready, kein Paper vor Lehrkraftstart; Lehrerstart über echte Weboberfläche; Resume erhielt eine Aufgabe, Submit bestätigten Receipt mit gleicher Attempt-/Submission-ID und status graded. Lehrkraftergebnis sichtbar TEST01 1/1,100%,Note1,Bewertet, Abgabe 22.10.2026 22:37:05. Nur synthetische Daten; keine Secrets gespeichert. Dieser Test ist bereits gestartet und abgegeben.

Grenzen: API-Server-Lehrerfluss belegt, kein physischer iPad-AAC-Test und keine persönliche Classroom-Identity-/Assignmentbindung. Letztere Implementierung bleibt beauftragt/offen. School-Live, Website, Functions und Rules aus diesem Native-Delta unverändert. Relevant SEC06/07/08/14/17 und PRIV07/08/12/13/17/20, keine Gesamtfreigabe.

## Nächster Schritt / externe Vorgänge

Checkpoint lokal152ddae / remote874b8f99, gleicherTree1b40da97. GitHub-2FA vonMartin selbst abgeschlossen. Manueller Start ist inUI nicht verfügbar, daWorkflow aufmain fehlt (Connector404); keinMain-/Native-Livemerge als Umgehung. Ruling: ausschließlich eigenen2026Branch zusätzlich imPushtrigger zulassen; exakte eigeneRef→2026, bestehende nativeLiveRef→Live, alle anderenPushrefs failclosed. Keine Änderung der Gates/Signing/Profilrechte. RED neuer Refparameter fehlt, danach24/24Python PASS (/private/tmp/gc-2026-release-tests-branch.log). Nächster eigener Codepush soll genau einen vollständigen2026TestFlightlauf starten. Noch nicht gestartet. Enger unabhängiger Nachreview beauftragt. Run-ID nach tatsächlichem Start hier nachtragen. Vor Upload/Veröffentlichung keine Erfolgsaussage. Nach Build/Appleverarbeitung frischen wartenden Test für realen iPad-Ablauf bereitstellen.


## Externer Lauf tatsächlich gestartet

22.10.2026 20:43UTC: Remote ec17ac5897657380f36cc4f72cfe717e0724ff4d (lokal92ddf9e), gleicherTree6e0dfcf2. Genau ein Pushlauf39851303382, Versuch1, https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39851303382 . Beobachtet: Layout-native/Phone und beideWebjobs gestartet, build-and-upload wartet aufGates. ErwarteterBuild1.0(1181), nochkeinUpload/Processing/Gerätetest. Nachreview ohneP1/P2, unabhängig2ZielwahltestsPASS. Hinweis: jeder spätere passendeProduktcodepushaufdieserBranch löstweiterenBuildaus; reineWorkstreamdokumentationaußerhalbPfadfilterlöstdiesennichtaus. KeineblindenNeuversuche.


## Persönlicher Zugang implementiert · 22.10.2026

UserkorrigiertFokusausdrücklich: alterGastcodeablaufwarbereitsvorhanden. NeuefreigegebeneLieferketteistpersönlicherSchülercode→eigeneTestliste→Klassenzuweisung→SecureohnefreiesKürzel→Erledigt/Lehrkraftreceipt; dazuTeacherteilnehmermonitor/Neuversuchsfreigabe. Alter1181LaufwarUmgebung/WarteraumundkeinFeaturebeleg.

NativeErweiterungGRADECREW_STAGING-only: zusätzlicherSchülerzugang/MeineTests, persönlicheSessionimseparatenThisDeviceOnlyKeychainohneRohcode, Shared/Personalwahl, getrennteAbmeldung,serverseitigezugewieseneTestlisteausclassroomAccess, AuswahlübergibtverifizierteAssignmentGeneration/SessionandenbestehendenCoordinator. KeinSecretimgradecrew-secure://studentURLschema,nichtinLiveInfo. OptionaleCodableBindungundStartrequestmarkerimvorhandenenAttemptKeychain,alteDatensätzeweiterdecodierbar; AAC/Abgabepersistenz/Receiptpfadbeibehalten.

UnabhängigerReviewonline_classroom_review3P2: (1)ausgewähltePersonnachLogoutstale→AuswahlbeimÖffnenPersonbereichinvalidiert, (2)verloreneStartantwort+Sessionablauf→StartrequestvorNetzversandpersistiert/unklarenAcknieverwerfen;ServeridempotenteWiederaufnahmeüberOriginalattemptsecretauchbeiLoginexpiry,keineNeueversucheausabgelaufenerSession,(3)KeychainclearFehler→persistenterrequiresCodeMarkerzuerst/alterTokenbeimnächstenÖffnenunlesbarbisNeuanmeldung, sichtbarerAbmeldefehler,AACEndebereitsnachReceiptbeibehalten. NurdefinitivabgelehnteersteStartanfragekannlokalenunstartedDatensatzverwerfen,keinePendinganswers.

Tests: neueLaunchdatenCodableRED→GREEN,DiscardpolicyRED→GREEN,unsichererAck/LockmarkerRED→GREEN.33SwiftPASS /private/tmp/gc-pupil-native-33.log,24PythonPASS,bisherigeStagingSimulatorbuildkompiliertevollständig /private/tmp/gc-classroom-pupil-build5.log. FrühereBuildfehler:SwiftPublishedproDeklarationeinFeld/zuumfangreicherSwiftUIViewausdruck;getrennteProperties/Teilviews,keineignoriertenCompilerfehler. NeuergenerierterXcodeprojektstand24Sources. NochkeineechteLogin-/GeräteabnahmeundkeinneuerTestFlightlaufdiesesFeaturestands.

WebgegenstelleeigenesCheckoutfeature/classroom-integrated-preview-20261016:Service/API/Monitor/Zuweisung/Pupillisteimplementiert688Web/Assessmentgrün,Remote7d872f5a;aktuellerRecoveryfixlokaldb0dd5d. Erst2026Functionsdeploy5TargetsCloudRunHealthcheckfehlgeschlagen,CodearchiveoriginalmitGoogleFrameworklokalHTTP401geladen. BegrenzterDiagnoseneustartnurclassroomWebaufneuemStandmit2026-onlyStartmarkernläuftExec80495,Log/private/tmp/gc-classroom-2026-gateway-deploy2.log. KeineSchul-Live-/Rulesänderung,Hostingunveröffentlicht. Ursachebisherunbekannt,keinFakefertig.

NächsterSchrittNativecheckpoint+genaueSourcematrixprüfen;voller2026FeatureTestFlightlauferstalsneuerLaufnachgesichertemFeaturestand. Inzwischen2026GatewaystartdiagnoseundtatsächlichenTeacher/PupilBrowserablaufabschließen. KeineAppStoreEinreichung/physischeAACFreigabeausSimulatorableiten.


Persönlicher Featurekandidat gesichert: lokal aa601b6 / remote efc5e980e87adaf628ec20eb5c03105c73d9ceb7, identischer Tree157e98a0fea9c4a0f22d73652b8bdf01d4b4f3cb. Vollständiger2026TestFlightlauf39858281409 (#20, Versuch1) tatsächlich angelegt: https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39858281409 . ErwarteterBuild1.0(1201), aktuell pending/nochkeineJobs undkeinUploadnachweis. KeineerneuteProduktcodeänderungzurWiederholung/keinebehaupteteAppleverarbeitung. ZweiterbegrenzterGatewaydeployclassroomWebebenfallsHealthcheckfehlgeschlagen, Revisionclassroomweb-00001-jir, Builda6bb27d5-1992-4465-942a-3a35b7c56637. ExaktesCloudimage8fc7dfd6mitgebautemFramework3.5.1undOriginalabhängigkeitenlokalgestartet: beideStartmarkerundHTTP401ohneSchüleranmeldung. CloudenthältnurAudithealthcheck,keineStartmarker/stdout/stderr; Ursacheweiteroffen. AlteAssessmentReadyRevision00006bedientweiter100%Traffic; keinHostingdeploy. PersönlicherOnline-/Geräteablaufdeshalbnochnichttestbereit.

## 2026-10-23 recovery checkpoint (not uploaded yet)

Personal 2026 backend ready: exact user approval restored only classroomAccess public invoker transport; actual callable code login succeeds, unauthorized me/workspace/wrong-code each401. Web personal assignment verified with synthetic newcopy BZSZRHJF; original teacher tests preserved. Backendsource1d108479 deployed5functions/allReady100%; webmonitorcandidate892160f6.

Native local increment: delivered/read help notice without timer/answer/AAC reset; typed authenticated replacement receipt; explicit pupil transfer; protected archive retains original answers and original token in separate WhenUnlockedThisDeviceOnly Keychain record. Never invokes receipt-only clear. Archive/removal failure retains active data; old receipt cannot retire a later identity. Archives protected/backup-excluded, not resent or removed on logout. Restoration/confirmed cleanup remains separate support work, no normal pupil archive browser.

Phone failure artifact: confirmed return action offscreen. Unchanged local2tests pass after swipe; exact CI swipe failure unreproduced. New no-scroll landscape assertion RED; compact non-entry status/brand spacing GREEN, existing portrait and archive tests also pass. No unrelated entry-keyboard PR294 change or gate skipping.

Unsigned simulator Keychain write returned -34018 (missing entitlement). Ruling: inject memory vault only across Keychain boundary in filesystem test, retain production Keychain/accessibility. Cost if wrong: actual signed-device Keychain acceptance still required. Protected filesystem test verifies archive revision, token absent from file, backup exclusion, rollback after credential-removal failure, and later-identity guard.2integrationtestsPASS. Current35Swift/24PythonPASS. No feature upload or physical AAC proof yet.

## Final whole-feature review and single fix pass

One fresh read-only reviewer returned5Important native/web issues, noCritical/Minor. All fixed inonepass. Native session renewal binds original pupilID plusquiz/assignment/generation, retaining clientID/token/startRequestSent/answers;3integrationtests include wrongpupilrejection andsamepupilrenewal. Shared credential persists lastActivity and locallylocks overview after5min without network; missinglegacysharedmetadata requirescode. Activeexamclock/answers unchanged. Pupilselect afterawait revalidates revision/person. Web713tests cover immediatepersistedofflinecodelock, delayedackafterpersonchange, localexpiry andexplicitreplacementform withperson/oldattempt/reason/confirm/deadline/generation.

37Swift/24Python andrenderer suite pass; native3recoveryintegration+2returnUI tests PASS, actual2026Staging BUILD SUCCEEDED. Full localphonegate before reviewdelta PASS540native/216Web/12interaction/6composed. Finalcandidate stillmustpassallremote gates; sourcechecks are not upload/physicalacceptance. Renderer initialrun missing localjsdom; linkedexistinginstalleddependency inownignoredtools/ui/node_modules, thenactualtestpassed; nodependency/productchange.

Rulings: physicalAAC/signedKeychain acceptance stayspending; useactualdeployreceipts separately fromsourcereview. Freshmainrules readbyexecutor despite reviewer'sDNSfailure. Nosecondreview. No genericerrorclearing. One final2026productpushplanned; noLive target orsecondapp.
