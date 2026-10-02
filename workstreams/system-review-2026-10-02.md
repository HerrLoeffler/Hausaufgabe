# GC-ARCH-AUDIT-01 – Gesamtprüfung und Fortsetzung

Stand 02.10.2026. Keine Production-Freigabe.

## Gesichert vor dieser Fortsetzung
PR #26 (`4ba8038`) enthält den getesteten automatischen Router, getrennte Budgets, Transaktionen, Signaturprüfung und Kostenstatistik. Produktcode `c5dcc4d`, kompletter CI-/Emulatorlauf `36975168993` grün. PR #27 (`a521ec9`) schützt Escape-Tutor vor Doppelaufrufen/veraltetem Cache; 6 Tests und Games-CI `36974980982` grün. Beide waren bisher nicht im zentralen Register nachgetragen.

## Frisch geprüfte Veränderungen
- Gateway `integration/ai-gateway-staging@46b21ff4`: Workflow `36999999589` hat Verifikation und echten Deploy samt Candidate-Smokes, Promotion und Receipt erfolgreich durchgeführt. Frühere Übergabe „noch nicht deployed“ ist überholt. Automatische Modellauswahl bleibt deaktiviert; bestehende Firebase-Generierung ist separat.
- App `ac23cb9b`: neue Remy-Strukturierung, Brand, Kurzlogin und Admin-Accountarbeiten vorhanden. Aktuell läuft dessen Gesamt-CI; keinen alten Deploybeleg diesem Head zuschreiben. Remy-Batch `18e30d0d` separat nachweislich deployed.
- Escape `e8d75385`: inzwischen v0.6 mit Shared-Crew-Assets, Lehrer-first, Remy-Erstellung und Sprache; belegter Previewlauf `36995185868` auf `f38338dc`. Standalone hat bewusst keine echte Generator-Bridge mehr: Lab-Vorschau ändert nur Profil, Beispielaufgaben bleiben. Hauptproduktanbindung und echtes Generator-E2E offen.
- Main-Handoff-CI `36994507849` scheitert an fehlendem `automation.agent_dispatch`. Das Pflichtfeld wird mit konservativem Status wiederhergestellt; keine Worker-Aktivierung behaupten.

## Neue Nutzerunterlagen
Remy-Beispiel soll Thema/Wünsche semantisch trennen. Bereits auf App umgesetzt; jetzt Randfälle überprüfen statt Parallelparser bauen. Logo-Anhang fordert klare G/C-Lesbarkeit und vielfältige Entwürfe; aktuelle zentrale Brand-Architektur erhalten, keine neue Logoauswahl aus fehlenden Referenzbildern ableiten.

## Laufende Prüfung / nächster Schritt
Aktuelle Provider-/Kostenverträge, Escape-Generator und Remy-Parser mit gezielten Fehlerfällen testen. Änderungen je Bereich auf eigenem Branch vom frischen Zielstand sichern; neue Crew-/Brand-Arbeit erhalten. Vor Integration aktuelle Branchspitze erneut lesen. Ergebnisse und Restpunkte hier und in TODO ergänzen.

## Unveränderte offene Release-Gates
Security-Cutover/deployte Regeln, ungeklärter 30-Teilnehmer-Fehler, manuelle Tutorialabgabe in iPad-App, reale Geräteabnahme und vollständiger Restore. Hosting-Archiv ersetzt keinen Datenbank-/Auth-/Upload-Restore. Kein fachlich bewiesenes 99,99-%-Modellniveau aus Unit-Tests ableiten.

