# GC-INTELLIGENCE-01: Sprache, Qualitätsfreigabe und Internationalisierung

- Aktualisiert: 2026-10-02 UTC
- Branch: `feature/quality-routing-contract-v1`
- Basis: `232c0ed4bca32fb63a958d241220a5c644dd437c` (Gateway-Branch)
- Auftrag: neue Sprach-, KI- und i18n-Bausteine gemeinsam vorbereiten.
- Zuständigkeit: `shared/intelligence/**`, `tools/evaluation/**`, `docs/intelligence/**`, eigene CI.
- Überschneidungen: Gateway #24, Crew-/Emmi-Code, i18n-Core und Telemetrie bestehen bereits; diese Implementierungen werden nicht ersetzt.

## Gesicherter Zwischenstand
Release-Stufe: `ci_green`. Code-Commit: `5af11caa55662b7986f73ae72c535eee853f847c`; Draft-PR [#25](https://github.com/HerrLoeffler/Hausaufgabe/pull/25) gegen Gateway-Branch, nicht integriert.
GitHub Actions: [Intelligence contracts 36948918111](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36948918111) auf diesem Code-Commit erfolgreich (14 Tests + CLI-Syntax).
Implementiert: strenge Kontext-/Voice-Patch-/Capability-Verträge, Offline-Qualitätsgate mit exakten binomialen Grenzen, CLI und CI. Gemeinsamer Ausbauplan: [Sprache, KI-Qualität und Internationalisierung](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/quality-routing-contract-v1/docs/intelligence/README.md).
Lokale Tests: 14/14 bestanden; CLI-Syntax geprüft. Unabhängiger SciPy-Vergleich der Grenzen für 20 Fälle: maximale absolute Abweichung 1.78e-15. Synthetische Testfälle sind keine Modellqualitätsnachweise.
Keine Modellumschaltung, API-Aufrufe, neue Datenerfassung oder Deployments durch diesen Arbeitsblock.

## Akzeptanz
- Fehlende/unpassende Evidenz und kritische Fehler blockieren eine Empfehlung.
- Kosten entscheiden erst unter qualifizierten Alternativen.
- UI-, Eingabe-, Inhalts- und Bewertungssprache bleiben getrennt.
- Automatische Zahlen beweisen keine Datenqualität; menschlich geprüfte Referenzen und repräsentative Fälle bleiben Voraussetzungen.
- Dokumentierter Anschluss an vorhandene Crew-, Gateway-, i18n- und Telemetrieschnittstellen.

## Nächster Schritt
Vorhandenen Crew-Controller nach Review von PR #25 an den Patch-Vertrag anbinden und fachlich geprüftes Pilot-Evaluationsset erstellen. Kein Runtime-Routing ohne vertrauenswürdige Freigabeartefakte.
