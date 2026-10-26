# Echte KI im lokalen Aufgabenlabor

Task GC-EXTENDED-QUESTION-TYPES-01, 25.10.2026. http://127.0.0.1:8784/ verwendet jetzt die vorhandene isolierte GradeCrew-Test-KI statt einer vorbereiteten Antwort auf dem Erstellknopf. Die drei Beispielmischungen bleiben ausdrücklich als Beispiele verfügbar.

## Tatsächlich geprüft

- Browser: „Mit KI neu erstellen“ → Fach Mathematik, Klasse 6, Winkel/Koordinaten/Diagramme → neun neue Aufgaben mit 24 Punkten im vorhandenen Editor.
- Echter Remote-Job 8635d516530703b22ce3d4f805bd2b406e2377a2, lokaler Request b959edaf-4f74-4334-8332-683eb7d8ab56, keine Wiederholung. Die vorhandene Backendstrecke übernimmt Generierung und Reparatur.
- Browser: Emmi vereinfacht die neun Arbeitsaufträge; Backend meldet neun Änderungen mit Modell gpt-5.6-luna. Tatsächlicher Modellstand des vorhandenen Backends, kein behaupteter Modellwechsel. Ausgabe mit neun Aufgaben/24 Punkten im Editor angekommen und gespeichert. Screenshot outputs/extended-real-ai-20261025.png.
- Beide Ergebnisse mit aktuellem Assessmentvertrag geprüft: lösungsfreies Schülerpapier und jeweilige Musterantworten 24/24 Punkte. Details ohne Schülerdaten in checks.json.
- 32 relevante lokale Tests bestanden: Schülerweg/Bestätigung, drei Beispielvarianten, HTTP-/Ursprungsschutz, private Dateien, gleichzeitiges Speichern, Notenschlüssel, KI-Request-Wiederaufnahme und manuelle Ergebnisprüfung.

## Fehler gefunden und behoben

Unabhängiger Review: Ein unterbrochener Auftrag konnte bei neuem Wunsch derselben Art das alte Ergebnis einer anderen Frage zuordnen. Jetzt bindet ein Eingabefingerabdruck die Wiederaufnahme; anderer Inhalt erfordert explizite Wiederherstellung. Regression zuerst fehlgeschlagen, danach bestanden. Fertige Überarbeitungen wurden beim Fortsetzen zunächst nur gemeldet und verbraucht; nun zeigt ein Dialog das Ergebnis, behält es beim Schließen und öffnet es erst nach ausdrücklicher Auswahl im Editor. Zwei DOM-Tests und gezielter Clienttest bestätigen dies. Keine zweite Review-Runde.

## Grenzen

Nur localhost und vorhandene visual255-Testdienste, keine Functions-/Rules-/Hosting-/Productionbereitstellung. Serveranmeldung und Tokens bleiben auf dem lokalen Server. Der Browser erhält keinen Providerkey. Vorhandene Backendquoten bleiben wirksam; höchstens ein lokaler kostenpflichtiger Auftrag gleichzeitig. Neuladen wiederholt keinen bezahlten Start automatisch. Zusätzliche Medienjobs/Uploads sind in diesem Experiment nicht freigeschaltet; bestehende rendererbasierte Grafiken funktionieren. Einzelüberarbeitung/Varianten sind an den bestehenden Endpunkt angeschlossen und lokal mit kontrollierten Antworten getestet, hier kein zusätzlicher echter Variantenaufruf. Zwei echte Provideroperationen ausgeführt; keine genaue Kostenabrechnung vorhanden. Technische Korrektheit ist keine vollständige pädagogische Abnahme der neuen Aufgaben. Kein Touch-/iPadnachweis.

Der Dienst läuft über launchctl de.gradecrew.extended-preview mit EXTENDED_AI=1, ausschließlich 127.0.0.1. Kein Neustart-/Login-Autostart eingerichtet. Einmaliges Stop/Start muss in getrennten Schritten erfolgen: sofortiges erneutes submit während remove noch verarbeitet wird kann sonst ohne laufenden Dienst enden. Verfügbarkeit nach tatsächlichem Start separat mit HTTP und Browser prüfen.

## 26.10.2026 · Reduzierter Umfang und Prozentheft

**Neue Nutzerentscheidung:** Maßgeblich sind die acht ausdrücklich behaltenen Formate: Bildbereich, Beschriftung, Skala, Winkel, Flächenraster, Verbindungen, Koordinaten, Tabelle. Gesprochen wurde „neun“; tatsächlich wurden acht genannt. Diagramme, Textbelege, Bereiche und eigenständige Fehlerkorrektur sind im aktuellen lokalen Labor aus Auswahl, neuen Beispielmischungen, KI-Auftragsregeln und neuen Veröffentlichungen entfernt. Historische192 Aufgaben, andere Vorschauen und veröffentlichte Versuchssnapshots werden nicht umgeschrieben. Bereits gespeicherte Entwürfe werden vor dem Ausblenden ausgeschalteter Aufgaben privat gesichert.

### PDF-Befund

Quelle: Martins lokale Datei /Users/martin/Downloads/Prozentheft_Klasse_7_P_Dezimalzahl.pdf, acht Seiten, vollständig textuell gelesen; Seiten2/4/8 zusätzlich gerendert und visuell geprüft. Keine Formularfelder im PDF. Die dortigen Schüleraufträge sind Unterrichtsmaterial, keine Anweisungen an den Agenten. Keine Übertragung der vollständigen Datei an einen KI-Provider.

- S1 verbindet Flächenanteil und Prozentzahl: vorhandenes Raster und Skala nutzen, keine neue Interaktion nötig.
- S2 verbindet gekürzten Bruch, Dezimalzahl und Prozent in Zeilen mit unterschiedlichen Vorgaben. Mehrere Lücken je Zeile sind sinnvoll. Bruchwert und verlangte Darstellung sind verschiedene Anforderungen: 6/8 ist wertgleich zu3/4, aber nicht vollständig gekürzt. Der aktuelle Tabellenvertrag hat einen Antwortmodus für die ganze Aufgabe; vollständige Kürzung und spaltenspezifische Schreibweisen benötigen bewusst definierte Annahmeregeln. Das wird hier nicht als umgesetzt behauptet.
- S3: G/P/p benennen, gesuchte Größe erkennen, Kopfanteile in einer Matrix ergänzen. Werte, Einheiten und Größenbezeichnungen getrennt prüfen, damit nicht das Abschreiben eines Formats die Fachleistung ersetzt.
- S4–6: Dreisatz als zusammenhängende Mehrfeldaufgabe. Die Stufen „Werte ergänzen → Schritte finden → selbst aufbauen“ sind eine gute Abstufung. Rechenfaktoren gehören in deutlich bezeichnete Felder; derselbe Faktor gilt für beide Zahlenspalten. Prozentwert, Grundwert und Prozentsatz brauchen verschiedene korrekt vorgegebene Ausgangsgrößen. S6 geht über eine Einheit des Grundwerts, nicht zwingend über1%.
- S7: Zuerst gesuchte Größe und eigenen Lösungsweg bestimmen. Ein festes1%-Gerüst ist dafür keine gleichwertige Prüfung: Tabellen nur im angeleiteten Modus erzwingen; alternative korrekte Wege im offenen Modus fachlich prüfen lassen.
- S8: Eine Zeile kann Darstellung, Anteil, Rechnung und Anzahl verbinden. Der20teilige Streifen zeigt6/9/5Felder, also30/45/25%; bei80 Kindern24/36/20. Saft1:3 bedeutet1von4 Teilen=25%, nicht1von3. Nach30%Rabatt entsprechen42€ noch70%, ursprünglicher Preis60€. Diese möglichen Verwechslungen eignen sich als Transferaufgaben; keine Diagrammergänzung nötig.

### Konkretes Tabellenkonzept

**Eine Aufgabe – mehrere unabhängig prüfbare Felder.** Die vorhandene Tabelle unterstützt bis12Zeilen/6Spalten und mehrere Eingaben je Zeile. Bei n gleichwertigen Feldern maxPoints=n×0,5 setzen; dadurch erhält jedes korrekte Feld genau0,5Punkte, leere/falsche Felder0. Einheiten stehen in Überschriften, Antworten bleiben leer. Keine doppelte Bewertung desselben Endergebnisses in Tabelle und Antwortsatz.

Sechs direkt bedienbare eigene Beispiele über „Dreisatz & mehrere Felder“: Prozent/Dezimalzahl, drei Dreisatzrichtungen einschließlich Rechenfaktoren, Masse/Preis sowie englische Wortformen/Übersetzungen. Keine neue KI-Erstellung dieser Beispiele. Tabellen bleiben derselbe bewährte Aufgaben-/Bewertungsvertrag. Das Konzept gilt auch für Einheitenumrechnung, Messreihen, Formeln/Wertepaare, Sprachformen und zeitliche Zuordnungen.

Ein zu berichtigender Tabellenwert soll ausdrücklich als fehlerhaft markiert sein; bewertet wird die neue Eingabe in dieser Zelle. Das Suchformat correction bleibt deaktiviert. Kein stilles „falsch vorbefüllen“, das als gegebener Wert missverstanden wird. Die Beispiele starten deshalb mit leeren Feldern; eine gesonderte editierbare Fehler-Vorbelegung ist noch nicht implementiert.

**Bewertungsgrenzen:** Die aktuelle Regel vergibt unabhängige Zellpunkte. Sie erkennt keine Folgefehler und bewertet keine beliebige alternative Rechenstrategie automatisch. Unterschiedliche Zellgewichte, Zell-spezifische Zahl-/Bruch-/Textmodi und kontrollierte Folgefehler wären spätere, ausdrücklich zu vereinbarende Vertragserweiterungen. Empfehlung: zunächst feste0,5Punkte und klar bezeichnete Lücken testen; anschließend echte Schülerantworten ansehen, bevor komplexere Korrekturregeln entstehen.

### Prüfung des reduzierten Umfangs

50 relevante lokale Tests bestanden, darunter die reale Editorfunktion mit acht Auswahlwerten und unverändert zwölf historischen Standardformaten außerhalb dieses Labors, Ablehnung ausgeschalteter KI-Ergebnisse, Musterantwort-/Teilantwort-/Leerbewertung und eine serverseitige Schülerabgabe mit genau0,5Punkten für eine richtige Tabellenzelle. Browser zeigt die acht Einträge, blendet drei ausgeschaltete Aufgaben aus dem vorhandenen Entwurf mit Sicherungshinweis aus und öffnet die sechs Tabellenbeispiele. Dreisatz mit fünf Eingaben/2,5Punkten sichtbar geprüft; Screenshot outputs/eight-formats-dreisatz-20261026.png. Keine neue kostenpflichtige KI-Serie in diesem Schritt; die neue Prompt-Einschränkung ist lokal getestet und Ergebnisannahme gesperrt, aber noch nicht durch einen neuen Providerlauf qualifiziert.

Unabhängiger Review fand drohenden Entwurfsverlust beim Öffnen der neuen Beispiele. Zuerst reproduziert, dann vollständigen aktuellen Editorinhalt vor dem Wechsel in ein gesondertes privates Archiv übernommen und einen Wiederherstellungsdialog ergänzt. Auch Beispielmischungen nutzen diese Sicherung; alte Entwürfe mit ausgeschalteten Formaten bleiben vollständig archiviert, zurück ins aktive Labor gelangen nur die noch erlaubten Fragen. Umbenennung der dritten Mischung entfernt irreführende Hinweise auf Bereiche/Belege. Gezielte Regression und anschließend alle50Tests bestanden. Keine zweite unabhängige Reviewrunde.

## 26.10.2026 · Vereinfachung nach deutlichem Nutzerfeedback

Die abstrakte Vier-Spalten-Tabelle war für den Dreisatz verwirrend. Im lokalen Labor zeigt dieselbe geprüfte Aufgabe jetzt zwei Zahlenspalten und drei Datenzeilen; die zwei Rechenoperationen stehen als Pfeile direkt zwischen den Zeilen. Alle fünf bestehenden Antwort-IDs/Lösungen und2,5P bleiben gleich. Kein neues Aufgabenformat und keine neue Bewertungsengine. Nur die bekannte, strukturell geprüfte Dreisatzform wird so angeordnet; unpassende/versteckte zusätzliche Eingaben lösen den bisherigen Tabellen-Fallback aus. Unnötige Medienkästen weg, Aufgabenartänderung zugeklappt, Lösungstexte mit sichtbaren Rechenschritten statt interner Zellcodes. Neue Vorlagen erhalten kürzere Arbeitsaufträge.

Offizielle H5P-Quellen: https://h5p.org/fill-in-the-blanks und https://h5p.org/tutorial-arithmetic-quiz. H5P kann mathematische Lückenaufgaben; hier wurde noch kein H5P eingebettet. Das Problem wurde zunächst in der vorhandenen GradeCrew-Darstellung behoben. Die Nutzerbezeichnung „php5“ wurde als vermutlich H5P eingeordnet, nicht als Auftrag für eine neue PHP-Plattform.

57 relevante Tests bestanden. Unabhängiger Review fand die zunächst fest angegebene Halbpunktbeschriftung bei nachträglich veränderter Gesamtpunktzahl; reproduziert und korrigiert:0,5P/Feld nur bei passender Gesamtzahl, sonst tatsächliche Gesamtpunkte. Antwort-IDs, Wiederherstellung, Lösungsfreiheit und Fallback erhalten. Keine zweite Reviewrunde, keine Providerstarts. Browseransicht der drei Zahlenzeilen und Pfeile tatsächlich kontrolliert; Screenshot outputs/simple-dreisatz-20261026.png.

### Homepage-Aufgaben als Grundlage echter Tests

Neuester Nutzerwunsch: gelungene Startseiten-Aufgaben zuverlässig in normale Tests übernehmen, mit wechselnden Punktlagen/Quadranten, Pflanzen oder anderen geeigneten Bildern und Zuordnungen. Bestehenden Anschluss PR310 wiederverwenden, keine parallele Neuimplementierung im Labor. Aktuelle veröffentlichte Vorschau des Owners: https://gradecrew-staging-2026--remy26-mhohnhf1.web.app/workspace.html. Owner hat normalen Remy-Job4107be8859d80691d522c2010d262b42c6333279/TestBZFKMUEB mit sechs interaktiven Formaten, Lehrkraftänderung und tatsächlicher Schülerabgabe12/12 dokumentiert. Eigene historische Laborläufe werden nicht als neuer Nachweis ausgegeben. Eigene Prüfung dieser vorhandenen Test-Vorschau ist rein lesend; kein zusätzlicher Versuch gestartet. Keine Productionintegration in diesem Chat behauptet.

Anforderung für weitere Übernahme: gespeicherte Homepage-Baupläne und deterministische Renderer wiederverwenden; wechselnde fachliche Inhalte durch validierte Parameter; konkrete Bilder müssen tatsächlich vorhandene und passende Zielregionen besitzen. Beliebige neue Bilder oder Motive sind keine bereits qualifizierte automatische Fähigkeit. Acht im Labor behaltene Formate bleiben die aktuelle Auswahl; zusätzliche Zeitachsen-/Bildfolgeformate aus dem parallelen Entwurf werden dadurch nicht still freigegeben. Normale Testintegration und weitere Bildmotive beim zuständigen vorhandenen PR separat verifizieren.

## 26.10.2026: Differenzierbare Rechenpfeile nach Martins Foto

Auf localhost8784 stehen im bestehenden Knopf „Dreisatz & mehrere Felder“ jetzt sieben Beispiele. Aufgaben2–4: direkter Dreisatz; Aufgabe7: umgekehrter Dreisatz (4Personen/12h → 1Person/48h → 8Personen/6h, gleiche Arbeit und Leistung vorausgesetzt). Vier äußere gebogene Pfeile sind unabhängig. Im Lehrereditor unter „Hilfen und offene Felder anpassen“ je Pfeil: komplette Rechnung vorgegeben, nur Zeichen vorgegeben, Zeichen aus ×÷+− wählen oder gesamte Rechnung frei. Sechs Zahlengaben einzeln vorgeben/offenlassen. Ein offenes Eingabefeld zählt0,5Punkte; Auswahlzeichen und Zahl sind zwei getrennte Felder, eine vollständig freie Rechnung ein gemeinsames Feld. Punkte werden beim Umstellen neu berechnet. Mindestens eine Eingabe bleibt erforderlich.

### Wie es erzeugt wird und was übertragbar ist

Es ist ein HTML/CSS/JavaScript-Baustein mit SVG-Pfeilen, keine H5P-Installation. `dreisatz.mjs` beschreibt die zwei Wertespalten, drei Wertepaarzeilen und vier Rechnungen. Eine getrennte Sichtbarkeits-/Hilfenkonfiguration legt fest, was gegeben wird und was Schüler eingeben. Der bestehende Renderer zeichnet diese begrenzten Aufgabendaten; der private Schlüssel bewertet Zahlen, Zeichen und vollständige Operationen feldweise auf dem Server. Der Browser erhält keine erwarteten Antworten. Freie Rechnungen werden mit einem begrenzten Parser erkannt, niemals als Programmcode ausgeführt. „mal40“, „×40“, „·40“, „geteilt durch40“, „÷40“ und „:40“ sind erlaubte Schreibweisen; eine falsche Gegenoperation bleibt falsch. Numerische Äquivalenz mit Komma/Punkt bleibt für Zahlenfelder erhalten.

Die KI-Anbindung bleibt die vorhandene; die neuen Beispiele sind deterministisch erstellt, ohne Provideraufruf. Es ist noch kein Beleg dafür, dass KI automatisch fachlich richtige Dreisatzvarianten erzeugt. Die spätere KI-Erzeugung soll denselben geprüften Datenvertrag benutzen, keine eigene Oberfläche erzeugen. Fachliche Prüfung bleibt notwendig.

Dauerhaftes Prinzip für alle Fächer: Lernziel/Inhalt, Darstellung, Hilfestufe und Bewertung getrennt halten. Bestehende Tabellen zeigen bereits Englischformen und Bedeutungen sowie Masse/Preis; dieselben Eingaberegeln sind fachübergreifend. Das Dreisatz-Pfeilbild passt dagegen nur zu fachlich sinnvollen Rechenschritten, etwa Größenumrechnung oder Mengen/Preisen. Umgekehrte Proportionalität erfordert gegenläufige Operationen und konstantes Produkt, direkte Proportionalität konstantes Verhältnis. Plus/minus bleiben als bewusste Auswahlmöglichkeiten verfügbar, werden in einem proportionalen Beispiel nicht automatisch richtig. Ein fester erwarteter Zwischenweg muss im Auftrag benannt sein; sonst könnten mehrere korrekte Wege fälschlich abgewertet werden. Deshalb nennen die Beispiele den Weg über1% bzw.1Aufgabe/Person.

### Nachweise und Grenzen

- Kern/Renderer/Editor/Serverparität, unbekannte Eingaben, private Lösungen und Teilpunkte geprüft; Testzahlen im abschließenden Workstream-Eintrag.
- Tatsächlicher Browser: unterschiedliche Hilfestufen links/rechts gewählt, passende Punkte angezeigt, gespeichert und nach Neuladen erhalten; Schüleransicht mit vier bedienbaren Pfeilen. Screenshot lokal unter `outputs/independent-dreisatz-20261026.png`.
- Unabhängiger Review: fehlenden Paket-Eintrag des neuen Moduls gefunden und behoben. Bei der Paketprüfung zusätzlich drei schon vorher dynamisch referenzierte reine Clientmodule ergänzt. Anschließender Staging-Paketbau erfolgreich (183Dateien), kein Deployment.
- Keine realen Schülerdaten, neue KI-Aufträge, Clouddeploys oder Änderungen an Production. Physischer Finger-/Gerätetest und fachliche Lernwirksamkeit bleiben offen. Normaltest-Integration weiter über vorhandenen Owner/PR310.
