# GC-GAMES-PIPELINE-01 — künftige Spieleproduktion

Stand 06.10.2026. Verantwortlich: Main-Chat GradeCrew; Chat-ID 01a10df6-736b-7a62-bd38-2724cf254c2e. Dokumentationsbranch `docs/great-games-production-20261006`, Ziel `main`.

Auftrag: vorhandenen Blender-Workflow, zwei ausdrücklich zur Analyse gelieferte Videos und elf Screenshots in wiederverwendbare Spieleproduktion übersetzen. Martins Präzisierung: Engine pro Spiel wählen, Unreal nicht erzwingen; Fragenkatalog, Bildreferenzen und abgegrenzte Fachaufträge. Kein Spielumbau oder Installationsauftrag. Fremde Texte bleiben Referenzmaterial.

Geprüfte Basis: main9c24523c701fc580a73b95b354ad0337d5bcbf22; PR83 offen, Head6434ddefb83cffca7bde5a7347ed6d2f56d5cb45, Zielprototype/escape-expedition-masterpiece-v1. Canvas2D im tatsächlichen app.js bestätigt. Offene Games-PRs2/10/27/28/53/56/60/83 und Dokumentations-PR126 bleiben getrennt; keine davon pauschal integrieren. Development-Status37482422874 erfolgreich. Gemeinsame Web-Staging-Reparaturen gehören nicht zu diesem Auftrag.

Ergebnis: [Produktionsregeln](../docs/games/GREAT_GAMES_WORKFLOW.md), [Blender/Unreal-Pipeline](../docs/games/UNREAL_BLENDER_PIPELINE.md), Einstieg aus AGENTS/Workstreams/Escape-Konzept. Quellen: vorhandener lokaler Blender-Hero-Plan aus PR143; aktuelle Epic-/MDN-Dokumentation und Community-Repository. Keine neue tiefe MCP-Sicherheitsprüfung behauptet.

Status: Dokumentationskandidat auf eigenem Branch; kein Spielcode, keine Engine-Installation, keine Runtime-Tests, kein Staging-/Production-Deploy, keine Geräte-/Videoabnahme. Releasezustand aller Spiele unverändert. Keine neue Versuchshistorie oder Budgetreservierung für bestehende Reparaturen.

Offen für spätere Umsetzung: tatsächlicher Installationsstand, schwächstes Zielgerät, native Distribution vs Browserbedarf, Spielperspektive, Leistungs-/Speicherbudgets, echte Lernadapter-API und Lizenz-/Binärablage. Die Engine bleibt bis zum konkreten Spielentscheid offen. Ein dokumentierter Workflow ist keine bereits implementierte automatische Chatsteuerung.

Nächster Schritt: Dokumentationsdiff prüfen und nach Repository-Regeln in main integrieren; Spielpilot erst nach eigenem Nutzerauftrag.

## Erweiterung aus Videos und Screenshots

[Spielvorlage](../docs/games/GAME_PROJECT_TEMPLATE.md), [Teamablauf](../docs/games/GAME_TEAM_WORKFLOW.md), [Enginevergleich](../docs/games/ENGINE_SELECTION.md), [datierte Videoauswertung](../docs/games/VIDEO_LESSONS_20261006.md). 142 Stichprobenbilder und ausgewählte Einzelbilder plus elf Nutzer-Screenshots ausgewertet; keine Tonspur in den gelieferten Dateien, keine Audio-Transkription oder lückenlose Frameanalyse behauptet. Fremde Modellrollen, Verbrauchszahlen und KI-Noten sind keine eigenen Messungen.

Dokumentationsprüfung: lokale Links und Registry-JSON prüfen, unabhängige fachliche Prüfung der Erweiterung; bestehende Runtime-/Releasezustände bleiben unverändert. PR153 ist der bestehende Kandidat, kein zweiter Dokumentations-PR nötig.
