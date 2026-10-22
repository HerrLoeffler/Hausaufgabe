# Wie GradeCrew aus Lernantworten besser fördert

GC-ADAPTIVE-PRACTICE-01 · 22.10.2026 · vertiefter Konzept- und Abnahmeentwurf. **Versioniertes Arbeitsdokument, keine pauschale Runtimefreigabe.** Es konkretisiert das [Lernwerkstattkonzept](../superpowers/specs/2026-10-22-learning-workshop-system.md) und das [Lerngehirn 5–10](../superpowers/specs/2026-10-21-learning-brain-mathe-deutsch-5-10.md). Bestehende Kompetenz-, Material- und Identitätskonzepte bleiben führend. Keine neue Kompetenzdatenbank, keine zweite Anmeldung und kein behaupteter Schülerrollout.

## 1. Ziel, Umfang und vier verschiedene Bedeutungen von „lernen“

GradeCrew soll aus einer konkreten Antwort einen begründeten nächsten Lernschritt ableiten, passende geprüfte Aufgaben wiederverwenden und wiederkehrende Qualitätsprobleme erkennen. Eine steigende Zahl gelöster Aufgaben genügt dafür nicht. Entscheidend ist, was eine Person später ohne Hilfe an einer neuen Aufgabe zeigen kann.

Mathematik 5–10 hat Vorrang, einschließlich gezielter Vorbereitung auf den Quali in Jahrgang 9. Deutsch umfasst vorerst Wortschatz, Satzglieder, Grammatik, Rechtschreibung, kurze textbezogene Antworten und gezielte Textkorrektur. Längere Aufsätze und deren Gesamtbewertung bleiben außerhalb dieses Pakets. Hören erhält erst einen freigegebenen Pfad, wenn tatsächliches Audio, Wiedergabe, Rechte und passende Bewertung belegt sind. Eine Transkriptaufgabe ist kein Nachweis für Hörverstehen.

| Ebene | Was sich verändern darf | Konkreter Beleg | Freigabe und Grenze |
|---|---|---|---|
| Persönliches Lernprofil | nächste Probe, vorläufige Fehlerhypothese, Wiederaufnahme und Hilfebedarf | eigene gültige Antworten mit Herkunft, Hilfe und Zeitpunkt | nur verifizierte eigene Identität; keine fremden Antworten nötig |
| Wiederverwendbarer Fundus | neue eigene Aufgabe, bessere Erklärung, geprüftes Aufgabenprofil | fachlich geprüfte unveränderliche Version | Inhalt ohne Schüleridentität; Lebenszyklus und Freigabe erforderlich |
| Überprüfte Produktverbesserung | z. B. verständlichere Formulierung oder bessere Hilfe für eine Aufgabenfamilie | Kandidatenbericht, fachliche Prüfung und spätere unabhängige Leistung | keine automatische Promotion aufgrund hoher Erfolgsquote |
| Modelltraining | Parameter eines Sprachmodells | eigener gesonderter Trainings- und Evaluationsauftrag | in diesem Konzept **nicht autorisiert**; Rohantworten werden nicht automatisch Trainingsdaten |

Diese Trennung muss auch in Oberfläche und Datenhaltung gelten: „GradeCrew berücksichtigt deine Übung“ darf nicht stillschweigend bedeuten, dass eine Kinderantwort in einen globalen Datenbestand oder ein trainiertes Modell übernommen wird.

## 2. Ausgangsbestand und belastbare Aussagegrenzen

Auf dem aktuellen GitHub-main wurden START_HERE, AGENTS, CHAT_CONTRACT, STATE, TODO und Workstream-Einstieg gelesen. Der gemeinsame [Methodenfundus](https://github.com/HerrLoeffler/Hausaufgabe/blob/main/docs/learning/INTERACTIVE_TASK_CATALOG.md) und die [Aufgabenprinzipien](https://github.com/HerrLoeffler/Hausaufgabe/blob/main/docs/learning/INTERACTIVE_TASK_PRINCIPLES.md) führen VIS01–VIS13 weiter; dieses Dokument ersetzt sie nicht. Gelesene Dateirevisionen: START_HERE `29d84403`, AGENTS `0b846240`, CHAT_CONTRACT `a39d166b`, STATE `fe372ce0`, TODO `2f74561c`, Katalog `1e39932d`, Prinzipien `06878890`. Revisionskennungen belegen die gelesene Datei, keinen Produktdeploy.

READONLY berücksichtigt wurden die vorhandenen Bruchkompetenzkarten B01–B20, der Second-Brain-Plan, die Materialdidaktik vom 21.10., die Übernahme der 24+3 Materialregeln und die Jahrgangskalibrierung vom 22.10. im privaten Arbeitsbestand `analysis/GC-PEDAGOGY-KB-01/master/`. Daraus übernommen: Denkanspruch von Zahlengröße trennen, Ergebnis/Verfahren/Begründung getrennt belegen, Darstellung und Symbol verbinden, nur am stockenden Schritt helfen, mehrere gültige Wege zulassen, Quellenlösungen kontrollieren und Erledigung nicht mit Kompetenz verwechseln. Die darin berichteten Originallektüren wurden hier nicht wiederholt. Es wird weder behauptet, alle Bücher gelesen zu haben, noch werden private Originalaufgaben, bibliografische Bestände oder Abbildungen kopiert.

Der lokale Quellenbestand der 18 Fach-/Jahrgangszuordnungen ist Ausgangsmaterial; extrahierter Volltext ist keine fertig validierte Feinkompetenzabdeckung. Quelljahrgang, geschätzter Einsatzbereich und späterer Transfer bleiben verschiedene Felder. Klasse-1-/Klasse-4-Material liefert didaktische Muster, keine pauschale Lehrplanfreigabe für 5–10.

## 3. Feinkompetenzen: klein genug für eine Entscheidung, groß genug für Transfer

Ein Knoten bezeichnet eine beobachtbare fachliche Handlung unter benannten Bedingungen. „Brüche“, „Grammatik“ oder „Quali“ sind Navigation und Berichtebenen. Auch „vier Kästchen anklicken“ ist keine Kompetenz: Das ist eine Eingabehandlung. Sinnvoll ist etwa „einen Bruch als Anteil eines festgelegten gleichmäßig unterteilten Ganzen darstellen“.

Jede versionierte Kompetenzkarte enthält:

- bestehende Kompetenz-ID und Revision; eigene Unter-ID nur bei zusätzlicher fachlicher Unterscheidung;
- Handlung und Bedingungen, ausdrücklich nicht belegte Nachbarkompetenzen;
- amtlichen Quellenanker, Fassung/Abrufstand, Land, Schulart, Jahrgang/Zug und Status der Zuordnung;
- Voraussetzungen mit Beziehungstyp, Grund und überprüfbarer Probe;
- Aufgabenfamilien, zulässige Darstellungen und Eingabealternativen;
- getrennte Kriterien für Ergebnis, Verfahren und Begründung sowie zulässige Lösungen;
- vorläufige Fehlerhypothesen, klärende Aufgaben, Hilfen und spätere Transferproben;
- Prüfstatus, Owner, Version und Rücknahmeregel.

Nicht für jede Zahlenvariante einen Knoten erzeugen. Eine neue Unterkompetenz entsteht, wenn ein Erfolg sonst eine andere entscheidende Denkhandlung verdeckt: z. B. Erweitern ausführen versus die Wertgleichheit erklären. Jede Aufteilung muss mindestens eine andere Diagnose-/Förderentscheidung ermöglichen. Andernfalls bleibt sie ein Aufgabenmerkmal.

### Voraussetzungen als gerichteter Graph

Bestehende Beziehungen bleiben erhalten: B01 → B02; B02 → B04/B07; B07 + B11 → B12; B04/B07 → B09. Neue Werkstattknoten hängen daran, statt einen zweiten linearen „Levelpfad“ einzuführen. Für Gleichungen werden Gleichheitsverständnis, passende Grundoperation und die Bedeutung des unbekannten Werts getrennt vorausgesetzt. Für einen Textbeleg werden Wortverständnis und explizite Informationsermittlung von der eigentlichen Belegbeziehung getrennt.

| Kantentyp | Bedeutung | Verhalten bei unklarem Vorwissen |
|---|---|---|
| fachlich notwendig | Ziel kann ohne diese Beziehung nicht sinnvoll verstanden werden | kurze gezielte Probe; keine dauerhafte Sperre aus bloß fehlendem Datensatz |
| hilfreich | erleichtert den Weg, alternative Strategie ist möglich | alternative Route zulassen; nicht alle Hilfsknoten zuerst abprüfen |
| Darstellungsvoraussetzung | z. B. Skalenintervalle lesen | Zugang separat prüfen; symbolisches Können nicht dadurch abwerten |
| Unterrichtsfreigabe | Ziel wurde eingeführt oder ausdrücklich vorgezogen | bestätigt durch Unterrichtskontext/Lehrkraft; kein Ableiten aus bloßem Jahrgang |

Graphprüfung: keine unerklärten Zyklen harter Voraussetzungen, keine verwaisten freigegebenen Ziele, kein Erfolgstransfer gegen die Richtung einer Kante. Wer B12 löst, hat B04 damit nicht automatisch gezeigt. Bei Konflikten darf eine kurze Probe die weitere Übung klären; das System muss nicht die gesamte Vorgeschichte neu testen.

### Mathe 5–10 und Quali 9 schrittweise abdecken

Erste Priorität: Bruch-/Dezimal-/Prozentbeziehungen, Zahlvorstellung und Skalen, Grundoperationen und Gleichungen. Danach Größen/Einheiten, proportionale Zusammenhänge, Daten/Diagramme und Geometrie mit eigenen Fachmodellen. Für 9 folgen zusammengesetzte Aufgaben mit Datenwahl, Rechnung, Einheit und Plausibilität als getrennten Kriterien. Jahrgang 10 und M-Zug werden anhand ihrer eigenen Quellen zugeordnet; keine bloße Umbenennung von R9-Aufgaben.

„Quali“ ist eine Zusammenstellung freigegebener Zielhandlungen mit passenden Hilfsmittel- und Aufgabenbedingungen, keine neue Gesamtkompetenz. Ohne Taschenrechner selbst rechnen und mit freigegebenem Hilfsmittel modellieren können verschiedene Nachweise sein. Vor Einsatz prüft der Content-Owner den jeweils aktuellen amtlichen Prüfungsrahmen und die Unterrichtsfreigabe. Die [amtliche ISB-Einstiegsseite](https://www.isb.bayern.de/schularten/mittelschule/qualifizierender-abschluss/) ist dafür der Bezugspunkt. Dieses Konzept setzt keine Prüfungsdauer, Gewichtung oder amtlichen Notenschlüssel neu fest.

## 4. Anforderung, Unterstützung und Zugang unabhängig beschreiben

Jede Aufgabe bekommt ein mehrdimensionales Profil statt eines universellen Leicht/Mittel/Schwer-Werts. Die Zahlen-/Textvarianten eines Profils werden fachlich kalibriert; keine behauptete universelle Skala.

| Dimension | Beispiel niedrigere Anforderung | Beispiel höhere Anforderung |
|---|---|---|
| Beziehungen/Schritte | eine bekannte Beziehung anwenden | mehrere Beziehungen auswählen und verbinden |
| Gegeben/Gesucht | Zielnenner und Faktor gegeben | passende gemeinsame Darstellung selbst wählen |
| Darstellung | bekannte Darstellung lesen | Symbol, Fläche und Zahlengerade verbinden |
| Begründung | Ergebnis darstellen | fremde Behauptung mit Gegenbeispiel prüfen |
| Kontext/Modellierung | fachlicher Auftrag direkt | benötigte Daten wählen und Ergebnis zurückbeziehen |
| Zahlenstruktur | kompatible vertraute Zahlen | Vorzeichen, nichttriviale Faktoren oder Einheitenwechsel |
| Sprache | kurzer vertrauter Auftrag | fachlich relevante komplexere Beziehung; unnötige Leselast vermeiden |

Davon getrennt: `assistance` (keine, allgemeiner Hinweis, gezielter Impuls, Teilbeispiel, gemeinsam gelöst), `access` (Tastatur/Touch, Vorlesen, Zoom, Eingabealternative), `mode` (erkunden, unterstützt üben, unabhängig prüfen). Vorlesen einer Mathematikanweisung kann Zugang ermöglichen, während das Vorlesen des Zielworts eine Wortleseprüfung verändert. Deshalb entscheidet das konkrete Lernziel über die Bedeutung der Unterstützung.

Ein nächster Schritt ändert möglichst nur eine entscheidende Anforderungsdimension. Bei wiederholtem Scheitern wird eine echte Denkanforderung entfernt. Das bloße Wechseln von 3/4 zu 5/8 oder ein längerer Hinweistext sind keine belastbare Förderentscheidung.

## 5. Zwölf repräsentative Lernpfade für die ersten vier Werkzeuge

Dies sind prüfbare eigene Entwürfe, keine zwölf bereits abgenommenen Laufzeitpfade. Angegebene Jahrgänge sind Einsatzhypothesen bis zum konkreten Quellenmapping. Die Karten B01–B20 bleiben für Brüche führend. Deutsch nutzt die vorhandenen Fachziele; die Kürzel D1–D3 hier sind Tabellenreferenzen, keine zweite amtliche Taxonomie.

| Pfad | Ziel und Voraussetzung | Eigenständiger Einstieg | Fehlerklärung und Hilfe | Neue unabhängige Probe/Transfer |
|---|---|---|---|---|
| F1 Anteile, B02 | Anteil am festgelegten Ganzen; B01 gleiche Teile | 3/4 eines 12-Felder-Ganzen darstellen | 3 Felder gewählt: prüfen, ob Symbolzählung oder unklare Unterteilung; ein Viertel gruppieren, dann drei Viertel | 2/3 auf 15 Feldern in anderer Anordnung; keine Musteridentität fordern |
| F2 Wertgleichheit, B07 | Wert erhalten; B02 und Multiplikation | 2/3 in Sechstel umteilen, Symbol ergänzen | 2/6: getrennt fragen, was mit jedem Drittel geschieht; nur einen Teil in zwei Teilstücke zerlegen | 3/5 in Zehntel, danach gleiche Zahl auf Skala verorten; Flächen- und Symbolkriterium getrennt |
| F3 Addition, B11→B12 | gleiche Teile zusammenfassen; B07/B11 | 1/4 + 2/4 ohne vorgezeichnete Lösung | 3/8: Herkunft des Nenners klären; identisches Ganzes zeigen und Viertel zählen | 1/3 + 1/6 mit selbst gewählter Unterteilung; Symbolantwort ohne Bildhilfe nachschalten |
| N1 Bruch verorten, B04 | Einheit und Intervalle; B02 | 3/4 auf 0–1 mit Viertelteilungen setzen | bei 2. Teilstrich prüfen, ob Striche statt Abstände gezählt; Einheitsintervall markieren | 5/4 auf 0–2; geänderte Skalierung darf Einheit nicht verändern |
| N2 Zahlbeziehungen | Bruch/Dezimal/Prozent; B16/B17 | 0,4 und 40 % auf derselben Skala verbinden | getrennte Positionen: erst gleiche Einheit und Hundertstel klären, keine Prozentregel vorsagen | 3/5, 0,6 und 60 % ohne Markierung zuordnen; danach anderer Skalenbereich |
| N3 Größen/Intervalle | Maßstab und Einheit lesen; relevante Größenkenntnis | passenden Bereich zwischen 1,2 m und 1,8 m markieren | Mittelpunkt korrekt, Grenzen falsch: jede Grenze einzeln prüfen; Skalenabstand bestimmen | zwei Grenzen auf neuer Skala mit anderer Teilung; Einheitenwechsel nur als eigenes Kriterium |
| W1 Fehlender Wert | Gleichheit verstehen, Addition/Subtraktion | x + 3 = 8 an begrenzter Waage lösen | x=11: klären, welche Seite 8 insgesamt enthält; bekannte Gewichte sichtbar wegnehmen | x + 4 = 10 symbolisch; Probe durch Einsetzen; positive ganzzahlige Modellgrenze |
| W2 Gleiche Operation | Äquivalenz bewahren; W1 | 2x + 2 = 10 mit beiden Seiten operationell bearbeiten | nur links −2: vor/nachher Wertegleichheit prüfen; gleiche Operation bewusst auf beide Seiten | 3x + 3 = 15 ohne Waage lösen, Einsetzen; kein bloßes Nachklicken einer Animation |
| W3 Umformungsfehler | gültige Schritte erklären; W2 | falschen Schritt x + 5 = 12 → x = 17 erkennen und korrigieren | richtige Korrektur ohne Grund: zusätzlich eine kurze begründete Wahl, Ergebnis/Begründung getrennt | 2x + 4 = 14 mit anderem fremden Fehler; spätere Gleichung ohne Fehlerhinweis lösen |
| D1 Textbeleg/Wortschatz | Wort im Kontext verstehen, explizite Information finden | aus kurzem eigenen Text Beleg für eine Aussage markieren und knapp verbinden | thematisch passendes Wort ohne Belegfunktion: „Was erfahren wir genau?“; zwei Aussagen vergleichen | neuer Kurztext mit anderem Wortfeld und neuer Belegstelle; sinnvolle alternative Spannen akzeptieren |
| D2 Satzglieder/Grammatik | Satz als Sinneinheit; Wortart/Satzglied trennen | in einem kurzen Satz Subjekt und Prädikat zuordnen, dann Umstellung beurteilen | Nomen=Subjekt: Frage nach Handlungsträger und vollständiger Einheit, Umstellprobe mit klarem Satz | neuer Satz mit Subjekt aus mehreren Wörtern; keine Mehrdeutigkeit ohne geprüfte Alternative |
| D3 Rechtschreibkorrektur | konkrete Strategie, z. B. Verlängern | fehlerhafte Stelle markieren, korrigieren und Strategie kurz nennen | Wort richtig, Strategie unklar: gezielt verlängerte Form prüfen; kein vollständiges Diktat nachschieben | anderes geeignetes Wort im Satz korrigieren; später ohne markierte Fehlerstelle, Fund/Korrektur/Strategie getrennt |

Weitere Deutschaufgaben werden als eigene Familien angeschlossen: Wortbedeutung im Kontext erklären, bedeutungsgleichen Ausdruck passend einsetzen, Kasus/Kongruenz an begrenztem Satz prüfen, Wortstamm für Schreibentscheidung nutzen und kurze Frage mit Textbeleg beantworten. Offene Formulierungen erhalten wenige überprüfbare Kriterien und zulässige Alternativen. Zufällige Rechtschreibfehler in einer Belegantwort verändern die Bewertung des Textverständnisses nicht.

Die Waage darf im ersten Modell nur erlaubte Operationen/Zahlenräume zeigen. Negative Gewichte oder Division durch Variablen sind ohne eigenes Fachmodell ausgeschlossen. Die Grenzen werden nicht durch eine hübsche Animation aufgehoben. Die Zahlenstrahlfamilie muss in N3 beide Grenzen bewerten; ein korrektes Zentrum ist kein korrektes Intervall.

## 6. Beobachtung → Hypothese → Hilfe → Gegenprobe

Eine falsche Antwort erzeugt zunächst einen Befund, keine sichere Fehlvorstellung. Die nächste Entscheidung dokumentiert: beobachtetes Merkmal, plausible Alternativen, gewählte Klärung und erwarteten Unterschied zwischen den Hypothesen.

| Beobachtung | Mindestens zwei mögliche Ursachen | Gezielte Hilfe/Klärung | Prüfszenario und verbotener Schluss |
|---|---|---|---|
| 2/3 wird zu 2/6 | Zählererhaltung missverstanden; Zielauftrag überlesen | einen Drittelteil tatsächlich halbieren, neue Teilzahl nennen lassen | neues Verhältnis 3/4→?/8; nicht „versteht Brüche nicht“ speichern |
| 3/4 am falschen Strich | Striche statt Intervalle; Bedienziel verfehlt | Zahlenwert über zugängliches Feld wählen, danach Abstände klären | gleiche fachliche Aufgabe mit Tipp-/Tastaturweg; UI-Fehler zählt nicht als Mathefehler |
| Waage trotz richtiger Rechnung falsch | Darstellungs-/Serverzustand abweichend; ungültiger Schritt | Zustand und Aufgabe sperren, bestätigte Antwort erhalten | Renderer-/Modellparität prüfen; kein Lernstandsabzug wegen Technik |
| Beleg aus falschem Satz | Wortbedeutung unbekannt; Aussage/Beleg verwechselt | Zielwort klären, dann konkrete Aussage und zwei Belege vergleichen | neuer Text; nicht aus Wortschatzlücke allgemeines Leseurteil ableiten |
| Satzglied nur ein Wort | Wortart und Satzglied vermischt; Auswahloberfläche trennt Gruppe falsch | vollständige verschiebbare Einheit testen | neuer Satz mit mehrgliedrigem Subjekt; Auswahlmodell muss ganze Spanne erlauben |
| Richtige Korrektur abgelehnt | zulässige Variante fehlt; Grader irrt | neutral offenlassen, akzeptierte Varianten fachlich nachprüfen | Korrektur des Schlüssels als neue Version; keine Rohantwort ins globale Training |
| Viele Hilfeklicks, danach richtig | Hilfe sinnvoll genutzt; Aufgabe unklar; Lösung sichtbar | Hilfeereignisse prüfen und neue Aufgabe ohne Hinweis anbieten | unterstütztes Gelingen; weder Beherrschung noch niedrige Motivation ableiten |
| Keine Eingabe/lange Pause | Unterbrechung, Sprache, Technik, Nachdenken | Zustand sichern, freiwilliges Fortsetzen/Erklären ermöglichen | keine automatische Falschwertung oder Aufmerksamkeitsdiagnose |

Fehlerhypothesen besitzen Status `candidate`, `supported`, `contradicted` oder `resolved`, Geltungsbereich und Datum. Ein zweiter kontrastierender Beleg kann eine Vermutung stützen; auch dann bleibt sie korrigierbar. Die Lehrkraft und die betroffene Person können eine Fehlzuordnung melden. Widersprechende jüngere selbstständige Belege löschen nicht die Historie, verändern aber die aktuelle Empfehlung.

### Verbindlicher Ablauf pro Antwort

1. Aufgabe/Version und tatsächliche Antwort unverwechselbar zuordnen. Leere Eingabe, nicht erreichbare Lösung und Transportfehler trennen.
2. Modell-/Darstellungs-/Auftragskonsistenz prüfen. Bei Konflikt kein Kompetenzurteil erzeugen.
3. Fachlich sichere Kriterien deterministisch bewerten; offene Sprache anhand Rubrik beurteilen. Unsicherheit sichtbar lassen.
4. Bestätigtes Ergebnis und Hilfezustand idempotent sichern. Erzeugung einer Folgeaufgabe ist ein eigener Vorgang.
5. Bei richtigem eigenständigem Ergebnis eine passende anspruchsvollere oder variierte Probe anbieten. Keine ungefragte Vollerklärung.
6. Bei Fehler eine kurze Erklärung und eine beantwortbare Handlung. Nach zwei nicht hilfreichen Stufen neue fachliche Zerlegung oder Lehrkraftschritt; kein endloses Umformulieren.
7. Nach Hilfeerfolg ursprüngliche Beziehung wieder zusammensetzen und **neue** unabhängige Probe stellen. Später Transfer/Behalten prüfen.

Der offene `next-step-review`-Fehler darf einen sicher bewerteten Erfolg nicht zurücknehmen. Dass der Folgeentwurf nicht freigegeben wurde, ist kein Schülerfehler. Geprüfte Fundusaufgabe als Folge nur verwenden, wenn sie exakt zum offenen Lernschritt und Modus passt; sonst sichere Pause/Resume statt beliebiger Ersatzfrage.

## 7. Was im persönlichen Profil stehen darf

Das Profil ist eine aus Belegen abgeleitete, neu berechenbare Sicht. Es speichert keine psychologischen Wahrheiten. Pro Kompetenz: unbekannt, gerade geübt, unterstützt gezeigt, mehrfach selbstständig gezeigt, zeitversetzt bestätigt oder Klärung nötig. Jeder Zustand zeigt Umfang und Datum der Belege; kein fachübergreifender Prozentwert aus beliebigen Aufgaben.

Martins vorläufige Mindestregel bleibt: mindestens zehn verschiedene unabhängige Proben, davon mindestens acht richtig, geeignete Vielfalt und keine ungeklärten aktuellen Widersprüche. Hilfe-Mikroschritte, Wiederholungen derselben Aufgabe, identische Zahlenzwillinge und Lösungseinsicht zählen nicht als neue unabhängige Proben. Die Regel ist eine Produktannahme und kein wissenschaftlich validierter Diagnosegrenzwert. Ein anspruchsvollerer Lernschritt darf schon früher angeboten werden.

Zusätzlich wird für „zeitversetzt bestätigt“ mindestens eine spätere neue unabhängige Probe verlangt. Vorgeschlagene Pilotfenster: erste Wiederaufnahme nach 2–3 Tagen, danach nach 7–14 Tagen; bei Fehler kürzere gezielte Wiederaufnahme. Das sind veränderbare Planungswerte, kein universell optimaler Algorithmus. Ein Zeitsprung im Testprogramm prüft Fälligkeit, nicht menschliches Behalten. Bei zu wenigen Gelegenheiten bleibt das Urteil offen.

### Persönliche Anpassung ohne Lerntypetiketten

Erlaubt sind belegnahe Aussagen: „Bei dieser Skala gelang die Zahleneingabe; Ziehen war unklar“ oder „Nach Gruppierung gleicher Teile gelang eine neue Wertgleichheitsaufgabe“. Daraus darf GradeCrew vorläufig diesen Zugang anbieten und die Selbstständigkeit erneut prüfen.

Keine dauerhaften Labels wie visueller/auditiver Lerntyp, schwach, unmotiviert oder generell langsam. Keine Vermutung über Behinderung, Herkunft, Intelligenz, häusliche Hilfe oder Persönlichkeit aus Antworten/Klicks. Eine häufig gewählte Darstellung ist noch keine wirksamere Lernmethode.

Stabile Präferenzen werden nur optional und widerrufbar gespeichert: etwa ausdrücklich gewähltes Vorlesen oder bevorzugte Eingabealternative. Automatisch vorgeschlagene Präferenz frühestens nach wiederholter Beobachtung in mehreren Sitzungen und bestätigter Auswahl; Pilotannahme mindestens drei Situationen, keine wissenschaftliche Schwelle. Selbst dann bleiben alternative Darstellungen erreichbar und neue Ziele werden nicht auf diese Präferenz beschränkt. Nach vier Wochen ohne Bestätigung erneut prüfen; technische Notwendigkeit als Zugänglichkeit statt als Lerntyp behandeln.

## 8. Beobachtungstaxonomie und begrenzte Speicherung

Jedes Ereignis hat `eventId`, pseudonyme Besitzerbindung, Task-/Familien-/Kompetenzversion, Sitzungs-ID, Quelle, Zeitpunkt, Modus und serverseitige Bestätigung. Beobachtung und Interpretation liegen getrennt. Kompakte semantische Zustände reichen; keine Mauspfade, Tastendruckfolgen oder Videoaufzeichnungen für die Diagnose.

| Klasse | Beispiele | Verwendungszweck |
|---|---|---|
| Antwortbeleg | Erstabgabe, Ergebnis-/Verfahrenskriterium, unklar, teilweise richtig | fachliches Profil nur bei gültiger Aufgabe |
| Hilfebeleg | Hilfe angefragt, Stufe angezeigt, Lösung eingesehen, gemeinsam bearbeitet | Unabhängigkeit und passende nächste Probe |
| Modellhandlung | Anteil gesetzt, Grenze gewählt, gleiche Operation auf beide Seiten angewandt | beobachtbare fachliche Handlung; kein Urteil aus beliebigem Drag |
| Zugangsproblem | Eingabe nicht erreichbar, Audio fehlt, Auswahlverlust, Layoutabweichung | Zugang reparieren; Kompetenzzählung aussetzen |
| Aufgabenproblem | mehrdeutiger Text, falscher Schlüssel, Quellenkonflikt | konkrete Version quarantänisieren und prüfen |
| Systemproblem | Timeout, Retry, konkurrierende Revision, fehlender Folgeentwurf | Wiederaufnahme; kein Falschbeleg |
| Selbstauskunft | „Wort unbekannt“, „versehentlich geklickt“, gewünschter Zugang | begrenzte Hypothese/Präferenz; nicht ungeprüft bewerten |
| Zeitbezug | Transferprobe, spätere Wiederaufnahme, aktuelle Gegenbelege | Behalten/Unsicherheit; Zeitdauer selbst ist keine Leistung |

**Vorgeschlagene konfigurierbare Prototypfrist: 30 Tage** für erforderliche private Rohantworten und kurzlebige Diagnosekontexte. Standard ist, Rohtexte gar nicht dauerhaft zu übernehmen, wenn ein kompaktes Kriterium reicht. Die 30 Tage sind ein technischer Entwurfswert, keine Feststellung einer rechtlich zulässigen Schulfrist. Verantwortliche legen Zweck, Rechtsgrundlage und tatsächliche Fristen vor realem Pilot fest. Schulische Leistungsnachweise bleiben in ihrem eigenen bestehenden Aufbewahrungsweg; das Lernprofil kopiert sie nicht unbegrenzt.

Kompakte abgeleitete Belege werden für den bestätigten Lernzweck begrenzt gehalten, beispielsweise bis Ende der Pilotphase mit ausdrücklich festgelegtem Löschdatum. Nach Rohdatenlöschung verbleiben nur notwendige Kriterien/Versionen; detaillierte Nachbewertung kann dann unmöglich sein und wird so gekennzeichnet. Profilableitungen werden bei Berichtigung, Widerruf einer ungültigen Aufgabe oder Kontolöschung neu berechnet/gelöscht. Keine dauerhaften Rohantworten im Ereignis-, Fehler-, Provider- oder Analyticslog. Löschjobs, Wiederherstellungen und Backups brauchen nachgewiesene Fristen; ein TTL-Feld allein ist kein Löschbeleg.

### Sichtbarkeit und Weiterverwendung

| Bereich | Zugriff | Übertragbare Inhalte |
|---|---|---|
| private aktuelle Übung | betroffene verifizierte Identität; autorisierte Laufzeit | erforderliche Aufgabe, Antwort und Hilfekontext |
| privates Dauerprofil | Person; aktuell berechtigte Lehrkraft im bestätigten Kursumfang | kompakte Lernbelege und begründete Empfehlungen |
| Qualitätsprüfung | ausdrücklich berechtigte Reviewer, getrennte Zweckfreigabe | bevorzugt synthetischer reproduzierbarer Fall; Rohantwort nur wenn notwendig/freigegeben |
| pseudonyme Kohortenanalyse | freigegebene Rolle und Zweck | Aufgabenversions-/Kriteriumsstatistik ohne direkte Kennung; pseudonym bleibt schutzbedürftig |
| übergreifende Aggregate | gesonderte Freigabe, Mindestgruppen und Unterdrückung kleiner Zellen | keine Freitexte, Namen, IDs oder selten identifizierenden Kombinationen |
| öffentlicher Fundus | nur freigegebene eigene Inhalte | keine Schülerantworten und privaten Originalmaterialien |

Für den Prototyp bleibt schulübergreifende/global geteilte Auswertung standardmäßig aus. Als vorsichtiger Kandidat für freigegebene Aggregate: mindestens zehn verschiedene Personen je Zelle, keine Kombinationen, die kleine Gruppen zurückrechnen lassen; diese Zahl allein anonymisiert Daten nicht. Klassen-, Schul- und Nutzergrenzen serverseitig erzwingen. Keine automatische globale Freigabe aus der bloßen Teilnahme an einer Übung.

## 9. Fundus: aus wenigen guten Aufgaben viele verlässliche Wege machen

Der Fundus trennt Quelle, didaktisches Muster, Aufgabenfamilie und konkrete Aufgabe. Eine Quellenanalyse darf neue Muster anregen; nur die geprüfte eigene Aufgabe wird im erlaubten Modus angezeigt. Die bereits freigegebenen 53 Startprofile bleiben ihr eigener Stand. Neue Metadaten/Seitenanalysen erhalten dadurch keine automatische Laufzeitfreigabe.

### Herkunft und unveränderliche Versionen

Jede Aufgabe referenziert Kompetenzrevision, Familienrevision, Quellenanker mit Hash/Datum und Rechte-/Nutzungsstatus, Generator-/Promptversion, Modell-/Reviewerstand soweit bekannt, Fachmodell-/Renderer-/Rubrikversion, konkrete Zahlen-/Textparameter, Prüfentscheidungen und erlaubten Modus. Eigene Ableitung und übernommener Inhalt sind getrennt. Private Content-IDs ersetzen eine öffentliche Buchkopie. Ein Rubrik- oder Schlüsselwechsel erzeugt eine neue Version; alte Abgaben werden nicht stillschweigend umgedeutet.

Versionen können gezielt rückwirkend als ungültige Evidenz markiert werden, wenn z. B. ein falscher Schlüssel entdeckt wird. Dann werden betroffene Profile neu berechnet und Empfehlungen berichtigt. Der frühere Bewertungsstand bleibt für berechtigte Nachvollziehbarkeit kenntlich, solange die Fristen dies tragen. Kein unveränderlicher Lebenslauf einer falschen Diagnose.

| Status | Bedeutung | Zulässige Nutzung / nächstes Gate |
|---|---|---|
| seed | von Fachpersonen kuratiertes Muster oder Ausgangsaufgabe | noch kein automatischer Schülerlauf; Herkunft/Lösung/Modus prüfen |
| generated | daraus erzeugter konkreter Kandidat | nur interne Prüfung, kein unabhängiger Kompetenzbeleg |
| double_checked | strukturell und fachlich gegengeprüft; Konflikte geklärt | definierter Testmodus nach zusätzlicher Runtimefreigabe; KI-Gegenprüfung ist keine Lehrkraftfreigabe |
| sampled | zusätzlich im begrenzten Pilot fachlich/visuell und anhand echter Fälle geprüft | freigegebener Geltungsbereich; Stichprobenumfang sichtbar |
| quarantined | konkreter Verdacht auf unlösbare/irreführende Version | sofort aus neuer Auswahl; offene Sessions sicher beenden/ersetzen |
| retired | abgelöst, überaltert oder ungeeignet | keine neue Auswahl; historische Referenz für erlaubte Frist erhalten |

„Seed“ ist Herkunft, „double_checked“ ein Prüfstand; in der Umsetzung separate Felder verwenden, damit ein kuratiertes Seed nach Prüfung Seed bleiben kann. Freigabe ist zusätzlich explizit (`allowedModes`, Zielgruppe, Umgebung, Reviewer, Datum). Eine hohe Lösungsquote oder ein positiver KI-Kommentar setzt sie nicht automatisch.

### Auswahl- und Rückgabepolitik

1. Zuerst harte Filter: erlaubte Quelle/Rechte, freigegebene Version, Fach/Kompetenz, Region/Schulart/Zug, Unterrichtskontext, Zahlen-/Sprachraum, verfügbares Medium/Adapter und Modus. Unbekannte Pflichtmetadaten führen zum Ausschluss des Kandidaten, nicht zu erfundener Zuordnung.
2. Danach didaktischer Match: offene Voraussetzung oder Fehlerfrage, geplante Eigenleistung, Anforderungsprofil und passende Hilfestufe. Zugängliche Antwort muss dieselbe fachliche Handlung erlauben.
3. Diversität: andere Zahlenstruktur, Kontext, gefragte Größe und Darstellung nur soweit zielgerecht. Derselbe Lösungsalgorithmus mit anderen Zahlen ist kein eigener Transferweg. Mindestens drei geeignete Varianten je Startpfad; vor 8/10-Nachweis ausreichenden unabhängigen Pool bereitstellen. Ist die Vielfalt erschöpft, kein Beherrschungslabel aus Duplikaten erzeugen.
4. Wiederholung steuern: bekannte konkrete Aufgabe innerhalb derselben Diagnosereihe ausschließen; nach Lösungseinsicht bei Wiederaufnahme neue Aufgabe wählen. Wiederholtes Original darf bewusst üben helfen, erhält aber keinen neuen unabhängigen Beleg. Varianten erhalten eine gemeinsame `isomorphGroup`, um Mehrfachzählung zu vermeiden.
5. Bei fälligem Wiederholen neue passende Probe bevorzugen, nicht stets neue Themen. Themenwunsch und Lehrkraftauftrag dürfen die Vorschläge ändern; Gründe bleiben sichtbar.
6. Nach Verwendung nur inhaltsfreie Auswahl-/Qualitätsmetadaten an den Fundus zurückgeben, soweit freigegeben. Lernantwort bleibt privat. Defektverdacht meldet Version/Fehlerklasse; Rohtext wird nicht automatisch „zur Verbesserung“ exportiert.
7. Kein passender geprüfter Kandidat: begrenzt neuen Entwurf erzeugen und prüfen oder offen pausieren. Keine fremde Familie nur deshalb verwenden, weil sie verfügbar ist.

## 10. Kohorten verbessern Aufgaben, ohne Kinderantworten zu Trainingsdaten zu machen

Zulässige Frage: „Bei genau dieser Aufgabe fällt eine bestimmte Gruppe trotz belegter Voraussetzung häufiger aus, und eine neue Version könnte den Auftrag klären.“ Unzulässiger Kurzschluss: „Viele klicken richtig; daher ist die Hilfe gut“ oder „Viele liegen falsch; daher fehlt den Kindern die Kompetenz“.

Ein Kandidatenbericht enthält Versionsumfang, Zahl unterschiedlicher Lernender, Jahrgang/Zug/Unterrichtsstatus nur im erlaubten Aggregat, unabhängige gegenüber unterstützten Antworten, technische Fehler, Auslassungen, beobachtete Alternativlösungen, Unsicherheit und mögliche Verzerrungen. Unterschiede können durch Auswahl, Unterstützung, Vorwissen oder Anzeige entstehen. Kleine Gruppen und nicht vergleichbare Aufgaben erlauben keine robuste Überlegenheitsbehauptung.

Beispiel: Bei N1 liegen viele Antworten genau um einen Teilstrich daneben. Zuerst Skala, Touchziel und Aufgabenwortlaut prüfen. Dann synthetische Grenzfälle reproduzieren. Erst wenn technische und inhaltliche Fehler geklärt sind, eine didaktische Variante entwerfen. Ein bestätigter Darstellungsfehler wird korrigiert und die betroffene Evidenz ungültig; dafür wartet man nicht auf ein Experiment mit Kindern.

Verbesserungsweg: Befund → begrenzte Hypothese → eigene neue Aufgaben-/Hilfeversion → deterministische und unabhängige Fachprüfung → Runtime-/Darstellungsprüfung → ausdrücklich freigegebener kleiner Pilot → spätere unabhängige Transfer-/Behaltensprobe → dokumentierte Entscheidung. Keine automatische Promptänderung, Poolpromotion oder Modellnachschulung. Auch die verworfene Variante und das Entscheidungsargument werden erhalten, damit dieselbe erfolglose Idee nicht erneut teuer probiert wird.

## 11. Lernwirkung prüfen: eigenständig, später, übertragen

Primäres Zielkriterium ist die fachliche Qualität neuer unabhängiger Antworten. Ausgewiesen werden Kompetenz/Teilhandlung, Zahl unterschiedlicher Aufgaben und Personen, Version, Hilfebedingung, zeitlicher Abstand und offene Fälle. Unterstützter Soforterfolg ist ein Zwischenergebnis; Bearbeitungszeit, Klicks, Sitzungsdauer, Streak und Selbstauskunft sind keine Ersatzmaße für Lernen.

| Prüfart | Konkrete Frage | Aussagegrenze |
|---|---|---|
| unmittelbare Rückkehr | gelingt nach Hilfe eine neue Aufgabe ohne Hinweis? | kurzfristige Anwendung, noch kein Behalten |
| naher Transfer | gelingt gleicher Kern bei anderer Darstellung/gesuchter Größe? | kein Beweis für beliebige Sachaufgaben |
| Behalten | gelingt neue Probe nach tatsächlichem zeitlichen Abstand? | Ausfälle/Nichtteilnahme nicht als falsch zählen |
| weiterführender Transfer | gelingt passende Verbindung mit einem weiteren bekannten Ziel? | beide Voraussetzungen und getrennte Kriterien beachten |
| fachliche/faire Bewertung | stimmen Urteil und unabhängige Fachsicht überein? | Fehlerklassen und unklare Fälle zeigen; keine 99,99-%-Aussage aus kleinem Set |

Vor einem Methodenvergleich werden Ziel, Vergleichbarkeit, Auswertung und Stopgründe festgelegt. Bei ausreichender organisatorischer Freigabe kann eine Lehrkraft Varianten kontrolliert vergleichen; ohne Vergleichsgruppe und passende Ausgangsdaten bleibt eine beobachtete Verbesserung beschreibend. Kein kausaler Wirksamkeitsnachweis aus einem Vorher/Nachher-Balken. Negative/unklare Ergebnisse erhalten denselben Platz wie positive.

## 12. Wiederverwendung der bestehenden visuellen Verträge

[PR265](https://github.com/HerrLoeffler/Hausaufgabe/pull/265) wurde read-only über Beschreibung, Dateiliste und den Kernvertrag am abgefragten Head `1ce20d9630d82209316ab7ab13764c4ee158f20f` gelesen. Sein versioniertes `visualTask` trennt `spec` und `solution`, prüft stabile IDs und erlaubte Formate, entfernt Lösungen aus dem öffentlichen Prüfauftrag und nutzt den vorhandenen serverseitigen Attempt-/Submissionweg. Der Plan nennt exakt diese Wiederverwendung und keine freie HTML-Ausführung.

Für diese Werkstatt konkret nutzbar: VIS05 Flächenraster, VIS03 Skalen, VIS10 Textbelege, VIS13 Korrektur sowie VIS02 für geeignete Satzgliedzuordnung. VIS11 unterstützt im gelesenen Kern **geschlossene** Intervalle; offene Endpunkte sind damit nicht freigegeben. `evidence` akzeptiert definierte alternative Tokenmengen, ersetzt aber keine offene semantische Begründungsbewertung. Bei `correction` sind Fundstelle und akzeptierte Korrektur getrennt vorhanden; eine Strategieerklärung braucht ein zusätzliches Rubrikkriterium. Die Waage benötigt ein neues begrenztes Fachmodell, keinen behaupteten vorhandenen VIS-Waageadapter.

Der PR-Bericht dokumentiert Online-/Servernachweise in einer getrennten Vorschau, aber auch offene Browserdialog-/Touch-/Geräte-/Integrationsgrenzen. Diese fremden Tests wurden hier nicht erneut ausgeführt. Der aktuelle Status eines PR oder ein vorhandener Renderer sind kein Beweis, dass der Lerngehirn-Kandidat denselben Vertrag bereits korrekt verwendet.

## 13. Tatsächlicher Loginbefund und fehlende Schüleranbindung

Read-only geprüft am lokalen Kandidaten: `functions/lib/learning-brain/contracts.js`, `callables.js` und `service.js`. Das Gate ist auf `gradecrew-staging-2026` begrenzt. Es verlangt `request.auth.uid`, ein aktives `users/{uid}`-Profil und erlaubt inzwischen Rollen `student`, `teacher`, `admin`; gelöschte/gesperrte Konten werden abgewiesen. Aufrufdaten dürfen keine fremde `uid`, `studentId` oder `ownerUid` wählen. Gespeichert wird unter `users/{uid}/aiRuntime/learningBrain`, mit kompakteren Themenbelegen in Unterdokumenten. Das ist eine reale eigene UID-Grenze im Kandidaten, keine bestätigte vollständige StudentIdentity-Anbindung.

Die gelesene Classroom-Übergabe auf main (`fdf6f544`, historisch vom 05.10.) beschreibt persönliche Codes, pseudonyme StudentIdentity, Memberships und serverseitige Classroom-Autorisierung als Zielarchitektur und damalige Planungsstufe. Sie beweist nicht den heutigen tatsächlichen Loginstand eines anderen Branches. Ein zusätzlicher Dateiabruf von `secure-assessment-client.js` auf main lieferte 404; die untersuchte Main-Baumansicht enthielt hierzu die Planungsdokumente, keinen damit bestätigten Laufzeitadapter. Daraus folgt keine Aussage, dass der Adapter auf dem tatsächlichen App-/Classroom-Branch fehlt. Die aktuelle mobile/Schulverwaltung und frische Integration müssen separat vom verantwortlichen Owner bestätigt werden. Ein Schülerzugang zu einem einzelnen Secure Assessment ist außerdem nicht automatisch ein dauerhafter Lerngehirn-Account.

Vor echtem Mehrschülerpilot fehlen als zusammenhängende Nachweise: Zuordnung des regulären Schülerlogins zur kanonischen StudentIdentity und diesem Besitzerpfad, Trennung von Gast/Pseudonym/Lehrkraftdemo, Kurs-/Schulberechtigung der Lehrkraftsicht, Logout/Profilwechsel auf gemeinsamem Gerät, Mitgliedschaftsentzug, Kontolöschung, Resume und zwei gleichzeitig getrennte Personen. Ein Alias, Name, QR-Parameter, Gerät oder IP darf keine automatische dauerhafte Identitätsverknüpfung schaffen. Keine gemeinsame Teacher-UID für reale Kinder. Aktuell erlaubt die Rollenliste Studenten technisch; das ist noch keine Aussage „Schülerrollout bereit“.

## 14. Abnahmegates und gestufter Lehrkraftpilot

| Gate | Konkreter Nachweis | Stoppt welchen Umfang? |
|---|---|---|
| A Inhalt | Kompetenzkarte/Quelle, Lösung/Alternativen, Anforderungs-/Hilfematrix und Quellenrechte je Version | nur betroffene Aufgabe/Familie |
| B Fachmodell | gültige/ungültige/mehrdeutige Antworten, Grenzfälle und Renderer-/Serverparität | betroffener Adapter |
| C Didaktik | zwölf Pfade mit Fehlerklärung, echter Anforderungsreduktion und neuer unabhängiger Probe | Behauptung einer zusammenhängenden Viererwerkstatt |
| D Schutz/Identität | zwei Personen, Kursrechte/Entzug, privater Schlüssel, Idempotenz, Löschung/Retention | realer Mehrschülerpilot |
| E Laufzeit | exakter Quellstand, echte KI, Resume, Folgefehler ohne Ergebnisverlust, Hosting/Functions getrennt | jeweiliger veröffentlichter Kandidat |
| F Bedienung | tatsächliche Zielgeräte, Touch/Tastatur, kleine Displays und verständliche deutsche Aufträge | freigegebener Geräteumfang |
| G Lernbeleg | neue eigenständige Transfer- und zeitversetzte Proben, offene Fälle sichtbar | Aussage über Lernen/Beherrschung |

Phase 0: Fachliche Referenzen mit synthetischen Antworten und allen oben genannten Fehler-/UI-Fällen. Lehrkraft prüft kleine Auswahl der zwölf Pfade und zulässige Lösungen. Keine Schülerkonten erforderlich.

Phase 1: Lehrkraft testet die getrennte Vorschau mit synthetischer Identität; konkret richtige, falsche, geholfene und technisch blockierte Schritte. Pro Familienpfad Beleg sichern, keine pauschale Freigabe aller 5–10-Themen.

Phase 2: Nach Identitäts-/Zweck-/Fristen-/Gerätefreigabe kleiner begleiteter Schülerpilot mit genau benannten Zielen und freiwillig/organisatorisch zulässigem Ablauf. Lehrkraft kann Bewertung korrigieren, Hilfe stoppen und normalen Unterricht fortsetzen. Gruppengröße/Dauer werden mit realem Kontext festgelegt; hier kein erfundener Studienplan.

Phase 3: Tatsächliche spätere Wiederaufnahme und neue Transferaufgaben. Ergebnisse getrennt nach unterstützter und unabhängiger Leistung auswerten. Erst danach Aufgabenvarianten und Profilregeln erweitern. Breiterer Testrollout braucht neue Abdeckungsmatrix und eigene Freigabe; Production bleibt ausdrücklich genehmigungspflichtig.

Pilotstop bei sicher falschem Schlüssel, lösungsverratender Ansicht, falscher Personenbindung oder systematisch irreführender Darstellung. Ein einzelner klar begrenzter Inhaltsdefekt quarantänisiert seine Version, nicht automatisch jedes unabhängige Werkzeug. Korrektur und Profilbereinigung vor Wiederfreigabe belegen.

## 15. Forschungs- und Lehrplanbezug mit begrenzten Aussagen

Der [EEF-Leitfaden Mathematik KS2/3](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3) ist eine Grundlage für fachbezogenes Vorwissen und gezielte Förderung; sein Kontext ist britischer Mathematikunterricht. Er ist keine umfassende Anleitung für alle Jahrgänge und keine Evaluation dieses Produkts.

Der [IES/WWC-Bruchleitfaden](https://ies.ed.gov/ncee/WWC/PracticeGuide/15/Published) begründet hier den Zahlenstrahl und verständnisbezogene Rechenverfahren. Die Quelle unterscheidet Evidenzstärken ihrer Empfehlungen. Sie bestätigt weder unsere zwölf Pfade noch eine individuelle Beherrschungsschwelle. Der [IES-Leitfaden zu Unterricht und Lernen](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) stützt verteilte Wiederaufnahme und aktiven Abruf; die konkreten Pilotabstände bleiben lokale überprüfbare Annahmen.

Amtliche Anker sind die vorhandenen [Fachpläne Mathematik 5](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/5/mathematik), [Mathematik 6](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/6/mathematik), [Mathematik 9](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/9/mathematik), [Deutsch 6](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/6/deutsch) sowie der ISB-Quali-Einstieg. Direktabrufe von M9 und D6 scheiterten am 22.10. in diesem Rechercheweg (nicht erreichbar/403). Daher keine neue vollständige amtliche Inhalts-/Fassungsprüfung behaupten. Vor jeder Laufzeitfreigabe konkrete Abschnittsanker aus dem vorhandenen Register gegen zugängliche amtliche Fassung bestätigen; fehlende Zuordnung sichtbar offen lassen.

## 16. Übergabe und nächster ausführbarer Schritt

Der ursprüngliche Konzeptbeitrag wurde lokal erstellt; inzwischen ist er Bestandteil des vom ausführenden Root-Agenten gesicherten Implementierungskandidaten. Dessen Commits, getrennte Testdeployments und laufende echte KI-Prüfungen haben einen eigenen Nachweisstand in der Aufgabenübergabe. Die frühere pauschale Aussage „keine Commits oder Deployments“ beschreibt deshalb nicht mehr den gesamten Workstream. Dieser Dokumentationsnachtrag verändert ausschließlich diese Konzeptdatei; er startet selbst keinen Commit, Provideraufruf oder Deploy. Private Quellen und Analysen bleiben unverändert. Bestehende Task-, Budget- und Versuchshistorie wird nicht ersetzt. Tatsächliches Runtime-Modell, Aufwand und Nutzungskosten dieses Dokumentbeitrags sind unbekannt.

Nächster Schritt: Die laufenden echten Prüfungen abschließen und ihre Ergebnisse mit Quellstand, Umgebung und Request-/Prüfbelegen in der vorhandenen Aufgabenübergabe sichern. Danach die zwölf Pfade mit konkreter Taskversion, Kompetenzanker, Rubrik, zwei Hilfestufen und neuer unabhängiger Probe abgleichen. Offene Fehler bleiben offen, bis ihr korrigierter Ablauf tatsächlich geprüft wurde. Die Identitätsabnahme ist weiterhin ein separates Gate vor einem realen Schülerpilot.

## 17. Implementierungsstand des ersten Pakets (22.10., Teilabnahme läuft)

Vier Adapter sind im eigenen Kandidaten verbunden: `fraction-board`, `number-line`, `balance` und `text-workbench`. Die Renderer greifen die vorhandenen VIS03/05/10/13-Verträge auf; `visual/renderers.js` aus PR265 wurde gelesen. Die Waage ist ein neues begrenztes Fachmodell, keine allgemeine Physiksimulation. Die Erweiterung nutzt dieselbe Identität, denselben Lehrplankatalog und dieselbe KI-/Prüfkette. Daraus folgt keine fachliche Abnahme aller 51 Sprach-/Mathe-Unterkompetenzen.

Private Versuchsdokumente liegen unter `users/{uid}/aiRuntime/learningBrain/attempts/{eventId}`, begrenzt auf maximal 60 Einträge mit 30-Tage-Ablauffeldern. Eine automatische physische TTL-Löschung ist noch **nicht konfiguriert oder belegt**. Überzählige oder abgelaufene Indexeinträge werden beim nächsten Schritt bereinigt. Der `pendingNext`-Rohkontext wird bei Profil-, Start- oder Turnzugriff nach 30 Tagen entfernt. Ein TTL-Feld und diese Bereinigung bei Zugriff ersetzen keinen zeitgesteuerten Löschjob. Vor realem Schülereinsatz bleibt dessen Nachweis offen. Die bestehende Kontolöschung entfernt `aiRuntime` rekursiv.

Der erste Runtimefundus ist absichtlich kontoprivat: `users/{uid}/aiRuntime/learningBrain/taskPool/{AnforderungsHash}/candidates/{AufgabenHash}`. Er hält maximal 32 Kandidaten je Lernziel-, Anforderungs- und Versionskontext. Geprüfte eigenständige Übungsaufgaben können ohne erneuten Generierungsaufruf wiederverwendet werden. Rohantworten und Schüleridentitäten werden dabei nicht in kontenübergreifende Aufgaben übertragen. Die globale Freigabe-/Promotionsstrecke, Kohortenauswertung und Modelltraining bleiben ungebaute Folgeschritte. Die Fachbewertung einer Antwort nutzt weiterhin echte KI und passende exakte Fachprüfungen.

Die Planung trennt Erweitern, Kürzen, Bruchaddition/-subtraktion, Bruchoperationen, Anteile und Vergleiche. Ein Erweiternplan ist keine universelle Bruchdidaktik. Höhere Mathe-/Quali-Pfade bleiben ziel- und quellengebunden zu prüfen. Bei Deutsch sind kurze Wortschatz-, Grammatik-, Rechtschreib- und Textbelegziele vorgesehen. Aufsätze sind ausgenommen; Hörkompetenz bleibt ohne tatsächlichen Medienweg ausgeschlossen. Die technische Zulassung der Rolle `student` belegt weiterhin keine vollständige Anbindung realer Schülerkonten oder Bereitschaft zum Schülerrollout.

## 18. Konkrete Defekte, Qualitätslernen und laufende Abnahme

Die folgenden Fälle stammen aus den vom ausführenden Root-Agenten berichteten echten KI-/UI-Prüfungen der getrennten Testumgebung. Diese Tabelle hält den beobachteten Teilpfad fest; sie behauptet weder eine abgeschlossene Viererabnahme noch die erfolgreiche Liveprüfung inzwischen vorbereiteter Korrekturen. Maßgeblich bleiben die konkreten Laufbelege und Quellstände in der Aufgabenübergabe.

| Werkzeug/Fall | Tatsächlich berichteter Befund | Zulässige Aussage und nächster Prüfschritt |
|---|---|---|
| Waage: `2x + 3 = 11` | Falsches `x = 1` → Mikrofrage zum beidseitigen Abziehen von 3 → weiterer Fehler → Mikrofrage `11 − 3` → Antwort 8 → Rückkehr zur Ausgangsaufgabe → `x = 4` wurde durch echte KI als richtig bewertet. Im UI wurden außerdem Subtraktion auf beiden Seiten und Division durchgeführt. | Der konkrete Hilfe-/Rückkehrpfad und der Zahlenwert sind belegt. Noch kein unabhängiger späterer Transfer oder Behaltenstest. Auftrag und tatsächlich bewertetes Ziel müssen deckungsgleich bleiben. |
| Zahlenstrahl: `3/4` | 3/4 wurde richtig bewertet. Nach behobener Folgegenerierung musste die Schrittweite aus dem 2. Strich = 1/3 und 6. Strich = 4/3 erschlossen werden. Zwei Fehler führten zum Zählen der Abstände, danach zu einem einzelnen Abstand; nach richtiger 1 kam die Originalfrage zurück, 5/6 wurde richtig bewertet und eine neue unabhängige Probe bereitgestellt. | Richtiger Antwortbeleg bleibt erhalten. Der konkrete Folgepfad ist mit synthetischer Identität geprüft; späteres Behalten und weitere Skalen bleiben offen. Eine Generierungsblockade ist kein Schülerfehler. |
| Bruchwerkstatt: `2/3 → Sechstel` | Die Unterteilung wurde von 3 auf 6 geändert, aber nur 2 Teilstücke blieben markiert (2/6). Nach mehreren blockierten Hilfekandidaten führte der korrigierte echte KI-Pfad zu 2·2, nach weiterem Fehler zu 2+2, danach zu 1+2. Die richtige 3 führte zurück zum Originalmodell; 4/6 wurde im Browser richtig bewertet und eine neue unabhängige Anteilsaufgabe bereitgestellt. | Der Ansatz erfordert die genaue Trennung zwischen gesuchter Teilanzahl, Zähler und vollständigem Bruch. Der konkrete Rückkehrpfad ist geprüft. Die ursprünglich blockierten Kandidaten bleiben als Qualitätsfehler dokumentiert; kein Nachweis aller Bruch-Unterkompetenzen. |
| Textauswahl: erste Aufgabe | Die Instruktion verriet die gesuchte Textstelle „Am Morgen“. | Diese erste Antwort ist kein unabhängiger Lernbeleg. Neutralen Auftrag erzeugen und den verräterischen Kandidaten ablehnen beziehungsweise begrenzt reparieren. Erst eine neue passende Aufgabe ohne Antwortverrat darf einen unabhängigen Beleg liefern. |

### Neutrale Textinstruktion statt vorweggenommener Auswahl

Eine Auswahlaufgabe darf beispielsweise fragen, welche Stelle eine Zeitangabe enthält; sie darf die richtige Stelle nicht zugleich wörtlich als zu markierende Lösung nennen, wenn genau deren Erkennen geprüft werden soll. Die Qualitätsprüfung muss `prompt`, `contextText`, Werkstattinstruktion und sichtbaren Text gemeinsam betrachten. Der beobachtete „Am Morgen“-Kandidat ist als Aufgabenfehler zu behandeln, nicht als besonders leicht gelernte Kompetenz. Der Reparaturweg verwirft den Kandidaten, nennt den konkreten Prüfgrund und prüft einen neuen Entwurf. Ein erster unterstützter oder verratener Treffer wird dabei nicht rückwirkend als unabhängig gezählt.

### Waage: Zahlenwert und Gleichgewicht sind der begrenzte Antwortvertrag

Bei `goal=balance` ist das bewertete Ziel, den passenden Wert von `x` zu finden und damit Gleichgewicht herzustellen. Gleiche Operationen auf beiden Seiten sind verfügbare Denk- und Prüfhilfen. Eine verpflichtende Isolation von `x` ist ohne eigenes bewertetes Endzustandskriterium kein Bestandteil dieses Ziels. Deshalb passt etwa „Finde x. Stelle das Gewicht so ein, dass beide Seiten gleich schwer sind.“ Der beobachtete Auftrag „Verändere die Waage so, dass x allein übrig bleibt“ verlangt dagegen mehr, als eine reine Zahlenwertbewertung belegt.

Generator und Reviewer müssen diesen gemeinsamen Vertrag bei neuen Kandidaten beachten. Ein richtig eingestelltes `x=4` belegt den Zahlenwert; erst ein gesondert bewerteter Umformungsweg würde die verlangte Isolation belegen. Der tatsächlich durchgeführte vollständige UI-Pfad erfüllt zwar beide Anforderungen, rechtfertigt aber keine pauschale Freigabe künftiger widersprüchlicher Aufträge. Die korrigierte Auftragssteuerung gilt erst nach ihrem eigenen echten Prüflauf als bestätigt.

### Bruchhilfe: Teilanzahl, Zähler und Bruchwert unterscheiden

Eine Mikrofrage wie „Wie viele kleine Teile hat das Ganze jetzt?“ verlangt bei einer Unterteilung in Sechstel die Zahl 6. „Wie viele davon sind markiert?“ verlangt bei `2/3 = 4/6` die Zahl 4. „Welcher Bruch ist dargestellt?“ verlangt `4/6` beziehungsweise eine gemäß Auftrag zulässige wertgleiche Form. Diese drei Antwortverträge dürfen nicht denselben vollständigen Bruchschlüssel erzwingen. Eine Werkstatt als alleiniger Antwortweg liefert typischerweise den dargestellten Bruch; eine reine Zählfrage braucht deshalb einen dazu passenden Zahleneingabeweg und Schlüssel. Als unterstützende Darstellung kann dieselbe Werkstatt sichtbar bleiben.

Der Reviewer prüft die ausdrücklich gefragte Größe, das sichtbare Ganze, die Unterteilung, den Antwortweg und den privaten Schlüssel gemeinsam. Eine falsch spezifizierte Mikrofrage wird repariert, ohne daraus einen zusätzlichen Kompetenzfehler abzuleiten. Vor einer Erfolgsaussage sind die neue Mikrofrage, ihre richtige Zahlantwort und die anschließende Rückkehr zur selbstständigen Bruchprobe tatsächlich zu prüfen.

### Sicherer Checkpoint und private Prüfgründe

Bestätigte Antwortbewertung und Erzeugung der nächsten Aufgabe bleiben getrennte Schritte. Ein gespeicherter richtiger oder falscher Befund darf bei einer abgelehnten Folgeaufgabe nicht verschwinden. `pendingNext` bezeichnet die ausstehende Bereitstellung; Wiederaufnahme prüft nur den nächsten Schritt, statt dieselbe Antwort erneut zu bewerten oder einen zweiten unabhängigen Beleg zu zählen.

Konkrete private Diagnosefelder, beispielsweise Prüfphase und begrenzter Ablehnungsgrund in `nextFailure.stage` und `nextFailure.critique`, helfen dem berechtigten technischen Review, Inhaltsfehler von Schema-, Antwortweg- oder Providerproblemen zu unterscheiden. Sie gehören nicht in die öffentliche Aufgabenprojektion oder den Kompetenzbericht des Kindes. Prüfgründe können vertraulichen Aufgaben-/Schlüsselkontext enthalten und erhalten dieselben Zugriffsbeschränkungen und Löschgrenzen wie ihr privater Diagnosekontext. Öffentlich genügt eine verständliche neutrale Meldung mit sicherem Wiederaufnahmeweg. Eine Ablehnung bleibt eine Ablehnung; weder ein Retry noch das Ausblenden des Grundes ist eine fachliche Freigabe.


### Präzisierte Erweitern-Voraussetzungen und tatsächliche Geometrie

Die fachliche Hilfematrix für das Erweitern entfernt nun konkrete Anforderungen: zuerst nur die Zählerrechnung mit bekanntem Faktor, dann deren wiederholte Addition, dann eine einzelne kleine Addition. Der Hinweis auf ein bevorzugtes Bruchmodell ist in diesen numerischen Mikrofragen entfernt; eine erneute vollständige Unterteilung wäre hier keine Vereinfachung. Die Erklärung und die konkrete Rückfrage bleiben echt erzeugte und gegengeprüfte KI-Inhalte.

Der tatsächliche Browserlauf maß beim Vergleich 2/3 zu 4/6 beide Streifen mit exakt 767 × 100 CSS-Pixeln. Die sichtbaren Markierungen änderten sich von 2 von 3 auf 4 von 6 bei gleicher Fläche. In der folgenden selbstständigen 3/5-Aufgabe wurden die ersten drei Felder mit einer tatsächlichen Ziehbewegung markiert. Dieser Desktopnachweis ersetzt keinen Touch-/Gerätetest. Eine unterstützte richtige Rückkehr wird weiterhin getrennt von selbstständigen Proben gespeichert.


### Abschließender technischer Blocker des Prüflaufs

Der letzte Kandidat `18905bb6eec6fc87669cd02c8b204de4a2b01579` ergänzt tatsächliche auswählbare Texttokens im Reviewer-Kontext und präzisiert die Bruchantwort auf einen neuen Bruch statt zweier Angaben.372 Backend-/62 UI-Prüfungen sind lokal grün. Die Veröffentlichungen19 und20 (ein begrenzter Wiederholungsversuch mit unverändertem Funktionscode) scheiterten jedoch beim Cloud-Run-Start beider neuen Revisionen. Der Build19 war erfolgreich, der lokale echte Moduleinstieg lädt auch unter den relevanten Cloud-Startparametern. Ein konkreter Anwendungsstack wurde nicht gefunden. Keine Ursache als bewiesen behaupten.

Danach lieferten auch der unverändert veröffentlichte eigene Katalog und das Profil HTTP500, der Katalog ebenfalls über seine direkte offizielle Cloud-Run-Adresse. Test-Runtimekonto aktiv, bestehende Secretversion aktiv, Abrechnung aktiviert; daraus folgt noch keine Ursache. Der öffentliche [Google-Cloud-Status](https://status.cloud.google.com/) meldete zum Abruf keinen breiten schweren Vorfall; ein bestätigter globaler Ausfall wird deshalb ausdrücklich nicht behauptet. Keine Port-/Timeout-/Sicherheitsänderung, kein Schul-Live-Eingriff und kein dritter blinder Deploy.

Die erfolgreichen früheren konkreten Lernpfade bleiben als historische Testbelege erhalten. Sie beweisen keine aktuell benutzbare Vorschau. Die tatsächliche Wiederverwendung des neuen Fundus und die letzte neue Textprobe konnten nach diesem Serverfehler nicht abgeschlossen werden; automatische Cachehit-Prüfung ist kein Ersatz für den offenen echten Lauf. Vor Lehrkraft-/Schülerweitergabe zuerst diesen begrenzten Laufzeitblocker beheben, neuen Kandidaten verifizieren und die ausstehenden Pfade nachholen.
