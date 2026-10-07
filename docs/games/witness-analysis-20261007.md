# The Witness als Grundlage für die GradeCrew Lerninsel

Für Klasse 5–6 entsteht der Vorschlag einer begehbaren Ego-Insel mit acht Gebieten. Der erste Bauabschnitt umfasst vier vollständige Lernrätsel und ein gemeinsames Finale. Schwierige Nebenrätsel sollen Erwachsene ansprechen. Die folgenden Level und Regeln sind der erste Rechercheentwurf, noch kein gebautes Spiel. Der spätere Bildauftrag mit Bodenwortmechaniken ist im Spielbuch lerninsel-spielbuch-20261007.md konkretisiert; dessen vier Hauptbeispiele ersetzen die frühere Beispielsammlung hier.

Die Empfehlung ist Unreal Engine 5.8 für die Spielwelt, Browserzugang über Pixel Streaming und später ein eigener optimierter iPad-Build. Falls direkter Browserbetrieb ohne Streaming verbindlich ist, muss vor dem Bau eine andere Engine gewählt werden.

## Was The Witness ausmacht

Das Original ist ein Einzelspielerspiel in einer offenen Inselwelt mit mehr als 500 Rätseln. Die offizielle Beschreibung betont, dass jedes Rätsel eine neue Idee beitragen soll. Unsere acht Bereiche sind ein eigener Umfangsvorschlag und keine Behauptung über die Zahl der Originalgebiete. „1vs1“ wird hier als enge Orientierung am Spielgefühl verstanden; ein Wettkampfmodus ist nicht angefordert. [Offizielle Spielbeschreibung](https://store.steampowered.com/app/210970/The_Witness/)

Der technische Kern der Tafeln ist eine durchgehende Linie von einem Start zu einem Ende. Sie darf sich nicht selbst schneiden und muss die jeweiligen Regeln erfüllen. Beispielsweise trennt die Linie verschiedenfarbige Felder, berührt vorgeschriebene Punkte oder begrenzt Flächen, in die Formen passen müssen. Diese Regeln sind formal untersuchbar. Ein gezeichneter Pfad ist deshalb keine gespeicherte Musterantwort: mehrere regelkonforme Lösungen können richtig sein. [Formale Untersuchung der Rätsel](https://arxiv.org/html/1804.10193v3)

Jonathan Blow beschreibt das Spiel als Untersuchung einfacher Ideen wie Licht, Schatten, Verdecken und Formen. Die Bedienung bleibt bewusst schmal: erkunden und Linien zeichnen, ohne Sprungmechanik oder Rucksack. Daraus folgt für unseren Entwurf: Lernhandlungen müssen verständlich und beständig sein, damit das Nachdenken die Schwierigkeit trägt. Die im Nutzerauftrag gewünschten Suchaufgaben können Beobachtung nutzen; ein umfangreiches Inventar ist dafür nicht nötig. [Interview mit dem Entwickler](https://time.com/4355763/the-witness-jonathan-blow-interview/)

Die Art Direction entstand in enger Zusammenarbeit mit Architektur und Landschaftsgestaltung; die visuelle Sprache unterstützt das Spiel. Für unsere Insel bedeutet das: Wege, Blickachsen, Materialwechsel und Landmarken führen zu Rätseln. Ein beliebiges Waldmodell mit aufgesetztem Arbeitsblatt würde diesen Zusammenhang nicht erreichen. [Vortrag des Art Directors](https://gdcvault.com/play/1020134/The-Art-of-The)

Unsere daraus abgeleitete Lernfolge lautet: entdecken → eine einfache Regel ausprobieren → einen Gegenfall verstehen → die Regel übertragen → eine sichtbare Veränderung auslösen. Jeder Fehler bleibt korrigierbar. Hilfe wird auf Wunsch in drei Stufen angeboten: Beobachtungshinweis, Regelhinweis, ein vorgemachter Teilschritt. Die Lösung wird dabei nicht automatisch ausgelöst.

## Engine und Plattformen

The Witness verwendet eine eigene Engine. Luis Antonio nennt gutes indirektes Licht, große Sichtweiten, Detailstufen und Asset-Streaming als Schwerpunkte. Das beschreibt technische Voraussetzungen der Bildwirkung, keine übertragbare Originalimplementierung. Es liegt uns kein Originalquellcode vor. [Entwicklerquelle](https://twelveminutesgame.com/2017/09/creating-visual-style/)

Unreal 5.8 und das PixelStreaming2-Plugin sind auf dem Rechner tatsächlich vorhanden. Die vorhandene Expedition verwendet eine schräge Folgekamera. Eine Ego-Kamera, Tafeleingabe und offene Inselroute sind daher neue Arbeit. Speichern, Zustandsregeln und vorhandene Build-Erfahrungen sind mögliche Wiederverwendungsquellen; die andere Welt wird nicht überschrieben.

Pixel Streaming führt die Unreal-Anwendung auf dem Host aus. Bild und Ton gelangen über WebRTC in den Browser; Maus, Tastatur und Touch zurück zum Spiel. Safari auf Desktop und Mobilgeräten gehört zu den dokumentierten Clients. Die Webpage ist damit eine Steuerungs- und Wiedergabefläche, kein lokal im Browser laufender Unreal-Export. [Funktionsweise](https://dev.epicgames.com/documentation/unreal-engine/overview-of-pixel-streaming-in-unreal-engine) · [Client- und Hostvoraussetzungen](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-pixel-streaming-reference?application_version=5.8)

Eine zweite Person darf nicht still dieselbe Spielinstanz steuern. Für unabhängig spielende Kinder müssen Sitzungstrennung, Kapazität, Latenz, Wiederverbindung und Kosten ausdrücklich geprüft werden. Firebase Hosting allein stellt keine Unreal-GPU bereit. Im ersten lokalen Browsertest kann der Mac Host sein; eine öffentliche oder für Klassen geeignete Bereitstellung ist ein eigener Betriebsschritt.

Der spätere native iPad-Build benötigt einen passenden mobilen Renderpfad, Apple-Signierung und Gerätetests. Der normale Mobile-Renderer unterstützt nicht automatisch sämtliche Desktopfunktionen; beispielsweise sind Nanite und Hardware-Raytracing dort nicht verfügbar. Die erste Insel sollte deshalb mit normalen Meshes, Detailstufen, einfachen Materialien und vorberechnetem Licht funktionieren. [Mobile-Funktionen](https://dev.epicgames.com/documentation/unreal-engine/rendering-features-reference) · [Apple-Geräteworkflow](https://dev.epicgames.com/documentation/unreal-engine/getting-started-with-mobile-development-in-unreal-engine)

Auch das Original erhielt seine iOS-Fassung erst nach eigener Optimierung und verfeinerter Touchbedienung. Das ist ein praktischer Hinweis darauf, Mobile als eigenen Entwicklungs- und Abnahmeschritt einzuplanen. [Entwicklerankündigung](https://the-witness.net/news/)

## Vergleich der Bauwege

Bewertung anhand derselben Ziele: Ego-3D und Bildgestaltung 30 %, Browserzugang 25 %, späteres iPad 20 %, gemeinsamer Spielkern und Wartung 15 %, Betriebsaufwand 10 %. Die Werte sind begründete Eignungsschätzungen, keine Leistungsmessung.

| Weg | Eignung | Stärke | Entscheidend offen |
| --- | --- | --- | --- |
| Unreal mit Pixel Streaming, später nativer iPad-Build | 8/10 | Gewünschte Engine; ein Spielkern und dieselbe Welt für Browserstream und App | GPU-Betrieb, individuelle Sitzungen, Netze und Kosten; echte iPad-Abnahme |
| Browserengine als einziges Spiel, etwa Babylon.js | 7/10 | Direkter Webstart; keine Streaming-GPU pro Kind | Abweichung von Unreal-Vorgabe; eigene Produktionswerkzeuge und Gerätelimits |
| Getrenntes Browser- und Unreal-Spiel | 5/10 | Beide Ausgabewege unabhängig möglich | Doppelte Eingabe-, Welt-, Fehler- und Abnahmearbeit; Gefahr abweichender Rätsel |

Empfehlung unter der Unreal-Vorgabe: erster Weg. Ist dagegen „läuft direkt im Schulbrowser ohne Stream“ das wichtigste Kriterium, kehrt sich die Empfehlung zugunsten einer Browserengine um. Keine Cloud-GPU, bezahlte Assets oder neue Anbieteraufrufe sind durch diesen Vorschlag gestartet.

## Insel und räumlicher Aufbau

Vorgeschlagener Name: Insel der Erkenntnisse. Eigene Geometrie, Materialien, Rätseldaten und Architektur; die Nutzerbilder dienen der Abstimmung von Farben, Maßstab und Atmosphäre.

Die Insel hat einen gut sichtbaren zentralen Leuchtturm. Vom geschützten Ankunftshof gelangt man in einen kleinen Garten, der das Zeichnen lehrt, und danach an einen Wegknoten mit drei offenen Richtungen. Die erste Prüfung ist geleitet; danach darf man ein schwieriges Rätsel verlassen und anderswo fortfahren. Finale Nebenrätsel blockieren keine Lernroute.

| Gebiet | Erkennbare Landmarke | Lernidee | Umfang im ersten Abschnitt |
| --- | --- | --- | --- |
| Ankunftsgarten | Weißer Torbogen und niedrige Mauern | Start, Ende und unterbrechbares Zeichnen | Eine kleine Einführung |
| Bruchterrassen | Wasserbecken und gelber Aquädukt | Gleichwertige Brüche und Addition | Rätsel 1 |
| Wortartenhain | Rote Baumkronen und helle Tafeln | Wortarten im Satzkontext | Rätsel 2 |
| Satzbrücke | Blaue Stahlbögen über einer Schlucht | Satzteile und Verbzweitstellung | Rätsel 3 |
| Beobachtungsküste | Felsfenster und drei Steinbögen | Suchen, Perspektive und Bruchtransfer | Rätsel 4 |
| Spiegelgarten | Zwei symmetrische Pavillons | Spätere Symmetrie und Vergleich | Sichtbare spätere Landmarke |
| Klangwald | Bambus und Windkörper | Spätere Reihenfolgen und Höraufgaben | Sichtbare spätere Landmarke |
| Leuchtturm | Acht Lichtfenster | Regeln später kombinieren | Erstes Finale mit vier Signalen |

Im ersten Abschnitt sind fünf Gebiete begehbar; drei Erweiterungsgebiete sind als Landschaft sichtbar und als später gekennzeichnet. Es werden nicht acht vollständige Welten versprochen, wenn zunächst vier Rätsel gebaut werden.

Jedes Hauptgebiet erhält eine Regelprobe, eine kleine Variation und eine eigentliche Transferaufgabe. Vier Rätsel bedeutet vier ausgearbeitete Mechanikfamilien; die kurzen Regelproben gehören dazu. Die ersten vier Signale öffnen eine Aussichtsterrasse am Leuchtturm. Später können dort alle acht Gebietsideen zusammenkommen.

Vorgeschlagene räumliche Ziele: Wege etwa 2,5 Meter breit, keine notwendigen Sprünge, Stationen über einen kurzen Rückweg erreichbar, Ankunftsknoten mit Blick auf mindestens zwei Ziele. Haupttafel und unmittelbarer Hinweis bleiben gleichzeitig sichtbar. Die rätselrelevante Beleuchtung verändert sich nicht mit einer Tageszeitsimulation. Genauere Entfernungen werden im begehbaren Blockout geprüft.

## Vier konkrete Lernrätsel

### Rätsel 1 Der volle Wasserlauf

Ort: Bruchterrassen. Drei Leitungsäste verbinden eine runde Quelle mit einem leeren Sammelbecken. Der Spieler zieht eine durchgehende Linie über einen der Äste. Die Werte entlang des gewählten Astes müssen zusammen genau ein Ganzes ergeben; das Becken ist in acht gleiche Teile gegliedert.

Konkrete Prüfversion:

- Ast A: 1/2 → 2/8 → 1/4. Summe 4/8 + 2/8 + 2/8 = 1.
- Ast B: 1/3 → 1/3 → 1/6. Summe 5/6.
- Ast C: 1/4 → 1/4 → 1/4. Summe 3/4.

Einführung: 1/2 + 1/2, danach 1/2 + 1/4 + 1/4. Prüfversion A zeigt dieselbe Menge mit anderer Schreibweise. Der Spieler entdeckt, dass ein veränderter Nenner nicht automatisch eine veränderte Menge bedeutet.

Erfolg: Wasser folgt der gezeichneten Leitung, das Becken füllt sich und eine kleine Steinbrücke wird angehoben. Fehler: Das Becken zeigt die tatsächlich erhaltene Menge; die Leitung kann erneut gezeichnet werden. Ein dezenter Hinweis zeigt auf Wunsch die gemeinsamen Achtel. Zusatzrätsel: ein stärker verzweigter, vorab auf Lösbarkeit geprüfter Weg mit Zwölfteln und einer weiteren Regel, nicht bloß längere Zahlen.

Abnahme: A wird angenommen, B/C abgelehnt; 2/8 und 1/4 werden exakt gleich bewertet. Unterbrechen, Rückwärtszeichnen, Fingerverlust und Neustart erzeugen keinen doppelten Weltfortschritt.

### Rätsel 2 Die Wortartenbeete

Ort: Wortartenhain. Ein durchgehender Zaunpfad trennt Wörter in Beete. In jedem Beet liegt nur eine Wortart. Die Wörter sind ohne verräterische Kategorienfarben dargestellt und werden zusammen mit ihrem Satzkontext gelesen.

Beispielkontexte: „Die kleine Eule öffnet das alte Tor.“ und „Der flinke Fuchs sucht den roten Stein.“ Kategorien: Artikel, Adjektiv, Nomen, Verb. Die Probe zeigt vier Reihen auf einem 4×4-Feld:

1. Eule · Tor · Fuchs · Stein
2. öffnet · sucht · leer · leer
3. kleine · alte · flinke · roten
4. Die · das · Der · den

Ein nachweislich konstruierbarer Einführungspfad verläuft auf dem 5×5-Knotengitter von (0,0) nach (0,1), quer nach (4,1), nach (4,2), quer nach (0,2), nach (0,3), quer nach (4,3) und nach (4,4). Alle Zwischenschritte liegen auf Gitterkanten. Er trennt die vier Reihen ohne Selbstschnitt. Koordinaten laufen von links oben nach rechts unten.

Die eigentliche Prüfversion erhält eine weniger offensichtliche Anordnung, die erst nach Lösungssuche und fachlicher Prüfung freigegeben wird. Die geordnete Reihenprobe wird nicht als fertig anspruchsvolles Rätsel ausgegeben.

Erfolg: Vier Beete blühen mit eigenen Formen auf und ein Gartentor öffnet sich. Fehler: Nur das vermischte Beet wird kenntlich; der Spieler bleibt am eigenen Pfad. Zusatzrätsel: „das Laufen“ gegenüber „wir laufen“ mit ausdrücklich sichtbarem Kontext. Die Farbe gehört zur Erfolgsanimation und verrät die Wortart nicht vorab.

Abnahme: Regionen werden aus dem tatsächlichen Pfad berechnet. Unterschiedliche gültige Linien sind richtig. Großschreibung allein liefert keine pauschale Klassifikation; leere Zellen werden ignoriert. Nach Hilfe folgt ein neuer kurzer Kontext, bevor der Abschnitt als verstanden markiert wird.

### Rätsel 3 Die Satzbrücke

Ort: Satzbrücke. Vier große Satzteilsteine lassen sich in vier Brückensockel setzen: „heute“, „öffnet“, „der Fuchs“, „den Eingang“. Das Relief neben der Brücke zeigt einen Fuchs, der den Eingang öffnet. Ziel: ein Aussagesatz mit derselben Bedeutung und dem finiten Verb an zweiter Satzgliedposition.

Mindestens diese normalen Varianten werden angenommen: „Heute öffnet der Fuchs den Eingang.“ und „Der Fuchs öffnet heute den Eingang.“ Objektvoranstellung ist ebenfalls zulässig: „Den Eingang öffnet der Fuchs heute.“ Weitere erlaubte Reihenfolgen werden von der fachlich geprüften Variantenliste gedeckt. Artikel und Nomen bleiben in der Einführung als Satzteil zusammen. Satzanfang und Schlusszeichen werden beim Einsetzen korrekt angezeigt.

Die Spieler erkennen über einfache Zwei- und Drei-Satzteilproben die Verbposition. Die zweite Position zählt Satzglieder, nicht einzelne Wörter. Damit wird „der Fuchs“ nicht irrtümlich als zwei Positionen bewertet.

Erfolg: Die Satzteile werden zu begehbaren Planken; die Brücke fährt aus. Fehler: Nur die Stelle des Strukturproblems wird kurz markiert. Man kann jederzeit Teile zurücknehmen. Zusatzrätsel: ein Nebensatz mit „weil“ und Verbendstellung, auf einer getrennten Tafel, nachdem die Grundregel sitzt.

Abnahme: alle fachlich gültigen freigegebenen Varianten funktionieren; eine einzige Musterzeichenfolge genügt nicht. Touch kann durch Antippen von Teil und Sockel arbeiten, ohne präzises Drag-and-drop zu erzwingen. Ausgebaute Planken können keinen Spieler in der Schlucht einschließen; eine Rücknahme ist nur von sicherem Standpunkt möglich.

### Rätsel 4 Das Ganze im Felsfenster

Ort: Beobachtungsküste. Vier in der Umgebung verteilte Steinmuster tragen Anteile 1/8, 1/4, 3/8 und 1/2. Eine Zeichnung am Aussichtspunkt zeigt drei fehlende Bogenstücke und ein Ganzes. Man sucht und untersucht die Muster; genau drei müssen zusammen eins ergeben.

Konkrete richtige Auswahl: 1/8 + 3/8 + 1/2 = 1. Die übrigen drei Kombinationen ergeben 3/4, 7/8 und 9/8. Alle Steine liegen an begehbaren Wegen und sind auf normaler Augenhöhe prüfbar; sie sind keine winzigen versteckten Klickziele.

Nach korrekter Auswahl führt die Aussichtsskizze zu einem breiten Standbereich. Aus dieser Blickrichtung verbinden sich die drei Steinmuster zu einem Weg durch das Felsfenster. Man bestätigt die Verbindung mit derselben Zeichengeste wie zuvor. Der Standbereich muss großzügig sein; punktgenaues Positionieren darf die Erkenntnis nicht ersetzen.

Erfolg: Der verbundene Bogen leuchtet und schaltet das vierte Leuchtturmsignal frei. Fehler: Die betrachteten Anteile bleiben im lokalen Notizbild sichtbar; kein wiederholtes Ablaufen nur wegen eines Zahlendrehers. Zusatzrätsel: 1/6 + 1/4 + 7/12 = 1, mit 1/3 als zusätzlicher Fund und einer neuen Aussichtsskizze.

Abnahme: Auswahl und Blickgeometrie müssen beide stimmen. Der reine Besitz oder Blick auf alle Funde schaltet nichts frei. Spieler außerhalb des gültigen Bereichs erhalten einen verständlichen Richtungsimpuls; Farben sind mit unterscheidbaren Formen kombiniert.

## Spielkern und GradeCrew

Ein PuzzleDefinition-Datensatz enthält ID, Lernziel, geprüften Inhalt, Geometrie, Regeltyp, Hilfen und Ereignis bei Erfolg. Eine getrennte RuleValidator-Schicht prüft Bruchsummen, Pfade/Regionen, Satzvarianten und Perspektivbedingungen. Der WorldState speichert bereits bestätigte Signale und setzt die Welt daraus reproduzierbar zusammen. Eingabe, Darstellung und fachliche Regeln bleiben getrennt.

Spielzustände: Erkunden, Tafel fokussieren, Eingabe, Rückmeldung, Hilfe und Pause. Im Tafelfokus steht die Figur sicher; Kamerabewegung zeichnet nicht versehentlich mit. Escape oder ein großer Zurückknopf verlassen die Tafel. Unterbrochene Linien und Satzanordnungen bleiben erhalten. Browser-Wiederverbindung führt in denselben Sitzungsstand, ohne eine fremde Sitzung zu übernehmen.

Desktop: WASD, Mausblick, Interaktionstaste, Klick zum Tafelfokus und Zeichnen. iPad: linker Bewegungsbereich, rechter Blickbereich, großer Interaktionsknopf; im Tafelfokus ein Finger zum Zeichnen und Tippbedienung für Satzteile. Keine Sprintpflicht. Empfindlichkeit einstellbar, Kopfbewegung und Bewegungsunschärfe standardmäßig aus. Farbe wird durch Form ergänzt.

Für eine lokale Demo sind ausdrücklich markierte Beispieldaten ausreichend. Produktive GradeCrew-Aufgaben und Lösungen bleiben gemäß Projektvertrag serverseitig kontrolliert. Lehrkräfte prüfen Inhalte, Hilfen und zulässige Varianten vor dem Spielstart. Eigene Spielmechanik braucht einen Adapter und kein zweites ungeprüftes KI-Fragensystem. Ein bestätigtes Lernereignis darf idempotent genau einmal das zugehörige Weltobjekt freischalten.

## Wie Qualität überprüft werden soll

Die Zielqualität entsteht über einen kleinen, tatsächlich spielbaren Ausschnitt: Ankunft, erste Tafel, sichtbare Weltveränderung und eine kurze Rückkehr zum Aussichtspunkt. Erst wenn Maßstab, Blickführung und Eingabe stimmen, werden die vier Mechaniken ausgebaut.

Technische Abnahme: gültige und ungültige Lösungen, mehrere zulässige Pfade, exakte Bruchrechnung, Satzvarianten, Hilfen, Abbruch mitten im Rätsel, Save/Resume und einmalige Freischaltung. Danach vollständiger Desktopdurchlauf sowie Browserstream auf echtem iPad. Eine verkleinerte Desktopansicht ersetzt den Touch-/Netztest nicht.

Vorgeschlagene Leistungsziele: 60 fps lokal am Desktop, mindestens stabile 30 fps auf dem später benannten Ziel-iPad. Streaming erhält ein separat gemessenes Latenzziel. Noch keine Gerätedaten, Messwerte oder garantierten Kapazitäten.

Spielerische Abnahme: Kinder Klasse 5–6 und Erwachsene müssen Erstspielroute, Regelverständnis, Frustration und Lust auf ein weiteres Rätsel beurteilen. Kein Spaßfaktor ist bereits gemessen. Jede Hauptaufgabe soll eine neue Erkenntnis tragen; Zusatzrätsel erhöhen die gedankliche Tiefe, ohne die Hauptroute zu sperren.

Sechs Nutzerbilder wurden inzwischen geprüft; ihre Merkmale sind im Spielbuch ausgewertet. Fünf generierte Bildtafeln mit 20 Motiven ergänzen die Art Direction. Die genaue iPad-Generation und der zulässige Streaming-Betrieb sind weiterhin offen. Ein Gameplayvideo von PlayStation Access wurde als zusätzliche Beobachtungsquelle gefunden, nicht vollständig im Browser abgespielt: https://www.youtube.com/watch?v=gF9wRLzP1rw
