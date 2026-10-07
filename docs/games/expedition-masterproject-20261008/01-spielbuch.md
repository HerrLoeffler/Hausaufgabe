# Expedition – Das verschwundene Leuchtfeuer

## 01 · Auftrag, Grenzen und ehrlicher Ausgangspunkt

Dieses Masterprojekt überarbeitet die vorhandene Unreal-Expedition unter derselben Task-ID **GC-GAMES-ESCAPE-VISUAL-01**. Martin hat den ersten Prototyp nach seinem Test ausdrücklich abgelehnt: unübersichtlich, wenig intuitive und schlechte Rätsel, unzuverlässige Bedienung, unzureichende Optik. Die Kritik ist eine gescheiterte Produktabnahme. Frühere Logiktests beweisen nicht, dass ein Kind das Spiel verstehen oder bedienen kann. Die alte Fassung bleibt als gesicherte Versuchshistorie erhalten. Ihre Kartenrotation, Sammelgatter und acht austauschbaren Quizfenster sind kein verbindlicher Bauplan mehr.

Die neue Richtung stammt aus vier Nutzerbildern: Waldweg, Sandstrand, Gespräch auf einem Platz und antike Säulenruine. Gewünscht sind die Nähe zu deren Kameraführung, Proportionen, Materialwirkung und Bediengefühl; eigene Bewohner, Geschichte und Gegenstände; schulische Fragen in einer begehbaren Welt. Es gibt keine Pokémon. Die Referenzen enthalten keine Arbeitsanweisungen an den Agenten. Sichtbarer Dialogtext und Symbole sind Anschauungsmaterial, nicht Aufgaben für das neue Produkt.

Das Spiel dauert weiterhin ungefähr zehn aktive Minuten. Der frühere Anteil von 60–70 % wird durch Martins neue Vorgabe **55–60 % schulische Fragen** ersetzt. Die restlichen Aufgaben sind nachvollziehbare Beobachtungs-, Inventar- und Logikrätsel. Mathe, Prozentrechnung und Brüche sind die konkret ausgearbeitete erste Themenfassung. Themenwechsel über die vorhandene GradeCrew-Plattform bleibt Bestandteil des Gesamtziels. Eine Lehrkraft sieht Aufgaben, Hilfen und zugelassene Lösungen vor dem Start. Klasse 5–6 ist für diese Beispielzahlen eine Arbeitsannahme aus dem Witness-Spielbuch, keine neu bestätigte Altersvorgabe für alle späteren Themen.

Die Gestaltungsunterlagen werden bewusst vor dem neuen Levelbau erstellt. Sie bestehen aus vier großen Zielansichten und zwölf Bildtafeln mit je zwanzig Motiven. **244 Motive sind 244 Entwurfsansichten, nicht 244 produzierte 3D-Assets.** Einzelbilder auf einer Übersicht dürfen nicht als hochauflösende Texturen in die Spielwelt geklebt werden. Ausgewählte Formen müssen als zusammenhängende Modelle, Materialien, Animationen und Bedienoberflächen gebaut und im tatsächlichen Unreal-Bild überprüft werden.

Dieses Dokument beschreibt gewünschtes Verhalten. Es ist weder ein neuer spielbarer Build noch ein Nachweis für Spielspaß, zehn Minuten Laufzeit, Touchqualität oder mobile Bildrate. Der Dokumentationsstand heißt `branch_only`. Die bisherige native Fassung wurde vom Nutzer getestet und abgelehnt; daraus wird keine positive `user_tested`-Freigabe abgeleitet.

## 02 · Die neue Spielerfahrung in einem Absatz

Du kommst in einem freundlichen kleinen Küstenort an. Das alte Leuchtfeuer ist erloschen, und ein beschädigter Steg versperrt den direkten Weg zur Ruine. Mara braucht Hilfe beim Verteilen von Vorräten. Nach deiner Antwort erhältst du eine Messschale. Du findest eine auffällige Muschel, öffnest damit eine Werkstattkiste und entdeckst ein Seil. Im Garten löst du Mengenaufgaben und beobachtest einen Hinweis am Bach. Am Strand reparierst du den Steg durch die Wahl stabiler Befestigungen. In der Ruine setzt du drei gesammelte Symbolscheiben in einer begründeten Reihenfolge ein. Jede bestätigte Aufgabe verändert ein sichtbares Objekt. Am Ende öffnet sich das Tor, das Feuer leuchtet wieder, und du kannst über die Orte zurückschauen, die du selbst zugänglich gemacht hast.

Die Geschichte rechtfertigt, weshalb eine Figur fragt und warum eine Lösung etwas verändert. Ein NPC verlangt keinen zufälligen Test, bevor er eine normale Tür benutzt. Die Mengen stammen aus Vorräten, Saat, Wasser oder Bauteilen. Die Logik stammt aus sichtbaren Formen, Materialien und Beobachtungen. Ein geschlossenes Tor braucht einen sichtbaren Grund. Eine Frage braucht einen verständlichen Gegenstand. Ein Fehler braucht eine hilfreiche Rückmeldung an der Stelle, an der er entstanden ist.

## 03 · Was wir aus den Vorlagen übernehmen

**Waldvorlage.** Die Wege bilden große ruhige Flächen zwischen Vegetationsmassen. Kleine Figuren sind sofort vom Boden zu unterscheiden. Felsen stützen die Raumkante; Bäume besitzen eine deutliche Kronensilhouette und dunklere innere Bereiche. Der Blick von oben zeigt, wo man gehen kann. Daraus folgt: Blätter, Blumen und Steine dürfen den Hauptpfad nicht in einen Wimmelbildteppich verwandeln. Ein Gegenstand am Hauptweg ist ein bewusst gesetztes Ziel, kein kaum sichtbarer Pixel.

**Strandvorlage.** Sand ist eine helle zusammenhängende Fläche; Meer und Schaum bilden eine erkennbare Grenze. Große Felsen rahmen den Abschnitt. Figuren stehen mit Abstand und werfen kleine weiche Schatten. Daraus folgt: Der Strand bekommt einen klaren Übergang Wald → Sand → Steg → Treppe. Kein konkurrierendes Riesenfenster verdeckt den Steg. Die Wasserfläche bleibt ruhig genug, um eine Messmarkierung lesen zu können.

**Gesprächsvorlage.** Die Figur bleibt in ihrer Welt. Der Dialog sitzt unten, mit erkennbarem Sprecher und wenigen Textzeilen. Die Umgebung erklärt, warum man dort spricht. Daraus folgt: Gespräch, Frage und Antwort teilen eine ruhige Fläche. Antworten öffnen keine zweite Schicht darüber. Ein einziger Zurückknopf beendet den Fokus. Das Gespräch ist durch Maus, Tastatur und Touch gleichwertig bedienbar.

**Ruinenvorlage.** Eine breite Mittelachse und eine klare Treppe führen zu einem bedeutenden Ort. Säulen, Sockel und Felsplateau haben Masse und nachvollziehbare Höhen. Daraus folgt: Die Ruine bekommt einen übersichtlichen Vorplatz. Drei Steckplätze stehen neben der sichtbaren Tür. Die Kamera springt beim Betreten nicht in eine andere Perspektive. Der Spieler erkennt bereits vor dem Rätsel, wohin der spätere Durchgang führt.

Die offizielle Spielseite und der Nintendo-Überblickstrailer wurden als zusätzliche Recherchequellen gefunden. Die vier angehängten Bilder sind die unmittelbar geprüfte visuelle Grundlage. Aus einer gefundenen YouTube-Seite wird kein vollständig abgespieltes und vermessenes Video behauptet. Kamera-, Geschwindigkeits- und Größenwerte im Buch sind Produktionshypothesen, die im eigenen Build überprüft werden müssen.

Quellen: [Offizielle Pokémon-Spielseite](https://diamondpearl.pokemon.com/en-us/) · [Nintendo-Überblickstrailer](https://www.youtube.com/watch?v=TUOlZBxdrTA). Eigene Ableitungen werden hier als Gestaltungsentscheidungen beschrieben; fremde Karten, Modelle und Texturen werden nicht als eigene Assets übernommen.

## 04 · Was wir aus dem Witness-Spielbuch übernehmen

Das Witness-Spielbuch in `analysis/GC-GAMES-ESCAPE-VISUAL-01/lerninsel-spielbuch-20261007.md` beschreibt Regeln über sichtbare Weltobjekte, reversible Versuche, kurze Einführungen und klar erkennbare Wirkungen. Es trennt Bilder von tatsächlicher Rätselgeometrie und verlangt exakte Prüfung mathematischer Varianten. Diese Methode passt auch zur Expedition.

Die dortige Ego-Perspektive und acht große Inselgebiete werden nicht übertragen. Hier gilt eine feste Vogelperspektive und eine kurze Episode mit vier kompakten Bereichen. Die vergleichbare Tiefe liegt im Textbuch: Was sieht der Spieler? Was tut er? Was passiert bei einem falschen Versuch? Was bleibt nach Abbruch erhalten? Woher stammt der Hinweis? Welche Lösungen müssen angenommen werden? Diese Fragen werden für jede Pflichtstation beantwortet.

Das wichtigste übernommene Prinzip: Eine richtige Antwort muss eine nachvollziehbare Handlung ermöglichen. Eine Menge füllt ein Becken; ein robustes Seil spannt einen Steg; eine sinnvoll eingeordnete Scheibe öffnet eine vorhandene Tür. Keine Aufgabe besteht darin, lange genug auf eine unsichtbare Zahl zu warten. Wer die Regel verstanden hat, muss sofort handeln können.

## 05 · Drei mögliche Vorgehensweisen und die gewählte Richtung

Bewertet werden Nähe zur Vorlage, räumliche Lesbarkeit, Qualität der Rätsel und überprüfbare Umsetzung. Die Zahlen sind begründete Planungseinschätzungen, keine gemessenen Produktwerte.

| Ansatz | Eignung | Begründung |
| --- | --- | --- |
| Alte Primitive dekorieren und die acht Quizgatter behalten | 3/10 | Wenig Aufwand, aber die vom Nutzer abgelehnten räumlichen und spielerischen Grundlagen bleiben bestehen. Schöneres Gras behebt keine unverständliche Interaktion. |
| Kompakte Episode mit eigener Art Bible, zwölf begründeten Stationen und verbindlicher Bedienung | 9/10 | Vier gut erkennbare Räume, echte Figurenbegegnungen, sieben Schulaufgaben und fünf unterschiedliche Logikaufgaben. Ein kleiner Abschnitt erlaubt strenge Bild- und Bedienabnahme vor weiterer Produktion. |
| Sofort eine große Kampagne mit vielen fertigen Levels versprechen | 4/10 | Viel Material, aber derselbe Bedienfehler würde vervielfacht. Die Zehn-Minuten-Vorgabe ginge verloren; Qualitätsmängel wären schwerer zu lokalisieren. |

Gewählt wird die kompakte Episode. Der umfangreiche Bildkatalog dient der Formfindung und späteren Wiederverwendung. Er erweitert nicht heimlich die Erstspielzeit auf mehrere Stunden. Weitere Episoden können dieselben Mechaniken mit anderen freigegebenen Fragen nutzen, nachdem diese Episode tatsächlich funktioniert.

## 06 · Weltplan und Orientierung

Die vier Bereiche heißen **Küstenort**, **Garten und Waldweg**, **Strand und Steg**, **Ruinenhof**. Sie bilden eine räumlich zusammenhängende Schleife. Der Eingang liegt im Süden des Ortes. Der Garten führt östlich zum Waldpfad; dieser sinkt zum Strand ab. Der Steg überbrückt eine kleine Wasserrinne. Dahinter führt eine breite Treppe in den Ruinenhof. Nach dem Finale öffnet sich eine kurze Rückverbindung zum Dorf, damit der Abschluss die eigene Reise sichtbar macht.

Jeder Bereich zeigt beim Eintritt höchstens zwei relevante Ziele: den nächsten Gesprächspartner oder Gegenstand und den späteren Ausgang. Dekoration hat niedrigere Kontraste. Eine Bank, ein Hausfenster und ein Busch erhalten keine identische Kontur wie ein aufhebbarer Gegenstand. Die Ruinentür ist durch Form und Lage besonders, nicht durch eine riesige schwebende Aufgabenkarte.

Der Planungsmaßstab ist eine etwa 60 × 70 Meter große Episode mit vier etwa 18–24 Meter breiten Spielräumen. Das ist eine Bauannahme. Die Räume dürfen sich räumlich überlappen; dies ist kein Raster aus vier leeren Rechtecken. Wege sind meist 2,5–3 Meter breit. Interaktionsflächen benötigen mindestens 1,5 Meter freie Tiefe. Ein enger Nebenweg darf niemals der einzige Weg zum Pflichtobjekt sein. Die Kamera zeigt in der Zielansicht ungefähr 20–24 Meter Breite, sodass Figur, Hinweis und Tür gemeinsam ins Bild passen.

Höhenwechsel werden nur durch begehbare Treppen oder Rampen überwunden. Es gibt keine Sprünge und keine versteckte Klettertaste. Wasser, dichte Hecken und hohe Felsabsätze begrenzen den Weg sichtbar. Eine dekorative Bodenfuge ist kein unsichtbares Hindernis. Die Figur kann an einer Kante entlanglaufen, ohne ständig festzuhängen.

Am Waldknoten gibt es genau drei kurze Abzweige. Ein Hinweis macht einen davon richtig; alle falschen Wege enden nach wenigen Schritten mit einem sichtbaren Objekt. Es entsteht kein Gedächtnislabyrinth. Der Rückweg ist stets frei. Ein einmal geöffnetes Tor bleibt offen, auch wenn man eine Aufgabe später erneut ansieht. NPCs stehen neben dem Weg und können den Ausgang nicht dauerhaft mit ihrer Kollisionskapsel verschließen.

## 07 · Kamera, Haptik und Bewegung

Die Kamera blickt aus einer hohen, festen Vogelperspektive auf die Figur. Die geplante Neigung beträgt etwa 60 Grad zur Horizontalen nach unten. Norden bleibt oben. Eine kleine perspektivische Wirkung oder eine orthografische Projektion wird erst am echten Referenzausschnitt entschieden; maßgeblich ist die Bildwirkung. Eine schräge 45-Grad-Drehung der ganzen Karte würde hier die einfachen horizontalen und vertikalen Wege unnötig verändern.

Die Figur belegt ungefähr 6–8 % der sichtbaren Bildhöhe. Ihr Kopf ist groß genug, um Blickrichtung zu erkennen, aber nicht so groß, dass die Figur jede Tür verdeckt. Wege, NPCs und Gegenstände müssen aus normalem Abstand lesbar bleiben. Die Kamera folgt weich mit einem kleinen erlaubten Zentrumsspielraum. Ihre Verzögerung darf die Richtung nicht schwammig erscheinen lassen. Kein Kameraschwenk nach jeder Antwort. Keine Zoomfahrt vor jeder Frage. Kein Horizont in der normalen Spielansicht.

WASD, Pfeiltasten und ein virtueller Stick führen zu derselben Weltbewegung. Die Bildrichtung entspricht der Eingaberichtung: oben führt im Bild nach oben. Diagonalen sind nicht schneller. Beim Loslassen stoppt die Figur nachvollziehbar; eine extrem lange Trägheit ist für dieses Rätselspiel unpassend. Planungswert: ungefähr 2,8–3,2 Meter pro Sekunde. Dieser Wert wird mit zwei kurzen Strecken und dem tatsächlichen Erstspieltempo überprüft. Sprint ist nicht nötig.

Die Animation beginnt spätestens mit der Bewegung. Füße dürfen nicht über den Boden gleiten, während der Körper unbewegt bleibt. Die Figur dreht sich zur Laufrichtung und bei Interaktion zum Objekt. Kleine Idle-Bewegungen enden bei geöffnetem Dialog, damit sie nicht mit Antwortknöpfen konkurrieren. Aufheben ist eine kurze sichtbare Geste; der Spieler wird nicht mehrere Sekunden von der Steuerung getrennt.

Die Kamera darf weder schwarzen Weltleeraum zeigen noch durch ein Dach sehen. Häuser werden am Rand so angeordnet, dass die Route nicht hinter einer undurchsichtigen Dachfläche verschwindet. Wenn eine Krone die Figur verdeckt, wird nur der notwendige Teil der Krone sanft ausgeblendet. Diese Sichtbarkeit ist eine Baupflicht und keine Ausrede für transparente ganze Wälder.

Beim Dialogstart werden laufende Bewegungsachsen neutralisiert. Nach Schließen ist für eine neue Bewegung eine neue Eingabe nötig. Ein vor dem Dialog gedrückter Stick darf die Figur nicht plötzlich ins Wasser treiben. Mauszeiger, Fokus und Touchpointer gehören während des Dialogs ausschließlich der Oberfläche. Beim Rückweg in die Welt werden sie sauber freigegeben.

## 08 · Farben, Licht und Materialien

Die Welt kombiniert warmen hellen Stein, goldenen Sand, dunkles und frisches Blattgrün, ruhiges blaues Wasser und kleine ockerfarbene Akzente. Die Figur verwendet Petrol und Creme. Ihr ockerfarbener Hut bildet einen konstanten Orientierungspunkt. Der Hut ist kein rotes Trainercap; die Silhouette entsteht aus einer weichen Strickform und einem kleinen Rucksack.

Die Palette ist in Funktionen aufgeteilt. Heller Weg und dunklerer Wegrand zeigen die Route. Gegenstände erhalten ein kleines helles Kantensignal nur in Interaktionsnähe. Bestätigte Zustände können mit einem kurzen warmen Lichtimpuls reagieren. Fehler bleiben neutral bis bernsteinfarben. Rot wird nicht als permanentes Strafelement über die ganze Welt gelegt. Jede relevante Unterscheidung besitzt außerdem Form, Lage oder Text.

Das Licht ist ein stabiler später Vormittag. Lange wandernde Schatten würden Hinweise verdecken und kleine Teilmarkierungen verändern. Die Hauptlichtrichtung stützt die Masse der Häuser und Felsen. Schatten bleiben weich, aber sichtbar. Kontaktverschattung verankert Figur, Füße, Kisten und Pflanzen im Boden. Weder überbelichtete weiße Flächen noch eine graue Testmaterialwelt sind zulässig.

Stein ist matt und besitzt abgerundete, leicht unregelmäßige Kanten. Große Hauptflächen bleiben ruhig. Felsen bestehen aus Hauptmasse, sekundären Absätzen und wenigen kleineren Brüchen. Das Ziel ist ein geformtes Objekt mit charakteristischer Silhouette. Viele zufällige Dreiecke ersetzen diese Form nicht. Holz besitzt erkennbare Bretterstärke und einzelne Fugen; keine scharf spiegelnde Kunststoffoberfläche.

Baumkronen benötigen mehrere überlappende Blattbüschel mit dunklem Kern und helleren Außenflächen. Die zwanzig Baumstudien erkunden Silhouetten, Alter, Windrichtung und Gruppierung. Für die erste Episode werden daraus etwa fünf konsistente Familien ausgewählt. Es werden nicht zwanzig unpassende Einzelstile gleichzeitig in den Wald gesetzt. Die Blätter dürfen aus der Spielkamera zu lesbaren Massen zusammenfallen. Ein einzelner glatter grüner Ball ist keine fertige Krone.

Sand und Gras bekommen feine Variation, aber keinen großen Kontrastteppich. Blumen sitzen an Rändern und Ruhepunkten. Auf den eigentlichen Lauf- und Leseflächen bleiben Text und Mengen sichtbar. Wasser zeigt eine flache helle Zone, eine ruhigere tiefe Zone und eine zurückhaltende Schaumkante. Wellen sind dekorativ; der Messbeckenfüllstand wird durch feste Markierungen und ruhige Wasserhöhe erklärt.

## 09 · Figuren und Gegenstände

Die Spielfigur ist ein eigener kleiner Entdecker mit ockerfarbener Strickmütze, cremefarbenem Hemd, petrolfarbener Weste, brauner kurzer Hose, dunklen Stiefeln und kleiner heller Tasche. Das Kopf-Körper-Verhältnis liegt ungefähr bei 40 % Kopfhöhe. Hände und Füße sind vereinfacht, aber als Körperteile geformt. Ein Gelenkmodell und gezielte Animationsposen ersetzen die zusammengesteckten Kugeln der Testfassung.

Mara organisiert die Vorräte im Hafen. Ihre türkisfarbene Jacke, dunkle Haut und ruhige Gestik unterscheiden sie deutlich von der Spielfigur. Jona pflegt den Garten und trägt einen Strohhut und eine Schürze. Tilda repariert den Steg, mit kurzem grauem Haar und gestreiftem Pullover. Elin arbeitet im Ruinenarchiv, mit Brille und hellem Mantel. Sie werden aus den Figurenstudien ausgewählt und erhalten ein konsistentes Modellblatt. Unterschiedliche Kleidung darf nicht bei jedem Kamerawechsel eine andere Person erzeugen.

Pflichtgegenstände sind Messschale, Seilrolle, Muschel und drei Symbolscheiben. Das Inventar enthält höchstens sechs nutzbare Plätze. Lernfortschritt wird nicht als unsichtbare Gegenstandsbitmaske erklärt. Eine Figur sagt, was sie übergibt, das Objekt erscheint kurz neben ihr, und anschließend liegt es in der Tasche. Ein eingesetztes Objekt erscheint am richtigen Weltort. Die Tasche zeigt es danach als verwendet oder ausgegraut, ohne dass der Spieler den Verlauf verliert.

Der Muschelfund ist auf dem Hauptweg sichtbar. Er besitzt dieselbe Spiralform wie die Werkstattkiste. Die Beziehung wird durch Gestalt erklärt. Die Seilrolle ist größer als winzige Zierseile am Steg. Die drei Scheiben besitzen Blatt-, Wellen- und Sonnensymbole mit verschiedenen Reliefs. Ein Spieler kann sie auch ohne Farbwahrnehmung unterscheiden. Ihr Durchmesser passt sichtbar zu den Ruinensockeln.

Gegenstände werden nicht zerstört, wenn man den falschen Einsatzort wählt. Es gibt kein volles Inventar als Pflichtproblem und keinen Zufallsloot. Alle notwendigen Objekte bleiben erreichbar. Die spätere Themenvariation darf dieselben Requisiten nutzen, aber ihre Lernfrage muss eine passende Erklärung erhalten. Ein Nomenquiz darf nicht behaupten, dass Grammatik physikalisch einen Wasserstand bestimmt.

## 10 · Oberfläche und Interaktion

Beim Erkunden sieht man die Welt und einen Taschenknopf. Ein kleines aktuelles Ziel kann nach Dialogende für wenige Sekunden erscheinen. Es verschwindet wieder; der Spieler kann es im Logbuch aufrufen. Es gibt keine dauerhafte Liste mit acht Fragekarten, fünf Inventarzählern und drei Rätselpanels. Ein Objekt in Reichweite zeigt seine konkrete Handlung: „Mit Mara sprechen“, „Muschel aufheben“, „Messbecken ansehen“.

Interaktion beginnt mit E, einem Klick auf das nahe Objekt oder dem großen kontextuellen Touchknopf. Ein entferntes Objekt kann beschrieben, aber nicht unbemerkt aktiviert werden. Der maßgebliche Abstand wird in Weltkoordinaten geprüft. Der Klick muss das sichtbare Ziel und denselben Zustandswechsel wie E erreichen. Eine Sonderlösung, bei der ausschließlich eine Tastaturnummer funktioniert, erfüllt die Abnahme nicht.

Der Dialog liegt unten und umfasst Sprecher, kurze Aussage und Weiter/Zurück. Bei einer Frage ersetzt die Antwortfläche den Weiterknopf. Es gibt höchstens vier Optionen oder ein klar beschriftetes Eingabefeld. Aufgabe, Mengenabbildung und Antwort gehören in dieselbe Ansicht. Technische Bezeichnungen wie Slot, Revision oder Receipt erscheinen nicht im Schülerfluss.

Die Antwortflächen besitzen auf Touch eine wirksame Mindestgröße von 48 × 48 logischen Punkten mit erkennbarem Zwischenraum. Längere deutsche Texte umbrechen. Die Schrift bleibt bei kleinen mobilen Ansichten lesbar. Das sind Entwurfswerte; ein tatsächlicher Geräte- und Screenshotnachweis muss folgen. Eine verkleinerte Desktopansicht genügt nicht als Fingerabnahme.

Tab und Pfeiltasten führen durch aktive Optionen, Enter bestätigt, Escape schließt den aktuellen Fokus. Der Fokus startet auf dem nächsten sinnvollen Knopf, nicht auf einem zufällig aus dem vorigen Dialog geerbten Index. Die Markierung unterscheidet sich von einer bereits abgegebenen Auswahl. Beim Hinweis verschiebt sich der Fokus verständlich in dieselbe Dialoggruppe; kein Sprung hinter ein verdeckendes Panel.

Auf Touch ist die linke untere Bewegungszone vom Taschen- und Interaktionsbereich rechts getrennt. Ein Pointer gehört ab Beginn seiner Geste genau einer Funktion. Ein Finger, der auf „Tasche“ beginnt, erzeugt keine Bewegung. Ein Kamerawisch ist in dieser festen Kamera gar nicht nötig. Bei Frage und Inventar ist die Bewegungszone deaktiviert. Ein zweiter Finger kann keine zusätzliche Antwort durch das Fenster hindurch auslösen.

Die Tasche öffnet eine kurze Reihe mit sechs Objekten. Auswahl zeigt Namen und einen Satz zum Zweck. „Benutzen“ erscheint nur mit einem erreichbaren passenden oder prüfbaren Ziel. Der Spieler darf den Einsatzversuch abbrechen. Das Pausemenü enthält Fortsetzen, Einstellungen, Fragenübersicht für den Demomodus und Neues Spiel. Vor dem Überschreiben eines vorhandenen Durchlaufs erscheint eine konkrete Bestätigung. Die Schaltfläche heißt nicht nur „Zurück“, wenn sie einen Spielstand löschen würde.

## 11 · Fragenanteil und Zeitmodell

Die Pflichtfolge hat zwölf abgeschlossene Stationen: **sieben schulische Stationen und fünf Logikstationen**. Sieben geteilt durch zwölf ergibt 58,33 %. Normales Gehen, Aufheben innerhalb eines Rätsels und freiwilliges erneutes Sprechen werden nicht künstlich als zusätzliche Nicht-Schulaufgaben gezählt. Eine Station hat einen Prüfpunkt und eine zugehörige bestätigte Weltwirkung. Hilfen und Ersatzversuche bleiben innerhalb derselben Station.

Zusätzlich wird die aktive Zeit getrennt gemessen. Planungsbudget: Schulstationen insgesamt 330 Sekunden, Logikstationen 130 Sekunden, Wege und allgemeine Geschichte 130 Sekunden. Gesamt 590 Sekunden, knapp zehn Minuten. Der schulische Zeitanteil wäre damit etwa 55,93 %. Beide Werte sind Zielrechnungen. Sie behaupten keine bereits gemessene Nutzerzeit. Schulzeit beginnt mit dem sichtbaren Fachkontext und endet nach fachlicher Rückmeldung; allgemeine Rückkehrwege gehören nicht dazu.

Ein Kind darf schneller sein. Ein Kind darf Hilfen nutzen und länger brauchen. Es gibt keine künstliche Wartezeit, um eine zu kurze Fassung auf zehn Minuten zu strecken. Ein sichtbarer Countdown ist nicht vorgesehen. Das Abnahmefenster ist ungefähr 8–12 aktive Minuten für einen ersten normalen Durchlauf ohne lange Pause. Wenn echte Tests deutlich darunter liegen, werden Erkenntnis und Transfer vertieft, nicht Laufwege aufgeblasen. Wenn sie deutlich darüber liegen, werden Text und Rückwege gekürzt, bevor Aufgaben entfernt werden.

| Reihenfolge | ID | Bereich | Art | Planung |
| --- | --- | --- | --- | --- |
| 1 | S1 | Ort | 25 % von 20 Vorräten | 40 s |
| 2 | R1 | Ort | Spiralform finden und benutzen | 20 s |
| 3 | S2 | Ort | Fehlendes Viertel im Brunnen | 45 s |
| 4 | S3 | Garten | Hälfte von zwölf Samen | 40 s |
| 5 | R2 | Garten | Hinweis mit zwei Eigenschaften | 25 s |
| 6 | S4 | Garten | Drei Viertel als Prozent | 45 s |
| 7 | R3 | Strand | Zwei stabile Seilpunkte | 35 s |
| 8 | S5 | Strand | Hälfte plus Viertel | 45 s |
| 9 | R4 | Strand | Passendes Mosaikfragment | 25 s |
| 10 | S6 | Ruine | 25 % von sechzehn Lichtern | 55 s |
| 11 | S7 | Ruine | Drei Viertel mit zwei Dritteln vergleichen | 60 s |
| 12 | R5 | Ruine | Drei Scheiben nach zwei Beziehungen ordnen | 25 s |

## 12 · Didaktische Qualität und Fehlerrückmeldung

Eine Fachaufgabe prüft ein benanntes Lernziel. S1 fragt nach dem Anteil eines konkreten Ganzen, nicht nach einer isolierten Zahl ohne Einheit. S2 und S5 benutzen gleich große Teilmarkierungen. S7 vergleicht gleich große Ganze, damit ein größeres Bild nicht zufällig die falsche Menge bevorzugt. Der Nenner bezeichnet gleich große Teile eines Ganzen. Die Abbildung darf diese Regel nicht verletzen.

Falsche Optionen stehen für plausible Fehler: 25 als Menge statt 25 %, Halbierung statt Viertelung, Addition der Nenner, Vergleich nur der Zähler. Die Rückmeldung erklärt genau den beobachteten Fehler, ohne eine persönliche Wertung. „Noch nicht ganz: Vier gleich große Teile ergeben das Ganze“ hilft mehr als „Falsch“. Ein nächster Versuch bleibt sofort möglich.

Hinweis 1 lenkt die Beobachtung auf die relevante Struktur. Hinweis 2 zeigt eine Zerlegung. Hinweis 3 führt einen Teilschritt vor. Erst wenn eine Hilfe die eigentliche Lösung offenlegt, folgt eine kurze neue Transferfrage mit anderen Zahlen oder anderer Darstellung. Das Tor öffnet nach bestätigtem Verständnis, nicht nach einer festen Fehlerzahl. Hilfen bleiben freiwillig; es entsteht keine überraschende Pflicht-Zusatzprüfung nach einem harmlosen erneuten Öffnen des Dialogs.

Antwortversuche und Hilfephase bleiben beim Schließen, Pausieren und Laden erhalten. Der Spieler kann nicht durch Escape die Fachprüfung zurücksetzen, aber auch nicht wegen eines alten Klicks versehentlich doppelt abgeben. Eine erfolgreiche Station ist abgeschlossen. Ein erneutes Gespräch zeigt die Erklärung und den Weltzustand, nicht wieder dieselbe Pflichtfrage.

Freitext benötigt freigegebene Varianten. Zahlen akzeptieren geeignete deutsche Kommaschreibweise, Brüche und zulässige äquivalente Eingaben, wenn der Aufgabentyp dies vorsieht. „0,75“, „75 %“ und „3/4“ sind nicht in jeder Frage dieselbe Antwortform; die Aufgabe muss die erwartete Form offenlegen. Der Adapter übernimmt keine automatische semantische Behauptung, wenn eine Aufgabe mehrere fachlich mögliche Lösungen hat. Ungeeignete Inhalte werden vor dem Start benannt.

## 13 · Themenwechsel und Lehreransicht

Die Lehrkraft wählt eine vorhandene GradeCrew-Aufgabenquelle oder erstellt sie über den bestehenden Plattformfluss. Der Spieladapter wählt daraus sieben geeignete, freigegebene Stationen. Er erzeugt kein zweites ungeprüftes Fragensystem. Ein vorhandener Test mit acht für den Browseradapter gewählten Fragen passt nicht automatisch zur neuen Sieben-von-Zwölf-Episode; die Spielpaketregel muss ausdrücklich erweitert werden.

Die Vorschau zeigt sieben Schulstationen, fünf feste Logikstationen, Lernziele, Antwortform, Hilfen, zulässige Varianten und die jeweilige Weltwirkung. Ein ungeprüfter KI-Text wird nicht während des Laufens spontan ausgetauscht. Die Lehrkraft bestätigt das Paket. Danach bleibt die Revision für diesen Durchlauf unverändert.

Für Prozentrechnung bleiben Vorräte, Samen und Laternen als Mengen passend. Für Brüche stehen Schale, Becken und gleich große Mosaikteile im Vordergrund. Für Wortarten fragen die Bewohner nach kurzen kontextgebundenen Notizen; die eigentliche Türfreigabe folgt der bestätigten Bitte des Bewohners. Der Spieler bekommt keine unplausible Erklärung, dass ein Verb ein physikalisches Rohr füllt. Die Handlung kann thematisch angepasst werden, während Eingabe und Weltweg stabil bleiben.

Ein Paket darf nicht starten, wenn eine Pflichtfrage unlösbar, unbewertbar, zu lang oder für das Widget ungeeignet ist. Die Lehreransicht nennt den konkreten Grund und bietet einen passenden Austausch. Komplexe Bildaufgaben oder manuell zu bewertende Texte benötigen einen eigenen klaren Modus. Sie werden nicht heimlich als einfache Single-Choice-Aufgaben umgedeutet.

Die lokale Demo verwendet ausdrücklich markierte Beispieldaten. Der spätere Livebetrieb braucht eine getrennte Übungssitzung. Der bestehende Assessment-Abschluss darf nicht für jede Spielstation verwendet werden, weil er den gesamten Test abschließt. Lösungsschlüssel und offizielle Bewertung bleiben serverseitig. Der Client erhält bestätigten Fortschritt und geeignete Rückmeldung, aber keine ungefilterte Sammlung produktiver Lösungen.

## 14 · Zustände, Speicherung und Wiederaufnahme

Der Spielzustand speichert Paketrevision, bestätigte Stationen, Inventar, eingesetzte Objekte, Hilfen, laufenden Versuch, Bereich, sicheren Standort und Zeitsegmente. Die Welt wird daraus aufgebaut. Ein geöffnetes Gartentor wird nicht nur durch eine gerade abgespielte Animation offen gehalten; sein Zustand folgt aus S2. Ein Seil ist nur dann gespannt, wenn beide gültigen Anschlüsse bestätigt sind. Die Ruinentür ist nur dann offen, wenn alle notwendige Fach- und Logikstationen abgeschlossen sind.

Die Darstellung darf eine bestätigte Freischaltung genau einmal feiern. Doppelte Serverantworten, Laden oder erneutes Anklicken erzeugen keine zweite Belohnung. Ein verspätetes Ergebnis gehört nur zur Frage, Sitzung und Revision, für die es abgegeben wurde. Während ein Ergebnis aussteht, zeigt die Oberfläche „Antwort wird geprüft“ und behält die Eingabe. Sie darf nicht gleichzeitig eine neue Frage mit demselben Bestätigungsknopf starten.

Ein ungültiger Spielstand wird nicht teilweise geraten. Er führt zu einer verständlichen Rückmeldung mit Möglichkeit, die letzte gültige Sicherung oder einen neuen Durchlauf zu wählen. Der Spieler wird nach Laden an einer sicheren Stelle seines Bereichs platziert. Eine Position hinter dem noch geschlossenen Steg wird nicht angenommen. Ein fehlendes notwendiges Objekt darf nicht zu einer dauerhaft unlösbaren Sitzung führen.

Für die Demo liegen Quellen und Entwürfe lokal und auf GitHub; erzeugte Builds und Spielstände zunächst auf dem Gerät. Ein Unreal-Projekt ist kein fertig installierbares Mobile-Spiel. Das spätere Paketieren, Signieren und Testen auf einem benannten Gerät gehört zur Abnahme. Eine Onlinefassung mit Unreal braucht einen eigens betriebenen Streamingweg oder eine passende Plattformstrategie. Ein normaler HTML-Export wird nicht behauptet. Kostenpflichtige Hosting- oder GPU-Dienste werden hier nicht gestartet.

## 15 · Ton, Tempo und kleine Freude

Die Küste hat leise Wellen, der Garten wenige Vogelrufe, der Steg ein kurzes Holzknarren und die Ruine einen ruhigen Wind. Ein Hinweis darf nie nur akustisch vorhanden sein. Gespräche benötigen keine produzierte Stimme für die erste Abnahme; gut lesbarer Text reicht. Text kann auf Wunsch vorgelesen werden, nachdem dieser Pfad tatsächlich integriert und geprüft ist.

Eine richtige Lösung erhält einen kurzen passenden Klang und eine Weltbewegung. Wasser rauscht, ein Riegel klickt, ein Seil spannt sich. Nicht jede Antwort erzeugt denselben lauten Siegesjingle. Ein Fehler hat keinen alarmierenden Strafklang. Das Spiel soll Einladen und Wiederprobieren unterstützen.

Kleine humorvolle Momente passen zu Gegenständen: Eine Möwe schaut neugierig zur Muschel, Jona bemerkt, dass seine Samenordnung endlich stimmt, Tilda kommentiert den morschen Pfosten. Sie dürfen Hinweise verstärken, aber weder Pflichtinformationen verdecken noch lange nicht überspringbare Szenen erzeugen. Ein Kind, das die Aufgabe verstanden hat, muss unmittelbar weitergehen können.

## 16 · Produktion ohne fremde Asset- und Bibliotheksbasis

Die angeforderten Rasterbilder werden mit dem eingebauten Bildgenerator erstellt. Sie sind ein Entwurfswerkzeug. Modelle, Materialinstanzen, Animationen, Level und Spielcode bleiben eigene Projektarbeit auf Unreal. Für das Spiel werden keine neuen Open-Source-Bibliotheken und keine heruntergeladenen fertigen Spielfiguren vorausgesetzt. Die Engine selbst und ihre vorhandenen Standardfunktionen bilden die Laufzeitbasis.

Blender ist für modellierte Assetproduktion erlaubt. Bei der letzten technischen Suche wurde kein ausführbares Blender gefunden. Das bleibt ein damaliger Befund; vor der Modellproduktion wird der tatsächliche Installationspfad neu geprüft. Eine fehlende ausführbare Datei wird nicht durch die Behauptung ersetzt, dass bereits Blender-Modelle existierten. Alternativ können eigene Unreal-Modellierungsfunktionen verwendet werden. Eine erkennbare Baum-, Fels- oder Figurenform muss unabhängig vom Werkzeug hergestellt werden.

Die Produktion beginnt mit einem einzigen repräsentativen Bildausschnitt: Dorfplatz, Spielfigur, Mara, Brunnen, zwei Gebäude, Wegöffnung und funktionierender Dialog. Erst dieser Ausschnitt entscheidet, ob die Kamera, Größen, Schatten, Materialien und Eingaben stimmen. Er wird in derselben Auflösung und mit ähnlicher Bildkomposition wie die Zielansicht verglichen. Wenn die Figur doppelt so groß oder der Weg halb so breit ist, werden diese Werte zuerst geändert.

Danach folgen Figurenmodell und Basisskelett, fünf Baumfamilien, Fels- und Bodenfamilie, sechs Inventarobjekte und die drei restlichen Räume. Die zwanzig Einzelstudien pro Tafel bieten Auswahl; die ausgewählten Assets müssen zusammenpassen. Erst anschließend werden alle Pflichtstationen angeschlossen. Ein schöner Standrender ersetzt weiterhin keinen tatsächlich durchspielbaren Ausschnitt.

## 17 · Abnahmekriterien für den ersten echten Ausschnitt

Ein neues Qualitätsversprechen erhält erst einen Nachweis, wenn folgende Beobachtungen im Build möglich sind: Welt füllt den Bildrand ohne schwarze Leere; Figur ist aus normaler Entfernung gut erkennbar; Mara ist auf Anhieb als nächste Begegnung verständlich; ein Klick auf sie öffnet denselben Dialog wie E; ein normaler Finger erreicht ihre Aktion ohne Bewegung; die erste Frage ist lesbar und beantwortbar; eine falsche Antwort bleibt am selben Ort reparierbar; eine richtige Antwort gibt sichtbar die Schale; die Tasche zeigt genau diesen Gegenstand; Escape beendet den Fokus, ohne Bewegung zu behalten.

Für die Bildabnahme werden normale Gameplay-Screenshots verwendet. Keine andere Kamera, kein zusätzlicher Rendertrick und kein übergroßer Bildgenerierungs-Hintergrund dürfen die reale Spielansicht kaschieren. Die Kontakttafeln liefern den Zielstil; sie sind keine Beweisbilder. Eine gelbe Aufgabenfläche auf einem einzigen grauen Würfelboden ist kein bestandener Ausschnitt.

Für die Bedienabnahme wird echte Maus- und Tastatureingabe verwendet. Direkte Aufrufe von internen Antwortfunktionen prüfen Regeln, aber nicht das sichtbare Interface. Ein vollständiger Durchlauf durch echte Eingaben ist ein eigener Test. Für Touch folgt ein physisches Gerät; ein Entwicklerklick in einer mobilen Auflösung ist nur ein vorbereitender Check.

Für die Rätselabnahme erhält eine neue Person keinen mündlichen Zusatzhinweis. Sie soll aus Bild und Text selbst erkennen, was zu tun ist. Beobachtet werden erstes Ziel, Fehlversuche, Suchwege, genutzte Hilfen und Rückkehr nach Pause. Ein Rätsel ist nicht intuitiv, wenn der Entwickler daneben stehen muss und erklärt, welche unsichtbare Taste gemeint ist.

## 18 · Nachweisplan und Entscheidung nach dem Test

Der dokumentierte Ersttest erfasst die vollständige Route, aktive Zeit pro Station, Schulzeitanteil, unerwartete Eingaben, festhängende Zustände und Hinweise. Das Spielziel ist etwa zehn Minuten, nicht eine künstliche Mindestdauer. Eine kleine erste Testgruppe liefert qualitative Hinweise; daraus werden keine repräsentativen statistischen Aussagen über alle Kinder abgeleitet.

Fehler werden in drei Gruppen unterschieden: Bedienung verhindert die geplante Handlung; Hinweis oder Frage ist unklar; Aufgabe ist fachlich oder logisch falsch. Ein sichtbarer Bug wird reproduziert und mit Ursache repariert. Eine unklare Aufgabe wird umgeschrieben oder räumlich verändert. Eine fachlich falsche Frage wird aus dem Paket genommen, bis ihr Inhalt korrigiert ist.

Die Priorität lautet: zuverlässig handeln können, nächstes Ziel erkennen, Regel verstehen, sichtbare Wirkung erleben, dann dekorative Tiefe ausbauen. Diese Reihenfolge nimmt der Optik nichts weg. Sie verhindert, dass hochwertige Assets an ein weiterhin unbedienbares Interface gebunden werden.

Die nächste Bauphase ist der Dorf-Ausschnitt. Der endgültige Umfang dieser ersten Episode bleibt vier Räume und zwölf Stationen. Erst nach dessen Abnahme folgt eine weitere Episode. Dieses Buch bleibt dabei die Quelle für konkrete Zustände, und neue Entscheidungen werden mit Grund und Nachweis ergänzt.
