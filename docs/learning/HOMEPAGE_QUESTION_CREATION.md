# So entstanden die zehn Startseiten-Aufgaben

GC-DESIGN-05 ·25.10.2026. Der Nutzer hat Veröffentlichung und Sicherung der Arbeitsweise beauftragt. Referenzversion: freigegebener lokaler Prototyp V8 vom25Oct; Live-App-Basis9497e756. Dies ist eine nachvollziehbare Rekonstruktion aus den erhaltenen Quellen und Versuchshistorien, kein nachträglich erfundenes wortgetreues Promptprotokoll.

## Direkte Antwort zur KI

Die zehn Aufgaben wurden in diesem KI-gestützten Entwicklungsdialog fachlich entworfen, anhand von Martins Rückmeldungen kuratiert und als individuelle HTML/SVG/JavaScript-Interaktionen gebaut. Es gab keinen einmaligen produktiven „Erzeuge diesen Test“-Aufruf, der die ganze Startseite erzeugt hat. Die öffentliche Demo bewertet im Browser; sie legt keinen echten Schüler-Test an. Die Lösungen sind absichtlich öffentliches Beispielwissen.

Der reguläre Generator kennt auf Basis9497e756 elf technische Typen: single, multi, text, dropdown, truefalse, gapfill, matching, ordering, grouping, markwords, number. Nachweis: functions/lib/constants.js und schemas.js. Bild und Audio sind Medien, keine eigenen Typen. Die individuellen Koordinaten-, Pflanzen-, Zeitstrahl-, Bildfolgen- und Winkel-Oberflächen werden nicht automatisch dadurch in Remy aufgenommen, dass sie auf der Homepage liegen. Der Generator lädt diese Dokumentation oder die neuen Blueprints derzeit nicht. Die geprüfte pädagogische Auswahl unter functions/data/pedagogical-pool.json hat eigene Zulassungsregeln; diese Beispiele wurden nicht ungeprüft dort eingetragen.

## Erhaltene Quellen

- homepage/app.js: Aufgabenformulierungen DE/EN, Antwortzustände, Klick-/Drag-/Tastaturinteraktionen.
- homepage/grading.mjs und grading.test.mjs: Lösungen, Teilpunkte, Toleranzen und überprüfbarer20/20-Beispielzustand.
- homepage/illustrations.js: selbst geschriebene SVG-Illustrationen, Schaltungen, Ereignisse, Entwicklungsstadien.
- homepage/assets: tatsächlich verwendete Medien. Moderne Crew aus Martins Referenz, freigestellte Kosmee per Bildgenerator, Remy-Audio mit der vorhandenen ElevenLabs-Stimme5Axpbpycg8qWQ7LexavI. Es wird kein neuer Take aus diesem Release behauptet.
- homepage/source-history/: erhaltene Aufgabenpläne und README/HANDOFF des Prototyps. Sie enthalten verworfene Entwürfe und zeitbezogene Zwischenstände; die aktuellen Runtime-Dateien sind maßgeblich.
- homepage-task-blueprints.v1.json: maschinenlesbare Baupläne, Lernziele, Bedienung, technische Grenzen und Bewertungsregeln für alle zehn Karten. Referenzformat, kein vom Generator akzeptiertes Ausgabeformat.

## Arbeitsweise, die wiederverwendet werden soll

1. Lernziel/Fach/Zielgruppe bestimmen, dann eine passende Handlung auswählen. Keine Quote von25Formaten erfüllen; zehn stimmige Beispiele sind besser als eine lange Liste trivialer Fragen.
2. Gemeinsame INTERACTIVE_TASK_PRINCIPLES.md und INTERACTIVE_TASK_CATALOG.md auf aktuellem main lesen. Verwendet: VIS08 Koordinaten, MOD01 Audio, VIS02 Beschriftung, VIS04 Zeitzuordnung, EXP05 Stromkreis-Idee, VIS07 als Variante Winkel einstellen. Wortarten, Gleichung, Gruppen und Reihenfolge nutzen vorhandene Standardtypen statt künstlicher neuer Katalog-IDs.
3. Aufgabenauftrag, Daten, Antwortweg, eindeutige Lösung, gleichwertige Alternativen und Teilpunkte zusammen entwerfen. Schwierigkeit entsteht durch Denken. Gleichung und Lösung gemeinsam ändern; Sprachversionen müssen dieselben fachlichen Beziehungen behalten.
4. Medien mit genauer fachlicher Anforderung erstellen: freigestellte Pflanze mit sichtbaren Zielteilen, vier technisch plausible Schaltungen, klar verschiedene Stadien. Vorhandene Markenbilder/Stimmen wiederverwenden. Keine neue Provideranfrage ohne Prüfung bisheriger Versuche/Quoten. Der letzte neue DE-Audioversuch scheiterte an Quote; die veröffentlichte WAV ist ein vorhandener Schnitt. Wortlaut/Betonung nicht als neu abgenommen ausgeben.
5. Eine klare Interaktion bauen: auswählen, ablegen, ändern, entfernen. Keine irreversiblen falschen Zuordnungen. Keine Verbindungstaste ohne fachliche Bedeutung. Werkzeuge müssen die Lösung ermöglichen; keine vorweggenommene Lösung unter Eingabefeldern oder am Regler.
6. Bewertungsregeln vor der Auswertung prüfen: richtig, falsch, leer, teilweise, doppelte Werte, Extraauswahl, Reihenfolgealternativen und Toleranzgrenzen. Maximalpunkte bleiben editierbar; Punkte reskalieren konsistent. Beispielaufgaben sind keine sichere Prüfung: echte Abgabe/Bewertung gehört auf den Server.
7. Eine Karte je Ansicht mit stabiler Höhe und fester Navigation. Wheel-Gesten bündeln statt mehrere Karten pro Geste überspringen; schnelles bewusstes Klicken auf1–10 bleibt möglich. Kurze und schmale Viewports, Fokus und Tastatur real prüfen.
8. Fachliche und gestalterische Gegenprüfung, dann konkrete Rückmeldung einarbeiten. Vor Deployment exakte Quelle, CI, Manifest und Wiederherstellung prüfen. Benutzerabnahme nicht durch grüne Tests ersetzen.

## Vorlage für zukünftiges KI-Authoring

„Erstelle einen neuen eigenständigen digitalen Leistungsnachweis für [Fach, Jahrgang, Lernziel]. Lies die zugelassenen technischen Typen und den relevanten geprüften Aufgabenfundus. Nutze die Homepage-Blueprints nur als Gestaltungs- und Interaktionsreferenz. Verwende ausschließlich vom tatsächlichen Schema/Renderer/Server unterstützte Formate; erfinde keine Widget-API. Formuliere zu jeder Aufgabe den kurzen Auftrag, Daten, richtige Lösung, sinnvolle falsche Alternativen, mögliche gleichwertige Antworten, Teilpunkte und Bedienrückwege. Vermeide Lösungshinweise in Platzhaltern und Grafik. Begründe die Medienwahl. Prüfe fachliche Korrektheit sowie leere, falsche und teilweise Antworten. Gib intern das existierende Schema aus; Lehrkräfte brauchen keinen JSON-Editor.“

Diese Vorlage kann ein Entwicklungs-/Authoring-Agent zusammen mit den Quellen verwenden. Sie ist noch kein aktivierter Remy-Prompt.

## Was für automatische Tests dieser Qualität noch fehlt

Für vorhandene Typen können Inhalte/Medien bereits entlang des aktuellen Generators erzeugt werden; für die genaue Demo-Darstellung braucht es weitere geprüfte Anpassungen. Koordinaten/Pflanzen/Winkel benötigen jeweils einen eindeutigen Datenvertrag, Editor und Vorschau, serverseitige Bewertung, Lösungsschutz, barrierefreie Antwortalternative und echte Generierungsnachweise. Für Zeitstrahl/Bildfolge/beleuchtete Schaltungen reicht ein Textmatching/ordering/multi-Schema allein nicht als Beleg der grafischen Ausführung. PR265/300 zu visuellen Aufgaben sind getrennte Entwürfe, keine durch diesen Hosting-Release erteilte Freigabe.

Wichtige Grenzen: Die Remy-Markenfrage demonstriert Wiedergabe und Bedienung; das sichtbare Logo verrät ihre Lösung. Die gleichmäßig gesetzten Geschichts-Slots sind eine schematische Jahreszuordnung, kein maßstabsgetreuer Zeitstrahl. Schaltungsleuchten ist eine vorab geprüfte Illustration, keine allgemeine Simulation. Diese Grenzen bei späteren Lernzielen beachten.

## Bereits vorhandene Folgearbeit richtig anschließen

Der aktuell neu gelesene main dokumentiert außerdem ein getrenntes echtes KI-Aufgabenlabor: [visueller Pilot](../../workstreams/visual-pilot-24-20261025.md), Code/Nachweis auf PR296 bei a12ad792. Dort sind lokal neun neu generierte Aufgaben und neun Emmi-Überarbeitungen belegt. Dieser Laborbeleg aktiviert weder alle Homepage-Widgets im normalen Live-Generator noch verändert dieser Homepage-Release die KI-Functions. Künftige Arbeiten sollen das Labor und die vorhandenen visuellen Verträge wiederverwenden statt einen zweiten Generator zu bauen.

Veröffentlichter Quellstand der Homepage: [f8274f06](https://github.com/HerrLoeffler/Hausaufgabe/tree/f8274f06616f5db9a15597f37229a15bb9bfa2c6/homepage). Die angegebenen homepage/-Quellen und Originalpläne liegen dort im Produktbranch; diese Dokumentation und die Blueprints sind zusätzlich im zentralen main abgelegt.
