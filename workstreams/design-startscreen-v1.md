# Aufgabe: design-startscreen-v1

- Aktualisiert (UTC): 2026-10-04
- Aufgabenbranch: `feature/design-startscreen-v1`
- Aktivierungsfix: `feature/design-startscreen-entry-activation-fix@ae08595783901e32c657a80bd39b66d137991074`
- Integrationsbranch: `feature/gradecrew-app-integration@e46b747188e82043787824b412b11922703d1f8d`
- PR #52: Entry-Architektur integriert
- PR #55: vereinfachter Crew-Welcome integriert
- PR #61: tatsächliche Startscreen-Aktivierung integriert
- Production: unverändert

## Ziel

Der öffentliche GradeCrew-Einstieg zeigt die Crew als Marke sofort sichtbar und bleibt bewusst ruhig. Coco begrüßt als Guide, Remy, Emmi und Wilma bilden die Arbeitscrew. Nutzenbotschaft:

`Digitale Tests, schnell & einfach.`

## Aktueller Funktionsumfang

- `Hi! Ich bin Coco.` / `Willkommen bei GradeCrew.`
- Coco groß als Guide
- Remy / Emmi / Wilma mit `Erstellen`, `Verbessern`, `Prüfen`
- Primäraktion `Crew kennenlernen`
- Sekundäraktion `Direkt anmelden`
- Registrierung bleibt über bestehende Login-/Register-Oberfläche erreichbar
- Schülerzugang als kompakte hellblaue Leiste
- Produktvorteile `Schnell erstellt`, `Einfach durchgeführt`, `Direkt ausgewertet`
- responsive Layouts, Fokuszustände und Reduced Motion
- bestehende Formulare werden verschoben statt geklont
- `gradecrew-entry-flow.js` wird vor `app.js` installiert
- bei fehlgeschlagener Entry-Installation wird der Start sichtbar abgebrochen statt still auf den Altstand zurückzufallen

## Geschützte Funktionen

Unverändert:
- Firebase Auth
- `?test=CODE` / Schüler-Routing
- Secure Assessment
- Firestore Rules / Functions
- Test-/Bewertungs-/Publishinglogik
- Gast-Tutorial und Account-Gate
- Production

## Technischer Nachweis

- Feature-CI Run `37079836962`: success
- Integrations-CI `37106491774`, Attempt 2: success
- Hosting Preview Run `37193867508`: success
- Hosting Receipt Artifact `11299618749`
- Receipt bindet `e46b747188e82043787824b412b11922703d1f8d`
- veröffentlichte Dateien hash-verifiziert: `106`
- Preview: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- AI Functions Run `37193867443`: success für denselben Gesamt-Kandidaten; der Startscreen selbst enthält keine neue Function-Logik
- Firestore Rules: in diesem Release Train nicht deployed
- Production: unverändert

## Manuelle Abnahme

Noch offen:
1. Desktop: Hero-Hierarchie, Crew-Größe, beide CTAs.
2. Schülerzugang/Testcode.
3. Login + Registrierung.
4. Tutorial-Einstieg.
5. iPad/iPhone: Reihenfolge, Erreichbarkeit, keine abgeschnittenen Elemente.
6. Danach Abnahmeergebnis im Release Control mit exakt getestetem SHA speichern.

## Status

- auf GitHub gesichert: ja
- integriert: ja
- Combined CI: grün
- Hosting Staging-Preview: deployed und hash-verifiziert
- Gerätetest: offen
- user_tested: nein
- Production: unverändert
