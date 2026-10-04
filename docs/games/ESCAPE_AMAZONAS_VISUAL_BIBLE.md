# Expedition Amazonas – Visual Style Bible

Stand: 04.10.2026

Diese Datei ist die verbindliche visuelle Leitlinie für **Expedition Amazonas**. Ziel ist kein dekorierter Prototyp, sondern ein eigenständiges kleines Adventure, das auf einem Schulgerät flüssig läuft und auf einem Screenshot wie ein richtiges Spiel wirkt.

## Qualitätsziel

> **Warm, abenteuerlich, lebendig, klar lesbar und leicht humorvoll – aber nicht kindisch.**

Jede Szene muss gleichzeitig:
- sofort spielbar und übersichtlich sein;
- räumliche Tiefe besitzen;
- mindestens einen erinnerungswürdigen visuellen Moment haben;
- wichtige Interaktionen ohne lange Erklärung sichtbar machen;
- auf iPad/Notebook stabil und flüssig bleiben.

Kein Level darf wie eine Testfläche mit Rechtecken, Emojis oder Platzhalterobjekten wirken.

## Bildsprache

### Perspektive
- leicht erhöhte 2D-/2.5D-Adventure-Perspektive;
- Spielfigur und wichtige Objekte klar vor dem Boden lesbar;
- Vordergrundelemente dürfen teilweise über Figur/Objekte laufen und erzeugen Tiefe;
- keine harte isometrische Geometrie; organische Welt bleibt natürlicher.

### Formen
- leicht stilisiert, klare Silhouetten, mittlere Detaildichte;
- natürliche Objekte nicht aus perfekten Rechtecken/Kreisen zusammensetzen, wenn sie im Fokus stehen;
- Technik darf kantiger und funktionaler sein;
- wichtige Interaktionsobjekte erhalten stärkere Form- und Lichtkontraste.

### Materialien
Camp:
- sonnengebleichter Stoff;
- Holz;
- lackiertes Metall;
- Leder/Canvas;
- feuchte Erde;
- Blattwerk.

Technik:
- mattes, leicht abgenutztes Metall;
- kleine Statuslichter;
- Gummi, Kabel, Schrauben;
- keine sterile Sci-Fi-Optik.

## Licht

### Global
- Licht ist Teil der Dramaturgie, nicht nur Dekoration;
- weiche Schatten unter Figur/Objekten;
- warme Highlights gegen kühleren grünen Dschungel;
- keine permanente künstliche Leuchtaura um die Spielfigur.

### Camp
- früher Morgen;
- warmes Sonnenlicht von rechts oben;
- sichtbare Lichtstrahlen durch das Blätterdach;
- kühler Dschungel im Hintergrund, warmes Camp im Vordergrund;
- kleine Staub-/Pollenpartikel im Licht.

### Weitere Szenen
- Jeep: dichter, schneller, wechselnde Schatten;
- Wildlife: heller und luftiger;
- Fluss: blaugrün, Reflexionen, leichter Dunst;
- Station: kühl, feucht, zunächst dunkel;
- Funkmast: weiter Blick, dramatischer Himmel, großes warmes Finale.

## Farblogik

Die Welt darf farbig sein, aber wichtige Interaktionen müssen deutlich bleiben.

Camp:
- tiefes Dschungelgrün;
- warmes Ocker/Orange für Expedition und Jeep;
- cremefarbener Canvas-Stoff;
- dunkles Holz;
- Signalgrün nur für echte Interaktion.

Interaktionsmarker:
- niemals größer/heller als das eigentliche Objekt;
- Marker unterstützt, ersetzt aber nicht die visuelle Lesbarkeit des Objekts;
- pulsieren dezent statt blinkend.

## Tiefenaufbau pro Szene

Mindestens vier visuelle Ebenen:

1. **Fernhintergrund** – Himmel, Nebel, entfernte Baumkronen.
2. **Mittelgrund** – große Stämme, Büsche, Zelte, Gebäude, Felsen.
3. **Spielschicht** – Figur, Fahrzeuge, Hotspots, Mechanikobjekte.
4. **Vordergrund** – Blätter, Gräser, kleine Äste, Lichtpartikel.
5. **Effektlayer** optional – Staub, Wasser, Funken, Lichtstrahlen, Regen, Funkimpulse.

## Bewegung / Game-Feel

Camp:
- Blätter schwingen minimal;
- kleine Stoffbewegung am Zelt;
- Sonnenstaub/Pollen;
- dezente Jeep-Federung beim Start;
- kleine Antenne/Flagge bewegt sich;
- Schatten und Licht bleiben ruhig genug, um nicht abzulenken.

Jeep:
- Karosserie federt;
- Schlamm/Spritzer;
- Vegetation zieht vorbei;
- leichte Kamera-Reaktion bei Treffer.

Wildlife:
- Tiere besitzen eigene Bewegungsmuster statt Emoji-Sprites;
- kurze Reaktion auf Foto;
- Pflanzen bewegen sich subtil.

Fluss:
- Wasserlinien/Wellen;
- Heckwelle am Boot;
- Spritzer bei Felskontakt.

Station:
- Generatorstart mit Vibration/Funken;
- Licht geht sichtbar in mehreren Bereichen an.

Finale:
- Funkmast/Sendeanlage aktiviert sich sichtbar;
- Signalimpuls;
- Umgebung reagiert auf das wiederkehrende Signal.

## UI

- dunkles transparentes Material mit leichtem Grün-/Braunstich;
- klare Hierarchie: Mission > aktueller Schritt > Hilfe;
- große Touch-Ziele;
- weniger Text, größere Lesbarkeit;
- kein unnötiger Rahmen um jedes Element;
- Buttons reagieren sichtbar auf Hover/Press/Disabled;
- Dialoge wirken wie Teil des Spiels, nicht wie Standard-Webformular.

## Figur

Coco bleibt Guide und ist **nicht** die Spielfigur.

Bis die gemeinsame GradeCrew-Games-Figur final entschieden ist:
- neutraler Explorer bleibt funktional;
- Silhouette wird hochwertiger gezeichnet;
- keine dauerhafte neue Maskottchenrolle lokal erfinden;
- spätere Games-Figur muss zentral austauschbar sein.

## Asset-Regel

- zentrale wiederverwendbare Zeichenfunktionen statt Kopien;
- externe Rasterassets erst, wenn sie echten Mehrwert liefern;
- Raster/Sprites später komprimiert und zentral verwaltet;
- keine Emoji-Sprites für zentrale Spielobjekte in der finalen Referenzwelt.

## Performance-Budget

- keine großen Blur-Flächen pro Frame, wenn sie vorberechnet werden können;
- Partikelzahl begrenzen;
- dekorative Animationen pausieren, wenn Modal offen oder Tab verborgen;
- keine unnötigen DOM-Reflows im Renderloop;
- keine externe Runtime nur für einzelne Effekte;
- große statische Bereiche nach Möglichkeit cachen/offscreen vorbereiten;
- Canvas-Auflösung kontrolliert, CSS-Skalierung sauber;
- später echtes iPad/älteres Notebook messen.

## Camp – Referenzstandard

Das Camp ist die erste Szene, die auf Masterpiece-Niveau gebracht wird.

Es braucht:
- dichten entfernten Dschungel;
- warme Morgensonne;
- sichtbare Lichtstrahlen;
- Pfad/Campfläche mit organischer Kontur;
- echtes Expeditionszelt;
- Kisten, Kanister, Seil, Karte/Tablet und Kleinteile;
- deutlich hochwertigeren MANGO-1;
- Schatten;
- Vordergrundblätter;
- dezente Partikel;
- kleine Umweltanimationen;
- klare visuelle Führung zum Tablet und Jeep;
- keine Emoji-Dekoration als zentraler Blickfang.

### Camp-Wow-Moment
Nach dem gelösten ersten Lern-Gate und beim Starten von MANGO-1:
- Jeep reagiert sichtbar;
- Statuslicht;
- leichte Federung;
- kurzer Staubstoß;
- erst dann Übergang zur Fahrt.

## Abnahmekriterium Camp

Camp gilt erst als visuell fertig, wenn:
- Screenshot ohne Erklärung als Spielszene lesbar ist;
- Tablet und Jeep ohne Textwand auffindbar sind;
- Hintergrund/Mittelgrund/Spielschicht/Vordergrund klar erkennbar sind;
- keine zentrale Platzhalter-/Emoji-Optik mehr vorhanden ist;
- Animationen die Bedienung nicht stören;
- bestehende Lern-/Recovery-/Transition-Logik unverändert funktioniert;
- Tests, Build und Browser-Flows grün sind;
- echter manueller Desktop-Test folgt.
