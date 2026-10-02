# Staging-Kurzlogin / stabiles Testkonto V1

Task: `GC-AUTH-01`

Stand: 02.10.2026

## Ziel

Für wiederholte Tests nicht ständig neue Lehrkraft-Testkonten anlegen. Nur auf Staging dürfen kurze Test-Benutzernamen wie `test` verwendet werden.

`test` wird intern zu `test@staging.gradecrew.test`. Firebase Auth, UID, Firestore-Profil und Rollenlogik bleiben unverändert. Echte E-Mail-Logins funktionieren weiter.

## Regeln

- ausschließlich `appEnvironment === "staging"`
- Production behält den normalen E-Mail-Login
- kein Passwort/Token/Testgeheimnis im Repository
- Passwort wird einmal vom Tester selbst gewählt und kann im Browser gespeichert werden
- Schüler-Testcode-Login unverändert

## Umsetzung / Nachweis

Feature: `feature/staging-short-login-v2`
Basis nach Parallelcheck: `feature/gradecrew-app-integration@c13431a0002ed3acec8a7b71130e9b6060a711fd`
Feature-CI: `Staging Short Login Checks` Run `36994087223` ✅
Integration: PR #36 -> `feature/gradecrew-app-integration@c511a3436aad7d0381833663b40d22bea2b2fb72`

Der erste Entwurf wurde nicht blind gemergt, weil parallel `startup.js` für Brand-Assets geändert worden war. V2 wurde auf dem neueren Integrationsstand aufgebaut und erhält diese Änderung.

## Status

- Code gesichert: ✅
- Feature-CI: ✅
- integriert: ✅
- gemeinsamer Staging-Gate: läuft (`36994181957`)
- Hosting-Preview mit Kurzlogin: noch nicht als deployed bestätigt
- praktischer Login/Registrierungstest: offen
- Production: unverändert

## Nach dem Staging-Deploy

Einmal im Preview unter `Account erstellen`:
1. Name wählen
2. Kurzname `test`
3. eigenes Passwort setzen

Danach dauerhaft mit `test` + demselben Passwort anmelden.
