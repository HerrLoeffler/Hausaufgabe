> Aktueller L1-Stand10.10.2026: branch_only, bestehender DraftPR175. Ausgangsbestand Remote218726f gesichert und bytegleich zurückgelesen. Finaler kompletter Prüfeinstieg11:10:38UTC/13:10:38Berlin:231portableChecks +5UE-Suites erfolgreich,0Testfehler/0Testwarnungen. Zehn echte Kamerabilder, Überlagerung behoben durch seitliche Kulissenposition. Keine vollständige Acht-Gebiete-/Geh-/Geräte-/Final-Artabnahme. TODO-Hauptzeile bleibt gezielter Owner-Nachtrag.

# GC-GAMES-LERNINSEL-L1 — Spiel: Lerninsel

Parent-ID GC-GAMES-ESCAPE-VISUAL-01 erhalten; keine Expeditionarbeit.
Owner GC · Lerninsel · Gameplay & Integration, Chat 01a12568-0502-7831-9451-a7f8d91ce950.
Vorheriger Owner GC · Lerninsel-Zentrale (01a1183f-dad9-7640-8a82-23107c980d6e), jetzt koordinierend.
Übernahme 2026-10-10 UTC. Branch feature/lerninsel-ego-v1, bestehender Draft PR175, Ziel main. Status branch_only; keine Integration, Deploys, Geräteabnahme oder Production.

## Scope / Fachplan / Abnahme

1. Bestand inventarisieren und unverändert im eigenen Checkout sichern.
2. Checkpoint auf bestehendem Branch/PR pushen; lokale Dateien per Gitblob/SHA256 zuordnen.
3. Vorhandene portable und UE-Gameplay-Prüfungen durchführen. Vorschaukarte zusätzlich starten, echte Spielansichten und Kollision prüfen.
4. Nur tatsächlich reproduzierte Überlagerung/Kollision in Weltdateien minimal korrigieren; keine neue Welt/Level/Artproduktion oder Engine-Umbauten.
5. Frische Belege, Restpunkte und nächsten Schritt sichern.

## Bestand / Übernahme

Quellcheckout /Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/gradecrew-lerninsel-unreal bleibt read-only, samt ungesicherten Dateien.
Quell-Head 2496a85f995549b2a48710b2f40c8b71f6a32b5a; Remote 28a60a34695f6c147d9a3ee71633adb09414c32e. Unterschiedliche Historien aus früheren Connector-Sicherungen; kein Force-Push.
Eigenes Checkout /Users/martin/Documents/Codex/2026-10-10/gradecrew-lerninsel-integration/work/lerninsel-l1. Lokaler Klon ohne Hardlinks, 38 offene Lerninsel-Dateien kopiert: Production/L1/source-inventory.json. games/.DS_Store nicht übernommen; .blend1 lokal erhalten.
Prozessprüfung 10:43 UTC: kein UnrealEditor-Spiel-/Import-/Testprozess; Blender PID5200 unberührt. Alter Fachowner idle/koordinierend; keine andere aktive schreibende Lerninsel-Fachrolle gefunden. Andere Chats nicht angeschrieben.
Development Status Run38045027438, Job114192717956: PR175 draft, +17/-68; Überschneidung Design-PR173/.gitignore Web/Security bekannt. Gemeinsame Dateien nicht verändert. sources/ read-only.

## Frische Prüfungen / Grenzen

Tests/run.sh: 66 Regeln +78 Rätsel +7 Steuerung +24 Wasser +12 Fuchs +44 Katalog =231 erfolgreich. UE-/Vorschaukartenprüfung folgt; alte Reports bleiben Historie.
img2threejs auf Eignung geprüft: bestehende Karte/FBX/Gameplay werden integriert, keine Modellrekonstruktion in L1. Verwendet vorhandene Unreal-Werkzeuge. Keine neuen kostenpflichtigen Aufrufe, Versuchshistorie/Budget unverändert.

## TODO / Workstream

Diese Task und Production/L1 sind die fachliche dauerhafte Zuordnung. Bestehender Parent-/Primary-Branch bleibt. Gemeinsame Regelfiles besitzen GC-HOOKS-01; gezielter TODO-Nachtrag als Production/L1/TODO-OWNER-PATCH.md gesichert, keine alten gemeinsamen Dateisnapshots überschrieben. L2–L5 ungestartet.

## Nächster konkreter Schritt

Den gesicherten Kandidaten im Nutzerlauf prüfen; anschließend gebietsweise Ausrichtung von Kulisse und Gameplay als gesonderten Integrationsauftrag konkretisieren.

## Gesicherter L1-Abschlussblock

Ausgangsstand Remote218726f4a880d36dd2f8f98ffb8324fb414ce1c4, lokal a390aa0; gesamter games/lerninsel-unreal-Baum c6e3e91eeb993b635a7da5bc180ecb758bdc8eaf bytegleich frisch geladen. 294 gegenüber dem alten Remote abweichende Lerninsel-Dateien samt bestehendem lokalen Art-/Runtimebestand und L1-Handoff hochgeladen; kein Reset/Force-Push. Der Source-Checkout wurde nicht geändert. Gemeinsame TODO/Regeldateien nicht mit alten lokalen Kopien überschrieben.

Reproduktion: vorhandener Starter öffnete eigenen Prozess PID42891 auf /Game/Maps/Lerninsel_Weltvorschau -game -LerninselWorldPreview; echte native Spielansicht gesehen. Nur dieser eigene Prozess wurde vor Automation per TERM beendet. Karte zusätzlich in PIE tatsächlich geladen.

Befund: kombinierter Blender-Import, BoundsX±16000/Y±12000, steht ursprünglich mitten in der C++-Route. Kamera-03 zeigt Schild Spiegelgarten6 im Satzplatz, Kamera-04 Kulissenbogen am Messbecher, Kamera-02 zusätzliche Säule auf Verbplatte. Regression overlap-red/automation.json: genau 1 Fehler für geometrische Überlagerung. Erster Diagnosebericht mit2Fixture-Sweepfehlern erhalten: Küstentor noch nicht animiert, Sweep im hohen Treppenbereich aufZ90 statt GeländeZ1000. Fixtures korrigiert, kein Produktfehler daraus behauptet.

Kleinster Fix: nur vorhandenen Kulissenactor in derselben Karte nachY14000 versetzt; importer verwendet dieselbe Position. BoundsMinY2000 liegt außerhalb interaktiver RouteY±1350. Blender-/FBX-Quellen und Gameplaygeometrie unverändert. Die Kulisse bleibt eine **seitliche visuelle Insel**, keine räumlich zugeordnete begehbare Acht-Gebiete-Welt. Diese Übergangslösung ist keine finale Weltintegration.

Frische vollständige UE-Prüfung2026.10.10-10.59.04UTC: Controls, FourPuzzles, Fox, Play und WorldPreview erfolgreich,0Fehler/12Epicidevice-ARM-Warnungen. Portable231 erneut erfolgreich. Neuer dedizierter Previewlauf ergänzt10echte Kameraposen inklusive Perspektivring und seitlicher Inselansicht; aktuelle Zeit/Resultat in Production/L1/verification.json. GeschlossenesTor blockiert realenCapsuleSweep, voll geöffnetes erlaubtPassage;4zusätzliche250cm-Sweeps frei,10Bodenproben bestätigt. Das sind Stichproben, kein vollständiger Geh- oder Kinder-/iPad-Test.

Build/Logs: .build/world-preview-build.log, .build/world-preview.log. Reports/L1 enthält echtePNG-Spielkameras, überlagerteVorheransichten, Red-/Green-Berichte und genaueCapsule-/Kamera-/FloorDiagnostik. Keine Final-Art-/Browser-/Gerätefreigabe. Darker sky/Blockout-Optik bleibt bestehende Qualitätsarbeit. Keine kostenpflichtigen Calls; Versuchshistorie erhalten.

Koordinationsrest: gezielter TODO-Eintrag als Production/L1/TODO-OWNER-PATCH.md gesichert, Aufnahme in gemeinsames main-TODO/Registry bleibtOwner-Nachtrag. GC-HOOKS-01-Regelfiles nicht verändert; L2–L5 nicht gestartet.

## Reviewnachtrag

Ein unabhängiger read-only Review fand1P2 im Prüfeinstieg (altegrüneReports bei fehlendemTest). Echt reproduziert; in einemFixdurchgang auf frischeReportverzeichnisse/exakteSuccess-Vollständigkeit umgestellt. NegativeProbeExit1 bestätigt. Bericht Production/L1/REVIEW.md, Gegenprobe report-freshness-regression.json. VollständigerPrüfeinstieg wird nach Fix frisch ausgeführt; keine zweiteReview-/Implementierungsrunde.

## Finale Verifikation / Wiederaufnahme

Tools/check_all.sh tatsächlich frisch nach dem Report-Fix ausgeführt, Exit0, Report2026.10.10-11.10.38UTC:231portableChecks,5UE-Suites,0Fehler/0Warnungen. Reports/L1/final-check-all.json und Production/L1/final-check-all.log belegen diesen Lauf. Frühere12/4EpicWarnungen bleiben Versuchshistorie. Alle10Bilder jetzt aus finalemLauf, SHA256 und getesteteCode-Dateien in Production/L1/verification.json. Quell-HEAD2496a85 und alle38ursprünglich offenen Dateien unverändert erneut bestätigt.

L1-Facharbeit zurÜbergabe bereit: Checkpoint, Starter, Kameranachweise und begrenzterFix gesichert; keine aktiveUnreal-Testsession nachAbschluss vorgesehen. Keine bezahltenCalls/ProviderRequests oder Deploys. NächsterSchritt: Nutzerlauf diesesVorschaukandidaten; volleGebietszuordnung alsgesonderterIntegrationsauftrag. GemeinsamesTODO/Registry mitfrischermainenOwnerabgleich nachtragen; Patchliegtvor, aktuellemain-Abfrage enthieltnochkeinGC-GAMES-LERNINSEL-L1.
