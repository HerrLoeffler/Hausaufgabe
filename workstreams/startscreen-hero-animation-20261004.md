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

> Historischer erster Vorschlag. Produktionsweg und nächster Schritt werden durch die nachfolgende Korrektur „Blender als Szenenquelle“ präzisiert. Die frühere 7/10-Bewertung gewichtete den ersten statischen Pass; sie ist keine Bewertung des langfristigen Animations-/Saisonziels.

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

## Korrektur 06.10.2026 – Blender als Szenenquelle

**Priorität nach Nutzerfeedback:** Nicht weiter Canva-zentriert planen. Die Produktionsgrundlage für bewegliche, saisonal veränderbare Figuren konkret prüfen. Sämtliche Texte bleiben übersetzbare Web-Bausteine. Die frühere Empfehlung ist in diesem Punkt unvollständig gewesen; diese Ergänzung ist die aktuelle Planungsempfehlung.

### Geprüfter Istbestand

- Vollständiger, nicht abgeschnittener GitHub-Dateibaum des Integrationscommits bb91ce3590d773472ece60c4dd881da729bd32c1: keine Dateien mit .blend, .glb, .gltf, .fbx, .obj, .usd oder .usdz. Das beweist keine Abwesenheit von Modellen außerhalb dieses Branches/Projekts.
- Lokale Projektdateien ebenfalls ohne diese Modellformate. Keine Blender-Anwendung im PATH, in /Applications, ~/Applications oder beim Spotlight-Aufruf für org.blenderfoundation.blender gefunden; keine Installation vorgenommen.
- Plugin-Suche „Blender“ ohne Treffer. Breitere 3D-/Meshy-/Tripo-Suche liefert keinen eindeutig geeigneten Modellierungs-/Rigging-Connector. Keine ungeprüfte Drittanbieter-Integration vorgeschlagen. Katalogsuche ist nicht vollständig.
- Vier kanonische Figuren visuell geprüft: SVGs enthalten jeweils einen WebP-Bildatlas mit sechs Posen. Es sind Rasterbilder, keine 3D-Geometrie oder beweglichen Skelette. Lokale Quelldateien stimmen über Git-Blob-Hashes exakt mit dem Integrationsstand überein:
  - Coco / penguin-guide.svg: 0afd5518acb78faa4de6c4f60b6bf58373c445c0
  - Remy / elephant-create.svg: 0931ddbf4fd1f19dc1d676810eee037264a58eb3
  - Emmi / fox-improve.svg: ae7bc1b26bd03e31d1df2842fae2bc6c5dc9fb69
  - Wilma / owl-grade.svg: f6ac88af08d9a110abb80c995c6a5901b2068127
- Referenzkopien ohne Bildbearbeitung aus diesen Dateien extrahiert: analysis/GC-DESIGN-05/reference-assets/ im lokalen Projektspiegel. Das sind vorhandene Bilddaten, keine neuen Entwürfe.
- Kanonischer Coco ist dunkelblau/creme mit dunklen Augen; Wunschbild liefert Raum-/Lichtregie, nicht automatisch neue Augenfarbe oder Figurenproportionen.
- Prüfergebnisse für früheren Dokumentationscommit 1bcf514: handoff und Live branch / PR audit success. Kein Blender-Render und keine App-Prüfung daraus ableiten.

### Produktionsentscheidung: Quelle und Browserausgabe getrennt bewerten

**Empfehlung: bearbeitbare Blender-Masterszene mit echten Figurenmodellen; zunächst offline gerenderte Web-Ausgabe plus HTML/i18n.** Nicht „Screenshot als Website“, nicht „PNG in Blender importieren und als echtes 3D ausgeben“.

Blender wird Quelle für Geometrie, Materialien, Kamera, Licht, Figuren-Rigs, Türbewegung und saisonale Objekte. Raster-Bildgenerierung ist für Lookentwicklung, Modellreferenzen und gegebenenfalls Texturen hilfreich; sie liefert allein weder ein konsistentes Rundum-Modell noch ein Rig. Ein automatisch erzeugtes Modell wäre ein Kandidat und müsste auf Silhouette, Rückseite, Topologie, Materialien und Verformung geprüft werden.

Gleiche Kriterien für das jetzt ausdrücklich betonte Langfristziel: Referenztreue, glaubwürdige Bewegung, saisonale Wiederverwendung und stabile Browserbedienung.

| Weg | Einschätzung | Grenze |
|---|---|---|
| 2D-Bildteile bewegen, ohne echte Figurenmodelle | 5/10 | Für Winken/leichte Verschiebungen brauchbar; Greifen, Drehen und Gehen bleiben eingeschränkt. |
| Blender-Masterszene → vorberechnete Bilder/Animation + HTML | 9/10 | Hohe Kontrolle über Fell/Licht und reproduzierbare Varianten; Modellierung und Rigging nötig, neue Bewegungen müssen gerendert werden. |
| Blender-Masterszene → optimiertes Echtzeit-3D + HTML | 8/10 | Interaktive Figuren/Kamera möglich; zusätzliche Material-, Export-, Leistungs- und Geräteprüfung. Blender-Renderqualität nicht automatisch durch glTF-Export erhalten. |

Diese Bewertungen sind begründete Empfehlungen, keine gemessenen Qualitätswerte oder Vollständigkeitsangaben. Blender als Produktionswerkzeug und Echtzeit-3D als Browsertechnik sind keine identische Entscheidung.

### Lieferbare Bausteine und Verantwortung

| Baustein | Bearbeitbare Quelle | Browser |
|---|---|---|
| Raum, Tür, Licht, Crew | .blend mit benannten Objekten, Materialien und Kameras | Textfreies Poster und gerenderte Sequenz; bei später bewiesenem Bedarf glTF/WebGL |
| Figurenbewegung | Rigs für Körper, Flügel/Pfoten, Kopf; Gesichtssteuerung nach Bedarf | Exportierter Clip; stabile Endpose/Fallback |
| Sommer/Winter | Separate Props/Collections am selben Modell, definierte Kameras | Zusammengehörige versionierte Szenenvariante |
| Logo, Überschrift, Rollen, CTAs, Schülercode | Zentrales Brand-Manifest und HTML/i18n | Semantische, bedienbare Web-Elemente |
| Tafeln, Türschild, Papierbeschriftung | Unbeschriftete Flächen im Render; Text in i18n | Web-Text an definierten Ankern; Text auf bewegter Tür vermeiden oder erst nach deren Stillstand einblenden |

Die Szene wird als Ganzes physikalisch zusammenhängend beleuchtet. Getrennte Render-Layer sind für Nachbearbeitung sinnvoll, aber Schatten/Verdeckungen müssen gemeinsam stimmen. Nicht jede Figur braucht einen separaten transparenten Video-Player: unkoordiniertes Abspielen mehrerer Ebenen erzeugt Synchronisations-, Alpha- und Ladeprobleme. Ein textfreier gemeinsamer Szenenclip kann die Bewegung kohärent zeigen, während alle Texte unabhängig bleiben. Die Blender-Quelle bleibt vollständig editierbar.

### Nächster Qualitätsnachweis: Coco-und-Tür-Pilot

Empfohlener erster Produktionsschritt statt drei unverbindlicher Canva-Stilbilder: eine einzige Referenzeinstellung in Blender mit Coco, Tür, Raumlicht und einer Platzhalterposition für die spätere Crew.

1. Kanonische Coco-Ansichten als verbindliche Modellvorlage verwenden. Neue Seiten-/Rückansichten sind Entwurfsannahmen und müssen zur Front passen.
2. Coco modellieren, texturieren und riggen. Flügelkontakt an Tür/Klinke, Kopfwendung und zwei Schritte prüfen; keine durchdringenden Körperteile, schwebenden Füße oder Gesichtsdrifts.
3. Drei überprüfbare Zustände liefern: Tür fast geschlossen, Türöffnung, endgültige Begrüßungspose. Dazu ein kurzer gerenderter Bewegungsclip und die echte .blend-Quelle.
4. Licht-/Materialtest im Ausschnitt neben dem Wunschbild prüfen. Erst wenn dieser Ausschnitt trägt, die restliche Crew und den vollständigen Raum ausarbeiten. Platzhalter sind keine finale Markenqualität.
5. Gleiche Szene in Desktop- und schmaler Kameraansicht planen. Web-Textzonen von Anfang an freihalten. Die Website darf jederzeit übersprungen, bedient oder ohne Bewegung genutzt werden.
6. Nach dem Pilot die Browserausgabe anhand echter Qualität und Lade-/Gerätemessungen festlegen. Startpräferenz: gerenderte Szene für den filmischen Look, Echtzeit nur bei zusätzlichem belegtem Interaktionsbedarf.

Blender ist derzeit in dieser Umgebung nicht ausführbar nachgewiesen. Für den Produktionspilot braucht es eine ausführbare Blender-Installation oder einen ausdrücklich gewählten Renderzugang. Es wurde kein Installations-/Renderauftrag ausgelöst und kein fertiges 3D-Modell behauptet. Das aktuelle Ergebnis ist die überprüfte Produktionsentscheidung mit Asset-Inventar und Pilot-Abnahmekriterien. Kein neues Nutzungsbudget, kein Guardian-Retry, keine Website-Änderung und kein Deploy.

**Genau ein nächster ausführbarer Schritt:** Blender als ausführbare Produktionsumgebung bereitstellen/verifizieren; danach den oben begrenzten Coco-und-Tür-Pilot auf derselben GC-DESIGN-05-Aufgabe ausführen. Die früher vorgeschlagenen drei Stilrichtungen sind gegenüber diesem technischen/visuellen Qualitätsnachweis nachrangig.

### Offizielle technische Belege

- [Blender Animation & Rigging](https://docs.blender.org/manual/en/5.2/animation/index.html)
- [Render-Layer und Compositing](https://docs.blender.org/manual/en/latest/compositing/types/input/scene/render_layers.html)
- [glTF-Export und abweichendes Materialsystem](https://docs.blender.org/manual/en/4.3/addons/import_export/scene_gltf2.html)
- [Blender Python-Steuerung](https://docs.blender.org/api/main/info_quickstart.html)
- [Rendern ohne Bedienoberfläche](https://docs.blender.org/manual/en/dev/advanced/command_line/render.html)

Offizielle Suchindex-Auszüge geprüft; direkte Abrufe einzelner latest-Dokumentationsseiten lieferten einen Abruffehler. Keine Laufzeit-/Versionskompatibilität praktisch getestet.
