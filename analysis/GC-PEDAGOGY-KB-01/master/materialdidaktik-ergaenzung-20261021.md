# Ergänzung des pädagogischen Konzepts aus Materialanalysen

GC-PEDAGOGY-KB-01 · 21.10.2026 · eigene fachliche Ableitungen mit anonymen Quellenbelegen.

Diese Ergänzung verbindet das bestehende GradeCrew-Konzept mit tatsächlich gelesenen didaktischen Hinweisen. Erste Grundlage ist der privat archivierte Kommentar8d468f417d811a7a, Mathematik/Grundschule/Klasse4/Bayern. Die Regeln sind kontextbezogene Gestaltungshilfen. Eine Überlegenheit der Methode, allgemeine Gültigkeit für alle Schularten oder neue Live-Aktivierung wird daraus nicht behauptet.

## Was aus den Materialien in GradeCrew einfließen soll

| Regel | Konsequenz für neue Aufgaben und Rückmeldungen | Fundstelle im anonymen Kommentar |
|---|---|---|
| Denkanspruch ausdrücklich planen | Rechnen, Zusammenhänge erklären und eine Strategie begründen unterscheiden. Größere Zahlen allein machen noch keine anspruchsvollere Denkhandlung. | PDF8,14 |
| Voraussetzungen gezielt prüfen | Vor neuen Verfahren wenige Aufgaben zu benötigten Stellenwert-/Operationsvorstellungen einsetzen. Aus der konkreten Fehlhandlung eine passende Hilfe ableiten. | PDF9–10,14 |
| Handlung, Bild und Symbol verbinden | Die Darstellung nach dem Lernziel wählen. Beim Wechsel erklären lassen, welches Bildmerkmal welcher Zahl oder Operation entspricht. | PDF8,11–13 |
| Gemeinsamen Kern differenzieren | Unterstützung reduziert Sprach-, Darstellungs- oder Bearbeitungshürden. Erweiterung fordert Begründung, Variation oder Verallgemeinerung. Das Kernziel bleibt erkennbar. | PDF9,14 |
| Ergebnis und Strategie unterscheiden | Eine richtige Zahl belegt nicht jeden beabsichtigten Lösungsweg. Für Erklären/Begründen sichtbare Teilleistungen und nachvollziehbare Kriterien vorsehen. | PDF9,20 |
| Verschiedene gültige Rechenwege zulassen | Halbschriftliche, schriftliche und geeignete Kopfrechenwege am Auftrag messen; keine willkürliche Methode erzwingen. Wenn ein bestimmtes Verfahren Ziel ist, dies ausdrücklich nennen. | PDF10,20 |
| Modellieren als eigenen Prozess prüfen | Datenwahl, Darstellung, Rechnung und Rückbezug auf die Situation auseinanderhalten. Unnötige Leselast soll mathematische Schwierigkeiten nicht verdecken. | PDF11,56–57 |
| Grafiken als fachliche Information behandeln | Achsen, Maße, Raster, verdeckte Körper und Referenzobjekte erhalten. Für eine neue Aufgabe die erforderliche Information neu und eindeutig gestalten. Bildschirmvergrößerung ist keine reale Längenskala. | PDF11,13,112 |
| Wiederaufnahme am Lernbedarf ausrichten | Frühere Grundlagen mit neuen Inhalten verbinden. Ein Wochen-/Stoffplan beschreibt eine Planung, nicht den nachgewiesenen Lernstand jedes Kindes. | PDF9,16–17 |
| Reflexion mit Arbeitsbelegen verbinden | Selbsteinschätzung, beobachteten Lösungsweg und nächsten Schritt verknüpfen. Persönliche Darstellung im Lerntagebuch nicht als Mathematikleistung bewerten. | PDF15 |
| Bewertungsregeln begründen | Gleiche Zielsetzung, Hilfsmittel und Anspruch einer Variante prüfen. Quellenbezogene Notenkonventionen nicht ungeprüft auf andere Kontexte übertragen. | PDF14 |
| Gedruckte Lösungsschlüssel fachlich kontrollieren | Ein vorhandener Schlüssel ist eine Prüfquelle, kein Richtigkeitsbeweis. Bei einem Widerspruch bleibt das betroffene Quellenprofil gesperrt, bis die eigene Lösung geklärt ist. | PDF130/Gruppe4; unabhängige Kontrolle privat gespeichert |

## Konkretes Datenmodell für didaktische Regeln

Jede Regel bekommt: `id`, `subject`, `schoolType`, `grades`, `region`, `prerequisites`, `applies_when`, `instructional_sequence`, `representations`, `support`, `extension`, `misconceptions`, `assessment_implication`, `generator_consequence`, `source_pages`, `review_status`.

Zusammengehörige Aufgaben, Lösungen und Abbildungen werden über Content-ID und PDF-Seite verbunden. Ein Textprofil ohne verfügbare notwendige Grafik ist nicht unmittelbar als neue Aufgabe verwendbar. Eine Originalabbildung bleibt im privaten Quellenarchiv; für neue Tests sind Bedeutung und notwendige Merkmale Grundlage einer eigenständigen Darstellung.

## Beispiel für den Transfer in eine neue Aufgabe

**Lernziel:** Umfang und Flächeninhalt auseinanderhalten. Eine eigene Rechteckskizze mit8m und6m beschriften. Umfang28m und Fläche48m² getrennt bestimmen und begründen lassen, welche Größe für einen Zaun und welche für eine Bodenabdeckung gebraucht wird. Als Hilfe den Randweg farblich markieren; als Erweiterung ein anderes Rechteck gleicher Fläche suchen und dessen Umfang vergleichen. Die Darstellung braucht konsistente Längeneinheiten; ein maßstäbliches Messen am Bildschirm gehört nicht zu diesem Auftrag.

Diese Beispielidee ist eine eigene Umsetzung des Gestaltungsprinzips. Sie ist keine übernommene Buchaufgabe und noch kein veröffentlichtes Poolprofil.

## Verbindung mit dem vorhandenen Materialpool

Für ein passend freigegebenes Aufgabenprofil werden Lernziel und Muster im bisherigen Schema gespeichert; die situationsbezogenen didaktischen Regeln fließen in `qualityHints` ein. Eigene Beispiele und Lösungen werden anschließend unabhängig geprüft. Fach, Jahrgang, Schulart, Bundesland, Thema und Aufgabenformat begrenzen die Auswahl weiter.

Die vorhandenen53Startprofile bleiben ein getrennter freigegebener Stand. Neue Seitenanalysen, didaktische Regeln und Quellenkonflikte werden zuerst als Arbeitsgrundlage gespeichert. Erst die dokumentierte fachliche Zuordnung und Profilprüfung berechtigen zu `verified`/`confirmed`; eine automatische Übernahme sämtlicher extrahierter Zeilen erfolgt nicht.

## Amtlicher Lehrplanbezug

Die Quelle selbst ordnet sich Grundschule4/Bayern zu. Die offizielle Fachplanadresse für Mathematik3/4 ist bekannt. Beim direkten Abruf am21.10.2026 lieferte LehrplanPLUS jedoch eine Wartungsseite. Deshalb wird aus dieser heutigen Abfrage keine vollständige aktuelle Fachplanabnahme abgeleitet. Das spätere Mapping bekommt die konkrete amtliche Fundstelle und einen tatsächlich überprüften Quellenstand.

[Offizieller Fachplan Mathematik3/4](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/4/mathematik)

## Offene Arbeit

Vollständige Einzelvalidierung aller Lösungsschlüssel, übrige Ressourcen desselben Buches, andere Regalmedien und praktische Qualitätsabnahme neu erzeugter Aufgaben. Die seitenbezogenen Analysepakete und ihr genauer Prüfumfang stehen unter `media/commentary-8d468f417d811a7a-20261021/`.
