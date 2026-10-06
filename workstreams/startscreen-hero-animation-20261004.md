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

## 06.10.2026 – Ausführlicher Produktionsplan, Ausführung gesperrt

Martins jüngste Anweisung ist ausdrücklich **nur Recherche und vollständige Planung, noch keine Umsetzung**. Die Modellbezeichnung „Hull“ wurde durch seine Antwort als **Sol** geklärt. Die früher formulierte nächste Aktion „Blender bereitstellen/Pilot ausführen“ beschreibt jetzt ausschließlich eine spätere, noch nicht freigegebene Phase.

Der vollständige Plan liegt unter [docs/superpowers/plans/2026-10-06-gradecrew-blender-hero.md](../docs/superpowers/plans/2026-10-06-gradecrew-blender-hero.md). Er umfasst Ausgangsnachweise, Produktionsentscheidung, Sol/Astra-Arbeitsteilung, Einrichtung, Figurenidentität, 3D-Quellen/Rigs, Bewegungsablauf, HTML/i18n, Desktop/Mobil, Lade-/Rückfallverhalten, Render-/Exportbudgets, Saisonvarianten, konkrete Repository-Eingriffe, acht Produktionspakete, Abnahme und Wiederaufnahme. Alle Produktions-Checkboxen bleiben offen.

### Präzisierungen gegenüber den bisherigen Vorschlägen

- Die wiederholte pauschale 9/10-Einstufung ist kein Qualitätsnachweis. Eine plausible Architektur und ein fertig geprüftes Ergebnis sind getrennt zu bewerten. Für den nicht gebauten Hero oder einen Sol/Astra-Blender-Vergleich fehlt eine belastbare Ergebnisnote.
- Nichtauffinden eines Plugins im Katalog beweist keine fehlende technische Verbindung. Das Community-Projekt heißt aktuell `ahujasid/mcp-for-blender` (vormals `blender-mcp`). Lokale Codex-Nutzung ist dokumentiert; die aktuell geöffnete [Supportseite](https://www.mcp-for-blender.com/support) nennt die direkte ChatGPT-Verbindung ausdrücklich noch nicht verfügbar. Ältere Suchauszüge ersetzen diesen Live-Befund nicht.
- Geprüfter Community-Quellstand: `34b7bd277fff75a693cde78930b4359478958a01`, Paketmetadaten `2.1.8`. Keine Installation oder Laufzeitkompatibilität nachgewiesen. Recherchierter Blender-Kandidat: 5.2.2 LTS; später praktisch prüfen und eine stabile Kombination festschreiben.
- Lokal M5 Pro / 48 GB / arm64 festgestellt; keine Rendergeschwindigkeit behauptet.
- `tools/build-staging.mjs` übernimmt aus dem Figurenordner bisher automatisch nur SVG; neue Poster/Videos benötigen explizite Integration. Der bestehende Designgenerator kennt begrenzte Gruppen und erzeugt native Ausgaben. Der Plan sieht deshalb ein getrenntes Web-Hero-Manifest vor.
- Erstes Szenenbild zeigt bereits Coco an einer teilweise offenen Tür und die Crew. Die vorherige Idee „Tür fast geschlossen“ darf keine blockierende oder leere Ladeansicht verursachen. Anfangs- und Schlussbild sind beide eigenständig brauchbar.
- Drei neue Canva-Welten sind nicht der nächste Produktionsschritt. Maßgeblich ist zunächst ein begrenzter Coco-/Tür-Nachweis unter endgültigem Licht. Der Blender-Master bleibt bearbeitbar; das Web erhält eine zusammenhängende textfreie Szene und unabhängige übersetzbare UI.

### Sicherung und Grenzen dieses Schritts

Bestehende Task-ID GC-DESIGN-05, Draft-PR #143 und Dokumentationsbranch `docs/gc-design-05-reference-plan-20261006` weiterverwendet. Nur Plan, TODO-Zeile und dieser Übergabenachtrag werden aktualisiert. Frühere Abschnitte bleiben als Historie erhalten.

Keine Blender-Installation, MCP-Konfigurationsänderung, Modellumschaltung, Bildgenerierung, Modellierung, Animation, Rendering, Produktcodeänderung oder Veröffentlichung durchgeführt. Kein neuer Provider-Auftrag, keine Budgetrücksetzung, kein Retry des unbekannten GC-DESIGN-03-Ergebnisses. Dessen 2,40-USD-Reservierung innerhalb des 2,55-USD-Limits bleibt erhalten.

Validierung dieses Schritts: recherchierte Primär-/Anbieterquellen und tatsächlicher Repository-Bestand gelesen; Plan auf Anforderungen, offene Annahmen und Umsetzungssperre geprüft. Keine Blender-, Browser- oder Produktfunktion als praktisch getestet behaupten. CI dieses neuen Dokumentationscommits separat anhand des exakten Heads feststellen.

**Genau ein nächster Schritt:** Plan vorlegen und auf Martins ausdrücklichen Startauftrag warten. Erst danach aktuelle Ausgangslage bestätigen und den begrenzten Einrichtungs-/Coco-Prototyp beginnen. Production bleibt separat freigabepflichtig.

## 06.10.2026 – Umsetzung freigegeben, Sol zuerst

Martin hat nach Vorlage des vollständigen Plans ausdrücklich den Start freigegeben, zunächst mit Sol und einem begründeten Wechsel zu Astra bei konkreten Grenzen. Umsetzungssperre des letzten Planungsnachtrags aufgehoben; Production bleibt gesperrt.

Eigener Checkout `gradecrew-hero-blender` am bestehenden Task-Branch/PR #143, Ausgangscommit 5c80c87f48113aa4b14707be186eccb490fdbc0f. Native Worktree-Anlage war im projektlosen Spiegel nicht möglich; stattdessen eigener sauberer Clone. Letzter Development-Status-Lauf 37389295053 erfolgreich, Warnungen/Überschneidungen gelesen. Aktueller Scope ausschließlich `art/gradecrew-hero/` und eigene Koordination; keine Einstiegs-/i18n-/App-Dateien.

Blender 5.2.2 Apple Silicon von offizieller Quelle heruntergeladen; SHA256 dc4125399b8bfefe283cc1624d6cfc7809d1cac20ace51072127eb371f31f210 stimmt mit Anbieterprüfsumme überein. Lokale Einrichtung wird jetzt praktisch geprüft. Kein Rendernachweis zu diesem Checkpoint. Keine neue bezahlte Provider-Nutzung; alte Budgethistorie erhalten.

Nächster Schritt: ausführbares Blender bestätigen, Testszene speichern/rendern/wiederöffnen, dann Sol-Coco-Prototyp anhand kanonischer Referenzen.

### Einrichtungsnachweis bestanden

Blender 5.2.2 LTS (Build d13f752e3b9c), MCP for Blender 2.1.8 am festgelegten Quellcommit und SDK1.30.0 praktisch eingesetzt. MCP-Szenenabfrage, Objektänderung, Rendern und Speichern bestanden; separater Prozess öffnete die .blend und bestätigte x=0.35. Nachweise unter art/gradecrew-hero/environment/. Lokaler Connector nur 127.0.0.1:9877, Safe Mode aktiv, Telemetrie deaktiviert; kein globales Codex-Setup geändert. Native Toolregistrierung ist nicht erfolgt; reale MCP-Verbindung per lokalem Python-Client getestet.

Sol-Unteragent /root/sol_coco_pilot (gpt-6.1-sol, high) bearbeitet ausschließlich art/gradecrew-hero/coco-pilot/. Kanonischer Bildvertrag und Quellenhashes unter art/gradecrew-hero/spec/. Visuelle Abnahme steht aus. Standard-Sandbox blockierte lokale Sockets bzw. Blender-Dateiöffnung; eng genehmigte Ausführung bestand. Kein Modellwechsel deswegen. Git-Push per Terminal mangels dortiger Anmeldung nicht verfügbar; Sicherung erfolgt über den vorhandenen GitHub-Connector auf demselben Aufgabenbranch, ohne Credentials auszulesen.

### Einrichtungsreview und isolierte Sitzungen

Unabhängiger Sol-Review: ursprünglicher Nachweis SPEC PASS; P2 bei fester Portadresse erkannt. Behoben mit Betriebssystem-Port und zufälliger Sitzungskennung in Testszene/lokaler Receipt-Datei; vor jeder Mutation innerhalb desselben Blender-Aufrufs geprüft. Falsche Kennung wurde praktisch abgewiesen, korrekte Ausführung und neue unabhängige Wiederöffnung bestanden. Gezielter Re-Review: SPEC PASS, QUALITY PASS.

Metal-Gerät Apple M5 Pro GPU (20 cores) tatsächlich erkannt. Alter eigener Testprozess nach erneuter Identitätsprüfung geschlossen. Automatische Freigabeprüfung hatte kombinierten Prüf-/Stopbefehl zunächst abgewiesen; Ursache war fehlende frische Prozessidentifikation, danach sicher aufgelöst. Keine offene Berechtigungssperre.

Coco-Pilot: erste und zweite echte Renderfassung geprüft, noch kein visueller Master. Konkrete Korrekturen an Navy-Farbtreue, Gesichtsmaske, Schnabel, Augen und Fußkontakt an Sol gegeben. Keine hohe Qualitätsnote aus technischem Render-Erfolg abgeleitet.

### Sol-Pilot gesichert, gezielter Astra-Wechsel

Sol-Baseline lokal6f085c70a929156e4b0440f7ef2736ac0df28131 und remote4b78cfa3304c069c76e30a0524589bea787e55e1 haben identischen Tree b005452b70d9b275f9a3e596f015d2ea8ded2899. 17 Dateien mit echter editierbarer .blend (ca.2MB), reproduzierbarem Builder, sieben Renderansichten, drei Kontrollposen, Versuchshistorie und Prüfnachweisen. Echte Wiederöffnung/erneutes Rendern, wiederholter szenenschonender Aufbau, Bildausschnitte und Kontakte: 21 bestanden, 0 fehlgeschlagen.

Visuelle Abnahme ausdrücklich false: eine graue Augenreflexion, aufgesetzte Augen-/Weißflächen, kantiges Ende der Stirnmaske und stacheliges Fell. Nach drei gezielten Sol-Durchgängen auf Martins autorisierte Astra-Eskalation gewechselt. Astra-Agent arbeitet nur in art/gradecrew-hero/coco-astra/ auf derselben Grundlage; Sol-Baseline bleibt unverändert. Keine vollständige Crew oder Webintegration vor bestandenem visuellen Prüfpunkt. Unabhängiger Pilotreview parallel, ohne doppelte Renderläufe.

Nächster Schritt: Astra-Nahansicht prüfen, danach Seiten-/Desktop-/Mobilansichten und Quell-/Bewegungsnachweis. Kein fertiger Hero behauptet, keine Production-Änderung. Die alte Provider-Reservierung bleibt unverändert.

### Astra-Pilot gesichert und unabhängig geprüft – visueller Prüfpunkt offen

Lokaler Abschluss bc8505d48d38552ce56d6a5a91131ee9efa6fe88 und Remote-Sicherung f0195717beac6f48b2097de3f7ddf40b72b9d164 besitzen denselben Tree372954d1e26470e2c072313276bc3d46447f7a6d. Astra-Quelle art/gradecrew-hero/coco-astra/coco-door-astra.blend (10.187.239Bytes), Builder, acht finale PNGs, Versuchshistorie und Manifest gesichert. Alle hochgeladenen Git-Blob-Hashes gegen lokale Quellen geprüft. Sol-Baseline unverändert.

25 technische Prüfungen bestanden,0 fehlgeschlagen: frische Wiederöffnung/Rendern, beide Blinzelkontrollen samt tatsächlicher Pupillengeometrie, Kopf-/Flügelbewegung, Kameragrenzen, Kontakte, wiederholter Aufbau mit Erhalt fremder Szene/Objekte/Material, stabiler World-Bestand. Unabhängiger gezielter Review: Integrität und technischer Prototyp PASS; alle16 Manifestdateien stimmen. Keine Testwiederholung im Review.

Visueller Master NICHT bestanden. Astra hat graue Augenreflexion, stark aufgesetzte Augen, kantige Stirnmaske, stacheliges Fell und Pfirsichfarbe verbessert. Weiterhin unzureichend: kanonische Gesichtsform/Ausdruck, zusammenhängende Hals-/Schultermodellierung und tatsächliche Lider; beim bisherigen Skalier-Blinzeln werden kahle Augenovale sichtbar. Dunkle Enden der Türleisten bleiben sekundär offen. Nach drei Sol- und drei begrenzten Astra-Bildrunden keine weitere reine Parameter-Runde.

Nächster konkreter Produktionsschritt: bestehende Astra-Szene weiterverwenden, Kopf/Hals/Schultern als zusammenhängende Form mit für Verformung geeigneter Topologie modellieren; echte Lidverformung und mitbewegte Fellmasken bauen. Danach kanonische Front-/Dreiviertel-/Seiten-/geschlossene-Augen-Abnahme. Raum, Kameras, Tür und Renderablauf behalten. Kein Nachweis, dass KI-Modellierung grundsätzlich unmöglich wäre; kein Zwang zu einem bezahlten Dienst. Keine Crew-/Website-Ausweitung vor diesem Prüfpunkt.

DraftPR143 bleibt offen, unveröffentlicht und ungemergt. Art-/Dokumentationszielmain; spätere Webintegration separat gegen aktuellen App-Integrationszweig. Keine Production-Änderung, kein bezahlter Provider-Auftrag; alte2,40USD-Reservierung/2,55USD-Grenze erhalten. Eigene Test-/Renderprozesse beendet. Arbeitsstatusbranch_only, keine Nutzerabnahme.


## 06.10.2026 – Videovergleich und Wiederaufnahme nach Modellfehler

Vorheriger Chat „Erstelle drei Hero-Art-Directions“ (01a10e51-7f71-7bb3-9390-d8637367bb66) endet im Systemfehler. Neuer Diagnose-Chat 01a10e98-1e57-7b40-af70-555fdfdae2e3 übernimmt nur Recherche/Übergabe; keine parallele Modellierung. Bestehende Task-ID, PR143, Branch und Versuchshistorie bleiben erhalten.

Ausgangshead9007b89f96c3640554dd427b2e82f2d605a8233a frisch geprüft; handoff37393123125 und Development37393123039 erfolgreich. Lokaler Blender-Checkout sauber. Kein erneuter Render-/Provider-Auftrag und kein Deploy. Release Train unverändert.

[Produktionsvergleich](../docs/GC_DESIGN_05_VIDEO_REVIEW_2026-10-06.md): Video zeigt Blender-Bewegungsvorlage plus Seedance2.5/Higgsfield mit getrennten Designreferenzen. Die MP4 hat keine Tonspur;19.262 Frames technisch verarbeitet,180 ausgewählte Bilder visuell gesichtet, sichtbarer Prompt lokal transkribiert. Gesprochenes Transkript bleibt bis Audio/YouTube-Link offen. Kein Rohvideo/Chatprotokoll veröffentlicht.

Die bisherige nächste Aktion „weitere zusammenhängende Modellierung“ ist durch die aktuelle Diagnose unterbrochen: erst Produktionsroute und einen kleinen bepreisten visuellen Nachweis festlegen. Empfehlung hybrider Coco-Mini-Pilot; hochwertige editierbare Figuren bleiben zusätzliche Anforderung. Keine neue pauschale Qualitätszusage und kein unfreigegebener Creditverbrauch. Higgsfield gefunden/angeboten, noch nicht verbunden bestätigt.

Der neue Turn im alten Chat scheiterte vor Bearbeitung mit Modellfreischaltungsfehler in1555ms; nicht mit Blender-Fehler gleichsetzen. Kostenangabe des Nutzers nicht unabhängig prüfbar. paid_calls:0 nicht als null Modellkosten auslegen.

Genau ein nächster Produktionsschritt: Verbindung bestätigen und exakt bepreisten3–4s-Coco-Pilot anhand vorhandener Referenzen vorbereiten; keine erneute vollständige Blender-Schleife. Production bleibt unverändert.


## 06.10.2026 — Statischer Startbildschirm zuerst, HTML/i18n-Vorschau erstellt

Martins neuer Auftrag ersetzt den nächsten Blender-/Animationsschritt: zuerst ein überzeugendes Endbild/Startbildschirm, alle Textbausteine austauschbar und internationalisierbar. Kein neues 3D-Modell und keine Animation in diesem Schritt.

Bestehende Aufgabe GC-DESIGN-05 / Draft-PR #143 / Branch docs/gc-design-05-reference-plan-20261006 fortgesetzt. Ausgang remote bc10fad67f728daea99ad5720c0364153922cdf0. Development Status 37394390293 auf diesem Head erfolgreich; Warnungen zu unklassifizierten Branches, Zielabweichung freetext-review und offenen Alt-PRs gelesen. Scope nur neuer Unterordner art/gradecrew-hero/static-startscreen plus diese Übergabe/TODO; keine konkurrierenden App-/i18n-Dateien geändert. Art-PR bleibt gegen main; spätere App-Integration gegen feature/gradecrew-app-integration.

Ergebnis: textfreie gemeinsame Klassenzimmerszene mit Coco, Remy, Emmi, Wilma; genau ein built-in image_gen-Aufruf anhand Nutzerreferenz und kanonischer Atlanten, keine Retries. Responsive echte HTML-Vorschau mit DE/EN-Schalter, zentral editierbarem copy.js und separaten zugänglichen Bedienelementen. WebP 1536x1024 / 201.798 Bytes; Original-PNG lokal erhalten. Prompt und Quellenhinweise gespeichert. Keine weiteren Provider-/Higgsfield-Aufträge und keine Zurücksetzung früherer Budgets; Tool weist Bildkosten nicht aus.

Prüfung: 12 Browser-Prüfabschnitte bestanden, keine JS-Ausnahmen. DE/EN bei 320/390/768/1024/1440px, geladene Assets, vollständige Katalogschlüssel, kein horizontaler Überlauf/keine UI-Überlappungen, Sprachpersistenz, Dialoge, Escape/Fokusrückkehr und Vorschau-Codezugang. Screenshots Desktop DE/EN und Mobil DE/EN lokal; Desktop DE/Mobil EN im Repo. Desktop DE und Mobil DE visuell geprüft. Nachweise unter static-startscreen/evidence; README beschreibt genaue Grenzen. Browserprüfung ist kein echter Gerätetest und keine visuelle Nutzerabnahme.

Offen: Bildabnahme einschließlich blauer Augenakzente gegenüber dunkleren kanonischen Augen; Login/Testzugang sind noch nicht in die App integriert. Prototyp zeigt bei diesen Aktionen eine klare Vorschau-Information und einen Link zur vorhandenen Testumgebung; keine Codes übertragen/gespeichert. Animation und saisonale Varianten nicht umgesetzt. Keine neue Staging-/Production-Veröffentlichung, Stufe branch_only.

Aktive Zuständigkeit: dieser Ersatz-/Fortsetzungschat 01a10e98-1e57-7b40-af70-555fdfdae2e3. Lokaler Vorschau-Server 127.0.0.1:8768 (exec session4464) bleibt für Martin geöffnet. Keine laufende Bild-/Rendergenerierung. Frühere Sol-/Astra-Quellen und Versuchshistorie unverändert. Sicherung dieser Lieferung gesammelt im selben PR; exakter neuer Commit wird im Abschluss genannt.

Genau nächster Schritt: Martins visuelles Feedback zum jetzt vorliegenden statischen Startbildschirm einarbeiten; erst anschließend bestehende App-Handler/i18n anbinden, Animation nachrangig.


## 06.10.2026 — Ruhigere Revision 2 nach positivem Nutzerfeedback

Martin: erste statische Richtung gut; Coco ohne Schal, Rollen von Emmi/Wilma durch Zeichen verdeutlichen und überladenen unteren weißen Bereich vereinfachen. Rückfrage Remy ausdrücklich beantwortet: ohne Pulli, mit Tablet. Aktuelle Umsetzung: gezielter Bildedit mit diesen vier Änderungen, keine neue Komposition; neue Datei crew-classroom-v2.webp (187.680 Bytes), V1 erhalten. Sprachunabhängiges Bearbeitungssymbol auf Emmis Papier und grüne Prüfhaken auf Wilmas Klemmbrett, weiterhin keine eingebrannten Wörter. Ein zusätzlicher built-in image_gen-Aufruf; insgesamt zwei statische Bildaufrufe, keine bezahlte API-/Higgsfield-/Blender-Weiterarbeit und keine Budgetrücksetzung. Exakter Edit-Prompt IMAGE_PROMPT_V2.txt.

Layout: weiße Vorteilsleiste entfernt, Inhalte jetzt über Funktionen-Dialog; Crew-Namen/Rollen ohne drei Karten und doppelte Symbole, Anmeldung als dezenter Textbutton, Codefeld ohne große Hintergrundkarte. HTML-Texte weiterhin DE/EN editierbar. Nur derselbe statische Preview-Unterordner plus TODO/Übergabe geändert. Ausgang remote91ab6db7; Development Status37416892343 erfolgreich. Integrations-/Production-Zustand unverändert branch_only; kein App-Anschluss/Deploy.

Nachweise: aktuelle verify.cjs-Ausführung mit12 bestandenen Abschnitten und0 JS-Ausnahmen; DE/EN bei fünf Breiten, UI-Grenzen, Sprachwechsel, Funktionen-/Crew-Dialoge und Tastatur. Desktop DE/Mobil DE visuell geprüft; Screenshots und JSON aktualisiert. Original-V2-PNG lokal zusätzlich erhalten, veröffentlichungsfähiges WebP und Prompt im Repo gesichert. Nutzer hat die Richtung befürwortet, V2 noch nicht abgenommen. Auto-Reload des bestehenden IAB-Tabs durch nicht verfügbare Sicherheitsprüfung blockiert, keine Umgehung; zuvor erstellte isolierte Chrome-Prüfnachweise vorhanden. Lokaler Server8768 bleibt bestehen.

Genau nächster Schritt: visuelles Feedback zu Revision2; danach bestehende App/i18n-Anbindung. Animation bleibt nachrangig.


## 06.10.2026 — Revision 3: professionellere Dokumentmarkierungen

Nutzerfeedback: Emmis großes Zeichen wirkt pixelig und kindlich; Wilmas Checkliste grundsätzlich gut, etwas verfeinern. Genau ein gezielter built-in image_gen-Edit: riesiges oranges Stift-/Sternsymbol durch dünne orange Korrekturmarkierungen auf strukturiertem Papier ersetzt; Wilmas Haken feiner und dunkelgrün. Figuren, Kleidung und Layout im Auftrag erhalten. Keine Wörter im Bild; i18n unverändert. Aktives Asset crew-classroom-v3.webp,1536×1024,254.938Bytes,WebP-Qualität95. Drei statische Bildaufrufe insgesamt, keine Retries/Budgetrücksetzung. V1/V2 und lokale PNG-Quellen erhalten.

Ausgang a92a71ce,Development Status37417345987 erfolgreich. Gleicher GC-DESIGN-05-Branch/PR143, keine fremden App-Dateien. Nur neuer Bildpfad in HTML plus Asset/Prompt/Asset-Prüfnachweis/Übergabe. Neue Bildausgabe visuell kontrolliert; WebP-Decodierung,Abmessungen und HTML-Verknüpfung geprüft. Alte zwölf Browserprüfungen/Screenshots gelten für V2, kein neuer Lauf für V3. IAB-Sicherheitsprüfung nicht umgangen; Nutzer lädt vorhandene Vorschau8768 selbst neu. Keine App-Integration/Animation/Deployment.

Genau nächster Schritt: Nutzerabnahme der zurückhaltenderen Dokumentmarkierungen; danach vorhandene App-Anbindung. Noch keine Freigabe zur Animation oder Production aus diesem Feedback ableiten.
