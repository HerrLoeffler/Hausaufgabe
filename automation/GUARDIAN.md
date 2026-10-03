# Automatische Entwicklung bis zum technischen Staging-Kandidaten

**Aktueller Vertrag: [Execution V2](EXECUTION.md).** V2 ergänzt den ursprünglichen Start-Controller um PR-Publikation, unabhängige Reviews, feste CI, kontrollierte Integration, Feedback und verifizierte Staging-Receipts. Die V1-Beschreibung unten ist historisch und betrifft den alten isolierten Codex-Patchpfad. Aktivierung und echter Pilot bleiben separat nachzuweisen; siehe `workstreams/guardian-execution-v2.md`.

Ziel: Entwickeln → technische Tests → unabhängige KI-Reviews → Combined CI des Merge-Ergebnisses → freigegebene Integration → Komponenten-Deploys → verifizierte Receipts → Martin-Abnahme → ausdrückliche Livefreigabe.

`Stage Guardian` ist der ausführende Controller; Development Status und Release Control bleiben Beobachter. Jede Phase braucht eigene Belege. Ein grüner Controller-Lauf bedeutet nur, dass der Controller funktioniert hat.

## V1-Ausgangspunkt
Der Guardian plant den nächsten Schritt, zeigt nicht konfigurierte Baustellen, begrenzt Versuche dauerhaft und kann bereits den isolierten Coding-Worker dispatchen. Policy `automation/guardian-policy.json` plus Variablen `GRADECREW_GUARDIAN_ENABLED` und `CODEX_WORKER_ENABLED` sowie Worker-Key müssen eingerichtet sein. Momentan bleibt die Policy deaktiviert; es gibt keinen aktiven Pilotauftrag.

Ein konfigurierter Eintrag braucht Workstream-ID, Queue-Task-ID, erlaubten Source-Branch, exakten genehmigten Commit und `maxAutomaticStage: staging_deployed`. Für jede Aufgabe muss die neue JSON-Datei unter `agent-queue/` dieselbe Quelle und klare Erfolgskriterien haben. Aktuelle Branchspitzen werden nicht still übernommen.

## Begrenzung und Wiederaufnahme
Das Laufprotokoll liegt auf `automation/guardian-state`, Datei `automation/guardian-ledger.json`. Es wird vor dem KI-Start geschrieben. Doppelereignisse starten keine zweite Aufgabe. Ein unklarer Dispatch bleibt gesperrt, bis sein tatsächlicher Run gefunden wurde. Änderungen am Source-SHA setzen die höchstens drei Versuche nicht zurück. Noch keine automatische Erfolgs-/Fehler-Reconciliation implementiert: gestartete Versuche bleiben bis zur Prüfung gesperrt.

## Historische V1-Lücken
Automatisches sicheres Publizieren der Patches als PR, unabhängige Multi-Provider-Reviews, automatische kontrollierte Integration und Rückführung des Worker-Feedbacks fehlen noch. Diese Grenzen stehen auch im JSON-/Actions-Bericht. Ein aktivierter Worker allein erfüllt das Ziel deshalb noch nicht.

Die heutige Phase `ci_green` stoppt vor ungeprüfter Integration; `integrated` wartet auf Deploy-Receipts. Danach werden echte Nutzerabnahme und Production-Freigabe erwartet. Keine selbst erzeugten Abnahme-Häkchen, keine pauschalen IAM-Änderungen und kein automatischer Live-Deploy.

## Prüfung
`python3 -m unittest tools.automation.test_guardian -v`

Der `check`-Job hat lesende Rechte und zeigt Einrichtung/Blocker. Nur der gesonderte `continue`-Job auf main erhält Actions-Write zum Dispatch und Contents-Write für das Ledger; er läuft erst nach Aktivierung. Keine Cloud-Zugangsdaten im Controller.
