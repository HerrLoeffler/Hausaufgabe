# Aufgabe: design-startscreen-v1

- Aktualisiert (UTC): 2026-10-04
- Aufgabenbranch: `feature/design-startscreen-v1`
- Aktivierungsfix: `feature/design-startscreen-entry-activation-fix@ae08595783901e32c657a80bd39b66d137991074`
- Integrationsbranch: `feature/gradecrew-app-integration@eb80c5e6a8b6c1ae13deba676709607bfccee208`
- PR #52: Entry-Architektur integriert
- PR #55: vereinfachter Crew-Welcome integriert
- PR #61: tatsächliche Startscreen-Aktivierung integriert
- PR #68: Startscreen Masterpiece v1 integriert (`7f464085e89bdb3ea331dfbc988decfa83bc59f6`)
- Production: unverändert

## Ziel

Der öffentliche GradeCrew-Einstieg zeigt die Crew als Marke sofort sichtbar und bleibt bewusst ruhig. Coco begrüßt als Guide, Remy, Emmi und Wilma bilden die Arbeitscrew. Nutzenbotschaft:

`Digitale Tests, schnell & einfach.`

## Aktueller Funktionsumfang

Masterpiece v1 ergänzt die bestehende Entry-Architektur um öffentliche Navigation (`Funktionen`, `Die Crew`, `Für Lehrkräfte`, `Hilfe`), breitere Markenbühne, responsive Klassenzimmer-Komposition, stärkere Coco-/Crew-Hierarchie, integrierte CTA-/Testcode-Zone und vier Benefits. Die kanonischen Crew-Assets und bestehenden Formular-/Auth-Handler bleiben erhalten.


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
- Integrations-CI `37194222568`: success
- Hosting Preview Run `37194313727`: success
- Hosting Receipt Artifact `11299769344`
- Receipt bindet `eb80c5e6a8b6c1ae13deba676709607bfccee208`
- veröffentlichte Dateien hash-verifiziert: `106`
- Preview: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- AI Functions Run `37194313703`: success für denselben Gesamt-Kandidaten; Receipt Artifact `11300560359`; der Startscreen selbst enthält keine neue Function-Logik
- Firestore Rules: in diesem Release Train nicht deployed
- Production: unverändert

## Manuelle Abnahme

Noch offen:
1. Desktop: Header/Navigation, Hero-Hierarchie, Crew-Größe, beide CTAs und Benefit-Leiste.
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
