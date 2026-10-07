# GradeCrew Lerninsel — erster Unreal-Abschnitt

Eigenständiger Ego-Prototyp für Klasse5–6. Startgarten, zwei Verbproben und Wasserterrasse sind gebaut. Gestaltung folgt dem vereinbarten Spielbuch: ruhige Erkundung, helle Natur, räumliche Lernrätsel und sichtbare Torverbindungen. Eigene Geometrie und Aufgaben; keine The-Witness-Assets.

## Lokal spielen

Auf diesem Mac `Lerninsel starten.command` doppelklicken. Die Datei öffnet die vorhandene UE5.8-Installation mit diesem Projekt im Spielmodus. Beim ersten Start auf einem anderen Checkout vorher `Tools/build_editor.sh` ausführen. Alternativ `Lerninsel.uproject` im Unreal-Editor öffnen und Play drücken; die Weltgeometrie entsteht beim Spielstart aus `IslandArt.cpp`.

- WASD gehen, Maus schauen, E nahe Objekte untersuchen/bedienen.
- Esc schließt zuerst die Wortansicht; ein weiteres Esc öffnet die Pause. Sichtfeld75/85° im Pausenmenü.
- Zwei Verben in der kleinen Probe bestätigen und am Schlussstein prüfen. Nur zwei Auswahlen gleichzeitig.
- Am Startstein den Verbweg aktivieren; pro Reihe mittig auf ein Verb gehen und kurz stehen bleiben. Kontext mit E lesen, falschen letzten Schritt am Randstein zurücknehmen. Drei richtige Schritte am Schlussstein prüfen.
- 1-Liter-Eimer aufnehmen, am Brunnen jeweils100ml einfüllen, gegebenenfalls am Ablass100ml entfernen. 3/10=300ml auf der beschrifteten Platte absetzen. Der Eimer hat zehn gleiche Höhenabschnitte in einem zylindrischen Innenraum; die tragbare HUD-Skala vergrößert die Hilfe.
- Bestätigte Lösungen bleiben erhalten. Speichern erfolgt lokal pro Interaktion in LerninselV1, keine Konten/Cloud. Tastatur und Berührung werden bei Fokuswechsel/Pause zurückgesetzt; abgebrochene Portionen zählen nicht.

## Umfang und Prüfbarkeit

UE5.8.3 Development Editor auf Mac M5Pro. `Tests/run.sh` prüft den tatsächlichen Regelkern; `Tools/test_editor.sh` prüft die Engine-Integration, inklusive Eingaberouting, Kollision, Füllung, Pause und Speicherung. `Reports` enthält tatsächliche Spielaufnahmen, keine Konzeptbilder. `Tools/create_world.py` erzeugt wiederholbar nur die eigenen Materialien und die eigene Karte. Bei diesem macOS-Editor kann der Python-Lauf nach erfolgreichem Speichern im Shutdown hängen; gespeicherte Inhalte anschließend mit dem Engine-Spieltest prüfen, keine erfolgreiche Erzeugung nur aus dem Prozessstart ableiten.

Dies ist der erste spielbare Abschnitt und ein erster Art-Durchgang. Keine endgültige grafische Abnahme, kein vollständiges Achtgebiets-Spiel. Satzweg, weitere Bruchrätsel, Felsfenster und schwierigere Zusatzrätsel stehen im ausführlichen Spielbuch unter `docs/games/lerninsel/20261007/spielbuch.md` im Repository und sind hier noch nicht implementiert. Audio, fertige Landschaftsformen und ausgearbeitete Assets folgen.

Touch-Eingabe ist vorbereitet: linker Finger bewegt, rechter zieht die Ansicht, Aktion unten rechts. Desktop-Simulation ersetzt keine Prüfung auf einem iPad. Kein veröffentlichter Browserzugang, PixelStreaming-Server oder signierter iPad-Build. Der Webweg mit UE benötigt Streaming-Infrastruktur; ein nativer iPad-Build benötigt separate mobile Qualitätseinstellungen und Gerätetests.

Task GC-GAMES-ESCAPE-VISUAL-01, Branch feature/lerninsel-ego-v1. Übergabe und Versuchshistorie: Production/HANDOFF.md. Kein Production-Deploy.
