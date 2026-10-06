# Bruchpizzeria als erster Browser Spieltest

- Task-ID: GC-GAMES-PIZZA-01
- Aktualisiert (UTC): 2026-10-06 16:04:50 UTC
- Verantwortlicher Chat: Infos aus Games GC holen, 01a111e6-c211-76a2-928e-8ed88a7b7bec; bekannter öffentlicher Chat-Link: unbekannt.
- Aufgabenbranch: docs/bruchpizzeria-briefing-20261006
- Basiscommit: 31303f7d93723a0040e858178ffa96c16038c306
- Integrationsziel: main für diese Dokumentation; späteres Spielziel vor Umsetzung festlegen.
- Arbeitszustand: Briefing gesichert, konkreter Spielentwurf vorgeschlagen.
- PR: keiner.
- Betroffene Dateien: diese Übergabe, TODO.md und workstreams/registry.json. Keine Änderungen am allgemeinen Games-Leitfaden, bestehenden Spielen oder Release Train.

## Bestätigter Nutzerwunsch

Martin wählt die Bruchpizzeria aus den fünf Ideen. Zunächst Browser; native Apps zurückgestellt. Lernende etwa Klasse 5–7, aber der Einstieg richtet sich nach Verständnis, nicht einer festgelegten Klassenstufe. Langfristiges Ziel ist tragfähiges Bruchverständnis.

Die zwei am 06.10.2026 gelieferten Küchenbilder dienen als Anregung: kompakte Küche, Blick von oben beziehungsweise schräg von oben, erkennbare Stationen und Wege. Gewünscht sind ein kleines Indie-Spiel mit Overcooked-artigem Charakter, tatsächliches Schneiden, freundliche Figuren und Reaktionen, mehrere Bestellungen zugleich und leichter Zeitdruck. Fremde Figuren, Karten und Assets werden nicht kopiert. Die Wahl zwischen Tischservice und Gästen am Tresen ist noch offen.

## Vorschlag für den ersten vollständigen Spielabschnitt

Eine kleine warme Pizzeria mit einer steuerbaren Figur, Pizzastation, Schneidebrett und Ausgabe. Gäste kommen zunächst an den Tresen; das spart Tischverwaltung und beweist trotzdem Bewegung, Transport, Zuordnung und Servieren. Tischservice kann später auf demselben Spielablauf aufbauen.

Spielablauf: Bestellung ansehen → ganze Pizza holen → zum Brett tragen → selbst schneiden → gewünschte Stücke auf den Teller legen → zum richtigen Gast bringen → sichtbare freundliche Reaktion. An der Station öffnet sich eine vergrößerte Draufsicht der Pizza. Maus- oder Fingerbewegungen bestimmen die Schnittlinie; ein bloßer Schneiden-Button teilt die Pizza nicht automatisch richtig.

Der erste Lernumfang umfasst Ganze, Hälften, Viertel und die gleiche Menge 1/2 = 2/4. Die ganze Ausgangspizza bleibt sichtbar. Gleich große Teile sind Voraussetzung dafür, die Teile als gleichwertige Bruchteile zu zählen. Ungleiches Schneiden darf nicht fälschlich als korrektes Vierteln bewertet werden. Größere Interaktionsflächen und begründete Toleranzen trennen Verständnis von motorischer Präzision; Rücknahme und Hilfslinien unterstützen Korrekturen. Die konkrete Schnittgeometrie und Toleranz werden vor Implementierung spezifiziert.

Zunächst eine Bestellung ohne Druck, dann bis zu zwei gleichzeitige Bestellungen. Eine vorgeschlagene Geduldsanzeige schafft milden Zeitdruck. Bei Fehlern Hinweise und erneuter Versuch; falsche Brüche werden nicht wegen Schnelligkeit akzeptiert. Restaurantleistung und fachliches Verständnis werden getrennt rückgemeldet. Hinweise/Erklärungen sollen keinen Zeitnachteil erzeugen.

Vorgeschlagener Testumfang: eine Küche, eine Figur, zwei Gastvarianten, etwa drei bis fünf Minuten, Hilfe, Abschluss, Neustart und lokales Fortsetzen mit synthetischen Übungsinhalten. Erweiterungen wie Zutatenverwaltung, Backzeiten, Personal, Multiplayer und vollständiger Bruchlehrgang gehören in spätere Pakete.

## Erster Arbeitsauftrag nach dem Games Leitfaden

> Entwickle den ersten vollständigen Browser-Spielabschnitt der GradeCrew-Bruchpizzeria anhand dieser Übergabe. Lies die aktuellen Repository-Regeln sowie GREAT_GAMES_WORKFLOW.md, GAME_PROJECT_TEMPLATE.md und GAME_TEAM_WORKFLOW.md. Falls die Dokumente noch nicht auf main liegen, prüfe den aktuellen PR153 statt ihren Merge zu behaupten. Verwende GC-GAMES-PIZZA-01 und diese Übergabe weiter.
>
> Beginne mit Spielentwurf, Stilblatt und einem begründeten Vergleich zweier passender Browser-Werkzeuge. Prüfe vorhandene Arbeit und offene Vorgänge vor neuen Starts. Halte bestätigte Nutzerwünsche und eigene Vorschläge getrennt. Baue nach dem vereinbarten Entwurf eine kleine Küche mit Bewegung, selbst ausgeführten Schnitten, Portionierung, Ausgabe und zwei freundlichen Gästen. Lernen entsteht aus dem Teilen und Servieren. Prüfe erst Hälften, Viertel und 1/2 = 2/4.
>
> Sichere Plan, eigene Assets, Prüfungen und Übergabe. Prüfe normalen Spielstart, vollständigen Lernspielablauf, korrekte/ungleiche Teilung, falschen Gast, erneuten Versuch, Wiederaufnahme und Touchbedienung. Art und Spielgefühl benötigen eine gesonderte Sicht- und Spielprüfung. Production benötigt eigene ausdrückliche Freigabe.

Dieser Text ist ein gespeicherter Auftragseinstieg, kein gestarteter Worker oder Umsetzungsnachweis.

## Status und nächste Arbeit

- Release-Stufe: branch_only für das Briefing; kein Spielcode vorhanden.
- Prüfungen: Nutzerwünsche und Bildreferenzen gelesen; Task-Zuordnung gegen aktuellen TODO-/Registry-Stand und Pizza-PR-Suche geprüft. Dokumentationsinhalt und Registry werden beim Speichern zurückgelesen.
- CI, Integration, Staging, Gerätetest und Production: für diesen Spielauftrag nicht erfolgt.
- Offene Entscheidungen: finale Bildsprache, Browser-Engine, exaktes Ziel-iPad/Browser, Touchsteuerung und Schnittgeometrie; Vorschlag Tresenservice noch nicht als Nutzerentscheidung ausgeben.
- Lehrplanabgleich: Bundesland/Schulart für einen spezifischen Lehrplan später klären. Kein überprüfter Lehrplanbezug für diesen ersten Entwurf behauptet.
- Kein neuer bezahlter Provideraufruf, keine Budgetreservierung, kein Deploy und keine Änderungen an fremder Versuchshistorie.
- Nächster konkreter Schritt: den kleinen Spielentwurf mit Ansicht, Steuerung und Schnittmechanik konkretisieren und nach dem Games-Workflow abstimmen.

## Wiederaufnahme

Letzter gesicherter Teilschritt ist dieses Briefing auf dem Aufgabenbranch. Kein Produktcheckout angelegt und kein Produktcode ungesichert. Keine gestarteten externen Jobs dieses Auftrags. Vor Fortsetzung Branch/Commit und bestehende Aufträge prüfen, keine zweite Bruchpizzeria starten. Produktionsworkflow GC-GAMES-PIPELINE-01 bleibt unter Verantwortung der GradeCrew Zentrale.
