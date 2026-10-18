# GC-BRAND-HERO-MOTION-20261013 — Dashboard/iPad, 18.10.2026

Owner: bestehender Design-Fachchat 01a130fa-babb-7de3-bfeb-785499e7c061. Taskhistorie weiterhin workstreams/gc-brand-hero-motion-20261013.md auf dem ursprünglichen Docsbranch; dortige Experimentarbeit bleibt unverändert.

Neuer Human-Scope: angemeldetes Dashboard kompakter auf iPad; Neuer Test rechts oben, Crew kennenlernen klein in Kopfzeile; nach fünf echten Anmeldungen ausblenden und dauerhaft Einstellungen→Tutorial starten. Plan vor Umsetzung: docs/superpowers/plans/2026-10-18-dashboard-ipad-tutorial.md. Inline-Ausführung ausdrücklich durch „erst Plan schreiben, dann umsetzen“; keine neue Freigabeschleife für Code.

Basis 2e718ae44519fc22a7c64ad354b62dd26a6999ca, kanonischer Integrationsbranch. Eigenes isoliertes Worktree /private/tmp/gc-dashboard-ipad-20261018, Branch fix/tutorial-dashboard-ipad-20261018. Native-Worktree-Tool scheiterte „Not a git repository“ im Projektmirror; daher autorisierter Git-Worktree-Fallback, fremde Checkouts unverändert.

Live Development Status39142552587 / Job117719766665 gelesen: keine aktuelle konkurrierende Dashboardplatzierung, historische Telemetrie-App-Überschneidung und fremde Rules/Visual/iOS-PRs bleiben getrennt; vor Integration frisch abgleichen. Main-Einstieg/Regeln/STATE/TODO/Registry/Contract und passende Dashboard-/Tourquellen frisch gelesen. Eigene Docsbranch-Historie 1c818979 bleibt erhalten.

Ursache: mehrfach gestapelte absolute/grid/center Dashboardregeln plus Decorator, der den großen Crewblock neu anlegt. Relevante Kontrollen SEC06/07/15/18 und PRIV07/12/15/19: nur eigene begrenzte Onboardingpräferenz, keine Authrechteänderung, keine Rohzeitstempel/Tracking. Originaltour und Gäste unverändert, Ownerprofile-Transaktions-/Stale-Generation-Tests erforderlich. Unabhängige Review-/CI-/Releasebelege stehen noch aus.

Status branch_only, Planung/baseline. Keine bezahlten Aufrufe, neue Guardianreservierung oder Modellwechsel. Step ist lokale UI/Auth-Session-Diagnose, nicht reine CSSroutine; angefordert/bisher tatsächlich beobachtetes Runtime-Modell/Effort/Usage unknown. Keine Delegation bisher. Production ausdrücklich ausgeschlossen.

Nächster Schritt: Zähler-/DOMtests erst rot, dann Implementierung laut Plan.

## Implementierung / erster geprüfter Checkpoint

36/36 gezielte Tests grün: fünf vs. sechs Logins, Refresh-Deduplikation, parallele Sitzungen/Transaktionsretry, getrennte Konten, Offline/fehlende Metadaten, Stale-Generation, spätere Einstellungenänderung, echter Settings→Dashboard→Tour-Aufruf, vorhandene Tour-/Workspace-/i18n-Flows. Zunächst fehlende neue Module erwartungsgemäß rot; danach UI-Dependencies als relative Fremdsymlinks im Kopierversuch nicht auflösbar, durch echte lokale Kopie der unveränderten jsdom26.1.0-Abhängigkeiten behoben. Alle bisherigen Fehler bleiben als Versuchshistorie erhalten; kein Dependency-/Lockfilechange.

Ruling: optionale Metadatenaufnahme läuft nach gültigem Authprofil im Hintergrund; Anmeldung wartet nicht auf den Zähler. Späte Antworten dürfen ausschließlich beide Counterfelder aktualisieren, keine jüngeren Einstellungen oder fremde Konten. Nach erreichtem Cap keine weitere Transaktionsaufnahme. Es werden nur aktuelle Auth-Sessions neu beobachtet, kein historischer Loginbestand erfunden.

Original-Tourengine V7/V8 unverändert. Große Crew-Decorator-Karte und widersprüchliche absolute Center-Platzierung entfernt; ein vereinheitlichtes Headergrid ersetzt sie. Bestehendes Tutorialbutton-Element samt Handler in userBar verschoben; außerhalb Dashboard und ab Zähler6 versteckt. Dauerhafter Button in Einstellungen. Neue Runtime-Module im Stagingbuilder und CI-Tourtests enthalten; Versionskandidat gc41.

Nächster Schritt: lokaler Vergleich mit Originalstyles auf iPadgrößen, dann vollständige relevante Regressionen/Build, unabhängiges Review und exakte Cloud-CI. Noch kein Stagingdeploy.

## Ergänzter lokaler Prüfstand

Codecheckpoint auf GitHub 0827b9ce5ac53cf3d5046521014d94e681ccbb60, Baum identisch zu lokalem Commit61f147c (9ab243ea…). CLI-Push war wegen fehlender CLI-Anmeldedaten eindeutig abgebrochen; vorhandener GitHub-Connector hat den identischen Dateibaum gesichert. Kein Credentialzugriff oder Geschichtsreset. CI39157144848 auf erstem Zwischenstand rot; neue importierte UI-Helfer fehlten in zwei bestehenden VM-Testbindings. Tatsächliche Helfer in diesen Fixtures ergänzt; kein Produktguard abgeschwächt. Neue SDK-Transaktion ist in der loopback-only Firebase-Fixture ausdrücklich verboten exportiert, damit der vollständige isolierte Appimport weiter funktioniert. Startup-Appcachekey aktualisiert.

65/65 erweiterte Regressionen lokal grün, darunter echte vollständige vorbereitete Tourpfade bis Create-, Settings- und Gastabschluss. Separater Entry/ET-Lauf10/10 grün; historischer globaler Document-Cleanup-Warntext im Entryfixture separat erhalten, kein Browserfehler behauptet. Build167Dateien gc41 erfolgreich. Layoutprobe tools/ui/dashboard-layout-preview.html/.mjs nur synthetische Daten/CSPconnectnone, nicht Staging-Allowlist. Server8785 Session42661. Browser-ID änderte sich seit14.10.; nach Inventory tatsächliche IAB3 gebunden, vorhandene User-Tabs unberührt.

1366×1024: neuer CTA160.55×52px rechts oben, Tutorial154.22×44px in Kopfzeile, pageWidth1366 ohne horizontalen Überlauf. iPadportrait zeigte noch alte1150px-Ein-Spalten-Regel; diese im vorhandenen Block entfernt, Einspalte nur650px. Inline78×86-Absolute-Styles an Remy entfernt; objektgetreue38×42pxDarstellung. Hochformat/Phoneprüfung läuft. Keine Stagingveröffentlichung bisher.

## Releasefähiger Kandidat und unabhängige Prüfung

PR243, Remote bc57deea2cda3ebed77c0639a32bd6dab67a503b, Baum af52a11ca42fcd5550cf480c559dbd136f3fa67c identisch lokal6ad2b5c. Exakte AI Staging Checks39157540172/Job117763765417 komplett erfolgreich, inklusive Functions, Emulatorregeln, Browser-/Gasttour und Stagingbuild. Ursprünglicher Fehler in39157144848/117762586777 tatsächlich aus Log gelesen: fehlende syncDashboardTutorialEntry-Testbindung; behoben wie oben, kein verdeckter Produktfehler. Lokale Root-Gesamtsuite346/346 grün.

Unabhängiger frischer Reviewer dashboard_review gemäß requesting-code-review-Skill, angefordert Sol/medium: auf lokal6ad2b5c keine actionable Befunde,19/19 Fokuschecks grün; Originaltour byte-identisch. Tatsächlich ausgeführtes Modell/Kosten/Usage nicht beobachtet. Kein bezahlter API-Start. Grenze: Transaktionsmocks belegen nicht live Auth-Metadatengenauigkeit/Rules; Geräteabnahme bleibt offen.

CUA mit Originalstyles und synthetischem Profil:1366×1024,1024×1366,768×1024,390×844 ohne horizontalen Überlauf. Bei768 CTA160.55×52 rechts oben, Crew154.22×44 in Kopfzeile. Erste/fünfte sichtbar, sechste verborgen; Einstellungen→Tutorial starten öffnet sichtbar die unveränderte Coco-Originaltour auch bei Zähler6. Lokale Screenshots unter eigenem Visualisierungsverzeichnis gradecrew-dashboard-ipad-20261018 (landscape/portrait/small/phone/settings-restart). Keine echte iPad-Safari-Abnahme behauptet.

Frischer Development Status39157702677/Job117764252745 gelesen. Ziel inzwischen a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d mit pädagogischem Pool; dessen zehn Dateien ausschließlich Functions/Dokumentation, keine Überlappung mit Dashboardpatch. PR-Mergebaum9746a2459daddb36e25fab88fbc3b0dde2fb8b62 von GitHub sauber erzeugt. Dieser Zielstand wird ohne Zurücksetzen eigener Historie in den Kandidaten übernommen; neue exakte kombinierte CI vor Integration. Andere aktuelle PR242(Lückentext),186(Coco),191(Privacy) unverändert. Öffentliche Homepage, separates Experiment und Production weiterhin unverändert. Stufe bis zur kombinierten CI ci_green des isolierten Dashboardbaums, noch kein Dashboard-Stagingdeploy.

## Integration geprüft, endgültiger Release läuft

Kombinierter Kandidat4b30fd5a6c73ca132a03f9201586c05bce226c74 enthält bewusst den aktuellen Aufgabenpool. AI Staging Checks39158023424/Job117765199449 vollständig erfolgreich,167DateienBuild gc41. PR243 nach frischem unverändertem Zielabgleich normal gemerged:7a18445f926a16b9a795c761f9863d7ecfb6b3b0, Baum2cfda99ce53877f9d0abd5c4f2e3c5cf7e53a65f bytegleich zum kombinierten Kandidaten. Endgültige Integrations-CI39158225634 läuft; separater Mobile-Tutorialcheck39158225635/117765805699 erfolgreich. Stufe integrated, noch kein Dashboard-Stagingdeploy behauptet. Öffentliche Homepage/Experimentdateien im Patch unverändert.

Lokaler direkter HTTP-Leseversuch auf Staging-release.json scheiterte an gesperrter DNS im Sandboxnetz, ohne Schreibversuch. Kein Zertifikat-/Netzschutz abgeschaltet. Endgültiger Remote-Nachweis über genehmigten Netzwerkzugriff und Workflowreceipt, keine Ersatzbehauptung aus lokaler Layoutprobe.


## Vorschau bestätigt und kanonische Übernahme beauftragt

Endgültige CI39158225634/117765805627 vollständig erfolgreich, Build gc41/167Dateien. Hostingpreview39158385658 vollständig erfolgreich: Source12147996967, Build12147517264, Receipt12147502437. Checkout/Build/Deploylogs binden explizit7a18445f926a16b9a795c761f9863d7ecfb6b3b0; Previewprüfung aller Manifestdateien erfolgreich. Kanonische Übernahme derselben Vorschau über append-only automation/canonical-staging-requests/gc-dashboard-ipad-tutorial-20261018.json, previewRunId39158385658. Bis Receipt nur Hostingpreview verifiziert, keine normale Stagingveröffentlichung behauptet. Automatisch vorhandener paralleler Functionsworkflow39158385700 nicht als eigener Backendfix beansprucht; dieser Task ändert keine Functions-/Rulesquellen. Geräte-/Kontozählerabnahme bleibt offen.


## Kanonisches Staging gc41 verifiziert — 18.10.2026

Stufe staging_deployed für den angemeldeten Dashboard-Webumfang. Kanonische Übernahme39158573068/Job117766874809 vollständig erfolgreich, Receiptartefakt12147573847 bindet an7a18445f926a16b9a795c761f9863d7ecfb6b3b0. https://hausaufgabe-staging.web.app/ liefert2.3.1-gc41; genehmigte unabhängige HTTP-Prüfung aller167Manifestdateien vollständig identisch. Lokaler Nachweis canonical-public-verification.json und canonical-release.json im eigenen Visualisierungsverzeichnis. Tatsächlicher öffentlicher Browserstart lädtgc41 ohne erfasste Konsolenfehler; keine Anmeldung oder Annahme eines echten Kontozähler-/Safari-Gerätetests. [Maschinenlesbare Belege](dashboard-ipad-tutorial-receipts-20261018.json).

Der bestehende automatische Backendworkflow39158385700: Assessmentjob117766319432 erfolgreich; AIjob117766319476 bricht vor Update im vorhandenen non-interactive Löschschutz ab, weil zwölf bestehende Learning-Funktionen nicht in diesem Integrationsquellstand stehen. Tatsächliches Log gelesen, keine Löschung/force/Wiederholung ausgeführt. Dieser Frontendtask benötigt keinen Backend-/Ruleswechsel; vorheriger gezielter Pool-Functionsrelease aus a425 bleibt eigener Nachweis. Nicht alle parallelen Workflows als grün melden. Public Homepage, separates Experiment und Production vom Dashboardpatch unverändert.

Auftrag umgesetzt, normale Stagingbereitstellung belegt; offene visuelle Abnahme auf echtem iPad/iPhone und echter Kontozählerverlauf separat. Nächster Schritt ausschließlich Martin prüft angemeldetes Dashboard und Einstellungen→Tutorial starten am Gerät. Kein erneuter Deploy ohne neuen Fehlerbeleg, keine neuen Providerkosten oder zurückgesetzten Versuche.
