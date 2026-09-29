# Vocab Rush Lab

Vocab Rush ist das dritte experimentelle GradeCrew-Spiel neben Fast Quiz und Fehlerjagd Deutsch.

## Zwei Inhaltsquellen

### 1. Lehrplan-Training
Direkt spielbare Englischthemen für Mittelschule Bayern, Jahrgangsstufen 5–9. Die Themen werden nach ihrer lehrplanbezogenen Einführung gekennzeichnet und können später wiederholt bzw. vertieft werden.

### 2. Meine Vokabeln
Eigene Vokabelsets aus dem aktuellen Unterricht. Sets können manuell, per Copy & Paste oder über Foto/Screenshot/PDF mit KI-Erkennung angelegt werden. Vor dem Speichern wird die erkannte Liste von der Lehrkraft geprüft.

## Drei Modi
- **Üben**: lernorientiert, Fehler werden wiederholt; falsche Lösungen erscheinen mindestens fünf Sekunden groß als MERKEN-Hinweis. Bei eigenen Vokabeln kann optional verlangt werden, die englische Vokabel nach einem Fehler einmal korrekt selbst zu schreiben.
- **All-Time-Highscore**: feste Lehrplan-Disziplinen mit vergleichbaren Regeln.
- **Live mit Lehrkraft**: QR-Code, bis zu 30 Teilnehmende, gemeinsamer Start und Live-Scoreboard.

## Vokabelbibliothek
- Sets können bearbeitet, dupliziert und gelöscht werden.
- Mehrere Sets können gemeinsam ausgewählt werden, etwa Unit 1 + Unit 2 oder alle Units.
- Mehrseiten-Import hält bereits hinzugefügte Seiten fest; neue Seiten ergänzen den Import statt vorherige zu ersetzen.
- Unterstützt werden Bilder, Screenshots, Drag & Drop sowie PDFs mit mehreren Seiten.
- Pro Seite kann ein Ausschnitt gewählt werden.

## Foto/KI
Der Browser sendet Bilddaten ausschließlich an die separate Staging-Function `vocabRushApi`. Der OpenAI-Key bleibt serverseitig im Firebase Secret. Das Modell liefert strukturierte Englisch-Deutsch-Vokabelpaare; das Foto selbst wird vom Vocab-Rush-Code nicht dauerhaft gespeichert. Erst die geprüfte Vokabelliste wird übernommen.

## Lab-Isolation
- Branch: `lab/vocab-rush`
- Worktree: `~/gradecrew-vocab-rush`
- Firebase: `hausaufgabe-staging`
- eigene Functions-Codebase: `vocabrush`
- eigener Preview-Channel: `gradecrew-vocab-rush`

Fast Quiz, Fehlerjagd, Games Hub, normales Staging-Hosting und Production werden durch die Lab-Deployskripte nicht verändert.
