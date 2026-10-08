# Aufgabe: GC-CLASSROOM-01

- Aktualisiert (UTC): 2026-10-07
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

## Lehrkraftwechsel – Ergänzung zum selben Entwurf

Der aktuelle Nutzerwunsch „welche Lösung für den Lehrer, wenn der wechselt?“ ist in Abschnitt 10a des [Identitätsentwurfs](../docs/privacy/CLASSROOM_IDENTITY_ASV_ROLLOVER.md) konkretisiert.

Empfehlung: Schulbereich mit persönlichen Lehrkraftkonten, verifizierter Administration und aktiver Stellvertretung; zuständigkeitsbezogene Rechte nach Klasse/Kurs/Fach/Zeitraum. Ersteller-UID ist Autorenschaft, keine dauerhafte alleinige Datenkontrolle. Kontrollierte Übergabe mit Wirksamkeitstermin betrifft GradeCrew-Rechte und schulische Namenszuordnung. Alte Rechte enden, Schülerkonten/Codes bleiben. Historische Leistungen und private Testentwürfe werden nicht pauschal weitergegeben.

Zusätzlich präzisiert: Serverprüfung aktueller Rechte trotz bestehender Sessions; Vertretung, dringender Entzug, laufende Prüfungen, lokale Restkopien, Adminwechsel/Schlüsselrotation und verifizierte Recovery bei vollständigem Kontenausfall. Dies sind Entwurfsanforderungen, noch nicht implementiert.

Frisch geprüft: Dokumentations-PR #141 offen/Draft, vorheriger Head `69a1db48471b351e3682375d9bedf235e3d62ff2`; Produkt- und Integrationsbranch weiterhin `bb91ce3590d773472ece60c4dd881da729bd32c1`. Development Status Run `37364135175` für den vorherigen Dokumentationshead erfolgreich; Handoff-Check `37364135244` bei Prüfung noch queued. Diese Belege gelten nicht automatisch für den Folgecommit.

Task-ID, Budget-/Versuchshistorie und Release-Stufe bleiben erhalten. Keine Implementierung, Provideraktion oder Deployment. TODO-Zeile und Masterplan im bestehenden Dokumentations-PR ergänzt. Nächster Schritt bleibt: ASV-Exportprofil und schulische Betriebsweise mit synthetischen Beispielen bestätigen.

Nutzerergänzungen derselben Runde: Lehrkräfte ebenfalls aus ASV übernehmen; mehrere Fachlehrkräfte pro Klasse mit eigenen Prüfungen. Abschnitt 10b präzisiert Personalbestand → verifizierter persönlicher Login → bestätigte Fach-/Klassenrechte; eigene HMAC-Domäne für Lehrkräfte, stabile schoolTeacherId, keine automatische Adminvergabe. Gemeinsame Klasse/Schüleridentitäten, unabhängige Deutsch-/Englischprüfungen, begrenzte Ergebnissicht und ausdrückliches Co-Teaching. Konkretes Personal-/Unterrichtsexportprofil noch offen; keine Implementierung.

## Konzeptabschluss eingeordnet – 07.10.2026

Nutzerfrage: „Sind wir mit dem Konzept fertig?“

Bewertung **8/10 ausschließlich für den Konzeptabschluss von GC-CLASSROOM-01**, als begründete Einschätzung, kein Prozentwert und keine Bewertung des gesamten GradeCrew-Projekts. Identität/Jahreswechsel, Abgleichfälle, Schulmandant, Lehrerimport, mehrere Fachlehrkräfte, Zuständigkeitsübergabe und Recovery sind schriftlich ausgearbeitet. Ein vollständig bestätigter, fachlich geprüfter Konzeptabschluss ist noch nicht erreicht.

Offene Abschlussfestlegungen:
1. Konkretes ASV-Exportprofil für Schüler-/Lehrkraftkennung und Unterrichtszuordnung bestätigen.
2. Schulisch freigegebenen Schlüsseltresor samt verantwortlicher Administration/Stellvertretung, Backup und Wiederherstellung konkret auswählen.
3. Schulart/Trägerschaft, erforderliche Ergebnis-/Archivzugriffe und Datenfristen fachlich/datenschutzseitig abschließend prüfen; Entwurf als Ganzes bestätigen.

Risiko: Das beschriebene HMAC-Verfahren hängt von verlässlicher schulischer Schlüsselverwahrung ab. Ohne Wiederherstellung oder verifizierte Zuordnung kann ein verlorener Schlüssel nicht aus den serverseitigen Pseudonymen rekonstruiert werden. Dokumentation allein bestätigt noch keinen sicheren Praxisbetrieb.

Frische Nachweise:
- PR [#141](https://github.com/HerrLoeffler/Hausaufgabe/pull/141) weiterhin offen/Draft, geprüfter Architekturhead `68f939a8dba8a54500bf754a3f2e8e3244e4e4cb`, nicht auf main integriert.
- Handoff-Prüfung `37365665369` an diesem Head erfolgreich. Development-Status-Run `37365664901` wird als failure geführt; sein Job `111950064126` ist cancelled. Logabruf liefert BlobNotFound; daher keine fachliche Ursache ableiten und diesen Lauf nicht als grün melden.
- Jüngster bei Prüfung sichtbarer main-Development-Status `37680310264` erfolgreich. Das ersetzt keine Prüfung des aktuellen PR-Folgecommits.
- Aktuelles main führt GC-CLASSROOM-01 weiterhin `branch_only`, Produkt-CI `not_run_no_product_code`, Staging `not_deployed`, Nutzertest `not_performed`.
- Diese Runde prüft und aktualisiert ausschließlich Konzeptstatus/Übergabe/TODO; keine Implementierung, Provideraktion, neue Budgetreservierung, Integration oder Deploy.

Genau ein nächster ausführbarer Schritt: ASV-Exportprofil anhand von Spaltenüberschriften und ausschließlich synthetischen Beispielen bestätigen.

## Schuladministration und ASV-Punkt verständlich geklärt – 07.10.2026

Nutzerpräzisierung: Eine oder mehrere Personen können in der Schulverwaltung als beauftragte Verwaltungspersonen zugeordnet werden. Im Entwurf festgehalten: persönliche Konten, verifizierte schulische Benennung, begrenzte Adminrechte; mindestens eine zuständige Person plus aktive Stellvertretung empfohlen. Der ASV-Import allein vergibt keine Adminrolle. Das Rollenmodell beantwortet „wer verwaltet“, noch nicht den konkreten Tresor-/Backup-Betrieb.

Punkt 1 „ASV-Export bestätigen“ bedeutet in Alltagssprache: Die exportierte Tabelle muss die dauerhaft gleiche Kennnummer einer Person enthalten. Beispiel mit synthetischen Daten: ID 4711 bleibt beim Wechsel von Klasse 9b/2026–27 nach 10b/2027–28 gleich. Eine Zeilennummer oder jährlich wechselnde Export-ID reicht nicht. Wir benötigen zur Bestätigung die Feldbezeichnung bzw. das Exportprofil, keine echten Schülerdaten.

Weiterhin offen: tatsächliches Schüler-/Lehrkraft-/Unterrichtsexportprofil, konkrete schulische Schlüsselablage und Recovery, fachliche Prüfung von Zugriffs-/Datenfristen. Keine neue Abschlusswertung, keine Implementierung/Integration/Deployfreigabe; Release-Stufe bleibt branch_only. Historie/Budget bleiben erhalten.

Genau ein nächster Schritt: tatsächliche ASV-Spaltenüberschriften für die stabilen Personenkennungen prüfen.


## Lehrer-/Schülernavigation und Testübersicht – 08.10.2026

Der Nutzer beschreibt die Lehreransicht als überladen: beim Öffnen erscheinen rund 20–30 Tests ohne klare Ordnung. Für denselben Task wurde deshalb ein V1-Bedienkonzept ergänzt: [CLASSROOM_TEACHER_UX_V1.md](../docs/CLASSROOM_TEACHER_UX_V1.md).

Kernausrichtung: Lehrkraft startet auf einer aufgabenorientierten Übersicht. Klassen sind der wichtigste fachliche Einstieg. Die zentrale Testübersicht gruppiert eindeutige Tests nach Klasse → Fach und bietet Status-Ansichten/Filter für Entwürfe, Geplantes, Aktives und Abgeschlossenes. In der Klassenseite sind Schüler:innen und Tests als getrennte Reiter erreichbar; mehrere Fachlehrkräfte teilen denselben Klassenbestand, sehen aber nur ihre erlaubten Fächer und Ergebnisse. Schüler:innen sehen eine kleine persönliche Liste mit anstehenden, aktiven und erledigten Tests.

Das ist ein Konzeptvorschlag innerhalb GC-CLASSROOM-01, keine Umsetzung oder Freigabe. Die Ablage nach Klasse/Fach ist Navigation/Ansicht, keine Kopie von Tests und keine Änderung an Secure Assessment. Vor Implementierung noch an realer Oberfläche und Test-Erstellungsablauf prüfen.

Nächster ausführbarer Schritt für diesen Teil: diesen Ablauf anhand eines klickbaren, nicht produktiven UI-Modells bzw. der bestehenden Oberfläche auf Verständlichkeit prüfen, nachdem die vorliegende Struktur fachlich abgestimmt ist. Unabhängig davon bleiben ASV-Spalten, Schlüsseltresor/Recovery sowie Zugriffs- und Aufbewahrungsprüfung aus dem Identitätskonzept offen.

## Sichtbarkeit einer Klassenprüfung – Ablauf ergänzt, 08.10.2026

Nutzerfrage: Was sieht ein Schüler, bevor Lehrkräfte etwas zuweisen, und wie erscheint z. B. eine Technikprüfung?

Festgehalten: Ein Schülerkonto zeigt zunächst eine verständliche Leeransicht. Ein Quizentwurf ist privat. Die Techniklehrkraft wählt beim expliziten Veröffentlichen den bestätigten Kurs „Klasse · Fach“, Zeitraum und etwaige gezielte Schüler-Ausnahmen. Server prüft ihre Zuständigkeit, bereitet die feste Zielgruppe vollständig vor und gibt danach die Zuweisung frei. Der Schüler sieht den Test bei „Anstehend“ oder „Jetzt verfügbar“ mit Fachlabel Technik. Nachträge sind ausdrücklich; spätere Klassenaufnahmen fügen sich nicht heimlich in einen bereits veröffentlichten Test ein. Beendete Mitgliedschaft sperrt Zugriff. Ergebnis-/Notenfreigabe bleibt separat.

Liste und Startversuch werden serverseitig anhand persönlicher StudentIdentity, aktiver Mitgliedschaft, Zielgruppenfreigabe, Zeitraum und Rechten geprüft. Testversuch/Bewertung bleiben bei Secure Assessment. Kein Code oder Deploy ausgeführt. Detaillierter Ablauf: [Lehrer-/Schüler-UX](../docs/CLASSROOM_TEACHER_UX_V1.md), besonders Abschnitt „Von der Lehrkraft bis zum Test auf dem Schülergerät“.
