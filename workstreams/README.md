# GradeCrew Workstreams

Mehrere GradeCrew-Aufgaben dürfen parallel laufen. Dieses Verzeichnis enthält die **fachlichen Übergaben** je Baustelle; aktuelle Branch-/PR-Daten werden nicht mehr als große manuelle Tabelle in dieser Datei dupliziert.

## Drei getrennte Wahrheiten

1. **`GRADECREW_STATE.json`** — Release-/Deploy-Wahrheit: Branch → CI → integriert → Staging → Nutzertest → Production.
2. **`workstreams/registry.json`** — kleine menschliche Zuordnung: Welche Baustelle hat welchen Primary Branch, welches Integrationsziel und welchen Lifecycle-Zustand?
3. **`tools/development_status.py` / GitHub Action `GradeCrew Development Status`** — Live-Wahrheit für Branches und Zusammenarbeit: tatsächliche SHAs, ahead/behind, offene PRs, Dateidiffs, Überschneidungen und unregistrierte Branches.

Damit müssen laufende SHAs, PR-Nummern und Branchabstände nicht mehr von Hand in diesem README nachgetragen werden.

## Vor Arbeitsbeginn

```bash
git fetch --all --prune
python tools/development_status.py
```

Alternativ den jüngsten Actions-Lauf **GradeCrew Development Status** öffnen. Das Audit ist read-only und darf keine Branches, PRs oder Dateien verändern.

Vor neuer Implementierung insbesondere prüfen:
- Gibt es bereits einen Primary-/Related-Branch oder offenen PR für dieselbe Funktion?
- Ist mein Branch hinter dem Integrationsziel?
- Bearbeiten zwei aktive Workstreams dieselben Dateien?
- Zeigt ein offener PR auf einen anderen Zielbranch als die Registry?
- Gibt es einen unregistrierten Branch, der erst fachlich zugeordnet werden muss?

## Neue Aufgabe

1. Eindeutige Task-ID in `TODO.md` verwenden oder ergänzen.
2. Übergabe nach `workstreams/TEMPLATE.md` anlegen.
3. Eigenen Aufgabenbranch vom **aktuell geprüften Zielstand** erstellen.
4. In `workstreams/registry.json` nur die Zuordnung ergänzen: ID, Titel, Primary Branch, Integrationsziel, Lifecycle-Zustand und optional Related Branches/Handoff.
5. Nicht zusätzlich aktuelle SHA-/CI-/Deploy-Daten in die Registry schreiben; diese kommen aus Git bzw. `GRADECREW_STATE.json`.

## Lifecycle der Arbeitsbranch-Zuordnung

- `active` — wird aktuell weiterentwickelt.
- `integration_ready` — menschlich zur Integration vorbereitet; CI/Mergeability trotzdem frisch prüfen.
- `blocked` — aktive Baustelle mit bekanntem Blocker.
- `integrated` — Arbeit wurde bereits in ihr Ziel übernommen; Branch kann noch als Nachweis existieren.
- `archive_candidate` — nicht weiterentwickeln, erst prüfen/zuordnen und später bewusst archivieren.

Kein Zustand erlaubt automatisches Löschen oder Mergen.

## Übergabe pro Workstream

Eine Übergabe beantwortet kompakt:
- Ziel / Scope,
- was erledigt wurde,
- Branch und relevante Commits,
- tatsächlich ausgeführte Tests,
- Release-/Deploy-Stufe,
- offene Risiken/Blocker,
- nächster ausführbarer Schritt,
- Dinge, die nicht verändert werden dürfen.

## Integration

Ein Integrationsauftrag nennt Quellbranch und Zielbranch ausdrücklich. Direkt vor dem Merge erneut den Live Development Status und den Zielbranch prüfen. Überschneidungen sind Warnsignale, keine automatische Sperre; gemeinsame Dateien werden bewusst zusammengeführt.

Production bleibt von dieser Koordinationsschicht vollständig getrennt und benötigt weiterhin ausdrückliche Freigabe.
