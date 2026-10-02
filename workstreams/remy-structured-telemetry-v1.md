# Remy Struktur + Nutzungs-/Qualitätsstatistik V1

Task: `GC-CREW-AI-04`

Stand: 02.10.2026

## Zielbild

Remy strukturiert freie Testwünsche in das bestehende GradeCrew-Formular und misst datensparsam, wie gut und wie kosteneffizient dieser Weg funktioniert.

Die Produktregel lautet:

1. Kontext -> Schulart, Bundesland, Fach, Klasse
2. Fachlicher Inhalt -> `Thema`
3. Harte Einstellungen -> Schwierigkeit, Anzahl, Punkte, Dauer
4. Aufgabentypen -> erlauben/ausschließen
5. Pädagogik/Stil/Gewichtung -> `Eigene Wünsche`
6. Material/Bilder -> bestehende Materiallogik

Wenn ein eigenes GradeCrew-Feld existiert, wird es verwendet. Pädagogische Restwünsche dürfen nicht blind an `Thema` angehängt werden.

Beispiel aus dem echten Staging-Test:

`Gymnasium Mathe 4 Klasse Prozent Thema Prozent einfache Aufgaben vor allem bitte machen`

wird zu:
- Schulart: Gymnasium
- Fach: Mathematik
- Klasse: 4
- Thema: Prozent
- Schwierigkeit: leicht
- Eigene Wünsche: `Vor allem einfache Aufgaben.`

## Statistik

Im Admin-Bereich -> Übersicht ist eine Crew-/Remy-Statistikkarte vorgesehen und im Staging-Build enthalten. Kennzahlen:

- nutzende Lehrkräfte
- Remy-Aufträge
- Sprache vs. Text
- lokal gelöste Formular-Patches (`0 API`)
- KI-Fallbacks
- geschätzt eingesparte KI-Aufrufe
- Feld-Korrekturrate
- häufig korrigierte Felder

`Feld-Korrekturrate` ist bewusst kein behaupteter Accuracy-Score. Gezählt werden nur tatsächlich beobachtete manuelle Änderungen an einem Feld, das Remy zuvor gesetzt hatte.

## Datenschutz / Speicherung

Nicht gespeichert werden:
- Audioaufnahmen
- Diktat- oder Chattext
- Thema oder Wünsche im Klartext
- alte/neue Feldwerte bei Korrekturen
- Schülerdaten

Gespeichert werden nur technische Metadaten wie Eingabemodus, lokal/KI, gesetzte Feldnamen, später korrigierter Feldname, technische Latenz und Fehlerkategorie.

Speicherstruktur:
- `crewTelemetryEvents`: pseudonyme Rohereignisse, 30 Tage
- `crewTelemetryUsers`: pseudonyme Unique-User-Marker, 90 Tage
- `crewTelemetryDaily`: inhaltsfreie Tagesaggregate für längerfristige Trends

Die 30-/90-Tage-Fristen werden nicht nur als `expiresAt` dokumentiert: `cleanupCrewTelemetry` läuft serverseitig täglich und löscht abgelaufene Rohereignisse/Unique-User-Marker.

## Technischer Stand

Feature-Branch: `feature/remy-structured-telemetry-v1`
Feature-CI: `Crew Assistant Checks` Run `36991051536` ✅
Erste Integration: PR #30 -> `ef0daa0b612a259dea63ab2eca3dcc062dff686d`
Retention-/Regression-Fix: PR #31 -> finaler Integrationscommit `18e30d0da1fe49b99b9a786ad634fd8f8fd0d0a7`
Retention-Fix Feature-CI: Run `36991709628` ✅
Gemeinsamer AI-Staging-Gate: Run `36991807963` ✅

## Staging Hosting

Automatic staging preview Run `36991979723` ✅
- exakter getesteter Commit: `18e30d0da1fe49b99b9a786ad634fd8f8fd0d0a7`
- Preview-Kanal deployed
- Manifest-/Datei-Hash-Verifikation erfolgreich
- URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`

## Staging AI Functions

Automatic staging AI functions Run `36991979742` ✅
- Projekt: `hausaufgabe-staging`
- Scope: ausschließlich `functions:ai`
- exakter Commit: `18e30d0da1fe49b99b9a786ad634fd8f8fd0d0a7`
- Firebase-Deploy erfolgreich
- Deploy-Log bestätigt ausdrücklich erfolgreiche Erstellung von:
  - `recordCrewTelemetry`
  - `getCrewTelemetrySummary`
  - `cleanupCrewTelemetry`
- zusätzlich `crewAssistant` und `reviseWholeTest` erfolgreich aktualisiert

Die künftige Staging-Automation wurde über PR #32 auf `main` gehärtet: Export- und Post-Deploy-Prüfung müssen künftig alle fünf Crew/Emmi/Telemetry-Funktionen nachweisen.

## Statusmodell

- Code gesichert: ✅
- Feature-CI: ✅
- Web-Integration: ✅
- gemeinsamer Integrations-Gate: ✅
- Staging Hosting: ✅ deployed + hash-verifiziert
- Staging Functions: ✅ deployed; neue Telemetrie-/Cleanup-Funktionen im Firebase-Deploylog bestätigt
- Gerätetest/Nutzerabnahme des neuen Statistikstands: offen
- Production: unverändert / nicht deployed

## Nächster praktischer Test

1. Im Preview als Lehrer Remy per Text und Sprache verwenden.
2. Nach einer Remy-Übernahme bewusst ein gesetztes Feld korrigieren.
3. Mit Admin-Account Administration -> Übersicht öffnen und Crew-/Remy-Statistik prüfen.
4. Prüfen, ob Thema/Wünsche beim realen Beispielsatz sauber getrennt werden.
5. Erst nach dieser Abnahme den Workstream auf `user_tested` setzen.
