# Aufgabe GC-LEARNING-WISSENSREISE-01 — aktueller Stand14.10.2026

- Ausführender Owner: **wissensreise_implementation**, Fachagent; ursprüngliche Planung durch wissensreise_plan ist unten als Historie gekennzeichnet.
- Koordinator: bestehende GC · Games-Zentrale, Thread01a11864-3ec7-7091-acc0-9ff292f530f3.
- Status: **staging_deployed / isolated_preview_only**. Code noch nicht integriert; user_tested=false, Production unverändert.
- Runtimebranch: feat/wissensreise-20261014, [DraftPR238](https://github.com/HerrLoeffler/Hausaufgabe/pull/238), unveränderter geprüfter/deployter Commit **7b35f9ff23c5b824ca0e85402a5270751c0b06c5**. BasisGC39 8f8697901f8c1aea89897be855ca2872c82d0f2b.
- Main-Dokumentationsweg: docs/wissensreise-plan-20261014, [DraftPR237](https://github.com/HerrLoeffler/Hausaufgabe/pull/237); Planfreigabe mit korrigiertem Testeingang, scoped TODO/Registry/STATE und dauerhafte Receipts. Nicht nur zur Besprechung; keine Main-Mergefreigabe.
- Belege: exakte Node22-CI38574847338 erfolgreich,285Functions-/6DOMtests, unabhängiger Code- und Browserreview. Hosting170/170Payload-Hashes,12neueFunctionsACTIVE,43bestehende unverändert; kanonisches Staging und Rules unverändert. [Releasebeleg](../docs/learning/wissensreise-evidence-20261014/staging-7b35.json).
- Ziel: eigener vorhandener oder mit Remy erstellter Test → passende Varianten und geführtes Lernen/freies Üben → bewusste Prüfung/Freigabe → Link/QR → kontinuierliches Lernen ohne Noten/manuelle Bewertung.0/120/180Sekunden; allein Countdown beendet Zeitrunde. Budget3×12Puffer und ehrliche Wiederholung beiAusfall/Kappe.
- Noch offen: tatsächlich angemeldeter eigener Test und Cloudablauf, Providersemantik/Nachfüllungs-IAM, physische Geräte, Klassenlast und Nutzerabnahme. Kein vollständiger Abschluss aller ursprünglichen Masterplan-Ausweitungen.
- Genau nächster Schritt: Martin öffnet [isolierte Wissensreise](https://hausaufgabe-staging--gradecrew-wissensreise-20261014-tg3201gy.web.app/learning.html), meldet sich über [Anmeldung/Testeditor](https://hausaufgabe-staging--gradecrew-wissensreise-20261014-tg3201gy.web.app/index.html) an und wählt einen eigenen inaktiven Test.

## Historie: ursprüngliche Planungsübergabe vor dem Umsetzungsauftrag

Die folgenden ursprünglichen Planungsabschnitte dokumentieren den damaligen Stand vor Genehmigung und Codearbeit. Aussagen wie „zur Besprechung“, „branch_only“ oder „kein Produktcode/Deploy“ gelten ausschließlich für diese Historie. Die späteren Umsetzungs- und Releaseabschnitte sowie der aktuelle Kopf oben ersetzen sie für den heutigen Stand.

### Ursprünglicher Planungsauftrag GC-LEARNING-WISSENSREISE-01

- Aktualisiert: 2026-10-14 (UTC; genaue Speicherzeit im Git-Commit).
- Verantwortlicher Fachchat: wissensreise_plan, ausführende Produktplanung/Dokumentation.
- Koordinator: bestehende GC · Games-Zentrale, Thread01a11864-3ec7-7091-acc0-9ff292f530f3.
- Chat-Link: unbekannt; keine neue Chatfreigabe.
- Vorheriger Owner: keiner; neuer ausdrücklich beauftragter Planungsscope, keine Übernahme der Test-Rallye.
- Arbeitszustand: zur Besprechung; Dokumentationsentwurf branch_only.
- Aufgabenbranch: docs/wissensreise-plan-20261014.
- Basiscommit: d3dd36d5b63062de7d4702c40ac1dd87574cc484 (frischer main).
- Integrationsziel: main ausschließlich für spätere Dokumentationsintegration; keine Mergefreigabe.
- PR: [DraftPR237](https://github.com/HerrLoeffler/Hausaufgabe/pull/237), open/unmerged; nur zur Besprechung.
- Betroffene Dateien: docs/learning/WISSENSREISE_MASTERPLAN_20261014.md, diese Übergabe, eine eigene TODO-Sektion, ein eigener Registry-Eintrag.
- Überschneidungen: TODO/Registry sind gemeinsame Dateien. Frisch gelesen, vorhandene Einträge erhalten; keine fremden Taskzeilen verändert. Inhaltlich Pool/Classroom/Test-Rallye nur gelesen/verknüpft. PR235/236/218 und Lerninselpläne unverändert.

## Ziel und gewünschtes Verhalten

Martins Auftrag14.10.2026: ausführlichen Plan für eine Lernplattform aus eigenen Materialien/Tests erstellen, mit passenden interaktiven Übungen und didaktischem Aufbau ohne Benotung. Vorgeschlagener Name GradeCrew Wissensreise. Der Text ist ein Vorschlag zur Besprechung und keine genehmigte Bauvorgabe.

## Umfang und Grenzen

Reine Fachplanung: Architektur, Quellen-/Inhaltsmodell, Teacher-/Learnerflow, Übungsartenmatrix, didaktische Sequenz, Mini-Lernweg, Generierung/QC, Rechte, private Wiederaufnahme, Cache/Kosten, Accessibility, Devmode, Meilensteine und offene Entscheidungen. Keine Produktimplementation, Builds, Providerstarts, Installation, Merge oder Deployment. Manuelle Schülerantwortbewertung ausdrücklich auch aus späterem Scope ausgeschlossen. Freigabe generierter Inhalte bleibt etwas anderes.

## Akzeptanzkriterien und Zwischenstand

- Ausführlicher deutscher Entwurf mit2855 Wörtern vor finalen Quellenkorrekturen lokal gesichert.
- Bestehende elf Fragetypen von geplanten Ansichten getrennt.
- Kein Ranking/Noten/Strafsperren im Lernmodus, zuverlässige Schlüssel oder unbewertete Reflexion.
- Binomisches Beispiel mathematisch kontrolliert: (x+3)²=x²+6x+9; (2x+3)²=4x²+12x+9; (x−3)²=x²−6x+9.
- Eigene Task, wiederaufnehmbare Übergabe und begrenzte TODO/Registry-Zuordnung.
- Quellen-, Kontext- und Regelsichtung durchgeführt; lokale Strukturprüfung und Remote-Diffprüfung am Kandidaten ae9e2cfb59bf25c22ed647fb4720164f4c873154 durchgeführt.
- GitHub-Sicherung: Commit in dieser Branchhistorie; letzter konkreter SHA ist im Abschlussbericht/PR ersichtlich. Keine selbstreferenzielle Commit-SHA im selben Commit erfinden.
- Code: kein Produktcode. CI: für neuen Plan nicht als bestanden behauptet. Integration: nicht erfolgt. Staging-Hosting/Functions/Rules: nicht erfolgt. Nutzer-/Gerätetest: nicht erfolgt. Production: unverändert.
- GRADECREW_STATE.json bleibt unverändert: keine Feature- oder Release-Stufenänderung, nur branch_only/documentation.

## Frische Belege und Abhängigkeiten

1. START_HERE, AGENTS, CHAT_CONTRACT, CHAT_RECOVERY, TODO, STATE, Registry, README, TEMPLATE und GamesWorkflow/Briefing/Assetregel von main gelesen.
2. [Development Status38560181859](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38560181859), Job115839028260 success:26aktive Baustellen,22Overlapwarnungen,11veraltete kritische Branches,143unregistrierte Remote-Branches; keine automatische Bereinigung. TODO/Registry-Overlap bewusst nur eigene Einträge. Keine Wissensreise-/Wissensvorsprung-Branches/PRs bei der Suche gefunden.
3. Webquelle GC39:8f8697901f8c1aea89897be855ca2872c82d0f2b, functions/lib/schemas.js frisch gelesen. Elf Typen und Medienabsichten vorhanden; Lernpaket/Hilfen/Quellenbeleg nicht daraus ableiten.
4. Pool: PR218 open/unmerged,64d78d19fd48b50b440adf829c26de5e85c5dc4f; handoffci_green. Begrenzter Mittelschule6/9-Pool, keine Klasse10-Abdeckung behauptet.
5. Classroom: main-Handoff gelesen; Masterprojekt branch_only, kein Produktcode. LiveAuditPrimary17fc4278e2, +1/-134 zum Integrationsziel. Kein fertiger Classroomanschluss.
6. Test-Rallye: PR235 open/unmerged dc4a9747d4a179785dd715d08737330a2d5d4ffc; PR236 open/unmerged797549374df908cb9fd212be14b86e58061b347b. Keine Änderung/Übernahme ihres Scopes oder Nachweises.
7. Primärrecherche der Zentrale und Fachsichtung14.10.2026: LearningApps, Sofatutor, ANTON und IES/WWC direkt im Plan verlinkt. Funktionsbeschreibungen von Wirksamkeitsnachweisen getrennt; ANTON-Materialautomatik nicht als GradeCrewexklusivität dargestellt.

## Methoden, Modelle und Assurance

Gelesene Skills: /Users/martin/.codex/skills/gradecrew-wayfinding/SKILL.md und /Users/martin/.codex/plugins/cache/openai-curated-remote/superpowers/6.4.2/skills/brainstorming/SKILL.md. Ergebnis: nachvollziehbare Architekturvorschläge, gleiche Ansatzkriterien, vier nötige Produktentscheidungen im eigenen Plan. Der ausdrückliche Nutzerauftrag erlaubt den Planentwurf; neue Implementation bleibt ausgeschlossen. using-superpowers wurde gelesen, erklärt für Fachdelegationen selbst Nichtanwendung. Kein writing-plans-Ausführungspaket oder implementation-Skill gestartet.

Angefordert: spezialisierte Planung via Fachdelegation; konkrete model/effort-Overrides im eingegangenen Auftrag unbekannt. Beobachtetes tatsächliches Modell/Effort/Usage/Kosten unknown. Schwierigkeit: bereichsübergreifende Produkt-/Architekturplanung, Projektstartschema Sol/medium angemessen; keine laufende Modellumschaltung behauptet.

Assurance-Index gelesen. Anlassbezogener Folgescope für beauftragte Umsetzung: SEC06/07 für private Quellen/Schlüssel, SEC14/17 für untrusted Generierung/Quota, PRIV07/08/09 für Datenzweck/Minimierung/Löschung, PRIV12–15 für konkrete Inhaltsrechte/Bedienung. Ownerzuständigkeit Fachrollen aus bestehendem Assurance-Einstieg; aktuelle Produktkontrollstände für Wissensreise nicht geprüft, nicht pauschal erfüllt. Dokumentationsplan eröffnet keine Vollscan-/Rechts-/Deployfreigabe.

2D-DOM-Lernoberfläche braucht keine bildgestützte3D-Rekonstruktion; img2threejs nicht verwendet. Devmode/Feedbacktransport geplant und vor späterer Umsetzung konkret nachzuweisen, keine Zustellungsbehauptung.

## Offene Entscheidungen

Vor Bauauftrag: gemeinsamer GradeCrew-Lernmodus, Name/Pilotziel, menschlicher Produkt-/Inhaltsowner, Startumfang und Zugangs-/Speicherzweck. Quellen/Auth/Schlüssel bleiben Pflichtbedingungen. Weitere Formate, Medienerzeugung, Classroom und Katalogausbau optional. Keine neue Deadline, Eurokosten oder Wirksamkeitsgarantie.

## Wiederaufnahme und nächster konkreter Schritt

- Letzter gesicherter Teilschritt: ausführlicher Plan und Koordinationsdateien in diesem Docsbranch; exakten Head/PR frisch lesen.
- Lokaler Facharbeitsordner: work/wissensreise-plan-20261014 außerhalb sources; synced Quellen unverändert.
- Ungesicherte Produktänderungen: keine; fremde Checkouts nicht verwendet.
- Laufende/unklare externe Vorgänge: keine Produktjobs, keine Providerrequest; PR-Dokumentationschecks können automatisch folgen und sind live zu prüfen.
- Kostenreservierungen/Provider-Versuche: keine neuen Starts; bestehende Aufgabenbudgets unberührt. Documentation-Sicherungsversuch1; kein Retry unbekannter Mutation.
- Vor Wiederholung: Remotehead/PR und diese vier Dateien prüfen, gleiche Task-ID behalten. Test-Rallye nicht neu starten.
- Genau nächster ausführbarer Schritt: Martin bespricht die nötigen Produktentscheidungen aus Abschnitt16 des Plans; anschließend gesonderten nächsten Auftrag abgrenzen.

## Gesicherter Checkpoint 14.10.2026, 12:45 UTC

Plan/TODO/Registry/Handoff wurden atomar als ae9e2cfb59bf25c22ed647fb4720164f4c873154 (Tree d872f4997bb5ff0919b1872747ef8c786fd71d4c) gesichert. Remotecompare main d3dd36d5 → ae9e2cfb bestätigt genau vier Dokudateien,1Commit ahead/0behind. Remoteplan bytegleich lokal; lokale Prüfung:2855Wörter,16Abschnitte, Registry gültig, je1Task-/Registryeintrag, keine Whitespacefehler; zusätzlicher Scopecheck erfolgreich. Relative Links zeigen auf frisch gelesene vorhandene Übergaben beziehungsweise eigene neue Handoffdatei.

Automatische Dokumentationschecks am Kandidaten ae9e2cfb: [Project handoff checks38566288754](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38566288754) und [Development Status38566288745](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38566288745) completed/success. Das sind Koordinations-/Dokuchecks, keine Wissensreise-Produkt-/Runtime-CI oder Nutzerabnahme. Dieser Nachtrag ändert ausschließlich die eigene Übergabe; Nachtragchecks sind erst mit separatem Ergebnis belegt. Fachliche Quellen-/Mathematikselbstprüfung durchgeführt, unabhängige inhaltliche Prüfung durch die Zentrale folgt. Planstatus bleibt Vorschlag/branch_only/documentation.

Zusätzlich gelesen: /Users/martin/.codex/plugins/cache/openai-curated-remote/superpowers/6.4.2/skills/verification-before-completion/SKILL.md. Tatsächliche Prüfungen und nicht geprüfte Produktstufen oben getrennt dokumentiert.

## Autorisierte Umsetzung — Checkpoint14.10.2026

Owner wissensreise_implementation; gleicher Task. Nutzer genehmigt PlanPR237 mit Testquelle statt Themenpilot. Branch feat/wissensreise-20261014 auf GC39 8f8697901f8c1aea89897be855ca2872c82d0f2b, eigener Checkout /private/tmp/gc-wissensreise-20261014. Plan/Handoff gezielt übernommen; Root koordiniert unabhängigen Review und BrowserQA.

Erster Inhaltskern1dba1be: sechs RED→GREENTests. Privater Draft/Publikation/Sessiondienst in Arbeit: fünf weitere Tests grün;2Quellfragen liefern120Folgeaufgaben ohne Frühende, Serverdeadline180s unverändert bei Resume. Alle Lernquellen owner-only/inaktiv/nicht gelöscht oder rightsHold; Sourcefingerprint invalidiert Freigabe. Remyähnlich-Route ist return-only, keine Ausgangstestmutation. Neue Lerncollections bleiben unter default-deny bestehenden Rules.

Generierung ausschließlich im Lehrkraftentwurf, maximal6deduplizierte Variantenrequests, vorhandene RegenerateQuestionroute mit Quota/Review. Keine direkte neue Providerverbindung, Keyänderung oder kostenpflichtige Probe. Während Spielen finite reviewed pool plus sichere mathematische Parametrik/Präsentationsmischung, Wiederholung ehrlich angezeigt. Keine Behauptung unendlich neuer fachlicher Inhalte.

Skills gelesen: using-superpowers(SUBAGENTSTOP), brainstorming(genehmigte Architekturkorrektur), writing-plans, executing-plans, using-git-worktrees(eigener RepoCheckout, Projektmirror kein Gitrepo), TDD, systematic-debugging, frontend-design, FirebaseAuth/Firestore, APIkey(gate nur bei direkter Providerarbeit; hier bestehende Produktroute). Kein neuer Firebase/SDK/Engine-Stack. Lokal verfügbarer Node24.19.0; exactCI Node22 separat erforderlich. requestedSol/high für Varianten/Sicherheitsgrenzen; actualModel/Effort/Usageunknown.

LiveAudit lokal da404c6:27aktive24Overlaps; PRabgleich mangelsToken ausgelassen, ConnectorPR237/236 frisch bestätigt. Root las vollständigen Actionsaudit38566455801 samt PRdaten. Fremde TODO/Registryzeilen bleiben erhalten. Scope neue learning-Module/functionslib, gezielte main/app/build/CIHooks, nur eigenerTask in Koordination. Relevant SEC06/07/14/17; PRIV07/08/09/12–15. Produktkontrollstände noch nicht unabhängig geprüft.

Nächster Schritt: vollständiger Testpicker→Wizard→LernplayDOM, Auth/transport/contracts testen, ZwischenSHA an Reviewer/QA. Kein Deployment, Production unverändert, keine laufenden Providerrequests.

## Reviewbarer Runtimekandidat —14.10.2026

Runtimebasis unverändertGC39 8f869790. RemoteZwischencheckpoint5c531a592f9fdce4bc24c6d400c8fe9390d54d13 (Tree exaktlokal2385dab), weitererlokalerSnapshot17e0f40549cf3cdaf1f8f91983ee1841f565e55a. EigeneCodePR gegenfeature/gradecrew-app-integration folgt nach letzten gezielten Reviewfixes. TODO/Registry/STATE existieren nicht aufGC39; bestehendePlanPR237 wird auf frisch geprüftemmain ausschließlich um die eigeneTask aktualisiert. Keine Gesamtkopien fremderRelease-Dateien aufRuntimebranch.

Umgesetzt: Owner-Testpicker mit vorhandenemRemy-Einstieg; Geführtlernen/Freiüben; wählbareAusgabeformate inklusive MC→passendeLücke/Zuordnung etc nur innerhalb Quellenziel/QC;0/120/180s; versionierterprivaterDraft und bewussteLehrkraft-Prüfung/Freigabe; Link/QR; kontinuierlicheSpielsession, stagedHilfe1Hinweis/2gearbeitetesBeispiel/3freigegebeneLernlösung; privaterMinimalprogress mit vier geführtenPhasen (anschauen/mitHilfe/selbständig/wiederholen), Pause/Resume, tatsächlicherNeustart nachZeitende. KeineNoten/Punkte/Strafsperren/manuelleBewertung/Kompetenzbehauptung. Original-Test wird niemals geschrieben.

GenerischeQuellegebundenePuffer:12verschiedeneItems jeBatch, separateLernziel-/Schwierigkeits-/Sprache-/Schlüssel-/Erklärmetaprüfung über dieselbe qualifizierteProduktroute. Diese zweiteKI-Anfrage ist keinefachlicheGarantie; expliziterUI-Hinweis. Höchstens3Batches jePublication inklusiveVorbereitung; neuePublikationen verwenden bestehendeAccount-Quota. Refill früh bei8verbleibendenItems, perPublication shared/deduplizierterCloudTask, maxAttempts1, maxConcurrent2. SourceDigest/Owneractive/activeExam/rightsHold/deleted vorFreigabe/Play/Refill; QueuevalidUntil verhindertStart nach letztemConsumerdeadline; vor zusätzlicherQC erneutRoundneeded prüfen. UnklareRequestausgänge bleiben gespeichert, keineblindRetries. Draft7Tage,Publication30Tage,Session24h, privateRateBucket24h; begrenzter täglicherCleanup. Nichtdeployed oderLiveFunktion behauptet.

SichererDatenweg: alle neuenLearningcollections default-denied durch bestehendeRules. Browser bekommt allowlistedPublicTask, nie Rohschlüssel/correct/seed/currentTask. PrivateCapability proSession, UUIDdeduplizierterStart, aktuellerTask eingefroren währendBuffer wächst. Hilfeantwort stammt nur aus ausdrücklich veröffentlichterLernkopie. KeineSchülernamen erforderlich, Feedback lokalexportiert, keineautomatischeNachricht/Telemetry. EntwicklermodusDiagnostic/Taskjump/Reset serverseitig nur Stagingadmin und eigeneLernkopie; Feedbacktoken niemals exportiert.

Formatgrenzen: elfTextformate supported, reliableKeys nötig; medienabhängigeAufgaben bewusst mit genauerFehlermeldung ausgeschlossen. Lücken-|Alternativen und storedOrdering.indices übernommen. DoppelteChoiceLabels/Groupnamen, ungültigeSchlüssel und unknownTypen blockiert. Markierungen plain/vier benannteFarben nutzen denselbenToken-/Schlüsselvertrag; Teacherpreview zeigtPassage/Palette/Schlüssel vollständig. Nicht alle beliebigen Quellen sind konvertierbar; unpassendeFormate/Fachdaten/QC blockieren ganzenPuffer und erhalten vorliegendenAufgabenvorrat. KeinUnendlichversprechen: beiKostenkappe/Quota/Ausfall transparenteWiederholung bisCountdown; Rechenoperationen nur bei exaktpassendemParser+verifiziertemOriginalkey parametrisch variiert.

Tests: FunctionsNode24lokal qualifiziertesPackageLock perpnpmimport→frozeninstall, keineLock-/Dependencyänderung committed. Vollsuite am17e0Snapshot im Autorenlog284/284 (Log /private/tmp/gc-wissensreise-functions-05.log); unabhängigerReviewer meldet281/281 für seinen Scope, nicht zu einerZahl zusammengelegt.22gezielteBackendtests am17e0; ActualCallableFirestoreAdapterVM2/2(Auth/Owner/publicprojection/idempotentrefill/read-beforewrite) mit synthetischemFirestore, keineCloudprüfung. DOM5/5 an17e0; Markpreview/selectedSingleRouteNachträge RED→GREEN; Schlusszahlen amFinalkandidaten frisch prüfen. ESLint und170-DateiStagingbuild lokal bestanden; exactNode22CI separat offen.

UnabhängigerReview durch /root/wissensreise_review: earlyGapAlternative/storedOrder/duplicateLabel/PublicSeed/Deadlinequeue/OwnerDraftReload/realPause/endRestart/Markpreview/SingleOutputScope Findings konkret reproduziert und mit gezieltenRegressionen korrigiert. AbschließenderPASS am neuestenSHA noch offen. BrowserQA /root/wissensreise_play_qa nutzte isolierteimmutableSnapshots852c45d(port8785)/17e0f40(port8786) mit echtenCore/Service/DOM und synthetischenQuellen+MockBatch. Tatsächliche120sBrowserrunde,>2korrekteAufgaben/wechselndeRechnungen,Deadline0/disabledNext; RefreshgleicherTask+Restzeit,FeedbackEscapeFocus,390pxkeinOverflow/44pxControls, WORD/Satzglieder/Astronomie/Ordering/GapKeyboard belegt. Guided/Mark/Conversion/restartRetest läuft; FakeProvider kein Nachweis echtergenerischerKIqualität oder Firebaseauth. Erklärmeta imFixture ausdrücklichsynthetisch; Fixture ausschließlichLoopback und nichtimBuild.

AssuranceSEC06/07/14/17, PRIV07/08/09/12–15 technisch scoped geprüft; Provider-/Schul-/AVVfacts bleibenunbekannt, keineRechtsfreigabe. RealeTeacher→Publication→LearnerFirebase-Abnahme/Ruleslive/physischerQR/iPad/klassengroßeLast/Nutzerabnahme/paidGen unbekannt. Previewfreigabe nach unabhängigerAbnahme+exactCI erforderlich; kanonischesGesamtstaging/Production ausgeschlossen.

Modell requestedSol/high fürComplexsourcevariant/Sicherheitsgrenzen; actualRuntimeModel/Effort/Usageunknown. DokumentierteRulings: WebGC39 alsRuntimebasis, keineDocsMainGesamtübernahme; begrenztePuffer+ehrlicheWiederholung erfüllenCountdownrobustheit, keineunbegrenzteNeuaufgaben-/Kostenbehauptung; bestehenderTransport stattneuerProviderkeys. Lernwirksamkeit nichtgemessen.

Genau nächsterSchritt: letzten Source-/Previewfixcommit sichern, exaktenRemoteTree+DraftPR+CI binden, unabhängig finalreviewen. KeineProviderrequest läuft; lokalesynthetischeQA-Server8785/8786 laufen als zurückverfolgbareSession48042/35696. Versuche erhalten: normalgitpush scheiterte mangelsHTTPScredential, sichererConnectorGitobjectspfad genutzt; blob-ersterUnicodeLängencheck vorRefänderung abgebrochen, deterministischeBlobs ohneBlindRefretry wiederverwendet. KeinCredential ausgegeben oderFirebaseLogin-json gelesen.

## Abschließender Runtime-/Stagingbeleg14.10.2026

Remote RuntimeHEAD **7b35f9ff23c5b824ca0e85402a5270751c0b06c5**, DraftPR238 open/unmerged; Tree325482b916b5443b7bc001f03ef4a8d2f7070923 bytegleich lokal1510004509516c64a9b1e14da5f7680fe02f0a60. Codehead nach Review/CI unverändert. AIStagingChecks38574847338, Job115889128192 complete/success,27relevanteSteps inklusive Functions285/285, DOM6/6, sichereAssessment-/Rulesemulator-/Webregressions,170Build. Globzählung282 und frühereHead284 sind eigene Zählungen und werden nicht vermischt.

Unabhängiger [Codereview](../docs/learning/wissensreise-evidence-20261014/code-review-7b35.md) PASS, alle10Findings geschlossen,24/24RemoteBlobidentität. [FinaleBrowserQA](../docs/learning/wissensreise-evidence-20261014/browser-qa-7b35.md) PASS mit explizit synthetischem Firebase-/Providertransport; Produktbootstrap-Pause/Fortsetzen am finalenSource getestet. [852QA](../docs/learning/wissensreise-evidence-20261014/browser-qa-852c45d.md) und [17e0QA](../docs/learning/wissensreise-evidence-20261014/browser-qa-17e0f40.md) bleiben an ihreSHAs gebunden. Keine paidGen-, echteLogin- oder Geräteprüfung behauptet.

Root hat isoliertePreview und ausschließlich12NEUEFunctions ausdrücklich freigegeben. [Stagingreceipt](../docs/learning/wissensreise-evidence-20261014/staging-7b35.json): Kanalgradecrew-wissensreise-20261014,171Dateien inklusiveManifest,170/170PayloadHTTP200+SHA256,ReleaseCommit7b35.12NEUEFunctionsACTIVE/europe-west1/nodejs22;43bestehendeFunctions vollständigmetadatengleich;7neueLehrkraftendpunkte anonym401UNAUTHENTICATED,4privateLearningcollections anonym403. Hashes4ef0126...(secretsgebunden)/3114328...(sonstige) jeDefinition, keineSecretwerte gespeichert. KanonischesRelease8f869790/gc39 weiterhin unverändert, keineRules-/Productiondeploys. VorhandeneDB(default)FirestoreNative/Standard/eur3 nurMetadaten gelesen.

Nutzerlinks: [Wissensreise](https://hausaufgabe-staging--gradecrew-wissensreise-20261014-tg3201gy.web.app/learning.html), [Anmeldung und Remy-Testeditor](https://hausaufgabe-staging--gradecrew-wissensreise-20261014-tg3201gy.web.app/index.html). Schülerlink/QR entsteht nach eigener bewusster Lernfreigabe. Keine künstlicheLivePublication angelegt. Hostingexpires21.10.2026,15:56:04CEST.

Deploymentprozessteil29265Hosting/15649Functions beendetexit0. KeineProviderrequests oder Userdatawrites. Read-onlyReceiptchecks bestanden. ErsteJSstringify-Metadatenvergleichsprobe war wegenFeldreihenfolgefalse; stabilerDeepvergleich undPython bestätigten43/43unverändert. KeineCredentials ausgegeben oderFirebaseLogin-json gelesen. FrüheBlobUnicode-Längenprüfung vorRefänderung verworfen, bytegleicherTree danach unabhängig bestätigt.

Status **staging_deployed/isolated_preview_only**, nichtintegrated/user_tested/production. Offen: tatsächlicher angemeldeterTeacher→savedTest→publication→learnerCloudablauf, realeProvidersemantik/CloudTasksIAM/Nachfüllung, physischerQR/iPad/klassengroßeLast, Nutzerabnahme und übrigeMasterplan-Ausweitungen. Zusatzskillsverification-before-completion/finishing-a-development-branch/FirebaseHosting gelesen; bereits genehmigteDraftPR-/isolierteStagingwahl benötigt keine neue Optionsrunde. ExistingCLI15.32.0/lokalNode24/CloudNode22; keineKeys/Profile/Provider neu eingerichtet.

Genau nächsterSchritt: Martin öffnet die isoliertePreview, meldet sich überIndexan und wählt einen eigenen inaktivenTest. Code- und MainDocsPRs danach gezielt integrieren, niemals kanonischesStaging/Production automatischübernehmen.

Ergänzender unabhängiger [Live-Hosting-Browserbeleg](../docs/learning/wissensreise-evidence-20261014/browser-live-hosting-7b35.md): tatsächlicher Previeweinstieg und normales Loginmodal, Releaseprojekt/Commit/170-DateiManifest und4LiveUI-Hashes exakt geprüft, Konsole sauber. Kein angemeldeter Benutzer-, Lernsession- oder Generierungsstart.
