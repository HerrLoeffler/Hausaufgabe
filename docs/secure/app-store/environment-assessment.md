# Firebase Umgebungen und möglicher Produktivwechsel

Stand 16. Oktober 2026. Die Bestandsaufnahme war ausschließlich lesend: Projektkonfigurationen, Dienste und aggregierte Dokumentanzahlen. Keine Antworten, Namen, E-Mails, Zugangstokens oder einzelnen Nutzerprofile wurden ausgegeben. Die Dokumentanzahlen sind weder aktive Personen noch ausschließlich Testdaten.

## Aktueller Bestand

| Merkmal | Heutiges Staging | Bisherige Production |
| --- | --- | --- |
| Projekt-ID | `hausaufgabe-staging` | `hausaufgabe-40294` |
| Anzeigename | Hausaufgabe Staging | Hausaufgabe |
| Projektzustand | ACTIVE | ACTIVE |
| Firestore | Standard, Native, eur3 | Standard, Native, eur3 |
| Dokumente in `users` | 40 | 18 |
| Dokumente in `quizzes` | 114 | 44 |
| Sichtbare Functions in europe-west1 | 58 | 11 |
| Hosting-Sites | `hausaufgabe-staging` | `hausaufgabe`, `hausaufgabe-40294` |
| Benutzerdefinierte Hosting-Domains laut API | keine | keine |
| Firestore-Löschschutz | deaktiviert | deaktiviert |
| Firestore-PITR | deaktiviert | deaktiviert |

Die Zahl der `users`-Dokumente ist keine Zählung der Firebase-Authentication-Konten. Die bestehende externe DNS-/Domainlandschaft, Backups außerhalb von PITR, Storage-Inhalte und sämtliche Verbraucher des alten Projekts sind mit dieser Bestandsaufnahme noch nicht vollständig inventarisiert.

Der öffentliche Staging-Release-Nachweis meldet `2.3.1-gc39`, Commit `8f8697901f8c1aea89897be855ca2872c82d0f2b`. Der Projektstatus auf main bezeichnet weiterhin `hausaufgabe-40294` als Production. Das sind zwei unterschiedliche Nachweise: aktueller Hosting-Stand und dokumentierte Zuständigkeitsgrenze.

## Kann Staging die produktive Umgebung werden

Ja. Die Rolle einer Umgebung ist eine Betriebsentscheidung. Die Projekt-ID muss dafür nicht „production“ heißen. Sie ist nach der Provisionierung auch nicht umbenennbar; der interne Anzeigename lässt sich ändern. Eine eigene öffentliche Domain kann einen verständlichen Produktnamen zeigen.

Das bewirkt aber keine Datenmigration, keine neue Sicherheitsgrenze und keine automatische Umstellung der bestehenden Clients. Hosting-Sites und Preview-Kanäle desselben Projekts teilen dessen Firebase-Dienste. Eine zweite Domain oder ein Preview-Kanal ist deshalb kein isoliertes Staging.

Quellen: [Firebase-Projektkennungen](https://firebase.google.com/docs/projects/learn-more), [getrennte Umgebungen statt gemeinsamer Hosting-Sites](https://firebase.google.com/docs/hosting/multisites).

## Drei Wege

1. **Heutiges Staging kontrolliert produktiv machen, frische getrennte Testumgebung einrichten.** Das bewahrt zunächst die dort funktionierenden Tests, Konten und Dienste. Dafür müssen alle bisherigen Staging-Deployments und Testautomationen von diesem Projekt getrennt werden. Empfehlung, sofern der Nutzer den dortigen Datenbestand behalten möchte.
2. **Den geprüften Softwarestand in `hausaufgabe-40294` veröffentlichen.** Die Namen und bisherige Zuständigkeitsgrenze bleiben erhalten. Die aktuell 11 gegenüber 58 sichtbaren Functions zeigen aber, dass ein reiner Hosting-Upload den Stand nicht angleicht. Daten, Rollen, Konfigurationen und Dienste wären separat zu migrieren und zu prüfen.
3. **Ein neues, eindeutig benanntes produktives Projekt aufbauen.** Saubere neue Ausgangslage, aber die meisten Umstellungs- und Migrationsarbeiten. Kein unmittelbarer Vorteil, solange der getestete Staging-Bestand bewusst erhalten werden soll.

## Empfohlene Vorbereitung für Weg 1

1. Bestätigten Softwarestand und Datenbestand dokumentieren. Die 114 Tests nicht pauschal als wegwerfbare Fixtures behandeln. Aktuelle Konten und benötigte Testcodes erhalten.
2. Bestehende Nutzerprofile, Authentication-Konten, Tests, Abgaben und Storage-Inhalte beider Projekte sichern und einen Rücksicherungstest planen. Löschschutz, Backup/PITR, Kosten und Aufbewahrung bewusst konfigurieren. Die bisherige Production nicht löschen oder als Testdatenbank überschreiben.
3. Eine separate Entwicklungs-/Testumgebung bereitstellen. Neue Projekt-ID und Standort vor Erstellung festlegen. Testdaten ausschließlich synthetisch übernehmen; Schülerantworten nicht zum Testbestand kopieren.
4. CI-/Deploy-Ziele, Zugangsdaten, Skripte und Umgebungsprüfungen inventarisieren. Eine bisher als sicher geltende Staging-Automation darf nach der Umwidmung nicht unbeaufsichtigt in die produktive Datenbank schreiben. Neue Production-Deployments benötigen explizite Zielbindung und Freigabe.
5. Staging-spezifische Privilegien prüfen: Testkonten, Debug-Werkzeuge, Vorschau-Origins, KI-Ausnahmen, App-Bridge, CORS, Auth-Domains, Datenbank-/Storage-Regeln, Callable-Berechtigungen und Dienste mit festem `hausaufgabe-staging`-Schutz. Ein Namenssuffix ist kein Sicherheitsnachweis.
6. Öffentliche Domain, Support, Datenschutzerklärung und gegebenenfalls E-Mail-Absender festlegen. Aktuell wurden in den Hosting-Sites keine Custom Domains gefunden; daraus folgt nicht, dass weltweit keine externen Domains auf GradeCrew zeigen.
7. Teacher-Web, Teacher-App und Secure-App bewusst auf dieselbe freigegebene Umgebung binden. Bereits veröffentlichte App-Versionen und bestehende Links berücksichtigen. Testcodes dürfen nicht still in mehreren Projekten gesucht werden.
8. Einen kontrollierten Durchlauf mit fiktiven Daten und abschließend den freigegebenen schulischen Ablauf prüfen. Erst danach Umschalttermin und Rückweg festlegen.
9. `hausaufgabe-40294` zunächst als unveränderten Altbestand behalten. Erst nach geklärten Nutzern, Alt-Clients, vollständiger Sicherung und Aufbewahrung kann über Stilllegung oder eine spätere Testnutzung entschieden werden. Jede Löschung ist ein eigener Auftrag.

## Tatsächlicher Ausführungsstand

Kein Projekt wurde umbenannt, gelöscht, umgewidmet oder neu erstellt. Keine Domain, Datenbankregel, IAM-Rolle, Sicherungseinstellung oder Deployment-Automation wurde geändert. Die Umgebungsentscheidung ist vorbereitet, die Umschaltung nicht ausgeführt.
