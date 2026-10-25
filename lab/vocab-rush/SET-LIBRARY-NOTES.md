# Vocab Rush – Set-Bibliothek

## Ziel
Eigene Vokabelsets bleiben wiederverwendbar und können einzeln oder kombiniert gespielt werden.

## Verhalten
- Sets können erstellt, umbenannt, bearbeitet, dupliziert und gelöscht werden.
- Mehrere Sets können gleichzeitig ausgewählt werden, z. B. Unit 1 + Unit 2 oder alle Sets.
- Beim Kombinieren werden identische englische Einträge zusammengeführt.
- Die Bibliothek liegt im Lab-Prototyp weiterhin lokal im Browser (`localStorage`).
- Für die spätere GradeCrew-Integration sollen Sets an den Lehreraccount gebunden in Firestore gespeichert werden.

## Import
- Mehrere JPG/PNG/WebP-Dateien können per Dateiauswahl oder Drag & Drop gesammelt werden.
- PDFs werden im Browser seitenweise gerendert und anschließend wie Bilder verarbeitet.
- Pro Importvorgang sind aktuell maximal 20 Seiten vorgesehen.
- Pro Seite kann vor der KI-Erkennung ein Ausschnitt festgelegt werden.
- Bereits verarbeitete Seiten bleiben erhalten; weitere Seiten werden ergänzt statt vorhandene Ergebnisse zu ersetzen.
- Vokabeln aus mehreren Seiten werden dedupliziert und in einer gemeinsamen Prüfliste zusammengeführt.

## Lernen
- Falsche Antworten im Übungsmodus erhalten einen großen, mindestens fünf Sekunden sichtbaren **MERKEN**-Hinweis.
- Bei eigenen Vokabelsets kann optional **„Nach Fehler selbst schreiben“** aktiviert werden.
- Ist diese Option aktiv, muss die englische Vokabel einmal korrekt eingegeben werden, bevor die Lernüberlagerung geschlossen werden kann.
- Highscore und Live bleiben schnell und werden nicht durch diese Lernüberlagerung verändert.

## Produktprinzip
Vokabelinhalt und Spielmodus bleiben getrennt: Dasselbe Set kann in Üben und Live verwendet werden; ein späterer Set-spezifischer Highscore kann ergänzt werden.
