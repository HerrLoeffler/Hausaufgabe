# GC-AUTOMATION-14: Qualifizierte Übergabe der Guardian-CI an Staging

- Branch: `fix/guardian-deploy-handoff-20261004`, Ziel `main`, Basis `23c5013705e5d96946c3c9389fe9a2fac2eefb3f`.
- Auftrag: die bereits autorisierte begrenzte Guardian-Kette bis zu echten Staging-Nachweisen fortsetzen; Quellenreparatur GC-AUTOMATION-13 bereits integriert.
- Web: `2436a432d9a4dc2840d4ba2c22a7b9c000cc2b47`. Versuch `run-37218071006-1`, vollständiger Run 37218095594 grün; integrierte Gesamt-CI 37218270539 grün. Alle drei unabhängigen Reviews erfolgreich, direkte Integration auf geprüftem Baum. Historie und Reservierungen unverändert (2/3, 1,70/2,55 USD).

## Beobachtung und begrenzter Fix

Die tatsächliche GitHub-API liefert für CI 37218270539 name und display_title `Guardian integrated run-37218071006-1`. Die bisherigen Listener erwarteten ausschließlich `Guardian integrated checks`; auch die Nachweisprüfung lehnte den echten dynamischen Namen ab. Kein Hosting-/Functions-Lauf wurde gestartet. Die Testfixture spiegelte nur den statischen Namen und verdeckte den Fehler.

Listener behalten statische Namen und ergänzen die passenden dynamischen Muster. Die Python-Prüfung erlaubt ausschließlich statischen Namen oder den exakten Namen der durch das Ledger gebundenen Request-ID; Workflow-Pfad, Event, Repository, main-Control-SHA, erster Run, Status und Artifact-Vertrag bleiben unverändert streng. GitHub dokumentiert workflow_run-Globfilter unter https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_runworkflows.

Das bereits verpasste Completion-Event wird über einen konkreten main-Auftrag unter automation/deployment-requests aufgenommen. Er bindet Request-ID, originalen integrierten CI-Run und Commit. Beide vorhandenen Staging-Workflows lesen diesen Auftrag nur auf einem main-Push und prüfen denselben vorhandenen digestgesicherten CI-Nachweis plus aktuelle Aufgabenfreigabe und aktuellen Web-Head vor Cloud-Login. Alle späteren Rechecks und Functions-Receipts verwenden die validierte CI-Run-Ausgabe. Es entsteht keine neue bezahlte Bau-/Reviewrunde und keine neue Aufgaben-/Budgetreservierung.

Staging-Projekt, Hosting-Channel, Functions-Codebase, WIF-Serviceaccounts, Cloud-Scope und Receipt-Verifikation bleiben bestehen. Ledger-/Release-Control-Leser berücksichtigen auch solche main-Push-Deploys, mit unveränderten Scope-/Hash-/Receipt-Gates. Ein neuerer fehlgeschlagener Lauf bleibt Blocker; kein Rückgriff auf ältere Erfolge.

Der Code-Review fand eine mögliche Änderung des main-Auftrags zwischen Build und Cloud-Login. Die spätere Prüfung bindet deshalb zusätzlich die ursprüngliche validierte CI-ID und den ursprünglichen Build-SHA; ein inzwischen anderer Auftrag stoppt, statt auf dessen neue Quelle umzuschalten. Regression zuerst rot beobachtet und anschließend grün.

## Tests und Stand

- Rot beobachtet: realer dynamischer CI-Name abgelehnt; expliziter Request fehlte; Release Board erkannte dynamische CI und main-Push-Receipts nicht.
- Lokal grün: 100 Automation-Verhaltenstests und 20 Release-Control-Tests; vollständige Push-Request-Verarbeitung mit vorhandener exakter CI, unverändertem Ledger/Budget und sicheren Ausgaben ausgeführt. Falscher Commit/Request/Run/Pfad/Control-SHA, Rerun, unbekannte Felder, falscher Branch und mehrere Requests blockieren.
- Code lokal; Review/Remote-CI/Integration und echter Staging-Deploy noch offen.
- Production und Geräteabnahme bleiben offen.

## Nächster Schritt / Wiederaufnahme

Review und exakte Remote-CI prüfen; frischen main/Web/Ledger-Stand abgleichen. Fix samt konkretem Request integrieren, Hosting-/Functions-Läufe anhand Jobs und verifizierter Receipts beobachten. Kein neuer bezahlter Versuch und keine blinde Dispatch-/Provider-Wiederholung.
