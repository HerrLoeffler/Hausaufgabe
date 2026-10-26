# Schnellere interaktive KI Erstellung

Task: GC-EXTENDED-QUESTION-TYPES-01. Vorschlag vom 26.10.2026; nur Planung, keine Runtimeänderung, kein Deployment und keine neue bezahlte Anfrage. Ausführender Fachchat: bisheriger Remy-/Aufgabenchat, Link unbekannt.

## Ziel und Ausgangspunkt

Die gemessenen normalen Staging-Proben benötigen 378 Sekunden für 20 Aufgaben und 845 Sekunden für 40 Aufgaben. Das Tempo soll sinken, während Anzahl, Gesamtpunkte, Hilfestufen, fachliche Richtigkeit, öffentliche Lösungsbereinigung, sichere Bewertung und normale Lehrkraftbedienung erhalten bleiben. Größere Tests sollen zuverlässig vorbereitet werden können; eine feste Sekundenzusage ist noch nicht belegt.

Quellen: [echte Nutzungsnachweise](../../evidence/interactive-staging-repair-20261026/usage-verification.json), [Erstellungsbericht](../../evidence/interactive-staging-repair-20261026/REPORT.md), KI-Quelle f391040d und gemeinsamer Integrationsstand 4fe345c1. Der aktuelle Development-Status-Lauf40397952832 bestätigt diese Integration; seine allgemeinen alten Branchwarnungen sind keine Sperre für diesen dokumentierten Plan.

## So wird heute erstellt

1. Der vorhandene Auftrag läuft über startAiTestJob und processAiTestJob.
2. generateTestInBatches erstellt bis einschließlich20Aufgaben in einer Anfrage; darüber folgen Zehnerblöcke nacheinander. Spätere Blöcke erhalten bisherige Aufgabentexte, um Dopplungen zu vermeiden.
3. Die Software prüft Datenformat, Lösungen, Anzahl, Punkte, Medienvorgaben und Dopplungen. Punkte können bereits lokal ausgeglichen werden.
4. Fehlerhafte Aufgaben werden nacheinander von der KI ersetzt. Pro Position sind mehrere Versuche möglich; das Gesamtbudget wächst mit der Aufgabenzahl.
5. Eine gesonderte KI-Qualitätsprüfung kann weitere Ersatzrunden auslösen. Beide gemessenen Serien benötigten zwei Qualitätsprüfungen.
6. Erst danach werden gültige Aufgaben und gegebenenfalls Medien gespeichert.

| Probe | Dauer | Erfasste Providerantworten | Korrekturversuche | Erfolgreiche Ersetzungen |
|---|---:|---:|---:|---:|
|20Aufgaben/60Punkte|378s|20|17|11|
|40Aufgaben/100Punkte|845s|42|36|18|

Korrekturversuche sind nicht gleichbedeutend mit ebenso vielen verschiedenen falschen Aufgaben. Die Ersetzungen können dieselbe Position mehrfach betreffen. Beide Serien brauchten keine vollständige Neugenerierung und keine Bild-/Audioerzeugung. Die Nachweise enthalten keine genaue Zeitaufteilung je Anfrage oder Fehlerkategorie. Der große wiederholte KI-Anteil ist belegt; seine exakte Zeitverteilung wird erst in Schritt1 messbar. Erfasste Providerantworten sind nicht automatisch sämtliche HTTP-/SDK-Wiederholungen.

## Weitere konkrete Befunde

Der allgemeine Erzeugungs-Systemtext enthält momentan23.498Zeichen visuelle Regeln und Beispiele für alle14Vertragsformate plus zweiDreisatzbeispiele. Diese Regeln hängen auch an Ersatzanfragen; die Qualitätsprüfung besitzt einen eigenen Systemtext. Die beiden vollständigen Dreisatzbeispiele umfassen2.422und2.698Zeichen und jeweils30Zellen. Das beschreibt die vorhandene Struktur, nicht die notwendige Menge neu zu erfindenden Inhalts.

Der Ersatzauftrag nennt Punkte, äußeren Aufgabentyp und Medienart, nennt aber die ausgewählten allowedVisualFormats nicht ausdrücklich. Das wird später dennoch validiert. Außerdem verlangt der Ersatztext auch bei Strukturfehlern grundsätzlich neue Zahlen oder einen neuen Kontext. Das kann unnötige Arbeit und weitere Fehler verursachen; welcher Anteil der beobachteten Reparaturen darauf entfällt, ist bisher nicht gemessen.

## Ansätze und Empfehlung

Bewertet nach erwarteter Laufzeit/Kosten, Qualitätserhalt und Integrationsrisiko; Einschätzungen, keine Benchmarks.

| Ansatz | Eignung1–10 | Abwägung |
|---|---:|---|
|Nur mehr Aufrufe parallel starten|5|Kann Wartezeit senken, behält aber große Antworten und Fehlerzahl; erhöht gleichzeitige Last und erschwert Dopplungsprüfung.|
|Kürzere passende Verträge, geprüfter Aufbau per Programm, danach begrenzte Parallelität|9|Packt Wiederholungen und strukturelle Fehler an der Ursache an; braucht sorgfältige Vertrags- und Bewertungsregressionen. Empfohlene Reihenfolge.|
|Nur das Modell wechseln|4|Kann Einzelschritte beschleunigen, beseitigt aber den wiederholten Aufbau und die Reparaturschleifen nicht. Erst nach der Vertragsverbesserung anhand echter Messungen bewerten.|

## Empfohlene Architektur

Zuerst die einzelnen Phasen und anonymen Fehlerkategorien messen. Dann nur passende Regeln/Beispiele übertragen und die Auswahl auch bei Ersatzaufgaben ausdrücklich erhalten.

Für Dreisatz liefert die KI einen kleinen fachlichen Entwurf: zwei Spaltenüberschriften, sechs Werte, vier Operationen, vier Hilfestufen und sechs Vorgaben. Ein gemeinsam genutzter geprüfter Builder erzeugt daraus Zellen, IDs, Bedienelemente und privaten Lösungsschlüssel. Der vorhandene Builder in dreisatz.mjs ist die fachliche Grundlage; kein zweiter abweichender Algorithmus. Fachliche Werte und Texte bleiben neu KI-erzeugt. Der Builder ersetzt keine angeforderte neue Aufgabe durch ein fertiges Beispiel.

Beginnen mit dem Dreisatz als häufigem und besonders redundantem Fall. Allgemeine Mehrfeldtabellen für andere Fächer bleiben erhalten. Übertragung auf andere Formate erfolgt nur bei passenden geprüften Verträgen, nicht durch eine Mathematikschablone für alle Fächer.

Erst nach der Fehlerreduktion höchstens zwei voneinander unabhängige Arbeitsblöcke gleichzeitig. Eine feste Slotplanung verhindert, dass spätere Blöcke die bisherigen Texte brauchen. Anschließend global Dopplungen, Punktesumme und Medien prüfen. Die unabhängige fachliche Qualitätsprüfung bleibt erhalten.

## Messziele und Grenzen

Vorgeschlagene erste Pilotziele: mindestens90%strukturell gültige Erstaufgaben, höchstens4/8Korrekturversuche bei20/40Aufgaben und mindestens50%weniger Gesamtdauer gegenüber diesen beiden Baselines. Diese Ziele sind noch nicht erreicht und keine allgemeine Latenzgarantie. Erfolgsquote, Inhaltsprüfung und sichere Teilbewertung dürfen nicht schlechter werden. Zwei Proben reichen nicht für eine belastbare allgemeine95%-Laufzeit.

Zuerst vorhandene60Aufgaben offline verwenden. Danach höchstens zwei neue vergleichbare20/40-Aufträge in Staging als vorgeschlagenes separates Pilotbudget; vor Start konkret bestätigen/reservieren, gleiche Request-IDs bei Wiederaufnahme. Dieser Plan startet sie nicht. Providerkosten oder Modellpreise werden nicht geschätzt.

## Verbindliche Grenzen

Nur separates Staging; Production ausgeschlossen. Alte gespeicherte Aufgaben bleiben lesbar, bestehende Lösungen/Bewertungen unverändert. Keine Regel-, Auth- oder Klassenraumänderung. Fehlerhafte oder unvollständige Tests niemals als fertig melden. Keine Rohtexte, Lösungen, Wünsche, Dateien oder Schülerdaten in neuer Laufzeittelemetrie. Rollen-, Budget-, Wiederaufnahme- und Releasegrenzen gelten weiter. Keine Umsetzung allein durch dieses Dokument freigegeben.


## Verbindliche Nutzerergänzung: automatische fachliche Auswahl

Martin verlangt, dass die Lehrkraft passende interaktive Formen nicht pro Aufgabe anklicken muss. Für normale Prozent-/Zuordnungs-/Dreisatzaufträge sollen qualifizierte Dreisatzrezepte standardmäßig berücksichtigt werden; bei anderen Fächern passend andere Formen. Eine reine Schlüsselwortzuordnung oder starre Formatquote genügt nicht. Formatwahl bleibt optionale Eingrenzung; explizite Ausschlüsse haben Vorrang.

Das vorhandene Rezept-/Bauplanregister um Lernhandlungen, Voraussetzungen, Gegenfälle, unterstützte Daten/Medien, Builder, Bewertung, Version und echte Auswahltests erweitern. Nur qualifizierte Rezepte automatisch nutzen. Bestätigte Verbesserungen in Rezepten und Regressionen speichern; kein ungeprüftes Selbsttraining oder automatische pädagogische Poolzulassung. Auswahl und kompakte Inhaltsgenerierung innerhalb des vorhandenen Auftrags verbinden, keine zusätzliche KI-Abfrage je Aufgabe. [Ausführliche Regeln und Gegenfälle](../../learning/AUTOMATIC_TASK_SELECTION.md).

Aktueller Befund: Visuelle Interaktion ist in Remy standardmäßig angehakt, alle acht Unterformate sind erlaubt. interactiveGuidance fordert passende Auswahl, besitzt aber noch keine hier qualifizierte Lernziel-/Gegenfallzuordnung. Diese Ergänzung ist eine neue verbindliche Abnahmeanforderung, keine Behauptung einer bereits ausgerollten Verbesserung.
