# Great Games: verbindlicher Produktionsworkflow

Stand: 06.10.2026 · Task GC-GAMES-PIPELINE-01 · Dokumentationsauftrag, kein Auftrag zum Umbau eines Spiels.

## Entscheidung und Begriffe

Für neue anspruchsvolle, räumliche Great-Games-Abenteuer ist **Unreal Engine die vorgesehene Spielengine; Blender liefert bearbeitbare 3D-Assets und Animationen**. GradeCrew bleibt die Lernplattform. Vor der eigentlichen Produktion muss der unten beschriebene Geräte-/Distributionsnachweis bestehen. Ein fehlgeschlagener Nachweis führt zu einer begründeten Entscheidung mit Martin, nicht zum stillen Rückfall auf den bisherigen Renderer.

HTML `<canvas>` ist eine programmierbare Browser-Zeichenfläche, weder Canva noch eine vollständige Engine. Sie kann hochwertige Spiele darstellen; das Qualitätsproblem eines konkreten Prototyps ist dadurch nicht allein erklärt. Für hochwertige neue 3D-Abenteuer wird aber **keine selbstgeschriebene Canvas-2D-Engine als bequemer Standard fortgeführt**. Bestehende kleine Webspiele bleiben erhalten. Eine abweichende Engine für ein neues Spiel braucht einen dokumentierten, zum Ziel passenden Entscheid. Kein pauschales Canvas-Verbot für bestehende Diagramme, UI oder WebGL-basierte Technik.

Belegter Ausgangspunkt: Amazonas in PR83, Head `6434ddefb83cffca7bde5a7347ed6d2f56d5cb45`, verwendet in `lab/escape-expedition/app.js` `getContext('2d')`. PR83 zielt auf `prototype/escape-expedition-masterpiece-v1`, nicht auf den gemeinsamen Web-Release. Das erklärt die konkrete Technik; es belegt weder einen aktuellen Gerätefehler noch den damaligen Entscheidungsgrund. Dieser Auftrag enthält keine neue Spiel- oder Videoabnahme.

## Architekturentscheidung nach gleichen Kriterien

Bewertung für hochwertige 3D-Lernabenteuer: visuelle Werkzeuge, Schulgeräte-Zugang, Wiederverwendung und Betriebsaufwand. Einschätzung, kein Benchmark und keine Fertigstellungsnote.

| Ansatz | Eignung | Stärken | Grenze |
| --- | --- | --- | --- |
| Bisherigen Canvas-2D-Prototyp weiter ausbauen | 4/10 | Sofort im Browser, vorhandene Mechanik | Viele Produktionswerkzeuge müssten selbst gebaut werden; unpassender Ausgangspunkt für das gewünschte 3D-Ziel |
| GradeCrew vollständig in Unreal ersetzen | 5/10 | Einheitliche Spielumgebung | Unnötiger Neubau der Lern-/Lehrerplattform; Distribution bleibt aufwendig |
| GradeCrew-Plattform + Unreal-Spiele + Blender-Assets | 8/10, bedingt durch Geräteprüfung | Gute Spielewerkzeuge, klare Lernschnittstelle, wiederverwendbare Assets | Native Verteilung oder gesondertes Streaming nötig; Leistung und Kosten erst nachweisen |

Empfehlung: dritter Ansatz. Eine Engine garantiert weder gute Art Direction noch gute Animationen, Levelgestaltung oder Spielgefühl.

## Vor Produktion: kleinster vollständiger Nachweis

1. **Ziel festlegen:** Altersgruppe, Lernziel, Kernhandlung, gewünschte Perspektive, Referenzbilder mit Quellen, genaue unterstützte Geräte/OS sowie Verteilung. Kein Anspruch „läuft auf allen Geräten“ ohne Matrix.
2. **Distribution prüfen:** Für den ersten technischen Nachweis eine kleine installierbare Unreal-Testanwendung auf dem vorhandenen Mac bauen. Das beweist noch kein iPad-, iPhone- oder Windows-Spiel. Danach zuerst das schwächste verbindliche Schulgerät prüfen. Installationsrechte, Signierung, benötigte SDKs, Updates und Rückkehr zur GradeCrew-App dokumentieren.
3. **Browseranforderung klären:** Unreal-Packaging ist nicht automatisch ein HTML-Export. Pixel Streaming rendert auf einem entfernten Rechner und streamt Bild/Ton/Eingaben. Das erfordert separat geplante Infrastruktur, Bandbreite, Sitzungsverwaltung und Kosten pro gleichzeitigem Spieler. Kein Streaming-Abonnement oder Cloud-GPU-Auftrag aus diesem Dokument. Ist reiner Browserbetrieb ohne Installation zwingend und Streaming ungeeignet, Engineentscheidung mit Martin neu öffnen.
4. **Eine spielbare Referenzszene:** Ein kleiner Abschnitt mit Bewegung/Kamera, einer Interaktion, einer Lernaufgabe, Fehler-/Hilfepfad, Belohnung, Speichern und Wiederaufnahme. Erst mit lokalen synthetischen Lerninhalten; danach gesondert den echten Lernadapter prüfen. Keine komplette Amazonas-Welt vor diesem Nachweis.
5. **Qualitätsfreigabe:** Den tatsächlich paketierten Build visuell und spielerisch prüfen. Erst dann weitere Räume und Assets produzieren. Eine schöne Blender-Aufnahme oder ein Editor-Screenshot ersetzt den spielbaren Build nicht.

## Zuständigkeiten und wiederverwendbarer Kern

**GradeCrew:** Lehrkraft wählt und prüft Lerninhalte; Lernziele, Inhaltsrevision, Schwierigkeit, Aufgabensprache, Berechtigungen, Freigaben und maßgeblicher Lernfortschritt. Vorhandene Learning Guardrails und geschützte Lehrerübersicht erhalten. Kein Durchspielen nötig, um Aufgaben/Ablauf zu prüfen.

**Unreal:** Bewegung, Kamera, Interaktion, Inventar, Dialoge, Missionen, Weltzustand, Audio, VFX, UI und direktes Spielgefühl. Kernsysteme getrennt von Amazonas-Assets und weltbezogenen Daten halten. Weitere Welten verwenden denselben Kern; neue Abstraktionen erst bei realem Bedarf.

**Blender:** Geometrie, UVs, Rig, Animationen und bearbeitbare Quellen. Der genaue Ablauf steht in [UNREAL_BLENDER_PIPELINE.md](UNREAL_BLENDER_PIPELINE.md).

Für den ersten Adventure-Nachweis ist das Third-Person-Template ein Kandidat, kein verpflichtender Kamerastil. Perspektive anhand Lesbarkeit und Touchbedienung festlegen. Blueprints für Szeneninteraktionen und Ablauf; kleine C++-Module dort, wo stabile getestete Schnittstellen oder gemessene Leistungsprobleme es begründen. Keine riesigen Level-Blueprints und kein C++ allein wegen vermeintlicher Professionalität.

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
