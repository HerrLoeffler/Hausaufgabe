# GC-GAMES-TEST-RALLYE-01 — Test-Rallye Umsetzung und Staging

Aktualisiert13.10.2026. Owner: ausführender Games-Fachagent im eigenen Checkout; Koordinator GC · Games-Zentrale. Aktueller Auftrag: detaillierten Plan sichern, unmittelbar implementieren/reviewen und isoliert aufStaging zeigen. Menschliche Steuerung: manuelle Bewertung vollständig ausschließen. Production nicht freigegeben. Quellen sources/ unverändert.

## Aktueller belegter Stand

**staging_deployed, kein user_tested.** Exakter Runtimecommit `797549374df908cb9fd212be14b86e58061b347b`; [PR236](https://github.com/HerrLoeffler/Hausaufgabe/pull/236) offen/Draft/unmerged gegen feature/gradecrew-app-integration. [PlanPR235](https://github.com/HerrLoeffler/Hausaufgabe/pull/235) separater Dokumentationscheckpoint. [Plan](../docs/games/test-rallye-plan-20261013.md), [getrennte Receipts](test-rallye-release-receipts-20261013.json).

[Spiel](https://hausaufgabe-staging--gradecrew-test-rallye-20261013-mzzqi6g9.web.app/test-rallye/) · [vorhandene Editoranmeldung](https://hausaufgabe-staging--gradecrew-test-rallye-20261013-mzzqi6g9.web.app/editor/) · [vierter Kachel im Hub](https://hausaufgabe-staging--gradecrew-test-rallye-20261013-mzzqi6g9.web.app/). Kanal expires20.10.2026 23:37:20CEST. Hostingexit0, alle221DateienHTTP200undSHA256identisch zum lokalenManifest. testRallyeApi und testRallyeCleanup ACTIVE/europe-west1/nodejs22/codebase testrallye, CLIexit0, gemeinsamerFunctionsHashc9b769b38ab04e277b07915f8b32939fd2db179e. Keine Rules, alten Functions, canonical oderProductiondeploys. Canonicalfrischgc39/8f869790/165Files.

143/143automatischeTestsgrün, exakteCI38471572958SUCCESS. UnabhängigerBackend/Core/Auth/Policyreviewc7cdfPASS, unveränderterBackend in797; 28/28BrowserQAchecks58405a2/gleiches797Tree,0JSerrors. RealeChromeeingaben für11Typen, gemischte6erRundeEndstand300/6, Reload/Pendingretry/Countdown/Order-/ColorDrafts. DieserBrowserQAbenutzt klare Auth/API-Mocks und ersetzt keine echteStaging-Lehrerraumprüfung.

**Offen:** tatsächliche Lehrkraftanmeldung, Auswahl/Speichern eines eigenenTests im bestehendenEditor und echterStaging-Lehrer→Schülerjoin→Score→Endstand. Nutzer bestätigt „Noch nicht angemeldet“; keineCredentialsangefragt/kopiert, keinFakesmokealsLiveraumbeleg. NativePreviewzeigtVerbundenundLogin/Code/Kürzel. Livehealth200, unauthlistTests400mitLoginaufforderung+CORS, anonymerdirekterFirestore403PERMISSION_DENIED. AuthenticatedRolesRules/physicalQR/iPad/Phone/30Personen nicht geprüft.

## Startschritte

1. Auf [vorhandener Editoranmeldung](https://hausaufgabe-staging--gradecrew-test-rallye-20261013-mzzqi6g9.web.app/editor/) mit bestehender E-Mail oder Kurzname normal anmelden, eigenenTest erstellen/bearbeiten und speichern (keineKI-Generierung für den Testbeleg erforderlich).
2. [Test-Rallye](https://hausaufgabe-staging--gradecrew-test-rallye-20261013-mzzqi6g9.web.app/test-rallye/) am selbenOrigin öffnen/zurückgehen, Testsaktualisieren, eigenenTestwählen, Vorprüfung lesen, Dauerwählen undRaum erstellen. Nichtspielbare/manuelle Aufgaben blockieren die gesamteRunde sichtbar; vorhandenenEditorzumUmarbeitenoderanderenTestwählen.
3. DenQR-/sechsstelligenCode-Link ineinemzweitenTab/Schülerbrowser öffnen, synthetischesKürzelbeimbeauftragtenPrüflauf, gemeinsamStarten. AntwortenexplizitPrüfen;Vollrichtig+100,Core-Netto0−50und5sPause,TeileanteiligohnePause,Weißnicht0/5s,Scorefloor0.

DevelopmentnurfürberechtigtesbestehendesAdministratorkontoinStaging: Test-RallyezeigtOptionEntwicklungsrunde,ServerflagundAdminrolleerforderlich. Reset/SprungändernrunVersion, ReleaseRoomverweigert unabhängigUI. Diagnose/Meldunglokalexportieren, keinZustellungsversprechen. KeinunautorisierterdevLink/Token.

## Assurance und Grenzen

SEC04/06/07/08/11/14/17: taskbezogeneCode-/Adapterbelege, exakteCI/Functions/Hosting; privateRooms/Snapshots/AdminAPI,Owner/Accountdeletion/rightsHold,Score/Cooldown/version/idempotence,noPaperkeys,Limits. LiveOwner-/Token-/Firestore-RetriesbleibenohneLogin nicht geprüft. PRIV07/17/20: Kürzel/minimaleReceiptdaten,keinRohantwortpersistieren,Ownerdeleteadaptergeprüft,stündlicherCleanup ACTIVEmit24hZiel+Schedulinglag,keinabgewarteterLöschzyklus/Schul-/AVVzertifikat. PRIV12/13/14: ehrlicheUIcopy,Originalalt/Colornamen,28BrowserQAchecks/Arrowkontrast;physischeGeräteoffen. KatalogfremderOwnernicht geändert.

NichtblockierenderP3: finalesFeedbacksuffix„WeiterzurnächstenAufgabe“beigleichzeitigerBeendetanzeige;keinneuesControl/Item. BewusstkeinMiddeploySourcechange.

Credentialvorfall: login:list--json gab einmal unerwartet Credentialfelder im internenTooltranskript aus. KeineWertekopie inCode/PR/Receipts; eigeneCode-/Docs- und5ReceiptlogPatternscanfalse. KünftigeCLIAusgabenwhitelisted/redigiert. OwnerprüftggfvorhandeneCredentials/Widerruf,keineunilateraleRevocation/IAMänderung.

## Wiederaufnahme

KeinelaufendenDeploysmehr, beideexit0. Checkout `/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/implementation/test-rallye-20261013`; Runtimebranch797aufGitHubgesichert, lokale584-/c7Versuche erhalten. Dokumentation gerade aufexistierendemDocsPRfortgeführt, keinzweiterTask/Plan. KeinPaidCall/Reservierung; Modell/Usageactualunbekannt.

**Genau nächster Schritt:** nach legitimerNutzeranmeldung tatsächlichen eigenenTest inPreviewEditor auswählen/speichern, Teacherroom/Schülerjoin/Serverpunkte/Endstand spielen und separatbelegen. BestehendenUserAuthflow verwenden; keineTokenkopieausanderemOrigin. Taskbleibtstaging_deployedbiszu diesem Gate und MartinsNutzerabnahme.

GezielterNATcheck: IPlimiternurJoin100/Minute,Create20/Owner/Stunde; playerState/HostPolling2sverbrauchtkeinenIPbucket. 30SchülergemeinsameNATistkeinbekannterQuota-Blocker. KeineLiveKlassenlastprüfungbehauptet.

## Erhaltene Versuchshistorie (historische Planverbote gelten nicht für aktuellen Auftrag)

# GC-GAMES-TEST-RALLYE-01 — Test-Rallye Planungsentwurf

- Aktualisiert (UTC): 2026-10-13
- Verantwortlicher Chat / Auftrag: ausführender Dokumentations-Fachagent der Games-Zentrale; Nutzerauftrag: erst Plan erstellen, danach offene Fragen besprechen
- Chat-Bezeichnung / Link (falls bekannt, sonst unbekannt): GC · Games-Zentrale (Zentralen-Thread-ID 01a11864-3ec7-7091-acc0-9ff292f530f3); ausführender Chat-Link unbekannt
- Vorheriger Chat / Übernahmezeitpunkt (UTC, falls übernommen): nicht zutreffend
- Arbeitszustand (aktiv / pausiert / blockiert / zur Übernahme bereit / abgeschlossen): aktiv — reine Planung, Produktentscheidungen offen
- Aufgabenbranch: docs/test-rallye-plan-20261013
- Basiscommit: aktueller main zum Branchstart; SHA nicht vom Branch-Create-Endpunkt geliefert
- Integrationsziel: main
- PR (URL / Nummer oder keiner): Draft-PR wird nach Dokumentationssicherung erstellt
- Betroffene Dateien: docs/games/test-rallye-plan-20261013.md; workstreams/test-rallye-plan-20261013.md; TODO.md; workstreams/registry.json
- Überschneidungen mit anderen Aufgaben: games-structure (lab/games-structure → lab/vocab-rush), bestehendes FastQuiz PR224 / Task GC-GAMES-FASTQUIZ-BINOMIAL-20261012. Dieser Eintrag plant ein anderes Spiel und verändert diese Dateien oder Branches nicht.

## Ziel und gewünschtes Verhalten

Vorschlag einer vierten GradeCrew-Webspielkachel „Test-Rallye“, die einen vorhandenen oder im bestehenden Editor erstellten Test mit vorhandenen Aufgabentypen in einen gemeinsamen Rundenfluss bringt. Vollständiger Plan: [docs/games/test-rallye-plan-20261013.md](../docs/games/test-rallye-plan-20261013.md).

## Umfang / nicht verändern

Nur Planungsdokumentation und Task-Zuordnung. Keine Produkt-/Spiel-/Testdatei, keine Bewertungslogik, API, Rules, Lobby, Games-Registry selbst oder Release-Stufe ändern. Kein Build, Test, Deploy, Merge, KI-Generator oder Schülerdatenzugriff. Keine Production-Freigabe.

## Akzeptanzkriterien

- Vorschlag als Entwurf markiert; drei offene Produktfragen sichtbar.
- Vorhandene Aufgabenformate und bestehender Editor sind Ausgangspunkt; keine erzwungene MC-Konvertierung.
- Bewertungsvertrag und Notwendigkeit einer neuen serverseitigen Spiel-Abgabe ehrlich beschrieben.
- Referenzrunde und separate Touch/Tastatur-, QR- und iPad-Prüfungen benannt.
- Task-ID, TODO-Zeile, Registry-Zuordnung und Übergabe auf eigenem Docs-Branch gesichert.

## Zwischenstand

- Lokal geändert: keine lokale Checkout-Änderung; Dokumentation wird über GitHub-API auf eigenem Branch angelegt.
- Auf GitHub gesichert (Commits): Plan/Handoff c0b409bbd750f4c244202b75979fd3f207402add; TODO cd858e9bc77005491e94adb8972479286c9175f2; Registry 868acab4867599320dcf4f64f007470497872d6c. Finaler Dokumentationsbranch-Head zum Checkpoint: 2e2b8fcbd2f836f40fe2b7b4323af9326b5fc7fe.
- Geprüft (Befehl / CI-Link / Ergebnis / Commit): keine Produktprüfungen ausgeführt oder beauftragt; Dokumentationsinhalt und PR-Diff nach dem Schreiben lesend prüfen.
- Deployed (Ziel / URL / Commit / Nachweis): nicht zutreffend.
- Gerätetest (Gerät / Version / Ergebnis): nicht zutreffend.

## Offene Probleme und Unsicherheiten

Offen: nach falscher Antwort weiter oder später Wiederholungsmodus; Teilpunkte und Sperre bei Teilfehlern; Freitext im ersten Spiel. Zusätzlich „weiß nicht“, alternative Antworten, Bild/Audio-Unterstützung und Zeitbonus-Konfiguration. Der Bewertungsvertrag sowie eine neue serverseitige Spiel-Abgabe sind vor Umsetzung am Code zu belegen; keine API wird hier als vorhanden vorausgesetzt.

## Nächster konkreter Schritt

Planungsentwurf in PR prüfen und anschließend die drei offenen Produktfragen mit dem Nutzer besprechen. Erst nach Entscheidungen einen gesonderten Implementierungsauftrag samt aktuellem Code-/Branch-/Development-Status erstellen.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt / Zeitpunkt (UTC): Task-ID auf aktuellem main gegen TODO/Registry/Status ohne Treffer geprüft; isolierter Docs-Branch angelegt; gemeinsame TODO-/Registry-/FastQuiz-/Games-Vorlagen auf main gelesen. Plan- und Übergabedatei gesichert; TODO/Registry frisch von main gelesen und nur um diesen Workstream ergänzt.
- Gepushter Codecommit / Remote-Branch: Code nicht geändert; docs/test-rallye-plan-20261013; Dokumentationscommit nach Erstellung einzutragen.
- Ungesicherte Änderungen / Checkout-Pfad (oder keine / unbekannt): keine lokale Arbeitskopie; Connector-Schreibvorgänge.
- Laufende oder unklare Vorgänge (Run-/Request-ID, URL, Ergebnis; oder keine / unbekannt): kein Build/Test/Deploy gestartet.
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: GitHub-Dokumentationsbranch; keine Kostenreservierung.
- Was darf noch nicht als erledigt gelten? Umsetzung, sichere serverseitige Bewertung, UX/Devices, Freitextregeln, Testlauf, CI, Integration, Staging, Nutzertest und Production.
- Was muss vor Wiederholung geprüft werden? PR/Branch und Actions-Stand, damit Dokumentationsschritte nicht doppelt angelegt werden.
- Genau ein nächster ausführbarer Schritt: offene Produktfragen besprechen und akzeptierte Entscheidungen in Plan/Übergabe aktualisieren.

## 2026-10-13 neuer Ausführungsauftrag

Nutzer fordert ausdrücklich ausführlichen dokumentierten Plan, danach direkte Umsetzung/Review/Tests und isoliertes Staging mit Spiel-Link. Früheres reines Planungsverbot ist dadurch aufgehoben; Production bleibt verboten. Aktueller main d3dd36d5, Web/Assessment8f869790, Games55e58e4, FastQuizPR2242e5f8b8e frisch geprüft. DocsPR235 offen/draft48a2424; kein zweiter Plan/Task. Eigener Checkout implementation/test-rallye-20261013; nativeWorktree im Projektmirror nicht möglich (Not a git repository), daher eigener frischer Clone. Shellnetzzugriff via autorisierteEscalation funktioniert.

Live development_status.py nach frischemFetch:27aktiveWorkstreams,24Overlapwarnungen,11historischkritischveralteteBranches; eigenePlanfiles überlappen nur Koordination, Produktarbeit separat aufWebbasis. PRvergleich lokal ohneGITHUB_TOKEN, konkretePRs ergänzend viaConnector geprüft. CanonicalRelease API:gc39/8f869790/165Files. Umfangreiche Regeln inklGames/Assurance/Skills gelesen. Referenzprüfung: secure-student.js enthält alle11PublicPaperRenderer, assessment-core.js opaque IDs/Teilpunkte/solutiondeny; diese werden wiederverwendet. FastQuizclientScores werden ausdrücklich nicht übernommen.

Detaillierter Plan ersetzt vorherigen Entwurf in gleicher Datei; Defaults aus akzeptiertem Auftrag verbindlich dokumentiert. ProductRuntimebranch feat/test-rallye-20261013 folgt nach gepushtemPlancheckpoint. DocsPR bleibt Dokumentation. KeineProducttests/Build/Deploy schon behauptet. Budget/Usage/actualModel unbekannt; keinePaidCalls/Reservierungen/Modellwechsel; alteVersuche bleiben erhalten. Skills reading:writing-plans,using-git-worktrees,executing-plans,TDD,brainstorming,frontend-design,firebase-hosting-basics; direkteAusführungsanweisung hat Vorrang vor generischererneuterApprovalrunde.

AssuranceauswahlSEC04/06/07/08/11/14/17,PRIV07/17/20/12/13/14. Keine3DProduktion,img2threejs nichtrelevant für2DDOM/Testadapter. Keine laufenden eigenenDeploy/Buildrequests; lokaleProcessinventur sandboxed verweigert, keineausstehendenknownRequestIDs.

NächsterSchritt: Plancheckpointcommit/push, dann isoliertenRuntimekandidaten mit Tests zuerst aufbauen.

Menschliche Steuerung13.10.2026: „manuelle bewertung rausnehmen!!“ — manuelle Bewertung vollständig aus Rallye ausgeschlossen. Keine spätere manuelle Freigabe/Jury/Teilrunde; manualReview und unklare Textkeys blockieren gesamteRunde sichtbar. NormaleEditorfeatures außerhalbRallye unverändert. Plan aktualisiert vorRuntimebau.

## Runtimecheckpoint1

Eigener Branch feat/test-rallye-20261013 aufWeb8f869790, eigeneProduktdateien alleinigerSchreiber. GezieltesReusePR224lab/Builder/GamesTests; alteProduktfiles unangetastet. 19neueCore/Policy/RendererTests RED→GREEN (VersionReset undOrdinaryMarkwordsRegression zusätzlich). ExistingAssessment85/85grün. Erst falscherNode--testDirectoryAufruf korrigiert auf*.test.js, keineProduktfailureverschwiegen. FunctionsNode22-Abhängigkeiten installiert nach ersterfehlgeschlagenerPATH-postinstallProbe, RuntimeNode24 fürUnitcheck, tatsächlichesDeployNode22. Dependencywarnings bestehenderfixierterFirebasevendor(glob/node-domexception) dokumentiert, keinunangefragterDependencyrewrite.

Planreview umgesetzt: DevelopmentserverEnvironment+enable+adminRole; runVersion+Receipt,Netto0gradeführt−50/5s, Helpdialog. Ownerfeld tatsächlichownerId imWebquery bestätigt. PrivateSnapshots proItem<850KB, stündlichisolierteCleanupFunction24h+bis1hLag. GapfillRenderer liefert bestehendesArrayformat, Coreakzeptiert; TestannahmeObject aufOriginalarray korrigiert.

Frontend/Serverkandidat angelegt, noch keinBrowser/Deployclaim. Previewbuild1fehlte neuerChildlab-release.json (ursächlichBuildervertrag), behoben underneuterBuildfolgt. Credentialhygiene: eigenerTextscanfalse fürTokenwerte; login:list--json einmaligeinterneToolausgabe unbeabsichtigt, keineLogumleitung/Commit/Artefaktcopy, künftig nurredigierteBoolchecks. KeineglobaleRevocation/IAMänderung.

NächsterSchritt: Previewbuild/Browser undtransactionalEndpointVerhalten prüfen, unabhängigenReviewerCheckpoint anbieten.

Remote Runtimecheckpoint: ad46498e04563784c8a3a49507faba25e3b6ea31 auf feat/test-rallye-20261013, Treeba92b8d12368e9c1704b6a60c2fb06a17d4442bf identisch lokal e79a2f5; alle82BlobIDs vorRefupdate exaktverglichen. Shellgitpush ohneAuthnichtmöglich, vorhandenerConnectorwrites genutzt. KeineSecrets/Credentialtransfer. Games26erRegression:2Tests schlagen alleinwegen erwarteteralter3Kachelannahme fehl; präzise4Kachel-/alte3routeTests folgen, keineTestsübersprungen.

## Reviewfixcheckpoint2

UnabhängigerReviewer e79 bestätigte dreiBlockercluster: fehlende/deletingOwnerprofile und accountDeletions, isDeleted/rightsHoldQuelle, abgeschnitteneTyparrays/kleinePunkte/staleSupplementalAudio. MitzusätzlichennegativenTests RED→GREEN behoben. HostprüfungundjedeRoomTransaction (auchSpieler) prüfenbestehendenWebaccount-state-Vertrag undQuelltestsperren. Ruling: Sourceinhaltsänderungen bleibendurchSnapshotisoliert; bestehendeRechte-/Account-/Löschsperren blockierenauchlaufendeRallye, weilserverAdminAPIdieseGrenzen nichtumgehendarf. NichtalsfehlendeSnapshotimmutabilitätwerten.

23neueTestsgrün, Gamesregressions26gesamt (zwei3Kachelassertionenzuvor24/26rot; jetztsemantische4KachelIds+RallyeliveURLergänzt); vollständigerSuiteRecheckfolgtimnächstenSchritt. PublicPaper-Formlimits20options/30pairs/40order/20groups/40jeGroup und200Objecteinträge/Marktargets,finite0.5Grid,Text-/MediaLängenundstaleSupplementalAudio blockierenvorStartsichtbar. KeineVendorcoreänderung. Helpdialog tatsächlicherCUABrowser8837sichtbar, Servernochundeployed. HTTPtransactionIntegrationnochoffen.

HTTPendpointAdaptertest6/6 grün: tatsächlicheronRequestHandler mitisoliertemFirestoreTestadapter,read-before-write/serializablecommit; concurrentduplicate,auth/owner/holds,paperkeydeny,clientscoreignoriert,immutability,finished,rejoin/cooldown,devdenial,Ownerdelete/periodiccleanup. Das istkeineLiveFirestore-/Emulator-/Stagingbehauptung. AuthUIDummy nurimTestadapter, ProductnimmtFirebaseverifyIdToken. Alles140/140vorGapFollowupgrün.

Reviewer31cRecheck:134unabhängigeTestsgrün; nochGapalternativen>20/Antwortlänge>1000validiertundmitRegressionRED→GREENblockiert. CIworkflow/isolierterDeploywrapperangelegt. EigenerlocalCUATab8837background, Helpdialognatürlichbelegt; keineLehrerlogin-/StagingFullflowbehauptung.

## IndependentreviewundDeploybereitschaft

CODE/POLICY-PASS unabhängigerReviewer exactc7cdf5c,141/141 TestsundGapreprosvomReviewerbestätigt. Alle4Findingclustergeschlossen; bewusstkeinLiveFirestore/Rules/IAM/Browser/CI/Deploynachweis. Nachc7neuerbegrenzterDeltarestoresordering/markwordsDraftsinOriginalrenderermodul; zusätzlicherRED→GREENTest, appdelegiertalleTypen. Devcontrolsindapp.jsintegriertstattgeplanterseparaterdev.mjs;Servergateistmaßgeblich. VorhandeneFirebaseCLIprojects:listread-onlyfrisch:exit0/statussuccess/stagingProjectVisibletrue, nurBooleanWhitelist ausgegeben.\n

UnabhängigerPlayQA31c: alle11OriginaltypenRenderer+CoreinChrome(+100),vorPrüfen0writes,MultiTeil+50noLock,lostResponse+ReloadsameRequestID2HTTPcalls/1CorewritePASS;keineechteHostauth/LiveServiceQA. Wortfarben/OrderingDraftverlustP2bestätigt→072680aFixTest. P2OrderingpfeilWhiteonWhitebestätigt→engscoped#questionOrderbuttonink;Countdown5Minkurz4:00glitchbestätigt→gemeinsameCeilSecondsFormatierungplusGrenztestRED→GREEN. FinalQArecheckangefordert; keineReproauslassen.
