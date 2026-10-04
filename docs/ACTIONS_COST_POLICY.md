# Actions-Kostenpolitik – 04.10.2026

Auftrag GC-ACTIONS-COST-01: Martin hat die vorübergehende Veröffentlichung des
Repositories und die folgenden Workflow-Optimierungen freigegeben. Die
Sichtbarkeit wird über GitHub Settings geändert; dieser Code ändert sie nicht.
Der angezeigte Kontingent-Reset ist 01.11.2026, nicht Montag, 05.10.2026.

Fortsetzung: Martin hat das Repository am 04.10.2026 tatsächlich auf public
gestellt; frische GitHub-Metadaten bestätigen dies und Standardrunner starten.
Die Optimierungen liegen in PR #88 (Kontrollplane), #89 (Visual-Branch) und
#90 (Web-Integration). Neue Remote-Nachweise nach Integration separat lesen.

## Implementierte Regeln

| Bereich | Verhalten nach Integration |
|---|---|
| Handoff | Push-Prüfung auf vier gemeinsamen Branches; Feature-Arbeit über PR. Veraltete Prüfungen derselben Ereignis-/PR-Gruppe abbrechen. |
| Development Status | Ereignisse weiterhin prüfen; planmäßiger Auffanglauf alle sechs Stunden. |
| Release Control / Stage Guardian | Auffanglauf alle sechs Stunden; übersprungene Upstream-Läufe starten keinen Prüfjob. Erfolg, Fehler und Abbruch bleiben relevant. |
| Amazonas Visual Preview | Kein automatischer Push-Deploy; Test und Preview nur durch bewussten manuellen Start. |
| Web AI Staging Checks | Reine Markdown-, docs/- und workstreams/-Pushes überspringen. Änderungen an Code, Rules, Dependencies oder Workflows prüfen wie bisher. |

Nicht jeder Commit im gesamten Repository kostet damit null Minuten. Andere
Workflows und Branchkopien besitzen weiterhin eigene Trigger. Keine pauschale
Einsparquote ohne neue Abrechnungsdaten behaupten. Die 1.903 inventarisierten
Runs vom 01.–04.10. UTC enthalten auch übersprungene/abgebrochene/blockierte
Runs und sind kein Minutenwert.

## Bewusster Amazonas-Meilenstein

1. Den Kontroll-PR nach main und den Preview-PR in den Visual-Branch integrieren.
2. Unter Actions den Workflow **Escape Expedition Visual Masterpiece Preview**
   öffnen und **Run workflow**, Branch **main**, auswählen.
3. Der Hauptworkflow pinnt den aktuellen SHA von
   `prototype/escape-expedition-visual-masterpiece-v1`, prüft Syntax/Verträge,
   baut den isolierten Preview und verweigert einen inzwischen veralteten SHA.
4. Ziel ist ausschließlich `hausaufgabe-staging`, Kanal `gradecrew-escape-visual`.
   Kein Production-, Functions- oder Rules-Deploy. Ein fehlender Hosting-Schlüssel
   beendet den Lauf mit einem Fehler.

Das ist ein deployender manueller Auftrag, kein billiger Syntax-only-Test.
Bis zur Integration gibt es weder einen aktiven neuen Trigger noch einen
bestätigten neuen Preview. Die Registrierung auf main macht den manuellen
Workflow in GitHubs Oberfläche verfügbar.

## Nachweise und nächste Messung

Lokal: 90 Automation-Tests, 18 Release-Control-Tests und 54 zusätzliche
YAML-/Trigger-/Ereignis-/Scope-Prüfungen bestanden. Die App-Testkörper wurden
erhalten; sie wurden für diese Konfigurationsänderung nicht lokal ausgeführt.
Neue Actions-CI war beim Vorbereiten durch den Runner-Abrechnungsblocker gesperrt.

Nach der Veröffentlichung die exakten neuen PR-SHAs prüfen und integrieren;
anschließend sieben Tage lang tatsächliche Runner-Minuten je Workflow erfassen.
Bei späterer Rückkehr zu privat bleibt die Kostenpolitik bestehen. Veröffentlichte
Kopien und Forks werden dadurch nicht zurückgeholt.

Überschneidungen: PR #86 verändert ebenfalls Stage Guardian/Koordination;
dessen PR-Leseberechtigungen und Recovery-Logik erhalten. PR #51 erweitert die
Web-Merge-Result-CI; dessen Testschritte und PR-Gate erhalten. PR #83 bleibt
der Produkt-Preview-PR; diese Änderung betrifft dessen Startpolitik.
