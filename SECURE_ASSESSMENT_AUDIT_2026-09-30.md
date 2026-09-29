# GradeCrew Secure Assessment V1 – Release Audit

Stand: 30.09.2026  
Branch: `feature/secure-assessment-v1`  
Ausgangspunkt: `fix/gradecrew-staging-polish` @ `4707c45ef573bf85f81655791edf909862e4f2a6`

## Zweck

Der öffentliche Schülerweg darf keinen Lösungsschlüssel, keine vertrauenswürdigen Punkte und keine frei erzeugbaren verbindlichen Abgaben mehr im Browser enthalten. Die bestehende Lehreroberfläche, das Tutorial, die manuelle Bewertung und CSV-Auswertung sollen trotzdem kompatibel bleiben.

**Production wurde bei dieser Arbeit nicht verändert.** Die Zielregeln `firestore.secure-assessment.rules` sind ebenfalls noch nicht aktiv.

## Im Audit gefundene und behobene Release-Risiken

### 1. Falscher Firebase-Entrypoint – kritisch

Die neue Assessment-Codebase zeigte zunächst in `package.json` auf `index.js`, obwohl der gehärtete Submit-Pfad über `main.js` lief. Damit hätte CI den sicheren Handler testen können, während Firebase beim Deploy den älteren Handler geladen hätte.

**Behoben:** `assessment-functions/package.json` zeigt auf `main.js`; `main.js` exportiert nur den autoritativen Secure-Lifecycle plus Cleanup. CI und Deploy-Skripte prüfen diese Grenze explizit.

### 2. Lösungsschlüssel im öffentlichen Browser – kritisch

Der Altpfad lud Autorendokumente mit Lösungen aus Firestore und bewertete im Browser.

**Behoben:** öffentlicher Schülerpfad nutzt Callables; Browser bekommt nur lösungsfreie Aufgaben, opaque IDs und keine Firestore-Fragen. Private Bewertung liegt in `assessmentPrivate`, auf das Clients keinen Rule-Zugriff erhalten.

### 3. Client konnte Bewertung / Submission beeinflussen – kritisch

**Behoben:** Server bewertet nur aus dem privaten Grading-Key. Client übermittelt nur Antworten und Auto-Submit-Flag. Submission-ID entspricht der serverseitigen Attempt-ID; Wiederholungsabgabe ist idempotent.

### 4. Opaque IDs ursprünglich an Browser-Token gekoppelt

Das hätte die Zuordnung unnötig schwächer gemacht.

**Behoben:** Opaque IDs werden mit einem ausschließlich serverseitigen Paper-Secret erzeugt. Der Browser besitzt nur den separaten Attempt-Token, dessen Hash serverseitig liegt.

### 5. Teilpunkte nicht im GradeCrew-0,5-Raster

Der erste Secure-Grader rundete teilweise auf Zehntel.

**Behoben:** Bewertung nutzt dieselbe 0,5-Punkte-Rasterung wie GradeCrew; Regressionstest deckt Teilpunkte ab.

### 6. Leere Antworten bei `0` und `false`

Leere Zahlen-/Boolean-Antworten durften nicht versehentlich als `0` bzw. `false` gelten.

**Behoben und getestet.**

### 7. Frage-/Antwortmischen fehlte im Secure-Pfad

**Behoben:** `shuffleQuestions` und `shuffleAnswers` werden pro Attempt stabil und serverseitig berücksichtigt. Bei explizitem Shuffle wird eine zufällig identische Ausgangsreihenfolge vermieden.

### 8. Ergebnis-Modi waren nicht vollständig paritätisch

**Behoben:** `none`, `points`, `points_percent`, `points_grade` werden als Attempt-Einstellung eingefroren und im Receipt entsprechend begrenzt.

### 9. Wiederöffnen / neue Runde bei Schüler-Selbststart

Ohne eigene Run-ID hätte derselbe Browser an einer alten abgegebenen Sitzung hängen können.

**Behoben:** jede Veröffentlichung erhält logisch eine neue Run-Identität; `reopenedAt` / `publishedAt` werden berücksichtigt. Browser verwirft alte lokale Attempts bei Run-Wechsel.

### 10. Abgabe genau beim Beenden des Tests

Ein Server, der bei `ended=true` sofort jede Submission verwirft, kann im Unterricht fertige Arbeit verlieren, wenn Lehrkraft und Schüler nahezu gleichzeitig klicken.

**Behoben:** nur bereits `running` Attempts erhalten nach `endedAt` ein enges 90-Sekunden-Abgabefenster. Neue Starts bleiben geschlossen. Zeitlimit, Rechte-Hold und Papierkorb gelten weiterhin strikt.

### 11. Reload nach Testende verlor eigenen Ergebnisbeleg

Der öffentliche Join muss nach Testende geschlossen sein, der ursprüngliche Browser soll aber seine eigene token-geschützte, bereits abgegebene Submission weiter laden können.

**Behoben:** `getInfo` darf ausschließlich bei lokal vorhandener Attempt-ID + Token auf `resume` zurückfallen und akzeptiert dort nur Status `submitted`.

### 12. Lösungsanzeige direkt nach Einzelabgabe wäre Prüfungsleck

**Behoben:** Lehrkraft-Option lautet im Secure-Modus sinngemäß „Richtige Lösungen nach Testende anzeigen“. Lösungen werden als privater Snapshot eingefroren und nur nach `ended=true` über den token-geschützten Receipt freigegeben. Kein Release bei Rechte-Hold oder Papierkorb.

Hinweis an Lehrkräfte: Ein Test mit bereits freigegebenen Lösungen sollte nicht unverändert mit einer weiteren Gruppe wiederverwendet werden.

### 13. Lehrer-Auswertung erwartete alte Antwort-Indizes

**Behoben:** Server übersetzt sichere opaque Antworten nach erfolgreicher Bewertung in das bestehende Lehrerformat zurück. Ergebnisansicht, CSV und manuelle Freitextbewertung können dadurch weiterarbeiten.

### 14. Aktive Testversion konnte während der Prüfung verändert werden

**Behoben auf zwei Ebenen:**
- UI: veröffentlichter laufender Test ist im Editor schreibgeschützt.
- Zielregeln: Frage-Dokumente aktiver Tests sind unveränderlich.

### 15. Laufender Test konnte über Dashboard wieder zum Entwurf werden

Das würde laufende serverseitige Attempts unbrauchbar machen.

**Behoben:** Dashboard-Schalter aktiver veröffentlichter Tests ist gesperrt; Schließen erfolgt über `Beenden`. Zielregeln erlauben bei aktivem Test nur einen eng begrenzten Lifecycle-/Session-Feldsatz und verhindern `published=false, ended=false`.

### 16. Tutorial / „Test selbst ausfüllen“ wäre durch harte Regeln kaputtgegangen

Das Tutorial nutzt bewusst den eingeloggten Eigentümer innerhalb der bestehenden App als Übungsschüler.

**Behoben:** Zielregeln besitzen eine eng begrenzte Owner-Self-Test-Ausnahme. Anonyme Schüler erhalten dadurch keinen direkten Firestore-Schreibweg.

### 17. Lehrer konnte nach Abgabe Originalantworten umschreiben

**Behoben:** gewöhnliche Lehrer-Updates an Secure-Submissions sind auf echte Bewertungsfelder begrenzt. Antworten, Attempt-ID, Secure-Digest, Timing und Run-Metadaten bleiben unveränderlich. Admin bleibt für Supportfälle privilegiert.

### 18. Server-only Daten würden bei endgültigem Quiz-Löschen verwaisen

**Behoben:** Firestore-Delete-Trigger entfernt `assessmentPrivate`-Dokumente des gelöschten Tests in Batches.

### 19. Große private Assessment-Dokumente könnten erst an Firestores 1-MiB-Limit scheitern

**Behoben:** privater Payload hat ein 850-kB-Soft-Limit und kompakte Lösungssnapshots. Zu große Tests erhalten eine klare Fehlermeldung statt eines kryptischen Firestore-Fehlers.

### 20. Historische Deploy-Skripte wurden durch zweite Functions-Codebase gefährlich

**Behoben:** AI-Deploy deployt explizit nur `functions:ai`; generischer alter Full-Staging-Deploy bricht bei vorhandener Assessment-Codebase ab. Secure Assessment besitzt eigene isolierte Preview-/Staging-Skripte.

## Aktuelle Security-Grenze

Öffentlicher Schülerbrowser:

1. `getAssessmentInfo`
2. `startAssessmentAttempt`
3. lösungsfreies Paper
4. lokaler Entwurf nur im eigenen Browser
5. `submitAssessmentAttempt`
6. serverseitige Bewertung + idempotente Submission
7. `getAssessmentReceipt`
8. optionale Lösungen erst nach Testende

Der Browser liest weder Autor-Fragen noch `assessmentPrivate` direkt aus Firestore.

## Bewusst erhaltene interne Ausnahme

Eine angemeldete Eigentümer-Lehrkraft darf den eigenen veröffentlichten Test weiterhin intern selbst ausfüllen. Diese Ausnahme ist für Tutorial und Lehrer-Selbsttest nötig und gilt nicht anonymen Schülern.

## Noch NICHT als erledigt markieren

### Gate A – aktueller CI-Head muss vollständig grün sein

Alle Backend-, Secure-Client-, Tutorial-, UI- und Build-Tests müssen auf demselben neuesten Commit laufen.

### Gate B – Firestore-Regeln semantisch im Emulator testen

Nicht nur Quelltext prüfen. Mindestens:
- anonym: Quiz/Fragen direkt lesen -> DENY
- anonym: Attempt/Submission direkt schreiben -> DENY
- Owner: eigener Test / Fragen lesen -> ALLOW
- Owner-Self-Test: begrenzte Attempt-/Submission-Erstellung -> ALLOW
- fremde Lehrkraft: private Testdaten -> DENY
- aktiver Owner-Test: Frage ändern -> DENY
- aktiver Owner-Test: zurück zu Entwurf -> DENY
- aktiver Owner-Test: Session starten -> ALLOW
- aktiver Owner-Test: beenden -> ALLOW
- Lehrerreview: Bewertungsfelder -> ALLOW
- Lehrerreview: `answers` / Secure-Digest umschreiben -> DENY
- `assessmentPrivate` / `assessmentRateLimits` für alle Clients -> DENY

### Gate C – isolierter Firebase Preview

Deploy-Reihenfolge:
1. Assessment-Codebase auf `hausaufgabe-staging`
2. Secure-Frontend auf Hosting Preview Channel
3. normale Staging-URL und aktive Regeln noch unverändert

Der Preview ist zunächst ein Integrations-, noch kein vollständiger Security-Cutover-Test, solange alte Staging-Regeln aktiv sind.

### Gate D – End-to-End-Matrix im Preview

Mindestens:
- alle 11 Aufgabentypen
- Bilder
- Frage-/Antwortmischen
- Schüler-Selbststart ohne/mit Timer
- gemeinsamer Lehrerstart ohne/mit Timer
- Warteraum
- Reload/Fortsetzen
- Browser schließen/öffnen
- Doppelklick / doppelte Submission
- Ablauf genau am Timerende
- Beenden genau beim Submit
- manuelle Freitextbewertung
- CSV
- alle Ergebnis-Modi
- Lösungsschutz vor Ende + Freigabe nach Ende
- Reload nach Ende
- neue Runde / erneut öffnen
- normalisierte Klein-/Sonderzeichen-Testcodes
- Tutorial und Owner-Selbsttest

### Gate E – Last-/Maximaltest

Mindestens:
- 30 parallele Teilnehmer
- großer Test nahe realistischem Maximum
- mehrere Bilder
- Payload-/Callable-Größen
- parallele Start-/Submit-Transaktionen

### Gate F – kontrollierter STAGING-Cutover

Erst danach Hosting + `firestore.secure-assessment.rules` gemeinsam umstellen. Anschließend adversarial prüfen, dass der alte direkte Firestore-Schülerpfad tatsächlich tot ist.

### Gate G – Produktionspipeline neu bauen

Den historischen Production-Deploy nicht reaktivieren. Für die GradeCrew-Releaseversion braucht es einen vollständigen Production-Build, Verifikation, explizite Codebase-/Rules-Auswahl und Rollback-Punkt.

## Weitere Härtung vor breiterem High-Stakes-Einsatz

- Firebase App Check für öffentliche Callables aktivieren, sobald sauber eingerichtet und auf Zielgeräten getestet.
- Echte Schüler-/Klassenidentität bzw. einmalige zugewiesene Teilnehmercodes, wenn „ein Browser = ein Attempt“ nicht genügt.
- Optional beaufsichtigter/SEB-Modus später; Browser-Fullscreen allein ist keine Gerätesperre.
- Historische Ergebnisversionierung weiter verbessern: Nach Testende können Lehrer den Test wieder bearbeiten. Für langfristig revisionsfeste Auswertungen sollte perspektivisch pro Run auch die Lehrer-Frageversion archiviert oder ein beendeter Test nur über „Duplizieren“ verändert werden.

## Release-Aussage

Die Secure-Assessment-Architektur ist deutlich belastbarer als der ursprüngliche Schülerpfad und die bisher gefundenen kritischen Design-/Deployfehler wurden systematisch geschlossen. Sie ist trotzdem erst dann **STAGING SECURITY READY**, wenn Gates A–F nachweislich bestanden sind. Production bleibt bis dahin unverändert.
