# Aufgabe: GC-ACTIONS-COST-01 / Web-Dokumentation

- Aktualisiert (UTC): 2026-10-04
- Aufgabenbranch: `fix/actions-web-docs-20261004`
- Basiscommit: `b5d456e377fc56701d2a89a83385a7d773773781`
- Integrationsziel: `feature/gradecrew-app-integration`.
- Änderung: AI Staging Checks ignoriert reine Markdown-, docs/- und workstreams/-Pushes; Testkörper und übrige Trigger unverändert.
- Nachweis: YAML und reine Dokumentation gegenüber gemischten Code-/Rules-/Dependency-/Workflow-Pushes lokal geprüft. Keine lokal ausgeführte App-Suite, neue Remote-CI offen.
- Gesichert: Commit dieses eigenen Folgebranches; tatsächlichen SHA/PR frisch lesen.
- Überschneidung: PR #51 erweitert genau diese Workflow-Datei. Dessen Merge-Result-PR-Gate und zusätzliche Tests beim Zusammenführen erhalten.
- Nächster Schritt: exakte neue CI nach öffentlicher Umstellung prüfen; mit #51 zusammenführen. Nicht allein anhand dieser Dokumentationsfilterung einen Staging-Deploy freigeben.
- Deployed / Gerätetest: keiner.
- Wiederaufnahme: Kontroll-Übergabe workstreams/actions-cost-policy-20261004.md auf dem Kostenbranch lesen; keine alten grünen Runs dem neuen Commit zuordnen.
