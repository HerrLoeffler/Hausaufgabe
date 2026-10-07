# Expedition Amazonas — lokaler Unreal-Spielabschnitt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ein normal startbarer, durchspielbarer Unreal-Abschnitt Camp → Ufer → Station mit eigener Miniaturoptik, acht Demo-Lernaufgaben und drei echten Rätseln.
**Architecture:** Deterministische Spielregeln ohne Rendering-Abhängigkeit; Unreal-Subsystem übersetzt Eingaben und bestätigt Lernbelege. Welt, UI, Assets und Speicherung lesen denselben Zustand. Die spätere Live-Brücke ersetzt den ausdrücklich gekennzeichneten Demo-Bewerter.
**Tech Stack:** Installiertes Unreal 5.8, C++20, Unreal-Bordmodule Core/Engine/InputCore/UMG/Slate/ProceduralMeshComponent/HTTP/Json/JsonUtilities; Python-Standardbibliothek für eigene Assets und Unreal-Editor-Python für Import/Map.
**Spec:** ../specs/2026-10-07-expedition-amazonas-unreal-design.md
**Follow-up:** 2026-10-07-expedition-gradecrew-bridge.md
**Status:** Plan erstellt und selbst geprüft; Nutzerprüfung/Ausführungswahl offen. Kein Produktcode aus diesem Plan ausgeführt.

## Global Constraints

- Task-ID GC-GAMES-ESCAPE-VISUAL-01 und bestehende Browser-/Attempt-Historie erhalten.
- Normales erstes Durchspielen ungefähr 10Minuten, Zielkorridor 8–12 aktive Minuten; 60–70Prozent aktive Lernzeit.
- Acht Lernslots camp1–2, shore1–3, station1–3; drei Umgebungsrätsel.
- Kein Countdown, automatische Freigabe durch Raten oder Bestrafung bei Überschreiten.
- Unreal 5.8 und eigene Assets; keine zusätzlichen Open-Source-Bibliotheken oder fremde Spielvorlage.
- Touch quer, Desktop zunächst; wichtige Touchflächen mindestens 48logische Pixel.
- Live-Lösungsschlüssel bleiben serverseitig; lokaler Bewerter nur sichtbar als Demo.
- Save nach bestätigter Lern-/Rätselaktion; Dialoge blockieren Weltaktionen.
- Kein Production-Deploy; echte Gerätetests und Live-Generierung sind eigene Gates.

## Review Focus

1. Vor Schließen eines Dialogs gehaltene Bewegung/Toucheingabe darf danach nicht hängen bleiben: Task 2 InputCancel.
2. Doppelte/veraltete Bewertungsantwort nach Paketwechsel darf kein Item/Fakt vergeben: Task 1 ReceiptReplay und Task 3 StaleFeedback.
3. Save mit fehlender Sicherung trotz stationReady oder anderer Paketrevision darf keine falsche Fortsetzung erzeugen: Task 5 InvalidSave.
4. Zahlen mit Dezimalkomma, Einheit, Grenztoleranz und manuell prüfbare Aufgabe: Task 3 SupportedAnswers.
5. Brücken-/Stromaktionen in beliebiger Reihenfolge dürfen keinen unwiederbringlichen Gegenstands-/Rückwegverlust verursachen: Task 1 ReversibleWorld und Task 4 WorldRecovery.

## Ausgangslage und Arbeitsraum

START_HERE/AGENTS/State/TODO/Registry/Handoff gelesen. Spec wurde ausdrücklich durch Martin bestätigt. Visualquelle PR83@6434ddef ist Referenz, nicht Unreal-Code. Live-Audit37641587266/Job112861653354 erfolgreich gelesen; Expedition-Branch noch nicht registriert. Native Bruchpizzeria ist separat und dient nur als gelesene Build-/Automationsreferenz.

Nach Planfreigabe using-git-worktrees laden, GitHub-/Git-Arbeitsraum prüfen und isolierten Checkout samt Branch **feature/escape-expedition-unreal-v1** vom frischen main erstellen. Kein Wechsel in Bruchpizzerias Checkout. Native Integrationsziel **main** für den unabhängigen Spielordner; keine automatische Integration in Browserexpedition oder Web-Release-Train. Nur eigene Ordner plus bewusst abgeglichene Koordination ändern.

Game root ist games/escape-expedition-unreal. Im isolierten Checkout einmal absolute Variablen setzen:
```sh
GC_EXPEDITION_ROOT="$(pwd)/games/escape-expedition-unreal"
GC_UNREAL_ROOT="/Users/Shared/Epic Games/UE_5.8"
```
Befehle dieses Plans laufen im Checkout. Variablen vor jedem neu gestarteten Terminal erneut setzen. Wrapper unter Tools besitzen denselben Root aus ihrem eigenen Pfad, benötigen keine Shell-Sitzung.

## Task 1: Zustandskern und wiederholbare Rätselaktionen

**Files:** Create Source/Expedition/Core/ExpeditionRules.h, Core/LearningProtocol.h, Tests/rules_test.cpp, Tests/run.sh, Tests/demo_receipts.h unter game root.

**Interfaces:** Namespace Expedition. Item={MapLeft,MapRight,Rope,Crank,Fuse}. ActionKind={Collect,RotateMap,JoinMap,ChoosePath,AttachRope,InstallCrank,TurnWinch,InstallFuse,SwitchConsumer,SendSignal}. Consumer={Pump,Light,Radio}. Action enthält kind, item, target und value. State enthält inventoryBits, clueBits, completedSlotsBits, mapRotations[2], mapJoined, chosenPath, anchorA, anchorB, crankInstalled, bridgeLatched, fuseInstalled, consumerBits, finale, sessionId und packageRevision. Outcome={Applied,AlreadyApplied,MissingClue,MissingLearning,WrongTarget,Overload,InvalidAction}. Apply(State&,const Action&)->Outcome; CanInteract(const State&,ActionKind)->bool. LearningReceipt enthält sessionId, packageRevision, slotId, submissionId und passed. AcceptReceipt(State&,const LearningReceipt&)->Outcome. Slot-IDs0–7 entsprechen Spec-Reihenfolge.

- [ ] Write rules_test: acht passende Receipts allein erzeugen weder mapJoined noch bridgeLatched/finale; Karte benötigt beide Hälften + campSlots; falscher Pfosten bleibt korrigierbar; sichere Brücke bleibt bei Pump-off sicher; Pump+Light+Radio überlastet reversibel; vollständige richtige Aktionen enden mit finale.
- [ ] Add ReceiptReplay: zweimal derselbe submissionId, veraltete Revision und andere sessionId ändern inventory/facts nie ein zweites Mal. MissingLearning und WrongTarget dürfen Items nicht entfernen.
- [ ] Run `sh "$GC_EXPEDITION_ROOT/Tests/run.sh"`: RED vor Implementierung erhalten.
- [ ] Implement Apply/AcceptReceipt mit expliziten Vorbedingungen; keine zufällige Freischaltung, keine stille automatische Rätsellösung. Demo-Prüfer nur unter späterem Demo-Modus erreichbar.
- [ ] Run gleiche Tests: alle PASS; Commit nur Kern+Tests, Übergabe aktualisieren/pushen. Pure Tests mit installiertem xcrun clang++ -std=c++20 -Wall -Wextra -Werror; keine neue Testbibliothek.

## Task 2: Startbarer Unreal-Spielraum und direkte Steuerung

**Files:** Create Expedition.uproject, Source/Expedition.Target.cs, Source/ExpeditionEditor.Target.cs, Source/Expedition/Expedition.Build.cs, Expedition.cpp, ExpeditionSession.h/.cpp, ExplorerPawn.h/.cpp, ExpeditionController.h/.cpp, ExpeditionWorld.h/.cpp, Config/DefaultEngine.ini, Config/DefaultInput.ini, Tools/create_world.py, Tools/build_editor.sh, Tools/run_editor_tests.sh, Source/Expedition/Tests/InputAutomation.cpp, .gitignore und README.md im game root.

**Interfaces:** UExpeditionSession::GetState()->const Expedition::State&; Dispatch(const Action&)->Outcome; ApplyLearningReceipt(const LearningReceipt&)->Outcome; SetInteractionBlocked(bool). AExplorerPawn::SetMoveInput(FVector2D), CancelInput(), GetInteractionOrigin()->FVector. Controller ruft Dispatch ausschließlich über nahe Weltobjekte. AExpeditionWorld::ApplySnapshot(const State&) setzt Kollision/Objektzustand.

- [ ] Write GradeCrew.Expedition.InputCancel: diagonaler Input nicht schneller als axial; losgelassener/cancelled Touch und Dialogöffnung setzen MoveInput auf0; Dialoginteraktion bewegt/collectet darunter nichts.
- [ ] Build startet zunächst mit RED/missing module; Log sichern. Build-Werkzeug darf fremden Editor weder beenden noch dessen Map verändern.
- [ ] Implement Game/Editor target mit Unreal 5.8 BuildSettingsVersion.V7, eigener Modulname Expedition. Third-party dependencies0. Map /Game/Maps/Amazonas startet AExpeditionGameMode (in ExpeditionWorld.h/.cpp), Pawn und Session. AExpeditionGameMode::BeginPlay() erstellt die Welt ausschließlich über AExpeditionWorld.
- [ ] Author kompakte Karte32m×19m: Camp bei(-1000,0), Ufer bei(0,0), Station bei(1050,350), verbindende begehbare Pfade und echte Kollisionsgrenzen. Pawn max speed260cm/s; Kamera fest schräg mit weicher Nachführung, 1300cm sichtbare Breite als Startwert. Wasser nicht begehbar.
- [ ] Implement WASD/Pfeile, E, großen Touchstick und Interaktionsknopf; Interaktionen verlangen Sichtnähe bis180cm. Pure Diagramm-/Rätselaktionen aus Task 1 über dieselbe Dispatch-Schnittstelle.
- [ ] Run `sh "$GC_EXPEDITION_ROOT/Tools/build_editor.sh"`, `sh "$GC_EXPEDITION_ROOT/Tools/run_editor_tests.sh" GradeCrew.Expedition.InputCancel` und normaler Editor-Spielstart: Build Succeeded, Test PASS, Pawn wirklich bewegbar. Commit+push.

Tools/build_editor.sh ruft korrekt gequotet Engine/Build/BatchFiles/Mac/Build.sh ExpeditionEditor Mac Development mit absolutem Projektpfad auf. Tools/run_editor_tests.sh ruft UnrealEditor mit -unattended -ExecCmds="Automation RunTests <filter>" -TestExit="Automation Test Queue Empty" auf, speichert Logs/Report unter Reports und gibt bei fehlendem Test/Fehler nonzero zurück. Keine feste Schlafzeit als Pass-Nachweis.

## Task 3: Acht Demo-Aufgaben und Lern-/Notizbuchoberfläche

**Files:** Create ContentSource/demo-percent.json, demo-wordclasses.json, Source/Expedition/LearningSession.h/.cpp, DemoLearningProvider.h/.cpp, ExpeditionHUD.h/.cpp, Source/Expedition/Tests/LearningAutomation.cpp und Tests/learning_protocol_test.cpp.

**Interfaces:** LearningPackage={schemaVersion=1,packageId,revision,mode,slots[8]}. Slot={slotId,learningGoal,prompt,type,options,hint,explanation,transfer}; solution fields getrennt im privaten DemoProvider. ELearningPhase={Main,Hint,WorkedExample,Transfer,Confirmed}. ULearningSession::BeginSlot(int32); Submit(FString answer); OnFeedback(const LearningReceipt&,ELearningPhase,FString feedback). IExpeditionLearningProvider::Submit(slotId,phase,answer,submissionId) und CancelSession(); NativeBridge implementiert später exakt diese Schnittstelle. TeacherPreview zeigt dasselbe Paket; Schüler-HUD im Demo-Modus zeigt ständig „Lokale Beispieldaten“.

- [ ] Write SupportedAnswers: number mit „12,5“/„12.5“, Einheitencheck und Toleranzkante; text normalisiert Leerzeichen/Großschreibung, manualReview=true abgelehnt; unsupported/bildabhängige Typen und unvollständige8Slots verhindern Start.
- [ ] Write HintTransfer: Fehlversuch1=Hint, Fehlversuch2=WorkedExample+Transfer; Hilfe ohne pass-Receipt setzt kein slotBit. StaleFeedback nach CancelSession/Paketwechsel bleibt wirkungslos. Richtiges Main nach wiederholtem Raten verlangt Transfer.
- [ ] Run Pure-/Unreal-Tests RED; Implement zwei selbst verfasste geprüfte8erDemo-Pakete (2/3/3), unterstützte echte Antwortwidgets, Prompt/Lernziel/Fragenvorschau und pass-Receipt-Weiterleitung zu Task 1. Kein eingebauter Timer, der auf richtig umschaltet.
- [ ] Add großes Notizbuch/Inventar, markierte entdeckte Hinweise, leicht wiederöffnende Karte; Lerntexte bleiben aus HUD-Sprache/Frageinhalt getrennt. World blocked bis Dialog geschlossen, CancelInput vor Entsperren.
- [ ] Run Tests GREEN plus beide Themen im laufenden Unreal spielen; Fragenvorschau und Slot-Reihenfolge vergleichen. Screenshots Main/Hint/Transfer; Commit+push. Demo-Solutions dürfen ausschließlich Demo-Dateien sein; spätere Live-Pakete lehnen diese Felder ab.

## Task 4: Eigene3D-Art und drei sichtbare Rätsel

**Files:** Create Tools/create_assets.py, Tools/import_assets.py, ContentSource/art/manifest.json, Source/Expedition/Art/ExpeditionArt.h/.cpp, PuzzleActors.h/.cpp, Source/Expedition/Tests/WorldAutomation.cpp, Tools/preview_scenes.py.

**Interfaces:** AMapPuzzle::SetRotation(piece,quarterTurns), ABridgePuzzle::InteractAnchor(id), AStationPuzzle::SetConsumer(Consumer,bool) rufen Task 1/2 auf. Art hat BuildCamp/BuildShore/BuildStation(UWorld*) und AnimateFromState(State,float deltaSeconds); Assets werden nach manifest assetId referenziert. Import-/Mapskripte ändern nur eigenen /Game/Expedition-Pfad im geschlossenen eigenen Editor.

- [ ] Write WorldRecovery: falscher Anker→richtiger Anker korrigierbar; Montage aus beliebiger Sammelreihenfolge; beschädigter Pfosten gibt nachvollziehbares Feedback; Pump-Off nach Brückenrast hält Rückweg offen; Überlastung löschen durch Verbraucherwechsel; SendSignal vor radioReady erzeugt kein Finale.
- [ ] Run RED; author eigene Geometrie für gerundete Explorerteile, Zelt/Falten, Schilf, Bäume, Felsen, Stege, Seilwinde, Station/Generator/Schaltpanel und Versorgungsboot. PythonStandardbibliothek schreibt deterministischeOBJ/WAV + Manifest; Import über Unreal. Alternativ eigener ProceduralMesh-Generator für Teile, deren OBJ-Import unzuverlässig ist; keine ausgeliehenen Gameassets.
- [ ] Use drei abgestimmte Materialgruppen Holz/Stoff/Stein, warme Sonne, weiche Schatten, türkises Wasser mit langsamer Bewegung, lesbare Kontraste und minimale Partikel. Eigene artikulierte Lauf-/Idle-/Interaktionsbewegung; keine schwebende ungegliederte Platzhalterkapsel als Finalfigur.
- [ ] Implement Kartenhälften mit90Grad-Schritten, sichtbare Landmarken; Seil an zwei selektierbare Punkte plus Kurbel; rotierende Winde und tatsächlich öffnende Brücke; Verbraucherlichter/Generatorstatus und befahrendes Bootfinale aus Weltzustand.
- [ ] Run WorldRecovery GREEN und Requestscreenshot aus tatsächlichem gerendertem Camp/Ufer/Station. Bilder visuell öffnen; Größe/Lesbarkeit/Interaktionsziele prüfen. Keine Weltpolish-Fertigmeldung aus Unit-Tests. Commit+push aller Generatoren/Assetsource, Logs und Bildbelege; generierte Builds/EngineCaches ignorieren.

Blender bleibt optional, bis ein tatsächlich ausführbarer Pfad belegt ist. Nicht erneut breit das gesamte Home-Verzeichnis durchsuchen. Original 3D-Assets dürfen ohne Blender gebaut werden.

## Task 5: Speichern, Fortsetzen, Pause und lokale Evidenz

**Files:** Create Source/Expedition/ExpeditionSaveGame.h/.cpp, SessionPersistence.h/.cpp, ActivityClock.h/.cpp, Source/Expedition/Tests/SaveAutomation.cpp und Production/HANDOFF.md, Production/run-history.json.

**Interfaces:** UExpeditionSaveGame enthält schemaVersion=1, SessionId, PackageId, PackageRevision, FactsSnapshot, verifiedSlotReceiptIds und counters; keine Lösungsschlüssel/LiveCapability. SessionPersistence::Save(const State&,const ActivitySnapshot&)->bool; Load(packageId,revision)->FLoadResult{status,state,counters}, status={Valid,Missing,Corrupt,WrongRevision,ImpossibleState}. ActivityClock::SetMode({World,Learning,Menu,NetworkWaiting}); AddActiveDelta(double seconds); Snapshot()->{worldSeconds,learningSeconds}.

- [ ] Write InvalidSave: fehlende Sicherung trotz radioReady, bridgeLatched ohne zwei gültige Anker, andere Paketrevision, abgeschnittenerSave→ explizites Neustartangebot; niemals still korrupten Fortschritt übernehmen.
- [ ] Write PauseResume: Main→Menu→Resume stoppt aktive Zähler im Menü, hält State unverändert, repariert gehaltene Eingaben; doppelteFortsetzung kopiert kein Item. LiveResume bleibt erst nach serverseitiger Reconciliation freigegeben.
- [ ] Run RED; implement versionierten SaveGame mit atomar geprüftem Snapshot nach jeder Applied-/AcceptedAktion, eigenes speicherbares Demo-Sessionlabel; fehlgeschlagenes Schreiben zeigt Hinweis und lässt Welt korrekt weiterlaufen.
- [ ] Implement Menü Weiter/Neustart mit Bestätigung, keine Entwertung alter Session durch bloßes Menüöffnen. Keine Rohantwort-/Schülertext-Logs; RunHistory nur SourceSHA, Paketrevision, Befehle, Ergebnisse, Screenshots und Geräteangaben.
- [ ] Run GREEN, App schließen und normal wieder öffnen, Camp/Brücke/Station aus mehreren Zwischenständen fortsetzen. Commit+push.

## Task 6: Vollständiger Build, Zeitabnahme und Review

**Files:** Create Tools/package_mac.sh, Tools/smoke_session.py, Source/Expedition/Tests/FullRouteAutomation.cpp, Production/ACCEPTANCE.md; Modify README.md, Production/HANDOFF.md, Production/run-history.json, eigene TODO-/Registry-/State-Zuordnung bewusst gegen frisches main.

**Interfaces:** FullRoute verwendet Dispatch/ApplyLearningReceipt; visual smoke nutzt tatsächliche Weltobjekte und UI, kein Setzen fertigerState-Felder. package_mac.sh ruft vorhandenes RunUAT.sh BuildCookRun mit Expedition.uproject -platform=Mac -build -cook -stage -pak -archive auf und liefert absoluten App-Pfad.

- [ ] Write FullRoute: beide Demo-Themen, falsche Antworten, falscher Weg/Anker, Überlastung, SaveResume und Finale durch reale Interaktionen; nicht nur Kernstate setzen. Test RED vor vollständiger Route.
- [ ] Run alle passenden Tests nach finalem Build; regulärer .app-Start zusätzlich zu Automation. Prüfe Screenshot-/Logbelege und technische Skips.
- [ ] Führe mindestens einen echten ersten Durchlauf ohne Automation durch; protokolliere aktive Gesamtzeit und Lernzeit. Ziel8–12 Minuten/60–70%; bei Abweichung Texte/Wege/Umfang abstimmen statt Wartezeiten künstlich hinzufügen. Keine menschliche Erstspielzeit aus Scriptlauf ableiten.
- [ ] Verify Desktoplesbarkeit, Touchlayout und Simulator getrennt; physisches iPad/iPhone benennen und 30 fps-Ziel messen, sobald verfügbar. Ohne Gerät offen dokumentieren, nicht durch Desktoptest ersetzen.
- [ ] Frischen Gesamtbranchreview nach gewähltem Workflow durchführen; relevante Befunde beheben und betroffene Checks wiederholen. Danach Draft-PR zu main erstellen/anhängen. Übergabe mit exactSHA/Code/CI/Integration/Device-Grenzen aktualisieren. Keine automatische Integration/Veröffentlichung.

## Plan-Selbstprüfung

Alle sieben Spec-Bereiche zugeordnet: Handlung/Rätsel Tasks 1/4; Steuerung/Art2/4; Lernen/Vorschau3; Save/Timing5; Belege6; LiveAnbindung separater verlinkter Plan. Die fünf ReviewFocus-Fälle sind benannten Tests zugeordnet. State/Receipt/Provider-Signaturen werden konsistent durchgereicht.8–12/60–70 bleiben echte Spieltestziele. Kein neuer Skill-/Provider-/GitHub-Run aus einer Checkliste ohne realen Schritt. Ausführungswahl noch offen.

## Ausführungswahl zur Planprüfung

Gleiche Kriterien: Zusammenhang der Schnittstellen, Aufwand durch Kontextwechsel, Schutz des einzigen Unreal-Editors und unabhängiger Review. **Selbst im Chat:8/10**, empfohlen, weil Session/UI/Welt stark gekoppelt sind und nur ein Editor schreiben soll; ein unabhängiger Gesamtbranchreview bleibt erforderlich. **Unteragenten je Task:7/10**, nützlich für isolierte Regel-/Backendtests, aber mehr Übergaben und Prüfung derselben Schnittstellen; mehrere Editor-Schreiber sind ausgeschlossen. Das sind begründete Eignungseinschätzungen, keine gemessenen Qualitätswerte. Die Wahl ist noch nicht eingegangen.
