# GradeCrew PostHog Staging Telemetry V1

Task: `GC-TELEMETRY-POSTHOG-01`

## Ziel

PostHog als optionale Analyseprojektion hinter die bereits vorhandene GradeCrew-Crew-Telemetrie hängen, ohne Browser-Autocapture, Session Replay oder neue personenbezogene Datenpfade.

## Basis

- Produktbasis: `feature/gradecrew-app-integration@f30fa44a383b279bcc49967d2ef0d1840243b27e`
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
- in `feature/gradecrew-app-integration` integriert: **noch nein**
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
