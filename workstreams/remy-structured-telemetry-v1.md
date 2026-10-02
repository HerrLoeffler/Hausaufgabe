# Remy Struktur + Nutzungs-/Qualitätsstatistik V1

Task: `GC-CREW-AI-04`

## Ziel

Remy soll gesprochene/geschriebene Testwünsche semantisch sauber auf das bestehende KI-Formular verteilen und gleichzeitig datensparsame Produkt-/Qualitätssignale liefern.

## Strukturierungsregel

1. Kontext -> Schulart, Bundesland, Fach, Klasse
2. Fachlicher Inhalt -> `Thema`
3. Harte Einstellungen -> Schwierigkeit, Anzahl, Punkte, Dauer
4. Aufgabentypen -> erlauben/ausschließen
5. Pädagogik/Stil/Gewichtung -> `Eigene Wünsche`
6. Material/Bilder -> bestehende Materiallogik

Wenn GradeCrew ein eigenes Feld besitzt, wird dieses verwendet. Nicht strukturierte pädagogische Wünsche gehören zu `Eigene Wünsche` und werden nicht an `Thema` angehängt.

Beispiel aus dem Staging-Test:

`Gymnasium Mathe 4 Klasse Prozent Thema Prozent einfache Aufgaben vor allem bitte machen`

wird zu:
- Schulart: Gymnasium
- Fach: Mathematik
- Klasse: 4
- Thema: Prozent
- Schwierigkeit: leicht
- Eigene Wünsche: `Vor allem einfache Aufgaben.`

## Telemetrie / Datenschutz

Es werden ausdrücklich **nicht** gespeichert:
- Audioaufnahmen
- Diktat-/Chattext
- Thema oder Wünsche im Klartext
- alte/neue Feldwerte bei Korrekturen
- Schülerdaten

Gespeichert werden ausschließlich technische Ereignisse/Metadaten, z. B.:
- Text oder Sprache
- lokal oder KI-Fallback
- welche Formularfelder Remy gesetzt hat
- welches Feld anschließend manuell korrigiert wurde
- technische Latenz/Fehlerkategorie

Rohereignisse liegen benutzerbezogen unter `users/{uid}/crewTelemetry` und laufen nach 30 Tagen ab. Pseudonyme Tages-Nutzermarker werden 90 Tage gehalten. Inhaltsfreie Tagesaggregate unter `crewTelemetryDaily/{YYYY-MM-DD}` dienen der längerfristigen Entwicklung.

## Kennzahlen

Admin -> Übersicht zeigt bzw. kann zeigen:
- nutzende Lehrkräfte
- Remy-Aufträge
- Sprache vs. Text
- lokal gelöste Formular-Patches (0 API)
- KI-Fallbacks
- geschätzt eingesparte KI-Aufrufe
- Feld-Korrekturrate
- häufig korrigierte Felder

Die Korrekturrate ist bewusst kein behaupteter Accuracy-Score. Sie misst nur beobachtete manuelle Korrekturen nach einem Remy-Patch.

## Dateien

- `crew-assistant-core.mjs`: Thema/Wünsche-Strukturierung, Parser V2
- `remy-ai-help.js`: Quelle/Modus/Latenz an Telemetrie melden
- `crew-telemetry-client.mjs`: keine Inhalte, Korrektursignale nur per Feldname
- `crew-statistics-admin.mjs`: Admin-Karte
- `functions/lib/crew-telemetry.js`: private Speicherung/Aggregation
- `functions/main.js`: `recordCrewTelemetry`, `getCrewTelemetrySummary`, serverseitige KI-Fallback-Metriken
- `functions/lib/crew-assistant.js`: gleiche Thema/Wünsche-Regeln für den KI-Fallback
- `tools/build-staging.mjs`: neue Browsermodule in Staging paketieren

## Branch

`feature/remy-structured-telemetry-v1`

Basis: `feature/gradecrew-app-integration@27ebf56775a5597cd06226a3dbbbf50d76f18f5e`

## Status

- Code: in Arbeit / auf Feature-Branch gesichert
- CI: ausstehend
- Integration: nicht erfolgt
- Staging: nicht deployed
- Production: unverändert

## Nächster Schritt

Crew-Feature-CI vollständig grün bekommen, aktuellen Integrationshead erneut prüfen, Diff auf parallele Arbeit kontrollieren und erst danach über Staging-Integration entscheiden.
