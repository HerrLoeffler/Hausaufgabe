# Level 1 — chronologischer Meilenstein- und Übergabeplan

Task GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011. Basis PR175@a5dc474295dea4abda06c5be8923de1bc0206248. **Heute nur Planung. Alle folgenden Implementierungsschritte ungeprüft und unausgeführt.** Führend: [Spielbrief](spielbrief.md), [Bau-/Prüfplan](referenzabschnitt-plan.md), [Prüfmatrix](pruefmatrix.md). Erst nach Martins Planfreigabe gilt dieser Ablauf als Bauauftrag; konkrete Fachwriter-/OS-Rechte müssen zusätzlich exklusiv zugeordnet sein.

## Zuständigkeit, Sicherung und Reihenfolge

Ein Gameplay-/Integrationsowner schreibt World/Art/HUD/Map in einem eigenen Umsetzungcheckout. Ein Artowner kann die begrenzten neuen Level1Reference-Assets produzieren, sobald seine separaten Assetdateien freigegeben sind; er verändert keine IslandWorld-Dateien. Der Integrationsowner importiert bestätigte Art in die Runtime. ET besitzt den bestehenden eigenen Fachowner. Tester A/B schreiben nicht am Produkt. Spiel-/Games-/Hauptzentralen koordinieren nur. Kein vorgeschlagener Owner wird durch diese Tabelle bereits gestartet.

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

**Interfaces:** Layout erzeugt `double Island::LevelOneGroundZ(double X, double Y)` in cm und konstante Level1-Zonen/Startpunkte. `AIslandLevelOneGameMode` setzt Referenzmode vor BeginPlay; `AIslandGameMode::IsLevelOneReferenceMode() const` liefert bool. `BuildLevelOneWorld()` erzeugt Boden, registrierte frühe Targets und Gateindices0/1. Späteres M3 nutzt Targetregistrierung, M5 SafePose nutzt dieselbe Oberfläche.

**Genaues Profil:** In |Y|≤160 ist Z von Y unabhängig. Aufstieg−2650..−2200: `90 * s(t)`, `t=(X+2650)/450`, `s(t)=3t²−2t³`; Abstieg−2200..−1650: `90*(1−s(t))`, `t=(X+2200)/550`. Außen auf dem ebenen HauptbandZ0. Maximaler theoretischer Längsgradient1,5×90/450=0,30, also≈16,70°; Triangle-/Schulter-/Cooked-Collisionwerte anschließend separat prüfen. Die Form ist eine **geplante 90-cm-Kuppe**, kein bereits gebauter Hügel.

- [ ] Failing portable Tests `LevelOneHillEndpointsAndCrest`, `LevelOneSlopeMargin`, `LevelOneLayoutContainsSafeStart` schreiben. Assertions: Z(−2650,0)=0, Z(−2200,0)=90, Z(−1650,0)=0; Steigung im begehbaren Band≤18°, Start liegt in eigener Zone. Dies testet mathematische Layoutdaten, nicht Enginekollision.
- [ ] Gezielten Test vor Umsetzung rot ausführen und fehlende Profilfunktion als erwartete Ursache protokollieren. Vorgesehener Befehl: `sh Tests/run.sh` nach bewusster Aufnahme dieses Tests in die vorhandene Liste; kein heute ausgeführter Befehl.
- [ ] `LevelOneGroundZ`/Layoutkonstanten und schmalen GameMode ergänzen; `BuildWorld()` leitet nur im Referenzmodus an `BuildLevelOneWorld()` um. Der alte Pfad bleibt unverändert und als Kontrollfall verfügbar.
- [ ] Map override auf den ReferenzgameMode setzen; Starter bindet konkrete Map/Version. Ein Editor-PIE ohne CLI-Flag darf dadurch nicht versehentlich Produktionssave laden. Vorhandene L1-Previewflag und Map werden nicht umgedeutet.
- [ ] Render- und Collideroberfläche aus demselben kleinen Höhenmesh erzeugen. Übergang in flache Probe höhengleich machen; altes Raster/Ankunftsbogen im Referenzbereich nicht doppelt erzeugen.
- [ ] Native Fixtures `LevelOneTerrainMatchesVisibleSurface`, `LevelOneCapsuleHeadroom`, `LevelOneGateBlocksDuringAnimation` schreiben/ausführen. Erwartung: Floorhit innerhalb2 cm sichtbarer Zieloberfläche an allen Profilproben; echte geschlossene/partoffene Gate-Sweeps blockieren; offene Passage frei. Ein mathematischer Test ersetzt diese Enginechecks nicht.
- [ ] Danach normal über W/S/seitliche Inputs bergauf, bergab, quer, an Rändern und unter Torbogen gehen. Kein Teleport für diesen Teil. Foot/Camera-Pose und Video/Screenshotfolgen mit Build binden.
- [ ] Alle Terrainbefunde sichern, nur konkrete kleine Collider-/Meshfehler korrigieren, gezielte Prüfung wiederholen; Commit/Push und nächsteFläche M3 dokumentieren.

**PASS:** echte Route und sichtbare/physische Höhen stimmen, Kopf/Fuß bleiben frei, normales Gehen gelingt. **FAIL:** Dekohügel über planer Collision, Recovery im normalen Lauf, verborgene Wand oder Gatebypass. **Heute:** NICHTGEPRÜFT.

## M3 — einheitliche bewusste Aktion, Wörter und Lernregeln

**Files:** `IslandWorld.h/.cpp`, scoped `IslandArt.cpp`, `Core/IslandRules.h` nur falls ein begründeter Adaptertest dort Änderung erfordert; vorhandene Regelsemantik ansonsten erhalten. Tasks10/20 in `Content/Tasks/tasks.json`/Generator; Tests `rules_test.cpp`, neue Level1Automation, ControlsAutomation. Keine ET-/späteren Puzzlefiles.

**Auswahlprofil:** M3 setzt ausschließlich das freigegebene Profil D oder S aus auswahlvarianten.md um. Für S kommen aktive Reihe, sichere Nebenlaufspur, tatsächlicher Stein-Floorhit, Besuchskonsumierung/Rearm nach Verlassen und S-I01–09 hinzu. Keine zusätzliche Kindermenüwahl.

**Interfaces:** `PickLevelOneTarget(const FVector&, const FVector&) const -> int` liefert registrierten ID oder−1; `ActivateLevelOneTarget(int)` aktiviert nur ein gegen aktuellen State/Focus/Reachable validiertes Ziel. Registrierte `UPrimitiveComponent`-Fläche→TargetID ist laufzeitlokal. Beide World-Inputwege verwenden denselben Pick/Actionpfad. M4 liest gültigen Lernzustand/aktuelles Ziel, nicht freie Kamera-Zonen als alleinigen Auftrag.

- [ ] Fixturetests `LevelOneESharesVisiblePick`, `LevelOneOcclusionBlocksBothInputs`, `LevelOneHeldPressDoesNotRepeat`, `LevelOneSameFrameDuplicateCoalesces`, `LevelOneSeparatePressesArePreserved` schreiben. Erwartet: E/Klick gleiche TargetID; verdeckter/zu ferner Target keine Stateänderung; Hold/Release/Doppelcallback exakt eine Aktion; zwei getrennte Press/Release-Zyklen zwei beabsichtigte Intro-Toggles.
- [ ] Vor Umsetzung rot ausführen, konkrete Missstände im Adapterpfad erhalten. Keine neue Diagnose eines alten Bildes als Bugreport ohne Reproduktion.
- [ ] Tatsächliche sichtbare Queryflächen der Wortobjekte registrieren, Pawnignore/Visibility-/Occlusionvertrag herstellen. Scoped E/Klick-Pick vereinheitlichen; normale Pointer-/Pressguards implementieren. Keine willkürliche200-ms-Debounce, kein globaler Spieleinputrouter.
- [ ] Nur im freigegebenen Profil D automatische Foot-Dwell-Auswahl unterdrücken; Profil S setzt den vollständigen Schrittvertrag aus dem Variantenblatt um; alte Dwellmechanik im Normalkandidaten erhalten. Test `LevelOneWalkingAcrossWordDoesNotChoose`: State unverändert nach normalem Stehen/Gehen über jede Platte. Dies ist ein freizugebender Designvorschlag.
- [ ] Richtige/wrong/full/undo-Tests für bestehende Kernaktionen pinnen: IntroMask5 öffnet nur nach2 richtigen; maximale2 Auswahl; Path0/4/8 setztverbs; WrongRow verändert Count nicht; falscher letzterSchritt blockiert neue Wahl bisUndo; Undo erhält frühereReihen. Direkter Re-Press des letzten gewählten Wortes mappt scoped auf vorhandenesPathUndo, ein früheres bleibt bestehen.
- [ ] Wortkörper/Schriftflächen und Near-Kontexte so gestalten, dass Ganzsteinblau plus Text/Form ohneHäkchen funktioniert. Aufgaben-/Target-IDs und vorhandene Wörter bleiben unverändert. Copy im Taskkatalog ändern, Generator verwenden; `--check` später tatsächlich ausführen.
- [ ] Normale echte Maus-/E-Gegenproben I01–I14 durchlaufen, jeweils Statewirkung, Bild und Inputfolge sichern. Ein Fixture-PASS ist kein OS-Klick-PASS.
- [ ] Commit/Push, Checkpoint mit bekannten Lesbarkeits-/Intentrisiken; M4 konsumiert erst diesen stabilen Vertrag.

**PASS:** Kind wählt das sichtbare Wort, korrigiert ohne Zusatzfenster und Gehen löst keine unbeabsichtigte Antwort aus. **FAIL:** anderes Target als markiert, doppelte Toggles, Autoauswahl durch Zögern oder unklare Rücknahme. **Heute:** NICHTGEPRÜFT.

## M4 — HUD, Menüs, Fokus und Einstellungen

**Files:** `IslandHUD.cpp`, `IslandFocusWidget.h/.cpp`, scoped Controller/GameMode-UIzustand in `IslandWorld.h/.cpp`. Testflächen ControlsAutomation und Level1Automation. Wiederverwendete native Buttons/Slider, keine WebUI-Bibliothek installieren.

**Interfaces:** Referenz-UIzustand `Start/Playing/Paused/Settings/RestartConfirm/Completed` blockiert Worldaktion; Lernstate bleibt separat. HUD konsumiert `State.intro/verbs`, `PathPromptRow`, gültigen Pick und kurze Taskcopy. Menuaufrufe verwenden vorhandene `CancelInput()/UpdateMode()`-Grenzen. Neustart ruft später M5 `ResetLevelOneAttempt()` auf, nicht allgemeinen Produktionsreset.

- [ ] Failing Tests `LevelOneMenuSuppressesWorldDispatch`, `LevelOneFocusReturnsWithNeutralKeys`, `LevelOneCurrentGoalTracksState`, `LevelOneControlsRemainFocusable` vorbereiten. Erwartung: Enter/Klick/Release ausPause verändertkeineWortwahl; Escape/Resume nur klarenStatewechsel; Auftrag bei ungelöstemIntro bleibtIntro, auch wenn eineFixtureKameraanderswo steht.
- [ ] Erst rot prüfen, dann HUD auf eine kurze aktuelle Anforderung und diskretenFortschritt reduzieren. Near-/Feedbacktexte so platzieren, dass sie Wort-/Torbild nicht gleichzeitig verdecken. Kein großer dauerhafterControlsblock.
- [ ] Start/Pause/Settings/RestartConfirm/Completed mit höchstens den imPlan genannten4/4/3/2/2Hauptelementen bauen. FOV75/85 undSlider25–300% unverändertklarbeschriften; kein gefälschter ET-Sendestatus.
- [ ] Tastaturfokus sichtbarmachen: Tab/ShiftTab umlaufend, Enter/Space, Sliderpfeile, Escapezurück. Menuinput exklusiv konsumieren, danach neutralisieren und Spielviewport fokussieren.
- [ ] Native Widget-/Statechecks grün ausführen; dann echterTastatur-/Mausdurchlauf, AltTabbeiW/HeldMouse, Escverschachtelt, Resize, sichtbarerFocus und Controls/Menüs vergleichen.
- [ ] Kontrast und Textpixel an1440×900 und mindestens1280×800 messen, FOV75/85 getrenntprüfen. Kein automatischerPass ausHexwerten oder einemschönenRender.
- [ ] Checkpoint mitUIbelegen undgenauemDialog-/Focusablauf sichern; nochkeinevollständigeScreenreader-/Kinderfreigabe.

**PASS:** kurze klare Anforderungen, ruhige lesbareMenüs, keineFocusfalle/ungewollteBewegung. **FAIL:** Pflichttextwand, HUDüberdecktAufgabe, WorldactionnachMenuklick oder SchließenlöschtfremdeSaves. **Heute:** NICHTGEPRÜFT.

## M5 — eigener Save, Neustart, Resume und Recovery

**Files:** `IslandLevelOneGameMode.h/.cpp` enthält `UIslandLevelOneSave`; scoped `IslandWorld.h/.cpp`. `Core/IslandLevelOneLayout.h` bleibt Profilquelle. Tests neueProfile-/Engine-Savefixtures. Normaler LI4/LI1–3-Kern bleibt erhalten.

**Interfaces:** `SaveLevelOneAttempt()/LoadLevelOneAttempt() -> bool`, `ResetLevelOneAttempt() -> void`, `ResolveLevelOneSafePose(const FVector&,FVector&) const -> bool`. Slotnamen/ScenarioId/LayoutRevision exakt aus Hauptplan. M6 erhält nur validen Referenzsnapshot.

- [ ] Failing Tests `LevelOneNeverWritesNormalSave`, `LevelOneResumeOnHill`, `LevelOneRejectsWrongScenarioOrLayout`, `LevelOneRecoveryPreservesValidFlags`, `LevelOneRestartPreservesPreferences` schreiben. Assertions: Produktionsslot-/Preference-Bytes identischvor/nachReferenzlauf; SavedKuppenposition brauchtpassendenFloorhit; NaN/falschesLayout/hinterungelöstemTorführtzuSafePosebeiunverändertenvalidenFlags.
- [ ] VorUmsetzungrotnachweisen; keineechtenSchülerdaten/SavesausanderenChatsverwenden. Kontrollsavedaten synthetischundexplizitmarkieren.
- [ ] ReferenzsavevorLoadisolieren undszenengebundenvalidieren. SavetimingnachregelwirksamerAktion, sicherenWaypoints undgeordnetemExit; keinSchreibendauerproFrame. Rückgabefehlerunterscheidbarzeigen.
- [ ] `ResetLevelOneAttempt` überschreibt nur eigenenVersuchmiteinemgültigenLeersnapshot, hältMode/Preferences/Kontrollsaves. NormalesResetDemoignoriertdieseneuenSlots.
- [ ] SafePosevalidierunganwirklichenFloor-/Capsuletraces undFortschrittszonenbinden; invalidesView/Positionbereinigen; ererbteRange−1900nichtfürneuenStartnutzen. UnzulässigesLayoutnichtalsLI4kompatibelausgeben.
- [ ] BewusstungültigeFixturefälleisoliertprüfen, dannnormalesPause→Schließen→WeiteraufHügel,vorTor,nachFehler,nachrichtigerReihe,durchlaufen. Kopf/Fuß/GatewinkelundgenauesSnapshotprüfen.
- [ ] GültigealteunbestätigteAntwortenweiterauto-checken; stateintegritäts-/Normalprototyp-Kontrollsuitenrun. SavefehleralsBefundbewahren. CheckpointmitScope/Slot-/Dateihashes.

**PASS:** tatsächlicherResumeohnePhantomfortschritt, fremdeSavesbytegleich, guterRecoveryohneStrafe. **FAIL:** normalerLaufbrauchtRecovery, Saveverschwindet, ungültigeFlagsöffnenTor, normalerSlotgeändert. **Heute:** NICHTGEPRÜFT.

## M6 — Abschluss, Anschluss und normaler Gesamtdurchlauf

**Files:** scoped GameMode/World-Continuationpfad, `Lerninsel_Level1Ref.umap`, vorhandene `Lerninsel.umap` nur als Ziel lesen; etwa neue gebundene Launcheroption für Handoff. Reports/Level1Reference. Keine spätere Lernaufgabe umschreiben.

**Interfaces:** `OpenLevelOneContinuation() -> bool` exportiert ausschließlich tatsächlich gelöste frühe Flags in `LerninselLevel1HandoffV1`, bindet bestehenden Zielmapstart, normalerSlot bleibt unberührt. Der Zielstart entscheidet SlotvorLoad; Position1540/0/88nur nach realer Bodenfreiheit. Kein Debug-SetFlags als Ergebnisimport.

- [ ] Fixturetest `LevelOneContinuationPreservesNormalSaveAndRequiresSolvedRoute`: ohneintro/verbskeinÜbergang; mitgültigererarbeiteterFolgeisolierterLI4Handoff, spätereFlagsfalse; normalerSave/Preferencesunverändert.
- [ ] FailingtestvorImplementierungausführen, dannminimalenSnapshot-/Mapübergangbauen. FehlgeschlagenerMap-/SavewechselzeigtFehlerundlässtReferenzzustandsicher, keinenfalschen„Weiter“-Erfolg.
- [ ] `Completed` erstbeimwirklichenDurchgangnachvollgeöffnetemToranzeigen, nichtbeimdrittenAuswahlklickvorAnimation. BewussterWeiteraufruföffnetvorhandenenSatzgarteneinstieg.
- [ ] DurchlaufN1: frischerReferenzversuch, ausschließlichnormaleWASD/Maus/E-Events. Start→Hügel→beideProben→Tore→Exit→Anschluss. KeinTeleport/SetFlags/ForceComplete. Zeit-/Eventfolge/Video,Save-/Buildbindungprotokollieren.
- [ ] DurchlaufN2: mindestens einefalscheIntroauswahl, volleAuswahl,Rücknahme,falscheReihe,Pause/ResumeundHilfe; schließlichkorrektlösen. KeineAutoheilungdurchFixture.
- [ ] NormalesEundnormalerKlickjeweilsindermanuellenSessionbelegt; tatsächlicheFenster-/Devicebindungfesthalten. ToolaufruferfolgohneSpielwirkungbleibtNICHTGEPRÜFT.
- [ ] Kandidatcommit/Binary-/Asset-/MaphashessichernundfürA/Bunverändertfrieren. NachFreeze keine Art- oder CodeänderungvorbeidenLäufen; jederneueHash istneuerKandidat.

**PASS:** vollständigerAbschnittmitnormalenInputsundechtemAnschluss; **FAIL:** totesEnde, TeleportbelegalsPlaytest, Produktionüberschrieben oder künstlichfertigeFlags. **Heute:** NICHTGEPRÜFT.

## M7 — spätere unabhängige Runtimeprüfung und begrenzte Behebung

Erst nach M6, **nicht heute**. A: Technik/Input/Terrain; B: Bild/Handhabung/Verständlichkeit, mit denselben Vorgaben aber eigenen Beobachtungen. Zunächst unabhängig, dann Gegenprüfung der Befunde. SaveA/SaveB getrennt; A beendet eigene Session vor Bs exklusivemSlot. Ein offener Fokus-/OS-Adapterblocker verhindert diesen Test, nicht zwingend bereitsbelegteFixtures. B ist keine realeKinderstudie.

- [ ] ExaktenKandidatenSHA,Mode,Module/Map/Assethashes,Viewport,DPI/FOV,Device,frischenSlotundfreigegebenenSlotterminanAgeben.
- [ ] A führt normaleSequenzundtechnischeMatrixaus; Rohbelege/ungelösteGrenzenunverändertablegen, nichtanBvorabinterpretieren.
- [ ] DasselbeManifestanBgeben; neuerSlot, eigeneSession, keineparallel laufendenCapture-/Inputversuche.
- [ ] BeideBefundlisten danach gegeneinander aufQuelle,Reproduktion,ImpactundSpekulationprüfen; Vorschlagskonfliktebewusstentscheiden.
- [ ] OwnerreproduziertwichtigeDefekte, beschreibtkleinstenFix/Regression, sichertCheckpointvorlängererArbeit. KeineArt-/MethodenänderungbeifreiemGeschmackswunsch ohneScopeentscheidung.
- [ ] BetroffenePrüfungen nachFixerneut, unveränderteFlächennichtohneGrundwiederholen. SchwererSave-/Eingabe-/Gelände-/Lesbarkeitsdefekt blockiertbetroffeneAbnahme, nichtpauschalalleDokumentation.
- [ ] EndkandidatgebundenmitReviewentscheidungenanM8geben. NeuerBuildnachFixerfordertaktualisierteBelege; alteA/B-BildernichtalsFinalBuildausgeben.

## M8 — lokale Übergabe und spätere Produktentscheidungen

- [ ] Alle kritischenMatrixzeilen mitPASS/FAIL/NICHTGEPRÜFT undtatsächlichenBelegenfüllen. FehlendeNative-/Kinder-/iPad-Prüfungoffenlassen.
- [ ] FinalenlokalenBuild mitQuell-/Binary-/Asset-/Maphashes,Starter,bedienbarerSaveisolationundgenauemKnownIssueszustandsichern.
- [ ] Startzeit/Frametime/Speicher/LevelassetzuwachsaufbenanntemMacmessen; Kalt-/Warm-/Shader-/Editorfälleauseinanderhalten. Zielverfehlungbegründetmelden, keinFPS-/MB-Erfinden.
- [ ] Martin kurzeStartanleitung,OriginalreferenzvergleichundwirklicheSpielbildergeben. Branch_only/CI/Integration/Staging/Usertest/Productiongetrenntmelden.
- [ ] ErstnachkonkreterNutzerabnahmeeinenfolgendenGebiets-/Artauftragplanen. Browser/iPad/ET/1000Nutzerseparatentscheiden. KeinMerge/DeployineinerlokalenQualitätsübergabe.

## Lauf-/Budgetledger für die spätere Ausführung

Pro Aktion: taskId, owner/chat, requestedModel/effort, tatsächlichesModel/effort oderunknown, KandidatSHA, Scope/Slot, StartUTC, Run-/Process-/Request-ID, erwarteterOutput, Ergebnis, Belegdateien/Hashes, Kosten/Usage soweitbeobachtbar, nächsterSchritt. Höchstens2ModellwechselproTeilaufgabe, keinAstraDefault, keineerfundenenPreise. VorWiederholungbeiAbbruchprüfen, obCommit/Report/Prozessbereitsvorliegt; Versuchshistorieerhalten.

Für **diesen Planauftrag**: requestedPlanowner Sol/medium; actual desbereitslaufendenRootturns nichtgesondertbeobachtbar. A/B werden als verfügbare Sol/medium-Reviewer angefragt und ihre zurückgegebene Konfiguration dokumentiert; keine Modell-/Usagegarantie aus Rollenname. Keine direkten bezahlten Provideraufrufe.
