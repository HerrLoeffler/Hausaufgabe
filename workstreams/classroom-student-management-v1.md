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


## UX-Prototyp – Checkpoint 11.10.2026

Prüffrage: Versteht eine Lehrkraft, dass ein Testentwurf privat bleibt und erst nach ausdrücklicher Zuweisung zu Klasse/Fach bei den richtigen Schüler:innen erscheint? Sieht ein Schüler ohne Freigabe den erklärenden Leerzustand, der Zugewiesene den Test zum korrekten Zeitpunkt und ein anderes Schülerkonto aus 9c keinen Zugriff?

Produktbranch: feature/classroom-student-management-v1. Gesicherter Prototype-Commit: 17fc4278e2e58f124f0c5624d39513fdfa9833d2 (Parent bb91ce3590d773472ece60c4dd881da729bd32c1). Neue einzige Branch-Datei: prototypes/classroom-student-management/index.html. Es ist eine statische, eigenständige HTML-Vorschau mit erfundenen Schüler:innen und einer 9b-Technik-Klasse; keine CSV, keine ASV-Werte, keine Firebase-/Serververbindung, keine App-Verdrahtung. Lokale Review-Kopie: classroom-prototype-preview/index.html im aufrufenden Projektarbeitsbereich.

Geprüft: Remote-Datei stimmt bytegenau mit lokaler Kopie überein (29.185 Bytes); HTMLParser akzeptiert Dokument; eingebettetes JavaScript syntaktisch erfolgreich geparst; keine externen URL-Referenzen, Fetch-/XHR-Aufrufe oder Browser-Speicherung gefunden. Ein visueller Klicktest wurde nicht ausgeführt: die verfügbare Browseroberfläche blockierte file:// ausdrücklich; alternative Browser-/Ausführungswege wurden nicht verwendet. Menschliche Sicht-/Bedienprüfung bleibt offen.

Keine App-CI, kein Produktcode in der GradeCrew-Weboberfläche, keine PR für den Produktbranch, keine Integration, kein Staging und kein Production-Deploy. Classroom Release-Stufe bleibt branch_only. Der separate Dokumentations-PR #141 bleibt offen/Draft und unverändert in seiner Rolle.

Exakte nächste Aktion: Martin öffnet die lokale Review-Kopie und beurteilt den Ablauf „Lehrkraft weist 9b · Technik zu → Zielschüler sieht geplant/aktiv → fremde Klasse bleibt ausgeschlossen“. Seine Rückmeldung ist noch ausstehend. Danach UI-Korrektur am Mock; reguläre Produktimplementierung oder Staging separat beauftragen/freigeben.

## Übernahme und sichere Bestandsprüfung – 16.10.2026

Task GC-CLASSROOM-01 bleibt erhalten. Ausführender Fachagent: classroom_integrated_preview, beauftragt durch GradeCrew Zentrale; vorheriger Fachchat GC · Schüler, Klassen & ASV als Quelle, aktuelle Chatlinks unbekannt. Keine vollständigen Chatkopien übernommen. Nutzerauftrag ersetzt den früheren ausschließlichen Standalone-Mockauftrag: ein gemeinsamer detaillierter Umsetzungsplan und danach lokale Testseite innerhalb der echten aktuellen GradeCrew-App; kein Deploy/Production, keine echten Schülerdaten oder Providerstarts.

- Isolierter Checkout: gradecrew-classroom-integrated-20261016; Branch feature/classroom-integrated-preview-20261016, Start-SHA 8f8697901f8c1aea89897be855ca2872c82d0f2b (kanonisches gc39-Staging). Keine konkurrierenden Audio-/Crew-V3-Branches übernommen; Ports 8779/8780/8781 bleiben frei von diesem Auftrag.
- Frische Koordinationsquelle: main 8560992c072779814017ebac6e86b65e938bc951. START_HERE, AGENTS, STATE, TODO, Registry, README, CHAT_CONTRACT, CHAT_RECOVERY, SkillsMapping, Assurance mit beiden Rollen und Katalogen über GitHub-Connector gelesen. Lokales main ist veraltet und wird nicht als aktuelle Quelle verwendet.
- Live Development Status 38809750925 / Job116679689447: success. Primary17fc4278e2e58f124f0c5624d39513fdfa9833d2 +1/-134 zum Integrationsziel; einzige neue Datei prototypes/classroom-student-management/index.html. DraftPR141 offen, Head9b23052e7bb3a8e6009cca64a7498d942cd7bc1d, acht Dokumentationsdateien, kein Produkt-PR. Alter Einzelmock vom Nutzer abgelehnt. Aktuelle TeacherUX hat Vorrang: Navigation Übersicht/Klassen/Tests und drei Klassenreiter Übersicht/Schüler/Tests.
- Git-DNS löst github.com derzeit nicht auf; GitHub-Connector funktioniert. Native Worktree-Anlage meldete Not a git repository im Projektmirror; deshalb isolierter manueller Worktree aus vorhandenen exakten Gitobjekten, keine fremden lokalen Änderungen verändert. Fehlende Promisor-Draftblobs aus Connector gelesen. Fünf bestehende Konzept-/Übergabedateien aus dem Drafthead bytegetreu als Ausgangsbasis übernommen; Historie bleibt erhalten.
- Baseline: 29/29 Tests in guest-tour-port.test.mjs, secure-assessment-client.test.mjs, gradecrew-entry-bootstrap.test.mjs, practice-solution-publication.test.mjs bestanden. Zuerst fehlte jsdom; vorhandene Installation temporär verlinkt und anschließend Link entfernt. Wiederholung exit0, jedoch bestehende jsdom-Teardown-Konsolenmeldung document is not defined im Entry-MutationObserver; deshalb kein vollständig störungsfreier Konsolenlauf behauptet.
- Runtime: gebündeltes Node24.19.0, vorhandene Playwright/jsdom/FirebaseTools-Pakete. Java-Aufruf ist nur macOS-Stub, keine lokale JDK/JAR in den begrenzt geprüften Orten nachgewiesen. Firestore-/Auth-/Functions-Emulatorausführung noch nicht belegt. Bestehendes Assessmentprofil enthält nur Firestore8085; Handler-.run()-Tests sind kein Browser/Auth-E2E.
- Skills tatsächlich gelesen: using-superpowers (Subagent-Stop), brainstorming, writing-plans, frontend-design, gradecrew-prototype samt Probevertrag, using-git-worktrees, executing-plans, test-driven-development, verification-before-completion. Angefordert gpt-6.1-sol/medium für übergreifenden Auftrag; beobachtetes Runtime-Modell/Effort und Usage/Preise unknown. Keine Modellwechsel, Providerstarts oder neuen Budgetreservierungen. Historische Versuche/Budgets nicht zurückgesetzt.
- Release unverändert branch_only; kein neuer Produktcode, App-CI, Merge, Hosting-/Functions-/Rules-Deploy, physischer Gerätetest oder Production. Dokumentations-PR141 bleibt Konzeptquelle, nicht als Produktintegration ausgegeben.

Relevanter Assuranceumfang (Implementierungsowner classroom_integrated_preview; unabhängiger Reviewer von Zentrale zuzuordnen): SEC03/06/07/08/11/14/15/17 für SDK-Grenze, Identität, Rechte, Zustandsübergänge und Projektionen; PRIV04/07/08/12/15/17/20 für RAM-only CSV, Datensparsamkeit, Drittempfänger, ehrliche Demoaussagen, Tastatur und Datenlebenszyklus. Aktueller Status sämtlich nicht geprüft im neuen Produktdiff, weil noch kein Produktcode. Echte Schul-/AVV-/ASV-/Tresor-/Fristenfragen bleiben offen; reine synthetische lokale UI-Arbeit ist davon unabhängig. Kein Vollscan/keine Rechtsfreigabe.

Genau nächster Schritt: den von der Zentrale gebündelten einzigen Umsetzungsplan übernehmen, selbst prüfen und vor Produktcode checkpointen; danach native Ausführung im selben sicheren Checkout.


### Zwischenstand A – lokale Fachlogik und sichere Grenze

Planreview durch classroom_contract_review: kein Startblocker; drei Präzisierungen verbindlich übernommen: headerloses Pipeprofil ohne Whitespace-Rekonstruktion, schulbezogene Adminprüfung und atomarer Import mit Revisionsprüfung. Die ursprünglichen acht Domain-/CSVtests erst rot (fehlende Module), danach grün; zusätzlicher Admin-/Atomizitätstest erst rot, danach grün. Mehrtest-Editorport und Remote-SDK-Grenztest ebenfalls erst rot, danach grün. Aktuell 12/12 Tests einschließlich bestehendem guest-tour-port bestanden. Lokaler Parser erhält führende Nullen, Quotes/Zeilenumbrüche, BOM und zehn headerlose Pipespalten. Keine echten Exportwerte übernommen.

Neue Dateien: classroom/csv.mjs, repository.mjs, app-repository.mjs, demo-sdk.mjs mit Verhaltenstests sowie tools/classroom-preview/server.mjs. Bestehender guest-tour-port bekommt nur eine optionale Test-ID, Legacydefault unverändert. Mehrtestadapter delegiert weiterhin an diesen vorhandenen Port; kein neuer Editor oder Grader. Server liefert Originalindex mit vorinitialisierter Importmap/CSP. Noch NICHT mit dem Appcontroller verdrahtet, noch kein Browsernachweis oder Backendnachweis.

Lokaler Dokumentationscommit5ae32268 und Remotecheckpoint7d1e2b259e1699dcf33dbb67e96e121729511311 haben denselbenTree2d195752b09f6b82815826cb801ee18c150243b7. Verschiedene Commitmetadaten durch Connectorfallback, kein Inhaltsunterschied. GitDNS weiterhin blockiert; Connector GitBlob/Tree/Commit/Branch-Sicherung funktioniert. Nächster Schritt: originale App mit kleinem lokalen Port anbinden und Controller für Navigation, Import und Zuweisung bauen.

### Zwischenstand B – echte App angebunden, Browserprüfung beginnt

app.js und startup.js laden den Klassencontroller nur nach explizitem Loopback-Flag. Die vollständige Originalapp, EntryFlow und Workspace werden geladen. Der lokale AppPort öffnet und speichert dieselbe Quiz-ID im bestehenden GradeCrew-Editor; die vorhandene Veröffentlichungsschaltfläche leitet im Testmodus nach Save zur ausdrücklichen Klassen-/Fachzuweisung. Controller ergänzt Navigation, drei Klassenreiter, echte Dateiauswahl, Spaltenmapping, Vorschau, Importbestätigung und persönliche Testansichten. Neue UI nutzt Originalkomponenten und --gc-Tokens. Noch keine endgültige visuelle Abnahme.

Früher unabhängiger Review auf c12bfc fand drei lokale Vertragsfehler: RollOver ohne Schulfilter, Wiederimport im neuen Jahr ohne neue Membership, Schülerprojektion mit fremden Empfängern. Alle drei mit zuerst roten Regressionstests reproduziert, Ursachen korrigiert; nun 15/15 einschließlich Controller-Integrationstest grün. Keine reale Cloudlücke aus diesen Demobefunden behauptet.

Startversuche erhalten: Server8782 zunächst EPERM in Sandbox; beauftragter ausschließlich lokaler Start über automatische Ausführungsprüfung erfolgreich, Session1827. Playwrights gebündelter Browser nicht installiert; vorhandenen Chrome gewählt, erster Sandboxlaunch SIGABRT/EPERM. Kein Download, keine Sicherheitskonfiguration geändert. Isolierter Headless-Chrome außerhalb Sandbox durch automatische Prüfung zugelassen; erste Browserprüfung läuft unter Session28033. Noch kein erfolgreicher UI-/Network-/Storageclaim vor Auswertung. Exakte neue Browserfehler werden im nächsten Prüfbericht gesichert. Keine anderen Ports/Prozesse verändert.

Nächster Schritt: diesen Produktcheckpoint remote sichern und dann echte Browserbefunde auswerten; nach gezielten Fehlerkorrekturen den durchgängigen CSV-/Editor-/Zuweisungs-/Schülerablauf und visuelle Erhaltung prüfen.

### Zwischenstand C – zwölf echte Browserfälle nachgewiesen

Isolierter Chrome lief erfolgreich gegen http://127.0.0.1:8782. Zwölf Autor-Browserfälle bestanden: vollständiger Start; private Entwürfe unsichtbar; bestehendes QTECH im Originaleditor geändert/gespeichert und mit derselben ID zugewiesen; richtige Klasse sichtbar, andere Klasse/Schule leer; Nachzügler zuerst ausgeschlossen und danach ausdrücklich ergänzt; echter Filepicker mit zehnspaltiger headerloser Pipe-Datei, Wiederimport und Teilimport; Lehrer-/Unterrichtsimport ohne automatische Kontoaktivierung; begrenzter Fachlehrerwechsel ohne privaten Entwurfstransfer; schulbezogener Jahreswechsel; Reset, schmale Ansicht und Tastaturfokus; originale Startseite erreichbar. Browserbericht: errors=[], external=[], notFound=[], localStorage={}, sessionStorage={}. Nur synthetische Daten.

Erster Browserfolgelauf scheiterte am Testskript: das originale Titelfeld liegt in zugeklappten Test-Einstellungen. Der Test öffnet nun die echte Summary, kein Produktlayout wurde dafür umgebaut. Einziger 404 war release.json im Quellcheckout; der lokale Server liefert jetzt eine klar bezeichnete lokale gc39-Releaseinformation. Keine echte Release-/Deploybehauptung. Standardfixture Toni auf9b/Technik begrenzt; Sam besitzt ausdrücklich5a/Deutsch und9c/Technik.

Belege im gemeinsamen Projektarbeitsbereich outputs/classroom-20261016: overview.png,real-editor.png,csv-preview.png,student-now.png,mobile.png,original-home.png,browser-report.json. Erste Homepageaufnahme ist ein Zwischenstand; vollständige Animation und anonymer Stagingvergleich folgen noch. Coco-AI, echte Anmeldung und administrative Remoteoperationen werden in der lokalen Probe nicht ausgeführt. Originalquellen bleiben erhalten.

Katalog für zentrale neue englische Navigation/Dialoge eingebunden, keine vollständige Übersetzungsabnahme behauptet. Plan enthält nun lesbare verbindliche Präzisierungen für headerlose Pipes, Atomizität/Adminactor, Jahreskontext, Schülerprojektion und den neuen originalen Erstellungsablauf. Staging-Buildprüfung erfolgreich:171Dateien. Regressionsprüfungen entdeckten extrahierte Originalfunktionstests ohne classroomPreview-Bindung; neuer expliziter Previewzweig prüft deshalb typeof sicher. Vor dem nächsten Browserlauf wird dieser Kandidat gesichert.

Restprüfungen: wirklich neuen Test über ursprüngliche Erstellungsansicht/Manuell/Editor mit neuer ID speichern und zuweisen, Anstehend/Erledigt/entfernt, Englisch-Smoke, echte Modalbedienung, vollständig geladener Startseitenvergleich. Kein neuer Backendumfang. Server aktuell Session16806, anderer Port unverändert. Autorprüfung, unabhängiger Review und physischer Gerätetest getrennt.

Checkpoint-C-Nachprüfung:43/43 gezielte Classroom-,Entry-,Guestport-,SecureClient- undPracticeRelease-Tests bestanden. Ein zusätzlicher VM-Kompatibilitätsfehler war vor diesem Lauf sichtbar: vorhandener Entrytest führt app.js nach Importentfernung als normales Skript aus, wodurch neu eingeführtes Top-Level-await scheiterte. Lokaler Port wird nun über einen normalen nebenwirkungsfreien Modulimport eingebunden; kein Top-Level-await mehr. Bestehende jsdom-Teardown-Konsolenmeldung bleibt im vollständigen Log erkennbar. Nächste Browserdatei enthält jetzt ausdrücklich den neuen manuellen Testablauf und den anonymen Stagingvergleich; diese zusätzlichen Fälle sind zum Checkpoint noch nicht ausgeführt.

### Autor-Endprüfung am eingefrorenen Produktkandidaten36597662113374b75259d74b9b72ec187ece83d3

Produktcode seit diesem Kandidaten unverändert. Lokaler entsprechender Commit e5f4cee02399504d2eb449c981df9bb8f015f5c1, identischerTree9cbf5211bfab17c4b991a5ad239489fee652c599. Nachfolgende Änderungen betreffen nur Browserprüfskript und Nachweise/Dokumentation. Unabhängiger Endreview durch classroom_contract_review von der Zentrale beauftragt; dessen Endurteil zum Zeitpunkt dieses Nachweises noch ausstehend. Früher unabhängiger Recheck der drei Domainkorrekturen bestanden.

- Breite Root-Suite:329/329 Tests, Exit0. Zusätzlich gezielter Classroom-/App-Regressionslauf43/43, Exit0. Bekannte Entry-jsdom-Teardown-Konsolenmeldung im gezielten Log erhalten; kein Produktbrowserfehler daraus abgeleitet. Staging-Build:171Dateien erfolgreich geprüft; kein Deployment.
- Echter Autor-Browserlauf:17/17 protokollierte Fälle bestanden, Chrome über vorhandene lokale Installation mit isoliertem temporären Profil. Keine Page-/Konsolenfehler, keine404 und keine fremden Netzwerkorigins auf der lokalen Testseite. CSV-/Quellkennungen und Namen nicht in Local-/SessionStorage; erfasster Stand vor UI-Sprachumschaltung war{} /{}. Die vorhandene Sprachwahl darf ausschließlich ihre allgemeine UI-Präferenz speichern.
- Neuer Testfall ausdrücklich bestanden: Kontext9b/Technik → originale GradeCrew-Erstellungsansicht → KI zeigt die lokale Sperre → Manuell erstellen → leere Originaleditor-Aufgabe mit echten Feldern ausgefüllt → Speichern → neueDEMO-ID → Zuweisung mit zukünftigem Zeitraum → dieselbeID unter „Anstehend“ der Zielperson. BestehenderQTECH-Test zusätzlich im Originaleditor geändert und unter identischerID für „Jetzt verfügbar“ zugewiesen.
- Weitere Browserfälle: privater Entwurf/Leere;9c und andereSchule ausgeschlossen; Nachzügler erst nach explizitem Nachtrag; erledigt und beendete Mitgliedschaft; echter Filepicker mit headerlosem10Pipeprofil einschließlich ersterZeile; idempotenter Wiederimport; Teilimport ohneAbgänge; Vollimport mit fehlendemEintrag nur zurPrüfung; Personal/Unterricht ohne automatische Kontoaktivierung; ModalTab/Escape; gewählter9bEnglisch-Transfer ohnePrivatentwurf; schulbezogener Jahreswechsel; Reset;390px-Ansicht ohne horizontalenÜberlauf; EN-Grundnavigation.
- Vollständige Originalstartseite nach Lade-/Scroll-/Animationsphase aufgenommen. Aktuelle kanonische Staging-Startseite anonym und ausschließlich lesend geöffnet: https://hausaufgabe-staging.web.app/ meldet meta app-version2.3.1-gc39,16Bildelemente. Beide tatsächlichen Bilder angesehen: Crew-Startbühne, Logo, Figuren und Benefitbereich vorhanden. Zusätzliche lokale Testleiste verändert den verfügbaren Viewport; keine Pixelidentität behauptet. Authabhängige Coco-AI-/ET-/Administrationsfunktionen nicht live aufgerufen. Quellen und bestehende normale Runtimepfade bleiben erhalten.
- Zwei weitere Testskriptkorrekturen ohne Produktänderung: Editor-Einstellungen nach vorigem Fall waren bereits offen; Test öffnet sie jetzt nur bei unsichtbarem Titelfeld. Zwei gültigeZuweisungen enthielten denselben Nachzüglerbutton; Test wählt nun gezielt dieQTECH-Zuweisung. Keine Abschwächung der fachlichen Assertions.

Reproduzierbarer Bericht: docs/classroom/evidence/20261016-browser-report.json. Vollständige lokale Bilder/Berichte im übergeordneten gemeinsamen Arbeitsbereich outputs/classroom-20261016: overview.png,real-editor.png,csv-preview.png,student-now.png,mobile.png,english.png,original-home.png,local-home-desktop.png,staging-home.png,browser-report.json. Nur synthetische Beispiele; keine Originalexportzeilen oder tatsächlichen Personenkennungen übernommen. Ein Autor-Browserlauf ist kein unabhängiger Review oder physischer Gerätetest.

#### Start und konkreter Klickpfad

Laufende Testseite http://127.0.0.1:8782/, eigenerServer Session16806. Neu starten bei Bedarf im Aufgabencheckout mit dem gebündeltenNode: `node tools/classroom-preview/server.mjs` (127.0.0.1:8782, keine anderenPorts). Der Connectorfallback hat Code auf feature/classroom-integrated-preview-20261016 gesichert. Kein lokaler oder Remote-Merge, kein Classroom-Staging-/Functions-/Rulesdeploy, keinProductionzugriff.

1. Oben „Testansicht“ auf „Lehrkraft: Schulverwaltung“ stellen. „ASV-Beispieldatei importieren“ öffnen. Eine der synthetischen Beispieldateien herunterladen und im echten Dateidialog auswählen. Für „Schüler · Pipe · ohne Kopfzeile“ Kopfzeile ausschalten und Pipe alsTrennzeichen wählen. Spalten prüfen → Vorschau ansehen → ausdrücklich bestätigen. ErneutesImportieren zeigt unverändert stattDuplikaten.
2. Auf „Lehrkraft: Toni · Technik“ wechseln. „Neuen Test erstellen“ →9b/Technik → „Im GradeCrew-Editor erstellen“ → in der originalenAuswahl „Manuell erstellen“. EineAufgabe hinzufügen, Antworten und richtigeLösung festlegen, unter „Test-Einstellungen“ Titel prüfen, speichern.
3. „Veröffentlichen“ öffnet imTestmodus den Zuweisungsdialog.9b/Technik, Zeitraum und festeEmpfänger prüfen; „Zuweisung bestätigen und veröffentlichen“. Die neueTest-ID bleibt dieselbe.
4. Auf „Schüler: Fuchs17 ·9b“ wechseln: passenderTest bei „Anstehend“ oder „Jetzt verfügbar“. „Schüler: Eule08 ·9c“ und „Schüler: Otter12 ·9b · andereSchule“ sehenihn nicht. Rollenwahl ist ausschließlich ein Wechsel derTestansicht, keineechteAnmeldung.
5. „Zurücksetzen“ verwirftImporte undZuweisungen ausdemRAM. EinReloadstartet ebenfalls mitdemsynthetischenAnfangsbestand.

SynthetischeDownloads: /samples.csv?kind=pupils (mitKopfzeile), /samples.csv?kind=pupils-pipe (zehnSpalten,headerlos), /samples.csv?kind=teachers und /samples.csv?kind=teaching. AlleunterderselbenLoopbackadresse.

Grenzen: echte ASV-Feldbedeutungen/Stabilität, schulischerHMAC-Tresor/Recovery, Rollen/AVV/Fristen bleibenoffen. KeineechteSchüleranmeldung,Credentialausgabe,serverseitigeClassroomrechteoderSecureAssessmentintegrationbelegt. BestehenderPrüfungsserver/Graderwirdnichtnachgebaut. DieausgewieseneStartprüfungistnurDemovertrag. Auth/Functions/Firestore-Emulatorfolgephase mitbenannterStudent-App-Sitzung undkontogebundenemAttemptcredentialbleibtoffen;keineJDKInstallation. EN-SmokeprüftGrundnavigation,keinevollständigeÜbersetzungallerSonderfälle. PhysischeGeräteundmenschlicheAbnahmeausstehend. Releaseweiterbranch_only.

Genau nächsterSchritt: unabhängigesEndreviewzumfixiertenProduktkandidatenauswertenundgegebenenfallskonkretbenannteKorrekturenreproduzieren;keineweitereFunktionsausweitung.

### Gezielte Endreviewkorrektur – Unterrichtswiederimport

Unabhängiger Endreview zum Kandidaten3659766 reproduzierte einen weiteren lokalenP2-Vertragsfehler: dieselbe Unterrichtskennung mit geänderter Lehrkraft, Klasse oder Fach wurde fälschlich als unverändert übersprungen. Die Zentrale hob den Codefreeze ausschließlich für diesen begrenzten Fix auf. Eine neue Regression prüfte zunächst rot exakt denselbenImport gegenüber drei einzelnen Feldänderungen. Der RAM-Abgleich speichert nun die benötigte Zuordnung und vergleicht sie beimWiederimport; eine Änderung oder ein abweichendesSchuljahr wird alsKonflikt gezählt. Vorschau zeigt denKonflikt ausdrücklich und deaktiviert dieÜbernahme. Keine automatische neueRechtevergabe oder Architekturänderung. GleichesUnterrichtsprofil bleibt idempotent unverändert. FehlgeschlageneÜbernahme verändert denBestand nicht.

NachKorrektur44/44gezielteClassroom/AppRegressionstestsbestanden,Exit0. BrowserregressionfürsichtbarenKonflikt+deaktivierteÜbernahmeistvorbereitetundwirdnachdiesemCheckpointausgeführt. ProduktneuerReviewkandidatfolgtalsRemoteSHA;keineanderenProduktänderungenseit3659766.

## Abschluss des lokalen Lieferblocks – 16. Oktober 2026

Der eigenständige alte Mock wurde durch einen lokalen Prüfstand in der vollständigen aktuellen GradeCrew-App ersetzt. Der einzige Umsetzungsplan bleibt docs/classroom/GC-CLASSROOM-01-IMPLEMENTATION-20261016.md; die fünf bestehenden Konzept- und Übergabedateien behalten ihre historische Herkunft. Die ursprünglichen Einschränkungen aus früheren Aufträgen sind durch den ausdrücklichen Auftrag vom16.10 für diesen lokalen Lieferblock abgelöst. Die getrennte Backendfolgephase ist weiterhin offen.

**Geprüfter Produktkandidat:** Remote0d99b33c7752563d7aa5e72768893c55ad4a464f, Tree83973cd8ce9842217c7640eeaf4e81980d43c700; lokal860a0aa5c1979c3440838dc2dc81da6e53398140 mit identischemTree. Nachfolgende Abschlussänderungen betreffen ausschließlich das Browserprüfskript, TODO, Plan und Nachweisdokumente; keine weitere Produktänderung. Git-DNS blieb eingeschränkt, alle Checkpoints wurden über den funktionierenden GitHub-Connector mit erwarteten Parent-SHAs gesichert. Keine Force-Aktion.

**Autorprüfung:**18/18 Browserfälle bestanden auf diesem Produktstand. Zusätzlich zum früheren17-Fälle-Bericht wurde die geänderte Unterrichtszuordnung mit sichtbarem Konflikt und gesperrter Importbestätigung geprüft. Der vollständige finale Bericht enthält keine Browserfehler, keine404 und keine fremden Netzwerkorigins für die lokale Seite. CSV-/Personendaten fehlen in Browserpersistenz; der aufgezeichnete Speicherstand vor allgemeiner Sprachpräferenz war leer. Der Test wartet nun das native asynchrone Dialog-close-Ereignis ab. Diese letzte Korrektur betraf nur den Testablauf und schwächte keine fachliche Assertion ab.

**Automatisierte Prüfungen:**44/44 gezielte Classroom-/App-Regressionsprüfungen bestanden nach dem letzten Produktfix. Die breite Root-Suite bestand zuvor mit329/329; der letzte Fix betrifft ausschließlich den lokal isolierten Unterrichtsimport und ist durch die zusätzliche Regression sowie den Browserfall abgedeckt. Finaler Staging-Build erfolgreich mit171Dateien. Bestehende jsdom-Teardownwarnung bleibt transparent, im tatsächlichen Browser keine entsprechenden Fehler. Es wurde keine Remote-App-CI gestartet oder als bestanden ausgegeben.

**Unabhängige Prüfung:** classroom_contract_review bestätigte final PASS für0d99b33 ohne offene Blocker im lokalen Lieferblock. Die eigene unveränderliche Archivkopie bestand44/44 gezielte Tests. Vier zusätzliche unabhängige Fälle prüften identischen Unterrichtsimport als unverändert sowie einzeln geänderte Lehrkraft, Klasse und Fach als blockierten Konflikt; der Bestand blieb bei Ablehnung gleich. Die UI-Differenz wurde auf Konfliktzahl, Zeilenbezeichnung, Erklärung und deaktivierte Bestätigung geprüft. Frühere neun eigene unabhängige Chrome-Fälle waren an3659766 gebunden und werden nicht auf den späteren Produktfix umetikettiert. Gesicherter unabhängiger Bericht: docs/classroom/evidence/20261016-independent-review.json.

**Sichtprüfung:** Die aktuelle anonyme Staging-Startseite meldete gc39. Tatsächlich aufgenommene lokale und Staging-Bilder wurden angesehen; die Originalbühne, Crew-Figuren und der Benefitbereich sind vorhanden. Die zusätzliche lokale Testleiste verändert die verfügbare Höhe. Es wird weder Pixelidentität noch eine Liveprüfung aller angemeldeten Coco-/ET-/Adminaktionen behauptet. Der Originaleditor und der ursprüngliche manuelle Erstellungsablauf wurden tatsächlich bedient. KI-Schaltflächen starten in dieser Probe keinen Provider.

**Umsetzungsentscheidung:** Die kleinen Rollen- und Snapshotprüfungen sind im isolierten RAM-Repository zusammengefasst, statt eine zusätzliche leere domain.mjs aufzuteilen. Der bestehende guest-tour-port wurde nur um eine optionale Quiz-ID erweitert; ein Mehrtestadapter delegiert an ihn. Kein zweiter Editor, keine zweite Bewertungsengine und keine neue zentrale Statusdatenbank wurden eingeführt. Angefordertes Modell/Aufwand weiterhin Sol/medium, beobachtete Runtime-/Usagewerte unknown; keine Modellwechsel oder Providerstarts.

### Schnellprüfung für Martin

1. http://127.0.0.1:8782/ öffnen. Oben bei „Testansicht“ zunächst „Lehrkraft: Schulverwaltung“ wählen. „ASV-Beispieldatei importieren“ öffnet den echten lokalen Dateidialog. Eine synthetische Beispieldatei herunterladen und auswählen. Beim Pipebeispiel „Datei hat eine Kopfzeile“ ausschalten und Pipe wählen. Danach Spalten prüfen, Vorschau ansehen und ausdrücklich bestätigen.
2. Auf „Lehrkraft: Toni · Technik“ wechseln. „Neuen Test erstellen“ →9b/Technik → „Im GradeCrew-Editor erstellen“ → „Manuell erstellen“. Eine Aufgabe mit Antworten und richtiger Lösung anlegen. Titel unter „Test-Einstellungen“ prüfen und speichern.
3. „Veröffentlichen“ öffnen. Klasse/Fach, Zeitfenster und feste Empfänger prüfen und die Zuweisung bestätigen. Dieselbe neue Test-ID erscheint danach bei „Schüler: Fuchs17 ·9b“. Die Testansichten Eule08/9c und Otter12/andereSchule bleiben ausgeschlossen. Dies ist ein Ansichtswechsel im Testwerkzeug, keine Anmeldung.
4. „Zurücksetzen“ oder Neuladen verwirft die lokalen Importdaten und Zuweisungen. Es werden ausschließlich synthetische Daten verwendet.

Downloads unter derselben Adresse: `/samples.csv?kind=pupils`, `/samples.csv?kind=pupils-pipe`, `/samples.csv?kind=teachers`, `/samples.csv?kind=teaching`. Die Testseite läuft weiterhin ausschließlich auf127.0.0.1:8782, eigener Server Session16806. Fremde Ports8779/8780/8781 wurden nicht verändert. Der unabhängige Prüfer hat seinen eigenen8783-Server wieder beendet.

### Stand und Grenzen

Release unverändert **branch_only / lokal geprüft**. Kein Merge, keine Classroom-Stagingbereitstellung, keine Functions-/Rulesbereitstellung und keine Productionänderung. Kein tatsächlicher Schülerlogin, Codeexchange, schulischer HMAC-Schlüsselbetrieb oder serverseitiger Classroom-Autorisierungsnachweis. Der bestehende Secure-Assessment-Server bleibt maßgeblich; seine spätere Auth-/Functions-/Firestore-Emulatoranbindung ist im selben Plan offen. Die fehlende lokale Java-Laufzeit wurde nicht durch Installation oder einen Cloudstart ersetzt. Physische Geräte, Martins Bedienabnahme, tatsächliches ASV-Exportprofil, schulische Schlüsselverwaltung/Recovery und organisatorische Datenfristen bleiben gesondert offen. Der Englisch-Smoke deckt die neue Grundnavigation ab, keine vollständige sprachliche Abnahme aller Sonderfälle.

**Genau nächster Schritt:** Martin prüft den oben beschriebenen lokalen Import- und Erstellungsablauf. Rückmeldungen werden unter derselben Task-ID gesammelt; kein automatischer Deploy oder Start der Backendfolgephase.

## 18. Oktober 2026 — Bedienkorrektur nach ausdrücklicher Nutzerablehnung

Martin lehnt den direkten Start in der Classroom-Testübersicht ab. Der frühere technische Abschluss ist keine Bedienabnahme. Verbindlich ist die vollständige Website: ursprünglicher Startbildschirm und Anmeldung, anschließend ursprüngliche Tests; Klassen und Schüler:innen ergänzen die Navigation links.

Umgesetzt im bestehenden isolierten Checkout und Aufgabenbranch: kein automatischer Classroom-Einstieg mehr. Die originale Startseite öffnet zuerst. Die originale Anmeldeseite erhält eine ausdrücklich lokale Beispielkonto-Anmeldung ohne echte Zugangsdaten. Danach startet das originale Testdashboard. Benutzerleiste, Abmelden, Einstellungen, Suche, Filter, ursprüngliche Erstellungsansicht und Editor bleiben vorhanden. Die linke Navigation enthält Meine Tests, Klassen, Schüler:innen und Übersicht. Die Schülerliste filtert nach Fachzuständigkeit; technische Personen-IDs sind aus der sichtbaren Klassenliste entfernt. Testoptionen sind eingeklappt im Navigationsbereich. Persönlicher Schülerzugang ist ein eigener Einstieg neben dem bisherigen Einzeltestcode; ungültige Beispielcodes zeigen ihren Fehler im Dialog, Enter bestätigt. Schüler sehen nur ihren Bereich und keinen Lehrkraft-Coco. Abmelden führt zur ursprünglichen Startseite. Einstellungen werden im lokalen Modus nur im RAM gespeichert.

Nachweise: 45/45 gezielte Classroom-/Entry-/Guest-/Practice-/Secure-Client-Tests nach den App-Port-Änderungen; danach nochmals 16/16 Classroomtests nach den letzten lokalen Controllerkorrekturen. Bekannte jsdom-Teardown-Konsolenwarnung im Entrytest bleibt erhalten; keine fehlgeschlagenen Tests. Syntax und git diff --check grün. Neue Regression zuerst rot: bisheriger Controller blendete authView sofort aus. Danach grün: normaler öffentlicher Einstieg, originale Form-/Dashboardknoten erhalten, lokale Anmeldung, Benutzerleiste, Schülerliste ohne fremde Klassen, Abmelden.

Tatsächlich im vorhandenen Codex-In-App-Browser auf 127.0.0.1:8782 bedient: Start → Originalanmeldung → Beispielkonto → originales Testdashboard; Schülerliste → Klasse → Klassenreiter; Neuer Test → Klasse/Fach → ursprüngliche Erstellungsansicht → Manuell → Originaleditor; Einstellungen → lokal speichern → Abmelden → Start; persönlicher Schülercode ungültig → sichtbarer Dialogfehler → FUCHS-17 per Enter → persönliche Leeransicht ohne Lehrkraftnavigation. Desktop und 390px geprüft (Dokumentbreite exakt390px). Letzte Browserfehlerabfrage leer. Keine allgemeine Network-/Backend-/Geräteabnahme daraus ableiten. Bilder: übergeordneter Projektbereich outputs/classroom-20261018/{original-start,teacher-sidebar,mobile-sidebar,personal-student}.jpg. Neuer kompakter Bericht: docs/classroom/evidence/20261018-shell-correction.json. Alter 18-Fälle-Bericht bleibt an seinen früheren Produktstand gebunden; angepasster Langläufer hier nur syntaxgeprüft, nicht erneut ausgeführt.

Remotevorprüfung: Aufgabenbranch732865a8502374c1d30fc16483efa2b5d6485477 und lokaler1ca1718 haben denselben Tree6f5700d1ce3fd57c8e9470f6260d968f8163a584. Aktueller Integrationshead2e718ae44519fc22a7c64ad354b62dd26a6999ca; keine Übernahme aus ihm und kein Integrationsauftrag. Aktuelle Main-Regeln/State/TODO/Recovery gelesen; Main-Classroomstatus ist noch älter als dieser Aufgabenbranch. Der Versuch, den neuesten Development-Status-Workflow über den Connector abzurufen, wurde vom erlaubten Endpunktumfang abgewiesen. Deshalb keine Aussage über einen neueren globalen Development-Statuslauf, keine Integration. Fremde Dirty-Checkouts bleiben erhalten.

Lokaler Testserver wurde im vorherigen Teilschritt für diesen Auftrag gestartet, Session51410, Port8782. Dieser Server liefert Änderungen direkt von Platte; Reload genügt. Abhängigkeit tools/ui/node_modules ist lediglich ein lokaler Link zum vorhandenen Paketbestand und gehört nicht in den Commit. Persönliche Schüleranmeldung und Lehrkraftanmeldung hier bleiben ausdrücklich lokale RAM-Sitzungen. Kein Credentialexchange, keine Remoteanmeldung, kein Providerstart, Merge oder Deployment. Stufe branch_only / lokal geprüft; menschliche Bedienabnahme dieser Korrektur steht aus.

Nächster Schritt: Martin prüft Start → Anmelden → lokale Testanmeldung → Meine Tests mit linker Klassen-/Schülernavigation auf derselben lokalen Adresse.

## 18. Oktober 2026 — Normalen Lehreraccount und vorhandenen Testbestand wiederhergestellt

Neue ausdrückliche Klarstellung von Martin: mit dem normalen Lehreraccount anmelden und den vorhandenen Testbestand sehen; Klassen und Schüler:innen sollen zusätzliche linke Navigation sein. Die bisherige künstliche Sitzung ist dafür verworfen. Der normale Einstieg `/` lädt jetzt den unveränderten bestehenden Firebase-SDK und die vorhandene Konfiguration hausaufgabe-staging. Die URL bleibt127.0.0.1:8782; kein Hosting-/Functions-/Rulesdeploy. Der Zugriff auf das vorhandene Testbackend folgt dem Auftrag für die normale Anmeldung; Production ist nicht konfiguriert oder verändert.

Die vorherige synthetische Probe ist unter `/classroom-demo.html` ausdrücklich getrennt. Nur dieses Dokument erhält Demo-SDK-Importmap, Previewflag und isolierende CSP. Die normale lokale Seite erhält stattdessen allein das Account-Workspaceflag und die zusätzliche CSS-Datei. Ihre Hostingheader folgen dem bisherigen normalen Hosting, das keine zusätzliche CSP definiert. Keine Credentialeingabe oder Fakeauth durch den Agenten.

Neues Modul classroom/account-workspace.mjs ist eine additive lesende Navigation. Ein kleiner Port in app.js gibt ausschließlich UID/Anzeigenamen/Umgebung und Testmetadaten sowie die bestehenden Editor-/Auswertungs-/Dashboardfunktionen weiter. Die normale authState-, Login-, Logout-, Speichern-, Veröffentlichungs-, KI- und Settingslogik wird nicht abgefangen; die früheren Previewzweige sind unter `/` inaktiv. Keine Testfixtures, kein künstlicher Benutzer, kein zweiter Testbestand, keine Schreibzugriffe aus dem neuen Modul. „Klassen“ gruppiert vorhandene Tests nach ihren gespeicherten Klassenangaben. Das ist keine Behauptung bestätigter schulischer Memberships. „Schüler:innen“ zeigt einen ehrlichen Leerzustand: dauerhafter Schüler-/ASV-Bestand ist noch nicht angebunden. Es werden keine Personen aus Ergebnissen abgeleitet oder in unpassende Profile/Testfelder geschrieben.

Vor Implementierung bestehenden Plan um diesen Vertrag ergänzt. Neue Tests zuerst rot wegen fehlendem Modul, danach grün: Rootauslieferung enthält weder Demo-SDK noch Previewflag, explizite Demoseite bleibt isoliert; ursprüngliche Form und Dashboardknoten bleiben gleich; Navigation nur bei angemeldeter Sitzung; Klassen aus tatsächlichen Testmetadaten; Editor erhält dieselbe reale Test-ID; Accountwechsel und Abmelden entfernen alte Accountdaten aus Zusatzansichten. 47/47 gezielte Regressionen einschließlich bestehendem Anmelde-/Registrierungs-/Publishvertrag bestanden, Exit0; bekannte Entry-jsdom-Teardownwarnung bleibt dokumentiert. Nach zusätzlichem Accountwechselfall und Katalogergänzung nochmals2/2 Accountworkspaceprüfungen bestanden. Syntax und git diff --check grün. Alter langer Demobrowserlauf wurde auf die explizite Demo-URL umgestellt, hier nicht erneut ausgeführt.

Server51410 kontrolliert beendet, autorisierten Loopbackserver neu gestartet: Session39951, gleiche Adresse/Port8782. Im vorhandenen In-App-Browser neu geladen: ursprüngliche Startseite und normales Lehrerlogin ohne Testkontoauswahl vorhanden; echter SDK lädt ohne Startupfehler. Leeres Loginformular als Bild gesichert: übergeordneter Projektbereich outputs/classroom-20261018/normal-account-login.jpg. Persönliche Eingaben und Testinhalte wurden nicht aufgenommen. Letzte rein lesende DOM-Abfrage zeigte die Anmeldeseite; keine eigene erfolgreiche Accountanmeldung oder visuelle Einsicht in den persönlichen Testbestand durch den Agenten behaupten.

**Menschliche Bestätigung:** Martin antwortete auf die Frage nach normaler Anmeldung und vorhandenen Tests ausdrücklich: „Ja, meine Tests sind da“. Das ist die Nutzerbestätigung dieses Teilablaufs; kein Ersatz für Backend-/Rollen-/ASV-/Geräteabnahme der neuen Schülerverwaltung. Bericht docs/classroom/evidence/20261018-real-account.json. Release weiterhin branch_only / lokaler Teststand; kein automatischer Merge oder Deploy.

Nächster Schritt: Zusatznavigation mit Martins realem Account praktisch abnehmen; anschließend die weiterhin offene dauerhafte schulische Identitäts-/Membership-/ASV-Anbindung gemäß demselben Plan umsetzen und gesondert prüfen.
