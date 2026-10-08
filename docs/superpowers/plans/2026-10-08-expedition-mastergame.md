# Expedition Mastergame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Die bestätigte neue Expedition als lokal startbares Unreal-Spiel mit zwölf Stationen bauen.

**Architecture:** Eigene reine C++-Regeln entscheiden über Fortschritt und Gegenstände. Unreal GameMode orchestriert Welt, Speicherung und zentrale Eingabe; native Slate-Widgets stellen Dialoge dar. Die Welt entsteht aus selbst verfassten Formen und Engine-Materialien. Keine externen Spielbibliotheken.

**Tech Stack:** Installiertes Unreal 5.8, C++20, Engine/Slate, lokaler SaveGame, Xcode clang.

**Spec:** docs/games/expedition-masterproject-20261008/01-spielbuch.md, 02-drehbuch.md, 03-bauvertrag.md. Martin bestätigt am08.10.2026 mit „los baue das spiel“ den Entwurf und verlangt unmittelbare Ausführung. Keine zusätzliche allgemeine Freigabeschleife.

## Execution status

Local native build and synthetic native route/regressions complete; human OS mouse/mobile/time/quality acceptance and live GradeCrew remain open. Source6644679828c9fe449458dab241bf53df7238ae1e, detailed receipt and current handoff in game Production/. User instruction to build was executed without another general approval loop.

## Global Constraints

- GC-GAMES-ESCAPE-VISUAL-01, vorhandener eigener Checkout und feature/escape-expedition-unreal-v1 / PR171.
- Zwölf Stationen: sieben Schulaufgaben, fünf Logikrätsel; Ziel circa zehn Minuten, erst nach realem Spieltest zeitlich bestätigt.
- Küstenort → Garten/Wald → Strand/Steg → Ruine, feste Nordausrichtung/Vogelperspektive.
- Eigene Figur und Welt; keine übernommenen Pokémon-Assets oder Zusatzbibliotheken.
- Sechs Inventarplätze, falscher Einsatz verbraucht nichts; Voraussetzungen ohne Sackgassen.
- Lokale Beispieldaten eindeutig kennzeichnen. GradeCrew-Live-Lifecycle getrennt offen; keine produktiven Bewertungsschlüssel im Client.
- Mausbuttons native Widgets; Dialoge sperren Bewegung und verwerfen gehaltene Eingabe bis zum Loslassen.
- Eigene Automations-Saves, Nutzersave unberührt. Keine Production-/Staging-Veröffentlichung.

## Review Focus

- Gehaltene Bewegung vor Dialog und Fensterfokusverlust: stehenbleiben bis frische Eingabe.
- R1 erst später lösen: vollständiger Rückweg bleibt möglich.
- Doppelte Prüfung: nur eine Belohnung und keine erneute Abgabe im Ergebnisfenster.
- Beschädigter/fremder Save: verständlich ablehnen, keine Freischaltung durch Positionsdaten.
- Maus/Tastatur bei abweichender Fenstergröße: dieselben sichtbaren nativen Buttons aktivieren.

### Task 1: Episode rules and recovery

**Files:** Create Source/Expedition/Core/ExpeditionEpisode.h; Tests/episode_test.cpp. Modify Tests/run.sh.
**Interfaces:** ExpeditionV2::State; Result; School(State&, int, const std::string&); CollectShell; UseShell; ChooseRoute; SelectAnchor; Tension; PickMosaic; RotateMosaic; PlaceMosaic; PutSymbol; ConfirmSymbols; Ignite; Validate; ItemState.
- [x] Write tests for complete route, wrong/non-consuming actions, delayed rope, six symbol permutations, twelve mosaic configurations, equivalent fractions, prerequisite graph, duplicate receipts and invalid state.
- [x] Run Tests/run.sh and observe missing new rule implementation fail.
- [x] Implement revision master-1 and seven school/five logic completion bits, six item states and reversible previews.
- [x] Run old and new pure-rule suites; commit.

### Task 2: Runtime and save orchestration

**Files:** Modify ExpeditionWorld.h/.cpp; create ExpeditionQuestions.cpp. Replace old ExpeditionAutomation.cpp tests.
**Interfaces:** AExpeditionGameMode::Click(int), Interact(int), NewGame(), Save(), Load(), SetDialog(EExpDialog), StepMovement(float), QuestionFor(int,bool), Mission(), RebuildUI(), BuildWorld(), RefreshWorld(). World targets use agreed IDs0..14 and planar coordinates; gates depend on confirmed stations.
- [x] Add native tests for UI state transitions, held movement, save revision/invalid state, full twelve-station route and teacher question mapping.
- [x] Implement question selection+explicit checking, neutral hints, transfer after mistakes, proper save validation and reachable-position recovery.
- [x] Build installed Unreal Editor target and run native automation in separate slots; commit.

### Task 3: Native interface and original world

**Files:** Modify ExpeditionHUD.cpp (Slate screen), ExpeditionArt.cpp (world only), Config/DefaultInput.ini (capture policy).
**Interfaces:** Fixed header contract from Task2. World and UI files are independent; parallel agents own only their assigned file, no builds/commits until root integration.
- [x] UI: single next objective, small six-slot bag, bottom dialogue, four selectable answers plus Prüfen, route/anchor/mosaic/symbol visual previews, teacher preview, local-demo label.
- [x] World: four connected compact scenes with matte surfaces, organic trees, readable paths, NPC identities, original chibi explorer, actual bridge/gate changes, water/ruin finale.
- [x] Verify native widget construction and all registered target/gate IDs; inspect real screenshots, correct visible layout failures.
- [ ] Exercise real OS mouse start/talk/select/check and keyboard movement: CUA window binding/timeout blocked; native Slate event/regression tests pass, human playtest remains open.

### Task 4: Delivery and review

**Files:** README, Production/HANDOFF, Reports/Mastergame, existing workstream/TODO/status own section.
- [x] Run both rule suites, native smoke/full-route automation and fresh final build.
- [x] Independent fresh-context code review, fix material issues and rerun affected checks.
- [x] Keep one-click local launcher, open tested build; back up source/receipts on existing GitHub branch.
- [x] Report actual checks and remaining mobile/live integration limits without claiming quality/time user acceptance.
