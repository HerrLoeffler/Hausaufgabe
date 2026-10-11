# GC-GAMES-PIPELINE-01 — gemeinsamer Produktionsguide

Stand: 11.10.2026 02:02 UTC · Owner: GradeCrew-Zentrale, Root-Chat 01a10df6. Fachauftrag: Guidekonsolidierung. Diese Übergabe führt die bestehende Task weiter; keine neue GC-GAMES-GUIDE-ID.

## Auftrag und Grenzen

Eine kanonische Repo-Anleitung für künftige GradeCrew-Spiele verankern. Verbindliche Produktvorgabe für diesen Auftrag: Kochspiel 2D, Lerninsel 3D. Der dokumentierte Wunsch behauptet nicht, dass aktuelle Builds diese Dimensionen bereits verwenden. Keine Spielcode-, Build-, Asset-, Toolinstallations-, Enginewechsel-, bezahlte API-, privaten Daten-, Staging- oder Productionarbeit.

## Quellenstand

Frischer Ausgangsstand: main f8d2c312105b708120cf87ff243a5ea6ef906bfa; Development-Statusläufe laut Root 114364164583 (main), 114364164572 (Handoff) und 114364164531 (Live) erfolgreich. Offene PR153 und PR185 sind Quellmaterial derselben GC-GAMES-PIPELINE-01, bleiben unberührt; Aussagen daraus sind erst nach eigener Prüfung bindend. PR28 ist ein nicht integrierter Lab-Draft für Games-Web-UI. Auf main existiert die begrenzte [3D-Assetqualitätsregel](../docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md); sie erzwingt keinen 3D-Weg für 2D-Arbeit. Forschungsindex: [Videoanalyse](../docs/research/video-insights-20261011-summary.md).

## Gesicherter Zwischenschritt

Neuer Konsolidierungsbranch docs/games-guide-consolidation-20261011, ab main. Geschrieben auf diesem Branch: kanonischer Workflow und Briefingvorlage; kurzer AGENTS-Einstieg; passende TODO-/Registryzuordnung; diese Übergabe. Gemeinsame native Feedback-/KI-Brücke ist nicht belegt; PR185 bleibt ein nicht bindender Entwurf. Prototypfeedback bleibt bis zu einem freigegebenen Vertrag im autorisierten Arbeitskontext dokumentiert. Gemeinsamer Kern und 2D-/3D-Abnahmen gleichen Qualitätsanspruchs dokumentieren. Skills nach aktuellem Katalog und Anlass verwenden; Repo-Regeln behaupten keine automatische Runtime-Aktivierung.

## Status und nächster Schritt

Lifecycle dieser Dokumentationsaufgabe: `integrated`.

PR [#217](https://github.com/HerrLoeffler/Hausaufgabe/pull/217) wurde am 11.10.2026 um 02:18 UTC mit dem geprüften Head `340fc84ff47415c0a515f8b47fa936005b73078f` gegen den damaligen main `f8d2c312105b708120cf87ff243a5ea6ef906bfa` gemerged. Merge-Commit: `f2da06723c3357b359e42b67d1cda37541d518ec`. Bei dieser Receipt-Aktualisierung war main inzwischen auf `a3eefe2863a4357dd5b4076be9b786fd74bb724a` weitergezogen.

Unabhängiger Inhaltsreview: PASS für exakt Head `340fc84ff47415c0a515f8b47fa936005b73078f`, Receipt-SHA `1131d27fc137a76181b5968e050ba1cd229667bb403b6f6009cdf2b020e84a31` (lokaler Bericht `analysis/GC-GAMES-PIPELINE-01/final-review-20261011.md)). Doku-Prüfungen auf dem PR-Head: Project handoff checks Run `38104195807` / Job `114366102762` SUCCESS; GradeCrew Development Status Run `38104195790` / Job `114366102676` SUCCESS.

Nach dem Merge liefen auf `f2da06723c3357b359e42b67d1cda37541d518ec` Project handoff checks `38104721451`, GradeCrew Development Status `38104721454` und GradeCrew Release Control `38104721455` erfolgreich. Nach dem folgenden Main-Commit `a3eefe2863a4357dd5b4076be9b786fd74bb724a` waren Project handoff checks `38104749464` und GradeCrew Development Status `38104749424` erfolgreich. Dies belegt den Dokumentations-/Koordinationsstand, keinen Games-Deploy.

Die bindende Regel und Briefvorlage stehen in [GREAT_GAMES_WORKFLOW.md](../docs/games/GREAT_GAMES_WORKFLOW.md) und [GAME_PROJECT_TEMPLATE.md](../docs/games/GAME_PROJECT_TEMPLATE.md); `AGENTS.md` verlinkt beide für Games-Aufträge. Der Merge betrifft Dokumentation und Task-Lifecycle. Keine Spielimplementierung, Assetänderung, Laufzeit-/Buildprüfung, Geräteabnahme, Staging oder Production. Die bestehende visuelle Assetqualitätslücke bleibt unter GC-IMG2THREEJS-01 / GC-GAMES-ESCAPE-VISUAL-01 offen; dieser Receipt ändert sie nicht.

Historische Zwischenstände bleiben als solche erhalten: PR-Head `325e16d34c9c2ac84ed8ffb248a8a444b911ec19` mit den damals aufgezeichneten Runs `38104132210` und `38104132227` war nicht der finale Review-/Merge-Head. Früherer main-Ausgangsstand `f8d2c312105b708120cf87ff243a5ea6ef906bfa` bleibt der dokumentierte Branch-Ursprung. Keine Änderung am Release Train oder Production.

Nächster Schritt: Den Guide bei einem separat autorisierten Spielauftrag anwenden. Die offene reale Spiel-/Assetqualität wird in ihrer bestehenden Aufgabe weiterbearbeitet.
