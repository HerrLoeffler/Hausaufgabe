# Release Control – Nachprüfung und ehrliche Nachweise

Task: GC-RELEASE-01 bis 07 / GC-ACCEPTANCE-01 und 02.
Branch: `fix/release-control-evidence-v2` → `main`, Basis `943d98e45f2c15ad6a09bba377e8eed6c996218f`.
Keine Deploy-/IAM-/Production-Änderung in diesem Auftrag.

## Frisch verifiziert am 02.10.2026

- Development Status Run `37053274929` erfolgreich gelesen. Registry, main-Regeln, State, TODO und Branch-Workflows frisch geprüft.
- PR #49 gemergt als `ed53a9dd127e9a3c75f0d80ec0682b29490daa5a`. Board-Run `37022513923` grün, aber hatte keine Verhaltenstests; grüne Ausführung bedeutet nicht vollständige Release-Freigabe.
- Web-Kandidat `8aba2a7ce70c75842fbe4b81c4e6491136366768`; State dokumentiert noch `18e30d0d…`. Letzter anderer Chat bestätigte Hosting-Receipt aus Run `37014137329`, Artifact `11229331114`. V2 muss es unabhängig neu lesen.
- PR #39 Gateway gemergt `af8b06ac09b1bc4a4f82445dbe0763c6ac010d6f`; PR #40 Escape gemergt `bac82bb4b65b9c57de624332a4a0a22c3c2e8563`; PR #41 Remy gemergt `e024024322a809dc5fadcaa6fb6e2e3c9a9504de`. Frühere Review-Arbeit ging nicht verloren.
- Gateway-Integration bei `479e2fa9f682c5eaef4e33292cd33c94d56943dc`. Automatisches Routing ist damit nicht automatisch aktiviert; echte Referenzdaten, signierte Qualifikation, Pilot-Functions und Admin-Proxy/Mount bleiben eigene Aufgaben.
- Escape-Head `a7ffc382128c49b418a79c31812f88e7fe0fd3d2`: Run `37021633218`, Job `110885892947` scheitert beim neuen Functions-Deploy an HTTP 403 `secretmanager.secrets.get` für `OPENAI_API_KEY`. Tests/Build waren davor grün, Hosting-Deploy danach übersprungen. Keine Secret-Werte gelesen. Rechte und Funktionsarchitektur erst separat prüfen, kein pauschaler IAM-Ausbau.
- TestFlight 0.1.6: Workflow im kanonischen iOS-Branch, Upload-Runs `37024138336` und `37024529022` erfolgreich. Upload ist kein bestätigter installierter Build und kein iPad-Test.
- Main Branch API: `protected:false`. Rulesets API: 403 mit Tarifhinweis für privates Repo; Protection-Details API zusätzlich `Resource not accessible by integration`. Nicht als eingerichteten Merge-Schutz berichten.

## Reproduzierte Lücken und V2

1. Artefaktnamen statt Receipt-Inhalt: jetzt kleines JSON-ZIP lesen, Digest, Dateiformat, Workflow/Repo/Event/Branch, Staging-Projekt, Scope und Verifikation prüfen.
2. Historischer Snapshot als aktuelles Hosting: Snapshot separat; kein State-Fallback für aktuelle grüne Deploys.
3. Neuerer fehlgeschlagener Deploy durch älteren Erfolg verdeckt: nur neuester vertrauenswürdiger Versuch zählt, fehlende/unlesbare Receipts bleiben unbekannt.
4. `passed` ohne vollständigen getesteten SHA und unbekannte Statuswerte: ungültig statt grün. Unbekannter/anderer Zielstand verlangt Retest. Das gilt auch für `skipped`.
5. Fehlende Feature-Abhängigkeiten wurden ignoriert: unbekannte Quelle blockiert die vollständige Entwicklungsstufe.
6. Neuer Kandidat wurde testbar, obwohl sein Hosting/Backend nicht synchron war: kein bestätigter `targetSha` ohne Komponentenabgleich.
7. Games/iOS-Branchspitzen wurden als Testziel verwendet: entfernt. Verifizierte zusammengesetzte Nachweise fehlen noch ausdrücklich.
8. V2 hält `stagingComplete:false`, solange Rules-/Security-Gates und fachliche Abnahme nicht angebunden sind. Keine Production-Freigabe aus State ableiten.

## Prüfung und Zwischenstand

14 lokale Python-Verhaltenstests erfolgreich, inklusive Offline-Board-Ende-zu-Ende, älterem Erfolg nach fehlgeschlagenem Deploy, bösartigem ZIP-Pfad, falschem Projekt/Scope/Workflow und ungültiger Abnahme.
Workflow führt diese Tests vor dem Bericht aus. Neue PR-Trigger für Control-Plane-Änderungen; zusätzliche Aktualisierung nach Web-CI, Escape-Preview und TestFlight.
CI und echte Receipt-Downloads auf GitHub sind nach Push separat zu prüfen.

## Abgleich mit der gewünschten Reihenfolge

1. Pre-Merge Combined CI: fehlt auf Web-Branch (Push/Dispatch allein). Separat ergänzen.
2. Controller: Inventar + Actions-Abnahmebericht vorhanden; V2 korrigiert Nachweisgrenzen. Interaktive Eingabe, persistente Fehlerhistorie, Fix/Retest-Verknüpfung noch offen.
3. Rules-Deploy: fehlt, erst nach Security-Cutover-Gates. Nicht blind automatisieren.
4. Games-Lab: automatische Escape-Pipeline existiert, aktueller Deploy blockiert; Receipts, WIF statt langlebigem Key und Stale-Source-Schutz fehlen.
5. Branchschutz: Tarif-/Zugriffsgrenze, nicht eingerichtet.
6. Production-Promotion: bewusst offen und gesperrt.

Weitere Produktbaustellen: Secure-Exam-Ende-zu-Ende/30er-Test belastbar abschließen; Tutor-Didaktik und Haupt-App-Anbindung; manuelle Tutorial-Abgabe am iPad; Crew-Randartefakte visuell prüfen; Telemetrie-Pilot und begrenzte Admin-Abfragen; KI-Evaluation/Kosten-Admin; Internationalisierung; echte App-Geräteabnahme. Nicht pauschal als erledigt markieren.

## Nächster ausführbarer Schritt

V2 pushen, PR erstellen, Workflow-Verhalten einschließlich realer Receipt-Lektüre prüfen. Danach Web-PR-Merge-Result-CI ergänzen. `development-status.yml` bleibt wegen parallelem PR #48 unverändert. Vor Integration main und PRs erneut lesen.
