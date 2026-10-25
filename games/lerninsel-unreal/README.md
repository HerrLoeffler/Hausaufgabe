# Grade Crew Lerninsel — Vier-Rätsel-Prototyp

Ein eigenständiger Ego-Prototyp für Klasse 5–6 mit zwei freiwilligen Zusatzaufgaben. Vier Hauptmechaniken sind verbunden: Verbpfad, Satzweg, Bruchleitung und das räumliche Felsfenster. Die Einführung enthält eine kleine Verbprobe; die Wasserterrasse zusätzlich den lebensnahen 1-Liter-Mess-Eimer. Eigene Geometrie und Daten, keine importierten The-Witness-Assets.

## Lokal spielen

Auf diesem Mac `Lerninsel starten.command` doppelklicken. Der Starter öffnet die installierte UE5.8 mit diesem Projekt im Spielmodus. Auf einem anderen Checkout zuerst `Tools/build_editor.sh` ausführen. Alternativ `Lerninsel.uproject` im Editor öffnen und Play drücken. Die Karte enthält Licht/Start; die Welt und ihre Objekte entstehen aus der eigenen C++-Quelle beim Spielstart.

WASD geht, die Maus schaut, E untersucht/bedient das angezeigte nahe Objekt. Ein Weltklick untersucht das erreichbare Objekt im Blick. Esc schließt zuerst den Fokus und öffnet anschließend die Pause. In der Pause lässt sich FOV75/85 wählen. Native Widgets übernehmen Pflichtantworten, Fokus, Pointerdruck und Loslassen. Links bewegt ein Touchfinger, rechts schaut er; unten rechts liegt die Aktion. Touch ist vorbereitet, aber noch nicht auf einem physischen i Pad geprüft.

## Acht-Gebiete-Weltvorschau

`Lerninsel Weltvorschau starten.command` öffnet die neue UE-Karte `/Game/Maps/Lerninsel_Weltvorschau` im Spielmodus. Die FBX-Insel ist als statisches, kollisionsfreies Weltmesh importiert; die bisherige interaktive Lerninsel mit ihren vier Haupt-Rätseln wird zusätzlich aufgebaut. Die Vorschau nutzt einen eigenen Fortschrittsspeicher und startet bei jedem Öffnen am Anfang. Steuerung: WASD, Maus, E, Esc wie oben.

Die acht Gebiete sind aktuell als zusammenhängende Landschaftskulisse sichtbar. Interaktive Lernaufgaben sind in dieser Vorschau weiterhin die bereits getesteten ersten vier Haupt-Rätsel; für die Gebiete fünf bis acht, ihre Tore und Übergänge fehlen noch eigene Rätselmechaniken. Die neue Kulisse ist ein Blender-Blockout, keine finale hochauflösende Umgebung. Die Wege, Höhen, Kollisionsführung und Darstellung auf iPad sind noch nicht abgenommen.

## Die zusammenhängende Spielfolge

1. **Verbprobe:** Zwei Verben aus vier Kontextwörtern auswählen, höchstens zwei gleichzeitig. Am Schlussstein prüfen.
2. **Verbpfad:** Den Weg am Startstein aktivieren. In jeder Reihe mittig auf ein Verb gehen und mindestens 0,30 s halten. Randkontakte zählen nicht. Ein falscher Schritt trägt ein eigenes !-Symbol; am Randstein zurücknehmen. Nach drei Reihen ausdrücklich prüfen.
3. **Satzweg:** Vier verschiedene Satzglieder zu einem Aussagesatz ordnen. Auswählen per Bodenschritt nach Start, bewusster Wortinteraktion oder nativer Tafel. Das Verb steht an zweiter Satzgliedposition. Alle sechs gültigen Reihenfolgen sind erlaubt. Rücknahme und Prüfung bleiben getrennt.
4. **Mess-Eimer:** Kapazität 1 Liter, Ziel3/10=300ml. Am Brunnen bestätigt jeder Hub 100 ml; Ablass entfernt 100 ml. Eimer bewusst auf die3/10-Platte setzen. Bei2/10 und4/10 lässt er sich mit der normalen Aktion wieder aufnehmen und korrigieren. Pause/Fokusverlust verwirft unbestätigte Portionen.
5. **Bruchleitung:** Ein vollständiger Ast vom Start über drei Knoten zum Ziel muss ein Ganzes ergeben. Mausdruck kann die Linie halten und über Knoten ziehen; einzelne Knotenwahl ist ebenfalls möglich. Kanten und korrekte Abzweige sind sichtbar. A=1/2+3/10+1/5, B=1/2+1/5+1/10, C=3/10+1/5+1/5. Rückwärts beziehungsweise „Kante zurück“ nimmt den letzten Schritt zurück. Das Tor wartet auf vollständig gefülltes Messbecken und abgeschlossene Öffnung.
6. **Felsfenster:** Vier Reliefs am unteren Küstenweg entdecken. Im Fundbuch genau drei bekannte Anteile auswählen. Richtige Summe allein öffnet nichts. Die breite Treppe führt zur erhöhten Steinbank; vom runden Standzeichen ergeben die räumlich getrennten Formen einen Ring. Passende Position und Blickrichtung sind nötig. E bestätigt die Verbindung bewusst. Die Blickhilfe ist freiwillig und teleportiert nicht.
7. **Turm:** Vier Hauptsignale bestätigen den Prototypabschluss. Vier weitere Fenster bleiben dunkel, weil das spätere Achtgebiets-Spiel noch nicht vollständig gebaut ist.

Zusatzsteine bieten eine Kontextfrage zur Nominalisierung und eine anspruchsvollere Zwölftel-Ergänzung. Sie verändern die bereits geöffneten Haupttore nicht.

## Nachweise und Grenzen

`sh Tests/run.sh` prüft den echten portablen Regelkern und neue Puzzledefinitionen. `Tools/test_editor.sh` baut zuerst das aktuelle Modul, führt die native Engine-Automation aus und exportiert Berichte. Die native Tafelprüfung benutzt Slate-Pointerbewegung, Druck, gehaltenes Ziehen und Loslassen. Sie ist mehr als ein direkter Regelfunktionsaufruf; sie ersetzt jedoch keinen Erstspieldurchlauf eines Kindes.

Reports enthalten echte Spiel-/Widgetaufnahmen. Tests versetzen den Actor gezielt zwischen Stationen, um Integration und Darstellung zu prüfen. Daraus wird keine gemessene Spieldauer, vollständiger Spaziergang oder Spaßabnahme abgeleitet. Saveformat LI2 übernimmt frühere LI1-Lösungen; bei geänderter Geografie beginnt die Migration sicher am Anfang. Der lokale Nutzerslot bleibt Lerninsel V1; Automationsslots sind separat.

Das native Programm ist ein Funktionsprototyp. Landschaft und Modelle sind deutlich einfacher als die hochwertigen Konzeptbilder. Kein endgültiger Grafikvergleich, Audioausbau, öffentliches Pixel Streaming oder signierter/iPad-getesteter Build. Ein Browserzugang mit dieser Engine benötigt separate Streaming-Infrastruktur. Kein Production-Deploy.

## Ausführliche Baugrundlage

`docs/games/lerninsel/20261007/spielbuch.md` enthält den ursprünglichen umfangreichen Entwurf. `docs/games/lerninsel/20261008-production/` ergänzt Bauvertrag, Bildprüfung, zwölf neue 20-Motiv-Tafeln und den reproduzierbaren 280-seitigen illustrierten Atlas. Zusammen 261 Konzeptmotive, keine 261 fertigen 3 D-Assets. Das lokal erzeugte PDF ist wegen seiner Größe nicht eingecheckt; Quellen, Bilder und `build_handbook.py` sind gesichert. Mit Report Lab und pypdf reproduzierbar; die vorhandene Unreal-Installation liefert die Schriftdateien.

Task GC-GAMES-ESCAPE-VISUAL-01, Branchfeature/lerninsel-ego-v1, Draft PR175. Aktueller Stand/Versuchshistorie: Production/HANDOFF.md. Prüfbefunde: Production/REVIEW.md.


## Aufgabenführung – Überarbeitung vom 08.10.2026

Bei der Verbprobe wählt ein Klick oder E das Wort unmittelbar aus. Der ganze Stein wird blau; es gibt kein Häkchen und kein zweites Auswahlfenster. Erneutes bewusstes Auswählen nimmt das Wort zurück. Zwei richtige Verben öffnen das Tor automatisch. Der Verbweg erklärt dauerhaft: vorne anfangen, in jeder der drei nummerierten Reihen ein Verb wählen. Ein erstes Wort startet den Weg ebenfalls direkt. Drei richtige Schritte öffnen das Tor automatisch; falsch gewählte Schritte am Stein Schritt zurück links verbessern. Der spätere Satzplatz zeigt ein Beispiel und die Regel Verb auf Platz 2.

Die neue Version wird über denselben Starter geöffnet. Eine noch laufende alte Spielsitzung bitte schließen und Lerninsel starten.command erneut öffnen; Änderungen erscheinen nach Neustart. Vorhandener Fortschritt bleibt erhalten. Layoutvorlage und genaue Entscheidungen: docs/games/lerninsel/20261008-learning/README.md. Die Vorlage ist Konzeptkunst; tatsächliche Aufnahmen stehen in Reports/Learning-Selection.png und Reports/Learning-Verbweg.png. Neue Nutzerabnahme bleibt offen.


## Erweiterung: Fuchs, zweite Wasseraufgabe und Einstellungen

Nach dem Neustart öffnet Esc das Pausenmenü mit Mausgeschwindigkeit25–300Prozent. Die Figur läuft zügiger. Nach gelöstem Satz bietet Fuchsaktion erneut ansehen die Szene ohne Verlust des Lernfortschritts. Beim ersten richtigen Satz erwacht er automatisch und löst den Seilriegel am Tor.

Nach der ersten3/10-Probe denselben Messbecher wieder von der Platte aufnehmen und mitnehmen. Im nächsten Bereich füllen100ml- und200ml-Hähne; am Ablauf lässt man100mlab. Ziel1000ml=1Liter, dann am Zielbecken E. Die alte gezeichnete Bruchroute ist keine Pflichtbedienung mehr. Details und120Konzeptstudien: docs/games/lerninsel/20261008-fox-water/README.md. Die Spielgrafik ist einfacher als dieVorlagen; echteAufnahmen inReports. Prüfnachweis Production/WATER-FOX-REVIEW.md.

## L1-Sicherung und Integration vom 10.10.2026

Die ursprüngliche Weltüberlagerung wurde in echten Spielbildern bestätigt: Kulissentore, falsche Gebietsnummern und erhöhte Wegteile standen in den vier bisherigen Lernaufgaben. Als begrenzte Zwischenlösung steht der vorhandene importierte Actor jetzt bei (0, 14000, 0), seitlich außerhalb der interaktiven Route. Der unveränderte Blender-/FBX-Blockout bleibt gesichert. Die Kulisse ist somit **noch kein begehbarer Acht-Gebiete-Spiellevel**; eine gebietsweise Ausrichtung und eigene Kollision sind spätere Integrationsarbeit. Keine neue Art wurde hergestellt.

`Tools/test_world_preview.sh` baut und prüft gezielt die gespeicherte Vorschaukarte. `Tools/check_all.sh` enthält die bisherigen Gameplay-Suites plus Vorschaucheck mit getrenntem Speichermodus. L1-Belege: `Production/L1/verification.json`, `Reports/L1/`, `workstreams/lerninsel-l1-20261010.md`. Die zehn Ansichten sind tatsächliche PIE-Spielkamerabilder, keine Blender-Renders. Geskriptete Kamerapositionen und Stichproben-Sweeps ersetzen keinen ununterbrochenen Lauf aller Wege.
