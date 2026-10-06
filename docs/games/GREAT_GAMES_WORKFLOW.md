# Great Games: verbindlicher Produktionsworkflow

Stand: 06.10.2026 · Task GC-GAMES-PIPELINE-01 · Dokumentationsauftrag, kein Auftrag zum Umbau eines Spiels.

## Entscheidung und Begriffe

Die Engine wird **pro Spiel** anhand von Spielidee, Zielgeräten, Browserbedarf und Produktionsaufwand gewählt. Unreal ist eine Option, kein Standardzwang. Blender produziert bei Bedarf bearbeitbare 3D-Assets; es ersetzt keine Spielengine. Für kleine 2D-Spiele ist eine schwere 3D-Produktion nicht automatisch sinnvoll.

HTML `<canvas>` ist eine programmierbare Browser-Zeichenfläche, nicht das Gestaltungsprogramm Canva. Auch Spieleframeworks können Canvas/WebGL als Ausgabe verwenden. Wir entscheiden nach Werkzeugen, Spielqualität und nachgewiesener Gerätefunktion, nicht nach dem Vorkommen des Wortes Canvas. Eine selbst gebaute Engine ist kein Standard, wenn ein passendes Framework die benötigten Systeme bereits liefert.

Einstieg: [Fragen und Vorlagen](GAME_PROJECT_TEMPLATE.md) → [Engineauswahl](ENGINE_SELECTION.md) → [Team und Übergaben](GAME_TEAM_WORKFLOW.md). Die [Videoauswertung](VIDEO_LESSONS_20261006.md) erklärt, welche Anregungen wir übernehmen und welche Aussagen kein Nachweis sind.

Belegter Ausgangspunkt: Amazonas in PR83, Head `6434ddefb83cffca7bde5a7347ed6d2f56d5cb45`, verwendet in `lab/escape-expedition/app.js` `getContext('2d')`. PR83 zielt auf `prototype/escape-expedition-masterpiece-v1`, nicht auf den gemeinsamen Web-Release. Das erklärt die konkrete Technik; es belegt weder einen aktuellen Gerätefehler noch den damaligen Entscheidungsgrund. Dieser Auftrag enthält keine neue Spiel- oder Videoabnahme.

## Vor Produktion: kleinster vollständiger Nachweis

1. Die sechs Einstiegsfragen aus der Vorlage beantworten; vorhandene Antworten übernehmen. Annahmen und offene Entscheidungen sichtbar halten.
2. Zwei passende Engine-Kandidaten anhand derselben Anforderungen vergleichen und einen empfehlen. Keine Installation oder neue Dienste allein aufgrund eines Videos.
3. Einen kleinen Build auf dem schwächsten verbindlichen Zielgerät starten. Browserexport, Touch, Audio, Speichern, Downloadgröße und Frametimes tatsächlich prüfen. Ein Mac-Editorlauf beweist keinen iPad-Browserbetrieb.
4. Eine spielbare Referenzszene mit Bewegung/Kamera, Interaktion, einer Lernaufgabe, Hilfe, Belohnung und Wiederaufnahme bauen. Zunächst synthetische lokale Inhalte, danach den echten Lernadapter separat prüfen.
5. Spielgefühl und Bildstil im ausgelieferten Build abnehmen, erst danach Umfang ausbauen. Eine schöne Blender-Aufnahme ersetzt diesen Nachweis nicht.

Bei Unreal native Verteilung oder gesondertes Pixel Streaming planen: Packaging liefert nicht automatisch einen HTML-Export. Streaming benötigt Server, Bandbreite und Kostenplanung; es ist keine kostenlose Browserabkürzung. Bei zwingendem Browserbetrieb zuerst passende Weblösungen prüfen.

## Zuständigkeiten und wiederverwendbarer Kern

**GradeCrew:** Lehrkraft wählt und prüft Lerninhalte; Lernziele, Inhaltsrevision, Schwierigkeit, Aufgabensprache, Berechtigungen, Freigaben und maßgeblicher Lernfortschritt. Vorhandene Learning Guardrails und geschützte Lehrerübersicht erhalten. Kein Durchspielen nötig, um Aufgaben/Ablauf zu prüfen.

**Gewählte Engine / Spielframework:** Bewegung, Kamera, Interaktion, Inventar, Dialoge, Missionen, Weltzustand, Audio, VFX, UI und direktes Spielgefühl. Kernsysteme getrennt von Amazonas-Assets und weltbezogenen Daten halten. Weitere Welten verwenden denselben Kern; neue Abstraktionen erst bei realem Bedarf.

**Blender:** Geometrie, UVs, Rig, Animationen und bearbeitbare Quellen. Referenz, Blockout, Export und Reimport im tatsächlichen Spiel prüfen. Für die Unreal-Variante gilt [UNREAL_BLENDER_PIPELINE.md](UNREAL_BLENDER_PIPELINE.md); Austauschformate anderer Engines stehen in der Engineauswahl.

Wenn Unreal gewählt wurde, ist für den ersten Adventure-Nachweis das Third-Person-Template ein Kandidat, kein verpflichtender Kamerastil. Perspektive anhand Lesbarkeit und Touchbedienung festlegen. Blueprints für Szeneninteraktionen und Ablauf; kleine C++-Module dort, wo stabile getestete Schnittstellen oder gemessene Leistungsprobleme es begründen. Keine riesigen Level-Blueprints und kein C++ allein wegen vermeintlicher Professionalität.

## Lernschnittstelle: Vertrag vor Netzwerkanbindung

Der folgende Vertrag ist eine **Zielspezifikation, keine bereits verfügbare API**. Endpunkte, Authentifizierung und Datenschema vor Umsetzung mit dem vorhandenen Backend abgleichen.

| Vorgang | Erforderlicher Vertrag |
| --- | --- |
| Sitzung öffnen | Autorisierter Start mit `gameId`, `gameVersion`, `contentRevision`, `locale`, `seed`; Server liefert kurzlebige berechtigte Sitzung und erlaubte Aufgabenreferenzen |
| Aufgabe anfordern | Sitzung + Aufgabenreferenz; nur benötigter Fragetext/zulässige Hilfen, keine geschützten Lösungen |
| Antwort abgeben | `attemptId`, unveränderliche Inhaltsrevision, Antwort und Idempotenzschlüssel; serverseitige Prüfung von Sitzung, Aufgabe, Wiederholung und Fortschritt |
| Ergebnis übernehmen | Autorisierte Bewertung und Freischaltung mit Revision; Client-Behauptungen über Score/Fortschritt sind nicht maßgeblich |
| Fortsetzen | Versionierter Spielzustand plus bestätigter Lernfortschritt; Migration/Abbruch bei inkompatibler Version definiert |

Geheimnisse, Lehrerlösungen und administrative Tokens gehören nicht in Spielpakete, URLs oder Logs. Kurzlebige Sitzungsberechtigung sicher transportieren, nicht als dauerhaftes URL-Token. Timeout, Verbindungsabbruch, doppelte Abgabe, abgelaufene Sitzung und manipulierte Freischaltung prüfen. Offline nur klar gekennzeichnete Übung mit öffentlichen/synthetischen Inhalten; keine geschützte Prüfung offline als bewertet verbuchen. Autorität, Lerntransfer und vorhandene Anti-Durchrate-Regeln bleiben erhalten. Der heutige lokale Amazonas-Fragenbestand wird nicht ungeprüft zur sicheren Backend-Vorlage.

## Qualitäts- und Freigaberegeln

Vor dem Ausbau pro Zielgerät numerische Budgets für Frametimes, Speicher, Download/Installation und Startzeit sichern. Ausgangsziel für den Pilot: stabile 30 fps auf dem vereinbarten schwächsten Mobilgerät, 60 fps am vereinbarten Desktop; Messszene, Auflösung und Qualitätsstufe protokollieren. Das sind Ziele, keine gemessenen Leistungen; Änderungen begründen, nicht nach einem schlechten Lauf still absenken.

Pflichtprüfung im paketierten Build: Kamera/Kollisionen, Touch und Tastatur, lesbare DE/EN-Texte, Kontrast, Untertitel/Audio-Regler, reduzierte Bewegung, keine Softlocks, korrekte Hilfen/Transferaufgaben, Speichern/Fortsetzen, Netzfehler sowie zehn Minuten zusammenhängendes Spielen auf jedem zugesagten Geräteprofil. Langfristige Laufzeitstabilität bei längeren Spielsessions zusätzlich prüfen.

Gestalterische Abnahme umfasst Komposition, konsistente Assets, Licht/Materialien, Vegetation/Wasser soweit vorgesehen, Bodenhaftung/Animation, VFX, Audio, Interaktionsfeedback und nachvollziehbares Pacing. Platzhalter, Abstürze, verlorener Fortschritt, blockierte Lernpfade und erhebliche Bedienprobleme verhindern Freigabe. Fehlende Geräte bleiben offene Nachweise. Unabhängige technische Prüfung und Martins visuelle/spielerische Abnahme getrennt erfassen.

Farben immer mit Text und Beleg: 🔴 Entwicklung · 🟠 technisch geprüft/integrationsbereit · 🟡 konkreter Testbuild verfügbar · 🔵 von Martin abgenommen · 🟢 ausdrücklich freigegeben und veröffentlicht. Orange ersetzt keinen Merge-Nachweis; native Testbuilds nicht als Firebase-Hosting-Deploy ausgeben. Die genaueren Repository-Stufen bleiben maßgeblich.

## Bestehendes Spiel und Kosten

Jetzt keine Änderungen an Amazonas, seiner Matschmechanik, der Lern-/Fortschrittslogik, dem Games Hub oder Staging. Später zuerst Verhalten und bekannte Fehler als Migrationscheckliste sichern. Kein alter Games-Branch wird pauschal über die Web-App gemergt. Rückweg ist der letzte belegte vorherige Spielbuild.

Sol für abgegrenzte Umsetzung, Luna für Inventar/Dokumentabgleich, Astra nur mit begründetem Architektur-/Securitybedarf. Ergebnisse paketweise abholen; keine ständigen Statusabfragen. Nach spätestens drei erfolglosen gezielten Korrekturen an demselben Problem Diagnose/Methode neu bewerten; bestehende Versuche und Budgets nicht zurücksetzen. Externe KI, Assets und Streaming brauchen getrennte Kostenfreigabe. Production bleibt separat freigabepflichtig.

## Quellen / Wiederaufnahme

- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Epic: Packaging und Zielplattformen](https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project)
- [Epic: Pixel Streaming](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-pixel-streaming-in-unreal-engine)
- [Epic: Third Person Template](https://dev.epicgames.com/documentation/unreal-engine/third-person-template-in-unreal-engine)
- [Bestehende Escape-Anforderungen](ESCAPE_MVP.md), [Produktionsübergabe](../../workstreams/great-games-production-20261006.md).

Vor späterer Umsetzung aktuelle Versionen/Quellen erneut prüfen. Dieser Workflow ist keine Installation, keine Engine-Automation und kein Abnahmebeleg.
