# GC-GAMES-ESCAPE-VISUAL-01 — spielbarer Zwischenstand

Am 08.10.2026 wurde der erste eigene Unreal-Abschnitt gebaut: Ankunftsgarten, kleine Verbprobe, drei Reihen Verbpfad und Wasserterrasse. Der Spieler erkundet die Welt aus der Ego-Perspektive. Er liest Wörter im Satzkontext, begrenzt seine Auswahl, bestätigt den Pfad und misst Wasser in einem 1-Liter-Eimer ab. Ziel: 3/10 Liter = 300 ml; jeder Füll- oder Ablasshub verändert die Menge um 100 ml.

Arbeitsbranch: feature/lerninsel-ego-v1. Checkout: gradecrew-lerninsel-unreal. Entwurfs-PR175: https://github.com/HerrLoeffler/Hausaufgabe/pull/175. Geprüfter lokaler Reviewfix: 9a87e02. Remote-Nachweis: 1fc4203a289bd9fe18edb5062925bff82091dbc1; spätere Dokumentations-/Aufnahmeergänzungen unten. Status: branch_only, keine Integration und kein Deployment. Der vorherige Design-PR173 bleibt erhalten.

## Tatsächliche Belege

- UE5.8.3 Development Editor auf Mac M5 Pro mit 48 GB erfolgreich kompiliert.
- 59 portable Prüfungen des echten Regelkerns bestanden. Der Engine-Test GradeCrew.Lerninsel.Play bestand nach den Reviewkorrekturen mit 0 Fehlern und 0 Warnungen. Testberichte und tatsächliche Spielaufnahmen liegen unter Reports.
- Tastaturbelegung bis zur Bewegungsfunktion geprüft; echter Fußkontakt mit Mindestdauer und Wiederholschutz; normale Eimeraufnahme nach 2/10 und 4/10, Mengenänderung um 100 ml und erfolgreiche Korrektur zu 3/10; echte Capsule-Sweeps vor, während und nach der Toröffnung; Pause, Fokus, Touch-Besitz und lokale Speicherung geprüft.
- Ein unabhängiger Reviewer fand drei wichtige Fehler. Die Regressionen versagten vor der Korrektur mit acht Assertions und bestanden danach. Bericht und Entscheidungen: Production/REVIEW.md. Ein kleiner Befund bleibt offen: Eine falsche ausgewählte Bodenplatte trägt noch dieselbe grüne X-Markierung wie eine richtige. Die dauerhafte Pfadfehleranzeige fordert bereits die Rücknahme.
- Drei Spielaufnahmen zeigen Ankunft, Verbpfad und Wasserterrasse; eine zusätzliche Aufnahme zeigt den getragenen Eimer und die vergrößerte Zehntelskala. Auflösung des tatsächlichen Spiel-Viewports: 2027×1090. Wortkontrast und Licht wurden anhand dieser Bilder korrigiert; störende Preview-Schatten sind entfernt.
- Der zylindrische Messraum hat 4,46 cm Innenradius und 16 cm Höhe, entsprechend ungefähr 1 Liter. Zehn gleiche Höhenintervalle ergeben gleiche Volumenanteile. 3/10 erscheinen als 4,8 cm Wasserhöhe. Die zusätzliche Trageskala macht die kleinen Markierungen gut lesbar.

Dies ist ein erster Art-Durchgang, keine Abnahme der endgültigen Grafik oder des Spielspaßes. Browser- und physische iPad-Prüfungen wurden nicht durchgeführt. Eine Desktop-Simulation beweist keine mobile Bedienung.

## Start und nächster Schritt

Lerninsel starten.command öffnet dieses Projekt mit der vorhandenen UE5.8-Installation im normalen Spielmodus. Der eigene gestartete Prozess wurde beobachtet und anschließend beendet. Andere aktive Unreal-Projekte blieben unberührt. Auf einem neuen Checkout müssen zunächst die eigenen Editor-Binaries mit Tools/build_editor.sh gebaut werden. Der Starter prüft das vorhandene Mac-Modul. README erklärt die Steuerung und die Spielschritte.

Die gespeicherte Editor-Karte enthält Licht und Startpunkt; die Weltgeometrie entsteht beim Spielen aus IslandArt.cpp. Weitere Gebiete, Satzweg, Felsfenster, schwierigere Zusatzrätsel, endgültige Landschaft und Audio sind noch auszuarbeiten. Öffentliches Browserstreaming sowie mobile Renderqualität, Signierung und iPad-Gerätetest bleiben separate Aufgaben.

Nächster konkreter Schritt: Nutzerdurchlauf dieses Abschnitts; danach Landschaft und Architektur ausarbeiten und die weiteren Mechaniken gemäß dem ausführlichen Spielbuch bauen. Production benötigt weiterhin eine ausdrückliche Freigabe.

## Versuche, Budget und Wiederaufnahme

Task-ID, Design-PR173, das Spielbuch mit 7929 Wörtern, 21 Layoutmotive und sieben bisherige Bildaufrufe bleiben erhalten. Im Baublock wurde keine weitere Bildgenerierung, Cloud-GPU, bezahlte Assetbeschaffung oder eigene Provider-API gestartet. Keine neue Kostenzahl ableiten.

Terminal-Push war ohne GitHub-Credentials nicht möglich. Der Connector sichert Text und Binärdateien mit erwarteter Branch-Ref; lokale und Remote-Commit-IDs können voneinander abweichen. Inhalte wurden zurückgelesen, PNG-Blob-Identitäten mit den lokalen Originalen verglichen. Keine Schlüssel auslesen. Vor Wiederaufnahme START_HERE auf aktuellem main lesen; nach Chatabbruch zusätzlich CHAT_RECOVERY.

Der eigene Python-Generator speicherte Materialien und Karte, hing jedoch zweimal beim macOS-Shutdown. Ein Threadsample bestätigte den Shutdown-Hänger. Nur diese eigenen Prozesse wurden gestoppt. Gespeicherte Assets und bewegliche Sonne wurden anschließend im Engine-Spieltest geprüft. Der Generator verwendet bei Wiederholung die eigene bestehende Karte und entfernt alte Materialausdrücke vor dem Neubau.

Epic-interne Selbstprüfungen melden vor unserem Test teilweise Conditionfailed. Dies ist kein fehlerfreier Nachweis für sämtliche Engine-Startup-Logs; der abgegrenzte GradeCrew-Testbericht ist der Nachweis. Frühere fehlende Save-/idevice-Warnungen bleiben in der Versuchshistorie; der abschließende eigene Test ist warnungsfrei.

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

## Letzte Sicherung

Abschließender erneuter Lauf einschließlich Tragebild: 2026.10.07-23.13.10 UTC, 59 Regelchecks und 1 Engine-Test bestanden, 0 Fehler, 0 Warnungen. Reports/verification.json enthält Bildgrößen und SHA256. Die zusätzliche Aufnahmeprüfung ändert keine Spiellogik. DraftPR175 und zentrale Übergabe sind angelegt. Endgültige Branch-Ref vor Wiederaufnahme frisch prüfen.

## Erweiterung in Arbeit08.10.2026

Martin verlangt Übernahme der ausführlichen Masterprojekt-Methode und anschließenden Prototypbau. Vorhandener Branch/PR175 wird weitergeführt. Native vierteilige Rätseldaten einschließlichLI1→LI2 sind implementiert:59bestehende+87neueportableChecks grün. NeueRuntime/UMG/Satzplatz/Bruchterrasse/Küstengeometrie in ersterFassung erfolgreichkompiliert, nativeBedienprüfungen laufen alsnächsterSchritt; bisher kein neuerEngine-Spieltest alsgrünbehauptet. Zwölf20-Motiv-Tafeln geplant;01..09erfolgreich erzeugt/gesichert,10..12laufen inCallCell30. Vorherige7Bildaufrufe erhalten; keinneuerProvider/CloudGPU/Deploy. MethodischePR171-Unterlagen gelesen, nichtübernommenodergeändert. Plan docs/superpowers/plans/2026-10-08-lerninsel-four-puzzles.md, Ergänzung docs/games/lerninsel/20261008-production/. Task1erledigt,Task2inArbeit,Task3offen. KeineerneuteFreigabepause lautNutzerauftrag.

## Vier-Rätsel-Erweiterung: geprüftes Kandidatensystem

Aktueller eigener Kandidat570fce3 umfasst alle vier Hauptmechaniken, Eimerprobe und zwei Zusatzfragen. NativeUMG-Pflichtantworten stattCanvas-Hitboxen; echte Slate-Move/Down/Drag/Up-Prüfung, physische Gateblocker und Wasser-vor-Tor-Sequenz. Regelprüfungen59+87=146bestehen. ZweiUE-Tests bestanden mit0Fehlern; imletztenLauf je2Warnungen desmitgeliefertenx86ideviceTools aufARM, keineProjekt-Material-/Widgetfehler. KeineiPadabnahme behauptet.

Neue Referenzbibliothek:12PNG-Tafeln/240Motive, vorherige21Motiveerhalten; alle12Original-PNG-GitblobsbytegleichmitlokalenFiles, remotec968f807gesichert. Insgesamt19Bildaufrufe inklusivefrüherer7, keineweitereGenerierungzumPDF. Bauhandbuch280Seitenlokal, etwa58MB;Quellen/Generator eingecheckt,PDFabsichtlichlokalundreproduzierbar. Darin28Text-/Bau-/Prüfseiten,12Übersichten,240Studienseiten, nicht280Seiten einzigartigerSpieltext.

ScopeStatusbranch_only/PR175; source/doc/report-Remoteaktualisierungfolgt. Frischer unabhängigerReviewerlerninsel_four_review liest76b336e..570fce3; keinezweiteImplementierung/Reviewrunde. NächsterSchritt: Befundeauswerten, WichtigesmitRegressionbeheben, finalegesamteTestsundReadback. KeinefinaleGrafik-/Erstspieler-/Spieldauer-/Browser-/Device-/Deploybehauptung. AndereExpeditionundWebreleaseunverändert.

## Finaler Vier-Rätsel-Kandidat

2026.10.08-09.54.06 UTC:147Regelchecks und2UE-Tests bestanden,0Fehler; 2 bekannteidevice-Warnungen. UnabhängigerReview:3wichtigeBefundeund3nachWirkunghochgestufteBedienbefunde,allemitRegressionbehoben. REVIEW-FOUR.md undReports/four-review-red.json erhalten. WeitereSatzvarianten/Hilfenhistorie bleiben reduziert; umgesetzt2Zusatzfragen. RealeGehroute/Erstspiel/Final-Art/Web/iPad nichtbehauptet. FinaleRemoteRef unten überzentraleÜbergabe undPR175 prüfen. EigenesWorktree/Startererhalten,keineIntegration/Production.
