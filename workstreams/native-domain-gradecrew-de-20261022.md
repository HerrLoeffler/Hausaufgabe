# GC-DOMAIN-01 / GC-IOS-02 — Native Apps auf gradecrew.de

Stand: 22.10.2026. Ausführender Native-Fachchat: 01a10c75-8912-7a12-98f0-c9e78064aa2c. Domain-Fachchat: 01a15f06-837c-73b3-93fa-0d07a8104d3a. Martins dortigen direkten Auftrag gelesen: gradecrew.de als neue Live-Adresse, Apps abstimmen, alte Links und Konten weiter nutzbar. Bestehende Task-, Versuchs- und Budgethistorie fortgeführt. Angefordertes bzw. tatsächliches Runtime-Modell unbekannt; kein Modellwechsel.

## Aktueller Stand

Produktänderung in PR289 normal integriert: **24c0f856384f037ebe156e20dc20a03ae10c4cf8** auf feature/native-live-staging-20261018. Geprüfter Kandidat c85deddc408382f5b72aafdce0f7c33e917a11c8, Baum fcece5158ec034edba5ea28134bcdcb2c0558096. Mergebaum exakt gleich. Basis b9edcd6e765b6fe5479e18a50ac4a23fd41793e8 erhält Secure1.0(1171) und Teacher0.2.0(50).

Die vorhandenen automatischen Releaseketten laufen auf genau diesem Merge:

- Secure: **39851773269**, beim Start pending.
- Teacher: **39851773260**, beim Start queued.

Noch kein neuer Upload, keine Appleverarbeitung und keine neue physische Geräteabnahme behauptet. Nächster Schritt: diese beiden Läufe beobachten; nach Erfolg Appleverarbeitung, bestehende Testergruppen und gespeicherte Testhinweise nach Neuladen prüfen. Keine parallelen Starts oder blinden Wiederholungen.

## Produktumfang und Grenzen

Teacher verwendet gradecrew.de als öffentliche Live-Standardadresse. Eine exakte zusätzliche Hostliste erhält www.gradecrew.de und hausaufgabe-staging.web.app für Navigation; keine Wildcards. Native Bridge bleibt auf Hauptframe und den ausgewählten HTTPS-Origin begrenzt. Navigationserlaubnis gewährt keine Berechtigung für eine Bridge auf einem anderen Origin.

Secure trennt öffentliche Webadresse von unveränderter Projekt-ID/API-Adresse. Die Vorschau erzeugt gradecrew.de-Links und akzeptiert die bisherigen Schuladressen. Nativer Prüfungsrenderer, API und Abgabeprotokoll bleiben unverändert. Der Rechtsleser-Fallback verwendet den öffentlichen Host seiner Buildumgebung. Support-, Datenschutz- und Marketinglinks der Store-Quelldatei zeigen auf gradecrew.de; deren übrige historische Metadaten sind kein aktueller Vollstatus.

Erhalten bleiben Firebase-Projekt, Functions- und Authhost, Preference-Keys, Keychain-Dienste, Queue-/Workdirectory-IDs, AAC, Zeitlimit, Antworten und Receipt-Bedingungen. Die Test-App bleibt ausschließlich auf gradecrew-staging-2026. Keine Web-, Functions-, Rules- oder Hostingdateien geändert. Keine Datenmigration, App-Review-Einreichung oder Vertragsänderung.

Alte installierte Apps und alte Links bleiben nutzbar. Konten und Tests bleiben dieselben; Browser-/WebView-Sitzungen sind je Origin getrennt. Auf der neuen Adresse kann eine erneute Anmeldung nötig sein. Das ist keine Kontenmigration und kein Verlust des alten Kontos.

## Tatsächliche Prüfungen

- Neuer Foundation-Routingtest scheiterte vor der Änderung am erwarteten gradecrew.de-Host; Rotbeleg /private/tmp/gc-native-domain-red.log. Danach beide kompilierten Live-/Stagingvarianten bestanden, einschließlich erlaubter Legacy-/WWW-Navigation und ablehnender Fremdprojekt-, Lookalike-, HTTP-, Port- und Credentialfälle. Bridge bleibt same-origin.
- 16 Python-Prüfskripte, 67 Node-Tests und 28 Swift-Tests bestanden. Teacher-Release- und SecureLive-Simulatorbuilds erfolgreich. Beide Gerätefamilien bleiben erhalten; Teacher ab iOS16, Secure ab iOS17.
- Layoutsource-Guard bestätigte 36/36 gepinnte Webdateien. Das ist kein physischer Login-/Gerätebeleg.
- Unabhängiger read-only Reviewer native_domain_review22 fand im Produktdiff f40db10 und in der separaten CI-Zeile 51be8d2 keine konkreten P0–P2-Probleme. Der Reviewer führte keine Vollbuilds, Signierung, Netzdienste oder Gerätetests aus.
- Exakter Premerge-CI-Lauf **39848507858** auf c85deddc: completed/success. Native-check erfolgreich. Phone und Tablet jeweils **114 native + 204 Webfälle, 0 issues, Xcode exit0**; je117 Fixture-/Detector-Tests bestanden.

Der bestehende Native-PR-Workflow hatte nur den historischen shared-design-Zielbranch. Der aktuelle Native-Releasebranch wurde additiv ergänzt; Jobs, Berechtigungen und Pfadfilter unverändert. So gelten die vorhandenen Prüfungen auch vor der aktuellen Native-Integration.

Erhaltene Diagnosehistorie: erster Development-Status-Aufruf aus falschem /tmp-Skriptort fehlgeschlagen, zweiter im Checkout erfolgreich. Zunächst fehlte lokales jsdom; vorhandene gepinnte Abhängigkeit nur im eigenen Checkout verknüpft, alle Tests erneut bestanden und Symlink anschließend entfernt. SwiftPM/Iconrasterisierung zuerst durch OS-Sandbox blockiert, regulär genehmigte Ausführung außerhalb der Sandbox erfolgreich. Keine Umgehung von Apple-Signierung/AAC. Shellpush mangels Git-Anmeldung nicht möglich; regulären GitHub-Connector verwendet und Baumgleichheit bestätigt.

Vor Umsetzung main-Einstieg/AGENTS/CHAT_CONTRACT und Assurance-Rollen gelesen. Frischer main f1e030ca, Development Status39843476057 success sowie lokaler Status22.10.20:18UTC geprüft. Keine konkurrierenden Native-PRs in der gelesenen Liste. Alte Registry-/Branchwarnungen nicht als neue Aufgaben übernommen.

## Apple-Links tatsächlich gespeichert

Nach Martins direkter Antwort „hab mich angemeldet“ bestehende Apple-Sitzung verwendet. In beiden vorhandenen App-Einträgen Secure6817526711 und Teacher6817547234 gespeichert und nach Neuladen bestätigt:

- Support: https://gradecrew.de/support.html
- Marketing: https://gradecrew.de/
- Datenschutz: https://gradecrew.de/datenschutz.html

Lokale Belege: outputs/native-domain-20261022/apple-privacy-domain.jpg und apple-teacher-privacy-domain.jpg. Keine Datentypkategorien, Altersangaben, Verträge, Buildzuordnung oder App-Review-Einreichung geändert. Teacher-Storeentwurf ansonsten noch weitgehend leer; keine vollständige Teacher-Storevorbereitung behauptet. Secure-Storeentwurf weiterhin mit1141, TestFlight1171 separat.

Apple-Developer-Supportportal zeigt die bestehende Anfrage als registriert, aber keine inhaltliche Antwort. Anschließend gezielte Suche nach der Fallnummer über alle Postfächer im vorhandenen Mailprogramm: genau eine Nachricht, Apples Eingangsbestätigung vom22.10. um14:19. Text bestätigt Empfang und spätere Rückmeldung; keine inhaltliche Antwort zu dieser Anfrage gefunden. Andere Nachrichten nicht für diesen Auftrag ausgewertet oder weitergegeben. Privaten Fallidentifikator nicht neu ins öffentliche Repo übernommen. Händlerhinweis wird weiterhin angezeigt; keine Händlerfreigabe aus Domainwechsel abgeleitet.

## Assurance und Webübergabe

Betroffener Umfang: SEC04/06/07/14/17 für Host-, Bridge-, Auth- und Persistenzgrenzen; PRIV07/17/20 für unveränderten Datenpfad und transparente Kontensitzungen. Begrenzte Code-/Review-/Testnachweise oben. Signierung/Upload und physische Geräteabnahme dieses neuen Kandidaten noch offen. Neue Inhalte, Tracking und Bezahlung außerhalb dieses URLdiffs; keine pauschale Sicherheits- oder Rechtsfreigabe.

Webowner: PR282 integriert als750212e7a38df4d0bbce833d2ae46b3f8f8b2b68 nach CI39848742312success und ReviewPASS. Mainstatus PR283 integriert alscb1b0e284e97f072db058b7705cdb70c45943a3a;42STATE-/61Registryeinträge erhalten. Main kanonisch gradecrew.de, alte Origin als alternate_url; gleicher Hostinginhalt ab6fcc9d mit173Assets. Beide Domains CERT_ACTIVE. Webowner bestätigt additive Authdomains, synthetischen Login/Reload/Logout, identische UID bei alter/neuer Origin und tatsächliches QR-Decoding. Das sind Webownerbelege, keine physischen Native-Gerätetests. Mainstatus nicht parallel überschrieben; Domainowner sammelt abschließende Nativebelege.

## Teacher-CI-Fehllauf und begrenzte Wiederholung

Teacher39851773260/Versuch1: Phone-Layout erfolgreich. Tabletjob120079558171 fehlgeschlagen, Uploadjob120092470365 korrekt übersprungen. Artifact12458413199 gesichert; alle114nativen/204Webberichte ohne Geometriebefund, aberXcodeexit65. Tatsächlicher Fehler: WebLayoutTests.swift:79, testWebLargeTabletMedia, Fixture web-screen_workspace-lang_de-role_admin-ipad-11 wurde innerhalb der100×100ms-Readinessabfrage nicht fertig. Sichtbarer DOMinhalt war geladen; WebKitprozess-/GPU-/Networkingstart im Log verzögert. Dieselbe Workspaceprobe wird später in der Matrix erneut ausgeführt und erzeugte einen gültigen Bericht. Exakt gleicher Produktbaum hatte im Premergelauf bereits beide Matrizen bestanden. Kein Live-Backend-/Domainfehler daraus bewiesen.

Nach dieser Diagnose genau eine Wiederholung nur fehlgeschlagener Jobs desselben unveränderlichen Runs angefordert, kein neuer Quellkandidat/kein zweiter Workflowstart/keine abgeschwächte Assertion. ErfolgreicherPhonejob wird nicht bewusst wiederholt. Erster Fehler samtArtifact bleibt erhalten. Bei erneutem Fehler keine blinde Schleife, sondern Readinessharness gezielt untersuchen. NeuerUpload/Versuch2-Erfolg weiterhin offen.

Versuch2-Layout erfolgreich: Phone+Tablet je114native/204Web,0issues,Xcode0. Uploadjob120103570895 baute Archive51 erfolgreich. Apple lookupGenericSettingsForSubmission lieferte HTML Bad Gateway; exportArchive endete vor Upload mit exit70. Keine Zugangsdatenänderung daraus abgeleitet. Nach konkreter Diagnose eine begrenzte failed-job-only Wiederholung (Versuch3) nur dieses neuen Uploadfehlers gestartet; erfolgreiche Layoutjobs bleiben erhalten. Kein dritter blinder Readinesslauf.

## Release-Nachprüfung

Teacher0.2.0(51) bei Apple hochgeladen21:44:55UTC, Run39851773260Versuch3/Job120105359113. Verarbeitetes Applebuild81d29edb-22ab-4f6e-9646-e012846a21f9, bestehende interne Gruppe dc56bf59-ad42-45c9-b3bc-b961178fc0b8 mit1Tester, deutsche Testhinweise nachReload bestätigt. Kein AppReview-/AppStoreRelease.

Secure39851773269: vorgelagerte native900/900, iPadsmini/pro je360Web+12Interaktionen, iPhone540native+216Web+12Interaktionen+6Returnflows allegrün. Uploadjob120101109957 scheiterte dagegen in zusätzlich ausgeführter nativerSmokeprüfung mitXcode65,40/40Berichte ohneGeometriebefund; Web16 und12Interaktionen bestanden. KeinArchive/Upload. Der ursprüngliche Workflow sichert verschachtelteSmokelogs nicht alsArtifact; genaueUrsacheunbekannt. Nicht alsProdukt-/Applefehlerbehauptet. Unveränderte lokaleSmoke-Nachstellung im eigeneniPadPro13/iOS27 bestand40/40 samtLifecycle-/Returntests,Xcode0, Logs+xcresult unter /private/tmp/gc-secure-domain-smoke-diagnosis-20261022. CI verwendetiOS26.5; keinidentischerRuntimebeleg. AufgrundvollerVorgatesundlokalerAbnahmegenaueinebegrenztefailed-job-onlyWiederholung gestartet (Versuch2, erwarteterBuild1192nurbeiUpload). BeiWiederholung zuerstDiagnoseausgabeergänzen,keineblindeSchleife.

Tastaturfix weiterhin separatDraftPR294, Produktbaum5eb8b872; Reviewdokumentation b156c122. KeinBestandteilderDomainquelle24c0f856.

Checkpoint23.10.MESZ: Secure-Versuch2 wartete hinter separatemClassroom-Stagingrun39858281409/Run20/efc5e980e87adaf628ec20eb5c03105c73d9ceb7. Dieser kann alsBuild1201untergleicherBundleerscheinen, istkeinLivebuild1192. Nichtabgebrochen/umgedeutet. UnserRetryjob120113836876ist inzwischeninprogress, unveränderterSource24c0f856, zusätzlicheFunktionstests. NochkeinenUploadoderBereitschaftvon1192behauptet. Teacher51istfertigmitReloadbelegundbestehenderTestergruppe. Martins direktehiesigeSendefreigabefürAbschlussberichtanDomainchatliegtvor; vorherigeAutoReviewablehnungwaraufKommunikationbegrenztunddanachaufgelöst.

## Abschließender TestFlight-Stand — 23.10.2026 MESZ

Secure **1.0 (1192)** ist hochgeladen und verarbeitet. Run39851773269, Versuch2, Job120113836876: success. Quelle unverändert24c0f856384f037ebe156e20dc20a03ae10c4cf8. Zusätzliche Smokeprüfung:40native/16Web/12Interaktionen bestanden; alle drei Simulator-Schemata erfolgreich. Archive22:17:05UTC und Export22:17:31UTC erfolgreich. AAC in signierter App und Distributionprofil für de.gradecrew.secure bestätigt. UPLOAD SUCCEEDED ohne Fehler am22.10.22:19:33UTC. Die genaue Ursache des ursprünglichen Smoke-Xcode65 bleibt mangels gesichertem Detailprotokoll unbekannt; der erfolgreiche Retry ist kein behaupteter Produktfix.

Applebuild e15b45bf-b928-4195-a849-9c26688781f9 gehört zur bestehenden internen Gruppe55873446-2ca1-4f80-af1f-66e1ec5f41a1 mit1Tester. Deutsche Hinweise als LIVE-Schulversion1192 gespeichert, Status „Gesichert“ gesehen, danach Reload und vollständiger Textvergleich PASS. UI-Beleg: outputs/native-domain-20261022/secure1192-ready.jpg.

Teacher **0.2.0 (51)** ist ebenfalls verarbeitet, bestehender Gruppe mit1Tester zugeordnet und mit gespeicherten, nach Reload bestätigten Hinweisen versehen. UI-Beleg: teacher51-ready.jpg. Beide TestFlight-Seiten bleiben als Ergebnis offen. Keine App-Review-Einreichung und keine öffentliche App-Store-Freigabe. Physische Abnahme dieser Domainbuilds bleibt offen.

Installationsziel für Live: Secure1.0(1192) und Teacher0.2.0(51). Separate Classroom-Stagingbuilds nicht anhand höherer Nummern als Live interpretieren. Falls TestFlight später weitere Testbuilds anzeigt, „Vorherige Builds“ und die explizit mit LIVE benannten Hinweise verwenden. Den Classroom-Lauf weder abgebrochen noch als eigenen fertigen Livebuild behauptet.

Getrennt offen bleiben: Tastaturkorrektur DraftPR294 (unabhängig geprüft und lokal getestet, noch nicht integriert), bessere Sicherung der verschachtelten CI-Fehlerdiagnose bei Wiederauftreten, physische Domain-/Offlineabnahme sowie Apples inhaltliche Supportantwort und App-Store-Freigabe. Bestehende Task- und Budgethistorie bleibt erhalten. Endreceipts gehen mit Martins ausdrücklicher Freigabe an den Domainowner; dieser aktualisiert den gemeinsamen Mainstatus. Keine parallele Mainmutation hier.
