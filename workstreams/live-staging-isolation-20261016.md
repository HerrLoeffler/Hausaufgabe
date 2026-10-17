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

## Fortsetzung 17.10.2026

- Zwischenstand GitHub `e15b23f5e0764df20934dd5dee13cf169e5253b0`, lokaler identischer Baum `b01a023`, Baumhash `04922c27829623ce90a7d59b5e7aa1f5631ce642`.
- CI39020226199: Functions/Assessment/Emulatorgates bestanden; Browser-Bootstrapfixture scheiterte an fehlendem VM-Binding `installReviewMode`, nachdem Live-Feedback erstmals auch im Productionpfad initialisiert wird. Fixture verwendet jetzt das echte importierte Reviewmodul; 9/9 Bootstraptests lokal grün. Kein gefälschter Provider-/Reviewstub eingeführt.
- Breiter unkonfigurierter Root-Discovery-Lauf: 930/966 grün, 36 Fehler durch dasselbe Bootstrapfixture, gesperrte Loopbacklistener, fehlende Emulatorumgebung, ausführbares Load-Testskript und fehlendes VM-Flag. Dies ist kein grüner Gesamtnachweis. Konfigurierte Projekt-/CI-Kommandos bleiben maßgeblich; keine Live-Lasttests aus diesem Lauf ausgeführt.
- Verbleibende lokale Test-/Diagnosewerkzeuge und staging-only PostHog-Gate auf das neue Testprojekt ausgerichtet. Live-PostHog erhält durch diese Umstellung keine versehentliche neue Staging-Exporterlaubnis.
- Restore tatsächlich durchgeführt: abgeschlossenen Managed-Export ausschließlich lokal in `demo-gradecrew-live-restore` auf `127.0.0.1:8095` importiert; 40 Profile und 115 Tests wieder lesbar. CLI danach erfolgreich beendet und Emulator gestoppt. Keine Cloud-Quelldaten überschrieben. Keine vollständige Disaster-Recovery-/Auth-Neuimportgarantie behauptet.
- Neue Test-Firestore-/Storage-Regeln erfolgreich veröffentlicht. Assessment-/Index-Bereitstellung läuft separat; erster Aufruf wegen fehlendem Node im Unterprozess-PATH vor Upload abgebrochen, korrigierter Aufruf gestartet. Kein Live-Deploy.
- Connector als überprüfbares Overlay unter `integrations/gradecrew-central/` vorbereitet. 17/17 lokale Tests einschließlich echter stdio-/Loopbackabläufe bestanden; im Sandboxlauf erwartete EPERM statt Netzwerkzugriff, außerhalb mit lokalen Testservern grün. Live-Zugang Admin-only, eigener Speicher, minimaler paginierter Lehrkräfteabruf, untrusted Markierung und keine Schreib-/Umsetzungsroute. Noch nicht installiert/neugeladen, kein echter privater Abruf.
- Vor KI-Konfiguration der neuen Tests ist die ausdrückliche Entscheidung über Wiederverwendung des vorhandenen OpenAI-Secrets im neuen Secret Manager angefragt und noch offen. Nur Secret-Metadaten gelesen (`ENABLED`), keinen Schlüsselwert gelesen oder kopiert, keinen bezahlten Aufruf gestartet.
- main-/PR-Abgleich: aktuelle offene Games-/Pedagogy-/Coco-PRs bleiben erhalten, keine parallele Promotion-PR gefunden. Development-Status-Lauf38893946072 erfolgreich; main-Automatik ist noch fest ans heutige Live-Kandidatenprojekt gebunden. Ihre Umstellung ist ein zwingender nächster Schritt vor Integration/Promotion, keine reine Benennungsfrage.

Relevanter Assurance-Scope: SEC04/06/07/08/11/14/17 und PRIV07/17/20 für Rollen, getrennte Datenumgebungen, private Sicherung und minimierten Adminabruf; Owner dieser beauftragte Fachchat. Lokale Rollen-/Scopeprüfungen und Sicherungs-Restore belegt; endgültige unabhängige Abnahme und Live-Releasebezug offen. Keine pauschale Freigabe aller 40 Kontrollen oder Rechtszertifizierung.
