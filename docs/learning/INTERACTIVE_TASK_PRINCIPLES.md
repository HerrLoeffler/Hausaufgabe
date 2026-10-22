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
