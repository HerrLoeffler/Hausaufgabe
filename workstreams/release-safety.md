# Release-Sicherung / Design-Übergabe

Auftrag 01.10.2026: Design-Chat prüfen, wichtige Lücken schließen und eine stabile Referenz/Backup-Strategie schaffen.

Design-Übergabe gelesen und mit main sowie erfolgreichem Preview-Lauf 36878009106 abgeglichen. Dashboard-/Token-Arbeit ist bereits integriert bei 74eb2ec08e81315875abfc4b1ae052d9f78797eb. Keine zweite konkurrierende UI-Schicht aufgesetzt. Visuelle Abnahme, manuelle Tutorialabgabe und Security-Gates bleiben offen.

Wichtige Korrektur am Plan: Accessibility und Responsive-Verhalten gehören in jeden Screen, nicht erst in die letzte Polish-Phase. Tutorial nur schrittweise anpassen; kein kompletter Neubau vor Behebung der manuellen Abgabe. Crew-Assets bedarfsgetrieben, keine Hunderte Posen ohne konkrete Einsatzstellen.

Implementierung: validiertes Hosting-Snapshot-Archiv und automatischer GitHub-Prerelease-Workflow, keine neuen Firebase-Projekte und kein Production-Deploy. Siehe docs/releases/ENVIRONMENTS.md. Aufgabe betrifft nur tools/automation/archive.py, zugehörige Tests, release-archive.yml und eigene Dokumentation.

Nächster Schritt: erfolgreichen ersten Archivlauf mit dem bestehenden Design-Preview durchführen, Download/Restore der statischen Dateien prüfen. Anschließend tatsächliche Live-Release-ID und vorhandene Daten-/Storage-Sicherung read-only inventarisieren. Eine dauerhafte Referenz-Seite benötigt bewusst isoliertes Backend.
