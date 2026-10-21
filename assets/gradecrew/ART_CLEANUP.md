# Figurenbereinigung gc27

30.09.2026. Vorlagen: bestehende eingebettete WebP-Atlanten in penguin-guide.svg,
elephant-create.svg, fox-improve.svg und owl-grade.svg. Mit Bildbearbeitung vier
transparente Sechs-Posen-Atlanten erzeugt; gleiche Figuren, Reihenfolge und Requisiten.
Anschließend ausschließlich in WebP (Qualität 90, Alpha erhalten) umkodiert.

Bearbeitungsanweisung: Hintergrundreste, Farbstreifen und isolierte Pixel entfernen;
alle sechs Posen, Farben, Plüsch-/Clay-Oberfläche und vollständige Körperteile erhalten;
transparent, ohne Boden, Schrift oder gemaltes Schachbrett.

Die Rasterbilder allein lösen den Fehler nicht: Die Posen belegen unterschiedlich
breite Bereiche und schneiden teilweise die alte 512er-Grenze. Deshalb verwendet
jede SVG sechs eigene Quellausschnitte mit explizitem clipPath, 24 Einheiten Rand und
preserveAspectRatio="xMidYMid meet". Die öffentlichen #pose-1…#pose-6-Views bleiben
512×512; Welcome-Aliasse und falcon-create (historischer Elefantenalias) synchronisiert.
Die Quelldaten sind selbstenthaltend in den SVGs gespeichert.

Kontrolle: 24 Posen auf hellem/dunklem Hintergrund rendern und auf benachbarte
Bildreste, abgeschnittene Körperteile und Alpha-Ränder prüfen. SVG-Regressionstest
prüft Pose-Vertrag, Clipping und identische Welcome-Aliasse. Echte Safari-Anzeige
bleibt Teil des Preview-Sichttests. Szenenillustrationen und demo-cat bleiben erhalten.
