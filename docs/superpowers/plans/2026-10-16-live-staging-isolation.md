# GradeCrew Live/Staging Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bestehende Staging-Daten als Live erhalten, Tests physisch isolieren, Apps und Lehrkräftefeedback korrekt anbinden.

**Architecture:** Explizites Umgebungsregister für Build/Deploy/Verifikation, zwei getrennte Firebase-Projekte und unveränderter Altbestand. Vorhandenen Feedback-/Review-Datenfluss erweitern; native Quellen separat bearbeiten.

**Tech Stack:** Firebase Hosting/Auth/Firestore/Functions, Node 22, Browser ES Modules, SwiftUI/WebKit/AAC, GradeCrew Central MCP.

**Spec:** `docs/superpowers/specs/2026-10-16-live-staging-isolation-design.md`

## Global Constraints

- Live `hausaufgabe-staging`, neue Tests `gradecrew-staging-2026`, Altbestand `hausaufgabe-40294`.
- Firestore `eur3`, Functions `europe-west1`; keine echten Nutzerdaten in neue Tests kopieren.
- Keine realen Konten löschen, Quellprojekt nie zurücksetzen, Sicherungen nie in Git/Hosting speichern.
- Native App-Quellen separat; keine pauschale Web-Branch-Zusammenführung.
- Rollenprüfungen/Freigaben serverseitig; Chat-Abruf ausschließlich lesend und ausdrücklich Live zugeordnet.

## Review Focus

- Ein alter Staging-Deploy darf das Live-Projekt nicht mehr als Testziel benutzen: Prozess-/Buildtest in Task 2.
- Lehrkraft versucht mit Adminfeldern eine Freigabe oder einen fremden Test zu verändern: reale Service-/Regeltests in Task 3.
- Mehr als 100 Hinweise und veränderte Fassungen: Pagination und unverändert pending in Task 3/4 testen.
- Installierte Teacher-App hat alte Preview-Präferenz; Secure-Code existiert nur in einer Umgebung: Task 5 prüft explizite Bindung.
- Teilweise fehlgeschlagene Provisionierung/Sicherung: Task 1/6 verweigern erfolgreiche Umstellungsbehauptung ohne Quittung.

### Task 1: Inventar, Sicherung, unabhängige Testressourcen

**Files:** Create `workstreams/live-staging-isolation-20261016.md`; Cloud-Belege privat außerhalb Git.
**Interfaces:** Produces geprüfte Live-Sicherungsquittungen, neue Projekt-ID/Webconfig und Dienste-Status.
- [ ] Bestehende Cloud-/Auth-/Storage-/Deployment-Konfiguration und neue Projektverfügbarkeit lesen.
- [ ] Private Sicherungen exportieren, Vollständigkeit/Hash belegen und ohne Überschreiben der Quelle prüfen.
- [ ] Eigenes Firebase-Projekt provisionieren, Standort/Billing/Auth/Storage/Functions explizit konfigurieren; keine Echtdaten kopieren.
- [ ] Alle Resultate/Blockaden ohne Secrets im Workstream dokumentieren.

### Task 2: Explizite Build- und Deploymentgrenzen

**Files:** Create `tools/environments.mjs`, `tools/environments.test.mjs`; Modify `tools/build-staging.mjs`, `tools/verify-staging.mjs`, `.firebaserc`, Deployment-Skripte und betroffene Workflows; Create Live-Build/-Deploy-Einstieg.
**Interfaces:** Produces `getEnvironment(name)` und `assertDeploymentTarget(environment, projectId)` mit exakter Live/Test-Bindung; Builder bekommt explizites Umgebungsargument und schreibt dieselbe Bindung ins Manifest.
- [ ] Test für staging→neues Projekt und production→bestehendes Projekt; widersprüchliches Ziel muss vor Upload scheitern. RED beobachten.
- [ ] Minimale zentrale Zuordnung implementieren, public Webconfig pro Ziel generieren; Legacy-Deploys fail closed und keine stillen Live-Fallbacks.
- [ ] Reale Builddateien/Manifeste beider Ziele prüfen; vollständige bestehende Build-/Browser-Suites grün. Commit.

### Task 3: Kompaktes ET für aktive Lehrkräfte

**Files:** Modify `functions/lib/review-mode.js`, `functions/test/review-mode.test.js`, `app.js`, `review-mode.mjs`, zugehörige vorhandene UI-/Emulatortests.
**Interfaces:** Bestehende Review-API bleibt erhalten, aktive teacher dürfen create/list eigene Hinweise; `batch`/approve/transition/check/grant bleiben Adminfunktionen.
- [ ] Service-/UI-Regression für aktive Lehrkraft ohne manuelle Mitgliedschaft schreiben; pending, fremde Tests, Admin-Spoofing und nicht freigegebene Batchauswahl prüfen. RED beobachten.
- [ ] Bewusste Live/Test-Projektfreigabe statt alter Staging-only-Konstante; Live-Feedbackzugang ohne Debug-/Testaktionen.
- [ ] Vorhandene Freigabe-, Idempotenz-, Rollen- und Browser-Suites vollständig ausführen. Commit.

### Task 4: Lesender Chat-Abruf

**Files:** Connector-Quellen nach deren lokalem Inventar; im Repo dokumentierter Abrufvertrag und Tests für Rollen/Pagination/Umgebung.
**Interfaces:** Expliziter Live-Lesezugang, Lehrkräftehinweise vollständig mit Cursor und ohne Umsetzung abrufen; Adminsession kurzlebig.
- [ ] Vorhandene Connectorquellen und Installationspfad prüfen. Live-Lesefunktion konkret vorbereiten, kein Umgehen des bestehenden Production-Verbots.
- [ ] Tests für Adminzugriff, eigene/fremde Rollen, vollständige Pagination und teacher-Filter RED→GREEN.
- [ ] Connectoränderung kontrolliert installieren, Lesefunktion wirklich prüfen; notwendige Anmeldung dem Nutzer als lokale URL anbieten. Chat-Auftrag dokumentieren.

### Task 5: Teacher-/Secure-Konfigurationen

**Files:** Native Branch: `native/GradeCrewTeacher/Sources/GradeCrewBetaEnvironment.swift` und Navigations-/Sessionquellen, `native/GradeCrewSecure/Sources/SecureAssessmentAPI.swift`, explizite Konfigurationen und bestehende Tests/Workflows.
**Interfaces:** Live-URL/API gebunden an bestehendes Projekt; Tests an neues Projekt; keine freie Cross-Project-Suche oder gemeinsam verwendete Auth-/Attempt-Speicher.
- [ ] Native Quellen aus dem aktuellen App-Branch prüfen, übrige Webquellen erhalten.
- [ ] Alte Previewpräferenz und getrennte Speicher/Endpunkte durch echte Tests absichern. RED→GREEN.
- [ ] Native Builds und bestehende Layout-/AAC-Entitlement-Prüfungen ausführen; App-Version/CI/TestFlight und Gerätetest getrennt belegen.

### Task 6: Kontrollierter Rollout und Abschluss

**Files:** Workstream, Umgebungs-/Connector-Betriebshinweise, kanonische Übergabe.
- [ ] Frische unabhängige Gesamtprüfung; wichtige Befunde mit Regression beheben.
- [ ] Neue Tests zuerst bereitstellen und isolierten synthetischen Durchlauf prüfen; erst dann Live aus geprüftem Commit veröffentlichen.
- [ ] Live-Konten-/Testbindung, Cloudquellen, Assethashes und CI prüfen. Keine echten Testabgaben/Kontolöschungen ohne konkreten Testauftrag.
- [ ] Übergaben und Projektgrenze aktualisieren; tatsächliche offene Nachweise/Blockaden klar nennen.
