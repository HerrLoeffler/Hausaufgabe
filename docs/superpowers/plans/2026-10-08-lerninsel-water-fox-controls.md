# Lerninsel Wasser, Fuchs und Steuerung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Zweite Wasserstation mit derselben Kanne, sichtbare Fuchs-Toraktion und einstellbare schnellere Steuerung.
**Architecture:** Vorhandenen isolierten C++UE-Branch erweitern. Reine Mengen-/Zeitregeln bleiben portabel; Actor-/Materialbewegung und native UMG-Einstellung hängen an den bestehenden Controller/GameMode. LI3 liest LI1/LI2weiter.
**Tech Stack:** UE5.8.3, C++17-Regeltests, UMG/Slate, ProceduralMesh, eingebautes image_gen.
**Spec:** docs/superpowers/specs/2026-10-08-lerninsel-water-fox-controls-design.md

## Global Constraints
- Erste Wasserprobe:1LiterKanne,3/10=300ml,100mlHub erhalten.
- Zweite Probe1000ml, Zuläufe100/200ml, Ablauf100ml,0,6sPortion.
- Bewegung420cm/s, Mausslider0,25×..3,00×Standard1×.
- FuchsRiegelfreigabe erst8,4s, danach Tor1,4s; Pause friert alle Teile ein.
- Keine Häkchen auf Wortsteinen, keine Production-/Web-/iPadbehauptung.

## Review Focus
- Kein Becher/Becher noch auf erster Platte: Auftrag führt zurück statt neuen Becher zu erzeugen.
- Eingießen mit900ml, zweite Eingabe während Hub: keine Mengen-/Toränderung.
- Pause/Alt-Tab während Hub/Fuchsweg: keine unbestätigte Aktion, keine weiterlaufende Tier-/Toranimation.
- Slider mit Maus gedrückt/ungültige gespeicherte Werte: kein Refresh/Captureverlust, beide Achsen konsistent.
- Satz mehrfach prüfen oder Reload: kein doppelter Fuchs, keine früh offene Tür, sichere Endpose.

### Task 1: Steuerung
**Files:** IslandWorld.h/.cpp, IslandFocusWidget.h/.cpp, Core/IslandControls.h, Tests/controls_test.cpp, Tests/run.sh, IslandControlsAutomation.cpp.
**Interfaces:** NormalizeSensitivity(float)→float; AIslandController.MouseSensitivity, SetMouseSensitivity(float,bool), SavePreferences(), LoadPreferences(); PreferencesSlot.
- [x] Tests zuerst: Slider fehlt,420cm/snoch nicht erreicht; Normalisierung2×, Grenzen0,25/3, NaNStandard; native Achsenvergleich und separatesSettingsSave.
- [x] Rot ausführen und konkrete Fehler sichern.
- [x] NativeSlider +dreiButtons, Achsenskalierung und separat gespeicherte Präferenz implementieren.
- [x] Vollständige aktuelle Regel-/UE-Suite grün; nativeSettingsaufnahme.
- [x] Commit/Checkpoint.

### Task 2: Gleiche Kanne am neuen Wasserast
**Files:** Core/IslandRules.h, Tests/water_test.cpp/run.sh, IslandWorld.h/.cpp, IslandPuzzleWorld.cpp, IslandArt.cpp, IslandFocusWidget.cpp, IslandHUD.cpp, IslandFourAutomation.cpp.
**Interfaces:** Action::CupAdjust(value−1/+1/+2), Action::CupPour; State.wholePoured; LI3 with previous fields plus explicit pour flag. GameMode.StrokeTarget tracks physical reach for pending action.
- [x] Tests zuerst: missing cup blocked, no earlygate,3→10 via fractional valves, capacity/emptybounds, wrong pour leaves state, whole pour empties same cup, serialization/migration atomically validates.
- [x] Rot bestätigen, dann Regeln und Saveversion implementieren.
- [x] Zwei reale Zuläufe, Ablauf, Becken und klare nativeAnleitung;0,6sHub mitPause/ReachCancel; alte Hauptgraphaktion entfernen.
- [x] FourPuzzles-Test auf reale Kannenaktion umstellen; same actor, retrieval300ml, partial/repeatedinput, full pour/wateranimation/gate sweep und Folgestationen.
- [x] Suite grün, echte Aufnahmen, Commit.

### Task 3: Fuchsszene und Auslieferung
**Files:** IslandFox.cpp, Core/IslandFoxCue.h, Tests/fox_test.cpp, IslandWorld.h/.cpp, IslandFoxAutomation.cpp, IslandArt.cpp, docs/games/lerninsel/20261008-fox-water.
**Interfaces:** BuildFox(), RefreshFox(float), FoxTime, FoxRopeReleased(); Gate3 depends on8,4srelease. Portable FoxCueAt(float,bool) returns stone/wake/walk/grip/pull/open/end state.
- [x] Tests zuerst: unsolved statue, incomplete/wrongsentence no wake, release8,4s, pause freezes pose, repeatcheck doesn'trestart, reload solved ends alive.
- [x] Rot bestätigen; sichtbarer eigener Fuchs aus beweglichen Körperteilen, Farbblend, Pfoten/Schwanz, Weg und verknüpfter Seilriegel.
- [x] NativeSolvedUI dismiss +initiallook; gateblockeruntilrope+doorready; save/loadendpose.
- [x]120Konzeptstudien sichern und prüfen, tatsächlicheScenezustände aufnehmen.
- [x] AlleSuites frisch grün, ein unabhängiger ganzerBlockreview, wichtige Befunde RED→GREEN in einemFixpass.
- [x] Abschlusscommit/PR175/Koordination, nur branch_only; Nutzerstart über vorhandenenStarter.
