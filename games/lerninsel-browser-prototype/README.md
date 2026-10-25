# Lerninsel: Browserprobe mit Lehrkraft-Eingabe

13.10.2026. Fortführung GC-GAMES-LERNINSEL-ADAPTIVE-PLAN-20261013, Phase browser-input-probe. Der Mensch autorisiert ausdrücklich den kleinen Browser-Prototyp samt tatsächlicher Lehrkraft-Eingabe und Ausführung. [PlanPR230](https://github.com/HerrLoeffler/Hausaufgabe/pull/230) bleibt Dokumentation; dieser isolierte Prototyp verändert den nativen Level1 nicht.

## Start und konkrete Probe

`./start.command` startet/wiederverwendet nur den erkennbaren eigenen Loopbackserver auf http://127.0.0.1:18771/ und öffnet die Seite. Kein Deploy, keine öffentliche Bindung, keine Anmeldung, kein Provideraufruf. Alternativ Python3-HTTPserver mit dist als Verzeichnis. Alle Laufzeitdateien inklusive Three.js sind lokal; keine CDNs oder Remote-Assets beim Spielen.

Lehrkraft: Unterrichtstitel, Fach, Frage und Kontext eingeben; eine der vier Mechaniken wählen, eigene Antworten/Zielmenge/Reihenfolgen/Paare konfigurieren; Vorschau ausprobieren, fachliche Passung bestätigen, eigene Runde starten. Vier editierbare Stationen bilden die begrenzte Probe: Wählen/Markieren, Messen, Ordnen, Zuordnen. Station direkt in3D oder per zugänglichem Button auswählen. Eigene Eingaben werden unter einem ausschließlich hier verwendeten LocalStoragekey gespeichert; laufende Runde verwendet einen eingefrorenen Snapshot. Eingabeveränderungen verwerfen die Freigabe, Änderungen der Optionen auch deren alte Lösungsauswahl.

## Die eine Machbarkeitsfrage

Kann eine Lehrkraft für ihren Unterricht eigene Fragen samt fachlich passenden Parametern eingeben und diese mit denselben geprüften Mechaniken im Browser tatsächlich ausführen? **Für die vier begrenzten strukturierten Vorlagen technisch nachgewiesen.** Eine gültige Datenstruktur ist kein Nachweis, dass jede beliebige Frage didaktisch sinnvoll ist. Die Probe blockiert erkennbare Widersprüche und verlangt fachliche Vorschau; sie enthält keinen AI-Sprach-/Curriculumprüfer. Nicht unterstützte offene Aufgaben werden nicht automatisch in eine neue Mechanik umgebaut.

Echte Browserprobe: neue Photosynthesefrage statt Beispieltext; falsche Antwort Nur Wärme abgewiesen, Licht angenommen. Neu parametrisierte Mathefrage3/4 von2L:1L falsch,1,5L richtig. Bruch3/4 bei noch eingestelltem Nenner10 blockiert. Photosynthesefrage als Messstation blockiert. Nach Umordnen der Antwortoptionen alle alten Lösungshaken entfernt und Start blockiert bis neuer Auswahl. Satz und Paare falsch/korrigiert; kompletter Vierstationenlauf bis Abschluss, Ergebnis mit eigenen Fragen und1,5L. Direkter3D-Klick wechselte auf Satzstation. 390×844-Viewport:390px Inhaltsbreite/390px Viewport, WebGL aktiv; kein physischer iPad-/Touchbeleg.

## Prüfnachweise und Grenzen

14 echte Node-Verhaltenstests (`node --test tests/core.test.mjs`) grün; vorher fehlendes Modul sowie spätere semantische Guardfälle rot. Drei eigene Module Syntax geprüft, Sourcehashmanifest und Vendorprovenienz gesichert. Browserdurchlauf per CUA mit tatsächlichen Feldern/Klicks/Selects, keine internen Zustandsinjektionen. Screenshots in evidence. Laufzeitpayloadgröße ist als Rohdateisumme gemessen, kein UE-/Produktpaketbudget. FPS/RAM/Schulgeräte-/Klassenlast-/Lernwirkung und menschliche Abnahme bleiben offen.

Dies ist ein lokaler Übungsprototyp: Lösungsauswahl liegt bewusst im Browser, Lehrkraftansicht ist direkt erreichbar. **Kein summativer/sicherer Prüfungsmodus**, keine echte Assessment-/Attempt-/Firestore-/ET-Anbindung, keine Noten oder serverseitige Punktewahrheit. Der geplante private Bewertungs-/Opaque-ID-Vertrag wird nicht durch lokale Indexarrays ersetzt. Native Bewegung, ProfilS, Saves, Szenen und PR175/219/220 bleiben unverändert. Die Webrendererwahl dient nur diesem Probeabschnitt und ist keine endgültige Engine-/Portentscheidung.

## Design und Herkunft

GradeCrew-Farben/Steuerelementgrundsätze aus design-system.css am Integrationsstand44ab übernommen: Hintergrund #f5f7fb, Text #1c2940, Blau #2458cb, Linie #dae3ee; zugängliche Direktbedienung, sichtbarer Fokus. Eigene prozedurale Insel/Vegetation/Stationen; keine kopierten Spielbilder. Vorhandenes GradeCrew-Zeichen assets/gradecrew/brand-primary-v1.svg übernommen. Three.js0.180.0/r180 aus offizieller Quelle, MIT-Lizenz und Hashes in dist/vendor/provenance.json. Kein neues Bild-/3D-/AI-Assetgenerieren.

Genau nächste Aktion: Martin gibt Fragen eines konkreten Unterrichts ein und beurteilt, ob die Handlung zur fachlichen Frage passt; erst danach nächste begrenzte Adapter-/Runtimeentscheidung, keine automatische Produktintegration.
