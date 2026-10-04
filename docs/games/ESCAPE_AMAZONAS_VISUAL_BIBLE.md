# Expedition Amazonas – Visual Style Bible

Stand: 04.10.2026

## Verbindlicher visueller Grundsatz

> **Expedition Amazonas ist eine originale Retro-Handheld-Top-Down-Adventure-Overworld.**

Referenzgefühl sind klassische Game-Boy-/GBA-Top-Down-Abenteuer: kleine klar lesbare Sprites, tile-artige Landschaft, eindeutige Wege, starke Silhouetten, sichtbare Gesichter und eine Welt, die wie ein richtiges Spiel zusammengehört.

Wichtig:
- keine kopierten Pokémon-/Nintendo-Assets;
- keine nachgezeichneten Karten, Figuren oder UI-Elemente;
- eigene GradeCrew-Welt, eigene Sprites, eigene Formen und Farben;
- Inspiration ist die Spielsprache, nicht konkrete geschützte Gestaltung.

## Qualitätsziel

Ein Screenshot muss ohne Erklärung wie ein echtes kleines Adventure wirken.

Nicht akzeptabel:
- abstrakte Rennbahn;
- Emoji als zentrales Spielobjekt;
- zufällige Mischung aus realistischer Canvas-Grafik, Web-UI und Platzhaltern;
- Objekte ohne klare Perspektive;
- Spielfigur ohne lesbares Gesicht;
- Hindernisse, die sich entgegen der Bewegungslogik bewegen.

## Gemeinsame Overworld-Regeln

### Perspektive
- konsequente Top-Down-/leicht erhöhte Overworld-Perspektive;
- Spieler, Fahrzeuge, Tiere und Technik folgen derselben Blickrichtung;
- Welt bewegt sich logisch relativ zur Figur/Fahrzeug;
- fahrende Hindernisse kommen aus Fahrtrichtung auf den Spieler zu.

### Tiles und Welt
- Basisraster aus klaren Gras-, Erde-, Wasser-, Weg- und Technikflächen;
- sichtbare Kanten zwischen Weg, Vegetation und Wasser;
- kleine zufällig wirkende Details innerhalb der Tiles;
- keine sterile perfekte Geometrie, obwohl das technische Raster darunter wiederverwendbar ist.

### Figuren
- kleine, klare Original-Sprites;
- Gesicht muss auch in kleiner Darstellung lesbar sein;
- Explorer besitzt Augen, Mund, Hut/Haare und Expeditionserkennungsmerkmale;
- Fahrer im Jeep/Boot ist sichtbar;
- Coco bleibt Guide und ist nicht Spielfigur.

### Interaktionen
- das Objekt selbst muss verständlich sein;
- Marker unterstützt nur;
- kein Marker darf ein nicht erkennbares Objekt ersetzen;
- wichtige Hotspots müssen ohne lange Textanweisung auffindbar sein.

## Fahrzeuge

### MANGO-1
- originaler top-down Pixel-/Tile-Sprite;
- sichtbare Reifen, Karosserie, Fenster, Dachgepäck und Fahrer;
- keine Mango-Emoji-Identität;
- kleine Feder-/Impact-Reaktion;
- Schatten unter dem Fahrzeug.

### Fahrlogik
- Jeep bleibt im unteren Spielbereich;
- Welt scrollt entgegen der Fahrtrichtung;
- Hindernisse entstehen vor dem Fahrzeug und bewegen sich sichtbar darauf zu;
- Steine/Aste kosten Tempo;
- Matsch ist eine echte Mechanik: Fahrzeug bleibt sichtbar stecken;
- Befreiung erfolgt aktiv durch Gas/↑ statt automatischem Text-Feedback;
- finaler umgestürzter Baum kommt sichtbar aus Fahrtrichtung und erzwingt die Story-Blockade.

### Boot
- dieselbe Bewegungslogik;
- Fluss/Felsen bewegen sich logisch auf das Boot zu;
- sichtbarer Fahrer;
- Treffer kostet Tempo.

## Szenen

### Camp
Retro-Overworld-Feldstation:
- Gras-Tiles;
- blockige Erdfläche/Pfade;
- Expeditionszelt;
- Feldtisch mit echtem Tablet;
- Kisten, Kanister und Seil;
- MANGO-1 als echter Sprite;
- keine zentralen Emoji-Platzhalter.

### Dschungelpiste
- klarer Weg zwischen dichter Vegetation;
- keine Mittelstreifen-Autobahn;
- Reifenrinnen und kleine Bodendetails;
- Felsen, Äste und Matsch als eigene gezeichnete Objekte;
- kompakte Retro-HUD-Anzeige statt großer Web-Pille.

### Blockierter Pfad
- gleiche Straße wie zuvor;
- Jeep sichtbar zum Stillstand gekommen;
- großer Baum quer über die gesamte Route;
- Windenkiste/Kabel sichtbar;
- Übergang fühlt sich wie derselbe Ort an.

### Wildlife
- Overworld-Lichtung;
- Tiere als eigene kleine Sprites;
- Tukan, Capybara und Affe klar unterscheidbar;
- Tiergesichter/Bewegung sichtbar;
- Sender als echtes Gerät;
- Dock/Boot als Weltobjekte;
- keine Tier-Emojis.

### Fluss
- Wasser-Tiles;
- bewachsene Ufer;
- Boot als Top-Down-Sprite;
- Felsen kommen von oben/Fahrtrichtung;
- Wellen/Heckspur mit begrenzten Effekten.

### Forschungsstation
- Pixel-/Tile-Forschungsgebäude;
- dunkle Fenster ohne Strom;
- sichtbarer Generator;
- echtes Terminal statt Laptop-Emoji;
- nach Stromversorgung Fenster/Displays sichtbar heller;
- Ausgang zum Funkmast klar lesbar.

### Funkmast
- Overworld-Lichtung;
- Mast aus klaren Technikformen;
- Funkkonsole als echtes Objekt;
- Kanalstatus im Spielpanel;
- Finale später mit Signalimpuls/Animation.

## UI

- Spielwelt bleibt Schwerpunkt;
- Panels kompakt;
- klarer dunkler Rahmen, heller Innenrand;
- weniger extreme Rundungen;
- große Touch-Flächen außerhalb des Canvas bleiben erlaubt;
- In-Canvas-HUD nutzt klare blockige Typografie;
- Kamera-Sucher ebenfalls als Retro-Game-Overlay.

## Game-Feel

Spielobjekte brauchen Reaktion:
- Treffer: kurzer Shake + Tempoverlust;
- Matsch: sichtbares Einsinken/Feststecken;
- Jeepstart: kurzer Bounce/Staub;
- Kamera: später Fokus/Blitz/Fotovorschau;
- Generator: später sichtbares Einschalten;
- Funk: später Signal-/Finalmoment.

## Performance

Der Retro-Stil ist auch Performance-Strategie:
- kleine Zeichenprimitive;
- begrenzte Partikel;
- wiederverwendbare Tile-/Sprite-Funktionen;
- keine großen Echtzeit-Blur-Flächen;
- kein unnötiger externer Runtime-Overhead;
- Canvas erhält pixelated scaling;
- auf Schul-iPads bleibt Flüssigkeit wichtiger als Effektmenge.

## Verbindliches Abnahmekriterium

Eine Szene ist erst fertig, wenn:
1. sie wie Teil derselben Handheld-Overworld wirkt;
2. zentrale Objekte keine Emojis/Platzhalter mehr sind;
3. Figur/Fahrer ein lesbares Gesicht haben;
4. Bewegungsrichtung logisch ist;
5. Mechanik visuell verständlich ist;
6. bestehende Lern-/Recovery-/Transition-Logik weiter funktioniert;
7. Syntax/Tests/Build/Browser-Flows grün sind;
8. ein echter manueller Geräte-/Screenshot-Test erfolgt ist.
