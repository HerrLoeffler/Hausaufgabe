# Erweiterte Leistungsnachweise: integrierter lokaler Prototyp

Ziel ist Martins vorhandener Ablauf mit zusätzlichen Formaten. Lehrkraft gibt Thema/Klasse/Wünsche ein; Remy erstellt fertige Aufgabe einschließlich Interaktion, Schlüssel und Punkten. Fachliche Prüfung und vorhandene Bearbeitung bleiben erhalten.

## Gewählter Schnitt
hotspot: mehrere neutrale Szenenobjekte auswählen; exakte Menge, Fehlmarkierungen kosten richtige Treffer, nie negative Punkte.
image-labeling: jedes nummerierte Szenenobjekt bekommt einen Begriff aus unabhängig gemischten Optionen; anteilige Punkte pro richtiger Zuordnung.
numberline: ein Wert auf einer definierten Skala; Schrittweite öffentlich, Lösung/Toleranz privat. Leere Antwort ist niemals null. Endpunkte und diskrete Tastatursteuerung sichtbar.
Gemeinsame Daten: visual.version=1, template (plant/room), objects mit neutralen IDs und begrenzten geometrischen Formen; labels mit neutralen IDs und sichtbaren Begriffen; scale min/max/step; visualSolution privat als selected, assignments oder value/tolerance. Keine semantischen Objektkennungen, Farbzuordnungsschlüssel oder Zielwerte im SVG.

Die neue Struktur ergänzt bestehende Fragen, Answer-/Attemptablage und Assessmentkern. Private Schlüssel und Bewertungen entstehen gemeinsam. Öffentliche Projektion kopiert nur geprüfte Felder, Fingerprint schließt Darstellung und Schlüssel ein. Ungültige Modelle verhindern Veröffentlichung. Bestehende Typen ändern ihr Fingerprintformat nicht.

## UI und Lokalbetrieb
Bestehende Typauswahl und Remy-Wünsche erhalten neue Einträge. Bestehender Editor zeigt fertige Grafik, Antworten und Punktelogik zur Prüfung, keine Pflicht zur Konfiguration. Exakte bestehende lokale Review-App mit Firebase-Fixture und CSP bleibt Basis; sämtliche externen Calls gesperrt. Generierung als vorbereitete Simulation, keine echte KI-Prüfung vortäuschen. Lokale HTTP-Bewertung verwendet den echten Assessmentkern; kein Cloud-/Emulatornachweis daraus. Draft-/Antwortwiederaufnahme lokal und explizit begrenzt.

## Akzeptanz
Gemischter Test mit Altformaten; richtige/falsche/teilrichtige Antworten; keine privaten Felder in Paper; unbekannte IDs/Mehrfachantworten/Leerwert werden sicher behandelt; Tastatur und 390/768/1024px Browserlayouts; Reload erhält eigene Beispieldaten. Keine Schulcloudverbindung. Druck stellt Grafik und nummerierte Felder lesbar dar. Emmi/Wilma kennen den Strukturvertrag; echte Modellqualität ungeprüft.

## Alternativen und spätere Ausbaustufen
H5P-Einbettung würde eigenen Zustands-/Bewertungsweg benötigen; freie Bildpixel-Generierung garantiert keine fachlich eindeutigen Bereiche. Deshalb eigene kleine deklarative Szenen ohne neue Library. Später Koordinaten, Bruchflächen, Diagramme und freie Grafiktexte. Spiele/Memory/Video nicht Teil dieser Stufe. Kapitel-ID und Kompetenzdaten sollen ergänzbar bleiben; weder PR252 noch253 werden implementiert.

Quellen: https://deutsch-lernen.zum.de/wiki/Hauptseite ; https://h5p.org/drag-and-drop ; https://docs.moodle.org/en/Drag_and_drop_onto_image_question_type . Nur Interaktionsprinzipien, keine Inhalte/Assets/Quellcodes übernommen. H5P-Beispiele haben eigene Lizenzangaben, keine pauschale Lizenzannahme.
