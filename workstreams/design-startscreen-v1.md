# Aufgabe: design-startscreen-v1

- Aktualisiert (UTC): 2026-10-03
- Verantwortlicher Chat / Auftrag: GradeCrew – öffentlicher Einstieg / Crew-Welcome
- Aufgabenbranch: `feature/design-startscreen-v1`
- Integrationsbranch: `feature/gradecrew-app-integration`
- vorheriger PR: `#52` – erfolgreich in den Integrationsbranch gemergt
- aktueller Fortsetzungsstand basiert auf Merge `0f6ba3302ed8d8d667eac046e25ffa3b2c6ef5c2`
- Betroffene Dateien dieser Fortsetzung: `gradecrew-entry-flow.js`, `gradecrew-auth-startscreen.css`, `startup.js`, `ai-entry-flow.test.js`, diese Übergabe
- Nicht berührt: Firebase-Auth-Implementierung, Test-/Bewertungs-/Publishinglogik, Firestore Rules, Functions, Secure Assessment, Production

## Ziel

Der öffentliche GradeCrew-Einstieg soll die Crew als Marke sofort sichtbar machen, aber deutlich ruhiger als die erste Entry-Version sein. Der bestätigte Zielentwurf verwendet Coco als Gastgeber und Remy, Emmi und Wilma als klar benannte Arbeitscrew. Die Nutzenbotschaft bleibt bewusst sehr kurz:

`Digitale Tests, schnell & einfach.`

## Architekturentscheidung

Die bestehende Entry-Architektur aus PR #52 bleibt erhalten. Es wird keine zweite Startseitenlogik gebaut.

- `gradecrew-entry-flow.js` läuft weiterhin vor `app.js`.
- Bestehende `joinForm`, `loginForm`, `registerForm`, `loginTab` und `registerTab` werden weiterhin verschoben statt geklont.
- Login/Register/Tutorial/Account-Gate bleiben funktional erhalten.
- Nur der öffentliche Startzustand wird visuell und textlich neu geordnet.
- Single Source of Truth für Logo und Figuren bleibt `shared/gradecrew-design/assets.json`.
- Die aktuelle GradeCrew-Marke bleibt im bestehenden Topbar-/Brand-System; kein neues Logo wird erfunden.
- CSS bleibt strikt auf `#authView` begrenzt.

## Aktueller Startscreen v3

Umgesetzt auf `feature/design-startscreen-v1`:

- Headline: `Hi! Ich bin Coco.` / `Willkommen bei GradeCrew.`
- kurze Nutzenzeile: `Digitale Tests, schnell & einfach.`
- Coco groß als Guide, ausschließlich über kanonisches `coco.welcome`
- Remy / Emmi / Wilma separat mit Rollen `Erstellen`, `Verbessern`, `Prüfen`
- Primäraktion: `Crew kennenlernen`
- Sekundäraktion: `Direkt anmelden`
- kein zusätzlicher Account-erstellen-Link auf dem Startscreen; Registrierung bleibt über die Login-Oberfläche erreichbar
- Schülerzugang als kompakte, hellblau abgesetzte Leiste statt weiß-auf-weiß
- drei kurze Produktvorteile: `Schnell erstellt`, `Einfach durchgeführt`, `Direkt ausgewertet`
- deutlich weniger Eyebrows, Erklärtexte und Dekoelemente
- Responsive-/Focus-/Reduced-Motion-Verträge erhalten
- Cache-Bust auf `auth-startscreen-v3` und Entry-Modul `?v=2`

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

- lokal geändert: nein; Änderungen direkt über GitHub auf Aufgabenbranch gesichert
- auf GitHub gesichert: ja
- Branch: `feature/design-startscreen-v1`
- Basis auf aktuellen Integrations-Merge vorgespult: ja
- neue Startscreen-v3-Änderungen committed: ja
- gezielte Regressionstests angepasst: ja
- GitHub CI für den neuen Fortsetzungsstand: noch zu prüfen
- erneut in `feature/gradecrew-app-integration` integriert: nein
- Staging deployed: nein
- Desktop Preview geprüft: nein
- iPad geprüft: nein
- Smartphone geprüft: nein
- Production: UNVERÄNDERT

## Nächster Schritt

1. Folge-PR vom bestehenden Branch gegen `feature/gradecrew-app-integration` öffnen.
2. CI vollständig prüfen; bei Fehlern auf demselben Branch beheben.
3. Erst nach grünem Gate in den Integrationsbranch übernehmen.
4. Anschließend den bestehenden Hosting-Preview-/Staging-Weg verwenden, damit die Seite im Browser getestet werden kann.
5. Desktop, iPad und Smartphone visuell/funktional prüfen und Befunde hier dokumentieren.
