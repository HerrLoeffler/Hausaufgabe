# Release Control / Acceptance V1

## Ziel
Eine kanonische Produkt-/Abnahmesicht ergänzen, damit keine bereits entwickelte Funktion zwischen Feature-Branch, Integration, Staging, TestFlight, Games-Lab oder Production vergessen wird. Manuelle Abnahmen müssen an den exakten getesteten SHA gebunden sein.

## Branch
`feature/release-control-acceptance-v1` → `main`

## Enthalten
- `release-control/catalog.json`: Feature-/Testinventar mit stabilen IDs.
- `release-control/acceptance.json`: manuelle Abnahmezustände.
- `tools/release_control.py`: read-only Zusammenführung von Git/GitHub, Release-State, Registry, Deployment-Receipts und Abnahme.
- `.github/workflows/release-control.yml`: stündlicher/eventbasierter Job Summary + JSON/Markdown-Artefakt.
- `release-control/README.md`: Bedienung und Statussemantik.

## Bereits geprüft
- Erster Workflow-Entwurf lief bis zum Checkout und fand einen redundanten Fetch nach `persist-credentials:false`; Workflow gezielt korrigiert.
- Zweiter Lauf `37020504421`: success; Board wurde erzeugt.
- Der erste echte Boardlauf erkannte korrekt, dass `GRADECREW_STATE.json` beim Web-Integrations-SHA hinter GitHub liegt.
- Reales Hosting-Receipt aus Run `37014137329`, Artifact `11229331114`: `feature/gradecrew-app-integration@8aba2a7ce70c75842fbe4b81c4e6491136366768`, 103 Dateien, hash-verifiziert, Production unverändert.
- Danach Actions-Lookup auf mehrere Seiten erweitert, damit ein stark beschäftigtes Multi-Agent-Repo nicht auf alte State-Fallbacks zurückfällt.

## Sicherheitsgrenzen
- Kein Deploy durch Release Control.
- Kein Merge/Branch-Löschen/Force-Push.
- Kein automatisches Hochstufen auf `user_tested` oder Production.
- `passed`/`failed` gilt nur für `testedSha`; neuer Ziel-SHA => `retest`.
- Production bleibt ausdrücklich freigabepflichtig.

## Offen / nächster Schritt
1. Aktuellen paginierten Release-Control-Lauf auswerten: Hosting/Functions müssen aus echten Receipts statt veraltetem State kommen, soweit vorhanden.
2. Handoff-/Registry-Einbindung auf aktuellem `main` vervollständigen, ohne PR #48 (`development-status.yml`) zu überschneiden.
3. Draft-PR nach `main` öffnen und Release-Control + Project-Handoff-CI auf finalem Head prüfen.
4. Nach Integration ersten kanonischen Main-Lauf prüfen.
5. Danach kann Martin Abnahmen im Chat melden; betreuender Chat schreibt Status + exakten Ziel-SHA in `acceptance.json` und startet bei Fehler einen Fix/Retest-Zyklus.
