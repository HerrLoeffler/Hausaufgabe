# GradeCrew – aktueller Projektstatus

Stand: 30.09.2026

Diese Datei ist die kompakte Übergabe für neue GradeCrew-Chats. Für Security-Details zusätzlich `SECURE_ASSESSMENT_AUDIT_2026-09-30.md` lesen.

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
- Danach wurden nur Audit-/Statusdokumente ergänzt; Security-Code nicht verändert.

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
- sichtbare Timer-Uhr gegen Device-Clock-Skew härten / Serverzeit-Offset.
- Firebase App Check nach realem iOS/Safari-Previewtest aktivieren.
- zugewiesene/einmalige Schüleridentitäten für gemeinsam nacheinander genutzte Geräte.
- längere Offline-Phasen perspektivisch mit serverseitigem Progress-Autosave.
- historische Frageversion pro Run revisionsfester archivieren.
- Assessment-Dependencies vor Production mit committed Lockfile reproduzierbar machen.
- große Public-Paper-/Bild-Payloads unter Last messen.

## Nächster praktischer Schritt

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
