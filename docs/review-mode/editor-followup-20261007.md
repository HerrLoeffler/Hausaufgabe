# GC-WEB-REPAIR-20261007 — Editorfolgeauftrag

Branch: feature/audio-editor-context-20261007, Basis aed60ecf (PR168 integriert).

Umgesetzt, noch nicht deployed: Vollständiger privater semantischer Aufgabenkontext für Bilder und Bildprüfung, lösungsverratende Bilddarstellungen explizit ablehnen; Cache hängt vom Kontext ab. Einzelne Antwort-Audiospur neu erzeugen, Browser-Decodierung gegen leere/stumme Ausgabe. KI-Typwechsel und private ursprüngliche Fassungen im laufenden Editor. Schloss für Navigation/Tauschen/Drag in Aufgabenübersicht, Papierkorb neben Feedback, alte Aktionsleiste entfernt.

5 neue fokussierte Editor-Verhaltenstests und 6 Bildfluss-Tests bestanden. Vollständige Prüfungen und unabhängiger Review noch ausstehend. Keine bezahlten KI-Aufrufe für Tests. Browserzugriff weiterhin blockiert; keine visuelle Abnahme behauptet.

Noch zu prüfen: private Typfassungen beim lokalen Wiederladen, Tutor-/Tourkompatibilität, Veröffentlichungssperren und Race Conditions. Nicht einfach alte Medien bei verändertem Aufgabeninhalt übernehmen. Nächster Schritt: gesamtes Testpaket und Review, danach Coco-Guide-Anschluss.

Weitere Nutzerwünsche: Coco soll Kontextpronomen verstehen, feste Appseiten öffnen, bei unklarem Test eine Auswahl anbieten und Bedienelemente kurz hervorheben. Wiederholte lokale Nichtklärung soll bestehende KI nutzen. Zusätzlich Testsuche nach Inhalt/Bildmotiv gewünscht, aktuell noch Konzept mit Inhaltsindex erforderlich. Dashboard kompakte Liste + Sammlungen vorgeschlagen, ausdrücklich Ideensammlung. Hintergrund Cremeweiß mit zartem Blauverlauf nur Idee, nicht umgesetzt.

Andere offene Aufgaben bleiben in main TODO/Workstream erhalten. Production/Rules/privateAudio-Gates/CollectorPAUSED unverändert.

Reviewkorrektur: Variantenpfad-Variablenfehler und Retry-Lifecycle reproduziert und gefixt; transienter Typwechselzustand aus Undo-/wiederaufgenommenen Entwürfen entfernt. Tutorial verwendet vorbereitete Inhalte und zeigt Typwechsel ausdrücklich gesperrt, echte eigene Tests verwenden KI. Bildkontext jetzt auch im Hintergrundtestjob inklusive Thema/Sprache. Fokussierte Editorprüfungen 7/7; kompletter UI-Lauf benötigt --experimental-vm-modules (erster Versuch ohne Flag war ungültig). Bestehende Audiofixture um Decoderadapter ergänzt; keine echten Provideraufrufe.

Neue Nutzerwünsche: farbiges Markieren (mehrere Wortarten/Kategorien) wiederfinden und häufiger passend generieren. A4-Druckansicht mit Name/Klasse/Datum, Schreibraum, ordentlichen Umbrüchen, separater Lehrer-Lösungsfassung. Mehrere Seiten erlaubt, nicht auf eine Seite pressen. Farben mit Bezeichnungen; Hörtest-Druckdarstellung noch ausarbeiten.
