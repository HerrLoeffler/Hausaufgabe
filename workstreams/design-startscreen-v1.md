# Aufgabe: design-startscreen-v1

- Aktualisiert (UTC): 2026-10-03
- Verantwortlicher Chat / Auftrag: GradeCrew – öffentlicher Einstieg / Crew-Welcome
- Aufgabenbranch: `feature/design-startscreen-v1`
- Integrationsbranch: `feature/gradecrew-app-integration`
- PR `#52`: erste Entry-Architektur erfolgreich integriert
- PR `#55`: vereinfachter Crew-Welcome erfolgreich integriert
- Integrations-Merge für v3: `5b2c6430470485bee9ec30a509365cb93e52edaf`
- Nicht berührt: Firebase-Auth-Implementierung, Test-/Bewertungs-/Publishinglogik, Firestore Rules, Functions, Secure Assessment, Production

## Ziel

Der öffentliche GradeCrew-Einstieg zeigt die Crew als Marke sofort sichtbar, bleibt aber bewusst ruhig. Coco begrüßt als Guide, Remy, Emmi und Wilma bilden die Arbeitscrew. Die Nutzenbotschaft ist absichtlich kurz:

`Digitale Tests, schnell & einfach.`

## Architekturentscheidung

Die bestehende Entry-Architektur aus PR #52 bleibt erhalten. Es wurde keine zweite Startseitenlogik gebaut.

- `gradecrew-entry-flow.js` läuft weiterhin vor `app.js`.
- Bestehende `joinForm`, `loginForm`, `registerForm`, `loginTab` und `registerTab` werden weiterhin verschoben statt geklont.
- Login/Register/Tutorial/Account-Gate bleiben funktional erhalten.
- Single Source of Truth für Logo und Figuren bleibt `shared/gradecrew-design/assets.json`.
- Die aktuelle GradeCrew-Marke bleibt im bestehenden Topbar-/Brand-System; kein neues Logo wurde eingeführt.
- CSS bleibt strikt auf `#authView` begrenzt.

## Startscreen v3

In `feature/gradecrew-app-integration` enthalten:

- Headline: `Hi! Ich bin Coco.` / `Willkommen bei GradeCrew.`
- kurze Nutzenzeile: `Digitale Tests, schnell & einfach.`
- Coco groß als Guide über das kanonische Welcome-Asset
- Remy / Emmi / Wilma mit `Erstellen`, `Verbessern`, `Prüfen`
- Primäraktion: `Crew kennenlernen`
- Sekundäraktion: `Direkt anmelden`
- kein zusätzlicher Anmeldebutton im Startscreen selbst neben der zentralen Aktion
- Registrierung bleibt über die bestehende Login-/Register-Oberfläche erreichbar
- Schülerzugang als kompakte hellblaue Leiste statt weiß-auf-weiß
- drei kurze Produktvorteile: `Schnell erstellt`, `Einfach durchgeführt`, `Direkt ausgewertet`
- responsive Layouts, sichtbare Fokuszustände und Reduced Motion erhalten
- Cache-Bust: `auth-startscreen-v3`, Entry-Modul `?v=2`

## Prüfungen

Feature-Branch `54bd3ae8b1c9f4b4e5be5548c63be9fd249b3b41`:

- AI Staging Checks Run `37079836962`: SUCCESS
- Unit Tests: SUCCESS
- Secure Assessment Backend/Browser/Client: SUCCESS
- Firestore Emulator Security: SUCCESS
- Legacy Browser Regression: SUCCESS
- Staging Build Smoke: SUCCESS

Integrations-Merge `5b2c6430470485bee9ec30a509365cb93e52edaf`:

- Admin Test-Account Controls: SUCCESS
- AI Staging Checks: SUCCESS

## Geschützte Funktionen

Unverändert:

- Firebase Auth und bestehende Login-/Register-Handler
- `?test=CODE` → Secure Student Routing
- Secure Assessment
- Firestore Rules / Functions
- Test-/Bewertungs-/Publishinglogik
- Gast-Tutorial und Account-Gate
- Production

## Status

- lokal geändert: nein
- auf GitHub gesichert: ja
- Aufgabenbranch getestet: ja
- in `feature/gradecrew-app-integration` integriert: ja
- Integrationschecks grün: ja
- Hosting-Preview deployed: noch nein
- Desktop Preview visuell geprüft: nein
- iPad geprüft: nein
- Smartphone geprüft: nein
- Production: UNVERÄNDERT

## Preview-Deploy

Der vorhandene, serverseitig geschützte Weg bleibt verbindlich:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/gradecrew-app-integration
git pull --ff-only
bash deploy-app-integration-preview.sh --deploy
```

Das Skript veröffentlicht ausschließlich den Firebase Hosting Preview-Channel `gradecrew-app-integration` im Projekt `hausaufgabe-staging`. Normales Staging, Functions, Firestore-Regeln und Production werden nicht verändert.

## Nächster Schritt

1. Hosting-Preview über authentifizierte Cloud Shell deployen.
2. Ausgegebene Preview-URL im Desktop-Browser prüfen.
3. Danach iPad/Smartphone testen: Hero-Hierarchie, Crew-Größe, CTA-Erreichbarkeit, Testcode-Leiste sowie Login/Registrierung/Tutorial.
4. Befunde hier dokumentieren; erst danach weitere Politur.
