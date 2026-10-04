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

## Offene Brand-Entscheidung

Vor dem nächsten visuellen Build muss geklärt werden, wie stark die Homepage-Crew vom aktuellen kanonischen Einzelasset-Look abweichen darf:
- nur vorhandene Crew-Assets neu inszenieren;
- oder eine speziell freigegebene "cinematic homepage crew"-Variante mit Props/Kleidung/Interaktion erlauben, näher am Referenzbild.

## Nächster ausführbarer Schritt

Mit Canva und/oder Bildgenerierung 3 klar unterscheidbare Hero-Art-Directions aus dem bestätigten Referenzbild entwickeln, **noch ohne Web-Code umzubauen**. Martin wählt eine Richtung. Erst danach wird die responsive Scene-/Animation-Architektur umgesetzt.

