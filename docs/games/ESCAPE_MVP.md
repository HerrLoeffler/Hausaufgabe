# Escape Room – kleinster sinnvoller GradeCrew-Prototyp

Quelle: vom Nutzer am 01.10.2026 angehängter Games-Chat. Konzept, keine Aussage über schon implementierte Spielfunktionen.

## Verbindliche Produktanforderungen

- Standard komplett digital: keine Zettel verstecken, Stationen aufbauen oder Gegenstände verteilen.
- Lehrkraft wählt Spielwelt und vorhandenen Test oder erstellt passende Lernfragen mit dem bestehenden KI-Weg.
- Vor dem Start alle Aufgaben, Lösungen, Reihenfolge, Hilfen und Spielmechaniken in einer Lehrerübersicht prüfen können. Kein Durchspielen notwendig.
- „Die verriegelte Schule“ und „Das verschwundene Prüfungsblatt“ sind zwei Welten mit gemeinsam nutzbarem Spielkern.
- Physische QR-/Papierhinweise ausschließlich als spätere freiwillige Erweiterung.

## Empfohlener erster Umfang – noch nicht implementiert

Eine Welt („Verriegelte Schule“), drei kleine Bereiche, wenige feste Interaktionen und 4–6 geeignete Lernfragen. Dauer nur als Schätzung, nicht als zugesicherte Spielzeit. Lehrkraft prüft die KI-Fragen vor Freigabe. Kein generischer Raumeditor, keine freie KI-Generierung ausführbarer Spiellogik.

KI liefert geprüfte Lerninhalte. Ein deterministisches Template ordnet sie zulässigen Interaktionen zu. Nicht jede Antwort ist als Türcode geeignet: Zahlenformate, negative Werte, Dezimalstellen und Freitext müssen keine erfundenen Codes ergeben. Richtige Lernantwort schaltet stattdessen einen vom Template definierten Gegenstand/Schritt frei.

Nicht automatisch bewertbare Aufgabentypen dürfen den Spielfortschritt nicht unbemerkt blockieren. Im MVP nur explizit unterstützte Typen einsetzen und andere in der Lehrerübersicht erklären.

## Abnahme

- Lehrkraft erkennt Spielablauf und alle Lösungen ohne selbst zu spielen.
- Keine Sackgasse durch falsche Antworten, Hilfen oder Wiederaufnahme.
- Fragen und Hinweise sind auf Tablet per Touch und per Tastatur bedienbar.
- Richtig/falsch und Fortschritt entsprechen dem bestehenden verifizierten Bewertungsvertrag.
- Geschützte Lehrerübersicht; Lösungen nicht über einen ungeschützten „Lehrermodus“-Schalter öffentlich machen.
- Inhalt einer gestarteten Runde versioniert und unveränderlich.
- Reload, Verbindungsverlust und erneuter Beitritt haben ein definiertes Verhalten.
- Fehlerbericht nennt Spiel-/Inhaltsversion und pseudonyme Rundenreferenz; keine Schülerantworten, Namen oder Secrets in allgemeine Logs.
- Starts, Abschlüsse und aktive Zeit später getrennt von bloß geöffneten Tabs erfassen. Analytics ist ein eigener Auftrag.

## Umsetzung

Vor Codeänderungen den tatsächlichen Games-Branch und seine Regeln lesen. Bestehende Spiele, Lobby und Lehrersteuerung weiterverwenden, soweit passend. Dieser Auftrag berechtigt nicht dazu, den Website-Branch durch einen älteren Spielebranch zu ersetzen.

Aufgaben: GC-GAMES-01 bis GC-GAMES-03 in TODO.md.
