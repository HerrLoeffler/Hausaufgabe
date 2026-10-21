# GC-VOICE-03 – Remy Parser V3 und Kontextkorrektur

02.10.2026. Basis `feature/gradecrew-app-integration@ac23cb9bcb4ae04de6a97e365da53394e1fdce41`. Eigener Fix auf dem bereits integrierten Parser V2, keine parallele Parserarchitektur.

## Reproduziert und behoben
- „Nicht leicht, sondern schwer“ wählte leicht: Negation wird jetzt als Wunsch erhalten, verworfene Schwierigkeit nicht gesetzt.
- „Die ersten Aufgaben leicht“ änderte den ganzen Test: jetzt Reihenfolgewunsch, ausdrücklich genannte globale mittlere Schwierigkeit bleibt möglich.
- „keine Freitextaufgaben“ wurde nicht erkannt: zusammengesetzte Typnamen und Ausschlusslisten berücksichtigt; nicht gleichzeitig als erlaubter Typ setzen.
- „Thema Prozentrechnung, mit Rabatt und Mehrwertsteuer“ verlor den Inhalt nach dem Komma: fachliche Ergänzungen bleiben erhalten.
- „viele Aufgaben“ bleibt Wunsch ohne erfundene Anzahl und ohne Themenverschmutzung.
- Leerer/null/boolscher numerischer Kontext wurde serverseitig in eine Aufgabe/0,5 Punkte verwandelt: bleibt jetzt unbekannt.
- Telemetrie importiert die Parser-Version direkt aus dem Core statt einer abweichenden Kopie; keine zusätzlichen Inhalte erhoben.

## Prüfungen und Grenzen
19 Browser-Core-Tests, 8 Server-Contract-Tests lokal grün. Bestehende Telemetrie-Vertragstests separat ausgeführt. CI und realer Geräte-/Mikrofontest für diesen Commit noch offen. Lokale Regeln sind bewusst begrenzt; keine Behauptung vollständigen Sprachverständnisses. Echter Browser-STT-Pfad bleibt vorhanden. Kein Production-Deploy.

Nächster Schritt: vorhandene Crew-/Staging-CI prüfen, gegen aktuellen App-Head integrieren und im Preview die fünf Beispiele sowie ein echtes Diktat prüfen.

