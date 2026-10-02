# GC-INTELLIGENCE-01: Sprache, Qualitätsfreigabe und Internationalisierung

- Aktualisiert: 2026-10-02 UTC
- Branch: `feature/quality-routing-contract-v1`
- Basis: `232c0ed4bca32fb63a958d241220a5c644dd437c` (Gateway-Branch)
- Auftrag: neue Sprach-, KI- und i18n-Bausteine gemeinsam vorbereiten.
- Zuständigkeit: `shared/intelligence/**`, `tools/evaluation/**`, `docs/intelligence/**`, eigene CI.
- Überschneidungen: Gateway #24, Crew-/Emmi-Code, i18n-Core und Telemetrie bestehen bereits; diese Implementierungen werden nicht ersetzt.

## Gesicherter Zwischenstand
Release-Stufe: `branch_only`. Dies ist zunächst der Arbeitsauftrag, noch keine implementierte Freigabeprüfung.
Geplant: offline Qualitätsnachweis pro exakt versioniertem Einsatzgebiet, strenge Locale-/Capability-Verträge, Tests und gemeinsame Architektur.
Keine Modellumschaltung, API-Aufrufe, neue Datenerfassung oder Deployments durch diesen Arbeitsblock.

## Akzeptanz
- Fehlende/unpassende Evidenz und kritische Fehler blockieren eine Empfehlung.
- Kosten entscheiden erst unter qualifizierten Alternativen.
- UI-, Eingabe-, Inhalts- und Bewertungssprache bleiben getrennt.
- Automatische Zahlen beweisen keine Datenqualität; menschlich geprüfte Referenzen und repräsentative Fälle bleiben Voraussetzungen.
- Dokumentierter Anschluss an vorhandene Crew-, Gateway-, i18n- und Telemetrieschnittstellen.

## Nächster Schritt
Offline-Verträge und Tests implementieren; auf diesem Branch sichern. Danach zentrale TODO/Workstream-Register frisch lesen und ergänzen.
