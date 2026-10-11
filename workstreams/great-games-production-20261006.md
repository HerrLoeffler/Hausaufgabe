# GC-GAMES-PIPELINE-01 — gemeinsamer Produktionsguide

Stand: 11.10.2026 02:02 UTC · Owner: GradeCrew-Zentrale, Root-Chat 01a10df6. Fachauftrag: Guidekonsolidierung. Diese Übergabe führt die bestehende Task weiter; keine neue GC-GAMES-GUIDE-ID.

## Auftrag und Grenzen

Eine kanonische Repo-Anleitung für künftige GradeCrew-Spiele verankern. Verbindliche Produktvorgabe für diesen Auftrag: Kochspiel 2D, Lerninsel 3D. Der dokumentierte Wunsch behauptet nicht, dass aktuelle Builds diese Dimensionen bereits verwenden. Keine Spielcode-, Build-, Asset-, Toolinstallations-, Enginewechsel-, bezahlte API-, privaten Daten-, Staging- oder Productionarbeit.

## Quellenstand

Frischer Ausgangsstand: main f8d2c312105b708120cf87ff243a5ea6ef906bfa; Development-Statusläufe laut Root 114364164583 (main), 114364164572 (Handoff) und 114364164531 (Live) erfolgreich. Offene PR153 und PR185 sind Quellmaterial derselben GC-GAMES-PIPELINE-01, bleiben unberührt; Aussagen daraus sind erst nach eigener Prüfung bindend. PR28 ist ein nicht integrierter Lab-Draft für Games-Web-UI. Auf main existiert die begrenzte [3D-Assetqualitätsregel](../docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md); sie erzwingt keinen 3D-Weg für 2D-Arbeit. Forschungsindex: [Videoanalyse](../docs/research/video-insights-20261011-summary.md).

## Gesicherter Zwischenschritt

Neuer Konsolidierungsbranch docs/games-guide-consolidation-20261011, ab main. Geschrieben auf diesem Branch: kanonischer Workflow und Briefingvorlage; kurzer AGENTS-Einstieg; passende TODO-/Registryzuordnung; diese Übergabe. Gemeinsame native Feedback-/KI-Brücke ist nicht belegt; PR185 bleibt ein nicht bindender Entwurf. Prototypfeedback bleibt bis zu einem freigegebenen Vertrag im autorisierten Arbeitskontext dokumentiert. Gemeinsamer Kern und 2D-/3D-Abnahmen gleichen Qualitätsanspruchs dokumentieren. Skills nach aktuellem Katalog und Anlass verwenden; Repo-Regeln behaupten keine automatische Runtime-Aktivierung.

## Status und nächster Schritt

Release-Stufe: branch_only. PR [#217](https://github.com/HerrLoeffler/Hausaufgabe/pull/217) gegen main, aktueller geprüfter Head bei Übergabeaktualisierung: 325e16d34c9c2ac84ed8ffb248a8a444b911ec19. Development Status Run 38104132210 und Project handoff checks Run 38104132227 auf diesem Head erfolgreich. Die Übergabeaktualisierung erzeugt einen neuen Head; für diesen müssen dieselben Dokumentationschecks erneut erfolgreich sein, bevor Root-Review/Mainintegration. Nächster Schritt: unabhängigen Inhaltsreview und Checks am finalen PR-Head abwarten. Keine Spieltests, Runtime-Checks, Geräteabnahme oder Deploy durchgeführt. Keine Änderung an Release-Train oder Production.
