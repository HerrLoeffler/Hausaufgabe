# GC-AUTOMATION-08 — feste Aufgabenprofile, erste Games-Preview-Kette

Datum: 2026-10-04. Auftraggeber: Martin. Task-ID bleibt GC-AUTOMATION-08.
Status: schriftliche Spezifikation zur Prüfung; kein Implementierungsplan, keine Aktivierung.
Bezug: [Bestandsaufnahme](../../STAGING_BACKLOG_2026-10-04.md), [Übergabe](../../../workstreams/guardian-admission-profiles-v1.md), [Ausführungsvertrag](../../../automation/EXECUTION.md).
Basis: main ced8e6dbe1cec5215edeb88b551afc363fe634cc; bestehender Dokumentationsbranch/PR #126.

## Zweck und Erfolg

Martin will weitere Themen mit derselben belegbaren Phasenkette bearbeiten lassen und den Staging-Rückstand abbauen. Erfolg heißt zugelassener Auftrag → gebundener Kandidat → passende Tests → drei unabhängige Reviews → sichere Integration → verifizierter Staging-Receipt. Menschliche Sicht-/Geräte-/Produktabnahme und Production bleiben eigene Gates.
„Alles ready“ wird je bestehender Aufgabe anhand der tatsächlichen Stufe ausgewiesen; der Ausbau verleiht alten Branches keine pauschale Freigabe.

Genehmigter Ausbau-Zuschnitt aus dem Folgeauftrag: feste Profile auf main, bestehende Web-Kette erhalten, zuerst isoliertes statisches Games-Preview. Noch nicht genehmigt: diese konkrete schriftliche Spezifikation oder ein noch nicht erstellter Implementierungsplan.

## Architekturentscheidung und Grenzen

Gemeinsame Zustandsmaschine und Ledger werden behalten. Aufgabenprofile bestimmen ausschließlich die auf main geprüften Pfadgrenzen, Validatoren, Buildpakete, Review-Kriterien, Integrationsziele und Deploy-Komponenten. Modelle und Kandidaten dürfen diese Verträge nicht ersetzen.
Getrennte vollständige Controller würden dieselbe Kosten-/Recovery-Logik mehrfach implementieren. Frei wählbare Commands aus Auftrag/Kandidaten würden die Sicherheitsgrenze unterlaufen. Deshalb feste, versionierte Profile mit geschlossenem Auswahlkatalog.

Der erste Implementierungsblock umfasst:
1. eine kleine vertrauenswürdige Profil-Schnittstelle und Web-Kompatibilitätsadapter;
2. ein statisches Escape-Expedition-Preview-Profil mit credentialfreier Prüfung und getrenntem Hosting-Deploy;
3. profilbezogene Nachweise, negative Zulassung und sichere Wiederaufnahme;
4. bezahlfreie Rehearsal-Nachweise und Dokumentation.

Andere Aufgabenarten werden in der Zulassungsmatrix mit ihren Gate-Anforderungen dokumentiert, bleiben im ausführbaren Katalog gesperrt. Das verhindert eine nur nominelle „Backend-Unterstützung“ ohne Backend-Tests. GC-AUTOMATION-09/10/11 aus PR #65 bleiben eigene Aufgaben. Bestehende AI-/Native-/Rules-Workflows und deren Identitäten werden nicht umgebaut oder erweitert.

## Profilvertrag

Ein Profil enthält:
- unveränderliche ID, Version und Digest seiner Kontroll- und Validator-Dateien;
- zulässige Aufgaben-/Dateiarten, konkrete Basis-/Zielbranchgrenzen und verbotene Kontroll-/Secret-/Rules-Pfade;
- eine geschlossene Validator-ID; kein Shell-Command aus JSON, Prompt oder Kandidat;
- feste Build-/Artefakt-ID, notwendige Tests und Review-Kriterien;
- Integrationstyp, zugelassenes Staging-Projekt/Channel und erforderliche Receipt-Komponenten;
- referenzierten bestehenden Kostenvertrag; Risikoprofil ist unabhängig vom Kostenprofil;
- getrennte menschliche Gates, die kein Modell auf „passed“ setzen darf.

Admission, Execution, Validation, Continuation und Deployment lesen denselben auf main gebundenen Vertrag. Unbekannte ID/Version, fehlender Digest oder nicht unterstützter Kombinationstyp werden abgewiesen. Keine generischen Wildcards für privilegierte Verzeichnisse.

Der Kandidat schreibt nur zugelassene Produktdateien. Trusted Tests und Profile liegen außerhalb dieser Allowlist. Kandidatendateien dürfen notwendige Tests weder abschalten noch überspringen oder auf ein schwächeres Profil umleiten.

## Abwärtskompatibilität

Bestehende Web-Auftragsdateien bleiben byte- und hash-identisch. Fehlende neue Profilfelder alter Web-Verträge werden nicht in die gehashte Quelle hineinnormalisiert. Vorhandene Aufgabe, Budget und Run-Historie bleiben lesbar; ihre Prüfung verwendet ausdrücklich den bisherigen Vertragsmodus.
Die neue Profileinführung ändert den Control-Hash. Alte laufende oder gestoppte Versuche werden nicht automatisch auf neue Controller-Hashes umgebunden. Insbesondere Startscreen v2/v3 mit unklarem Provider-Ergebnis bleiben gestoppt; v4 bekommt nicht durch ein Profil-Upgrade einen neuen Versuch oder nachträglich erfundene Reviews.
Die bestehende Drei-Review-Kette, Gesamtversuchszähler und Preis-/Budgetlimits werden nicht geändert.

## Erstes neues Profil: games-static-preview-v1

Produktbereich: die bestehende statische Escape-Expedition im zugehörigen bestehenden Visual-Workstream. Ein neues Feature wird nicht parallel angelegt.
Zulässige Änderungen: einzeln benannte bestehende UTF-8-Dateien unter lab/escape-expedition, höchstens acht Dateien. Im ersten Profil keine neuen Binärassets, Functions, Datenbanken, Rules, package-/Lockfiles, externe SDKs oder kostenpflichtige Provider-Anbindung. Bestehende Assets werden unverändert verpackt und gehasht.
Basis- und Integrationsziel werden an den explizit ausgewählten bestehenden Visual-Branch und dessen vollständigen SHA gebunden; kein automatischer Merge der Games-PR-Kette und kein Merge in den Web-App-Integrationsbranch.

Validator läuft aus vertrauenswürdigem main-Kontrollcode unter Node 22:
- Syntax der ausgewählten JS-Dateien;
- unveränderte vertrauenswürdige Escape-Expedition-Tests für Zustand, Lern-Gates, Hint-/Transferverhalten und Paketgrenzen;
- vorhandener Escape-Expedition-Buildadapter, dessen Verhalten vor Übernahme geprüft wird;
- Paketprüfung auf ausgebrochene Pfade, Symlinks, fehlende erwartete Dateien, verbotene Cloud-Konfiguration und Abweichungen vom ausgewählten Source-Tree.

Vor Aufnahme werden die aktuell 35 vorhandenen Tests und der Builder gegen den gebundenen Visual-Kandidaten abgeglichen. Erforderliche Fixtures/Tests werden aus einem im Profil genannten reviewed Source-Snapshot übernommen, nicht unbemerkt aus dem veränderbaren Kandidaten. Falls das initiale Profil ohne diesen Abgleich nicht tragfähig ist, bleibt es gesperrt.
Test-/Build-Jobs besitzen keine Cloud-/Provider-/Signing-Secrets und keine persistierten Schreib-Credentials. Ein untrusted Testprozess bekommt auch keine Repository-Schreibrechte.

Drei Reviewer prüfen unabhängig denselben Kandidaten-/Profil-/Artefaktdigest:
- Korrektheit und Lern-/Spielzustand;
- Sicherheit, Pfad-/Paketgrenzen, keine Provider- oder Datenzugriffe;
- QA, Bedienbarkeit und regressionsrelevante Zustände.
Bestehende Rollen/Modelle bleiben erhalten. Textreviews sind kein visueller Geräte- oder Produktnachweis.

Kostenvertrag: zunächst bestehendes module-web-v1 ausschließlich als Kostenvertrag mit unveränderten Grenzen (2,40 USD Reservation je Versuch, 2,55 USD Auftrag). Kein Budgetreset, keine zusätzlichen Reviewer, keine neue Preisannahme. Der erste echte Pilot kann damit nur einen solchen reservierten Bauversuch tragen; Reparaturen werden ohne ausreichendes Restbudget blockiert. Admission trennt Kostenvertrag von Aufgabenart und prüft die zugelassene Kombination explizit.
Eine spätere Änderung der Input-/Output-/Preiscaps ist ein eigener reviewed Kostenvertrag.

## Integration und Hosting-Deploy

Integration ist nur normales fast-forward am gebundenen Ziel mit gleicher erwarteter Ausgangs-SHA. Bei Target-Fortschreibung keine automatische Rebasing-/Merge-Schreibaktion. Erst belegte Konfliktdiagnose und neuer exakt geprüfter kombinierter Kandidat.
Nach Integration läuft das feste Games-Profil erneut für exakt die integrierte SHA. Erst danach entsteht ein autorisierter Deployment-Request.

Deploy-Control auf main lädt ausschließlich das geprüfte unveränderliche Hostingpaket. Es baut keinen Kandidatencode nach Cloud-Login und führt keine Kandidatenskripte mit Credentials aus.
Ziel ist ausschließlich hausaufgabe-staging, Channel gradecrew-escape-visual, bestehende dedizierte Preview-Grenze und höchstens 30 Tage. Vor Dispatch werden aktuelle Channel-/Workstream-Zuständigkeit und existierende Deploys geprüft, damit der manuelle Games-Workflow nicht konkurrierend denselben Channel überschreibt. Laufende Jobs werden nicht abgebrochen.
Die bestehende Hosting-Identität wird erst nach Bestätigung ihrer tatsächlichen Berechtigung und ihres isolierten Secret-Zugriffs verwendet. Keine neue IAM-/WIF-Rolle oder Erweiterung wird durch diesen Spec bereits beantragt. Fehlende Identität ist ein blockiertes Setup-Gate, kein erfolgreicher „skipped deploy“.

Receipt bindet taskId, Profil-/Control-Digest, Kandidat/integrated SHA, CI-/Deploy-Run mit Attempt, Paketmanifest/Digest, Hosting-Site/Channel, veröffentlichte Version und verifizierte Dateihashes. Ein Hosting-only-Profil verlangt keinen erfundenen AI-Functions-Receipt. Umgekehrt dürfen Web-/Backend-Profile ihren erforderlichen Functions-Receipt nicht verlieren.
SHA-/Artefakt-/Channel-Abweichung, fehlender Receipt, unklare Publikation oder neuer Zielstand blockieren Abschluss. Ein bereits vorhandener exakt passender Receipt wird übernommen statt erneut deployed.

## Wiederaufnahme und Konflikte

Vor externer Aktion: Auftrag, unveränderliche Quelle, Run-Ownership und durable Budgetreservation sichern. Nach Dispatch Run-/Request-ID sichern. Unklarer Dispatch oder Providerstatus führt zuerst zur Abfrage vorhandener Logs/Artefakte/Ledger, nicht zu einem zweiten Start.
taskId und ursprünglicher Versuchszähler gelten über Profilwechsel, Chatwechsel, Reparatur und Ziel-Fortschreibung. Maximal drei gesamte Bau-/Reparaturversuche innerhalb des bestehenden Budgets; kein neuer Zähler pro Phase.

Fortgeschriebener Zielbranch:
1. aktuelle Ziel-/Kandidaten-SHA und Ancestry lesen;
2. betroffene Dateidiffs gegen bereits vorhandene Arbeit prüfen;
3. keine Änderung oder erneut ausgeführte bezahlte Runde aus bloßem Branchabstand ableiten;
4. falls Änderungen erforderlich sind, gleichen Auftrag mit nachvollziehbarer qualifizierter Reparatur fortführen;
5. geänderter kombinierter Code braucht neue exakt gebundene Tests und alle drei Reviews.
Eine dokumentierte reine Handoff-Änderung kann als solche erkannt werden, ersetzt aber keine Prüfung neuer Produktblobs. Keine automatische Wiederverwendung eines Reviews für geänderten Code.

## Nachfolgende Profile: Voraussetzungen, nicht aktiviert

| Aufgabenart | Eigene unverzichtbare Gates |
|---|---|
| Backend | konkrete Modul-/Export-Allowlist; Unit/Emulator, Auth, Idempotenz, Rate-/Kostenlimits; unveränderliches Paket; isolierter ausgewählter Staging-Functions-Deploy; komponentenbezogene Receipts |
| Security/Rules | Emulator-Allow/Deny, private Lösungen, aktive Content-Unveränderlichkeit; dokumentierte Preview-/E2E-/Last-/Cutover-Gates; menschliche Cutover-Entscheidung |
| Games mit AI/Highscores | serverseitige Antwort-/Scoreprüfung, atomarer Abschluss, Provider-/Kostenvertrag und eigene Functions-Identität; nicht durch das statische Profil abgedeckt |
| Gateway/Evaluator | vorhandene Gateway-CI und Receipts, eigene WIF/IAM- und Datenfreigabe; Evaluation innerhalb vorhandener Reservationen; keine bezahlte Demonstrationsrunde |
| Native iOS | exakter Build-/Web-Bridge-/Signing-/Uploadnachweis, isolierte Identität, eindeutiger TestFlight-Build; tatsächlicher Gerätetest bleibt menschlich |

## Prüfung und Aktivierung

Vor Code wird ein schriftlicher Implementierungsplan auf Basis dieser geprüften Spec erstellt. Der Plan muss die tatsächlichen bestehenden APIs/Fixtures festlegen und die Arbeit in separat überprüfbare Schritte aufteilen.

Relevante Testfälle:
- sämtliche vorhandenen Web-Vertrag-/Ledger-/Recovery-/Deployment-Tests bestehen unverändert;
- unbekannte Profile, falsche Version/Digest und nicht freigegebene Kombinationen blockieren;
- ein Games-Kandidat kann keine Kontroll-/Functions-/Rules-/Lockfiles ändern oder Validatoren abschalten;
- anderer Target-Head, falscher Run-Attempt und konkurrierender Dispatch erzeugen keinen zweiten Bau;
- unbekannter Providerstatus oder nicht ausreichendes Restbudget blockieren;
- fehlende Credential-Konfiguration endet nicht als erfolgreicher Deploy;
- falsches Paket, geänderte Hashes, falsches Projekt/Channel und fehlender Receipt blockieren;
- richtige bereits vorhandene Nachweise erlauben Wiederaufnahme ohne neuen Paid-Call/Deploy;
- manuelle Sicht-/Geräteabnahme kann durch Modell- oder Workflowdaten nicht bestanden gesetzt werden.

Zunächst bezahlfreie isolierte Rehearsal mit synthetischen Kandidaten, Fake-Provider und Fake-Deploy-Receipts. Diese beweist Controllerverhalten, kein echtes Staging.
Echte Aktivierung bleibt standardmäßig aus. Erst nach reviewed Implementation, grünen Gates, bestätigter Preview-Identität und einem konkreten SHA-/Datei-/Budgetvertrag wird ein einzelner freigegebener Pilot aufgenommen. Kein existing L3-Kandidat wird allein durch die Spec automatisch reserviert oder neu gebaut.
Production bleibt ausgeschlossen.
