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

## Fortsetzung 18.10.2026 – freigegebene KI-Testkonfiguration

- Martin hat ausdrücklich die Wiederverwendung des bestehenden OpenAI-Schlüssels im Secret Manager von `gradecrew-staging-2026` bestätigt. Secret `OPENAI_API_KEY` dort angelegt, Version gespeichert und anschließend bytegenau über SHA-256 im Prozessspeicher verglichen. Kein Schlüsselwert in Ausgabe, Git oder lokaler Env-Datei; Quellsecret unverändert. Kein bezahlter OpenAI-Aufruf erfolgt.
- Cloud-OAuth-Zugriff funktionierte bei diesem Vorgang wieder; keine erneute Anmeldung als Voraussetzung behaupten, ohne aktuellen Fehlernachweis.
- GitHub-CI des aktuellen Featurebaums `11b7942eaf8e6dadd4b1646a591e9d36d7ab4ddf`: `AI Staging Checks` Lauf `39078313773` abgeschlossen, `success`. Dies ersetzt den zuvor roten CI-Nachweis nach Bootstrapfixture-Reparatur; ist kein Hosting-/App-Releasebeleg.
- Assessment-Bereitstellung erneut ausschließlich gegen `gradecrew-staging-2026` gestartet (`/private/tmp/gc-new-staging-assessment-deploy3.log`); Upload erfolgreich und sieben Functions in Erstellung. Endzustand separat nachtragen. Kein Live-Deploy.
- Native Quellen auf eigenem Branch `feature/native-live-staging-20261018` aus `492bcb3` gesichert; bis hier noch keine Native-Änderung, kein neuer TestFlight-Build.

### Cloud-Nachweise nach Secret-Freigabe

- Assessment-Versuch3: sechs HTTP-Functions erfolgreich erstellt; Eventarc-Bereinigungs-Trigger scheiterte zunächst an Googles frisch provisioniertem Service Agent. Kein Quell-/Livefehler. Wiederholung nach Propagation mit Versuch4 erfolgreich: alle sieben Assessment-Functions, `Deploy complete!`, Exit0.
- KI-/Feedback-Codebase: 30 Functions erfolgreich angelegt. Nachfolgendes Cloudinventar zeigte gemeinsam mit sechs Assessment-Functions 36/36 ACTIVE, darunter 14 Bindungen an `OPENAI_API_KEY`. CLI meldete danach wegen fehlender Build-Container-Aufbewahrungsregel Exit1; deshalb nicht als vollständig grünen CLI-Lauf ausgeben. Reguläre Artifact-Registry-Regel im neuen Testprojekt anschließend erfolgreich auf 30 Tage eingerichtet (nur Build-Container, keine Konten/Antworten/Dateien).
- Fünf echte negative HTTP-Smokes auf der neuen Testumgebung bestanden: Assessment-Info/Start/Abgabe ohne Pflichtangaben → Callable INVALID_ARGUMENT/400; Feedback und Quick Remy ohne Anmeldung → UNAUTHENTICATED/401. Keine echten Abgaben oder kostenpflichtigen KI-Aufrufe. Dies ersetzt keinen positiven End-to-End-Test.
- Öffentlicher Live-Kandidatenstand erneut gelesen: `hausaufgabe-staging.web.app/release.json` liefert unverändert `2.3.1-gc40`, Commit `21c919bfa41cb7d030d93e719789d0813bdc78e7`. Altprojekt-URL liefert kein release.json (404); daraus keinen neuen Altprojekt-Releasezustand ableiten.
- Nutzerklärung: `gradecrew-staging-2026` ist ausschließlich die neue interne Testumgebung. Schuladresse bleibt `https://hausaufgabe-staging.web.app/`. Kein Umzug bestehender Lehrkräfte auf die neue Testadresse. Vor Schulfreigabe fehlen weiterhin positive Kernabläufe, Automationsumstellung, native Bindung und unabhängige Freigabe.
- Abschließendes Inventar: 37/37 Functions ACTIVE einschließlich `cleanupAssessmentPrivateOnQuizDelete`. Neue Test-Website veröffentlicht, Version `2.3.1-gc41`, Quellcommit `bc4e492f`; Deployment Exit0 und Remote-Assetvergleich vollständig erfolgreich (`Remote assets match`). Ausschließlich neue Testadresse geändert. Dieser Nachweis ist keine Live-/App-/Geräteabnahme.

## Schulfreigabe – 18.10., nächste konkrete Abnahmestufe

- Fiktiver Test `GCQA261018` ausschließlich in der neuen Testumgebung: 30/30 parallele Starts, 90/90 Statusabfragen, 30/30 Abgaben und unabhängige Receipts. Parallele Doppelabgaben idempotent. Separater echter Fünf-Minuten-Durchlauf erfolgreich nach Frist automatisch abgegeben und bestätigt. Keine echte Schüler-/Live-Abgabe erzeugt.
- Native Teilstand `24f4300` auf eigenem Branch: beide Schul-Apps erfolgreich unsigniert gebaut, lokale Tests und vier echte SwiftUI-/WebKit-Controller-Tests grün. Zwei unabhängige Read-only-Reviews A/B fanden denselben YAML-Faltungsfehler im Teacher-TestFlight-Gate; Reparatur auf Native-Branch folgt vor Push. Noch kein neuer TestFlight-Upload oder physischer Test.
- Martin hat ausdrücklich die Freigabe nach dauerhafter lokaler Abgabe mit späterer Synchronisierung gewählt. Ein offener Abgabestand blockiert weitere App-Prüfungsstarts bis zum Receipt. Token/Antworten werden bis dahin nicht gelöscht. Die jetzige Servererweiterung akzeptiert nur explizite Wiederherstellung bereits gestarteter tokenauthentifizierter Versuche, höchstens sieben Tage nach serverseitigem Start; späte/andere Runden oder gespeicherter Ersatzsnapshot werden zur Lehrkraft-Prüfung markiert, ohne endgültige Note/Lösungsfreigabe. Gelöschte/gehaltene Tests bleiben gesperrt. Clientzeit begründet keine Pünktlichkeit.
- Backendregression zuerst rot (fehlende Recoverypolicy), danach 87/87 Assessment-Unit-Tests und 8/8 echte Emulator-Transaktionsfälle grün. Erste Emulatorausführung verglich versehentlich die pro Anfrage neue Diagnose-ID mit; korrigierter Test vergleicht unveränderlichen Receipt und genau eine gespeicherte Abgabe, keine Lockerung der Idempotenz.
- Neue Lehreransicht kennzeichnet die Nachübertragung vor/nach manueller Bewertung. Echter Rendererfunktionen-Test grün; Browser-UI 24/24, Functions 265/265, Laufzeit-/Deployment-/Bootstraptests 16/16 grün. Noch kein Live-Deploy dieses Stands.
- main-Controller-Umstellung in `/private/tmp/gc-school-release-control` vorbereitet: Live-Projekt und alte WIF-Variablen vollständig aus den Staging-Deployzielen entfernt, getrennte neue WIF-Namen blockieren ohne neue Identitäten. 17 Controller-/Manifest-/Berechtigungstests grün. Keine main-Änderung/PR/Integration behauptet; unabhängige Prüfung steht aus.
- Gesamtprüfung A/B auf `dd15678` + Native `9d67196` fand fehlende Server-Capability im echten Info-Handler. Reparaturversuch2: `getAssessmentInfo` kündigt implementierte Recovery-Version1 an. Neue echte Handler-/Emulatorregression belegt die Antwort und dass Preflight keinen Versuch erzeugt. Danach 9/9 Transaktionsprüfungen und 87/87 Unit-Tests grün. Vor Auslieferung diesen geprüften Serverstand verwenden.
