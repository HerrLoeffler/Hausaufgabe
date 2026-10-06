# Videoauswertung: was wir in die Spieleproduktion übernehmen

06.10.2026 · GC-GAMES-PIPELINE-01. Grundlage: Martins zwei lokale Videos und elf zusätzlich gelieferte Screenshots. Stichprobenmethode: langes Video alle 20 Sekunden (101 Bilder), kurzes alle 10 Sekunden (41 Bilder), Kontaktbögen und ausgewählte Einzelbilder. Keine vollständige Einzelbildanalyse. Beide gelieferten Dateien enthalten nur eine Videospur, keine Audio-/Untertitelspur. Sichtbar eingeblendeter Text wurde berücksichtigt; gesprochene Aussagen wurden nicht transkribiert.

| Datei | Laufzeit | SHA256 |
| --- | --- | --- |
| videoplayback (3).mp4 | 33:37,833 | f8bea83624404e4abf6062cc83d9ad998f7d93ffb2d82a7e4976214869129998 |
| videoplayback.webm | 6:49,733 | 60120cc27614f47add9f197f068742c75b1ccc58522fd51ee34f864882f1d694 |

Lokale Analysebelege liegen unter `analysis/GC-GAMES-PIPELINE-01/` im GradeCrew-Arbeitsbereich; große Videodateien und extrahierte Bildserien werden nicht in das Quellcode-Repository kopiert. Zeitangaben bezeichnen die beobachteten Ausschnitte, nicht lückenlose Kapitelgrenzen.

## Kurzes Video: Struktur des Schneespiels

| Beobachtung | Unsere Arbeitsregel |
| --- | --- |
| 00:20–00:40 verschiedene Modelle mit Rollen; Screenshot „You are the director“ | Martin setzt Richtung und Abnahme; Main koordiniert. Rollen übernehmen, Modellnamen nicht als belegte Bestenliste behandeln. |
| Um 01:00 Pinterest-Bildreferenz, anschließend passende Farbwelt | Leitbild in eigene Kamera-, Silhouetten-, Licht- und Palettenregeln übersetzen; Originalquelle und Nutzungsrechte festhalten. |
| Um 01:30 PLAN.md mit Bewegung, Wärme, Schnee, Spuren, Kamera, Audio und Welt | Ein Einstieg pro Spiel, abgegrenzte Systeme und klare Abhängigkeiten. Nicht ein Chat pro Baum, nicht zwingend eine Datei pro System. |
| Um 01:40 langer Chat gegenüber frischem Chat pro Job | Kompakte Übergabe je Paket. Die animierten „blocks read“-Zahlen (u. a. 48/18 bzw. 63/21) sind keine gemessene Token-/Kostenstudie. |
| Screenshot „every job ends the same way — a test“ | Jedes Paket liefert passende Prüfnachweise; Integration prüft zusätzlich das Zusammenspiel. |
| 01:50–03:00 Blockout, Schnee und Fußspuren als spezialisierte Datenstruktur | Erst Kernmechanik beweisen, dann passende Datenstruktur wählen und Leistung messen. Kein ungeprüftes Übernehmen eines demonstrierten Algorithmus. |
| 03:10–03:20 Blender-Python erzeugt Haus in sichtbaren Einzelteilen | Reproduzierbare Skripte und visuelle Zwischenstände nach sinnvollen Bauabschnitten; nicht erst das fertige Asset ansehen. |
| Um 04:00 Figurenansichten, Screenshot mit orthografischer Referenz und gleichmäßigem Licht | Referenzblatt vor Modellierung; Produktionsreferenz und fertige Szenenbeleuchtung getrennt behandeln. |
| 04:30–05:30 Szenenlicht/Tag-Nacht-Ansichten | Lesbarkeit in mehreren tatsächlichen Spielbedingungen prüfen, nicht nur im schönsten Render. |
| 05:50–06:20 Tierasset und Detailstufen | Herkunft/Lizenz, Rig, Animation und Gerätebudget prüfen. Ein Download ist noch keine Integration. |
| Um 06:30 Sichtbarkeit hinter Hindernissen | Kameraverdeckung und Orientierung als eigenes prüfbares Bedienproblem behandeln. |

Das zusätzliche Godot-Screenshot benennt die Engine ausdrücklich; `.gd`-Dateien passen dazu. Die sichtbaren Modulhäkchen beweisen keine Tests unseres Projekts und kein vollständiges Release des fremden Spiels.

## Langes Video: Werkzeuge und Grenzen

- **01:00–04:20:** Browser-Simulation, veränderbare Parameter und gezielte Prüfaufforderungen. Übernehmen: interaktive Funktionsnachweise und unabhängige Prüfung. Nicht übernehmen: eine KI-Note wie „8,5/10“ als alleinige Abnahme oder automatische Endlosschleifen bis zu dieser Note.
- **05:00–09:40:** Unreal-/Blender-Parkour mit Referenzen, vorhandenen Figuren und sichtbaren Korrekturen an Animation/Bewegung. Übernehmen: bestehende Ressourcen prüfen, Gameplay und visuelle Qualität getrennt bearbeiten, Probleme konkret reproduzieren. Eine eingeblendete Verbrauchsangabe wie „4h / 10% weekly usage“ ist eine Einzelerfahrung, keine Kalkulation für GradeCrew.
- **10:00–13:40:** Bild-/Pixel-/Musikwerkzeuge zeigen unterschiedliche Produktionsaufgaben. Ohne Tonspur lässt sich Audioqualität nicht bewerten.
- **18:20–19:40:** Bildreferenzen und Blender-Innenraum. Übernehmen: Bildidee → räumlicher Entwurf → Sichtprüfung. Der Ausschnitt belegt keinen fertigen Game-Export oder spielbare Kollisionen.
- Die späteren Modell-/Benchmarkfolien sind keine Grundlage für heutige Modellpreise oder verbindliche Enginewahl. Ein geschnittenes Demonstrationsvideo zeigt weder alle Fehlversuche noch langfristigen Wartungsaufwand.

## Ergebnis für GradeCrew

Wir übernehmen einen Referenzbild-gestützten Einstieg, eine begründete Enginewahl, einen kleinen vollständig spielbaren Abschnitt, begrenzte Fachaufträge und belegte Übergaben. Die konkrete Vorlage steht in [GAME_PROJECT_TEMPLATE.md](GAME_PROJECT_TEMPLATE.md), die Zusammenarbeit in [GAME_TEAM_WORKFLOW.md](GAME_TEAM_WORKFLOW.md). Es wurde kein Spiel umgebaut, keine Engine installiert und keine neue automatische Chatsteuerung implementiert.
