# GradeCrew – aktueller Projektstatus

Stand: 30.09.2026

Diese Datei ist die **erste Übergabe für jeden neuen GradeCrew-Chat**. Für Details danach lesen:
- `SECURE_ASSESSMENT_AUDIT_2026-09-30.md` – Security-Gates und Prüfungsarchitektur
- `DIAGNOSTICS_GUIDE.md` – Fehleranalyse, Logs, Filter, Ursache/Fix/Nachweis

## 1. Aktuelle belastbare Code-Baseline

**Branch:** `feature/secure-assessment-v1`

**Aktueller geprüfter RC-Commit:**
`6c42dcbb46d33336cb76f3fb03fed3cff12b25e9`

**GitHub Actions:** Run **#362 – SUCCESS**
`https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36737695432`

Der Lauf prüft aktuell unter anderem:
- bestehende Functions-Tests und Syntaxchecks;
- Secure-Assessment-Backend;
- Secure-Client, Draft-Persistenz, Deadline-, Result- und Lösungsfreigabe-Logik;
- Lehrer-Locks und Secure-Routing;
- Ziel-Firestore-Regeln im echten Firebase Emulator;
- Tutorial-/UI-/Diagnose-Regressionen;
- Mobile-Responsive-Module;
- gemeinsamen Staging-Build;
- Deployment-Schutzregeln des Secure-Preview-Skripts.

## 2. Was seit der alten Work-Übergabe zusätzlich erledigt wurde

Der Security-Zweig war 14 Mobile-/Tutorial-Commits hinter `fix/gradecrew-staging-polish`.
Ein direkter Merge hatte Konflikte in Build-/Deploy-Dateien. Die Änderungen wurden deshalb kontrolliert integriert und vollständig neu geprüft.

Jetzt gemeinsam enthalten:
- `mobile-viewport-polish.js`;
- `first-guide-responsive.js` + Regressionstest;
- `crew-tour-responsive.js`;
- alle bisherigen gc23–gc26 Tutorial-Polishes;
- Secure Assessment V1;
- Diagnose-/Admin-Erweiterungen;
- bereinigte Figuren und aktuelle Tutorial-Texte.

Der gemeinsame Staging-Build führt außerdem eine eindeutige Release-Spur:
- exakter Git-Commit;
- `app`-Baseline;
- `mobileTutorial: gc28-mobile`;
- `secureAssessment: v1`;
- SHA-256 pro ausgelieferter Datei.

Dadurch darf ein gemischter RC nicht mehr nur mit einer missverständlichen einzelnen Versionsnummer dokumentiert werden.

## 3. Tutorial / Oberfläche

Funktional bereits bestätigt:
- kompletter Tutorialdurchlauf auf Desktop;
- kompletter Tutorial-/Bewertungsfluss auf iPhone;
- Freitextbewertung blockiert nicht mehr;
- Speichern-Button liegt im Tutorial im Seitenfluss und wird danach zurückgesetzt;
- Scrollen bei kleiner Bildschirmhöhe / Tastatur möglich;
- kein ständiges Re-Zentrieren bei geöffneter Tastatur;
- langsamere Reise durch das Tutorial;
- Wünsche bleiben bis zum manuellen Weiterklicken sichtbar;
- Hilfe und aktuelle Aufgabe werden zusammengeführt;
- „Ich darf doch du sagen“ bleibt erhalten;
- `Vorgaben für Remy` statt alter Bezeichnung;
- Mobile-Viewport-, First-Guide- und Crew-Tour-Responsive-Polish integriert.

Das mobile Layout kann weiterhin optisch verbessert werden, ist aber aktuell **kein funktionaler Release-Blocker**.

## 4. Diagnose / Admin

Implementiert:
- begrenzte technische Breadcrumbs ohne Eingabewerte/Antwortinhalte;
- Release-Commit und Komponenten-Baselines;
- serverseitige Assessment-Fehlerkennungen;
- Admin-Filter nach Zeitraum, Status, Kategorie, Umgebung, Version, Aktion, Fingerprint usw.;
- Sortierung u. a. neu/alt/häufig/priorisiert;
- Fehlergruppen und Häufigkeit;
- Nachladen älterer Protokolle;
- Diagnoseexport ohne Namen/Kontaktdaten/Rohantworten;
- Dokumentation von Ursache, Fix und Prüfnachweis.

**Einfacher Untersuchungsablauf:** `DIAGNOSTICS_GUIDE.md`.

## 5. Secure Assessment V1 – aktuelle Eigenschaften

Der öffentliche Schülerweg soll nach dem Security-Cutover ausschließlich serverautorisiert laufen:
- Schülerbrowser liest keine Autor-Fragen/Lösungsschlüssel direkt aus Firestore;
- Join/Start/Resume/Submit über Firebase Callables;
- Attempt-ID und verbindlicher Attempt-Token;
- Submission-ID entspricht serverautoritativ dem Attempt;
- Submit idempotent;
- Bewertung ausschließlich serverseitig;
- opaque Antwort-/Zuordnungs-IDs;
- Paper-Secret und Grading-Key in `assessmentPrivate`, für Clients vollständig gesperrt;
- 11 Aufgabentypen und 0,5-Punkte-Raster;
- stabile Mischung pro Attempt;
- aktive veröffentlichte Prüfungsinhalte unveränderlich;
- Lösungen optional erst nach Ende **plus kompletter 90-Sekunden-Abgabe-Nachfrist**;
- manuelle Bewertung hält vorläufige Punkte/Prozent/Note serverseitig zurück;
- Serverzeit statt lokaler Geräteuhr;
- Lehrer-Ende wird per geschützter Statusabfrage erkannt, Antworten werden eingefroren und automatisch abgegeben;
- Reload/Tab-Schließen erhält nur den lokalen Antwortentwurf, keine Lösungen/Bewertungsdaten.

## 6. Ziel-Firestore-Regeln

`firestore.secure-assessment.rules` ist im Emulator geprüft, aber **noch nicht auf die normale Staging-Umgebung geschaltet**.

Zielzustand:
- anonyme Schüler lesen keine Quiz-Metadaten direkt;
- anonyme Schüler lesen keine `/questions`;
- öffentliche Attempts/Submissions werden serverseitig erzeugt;
- `assessmentPrivate` vollständig clientgesperrt;
- `assessmentRateLimits` vollständig clientgesperrt;
- aktive Prüfung nicht inhaltlich editierbar oder normal löschbar;
- direkte Client-Ausnahme nur für den eingeloggten Eigentümer beim internen Selbsttest/Tutorial.

## 7. Security-Gates

### Bestanden
- **Gate A:** identische Code-Baseline vollständig in CI – BESTANDEN
- **Gate B:** Ziel-Firestore-Regeln im Firebase Emulator – BESTANDEN

### Jetzt als Nächstes
- **Gate C:** isolierter Firebase Preview auf `hausaufgabe-staging`
  - normale Staging-URL bleibt unverändert;
  - nur Functions-Codebase `assessment` wird deployed;
  - Oberfläche nur auf Firebase Hosting Preview Channel;
  - Ziel-Firestore-Regeln bleiben zunächst inaktiv;
  - Production bleibt unverändert.

### Danach zwingend
- **Gate D:** reale End-to-End-Matrix auf Geräten/Browsern/Netzverlust/Lehrer-Ende
- **Gate E:** 30 parallele Teilnehmer + Maximal-/Payloadtest
- **Gate F:** kontrollierter Staging-Cutover auf Zielregeln + adversarial Test
- **Gate G:** neue Production-Pipeline + Rollback

Erst nach A–F darf der Status `STAGING SECURITY READY` lauten.

## 8. Secure Preview – aktueller sicherer Ablauf

`deploy-secure-assessment-preview.sh` ist jetzt fail-closed gehärtet.

Vor irgendeinem Firebase-Deploy prüft es:
- korrekten Branch `feature/secure-assessment-v1`;
- sauberen Working Tree;
- Node 22;
- Staging-Projekt-ID;
- isolierte Assessment-Codebase / gehärteten `main.js`-Einstieg;
- Secure-Backend-Tests;
- **den kompletten gemeinsamen GradeCrew-RC über `deploy-staging-hosting.sh --check`**;
- Secure-Browser-Tests;
- Mobile- und Secure-Dateien im Preview-Build;
- Release-Komponenten `gc28-mobile` und `secureAssessment: v1`.

CI prüft zusätzlich statisch, dass das Preview-Skript:
- nur auf `hausaufgabe-staging` zielt;
- Production als `hausaufgabe-40294` kennt;
- ausschließlich `functions:assessment` deployed;
- Hosting über einen Preview Channel deployed;
- **keine Firestore-Regeln** deployed.

## 9. Nächster praktischer Schritt: Gate C Preview

In Cloud Shell:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/secure-assessment-v1
git pull --ff-only
nvm use 22
bash deploy-secure-assessment-preview.sh --check
```

Nur wenn der Check vollständig erfolgreich endet:

```bash
bash deploy-secure-assessment-preview.sh --deploy
```

Danach die von Firebase ausgegebene **Preview-URL** sichern. Diese URL wird für Gate D benutzt.

**Nicht** `deploy-production.sh`, `deploy-production-beta.sh` oder einen generischen Full-Deploy benutzen.

## 10. Bekannte offene Härtung – nicht als erledigt darstellen

### Neu konkret dokumentiert
GitHub Issue **#6 – Start-Rate-Limit vor Questions-Reads ziehen**
`https://github.com/HerrLoeffler/Hausaufgabe/issues/6`

Aktuell lädt `startAssessmentAttempt` die Questions noch vor dem Start-Rate-Limit. Das ist **kein Lösungsschlüssel-Leak**, aber eine vermeidbare Firestore-/Function-Kosten- und DoS-Fläche. Vor Production beheben und mit Verhaltenstests absichern.

### Weitere offene Punkte
- Firebase App Check erst nach realem iOS/Safari-Previewtest aktivieren;
- Serverzeit-Countdown unter iOS-Hintergrundbetrieb real prüfen;
- zugewiesene/einmalige Schüleridentitäten für gemeinsam nacheinander genutzte Geräte planen;
- längere Offline-Phasen perspektivisch mit serverseitigem Progress-Autosave;
- historische Frageversion pro Run revisionsfester archivieren;
- `assessment-functions` / Rules-Test-Dependencies vor Production mit committed Lockfiles reproduzierbar machen;
- große Public-Paper-/Bild-Payloads unter Last messen;
- echte Firestore-Transaktionskonkurrenz bei parallelen Starts/Abgaben testen.

## 11. Production – NICHT VERÄNDERT

- Firebase-Projekt: `hausaufgabe-40294`
- Live: `https://hausaufgabe-40294.web.app`
- letzter verifizierter Production-Tag: `v2.3.0_live_verified`
- Tag zeigt auf Commit `80fc053b4c9270b19a0b835ad4e46b07e5d844aa`
- aktuelle Secure-Assessment-Arbeit wurde **nicht** auf Production deployed.
- historisches `deploy-production.sh` ist für aktuelle `2.3.1-gc...`-RCs absichtlich fail-closed.
- `deploy-production-beta.sh` ist ebenfalls **nicht** die Pipeline für den sicheren öffentlichen Prüfungsstart.

## 12. Dinge, die auf keinen Fall versehentlich passieren dürfen

- kein Production-Deploy während Gate C–F;
- `firestore.secure-assessment.rules` nicht vor Gate F auf normale Staging-Umgebung schalten;
- keinen alten generischen Production-/Full-Staging-Deploy für Secure Assessment verwenden;
- keine Autor-Fragen/Lösungsschlüssel wieder in den öffentlichen Schülerclient laden;
- keine Punkte/Noten aus dem Schülerbrowser als vertrauenswürdig akzeptieren;
- aktive Prüfung nicht editierbar/löschbar machen;
- Tutorial-/Owner-Selbsttest-Ausnahme nicht mit anonymem Schülerzugriff verwechseln;
- keinen grünen CI-Lauf mit einem bestandenen realen Geräte-/Lasttest verwechseln.

## 13. Letzter verifizierter normaler Staging-Stand

Vor dem Secure-Preview blieb die normale URL `https://hausaufgabe-staging.web.app` auf dem bereits real getesteten Tutorial-Stand. Der neue Secure-RC ist **noch nicht als normaler Staging-Cutover veröffentlicht**. Gate C verwendet absichtlich einen separaten Preview Channel.
