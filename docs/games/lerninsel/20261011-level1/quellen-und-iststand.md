# Quellen, Baseline und technische Leseprüfung

Planauftrag vom11.10.2026. **Keine neue Recherche, kein Build/Test/Spielstart, keine OS-Aufnahme.** Vorhandener Source und bestehende Bilddateien wurden gelesen. Eigener sauberer Checkout wurde exklusiv auf den Dokumentationsbranch vom unveränderlichen Remote-Spielkandidaten umgestellt; historischer lokaler L1-Branch/Commits bleiben erhalten.

## Feste Belege

| Quelle | Festgestellter Stand | Verwendungsgrenze |
|---|---|---|
| PR175 | Offen/draft, Head a5dc474295dea4abda06c5be8923de1bc0206248, branch_only | Kein neuer Lauf-/Gerätenachweis |
| Remote main | Frisch geladen30c0e8e111ac88398d1f85ff19574e87f47df732 | Regeln/Koordination; nicht mit Spielbranch verschmolzen |
| Live Development Status | Run38137351207, Job114463831245, success | Lerninsel+19/−127 zu main, PR175; Design-PR173 und .gitignore-Überschneidungen bekannt |
| Eigenes Checkout | Arbeitsbeginn tracked/untracked sauber; Basisbaum gegenPR175 unverändert | Nur Dokumente dieses Auftrags werden geschrieben |
| Source-Checkout | Bestehender ursprünglicher gradecrew-lerninsel-unreal nicht übernommen/bearbeitet | Keine Kontrolle seiner laufenden Prozesse durch Spielstart/Stop nötig oder erfolgt |
| L1 `Production/L1/verification.json`, Reports | Historische231+5, zehn geskriptetePIE-Kameras, Gate-/Stichprobenkollision | Nicht normaler durchgehenderWASD-/OS-Klicktest |
| Gelesene WorldPreview00/02 | GroßerHUD, flacheperspektivischeWörter, gleichmäßigeshellesRaster/dunklerHintergrund | Pose02 ungelöstesIntro ist keinneuerProduktbug |
| Gelesene layout-a/layout-b | Konzepttafeln mitHerbst-/Grün-/Kalkstein undoffenenFernblicken | GenerierteKonzepte, keineRuntime/Originalasset-/Rechtefreigabe |

Die aktuellen main-Einstiege START_HERE, AGENTS, STATE, TODO, workstreams/README, CHAT_CONTRACT, GREAT_GAMES_WORKFLOW, GAME_PROJECT_TEMPLATE und Assurance-README wurden gelesen. Dazu relevante SEC-/PRIV-Kataloge und Rollenbriefs. Einzeldatei-SHAs stehen im Quellenmanifest. Allgemeine P0-/Releasegates werden nicht durch diesen lokalen Plan erfüllt; eine unveränderte Liste löst keinen Vollscan aus.

## Tatsächlich gelesene Code-Anschlussstellen

- `IslandWorld.cpp:21–35`: Capsule30/88, Camera72, FOV75, Speed420, Step30, keinJump, Pitch±75. `CharacterMovementComponent.cpp` des installierten UE5.8 setztFloorZ0,71; Ableitung≈44,765°, nochkeinRuntime-Propertydump.
- `IslandWorld.cpp:39–52`: E/Linksklick Press, Focus/CancelInput/Resume, PickApprox85+Occlusion, E überNear; Touch ist vorbereitet, keinheutigerGerätebeleg.
- `IslandWorld.cpp:55–66`: Slot-/Build-/Load-Reihenfolge, NearestTargets, footdwell überContact; keineeingebauteLevel1Referenzklasse.
- `IslandWorld.cpp:68–97`: direkteIntro-/Pathaktionen, AutoCheck, Wort-/Reihenfeedback, tatsächlichesSavebeiStateänderung.
- `IslandWorld.cpp:99–107`: LI4Load, alteX-/Y-/Z-Grenzen, SafeFallback−1600, auto-check alterkorrekterAuswahl, ResetDemo, GateBlocks.
- `IslandWorld.cpp:109ff`: Gateanimation1,4s/89,9°, Flags→Barrier; übrigeWeltrefresh bleibtgetrennt.
- `IslandArt.cpp:50–71`: großerflacherBoxboden, Rasterweg, BogenX−1780, GateX−150/1350, bestehendeWörter/Targets/Hilfe/Rücknahme.
- `Core/IslandRules.h`: IntroMask5, Path0/4/8, WrongRow/Full/Undo, LI4/Legacyvalidierung, PlateContact0,30s.
- `IslandHUD.cpp`:700×166Panel, statebasierterAuftrag, Near-/Feedback-/Touchanzeigen.
- `IslandFocusWidget.cpp`:nativeUMG/SlateButtons, Focusrefresh, Pause/Slider25–300/FOV75/85; keinebelegteStart-/Referenz-Neustartfläche.
- `Content/Tasks/tasks.json`, `Core/IslandTasks.h/.generated.h`, `Tools/generate_tasks.py`:bestehendeTasks10/20 undstufigeHilfe; generierteQuellennichtvonHandschreiben.
- `.uproject` und `Lerninsel.Build.cs`:keinGameET-Plugin/Modulregistriert imgelesenenKandidaten.

## ET-Vertrag und Historie

Read-only ET-Übergabe aus `/Users/martin/Documents/Codex/2026-10-10/gradecrew-games-et/work/game-et/workstreams/game-et-20261010.md` und letzter abgeschlossener ET-Chatturn gelesen. Shared-Modul/Pizza hat lokale Composer-/Capture-/Receipt-/Tastaturbelege; Live-Maus/Ink-/markierterPayload und generischer Prüferinputadapter bleiben dort begrenzt/offen. Diese Belege werden nicht auf Lerninsel übertragen. Der bestehende Owner behält Shareddateien und echten Versandvertrag. Hier keineNachricht/anonymeWeiterleitung/DB undkeinETImport.

## Forschung nur als begrenzte Methodenquelle

`video-insights-20261011-summary.md` und `strategie-nerd-20261011-methods.md` wurden aufmain gelesen. Räumlich lesbareRouten, sichtbareZustände undUrsache/Wirkung fließen alsGestaltungsprinzipien ein.19visuelleProben/68Titelgruppen sind keinevollständigenGameplay-/Assetrechte-/Lernwirkungsbelege; primäreProduktseitenbelegen nichtdiesesSpiel. Keine neueRecherche/Engineproduktion ausdieserQuelle.

## Modell-/Reviewauftragsgrenze

Planowner requested Sol/medium; tatsächlicher laufender Rootturn nicht durch lesende Toolmetadata belegt, daheractual=unknown. Keine erzwungeneLive-Umschaltung/keinAstra. Genauzwei autorisiertePlanprüfer werden mit verfügbarem `gpt-6.1-sol`, `medium` angefragt, fork_turns=none, denselben eingefrorenenDokumentcommit/Rohquellen und jeeigenemFokus. IhreeigeneRuntimeangabewird getrenntvonrequested dokumentiert. Preis/Usageunknown; keinEinsparungsversprechen. A/BkeineRuntimeinputs/Builds/Tests/Implementierung.
