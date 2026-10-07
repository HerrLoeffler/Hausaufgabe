# GC-GAMES-ESCAPE-VISUAL-01 — Lerninsel Bau

Verantwortlicher Chat: Ego-Lerninsel 07./08.10.2026, Chat-Link unbekannt. Martin autorisiert selbstständige Prüfung und Levelbau während seiner Abwesenheit. Kein Productionauftrag.

Aufgabenbranch feature/lerninsel-ego-v1, Integrationsziel main für eigenständige Unreal-Quelle. Eigener Checkout gradecrew-lerninsel-unreal. Designbranch docs/lerninsel-layouts-20261007/DraftPR173 erhalten. Anderer aktiver Unreal-Expeditionscheckout unverändert.

Stand: Plan5753db9, Regelkern ca09bda lokal committed. 59 portable C++-Verhaltensprüfungen bestanden, initiale Fehlprüfung gesehen. UE5.8/Xcode vorhanden. Nächster Schritt: Runtime, Kollisionswelt, HUD und UE-Automation aufbauen; bisher kein erfolgreicher Engine-Build oder spielbarer Level behauptet.

Lokaler Terminal-Push hat keine GitHub-Credentials; read-only Fetch mit Netzfreigabe funktionierte. Sicherung über GitHub-Connector mit eigener Branch-Ref und erwarteten SHAs. Remote-Commits können von lokalen Commit-IDs abweichen; Inhalte/Refs jeweils zurücklesen. Keine Keys auslesen.

Plan docs/superpowers/plans/2026-10-08-lerninsel-first-section.md, Design docs/games/lerninsel/20261007/spielbuch.md, Zweitprüfung docs/games/lerninsel/20261008-recheck.md. Task1 komplett; Task2/3 offen. Ausführungsledger .superpowers/sdd/2026-10-08-lerninsel-first-section/progress.md.

Ziel ist Ankunft, Verbprobe/Hauptpfad und Eimerterrasse1L/3/10=300ml. Satzdorf, Bruchrouting, Felsfenster, vollständige Achtgebiets-Insel, Final-Art, Audio, öffentliches PixelStreaming und iPad-Export stehen noch aus. Keine CI-/Integration-/Deploy-/Geräte-/Productionbehauptung. Web-Release-Train unverändert. Keine weiteren Bild-/API-Kosten gestartet; sieben bisherige Bildaufrufe erhalten.

Zwischenstand00:42 CEST: DevelopmentEditor erfolgreich (lokaler Runtimecommitb510b35, Map/Material7c153b0). Remote Assets13c48a1d1b29859569446736670275dbea3e673e gesichert. Erste UE-Automation bestand (1Test,0Fehler,3Warnungen: initialerSave fehlt, alterideviceTool aufARM). Screenshotprüfung zeigte jedoch Editoransicht stattPIE; keine Art-Abnahme daraus. Direkte ReadPixels-Aufnahme vomSpielViewport plus echteCapsule-Sweep-Torprüfung ergänzt, laufender neuerTest über Tools/test_editor.sh. Native iPadSDK lautEnginegültig, physischesToolwarnend; keinGerätetest behauptet.
