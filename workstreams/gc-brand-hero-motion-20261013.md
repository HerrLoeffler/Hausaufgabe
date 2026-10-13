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

## Fortschreibung 13.10.2026 — abspielbarer Animatic v1

Martin hat die bewegte Gesamtprobe ausdrücklich beauftragt und präzisiert: **ein iPad, auf allen Stationen gleich groß**, genügend Lesezeit. Der frühere nächste Schritt „nur erster Zyklus“ ist durch diesen Auftrag überholt. Die frühere Kamerafahrt/Vergrößerung des Geräts ist für diesen Test verworfen; stattdessen wird der Tablet-Inhalt darunter lesbar gespiegelt.

- Isolierte lokale Artefakte: `/Users/martin/.codex/visualizations/2026/10/12/01a130fa-babb-7de3-bfeb-785499e7c061/gradecrew-homepage-experiment-20261013/animation-animatic-v1/` mit `index.html`, `animatic.js`, fünf experimentellen Bildplatten, sechs Desktop-Prüfbildern, einem Mobile-Prüfbild, `gradecrew-crew-animatic-v1.mp4` und `README.md`.
- Tatsächlich exportiert: 480 Frames, 1280 × 1052, 12 fps, 40,0 Sekunden; MP4 ~18 MB. Dauer ist ein Test für Verständlichkeit, kein Homepage-Commitment.
- Inhalt: Remy erstellt Frage 1 zum Nomen im Satz „Der kleine Igel schläft.“; Emmi ergänzt passende Frage 2 nach dem beschreibenden Wort, ohne die erste zu ersetzen; Wilma zeigt **Beispielantworten** und beispielhaft 2/2 Punkte. Eine physische Tablet-Ebene wechselt Remy → Emmi → Wilma.
- Geprüft: dieselbe berechnete Tablet-Breite 174,078 px in sechs Desktop-Szenen; DE/EN-Umschaltung und Weiterschalten im lokalen Browserlauf; 390-px-Ansicht ohne horizontalen Überlauf. Mobile Tablet-Details selbst sind klein, der Textbereich trägt die Lesbarkeit. Keine echten iPad-/iPhone-Gerätetests.
- **Qualitätsgrenze:** fünf separat erzeugte KI-Schlüsselbilder überblenden sichtbar; Hände greifen das Tablet noch nicht physisch glaubwürdig. Das iPad wirkt teils auf dem Tisch. Der Animatic prüft Erzählfolge und Timing, nicht finale Figurenanimation. Die Beispiel-UI ist kein echter App-Screenshot.
- Keine Änderungen an Homepage, normalem Staging, Production, Tutorial oder Registrierung. Keine PR, kein Deploy. Der Stand verbleibt als lokaler visueller Entwurf plus diese Dokumentation auf dem Aufgabenbranch.

**Nächster Schritt:** Martin sieht den 40-Sekunden-Animatic und bewertet Story, Lesetempo und Gesten. Falls die Richtung trägt, eine einzelne Übergabe mit konsistentem Figuren-Rig/Vordergrundhänden als Qualitäts-Pilot ausarbeiten; echte Produktansichten erst gegen die aktuelle Oberfläche abgleichen. Danach über eine spätere Homepage-Integration gesondert entscheiden.

## Folgeplanung — Remy-Farbe, Coco/Remy-Kurzeinblicke und Auffindbarkeit

**Auftrag:** Martin bittet anhand von vier Screenshots zunächst um einen konkreten Umsetzungsplan. Remy soll überall im Homepage-Experiment leicht hellblau sein; Coco und Remy sollen in ihren Kurzeinblicken stärker durch sichtbare Handlung überzeugen. Cocos Schnurtelefon gefällt ausdrücklich. Klären, wie die anklickbaren Namen erkennbar werden und wie der Einstieg zum vollständigen Tutorial damit zusammenspielt. Nur Planung; bestehende Experimentgrenze und fehlende Deployfreigabe gelten weiter.

**Owner/Rolle:** ausführender Designfachchat dieses bestehenden Tasks; Zusammenhang mit GC-DESIGN-05. Keine Zentrale und keine Übernahme fremder aktiver Produktarbeit. Ausgangsquelle: App-Integration `8f8697901f8c1aea89897be855ca2872c82d0f2b` (dokumentiertes gc39), Dateien `gradecrew-hero-copy.mjs` (Blob 88c79a9…), `gradecrew-hero-demo.mjs` (ccd5709…), `gradecrew-hero-demo-flow.mjs` (06d1c91…). Fresh-main START_HERE/AGENTS/STATE/TODO/CHAT_CONTRACT und Workstreams gelesen. Aktueller Development-Status-Run 38468683926 success, Job115541836531 gelesen. Alter Draft PR143 bleibt offen/unmerged, Head c7933c6e…; die dortige Homepage-Referenz nicht blind neu bauen oder integrieren. Central-Taskantwort für GC-DESIGN-05 verweist auf ältere Quelle und ist nicht als aktueller Codestand übernommen.

**Beobachtung:** Coco besteht im aktuellen Demo-Code aus drei Textseiten und kleinen Portrait-/Symbolkombinationen. Remy zeigt zunächst eine Sprachnotiz, anschließend eine statische Aufgabe und weitere Aufgabenzeilen. Der Flow wechselt bei Remy automatisch nach1800ms, bei Coco nach4800ms. Die Namen sind bereits echte Aktionen; die vorliegende Klickhinweis-Kopie nennt nur Remy, Emmi und Wilma. Die beigefügten Screenshots belegen Remys unterschiedliche Erscheinung (blauer Footer, graue Szene/kleines Tabletportrait).

**Vorgeschlagene, noch nicht freigegebene Designentscheidung:**
- Namen als sichtbare Buttons mit Name, Rolle, kleinem Abspielsymbol und „Kurz ansehen“; ganze Figur bleibt optionaler Zeiger-/Touch-Einstieg, gleicher Dialog, kein doppelter Tastaturstopp.
- Kleine Coco-Sprechblase: „Lerne uns kurz kennen – wähle einen Namen.“ Kein automatisches Audio und keine ständig blinkenden Hinweise.
- Hauptbutton eindeutig „Tutorial starten“, Unterzeile „Ohne Konto · ca.6–7Minuten“. Das ausführliche Tutorial, Registrierung am Ende und Beginn der siebentägigen Probezeit danach behalten ihren bestehenden Ablauf.
- Designurteil nach Auffindbarkeit, Klickaufwand und Ruhe: nur Namen4/10; nur Tutorial6/10; klare Namensbuttons plus Coco-Hinweis und sichtbares Tutorial9/10. Subjektive Planbewertung, kein gemessener Nutzertest.

**Konkrete Ausarbeitung nach Freigabe:**
1. Inventar der im Homepage-Experiment tatsächlich verwendeten Remy-Bilder und Einstiegspfade aus geprüftem aktuellen Appstand anlegen. Relevante Originale kopieren; keine Live-/Staging-Dateien austauschen.
2. Eine Remy-Farbreferenz festlegen: sanftes, entsättigtes Hellblau; vorläufige Orientierungswerte Grundton#B7D6ED, Licht#DAEBF7, Schatten#7EA8C7. Die Werte sind Art-Direction, keine pauschalen Bildfilter. Pinke Ohrinnenseiten, Gesicht, Augen, Textur, Pose und Beleuchtung erhalten. Zuerst eine Vergleichsprobe der Hero-Szene und einer Einzelpose, dann alle im Experiment verwendeten Varianten konsistent bearbeiten. Keine vollständige Neugenerierung der Szene.
3. Coco: großes Original-Schnurtelefon-Motiv plus kleine beispielhafte Appansicht. Drei konkrete Momente: Coco unten rechts entdecken → Beispiel „Wie erstelle ich einen Test?“ → kurze hilfreiche Antwort und markierter Einstieg „Neuer Test“. Demonstration als Beispiel kennzeichnen; keine echte Anfrage/API/Audioaufnahme. Weniger Selbsterklärung, mehr sichtbarer Nutzen.
4. Remy: größer und aktiv eingebunden. Drei konkrete Momente: Beispielwunsch „Deutsch, Klasse3, Wortarten mit einem Igel“ → passende erste Aufgabe entsteht → weitere Aufgaben erscheinen als zusammengehöriger Entwurf. Fach/Klasse/Thema sichtbar mit Ergebnis verbinden. Vorbereitete Demo statt echter kostenpflichtiger Generierung. Tatsächliche Aufgabentypen anhand Produktcode erhalten.
5. Einheitliche Dialoggestaltung für alle vier Figuren. Kurze sichtbare Bewegung innerhalb einer Phase, dann Lesestopp bis „Weiter“; „Zurück“, „Nochmal ansehen“ und Schließen. Coco/Remy heben sich durch ihre konkrete Handlung ab; Emmi/Wilma bleiben visuelle Referenz. Kein Umbau des ausführlichen Tutorials. Alle neuen Texte in bestehendem DE/EN-Katalog; kein Text in Bilddateien.
6. Isolierte lokale Browserprobe: Desktop, Schul-iPad- und iPhone-Breite, Touchziele/Fokus/Enter/Leertaste/Escape/Fokusrückgabe, Reduced Motion, langes Englisch, Inhalt ohne Animation, keine Provideraufrufe und kein horizontaler Überlauf. Physische Geräteabnahme getrennt. Erfolg: neuer Betrachter erkennt ohne Erklärung die Kurzeinblicke, kann sie vom vollständigen Tutorial unterscheiden und sieht pro Figur einen konkreten Nutzen.

**Risiken/offen:** Maskierung und Farbangleichung im flachen Hero-PNG müssen Detailtreue beweisen. Eine ruhige Sprechblase kann im Bild Platz beanspruchen; mobile Platzierung muss geprüft werden. Die Automatikänderung betrifft nur Homepage-Kurzeinblicke, nie die bestehende ausführliche Tour. Kein Budget/Versuch zurückgesetzt; in diesem Folgeblock keine Bildgenerierung, kein Produktcode, kein Build, kein Deploy.

**Nächster Schritt:** Martin beurteilt diesen konkreten Plan. Danach in der bestehenden isolierten Vorschau zuerst Remy-Farbvergleich und Coco-Kurzeinblick als zusammenhängenden visuellen Entwurf herstellen. Angefordertes Modell/Effort im aktuellen Desktopturn unknown; tatsächliche Laufzeitwerte unknown; kein programmatischer Modellwechsel.
