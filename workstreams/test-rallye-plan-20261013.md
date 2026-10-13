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
