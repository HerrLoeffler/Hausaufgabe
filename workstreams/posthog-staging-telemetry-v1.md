# GradeCrew PostHog Staging Telemetry V1

Task: `GC-TELEMETRY-POSTHOG-01`

## Ziel

PostHog als optionale Analyseprojektion hinter die bereits vorhandene GradeCrew-Crew-Telemetrie hängen, ohne Browser-Autocapture, Session Replay oder neue personenbezogene Datenpfade.

## Basis

- Produktbasis: `feature/gradecrew-app-integration@fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41`
- Feature-Branch: `feature/posthog-staging-telemetry-v1`
- PostHog Region: EU Cloud
- PostHog Ingestion: `https://eu.i.posthog.com/i/v0/e/`
- Production: ausdrücklich nicht aktiviert

## Architektur

Der vorhandene Pfad bleibt führend:

`Browser -> recordCrewTelemetry -> cleanMetric/Allowlist -> Firestore -> PostHog-Projektion`

PostHog erhält nur die bereits bereinigte Crew-Metrik. Der Adapter besitzt zusätzlich eine zweite explizite Allowlist.

Nicht an PostHog übertragen werden:
- Name oder E-Mail
- Schülerdaten
- Diktat-/Chattext
- Thema oder Wünsche im Klartext
- alte/neue Feldwerte
- Firebase UID oder der bestehende stabile `uidHash`

PostHog erhält personlose Events mit `$process_person_profile=false`. Der benötigte `distinct_id` wird serverseitig aus UID + Kalendertag abgeleitet und ändert sich am Folgetag; damit ist im Pilot keine tageübergreifende Nutzerverfolgung möglich.

## Implementierung

- `functions/lib/posthog-telemetry.js`
  - hartes Staging-Gate auf `hausaufgabe-staging`
  - EU-Ingestion
  - Event-Namespace `gradecrew.crew.*`
  - personlose Events
  - tagesbezogene pseudonyme Distinct-ID
  - `$insert_id` aus dem kanonischen Firestore-Event für Deduplizierung
  - kurzer Timeout, best-effort; PostHog-Ausfall darf GradeCrew nicht blockieren
  - Token ausschließlich aus `POSTHOG_PROJECT_TOKEN` zur Laufzeit
- `functions/lib/crew-telemetry.js`
  - exportiert erst nach erfolgreichem kanonischen Firestore-Write
  - PostHog-Fehler werden abgefangen
- `functions/test/posthog-telemetry.test.js`
  - Staging-only
  - kein Netzwerk außerhalb Staging
  - keine Personprofile
  - keine unerlaubten Inhalts-/Identitätsfelder
  - EU-Endpunkt
  - tagesbezogene Distinct-ID
- `.gitignore`
  - Firebase Functions `.env.*`-Dateien werden nicht versioniert

## Verifikation

GitHub Actions Run `37217837157` auf Commit `377dc45924ed83ca8820e102ebd40f7071b6af70`:
- Crew Browser-Core ✅
- Crew Server Contract ✅
- Crew Telemetry Privacy Contract ✅
- PostHog Privacy Adapter 5/5 ✅
- vollständige Functions-Test-Suite ✅
- Emmi Safeguards ✅
- Syntax + ESLint ✅

Danach wurde nur der temporäre Feature-Branch-CI-Haken wieder entfernt; Produkt-/Adaptercode blieb unverändert.

## Deployment-Control

Der privilegierte Staging-Functions-Workflow liegt absichtlich auf einem separaten Main-basierten Branch:
`chore/posthog-staging-functions-config-v1`

Er soll vor dem Staging-Deploy das GitHub-Secret `POSTHOG_PROJECT_TOKEN_STAGING` in eine nur auf dem Runner existierende Datei `functions/.env.hausaufgabe-staging` schreiben. Der Wert wird nicht committed.

## Status

- Code lokal geändert: n. a. (GitHub-Connector-Workflow)
- auf GitHub gesichert: **ja**
- Tests: **grün**
- in `feature/gradecrew-app-integration` integriert: **noch nein; Branch auf aktuellen Integrationsstand fb88dfa7 reconciled**
- PostHog-Token im Staging-Deploy konfiguriert: **noch nein**
- Staging Functions deployed: **noch nein**
- echtes PostHog-Testevent bestätigt: **noch nein**
- Production: **unverändert**

## Nächster Schritt

1. Deployment-Control-PR nach `main` prüfen/mergen.
2. GitHub Secret `POSTHOG_PROJECT_TOKEN_STAGING` anlegen.
3. Produkt-PR nach `feature/gradecrew-app-integration` integrieren.
4. Automatischen `functions:ai`-Staging-Deploy und Receipt prüfen.
5. In Staging eine normale Remy-Aktion auslösen.
6. In PostHog bestätigen, dass nur `gradecrew.crew.*`-Custom-Events und nur erlaubte Properties ankommen.


## Recovery/Reconciliation 2026-10-04

Der Integrationsbranch war nach dem ersten PostHog-Pilot weitergelaufen. Die PostHog-Arbeit wurde deshalb nicht blind gemergt, sondern auf `fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41` neu aufgebaut. Dabei wurden insbesondere die neu hinzugekommenen Crew-Telemetrie-Felder (u. a. `solutionAudioQuestionCount`) aus dem aktuellen Integrationsstand erhalten. Die PostHog-Grenze bleibt unverändert staging-only und allowlisted.


## Fresh CI after reconciliation

- Volltest gestartet: GitHub Actions Run `37235599673`
- Getesteter Commit: `9c35e6ee77e16207d98245e0d20a220a30c0917d`
- Status: `success`
- Der temporäre Branch-CI-Haken wird in diesem Checkpoint wieder entfernt; Produkt-/Adaptercode bleibt unverändert.
- Ergebnis: Browser-Core, Crew-Serververtrag, Crew-Telemetry-Privacy, PostHog-Privacy-Adapter, vollständige Functions-Suite, Emmi-Safeguards sowie Syntax/Lint grün.
- Deploy-Control PR #100 wurde nach frischem Stale-Head-Abgleich als Merge `fbdd795b70e18ba56aa3d2cd22a66f2830ddc8bb` in `main` integriert.
- Nächster Schritt: PR #99 in den aktuellen `feature/gradecrew-app-integration` integrieren und dessen Integrations-CI/automatischen Staging-Deploy prüfen.


## Integration checkpoint

- PR #99 merged into `feature/gradecrew-app-integration`
- Integration commit: `461da164aaf6469da999f8fe3f5f2210036a6ebf`
- Upstream AI Staging Checks: Run `37235725698` (in_progress at checkpoint)
- Parallel Admin test-account controls: Run `37235725678` (in_progress at checkpoint)
- Production: unchanged
- Next step: wait for AI Staging Checks; then inspect the automatically triggered staging Functions workflow and deployment receipt before sending any real test event.


## Staging deployment verified

- Deploy-Control PR #100 merged to `main` as `fbdd795b70e18ba56aa3d2cd22a66f2830ddc8bb`.
- Product PR #99 merged into `feature/gradecrew-app-integration` as `461da164aaf6469da999f8fe3f5f2210036a6ebf`.
- Dedicated reconciled CI: Run `37235599673` success.
- Integrated AI Staging Checks: Run `37235725698` success.
- Automatic staging Functions: Run `37235811020`.
  - PostHog secret preparation step: success.
  - AI Functions deploy: success.
  - Staging Functions receipt artifact: `11315830771`.
  - Assessment deployment in same workflow also completed successfully with artifact `11315780882`; PostHog work did not modify Assessment code.
- Production: unchanged.
- Hosting: unchanged by this Functions deploy.
- Firestore Rules: unchanged.
- Current release stage: `staging_deployed`.
- Remaining acceptance gate: trigger one normal Remy telemetry event in Staging, then inspect PostHog event name/properties and confirm no disallowed content/identity fields.
