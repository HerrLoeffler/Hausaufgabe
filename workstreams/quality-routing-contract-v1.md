# GC-INTELLIGENCE-01: Sprache, Qualitätsfreigabe und Internationalisierung

- Aktualisiert: 2026-10-02 UTC
- Branch: `feature/quality-routing-contract-v1`
- Basis: `232c0ed4bca32fb63a958d241220a5c644dd437c` (Gateway-Branch)
- Auftrag: neue Sprach-, KI- und i18n-Bausteine gemeinsam vorbereiten.
- Zuständigkeit: `shared/intelligence/**`, `tools/evaluation/**`, `docs/intelligence/**`, eigene CI.
- Überschneidungen: Gateway #24, Crew-/Emmi-Code, i18n-Core und Telemetrie bestehen bereits; diese Implementierungen werden nicht ersetzt.

## Gesicherter Zwischenstand
Release-Stufe: `branch_only` (lokal geprüft, CI ausstehend).
Implementiert: strenge Kontext-/Voice-Patch-/Capability-Verträge, Offline-Qualitätsgate mit exakten binomialen Grenzen, CLI und CI. Gemeinsamer Ausbauplan: `docs/intelligence/README.md`.
Lokale Tests: 14/14 bestanden; CLI-Syntax geprüft. Unabhängiger SciPy-Vergleich der Grenzen für 20 Fälle: maximale absolute Abweichung 1.78e-15. Synthetische Testfälle sind keine Modellqualitätsnachweise.
Keine Modellumschaltung, API-Aufrufe, neue Datenerfassung oder Deployments durch diesen Arbeitsblock.

## Akzeptanz
- Fehlende/unpassende Evidenz und kritische Fehler blockieren eine Empfehlung.
- Kosten entscheiden erst unter qualifizierten Alternativen.
- UI-, Eingabe-, Inhalts- und Bewertungssprache bleiben getrennt.
- Automatische Zahlen beweisen keine Datenqualität; menschlich geprüfte Referenzen und repräsentative Fälle bleiben Voraussetzungen.
- Dokumentierter Anschluss an vorhandene Crew-, Gateway-, i18n- und Telemetrieschnittstellen.

## Nächster Schritt
CI prüfen, Draft-PR gegen Gateway-Branch und gemeinsame Register ergänzen. Danach vorhandenen Crew-Controller an den Patch-Vertrag anbinden und fachlich geprüftes Pilot-Evaluationsset erstellen. Kein Runtime-Routing ohne vertrauenswürdige Freigabeartefakte.
