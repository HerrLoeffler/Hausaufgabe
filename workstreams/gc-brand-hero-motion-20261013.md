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

## Freigabe und Arbeitsstart — Crew-Einblicke V2

Martin hat den vorherigen Plan ausdrücklich zur Umsetzung im **separaten Experiment** freigegeben. Task-ID bleibt GC-BRAND-HERO-MOTION-20261013. Lokaler eigener Pfad: `gradecrew-homepage-experiment-20261013/crew-previews-v2/`, Source-Referenz gc39@8f869790…; Originale bleiben unter assets/ und reference/ erhalten. Umfang: drei gezielte Remy-Farbedits (Hero, Tabletpose, Mikrofonpose), neue Coco/Remy-Demos, sichtbare Namensbuttons/Coco-Hinweis, statische DE/EN-Beispiele, manuelle Lesestopps. Emmi/Wilma aus dem bestehenden Demoablauf übernehmen. Keine Auth-, Account-, KI-Provider-, Assessment-, Homepage- oder Stagingverbindung; vollständiges Tutorial nur als verweisender Prototyp-Hinweis. Kein Deploy. Live Development Status38468683926 geprüft; bestehender Draft143 und der eigene Dokumentationsbranch bleiben erhalten. Ein lokaler Run darf nur diese statischen Dateien ausliefern. Ziel der Probe: erkennt man die Kurzeinblicke und versteht Coco/Remys Nutzen besser? Stop nach einer funktionsfähigen visuell geprüften V2; Nutzerurteil bleibt ausstehend. Originalbilder vom unveränderlichen Source-Commit als Kopien geladen. Bildgen built-in, keine API-/CLI-Providerläufe; drei geplante Farbedits, Ergebnisse/Prompts anschließend sichern.

## Gesicherte Umsetzung — Crew-Einblicke V2, 14.10.2026

Martins ausdrückliche Planfreigabe umgesetzt. Eigener isolierter Source-Checkout `/private/tmp/gc-crew-previews-v2-source-20261014`, weiterhin Branch `docs/gc-brand-hero-motion-20261013`; ausschließlich `art/gradecrew-homepage-experiment/crew-previews-v2/`, diese Übergabe und eigene TODO-Zeile. Keine Produktdateien, keine normale Homepage, keine Staging-/Productionänderung. Der reale Release-Train bleibt unverändert.

- Lokale bedienbare Fassung: `/Users/martin/.codex/visualizations/2026/10/12/01a130fa-babb-7de3-bfeb-785499e7c061/gradecrew-homepage-experiment-20261013/crew-previews-v2/`. `preview.html` ist ein selbständiges Offline-Bundle (12,7MB); modulare `index.html` via eigenem localhost-Server8779, Session36394. Die im Codex-Browser geöffnete Offline-Fassung ist als Deliverable markiert. Server ausschließlich127.0.0.1, keine Cloudveröffentlichung.
- Remy: drei integrierte Imagegen-Farbedits ausgeführt und als versionierte neue Dateien kopiert: Hero `exec-7ac5b243-6685-4f03-8f71-8cde0e31bd6d`, Tablet `exec-d710599e-d27d-4e4e-a9be-111d75ce4a34`, Mikrofon `exec-dfd6b12f-3a46-4a7a-a226-568ec2b48a51`. Originale erhalten. Prompts und12Assethashes gesichert. Kein CLI-/API-Fallback oder direkter kostenpflichtiger Provider-Smoke; ausgewiesene Kosten/Usage unknown.
- Coco: größeres originales Schnurtelefon, kleine Appansicht mit Hilfe unten rechts, Beispiel „Wie erstelle ich einen Test?“ und sichtbare Antwort samt hervorgehobenem „Neuer Test“. Die Hilfe im ersten Bild lässt sich selbst anklicken oder mit Weiter öffnen.
- Remy: Wunsch→erste Aufgabe→zusammenhängender3-Fragen-Entwurf, mit Beispielsatz. Einheitliches Hellblau auch in mobilen Namensportraits und Vorteilsleiste. Namensbuttons mit Abspielsymbol/„Kurz ansehen“, ruhige Coco-Sprechblase, expliziter Tutorialbutton. Emmi/Wilmas bestehende Renderbeispiele übernommen; gemeinsame Navigation/Kataloge erweitert. Das ausführliche Tutorial wird in dieser Vorschau nur erklärt und nicht gestartet.
- Manuelle Lesestopps, Zurück, Replay, nächste Figur, Escape/Fokusrückgabe. Reduced Motion erhält alle Inhalte. Neue UI-/Alternativtexte DE/EN. Auth/Testcode/Tutorial öffnen ausschließlich einen lokalen Hinweis; connect-src none und kein App-Backend.
- Vier Flow-Verhaltenstests zuerst gegen Original3x erwartungsgemäß rot, anschließend4/4grün; finaler Testlauf4/4grün und JS-Syntaxcheck erfolgreich. Lokaler Browserlauf1440×1000/820×1180/390×844: alle4Figuren, Coco/Remy DE/EN, Back/Replay, Tastatur/Reduced Motion, keine horizontalen Überläufe, keine JS-Fehler/fehlenden Dateien/externeRequests. `previews/verification.json` gesichert.
- Nach Browserlauf konkrete Verfeinerungen: Coco-Sprechblase aus Kopfbereich auf Tabletbreite verschoben; Beispielsatz im Entwurf ergänzt; Fokus nach Phasenwechsel auf neue Überschrift; zu helle Textgrautöne abgedunkelt; Alternativtexte übersetzt. Finale Offline-Fassung anschließend im echten Codex-IAB geladen, Remy0→1→2 und Fokus auf Schrittüberschrift beobachtet; Hero-/Crew-Einstiege sichtbar, kein fehlerhaftes Bundle. Frühere Screenshotserie zeigt den Stand des ersten Browserlaufs; finale kleinere Kontrast-/Satz-/Fokusänderungen sind nicht als neu fotografiert behauptet.
- Sechs repräsentative Kontrastpaare gemessen:4,89–14,15:1; keine pauschale WCAG-Zertifizierung. Relevante Auswahl SEC15/18 und PRIV12/13/14/15/19 im Artefakt-README mit lokalen Belegen/Grenzen. Kein Backend/Rules/Noten-/Upload-/Billingdatenfluss. Sicherheits-/Privacykataloge nicht global als erfüllt markiert.

**Stufe:** isolierter Branchcode plus lokale Browser-/Verhaltensprüfung, kein neuer CI-/Integrations-/Staging-/Geräte-/Nutzertestnachweis. Bildidentität kann kleine KI-Abweichungen haben. Echte iPads/iPhones, Safari und VoiceOver bleiben ungeprüft; Martin hat die fertigeV2 noch nicht bewertet. Angefordertes/actual Modell-Effort/Tokenkosten unknown, kein programmatischer Wechsel.

**Nächster Schritt:** Martin prüft in der lokalenV2 Remys Hellblau, Coco/Remys konkreten Nutzen und die Erkennbarkeit der Namensbuttons. Seine Entscheidung sichern; vor einer Produktübernahme braucht es einen neuen expliziten Auftrag. Keine automatische Übernahme oder weitere Bildgenerierung.

### Tatsächlicher Remote-Receipt V2

Source-Commit `2c85c13320bf649f567eb9b8c731070b114d6c63` auf `docs/gc-brand-hero-motion-20261013`, Source-Tree `3a0e81093f4fea87a507d44f7b31bd42f054aea5` ist identisch mit dem lokalen geprüften Snapshot-Tree. Sicherung über den bestehenden authentifizierten GitHub-Connector und normalen Fast-forward mit erwarteter Head-SHA; Remote-Ref anschließend gelesen und bestätigt. CLI-Push hatte keine GitHub-Anmeldedaten und schrieb nichts; lokale Commits08f5df1/6b05cfb bleiben nur Checkpoints, nicht Remote-Receipts. Kein Force-Push, keine main-/Integrationsbranchbewegung und kein Deploy. Der temporäre Sourcecheckout hat dadurch eine andere Commit-Historie bei identischem Tree; bei Wiederaufnahme erst diesen Receipt und aktuellen Remote-Head lesen, nicht blind seine lokalen Commits pushen. Finale Quellen unter `art/gradecrew-homepage-experiment/crew-previews-v2/README.md`. Offline-Bundle und PNG-Prüfbilder lokal, reproduzierbarer Bundler/Assets/Prompts/Prüf-JSON remote. Nutzerurteil und physische Geräteprüfung weiterhin offen.

## Autorisierter V3-Auftrag — 14.10.2026

Direkten Humanauftrag in GradeCrew Zentrale per read_thread bestätigt: bestehende Homepage **GENAU wie kanonisches Staging**, Emmi/Wilma unverändert. Neue Arbeit nur Coco/Remy-Kurzeinblicke und lokal synthetischer Konto-Einstieg am ausführlichen Tutorialende. Neue V3 ersetzt die V2-Homepageänderungen als Arbeitsrichtung; V2/Receipt2c85c133 bleiben erhalten. Vorschau im eigenen Ordner crew-previews-v3, keine Produktdateien/Deploys/Backend-/Accountwrites. Canonical public release.json lesend kopiert: gc39@8f8697901f8c1aea89897be855ca2872c82d0f2b. Main-Regeln/Status frisch gelesen; Development-Status38566455801success, SourceSHA da404c6f. Tatsächliche Source/Baseline-/Emmi-/Wilmahashes und Screenshotvergleich werden gesichert.

Remy: Englisch Klasse5, Farben mit Bildern und Hörfrage; ganzer konsistenter Beispieltest mit10Aufgaben, dann lesbare Bildfrage und spielbare Hörfrage. Englische Testinhalte bleiben bei DE/EN-Oberflächenwechsel englisch. Vorproduzierte lokale System-TTS vorgesehen, kein kostenpflichtiger Provider. Neue Tier-/Objektgrafik als zusammenhängender Atlas plus neues süßes Coco-Einladungsbild mit vorhandener Figur als Referenz über builtinImagegen. Coco-Kurzeinblick mit Original-Schnurtelefon und Hilfebeispiel. Konto-Folgestrecke als separat startbarer Tutorialabschluss-Pilot: Beide Gastaktionen Einstellungen/eigenerTest öffnen dasselbe Gate, übernehmen Tutorialname/Entwurf und Zielaktion; Cancel/Modewechsel verlieren nichts; synthetisch angemeldete Nutzende umgehen Gate. Nur lokale Demosimulation, keine echten Passwörter speichern/übertragen, keine neue Tutorialengine, bestehende reale Signup-/Einwilligungsregeln unangetastet.

Nächster Schritt: Originale Public-Entry-Erzeugung, CSS und Tutorialfinale/Signup-Code lesen; Baselinesnapshot und begrenzte lokale State-/Assetprobe erstellen. Verantwortlicher: alleiniger Designfachautor dieses Tasks. Modell/Effort/Usage unknown; keine Delegation, keine neue Budgetreservierung.


## V3 konkrete Vorschau gesichert — 14.10.2026

Source/Belege unter art/gradecrew-homepage-experiment/crew-previews-v3. Original gc39-StartmarkUp/Viewportfitter/EmmiWilmaRenderer unverändert, OriginalStyles nach I18n wieStartup installiert. Original gradecrewPage-/Headerhöhenkontext, finale Neumessung nach originaler gcEntryIn-Animation (anfänglichen8px-Versatz behoben). Zentraler unabhängiger tatsächlicher Live-Vergleich gleicherChrome1200×773 PASS: DE Start y78/h695, Header flex x568.203/width104.546, topbar-height78; vollständigeKlassenzimmerszene/4Namensbuttons/CrewCTA/Testcode/Benefits direktgesehen. LokalerBaseline/V3PixelvergleichStartregion1280×610 und E/WContent985×450 differenzlos. Erste falscheClipshots mit geladenenClassroomshots ersetzt. Zwischenzeitlicher falscher translateTree-Import erkannt und korrigiert; alteConsolemeldungen können über Reloads bestehen bleiben.

Coco3manuelleSchritte mit OriginalSchnurtelefon und konkreteFrage/NeuerTestHinweis. Remy4manuelleSchritte Wunsch→vollständiger EnglischKlasse5ColoursAnimalsTest10Aufgaben/14Punkte→Bildfrage→abspielbareHörfrage. GanzerTest und Beispiele zusammenhängend; DE/ENUI, TestimmerEnglish. Kein sichtbaresHörtranskript, originalWilmaPunktelabelunverändert.2builtinImagegenCalls (CocoJoin/6TiereAtlas) und lokaleSamanthaWAV5.470658s. Play paused=false/currentTime0.119156 imBrowsergesehen. Keine aktiveAIAnfrage.

SeparateFinaleFixture (keinFullTour): Mara+original10FragenÜbungstest; Gastcreate/settings jeweilsGate, Name/Entwurf/Ziel bei Modewechsel/Cancel/BrowserBack erhalten. KeineNamensneueingabe. SimulierterSignupbeiderZiele undpreauthcreateUI durchgeklickt, beideSkipmodelpaths getestet; nur@example.test, Passwort bei Wechsel/Abbruch/Submit/pagehide geleert, keineCredentials imZustandsmodell. WirklicheTour/Signup/Terms nichtangefasst, echteIntegrationoffen. CrewCTA führt inExperiment als Abkürzung zumklarbenanntenseparatenFinalepilot. Rückkehroptionen/AnmeldungnurDemosimulation.

14/14Tests grün; tatsächlicheIABBreiten1280/820/390, nativeAudioPlay, DE/EN/Tastatureinstieg/Escape/Fokus/keinehorizontalenDialogüberläufe. ReducedMotiontrue/false Modelltest, keineOS-/Safari-/VoiceOver-/physischenGeräteprüfung. Prüfnachweise in previews/verification.json, pixel-comparison.json, SHA256artifact-manifest, README/PROMPTS undOriginalsnapshot. ÄltereDialogshot-Hintergründe könnenfrüherenHeaderzeigen; aktuelleStart/CocoRemyDesktopshots enthaltenfinalStand.

Stufe branch_only mitlokalenTests; keinCI/Integration/Deployment/Nutzerabnahme. V2 SourceReceipt2c85c133 erhalten. OriginalTask/Budgethistorie erhalten, ModellEffort/Tokenkosten unknown, keineeigeneDelegation/neueBudgetreservierung. IsoliertesExperiment startet keineApp/Firebase/Tourengine. Eine direkteStagingReferenznavigation stelltebestehendeSitzung automatischwiederher, nurStyle/Pagekontext gelesen, keineprivateForm-/Test-/Profilaktion/Abmeldung ausgeführt; Referenztab geschlossen.

LokaleVorschau127.0.0.1:8780/ und tutorial-finale.html. Root /Users/martin/.codex/visualizations/2026/10/12/01a130fa-babb-7de3-bfeb-785499e7c061/gradecrew-homepage-experiment-20261013/crew-previews-v3. LoopbackserverSession30466 offen fürMartin; V2 Port8779Session36394 unberührt. UnabhängigerReview durchZentrale, nächsterSchrittvisuelleAbnahme. Kein neuerPlanfreigabestopp, keineautomatischeProduktübernahme. TatsächlicherRemoteSourceReceipt wird direkt nach Commit ergänzt.


### Tatsächlicher Remote-Receipt V3

Source-Commit **5a093ee403977146a09677903d70f44aee1530fe**, Tree **7db269eccb99070186829c5105dd6e71dc036041**, auf docs/gc-brand-hero-motion-20261013 gespeichert. Native GitHub-Blob/Tree/Commit-Sicherung, normaler Fast-forward mit erwarteter72994cf-Head-SHA; Remote-Ref frisch bestätigt.154Treeentries umfassen originaleReferenzdateien, neueV3Quellen, generiertePNG/WAV, BrowserJPEGs, Tests, Manifest, README/Prompts, eigeneTODOZeile/Handoff. LetzterTestlauf14/14grün. V2/Receipt2c85c133 nichtverändert. KeineCLIcredential-Reparatur, keinForcePush, keinmain-/Integrationsbranch-/Deploy-/Productionwechsel. TatsächlicherLiveStartabgleich derZentrale PASS; Nutzerurteil/physischeGeräte-/FullTourAuthintegration bleibenoffen. Finale Vorschau direkt reviewbar, keineweiterePlanfreigabe nötig.
