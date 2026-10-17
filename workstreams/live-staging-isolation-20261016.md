# Live/Staging-Umstellung 16.10.2026

Plan: `docs/superpowers/plans/2026-10-16-live-staging-isolation.md`.

## Autorisierung und Ausgangspunkt

Martin beauftragt ausdrücklich die Umstellung der bisherigen Staging-Umgebung zu Live ohne Datenverlust, getrennte Tests, App-Anpassung und gespeichertes Lehrkräfte-ET mit lesendem Chat-Abruf. Bestehende öffentliche URL bleibt; keine Domain vorhanden.

Ausgangscode gc40 `21c919bfa41cb7d030d93e719789d0813bdc78e7`, nachfolgender lokaler Commit nur Release-Nachweis. Bestehende isolierte Worktree wiederverwendet, Featurebranch `feature/live-staging-isolation-20261016`.

Ruling: Die konkrete Umsetzung ist im Chat bereits ausdrücklich beauftragt; Spec und Plan dokumentieren diese Zustimmung, statt dieselbe Zustimmung erneut abzufragen. Keine pauschale Native-Branch-Zusammenführung: dessen Webstand weicht um Hunderte Dateien ab.

## Ist-Nachweis

- Lesendes Cloudinventar 16.10.: Live-Kandidat 40 Profil-Dokumente und 115 Tests, Altbestand 18/44. Profilzahlen sind keine Authentication-Kontozahlen.
- Beide Datenbanken `eur3`, Löschschutz und PITR bisher aus.
- Bisherige Preview-Kanäle teilen Live-Daten und sind keine isolierten Tests.
- Aktueller lokaler GradeCrew-Central-Connector verbietet Production im Lesevertrag. Vor Live-Abruf muss sein Vertrag ausdrücklich geändert werden; bestehendes Werkzeug nicht heimlich verwenden.

## Fortschritt

- [x] Auftrag und Datenbindung dokumentiert, unveränderten Ausgangsstand geprüft.
- [ ] Task 1 Sicherungen/neue Cloud-Testumgebung.
- [ ] Task 2 Build-/Deploymentgrenzen.
- [ ] Task 3 Lehrkräftefeedback.
- [ ] Task 4 Chat-Abruf.
- [ ] Task 5 Apps.
- [ ] Task 6 Prüfung/Rollout.

## Checkpoint nach Unterbrechung

Taskfamilien: `GC-RELEASE-06` (Promotion), `GC-RESTORE-01` (Sicherung), vorhandene ET-/BugOps- und Native-App-Arbeit. Dieser Chat führt den konkret beauftragten Fachumfang aus; keine Zentralenübernahme. Angeforderter laufender Modell-/Aufwandwert nicht separat vorgegeben, tatsächliche Runtimewerte hier nicht verlässlich abrufbar (`unknown`); keine Modellumschaltung behauptet.

Cloud: `gradecrew-staging-2026` angelegt, Projektnummer `840345136563`, bestehendem Abrechnungskonto zugeordnet. Firebase aktiviert; neue Firestore `(default)` in `eur3`, Storage `EUROPE-WEST1`, eigene Hosting-Site und eigene Web-App. Auth E-Mail/Passwort aktiviert, nur eigene Hosting-Domains und localhost freigegeben. Noch keine App-/Functions-/Rules-Veröffentlichung in dieses neue Projekt.

Sicherung: 41 Authentication-Konten einschließlich Hashes und vorhandener Hashkonfiguration privat gespeichert. Firestore-Export in privaten EU-Bucket im bestehenden Projekt abgeschlossen: 3.683 Dokumente, 38 Exportdateien heruntergeladen und Längen/MD5 geprüft. 55 Storageobjekte (4.440.874 Bytes) in denselben privaten Sicherungsbucket kopiert, Größe und CRC32C aller Kopien abgeglichen. Lokale Sicherung außerhalb Git, Dateirechte 0600/Verzeichnis 0700. Noch kein logischer Restore-Nachweis. Der erste CLI-Aufruf scheiterte am Auth-Netzwerkpfad, nicht an einer bestätigten ungültigen Google-Anmeldung; gültiger bestehender OAuth-Zugang funktionierte über offizielle APIs. Eine automatische Freigabeprüfung lehnte die konkrete Storagekopie zunächst ab; Martin bestätigte das private Sicherungsziel danach ausdrücklich im Chat. Erst danach wurde die Kopie erfolgreich ausgeführt. Keine Quelldatei/Konto/Test gelöscht.

Code nur lokal: zentrale Umgebungskonfiguration, beide echten Build-/Manifestziele geprüft, .firebaserc und lokale Webconfig auf getrennte Tests, alte unsichere Deploy-Einstiege gesperrt/retargetet. Öffentliches localhost-ET entfernt; kompaktes Lehrkräftefeedback mit Pending-Freigabe, Admin-only-Prüf-/Freigabeaktionen, serverseitige Live/Test-Bindung und neuer paginierter Adminabruf `listTeacherFeedback`.

Belege lokal Node22: 265/265 Functions, 121/121 Browser, 11/11 Ziel-/Build-/Deploy-/ET-Verträge; ESLint grün. Neue Feedbackregression zuerst rot (fehlender ungegranteter Lehrkräftezugang/kompakter Schalter), danach grün. Umgebungs-/Build-/Deployregressionen zuerst rot, danach grün. Noch keine neue GitHub-CI, Integration, Hosting-/Functions-Veröffentlichung oder App-TestFlight.

Nächster Schritt: gesicherten Zwischenstand pushen, dann Chat-Connector und native Konfiguration ergänzen; unabhängige Prüfung und geordneter Rollout erst nach den fehlenden Sicherungs-/Isolationsnachweisen.
