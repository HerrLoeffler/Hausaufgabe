# GradeCrew – aktueller Projektstatus

Stand: 30.09.2026

Diese Datei ist die kompakte Übergabe für neue GradeCrew-Chats. Für Security-Details zusätzlich `SECURE_ASSESSMENT_AUDIT_2026-09-30.md` lesen.

## Gemeinsame Fortsetzung gc28 / App-Beta

Neue gemeinsame Webbasis: `feature/gradecrew-app-integration`.
Alle gc27-Module sowie Paralleltest und mobile Layout-Fixes vereint.
Bei der Integration gefunden: mobiles Layout überschrieb `.gcCoachContext`;
korrigiert und mit ausgeführtem DOM-Test gegen Tastaturhöhen geprüft.
Receipt-Prüfung bindet jede Testabgabe nun an die richtige Attempt-ID.
Lokale Suite: **141 Tests bestanden**. Vollständige CI noch separat festhalten.

App: **0.1.3 (6)** durch Run **36712213667** erfolgreich in App Store Connect
hochgeladen. 0.1.4 ermöglicht nun Staging-Preview-Auswahl im Beta-Menü;
Build-/Upload-Nachweis für 0.1.4 separat prüfen.
Normales Staging zeigt weiterhin gc21 / 4707c45 (erneut per Manifest gelesen).
Keine Aussage, dass gc28 bereits deployed oder physisch auf dem iPad geprüft sei.

**Nächster konkreter Weg: APP_INTEGRATION_RUNBOOK.md.**
Neues selbstbootstrappendes Skript: `deploy-app-integration-preview.sh --deploy`.
Veröffentlicht nur Hosting-Preview auf Staging, nutzt bereits deployte Functions.
Der 30er-Test ist ein Parallel-Smoke-Test; `fullGateEVerified` bleibt false.
Alle bisherigen offenen Security-Gates bleiben offen, Production unverändert.

## Aktuelle Fortsetzung: Diagnose und Tutorial gc27

Implementiert auf `feature/secure-assessment-v1`, noch nicht auf Firebase veröffentlicht:
- begrenzte technische Browser-Ablaufspur samt Release-Commit;
- Assessment-Serverkennungen und strukturierte Logs ohne Request-/Antwortdaten;
- Admin-Filter, Sortierung, Fehlergruppen, Diagnoseexport und Untersuchung pro Fehler;
- Admin-Audit mit je 200 Einträgen und Nachladen;
- Wünsche manuell bestätigen, langsamere Schreibanimation, Hilfe direkt bei der Aufgabe;
- Du-Frage auch im überschreibenden gc23-Modul wiederhergestellt;
- vier transparente Figurenatlanten mit einzeln geclippten Posen und sauberen Rändern.

**Einstieg für Diagnose und Codebereinigung: DIAGNOSTICS_GUIDE.md.**
Dort stehen Ablauf, Code-Landkarte, Ursache/Fix-Tabelle, Datenschutzgrenzen und Folgearbeit.
Lokaler Durchlauf: 121 Tests bestanden (Backend, Diagnose, Tour, Secure-Client, Assets).
Alle 24 Figurenposen auf hellem/dunklem Hintergrund visuell geprüft.
Code-Commit: `8fbc8cc9e486b8a823f5dca99bcb6c574d4c5f6f`.
GitHub Actions **#335 BESTANDEN**, einschließlich Functions-Tests, sicherem Backend,
Firestore-Regeltest im Emulator, Tutorial-/UI-Regressionen und Staging-Build.
Nachweis: https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36678893458
Die folgende Statusaktualisierung ändert nur dieses Dokument.
Keine Behauptung eines erfolgreichen Firebase-/iPhone-End-to-End-Tests für gc27.
Lokaler Chromium-Download scheiterte; DOM-Tests sind kein visueller Browsernachweis.
Offene Security-Gates C–G bleiben unverändert bestehen.

## Übernahmeprüfung vom 30.09.2026 – aktueller Zusatz

Der vorherige Stand `7eca11133eef6e16292ca085100c8d2a64922a5e` wurde unabhängig geprüft.
GitHub Actions #310 auf `c22455c` ist tatsächlich erfolgreich, einschließlich Rules-Emulator.
Die beiden folgenden Commits änderten nur Dokumentation. Grün bedeutete jedoch nicht fehlerfrei:
Die Lifecycle-Tests prüften überwiegend Quelltextmuster, nicht das ausgeführte Zusammenspiel.

Neu korrigiert und mit ausgeführten Handler-Tests abgesichert:
- Lösungen erst **nach** Ablauf der gesamten 90-Sekunden-Abgabe-Nachfrist; ohne Endzeit keine Freigabe.
- Unvoreingenommenes Mischen: Originalreihenfolge bleibt zufällig möglich. Ihr Ausschluss verriet bei zwei Elementen die Lösung durch Umkehrung.
- Doppelte Wortmarkierungen zählen nur einmal, auch bei manipulierten API-Antworten.
- Wiederholter Start eines bereits abgegebenen Attempts liefert den Receipt statt eines Fehlers wegen gelöschter Grading-Secrets.
- Vorläufige Punkte/Prozent/Note bei manueller Prüfung werden bereits serverseitig zurückgehalten; Renderer prüft ebenfalls direkt.

Lokale Prüfung: 36 Backend-Tests und 42 Secure-Client-/Rules-Quellvertragstests bestanden.
12 neue Backend-Verhaltenstests führen die echten Handler mit einem In-Memory-Admin-SDK-Adapter aus;
das ersetzt weder echte Firestore-Transaktionskonkurrenz noch einen Firebase-End-to-End-Test.
Neue Code-Baseline: `93dff9cccca087a4cdf40c2f3afe152b8c9f6cdd`.
GitHub Actions **#319 BESTANDEN**, einschließlich echtem Rules-Emulator,
Legacy-/Tutorial-Regressionen und Staging-Build.
Öffentliches Staging-Release unabhängig gelesen: `2.3.1-gc21`, Commit `4707c45`.
Alle **66/66 veröffentlichten Dateien** stimmen per SHA-256 mit `release.json` überein.
Der neue Security-Pfad wurde in diesem Audit nicht deployed. Firebase-Preview und
reale End-to-End-/Lasttests wurden nicht durchgeführt.

**Zusätzlicher Funktionsblocker korrigiert:** Der laufende Schüler-Renderer fragt jetzt
alle fünf Sekunden mit Attempt-Token einen schlanken Status ohne Aufgaben-Reads ab.
Lehrer-Ende friert die Antworten ein und löst eine automatische Abgabe aus; Wiederholungen
verwenden denselben Snapshot. Normaler Resume öffnet beendete Prüfungen weiterhin nicht.
Serverzeit plus monotone Laufzeit ersetzen die lokale Geräteuhr im sichtbaren Countdown.
Reale Tests von Lehrer-Ende, Netzverlust und iOS-Hintergrundbetrieb bleiben Gate D/E.

Gate C–G bleiben offen. Keine neue Aussage, dass Staging oder Production bereits abgesichert sei.

## Production – NICHT VERÄNDERN

- Firebase-Projekt: `hausaufgabe-40294`
- Live: `https://hausaufgabe-40294.web.app`
- letzter verifizierter Production-Tag: `v2.3.0_live_verified`
- Tag zeigt auf Commit: `80fc053b4c9270b19a0b835ad4e46b07e5d844aa`
- Production wurde durch die aktuelle Secure-Assessment-Arbeit **nicht deployed oder verändert**.
- Historische Production-Deployskripte nicht für den nächsten GradeCrew-Release verwenden. Vor Live Gate G erfüllen.

## Stabile UI-/Tutorial-Basis

- Branch: `fix/gradecrew-staging-polish`
- Head: `4707c45ef573bf85f81655791edf909862e4f2a6`
- iPhone: kompletter Tutorial- und Bewertungsfluss wurde real durchgeklickt; kein funktionaler Blocker.
- Mobile Layout kann separat weiter poliert werden.

## Secure Assessment V1

- Branch: `feature/secure-assessment-v1`
- vollständig geprüfte Security-Code-Baseline: `c22455c25d9a8db631ba5c4857c99aff0905815a`
- GitHub Actions #310 auf dieser Baseline: **SUCCESS**
- Bis `7eca111` folgten nur Dokumente. Danach neuer Audit-Patch: siehe Übernahmeprüfung oben; alte Baseline nicht mit dem neuen Code gleichsetzen.

### Bewiesene Gates

- Gate A – identische Code-Baseline komplett in CI: **BESTANDEN**
- Gate B – Ziel-Firestore-Regeln real im Firebase Emulator: **BESTANDEN**

### Nächster Gate

- Gate C – isolierter Firebase Preview auf `hausaufgabe-staging`
- dabei normale Staging-URL unverändert
- Ziel-Firestore-Regeln zunächst noch unverändert/inaktiv
- Production unverändert

### Danach zwingend

- Gate D – reale End-to-End-Matrix
- Gate E – 30 Teilnehmer + Maximal-/Payloadtest
- Gate F – kontrollierter Staging-Cutover mit Zielregeln + adversarial Test
- Gate G – neue Production-Pipeline + Rollback

Erst nach A–F darf der Status `STAGING SECURITY READY` lauten.

## Wichtigste Secure-Assessment-Eigenschaften

- Schülerbrowser lädt keine Autor-Fragen/Lösungsschlüssel direkt aus Firestore.
- öffentlicher Weg benutzt Firebase Callables.
- Attempt-ID und Submission serverautorativ; Submit idempotent.
- Bewertung ausschließlich serverseitig.
- opaque Antwort-/Zuordnungs-IDs über server-only Paper-Secret.
- private Gradingdaten in `assessmentPrivate`, für Clients vollständig gesperrt.
- alle 11 Aufgabentypen im Secure-Contract.
- 0,5-Punkte-Raster.
- stabile Frage-/Antwortmischung pro Attempt.
- aktive veröffentlichte Prüfungsinhalte unveränderlich.
- Kollegenfreigabe öffnet während aktiver Prüfung keinen Lösungsschlüssel.
- aktiver Test kann vom Owner nicht physisch gelöscht werden.
- Lösungen optional erst nach Testende.
- bei manueller Prüfung keine irreführende vorläufige Endpunktzahl/Note.
- bei `00:00` werden Antworten eingefroren; kurze Netzunterbrechung wiederholt nur denselben Snapshot.
- Reload sowie versehentliches Tab-/Browser-Schließen erhalten den Antwortentwurf lokal; keine Lösungen/Bewertungsdaten werden persistiert.
- Testcodes werden kanonisiert.

## Bewusst noch offene Härtung

Diese Punkte nicht als erledigt darstellen:

- Rate-Limit bei `startAssessmentAttempt` vor die teuren Fragen-Reads ziehen.
- Serverzeit-Countdown unter iOS-Hintergrundbetrieb und verzögerten Antworten real prüfen (Code auf Serverzeit umgestellt).
- Firebase App Check nach realem iOS/Safari-Previewtest aktivieren.
- zugewiesene/einmalige Schüleridentitäten für gemeinsam nacheinander genutzte Geräte.
- längere Offline-Phasen perspektivisch mit serverseitigem Progress-Autosave.
- historische Frageversion pro Run revisionsfester archivieren.
- Assessment-Dependencies vor Production mit committed Lockfile reproduzierbar machen.
- große Public-Paper-/Bild-Payloads unter Last messen.

## Nächster praktischer Schritt (erst nach grünem Patch-CI; Funktionsblocker oben beachten)

Auf Cloud Shell, sobald der aktuelle Branch vollständig grün ist:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/secure-assessment-v1
git pull --ff-only
bash deploy-secure-assessment-preview.sh --check
```

Nur wenn der Check vollständig erfolgreich endet:

```bash
bash deploy-secure-assessment-preview.sh --deploy
```

Dann die von Firebase ausgegebene Preview-URL sichern. Diese Preview-URL plus einen geeigneten Testcode für Gate D verwenden.

## Dinge, die auf keinen Fall versehentlich passieren dürfen

- kein Production-Deploy während Gate C–F
- `firestore.secure-assessment.rules` nicht vor dem kontrollierten Gate-F-Cutover auf normale Staging-Umgebung schalten
- keinen alten generischen Production-/Full-Staging-Deploy für Secure Assessment verwenden
- keine Autor-Fragen/Lösungsschlüssel wieder in den öffentlichen Schülerclient laden
- keine Punkte/Noten aus dem Schülerbrowser als vertrauenswürdig akzeptieren
- aktive Prüfung nicht editierbar oder löschbar machen
- Tutorial-/Owner-Preview-Ausnahme nicht mit anonymem Schülerzugriff verwechseln


