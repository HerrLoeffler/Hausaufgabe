# Aufgaben- und Methodenfundus

Task GC-EXTENDED-QUESTION-TYPES-01 · Stand 22.10.2026. Zusammen mit den [Grundsätzen](INTERACTIVE_TASK_PRINCIPLES.md) lesen. Fach-/Jahrgangsangaben unten sind Einsatzideen, keine amtliche Lehrplanzuordnung. Alle neuen Umsetzungen zunächst im beauftragten Testumfang; kein automatischer Staging-/Live-Import.

## Wiederverwendbare Interaktionen

**Nachweis V1:** eigener integrierter Branch `feature/extended-question-types-20261020`, [gesicherter Commit](https://github.com/HerrLoeffler/Hausaufgabe/commit/415e7d5da047a2a5730a2f8ae37b52f7b5033dfd). Lokaler Remy→Editor→Schüler→Wilma-Ablauf, neun Beispiele/24 Punkte, tatsächlich 23/24 mit absichtlich falschem Balken. Vor Wiederverwendung aktuellen Code, Export und eigene Tests prüfen. Kein Cloud-/Gerätenachweis.

**Nachweis V2:** [PR265](https://github.com/HerrLoeffler/Hausaufgabe/pull/265), Task GC-VISUAL-PROTOTYPE-AI-02 / Issue255, zwölf visuelle Interaktionen. Online-KI und sichere Serverabgabe sind vom ausführenden Chat im PR/zugehöriger Übergabe dokumentiert; nicht von diesem Leitfaden erneut ausgeführt. Getrennte Testprojekt-Vorschau, keine Schul-Live-Freigabe. [PR271](https://github.com/HerrLoeffler/Hausaufgabe/pull/271) entfernt die Roh-JSON-Bearbeitung; ein offener Fix-PR ändert noch keine veröffentlichte Oberfläche.

| ID | Einsatzidee / Lernziel | Antwort und Prüfung | Herkunft / Grenze |
|---|---|---|---|
| VIS01 Bildbereiche | Organe, Kartenbereiche, technische Bauteile erkennen | Eine/mehrere stabile Regionen auswählen; richtige und falsche Auswahl nach bekanntem Schema | V1 hotspot, V2; geeignete eigene/rechtlich nutzbare Grafik nötig |
| VIS02 Beschriftung | Pflanzenteile, Satzglieder, Rechnungsbeleg fachlich zuordnen | Begriffe zu Zielregionen; eindeutige oder ausdrücklich mehrdeutige Zuordnung berücksichtigen | V1 image-labeling mit Verbindungslinien; V2 labeling; nicht auf nur ein Fachmotiv begrenzen |
| VIS03 Zahlenstrahl | Zahl, Bruch, Prozent oder Messwert verorten | Wert statt Bildschirmkoordinate; Einheit, Bereich und Toleranz definieren | V1 numberline, V2 scale |
| VIS04 Zeitachse | Mehrere Ereignisse zeitlich eintragen und Abstände verstehen | Jeder Ereignismarker eigener Wert; Randwerte, Reihenfolge und überlappende Labels prüfen | V1 Mehrmarker-Zeitachse; nicht mit einer Einpunkt-Skala gleichsetzen |
| VIS05 Bruch-/Prozentraster | Anteil eines gleichmäßig geteilten Ganzen darstellen | Anzahl/Anteil bewerten, äquivalente Zellmuster zulassen | V1 grid, V2; z. B. 25 % von 28 = 7 beliebige Felder |
| VIS06 Diagramm | Daten ablesen, Balken ergänzen, Aussagen prüfen | Werte pro Kategorie, Teilpunkte; einheitliche Skala/Einheit, kein Abschneiden verschiedener Werte auf dieselbe Höhe | V1 bar-chart, V2 chart; grafische Gleichheit eigens prüfen |
| VIS07 Winkel | Mit Messinstrument Winkel bestimmen | Numerischer Wert mit begründeter Toleranz; Skala, Mittelpunkt, Grundlinie nutzbar | V1 angle-measure, V2 bewegliches Instrument; 68°±1°-Grenzfall im V1 geprüft |
| VIS08 Koordinaten | Punkte setzen, Lage/Beziehungen beschreiben | Koordinaten und tolerierte Darstellung, keine beliebigen Pixel | V2 coordinate; Originalvertrag vor Portierung lesen |
| VIS09 Verbindungen | Beziehungen zwischen Elementen herstellen | Zulässige Kanten/Paare, mehrere mögliche Lösungen | V2 connections; kein Graphproblem durch reine Optik lösen lassen |
| VIS10 Textbeleg | Aussage anhand konkreter Textstellen begründen | Fachlich tragfähige Belege; sinnvolle Spannen/Alternativen | V2 evidence; Wortzahl allein ist kein Qualitätskriterium |
| VIS11 Bereich | Intervall, geeignete Zone oder Wertebereich wählen | Grenzen, inklusive/exklusive Endpunkte und Einheit vorab bestimmen | V2 range; nicht nur Mittelpunkt benoten |
| VIS12 Tabelle | Daten ordnen/ergänzen, Beziehungen erklären | Zellen, Einheiten und konsistente abgeleitete Werte | V2 table; kein automatischer Simulationsversuchsnachweis |
| VIS13 Korrektur | Fehler finden, verbessern und begründen | Fundstelle und Korrektur getrennt bewerten | V2 correction; vorhandenes markwords/text ebenfalls prüfen |

## PhET-inspirierte Testideen — noch keine GradeCrew-Freigabe

| ID | Konkrete eigene Testaufgabe | Wiederverwendung / zu prüfende Frage |
|---|---|---|
| EXP01 Gleichwertige Brüche | 1/3 und 2/6 am gleich großen Ganzen darstellen, Gleichheit begründen; danach neuer Bruch | VIS05 + Symbolantwort; adaptive Fachchat-Erkundung berichtet, eigene GradeCrew-Kopplung noch nicht qualifiziert. [Fractions Equality](https://phet.colorado.edu/de/simulations/fractions-equality) |
| EXP02 Gleicher Flächeninhalt | Zwei verschiedene Figuren mit demselben Flächeninhalt bauen; Umfang vergleichen | Raster + begrenzte Konstruktion; kein neues freies Zeichenwerkzeug voraussetzen. Korrekte Flächen-/Umfangsberechnung und mehrere Lösungen prüfen |
| EXP03 Variable und Graph | Erst Änderung vermuten, dann einen Parameter verändern; Tabelle/Graph vergleichen und erklären | VIS06/08/12 + gezielte Eingabe; eigene gekoppelte Darstellung und Transferfrage erst erproben |
| EXP04 Messen und experimentieren | Eine Größe variieren, mehrere Messwerte sammeln, begründete Aussage treffen | VIS03/07/12; Ausgangszustand, Einheiten und erlaubte Variablen kontrollieren |
| EXP05 Modell konstruieren | Bedingungen für eine Struktur erfüllen und Wirkung erklären, z. B. einfacher Stromkreis | VIS09 plus fachliches Modell; echte Simulation, sichere Bewertung und Rechte sind offen. Kein bloßes Linienziehen als Physikmodell ausgeben |

Primärgrundlage dieser Ideen: [PhET HTML-Katalog](https://phet.colorado.edu/de/simulations/filter?type=html), [Mathematik-Aufgabengestaltung](https://phet.colorado.edu/files/guides/Activity_Design_Guidelines_for_Math_en.pdf) und [naturwissenschaftliche Aufgaben](https://phet.colorado.edu/en/teaching-resources/virtual-workshop/science-activity-design). Nur EXP01 wurde zusätzlich vom Chat „GC · Adaptives Lernen – Konzept & Realisierung“ als praktisch erkundet berichtet; die übrigen Einträge sind unsere Transferideen, keine behaupteten Tests einzelner PhET-Simulationen. [Lizenzprüfung](INTERACTIVE_TASK_PRINCIPLES.md#nutzungsrechte-und-wissenspool) vor Fremdeinbettung.

## Weitere erhaltene Ideen aus ZUM/H5P und dem Nutzerprototyp

Die ursprüngliche Chat-Auswertung und Martins HTML-Prototyp sind Anregungen, keine verifizierte Liste heute live verfügbarer GradeCrew-Funktionen. Diese Kandidaten bleiben sichtbar, ohne jede Methode als neuen Datentyp zu behandeln:

| ID | Methode | Sinnvoller erster Test / Grenze |
|---|---|---|
| MOD01 Audio/Diktat | Hören, Informationen verbinden, gezielt schreiben | Eigene kurze Hörsituation mit fachlicher Anschlussfrage; Wiedergabe/Varianten/Rechte prüfen. Spracheingabe und Aussprachebewertung sind getrennte Erweiterungen |
| MOD02 Memory/Lernkarten | Zuordnen und verteilt wiederholen | Vorhandenes matching nutzen; Merken verdeckter Karten nicht mit fachlicher Beherrschung verwechseln |
| MOD03 Kreuzwort/Suchsel | Fachwörter abrufen oder wiedererkennen | Wortschatzübung, keine pauschale Kompetenzmessung; Schreibvarianten und zugängliche Alternative berücksichtigen |
| MOD04 Interaktives Video/Hörgeschichte | An Medienzeitpunkten nachdenken und antworten | Bestehende Aufgaben als Container; Pause/Zurückspringen und Prüfungsmodus definieren, Rechte prüfen |
| MOD05 Lernpfad/Verzweigung | Nach Antwort passende Hilfe, neue Probe oder Entscheidung anbieten | Bestehenden adaptiven Weg und Ergebnisverträge nutzen; keine zweite Kompetenzdatenbank |
| MOD06 Escape/Duell/Bingo | Bekannte Kompetenzen in Spielablauf wiederholen | Bestehende Games-Owner/Engines; Geschwindigkeit, Wettbewerb und Spielhilfe nicht als unabhängige Testleistung werten |
| MOD07 Konstruktion/Audioantwort | Selber zeichnen, modellieren oder sprechen | Zuerst enges Lernziel, Eingabe und Bewertung erproben; Lehrkraftprüfung nicht wegversprechen |
| MOD08 Mehrteilige Quellenaufgabe/Exkursion | Gemeinsame Quelle aus mehreren Perspektiven nutzen | Quelle/360°-Ansicht plus vorhandene Aufgaben; Medienzugriff, Bedienung und einzelne Kriterien prüfen |

Quellen zum Nachlesen, keine importierten Assets: [ZUM Deutsch Lernen](https://deutsch-lernen.zum.de/wiki/Hauptseite), [H5P Mark the Words](https://h5p.org/documentation/content-author-guide/tutorials-for-authors/mark-the-words). Neue technische Ideen aus [STACK/JSXGraph](https://docs.stack-assessment.org/en/Specialist_tools/JSXGraph/Author_quickstart/), [GeoGebra](https://geogebra.github.io/docs/manual/en/commands/Reflect/) und [Numbas-Bewertung](https://docs.numbas.org.uk/en/latest/marking-algorithm.html) bleiben Quellen für eine künftige gezielte Prüfung, kein beschlossener Bibliotheksimport.

## Einen Eintrag erweitern

Bestehende ID fortführen; Lernziel/Zielgruppe, eigene Aufgabenidee, Interaktion, Antwort/Bewertung, Quelle/Version, Rechte bei Übernahme, Modus und Wiederverwendung nennen. Ergebnis nur mit Commit/Umgebung/Prüfbeleg aufwerten. Offene Risiken und genau nächsten Test festhalten. Bestandene technische Prüfung, fachliche Abnahme, tatsächlicher Geräteeinsatz und Lernwirksamkeit sind verschiedene Nachweise. Bestehende Task-/Budgethistorie erhalten.
