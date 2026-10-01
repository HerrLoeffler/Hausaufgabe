# Aufgabe: GC-AUTOMATION-02

- Aktualisiert (UTC): 2026-10-02
- Verantwortlicher Chat / Auftrag: Einmalige staging-only Workload-Identity-Aktivierung für automatische `functions:ai`-Deploys reparieren und abschließen.
- Aufgabenbranch: `fix/staging-functions-wif-display`
- Basiscommit: `5bbb8f602f25d549e65142c87599bbd9d342d083`
- Betroffene Dateien: `tools/automation/setup-staging-functions-identity.sh`, `.github/workflows/handoff-check.yml`, `TODO.md`, diese Übergabe.
- Überschneidungen mit anderen Aufgaben: Automations-/Release-Train-Koordination auf `main`; Produktcode auf `feature/gradecrew-app-integration` wird nicht verändert.

## Ziel und gewünschtes Verhalten

Der einmalige Google-Cloud-Setup-Lauf soll nach einer Unterbrechung sicher wiederholbar sein und den staging-only WIF-Pool/Provider für `.github/workflows/staging-functions.yml` vollständig anlegen. Danach sollen normale AI-Functions-Staging-Deploys ohne Cloud-Shell-Schritt laufen.

## Umfang / nicht verändern

- Nur `hausaufgabe-staging`.
- Production `hausaufgabe-40294` bleibt ausgeschlossen und unverändert.
- Kein Hosting-, Firestore-Rules- oder Assessment-Deploy.
- Keine Service-Account-Schlüssel erzeugen.
- Bestehende erfolgreiche IAM-Teilschritte des ersten Setup-Laufs nicht zurückrollen.

## Akzeptanzkriterien

- Pool- und Provider-Displaynamen sind jeweils maximal 32 Zeichen.
- Das Setup validiert diese Grenze vor Cloud-Mutationen.
- Wiederholter Lauf toleriert bereits vorhandenen Serviceaccount und bereits gesetzte IAM-Bindings.
- `bash -n` und Project-Handoff-CI sind grün.
- Ein erneuter Cloud-Shell-Lauf legt WIF-Pool/Provider an und setzt `STAGING_FUNCTIONS_WIF_PROVIDER`, sofern `gh` angemeldet ist; andernfalls werden nur die nötigen GitHub-CLI-Schritte ausgegeben.
- Erst ein anschließender erfolgreicher echter Workflow-Deploy gilt als Functions-E2E-Nachweis.

## Zwischenstand

- Lokal geändert: n. a.; Arbeit direkt über GitHub-Branch gesichert.
- Auf GitHub gesichert: Script-Fix `a70e5a4899aff5b71910a4946e67049aa1088bf1`; CI-Regressionsschutz `088ea7a659b2870798ad68eaa86e8fb86fb166bc`; Task-Dokumentation/TODO auf demselben Fix-Branch.
- Geprüft: Project-Handoff-CI Run `36942320571` erfolgreich auf Commit `a4623dc955c9a00a08e6313eb5f0b1d118046b45`; darin `bash -n` sowie explizite `<= 32`-Prüfung für `POOL_DISPLAY` und `PROVIDER_DISPLAY` grün.
- Deployed: kein Functions-Deploy durch diese Reparatur.
- Gerätetest: n. a.

## Offene Probleme und Unsicherheiten

Der erste reale Setup-Lauf in Cloud Shell hat APIs aktiviert, den Serviceaccount angelegt, Projektrollen gebunden und `actAs` auf vorhandene Runtime-/Build-Serviceaccounts begrenzt. Danach brach Google IAM beim Erstellen des Workload-Identity-Pools ab, weil `GradeCrew staging Functions GitHub` länger als 32 Zeichen war. Der Pool/Provider und damit die GitHub-WIF-Aktivierung wurden dadurch noch nicht abgeschlossen. Es gibt keinen Nachweis eines Functions-Deploys aus diesem Lauf.

## Nächster konkreter Schritt

PR des Fix-Branches nach `main` mergen und danach denselben Setup-Befehl erneut in der bereits authentifizierten Cloud Shell ausführen. Anschließend den ersten echten automatischen `functions:ai`-Workflow prüfen.

## Wiederaufnahme nach Abbruch

Der reparierte Code liegt vollständig auf `fix/staging-functions-wif-display`. Nichts aus diesem Workstream darf als `staging_deployed` gelten, solange der erneute Cloud-Shell-Lauf und der echte automatische Functions-E2E-Deploy nicht erfolgreich belegt sind.
