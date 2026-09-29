# GradeCrew Secure Assessment V1 – Release Audit

Stand: 30.09.2026  
Branch: `feature/secure-assessment-v1`  
Ausgangspunkt: `fix/gradecrew-staging-polish` @ `4707c45ef573bf85f81655791edf909862e4f2a6`  
Vollständig geprüfte Code-Baseline: `c22455c25d9a8db631ba5c4857c99aff0905815a` · GitHub Actions #310 · **SUCCESS**

## Release-Aussage

Der ursprüngliche öffentliche Schülerpfad war für verbindliche Leistungsnachweise nicht ausreichend abgesichert, weil Autor-Fragen mit Lösungen im Browser lagen und der Client selbst bewertete. Secure Assessment V1 ersetzt diesen Vertrauenspfad durch einen serverautoritativen Ablauf.

**Production wurde nicht verändert.**  
**Die normale Staging-URL wurde durch diesen Security-Block noch nicht umgestellt.**  
**`firestore.secure-assessment.rules` ist weiterhin eine Zielregeldatei und noch nicht aktiv.**

Aktueller Gate-Stand:

- **Gate A – CI auf identischer Code-Baseline: BESTANDEN**
- **Gate B – Firestore-Regeln semantisch im Emulator: BESTANDEN**
- **Gate C – isolierter Firebase Preview: ALS NÄCHSTES**
- **Gate D – reale End-to-End-Matrix: OFFEN**
- **Gate E – 30-Teilnehmer-/Maximaltest: OFFEN**
- **Gate F – kontrollierter Staging-Cutover + adversarial Test: OFFEN**
- **Gate G – neue Production-Pipeline: OFFEN**

Daher noch **nicht** `STAGING SECURITY READY` und ausdrücklich noch kein Production-Release.

## Was jetzt serverautorativ ist

Öffentlicher Schülerbrowser:

1. fragt Metadaten über `getAssessmentInfo` ab,
2. erhält über `startAssessmentAttempt` eine serverseitige Attempt-Identität,
3. erhält ausschließlich ein lösungsfreies Paper,
4. sendet nur Antworten, keine vertrauenswürdigen Punkte/Noten,
5. gibt über `submitAssessmentAttempt` idempotent ab,
6. wird serverseitig aus dem privaten Grading-Key bewertet,
7. erhält einen token-geschützten Receipt,
8. erhält optionale Lösungen ausschließlich nach kontrollierter Freigabe nach Testende.

Der öffentliche Schülerclient importiert kein Firestore und hat keinen direkten Autor-Fragen-, `assessmentPrivate`- oder Rate-Limit-Zugriff.

## Im Audit gefundene und geschlossene Risiken

### Kritische Architektur-/Deploygrenzen

- Firebase-Entrypoint war zunächst nicht eindeutig: **behoben**. `assessment-functions/package.json` zeigt auf den gehärteten `main.js`; CI und Preview-Skript prüfen den Entrypoint.
- Lösungsschlüssel im öffentlichen Browser: **behoben**. Autor-Fragen bleiben serverseitig; Public Paper enthält keine Lösungsfelder.
- Clientseitige verbindliche Bewertung/Submission: **behoben**. Bewertung kommt ausschließlich vom Server; `submissionId == attemptId`; Wiederholungsabgabe ist idempotent.
- Opaque IDs waren anfangs unnötig eng an Browsermaterial gekoppelt: **behoben**. Zuordnungen entstehen aus einem ausschließlich serverseitigen Paper-Secret.
- Private Grading-/Token-Daten waren zu nah an clientlesbaren Dokumenten: **behoben**. Private Daten liegen in `assessmentPrivate`; Rules schließen die Collection vollständig für Clients.

### Bewertung und Aufgabentypen

- 0,5-Punkte-Raster für GradeCrew: **behoben und getestet**.
- Leere Zahl darf nicht als `0`, leeres Richtig/Falsch nicht als `false` gelten: **behoben und getestet**.
- Alle 11 unterstützten Interaktionen werden in Secure-Contract und Grader abgedeckt.
- Matching/Grouping/Ordering verraten keine Lösungsabbildung über IDs oder Ausgangsreihenfolge.
- `shuffleQuestions` / `shuffleAnswers` werden pro Attempt stabil serverseitig berücksichtigt.
- Sichere opaque Antworten werden nach der Bewertung serverseitig in das bestehende Lehrerformat zurückübersetzt; Ergebnisansicht, CSV und manuelle Bewertung bleiben kompatibel.

### Attempts, Runs und Zeit

- Neue Veröffentlichung/Runde besitzt eine eigene logische Run-Identität; alte lokale Attempts werden bei Run-Wechsel verworfen.
- Doppelte Submit-Aufrufe erzeugen keine zweite verbindliche Abgabe.
- Teacher-End/Submit-Race: bereits laufende Attempts erhalten nach `endedAt` ein eng begrenztes 90-Sekunden-Fenster; neue Starts bleiben geschlossen.
- Normales Zeitlimit bleibt serverseitig autoritativ mit engem Grace-Fenster.
- Bei `00:00` friert `secure-deadline-guard.js` exakt einen Antwort-Snapshot ein, sperrt die Eingaben und versucht bei kurzer Netzunterbrechung ausschließlich diesen unveränderten Snapshot erneut zu senden.
- Reload wird über Session-Draft abgefangen.
- Versehentlich geschlossenes Tab/Browser wird zusätzlich über `secure-draft-persistence.js` abgefangen: nur Antwortwerte, auf Quiz + Attempt begrenzt, 12-Stunden-TTL, keine Lösungen/Bewertungsdaten, Löschung nach erfolgreichem Resultat.
- Der Draft-Restore prüft automatisch denselben Storage-Vertrag wie der Secure-Client (`v2`); eine künftige Versionsabweichung ist regressionsgetestet.

### Testcodes und lokale Identität

- Testcodes werden client- und serverseitig kanonisiert (`A-Z0-9`, Großschreibung).
- Öffentliche Handoff-Links werden bereits in `startup.js` kanonisiert und verlieren fremde Query-/Hash-Reste.
- Unterschiedliche Schreibweisen desselben Codes erzeugen dadurch nicht absichtlich unterschiedliche lokale Credentials.

### Ergebnisse und Lösungen

- Result-Modi `none`, `points`, `points_percent`, `points_grade` werden als Attempt-/Submission-Snapshot behandelt.
- Bei manueller Prüfung wird keine scheinbar endgültige Zwischenpunktzahl/Note angezeigt; Punkte/Prozent/Note erscheinen erst nach abgeschlossener Lehrerbewertung.
- Lösungen werden nicht direkt nach Einzelabgabe freigegeben.
- Lösungssnapshot wird privat eingefroren und nur nach `ended=true`, bei passender Konfiguration und ohne Rechte-Hold/Papierkorb token-geschützt ausgeliefert.
- Der ursprüngliche Browser kann nach Testende ausschließlich seinen bereits abgegebenen Attempt/Receipt wieder laden; neue Teilnehmer erhalten keinen Join-Bypass.

### Aktiver Test ist versiegelt

- Aktive veröffentlichte Fragen sind für den Owner inhaltlich unveränderlich.
- Dashboard kann einen aktiven Test nicht zurück in einen offenen Entwurf kippen.
- Kollegenfreigabe (`shareEnabled`) öffnet während einer aktiven Prüfung **keinen** Autor-Fragen-/Lösungsschlüssel. Der reale Emulator beweist DENY während aktiv und ALLOW erst nach Ende.
- Ein aktiv veröffentlichter Test kann auch vom Eigentümer nicht physisch gelöscht werden. Erst inaktiv/beendet/Papierkorb ist Owner-Löschung zulässig; Admin-Support bleibt möglich.
- Lehrerreview darf Bewertung/Resultat ändern, aber nicht ursprüngliche Schülerantworten, Attempt-ID, Secure-Digest, Timing oder Run-Metadaten.

### Server-only Daten und Größen

- `assessmentPrivate` und `assessmentRateLimits` sind für alle Clients geschlossen – auch Owner/Admin-Clients.
- Bei endgültigem Quiz-Löschen räumt ein Server-Trigger zugehörige private Assessment-Dokumente auf.
- Private Assessment-Dokumente besitzen ein 850-kB-Soft-Limit vor Firestores 1-MiB-Limit.

### Deployment-Trennung

- Assessment läuft als eigene Firebase Functions-Codebase `assessment`.
- AI-Deploy und Assessment-Deploy sind getrennt.
- `deploy-secure-assessment-preview.sh` ist fail-closed auf:
  - Branch `feature/secure-assessment-v1`
  - Projekt `hausaufgabe-staging`
  - sauberen Working Tree
  - Node 22
  - gehärteten `main.js`-Entrypoint
  - aktuelle Secure-Tests und Build-Artefakte.
- Preview-Deploy veröffentlicht nur `functions:assessment` auf Staging und Hosting auf einen Preview-Channel. Normale Staging-URL, Zielregeln und Production bleiben dabei unverändert.

## Gate A – BESTANDEN: aktueller Codeblock vollständig grün

Nachweis für Code-Baseline `c22455c25d9a8db631ba5c4857c99aff0905815a`, GitHub Actions #310:

- bestehende Functions-/KI-Regressionen
- Secure-Assessment-Backend
- Browser-Client-Grenze
- Draft-Persistenzvertrag
- Secure-Schüler-Renderer
- Deadline-Freeze/Retry
- Pending-Review-Result-Policy
- kontrollierte Lösungsfreigabe
- Lehrer-Locks
- Routing/Kanonisierung
- Rules-Quellverträge
- semantischer Firestore-Emulator
- bestehende GradeCrew-/Tutorial-Regressionen
- vollständiger Staging-Build-Smoke-Test

Alle Schritte: **SUCCESS**.

## Gate B – BESTANDEN: Firestore-Regeln real im Emulator

Die Zielregeln werden mit Java 21 + Firebase Emulator Suite semantisch getestet. Bewiesen sind mindestens:

- anonym Quiz/Fragen direkt lesen -> DENY
- anonym Attempt/Submission direkt schreiben -> DENY
- Owner eigener Test/Fragen lesen -> ALLOW
- Owner-Self-Test begrenzt -> ALLOW
- fremde Lehrkraft private Testdaten -> DENY
- aktive Frage verändern -> DENY
- aktiven Test zurück zum Entwurf -> DENY
- aktiven Test als Owner physisch löschen -> DENY
- Session starten -> ALLOW
- Test beenden -> ALLOW
- Frage nach Ende bearbeiten -> ALLOW
- Kollegenfreigabe während aktiver Prüfung -> DENY
- Kollegenfreigabe nach Ende -> ALLOW
- Lehrerreview Bewertungsfelder -> ALLOW
- Lehrerreview Originalantwort/Secure-Digest -> DENY
- `assessmentPrivate` / `assessmentRateLimits` für Clients -> DENY
- Owner-Löschung nach beendetem Test -> ALLOW

## Gate C – ALS NÄCHSTES: isolierter Firebase Preview

Reihenfolge:

1. aktuellen Security-Branch in Cloud Shell holen,
2. `bash deploy-secure-assessment-preview.sh --check`,
3. nur wenn vollständig grün: `bash deploy-secure-assessment-preview.sh --deploy`,
4. Assessment-Codebase auf `hausaufgabe-staging`,
5. Secure-Frontend ausschließlich auf Firebase Hosting Preview Channel,
6. normale `hausaufgabe-staging.web.app` bleibt unverändert,
7. `firestore.secure-assessment.rules` bleibt zunächst noch inaktiv.

Dieser Preview beweist Integration/Funktion. Er ist noch kein vollständiger adversarial Security-Cutover, solange die alten aktiven Staging-Regeln existieren.

## Gate D – OFFEN: reale End-to-End-Matrix

Im Preview mindestens testen:

- alle 11 Aufgabentypen
- Fragenbilder
- Frage-/Antwortmischen
- Schüler-Selbststart ohne/mit Timer
- gemeinsamer Lehrerstart ohne/mit Timer
- Warteraum
- Reload/Fortsetzen
- Tab/Browser schließen und wieder öffnen
- Doppelklick/doppelte Submission
- WLAN-Ausfall kurz vor/genau bei `00:00`
- Ablauf genau am Timerende
- Lehrkraft beendet genau beim Submit
- manuelle Freitextbewertung
- kein irreführendes vorläufiges Endergebnis
- CSV
- alle Ergebnis-Modi
- Lösungsschutz vor Ende + Freigabe nach Ende
- Reload nach Ende
- neue Runde/erneut öffnen
- Klein-/Sonderzeichen-Testcodes
- Tutorial und Owner-Selbsttest
- iPhone/iPad + Desktop-Browser
- absichtlich falsche Device-Uhr vor/zurück

## Gate E – OFFEN: Last-/Maximaltest

Mindestens:

- 30 parallele Teilnehmer
- realistischer großer Test
- mehrere Bilder
- öffentliche Paper-/Callable-Größe
- parallele Start-/Submit-Transaktionen
- Warteraum-Polling mit 30 Clients
- wiederholte kurze Netzunterbrechungen

## Gate F – OFFEN: kontrollierter STAGING-Cutover

Erst nach C–E:

1. sichere Oberfläche auf normale Staging-URL,
2. `firestore.secure-assessment.rules` kontrolliert aktivieren,
3. echten Test vollständig wiederholen,
4. adversarial nachweisen, dass der alte direkte Firestore-Schülerpfad tot ist,
5. Autor-Fragen/Lösungen dürfen anonym weder per UI noch DevTools/SDK gelesen werden,
6. direkte Submission-/Attempt-Manipulation muss scheitern.

Erst dann darf der Status **STAGING SECURITY READY** gesetzt werden.

## Gate G – OFFEN: Production-Pipeline neu bauen

Historischen Production-Deploy nicht reaktivieren. Vor Live braucht GradeCrew:

- vollständigen Production-Build mit Produktionsconfig,
- explizite Hosting-/Functions-Codebase-/Rules-Auswahl,
- reproduzierbare Assessment-Abhängigkeiten inkl. committed lockfile,
- Verifikationsskript gegen `release.json`,
- bestätigten Rollback-Punkt,
- Preview/Staging-Abnahme unmittelbar vorher.

## Weitere Härtung vor breitem High-Stakes-Einsatz

Diese Punkte sind bewusst dokumentiert und nicht als „schon gelöst“ ausgegeben:

1. **Rate-Limit vor teure Reads ziehen:** `startAssessmentAttempt` liest aktuell Autor-Fragen, bevor der Create-Rate-Limiter in der Transaktion greift. Kein Lösungsleck, aber bei bekanntem gültigem Code ein vermeidbarer Kosten-/DoS-Punkt.
2. **App Check:** `enforceAppCheck` bleibt für Preview bewusst aus. Nach realem Safari/iOS-Test kontrolliert aktivieren.
3. **Device-Uhr:** Serverdeadline ist autoritativ, die sichtbare Browseruhr benutzt aktuell `Date.now()`. Clock-Skew im E2E testen; perspektivisch Serverzeit/Offset mitsenden.
4. **Gemeinsam genutzte Geräte:** Browser-Token ermöglicht Resume desselben Attempts. Für Geräte, die nacheinander verschiedene Schüler nutzen, braucht GradeCrew zugewiesene/einmalige Teilnehmeridentitäten statt „Browser = Schüler“.
5. **Längerer Offline-Ausfall:** Der Deadline-Guard schützt kurze Unterbrechungen mit eingefrorenem Snapshot. Für mehrminütige Offline-Phasen wäre perspektivisch serverseitiges Progress-Autosave nötig, ohne die Deadline aufzuweichen.
6. **Historische Revisionsfestigkeit:** Nach Testende darf die Lehrkraft wieder bearbeiten. Langfristig pro Run Lehrer-Frageversion archivieren oder „Duplizieren zum Bearbeiten“ erzwingen.
7. **Abhängigkeits-Reproduzierbarkeit:** Assessment-Package nutzt exakt gepinnte Top-Level-Versionen; vor Production zusätzlich Lockfile committen.
8. **Shared-/Public-Payload-Maximum:** Gate E muss große Tests/Bilder gegen Callable-/Browsergrenzen messen.
9. **App-/Functions-Instanzen konsolidieren:** Die getrennten Secure-Hilfsmodule sind für die isolierte Entwicklung praktisch; bei App-Check-Einführung gemeinsame Initialisierung erneut prüfen.

## Verbindlicher Status

Secure Assessment V1 hat die bisher gefundenen kritischen Vertrauens-, Lösungs-, Bewertungs-, Lifecycle- und Rules-Probleme systematisch geschlossen. **A und B sind bewiesen. C bis F sind reale Release-Gates und dürfen nicht übersprungen werden. Production bleibt bis dahin unverändert.**
