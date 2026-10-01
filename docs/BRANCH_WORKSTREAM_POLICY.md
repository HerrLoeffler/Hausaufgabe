# GradeCrew Branch- und Workstream-Standard

Ziel: Viele parallele Chats und Branches dürfen existieren, ohne dass Arbeit doppelt gebaut, überschrieben oder vorschnell als integriert bezeichnet wird.

## 1. Eine Aufgabe hat genau einen primären Workstream

`workstreams/registry.json` ist das maschinenlesbare Register. Jeder aktive Entwicklungsbereich hat:

- eindeutige `id`
- `primaryBranch`
- `integrationTarget`
- `state`
- Übergabe/Handoff
- zugehörige Task-IDs
- bekannte verwandte Branches

Verwandte Branches sind **kein** Freibrief zum Mergen. Sie werden nur sichtbar gemacht, damit ein neuer Chat sie vor neuer Arbeit prüft.

## 2. Zulässige Zustände

- `active`: wird aktuell weiterentwickelt.
- `integration_ready`: Umsetzung ist fertig genug für gezielte Integrationsprüfung; noch nicht automatisch integriert/deployed.
- `blocked`: bewusst gestoppt, mit dokumentiertem Blocker.
- `integrated`: relevante Arbeit wurde in das dokumentierte Ziel übernommen; der alte Branch ist keine neue Arbeitsbasis.
- `archive_candidate`: wahrscheinlich überholt oder vollständig übernommen; erst nach manueller Prüfung löschen.

Ein Branch wird nie allein wegen seines Alters automatisch gelöscht.

## 3. Pflichtprüfung vor neuer Entwicklungsarbeit

Vor Codeänderungen:

1. aktuellen `main` lesen: `START_HERE.md`, `AGENTS.md`, `TODO.md`, `workstreams/registry.json`;
2. Remote-Branches und offene PRs frisch prüfen;
3. `python tools/branch_audit.py` ausführen, wenn ein Checkout verfügbar ist;
4. primären Workstream und Handoff lesen;
5. `relatedBranches` und offene PRs auf gleiche Funktion/Dateien prüfen;
6. nur dann neuen Branch anlegen, wenn kein vorhandener Branch/PR den Auftrag bereits abdeckt.

Wenn Überschneidungen bestehen, zuerst vorhandene Arbeit fortführen oder einen ausdrücklich benannten Integrationsauftrag anlegen.

## 4. Branch-Namen

- Produktfeature: `feature/<kurzname>`
- Fehlerbehebung: `fix/<kurzname>`
- technische Härtung: `hardening/<kurzname>`
- Integration: `integration/<quellen>-<ziel>`
- experimenteller Spiel-/UI-Versuch: `lab/<kurzname>`
- reine Projektpflege: `chore/<kurzname>`

Keine neuen `v2.x`-Arbeitsbranches für normale Entwicklung; diese bleiben historische/releasebezogene Referenzen.

## 5. Statussprache

Immer getrennt dokumentieren:

`lokal geändert` → `Commit auf GitHub` → `Unit-/Verhaltenstests` → `Emulator-Test` → `CI` → `Preview/Staging deployed` → `Browser geprüft` → `echtes Gerät bestätigt` → `Production`.

Keine Stufe erbt automatisch den Nachweis der vorherigen oder eines älteren Commits.

## 6. Integration

Vor Integration:

- Zielbranch frisch lesen;
- Branch-Audit erneut ausführen;
- Dateikonflikte bewusst prüfen;
- Pflicht-Gates der betroffenen Domäne ausführen;
- Handoff aktualisieren;
- exakten Quell- und Zielcommit dokumentieren.

Nach erfolgreicher Integration wird der Quellbranch im Registry-Zustand `integrated` oder `archive_candidate` markiert. Er wird nicht still weiterverwendet.

## 7. Unklassifizierte Altbranches

`tools/branch_audit.py` listet Remote-Branches, die weder primärer noch verwandter Branch eines registrierten Workstreams sind. Diese Liste ist eine **Triage-Liste**, keine Löschliste.

Für jeden Altbranch wird später entschieden:

- enthält einzigartige Arbeit → Workstream zuordnen;
- vollständig integriert → `archive_candidate`;
- historische Release-/Backup-Referenz → ausdrücklich als solche dokumentieren;
- unklar → nicht anfassen.

## 8. Pull Requests

Offene PRs sind Teil der Startprüfung. Ein neuer Chat prüft mindestens Head-Branch, Base-Branch, Titel, Draft-Status und betroffene Dateien. Ein PR ersetzt keinen Handoff, ist aber ein starkes Signal gegen parallelen Doppelbau.

## 9. Gemeinsame Dateien

Änderungen an `START_HERE.md`, `AGENTS.md`, `TODO.md`, `workstreams/README.md`, `workstreams/registry.json`, CI-Workflows und Shared Design/Contracts sind besonders konfliktträchtig. Vor jedem Schreibvorgang Remote-Stand neu lesen und fremde Ergänzungen erhalten.
