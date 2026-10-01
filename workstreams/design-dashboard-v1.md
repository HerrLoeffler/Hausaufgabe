# Aufgabe: design-dashboard-v1

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – erste sichtbare Umsetzung der Design Foundation
- Aufgabenbranch: `feature/design-dashboard-v1`
- Basiscommit: `d42973e9e29361795f773f68e6d6ac8008c36917` (`feature/gradecrew-app-integration`)
- Integrations-PR: `#9`
- In Web-Staging-Branch integriert als: `74eb2ec08e81315875abfc4b1ae052d9f78797eb`

## Umgesetzt

- Shared GradeCrew Design Source mit `tokens.json` Version 1.1.0 und kanonischem Asset-Manifest für Coco, Remy, Emmi und Wilma in den aktuellen Webstand übernommen.
- Generator plus Web-/Swift-Ausgaben ergänzt.
- `startup.js` lädt Shared-Tokens und die isolierte Dashboard-Foundation-Schicht.
- `Meine Tests` als erster Referenzscreen überarbeitet: ruhiger Seitenkopf, eindeutige Hauptaktion `+ Neuer Test`, sekundärer Papierkorb, kompakte Statusfilter, reduzierte Suche/Filter, klarere Testkarten, Statusdarstellung, Empty State und responsive Regeln.
- Remy bleibt kanonisch Elefant / Create-KI-Rolle.
- Staging-Build paketiert die neuen Stylesheets.
- Eigener Regressionstest sichert Shared-Tokens, Crew-Rollen, Build-Einbindung und die Abgrenzung zu Schüler-/Secure-Ansichten.
- Design-Branches laufen durch die vollständige AI-Staging-CI.

## Nachweise

- Produkt-/CSS-Stand `037942515513ddc67a38cad0c6dabe6f74ca1c3f`: AI Staging Checks #373 SUCCESS.
- Integrationscommit `74eb2ec08e81315875abfc4b1ae052d9f78797eb`: AI Staging Checks Run `36877793069` SUCCESS, einschließlich Functions, Secure, Firestore-Regel-Emulator, Browser-Regressionen und Staging-Build.
- Derselbe Integrationscommit: Mobile-Tutorial-Check Run `36877793076` SUCCESS.
- Automatische Preview Run `36878009106`: Build SUCCESS, Deploy SUCCESS, Branch-Commit vor Deploy erneut geprüft, veröffentliches Manifest und Dateihashes nach Deploy SUCCESS verifiziert; `verified-preview-receipt` gespeichert.
- Preview-Channel: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`

## Status korrekt unterscheiden

- Auf GitHub gesichert: ja.
- In `feature/gradecrew-app-integration` integriert: ja, Commit `74eb2ec...`.
- Automatisierte Prüfungen: ja, grün.
- Preview deployed und technisch verifiziert: ja.
- Visuelle Abnahme im authentifizierten Desktop-/Mobil-Browser: noch offen.
- Production: unverändert / nicht deployed.

## Nicht durch diese Arbeit behoben

- fehlgeschlagener 30-Teilnehmer-Test; Ursache weiter ungeklärt
- gemeldete manuelle Tutorialabgabe in der App
- offene Production-Security-Gates

## Nächster konkreter Schritt

Preview visuell auf Desktop und Mobil prüfen. Danach Dashboard/TestCard feinjustieren oder als Referenzscreen freigeben. Anschließend `Neuer Test` und Testeditor auf denselben Komponenten-/Token-Vertrag umstellen.
