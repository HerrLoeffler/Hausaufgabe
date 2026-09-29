# Vocab Rush – Vokabelbibliothek

## Ziel

Eigene Vokabelsets bleiben dauerhaft im Browser gespeichert und können später erneut für Üben oder Live-Runden verwendet werden.

## Auswahl

- Ein einzelnes Set kann gespielt werden.
- Mehrere Sets können gleichzeitig ausgewählt und vor dem Start zu einer temporären Spielauswahl zusammengeführt werden.
- `Alle auswählen` ermöglicht z. B. die Wiederholung mehrerer Units vor einer Schulaufgabe.
- Doppelte englische Einträge werden beim Zusammenführen zusammengeführt; mehrere deutsche Bedeutungen bleiben erhalten.

## Verwaltung

Gespeicherte Sets können:

- umbenannt,
- inhaltlich bearbeitet,
- dupliziert,
- gelöscht werden.

Das Löschen betrifft nur die lokale Vocab-Rush-Bibliothek dieses Browsers.

## Mehrseiten-Import

- Bilder und Screenshots können mehrfach hinzugefügt werden, ohne vorherige Seiten zu ersetzen.
- Drag & Drop wird unterstützt.
- PDFs werden im Browser seitenweise gerendert; maximal 20 Importseiten pro Arbeitsvorgang.
- Pro Seite kann vor der KI-Erkennung ein Ausschnitt gewählt werden.
- Bereits ausgelesene Seiten werden nicht erneut an die KI geschickt, solange ihr Ausschnitt nicht geändert wurde.
- Neue Seiten können später ergänzt und separat ausgelesen werden.
- Ergebnisse mehrerer Seiten werden zusammengeführt und dedupliziert.

## Datenschutz / Verarbeitung

Die Importseiten werden für den Prototyp im Browser gehalten und einzeln an die bestehende `vocabRushApi`-Erkennung geschickt. Das bestehende Backend speichert das Foto nicht als Vokabelset; gespeichert wird lokal erst die vom Nutzer geprüfte strukturierte Vokabelliste.
