# Level 1 — chronologischer Meilenstein- und Übergabeplan

Task GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011. Basis PR175@a5dc474295dea4abda06c5be8923de1bc0206248. **Heute nur Planung. Alle folgenden Implementierungsschritte ungeprüft und unausgeführt.** Führend: [Spielbrief](spielbrief.md), [Bau-/Prüfplan](referenzabschnitt-plan.md), [Prüfmatrix](pruefmatrix.md). Erst nach Martins Planfreigabe gilt dieser Ablauf als Bauauftrag; konkrete Fachwriter-/OS-Rechte müssen zusätzlich exklusiv zugeordnet sein.

## Zuständigkeit, Sicherung und Reihenfolge

Ein Gameplay-/Integrationsowner schreibt World/Art/HUD/Map in einem eigenen Umsetzungcheckout. Ein Artowner kann die begrenzten neuen Level1Reference-Assets produzieren, sobald seine separaten Assetdateien freigegeben sind; er verändert keine Island World-Dateien. Der Integrationsowner importiert bestätigte Art in die Runtime. ET besitzt den bestehenden eigenen Fachowner. Tester A/B schreiben nicht am Produkt. Spiel-/Games-/Hauptzentralen koordinieren nur. Kein vorgeschlagener Owner wird durch diese Tabelle bereits gestartet.

Jeder Meilenstein endet mit einem sinnvollen Commit, Push und Handoff. Ein Dokument berichtet zuletzt gesicherte Codequelle, ungesicherte Restdateien, tatsächlich ausgeführte Checks, Report-/Prozess-/Run-ID und genau nächsten Schritt. Ein fehlgeschlagener Test wird mit Ursache erhalten, nicht durch Löschen des alten Reports verborgen. Bei bezahlter Asset-/Provideraktion wäre vorher ein eigenständiger begrenzter Auftrag nötig; der aktuelle Plan enthält keine. Keine automatischen Builds/CI-/Merge-/Deploystarts aus Checkboxen.

| Meilenstein | Abhängigkeit | Ein prüfbarer Output | Gate / Owner |
|---|---|---|---|
| P0 heute | Basis frisch gelesen | Spielbrief, Plan, Matrix, A/B-Planreviews samt Gegenprüfung, dokumentierte Revision | Dokumentationsowner; Freigabe durch Martin offen |
| M1 | Freigabe P0 | Gebundene Baseline und ein konkreter früher Szenen-/Artkandidat | Integrations-/Artowner; Vergleich mit vorhandenen Referenzen |
| M2 | M1 Layout bestätigt | Eigener Referenzmodus, tatsächlicher Hügel, sichere Route und zwei Tore | Integrationsowner; Terrain/Quell-/Colliderchecks |
| M3 | M2 | Einheitliches bewusstes E/Klick, lesbare Wörter, richtige Lernprogression/Rücknahme | Gameplayowner; Eingabe-/Core-/Wortmatrix |
| M4 | M3 | Kurzes HUD, echte Start/Pause/Settings/Neustart/Endoberflächen | UI-/Gameplayowner; Fokus-/Lesbarkeitmatrix |
| M5 | M2–M4 | Eigene LI4-/Layout-Saves, safe Resume/Recovery | Integrationsowner; Save-/Abbruchmatrix |
| M6 | M3–M5 | Sicherer Anschluss und normaler kompletter Durchlauf mit wirklichem Exit | Integrationsowner; C01/C02 plus native Eingaben |
| M7 | Unveränderter M6-Kandidat | Zwei getrennte Runtimeberichte und begrenzte Korrekturentscheidungen | A/B sequenziell, Owner resolves; keine Mehrheitsfreigabe für Defekte |
| M8 | Berechtigte Blocker behoben | Gebundener lokaler Kandidat, Messung und vollständige Nutzerübergabe | Owner/Spielzentrale; Martin prüft tatsächlich, kein Deploy im Scope |

## M1 — Baselinebindung und ein früher Gestaltungskandidat

**Dateien:** neue spätere `Production/Level1Reference/HANDOFF.md`, `Reports/Level1Reference/<candidate-id>/manifest.json`, neue Artquellen unter `Content/Art/Level1Reference/`; vorhandene Referenz-/L1-Bilder nur lesen. Keine hundert neuen Tafeln und kein Fuchs-Rigblock.

**Interfaces:** Input ist unveränderlicher Basis-SHA, Spielbrief, Layout W0–W13, bestehende Userstilbeschreibung und vorliegende Baseline. Output ist ein Asset-/Szenenkandidatenmanifest mit Dateien/Hashes/Rechten und sechs definierte Augenhöhenposen, die folgende Tasks verwenden.

- [ ] Aktuelle Owner/PR/Refs/dirty Dateien und laufende eigene/fremde Engineprozesse abgleichen; keine alte oder fremde Session wiederholen/beenden.
- [ ] Baselinequelle und Binaries binden; vorhandene Baselinechecks nur im zukünftigen autorisierten Lauf ausführen. Historische231+5 nicht als Prüfung des neuen Kandidaten ausgeben.
- [ ] Einen begrenzten nativen Szenenkandidaten aus Weg/Hügelrahmen, einem Herbstbaum, einem Steinmodul, Tor und Wortobjekt bauen; Quelle/Rechte je Asset erfassen. Die Prüffrage ist Gesamtlesbarkeit/Stimmung, nicht Modellmasse.
- [ ] Gleiche Ankunfts-/Kuppen-/Intro-/Auswahl-/Garten-/Exitposen und FOV75 verwenden, reale Runtimebilder sichern; Standbilder ausdrücklich keine Gehbelege.
- [ ] Art-/Gameplayvergleich dokumentieren: Silhouette, Licht, Oberfläche, Worte, Tor-/Leitungssicht. Pro Befund Quelle/Bild/Impact nennen. Nicht die erzeugte Konzepttafel als Screenshot verkaufen.
- [ ] Kandidat zusammenhängend sichern/pushen. Output nennt bestätigte Stilentscheidungen und offene Geräte-/Rechte-/Colliderfragen. Nur bei sichtbaren Gegenbelegen gezielt eine begrenzte Revision; keine Variantenschleife.

**PASS:** Ein konkreter originaler Stil-/Layoutkandidat mit klaren Lernobjekten und tatsächlichen Engineansichten liegt vor; Rechte-/Quelldefizite benannt. **FAIL:** nur Blender-/Werbebild, unlesbare Lernflächen, ungeklärte fremde Assetkopie oder großflächige unautorisierte Produktion. **Heute:** NICHTGEPRÜFT.

## M2 — eigener Modus, Gelände und Gategeometrie

**Files:** geplant `Core/IslandLevelOneLayout.h`, `IslandLevelOneGameMode.h/.cpp`, `IslandWorld.h/.cpp`, scoped `IslandArt.cpp`, neue `Content/Maps/Lerninsel_Level1Ref.umap`, `Tools/create_level_one_reference.py`, separater Starter. Alte Maps nicht überschreiben. Testflächen: geplant `Tests/level_one_profile_test.cpp`, `IslandLevelOneAutomation.cpp`.

**Interfaces:** Layout erzeugt `double Island::LevelOneGroundZ(double X, double Y)` in cm und konstante Level1-Zonen/Startpunkte. `AIslandLevelOneGameMode` setzt Referenzmode vor Begin Play; `AIslandGameMode::IsLevelOneReferenceMode() const` liefert bool. `BuildLevelOneWorld()` erzeugt Boden, registrierte frühe Targets und Gateindices0/1. Späteres M3 nutzt Targetregistrierung, M5 Safe Pose nutzt dieselbe Oberfläche.

**Genaues Profil:** In |Y|≤160 ist Z von Y unabhängig. Aufstieg−2650..−2200: `90 * s(t)`, `t=(X+2650)/450`, `s(t)=3t²−2t³`; Plateau−2200..−2000: Z90 konstant. Abstieg−2000..−1450: `90*(1−s(t))`, `t=(X+2000)/550`. Außen auf dem ebenen Hauptband Z0. Maximaler theoretischer Längsgradient1,5×90/450=0,30, also≈16,70°; Triangle-/Schulter-/Cooked-Collisionwerte anschließend separat prüfen. Die Form ist eine **geplante 90-cm-Kuppe**, kein bereits gebauter Hügel.

- [ ] Failing portable Tests `LevelOneHillEndpointsAndCrest`, `LevelOneSlopeMargin`, `LevelOneLayoutContainsSafeStart` schreiben. Assertions: Z(−2650,0)=0, Z(−2200,0)=90, Z(−1450,0)=0; Z(−2200..−2000,0)=90; Steigung im begehbaren Band≤18°, Start liegt in eigener Zone. Dies testet mathematische Layoutdaten, nicht Enginekollision.
- [ ] Gezielten Test vor Umsetzung rot ausführen und fehlende Profilfunktion als erwartete Ursache protokollieren. Vorgesehener Befehl: `sh Tests/run.sh` nach bewusster Aufnahme dieses Tests in die vorhandene Liste; kein heute ausgeführter Befehl.
- [ ] `LevelOneGroundZ`/Layoutkonstanten und schmalen Game Mode ergänzen; `BuildWorld()` leitet nur im Referenzmodus an `BuildLevelOneWorld()` um. Der alte Pfad bleibt unverändert und als Kontrollfall verfügbar.
- [ ] Map override auf den Referenzgame Mode setzen; Starter bindet konkrete Map/Version. Ein Editor-PIE ohne CLI-Flag darf dadurch nicht versehentlich Produktionssave laden. Vorhandene L1-Previewflag und Map werden nicht umgedeutet.
- [ ] Render- und Collideroberfläche aus demselben kleinen Höhenmesh erzeugen. Übergang in flache Probe höhengleich machen; altes Raster/Ankunftsbogen im Referenzbereich nicht doppelt erzeugen.
- [ ] Native Fixtures `LevelOneTerrainMatchesVisibleSurface`, `LevelOneCapsuleHeadroom`, `LevelOneGateBlocksDuringAnimation` schreiben/ausführen. Erwartung: Floorhit innerhalb2 cm sichtbarer Zieloberfläche an allen Profilproben; echte geschlossene/partoffene Gate-Sweeps blockieren; offene Passage frei. Ein mathematischer Test ersetzt diese Enginechecks nicht.
- [ ] Danach normal über W/S/seitliche Inputs bergauf, bergab, quer, an Rändern und unter Torbogen gehen. Kein Teleport für diesen Teil. Foot/Camera-Pose und Video/Screenshotfolgen mit Build binden.
- [ ] Alle Terrainbefunde sichern, nur konkrete kleine Collider-/Meshfehler korrigieren, gezielte Prüfung wiederholen; Commit/Push und nächste Fläche M3 dokumentieren.

**PASS:** echte Route und sichtbare/physische Höhen stimmen, Kopf/Fuß bleiben frei, normales Gehen gelingt. **FAIL:** Dekohügel über planer Collision, Recovery im normalen Lauf, verborgene Wand oder Gatebypass. **Heute:** NICHTGEPRÜFT.

## M3 — einheitliche bewusste Aktion, Wörter und Lernregeln

**Files:** `IslandWorld.h/.cpp`, scoped `IslandArt.cpp`, `Core/IslandRules.h` nur falls ein begründeter Adaptertest dort Änderung erfordert; vorhandene Regelsemantik ansonsten erhalten. Lernaufgaben 100/200 (Terminaltargets 10/20) in `Content/Tasks/tasks.json`/Generator; Tests `rules_test.cpp`, neue Level1Automation, Controls Automation. Keine ET-/späteren Puzzlefiles.

**Auswahlprofil:** M3 setzt ausschließlich das freigegebene Profil D oder S aus auswahlvarianten.md um. Für S kommen aktive Reihe, sichere Nebenlaufspur, tatsächlicher Stein-Floorhit, Besuchskonsumierung/Rearm nach Verlassen und S-I01–09 hinzu. Keine zusätzliche Kindermenüwahl.

**Interfaces:** `PickLevelOneTarget(const FVector&, const FVector&) const -> int` liefert registrierten ID oder−1; `ActivateLevelOneTarget(int)` aktiviert nur ein gegen aktuellen State/Focus/Reachable validiertes Ziel. Registrierte `UPrimitiveComponent`-Fläche→Target ID ist laufzeitlokal. Beide World-Inputwege verwenden denselben Pick/Actionpfad. M4 liest gültigen Lernzustand/aktuelles Ziel, nicht freie Kamera-Zonen als alleinigen Auftrag.

- [ ] Fixturetests `LevelOneESharesVisiblePick`, `LevelOneOcclusionBlocksBothInputs`, `LevelOneHeldPressDoesNotRepeat`, `LevelOneSameFrameDuplicateCoalesces`, `LevelOneSeparatePressesArePreserved` schreiben. Erwartet: E/Klick gleiche Target ID; verdeckter/zu ferner Target keine Stateänderung; Hold/Release/Doppelcallback exakt eine Aktion; zwei getrennte Press/Release-Zyklen zwei beabsichtigte Intro-Toggles.
- [ ] Vor Umsetzung rot ausführen, konkrete Missstände im Adapterpfad erhalten. Keine neue Diagnose eines alten Bildes als Bugreport ohne Reproduktion.
- [ ] Tatsächliche sichtbare Queryflächen der Wortobjekte registrieren, Pawnignore/Visibility-/Occlusionvertrag herstellen. Scoped E/Klick-Pick vereinheitlichen; normale Pointer-/Pressguards implementieren. Keine willkürliche200-ms-Debounce, kein globaler Spieleinputrouter.
- [ ] Nur im freigegebenen Profil D automatische Foot-Dwell-Auswahl unterdrücken; Profil S setzt den vollständigen Schrittvertrag aus dem Variantenblatt um; alte Dwellmechanik im Normalkandidaten erhalten. Test D-only `LevelOneWalkingAcrossWordDoesNotChoose`: State unverändert nach normalem Stehen/Gehen über jede Platte. Dies ist ein freizugebender Designvorschlag.
- [ ] Zusätzlich `LevelOneRepeatedStartPreservesRows` pinnen: richtige Reihe 1 → Start20 erneut → Count/Array/Fehler unverändert; kein Reset außerhalb bestätigtem Neustart.
- [ ] Richtige/wrong/full/undo-Tests für bestehende Kernaktionen pinnen: Intro Mask5 öffnet nur nach2 richtigen; maximale2 Auswahl; Path0/4/8 setztverbs; Wrong Row verändert Count nicht; falscher letzter Schritt blockiert neue Wahl bis Undo; Undo erhält frühere Reihen. Direkter Re-Press des letzten gewählten Wortes mappt scoped auf vorhandenes `PathUndo`, ein früheres bleibt bestehen.
- [ ] Wortkörper/Schriftflächen und Near-Kontexte so gestalten, dass Ganzsteinblau plus Text/Form ohne Häkchen funktioniert. Aufgaben-/Target-IDs und vorhandene Wörter bleiben unverändert. Copy im Taskkatalog ändern, Generator verwenden; `--check` später tatsächlich ausführen.
- [ ] Normale echte Maus-/E-Gegenproben I01–I14 durchlaufen, jeweils Statewirkung, Bild und Inputfolge sichern. Ein Fixture-PASS ist kein OS-Klick-PASS.
- [ ] Commit/Push, Checkpoint mit bekannten Lesbarkeits-/Intentrisiken; M4 konsumiert erst diesen stabilen Vertrag.

**PASS:** Kind wählt das sichtbare Wort, korrigiert ohne Zusatzfenster und Gehen löst keine unbeabsichtigte Antwort aus. **FAIL:** anderes Target als markiert, doppelte Toggles, Autoauswahl durch Zögern oder unklare Rücknahme. **Heute:** NICHTGEPRÜFT.

## M4 — HUD, Menüs, Fokus und Einstellungen

**Files:** `IslandHUD.cpp`, `IslandFocusWidget.h/.cpp`, scoped Controller-/UIzustand in `IslandWorld.h/.cpp`; ControlsAutomation/Level1Automation. Vorhandene UMG-/Slate-Buttons und Slider weiterverwenden, keine neue Webbibliothek.

**Interfaces:** UIzustände Start/Playing/Paused/Settings/RestartConfirm/Completed sind getrennt vom Lernstate. HUD liest gültigen Lernschritt und Profil D/S; `CancelInput()/UpdateMode()` begrenzen Worlddispatch. Neustart verwendet M5 `ResetLevelOneAttempt()`, keinen Produktionsreset.

- [ ] Failing Tests `LevelOneMenuSuppressesWorldDispatch`, `LevelOneFocusReturnsWithNeutralKeys`, `LevelOneCurrentGoalTracksState`, `LevelOneControlsRemainFocusable` schreiben. Assertions: Enter/Klick/Release aus Pause ändern keine Wortauswahl; Resume erfordert neutrale alte Inputs; ungelöstes Intro bleibt aktueller Auftrag auch bei versetzter Fixturekamera.
- [ ] Rot ausführen und konkreten Adapter-/UIfehler sichern. Anschließend kurze HUDzeile, diskreten Fortschritt und nicht überlagernde Near-/Feedbacktexte bauen.
- [ ] D/S-Copy aus dem Variantenblatt einsetzen. D: „Wähle in jeder Reihe ein Verb.“ S: „Gehe auf ein Verb in jeder Reihe.“ S-Mitte und nötiges Verlassen lokal erklären; keine dauerhafte zweite Textwand.
- [ ] Start/Pause/Settings/RestartConfirm/Completed mit den genannten maximal4/4/3/2/2 Elementen bauen. Slider25–300% und FOV75/85 unverändert verständlich beschriften; kein fingierter ET-Versand.
- [ ] Sichtbaren logischen Tastaturfokus einrichten: Tab/Shift-Tab, Enter/Space, Sliderpfeile, Esc. Menuinput exklusiv konsumieren und vor Rückkehr in die Welt neutralisieren.
- [ ] Native Widgetchecks grün ausführen; anschließend echte Tastatur-/Mauspfade, Alt-Tab bei gehaltener Taste, verschachteltes Esc, Fenstergröße und Fokuswirkung prüfen. Fixture-PASS ersetzt keine normale Eingabe.
- [ ] Kontrast, Textgröße und Überdeckung bei1440×900/1280×800 und FOV75/85 tatsächlich messen. Keine Abnahme allein aus Hexwerten.
- [ ] Mit UIbildern, Focusablauf und offenen Grenzen committen/pushen. Keine vollständige Screenreader-/Kinderfreigabe behaupten.

**PASS:** kurze klare Anforderung, lesbare Menüs, keine Fokusfalle oder ungewollte Bewegung. **FAIL:** Pflichttextwand, Worldaktion nach Menuklick oder fremder Saveverlust. **Heute: NICHTGEPRÜFT.**

## M5 — eigener Save, Neustart, Resume und Recovery

**Files:** `IslandLevelOneGameMode.h/.cpp` mit Referenz-/Anschlussklassen und Saveobjekten, scoped `IslandWorld.h/.cpp`, `Core/IslandLevelOneLayout.h`; neue Profile-/Savefixtures. LI4/LI1–3-Kernsemantik erhalten.

**Interfaces:** `SaveLevelOneAttempt()/LoadLevelOneAttempt() -> bool`, `ResetLevelOneAttempt() -> void`, `ResolveLevelOneSafePose(const FVector&,FVector&) const -> bool`. Hauptplan8.4 definiert SessionProfile, Save-/Preferences-Slots und Konstruktion vor sämtlichen Loads. M6 konsumiert nur einen validen Snapshot mit zugehöriger lokaler AttemptId.

- [ ] Failing Tests `LevelOneNeverWritesNormalSave`, `LevelOneResumeOnHill`, `LevelOneRejectsWrongScenarioOrLayout`, `LevelOneRecoveryPreservesValidFlags`, `LevelOneRestartPreservesPreferences` schreiben. Normaldateien müssen bytegleich bleiben; Kuppenposition braucht echte Floor-/Capsulefreiheit; ungültiges Layout/View/Position wird sicher verworfen, valide Antworten bleiben erhalten.
- [ ] Vor der Umsetzung rot prüfen. Nur ausdrücklich synthetische eigene Testslots verwenden, keine echten Schüler-/fremden Saveinhalte.
- [ ] Referenz-/Continuationprofile und Slotabfragen bereits in GameModekonstruktion/Initialisierung etablieren. Controller wählt seinen profilgebundenen PreferencesSlot ausdrücklich vor `LoadPreferences()`. Spätere Save-/Preferencewrites bleiben im selben Profil.
- [ ] Referenzobjektklasse/ScenarioId/LayoutRevision/AttemptId und LI4 validieren. Savepunkte nach regelwirksamer Aktion, sicheren Wegpunkten und geordnetem Exit; keine Schreibschleife pro Frame. Fehler ehrlich melden.
- [ ] Neustart nur nach Bestätigung: eigener Referenzversuch neu, neue lokale AttemptId, Bedienpräferenzen und normaler Fortschritt erhalten. Alter Anschluss wird nicht als derselbe Versuch ausgegeben; ein noch gültiger Anschluss desselben Versuchs wird nicht unnötig überschrieben.
- [ ] Savegeografie gegen das reale Profil prüfen. Die alte UntergrenzeX−1900 gilt nicht für den neuen Start−2800. Bodenhit, Capsulefreiheit und erlaubte Fortschrittszone bestimmen SafePose.
- [ ] Alte Character-Tick-AbkürzungZ<−150 in nichtnormalen Profilen vor Reset an protokollierte sichere Recovery routen. Flags erhalten und Inputs stoppen; jede normale Recovery bleibt ein Gelände-FAIL. Auf S-Wortmitte nach Resume/Recovery gilt Besuch zunächst als konsumiert, Rearm erst nach Verlassen.
- [ ] Isolierte ungültige Fixtures prüfen, danach normales Pause→Schließen→Weiter auf Kuppe, vor/nach Tor und nach Fehlwahl. Alte gültige unbestätigte Antworten weiterhin auto-checken; Kontrollprototyp separat gegenprüfen.
- [ ] Save-/Slot-/Hashbelege sichern und committen/pushen. Unbelegte dauerhafte Speicherung nicht als erfolgreich ausgeben.

**PASS:** sichere tatsächliche Wiederaufnahme, keine Phantomflags, fremde Saves unverändert. **FAIL:** normaler Lauf braucht Recovery, Antworten verschwinden oder normaler Slot wird geändert. **Heute: NICHTGEPRÜFT.**

## M6 — Abschluss, isolierter Anschluss und normaler Durchlauf

**Files:** scoped World-/GameMode-Continuationpfad, neue Referenzmap, gebundener Starter; vorhandene normale Zielkarte nur als Ziel lesen. Reports unter `Reports/Level1Reference/<candidate-id>/`. Keine spätere Lernaufgabe neu produzieren.

**Interfaces:** `OpenLevelOneContinuation() -> bool` übergibt den tatsächlich erarbeiteten validen LI4-Zustand an `LerninselLevel1HandoffV1`. Geplante Traveloption `game=/Script/Lerninsel.IslandLevelOneContinuationGameMode` bindet die Zielsession ausdrücklich; normaler Starter bleibt Normal. Eigene Handoff-Preferences gelten bereits vor Controller-Load. Fehlender Handoff erzeugt keinen Produktionsfallback.

- [ ] Failing Test `LevelOneContinuationPreservesNormalSaveAndRequiresSolvedRoute` schreiben: ohne gelöste Intro-/Verbfolge kein Übergang; mit gültiger Folge eigener Snapshot, Normaldateien gleich. Zusätzlich Satzgartenaktion, Preferenceänderung und Anschluss-Resume prüfen.
- [ ] Rot prüfen, dann minimalen Snapshot-/Travelvertrag bauen. Gültige Zugehörigkeit/AttemptId verlangt; wiederholtes Weiter desselben Versuchs nimmt vorhandenen Anschluss auf. Keine Debug-Fertigflags als Spielbeleg.
- [ ] Fehlender/ungültiger Handoff oder Map-/Schreibfehler zeigt eine kurze ehrliche Meldung. Der Referenzversuch bleibt erhalten; Rückkehr/Weiter nur nach erneuter Validierung. Kein scheinbar erfolgreicher Anschluss.
- [ ] Completed erst beim tatsächlichen Durchgang durch das vollständig geöffnete Tor. Danach klarer Abschluss und vorhandener Satzgarteneinstieg.
- [ ] N1 mit frischem Referenzsave durchlaufen: Start→Hügel→Probe→Garten→Tore→Exit→Anschluss, ausschließlich echte qualifizierte WASD/Maus/E-Events. Kein Teleport/SetFlags/ForceComplete. Event-/Videofolge und Buildbindung sichern.
- [ ] N2 mit falschem Paar, voller Auswahl, Rücknahme, falscher Reihe, Hilfe und Pause/Resume normal spielen und korrigieren. Für S zusätzlich sichere Spur, Zentrum, Rearm und Fuß-/Pointerkonkurrenz belegen.
- [ ] Normales E und normaler Klick jeweils im tatsächlichen Viewport zeigen. Toolerfolg ohne sichtbare Wirkung bleibt NICHTGEPRÜFT. Bessere Fixturewerte ersetzen keine fehlende Hardware-/OS-Eingabe.
- [ ] Exakten Kandidaten mit Source-/Module-/Map-/Assethashes committen/pushen und für A/B frieren. Keine stille Änderung zwischen Prüfläufen.

**PASS:** normaler vollständiger Abschnitt mit ehrlichem Anschluss. **FAIL:** totes Ende, künstliche Lernflags, Produktion verändert oder Fixture als normaler Lauf. **Heute: NICHTGEPRÜFT.**

## M7 — spätere unabhängige Runtimeprüfung und begrenzte Korrektur

Erst nach M6, nicht heute. A prüft Technik/Input/Gelände; B Bild/Handhabung/Verständlichkeit. Beide erhalten denselben unveränderten Build, aber eigene Saves und nacheinander exklusive Input-/Capturezeiten. B ist keine reale Kinderstudie. Ein unqualifizierter Nativeinputweg erzeugt NICHTGEPRÜFT, kein simuliertes PASS.

- [ ] A bekommt Kandidaten-SHA, Binary-/Asset-/Maphashes, Viewport/DPI/FOV, Gerät, frischen Slot und exklusiven Termin. Rohbefunde ohne Interpretation an B sichern.
- [ ] Nach As Sessionende B mit genau demselben Manifest und eigenem Slot prüfen lassen. Keine parallelen OS-/Editoraktionen.
- [ ] Danach Befunde gegenseitig gegen Quellen, Reproduktion, Impact und Spekulation prüfen. Berechtigter Blocker wird nicht per Mehrheitswahl aufgehoben; Geschmackswünsche bleiben als solche benannt.
- [ ] Owner reproduziert konkrete wichtige Defekte und legt kleinsten Fix plus Regression fest. Vor längeren Arbeitsschritten den Kandidaten sichern.
- [ ] Nach Änderung betroffene Checks und erforderliche Regressionen erneut ausführen. Keine zweite vollständige Runde ohne neuen Defekt/Änderung; keine endlosen Vorschlagsvarianten.
- [ ] Endkandidat mit Entscheidungen und neuen Hashbelegen an M8 geben. Alte Bilder/Berichte bleiben Historie und gelten nicht automatisch für neue Binaries.

## M8 — lokale Nutzerübergabe und spätere Entscheidungen

- [ ] Kritische Matrixzeilen mit tatsächlichem PASS/FAIL/NICHTGEPRÜFT und Beleg füllen. Fehlende Normal-/Kinder-/iPad-/Webprüfung offen lassen.
- [ ] Lokalen Kandidaten mit Starter, Source-/Binary-/Map-/Assethashes, isoliertem Versuch und Known Issues sichern.
- [ ] Startzeit, Framezeiten, Speicher und Assetzuwachs auf dem benannten Mac messen; Warm/Kalt/Shader/Editor getrennt. Zielverfehlung berichten, keine Messzahl erfinden.
- [ ] Martin kurze Startanleitung, ehrlichen Originalreferenzvergleich und echte Spielbilder vorlegen. Branch_only/CI/Integration/Staging/Nutzertest/Production getrennt ausweisen.
- [ ] Erst nach konkreter Referenzabnahme weitere Gebiets-/Artarbeit beauftragen. Browser/iPad/ET/1.000 Nutzer bleiben getrennte Entscheidungen. Kein Merge/Deploy aus lokalem Qualitätsziel.

## Ledger und Wiederaufnahme

Pro spätere Aktion: Task-ID, Owner/Chat, requested Model/Effort, beobachtetes actual oder unknown, Kandidaten-SHA, Scope/Slot, UTC-Zeit, Run-/Prozess-/Request-ID, erwartete Ausgabe, echtes Ergebnis, Belegdateien/Hashes, bekannte Usage/Kosten und ein nächster Schritt. Maximal zwei Modellwechsel pro Teilaufgabe, kein Astra-Default und kein erfundener Preis. Nach Abbruch bereits vorhandene Commits/Reports/Prozesse prüfen; Versuchshistorie erhalten.

Heute requested Planowner Sol/medium, tatsächlicher laufender Rootturn unbekannt. Die genau zwei unabhängigen Planprüfer wurden mit `gpt-6.1-sol / medium` dispatcht; ihre tatsächliche Runtimekonfiguration ist nicht separat beobachtbar und bleibt unknown. Keine direkten kostenpflichtigen Providerstarts. Dieser Plan startet weder Runtimeprüfung noch Umsetzung.
