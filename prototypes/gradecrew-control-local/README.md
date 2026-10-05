# GradeCrew Control – lokaler Prototyp

Task GC-BRAIN-01, Stand 06.10.2026. Lokale Bedienoberfläche ohne Modell-API-Aufrufe.

## Start

`Start GradeCrew.command` auf dem Mac doppelklicken (Terminal darf offen bleiben). Alternativ Node.js 22+ verwenden: `node server.mjs`, dann http://127.0.0.1:4318 öffnen. Der beigefügte Starter nutzt bevorzugt die vorhandene Codex-Node-Laufzeit, sonst installiertes Node. Keine Installation von Paketen erforderlich.

## Was funktioniert

- 50 Aufgaben aus einem bezeichneten GitHub-main-Snapshot, acht Themenbereiche, Suche und Filter.
- Fünf sichtbare Reifestufen mit allen sechs technischen Zuständen; ohne eindeutige Zuordnung unbekannt. Farben sind dokumentierte Stände, keine frische Live-Verifikation.
- Eigene lokale Aufgaben, Kommentare und bestätigte Auftragsentwürfe, auf Festplatte gespeichert.
- Lokale Modell-Empfehlung nach Aufgabentyp/Risiko; manuelle Modell-/Aufwandwahl vor Vorbereitung.
- Getrennte Abo-Entwicklung und Guardian/API-Prüfvorbereitung. Guardian-Policy und vorhandene API-Workflows bleiben unverändert.
- Übergabetext kopieren/herunterladen und lokale Daten als JSON exportieren.
- Ausgewählte DeepSWE-Messwerte mit genauer Modellversion, Aufwand, Datum und Quelle; Artificial Analysis und offizielle Modellwahl verlinkt.

## Bewusste Grenze

Kein automatischer Chatstart, Modellwechsel, KI-Aufruf, Ergebnisrückkanal, Live-Import, Screenshot-Upload oder Deployment. Der Status einer gespeicherten Aufgabe lautet „vorbereitet“, niemals „läuft“. Die Übergabe wird im gewünschten Work-/Codex-Chat verwendet. Eine Auswahl in dieser App verändert dessen Modell nicht. Mac-unabhängige Arbeit braucht eine spätere Cloud-/Chat-Anbindung.

Keine Kostenvorhersage aus Benchmark-Dollarwerten: diese sind keine Pro-Abrechnung. Die Empfehlung ist eine transparente Heuristik, kein gemessener GradeCrew-Modellvergleich. Neuere/veränderte Quellen werden noch nicht automatisch geladen. Acht Themenbereiche sind redaktionelle Zuordnungen und noch kein vollwertiges Projektinventar aller Chats.

## Daten und Zugriff

Bindet nur an 127.0.0.1. Host-, Origin- und Sitzungstokenprüfung für Schreibzugriffe. Keine externen Skripte, Fonts oder Analytics. Eigene Kommentare/Entwürfe unter `.local/state.json` (nicht im Git). Der Export enthält diese Texte: privat behandeln. Kein Mehrbenutzerbetrieb, kein Cloud-Backup; JSON-Export kann archiviert werden. Automatischer Import/Restore aus Exportdateien ist noch nicht implementiert.

## Testen

`node --test test/*.test.mjs` prüft echte lokale Speicherung, Wiederaufnahme nach Neustart, doppelte IDs/konfliktierende Aufträge, ungültige Eingaben, Fremd-Origin und die Grenze zum Dispatch. Dafür muss das Öffnen eines Loopback-Ports erlaubt sein.

## Nächster Schritt

Eine echte Abo-Chat-Brücke im konkreten Client prüfen: Nutzerklick -> exakt ein Auftrag mit gewähltem Modell -> tatsächlicher Startnachweis -> Ergebnis zur selben Task-ID. Bestehende Prüf-/Review-Gates erhalten. Vorher keine automatische Ausführung behaupten.
