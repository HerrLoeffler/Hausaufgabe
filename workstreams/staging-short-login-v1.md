# Staging-Kurzlogin / stabiles Testkonto V1

Task: `GC-AUTH-01`

Stand: 02.10.2026

## Problem

Für wiederholte Tests wurden immer neue Lehrkraft-Testkonten angelegt. Das erschwert reproduzierbare Tests und erzeugt unnötige Auth-/Profildaten.

## Ziel

Nur auf **Staging** dürfen Lehrkräfte neben einer echten E-Mail einen kurzen Test-Benutzernamen verwenden, z. B. `test` oder `lehrer1`.

Intern wird der Kurzname deterministisch auf eine technisch gültige, nicht zustellbare Testadresse abgebildet:

`test` -> `test@staging.gradecrew.test`

Firebase Auth, Nutzer-UID, Firestore-Profil und Rollenlogik bleiben unverändert. Es entsteht kein zweites Auth-System.

## Sicherheits-/Produktregeln

- Nur aktiv, wenn `appEnvironment === "staging"`.
- Production behält E-Mail-Login; Kurzname wird dort niemals umgeschrieben.
- Kein Testpasswort, Token oder sonstiges Zugangsdaten-Geheimnis im Repository.
- Passwort wird bei der einmaligen Registrierung vom Tester selbst gewählt und kann im Browser-Passwortmanager gespeichert werden.
- Bestehende echte E-Mail-Logins funktionieren unverändert.
- Schülerzugang per Testcode bleibt unverändert.
- Reservierte `.test`-Adresse ist nicht für echte E-Mail-Zustellung gedacht.

## UX

Staging zeigt im Login und bei der Registrierung `E-Mail oder Kurzname` und einen kurzen STAGING-Hinweis.

Einmalig:
1. `Account erstellen`
2. Name eingeben
3. Kurzname `test`
4. eigenes Passwort festlegen

Danach dauerhaft:
- Benutzername: `test`
- eigenes Passwort

## Technische Umsetzung

Branch: `feature/staging-short-login-v2`
Basis: `feature/gradecrew-app-integration@c13431a0002ed3acec8a7b71130e9b6060a711fd`

Der erste Umsetzungsbranch wurde absichtlich nicht blind integriert, weil der Integrationsbranch parallel eine Logo-/Assetänderung in `startup.js` erhalten hatte. V2 basiert auf dem neueren Integrationsstand und erhält diese Änderung.

Geändert/neu:
- `staging-short-login.mjs`: Aliasnormalisierung, staging-only Auflösung und UI-Hook
- `startup.js`: installiert Hook vor den vorhandenen Firebase-Auth-Formhandlern
- `tools/build-staging.mjs`: nimmt Modul in den verifizierten Preview-Build auf
- `staging-short-login.test.mjs`: Regressionen einschließlich Production-Nichtumschreibung
- `.github/workflows/staging-short-login-check.yml`: eigener Feature-Gate

## Status

- Code auf Feature-Branch: ✅
- CI: ausstehend für V2
- Integration: ausstehend
- Staging-Preview: ausstehend
- praktischer Login/Registrierungstest: ausstehend
- Production: unverändert

## Nächster Schritt

Feature-CI grün bekommen, danach gegen den frisch geprüften Integrationsbranch integrieren und ausschließlich den Staging-Preview veröffentlichen. Anschließend einmal `test` registrieren und denselben Account wiederholt verwenden.
