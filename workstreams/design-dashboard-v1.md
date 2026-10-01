# Aufgabe: design-dashboard-v1

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – erste sichtbare Umsetzung der Design Foundation
- Aufgabenbranch: `feature/design-dashboard-v1`
- Basiscommit: `d42973e9e29361795f773f68e6d6ac8008c36917` (`feature/gradecrew-app-integration`)
- Integrations-PR: `#9` → `feature/gradecrew-app-integration`
- Betroffene Dateien: `shared/gradecrew-design/*`, `generated/*`, `native/Shared/*`, `tools/generate-gradecrew-design.mjs`, `startup.js`, `gradecrew-dashboard-foundation.css`, `tools/build-staging.mjs`, `gradecrew-design-foundation.test.mjs`, `.github/workflows/ai-staging-check.yml`, diese Übergabe
- Überschneidungen: Web-App/Tutorial auf `feature/gradecrew-app-integration`; älteres Shared-Design auf `feature/shared-gradecrew-design-system`. Keine Tutorial-, Assessment-, Backend- oder Security-Logik verändern.

## Ziel und gewünschtes Verhalten

Die erste sichtbare GradeCrew-Designumsetzung auf der aktuell verifizierten Web-Basis. Das vorhandene zentrale Token-/Asset-System wurde in den aktuellen Webstand übernommen. `Meine Tests` und Testkarten bilden den ersten Referenzscreen: ruhiger, klarer, konsistenter und technisch an dieselbe Designquelle wie spätere Web-/Native-Bausteine angebunden.

## Umfang / nicht verändern

Umgesetzt:
- plattformneutrale Design-Tokens Version `1.1.0`
- kanonisches Asset-Manifest für Coco, Remy, Emmi und Wilma
- Generator und generierte Web-/Swift-Ausgaben
- Tokens + isolierte Dashboard-Foundation werden über `startup.js` zuletzt geladen
- Staging-Build paketiert beide neuen Stylesheets
- Dashboard: ruhiger Seitenkopf, eindeutige Hauptaktion, kompakte Statusfilter, reduzierte Suche/Filter, klare TestCard-Hierarchie, Statusdarstellung, Empty State und responsive Regeln
- `+ Neuer Test` bleibt Hauptaktion; Papierkorb bleibt sekundär
- Remy bleibt kanonisch `elephant-create.svg`; der bestehende Startup-Alias für alte statische `falcon-create.svg`-Verwendungen bleibt bewusst erhalten, statt in diesem Teilschritt die große HTML-Datei nebenbei umzubauen
- Design-Branches laufen nun durch dieselbe vollständige AI-Staging-CI wie der Web-Integrationsbranch

Nicht verändert:
- Tutorial-State oder Tutorial-Interaktion
- Test-/Bewertungs-/Publishing-Logik
- Firestore/Functions/Security
- Schülerprüfung/Secure
- Production

## Akzeptanzkriterien

- Branch basiert exakt auf verifiziertem Webstand `d42973e`: erfüllt.
- Shared-Design-Quelle ist maschinenlesbar und bleibt Single Source of Truth: erfüllt.
- Neue CSS-Schicht bleibt von Schüler-/Secure-Selektoren getrennt: durch `gradecrew-design-foundation.test.mjs` abgesichert.
- `+ Neuer Test` bleibt eindeutige Hauptaktion; Papierkorb bleibt sekundär: umgesetzt.
- Suche/Filter sind visuell sekundär zu Testkarten: umgesetzt.
- Testkarten priorisieren Titel, Metadaten, Status und Hauptaktionen; seltene Aktionen bleiben unter `Weitere Aktionen`: umgesetzt, Rendererlogik unverändert.
- Touch-Ziele für zentrale Dashboard-Aktionen mindestens 44 px: über Shared-Token und CSS abgesichert.
- Staging-Build enthält beide neuen Stylesheets: CI-Smoke-Test erfolgreich.

## Zwischenstand

- Lokal geändert: nein; Änderungen direkt auf Aufgabenbranch über GitHub.
- Auf GitHub gesichert: ja. Letzter produktiver Design-Commit vor dieser Dokumentation: `037942515513ddc67a38cad0c6dabe6f74ca1c3f`.
- Geprüft: **AI Staging Checks #373 SUCCESS** auf `037942515513ddc67a38cad0c6dabe6f74ca1c3f` (Run `36877183196`). Enthalten: Functions, Secure-Backend/Client, Firestore-Regel-Emulator, Gate-E-Verträge, Browser-Regressionen, neuer Design-Regressionstest und Staging-Build.
- Frühere identische Produktbasis: AI Staging Checks #372 ebenfalls SUCCESS auf `be67c1592783826fd360d889c0d9bb0d75e80c9b`.
- PR: `#9`, Draft, mergebar; Ziel `feature/gradecrew-app-integration`.
- Deployed: nein. Dieser Designbranch selbst wurde nicht deployed.
- Gerätetest / visuelle Browserabnahme: nein.

## Offene Probleme und Unsicherheiten

- Der aktuelle Webstand enthält mehrere historische CSS-Schichten mit überlappenden Root-Variablen. Foundation V1 konsolidiert diese noch nicht vollständig; die neue letzte Schicht bleibt bewusst klein und reversibel.
- Automatisierte Tests belegen Struktur/Regressionen, nicht die visuelle Qualität im echten Browser. Die erste visuelle Abnahme soll über den verifizierten Preview-Channel nach Integration in `feature/gradecrew-app-integration` erfolgen.
- Der bekannte fehlgeschlagene 30er-Test, die gemeldete manuelle Tutorialabgabe und offene Production-Security-Gates sind durch diese Designarbeit weder verursacht noch behoben.

## Nächster konkreter Schritt

Nach erfolgreichem CI des Dokumentations-Checkpoints PR #9 in `feature/gradecrew-app-integration` integrieren. Dadurch läuft dort erneut die vollständige CI; bei Erfolg kann die bestehende automatische, verifizierte Staging-Preview den exakt getesteten Integrationscommit veröffentlichen. Anschließend Desktop + Mobile visuell prüfen und erst danach Dashboard V1 als Referenz akzeptieren oder feinjustieren.

## Wiederaufnahme nach Abbruch

Keine lokalen ungesicherten Dateien. Branch `feature/design-dashboard-v1`, PR #9 und diese Datei sind die Übergabe. Bis Integration + verifizierte Preview + visuelle Abnahme erfolgt sind, gilt die Änderung als **auf GitHub gesichert und automatisiert getestet**, nicht als visuell freigegeben oder Production-deployed.
