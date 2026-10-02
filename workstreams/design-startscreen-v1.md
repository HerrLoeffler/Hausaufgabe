# Aufgabe: design-startscreen-v1

- Aktualisiert (UTC): 2026-10-03
- Verantwortlicher Chat / Auftrag: GradeCrew – kompletter Neubau des öffentlichen Einstiegs
- Aufgabenbranch: `feature/design-startscreen-v1`
- Basisbranch: `feature/gradecrew-app-integration`
- Basiscommit: `8aba2a7ce70c75842fbe4b81c4e6491136366768`
- PR: `#52`
- Betroffene Dateien: `gradecrew-entry-flow.js`, `gradecrew-auth-startscreen.css`, `startup.js`, `tools/build-staging.mjs`, `ai-entry-flow.test.js`, diese Übergabe
- Nicht berührt: Firebase-Auth-Implementierung, Test-/Bewertungs-/Publishinglogik, Firestore Rules, Functions, Secure Assessment, Production

## Ziel

Der öffentliche GradeCrew-Einstieg ist kein Login-Kasten mit neuem CSS mehr. Screen 1 ist ein eigenständiger Startscreen mit klarer Hierarchie: Tutorial ohne Registrierung als Hauptweg, Anmeldung als zweiter Weg, Account erstellen als dezenter dritter Weg und Testcode als kompakter Schülerzugang.

## Architekturentscheidung

Die bestehende Auth-/Routinglogik wird geschützt, aber die öffentliche DOM-Struktur wird wirklich neu zusammengesetzt:

- `gradecrew-entry-flow.js` läuft vor `app.js`.
- Die vorhandenen DOM-Knoten `joinForm`, `loginForm`, `registerForm`, `loginTab` und `registerTab` werden aus dem alten Loginlayout herausgelöst und in getrennte Entry-Zustände verschoben.
- IDs, Formulare und bestehende Firebase-/Testcode-Handler werden nicht dupliziert oder neu implementiert.
- Die alten Login/Register-Tabs bleiben als unsichtbare Kompatibilitäts-Controls erhalten, damit die bestehende App-Logik den richtigen Authmodus setzt.
- Die öffentliche Entry-CSS bleibt strikt auf `#authView` begrenzt; Secure Student und Dashboard werden nicht gestylt.

## Verbindliche Quellen

Single Source of Truth für Marke und Crew bleibt `shared/gradecrew-design/assets.json`; Farben/Abstände nutzen die vorhandenen GradeCrew-Tokens.

Das Gast-Tutorial importiert außerdem `CREW` und `DEMO_TEST` aus der bestehenden `gradecrew-tour.js`-Kette. Es erfindet weder Crew-Daten noch einen zweiten Demo-Test. Der bestehende authentifizierte Live-Tutorial-Flow bleibt unangetastet.

## Phasenstatus

### Phase A – Ist-Zustand analysieren
Erledigt.

- Integrationsbranch und Basiscommit geprüft.
- offene PRs geprüft; PR #52 als vorhandene parallele Startscreen-Arbeit identifiziert und weiterverwendet statt zweiter Lösung.
- vorhandene Auth-IDs, Testcode-Routing, Tutorial-System, kanonische Assets, Design-Tokens und Staging-Build geprüft.
- festgestellt: vollständige Live-Tour benötigt aktuell einen authentifizierten UID-/Dashboard-Kontext.

### Phase B – neue UX-Struktur definieren
Erledigt.

Zustände: Start, Login, Register, Name für Gast-Tutorial, Gast-Tutorial, Account-Gate.

### Phase C – Startscreen implementieren
Erledigt auf Feature-Branch.

- echtes zentrales GradeCrew-Logo
- `Willkommen bei GradeCrew.` / `Dein Team für bessere Tests.`
- `Tutorial starten` + `Ohne Registrierung` als Primäraktion
- `Anmelden` sekundär
- `Account erstellen` tertiär
- gemeinsame kanonische Crew-Szene plus Coco/Remy/Emmi/Wilma
- Schüler-Testcode kompakt und weiter mit bestehendem `joinForm`
- Screen 1 enthält keine Login-/Register-Credential-Felder

### Phase D – Login und Register getrennte Zustände
Erledigt auf Feature-Branch.

Die bestehenden Formulare werden unverändert funktional in eigene Oberflächen verschoben. Keine neue Firebase-Auth-Implementierung.

### Phase E – Tutorial-Einstieg ohne Account
Erledigt als öffentlicher No-Save-Primer.

- fragt zuerst nur `Wie dürfen wir dich nennen?`
- keine E-Mail / kein Passwort / keine Registrierung
- stellt Coco, Remy, Emmi, Wilma über kanonische Szenen vor
- verwendet dieselben vorbereiteten Tutorialdaten (`DEMO_TEST`), ohne Provider-/KI-Anfrage
- kleine echte Interaktion mit vorbereitetem Testinhalt

Wichtige Grenze: Die bestehende vollständige Live-Tour selbst arbeitet mit echten Dashboard-/Firestore-Aktionen und verlangt derzeit `uid()`. Sie wurde bewusst nicht als zweite anonyme App-Engine dupliziert. Der öffentliche Primer demonstriert daher den Flow ohne Speicherung; nach Login bleibt die bestehende volle Live-Tour erhalten.

### Phase F – Account-Gate
Erledigt auf Feature-Branch.

Nach dem Primer erscheint erst beim Übergang zu dauerhaftem Arbeiten der freundliche Dialog `Möchtest du deinen Fortschritt speichern?` mit `Account erstellen`, `Anmelden`, `Später`.

### Phase G – Responsive + Accessibility
Erledigt im Code, echte Geräteabnahme noch offen.

- Desktop / Tablet / Mobile Breakpoints
- Touch-Ziele >= 44 px
- sichtbarer `:focus-visible`
- semantische Buttons und Labels
- ARIA-State / `aria-live`
- `prefers-reduced-motion`
- kein seitliches Scrollen vorgesehen

### Phase H – Tests + CI
Code und Regressionstests vorhanden.

`ai-entry-flow.test.js` wird vom bestehenden `ai-*.test.js`-CI-Glob automatisch mit ausgeführt und prüft u. a. getrennten Startscreen, Verschieben statt Klonen der alten Formulare, kanonische Assets, Gastname, Account-Gate, Accessibility/Responsive, Secure-Student-Scope und Staging-Paketierung.

Lokaler isolierter Lauf: 9/9 Entry-Regressionstests grün. Vollständige GitHub CI für den aktuellen Branch ist Gate vor Integration.

### Phase I – Staging Preview
Noch nicht abgeschlossen.

Der vorhandene Preview-Deploy `deploy-app-integration-preview.sh` ist absichtlich auf `feature/gradecrew-app-integration` und den Firebase-Hosting-Channel `gradecrew-app-integration` verriegelt. Deshalb zuerst CI, dann Integration, erst danach Preview-Deploy.

## Sicherheits- und Integrationsgrenzen

- Production unverändert
- keine Firestore-Rule-/Functions-Änderung
- kein neues Auth-System
- Secure Assessment unverändert
- öffentliche CSS auf `#authView` begrenzt
- Schüler-`?test=CODE`-Handoff bleibt vor Entry-/App-Import in `startup.js`
- keine Falcon-/Demo-/Ersatzfigur im neuen Einstieg

## Status

- lokal geändert: nein; Arbeitsstand auf GitHub gesichert
- auf GitHub gesichert: ja
- Branch: `feature/design-startscreen-v1`
- PR: #52
- gezielte Entry-Tests lokal: 9/9 grün
- vollständige CI: laufend / vor Integration erneut prüfen
- Staging integriert: nein
- Staging deployed: nein
- Desktop visuell im echten Preview geprüft: nein
- iPad geprüft: nein
- Smartphone geprüft: nein
- Production: UNVERÄNDERT

## Nächster Schritt

1. vollständige CI für den aktuellen PR-Head prüfen und Fehler gegebenenfalls auf diesem Branch beheben.
2. bei grünem Gate PR #52 in `feature/gradecrew-app-integration` integrieren.
3. exakt den vorhandenen Hosting-Preview-Weg für `gradecrew-app-integration` verwenden; keine Rules/Functions/Production deployen.
4. echte Preview in Desktop, iPad und Smartphone prüfen.
5. visuelle/funktionale Befunde wieder in dieser Übergabe dokumentieren.
