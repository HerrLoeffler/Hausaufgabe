# GC-BRAND-HERO-MOTION-20261013 — isoliertes Homepage-Hero-Experiment

- Aktualisiert (UTC): 2026-10-13
- Verantwortlicher Chat / Auftrag: aktueller GradeCrew Designchat; Storyboard und Motion-Konzept für bestehende Crew-Klassenzimmerszene
- Chat-Bezeichnung / Link: unbekannt
- Arbeitszustand: aktiv, Konzept zur visuellen Entscheidung
- Aufgabenbranch: `docs/gc-brand-hero-motion-20261013`
- Basiscommit: `d3dd36d5b63062de7d4702c40ac1dd87574cc484` auf `main` beim Branchstart
- Integrationsziel: `main`, **nur Dokumentation**; keine Produktintegration beauftragt
- PR: keiner beim Anlegen dieser Übergabe
- Betroffene Dateien: `TODO.md`, diese Übergabe; lokale experimentelle Bilddateien außerhalb des Repos
- Überschneidungen: GC-DESIGN-04/05 und Startscreen-Arbeit betreffen bestehende Homepage; diese Aufgabe ändert keinen ihrer Codes oder Deploys. Suche nach offenem PR/Branch mit „hero animation“ bzw. „hero-motion“ ergab am 13.10.2026 keinen Treffer.

## Ziel und gewünschtes Verhalten

Die vier echten GradeCrew-Figuren und das Klassenzimmer bleiben Markenkern. Remy erstellt eine erste Aufgabe, zeigt dasselbe iPad mit dem Bildschirm zur Kamera und reicht es Emmi. Emmi ergänzt eine zweite fachlich passende Aufgabe, zeigt den Stand und reicht das Gerät Wilma. Wilma zeigt eine **als Beispiel markierte** Auswertung. Coco führt durch die Szene. Jede Produktansicht bleibt so lange lesbar, bis der Nutzer „Weiter“ wählt; zehn Sekunden sind keine Vorgabe.

## Umfang / nicht verändern

**Ausgewiesenes Experiment.** Weder bestehende Homepage noch normales Staging noch Production, Tutorial, Registrierung oder Testcode-Einstieg verändern. Originalbilder nur als Kopien/Referenzen verwenden. Keine automatisch wiederholten bezahlten Generierungsläufe.

## Akzeptanzkriterien für späteren Animatic

1. In jedem Frame genau ein iPad; Besitz und Übergaben sind räumlich plausibel. Das vorläufige Bild mit zwei iPads ist verworfen.
2. Remy, Emmi und Wilma drehen die Bildschirmseite zur Kamera, lächeln und blicken bei Übergaben zueinander.
3. Natürlicher Kameraschritt: Figur zeigt Tablet → Kamera nähert sich dem gehaltenen Gerät → im nahen Tablet-Rahmen erscheint lesbare DE/EN-Weboberfläche → Halt bis „Weiter“ → Rückfahrt zur Übergabe.
4. Remys Frage 1 bleibt erhalten; Emmi fügt Frage 2 hinzu. Überarbeiten wird nicht als zwingender Schritt behauptet.
5. Wilmas „2 von 2 Punkten“ ist Beispiel nach simulierter Testbearbeitung.
6. Desktop, Schul-iPad und iPhone sowie Reduced Motion und Tastatur werden im Prototyp geprüft.

## Zwischenstand

- Lokal geändert: Nur separater Visualisierungsordner `/Users/martin/.codex/visualizations/2026/10/12/01a130fa-babb-7de3-bfeb-785499e7c061/gradecrew-homepage-experiment-20261013/animation-storyboard-v1/`.
- Auf GitHub gesichert: diese Dokumentation auf Aufgabenbranch; App-Code unverändert.
- Geprüft: drei neue Präsentations-Keyframes (1774×887) visuell kontrolliert; Wilmas Klemmbrett aus dem Schlussbild entfernt; Original-PNG-Kopie hat denselben SHA-256 wie Quelle.
- Deployed: keines.
- Gerätetest: keiner.
- Release-Stufe: kein Produktfeature; als Dokumentation nur Branchstand. CI, Integration, Staging, Nutzertest und Production nicht erreicht.
- Werkzeug: integriertes `image_gen__imagegen` für die experimentellen Bilder. Angefordertes/aktuelles Runtime-Modell dieses Chats: unbekannt; kein Modellwechsel veranlasst.

## Entscheidungen und Gründe

- Kurze Bewegungssegmente plus angehaltene, echte HTML-Produktansichten statt eines durchgehenden Videos: Lesetempo und DE/EN bleiben kontrollierbar.
- iPad wird von der Figur in die Kamera gehalten; die Kamera fährt auf **dieses** Gerät. Keine frei schwebende zweite iPad-Karte.
- Erzeugte Standbilder sind nur Pose-Referenzen. Kleine Unterschiede in Figuren und Requisiten verhindern direkten Einsatz als Animationsframes.
- Im lokal geprüften `assets/gradecrew` liegt die breite Szene als flaches PNG vor; es gibt Posenatlanten, aber kein nachgewiesenes Rig für eine flüssige Übergabe.

## Offene Probleme und Unsicherheiten

- Ob getrennte Originalebenen/Rigs in anderen Projektquellen liegen, ist nicht vollständig geprüft.
- Der konkrete Produkt-Screen für die nahen iPad-Ansichten muss anhand aktueller App-Oberflächen festgelegt werden; Storyboardtexte sind Musterinhalt.
- Timing der Gesten, Kamerafahrt und mobile Bildausschnitte sind erst mit einer bewegten Animatic belastbar.

## Nächster konkreter Schritt

Nach Martins Feedback zum V2-Storyboard **einen isolierten Animatic des ersten Zyklus** (Remy zeigt → naher iPad-Bildschirm hält an → Kamera fährt zurück → Übergabe an Emmi) erstellen und auf iPhone/iPad/Desktop prüfen. Erst danach die weiteren Zyklen animieren.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt / Zeitpunkt (UTC): Storyboard V2 am 13.10.2026 im lokalen Visualisierungsordner; diese Repo-Übergabe auf Aufgabenbranch.
- Gepushter Codecommit / Remote-Branch: kein Produktcode; Branch wie oben. Tatsächlichen letzten Dokumentationscommit frisch prüfen.
- Ungesicherte Änderungen / Checkout-Pfad: lokale Bild- und Markdown-Artefakte im oben genannten Visualisierungsordner; kein Repo-Checkout für App-Code geändert.
- Laufende oder unklare Vorgänge: keine bekannt.
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: Bildgenerierung über integriertes Werkzeug; keine ausgewiesene Kostenreservierung.
- Was darf noch nicht als erledigt gelten? Flüssige Animation, Produkt-UI, Geräteprüfung, Homepage-Integration, Deploy.
- Was muss vor Wiederholung geprüft werden? Aktuelle GitHub-Task/PR/Branch-Lage und vorhandene Bilddateien; frühere Generierung nicht blind wiederholen.
- Genau ein nächster ausführbarer Schritt: Martins Feedback zu den drei Präsentationsposen und zum Kameraschritt in den Animatic übertragen.
