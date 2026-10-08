# Lerninsel — vom Bildentwurf zum Vier-Rätsel-Prototyp

Task GC-GAMES-ESCAPE-VISUAL-01, eigener Branch feature/lerninsel-ego-v1 / PR175. Martin fordert am 08.10.2026 ausdrücklich: aus dem umfangreichen Pokémon-Entwurf lernen, vorhandene Grundlagen prüfen und den Inselprototyp anschließend bauen. Seine frühere autonome Baufreigabe gilt weiter. Kein erneuter Entwurfsfreigabehalt, kein Productionauftrag.

Die methodische Referenz wurde tatsächlich gelesen: PR171 bei 221900 cc, Spielbuch/Drehbuch/Bauvertrag/Bildprüfung/Katalog. Dort 96 Seiten und 244 Motive auf 13 Tafeln; keine 244 fertigen Assets oder nachgewiesene Spielabnahme. Übernommen werden Objekt-ID/Zweck/Varianten, Voraussetzungen/Folgen, konkrete Fehler/Hilfen, exakte Geometrie und Trennung von Regel-, Engine- und Bediennachweisen. Die Vogelperspektive und NPCs gehören zur Expedition, nicht zur Ego-Insel.

Vorliegendes Insel-Spielbuch 7929 Wörter und 21 Motive bleibt die Grundlage. Diese Ergänzung macht daraus konkrete Produktionsentscheidungen, eine umfangreiche Objekt-/Zustandsbibliothek und den Vier-Rätsel-Bau. Vorheriger Prüfbau76b336e/c2c651b, Engine5.8.3/59Regelchecks/1Engine-Test geprüft. Alte Prüfzahlen gelten nicht für neue Funktionen.

Live-Audit37736017527/Job113175596418 gelesen: eigener Remote c 2 c 651 b +6/-10zumMain, PR175 Draft. EigeneDesign-/Runtimepfade überschneiden sich erwartbar; bestehende .gitignore-Überschneidung mitWeb/Security wird nicht erweitert. Neue Quelle nur games/lerninsel-unreal und eigene docs. Main/Webrelease und anderer Expeditionscheckout werden nicht übernommen. Bestehender isolierter eigener Worktree sauber, wiederverwendet.

Ziel dieses Blocks: Verbpfad, Satzweg, Bruchwasser und Felsfenster als zusammenhängender nativer Prototyp, dazu Eimer1L/3/10 und optional schwierigere Transferaufgaben. Farb-/Formkontrakte und tatsächliche Spielaufnahmen, echte Pointerroute zusätzlich zu Regellogik. Browserstreaming, Signierung/Gerätetest und endgültiges Achtgebiets-Spiel bleiben gesonderte Aufgaben. Keine ungemessene Spielzeit oder grafische Gleichwertigkeit als Tatsache ausgeben.

Dateien: bauvertrag.md, katalog.json, bildkatalog.md, generierung.json, boards/, pruefung.md. Jede Tafel hat 20 nummerierte Motive; die Zahl zählt Bildfelder, keine einzelnen Engine-Assets. Verbindliche Zahlen/Schrift/Zustände kommen aus Daten, nicht aus generierter Schrift.

## Auslieferung des illustrierten Buchs

Das lokal erzeugte `lerninsel-bauhandbuch.pdf` besitzt280Seiten:28Seiten Spielbeschreibung/Bauvertrag/Bildprüfung,12Tafelübersichten und240Einzelstudien. Es ist kein280-seitiges einzigartiges Dialogdrehbuch. Jede Studie beschreibt ihren Bauzweck, Vertrag und Abnahmegrenze. Cover, eine Baumstudie und die letzte Farbseite wurden gerendert und visuell geprüft; Erzeugung kontrolliert Seitenüberläufe. Das etwa58MB großePDF wird lokal erhalten. Der Gitbranch sichert bearbeitbare Texte, Originaltafeln und den reproduzierbaren Generator. Kein erneuter Bildaufruf für diePDF-Erstellung.

Die ursprüngliche Achtelroute ist für diesen Prototyp ausdrücklich ersetzt. Zwei Zusatzaufgaben sind umgesetzt: nominalisiertesLaufen und die7/12-Ergänzung zu1/6+1/4. Der alternative Eule-Satz bleibt eine spätere Variante, kein bereits gebautes zusätzliches Feld. Der Funktionsprototyp besitzt keine grafische Gleichwertigkeitsabnahme mit den Konzeptbildern.
