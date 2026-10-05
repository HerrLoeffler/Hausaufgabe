# Aufgabe: GC-CLASSROOM-01

- Aktualisiert (UTC): 2026-10-05
- Verantwortlicher Chat / Auftrag: GradeCrew Schüler:innen-/Klassenverwaltung als Masterprojekt vorbereiten
- Chat-Bezeichnung / Link: aktueller GradeCrew-Chat, Link unbekannt
- Vorheriger Chat / Übernahmezeitpunkt: Fortführung der bereits besprochenen Schüler-/Klassenidee; kein anderer aktiver Implementierungschat nachgewiesen
- Arbeitszustand: aktiv – Planung gesichert, Produktimplementierung noch nicht begonnen
- Aufgabenbranch: `feature/classroom-student-management-v1`
- Basiscommit: `feature/gradecrew-app-integration@bb91ce3590d773472ece60c4dd881da729bd32c1`
- Integrationsziel: `feature/gradecrew-app-integration`
- PR: keiner
- Betroffene Dateien später: Classroom-/Student-Module, Secure-Assessment-Authorization-Adapter, Publish-/Student-/Results-UI, i18n, Rules und Tests; genaue Pfade vor Implementierung frisch bestimmen
- Überschneidungen: `secure-assessment`, `telemetry`, Web-Integration, i18n/PR #137; keine parallele Lösung ohne erneuten Live Development Status

## Ziel und gewünschtes Verhalten

Professionelle GradeCrew-Schüler- und Klassenverwaltung:
- spontaner Gastzugang weiter per Testcode/QR + Kürzel;
- dauerhafte pseudonyme Schüleridentität ohne E-Mail/klassisches Passwort;
- persönliche Zugangscodes;
- Klassen, Mitgliedschaften und kontrollierter Selbstbeitritt;
- Tests an Klassen/Einzelpersonen freigeben;
- Secure Assessment bleibt alleinige Attempt-/Submission-/Grading-Engine.

Masterdokument: [CLASSROOM_STUDENT_MASTERPROJECT_V1.md](../docs/CLASSROOM_STUDENT_MASTERPROJECT_V1.md)

## Umfang / nicht verändern

Noch kein Produktcode und kein Deploy.

Nicht:
- Production,
- normaler Staging-Cutover,
- parallele neue Exam-Engine,
- Lösungsschlüssel-/Grader-Neubau,
- echte Schülerdaten,
- Klassen-/Aliasdaten in PostHog.

Secure Assessment, bestehende idempotente Submission und Lösungsschutz erhalten.

## Akzeptanzkriterien

Planungsstufe:
- aktueller main/START_HERE/AGENTS/State/TODO/Registry geprüft;
- Live Development Status geprüft;
- Secure-Assessment-Branch und aktueller Integrationsstand verglichen;
- Produktmodell, Datenmodell, Auth, API, UI, Teststrategie, Preview-Stufen und Sicherheitsgrenzen dokumentiert;
- Aufgabenbranch angelegt;
- noch keine Produktimplementierung.

Spätere V1-Kriterien stehen im Masterdokument.

## Zwischenstand

- Lokal geändert: keine
- Auf GitHub gesichert: Masterplan `8f4c96d2...`; Handoff `100b3c50...`; TODO `07b9c1fe...`; Registry `a91eac54...`; zentraler State `31881dbe...`; Aufgabenbranch angelegt
- Geprüft: nach Registrierung Development Status Run `37280715249` **SUCCESS**, Project handoff checks `37280715283` **SUCCESS**, Release Control `37280715268` **SUCCESS**. Workstream wird als `feature/classroom-student-management-v1` → `feature/gradecrew-app-integration`, `+0/-0`, `branch_only` erkannt. Integrationshead `bb91ce3590...`; Secure-Branch `76417085...` +15/-504 zum Ziel; keine offenen Secure-Assessment-PRs
- Deployed: nein
- Gerätetest: nein

## Wichtige Architekturentscheidung

Der erste Entwurf mit sofortigem `quizVersions` + `examRuns` wird für V1 verworfen.

Der aktuelle Integrationsstand enthält bereits den gehärteten Secure-Assessment-Lifecycle mit `sessionRunId`, Attempts, privaten Grading-Daten, serverseitiger Bewertung und idempotenter Submission.

Classroom V1 ergänzt daher:
- StudentIdentity,
- Klassen/Memberships,
- Codes,
- `assessmentAssignments` als Audience-Snapshot pro bestehendem Secure Run,
- serverseitige Classroom-Autorisierung beim vorhandenen `startAssessmentAttempt`.

## Externe Produktmuster

- paddy: möglichst reibungsarmer Schülerzugang per zeitlich begrenztem QR/Link ohne Schüler-E-Mail/Registrierung.
- ANTON: Gruppen/Klassen, individuelle Schülercodes, Spitzname/Nummer, mehrere Gruppen.
- GradeCrew übernimmt diese Stärken, speichert persönliche Zugangscodes aber nicht später im Klartext; verlorene Codes werden neu erzeugt.

## Offene Probleme und Unsicherheiten

- i18n-PR #137 läuft parallel; neue UI erst nach aktuellem Abgleich verdrahten.
- Secure-Assessment-Registry zeigt den alten Primary Branch weiterhin aktiv/branch_only, obwohl der Kern im Integrationsstand vorhanden ist. Vor Code die tatsächlich kanonischen Dateien erneut prüfen.
- Firebase Custom Token für Schüler ist Zielarchitektur; vor Implementierung Auth-/Datenschutzfolgen und Emulatorpfad nochmals prüfen.
- konkrete Retention schulischer Leistungsdaten bleibt rechtlich/organisatorisch offen.
- App Check erst nach echter Safari/iPad-Kompatibilitätsprüfung erzwingen.

## Nächster konkreter Schritt

Auf `feature/classroom-student-management-v1` ausschließlich eine statische, Firebase-freie Mock-Testseite für die UI-Abnahme bauen: Klassenübersicht, 9b/Fake-Kürzel, Klassencode/QR, Zugangscode-Karten, Klassenfreigabe und Schüler-Home/Lobby. Noch keine echten Daten und kein normales Staging.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt / Zeitpunkt: 2026-10-05 UTC – Masterarchitektur + Task/Registry/State auf main dokumentiert und Koordinations-CI grün
- Gepushter Codecommit / Remote-Branch: Branch `feature/classroom-student-management-v1` existiert auf Basis `bb91ce3590...`, noch ohne eigenen Produktcommit
- Ungesicherte Änderungen / Checkout-Pfad: keine / kein lokaler Checkout
- Laufende oder unklare Vorgänge: keine
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: keine bezahlten KI-/Provideraktionen; keine Deploymentkosten ausgelöst
- Was darf noch nicht als erledigt gelten: UI-Prototyp, Backend, Rules, Emulator, CI, Preview, Gerätetest, Integration, Staging, Production
- Was muss vor Wiederholung geprüft werden: aktuellen Integration-HEAD, Live Development Status, PR #137/i18n, Secure-Assessment-Dateien und offene PRs
- Genau ein nächster ausführbarer Schritt: isolierte Mock-Testseite auf Aufgabenbranch bauen

Vor Übernahme [../docs/CHAT_RECOVERY.md](../docs/CHAT_RECOVERY.md) lesen. Chatwechsel ersetzt keine Commit-/CI-/Deploy-Prüfung.
