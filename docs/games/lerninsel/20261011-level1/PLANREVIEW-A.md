# Tester A — unabhängiger technischer Planreview

Task GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011. Unveränderliches Ziel `1caa38a5f2dfae437d5122bd59d4bfe29a88a53d`, Spielbasis PR175@a5dc474. Reviewer `/root/level1_tester_a`. Requested `gpt-6.1-sol / medium`; tatsächliche Runtimekonfiguration nicht unabhängig beobachtbar: **unknown**. Erster Bericht ohne Kenntnis von B. Alle Planunterlagen und relevante tatsächliche World-/Art-/Core-/Widgetquellen am festen SHA gelesen. **Keine Schreibaktionen, Tests, Builds, Editor-/Spielstarts oder OS-Aktionen.** Dieser Bericht dokumentiert die unabhängige Agentenantwort mit allen Befunden und ihren Grenzen.

## Urteil und Stärken — ausschließlich PLAN

Technisch grundsätzlich tragfähig, gezielte Planrevision erforderlich. Keine Critical-Befunde. D/S sind echte vollständig beschriebene Varianten; S erhält aktive Reihe, Nebenlaufspur, 0,30-s-Zentrum, tatsächlichen Floorhit, Besuchskonsumierung und Rearm. Render-/Collider-/Normalinputbelege sind getrennt; historische Posen werden nicht zum normalen Playtest. Ganze blaue Steinoberseite und passende Pawnkollision sind korrekt als neuer Zielvertrag erkannt. Gateanimation, Reportfrische, Saveisolation und ET-Grenzen sind sinnvoll. **Keine Build-/Geräte-/Kinderfreigabe.**

## Standards-/Technikbefunde

| ID | Priorität, Quelle | Beobachtung / Impact | Kleinste Planrevision / Konfidenz |
|---|---|---|---|
| A1 | Important; Hauptplan3.1–3.2, M2 | Die90-cm-Smoothstep-Kuppe ist rechnerisch ≤16,70° aufwärts/≈13,79° abwärts. W2/W4 passen. Die zugesagten200cm Plateau fehlen: horizontale Tangente an einem Punkt ist kein Plateau. Alte140cm/450cm-Smoothstep wäre25,02°, Durchschnitt genügt nicht. | Plateauintervall ausdrücklich hinzufügen und Abstieg/W4/W5/Assertions synchronisieren; hoch |
| A2 | Important; Varianten S, Hauptplan6.4, Core/IslandRules.h28–31, World `Interact` | `PathStart` setzt bei erneutem Aufruf Count/Array/Fehler zurück. Das weiterhin erreichbare Terminal20 kann richtige Reihen entgegen Erhaltungsversprechen löschen. | Referenzadapter macht erneuten Start zu state-neutralem Already/Info; eigener Matrixfall. Vollreset nur bestätigter Abschnitt-Neustart; hoch |
| A3 | Important; Hauptplan8/9.2, M2/M5/M6, WorldBeginPlay/ControllerBeginPlay/SaveLoad | ReferenzGameMode/Mapoverride konkret, Anschlussmode nicht. Normalmap lädt `LerninselV1` und Controller separat `LerninselPreferencesV1`. Geschriebener Handoffslot allein schützt Zielsession nicht; Save/Load heute nicht virtuelle Spezialmethoden. | KonkreteTravel-/GameMode-/Save-/Preferencesauflösung vor jedem Load und während ganzer Session; Directstart/fehlenderHandoff und nächsteSatz-/Preference-/Resumeaktion prüfen; hohe Source-/mittlere Vollständigkeitskonfidenz |
| A4 | Minor; Hauptplan3.3/8.2, M5, Character-Tick | Bestehende Z<−150-Abkürzung setzt auf−1600/0/88, könnte neuenSafePose-/Beweismarker umgehen. | Referenz Character-Tick an denselben Recoveryvertrag routen und vor Reset protokollieren; hoch |
| A5 | Minor; Meilensteine/Matrix, M3/7.1 | Fehlende Leerzeichen erschweren prüfbare Anwendung. D-only-Test/Copy nicht überall profilgebunden. | Redaktionelle Korrektur, D-only direkt am Test, S-Copy im Hauptablauf; hoch |

Zusatzhinweis zu A3/A4: Resume auf Wortmitte muss bei S den Besuch zunächst konsumiert/sperrig herstellen, obwohl Contact transient verworfen wird. Ein wiedergearmter Footvisit darf keine neue unbeabsichtigte Antwort erzeugen. M3 muss nicht nur Queryflächen, sondern wirkliche Stein-Pawnkollision bauen.

## Annahmen und zurückgestellte Fragen

Physics-Cookingwahl, tatsächliche Performance, Wortlesbarkeit, Assetrechte, qualifizierter Nativeinputadapter und Kinderverständlichkeit sind noch nicht implementiert. Sie besitzen spätere Gates; fehlender heutiger Runtime-PASS ist kein Planfehler. Quellen-Floorwert ist nicht Runtime-Propertybeleg. Keine neue Recherche/Bildbewertung für die obigen technischen Befunde benötigt. Berechtigte technische Findings werden nicht durch Stilvorteile oder Mehrheitsentscheidung aufgehoben.
