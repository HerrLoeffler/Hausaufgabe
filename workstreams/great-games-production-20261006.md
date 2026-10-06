# GC-GAMES-PIPELINE-01 — künftige Spieleproduktion

Stand 06.10.2026. Verantwortlich: Main-Chat GradeCrew; Chat-ID 01a10df6-736b-7a62-bd38-2724cf254c2e. Dokumentationsbranch `docs/great-games-production-20261006`, Ziel `main`.

Auftrag: vorhandenen Blender-Workflow in verbindliche Regeln für Great Games mit Unreal überführen. Martin verlangt ausdrücklich noch keinen Umbau des Spiels. Eingefügter fremder Prompt ist Referenzmaterial; dessen weitergehende Videoanalyse/Installation ist kein eigener Ausführungsauftrag.

Geprüfte Basis: main9c24523c701fc580a73b95b354ad0337d5bcbf22; PR83 offen, Head6434ddefb83cffca7bde5a7347ed6d2f56d5cb45, Zielprototype/escape-expedition-masterpiece-v1. Canvas2D im tatsächlichen app.js bestätigt. Offene Games-PRs2/10/27/28/53/56/60/83 und Dokumentations-PR126 bleiben getrennt; keine davon pauschal integrieren. Development-Status37482422874 erfolgreich. Gemeinsame Web-Staging-Reparaturen gehören nicht zu diesem Auftrag.

Ergebnis: [Produktionsregeln](../docs/games/GREAT_GAMES_WORKFLOW.md), [Blender/Unreal-Pipeline](../docs/games/UNREAL_BLENDER_PIPELINE.md), Einstieg aus AGENTS/Workstreams/Escape-Konzept. Quellen: vorhandener lokaler Blender-Hero-Plan aus PR143; aktuelle Epic-/MDN-Dokumentation und Community-Repository. Keine neue tiefe MCP-Sicherheitsprüfung behauptet.

Status: Dokumentationskandidat auf eigenem Branch; kein Spielcode, keine Engine-Installation, keine Runtime-Tests, kein Staging-/Production-Deploy, keine Geräte-/Videoabnahme. Releasezustand aller Spiele unverändert. Keine neue Versuchshistorie oder Budgetreservierung für bestehende Reparaturen.

Offen für spätere Umsetzung: tatsächlicher Installationsstand, schwächstes Zielgerät, native Distribution vs Browserbedarf, Spielperspektive, Leistungs-/Speicherbudgets, echte Lernadapter-API und Lizenz-/Binärablage. Unreal+Blender ist Produktionsrichtung, kein bewiesener geräteübergreifender fertiger Stack.

Nächster Schritt: Dokumentationsdiff prüfen und nach Repository-Regeln in main integrieren; Spielpilot erst nach eigenem Nutzerauftrag.
