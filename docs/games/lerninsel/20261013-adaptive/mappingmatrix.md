# Fachliche Mappingmatrix

Vorschlag, keine implementierte Zulassung. Alle elf Typen am Assessmentsource44ab geprüft. Antwortabbildung verwendet **IDs des eigenen öffentlichen Papers**, keine Authoringindizes oder lokalen Lösungsschlüssel. Panel-Fallback hat dieselbe Bewertung.

| Typ | Mögliche Mechanik / Beispiel | Kanonische Antwort | Grenze / Fallback |
| --- | --- | --- | --- |
| single | eine Karte/einen Stein wählen; Sachfach Begriff | eine Option-ID | keine räumlich „richtige Tür“ verraten |
| multi | mehrere Wortsteine; Deutsch Verben im Satz | Liste Option-IDs | Kontext vollständig; Count/Richtigkeitsfeedback im Prüfungsmodus vermeiden |
| dropdown | Schild vervollständigen; Artikel im Satz | eine Option-ID | nicht als freie Sprachproduktion ausgeben |
| truefalse | Aussage beurteilen, zwei gleichwertige Schalter | "true" oder "false" | ganze Aussage/Hörinformation erhalten |
| text | Notizstation; historische Begründung | Text | lange/offene Antwort im Panel; manualReview und Rubric erhalten |
| number | Messstation/Zahleneingabe;1L-Ganzes,3/10 | Zahl als String in veröffentlichter Einheit | Skala/Darstellungsauflösung fachlich freigeben; keine Bewegungspunkte; private Toleranz nicht publizieren |
| gapfill | Satzlücken mit direkt erreichbarer Eingabe | Liste in Paper-Segmentreihenfolge | aktuelle Speicherung erwartet Liste; keine akzeptierten Wörter in freien Schildtext einschleusen |
| matching | Wort–Bild oder Fremdwort–Audio verbinden | Links-ID→Rechts-ID | zustandsabhängige Sachzuordnung ausdrücklich benennen |
| ordering | Artikel-/Satzteile auf Plätze ordnen | Liste Item-IDs | erlaubte Alternativreihenfolgen ausschließlich serverseitig;10langeItems eher Panel |
| grouping | Objekte nach benannter Eigenschaft gruppieren | Item-ID→Gruppen-ID | vorhandenes Modell eine Gruppe je Item; Mehrdeutigkeit nicht als Mehrfachzuordnung erfinden |
| markwords | Passage auf Tafel/Steinen markieren | Wortindexliste, bei Farbgroups Index→Farbe | Satz/Punktuation/Tokenisierung erhalten, nicht nur gleiche Wortzeichenketten vergleichen |

MVP: vier Kerne Wählen/Markieren, Ordnen, Zahl/Messen und Zuordnen. Kein Anspruch auf elf fertige Gameadapter. Hör-/Bildinformationen bleiben im veröffentlichten Aufgabenvertrag; Hörverstehen bekommt keinen verräterischen Textfallback. Bei unpassendem Gerät kann eine fachlich andere Modalität nur die Lehrkraft neu freigeben. Lange Inhalte werden nicht still abgeschnitten; Lehrerpreview zeigt Überlänge und empfiehlt Panel.

Fachfreigabe je Mapping: identisches Lernziel, gleiche öffentliche Informationen, gleiche Einheit/Antwortmenge, gleiche Hilfen-/Punktepolicy, serverseitige Bewertungsparität und gleichwertige direkte Bedienung. Für jeden neuen Fachkontext mindestens ein passendes und ein bewusst ungeeignetes Beispiel prüfen. Eigene Inhaltsabstraktion ersetzt weder Curriculumfreigabe noch Mediennutzungsrechte.
