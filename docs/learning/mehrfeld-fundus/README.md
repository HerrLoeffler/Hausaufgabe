# Mehrfeld-Aufgaben · Fundus v1

GC-EXTENDED-QUESTION-TYPES-01 · 09.11.2026 · erster versionierter Testdatenbestand

Die [Falldaten](cases.v1.json) enthalten sechs Beispiele für die Entwicklung und sechs zurückgehaltene Prüffälle. Der Bestand gehört zur bestehenden [automatischen Aufgabenauswahl](../AUTOMATIC_TASK_SELECTION.md). Die Prüffälle dienen nur zur Auswertung. Sie gehören nicht in den Erstellungsauftrag der KI. Nach Auswertung und Änderungen an den Regeln ist für eine spätere Freigabe ein frischer, größerer Prüfsatz nötig.

| ID | Aufgabe | Was der Fall absichert |
| --- | --- | --- |
| M01 | 25 % von 400 € | Prozentwert über 1 %, beide Seiten proportional |
| M02 | Zehn Packungen zum gleichen Stückpreis | Direkte Zuordnung, Dezimaleingabe |
| M03 | Druckauftrag mit drei bzw. acht Druckern | Konstante Leistung, gegenläufige Pfeile |
| F01 | Zwei Keimungsbeobachtungen benennen | Pfeil als Zuordnung, je ein Begriff pro Beobachtung |
| F02 | Zwei Verbformen ins Präteritum setzen | Pfeil als Umformung bei gleichbleibender Person |
| F03 | Wasser schmelzen und erstarren lassen | Pfeil als gerichteter Übergang mit offenem Fachbegriff |
| M04 | Tankinhalt aus 30 % bestimmen | Grundwert und freie Recheneingaben |
| M05 | Dauer für zehn gleich starke Pumpen | Neuer Kontext für umgekehrte Zuordnung |
| N01 | Taxifahrt mit Grundgebühr | Kein Dreisatz bei additiver Grundgebühr |
| N02 | Prozentangabe in Worten erklären | Kein Rechenformat bei einem Deutungsziel |
| N03 | Historische Ursachen belegen | Offene Begründung mit mehreren vertretbaren Antworten |
| Q01 | Druckeraufgabe aus dem Screenshot | Auswahl des passenden Formats und Qualität der konkreten Aufgabe getrennt bewerten |

## Was gemeinsam ist

Eine Mehrfeldaufgabe hat sichtbare Angaben, gezielt offene Felder und bei Bedarf Verbindungen mit einer klaren Bedeutung. Jedes bewertete Feld braucht eine eindeutige Position, einen Antworttyp, zulässige Lösungen und ein Gewicht. Eine Verbindung kann eine Rechnung, Zuordnung, Umformung oder einen gerichteten Übergang darstellen. Wenn Pfeile keine zusätzliche Information tragen, reicht beispielsweise eine Tabelle.

Dreisatz bleibt ein eigenes Fachrezept mit mathematischen Voraussetzungen. Proportionale Zuordnungen haben ein konstantes Verhältnis, umgekehrt proportionale ein konstantes Produkt. Prozentaufgaben eignen sich für das Rezept, wenn ein proportionaler Rechenweg Teil des Lernziels ist. Preis plus Grundgebühr oder Prozentangaben deuten sind Gegenfälle. Dieselbe Darstellung allein qualifiziert keinen anderen Aufgabentyp für den Dreisatz-Builder.

Die KI kann Thema, Sprache, Kontext und Eingabedaten vorschlagen. Für Dreisatz baut und bewertet der vorhandene Baustein die Aufgabe. Für neue Fachrezepte wird vor Anbindung festgelegt, was Pfeile und Felder bedeuten, welche Antworten gleichwertig sind und ob eine eindeutige automatische Bewertung möglich ist. F01–F03 sind fachliche Entwürfe, noch keine neuen Renderer oder Bewertungsverträge. Bei F03 ist vor einem Pilot insbesondere zu entscheiden, wie verbale Varianten wie „erstarren“ gewertet werden.

## Rückmeldungen

Die Fall-IDs sind stabil. Eine Rückmeldung gilt für eine konkrete Revision und bleibt als eigener Eintrag erhalten. Ein direktes „Q01 schlecht – es sollen nur offene Pfeile ergänzt werden“ genügt als Meldung. Die Redaktion erfasst sie mit Fall-ID, Datensatzversion, Revision des Falls (v1 startet bei 1), Urteil (gut / überarbeiten / ungeeignet), Fehlerkategorie, Kurzbegründung, Korrekturvorschlag und Prüfstatus. Bei KI-generierten Aufgaben kommt im vorhandenen geschützten Feedbackweg die bestätigte Version bzw. der Fingerabdruck der Aufgabe hinzu. Die öffentliche Beispieldatei enthält keine Kontokennungen, Schülerantworten oder privaten Unterrichtsmaterialien.

Sinnvolle Kategorien sind Formatwahl, fachliche Beziehung, Angaben, Sprache, sichtbare Lücken, Lösung, zulässige Alternativen und Bewertung. Die fachliche Prüfung kann einen Fall als Referenz übernehmen, die Rezeptregel präzisieren oder einen Fehlerfall für die nächste Auswertung sichern. Korrekturen bekommen eine neue Revision und ersetzen die ursprüngliche Beobachtung in der Historie nicht. Die Liste der Lehrkrafturteile beginnt leer. Q01 dokumentiert eine nachvollzogene Abweichung aus dem Screenshot und zählt nicht als formelles Lehrkrafturteil.

Die Rückmeldungen verbessern die Rezeptregeln und Beispiele nach fachlicher Prüfung. Tests prüfen danach getrennt Formatwahl, fachliche Lösbarkeit, Übereinstimmung zwischen Auftrag und Oberfläche sowie Teilpunkte. Abgelehnte KI-Entwürfe zählen in einer späteren Messung mit. Qualitätsraten pro Rezeptversion werden erst aus tatsächlichen Versuchen berechnet. Für eine spätere Freigabe gelten weiterhin die Qualitätsstufen und Veto-Regeln der bestehenden Aufgabenauswahl.

## Prüfung dieses Datenstands

Offline mit dem vorhandenen Dreisatz-Baustein aus dem lokalen Pilot-Checkpoint 4fb49a9 geprüft. M01–M05 ergaben jeweils sechs erwartete Werte, vier erwartete Rechnungen und fünf einzeln bewertete Felder. Volllösung, ein leeres Feld und leere Abgabe ergaben jeweils 2,5 / 2 / 0 Punkte. In der öffentlichen Projektion fehlte der Lösungsschlüssel. Q01 wurde anhand der sichtbaren Vorgaben nachgezählt. Zwei offene Pfeile mit je zwei Feldern und ein offener Ergebniswert ergeben 2,5 Punkte. Der Auftrag ist trotzdem widersprüchlich.

Die Auswahl- und Gegenfälle sind Sollwerte für den nächsten Generatorlauf. Fachübergreifende Umsetzung, Lehrkrafturteile und ein echter KI-Lauf stehen für diesen Fundus noch aus. Dieser Datenstand ist für die Vorbereitung eines getrennten Testpiloten vorgesehen.
