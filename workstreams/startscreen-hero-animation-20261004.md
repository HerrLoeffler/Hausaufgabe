# GradeCrew – Startscreen Hero Scene + First-Visit-Animation

- Task: GC-DESIGN-05
- Stand: 2026-10-04
- Integrationsziel: feature/gradecrew-app-integration
- Production: unverändert

## Nutzerziel

Der derzeitige v4-Preview erfüllt Struktur, i18n und technische Stabilität, erreicht aber die gewünschte visuelle Markenwirkung des bestätigten Referenzbilds deutlich nicht.

Ziel des nächsten Passes ist eine echte, emotional inszenierte GradeCrew-Hero-Szene statt weiterer CSS-Möbel-/Karten-Politur.

## Warum der bisherige Ansatz nicht reicht

1. Der v4-Auftrag durfte nur einen isolierten CSS-Polish-Layer ändern.
2. Die gewünschte Referenz lebt von konsistenter Illustration, Licht, Perspektive, Raumtiefe und einer gemeinsam komponierten Crew-Szene.
3. Getrennte Mascot-Cutouts plus geometrischer CSS-Raum können diese Kohärenz nur begrenzt nachbilden.
4. Der Guardian-Designreview arbeitet aktuell primär text-/codebasiert; das Referenzbild selbst ist kein verbindlicher visueller Input im Review-Gate.
5. Die aktuelle Markenregel bewahrt kanonische Crew-Assets. Ein homepage-spezifisches inszeniertes Szenenmotiv oder neue Crew-Varianten ist daher eine bewusste Brand-Entscheidung und kein stiller CSS-Fix.

## Animation – empfohlene Richtung

Eine kurze First-Visit-Sequenz ist sinnvoll, wenn sie als Markenmoment und nicht als Ladebarriere umgesetzt wird:

- Dauer grob 2,5–4 Sekunden.
- Coco öffnet die Tür / kommt als Gastgeber in die Szene.
- Remy, Emmi und Wilma haben kleine, ruhige Hintergrundbewegungen.
- UI/CTA wird schnell nutzbar und nicht durch die Animation blockiert.
- kein Autoplay-Audio;
- jederzeit überspringbar;
- bei prefers-reduced-motion keine Sequenz;
- nach dem ersten Besuch statischer Hero oder nur sehr dezente Idle-Motion;
- lokal merken, ohne Account- oder Schülerdaten;
- Mobile erhält eine kürzere/reduzierte Variante.

## Internationalisierung

Nicht verhandelbar:
- alle sichtbaren Texte bleiben im DOM/i18n-Katalog;
- keine deutsche/englische Copy in Background-Illustrationen, Videos oder Canvas-Animationen einbrennen;
- UI-Sprache, Test-/Inhaltssprache und Bewertungssprache bleiben getrennt;
- DE/EN muss auch während/nach Intro vollständig funktionieren.

## Canva

Canva ist verbunden. Im Konto ist mindestens ein Brand Kit verfügbar; aktuell wurde kein bestehendes Design mit Titel/Match "GradeCrew" gefunden.

Canva soll als **Art-Direction-/Prototyping-Werkzeug** verwendet werden:
- mehrere visuelle Hero-Kompositionen erzeugen;
- ggf. Brand Kit / Logo / Farbwelt anwenden, nachdem das richtige Brand Kit bestätigt ist;
- finalen Favoriten als Referenz für die Web-Implementierung nutzen.

Canva ersetzt nicht die responsive Web-Implementierung. Die finale Website benötigt getrennte DOM/UI-Layer, i18n, Accessibility und Performance-Gates.

## Brand-Entscheidung – GradeCrew Cinematic / Hero Crew

Martin hat die Idee ausdrücklich freigegeben: Für Marketing-/Startseiten darf es eine **GradeCrew Cinematic / Hero Crew** geben.

Verbindliche Grenzen:
- Coco, Remy, Emmi und Wilma bleiben eindeutig dieselben kanonischen GradeCrew-Charaktere;
- Farben, Gesichter, Körpermerkmale und Persönlichkeit bleiben konsistent;
- auf Marketing-/Startseiten dürfen sie zusätzliche **Props, Kleidung, Posen und gemeinsame Szenen** bekommen;
- solche Varianten sind saisonal/austauschbar, z. B. Winter mit Schal oder Sommer mit Sonnenbrille;
- im eigentlichen Produkt/App-UI bleiben die reduzierten kanonischen Assets Standard;
- neue Hero-Varianten dürfen die Figuren nicht in ein anderes Character-Design umdeuten.

Für den ersten Hero-Pass sind zusätzliche Accessoires nicht zwingend: Entscheidend sind zunächst Szene, Licht, Perspektive, Größenverhältnisse, Tiefenstaffelung, gemeinsame Komposition und Bewegung. Die Cinematic-Regel schafft aber bewusst Spielraum für spätere saisonale Szenen.

## Nächster ausführbarer Schritt

Mit Canva und/oder Bildgenerierung 3 klar unterscheidbare Hero-Art-Directions aus dem bestätigten Referenzbild entwickeln, **noch ohne Web-Code umzubauen**. Martin wählt eine Richtung. Erst danach wird die responsive Scene-/Animation-Architektur umgesetzt.


## Wiederaufnahme 06.10.2026 – Referenztreue vor weiterem Web-Polish

### Auftrag und Zuständigkeit

- Bestehende Task-ID: GC-DESIGN-05; keine neue Design-Aufgabe und kein Zurücksetzen früherer Versuche.
- Nutzerauftrag: anhand des erneut angehängten Wunschbilds einen sauberen Weg zu einer hochwertigen Startseite beurteilen. Coco an der Tür, gemeinsame Crew im Klassenzimmer, spätere Türöffnung und saisonale Varianten.
- Vorheriger Chat: Design GC (6ac039dc-174c-83ed-8b2b-244fc51e5a36); bei Prüfung idle.
- Aktueller Planungs-Chat: Erstelle drei Hero-Art-Directions (01a10e51-7f71-7bb3-9390-d8637367bb66); keine fremde Code-Baustelle übernommen.
- Prüfmoment: 2026-10-05 23:09 UTC / 06.10.2026 Europe/Berlin.
- Dokumentationsbranch: docs/gc-design-05-reference-plan-20261006; Ziel main. Spätere Web-Umsetzung weiterhin nach feature/gradecrew-app-integration.
- Folgende Gestaltung ist eine begründete Empfehlung, noch kein vom Nutzer ausgewählter visueller Master und keine freigegebene Implementierungsspezifikation.

### Frisch geprüfte Belege und Grenzen

- main steht auf 8360bc5f056837118ffd83138ffa2468ae42647e; PR #128 ist merged und enthält nur die Brand-/Dokumentationsentscheidung.
- Jüngster gelesener Development-Status-Lauf 37385986317: success; Job 112019259840 samt Auditbericht gelesen. Das Audit enthält weiterhin Warnungen zu Branch-Zuordnung und Überschneidungen; Grün ist keine visuelle Abnahme.
- Offene PRs frisch gelesen: #118 ist ein alter Guardian-v4-Draft, keine neue Hero-Szene. Keine neue bezahlte Bau-Runde oder Wiederholung gestartet.
- Canva-Referenz tatsächlich gefunden und Metadaten abgerufen: DAHXHxRbcDg, „GradeCrew Startscreen v4 – Canva reference“, eine Seite. Die ältere Aussage oben „nicht gefunden“ ist damit überholt. Einzelne editierbare Szene-/Figurenebenen sind dadurch nicht nachgewiesen.
- Die visuelle Analyse dieses Blocks bezieht sich auf den vom Nutzer angehängten Screenshot. Kein aktueller Staging-Browservergleich oder neuer Gerätetest in diesem Block.
- Bestehende State-Datei nennt bb91ce3590d773472ece60c4dd881da729bd32c1 für den Release Train staging-batch-2026-10-04-b. Dessen Deploy-Receipts wurden in diesem Planungsblock nicht erneut unabhängig verifiziert.
- Ungesicherte Änderungen des alten Chat-Checkouts: unbekannt. Dieser Block ändert ausschließlich Dokumentation über GitHub.
- Frühere Provider-/Budgethistorie bleibt erhalten: GC-DESIGN-03 unbekanntes Ergebnis, 2,40 USD reserviert bei 2,55 USD Deckel laut TODO; keine neue Reservierung, kein Retry und kein Guardian-Dispatch.

### Warum das Wunschbild funktioniert

Coco ist groß und nah am Betrachter, links an einer geöffneten Holztür. Remy, Emmi und Wilma stehen kleiner weiter hinten. Überlappungen, gemeinsame Perspektive, weiches warmes Licht und Kontaktschatten verbinden Figuren und Raum. Der helle obere/mittlere Bereich trägt die Überschrift; Details konzentrieren sich an den Rändern. Diese Beziehungen sind die Qualitätsreferenz. Die abgebildete Browserleiste gehört nicht zur Website.

Ein CSS-Polish kann weder einen fehlenden gemeinsamen Kamerawinkel noch falsch beleuchtete Einzelbilder reparieren. Der bestehende Handoff belegt zudem, dass das Referenzbild bisher kein verbindlicher visueller Input im Guardian-Gate war.

### Empfohlener Aufbau

1. Hochwertige, textfreie gemeinsame Raumszene produzieren; Kamera, Licht und Figurenproportionen zusammen festlegen. Kanonische Figurenreferenzen vor Produktion prüfen, nicht nur aus Tiernamen neue Figuren erzeugen.
2. Für die Quelle bewegliche Teile von Beginn an getrennt anlegen: vollständiger Raum hinter der Tür, Tür/Rahmen, Coco, weitere Crew und notwendige Vordergrundmasken/Schatten. Gemeinsam komponieren; wahllos zusammengesetzte Cutouts vermeiden. Ein abgeflachter Screenshot liefert diese verdeckten Bildbereiche nicht.
3. Statische Web-Ausgabe darf für Geschwindigkeit zu wenigen Bildern zusammengefasst werden. Bearbeitbare Quelldateien bleiben erhalten. Logo, Überschrift, Rollenbezeichnungen, Buttons, Testcode-Eingabe und auch Schrift auf Schild/Tafel als echte UI/übersetzbare Ebene; keine deutsche Copy ins Szenenbild einbrennen.
4. Desktop und schmale Geräte erhalten bewusst angepasste Kompositionen. Mobile darf den Ablauf stapeln und soll Gesichter, Texte und Schülerzugang erhalten. Keine erzwungene identische Pixelanordnung auf allen Bildschirmformaten.
5. Spätere Türöffnung als separat produzierte kurze Animation mit passendem statischem Endbild. Ein Standbild lässt sich nicht durch CSS allein glaubwürdig in eine greifende/öffnende Figur verwandeln. Für kontrollierte Gelenkbewegungen und wiederholbare Kamerafahrten geeignete Animationsquellen bzw. geriggte 3D-Modelle prüfen; aus vorhandenen PNG/SVG-Dateien kein vorhandenes Rig ableiten.
6. Saisonale Motive als zusammengehörige Varianten mit festen Positionen/Freiraum für die UI: z. B. identische Grundszene mit passendem Coco-Schal. Schatten und Verdeckungen mitprüfen; Accessoire-Tausch ist nicht immer ein einzelnes Overlay.
7. Bestehende Login-/Registrierungs-/Testcode-Abläufe weiterverwenden. Hero-Bild darf sofort erscheinen; optionale Bewegung lädt ergänzend. Vorgaben oben für Reduced Motion, Skip, Folgebesuche und fehlendes Audio bleiben bestehen.

### Vergleich der Wege – Empfehlung, kein gemessener Qualitätswert

Gleiche Kriterien: Nähe zum Wunschbild, verlässliche Wiederverwendung und angemessener Aufwand für den ersten überzeugenden Startscreen.

| Weg | Eignung | Stärke / entscheidende Grenze |
|---|---|---|
| Weiterer CSS-Raum mit bestehenden Einzelbildern | 3/10 | Schnell anpassbar, löst gemeinsame Beleuchtung/Perspektive nur begrenzt. |
| Gemeinsam gestaltete Szene + echte Web-UI | 9/10 | Beste Balance für den statischen Ziel-Look; benötigt hochwertige Bildquellen und eigene mobile Komposition. |
| Vollständige 3D-Produktion mit geriggter Crew | 7/10 für den ersten Pass | Beste Kontrolle für komplexe spätere Bewegung; Modelle/Rigs sind nicht nachgewiesen, höherer Anfangsaufwand. Muss nicht als Echtzeit-3D im Browser laufen. |

### Drei Bildrichtungen konkretisieren

- A „Willkommen im Klassenzimmer“: verbindlich engster Referenzvergleich; Coco groß links mit Türkontakt, warme Klasse und Crew dahinter, helle Textzone oben/rechts. Empfohlener Ausgangspunkt.
- B „Ruhiges Lernatelier“: gleiche Figurenidentität und einladende Grundidee, weniger Requisiten, ruhigere Farben/Flächen, stärkerer Fokus auf Lesbarkeit. Nicht als automatische Verbesserung gegenüber Martins Wunschbild behandeln.
- C „GradeCrew World“: wiedererkennbare Tür als Portal zur eigenen Lernwelt, Raum und Crew als wiederverwendbare Basis für Jahreszeiten. Mehr Eigenständigkeit, daher größtes Risiko einer erneuten Entfernung von der Vorlage.
- Vorschlag: A als verbindlichen Referenzentwurf zuerst ausarbeiten; B/C dienen einer bewussten Auswahl, nicht einer erneuten endlosen Stilfindung. Canva dient Vergleich/Komposition; reine Importbestätigung ersetzt weder Szenenproduktion noch Web-Umsetzung.

### Abnahmekriterien vor Integration

- Statischer Entwurf gegen das angehängte Zielbild bei gleichem Bildausschnitt vergleichen: Coco-Größe, Türkontakt, Tiefe, Blickführung, Licht und Materialwirkung einzeln beurteilen.
- Alle vier Figuren an kanonischen Referenzen prüfen; keine unbemerkten Gesichts-/Farb-/Körperänderungen.
- Keine schwebenden Füße, widersprüchlichen Schatten, fehlerhaften Hände/Flügel, weißen Freistellränder oder Textartefakte.
- Gewählten Master in echten Browser-Screenshots auf Desktop, iPad und schmalem Phone prüfen; DE/EN, längere Texte, Tastatur, Fokus, Testcode und Login einschließen.
- Ladeverhalten und Layoutsprünge auf langsamem Mobilnetz messen; Grafikqualität und Kompression gemeinsam abnehmen. Noch keine Leistungswerte behaupten.
- Visuelle Abnahme separat von Code-/CI-Erfolg dokumentieren. Derselbe geprüfte Commit muss im Preview nachvollziehbar sein. Martin entscheidet über den visuellen Master und die spätere optische Abnahme.

### Status und genau ein nächster ausführbarer Schritt

Nur Planungs-/Übergabedokumentation; keine neuen Hero-Assets, kein Web-Code, keine Animation und kein Deploy erstellt. Release-Stufe der bestehenden Web-App unverändert; Production durch diesen Block nicht verändert. Neuer Dokumentationsstand branch_only bis separat geprüft/integriert.

Nächster Schritt: mit Screenshot plus kanonischen Figurenreferenzen den statischen Entwurf A als ersten der drei vergleichbaren Hero-Entwürfe produzieren und bei gleicher Ansichtsgröße vorlegen; anschließend B/C im selben Vergleichsformat. Erst nach Auswahl des visuellen Masters Implementierung spezifizieren.

Technische Referenzen: [responsive Bildkomposition](https://web.dev/articles/responsive-images), [Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).
