# Legacy-Branch-Triage

Stand: 01.10.2026. Diese Baustelle verhindert, dass alte Branches versehentlich als aktuelle Basis genutzt oder vorschnell gelöscht werden.

- Registry-ID: `legacy-branch-triage`
- Primär zu prüfen: `dev`
- Related: `chore/shared-todo-and-games-scope`
- Zustand: `blocked` – keine Weiterentwicklung auf diesen Branches, bis ihre einzigartige Arbeit eingeordnet ist.

## Verifizierter Stand

- `chore/shared-todo-and-games-scope` liegt vollständig hinter `main` und besitzt gegenüber dem geprüften main keine einzigartigen Commits. Trotzdem keine automatische Löschung.
- `dev` ist mit main divergiert und besitzt noch einzigartige alte Commits. Er ist daher **kein** sicherer Löschkandidat und zugleich **keine** aktuelle Entwicklungsbasis.

## Vorgehen

1. einzigartige `dev`-Commits gegen aktuelle Fach-Workstreams vergleichen;
2. noch relevante Teile gezielt einem bestehenden Workstream zuordnen;
3. nur vollständig überholte/eingegliederte Branches auf `archive_candidate` setzen;
4. Löschen bleibt eine bewusste spätere Repository-Pflege, niemals automatischer Chatstart-Schritt.

## Nicht tun

- keinen neuen Feature-Code auf `dev` bauen;
- keine Force-Pushes oder Resets;
- keine Branches allein aufgrund von Alter oder Namen löschen.
