# Bruchpizzeria: Lernen in der Küche

GC-GAMES-PIZZA-01 · 07.10.2026 · Änderung nach Martins abgelehnter Lernpause.

## Befund und Ziel
Die alte Pause fragt abstrakt nach dem Nenner und zeigt Antwortnummer und Zahl mit demselben Trenner. Sie testet Begriffe, statt den Bestellfehler sichtbar zu erklären. Der Spieler soll durch Kochen Anteile verstehen und einen konkreten Fehler selbst korrigieren. Keine Aussage über nachgewiesenen Lerntransfer oder Lehrplanabnahme.

Grundlage: vorhandene GradeCrew-Games-Anforderungen in ESCAPE_MVP und GREAT_GAMES_WORKFLOW (verständliche Hilfen, kein blockierter Lernpfad, Fortsetzen), Nutzerauftrag und tatsächliche Lernpause. Die Quellen enthalten keine fertige Bruchkampagne; folgende Ausgestaltung ist ein neuer begründeter Entwurf.

## Lernhilfe
Nur falsche Lieferung unterbricht automatisch. Alle Küchen-, Back- und Gastuhren stehen. Bestellung links, eigene Portion rechts: dieselbe ganze Pizza, dieselben gleich großen Teile. Beispiel 3/8 vs 1/2: links drei, rechts vier Achtel. Text: »Ein Stück ist zu viel. Tippe ein Stück an, um es zurückzulegen.« Anklicken verändert die Portion; »Portion korrigieren« prüft sie. Ein falscher Versuch gibt konkret fehlende/überschüssige Stücke an. »Zeig mir den Schritt« zeigt die nötige Auswahl, verlangt anschließend Bestätigung. Keine Quizkette, kein Nenner-Vorwissen. Der echte Teller wird passend korrigiert, bleibt erhalten und muss erneut zum Gast gebracht werden. Keine Punkte oder Fortschrittsanerkennung allein für Hilfenutzung.

Zutatenfehler zeigt die Bestellzutaten als Namen und korrigiert denselben Teller nach kurzer Bestätigung. Rechenbestellungen nutzen sichtbare gemeinsame Teile und eine kurze Rechenzeile; keine sechs abstrakten Unterfragen. Spätere optionale Pizzatipps zwischen Schichten sind Hinweise, keine Pflichtaufgaben.

## Erste Kampagne: 10 unterschiedliche Level
Nach Martins Umfangskorrektur höchstens10 im ersten Test.20 ist eine mögliche Erweiterung nach Abnahme;100 wurde verworfen. Noch keine Lernenden-/Lehrplanvalidierung: ein nachvollziehbarer erster Entwurf, kein ausgereiftes Curriculum für »Brüche vollständig verstehen«.

Jedes Level hat eine eigene Stationsanordnung mit gemeinsam wiederverwendeten Assets. Verschiedene Zutatwege, Brettpositionen und Ablagen ändern den Küchenablauf sichtbar; keine Behauptung zehn komplett neuer Grafikwelten. Lokaler Fortschritt wird nur nach genug korrekt servierten Gästen freigeschaltet. Lernen aus einer Hilfekorrektur allein zählt nicht. Wiederholung jederzeit über Levelwahl.

| Level / Küche | Lernen | Spielbelastung |
| --- | --- | --- |
| 1 La Piccola | Ganzes und Hälfte, gleiche Teile | ein Gast, ein Ofen, zwei Ablagen, kein Zeitlimit |
| 2 Zwei Seiten | Hälften sicher anwenden | andere Zutat-/Ablagewege, zwei Gäste, weiter ohne Zeitlimit |
| 3 Viertelwerkstatt | Ein Viertel, drei Viertel | neue Idee: wieder ein Gast, ruhige Küchenwege |
| 4 Gartenterrasse | Viertel im laufenden Kochen | zwei Gäste, anderer Brett-/Zutatweg, Pilzbelag |
| 5 Achtelatelier | Ein Achtel bis 7/8 | ein Gast, großzügige Hilfe, kein Zeitlimit |
| 6 Doppio | Achtel parallel vorbereiten | zweiter Ofen, zwei Gäste, erste bekannte Aufgaben mit Uhr |
| 7 Marktstand | 1/2=2/4=4/8 und 3/4=6/8 | ein Gast, neue Stationsanordnung, kein Zeitlimit |
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
