# GC-WEB-REPAIR-20261007 — begrenztes gemeinsames Web-Paket

Martin autorisiert Web-Korrektur und Staging auf hausaufgabe-staging.web.app; Games/iOS/Production ausgeschlossen. Basis 4d6ee69 (veröffentlichte Emmi-Smiley-Korrektur). Einzelautoren: UI im vorhandenen Hero-Chat/PR157, Remy lokal7312621, Audio lokal d179527. Main integriert seriell auf feature/audio-web-repair-20261007; keine zusätzlichen bezahlten Provider-Aufrufe als Tests.

Umsetzung: ruhigere Crew-Bühne, Login oben/Testcode hervorgehoben, Accountaktionen rechts und mehr Desktopbreite, neutralere Aktionslabels, gezielte sichtbare Markwords-Glyphenbereinigung. Remy trennt Thema/Medien/Stil, versteht Zahlwörter und priorisiert explizite Gesamtzahl vor Audio-Untermenge. Neue Titel/Fortschrittsanzeigen nutzen Thema. Form bietet getrennte Höraufgaben und vorgelesene Antwortmöglichkeiten.

Audio: Text und Audio/supplement bleibt Standard für vorhandene Daten; Nur hören/listening-only ist explizit wählbar. Jede Audio-Auswahloption hat Player und neutrale Auswahl-ID, Antwortschlüssel bleiben serverseitig. Post-Test-Lösungsaudio bleibt getrennt geschützt; generisches „Lösungen als Audio“ im Erstellformular meint Audio-Auswahlantworten, explizites „nach dem Test“ weiterhin geschützte Erklärung. Root ergänzt statisches Feld, Telemetrie, Cacheversionen und CI-Anschluss für neue DOM-Tests.

Nachweise: Remy unabhängig7312621 geprüft54/54; Audio/faff04e unabhängig gegen immutableSource geprüft,2Befunde korrigiert und34/34 Nachtests. GesamteFrontend-Suite273/273 vor letztem UI-Locale-Diff; final erneut prüfen. Audioautor112gezielteBackend/Assessment/Legacy-Tests, schemas.test.js lokal ohneAjv nicht ausführbar; exakteCI muss vollständigeBackendchecks liefern. UIautor262Tests+Build, unabhängigesReview mit2Locale-Korrekturen, PR157. Keine echteBrowser/Geräteabnahme, früher administrativerBrowsercheckunavailable, keineUmgehung.

Offene funktionale Freigabe: Secure-Rules-Cutover ist nicht belegt. CurrentCI prüftRegeln imEmulator; Hosting/AI/AssessmentDeploys aktiviertenkeineRules. LiveRulesetohnebefugtenFirebaseLesezugriffunknown, lokaleFirebase/gcloudZugangsdatenfehlen. GatesC-F/30Teilnehmerfall stehenlautmain offen. Neue listening-only/Audioantwort-Modi sind daher alsEntwurfprüfbar, aberPublizieren/Wiederöffnen undserverStart/PaperRefreshstandardgeschlossen. KeineClientkonstantealleinalsSicherheitbehaupten. NormaleText+Audio/AltLösungsfreigabeunverändert. ÖffnungfordertLiveRulesnachweisundbestehendeGates; keine100ProzentFreigabeausTestzahlen.

Nächster Schritt: finalen gemeinsamenTreeprüfen, eigentlichenStagingBuildnachCommit, exactCI/Review, globaleIntegration, Hosting+AI/AssessmentReceipts undappendonlyCanonicalRequest. NeueSchülerAudiofreigabe bleibtgesperrtbisRuleGate; TestentwürfeundUI/Remy trotzdem aufStagingtestbar. Snapshot undZentrale mitbelegtenSHA/RunIDs fortschreiben.

CI-Korrektur Versuch1: exakterKandidat9a02af55, AI-Staging-Checks37546263251 Job112550893343 scheiterte an neuemrealenModul audio-release-gate, das im vorhandenenSecurity-VM-Testloader nicht registriert war (17Fixture-Ladefehler). Der Loader lädt nun das echteModul, keineStub-Freigabe/Guardabschaltung. VollständigeAssessmenttests danachfrischprüfen, nurgeändertenNachfolger publizieren; keinunveränderterRetry.

Integrationscheckpoint: Kandidaten-CI37546526741@7a1fe906 erfolgreich; PR159 tatsächlich als0931ade4e415690cc149c829c5f1a6703d085177 gemergt, identischerTreeebeb8151 bestätigt. Merge-CI37547012003 undMobile37547012032 laufen; keine neueVeröffentlichung behauptet. PR157 nach Codevergleich alsdurch159ersetztgeschlossen, Historieerhalten. Alte4d6ee69-ReleasesbleibenletzterbelegterTeststandbisneueReceipts.

## Verifizierte Staging-Veröffentlichung 07.10.2026

PR159 Head `7a1fe906f4295da9b1ca4576d92ab2768215c5b3` wurde als `0931ade4e415690cc149c829c5f1a6703d085177` in den Integrationsbranch gemergt. Merge-CI `37547012003` und Mobile-Check `37547012032` erfolgreich. Automatischer Hosting-Preview-Run `37547126018` mit Receipt `11450528574` bestätigt 120 Dateien auf Kanal `gradecrew-app-integration`; AI- und Assessment-Functions-Run `37547126016` mit Receipts `11451600189` und `11451256131` erfolgreich. Der append-only Request `automation/canonical-staging-requests/gc-web-repair-20261007-0931ade4.json` (main `39695376e4a682b0d6272feed8010ad0343cd4c6`) löste kanonischen Run `37547422005` aus. Dessen Receipt `11450254448` bestätigt https://hausaufgabe-staging.web.app/ mit Commit `0931ade4`, 120 Dateien und unveränderter Production. Keine Rules-Veröffentlichung; neue private Audio-Modi bleiben Entwurf. Nutzer-Login, Test-Erstellung/Speicherung und echte Geräteabnahme bleiben offen.

## 07.10.2026 — manuelle Sammlung statt automatischem Abholen

Automatisches Chat-Abholen auf Martins Wunsch pausiert; Ergebnisse künftig nur auf ausdrücklichen Auftrag sammeln. Automation `gradecrew-security-ergebnis-zur-ckholen` ist nachweislich PAUSED. Der vorhandene erfolgreiche kanonische Deploy `37547422005` und beide Functions-Deploys `37547126016` für `0931ade4` wurden bestätigt; kein zweiter Deploy und keine erneute Gesamtprüfung. Martin testet jetzt die veröffentlichte Website, Fehlerkorrekturen und Verbesserungen folgen separat. Die bestehende Entwurfssperre für neue private Audio-Modi bleibt erhalten.

## 07.10.2026 — Nutzerabnahme fehlgeschlagen, gezielte Korrektur

Martin belegt am veröffentlichten 0931ade4 weiterhin Fokus-/Layout-/Tutorial-, Remy-/Formular-Reset- und Audiofehler. Alle 23 vorhandenen Meldungen wurden über den UI-Diagnoseexport gelesen; neueste RPT-MUXC8FM3-74721 / 19E2BFI / serverReference 3bdb16e9 gehört laut Diagnose genau zu 0931ade4. Frühere Meldungen bleiben als Historie erhalten. Hero-Chat einmal abgeholt, idle, keine neue Autorenarbeit. Einziger Autor Main, bestehender isolierter Checkout auf fix/web-acceptance-regressions-20261007. Backend-Zwischencommit 97dafca: Audioquote gezielt reparieren und audioKind an Ersatzschema/-prompt weitergeben; beide neuen Regressionen zuerst rot, anschließend 19/19 Reparaturtests grün. Noch kein neuer Deploy. Automatische Sammlung bleibt PAUSED. Neue private Audio-Modi bleiben bis zum Rules-/Gate-Nachweis gesperrt; kein Production/Games/iOS und keine bezahlten Provider-Aufrufe als Tests.


## 2026-10-07 01:38:11 UTC — PR161 fertig geprüft, Integration offen

Martins Zusatzprompts als Hinweise geprüft; keine Scrollgeschichte. Bestehende Gestaltung wird durch kompakte Dashboard-Werkzeuge, Titelhierarchie, Filter-/Leerzustände und endliche Coco-Flügel-/Augenbewegung ergänzt (Reduced Motion statisch). Gezielte Korrekturen: Fokusoval, Coach-Zentrierung, Headerseitenabstände, versteckte Legacyfelder/Sortiergrip, Remy Themen-/Wunschtrennung und neues Formular, Ein-Klick-Audiokonvertierung, separate Memo-Player und Audio-Quotenreparatur. Alle 23 Meldungen gelesen; 14 technische Meldungen, 11 Incidents, historische Meldungen nicht pauschal als erledigt markiert.

Einziger finaler Produktkandidat PR161 `feature/audio-web-acceptance-20261007@23d8c97d7bf69de43929122d55b8aded9a9c192b`, identischer lokaler/Remote-Tree `36a579e672671d7cfd959b612a45d916cde0e34e`. Unabhängiges Review des lokalen `6ac3adc2cb46362091787791048a641d00eaa293` freigegeben. Zwei Review-Korrekturen bleiben dokumentiert: transienter WeakMap statt gespeichertem Busy-Feld, Abbruch-/Edit-/Fallback-Snapshot-Wächter. Keine weiteren Autorenaufträge/keine erneute Gesamtprüfung.

Exakte Kandidaten-CI `37557641806`/Job `112587453495` erfolgreich; Admin/BugOps `37557644426`/`37557644404` erfolgreich. Lokale Frontend-Gesamtsuite 313/313 vor zusätzlichem Fallbacktest, letzte gezielte Suite 38/38, Assessment 61/61. Funktionen lokal ohne einige Dependencies nicht vollständig ausführbar; exakte Remote-CI mit installierten Dependencies grün. Build123Dateien; lokale UI-Fixtures nicht im Build. Lokale tatsächliche DOM-Prüfungen bei360–1366px über bestehenden Chrome, keine Firebase/Provider-Aufrufe. Geräte-/Nutzerabnahme getrennt offen.

Aktuelles Integrationsziel noch `0931ade4e415690cc149c829c5f1a6703d085177`. Nächster Schritt: frischen Live-Status/Ziel abgleichen, PR161 seriell mergen, genauen Mergecommit/CI und neue automatische Hosting-Preview-/AI-/Assessment-Receipts prüfen, dann append-only canonical Request für genau diesen Preview. Vorher keine neue Veröffentlichung behaupten. Regeln/Private-Audio-Gates geschlossen; Production/Games/iOS ausgeschlossen; automatische Chat-Sammlung PAUSED.


## 2026-10-07 01:47:23 UTC — PR161 integriert, CSS-Nachfolger vor Hauptadresse

PR161 seriell als `7f91dea01591bc760548f48cf9bdf802a1b6b8c1` übernommen; Eltern0931ade4/23d8c97d, Tree36a579e6 identisch. Frisches Audit37558090157 erfolgreich; erwartete Überlappungen mit alten Security/Telemetry/Premergebranches eingeordnet, keine andere Arbeit integriert. MergeCI37558149290 + Mobile37558149323 erfolgreich. HostingPreview37558247664 mit Receipt11455751586 / Buildartifact11455955742 veröffentlicht; CI37558149290 undSHA7f91dea0 in Jobguards bestätigt, Manifest/alle Datei-Hashes verifiziert. AI/Assessment37558247462 mit Receipts11455707081 /11454763986 ebenfalls erfolgreich. Artifactdownload über Connector möglich, abgerufene File-URI lokal403; keine blinden Wiederholungen. OriginalWorkflowbelege und Canonical-Controller verifizieren die Artefakte selbst.

Realer Preview-Dashboard-Browser bestätigte aktuelle Oberfläche und bestehende Anmeldung; keine bezahlte Generierung. Er zeigte allerdings55px Seitenüberstand amDesktop1920 /305px bei390 durch transparente100%-Checkbox. Nach deren Korrektur fiel293px zusätzlicher Überstand durch Flex-Spaltenumbruch mobiler Aktionsbuttons auf. PR162 korrigiert ausschließlich4CSS-Zeilen: relatives Label und1px Checkbox; mobile Aktionen einspaltiges Grid. Root-Renderer bei390×844 danach0px Überstand; Tastaturbedienung erhalten. Beide Delta-Reviews unabhängig freigegeben, keine neue breite Prüfung. Lokaler cb5a5b3 undRemote02ac0203 haben gleichenTree d4649445. ExactCI37558728031 läuft, alter erster Headb0c0dde5/CI37558627402 bleibt Historie.

Noch keine kanonische Veröffentlichung dieses Pakets. Ausschließlich endgültigen CSS-Nachfolger nachexactCI, seriellerIntegration, frischenPreview-/FunctionsReceipts promoten. Preview7f91dea0 wegen bestätigter Layoutfehler nicht mehr promoten. PrivateAudiomodi bleibenEntwurf; Rules/Production/Games/iOS unverändert; Collector PAUSED.


## 2026-10-07 01:53:52 UTC — endgültiger Build, Hauptadresse angefordert

PR162 exactCI37558728031/Job112590895273 undAudit37558831068 erfolgreich; seriellerMerge `094546a44131a671daede5131e29def0da116002` mitEltern7f91dea0/02ac0203 undTree `d4649445e5b4e201c003baae1efd09d3fa7ca9e5` bestätigt. ExakteMergeCI37558924609/Job112591523793 sämtliche Schritte erfolgreich. AutomatischerPreview37559039697 liefertimmutableBuildartifact11456161538 (Digest0d8d41e2…) undReceipt11455947421; Quellenwächter bestätigenSHA094546a4/CI37558924609, veröffentlichteManifest-/Datei-Hashes vollständiggeprüft123Files. AI/Assessment37559039672 mitReceipts11455703400/11456380393, verifiziertenStagingFunctions undrichtigenSHA erfolgreich. Rules/Productionunverändert.

TatsächlichgeladenerPreview-Dashboardbrowser zeigtneueOberfläche, bestehendeAnmeldung,1pxCheckbox,0pxSeitenüberstandamDesktop1920. Lokale390×844-Ansicht ebenfalls0px undnativeSpace-/Fokusfunktionbestätigt. KeinebezahlteGenerierungoderGeräteabnahme. MobileTourruntimevorCSSdelta37558149323@7f91dea0grün; finalerCSS-StandüberexakteCombinedCIundgezielteBrowserprüfunggeprüft, keineerfundeneMobileRunID.

Append-onlyCanonicalrequest `automation/canonical-staging-requests/gc-web-acceptance-20261007-094546a4.json`: previewRunId37559039697, commit094546a4. KeinfrühererPreviewwirdpromotet. Canonical-ControllerprüftReceipt/OriginalCI/aktuellenBranch/Manifest/alleHashesundveröffentlichtausschließlichdasunveränderlicheBuildartefakt. NächstersichtbarerSchritt: existierendenRun+ReceiptfürHauptadresseabholenundCloseoutMain/Ledgersichern. NeueprivateAudiomodiweiterEntwurf; LiveRules/GatesC-F/30Teilnehmeroffen. KeineweitereCodearbeit,CollectorPAUSED.


## 2026-10-07 01:57:52 UTC — kanonisches Staging veröffentlicht

Der endgültige App-Commit ist `094546a44131a671daede5131e29def0da116002` (PR161 + CSS-Nachfolger PR162, Tree `d4649445e5b4e201c003baae1efd09d3fa7ca9e5`). Exakte Merge-CI `37558924609` ist erfolgreich. Preview `37559039697` liefert Buildartifact `11456161538` und Receipt `11455947421`; AI/Assessment-Run `37559039672` liefert getrennte Receipts `11455703400` und `11456380393`.

Der append-only Request auf main `41b87d7cdad352942716654099e56765a08f53ad` hat kanonischen Run `37559354641` ausgelöst. Der kanonische Job `112592905637` hat Original-CI, aktuellen Integrationscommit, unveränderliches Preview-Buildartefakt, Manifest und sämtliche Dateihashes geprüft und nur Staging Hosting veröffentlicht. Receipt `11456410883` (Digest `sha256:c5a24d48e6b6f5be4136ee4df5feb0cec5b9f68f8c73f3d7f2b5df1ad62d8589`) bestätigt die Veröffentlichung auf https://hausaufgabe-staging.web.app/ mit123Dateien. Kein Rules- oder Production-Deploy.

Der tatsächliche kanonische Browser zeigt die neue Oberfläche mit bestehender Anmeldung, 1px Veröffentlichungsschalter und0px horizontalem Überstand bei1920×902. Keine neuen Konsolenfehler. Die lokale tatsächliche390×844-Ansicht hat ebenfalls0px Überstand; native Space-Aktion und sichtbarer Tastaturfokus des Schalters sind geprüft. Screenshot lokal gesichert. Dies bestätigt die gezielten Browserabläufe, ersetzt weder echte Geräte-/Nutzerabnahme noch eine bezahlte Testgenerierung.

Auf Staging: gezielte Layout-/Tutorial-/Remy-/Reset- und Audio-Konvertierungs-/Quotenreparaturen, klarerer Arbeitsbereich, finite native Coco-Flügel-/Augenbewegung. Keine Scrollgeschichte. Bestehende fehlgeschlagene Aufträge und frühere Reports bleiben als Historie sichtbar; nicht pauschal erledigt markiert oder neu kostenpflichtig ausgeführt.

Noch offen: neue Tests durch Martin praktisch erstellen und Audio-Konvertierung prüfen; neue private listening-only/audio-only Modi bleiben Lehrkraft-Entwürfe bis Live-Secure-Rules und Gates C–F einschließlich30Teilnehmer-Fall nachgewiesen sind. Games, native iOS und Production sind ausgeschlossen. Automatisches Chat-Abholen bleibt PAUSED; keine neue Automation oder bezahlten Provider-Tests. Das autorisierte Staging-Paket ist veröffentlicht, die offenen Freigaben bleiben sichtbar.


## 2026-10-07 07:20 Europe/Berlin — gezielte Nutzertest-Nachkorrektur

094546a4 hat Martins visuelle Abnahme nicht bestanden. PR163 auf feature/audio-crew-visual-correction-20261007, exact 0b3b574b8add3fbb65ddbf288f668ae07158d038, lokaler b4b8c4c / identischer Tree0823b20e2ea2c6f7bdd1a5732d355d958a15e23e. Vier Originalfiguren und blauer Crewbutton, Vorteilsbilder, Breite ohne Ganzseiten-Verkleinerung, finite Bewegung respektiert Reduced Motion. Keine echte neue Flügel-/Türanimation der statischen Szene. Linke Navigation nur Empfehlung für später.

Zusätzliche Nutzermeldungen: AI-EDIT-001 RPT-MUXNE643-7B958 zeigt fehlenden Hörtext im Qualitätsreview. Reproduziert und korrigiert, Qualitätssperre unverändert. Explizite Testsprache füllt Formular und löst dessen change aus. Roter Smiley bietet fehlende Höraufgabe/falsche Sprache Rules-kompatibel. Antwort1–4 sichtbar ausgeblendet, Aria erhalten. KI-generierte Stimme bleibt. Grammatik-only Satzbau berücksichtigt auch Bedeutungsvarianten (purple/hungry); bestehende alternativeOrders-Bewertung geprüft, Prompts ergänzt. Konkreter vorhandener Test nicht verändert und keine vollständige KI-Ergebnisgarantie.

Gezielte Tests und123Files-Build erfolgreich; unabhängige Delta-Reviews ohne wichtige Befunde. Lokale Heroansicht1920 breit und390×844 mit0pxHorizontalüberstand und exakt844pxDokumenthöhe visuell geprüft; Dashboard-Handyabschluss noch laufend. AktuelleCI37575580701 noch offen. Kein neuer Stagingdeploy. CollectorPAUSED; privateAudio-Gates/Rules/Production unverändert. Nächster Schritt: exakteCIundfrischeIntegration, danach verifiziertePreview-/FunctionsReceipts undCanonicalrequest.


## 2026-10-07 — PR163 kanonisch veröffentlicht

App `12b54c2f9ee9761642c63378c724955c53b7d0c4`, Tree0823b20e2ea2c6f7bdd1a5732d355d958a15e23e. Exact CI37575725669 erfolgreich. Preview37575854754 Versuch1: Upload erfolgreich, sofortiger Manifestvergleich unterschiedlich; kein neuerer Branch/Hostinglauf. Ein begrenzter Wiederholungsversuch desselben unveränderlichen Builds bestand sämtliche Prüfungen, Receipt11462721822, Build11462581651. Diese Historie bleibt erhalten. AI/Assessment37575854717 erfolgreich, Receipts11462362075/11463141295.

Canonicalrequest auf main4dada15a5bffccd54ff1f9624ce274c32942e557, Run37576307264/Job112645925177 erfolgreich, Receipt11463137102 (sha256:37fc13072d6c4c4a0af7e205141ac2241e40266f25f88d9aa4d58bedb464d826). Feste Adresse https://hausaufgabe-staging.web.app/ veröffentlicht. Tatsächlicher kanonischer Browser1920 bestätigt vier Originalfiguren, keinen zusätzlichen Vektorpinguin und0pxSeitenüberstand. Screenshot lokalpr163-staging.jpg. LokaleHero390×844:0pxÜberstand, Dokumenthöhe844; Dashboard390:0px. Browserzugriff aufPreviewrelease.json war ERR_BLOCKED_BY_CLIENT; keinHTTP/Browserbypass, Veröffentlichung nur über bestehenden geprüften Workflow. Keine Geräte- oder bezahlte Generierungsabnahme behauptet.

Testsprache, Hörtext-Review, einfache Feedbackoptionen und ausgeblendete Audioantwortnummern veröffentlicht. KI-generierte Stimme bleibt. Grammatikvarianten werden explizit angefordert/geprüft; Bewertung bekannterAlternativen funktioniert. Vollständige semantische KI-Abnahme und vorhandeneTestreparatur nicht behauptet; DYVCHDPV unverändert. Echter neuer Flügel-/Türbewegungsfilm der statischen Klassenzimmerszene bleibt offen, nur finite Bewegung vorhandenerPorträts. Seitenleiste nur Empfehlung. PrivateAudioveröffentlichung weitergesperrtbisSecureRules/GatesC–F/30Teilnehmerfallbelegt. CollectorPAUSED; keineGames/iOS/Production. NächsterSchritt: MartinsNutzertestdiesesStandes, keineautomatischenZwischenabfragen.


## 2026-10-07 — PR164 Tutorial-Abgabe und neue Nutzerwünsche

Nutzer meldet blockierten Bestätigungsdialog. Reproduziert mit trusted Eingaben: Tutorialguard blockiert body-level studentSubmitConfirm. Nur während answering ist der offene Abgabedialog jetzt erlaubt; beide Escape-Guards lassen Dialogabbruch zu, übrige Seite bleibt gesperrt. Irreführender Nur-der-markierte-Schritt-Hinweis am Abschluss entfernt. 25 fokussierte Tests bestanden; Regression vorher fehlgeschlagen. Unabhängiger statischer Delta-Review ohne blockierende Befunde. PR164 Headccae343821250823654a25016fc1e7fd54d4e2a4, CandidateCI37583234472 erfolgreich; Mergebe39294ab9e9f85bb90c52760be374c5fe3e5b06 Treeb9bc6376c61199cd798a523cd4fce99b8faf05ba. MergeCI37583383799 läuft, noch kein Deploy behauptet.

Offen: Abschlussbild ist eingebetteter584x308Rasterausschnitt; Coco-Schärfe nicht korrigiert. Benefit-Reihenfolge Coco/Remy/Emmi/Wilma mit sinnvollen Rollen, Hero-Schrift frei von Remy und Originalporträt im Überblickskopf angefordert. Reviewmodus-Konzept vom Nutzer bestätigt: persistente elementbezogene Kommentare, Admin plus explizit berechtigte Lehrkräfte; Adminhinweise als autorisierte Arbeitsaufträge, Lehrkraftvorschläge erst nach Martins Freigabe umsetzen. Verarbeitung nur manuell gesammelt, keine KI pro Kommentar/keine automatische Abfrage. Noch nicht implementiert. Remy-Hilfe ausdrücklich erst Ideen: Antworten zum Anhören, antippbare Beispiele, sichtbare verstandene Anzahl/editierbar; natürliche Formulierungen unterstützen. Keine Erweiterung hierfür in PR164.

Nächster Schritt: exakten Merge-CI-Abschluss und verifizierte Preview-/Functions-Receipts abholen, danach bestehender Canonical-Workflow. CollectorPAUSED, privateAudio-Gates/Rules/Production unverändert.


## 2026-10-07 — PR165/166 Nutzerkorrekturen, noch vor kanonischer Veröffentlichung

PR165 integriert als0448767124c6c47d1ca7089558b1b84dc471a3b3: Emmi hilft dir beim Überarbeiten. / Sag Emmi, was du an deinem Test ändern möchtest. Vier Bridgeprüfungen, scoped review, CandidateCI37583638115 undMergeCI37583790228 bestanden; Preview37583912112/Functions37583912016 erfolgreich. Canonical noch offen, durch PR166 zu bündeln.

PR166 Head9749e2b950f763f527570928a21d2e7605a6db0a, Tree5b710fb09bb647827a3b010c79515eaec51d096a, CandidateCI37584648405 läuft. Vorwärts wiederholt q2 statt q3 reproduziert; Zielindex sofort setzen und vor Zwischenframes schützen. Review fand echten pointerdown-Zwischenschritt, ebenfalls reproduziert/korrigiert; unabhängiger Recheck ohneBlocker.25gezielteTests bestanden. Hörhinweis DE/EN mit Bildrichtung statt bloßHöraufgabe, Transkriptprivat. Neueste Nutzeranweisung ersetzt ältere: KI-generierte Stimme unterSchülerplayern entfernen. Download/Tempo imnativenPlayer via controlslist ausblenden, keineZugriffssperre behaupten.

Neue Anfrage: Testeinstellungen grundsätzlich eingeklappt; vorVeröffentlichen optional nurEinstellungen imübersichtlichenDialog prüfen; proNutzer DiesenHinweisnichtmehranzeigen, inpersönlichenEinstellungen rückgängig. Noch nichtimplementiert. GrünmarkierungSchülerübersicht vomNutzerzurückgezogen, vorhandeneFunktionunverändertlassen. RemyHilfeweitererstIdeen; ReviewmodusundBildqualitätausvorigemCheckpointoffen. Next: PR166exactCI,serielleIntegration,frischegemeinsameReceipts,Canonicalrequest. KeineProduction/Rulesfreigabe,CollectorPAUSED.


## 2026-10-07 — kurze Startseiten-Benefits umgesetzt, branch_only

GC-WEB-REPAIR-20261007. Martin konkretisiert ausschließlich die untere Leiste: Coco, Remy, Emmi, Wilma; keine Namen/Rollenlabels in der Beschriftung. Umgesetzt: Dein Ratgeber / Hilft dir weiter; Schnell erstellt / In wenigen Minuten; Frische Ideen / Neue Aufgabenvarianten; Direkt ausgewertet / Ergebnisse im Überblick. Bestehende größere Überschrift/kleinere Unterzeile und CSS unverändert. DE/EN-Kataloge synchronisiert,24bestehendeEntry/i18nChecksbestanden. Branch feature/audio-hero-benefits-20261007,Commit6e67cd8501bb445f72ab3a69d138e9cd7f71c972, lokal9f3c868. Noch nicht integriert oder kanonisch deployed. Nächster Schritt: scoped review/exactCI und Aufnahme ins bestehende Stagingpaket. Audio-fehlt-Blocker, adaptive Höranweisung, Punkte-/Vorschau-Mischlogik und bisherige offene Punkte bleiben offen.


## 2026-10-07 — Überarbeitungsmodus: Konzept und Umsetzungsprompt

Martin fordert ausführliches Konzept einschließlich Live-Vorschau, Tutorial-Wiederaufnahme und Einordnung der Speicherung. Dokument: docs/gradecrew-review-mode-concept-20261007.txt. Entwurf, keine Implementierung. Empfehlung: Hinweise auf Staging erfassen; Adminanweisungen im manuell gestarteten Stapel direkt bearbeiten, Lehrervorschläge nur nach Freigabe der konkreten Version. Lokale Live-Vorschau mit isolierten synthetischen Szenen/Prüfpunkten; bei nötigem Reload zur gleichen Stelle zurückkehren. Keine KI pro Kommentar/keine Chat-Abfrageautomation. Zweistufig: persistentes Feedback mit Serverrechten, danach Szenen-/Liveprüfworkflow; notwendige Kontextdaten von Anfang an vorsehen.

Speicherung am Code geprüft: lokale EditorentwürfeIndexedDB, Onlinequizzes/SettingsFirestore, privateAudioentwurfssync; GasttutorialnurArbeitsspeicher; sichereAntwortentwürfemittemporärer12hLokalsicherung. Keine vollständige dauerhafteDoppelkopieodergeprüfteDB/Medienbackupstrategie behaupten. LokalerWebtree864009add8905f6f7b96babcccfb5970f73cf95d identischmitRemote6e67cd8501bb445f72ab3a69d138e9cd7f71c972; Codebackup ist kein Deploy- oderDatenbackupnachweis. Next: Konzeptbewertung/konkreteImplementierungsplanung; aktueller Auftrag liefert Dokument, keine neue Funktion.
