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
