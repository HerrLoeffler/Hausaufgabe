# GradeCrew Lab · Fehlerjagd Deutsch

Eigenständiger Prototyp neben Fast Quiz. Zielgruppe zunächst ausschließlich Mittelschule Bayern, Deutsch Regelklasse Jgst. 5–9 plus Quali-Training.

## Drei feste Modi

1. **Üben** – Jahrgang, Kompetenzbereiche, Niveau, Zeit und Fehlerregeln frei konfigurieren; persönliches Fehlerprofil.
2. **All-Time-Highscore** – feste Regeln, zwei Minuten, nach Jahrgang und Bereich getrennte Bestenlisten.
3. **Live mit Lehrkraft** – Lehrkraft konfiguriert, QR-/6-stelliger Code, bis zu 30 Teilnehmende, gemeinsamer Start, Live-Scoreboard.

## Kompetenzbereiche im Prototyp

- Rechtschreibstrategien
- Groß- und Kleinschreibung
- richtige Schreibweisen / Lern- und Fremdwörter
- das / dass (ab Jgst. 6)
- Getrennt- und Zusammenschreibung (ab Jgst. 6)
- Zeichensetzung
- Wortarten
- Satzglieder
- Satzbau / Satzreihe / Satzgefüge (ab Jgst. 6)
- Zeitformen
- Aktiv / Passiv (ab Jgst. 7)
- Wortbildung, Synonyme, Oberbegriffe, Fremdwortstrukturen (ab Jgst. 7)

## Lehrplanlogik

Die Auswahl orientiert sich an LehrplanPLUS Mittelschule Deutsch, Lernbereich 4 „Sprachgebrauch und Sprache untersuchen und reflektieren“, insbesondere 4.2 „Sprachliche Strukturen untersuchen und reflektieren“ und 4.3 „Richtig schreiben“ der Regelklassen 5–9.

Für das Quali-Training werden zusätzlich die vom ISB veröffentlichten Aufgabenformate aus Teil B „Sprachgebrauch“ als Formatvorbild genutzt: richtige Schreibweise mit Begründung, Rechtschreibstrategie, Fehlerkorrektur, Groß-/Kleinschreibung, Getrennt-/Zusammenschreibung, Zeichensetzung, Wortarten, Zeitformen, Aktiv/Passiv, Satzglieder und Satzbau.

**Wichtig:** Die Aufgaben im Spiel sind neu formuliert. Alte Prüfungsaufgaben werden nicht wörtlich in den Aufgabenpool kopiert.

## Aufgabenmechaniken

- `single`: eine Antwort aus vier Möglichkeiten
- `multi`: mehrere fehlerhafte Stellen in einem Satz/Text markieren und gemeinsam prüfen

Die Engine verteilt ausgewählte Kompetenzbereiche zyklisch, damit kurze Runden nicht zufällig nur einen Bereich enthalten. Seed + Konfiguration erzeugen dieselbe Aufgabenfolge; dadurch sind Live-Runden vergleichbar.

## Backend

Eigene Functions-Codebase `fehlerjagd`, eigene Collections (`fehlerjagdRooms`, `fehlerjagdBoards`, `fehlerjagdAttempts`). Keine Änderung an Fast Quiz, bestehender GradeCrew-API oder Firestore-Regeln nötig.
