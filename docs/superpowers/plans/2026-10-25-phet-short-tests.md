# Implementierungsplan: PhET-inspirierte Kurztests

Task GC-EXTENDED-QUESTION-TYPES-01, Nutzerauftrag 25.10.2026: vorhandene Aufgaben zusammenführen und mit echter KI für schnelle Leistungsnachweise erproben.

Der bestehende visuelle KI-Weg ist bereits implementiert. Der aktuelle Auftrag autorisiert diese kleine additive Erweiterung; ein neues Designinterview ist nicht nötig.

1. Vorhandenen Primary Branch PR296 und zwölf V2-Formate lesen; Überschneidung mit Fachchat „Erweiterte Aufgabentypen“ auf zwei Zeilen im Autorenprompt begrenzen.
2. Acht eigene opt-in Profile ergänzen. Bestehende Requestfelder und Renderer verwenden. Keine neuen Auth-/Bewertungs-/Schülerverträge.
3. Handgerechnete Referenzen und tatsächliche Daten-/Bewertungsprüfungen zuerst sichern. Fehler bei alternativen richtigen Antworten vor Übergabe beheben.
4. Patch auf eigenem Related Branch und Draft-PR gegen den vorhandenen Primary Branch sichern; keine Änderung seines Heads oder der Schul-Live-Version.
5. Einen neuen Vierer-Bruchtest durch bestehenden Remy-/Emmi-/Abgabeweg durchführen, sobald dessen geschützte Testanmeldung zugänglich ist. Ohne Providerjob und Serverbeleg keine E2E-Erfolgsaussage.

Ergebnisdetails und Blocker: `workstreams/phet-short-tests-20261025.md`.

