# GC-GAMES-ESCAPE-VISUAL-01 — aktueller spielbarer Zwischenstand

Stand08.10.2026: eigener UE5.8-Ego-Abschnitt gebaut und lokal überprüft. Ankunft, begrenzte Verbprobe, drei Reihen Verbweg mit mittigem Fußkontakt/Rücknahme, Wasserterrasse mit1-Liter-Mess-Eimer undZehnteln. Ziele3/10=300ml;100ml pro bestätigtemHub. Eigene Geometrie, helle Garten-Farbwelt, drei physische Tore, Lösungen persistent.

Branch feature/lerninsel-ego-v1; Checkout gradecrew-lerninsel-unreal. Lokale Quelle99adf6d plus anschließend drei Reviewfixes; Remote390f2db vor Reviewfixes. Finalen Remote-/PR-Nachweis unten nachtragen und vor Wiederaufnahme frisch prüfen. Kein Merge/Deploy. Draft173 für vorhandenes Design bleibt erhalten. START_HERE auf aktuellemmain lesen; nachAbbruch CHAT_RECOVERY. Andere Unreal-Expedition gehört einem anderen Chat.

## Belege

- DevelopmentEditor-Build aufMacM5Pro48GB/UE5.8.3 erfolgreich.
-59portable C++-Verhaltenschecks bestehen. UE-TestGradeCrew.Lerninsel.Play nach Reviewfixes:1erfolgreich,0Fehler,0Warnungen (23:04UTC). Report und tatsächliche Spielaufnahmen unterReports.
- Eingabebelegung bisPawn geprüft; Fuß-Dwell/Reihenfolge/Duplikate; normale Eimer-Recovery bei2/10 und4/10, Korrektur zur erfolgreichen3/10; Tor-Sweeps vor/während/nachAnimation; Pause/Fokus/Touch-Besitz; gültige Speicherzustände und Transform-Recovery. Kein physischer iPad-/Browser-Test.
- Unabhängiger read-only-Review:3wichtige Befunde, alle zuerst imEngine-Test reproduziert (8Fehler) undin einemFixdurchgang behoben. Ein kleiner Befund offen: Bodenmarkierung fürfalschesWort noch dieselbegrüneX; Pfadfehleranzeige bleibt sichtbar. Production/REVIEW.md enthält alle Entscheidungen/Grenzen.
- Wortkontrast anhand echter2027×1090Spielaufnahmen verbessert; Preview-Schatten entfernt. Innenmaß Mess-Eimer Radius4.46cm/Höhe16cm≈1L, Wasser3/10höhengetreu4.8cm. Trageskala imHUD lesbarvergrößert. Noch ersterArtpass, keineFinal-Art- oderSpielspaßabnahme.

## Start und Grenzen

Lerninsel starten.command öffnet diesesProjekt mit vorhandenerUE5.8 imnormalenSpielmodus. AndererCheckout brauchtvorherTools/build_editor.sh; Binaries werden nicht eingecheckt. README enthältSteuerung. DieEditor-Karte enthältLicht/Start; Geometrie entsteht zurLaufzeit ausIslandArt.cpp. Browserstreaming, mobileRenderer/Signierung/Gerätetest, Satzweg/Felsfenster, vollständigeachtGebiete, Zusatzrätsel, Audio/Final-Art folgen. KeinPixelStreaming-Hosting oderWebintegration gebaut.

## Versuche/Budget/Wiederaufnahme

Task-ID, DesignPR173,7929-Wörter-Spielbuch/21Motive undsiebenBildaufrufe erhalten. ImBaublock keineweitereBildgenerierung/CloudGPU/Provider-/Deploymentkosten. Terminalpush ohneCredentials; Connector sicherttext/binaryOriginale, lokaleundRemoteCommit-IDsweichen ab. NieCredentials auslesen.

EnginegeneratorAssets erfolgreichgespeichert, macOSShutdownhingzweimal; ThreadsamplebestätigtShutdown, nur eigeneProzesse beendet. ErneutesErzeugen nutztbestehendeKarte undlöschtMaterialausdrücke vordemNeubau. Assets inPIE geladen, beweglicheSonne explizitgeprüft. NichtalleEngine-Startup-Logs sindfehlerfrei: EpicinterneSelbstprüfungen meldenConditionfailedvorunseremTest; allein scopedGradeCrewReport dientalsNachweis. FrühereSave-/ideviceWarnungen inVersuchshistorie; finalerTestwarnungsfrei.

NächsterkonkreterSchritt: Nutzerdurchlauf diesesAbschnitts, anschließend räumlicheLandschaft/Architektur weiterausarbeiten undSatzweg/Felsfenster gemäßSpielbuch bauen. Browser-/iPad-Abnahme bleibt eigenesGate. Productionnurmit ausdrücklicherFreigabe.

---
## Historische Zwischenstände (keine aktuellen Fertigmeldungen)

# GC-GAMES-ESCAPE-VISUAL-01 — Lerninsel Bau

Verantwortlicher Chat: Ego-Lerninsel 07./08.10.2026, Chat-Link unbekannt. Martin autorisiert selbstständige Prüfung und Levelbau während seiner Abwesenheit. Kein Productionauftrag.

Aufgabenbranch feature/lerninsel-ego-v1, Integrationsziel main für eigenständige Unreal-Quelle. Eigener Checkout gradecrew-lerninsel-unreal. Designbranch docs/lerninsel-layouts-20261007/DraftPR173 erhalten. Anderer aktiver Unreal-Expeditionscheckout unverändert.

Stand: Plan5753db9, Regelkern ca09bda lokal committed. 59 portable C++-Verhaltensprüfungen bestanden, initiale Fehlprüfung gesehen. UE5.8/Xcode vorhanden. Nächster Schritt: Runtime, Kollisionswelt, HUD und UE-Automation aufbauen; bisher kein erfolgreicher Engine-Build oder spielbarer Level behauptet.

Lokaler Terminal-Push hat keine GitHub-Credentials; read-only Fetch mit Netzfreigabe funktionierte. Sicherung über GitHub-Connector mit eigener Branch-Ref und erwarteten SHAs. Remote-Commits können von lokalen Commit-IDs abweichen; Inhalte/Refs jeweils zurücklesen. Keine Keys auslesen.

Plan docs/superpowers/plans/2026-10-08-lerninsel-first-section.md, Design docs/games/lerninsel/20261007/spielbuch.md, Zweitprüfung docs/games/lerninsel/20261008-recheck.md. Task1 komplett; Task2/3 offen. Ausführungsledger .superpowers/sdd/2026-10-08-lerninsel-first-section/progress.md.

Ziel ist Ankunft, Verbprobe/Hauptpfad und Eimerterrasse1L/3/10=300ml. Satzdorf, Bruchrouting, Felsfenster, vollständige Achtgebiets-Insel, Final-Art, Audio, öffentliches PixelStreaming und iPad-Export stehen noch aus. Keine CI-/Integration-/Deploy-/Geräte-/Productionbehauptung. Web-Release-Train unverändert. Keine weiteren Bild-/API-Kosten gestartet; sieben bisherige Bildaufrufe erhalten.

Zwischenstand00:42 CEST: DevelopmentEditor erfolgreich (lokaler Runtimecommitb510b35, Map/Material7c153b0). Remote Assets13c48a1d1b29859569446736670275dbea3e673e gesichert. Erste UE-Automation bestand (1Test,0Fehler,3Warnungen: initialerSave fehlt, alterideviceTool aufARM). Screenshotprüfung zeigte jedoch Editoransicht stattPIE; keine Art-Abnahme daraus. Direkte ReadPixels-Aufnahme vomSpielViewport plus echteCapsule-Sweep-Torprüfung ergänzt, laufender neuerTest über Tools/test_editor.sh. Native iPadSDK lautEnginegültig, physischesToolwarnend; keinGerätetest behauptet.
