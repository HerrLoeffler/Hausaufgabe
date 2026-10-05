# Aufgabe: GC-CLASSROOM-01

- Aktualisiert (UTC): 2026-10-05
- Verantwortlicher Chat / Auftrag: Codex-Fortsetzung – Identitäts-/ASV-Architektur für Schuljahreswechsel präzisieren, ausschließlich Dokumentation
- Chat-Bezeichnung / Link: aktuelle Codex-Fortsetzung, Link unbekannt; Referenzchat „Schülerintegration Codekonzept“, Gesprächs-ID `6abae2b9-f014-83eb-83af-ad9057cf7ba5`
- Vorheriger Chat / Übernahmezeitpunkt: 05.10.2026 UTC; Referenzchat gelesen, gelesene Schritte abgeschlossen. Kein laufender Classroom-Implementierungsauftrag nachgewiesen; alter nicht zugänglicher Checkout unbekannt. Aktueller Auftrag ist dokumentarisch.
- Arbeitszustand: aktiv – Identitäts-/Schuljahreswechsel-Entwurf gesichert, noch keine Produktimplementierung
- Aufgabenbranch: `feature/classroom-student-management-v1`
- Basiscommit: `feature/gradecrew-app-integration@bb91ce3590d773472ece60c4dd881da729bd32c1`
- Integrationsziel: `feature/gradecrew-app-integration`
- Produkt-PR: keiner
- Dokumentationsbranch: `docs/gc-classroom-01-identity-rollover-20261005` → `main`; separate Review-Änderung unter derselben Task-ID
- Dokumentations-PR: [#141](https://github.com/HerrLoeffler/Hausaufgabe/pull/141), Draft; nicht auf main integriert
- Gesicherter Architekturcommit: `5a4f6d94101ed09b654c356116112dc01d760142`; aktueller Folgecommit sichert ausschließlich diese PR-/Checkpoint-Zuordnung
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

Konkretes ASV-Exportprofil anhand der Spaltenüberschriften und synthetischer Beispiele bestätigen: dokumentiertes lokales Differenzierungsmerkmal, Stabilität, Quell-Namensraum und Schulart/Trägerschaft. Danach den neuen Architekturentwurf fachlich prüfen. Die zuvor geplante Mock-Testseite ist in diesem Auftrag nicht freigegeben.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt / Zeitpunkt: 2026-10-05 UTC – Identitäts-/ASV-Jahresabgleich im aktuellen Dokumentationscommit auf `docs/gc-classroom-01-identity-rollover-20261005`; frühere main-/CI-Belege bleiben im Verlauf erhalten
- Gepushter Codecommit / Remote-Branch: Branch `feature/classroom-student-management-v1` existiert auf Basis `bb91ce3590...`, noch ohne eigenen Produktcommit
- Ungesicherte Änderungen / Checkout-Pfad: keine Produktänderungen im zugänglichen i18n-Checkout; eigener Dokumentationsentwurf `classroom-identity-review`; früherer nicht zugänglicher Checkout unbekannt
- Laufende oder unklare Vorgänge: kein Classroom-Produkt-/Deployauftrag nachgewiesen; Dokumentations-PR/Koordinations-CI anhand der aktuellen GitHub-Metadaten prüfen
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: keine bezahlten KI-/Provideraktionen; keine Deploymentkosten ausgelöst
- Was darf noch nicht als erledigt gelten: UI-Prototyp, Backend, Rules, Emulator, CI, Preview, Gerätetest, Integration, Staging, Production
- Was muss vor Wiederholung geprüft werden: aktuellen Integration-HEAD, Live Development Status, PR #137/i18n, Secure-Assessment-Dateien und offene PRs
- Genau ein nächster ausführbarer Schritt: ASV-Exportprofil mit bestätigtem Differenzierungsmerkmal und synthetischen Beispielen prüfen

Vor Übernahme [../docs/CHAT_RECOVERY.md](../docs/CHAT_RECOVERY.md) lesen. Chatwechsel ersetzt keine Commit-/CI-/Deploy-Prüfung.


## ASV-/CSV-Import und Datenschutzreview – 05.10.2026

Rechts-/Architekturprüfung gesichert: [CLASSROOM_ASV_IMPORT_PRIVACY.md](../docs/privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md).

Entscheidung:
- ASV-/CSV-Import wird für V1 privacy-first clientseitig geplant.
- Rohdatei, Vorname, Nachname und rohe ASV-Referenz verlassen den Browser nicht.
- Kein namensbasiertes Akronym/Initialenstandard; stattdessen zufälliges Alias.
- Persönlicher Zugangscode ist eine separate geheime Credential und nicht aus Name/Alias abgeleitet.
- Die Lehrkraft bekommt lokal eine Mapping-Datei Name ↔ Alias ↔ Code.
- Formelle Prüfungen nutzen von der Lehrkraft provisionierte/verifizierte Identitäten; Self-Join bleibt separater schwächerer Modus.
- GradeCrew bleibt bei Schüleridentitäten datensparsam; keine Namen/Aliase/ASV-Referenzen in Telemetrie oder AI-Prompts.
- Vor echtem Schuleinsatz sind AVV, TOMs, Unterauftragsverarbeiter, Art.-13-Information, Lösch-/Retentionkonzept und DSFA-Erforderlichkeitsprüfung notwendig.
- Digital gespeicherte Leistungsnachweise und technische Accountdaten bekommen getrennte Aufbewahrungsregeln.

Rechtlicher Ausgangspunkt:
- Art. 85 Abs. 1 BayEUG: Erforderlichkeit;
- § 46/Anlage 1 BaySchO: Verfahrensrahmen digitaler Anwendungen;
- Art. 5, 25, 28, 32 DSGVO: Datenminimierung, Privacy by Design, Auftragsverarbeitung, Sicherheit;
- § 37/40 BaySchO: digitale Leistungsnachweise / Aufbewahrung.

Auf GitHub gesichert:
- Privacy-Review: `7800e882...`
- Masterplan ergänzt: `305bf41e...`

Damals geplanter Folgeschritt: statische Firebase-freie Mock-Testseite. Der aktuelle Nutzerauftrag priorisiert zunächst die nachstehende Identitäts-/Schuljahreswechsel-Architektur und erlaubt keine Implementierung.

## Identität / Schuljahreswechsel – aktueller Architekturentwurf 05.10.2026

Dokument: [CLASSROOM_IDENTITY_ASV_ROLLOVER.md](../docs/privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md).

- Gesichert: schriftlicher Architekturvorschlag, kein Produktcode.
- Belegte ASV-Grundlage: offizielles lokales Differenzierungsmerkmal ist innerhalb der ASV-Datenbasis eindeutig, bleibt beim Schuljahreswechsel erhalten und wird nicht wiedervergeben; konkrete CSV-Spalte noch unbekannt.
- Empfehlung: lokal HMAC-SHA256 mit schulisch verwaltetem Schlüssel berechnen; GradeCrew speichert nur schulbezogenen matchKey → zufällige StudentIdentity. Verschlüsseltes schulisches Mapping bleibt alternative Betriebsart.
- Schulmandant, Quell-Namensraum, Schlüsseltresor, Vertretung, Backup/Recovery und Schlüsselprüfung vor Import sind Voraussetzungen.
- Account bleibt bei Klasse/Name/Jahr stabil; neue Jahresklassen/Memberships, historische Ergebnisse unverändert. Keine automatische schulübergreifende Verknüpfung.
- Teilimporte lösen keine Abgänge aus. Fehlende Personen im vollständigen Bestand sind Prüfkandidaten; keine automatische Kontolöschung.
- Klasse, Alias und persönlicher Zugangscode sind keine Wiedererkennungsschlüssel. Codes bleiben bei Jahreswechsel gültig; dauerhafte Zuordnung enthält keine Codes.
- Idempotente Importvorgänge, Revision/Lease, Abbruchfortsetzung und kontrollierte Migration sind spezifiziert, noch nicht implementiert.
- Pseudonyme Daten bleiben im Schulverfahren personenbezogen; Retention nach Datenkategorie und Verfahrensrahmen, kein unbegrenztes Jahresarchiv.

Frisch geprüft:
- Produkt-/Integrationsbranch beide `bb91ce3590d773472ece60c4dd881da729bd32c1`, `+0/-0`, kein Classroom-Produkt-PR.
- Development Status [37326636949](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37326636949) erfolgreich, Warnungen anderer Workstreams erhalten; i18n-PRs #137/#139 betreffen spätere Web-/Assessment-Integration, keine Classroom-Dateiänderung.
- Aktueller main vor Dokumentationsvorbereitung: `8360bc5f056837118ffd83138ffa2468ae42647e`; fremde Dokumentationsarbeit erhalten.
- Bestehende Staging-Runs 37238585607/37238585657 erfolgreich; kein Classroom-Deploy. Workflow-head ist allein kein Beweis für deployten Produkt-SHA.
- Letzter gesicherter Produktstand unverändert. Lokaler Dokumentationsentwurf in eigenem Verzeichnis `classroom-identity-review`; keine Änderungen im vorhandenen i18n-Checkout.
- Keine neuen bezahlten Provider-Aufrufe, keine Budgetreservierung, kein Controller-/Deploy-Start. Vorherige Versuchshistorie bleibt erhalten.
- Historische nächste Schritte und frühere Mapping-Entscheidungen sind durch den aktuellen dokumentarischen Auftrag präzisiert. Dieser Vorschlag ist noch keine Implementierungsfreigabe.

Offen: tatsächliche Exportspalten, Schulart/Trägerschaft, schulische Tresor-/Recovery-Betriebsweise, endgültige Datenfristen und fachliche Entwurfsprüfung.

Genau ein nächster Schritt: konkretes ASV-Exportprofil ausschließlich anhand der Überschriften und synthetischer Beispiele bestätigen.

Dokumentationsprüfung vor Commit: JSON lesbar; unveränderte fremde TODO-/Registry-/Release-Einträge; nur Classroom-next_action/Related-Branch angepasst; interne Verweise und Markdown-Codeblöcke geprüft. Keine Anwendungstests ausgeführt, da ausschließlich Dokumentation geändert wurde. Produkt-CI bleibt `not_run_no_product_code`.

GitHub-Sicherung geprüft: Architekturdatei entspricht bytegenau dem Entwurf; Commit und PR ändern ausschließlich die sieben genannten Dokumentations-/Koordinationsdateien. Automatische Koordinationsprüfungen werden für den jeweils aktuellen PR-Head geprüft; deren Erfolg ist kein Produkt-CI-/Deploynachweis. PR bleibt Draft zur fachlichen Prüfung, main wurde durch diesen Auftrag nicht verändert.
