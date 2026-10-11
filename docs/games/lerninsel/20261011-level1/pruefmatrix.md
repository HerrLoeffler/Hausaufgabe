# Level 1 — ausführliche Abnahme- und Evidenzmatrix

Task GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011. Diese Matrix beschreibt **spätere** Prüfungen des freigegebenen Referenzkandidaten. **Heute sämtliche Runtimezeilen NICHTGEPRÜFT; keine Tests, Builds, Spielstarts oder OS-Captures ausgeführt.** A/B-Planreviews beurteilen nur, ob Kriterien und Quellen stimmig sind. Auswahlprofil D und Schrittprofil S werden separat nach [Variantenblatt](auswahlvarianten.md) beurteilt; T07/I10 bedeuten nur in D keine Fußauswahl, S benötigt alle zusätzlichen S-I01–09 samt wirklichem Steinkörperkontakt.

**PASS**: erwartete Wirkung am exakt gebundenen Kandidaten tatsächlich belegt. **FAIL**: beobachtete Abweichung mit reproduzierbaren Schritten. **NICHTGEPRÜFT**: kein tragfähiger Beleg, fehlende Session-/Inputbindung, Toolproblem oder nicht ausgeführt. Ein Erfolg der Toolanforderung ohne sichtbare Wirkung ist kein PASS. Keine stillen Ausnahmen: ein bewusst ausgenommener Scope erhält Grund, Owner und neuen Auslöser im Bericht.

Belegtypen: **F** = isolierte Automation/Fixture, ggf. kontrolliert positioniert; **N** = normale echte native/OS-Events, kein Teleport/ForceComplete/SetFlags; **V** = gespeicherte tatsächliche Spielansicht/Video; **D** = Dateihash/Manifest/Sourcevergleich; **M** = echte Messserie mit Gerät/Viewport/Verfahren. F/V allein ersetzen niemals N.

## Pflichtmanifest jedes späteren Prüflaufs

Task/Tester, UTC-Zeit, Commit und Source-Diff, Game-/Module-/Map-/Assethashes, konkreter Prozess/Projekt/Viewport, Gerätemodell/OS, Engineversion, Renderer, Auflösung/DPI, FOV/MouseSensitivity, Mode/Save-/Preferences-Slot, Startzustand und Herkunft des Snapshots, qualifizierter Inputweg, Reihenfolge Press/Release, Ergebnisse, Bild-/Log-/Videohashes. Recorder-Slot exklusiv. Keine anderen Fenster/Schülerdaten aufnehmen. Anonymes/synthetisches Testprofil. Keine fremden Spielprozesse beenden.

Bei Saveprüfungen: Normal-/Referenz-/Handoff-Dateihashes vor/nach, fehlgeschlagene Speichervorgänge getrennt. Bei Fixture-Recovery: bewusst injizierte ungültige Werte als F markieren, nicht als normal gespielter Ablauf. Keine nachträglich geänderte Quelle einer alten Binary zuordnen.

## A. Raum, Oberfläche und Bewegung

| ID | Spätere konkrete Aktion | PASS-Kriterium / erwartete Wirkung | Späterer Beleg / Owner | Heute |
|---|---|---|---|---|
| T01 | Von W0 über den Hügel zur Probe gehen | Sichtbarer Weg und erreichbare Route stimmen überein; keine Chatklärung nötig | N+V, A/B | NICHTGEPRÜFT |
| T02 | Mit W bergauf zur Kuppe und Probe gehen, ohne Sprung | Kein Stopp, Schweben, Rutschen oder Recovery | N+V+Floor/Pose, A | NICHTGEPRÜFT |
| T03 | Rückwärts und nach Drehung vorwärts hinabgehen | Beide Richtungen bleiben auf der sichtbaren Oberfläche | N+V, A | NICHTGEPRÜFT |
| T04 | Mit A/D an unterem, mittlerem und höchstem Profil quer gehen | Das gesamte erlaubte Hauptband bleibt begehbar | N+V+M Normale, A | NICHTGEPRÜFT |
| T05 | Profilvertices, Dreiecksnormalen und gekochte Floortraces vergleichen | Oberflächenabweichung höchstens 2 cm; lokale Winkel innerhalb 18°/8° | F+M, A; zusätzlich T02–04 erforderlich | NICHTGEPRÜFT |
| T06 | Terrain–Probe-Übergang langsam, schnell und rückwärts gehen | Keine Spalte, Doppelböden, Z-Fighting oder unsichtbaren Stufen | N+V+F, A/B | NICHTGEPRÜFT |
| T07 | Über Platten und abgeschrägte Steinübergänge gehen | Sichtbare Oberseite trägt den Pawn; D ohne Auswahl, S nur nach gültigem Intentvertrag | N+V+State, A | NICHTGEPRÜFT |
| T08 | Tor mittig, seitlich und unter dem Bogen anfahren | Capsule/Kopf passen nach Öffnung; keine unsichtbare Querbarriere | N+F Sweeps+V, A | NICHTGEPRÜFT |
| T09 | Stamm, Fels und Rand tangential/frontal anlaufen | Feste sichtbare Form blockiert passend; Laub blockiert nicht | N+F+V, A | NICHTGEPRÜFT |
| T10 | Vorplatz und erkennbare Küstenbegrenzung erkunden | Keine erreichbare ungesicherte Fall-/Wasserstelle; Rückweg frei | N+V, A/B | NICHTGEPRÜFT |
| T11 | Fixture bewusst unter Terrain/außerhalb der Zone setzen | SafePose, gültige Flags erhalten, Eingabe neutral, Rückmeldung und Log | F+D+V, A; kein Playtest-PASS daraus | NICHTGEPRÜFT |
| T12 | Den gesamten normalen Lauf auf Recovery beobachten | Keine Recovery nötig; jeder normale Recovery ist Gelände-FAIL | N+Log+V, A | NICHTGEPRÜFT |
| T13 | Kuppe mit Blick auf Tor/Meer bei FOV 75/85 gehen | Keine erzwungenen Kamerabewegungen; Ziele kontrolliert sichtbar | N+V, A/B | NICHTGEPRÜFT |
| T14 | Kandidaten-Properties tatsächlich auslesen | Capsule30/88, StepHeight30, Speed420; FloorAngle/Z und Scale dokumentiert | F+Source+D, A | NICHTGEPRÜFT |

## B. E/Klick, bewusste Auswahl und Fehler

| ID | Spätere konkrete Aktion | PASS-Kriterium / erwartete Wirkung | Späterer Beleg / Owner | Heute |
|---|---|---|---|---|
| I01 | Dasselbe Wort in getrennten E-/Klickversuchen aktivieren | Gleiches sichtbares Target und genau eine Statewirkung | N+V+State, A | NICHTGEPRÜFT |
| I02 | Zwischen benachbarten Worträndern zielen | Markierung/Hit eindeutig; nicht unbemerkt ein anderes nahes Wort wählen | N+F Hitlog+V, A | NICHTGEPRÜFT |
| I03 | Bei225 cm und knapp darüber aktivieren | Beide Eingaben beachten dieselbe Grenze; außerhalb kein Toggle | F+N+M Distanz, A | NICHTGEPRÜFT |
| I04 | Wort hinter Tor, Stamm oder Wand anvisieren | Feste Verdeckung verhindert E und Klick | F+N+V, A | NICHTGEPRÜFT |
| I05 | E halten, loslassen, erneut drücken | Eine Aktion pro bewusstem Press; kein Repeat/Release-Toggle | N+Inputlog+State, A | NICHTGEPRÜFT |
| I06 | Linksklick halten, ziehen und loslassen | Eine Worldaktion; Drag/MouseUp erzeugen keine zusätzliche | N+Inputlog+V, A | NICHTGEPRÜFT |
| I07 | Zwei getrennte schnelle Klickzyklen auf ungelösten blauen Introstein | Auswahl und bewusste Rücknahme bleiben beide erhalten | N+F+State, A | NICHTGEPRÜFT |
| I08 | Doppelte Dispatchs im selben Frame kontrolliert erzeugen | Gleiches Target/eine Worldaktion zählt einmal; getrennte Zyklen bleiben getrennt | F+Inputlog, A; I07 bleibt eigener N-Beleg | NICHTGEPRÜFT |
| I09 | E und Klick gleichzeitig auf gleiches Target geben | Kein Hin-/Hertoggle; konservativ ein Auswahlintent | N+F+State, A | NICHTGEPRÜFT |
| I10 | Auf Platten gehen und0,3/1/5 s stehen | D unverändert; S nur nach Start, aktiver Reihe und bewusstem gültigem Zentrum | N+F+State, A | NICHTGEPRÜFT |
| I11 | Auf Nicht-Target oder fernes Wort zielen | Keine Phantomwahl; nur eindeutiger passender Hinweis | N+V+State, A/B | NICHTGEPRÜFT |
| I12 | Wort aus anderer Gelände-/Randhöhe ansehen | Hitfläche und Reichweite passen; kein Durchgriff durch Terrain | N+F+V, A | NICHTGEPRÜFT |
| I13 | Menü über Wort öffnen, klicken/Enter/MouseUp geben | Kein Worlddispatch hinter dem Menü | N+F+State, A | NICHTGEPRÜFT |
| I14 | Hinweis schließen und erneut bewusst aktivieren | Alte Inputbesitze verworfen; neue Aktion funktioniert | N+F+V, A | NICHTGEPRÜFT |

| ID | Fachlicher Ablauf | PASS-Kriterium | Späterer Beleg / Owner | Heute |
|---|---|---|---|---|
| P01 | laufen und singen auswählen | introMask5 und intro true; Auto-Tor ohne Wortbestätigung | N+F+State+V, A/B | NICHTGEPRÜFT |
| P02 | Ein falsches Paar wählen | Auswahl sichtbar, Tor zu; kurze Korrektur ohne Strafverlust | N+F+V, A/B | NICHTGEPRÜFT |
| P03 | Bei zwei falschen Auswahlen ein drittes Wort versuchen | Maximal zwei; keine heimliche Ersetzung; Rücknahmehinweis | N+F+State, A | NICHTGEPRÜFT |
| P04 | Blaues ungelöstes Intro-Wort erneut auswählen | Nur dieses Wort weg; Zähler/Material/Text konsistent | N+F+V, A/B | NICHTGEPRÜFT |
| P05 | Mit keinem/einem Wort warten oder pausieren | Kein Autoerfolg, Timeout oder Strafsignal; Zustand erhalten | N+F+State, A/B | NICHTGEPRÜFT |
| P06 | singt→sucht→öffnet in drei Reihen wählen | Path0/4/8, Count3, verbs true; automatische Torfolge | N+F+V, A | NICHTGEPRÜFT |
| P07 | Eine zukünftige Reihe vorzeitig aktivieren | Count und vorherige Antworten unverändert; erwartete Reihe genannt | N+F+V, A/B | NICHTGEPRÜFT |
| P08 | In aktiver Reihe ein falsches Wort wählen | pathFailed; genau diese Auswahl sichtbar; nächste bis Undo gesperrt | N+F+State+V, A | NICHTGEPRÜFT |
| P09 | Rücknahme22 oder letztes gewähltes Wort aktivieren | Genau letzter Schritt weg; frühere richtige Reihen erhalten | N+F+State+V, A | NICHTGEPRÜFT |
| P10 | Früheres gewähltes Wort bei späterem Schritt aktivieren | Keine Arraylücke; Verweis auf letzte Rücknahme | N+F+State, A/B | NICHTGEPRÜFT |
| P11 | Fehler korrigieren und restliche Reihen lösen | Keine dauerhafte Blockade; korrekte Autoauswertung | N+F+V, A/B | NICHTGEPRÜFT |
| P12 | Auf gelöste Probe/Route erneut wirken | Kein doppelter Fortschritt oder unbeabsichtigter Neustart | N+F+D, A | NICHTGEPRÜFT |
| P13 | H/Hilfestelle wiederholt öffnen und schließen | Freiwillige verständliche Hilfe ohne Zeit-/Punkteverlust | N+F+V, B | NICHTGEPRÜFT |
| P14 | Baum-/Verbkontext lesen | Kontext gehört eindeutig zum gewählten Wort und erklärt Handlung | N+V, B | NICHTGEPRÜFT |

## C. Tor, Abschluss, Folge und Zonenauftrag

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| G01 | Nach letzter richtiger Wahl direkt gegen Tor gehen | Sichtbarer Erfolg; Collider blockiert bis GateAngle≥89,9° | N+F+V+Anglelog, A | NICHTGEPRÜFT |
| G02 | Mit falscher/unvollständiger Antwort zum Tor gehen | Geschlossen, kein Bypass oder fingierter Fortschritt | N+F+V, A | NICHTGEPRÜFT |
| G03 | Voll geöffnetes Tor mittig/seitlich und rückwärts passieren | Echte freie Passage für Capsule und Kopf | N+F+V, A | NICHTGEPRÜFT |
| G04 | Toröffnung mit Pause unterbrechen und fortsetzen | Stabiler nachvollziehbarer Animations-/Colliderzustand, kein Clip | N+F+V, A | NICHTGEPRÜFT |
| G05 | Tore und Leitungen aus den Rätselräumen ansehen | Eindeutige Ursache/Wirkung, keine dekorative Doppelroute | N+V, B | NICHTGEPRÜFT |
| C01 | Lösen und tatsächlich durch den Ausgang gehen | Abschluss erst am räumlichen Exit, keine neue Pflichtfrage | N+F+V, A/B | NICHTGEPRÜFT |
| C02 | Weiter zum Satzgarten normal aktivieren | Bestehende Zielszene erreichbar, gültiger isolierter Handoff, normaler Save unverändert | N+D+V, A | NICHTGEPRÜFT |
| C03 | Ungültigen/unvollständigen Handoffzustand injizieren | Kein unberechtigter Übergang; sichere Rückmeldung | F+D, A | NICHTGEPRÜFT |
| C04 | Kontrollierten Map-/Schreibfehler beim Übergang erzeugen | Kein Erfolgsbanner; gültiger Referenzversuch bleibt wiederaufnehmbar | F+D+V, A | NICHTGEPRÜFT |
| C05 | Fixturekamera bei ungelöstem Intro im Garten platzieren | Auftrag bleibt Intro; ausdrücklich kein normaler Spielbug daraus | F+V, A/B | NICHTGEPRÜFT |
| C06 | Normale Zonenwechsel selbst spielen | Pflichtauftrag/Ort widersprechen sich nicht; Gate erklärt Grenze | N+V, B | NICHTGEPRÜFT |

## D. Menü, Fokus, Kamera und Zugänglichkeit

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| F01 | Alle Menüs nur mit Tastatur bedienen | Logischer sichtbarer umlaufender Fokus; alle Aktionen erreichbar | N+V, A/B | NICHTGEPRÜFT |
| F02 | Slider per Maus/Pfeilen und FOV umstellen | Wert und Blickwirkung stimmen;0,25–3/75–85-Grenzen, kein Worldklick | N+F+V, A | NICHTGEPRÜFT |
| F03 | Bei gehaltenem W/A oder Mousepress Alt-Tab | Pause und Inputcancel; kein blindes Weiterlaufen | N+F+V, A | NICHTGEPRÜFT |
| F04 | Mit gehaltener Taste zurückkehren und Resume | Alte Bewegung neutral; erst neue bewusste Inputs gelten | N+Inputlog+V, A | NICHTGEPRÜFT |
| F05 | Esc in Spiel/Hilfe/Settings/Confirm/Pause | Nur die definierte Ebene schließen, kein Doppelsprung | N+F+V, A/B | NICHTGEPRÜFT |
| F06 | Über falscher Auswahl Pause öffnen/schließen | Antworten bleiben, Contact/Pendinginput neutral, keine Weltaktion | N+F+D, A | NICHTGEPRÜFT |
| F07 | Lange zögern und mehrere Minuten unterbrechen | Kein Zeit-/Strafdruck; freiwillige Hilfe erreichbar | N+V, B | NICHTGEPRÜFT |
| F08 | Pitch/FOV an Kuppe und Vorplatz variieren | Keine Zwangsblicke, Kopfclip oder verlorenen Ziele | N+V, A/B | NICHTGEPRÜFT |
| U01 | Gleiche Baseline-/Kandidatenposen vergleichen | Kurzes HUD, keine Textwand oder Menü-/Pflichttextüberdeckung | V+M Flächen, B | NICHTGEPRÜFT |
| U02 | Wörter bei2–3 m und normalem Kamerawinkel lesen | Pixel-/Winkelziele erfüllt; kein Zoom oder Raten nötig | N+V+M, B | NICHTGEPRÜFT |
| U03 | FOV75/85 und1280×800/1440×900 vergleichen | Texte/Buttons/Markierungen nicht abgeschnitten oder verdeckt | N+V+M, A/B | NICHTGEPRÜFT |
| U04 | Auswahl, Fehler, gelöst, Hilfe, Fokus, Disabled ansehen | Ausgewählte ganze Platte immer blau ohne Häkchen; Grün nur Leitung/Reihenmarke | N+V+M Kontrast, B | NICHTGEPRÜFT |
| U05 | Stumm und unter wechselnden Schatten spielen | Wesentliche Wirkung sichtbar verständlich, keine Soundpflicht | N+V, B | NICHTGEPRÜFT |
| U06 | Ohne Chatbeschreibung Hügel, Probe, Garten finden | Erkennbare Route, freie Lernzone und klare Torwirkung | N+V+qualitative Notiz, B | NICHTGEPRÜFT |
| U07 | Kontrast in hellen/dunklen Renderzuständen messen | Textziel4,5:1/Controls3:1; kein pauschales Accessibility-/Rechtszertifikat | V+M, B | NICHTGEPRÜFT |
| U08 | Natur-/Material-/Lichtrollen mit Referenz vergleichen | Sonniger Himmel, matte Steine, ruhige Vegetation, eigene Silhouette | V+Assetquellen, B | NICHTGEPRÜFT |
| U09 | Start/Restart/Ende bedienen | Wenige klare Elemente, fairer Abbruch, kein gefälschter ET-Versand | N+V, B | NICHTGEPRÜFT |

## E. Speichern, Wiederaufnahme und Isolation

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| S01 | Mit leerem und gültigem eigenem Save starten | Weiter nur nach valider Referenz; kein normaler Saveimport | N+F+D, A | NICHTGEPRÜFT |
| S02 | Auf Kuppe pausieren/schließen/Weiter | Boden-/Capsulefreie korrekte Pose; alte XRange setzt neuen Start nicht zurück | N+F+D+V, A | NICHTGEPRÜFT |
| S03 | Nach Introeinzelwahl/Falschpaar/Pathfehler speichern | Exakte Antwort und Korrektur bleiben; kein Phantomgate | N+F+D, A | NICHTGEPRÜFT |
| S04 | Nach richtigem Schritt/offenem Tor Resume | Flags erhalten, Pose/Collider sicher, kein Clip | N+F+D+V, A | NICHTGEPRÜFT |
| S05 | NaN/falsches Szenario/Layout/hinter Tor injizieren | Ungültige Pose verworfen, gültige Flags erhalten, keine Fremdimports | F+D, A | NICHTGEPRÜFT |
| S06 | Neustart abbrechen und bestätigen | Abbruch unverändert; Bestätigung nur eigener Versuch leer; Preferences bleiben | N+F+D, A/B | NICHTGEPRÜFT |
| S07 | Normal-, Referenz- und Anschlussdateien vor/nach vergleichen | Normal bytegleich, beide Testprofile/Preferences tatsächlich getrennt | D+N/F getrennt ausgewiesen, A | NICHTGEPRÜFT |
| S08 | Kontrollierten Speicherfehler erzeugen | Ehrliche knappe Meldung; keine falsche Dauerhaftigkeitsbehauptung | F+D+V, A | NICHTGEPRÜFT |
| S09 | Gültige unbestätigte IntroMask5/Path0,4,8 laden | Vorhandener Auto-Check korrekt; ungültige Varianten gesperrt | F+D, A | NICHTGEPRÜFT |
| S10 | Referenzmap direkt in Editor-PIE ohne CLI-Flag öffnen | GameModeoverride schützt normalen Save/Preferences | F+D, A | NICHTGEPRÜFT |

## F. Gesamtsequenz, Performance, Rechte und Reviewbelege

| ID | Spätere Aktion | PASS-Kriterium | Beleg / Owner | Heute |
|---|---|---|---|---|
| N01 | Ununterbrochenen korrekten LaufW0→Exit→Anschluss spielen | Nur gebundene normale Inputs, echte Aufgaben/Passagen; keine Fixtures | N+Video+D, A/B getrennt | NICHTGEPRÜFT |
| N02 | Fehler, Hilfe, Pause, Undo und Korrektur normal durchlaufen | Ohne Chatklärung lösbar, keine Sackgasse | N+Video+D, A/B | NICHTGEPRÜFT |
| N03 | Fachliches Ergebnis und freiwillige Erklärung festhalten | Aufgabenlösung belegt, nicht zu allgemeiner Lernwirkung erklärt | N+anonyme Notiz, B | NICHTGEPRÜFT |
| M01 | Warme/kalte/erste Shaderstarts getrennt messen | Ziele10/30s mit Gerät/Build/Verfahren belegt oder Befund | M+Log, A | NICHTGEPRÜFT |
| M02 | Mindestens60s je Bereich Framezeiten messen | Ziel60FPS/p95≤20ms/p99≤33ms oder Befund; Vsync/Editorlage dokumentiert | M+Trace, A | NICHTGEPRÜFT |
| M03 | Zusätzliche Assets/Speicher zur gleichen Basis vergleichen | Vorläufig≤100MiB/≤500MiB-Ziele belegt oder Abweichung benannt | M+D, A | NICHTGEPRÜFT |
| M04 | Asset-/Font-/Audioregister prüfen | Datei, Autor/Quelle, Lizenz, Attribution, bearbeitbare Quelle und Importweg | D+Review, B/Artowner | NICHTGEPRÜFT |
| M05 | Report in frischem Verzeichnis erzeugen, fehlenden Test gegenprüfen | Exakte erfolgreiche Testmenge;0inProcess; kein alter grüner Report als Ergebnis | F+D, A | NICHTGEPRÜFT |
| M06 | Unveränderten normalen Prototyp kontrollieren | Core/Saves/späterer Eimer/Fuchsbereich nicht beschädigt | F+begrenzter NKontrolllauf, Owner | NICHTGEPRÜFT |
| R01 | A/B nacheinander auf gleichem Kandidaten prüfen | Gleiche Hashes, eigene Slots, exklusive Capturezeiten, unabhängige Erstberichte | D+Review, Koordinator | NICHTGEPRÜFT |
| R02 | Nach bestätigtem Fix gezielt neu prüfen | Neue Belege am neuen Hash; keine Endlosschleife oder alten Finalbilder | D+F/N, Owner | NICHTGEPRÜFT |

## Heutige Evidenz und explizite Grenzen

Historischer L1-Report10.10.2026 bindet231portableChecks/5UE-Suites/zehnPIE-Posebilder an a5dc474. Er ist **kein** Beleg irgendeiner obigen neuen Level1-Zeile. Die Kamera02 mit ungelöstem Intro demonstriert einen Fixturezustand, keinen heutigen normalen Durchlauf. Source-Lesen bestätigt Schnittstellen, nicht Realzeitverhalten. Im Planreview dürfen A/B die **Planabdeckung** mit PASS/FAIL/NICHTGEPRÜFT bewerten; jedes Label muss „PLAN“ und Dokumentcommit nennen.

Endabnahme priorisiert tatsächliche Blocker: sichere Bewegung/korrekterLernkern, Saveisolation, klare Aktion, lesbare Pflichtinfo, erreichbarer Abschluss. Ein kritischer FAILblockiertbetroffene Freigabe; nichtgeprüfteiPad-/Webfunktionenwerden nichtals Mac-PASSausgegeben. B muss alle Annahmen zur lernschwachen Zielgruppe nennen. Ein künstlicher KI-Durchlauf ist keine echte Kinderstudie.

## Gezielte Matrixergänzungen aus unabhängigem Planreview

Alle heute **NICHTGEPRÜFT**, keine Runtimeprüfung.

| ID | Späterer Ablauf | PASS-Kriterium / Beleg | Owner | Heute |
|---|---|---|---|---|
| P15 | Richtige Reihe1, dann Startterminal20 erneut | Count/Array/Fehler bleiben; kein Vollreset außerhalb bestätigtem Neustart | N+F, A | NICHTGEPRÜFT |
| T15 | Plateau und verschobenen Abstieg vermessen und gehen | X−2200..−2000 konstant Z90; Abstieg endet−1450; reale Normale passen | F+N+M, A | NICHTGEPRÜFT |
| C07 | Nach Anschluss Satzgartenaktion/Preference ändern, schließen/Resume | Nur Continuation-Slots ändern sich; Normaldateien bytegleich; gleiche AttemptId | N+F+D, A | NICHTGEPRÜFT |
| C08 | Normal direkt starten bzw. Continuation ohne gültigen Save starten | Normal bleibt Normal; fehlender Handoff nie Produktionsfallback, Rückkehr möglich | N+F+D, A | NICHTGEPRÜFT |
| S11 | S auf Wortmitte resumen, warten, verlassen, neu betreten | Keine neue Antwort aus Contactreset; klare Rearmzeile; neuer Besuch möglich | N+F+V, A/B | NICHTGEPRÜFT |
| T16 | Nichtnormalen Character-Tick unter Z−150 prüfen | Recovery zuerst protokolliert, keine versteckte alte Rücksetzung; Flags erhalten | F+D+V, A | NICHTGEPRÜFT |
| U10 | D/S-Start, aktive Reihe, Mitte und Rearm lesen | Profilpassende Copy; Mitte-/Verlassenregel räumlich verständlich | N+V, B | NICHTGEPRÜFT |
