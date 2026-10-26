# Aufgabe: design-dashboard-v1

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – erste sichtbare Umsetzung der Design Foundation
- Aufgabenbranch: `feature/design-dashboard-v1`
- Basiscommit: `d42973e9e29361795f773f68e6d6ac8008c36917` (`feature/gradecrew-app-integration`)
- Integrations-PR: `#9` → `feature/gradecrew-app-integration`
- Betroffene Dateien: `shared/gradecrew-design/*`, `generated/*`, `native/Shared/*`, `tools/generate-gradecrew-design.mjs`, `startup.js`, `gradecrew-dashboard-foundation.css`, `tools/build-staging.mjs`, `gradecrew-design-foundation.test.mjs`, `.github/workflows/ai-staging-check.yml`, diese Übergabe
- Überschneidungen: Web-App/Tutorial auf `feature/gradecrew-app-integration`; älteres Shared-Design auf `feature/shared-gradecrew-design-system`. Keine Tutorial-, Assessment-, Backend- oder Security-Logik verändern.

## Ziel und gewünschtes Verhalten

Die erste sichtbare GradeCrew-Designumsetzung auf der aktuell verifizierten Web-Basis. Das vorhandene zentrale Token-/Asset-System wurde in den aktuellen Webstand übernommen. `Meine Tests` und Testkarten bilden den ersten Referenzscreen: ruhiger, klarer, konsistenter und technisch an dieselbe Designquelle wie spätere Web-/Native-Bausteine angebunden.

## Umfang / nicht verändern

Umgesetzt:
- plattformneutrale Design-Tokens Version `1.1.0`
- kanonisches Asset-Manifest für Coco, Remy, Emmi und Wilma
- Generator und generierte Web-/Swift-Ausgaben
- Tokens + isolierte Dashboard-Foundation werden über `startup.js` zuletzt geladen
- Staging-Build paketiert beide neuen Stylesheets
- Dashboard: ruhiger Seitenkopf, eindeutige Hauptaktion, kompakte Statusfilter, reduzierte Suche/Filter, klare TestCard-Hierarchie, Statusdarstellung, Empty State und responsive Regeln
- `+ Neuer Test` bleibt Hauptaktion; Papierkorb bleibt sekundär
- Remy bleibt kanonisch `elephant-create.svg`; der bestehende Startup-Alias für alte statische `falcon-create.svg`-Verwendungen bleibt bewusst erhalten, statt in diesem Teilschritt die große HTML-Datei nebenbei umzubauen
- Design-Branches laufen nun durch dieselbe vollständige AI-Staging-CI wie der Web-Integrationsbranch

Nicht verändert:
- Tutorial-State oder Tutorial-Interaktion
- Test-/Bewertungs-/Publishing-Logik
- Firestore/Functions/Security
- Schülerprüfung/Secure
- Production

## Akzeptanzkriterien

- Branch basiert exakt auf verifiziertem Webstand `d42973e`: erfüllt.
- Shared-Design-Quelle ist maschinenlesbar und bleibt Single Source of Truth: erfüllt.
- Neue CSS-Schicht bleibt von Schüler-/Secure-Selektoren getrennt: durch `gradecrew-design-foundation.test.mjs` abgesichert.
- `+ Neuer Test` bleibt eindeutige Hauptaktion; Papierkorb bleibt sekundär: umgesetzt.
- Suche/Filter sind visuell sekundär zu Testkarten: umgesetzt.
- Testkarten priorisieren Titel, Metadaten, Status und Hauptaktionen; seltene Aktionen bleiben unter `Weitere Aktionen`: umgesetzt, Rendererlogik unverändert.
- Touch-Ziele für zentrale Dashboard-Aktionen mindestens 44 px: über Shared-Token und CSS abgesichert.
- Staging-Build enthält beide neuen Stylesheets: CI-Smoke-Test erfolgreich.

## Zwischenstand

- Lokal geändert: nein; Änderungen direkt auf Aufgabenbranch über GitHub.
- Auf GitHub gesichert: ja. Letzter produktiver Design-Commit vor dieser Dokumentation: `037942515513ddc67a38cad0c6dabe6f74ca1c3f`.
- Geprüft: **AI Staging Checks #373 SUCCESS** auf `037942515513ddc67a38cad0c6dabe6f74ca1c3f` (Run `36877183196`). Enthalten: Functions, Secure-Backend/Client, Firestore-Regel-Emulator, Gate-E-Verträge, Browser-Regressionen, neuer Design-Regressionstest und Staging-Build.
- Frühere identische Produktbasis: AI Staging Checks #372 ebenfalls SUCCESS auf `be67c1592783826fd360d889c0d9bb0d75e80c9b`.
- PR: `#9`, Draft, mergebar; Ziel `feature/gradecrew-app-integration`.
- Deployed: nein. Dieser Designbranch selbst wurde nicht deployed.
- Gerätetest / visuelle Browserabnahme: nein.

## Offene Probleme und Unsicherheiten

- Der aktuelle Webstand enthält mehrere historische CSS-Schichten mit überlappenden Root-Variablen. Foundation V1 konsolidiert diese noch nicht vollständig; die neue letzte Schicht bleibt bewusst klein und reversibel.
- Automatisierte Tests belegen Struktur/Regressionen, nicht die visuelle Qualität im echten Browser. Die erste visuelle Abnahme soll über den verifizierten Preview-Channel nach Integration in `feature/gradecrew-app-integration` erfolgen.
- Der bekannte fehlgeschlagene 30er-Test, die gemeldete manuelle Tutorialabgabe und offene Production-Security-Gates sind durch diese Designarbeit weder verursacht noch behoben.

## Nächster konkreter Schritt

Nach erfolgreichem CI des Dokumentations-Checkpoints PR #9 in `feature/gradecrew-app-integration` integrieren. Dadurch läuft dort erneut die vollständige CI; bei Erfolg kann die bestehende automatische, verifizierte Staging-Preview den exakt getesteten Integrationscommit veröffentlichen. Anschließend Desktop + Mobile visuell prüfen und erst danach Dashboard V1 als Referenz akzeptieren oder feinjustieren.

## Wiederaufnahme nach Abbruch

Keine lokalen ungesicherten Dateien. Branch `feature/design-dashboard-v1`, PR #9 und diese Datei sind die Übergabe. Bis Integration + verifizierte Preview + visuelle Abnahme erfolgt sind, gilt die Änderung als **auf GitHub gesichert und automatisiert getestet**, nicht als visuell freigegeben oder Production-deployed.

## GC-DESIGN-02 — freigegebener Einbau, 26.10.2026

Martin autorisiert sichtbar direkt unter Thema das bestehende Wunschfeld mit Mikro und die klare Umbenennung der dauerhaften Vorlieben, zuerst ausschließlich separate Testseite; kein Live, Wizard bleibt spätere Idee. Konzeptquellen im eigenen Docsbranch docs/remy-form-concept-20261025, Commits70b5e1b/06374759 erhalten. Eigener sauberer isolierter Checkout nun auf feat/remy-wishes-placement-20261026 ab aktuellem Produktf8274f06616f5db9a15597f37229a15bb9bfa2c6. Mainb24ed867, START/AGENTS/STATE/TODO/Registry/CHAT_CONTRACT/README gelesen. DevelopmentStatus40271149866/Job121404031807 success auf gleichemMain; Detailwarnungen noch abzuholen. OffenePR303/Auth,306/PhET,254/Kapitel erkannt; vor Diff/Integration betroffeneDateien und Zusammenführung abgleichen. Kein bestehender Wünsche-Platzierungs-PR in der gelesenen offenen Liste gefunden.

Geplanter enger Scope: index.html Feld aiCustomNotes unmittelbar nach Thema, Überschrift/Hilfe und bestehendes Mikro in remy-ai-help.js; dauerhafte Vorlieben auch in den gc22/gc23/gc25-Texten und DE/EN-Katalogen konsistent. IDs/Requestschema/Parser/Prompts/Speicherverhalten/Medienlimits erhalten. Vor Veröffentlichung bestehende Formular-/Diktat-/Tutorialchecks und tatsächliche separate Browseransicht prüfen; eigener Hosting-Preview ausschließlich Projektgradecrew-staging-2026 statt bestehende Testrootdateien zu überschreiben. Kein Produktionsprojekt/Function/Rule/Providerstart.

Erster lesender Gitfetch durchSandboxDNSblockiert, regulär erlaubter eskalierterReadfetchdesselbenbekanntenCommits erfolgreich. EigenerCheckout sauber; kein fremdes Arbeitsverzeichnis verändert. Ausführungs-/Hosting-/Isolationsskills gelesen. Vor Produktänderung neuer unabhängiger UXreviewauftrag zur bestehenden Mac-Firmenzentrale durchZentrale eingetroffen; dieser Stand deshalb gesichert, Produktumsetzung noch nicht als begonnen/fertig behauptet. Nach dem getrennten Review beim ersten offenen Einbauschritt fortsetzen, Auftrag nicht verwerfen. Keine neuen Budget-/Versuchsreservierungen. TatsächlichesModell/Effort/Usage unknown.


### GC-DESIGN-02 · Einbauprüfung26.10
Wunschfeld unmittelbar nach Thema, bestehendes Mikro unverändert gebunden, dauerhafte Vorlieben konsistent benannt, bestehendes explizites und automatisches Speichern nur erklärt. Kein Backend-/Schema-/Parser-/Wizardwechsel. 65/65 Remy/Coreprüfungen grün; 54/54 Tutorial-/i18nprüfungen grün nach Aktualisierung zweier absichtlich umbenannter Text-Erwartungen. AllgemeineUI 23/24: Navigationstest refreshQuestionFeedbackNotice undefined; mit Originalindex des Produktbasiscommits und unverändertem app.js in isolierter Testhülle identisch reproduziert. Kein durch diese Änderung erzeugter Laufzeitbefund; kein fremderFix beigemischt. Unabhängiger finalerReview keine wichtigenBefunde; kleine Tutorial-/Toast-/Übersetzungsreste anschließend konsistent nachgezogen. DevelopmentStatusDetailLog121404031807 gelesen: Erfolg, Hinweise/Deprecations dokumentarisch, kein Wunschfeldblocker. SeparateFirmenzentraleHeuristik ohneCodeänderung unter work/gc-brain-ux-review-20261026 separat gesichert. Hostingpreview im getrennten Testprojekt noch offen; vor Beleg nicht als deployed bezeichnen.


### GC-DESIGN-02 · separate Vorschau veröffentlicht, 26.10.2026
Produktstand ef5df35099ac3e4cc71921e071d57ebf2ed9ab9f (e6c402ff Umsetzung, ff98f30b zugänglicherFeldname, ef5df350 Tutorial-Vorliebenziele geöffnet). 114/114 gezielte Prüfungen im letzten gemeinsamen Lauf; 54/54 früherer zusätzlicher i18n/Tutoriallauf. AllgemeineUI23/24, bekannter isoliert reproduzierter Baselinefixturefehler refreshQuestionFeedbackNotice bleibt ehrlich offen. Kein Backend/Parser/Request-/Speicherverhalten geändert.

Hosting-Channel ausschließlich gradecrew-staging-2026:remy-wishes-20261026, URL https://gradecrew-staging-2026--remy-wishes-20261026-6pt7rwsr.web.app/workspace.html, Ablauf02.11.2026 08:46 UTC lautCLI. Letzter Build /private/tmp/gc-remy-wishes-preview-verified-20261026, separater Hostingconfig ohne Functions/Rules. release.json öffentlich exakt gleich wie lokalerBuild, project/commit192Dateien passen. Öffentliche workspace.html/remy-ai-help.js/crew-tour-gc23-polish.js/app.js gegenSHA256desBuilds geprüft. Productionhausaufgabe-staging, Livegradecrew.de und bestehendeTestroot nicht deployed. KeineProvideranfrage/keinTeststart/keineauthentifizierteProfiländerung.

Browserprüfung im IAB: tatsächlicher Gastpfad Crew kennenlernen→Coco→NeuerTest→Remy→Formular. Feld direkt nachThema außerhalbDetails, Mic vorhanden, Endstand mitRoletextbox exaktemNamen auffindbar. ResponsivePrüfung bei1024x768 und390x844;390px Dokument ohnehorizontalenOverflow,Wunschfeld336pxbreit. KeinephysischeiPad-/iPhoneabnahme, keineechteMikrofonaufnahme behauptet. BestehendeDiktatpfade automatisiertgeprüft. Tutorialfolgefix: beimWechsel zumVorliebenhinweis wirdäußeresAkkordeongeöffnet, Vorliebeninhaltbleibtzu.

GitHub-Push wurde durch automatischeApprovalprüfung abgelehnt: externeBranchveröffentlichung ohneausdrücklicheCode-Egress-Freigabe imKontext einesgemeldetenfrüherenSchlüsselvorfalls. KeineUmgehung, keinPush/PR/Merge. Commitlokalgesichert;NutzerüberBlockinformiertundnachzusätzlicherFreigabegefragt, Testvorschau unabhängigfunktionsfähig. BisAntwort keinweitererUploadversuch. Taskfertig imangefragtenTestumfang, zusätzlicheRemotesicherungwartetoptionalaufFreigabe.

Endgültiger öffentlich geprüfter Build imBrowser erneut geladen: exakterzugänglicherWunschfeldname vorhanden (1Treffer), GastformularbisWünscheausgefüllt, „Wünsche übernehmen“→„Meine Vorlieben für künftige Tests“ tatsächlichsichtbar(true). Screenshot work/remy-wishes-preview-20261026.png außerhalbProduktrepo; Browseroverridezurückgesetzt,VorschautabalsErgebnisgehalten. KeinKonto, keinTestauftrag, keinProvider, keineProfiländerung.


### GC-DESIGN-02/GC-CREW-AI-04 · freigegebene Trennung und Liveauftrag26.10
Martin bestätigt zwei Eingaben: oben ausdrücklich nur Eckdaten (Fach/Klasse/Thema/Schwierigkeit/Anzahl), inhaltlicherPrüfauftrag ins bestehendeWunschfeld mit eigenemMikro; keinWizard, keinzweitesPflichtdiktat. ExpliziterneuerAuftrag „bring das bitte gleich auf gradecrew“. GenannteReferenz ist exakt eigenegeprüfteVorschau remy-wishes-20261026, daher vorhandenerBranch/Checkoutweiterverwendet. ÖffentlicheGradecrew.de und Legacyreleasezeigenweiterf8274f06; eigenerStand basiertgenaudort und enthält ausschließlich freigegebeneWunschfeldverbesserungen, keinenneuenParseransatz. Mainb24ed867 frischmitRegeln gelesen; DevelopmentStatus40327954575 success und offenePR310interaktiveTasks/254Kapitel/303Auth erkannt, werdennichtmitdeployed. Scope nurHostedWeb/UItexte, keineFunctions/Rules/Auth/Provider-/Speicheränderung. Liveziel nachRepositoryconfig hausaufgabe-staging/gradecrew.de, nicht das altehistorischehausaufgabe-40294. Neuer UIkopf, eindeutigbeschrifteteMikros, zugänglicheFeldhilfe undDE/EN; danachlokaleChecks, separateVorschau, unabhängigerReview, expliziterHosting-onlyLiveDeploy undöffentlichePrüfsummen. GitHubPush bleibtfrüher durchAutoreviewblockiert; keineerneuteUmgehung/PR-Erstellung. BudgetkeineProviderstarts, actualModell/Effort unknown.

Live-Preflight26.10: Produktcommit5f61f723c1b24d45996a77afbe40acc4ebb05cd3,114gezielteTestsgrün, unabhängigerReviewer27/27zusätzlichundkeinwichtigerBefund. Stagingchannelbestehendaktualisiert, echterGastbrowserzeigtEckdatenkopf/Erklärung/beideMic-/Feldnamen, keineErstellunganbieter. Productionbuild192Assets; exakt8FileHashesabweichendvonf8274f06:app.js(genehmigteSpeichercopy),workspace.html,Feld-/Tutorialtexthelfer22/23/25,gradecrew-tour-v7,remy-ai-help,en-Katalog. KeineStartseiten-/Legal-/Asset-/Config-/Backendänderung. AktuelleöffentlicheLivebasisunverändert, Rücksetzpaketaller192AssetsgegenaltesManifestverifiziertunter/private/tmp/gc-remy-intake-rollback-20261026. NächsterSchritt jetzt ausdrücklichautorisierterHosting-onlyDeploy mitisolierterProduktionsconfig, danachManifest/HTTPassetsprüfen; nochkeinErfolgbehauptet.


### Live-Veröffentlichung durch automatische Freigabeprüfung blockiert
ExpliziterVersuch Hosting-onlyProdukt5f61f723 gegenhausaufgabe-staging mitisolierterConfig /private/tmp/gc-remy-intake-production-20261026/firebase.json am26.10.2026. exec_command/CreateProcess wurde vorAusführung abgelehnt: „aufGradeCrewbringen“ gelte wegenfrüheremProductionverbot nichtalseindeutigeFreigabedieseskonkretenLiveziels. KeinDeployprozessgestartet/keineReleaseID, keineUmgehung/keinandererUploadversuch. NutzerkurzmitexaktemGrundinformiert undüberrequest_user_input_async eindeutiggefragt: „Ja, aufgradecrew.de liveveröffentlichen“ oder„NurTestvorschau“. BisAntwortkeinabhängigerLivevorgang. GeprüftevorbereiteteProduktionsdateien undRücksetzpaketbleibenbereit.

TatsächlicherStand: aufeigenemBranchlokalgesichert,114fokussierteTestsgrün plusunabhängige27Tests, bestehenderPreviewchannelremy-wishes-20261026 mit5f61f723erneuert (Ablauf02.11.202616:36:15 lautCLI). KeinneuerGitHubPush/PR/CI/Integration, keinLiveDeploy, keinBackend-/Rules-/Datenzugriff. NächsterSchritt ausschließlichkonkreteLiveantwortabwarten,dannfrischeLivebasisbestätigen unddenselbenexaktenHostingbuildpublizieren. Noch vorhandenerallgemeinerNavigationstest-BaselinefehlerundgeringfügigeLegacy-Fallbackbenennung dokumentiert, keineerfundeneGesamtabnahme.


### GC-DESIGN-02/GC-CREW-AI-04 · ausdrücklich freigegeben und live26.10.2026
Martin beantwortetdieselbekonkreteFreigabefrage ausdrücklich: „Ja, aufgradecrew.de liveveröffentlichen“. FrühereAutoreview-Livesperre damitmitgenauemZieladressiert, vorWiederholungfrischeLivebasisunverändertf8274f06undBuildalle192Hashesbestätigt. TatsächlicherCLIHosting-onlyDeploysuccess, Hostingversionc7668d2a1d4493fc, Produktcommit5f61f723c1b24d45996a77afbe40acc4ebb05cd3, gradecrew.de/Projekt hausaufgabe-staging. Öffentlicherelease.jsonexaktgleichBuild;alle192DateienperHTTPgegenSHA256verifiziert;Legacyhausaufgabe-staging.web.appManifestgleich. Receiptinworkstreams/remy-intake-live-receipt-20261026.json. KeinFunctions-/Rules-/Auth-/Datenbankdeploy.

Live-Browserprüfung aufhttps://gradecrew.de/workspace.html überbestehendenGastpfadCrew→NeuerTest→Remy: oberesEckdatenfeld/Mikro/Explizithinweis undWunschfelddirektunterThema/eigenesMikro sichtbar undzugänglichbenannt. KeinProviderstart/keinauthentifizierterTestoderProfilwrite.114fokussierteund27unabhängigeTestsdemunverändertenProduktcommitzugeordnet;keineGitHubCIbehauptet. VorhandenerallgemeinerFixture-Navigationstestfehlerbleibtdokumentiert, physischeMikrofon-/iPad-/iPhoneprüfungnichtbehauptet. KeinWizardoderParserneubau.

StatusproductionfürHosting/Weboberfläche;Prototypenreferenzbleibtgleich. GitHubPushweiterhinnichtautorisiertnachfrühererAutoreviewablehnungundnichtwiederholt, daherTODO/HDFundReceiptvorerstnurlokalgesichert,mainRegisterunverändert. ÖffentlicheReleasebelegedienenunabhängigalsDeploybeweis. NächsterSchrittNutzerprobiertzweiEingabenimnormalenKonto;keinweitererDeployerforderlich.

GRADECREW_STATE.json liegt nicht auf diesem Produktbranch; main-Register mangels separater GitHub-Schreibfreigabe nicht geändert. Release-Stufe und Belege ausdrücklich im lokalen Receipt und dieser Übergabe gesichert.
