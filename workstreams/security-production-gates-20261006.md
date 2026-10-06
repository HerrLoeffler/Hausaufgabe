# GC-SECURITY-02 — Production-Security-Gates

Request-ID: `GC-CENTRAL-15f5dd8b-6dc0-438f-8c4e-d2def7d5d25f` (ein bestehender Auftrag, kein Guardian-Versuch).
Verantwortlicher Chat: GC · Automatisierung & Integration, `01a1089e-bbae-74c2-9a6a-6ce71fb3dba7`.
Zuweisung: GradeCrew Zentrale, `01a10df6-736b-7a62-bd38-2724cf254c2e`.
Stand: 2026-10-06. GC-AUTOMATION-08 / PR #126 bleibt unverändert gesichert.

## Umfang und Grenzen

Aktuelle vorhandene Security-Gates abgleichen und technisch bearbeitbare Lücken schließen.
Keine Deploys, Rules-Cutovers, Cloud-/Provider-Aufrufe, Budgetänderungen oder menschlichen Abnahmen.
Zentrale Dateien auf main werden durch die Zentrale gepflegt; diese Übergabe ist der Arbeitsnachweis.

## Geprüfte Baseline und Überschneidungen

- main: `8360bc5f056837118ffd83138ffa2468ae42647e`; START_HERE, AGENTS, CHAT_CONTRACT, CHAT_RECOVERY, STATE, TODO und Registry frisch gelesen.
- Security: `feature/secure-assessment-v1@76417085b6ae42cb9f6d5733af726c2eeb05dd79`.
- Isolierter Arbeitsbranch: `fix/gc-security-02-gates-20261006`, Basis Security-Head.
- Aktueller Development Status: [37394390293](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37394390293), erfolgreich. Security +15/-504 gegenüber Web-Integration; kein offener Security-PR. Bestehende Related-Branches geprüft, nicht überschrieben.
- `feature/gradecrew-app-integration@bb91ce3590d773472ece60c4dd881da729bd32c1` besitzt zusätzlich kontrollierte Lösungsaudio-Ausgabe; Startpfad ansonsten identisch. Integration muss diesen neueren Code erhalten.
- Offene i18n-, Classroom-, iOS-, Design- und GC08-PRs bleiben getrennt. In der Chat-Inventur kein weiterer aktiver Security-Bearbeiter gefunden.

## Belegte Gates

- A/B: Security-Head: [Run 36870114409](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36870114409), Testjob `110395418744` erfolgreich einschließlich Rules-Emulator. Gesamtlauf fehlgeschlagen wegen Preview-Job `110396240779` (UI-Regressionen im vollständigen Check vor Deploy).
- C: kein erfolgreicher exakter Preview-/Receipt-Nachweis für diesen Security-Head. Spätere Web-Assessment-Deploys sind kein automatischer C–F-Nachweis.
- D: reale Geräte-/Browser-/Netzverlust-Matrix nicht belegt.
- E / GC-SECURITY-01: gemeldeter 30-Teilnehmer-Fehler ohne zugeordneten Fehlernachweis; vorhandener Gate-E-Branch `b9ba03b98d923b90ef67617547107e2b5720fe3f` ersetzt kein Testergebnis.
- F: kontrollierter Rules-Cutover plus adversarial Nachweis offen und in diesem Auftrag nicht autorisiert.
- G: Production-Build, explizite Komponentenauswahl, reproduzierbare Dependencies, Release-Verifikation, bestätigter Rollback und vorherige Staging-Abnahme weiter einzeln zu belegen.
- Release-Stufe dieses Auftrags: `branch_only`. Keine neue CI, Integration, Veröffentlichung oder Nutzerabnahme.

## Nächster gesicherter Arbeitsschritt

[Issue #6](https://github.com/HerrLoeffler/Hausaufgabe/issues/6) ist weiterhin offen und am realen Handler bestätigt: Questions-Reads/Contract-Bau erfolgen vor dem atomaren Start-Limit. Zuerst Verhaltenstest für abgewiesene Starts ohne Questions-Read sowie gültiges Resume und Tokenfehler; dann kleinste Korrektur mit Transaktions-/Parallelitätsnachweis und unabhängiger Prüfung. Baseline: lokal Node 22.23.3, 39/39 Assessment-Tests erfolgreich. Abhängigkeiten sind noch ohne committed Assessment-/Rules-Lockfiles.

Keine externen laufenden Starts dieses Auftrags. Keine Budgetreservierung. Alte Versuchs- und Deploy-Historie bleibt erhalten.

## Implementierungscheckpoint

- Draft-PR [#146](https://github.com/HerrLoeffler/Hausaufgabe/pull/146), initialer Remote-Checkpoint `ca7a9a05c3162f6562646659e7ef8e4b8b94d7a3`.
- Issue #6: bestehende Credentials werden vor Fragenzugriff geprüft; neue Starts prüfen das gemeinsame Kontingent vor Questions-Query/Contract. Quota und Attempt/Private-Dokumente werden in derselben Transaktion geschrieben. Alle Reads bleiben vor Writes.
- Zusätzlich reproduzierter Fehler derselben Grenze: ein wiederholter Transaktionscallback konnte das zufällige Paper des verworfenen Versuchs statt des gespeicherten Gewinner-Versuchs zurückgeben. Nur das Resultat des erfolgreich committed Callbacks verlässt jetzt die Transaktion.
- Roter Test vor Fix: fünf gezielte Regressionen scheiterten (Quota, Code-Alias, fremde Credentials, abgegebener Retry, konkurrierender Paper-Schlüssel). Nach Fix lokal 46/46 Assessment-Tests und 42/42 Secure-Client-/Rules-Quellvertragstests grün; Syntax und Diff-Whitespace grün.
- Assessment-/Rules-Abhängigkeiten jetzt mit Lockfiles; CI und guarded Assessment-Preview verwenden `npm ci`. Keine Paket-Versionssprünge der direkten Abhängigkeiten.
- Vier zusätzliche echte Firestore-Emulatorfälle für konkurrierende gleiche/verschiedene Starts, erschöpftes Kontingent/Resume und Rollback vorbereitet. Lokal kein Java installiert; diese Prüfung wird in der bestehenden PR-CI mit Java 21 ausgeführt. Noch kein Ergebnis behauptet.
- Unabhängige Vorprüfung bestätigte die Grenze und den Transaktions-Retry-Fehler. Unabhängige Patch-Prüfung und vollständige CI als nächster Schritt. Kein Deploy: Preview-Job läuft nur bei Push auf den unveränderten Primary-Security-Branch, nicht bei diesem PR.

## Verifizierter Abschluss des technischen Patches

- Gepushter Codecommit: [`20b70bef1c2126751a404a8520432181e5933585`](https://github.com/HerrLoeffler/Hausaufgabe/commit/20b70bef1c2126751a404a8520432181e5933585); identischer Baum wie lokaler Reviewcommit `ca33a696eb55b5fe37974d6db46ac82246f10441`.
- [CI 37417450492, Versuch 1](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37417450492): **SUCCESS**, Testjob `112119100368`: 284 Tests, 0 Fehler/Skips; 46 Backend-Tests, 42 Secure-Browser-/Quellvertragstests, Rules-Emulator und vier neue echte Transaktionsfälle eingeschlossen. Build/Guardrails erfolgreich. Deployjob `112119286566` ausdrücklich **skipped**.
- Echte Emulatorfälle bestätigen dieselbe gespeicherte Attempt-/Paper-Identität bei vier gleichzeitigen identischen Starts, höchstens eine neue Abgabeidentität beim letzten Kontingentplatz, gültiges Resume trotz verbrauchtem Kontingent sowie atomaren Rollback bei ungültigen Fragen. Kein realer 30-Teilnehmer-Last- oder Gerätetest.
- Unabhängiges Read-only-Patch-Review auf `ca33a696`: kein konkreter verbleibender Bypass oder Rückschritt gefunden. Reviewer führte 46 Tests mit Node 24 aus; maßgeblicher Node-22-/Emulatornachweis ist obige CI, nicht das Review allein.
- Beide Lockfiles mit `npm ci` lokal erfolgreich neu installiert. Upstream-Deprecation-Warnungen vorhanden (u.a. glob/uuid), kein pauschaler Dependency-Sicherheitsaudit oder beliebiges Upgrade dieses Auftrags.
- Stufe des **isolierten technischen Patches**: `ci_green`. Gemeinsame Security-Release-Stufe und Gates C–G bleiben offen; insbesondere kein `STAGING SECURITY READY` und keine Production-Freigabe.

## Koordinationsupdate: gemeinsame Staging-Integration

Die Zentrale meldete die Freigabe zum schrittweisen gemeinsamen Staging-Abschluss und plant i18n PR #139 (`2d1339806d6eb4eaf289d1a8a4d55fe7df95739a`). Integration und Deploy führt ausschließlich die Zentrale aus.

Zusätzlicher lokaler Kompatibilitätsnachweis: Security-Produktpatch auf unverändertem i18n-Kandidaten angewendet; **51/51 Assessment-Tests mit Node 22 erfolgreich**, einschließlich contentLocale, Bildlabeln, historischen Fingerprints und Audio-Geheimhaltung. `assessment-core.js` wurde durch den Security-Patch nicht verändert. Der produktive Lifecycle-Patch lässt sich direkt anwenden und erhält die neue Lösungsaudio-Ausgabe.

Der ältere Unit-Testadapter überlappte mit dem bereits vorhandenen Lösungsaudio-Adapter. Bewusst aufgelöst: sowohl direkte Collection-Reads als auch geordnete Questions-Reads bleiben erhalten; nur Questions werden im Read-Zähler gezählt. Diese Testadapter-Ergänzung nach Review ändert keinen Runtime-Code. Die eigenständige PR-CI wird für diesen finalen Teststand erneut ausgelöst; Ergebnis vor Integration frisch prüfen.

**Genau nächster Schritt für die Zentrale:** nach eigener i18n-Integration nur den kleinen geprüften Patch aus PR #146 auf den dann aktuellen Web-Head übernehmen und die kombinierte CI ausführen. Niemals den 504 Commits zurückliegenden gesamten Security-Branch als neuen Webstand einsetzen. Dabei `assessment-core.js`, die Lösungsaudio-Ausgabe sowie `tools/rules/package.json`-Ergänzungen (`test:bugops`, `overrides.ignore=7.0.10`) des Webstands erhalten; dessen Rules-Lockfile anschließend passend regenerieren. Workflow-/Deployskript-Änderungen sind für den alten Security-Branch dokumentiert und nicht pauschal über aktuelle Web-Workflows zu kopieren.

## Verbleibende Release-Gates (nicht automatisch freigegeben)

- C: aktueller, exakt belegter integrierter Preview/Functions-Stand. Der alte Security-Preview scheiterte am vollständigen UI-Check; die grüne Test-CI ist kein Preview-Nachweis. Ein neues gemeinsames Staging braucht seinen eigenen exakten Commit/Receipt.
- D: reale Desktop/iPhone/iPad-Matrix inklusive Lehrer-Ende, Offline, Timer, manueller Bewertung, Lösungsschutz und Wiederaufnahme.
- E / GC-SECURITY-01: ursprünglichen fehlgeschlagenen 30-Teilnehmer-Test mit ASM-Kennung, Zeitpunkt, Environment/Release und Logs/JSON-Bericht zuordnen; erst danach gezielt nachprüfen. Der neue Transaktions-Regressionstest beweist keine Ursache dieses unbekannten Vorfalls.
- F: bewusster Rules-Cutover und echter adversarial SDK-/Direktzugriffs-Nachweis nach C–E; in diesem Auftrag weiterhin kein Cutover ausgeführt.
- G: Production-Build-/Komponentenauswahl, Release-Hashprüfung, bestätigter Rollback und aktuelle Staging-Abnahme fehlen als Gesamtfreigabe. Reproduzierbare Assessment-/Rules-Dependencies sind technisch vorbereitet, schließen G allein nicht.
- App Check erst nach realer Safari/iOS-Kompatibilitätsabnahme. Keine simulierte menschliche Freigabe.

Request-ID und PR bleiben dieselben. Keine Provideraufrufe, Reservierungen, Cloud-/Rules-/Production-Mutationen oder konkurrierenden Deploys. GC08/PR126 und alle früheren Versuche unverändert.
