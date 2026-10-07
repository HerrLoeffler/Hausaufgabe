# Bruchpizzeria: Lernen in der Küche

GC-GAMES-PIZZA-01 · 07.10.2026 · Änderung nach Martins abgelehnter Lernpause.

## Befund und Ziel
Die alte Pause fragt abstrakt nach dem Nenner und zeigt Antwortnummer und Zahl mit demselben Trenner. Sie testet Begriffe, statt den Bestellfehler sichtbar zu erklären. Der Spieler soll durch Kochen Anteile verstehen und einen konkreten Fehler selbst korrigieren. Keine Aussage über nachgewiesenen Lerntransfer oder Lehrplanabnahme.

Grundlage: vorhandene GradeCrew-Games-Anforderungen in ESCAPE_MVP und GREAT_GAMES_WORKFLOW (verständliche Hilfen, kein blockierter Lernpfad, Fortsetzen), Nutzerauftrag und tatsächliche Lernpause. Die Quellen enthalten keine fertige Bruchkampagne; folgende Ausgestaltung ist ein neuer begründeter Entwurf.

## Gastfeedback: ansehen und in der Küche nachbessern
Jede falsche Übergabe (roh, falscher Belag, falsche Portion oder ungleiche Stücke) zeigt nur die vom Gast gewünschte Pizza: Bruchanteil als Bild, Zutaten und fertig gebackener Zustand. Die Küche und alle Gast-/Back-/Serviceuhren warten. Das Bild lässt sich nicht verändern, es gibt keine automatische Korrektur und keine Quizkette.

»Okay, verstanden« / E schließt das Fenster und lässt die tatsächliche Pizza unverändert in den Händen. Der Spieler läuft zu den Zutaten, zum Ofen oder zum Schneidebrett, bessert selbst nach und versucht die Übergabe erneut. »Trotzdem abgeben · 0€« / F übergibt genau diese falsche Pizza: kein Speisepreis, kein Trinkgeld, kein erfolgreicher Lieferfortschritt. Der Gastplatz bekommt eine neue Bestellung. Eine bewusste Falschlieferung blockiert das Weiterspielen nicht; zum Freischalten bleiben3 bzw4richtige Lieferungen erforderlich.

Das Fenster darf auch über Esc pausiert werden; E/F und Maus verändern hinter dem Menü keine Pizza. Rechenbestellungen zeigen ihre gewünschte Portion und gegebenenfalls die kurze Rechenzeile, verlangen aber keine zusätzliche Pflichtaufgabe im Fenster. Die Lernhandlung liegt beim physischen Portionieren. Eine pädagogische Wirksamkeits-/Lehrplanabnahme liegt weiterhin nicht vor.

## Erste Kampagne: 10 unterschiedliche Level
Nach Martins Umfangskorrektur höchstens10 im ersten Test.20 ist eine mögliche Erweiterung nach Abnahme;100 wurde verworfen. Noch keine Lernenden-/Lehrplanvalidierung: ein nachvollziehbarer erster Entwurf, kein ausgereiftes Curriculum für »Brüche vollständig verstehen«.

Jedes Level hat eine eigene Stationsanordnung mit gemeinsam wiederverwendeten Assets. Verschiedene Zutatwege, Brettpositionen und Ablagen ändern den Küchenablauf sichtbar; keine Behauptung zehn komplett neuer Grafikwelten. Lokaler Fortschritt wird nur nach genug korrekt servierten Gästen freigeschaltet. Lernen aus einer Hilfekorrektur allein zählt nicht. Wiederholung jederzeit über Levelwahl.

| Level / Küche | Lernen | Spielbelastung |
| --- | --- | --- |
| 1 La Piccola | Ganzes und Hälfte, gleiche Teile | ein Gast, ein Ofen, zwei Ablagen, kein Zeitlimit |
| 2 Zwei Seiten | Hälften sicher anwenden | andere Zutat-/Ablagewege, zwei Gäste, weiter ohne Zeitlimit |
| 3 Viertelwerkstatt | Ein Viertel, drei Viertel | neue Idee: wieder ein Gast, ruhige Küchenwege |
| 4 Gartenterrasse | Viertel im laufenden Kochen | zwei Gäste, anderer Brett-/Zutatweg, Pilzbelag |
| 5 Achtelatelier | Konkret1/8,3/8und7/8 | ein Gast, großzügige Hilfe, kein Zeitlimit |
| 6 Doppio | Achtel parallel vorbereiten | zweiter Ofen, zwei Gäste, erste bekannte Aufgaben mit Uhr |
| 7 Marktstand | Gleiche Mengen und erster Tellerabwasch | ein Gast, ohne Zeitlimit; benutzte Teller holen und drei Sekunden spülen |
| 8 Viertelrunde | Erstes Addieren gleicher Teile | ein Gast, nur jede vierte Bestellung als Rechnung |
| 9 Gemeinsam teilen | Viertel und Achtel addieren | ein Gast, kein Zeitlimit, gemeinsame Achtel sichtbar |
| 10 Die volle Pizzeria | Bekannte Brüche + erste Minusbestellung | zwei Gäste, zwei Öfen, Uhr für bekannten Stoff |

Multiplikation/Division, weitere Räume und Ratten nach diesem Test als Erweiterungsentwurf; nicht schon in die ersten10 pressen. Einführungsschichten ohne Zeitlimit, langsames korrektes Servieren zählt auch im Zeitmodus. Ein Timeout ist wiederholbar. Freischaltung ist lokale Spielprogression, kein bestätigter GradeCrew-Lernstand.

## Ablage und Öfen
Zwei sichtbar beschriftete Tische in der Küche. E/X am freien Tisch legt rohe, gebackene oder portionierte Pizza unverändert ab; mit freien Händen holt E sie wieder. Volle Ablage + volle Hände verändert keine Pizza. X abseits einer Ablage löscht nichts. Dadurch kann nach Abholen aus dem Ofen sofort die nächste Pizza vorbereitet werden. Ein zweiter Ofen wird ab Level6 freigeschaltet; getrennte Backuhren und Anzeigen.

## Spätere Ideen
Ratten, neue Räume, Audiocharaktere und eine grafische Weltkarte sind Ideen, keine implementierten Zusagen dieses Korrekturschritts. Ratten höchstens in bekannten freiwilligen Herausforderungsschichten, deutlich angekündigt/abwehrbar; niemals während Lernhilfe. Kein verlorener Lernfortschritt durch Störung.

## Umsetzung und Prüfung
1. Reale Fehlerhilfe und Kampagnenregeln mit handgeprüften Bruchbeispielen testen (RED/GREEN), dann native UI mit direkt auswählbaren Pizzastücken.
2. Ablageverlust, belegten Tisch, parallele Backuhren und Pausen in tatsächlichem UE-Spielablauf prüfen.
3. Kampagnenfreischaltung nur nach korrekten Lieferungen; Wiederholen/Weiter und lokale Speicherung.
4. Native Build-/Renderprüfung und unabhängige begrenzte Codeprüfung. Sichtbare Lesbarkeit anhand tatsächlicher PNG; keine Geräte-/Lerntransferabnahme aus automatisierten Prüfungen ableiten.

## Küchenfehler und Rechnungen (aktuelle Nutzerkorrektur)
Alle Belagzustände dürfen in den Ofen, auch unvollständig und nach einer abgelehnten Lieferung. Eine Pizza darf vor dem Fertigbacken herausgenommen, roh geschnitten, ungleich portioniert oder als Ganzes serviert werden. Nur physische Belegung von Ofen/Brett/Tisch und volle Hände verhindern einen Transfer. Der Gast prüft Backzustand, tatsächlich vorhandene Zutaten und tatsächliche Portion erst bei Übergabe. Er benennt fehlende/unerwünschte Zutaten einzeln; ein Fehler bezahlt weder Ware noch Trinkgeld und zählt nicht als erfolgreich bedient.

Jede Übergabe erzeugt einen kompakten Bon rechts unter der Kasse: tatsächliche Pizzaportion, Pizza, vorhandene Zutaten, Gesamtpreis, Trinkgeld und wirklich bezahlter Betrag. Er verschwindet nach2aktiven Sekunden automatisch und blockiert das Kochen nicht. Das Gastfenster und Menü halten seine Sichtzeit an; auch nach Schichtende läuft der Bon ab, während die Schichtgesamtrechnung stehen bleibt. Bei ungleichen Teilstücken bleibt der Preis ausdrücklich offen und die Zahlung0. Die dekorativen Rezepttafeln über den Stationen sind entfernt; echte Bestellungen stehen in der oberen Leiste. Es entsteht keine neue Pflicht-Rechenaufgabe. Bestehende Rechenbestellungen in8–10 bleiben gelegentlich.

Erste Spielpreise pro Ganzem: Pizza8€, Tomate1€, Käse2€, Champignons1€. Die tatsächliche Portion skaliert jede Position; Cent-Rundung pro sichtbarer Position, anschließend Summe der Positionen. Für korrekte Lieferung: bis30 aktive Sekunden20% Trinkgeld, bis60 Sekunden10%, später kein Trinkgeld, aber weiter voller Speisepreis. Pause und Bruchhilfe halten die Serviceuhr an. Frühe Level behalten kein Zeitlimit und keinen Geldabzug; langsames korrektes Spielen bleibt erfolgreich.

Kasse sammelt bezahlte Beträge inklusive Trinkgeld über Schichten und Neustarts lokal. Pro Schicht werden Speiseumsatz, Trinkgeld und deren Gesamtrechnung angezeigt. Falsche Versuche gehen nicht in den Umsatz ein. Normale und PIE-Testdateien für Kasse/Freischaltung sind getrennt. Dieses Geld ist lokale Spielwährung, keine echte Zahlung und kein bereits implementierter Upgrade-Shop.

## Spielmenü und Neustart
Esc oder der sichtbare »MENÜ · ESC«-Knopf öffnet die Pause auch beim Schneiden und in der Bruchhilfe. »Weiter«/Esc bewahrt Pizza, Schnittauswahl, aktuelle Hilfe und Bestellungen. Alle Küchen-/Gast-/Trinkgelduhren stehen; Eingaben verändern darunter keine Portion.

»Schicht neu starten« startet dasselbe Level mit frischen Bestellungen und leerer Küche. Nur Schichtfortschritt/-umsatz wird zurückgesetzt; kumulative Kasse und freigeschaltete Level bleiben erhalten. »Levelauswahl« verlässt die laufende Schicht und führt zur bestehenden Auswahl freigeschalteter Küchen. Auch die Schichtabrechnung bietet Levelauswahl. Das Menü verlangt keine zweite Bestätigung für den bewusst gewählten Neustart.

## Tatsächlicher aktueller Spielaufbau
Der Ablauf ist sauberen Teller holen → Teig und Belag → fünf Sekunden backen → am Brett schneiden/auswählen → Gast. Teller können nachträglich am Brett mit Pizza kombiniert werden. Zwei Ablagen erlauben Parallelvorbereitung, ab6sind zwei Öfen nutzbar. Gäste sind feste Serviceplätze mit wechselnden Namen/Bestellungen; sie laufen nicht herein, setzen sich nicht und gehen nicht animiert. In6/10gibt es einen150Sekunden-Geduldsbalken, aber noch keinen echten Weggeh-/Wutablauf. Die Schichtzeit beträgt dort5Minuten; andere Level haben kein Zeitlimit. Ofenpizza verbrennt bisher nicht.

Pro Level werden3(runde1–5) bzw4(runde6–10)richtige Lieferungen benötigt. Muster sind fest, keine adaptive Schwierigkeit. Jede Küche verschiebt Stationen/Ablagen; es sind keine10völlig neuen Grafikwelten oder Storykapitel. Level7beruht auf gleicher Pizza-Menge trotz verschiedener zulässiger Teilungen; diese Gleichwertigkeit wird noch nicht als ausführliche eigene Spielmechanik erarbeitet. Plus/Minus erscheint nur jede vierte Bestellung in8–10. Multiplikation/Division sind im Rechenkern vorhanden, aber kein Kampagneninhalt dieser10Level.

Ratten, Gästewanderung, verbrannte Pizza, Kauf-Upgrades, Sternebewertung und Story sind nicht implementiert. Geld ist aktuell Sammlung/Servicebelohnung, noch kein Kaufsystem. Neue Themen werden bewusst ruhig eingeführt, deshalb ist die Belastung nicht durchgehend steigend.

Bewertung des Spielaufbaus/Kampagnentiefe dieser ersten10Level:5/10 als begründete Einschätzung. Funktionierende Küche, Coins, Auswahlmenü und unterschiedliche Lernschwerpunkte stehen festen kurzen Bestellungsmustern und einfachen Gästereaktionen gegenüber. Das ist keine Gesamtbewertung vonGradeCrew und kein gemessener Lerntransfer. Nächster sinnvoller Ausbau: echte Gästeabläufe und tragfähigere spielerische Unterschiede nach Martins Test; Ratten später als optionale bekannte Herausforderung.

## Neuer autorisierter Teller-/Müllkreislauf (Umsetzung läuft)
Unbegrenzte Vorräte der vorhandenen Zutaten und sauberen Teller, Stapel neben Spüle. Belag nur hinzufügen, zuletzt benutzt sichtbar oben. Zu viel Belag nur über Müll entsorgen. Pauschalen: Teig1€, rohe belegtePizza2€, gebackene/portioniertePizza3€, leererTeller1€; Abzug höchstens bestehende Kasse, kein negativer Betrag. Food-Entsorgung behält angehängten Teller; Teller-Entsorgung entfernt ihn.

Echte Übergabe zeigt exakten Teller/Portion3Sekunden beim richtigen Gast. Ab ruhigem7danach schmutzigerTeller: mit freien Händen holen, SpüleE3aktiveSekunden, sauber abholen. Platz/finaleSchicht frei nach Reinigung. NeuerTellerstapel unbegrenzt; Gastplatzreinigung bleibt nötig, bewusste bezahlte Entsorgung ersetzt Teller alternativ. Alle Uhren frieren in Menü/Gastfenster. Neue Mechaniken in Levelintro erklärt. Ohne Stückauswahl bleibt Pizza amBrett, nur leererTeller wird genommen. Keine neuenIngredienttypen/Ratten/Production.

## Teller und Entsorgung: aktueller Stand
Teller sind eigene Gegenstände: leer/sauber, mit Pizza oder schmutzig. Der Stapel neben der Spüle ist unbegrenzt, ebenso der Vorrat vorhandener Zutaten. E legt leere Teller am Brett ab und nimmt sie mit freien Händen wieder auf. Ohne ausgewählte Stücke nimmt man nur den leeren Teller; die ganze Pizza bleibt am Brett. Mitnehmen/Brett verlassen machen auch unportionierte Pizza zugänglich.

Richtige wie bewusst falsche0€-Übergabe zeigt das echte Objekt beim konkreten Gast drei aktive Sekunden. Tischnummern bleiben stabil. In1–6 wird der Platz danach frei; in7–10 bleibt ein schmutziger Teller. Mit freien Händen holen, E an der Spüle einlegen, drei aktive Sekunden warten, sauber abholen. Frühes Herausnehmen bleibt schmutzig. NeuerTellerstapel umgeht Gastplatzreinigung nicht. Bewusster Ersatz eines leeren Tellers kostet1€. Bei Weitergabe an anderen Gast bleiben alle betroffenen Reinigungspflichten am selben Teller; Waschen/Entsorgen löst alle diese Plätze.

Müllkosten sofort von kumulierter Kasse: Teig100c, rohe belegtePizza200c, gebackene/portioniertePizza300c, leererTeller100c. Höchstens vorhandener Betrag wird abgezogen; Bank bleibt mindestens0. Food-Entsorgung behält angehängten Teller, Teller-Entsorgung entfernt ihn. Schichtrechnung zeigt Speisen+Trinkgeld−tatsächlicheMüllkosten.

Jede Level-Einführung erklärt Änderungen. NächstesLevel führt zuerst dorthin; E/LosKochen startet anschließend. Gästeessen und Abwasch frieren mit allen anderen Spieluhren in Menü/Gastfenster. Finale7–10wartet auf letzte Tellerreinigung. Frühe1–6halten die letzte gelieferte Pizza hinter der Ergebnisanzeige, weil aktiveSpielzeit dort endet.
