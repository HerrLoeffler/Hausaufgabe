# Interaktive Aufgaben: gemeinsame Lern- und Testgrundlage

Stand 22.10.2026 · **GC-EXTENDED-QUESTION-TYPES-01**. Gilt für neue und überarbeitete GradeCrew-Testseiten, Aufgabenprototypen, Remy-/Emmi-Entwürfe und adaptive Übungen. Dieser Leitfaden sichert Erkenntnisse; er installiert keinen Generator, importiert keine Inhalte und erteilt keine Deploymentfreigabe. Martins aktueller Auftrag betrifft Testseiten, nicht kanonisches Staging oder Schul-Live.

## Vor jeder passenden Aufgabe

1. Lernziel, Zielgruppe und Modus benennen: Erkunden, unterstützt üben oder unabhängig prüfen.
2. Im [Aufgabenkatalog](INTERACTIVE_TASK_CATALOG.md) vorhandene passende Interaktionen und Nachweise prüfen. Bestehende Renderer/Bewertungswege wiederverwenden, bevor ein neuer technischer Typ entsteht. Keine Pflichtquote für Bild-, Audio- oder Simulationsaufgaben.
3. Eine konkrete lernzielgerechte Aufgabe mit verständlicher Darstellung, Antwortweg und Bewertung entwerfen. Schwierigkeit entsteht durch Denken, nicht durch komplizierte Bedienung. Lehrkräfte bearbeiten Inhalte und sehen Vorschau/Lösung; JSON, Schemas und Reparaturcode gehören nicht in den normalen Arbeitsablauf.
4. In der eigenen Übergabe verwendete Katalog-IDs, begründete Ausnahmen, Quelle/Version und tatsächliche Prüfung festhalten. Neue Erkenntnisse hier oder im Katalog ergänzen; Beobachtung, Vermutung und erprobtes Verhalten getrennt halten.
5. Vor einer Veröffentlichung Umgebung, Quelle, Bewertungs-/Lösungsschutz, Rechte und vorhandene Freigaben prüfen. Ein lokaler Prototyp mit eingebauten Lösungen ist kein sicherer Online-Test.

## Aus den bisherigen Prototypen gelernt

- **Visuell handeln:** Bildbereiche auswählen; Begriffe auf eine Grafik, Satzglieder oder einen Beleg zuordnen; Werte und mehrere Ereignisse auf Skalen platzieren. Die Darstellung muss die fachliche Beziehung erklären. Sichtbare Zuordnungslinien helfen bei räumlich entfernten Beschriftungen.
- **Mathematisch korrekt darstellen:** Gleiche Datenabstände erhalten gleiche Bildabstände. Skalen, Einheiten, Ursprung und Zeitrichtung sichtbar machen. Balken dürfen bei größeren Werten nicht alle dieselbe Maximalhöhe erhalten. Geometrie und Lösung gemeinsam ändern.
- **Werkzeuge wirklich benutzen:** Beim Winkelmessen einen lesbaren Winkelmesser mit Skala, passendem Mittelpunkt und Grundlinie anbieten; je nach Lernziel beweglich/drehbar. Keinen bereits abgelesenen Zielwinkel vorgeben. Messgenauigkeit und Toleranz vorab definieren, Grenzfälle prüfen.
- **Bedeutung bewerten:** Bei einem Bruchraster kann jede passende Auswahl gleich vieler gleich großer Felder richtig sein. Bei Zeitachsen jeden Marker getrennt nach Wert und Einheit beurteilen; mehrere gültige Anordnungen zulassen, wenn fachlich gleichwertig. Keine zufällige Pixelposition oder ein einziges dekoratives Muster erzwingen.
- **Belege fachlich prüfen:** Markierte Wörter müssen die behauptete Aussage tatsächlich belegen. Eine Wortzahlvorgabe darf keine sinnvolle Begründung verhindern. Wortarten, Satzglieder und Diagramme sind verschiedene Lernziele; sie nicht durch dieselbe Drag-and-drop-Oberfläche gleichsetzen.
- **Medien zweckvoll verwenden:** Hörverständnis verlangt Hörinformation; ein sichtbares Transkript kann das Lernziel verändern. Im Üben und bei vereinbarten Nachteilsausgleichen bewusst entscheiden. Bestehende Crew-Assets und geeignete Stimmen nutzen; verständliche, scharfe Grafiken statt Pixelbildern oder fachfremden Emoji-Platzhaltern. Gestaltung für die tatsächliche Altersgruppe, einschließlich älterer Lernender.
- **Bedienung vollständig machen:** Ziehen braucht eine Tipp-/Auswahlalternative und einen passenden Tastaturweg. Lesbare Beschriftungen, erkennbare Auswahl, Rückgängig/Zurücksetzen und wiederherstellbare Antworten vorsehen. Mausprüfung ersetzt keinen Touch-/Gerätetest.

## PhET: Anregungen für eigenständige GradeCrew-Aufgaben

Die folgenden Muster sind aus PhET-Lehrmaterialien abgeleitete Entwurfsregeln, kein Nachweis einer bereits wirksamen GradeCrew-Implementierung:

1. **Vermuten → verändern → beobachten → begründen → übertragen.** Eine Ausgangsfrage aktiviert Vorwissen. Danach gezielt eine Größe verändern, Beobachtungen festhalten und die Aussage mit Daten stützen. Eine neue Situation prüft den Transfer. Nicht jede kurze Testfrage muss alle Phasen enthalten.
2. **Darstellungen verbinden.** Beispielsweise Bruchsymbol und gleich großer Flächenanteil oder Wertetabelle und Graph gemeinsam aktualisieren. Den Wechsel zwischen Darstellungen selbst zum Lernziel machen. Beispielidee: 1/3 und 2/6 am selben Ganzen vergleichen und erklären.
3. **Offene Herausforderungen begrenzen.** „Finde zwei verschiedene Möglichkeiten …“ oder „Erzeuge … und erkläre …“ lässt mehrere Wege zu. Vorgaben, zulässige Lösungen und Bewertung müssen trotzdem eindeutig sein. Freies Erkunden ist kein automatisch benoteter Leistungstest.
4. **Experimente vergleichbar machen.** Ausgangszustand zurücksetzen, Variablen bewusst steuern, Versuchsergebnisse in einer Tabelle sammeln. Aufgaben dürfen keine Zufallswerte oder verborgenes Simulationswissen voraussetzen.
5. **Kurz anhalten und prüfen.** Kleine Verständnisfragen und abschließende unabhängige Aufgaben geben Anhaltspunkte für weitere Förderung. Kein Klickzähler und kein einzelner unterstützter Treffer belegt Beherrschung.

Quellen, am 22.10.2026 gelesen: [PhET Math Activity Design Guidelines](https://phet.colorado.edu/files/guides/Activity_Design_Guidelines_for_Math_en.pdf), [Science Activity Design](https://phet.colorado.edu/en/teaching-resources/virtual-workshop/science-activity-design), [Facilitating Simulation Use](https://phet.colorado.edu/en/teaching-resources/virtual-workshop/facilitating-phet-sim-use). Die dynamischen Webseiten waren im direkten Textabruf teilweise leer; relevante Inhalte zusätzlich über die indexierten offiziellen Seiten gelesen. Keine vollständige Analyse aller Simulationen behauptet.

## Üben, adaptive Förderung und Leistungsnachweis

- Im Üben dürfen Hinweise, Beispiele und Rückmeldungen helfen. Art der Hilfe und unterstützte Erfolge von selbstständigen Antworten unterscheiden. Nach Hilfe eine neue unabhängige Probe anbieten; exakte Schwellen gehören zum vorhandenen adaptiven Konzept, nicht in diesen allgemeinen Leitfaden.
- Fehler sind Hinweise auf mögliche Verständnisprobleme. Vor einer Kompetenzdiagnose auch missverständliche Aufgaben, Sprache, Darstellung und Bedienung prüfen. Keine sichere Fehlvorstellung aus einer einzigen falschen Antwort ableiten.
- Im Leistungsnachweis keine Lösung durch Vorschau, Label, DOM-Daten, Instrument oder Sofortfeedback verraten. Private Schlüssel, serverseitige Bewertung, unveränderlicher veröffentlichter Aufgabenstand, idempotente Abgabe und kontrollierte Lösungsfreigabe bleiben verbindlich.
- Aufgabenformat, Lernmethode und Kompetenzprofil getrennt halten: Memory kann vorhandenes Matching nutzen; ein Lernpfad/Video bündelt Aufgaben; ein Kompetenzprofil verarbeitet belegte Leistungen. Nicht für jede Methode ein neues Speicherschema bauen.
- Offene Erklärungen, Sprache und Zeichnungen nur mit passenden Kriterien bewerten; erforderliche Lehrkraftprüfung sichtbar lassen. Keine pauschale Vollautomatik versprechen.

## Nutzungsrechte und Wissenspool

PhET unterscheidet aktuell reguläre HTML-Simulationen unter **CC BY-NC 4.0** und separat lizenzierte PhET-iO-/Studio-Angebote. Das Lesen einer Seite und didaktische Inspiration erlauben nicht automatisch die Übernahme von Simulationen, Screenshots, Branding oder APIs in GradeCrew. Vor konkreter Einbettung/Weitergabe Nutzung und aktuelle Bedingungen prüfen; auch eine öffentliche Testseite ist keine pauschale Ausnahme. [Offizielle Lizenzinformationen](https://phet.colorado.edu/en/licensing), geprüft 22.10.2026. In diesem Auftrag wurden keine PhET-Inhalte eingebettet oder heruntergeladen.

Ebenso ZUM-/H5P-/GeoGebra-/Buchinhalte quellenbezogen behandeln: Idee, eigener Entwurf, zitierter Beleg und übernommenes Asset unterscheiden. Keine Buchoriginale, bibliografischen Rohbestände, Schülerdaten oder vertraulichen Uploads in öffentliche Kataloge aufnehmen. Der bestehende [pädagogische Pool](../../workstreams/pedagogical-pool-20261011.md) behält seine Freigaben und Fach-/Jahrgangs-/Schulartfilter. Eine neue Katalogidee ist **kein** freigegebenes Laufzeitprofil und wird nicht automatisch in den Generator importiert.

## Kleiner Abnahmevertrag für Testseiten

Je tatsächlich geändertem Interaktionsweg prüfen und belegen:

- richtige, falsche, leere und teilweise richtige Antwort; mehrere gültige Lösungen und Toleranzgrenzen, falls vorhanden;
- Aufgabenstellung, Grafik, Antwort und Punkte passen zusammen; Vorschau und tatsächliche Bewertung nutzen dieselbe Version;
- Tippen/Ziehen/Tastatur entsprechend Scope; Navigation/Neuladen erhalten Antworten; reine Lehrkraftvorschau verändert keine Abgabe;
- keine Lösung im öffentlichen Prüfauftrag; zulässige Teilpunkte und manuelle Korrektur bleiben nachvollziehbar;
- sichtbare Grafik/Skala auf den Zielgrößen und Medienwiedergabe prüfen, nicht nur Unit-Tests zählen;
- Resultat mit Commit, Umgebung und Grenzen sichern. Online-KI, sichere Serverabgabe und physisches Gerät jeweils separat belegen, falls beansprucht.

Keine neuen Vollprüfungen unveränderter Komponenten allein wegen dieser Dokumentation. Beobachtete Schwächen aus einer fremden laufenden Vorschau mit Snapshot melden, nicht deren Dateien parallel verändern.

## Aus24 echten Probetests gelernt — 25.10.2026

Beleg: [Prüfbericht der192 Aufgaben](https://github.com/HerrLoeffler/Hausaufgabe/blob/021ef5c2d4bee1daa6d353635ae18f63bbe28c50/docs/evidence/visual-pilot-24-20261025/REPORT.md), [Übergabe](../../workstreams/visual-pilot-24-20261025.md). Diese Erkenntnisse gelten für passende künftige Testseiten; sie importieren keine Aufgaben automatisch.

- **Fachrichtigkeit unabhängig rechnen:** Ein Lösungsschlüssel kann technisch gültig und dennoch falsch sein. Den gegebenen Sachverhalt unabhängig auswerten; erst danach richtige/falsche/leere/alternative Antworten prüfen.
- **Antwortumfang und Bewertung abstimmen:** Freie Sätze, Begründungen und algebraisch gleichwertige Formeln nicht gegen wenige exakte Mustertexte benoten. Entweder passende offene Bewertung mit Lehrkraftprüfung vorsehen oder klare Wörter, Kategorien, Koeffizienten und Belegauswahl verlangen. Übliche gleichwertige Fachbegriffe zulassen.
- **Schreibung bewusst prüfen:** Bei Groß-/Kleinschreibung als Lernziel darf Normalisierung den Fehler nicht verschwinden lassen. Im übrigen Sprachvergleich tolerante Standardbehandlung erhalten.
- **Nur belegte Aussagen verlangen:** Beschluss ist keine Umsetzung; zwei Messzeitpunkte kein durchgehender Jahresverlauf; Nutzung keine Zustimmung. Bezugsgrößen, Modellannahmen, Kriterien, Quellen und alle nötigen Daten mitliefern. Fiktive Methodendaten ausdrücklich von Faktenwissen unterscheiden.
- **Darstellung benennt die wirkliche Interaktion:** Säulenaufgabe nicht als Liniendiagramm bezeichnen; Uhrzeiten als HH:MM zeigen. Lange Grafikinhalte vollständig lesbar und auswählbar halten. Hinweise dürfen die Lösung nicht durch Übersetzung verraten.
- **Generierungsqualität sichtbar machen:** Logische Tests, interne Modellaufrufe und Aufgabenersetzungen getrennt zählen. Diese Serie benötigte24 Erstellungen,161 interne Providerrequests und67 Ersetzungen;63 Aufgaben wurden anschließend korrigiert oder präzisiert. Daraus keine automatische Unterrichtsfreigabe ableiten.
- **Nachweisstufen erhalten:** Die Serie besteht technische und echte Serverprüfungen in einer getrennten Testvorschau. Lehrkrafturteil, Gerätestest und Lernwirksamkeit bleiben eigene offene Nachweise. Vor der Produktintegration passende Aufgaben in der Zielklasse erproben.

### Nach Nutzerprüfung der Testserie

Fehlerstellen nicht im Arbeitsauftrag vorwegnehmen: „Berichtige das Verb“ ist sinnvoller als das gesuchte falsche Wort bereits zu nennen. Kurze Diagrammbeschriftungen bezeichnen die fachliche Rolle (z.B.Behauptung/Begründung), vollständige Texte bleiben verfügbar. Wenn die Lernhandlung das Einstellen einer Säule oder Anlegen eines Instruments ist, unnötige numerische Ersatzfelder vermeiden; direkte Bedienung und Tastaturalternative erhalten. Messabweichung passend zum Lernziel festlegen und Grenzfälle serverseitig prüfen;±3° ist hier der freigegebene Winkelpilot, kein pauschaler didaktischer Standard. Aufgaben nach Nutzerkritik verständlicher machen, statt bloß den ursprünglichen Entwurf im Chat zu erklären. [Erprobte Änderungen](https://github.com/HerrLoeffler/Hausaufgabe/blob/fda13a26d1c4b4cdeadd3689a1280cdd68beb765/docs/evidence/visual-pilot-24-20261025/followup/REPORT.md).


## Unabhängige Hilfestufen und Rechenschritte — GC-EXTENDED-QUESTION-TYPES-01, 26.10.2026

Bei neuen Aufgaben Inhalt/Lernziel, Darstellung, Hilfen und Bewertung getrennt modellieren. Vorgaben dürfen pro Feld und pro Rechenpfeil unabhängig sein: ganze Rechnung vorgeben, nur Zeichen vorgeben, Zeichen auswählen oder ganze Rechnung frei. Weder dieselbe Operation für beide Spalten noch dieselbe Hilfestufe erzwingen. Direkte Proportionalität erhält das Verhältnis, umgekehrte erhält das Produkt; fachlich passende Annahmen ausdrücklich nennen. Plus/minus als Auswahl sind keine Erlaubnis, fachlich falsche Rechnungen als richtig zu bewerten.

Ein fester Zwischenweg gehört in den Auftrag, wenn nur dieser bewertet wird. Andernfalls mehrere mathematisch korrekte Wege unterstützen. Jeder eigenständig bewertete Eingabeteil benötigt einen privaten Antwortmodus und klare Punkte: Zahlen numerisch vergleichen, Zeichen normalisieren, freie Einzeloperationen begrenzt parsen; niemals Aufgaben-/Schülertext als Code ausführen. Bei Zeichenwahl und Zahl können zwei getrennte Felder entstehen; eine gesamte freie Rechnung ist ein gemeinsames Feld. Die Laborbeispiele rechnen0,5Punkte pro Feld und passen die Gesamtpunkte an. Keine versteckten Lösungshinweise im Schülerauftrag oder öffentlichen Daten.

Fachübergreifender Transfer: Tabellen mit mehreren Angaben pro Zeile für Sprache, Größenumrechnungen und Mengen/Preise wiederverwenden; ein Dreisatzbild nur dort einsetzen, wo die fachliche Beziehung passt. Das neue Layout wird im lokalen Labor deterministisch aus Aufgabendaten erzeugt. KI soll denselben geprüften Vertrag nutzen; automatische KI-Erzeugungsqualität oder Lernwirksamkeit ist damit noch nicht nachgewiesen.

Nachweisstand: eigener PR296/Commit5037935f3579ebb24d375a28833096975d9fd0e6,65Web/Labor- und33Serverprüfungen, Paket183Dateien, tatsächliche Browserbedienung mit Speichern/Neuladen, unabhängiger Review. Nurlocalhost8784; kein Cloud-/Productiondeploy und kein physischer Touchgerätetest. [Ausführlicher Nachweis](https://github.com/HerrLoeffler/Hausaufgabe/blob/5037935f3579ebb24d375a28833096975d9fd0e6/docs/evidence/local-prototype-ai-20261025/REPORT.md). Normaltest-Integration über vorhandenen Owner/PR310 weiterführen.


### Online-Nachweis der differenzierten Bausteine — 26.10.2026

Derselbe Daten-/Hilfen-/Bewertungsvertrag wurde jetzt im getrennten [Online-KI-Labor](https://gradecrew-staging-2026--visual255-rjcwf436.web.app/aufgabenlabor/) tatsächlich von der bestehenden KI genutzt: direkter und umgekehrter Dreisatz, alle acht aktiven Formate und fächerübergreifende Tabellen/Koordinaten/Verbindungen, insgesamt14neueAufgaben. Richtige Zahlen erhalten weiter Punkte, wenn ein eigenständig bewertetes Rechenzeichen falsch ist; echter Browserbeleg6,5/7 statt7/7. Alle akzeptierten Varianten müssen dieselbe mathematische Beziehung erfüllen; nicht nur accepted[0] prüfen. Direkte Schülerlinks brauchen das explizite Layout unabhängig vom Lehrer-Laborflag. Originale KI-Ergebnisse und manuelle fachliche Ergänzungen getrennt dokumentieren. [Belege und Grenzen](https://github.com/HerrLoeffler/Hausaufgabe/blob/c3fb160be769cd939cf89d121d94f453f23ea6d3/docs/evidence/online-visual-lab-20261026/REPORT.md). Das ist ein technischer Erzeugungs-/Bedien-/Bewertungsnachweis, keine Unterrichtswirksamkeits- oder Productionfreigabe.


### Echte KI Anpassung und große Testserien auf normalem Staging

Ein bewusster Typ-/Unterformatwechsel fragt Format und optionalen Inhaltswunsch ab, bevor die bestehende KI startet. Beispiele erklären nur den Datenvertrag; sie ersetzen keine angeforderte neue Aufgabe. Original und Punkte bleiben bei Abbruch, Fehlern oder veralteten Ergebnissen erhalten. Zeichenvarianten der KI müssen auch nach einer Änderung der Hilfestufe weiter bearbeitbar sein.

Eingabepräzision und sichtbares Raster getrennt begrenzen. Eine Prozent-/Preisachse darf viele erreichbare Eingabepositionen haben, während nur lesbare Hauptlinien gezeichnet werden. Strukturfehler vor Qualitätsprojektion melden, statt sie durch einen allgemeinen Folgefehler zu verdecken.

Große Proben zusätzlich zu kleinen Vorführungen prüfen: echte Anzahl, Punktesumme, private Lösungen, Wiederaufnahme, doppelte Abgabe und feldweise Teilpunkte. Logische Aufträge, interne Providerrequests, Korrekturen und Laufzeit getrennt dokumentieren. Die jetzigen20/40-Proben mit60Aufgaben benötigten62interneProviderrequests und etwa6/14Minuten; daraus keine sofortige Erstellung oder allgemeine Lernwirksamkeit ableiten. Aktuelle Klassenraum- und Abgabelogik bei jeder Veröffentlichung tatsächlich erhalten. [Nachweis und Grenzen](../evidence/interactive-staging-repair-20261026/REPORT.md).
