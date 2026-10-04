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

## M1.2 — zentraler Spielmodus / Transition-Lock

Status: **erledigt und automatisiert geprüft**

Produktcommit:
`5c65038b2bdcdfef004ab8de2c686973f03cd282`

Änderungen:
- zentraler `gameMode` als gemeinsame Eingabe-Autorität eingeführt: `world / vehicle / camera / modal / radio / transition / won`;
- zentraler `transitioning`-Lock verhindert parallele/doppelte Szenenwechsel;
- `sceneEpoch` und `actionEpoch` machen verzögerte Aktionen ungültig, sobald Szene oder Interaktionsfluss gewechselt haben;
- neue `scheduleGuarded()`-Hülle ersetzt zustandsverändernde ungeschützte Timeouts bei Lerntransfer, Lernbelohnung, Seilwinde, Generator und Victory;
- `setScene()` sperrt Eingaben während des Übergangs und gibt den passenden Szenenmodus erst danach wieder frei;
- Welt-/Touch-/Keyboard-Eingaben werden zentral nach Spielmodus gefiltert;
- Kamera und Funk besitzen nun explizite Modi statt nur lose Flags;
- Dialog-Schließen stellt den passenden Szenenmodus wieder her und invalidiert alte verzögerte Aktionen;
- Updates werden während eines aktiven Szenenübergangs nicht weitergeführt;
- zwei neue Regressionstests sichern Transition-Lock und guarded callbacks.

## Verifikation M1.2

GitHub Actions:
- Masterpiece Preview Run: `37195010845`
- Produktcommit: `5c65038b2bdcdfef004ab8de2c686973f03cd282`
- JavaScript-Syntax: grün
- Expedition-Verträge: **11/11 grün**
- isolierter Build: grün
- Firebase Staging Preview: grün
- zusätzlicher Workflow `Games Lab Checks`: grün
- zusätzlicher Workflow `Escape review gates`: grün

Preview:
`https://hausaufgabe-staging--gradecrew-escape-masterpiece-pmxjup1g.web.app`

Prüfgrenze:
- automatisierte Tests/Build/Deploy sind grün;
- echter manueller M1.2-Durchspieltest auf Desktop/iPad/iPhone ist noch offen;
- M1.2 verhindert Transition-/Callback-Rennen, trennt aber das Seilwinden-Modal noch nicht vollständig vom normalen World-Updatepfad; das bleibt bewusst M1.3.

## Status getrennt

- auf GitHub gesichert: ja
- automatisiert getestet: ja, 11/11 + Syntax + Games Lab Checks + Escape review gates
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Test M1.2: offen
- echter iPad-Test M1.2: offen
- echter iPhone-Test M1.2: offen
- Production: unverändert

## M1.3 — Seilwinden-Minispiel vom normalen World-Update getrennt

Status: **erledigt und automatisiert geprüft**

Produktcommit:
`5c079cc83293a49a14f1379e3ffd60c0a956d6b1`

Änderungen:
- eigene `updateWinch(dt)`-Funktion eingeführt;
- bei geöffnetem Winch-Dialog ruft der Mainloop ausschließlich `updateWinch(dt)` statt `update(now, dt)` auf;
- dadurch laufen während der Seilwinde keine Spielerbewegung, Hotspot-Suche, Tierbewegung, Fahrzeuglogik oder sonstige World-State-Updates im Hintergrund;
- normale `update(now, dt)` enthält keine Winch-Logik mehr;
- `pullWinch()` reagiert nur noch bei offenem Winch-Dialog, aktivem `modal`-Modus und ohne laufenden Szenenübergang;
- zwei neue Regressionstests sichern die vollständige Trennung von World- und Winch-Update.

## Verifikation M1.3

GitHub Actions:
- Masterpiece Preview Run: `37195599753`
- Produktcommit: `5c079cc83293a49a14f1379e3ffd60c0a956d6b1`
- JavaScript-Syntax: grün
- Expedition-Verträge: **13/13 grün**
- isolierter Build: grün
- Firebase Staging Preview: grün
- `Escape review gates` Run `37195602946`: grün
- `Games Lab Checks` Run `37195602947`: grün

Preview:
`https://hausaufgabe-staging--gradecrew-escape-masterpiece-pmxjup1g.web.app`

Prüfgrenze:
- automatisierte Tests/Build/Deploy sind grün;
- echter manueller M1.3-Durchspieltest auf Desktop/iPad/iPhone ist noch offen;
- M1.3 behebt gezielt die Hintergrund-World-Updates während der Seilwinde; Mehrfachaktionen/Erfolgszustände werden als eigener nächster Mikro-Schritt weiter gehärtet.

## Status getrennt

- auf GitHub gesichert: ja
- automatisiert getestet: ja, 13/13 + Syntax + Games Lab Checks + Escape review gates
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Test M1.3: offen
- echter iPad-Test M1.3: offen
- echter iPhone-Test M1.3: offen
- Production: unverändert

## M1.4 — Mehrfachklicks und mehrfache Erfolgs-Timeouts verhindert

Status: **erledigt und automatisiert geprüft**

Produktcommit:
`e4196699019022425152384b56319e2cf67ebf7a`

Änderungen:
- zentraler `resolvingAction`-Lock eingeführt;
- `beginResolvingAction()` lässt pro Erfolgs-/Übergangsphase nur genau einen ausstehenden Ablauf zu;
- `endResolvingAction()` gibt die Mechanik erst nach Abschluss oder Dialogabbruch wieder frei;
- Lern-Gate sperrt während Transfer-/Erfolgs-Timeouts Antwortbutton, Coco-Hinweis und Antwortoptionen;
- mehrfaches Submitten kann keine parallelen Transfer- oder Reward-Timeouts mehr erzeugen;
- `rewardQuestion()` ist zusätzlich idempotent und belohnt eine bereits gelöste Aufgabe kein zweites Mal;
- Seilwinden-Ziehen wird beim dritten sicheren Zug sofort gesperrt;
- Generatorbuttons werden beim erfolgreichen dritten Stromkreis sofort gesperrt;
- Funkfinale besitzt ebenfalls einen Erfolgs-Lock zusätzlich zum bereits vorhandenen `won`-Zustand;
- Dialog-Close räumt zugehörige Resolving-Locks zuverlässig auf;
- vier neue Regressionstests sichern Lock, Lernpfade, Mechanik-Erfolg und idempotente Rewards.

## Verifikation M1.4

GitHub Actions:
- Masterpiece Preview Run: `37196600456`
- Produktcommit: `e4196699019022425152384b56319e2cf67ebf7a`
- JavaScript-Syntax: grün
- Expedition-Verträge: **17/17 grün**
- isolierter Build: grün
- Firebase Staging Preview: grün
- `Escape review gates` Run `37196602967`: grün
- `Games Lab Checks` Run `37196602944`: grün, inklusive Browser-User-Flows

Preview:
`https://hausaufgabe-staging--gradecrew-escape-masterpiece-pmxjup1g.web.app`

Prüfgrenze:
- automatisierte Tests/Build/Deploy sind grün;
- echter manueller M1.4-Durchspieltest auf Desktop/iPad/iPhone ist noch offen;
- M1.4 verhindert Doppelaktionen/Mehrfach-Timeouts, ersetzt aber noch nicht die geplanten expliziten Recovery-/Reset-Pfade jeder Mechanik.

## Status getrennt

- auf GitHub gesichert: ja
- automatisiert getestet: ja, 17/17 + Syntax + Games Lab Browser-Flows + Escape review gates
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Test M1.4: offen
- echter iPad-Test M1.4: offen
- echter iPhone-Test M1.4: offen
- Production: unverändert

## M1.5 — sichere Recovery-/Reset-Pfade pro Mechanik

Status: **erledigt und automatisiert geprüft**

Produktcommits:
- `11b3e06e85bbc893594afb8f951a93c09f47dea1` — zentrale Recovery-Pfade und UI
- `5e21c80b2eb4c6ef62813cf015e59d66595f9c04` — Recovery-Buttons während erfolgreicher Auflösung zusätzlich gehärtet

Änderungen:
- zentrale `recoveryKind()`-/`recoverMechanic()`-Schicht für alle sechs angeforderten Mechaniken;
- gemeinsamer sichtbarer Recovery-Button im Hauptspiel, kontextabhängig beschriftet;
- Tastatur: `R` setzt die aktuelle Mechanik sicher zurück; `Esc` verlässt Kamera/Funk;
- Jeep speichert sichere Strecken-Checkpoints und setzt Fahrzeugposition + Strecke auf den letzten sicheren Punkt zurück;
- Boot speichert sichere Fluss-Checkpoints und setzt Boot + Fortschritt auf den letzten sicheren Punkt zurück;
- Kamera-Recovery verlässt den Kameramodus sauber, ohne bereits gespeicherte Fotos zu löschen;
- Seilwinde besitzt im Dialog `Neu starten` und `Zurück`; Neustart setzt nur die Windenmechanik zurück;
- Generator besitzt im Dialog `Neu starten` und `Zurück`; Neustart leert nur die laufende Schaltfolge;
- Funk-Recovery setzt den Kanal auf 35 zurück und verlässt die Konsole sauber;
- Recovery invalidiert ausstehende verzögerte Aktionen und räumt einen hängen gebliebenen Resolving-Lock auf;
- fachlicher Fortschritt bleibt erhalten: gelöste Lernaufgaben, Items und Tierfotos werden nicht zurückgesetzt;
- während eines bereits korrekt aufgelösten Winden-/Generator-Erfolgs sind Reset/Zurück kurz gesperrt, damit der Erfolg nicht versehentlich abgebrochen wird;
- sechs neue M1.5-Regressionstests sichern UI, Routing, Checkpoints, Fortschrittserhalt, Modal-Recovery und Erfolgsphase.

## Verifikation M1.5

GitHub Actions:
- finaler Masterpiece Preview Run: `37197348800`
- finaler Produktcommit: `5e21c80b2eb4c6ef62813cf015e59d66595f9c04`
- JavaScript-Syntax: grün
- Expedition-Verträge: **23/23 grün**
- isolierter Build: grün
- Firebase Staging Preview: grün
- `Escape review gates` Run `37197351752`: grün
- `Games Lab Checks` Run `37197351754`: grün, inklusive Browser-User-Flows

Preview:
`https://hausaufgabe-staging--gradecrew-escape-masterpiece-pmxjup1g.web.app`

Prüfgrenze:
- automatisierte Tests/Build/Browser-Flows/Deploy sind grün;
- echter manueller M1.5-Durchspieltest auf Desktop/iPad/iPhone ist noch offen;
- Phase-1-Gate mit 10 kompletten manuellen Desktop-Durchläufen ist noch nicht erfüllt.

## Status getrennt

- auf GitHub gesichert: ja
- automatisiert getestet: ja, 23/23 + Syntax + Games Lab Browser-Flows + Escape review gates
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Test M1.5: offen
- echter iPad-Test M1.5: offen
- echter iPhone-Test M1.5: offen
- Production: unverändert

## Nächster Mikro-Schritt

**M1.6 — Bewegungs-/Kollisionslogik und Tap-to-Move härten.**

Ziel:
- keine unerreichbaren Interaktionspunkte;
- Tap-to-Move darf nicht dauerhaft gegen Grenzen/Props laufen;
- Fahrzeugpositionen bleiben immer in sicheren Bereichen;
- bei blockierter Bewegung automatisch zum letzten sicheren Punkt zurück;
- danach wieder Regressionstest, Build, Preview und Handoff.
