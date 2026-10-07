# Bauvertrag und Qualitätsprüfung

## 37 · Warum die alte Fassung nicht als Fundament genügt

Die erste native Expedition bündelte Weltlogik, Fragen, Speichern und Eingabe in wenigen großen C++-Dateien. Eine selbst gezeichnete Canvas-Oberfläche erschwerte zuverlässige Pointereingabe. Der letzte sichtbare Stand wurde über Tastatur getestet; echte Mausbedienung war weiterhin ungeklärt. Automatisierte Routeprüfungen riefen interne Funktionen auf und versetzten den Actor zwischen Stationen. Das war ein brauchbarer Regeltest, aber kein tatsächlicher Erstspielnachweis. Diese Grenze darf in der neuen Fassung nicht erneut als fertige Steuerung ausgegeben werden.

Die alte Kunst bestand aus zusammengesetzten Engine-Grundformen. Dadurch entstand eine technische Szene, deren Größen, Schatten und UI nicht zu den Referenzen passten. Die Welt hatte keinen genügend klaren Blickfluss. Die Karte verwendete zunächst schwer erkennbare Drehorientierungen; spätere asymmetrische Marker halfen der Logik, machten das Rätsel aber nicht automatisch interessant. Die neue Fassung ersetzt diese Mechanik durch konkrete Form-, Material- und Beziehungshinweise.

Nützliche Teile dürfen übernommen werden: exakte Mengenregeln, idempotente bestätigte Ereignisse, belastbare Save-Invarianten und getrennte Automationsslots. Ihre tatsächliche Eignung wird beim Übertragen geprüft. Eine alte Testzahl darf nicht auf die neue zwölfteilige Episode übertragen werden. Eine neue Oberfläche ist erst dann zuverlässig, wenn normale Pointereingabe das gewünschte Ergebnis erreicht.

## 38 · Komponenten mit klarer Verantwortung

Der neue Spielkern trennt WorldState, LessonSession, PuzzleDefinition, InteractionTarget, Inventory und SaveProjection. WorldState beschreibt bestätigte Türen, Steg, Lampe und Objekte. LessonSession beschreibt eine konkrete Frage samt Antwortversuch und Hilfephase. PuzzleDefinition benennt Regel, Voraussetzungen, Hinweise und Weltwirkung. InteractionTarget beschreibt erreichbare Handlung und sichtbare Rückmeldung. Inventory beschreibt Besitz und Einsatz. SaveProjection erzeugt nur gültige wiederherstellbare Zustände.

Unreal-Actors stellen diese Zustände dar. Ein Toractor spielt eine Bewegung, setzt aber keine fachlichen Antworten. Ein NPCactor öffnet eine Gesprächsdefinition, erzeugt aber keine neue Fragequelle. Ein Messbeckenactor zeigt einen Mengenwert, entscheidet aber nicht über Serverbewertung. Die Oberfläche übersetzt Eingaben in benannte Aktionen und stellt Ergebnisse dar. Sie schreibt nicht direkt beliebige Inventarbits.

Die Regeln erhalten konkrete Ergebnisse: bestätigt, unverändert bereits bestätigt, fehlender Gegenstand, falscher Versuch, unzulässige Aktion und Prüfung ausstehend. Diese Ergebnisse werden in verständlichen deutschen Text übersetzt. Ein falscher Einsatz und ein technischer Verbindungsfehler dürfen nicht denselben Satz „Falsch“ erhalten. Der Spieler muss wissen, ob er seine Lösung ändern oder nur eine Prüfung wiederholen sollte.

## 39 · Eingabevertrag statt weiterer Canvas-Sonderwege

Die Bedienoberfläche verwendet Unreal-eigene Widgets und deren Fokus-, Pointer- und Lebenszyklusfunktionen. Der bestehende Canvas-Hitboxpfad wird für Pflichtantworten nicht weiter als einzige Grundlage vorausgesetzt. Ein Dialog erhält eine eindeutige Eingabesperre für Weltbewegung. Beim Wechsel zurück in die Welt werden gehaltene alte Bewegungszustände neutralisiert. Eine zentrale Eingaberoute verhindert, dass dieselbe Taste erst die Frage bestätigt und danach sofort den nächsten Dialog schließt.

Ein Pointerdruck beginnt entweder im Weltbereich, einem Widget oder dem Touchstick. Die Zuordnung bleibt bis zum Loslassen erhalten. Ein Finger darf nicht aus einem Antwortknopf herausrutschen und dadurch eine Weltbewegung beginnen. Ein Klick auf eine sichtbare Antwort erreicht deren Widgetfläche, unabhängig vom Verhältnis zwischen Fensterpixeln und logischen UI-Koordinaten. DPI-Skalierung, Seitenverhältnis und Safe Area gehören zur Definition, nicht zu einer nachträglichen Multiplikation zufälliger Canvasmaße.

Der Interaktionsfokus kennt genau ein aktives Ziel. Bei zwei nahen Zielen zählen Bildrichtung, Entfernung und Erreichbarkeit. Der angezeigte Name entspricht dem Ziel, das E oder der Touchknopf aktivieren wird. Ein Klick auf ein anderes erreichbares Ziel darf den Fokus gezielt wechseln. Ein zufälliger globaler Targetindex ist keine sichtbare Spielregel.

## 40 · Voraussetzungen und Folgen als überprüfbarer Graph

| Station | Voraussetzung | Bestätigte Folge | Was ausdrücklich nicht genügt |
| --- | --- | --- | --- |
| S1 | Gespräch mit Mara | Messschale erhalten | Mara nur ansehen |
| R1 | Muschel gefunden, Kiste erreicht | Seilfach offen, Seil erreichbar | Beliebigen Gegenstand besitzen |
| S2 | S1, Messschale | Gartenpforte offen | Dialog einmal öffnen |
| S3 | S2 | Blattscheibe erhalten | Alle Samen anklicken |
| R2 | S3 | Jonas Tasche und Notiz bestätigt | Nur irgendeinen Abzweig besuchen |
| S4 | R2 | Strandpforte offen | Prozentzahl als Dekoration sehen |
| R3 | S4, Seilrolle | Steg dauerhaft sicher | Seil lediglich besitzen |
| S5 | R3 | Wellenscheibe, Mosaikrampe | Becken nur betreten |
| R4 | S5 | Sonnenscheibe | Ein Fragment in beliebiger Lage legen |
| S6 | R4 | Vier Vorbereitungslampen | Schon vorhandene Beleuchtung zählen |
| S7 | S6 | Linse bereit | Größere Grafik auswählen |
| R5 | S7, drei Scheiben | Tor offen, Abschlussaktion möglich | Drei Scheiben nur besitzen |

R1 ist absichtlich ein nachholbarer Seitenzweig im Dorf. Wer nach S2 zunächst weitergeht, kann das Seil später holen. Der Graph erlaubt Rückkehr und nennt fehlende Objekte. Er enthält keine zyklische Voraussetzung, die einen noch verschlossenen Raum braucht. Die zwölf Hauptstationen haben einen regulären vollständigen Lösungsweg. Ein Save-State mit abgeschlossenem R3 und fehlendem Seilnachweis ist ungültig, sofern keine explizite verwendete Gegenstandshistorie vorhanden ist.

## 41 · Exakte Regeldefinitionen für die fünf Logikstationen

R1 prüft den Gegenstandstyp Muschel und den Zieltyp Spiralvertiefung, nicht eine ungefähre Entfernung zu einer Kiste. Die Formähnlichkeit ist ein Hinweis. Der Regelzustand bestätigt Einsetzen und das danach geöffnete Fach. Ein doppelt ausgeführtes Einsetzen gibt dasselbe Ergebnis ohne zweite Gegenstandsvergabe. Der Fundpunkt und die verwendete Muschel können nicht gleichzeitig als zwei frei verfügbare Exemplare erscheinen.

R2 bewertet genau die beiden Eigenschaften Material Holz und Wasser fließend. Die drei Kandidaten sind vorab vollständig definiert: Bank (Holz, still), Felsbogen (Stein, fließend), Brücke (Holz, fließend). Nur der dritte Kandidat ist gültig. Die Darstellung muss die Eigenschaft selbst zeigen. Eine durch Text richtige, aber visuell still dargestellte Brücke verletzt den Bauvertrag.

R3 bewertet ein ungeordnetes Paar aus zwei verschiedenen stabilen Punkten. Steinring und Metallring sind gültig, morscher Pfosten ist ungültig. Erst die separate Spannaktion bestätigt den reparierten Steg. Beide Punktreihenfolgen sind gleichwertig. Eine Vorwahl kann frei zurückgenommen werden. Die Kollision des Stegs folgt dem bestätigten Zustand, nicht dem vorläufigen Auswahlpaar.

R4 benutzt ein geometrisch definiertes Fragment und eine exakt passende Orientierung. Das Zielpolygon und die Bildanschlüsse werden als authored Daten festgelegt. Die Bildtafel allein liefert keine belastbare Geometrie. Ein Prüfdatensatz mit drei Kandidaten und vier Orientierungen muss genau eine gültige Kombination enthalten. Eine Kandidatenkontur mit Rotationssymmetrie darf nur verwendet werden, wenn die Linienrichtung die Orientierung wirklich eindeutig macht. Die fertige Vorschau muss diese Unterscheidung sichtbar lassen.

R5 benutzt drei unterschiedliche Symbol-IDs und die Beziehungen Blatt vor Welle sowie Sonne unmittelbar nach Welle. Die Prüfung erfolgt nach bewusstem Bestätigen und akzeptiert genau die Reihenfolge Blatt/Welle/Sonne. Eine im Inventar gewählte Reihenfolge wird nicht heimlich beim Öffnen übernommen. Die drei Sockel zeigen ihre aktuelle Belegung. Änderungen vor Bestätigung sind reversible Vorschau.

## 42 · Fragenpaket, Revision und Servergrenze

Ein Spielpaket beschreibt Episoden-ID, Revision, Thema, sieben Pflichtfragen, lokalisierte Texte, Hilfen, zulässige Antwortformen und Stationzuordnung. Der Client benötigt für die jeweilige Darstellung den freigegebenen Inhalt. Produktive Lösungsschlüssel und Bewertung bleiben in der gesicherten Plattform. Lokale Beispielantworten sind nur für den gekennzeichneten Demomodus vorhanden.

Eine Übungssitzung verbindet Nutzerberechtigung, Paketrevision und Fortschritt. Eine Antwort besitzt Sitzung, Station, Frageversion und einen Idempotenzschlüssel. Ein Erfolg gibt einen nachvollziehbaren bestätigten Stationabschluss zurück. Eine Wiederholung mit demselben Schlüssel erzeugt keinen zweiten Abschluss. Eine Antwort auf eine ältere Frageversion wird nicht auf die neue Frage angewandt.

Der bisherige Secure-Assessment-Lifecycle schließt einen ganzen Versuch ab. Er darf nicht siebenmal als Antwortadapter verwendet werden. Die neue Spielübung benötigt einen eigenen begrenzten Lifecycle, der vorhandene fachliche Bewertungsfunktionen nutzt. Die Planung dieser Livebrücke ist Teil des Gesamtprojekts, aber hier noch keine Implementierung. Es wird kein tatsächlich funktionierender Cloudsync aus einer Datenstruktur abgeleitet.

Wenn die Verbindung während einer Antwort abbricht, bleibt die letzte Eingabe sichtbar. Die Weltfreischaltung wartet auf einen bestätigten Abschluss. Nach Wiederverbindung fragt der Client den Sitzungsstand ab oder wiederholt mit demselben Schlüssel. Eine ungültige Tokenlage führt zu klarer erneuter Anmeldung, ohne die eingetippte Antwort zu löschen. Ein frei wählbarer Clientparameter darf keine beliebige fremde Lehrkraftlösung lesen.

## 43 · Speicherinvarianten

Ein gespeicherter Zustand ist nur gültig, wenn alle Referenzen zur Paketrevision passen. Ein veralteter Spielstand benötigt eine explizite Migration oder einen verständlichen Neustart, kein stilles Umdeuten. Bereits bestätigte Stationen werden als stabile IDs gespeichert. Reine Arraypositionen dürfen nicht die Bedeutung wechseln, wenn ein neues Paket Fragen anders sortiert.

Ein verwendeter Gegenstand bleibt mit seinem Weltziel verknüpft. Alle Pflichtobjekte haben genau einen sinnvollen Zustand: noch am Fundort, im Inventar oder am bestätigten Einsatzort. Die Seilrolle kann in der Tasche als verwendet dargestellt werden; ihr physischer Einsatz ist trotzdem nachvollziehbar. Eine Scheibe kann nicht gleichzeitig in zwei Ruinensockeln stecken. Offene Pforten passen zum bestätigten Stationgraphen.

Die letzte Position wird in einem begehbaren Gebiet geprüft. Außerhalb liegende oder hinter einer geschlossenen Barriere gespeicherte Positionen werden auf einen sicheren Anker des letzten zulässigen Bereichs korrigiert oder der Spielstand wird als ungültig gemeldet. Eine Korrektur darf keinen Fortschritt schenken. Der Spieler erhält keine unsichtbare Teleportation in den Finalbereich.

Zeitmessung trennt Schulaufgabe, Logikrätsel, allgemeine Handlung und Pause. Inaktive Fenster- oder lange Pausenzeiten zählen nicht zur aktiven Spieldauer. Hilfezeiten zählen fachlich zur jeweiligen Schulstation, sofern der Hinweis tatsächlich sichtbar ist. Wiederholtes Öffnen eines abgeschlossenen Dialogs wird als allgemeine Rückschau erfasst, nicht als neue erfolgreich gelöste Frage.

## 44 · Assetproduktion mit Auswahl statt Bildmengeninflation

Die 240 kleinen Studien und vier großen Zielansichten haben einen Katalog. Der Katalog sagt, wofür jedes Motiv verwendet werden soll. Nicht jedes Bild wird zum fertigen Modell. Die ersten Auswahlen sind eine Spielfigur, vier Haupt-NPCs, fünf Baumfamilien, drei Felsfamilien, vier Bodenmaterialien, zwei Hausmodule, Brunnen, Pforte, Steg, Ruinensockel und sechs Inventarobjekte. Variationen entstehen aus eigenen Material- und Formparametern, nicht aus zufällig wechselnden Stilrichtungen.

Ein Figurenmodellblatt definiert Vorder-, Seiten- und Rückansicht derselben Person. Ein Bildgenerator kann kleine Unterschiede erfinden. Diese Unterschiede müssen vor dem Modellbau vereinheitlicht werden. Kleidungsfarbe, Kopfform, Taschengröße und Hände werden an einer ausgewählten Figur festgelegt. Die zwanzig Posen sind Hinweise für Animationen; zwanzig stehende Renderbilder sind kein Gangzyklus.

Baumassets werden aus der Spielkamera beurteilt. Ein hochauflösender Nahbaum ist unbrauchbar, wenn seine Krone bei Abstand nur als undifferenzierte Kugel erscheint. Ein Baum, der das Pflichtobjekt verdeckt, benötigt andere Platzierung oder eine definierte Sichtbarkeitshilfe. Blätteranimation bleibt klein und darf die Umrissform nicht zerreißen. Ein heller Weg durch dunkle Kronen ist wichtiger als Tausende einzeln simulierte Blätter.

Das Weltlayout besitzt zusammenhängenden Boden und eine gestaltete Randzone. Der Rand reicht über die Kamerasicht hinaus. Keine notwendige Kameraposition zeigt das Ende einer Platte. Eine spätere Mobileoptimierung darf Details reduzieren, aber nicht den schwarzen Leeraum der Testfassung wieder sichtbar machen. Materialien und Beleuchtung werden am tatsächlichen Zielgerät separat abgenommen.

## 45 · Bildabweichungen erkennen und dokumentieren

Generierte Entwürfe dürfen ästhetisch nützlich und gleichzeitig sachlich falsch sein. Ein Bild kann zwei Laternennischen statt drei, einen bereits gefüllten Brunnen statt der Ausgangsmenge, sechs Samenkästen statt vier oder einen kompletten Steg statt eines beschädigten zeigen. Ein neutraler UI-Platzhalter ist kein fertiger Antwortknopf. Eine Meerlinie am oberen Rand eines Ruinenbildes kann einen zu flachen Kamerawinkel anzeigen.

Deshalb gibt es zu jeder Bildtafel einen Abnahmehinweis. Nummern beziehen sich auf die Tafel und deren zwanzig Motive. Das Drehbuch ist die Regelquelle. Im Zweifel wird das Modell oder die Anordnung an das Drehbuch angepasst. Ein zusätzlicher hübscher Gegenstand im Bild wird nicht unbemerkt zur Pflichtaufgabe. Ein Kontaktsheet mit kleinen UI-Skizzen ist keine Schriftgrößenabnahme.

Ein neuer Gameplay-Screenshot wird zusammen mit dem ausgewählten Referenzmotiv angesehen. Geprüft werden Figurgröße, Blickneigung, Wegbreite, Randgestaltung, Schatten, Materialmassen und sichtbare UI-Fläche. Erst danach kommen feinere Blatt- und Schaumdetails. Ein hoher Bildgenerator-Detailgrad darf keinen falschen Produktionsfortschritt suggerieren.

## 46 · Verhaltenstests, die wirklich etwas belegen

| Prüffeld | Konkretes Verhalten | Belegart |
| --- | --- | --- |
| Fachregeln | Alle sieben Antworten und äquivalente Brüche korrekt | Exakte Datenprüfung plus Runtime-Test |
| R2 | Nur Holz über fließendem Wasser richtig | Drei vollständige Kandidaten prüfen |
| R3 | Beide gültigen Punktreihenfolgen funktionieren | Aktionsfolgen und tatsächliche Weltkollision |
| R4 | Genau ein Fragment mit einer Orientierung passt | Authored Geometrieprüfung plus sichtbare Vorschau |
| R5 | Alle sechs Scheibenfolgen, genau eine richtig | Permutationsprüfung plus Widgets |
| Eingabe | Maus und E öffnen denselben NPC | Echte lokale Eingabe |
| Antwort | Sichtbarer Klick wählt und bestätigt korrekt | Echte lokale Eingabe, kein interner Aufruf |
| Touch | Tasche und Stick reagieren getrennt | Physisches benanntes Gerät |
| Abbruch | Dialog nach Fehler schließen und fortsetzen | Sichtbarer Verlauf plus Zustandsprüfung |
| Save | Mittendrin laden, richtige Tür- und Itemlage | Separater Testslot, kein Nutzersave überschreiben |
| Netz | Doppelte und verspätete Bestätigung korrekt | Live-Übungslifecycle-Test |
| Orientierung | Neue Person findet nächstes Ziel selbst | Beobachteter Erstspieltest |
| Zeit | Etwa 8–12 aktive Minuten | Zeitsegmente aus realem Durchlauf |
| Anteil | 7/12 Stationen und Zeit separat berichten | Definierte Zählregel und aktive Segmentzeiten |
| Optik | Kein Leeraum, lesbare Wege, konsistente Figuren | Normaler Gameplay-Screenshot |

Regeltests und native Oberfläche werden als getrennte Belege protokolliert. Ein grüner C++-Test ist ein Regelbeleg. Ein interner Funktionsaufruf ist keine Mausabnahme. Ein erfolgreicher Build ist kein tatsächlich gestartetes Spiel. Ein gestartetes Spiel ist kein vollständig getesteter Durchlauf. Ein Nutzer, der es ausprobiert und ablehnt, hat ein negatives Abnahmeergebnis geliefert, nicht eine Fertigfreigabe.

## 47 · Konkrete negative Testabläufe

Eingabe während Dialog: Die Figur läuft nach Norden, der Spieler öffnet einen NPC und lässt die Taste erst im Dialog los. Nach Schließen steht sie still. Eine neue Nord-Eingabe bewegt sie korrekt. Dasselbe gilt für einen gehaltenen Touchstick. Ein Antwortknopf startet keine Bewegung, wenn der Finger beim Loslassen außerhalb des Knopfes liegt.

Mehrfachbestätigung: Der Spieler klickt zweimal auf „Prüfen“. Es gibt einen eingereichten Versuch. Die zweite Auslösung ist ohne Nebenwirkung. Eine Antwortbestätigung, die nach Schließen eintrifft, wird dem ursprünglichen Versuch zugeordnet. Sie öffnet nicht unerwartet ein neues Dialogfenster und verbraucht keinen Gegenstand.

Fehlender Gegenstand: Der Spieler erreicht Tilda ohne Seil. Sie nennt die Werkstattkiste. Der Rückweg ist begehbar. Die Kiste lässt sich noch öffnen und das Seil aufheben. Eine Tasche mit sechs belegten Plätzen entsteht in dieser Episode nicht; zukünftige optionale Funde dürfen Pflichtobjekte nicht verdrängen.

Abbruch eines Logikrätsels: Ein Seilende ist gewählt, dann wird die Tasche geöffnet. Nach Rückkehr ist die Vorschau verständlich oder gezielt aufgehoben, der Besitz bleibt gültig. Ein halb eingesetztes Mosaikfragment ist nie gleichzeitig verwendet und frei. Bei Ruinenscheiben bleiben die belegten Plätze sichtbar, und eine einzelne Scheibe lässt sich zurücknehmen.

Laden: Ein Save vor der Stegfreigabe darf die Figur nicht auf der Ruinentreppe platzieren. Ein Save nach Finale darf das Tor nicht wieder schließen. Eine alte Revision wird als solche benannt. Der Test benutzt einen eigenen Slot. Weder Smoke-Test noch FullRoute-Test überschreiben Martins laufenden Durchlauf.

## 48 · Produktprüfung ohne erfundene Qualitätszahl

Der Nutzer hat die bisherige Fassung als sehr schlecht beurteilt. Für ihre Nähe zum jetzt verlangten Abschluss ist eine Einschätzung von **2/10** nachvollziehbar: Native Grundstruktur und kleine Regeltests existieren, aber Optik, Bedienung und Rätselabnahme sind gescheitert oder offen. Das ist eine Bewertung dieser Expedition, nicht der gesamten GradeCrew-Plattform.

Für den neuen Entwurf wird hier kein bereits erreichter Spielspaßwert erfunden. Die Dokumentation verbessert Nachvollziehbarkeit und Auswahl, beweist aber noch keinen funktionierenden Build. Die wichtigste nächste Prüfung ist ein tatsächlich bedienbarer Dorf-Ausschnitt in Zieloptik. Danach erst kann eine neue Produktbewertung mit sichtbaren und spielbaren Belegen steigen.

Abnahmefragen lauten: Kann eine neue Person ohne Erklärung beginnen? Erkennt sie, wo sie hinmuss? Kann sie einen Fehler reparieren? Versteht sie die Weltwirkung? Möchte sie die nächste Station sehen? Ist die Menge richtig dargestellt? Passt die Steuerung zur Bildrichtung? Jede Frage erhält eine Beobachtung oder einen Fehlerfall, keine pauschale Werbeaussage.

## 49 · Erweiterung nach der kurzen Episode

Spätere Episoden können Dorf, Wald, Strand und Ruine neu kombinieren. Neue Lernziele erhalten passende Requisiten und geprüfte Aufgabenpakete. Ein optionaler schwerer Bruchvergleich kann Erwachsene fordern, darf aber die kurze Hauptroute nicht blockieren. Ein weiterer Raum kann dieselbe Eingabe nutzen und eine neue Erkenntnis tragen. Ein anderer Baum allein ist kein neues Level.

Mögliche Themen sind Bruchäquivalenz im Wasseratelier, Prozentrest am Marktplatz, Wortarten in kurzen Bewohnernotizen und Satzfolge auf einer Reparaturbrücke. Für jede Variante werden die Annahmen des Ausgangspakets erneut geprüft. Zahlreiche Bilder dürfen nicht als bereits gebaute Kampagne bezeichnet werden. Das Masterprojekt soll Werkzeuge und Qualitätsmaßstäbe hinterlassen, die echte Wiederverwendung ermöglichen.

Multiplayer, Kampf, zufällige Gegner und Sammelmonster gehören nicht zur beschriebenen Episode. Die ursprüngliche Formulierung „1vs1 nachbauen“ wird hier als Nähe zur Vorlage gelesen; ein neuer PvP-Modus wurde in den konkreten Lernspielwünschen nicht ausgearbeitet. Die Steuerung und Atmosphäre sind der Bezugsrahmen, die Spielhandlung bleibt ein eigenes Lern-Escape-Abenteuer.

## 50 · Übergabe an den nächsten Bauschritt

Die neue Baugrundlage besteht aus diesem Spielbuch, dem vollständigen Drehbuch, den zwölf Bildkatalogen, der Referenzauswertung und dem exakten Fragenbeispieldatensatz. Als erstes wird die Dorfansicht mit Mara und S1 als repräsentativer Ausschnitt umgesetzt. Dafür werden noch keine drei weiteren Levelkopien erstellt. Ein ungeklärter Pointerbug wird reproduziert und an der zentralen Eingaberoute behoben, bevor er in weitere Räume übernommen wird.

Die bisherigen Quellcommits, PR171 und die Versuchshistorie bleiben erhalten. PR173 und das Witness-Spielbuch sind methodische Referenzen eines anderen Gestaltungsabschnitts. Sie werden nicht überschrieben. Production, Staging und bestehende Web-Releases werden durch diesen Entwurfsauftrag nicht verändert. Das Integrationsziel der Expedition bleibt main nach späterer nachvollziehbarer Review- und Teststufe.

Die Bilder und Dokumente werden lokal gesichert und auf dem eigenen Aufgabenbranch veröffentlicht. Die Prompts bleiben nachvollziehbar. Es werden keine Geldbeträge für die eingebaute Bildgenerierung erfunden, weil das Werkzeug diese nicht liefert. Der Bericht nennt tatsächliche Anzahl und Ergebnis der Generierungen. Weitere Schritte hängen vom ausgewählten visuellen Entwurf und dem überprüften Dorf-Ausschnitt ab.
