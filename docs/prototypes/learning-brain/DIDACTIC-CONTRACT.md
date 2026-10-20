# Didaktischer Entscheidungsvertrag – Bruchpilot

Beobachtung → echte GradeCrew-KI-Entscheidung → fachliche Prüfung → nächste Aktivität.

Die Beobachtung enthält Aufgabe, Anspruch, eingegebene Antwort, unabhängig geprüfte Richtigkeit, Hilfenutzung, jüngste Versuche und getrennte Evidenzzählung. Die KI antwortet strukturiert mit Aktion (challenge/probe/support/pause), Teilkompetenz, Anspruch, Hilfefokus und kurzer Begründung. Ungültige oder nicht maschinenlesbare Antworten führen zu einem sichtbaren Fehler mit Wiederholungsmöglichkeit, niemals zu einer als KI ausgegebenen Ersatzentscheidung.

## Konkrete Grenzen

- Selbstständig richtig: schwierigere Probe, keine automatische Erklärung oder Lesesperre. Ein einzelner Erfolg ist kein Kompetenznachweis.
- Fehler: gezielter Teilschritt oder Hilfe, kein Schwierigkeitssprung. Zwei Fehler derselben Kompetenz oder eine nicht gelöste Hilfefrage verlangen Unterstützung oder Pause.
- Mögliche komponentenweise Addition ist eine Hypothese aus der Eingabe. Hilfe muss dann Teilgröße, Gleichwertigkeit oder Faktor klären; direktes Zusammenzählen darf das nicht überspringen.
- Additionsanspruch0: gleiche Nenner;1: genau einen Bruch erweitern;2: beide erweitern innerhalb eines Ganzen;3: beide erweitern und Ergebnis über1. Erzeugte Aufgaben werden auf diese Merkmale geprüft.
- Der vollständige Ausdruck und die abgegebene Antwort bleiben in jeder Hilfe sichtbar. Die KI wählt den Fokus, berechnete Darstellungen bleiben mathematisch kontrolliert.
- Nachweis getrennt: mindestens8 richtige von10 verschiedenen unabhängigen Aufgaben je Teilkompetenz; Hilfen und Wiederholungen zählen nicht. Das ist eine vereinbarte Prototypregel, keine validierte Langzeitdiagnose.

## Wiederverwendung

Beobachtungs- und Entscheidungsformat sind wiederverwendbar. Implementiert ist ausschließlich der begrenzte Bruchadapter. Für weitere Fächer fehlen Kompetenzgraph, aufbereitete Materialprofile, unabhängige Aufgabenprüfung, passende Darstellungen und fachliche Abnahme. Ein universell wirksames Didaktiksystem ist damit nicht behauptet.

Quelle der Materialmuster: drei tatsächlich gesichtete Bestandsmaterialien, dokumentiert in MATERIAL-BASIS.md. Keine Originalseiten an den Provider übermittelt. Keine Cloud-/Productionänderung, keine dauerhafte Schülerakte.

## Antwortdialog und zweite KI-Prüfung

Pro Hilfeschritt: exakte Ausgangsrechnung und aktuelle Antwort → kurze KI-Erklärung → nur bei Passung eine Darstellung → kleine Frage mit Antwortfeld → geprüfte Antwort. Jede Frage hat einen konkreten Antwortvertrag; zusätzliche rhetorische Fragen im KI-Text werden abgewiesen. Bei zwei Fehlern erhält die KI auch die tatsächliche kleine Frage. Das gilt für den begrenzten Bruchadapter, nicht beliebige freie Antworten in allen Fächern.

KI-Text entsteht pro Ansicht neu aus geprüften Zahlen und Schrittziel. Ein separater KI-Prüfdurchlauf kontrolliert fachliche Passung und Frage/Schlüssel. Der zweite Aufruf nutzt denselben vorhandenen Dienst in einem separaten Kontext, ist keine unabhängige Modell-/Lehrkraftgarantie. Schülerantwort und Musterlösung sind eindeutig bezeichnet. Unklare/abgelehnte Entwürfe werden angezeigt als nicht freigegeben und können erneut angefordert werden; kein versteckter Ersatz.

Die optionale interaktive Pizza erhält die gleiche Ganzengröße, Teilung und markierte Menge werden exakt gerechnet. Bei Veränderung muss das Bild zur verlangten Menge passen; ein passendes Zahlenfeld allein reicht nicht. Bilder/Interaktion werden nur für passende Anteils-/Teilungsfragen zugelassen. Kein neues H5P-System installiert.
