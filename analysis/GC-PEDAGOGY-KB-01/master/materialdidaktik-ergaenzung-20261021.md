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


## Deutsch und Schriftspracherwerb – Grundschule1

Quelle ea3d79400d5b5503: alle284PDF-Seiten textlich und visuell gelesen. Diagnosequelle6b47874d62ea10d8: alle22Seiten gelesen, einschließlich der Bildformulare. Die folgenden Regeln sind eigene Transferentwürfe; sie belegen keine vergleichende Wirksamkeit einer bestimmten Methode. Referenzierte Zusatzmaterialien gelten dadurch nicht automatisch als analysiert.

### 13. Teilkompetenzen getrennt belegen

Wortschatz, Lautanalyse, Graphemwissen, Synthese, Sinnentnahme, eigenes Schreiben und Motorik getrennt erfassen. Eine richtige Teilhandlung belegt die übrigen nicht.

Beleg: ea3d79400d5b5503, PDF-Seiten 58, 74, 275.

### 14. Bildwortschatz vor Lautdiagnose klären

Für jedes Lautbild eine passende bekannte Bezeichnung sichern. Gültige alternative Benennungen berücksichtigen; unbekannte Wörter nicht als Lautfehler werten.

Beleg: ea3d79400d5b5503, PDF-Seiten 13, 35, 58.

### 15. Laut, Zeichen und Silbe unterscheiden

Buchstabennamen, gesprochene Laute, mehrgliedrige Grapheme und Silben nicht über dieselbe Anzahl gleichsetzen. Pro Zielstelle die relevante Einheit benennen.

Beleg: ea3d79400d5b5503, PDF-Seiten 13, 37, 47, 112, 191.

### 16. Synthese mit korrekter Lautung stützen

Lautfolgen mit passender Stütze verbinden, ohne zusätzliche Hilfsvokale oder dauernde Stimmhaftigkeit zu erzwingen. Lautdiagnose nicht ausschließlich aus Flüstern ableiten.

Beleg: ea3d79400d5b5503, PDF-Seiten 74, 75, 86, 89.

### 17. Schreiben als beobachtbaren Prozess begleiten

Benennen, gliedern, Zeichen finden, schreiben und kontrollieren getrennt beobachten. Genau am stockenden Schritt helfen und Unterstützung später abbauen.

Beleg: ea3d79400d5b5503, PDF-Seiten 58, 59, 277.

### 18. Rechtschreibstrategie zur Zielstelle wählen

Hören, Verlängern, Wortverwandtschaft und Merkwissen je nach Stelle unterscheiden. Lautvollständigkeit und Normschreibung mit getrennten Kriterien beurteilen.

Beleg: ea3d79400d5b5503, PDF-Seiten 149, 175, 191, 192, 198.

### 19. Textbeleg und eigene Stellungnahme unterscheiden

Bei textbezogenen Fragen einen Beleg verlangen; bei Meinung, Fortsetzung und Bilddeutung mehrere begründete Antworten mit eigener Rubrik zulassen.

Beleg: ea3d79400d5b5503, PDF-Seiten 112, 144, 220.

### 20. Zugang und geprüfte Leistung sichtbar halten

Audio, Lesetandem, Bildstütze, gelegte Buchstaben oder diktiertes Schreiben ermöglichen Teilhabe. Im Ergebnis festhalten, welche Hilfe benutzt wurde und welche Teilkompetenz damit belegt ist.

Beleg: ea3d79400d5b5503, PDF-Seiten 205, 220, 231, 275.

### 21. Förderung als überprüfbaren Zyklus führen

Konkretes Ziel, Ressourcen des Kindes, Maßnahme, Datum und beobachtete Wirkung verbinden. Die nächste Hilfe an der Beobachtung ausrichten; kein Defizitetikett aus einer Einzelantwort ableiten.

Beleg: ea3d79400d5b5503, PDF-Seiten 276, 277, 278, 279.

### 22. Erledigung von Kompetenz trennen

Erledigt, beobachtet, selbstständig gelungen, mit Hilfe gelungen und noch nicht gelungen getrennt führen. Unbeobachtet darf weder richtig noch falsch bedeuten; ordinale Kategorien nicht in Lernprozente umrechnen.

Beleg: ea3d79400d5b5503, PDF-Seiten 275, 280, 281.

### 23. Offene Sprachproduktion fair bewerten

Für Brief, Erzählung, Beschreibung und Reflexion Zweck und wenige passende Kriterien festlegen. Mündliche oder fiktive Anlässe zulassen, wenn private Fotos oder Schreibmotorik keine Zielanforderung sind.

Beleg: ea3d79400d5b5503, PDF-Seiten 205, 212, 231, 281.

### 24. Anfangsmodelle fachlich eingrenzen

Elementare Nomen-, Satz-, Verb- und Lautregeln als begrenzte Lernmodelle behandeln. Fehlerhafte Verweise und Immer-Regeln vor Übernahme prüfen und mit Gegenbeispielen begrenzen.

Beleg: ea3d79400d5b5503, PDF-Seiten 104, 116, 121, 152, 195.

### Ergänzende Prüfung aus dem Diagnosepaket

Die ß-Aufgabe auf PDF12 benötigt eine präzise Erklärung, die auch Diphthonge berücksichtigt. Maßgeblich ist die vollständige [amtliche Regel§25 beim IDS](https://grammis.ids-mannheim.de/rechtschreibung/6180), einschließlich ihrer Bedingungen und Ausnahme. Nomenproben ohne Satzkontext können bei nominalisierten Wörtern mehrdeutig werden. Grafische Lautfelder, Silbenbögen und Bildfarben sind Informationsträger; ihre Originalseiten bleiben privat erhalten.

**Freigabegrenze:**24Konzeptregeln vorgeschlagen, keine neue Laufzeitfreigabe. Offene Einzelaufgaben, sprachliche Detailregeln, Lösungen, Farboriginale und referenzierte Audios verlangen passende eigene Nachweise. Aktuelle Lehrplanzuordnung dieser neuen Deutschquelle noch offen.
