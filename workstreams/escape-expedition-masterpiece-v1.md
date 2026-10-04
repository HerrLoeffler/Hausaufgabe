# GC-GAMES-ESCAPE-MASTERPIECE-01 — Masterpiece Ausbau

Stand: 04.10.2026

## Branch / Basis

- Branch: `prototype/escape-expedition-masterpiece-v1`
- Basis: `prototype/escape-expedition-jungle-v1@17698e8927a4f020a2acd61b566e22894508474d`
- Draft-PR: #60
- Production: unverändert
- bisheriger Jungle-Preview bleibt separat erhalten

## Verbindlicher Plan

- Roadmap: `docs/games/ESCAPE_MASTERPIECE_ROADMAP.md`
- Audit: `docs/games/ESCAPE_MASTERPIECE_AUDIT.md`
- Zielmix: 30–35 % Lernen, 45–55 % Spielen/Erkunden, 15–20 % Rätsel/Story.
- Arbeitsweise: ein Mikro-Schritt nach dem anderen; Problem → kleinste Änderung → Test → Build → Preview → echter Spieltest → Handoff.

## M1.1 — HUD aus dem Animationsloop

Status: **erledigt und automatisiert geprüft**

Produktcommit:
`f320ee53ae235e30e1463b473290817ce15c9522`

Änderungen:
- vollständiges `updateHud()` aus `update(now, dt)` entfernt;
- Timer-DOM wird nur noch beim Wechsel der angezeigten Sekunde aktualisiert;
- Hotspot-/Missions-HUD aktualisiert nur bei semantischen Zustandsänderungen;
- Jeep-Checklist aktualisiert beim Überschreiten des 80-m-Meilensteins;
- River-Checklist aktualisiert am 50-m-Meilenstein und bei Felskontakt;
- Funk-HUD aktualisiert nur bei tatsächlicher Kanaländerung;
- eigener Regressionstest verhindert, dass `updateHud()` wieder in den Frame-Updatepfad rutscht;
- Masterpiece bekommt eigenen Workflow und eigenen Firebase-Preview-Channel, damit der vorige Jungle-Prototyp nicht überschrieben wird.

## Verifikation M1.1

GitHub Actions:
- Workflow: `Escape Expedition Masterpiece Preview`
- Run: `37194352469`
- Produktcommit: `f320ee53ae235e30e1463b473290817ce15c9522`
- JavaScript-Syntax: grün
- Expedition-Verträge: **9/9 grün**
- isolierter Build: grün
- Firebase Staging Preview: grün

Preview:
`https://hausaufgabe-staging--gradecrew-escape-masterpiece-pmxjup1g.web.app`

Prüfgrenze:
- automatisierte Tests/Build/Deploy sind grün;
- echter manueller Spieltest dieser M1.1-Version auf Desktop/iPad/iPhone ist noch offen;
- M1.1 behebt gezielt unnötige HUD-DOM-Arbeit, nicht alle im Audit gefundenen Hänger.

## Status getrennt

- lokal geändert: n/a, GitHub-direkter Arbeitslauf
- auf GitHub gesichert: ja
- automatisiert getestet: ja, 9/9 + Syntax
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Test M1.1: offen
- echter iPad-Test M1.1: offen
- echter iPhone-Test M1.1: offen
- Production: unverändert

## Nächster Mikro-Schritt

**M1.2 — zentraler Spielmodus / Transition-Lock.**

Ziel:
- Szenenwechsel nur einmal auslösen;
- Eingaben während Übergängen sperren;
- alte verzögerte Callbacks dürfen keinen späteren Zustand überschreiben;
- danach wieder eigener Regressionstest, Build, Preview und Handoff.
