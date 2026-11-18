# GC-IOS-02 / GC-RELEASE-06 — Secure Aufgabenübersicht und Abgabe

Owner: Native-Chat01a10c75-8912-7a12-98f0-c9e78064aa2c. Quelle Secure Live3b537c8ccbbff113ee999524013a1d17d08f4c54. Separater Arbeitsstand /private/tmp/gc-secure-sidebar-source-20261118, lokale Snapshot-Historie nicht als Upstreambasis verwenden. Übertragen wird nur der Patch gegen3b537c8. Native-Worktree-Erstellung g3:184 antwortet weiter nicht; keine zweite parallele Erstellung. Bestehender Icon-Checkout und App-Store1293 unverändert.

## Autorisierung/Vertrag
Martin beauftragt Browser und Secure fertig/live. Zentrale setzt nach erledigtem Apple-Mailauftrag den offenen nativen Teil ausdrücklich fort. Aufgaben LINKS, Übersicht RECHTS, großer Test-abgeben-Knopf unter Übersicht. Desktopmodus ab1024CSSbreite/600sichtbare Höhe; große Schrift kann kompakte Darstellung erzwingen. Webowner01a15f06 setzt Browser separat um; Handoff dort lesend abgeglichen. Secure lädt gebündeltes Exam/index.html, Hosting allein aktualisiert installierte App nicht.

## Aktueller konkreter Code
Ein Antwort-DOM; Gridanordnung ohne Neuaufbau. Navigationsoffset rechts=0, kompakt=gemessene Navigation, 100Aufgabenliste scrollbar, Escape schließt kompakte Übersicht mit Fokusrückkehr. Sidebar sendet ausschließlich requestSubmit an unverändert origin-/mainframegeschützte native Bridge, niemals direkte Abgabe. Native canSubmit und Freeze sperren Button. Breite native Footer-Abgabe ausgeblendet, Speicherstatus sichtbar; kompakter Footer behält Abgabe.

Native Sheet zeigt beantwortet/offen und verlangt ABGEBEN/SUBMIT. Coordinator prüft Wort, aktuellen Versuch, aktive Bestätigung und bisheriges canSubmit. Swipe/Cancel verwirft Bestätigung. Zeitablauf unverändert submit(auto:true), schließt Bestätigung bei Phasenwechsel. Kein Server-/Rules-/Analytics-/Antwortdatenmodell geändert. Gewähltes Secure-AppIcon aus1293 unverändert portiert, Test-App behält separate Identität und neues Live bleibt auf1272-Funktionsstand.

## Nachweise bis17:43CET
Rendererbaseline7PASS; drei neue Regressionen zunächst3FAIL, danach gesamte Renderer23PASS. SwiftPM38PASS (lokale Speicherung/Offline/Policies). Python29PASS. Echter iPad-Simulator1F605F51-D2D6-44D2-816F-690F3AE0F347, eigener leerer Testhost. Erster Testbuild scheiterte wegen noch nicht erzeugtem AppIcon; Ressourcen danach korrekt erzeugt, erneuter realer Lifecyclelauf läuft. Noch kein nativer Lauf als bestanden behauptet. WebKitmatrix erhält gezielte Rechts-/Abgabe-Clipping-Prüfung, bisherige Unter-Header-Annahme nur für echten Kompaktmodus.

DevelopmentStatus mit frischem main-Registry/State ausgeführt18Nov16:39UTC, lokale Root-Historie69f19d9 alt; meldet globale veraltete Branches/Handoffs und PR-Abgleich ohne Token übersprungen, kein Vollgrün behauptet. Neueste zentrale Live-Prüfung44346330053success lesend aus Webhandoff, globale Altlasten nicht Teil dieses Patches.

## Offen
Reale native Lifecycle- und WebKit-/iPhone-/iPad-Layoutabnahme fertigstellen; unabhängiger Review; Patch auf echten Upstreamzweig sichern/PR; alle Releasegates; getrennter neuer TestFlight-Build und tatsächliches Apple-Processing/Verfügbarkeit. Keine neue Store-Einreichung und kein erneutes Apple-Mail.

## Unabhängiger Review und gezielte Korrektur
Review des ganzen Patches durch frischen Reviewer: keine P0/P1, ein P2. Bei100Aufgaben wurde vom bereits relativen offsetTop fälschlich der Gridversatz nochmals abgezogen; aktuelle Aufgabe konnte unter sichtbarem Listenende bleiben. Regression zunächst10PASS/1FAIL (kein Scroll statt134px), dann Berechnung korrigiert. Reale OS-Tastatur, Sheet-Wischgeste und Hardware-Escape durch aktuelle Fixture nicht vollständig abgedeckt; keine entsprechenden Gerätetestbehauptungen. Appleverteilung außerhalb des Codereviews. Kein weiterer konkreter Codebefund.

Realer nativer Lifecyclelauf9PASS: Abbruch der Wortbestätigung blockiert alte Aktion, leer/falsch blockiert, korrekt bestätigt; Deadline schließt offenen Dialog und überträgt einmal; Offline-Abgabe nach Neustart und Rückkehr erfolgreich. WebKit-Smoke16Layoutfälle+12InteraktionenPASS. Vollmatrix iPad/iPhone läuft auf getrennten eigenen Simulatoren, Ergebnis noch offen.

## Prüfabschluss vor Releaseintegration (18Nov17:50CET)
Remote PR437, Quelle10a8b7ac1276cbbbcff226f2796adbd35fc300ff, Ziel feature/secure-live-ready-20261026 unverändert3b537c8. Kein Checkpointverlust. Gezielter P2-Regressionstest RED→GREEN; vollständige Renderer-/Telemetrysuite28PASS. Kein weiterer konkreter Reviewbefund; OS-Escape/Wischgeste bleiben ausdrücklich ungetestet, Wort-Eingabe und Toolbar-Abbruch werden real perUIAutomation geprüft.

Eigene tatsächliche Simulatoren: iPad13 1F605F51… und iPhone17e90D98D66…. iPad Vollmatrix900native+360WebKit+12InteraktionenPASS; iPhone540native+216WebKit+12Interaktionen+6zusammengesetzte LeseansichtenPASS. Lokale Berichte /private/tmp/gc-secure-sidebar-full/summary.json und /private/tmp/gc-secure-sidebar-phone/summary.json. Screenshots visuell geprüft: Aufgaben links, rechte Übersicht mit begrenzter Liste bei100Aufgaben, Abgabe darunter imViewport. JS-Scrollkorrektur im neuen WebKitlauf enthalten; reine native Matrix wurde vor dieser nurJS-Korrektur gebaut. Keine physische AAC-Prüfung aus Simulatoren abgeleitet.

Neuer tatsächlicher nativer iPad-UI-TestPASS: leeres/falsches Wort deaktiviert VerbindlichAbgeben, richtiges Wort aktiviert; bei geöffneter Bildschirmtastatur ToolbarAbbrechen schließt Dialog. Separate reine Coordinator-/Bridgeintegration9PASS, SwiftPM38PASS, Python29PASS. iPhone-Dialog-UI-Test noch im Lauf. Gewähltes StoreassetSHA256fa341d56873fdec36b57a316da5a78577fcdb9d163eeca5774b103b250cc172d bestätigt.

Nächster Schritt: begrenzt in vorhandenen Live-Releasezweig integrieren; dessen unveränderte vollständige CI-Gates müssen danach vor signiertem Upload bestehen. Keine App-Store-Buildauswahl und keine Store-Einreichung ändern. Neue TestFlightversion bleibt von Apple-Prüfung1293 getrennt.

17:51CET: neuer iPhone-Dialogtest ebenfallsPASS (9s): echte TastatureingabeFALSCH blockiert, ABGEBEN aktiviert, ToolbarAbbrechen schließt. Kein zusätzlicher Hardware-Escape-/Wischgesten-Test behauptet. Vollständige Freigabe für native Releaseintegration liegt im ursprünglichen Browser-/Secure-Auftrag; keine erneute Zustimmung erforderlich.

## Tatsächliche Releaseintegration17:51CET
PR437 gemergt in feature/secure-live-ready-20261026:0ec581c698d4f5130e98cf38fdb4c204473b7786. Genau dieser Quellstand hat tatsächlichen Workflow44352032992 gestartet, run30/attempt1, zunächstqueued. Daraus vorgesehene Buildnummer1301, noch kein bestandener CI-/Upload-/Processingbeleg. Workflow unverändert mit Native-/WebKit-mini-/WebKit-large-/iPhone-Gates vor signiertem Live-Upload. Kein zusätzlicher Run gestartet. App-Store1293 bleibt unverändert.

## Externer Release-Engpass18:12CET
Tatsächlicher Job134969989340 layout-web(large) abgeschlossenSUCCESS:360/360WebKit+12/12Interaktionen, Berichtartifact14450171726. iPhonejob134969988747 läuft. Jobs134969989303(mini) und134969989334(native) wurden vor Ausführung CANCELLED: GitHub-Annotation „The job was not acquired by Runner of type hosted even after multiple attempts“, zusätzlich Hinweis auf macOS-arm64-Kapazitätsmangel. Beide ohneRunnername/ohneCodeausführung.

Gezielter Retry des nativen Jobs wird von GitHub momentan abgelehnt: „The workflow run containing this job is already running“. Erst nach iPhoneabschluss die ausgefallenen Jobs erneut ausführen; bestandenen large-Job erhalten. Kein neuer Quellstand, keine Gate-Abschwächung und kein zusätzlicher voller Release gestartet. Noch KEIN signierter Upload;1301 ist nur die vorgesehene Erstversuchsnummer, ein Retry kann die tatsächliche Nummer erhöhen. Apple-Sitzung verfügbar, unveränderte1272/1293 noch sichtbar, neuer Build noch nicht vorhanden.

## Neue Größenpräzisierung und abgeschlossener Fehlerbefund18:42CET
Neue direkte Martin-Nachricht im Webchat unabhängig verifiziert: bisher gut lesbare Aufgabengröße erhalten. Webd67b0b5 ist separat live, rechte Übersicht ab1180CSS/600Höhe. Native ursprünglicher Bereich820px/Grundschrift19px bleibt erhalten;1180er Schwelle und exakte820px-Spalte ersetzen den bisherigen1024er Entwurf. Neuer Boundarytest zunächstFAILbei1024, anschließend gesamte Renderer/Telemetry29PASS. Reale WebKitprüfung verlangt bei Sidebar820px Aufgabenbreite.

Voriger tatsächlicher Run44352032992 attempt2 vollständig abgeschlossen, KEINUpload: nativeJob134988532054 scheiterte ausschließlich am älteren testRecoveryWaitsForTheSameInFlightDevicePoll: gemessene0.038s statt geforderte>0.12s bei vorher künstlich verzögertem Poll. Alle900Layouts und3Return-/Wort-UItests wurden ausgeführt; neuer Wortdialog bestand. iPhone, großes iPad und iPadmini separatSUCCESS.

Ursache: schedulerabhängige Zeitmessung zählt nicht den bereits verstrichenen Teil der künstlichen Verzögerung. Testfixture hält nun eine tatsächlich begonnene Gerätestatusantwort kontrolliert zurück. Wiederaufnahme darf vorher nicht enden und muss genau dieselbe Statusanfrage verwenden; erst explizites Freigeben liefert die Antwort. Kein höheres Timinglimit, keine Gate-Abschwächung, keine Änderung an der App-Sicherheitslogik. Mutationstest mit absichtlich vorzeitig zurückkehrendem Poll FAIL (erfüllte invertierte Erwartung), Originalcode danach automatisch restauriert. Vollständiger grüner Lifecyclelauf folgt. Voriger Build1302 wurde nie hochgeladen; erst ein neuer geprüfter gemeinsamer Korrekturstand darf einen neuen Release starten.

## Abschließende Korrekturprüfung18:48CET
Größenpräzisierung real geprüft:360/360iPad-WebKit+12InteraktionenPASS,216/216iPhone-WebKit+12Interaktionen+6zusammengesetzte AnsichtenPASS; WebKitaudit verlangt im breiten Modus exakt820px-Aufgabenbreite. Neue Schwelle1180CSS/600Höhe. Grundschrift19px unverändert. Keine App-Storeänderung.

Frischer enger Review der neuen Vorgabe bestätigte die Größenrechnung, fand aber im ersten Testharness-Entwurf eine weiterhin mögliche Receipt-/Poll-Race. Diese wurde vor jeder neuen Releaseauslösung behoben: Testbeobachter ausschließlich hinterSECURE_LAYOUT_TESTS meldet den tatsächlichen Beitritt nach Receiptverarbeitung, Server hält alle Antworten bis Freigabe, Recoveryzustand wird direkt beim Rückkehren erfasst. Keine100ms-/Mindestzeitannahme mehr. Absichtlicher Früh-Rückkehr-Mutant FAIL exakt an „Recovery must return only after the shared held-device decision“. App-Verhalten außerhalb der Testkompilierung unverändert; keine AAC-/Abgabe-Sicherheitsentscheidung geändert. Vollständiger9er-Lifecyclelauf mit ereignisgesteuerter FreigabePASS,0Fehler (/private/tmp/gc-secure-recovery-gate-event-green.log). Erst danach neuer exakt benannter Kandidat/PR/Release. Keine erneute Prüfung unveränderter Codeteile als neu behauptet.

## Einziger korrigierter Releasekandidat18:50CET
PR440 korrekt in bestehende Live-Linie gemergt:4dd40abe1d3a9df24636b395c751e2f41d54e563. Neuer tatsächlicher Run44362879769, run31/attempt1, vorgesehen1311. Voriger44352032992 vollständig beendet, nie signiert/hochgeladen. Kein paralleler oder doppelter Native-Release. Normale Live-Simulator-App ohne TestflagBUILD SUCCEEDED. Webbelege separat aufmain609b6443 viaPR439; kein nativer Upload aus Webdeploy behauptet. Noch alle CI-/Signing-/Apple-Processingnachweise offen für1311.

## Neue Uhr-/Nummernraster-Präzisierung19:00CET
Zentrale präzisiert Schüleransicht: Uhr immer sichtbar, kompakte Nummern statt langer Aufgabenkarten,30/50/100scrollbar, aktuelle Aufgabe unabhängig markiert, beantwortet grün/Leerenoffen, keine Aufgabenverkleinerung. Native1311 erfüllt das bereits: SecureExamFrame hält den tatsächlichen Header/Clock außerhalb des WKWebView-Scrolls; schmale/niedrige Ansicht hat kompakte Nativezeile, rechte Übersicht enthält nur Nummer+Bearbeitungsbadge, begrenzten Raster-Scroll und Abgabe außerhalb. Keine Produktänderung und kein neuer/paralleler Release nötig.

Gezielter zusätzlicher echter SwiftUI/WebKit-Test gegen dieselben KomponentenPASS (4.864s):100Aufgaben, breite1194x900,1024x900,390x844 und844x390Ansicht. Clock-x/y vor/nach SprungzuAufgabe70 unverändert; Clockrechte-/Unterkante inViewport. Gleiche Antwort-DOMreferenz undAntwort nach Resize erhalten; Nummerntexte nurZahl/Badge; genau aktuelle70markiert, im breiten Raster sichtbar; Abgabe unterRasterimViewport; Leerenq0 entferntgrün. Gemessene Clockpositionen:1194(909,12),1024(824,12),PhonePortrait(262,12),PhoneShort(716,5.977); verbleibenderWebbereichje720/720/664/254px. Keine echteHardwaretastatur-/Pinch-/physischeAACabnahme aus Geometrieprüfung behauptet.

Zusatzharness lief außerhalb des unveränderten Releasequellstands und wurde nach Sicherung entfernt; weder CI-Schritte noch Appquellen während des laufenden Builds verändert. Reproduktionsquelle, Log und4Bilder lokal outputs/secure-sidebar-20261118/clock-scope/. Hauptrelease bleibt44362879769/4dd40ab; aktuelliPhone+iPadmini inProgress, native+large nochqueued, keinUpload.

## Endkandidat: drei Gates grün, gezielter iPhone-Wiederholungslauf19:16CET
Quelle unverändert4dd40ab. Run44362879769/attempt1: native135008720587SUCCESS900/900 inklusive stabilisierter Recovery; mini135008720846SUCCESS360/360+12; large135008721034SUCCESS360/360+12. Phone135008720988: native540/540, Web216/216 und12Interaktionen bestanden, aber1/6zusammengesetzte Ansicht meldete nachdirektemSprung scrollY0/Target4354px (composed-phone-large-portrait). KeinUpload; Rohfehler nicht entfernt.

Gezielte Diagnose ohneCode-/Testtoleranzänderung:5frische lokale Test-App-Starts, je6zusammengesetzte Ansichten, beim erstenFehlerAbbruch aktiviert:5/5PASS, insgesamt30/30Ansichten,8.7–8.8sjeStart. Lokal nicht reproduziert; kein behobenerProduktfehler behauptet. Danach ausschließlichPhonejob gezielt erneut gestartet, aktuellerJob135025819473/run31attempt2 aufidentischerQuelle, vorgesehenerBuild1312. Andere3Gates erhalten. Keine paralelleReleasequelle, keine abgeschwächtenAsserts.

ErgänzenderUhr-ZoomnachweisPASS: WKWebView.pageZoom1.5, echteDOMViewportbreite1194→796, nativeClock(x909,y12)unverändert. VorherigerUIScrollView.setZoomScale-Prüfversuch wurde nicht angewandt(1.0) und ist als untauglicherTestmechanismus dokumentiert, keinProduktfehler. Keine echtePinch-/Hardwaretastaturprüfung behauptet. Harness+Logs+4Bilder outputs/secure-sidebar-20261118/clock-scope; fünfComposedstarts /private/tmp/gc-secure-composed-repeat-1311.log. App-Store1293weiterunverändert; weiterhinkein neuerTestFlightbuildhochgeladen.

## Erneuter gezielter Web-/Native-Abgleich19:20CET
Webowner meldet Kandidat9de201190cf5cac2c0c22d87a1824914d0b3f064/PR438/CI44368770487 ausdrücklich noch nicht neu deployed. Vertrag1180CSS/600sichtbareHöhe, Web-Aufgaben860px/16px; feststehenderOriginaltimer, Nummernraster1..N, Grün=beantwortet, unabhängigeaktiveOutline, Timer/AbgabeaußerhalbRaster, ABGEBEN/SUBMIT und Deadline unverändert.

Native4dd40ab ist darauf bereits abgeglichen: ursprünglicheNative820px/19px bleiben erhalten, rechteÜbersichterst1180/600; daruntervollbreit, keinSchrumpfenfürsHandy. NativeClockliegtunabhängigvomWebViewscrollfestimHeader, RasterzeigtNummer+Bearbeitungsbadge, begrenztScrollbar, aktuelleNummerwirdsichtbargehalten; AbgabeaußerhalbRaster. Die gesicherten vierGeometrieprüfungen+150%Seitenzoom und Leeren→Offen belegen dieseAnforderung am exakt unverändertenAppstand. Keine neueAppimplementierung, kein zusätzlicherNativebuild und keineWebsite/TestFlightgleichsetzung.

Frisch gelesener eigenerRelease44362879769: dreiGatesSUCCESS, nurPhonejob135025819473inProgress. SignierterUpload/Appleverarbeitungnochunbestätigt. App-Store1293nichtgeändert.

## Zweiter iPhone-Befund: kalter WebKit-Start, keinUpload19:40CET
Run31attempt2/Phone135025819473:216/216Web+12Interaktionen+6/6zusammengesetzteAnsichtenPASS, vorherigerScrollfalldamitgrün. Native540/540Layoutberichtefehlerfrei, aberNativeIntegration-Setupvor testActualBridgeRefreezesAfterProcessReloadDuringSubmission scheitert mitAppleWebKit „InvalidTransition phase:idle targetPhase:failed(deinit)“; unmittelbarvorherWebProcessdidBecomeUnresponsive. Bereitschaftsfixturewartet150x20ms aufErststart. Der eigentlicheTestablauf wurde noch nicht erreicht. AndereNativefälle inklusiveWortdialogbestanden; derselbeInitialBridgefall war aufidentischerQuelle im erstenPhoneversuch und im nativeniPadjob bestanden. Keine reproduzierteProduktänderungsursache behauptet, Rohfehler erhalten.

AusschließlichderselbePhone-Gesamtjob ein weiteresMalgezielt erneutangefordert; unveränderter4dd40ab-Quellstand, alleGates/Assertsbeibehalten,3grüneJobsbleiben. Keine neueparalleleReleasequelle, keinApp-Code-PatchaufVerdacht. VorgeseheneVersuchsnummer1313 (run31attempt3); nochkeinSignieren/Upload/AppleProcessingnachweis. Wenn derselbeStartfehler erneutauftritt, Bereitschaftshandshake gezielt untersuchen statt weitereWiederholungsschleife.

## Abschließende getrennte Web-Livemeldung18Nov
Webowner meldet9de201190cf5cac2c0c22d87a1824914d0b3f064 jetztLive, Hosting737c9ee7b5546025, CI44368770487grün;216/216HashesbeideOrigins, Functionsbasisweiterd67. GemeinsameWebdokuaufmaincfb2d39/PR441, Nachweis docs/evidence/wilma-compact-controls-p1-20261118/REPORT.md. Keine weitereWebveröffentlichung und keine doppelteNativeimplementierung darausableiten. EigenerNativekandidat4dd40ab/Run44362879769bleibtseparat mit3grünenGates undletztemPhonejob135042000121; nochkeineVerfügbarkeitsinTestFlightbestätigt.

## NativeAbschlusszustände zum neuen Webfeedback18Nov
DirekteÜbernahmebitte zum akzeptiertenWeblayout berücksichtigt; NativeLayoutvertrag bereitsverifiziert, kein neuerUmbau. Webowner behebt separat „NeuenTeststarten“ und fehlendeRückmeldung bei nochgesperrterLösungsfreigabe.

NativehatdiefunktionaleRückkehrbereits: SecureStatusPresentation.completedzeigt„Abgabe gespeichert“+„ZurückzumStart“; Rootleitetaufmodel.restart(), dasnur.completedakzeptiert underneutphase.code mitsauberenName-/Codefeldern setzt. .completedwird erst nach zumVersuchpassendemServerreceipt, Ende der AAC-Sitzung und erfolgreicherBereinigungdeslokalengesichertenVersuchs gesetzt. Bei ausstehenderAbgabe bleibt.recovery mit„Übertragungausstehend“/„GesicherteAbgabeübertragen“ und gespeichertenAntworten. TatsächlicheReturnUITests prüfenTapaufdieButtonfläche, erreichbareCodeeingabeundeinenweiterenTest; imgrünenNative-Gatebereitsenthalten. Kein zusätzlichesLösungsfreigabe-/BewertungsUI imnativenAbschlussvorhanden, keinWebpollingstillalsAppfixbehauptet undkeineFreigaberegelumgangen. Kein weitererAppcode/zweiterBuild nötig.

## Konkreter Abschlussfix f723e71: nativeWegeabgrenzung
Webowner meldetgeprüftenKandidatenf723e71b1f91c17e39bb96f9e3eae4c6d5c9a450/CI44375566304noch nichtlive: neuerCode-/Namenseinstieg ohneLöschenalterAttemptcredentials und expliziteRückmeldungbeimLösungsfreigaberead. NativeAbgleich: Weg1bereitsvorhanden („ZurückzumStart“→Code/Name nachbestätigterAbgabe), Weg2nichtvorhanden (nativeClientbietetkeineposthocLösungsfreigabeansicht). NichtbeideWegealsApp-Featurebehaupten.

Native.completedbereinigt nachverifizierterServerquittung den lokalenVersuch und aufSharedgeräten denPupilzugang; eine künftigeLösungsansicht benötigt deshalb einen bewusstgeprüften autorisiertenLesepfad stattblindesAufbewahren/ImportierenvonWeb-Attemptcredentials. FürdiesenAbgleich keineÄnderungderAntwortspeicherung, Deadline,Retake-/Freigabegates undkein weitererBuild. BestehenderApp-Lauf: nunalle4GatesSUCCESS, Phone135042000121vollständig540Native/216Web/12Interaktionen/6ComposedPASS, Artifact14460852805; signierterBuild-and-UploadJob135054646634läuft. Erwartet1313, nochkeineTestFlightverfügbarkeitbehauptet.

## VierFreigabenPASS, Signaturstufenochlaufend18Nov20:15CET
Run44362879769/attempt3/Quelle4dd40ab: Phone135042000121SUCCESSmit540/540Native,216/216WebKit,12/12Interaktionen,6/6Composed (Artifact14460852805). Mini,large,nativemitbestehendenErgebnissenSUCCESS. Damit alle4FreigabenbestandenenSourceidentisch; vorherigeColdstart-/ScrollfehlversuchebleibenimNachweis.

Build-and-upload135054646634läuft aufderselbenQuelle, derzeit„Test Secure and build all simulator schemes“. Vorgesehen1.0(1313); nochkeinArchiv-/AAC-Signatur-/Upload-/Appleverarbeitungsbeleg behauptet. AppStoreConnect-Browsersteuerung steht indiesemTurnnichtzurVerfügung; tatsächlicheTestFlightverfügbarkeitmusssomitnachUploadseparatbelegtwerden. KeineQuellenänderungoderzweiterBuildzurAbschluss-/Layoutabstimmung.
