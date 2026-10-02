# GradeCrew Games – gemeinsamer Einstieg

Der Hub ordnet die vorhandenen Spiele. Aufgaben, Lernlogik, Wertung und Backends bleiben eigene Module. Die gemeinsame Games-Design-System-Schicht vereinheitlicht UX und Komponenten, ohne die kanonischen Einzelspiel-Builds zu duplizieren.

## Aufbau

| Ort | Aufgabe |
| --- | --- |
| `docs/games/GAMES_DESIGN_SYSTEM.md` | verbindliche Games-UX-/Komponentenregeln |
| `lab/shared/games-design-system.css` | gemeinsame opt-in Games-Komponenten (`gcg-*`) |
| `lab/shared/games-design-system.js` | kleine gemeinsame UI-Helfer, Versionierung, lokale Präferenzen |
| `lab/games-system/` | Living Preview des Games Design Systems |
| `lab/shared/games-catalog.js` | einmalige Definition der Spiele, Modi, Einstiegsschalter und Buildskripte |
| `lab/shared/game-shell.js / .css` | Navigation und Einstieg in den gewünschten Modus; nutzt Games-/GradeCrew-Tokens |
| `lab/games-hub/` | Spielauswahl, Suche, Fachfilter, Favoriten, Code-Einstieg |
| `lab/fast-quiz/` | Mathematik und Rundungsaufgaben |
| `lab/fehlerjagd-deutsch/` | Deutsch-Engine, Aufgabenintegrität, Erklärungen, Kompetenzprofil |
| `lab/vocab-rush/` | Englisch, Vokabelsets, Import und Lernmodus |
| `tools/build-lab-*.mjs` | kanonische Einzel-Builds der Spiele |
| `tools/build-lab-games-hub.mjs` | Einzel-Builds zusammensetzen; gemeinsame Navigation + Design-Schicht einbauen |
| `tools/games/` | Struktur-, Design-System- und Browserprüfungen |
| `GAMES_STATUS.md` | Stand, Abnahmegrenzen und nächste Aufgaben |

## Design-System-Hierarchie

Das Games Design System ersetzt nicht das produktweite GradeCrew Shared Design System.

1. produktweite GradeCrew-Tokens/Assets = Marke und visuelle Grundwerte
2. Games Design System = Spielkomponenten, Setup-Hierarchie, Gameplay-/Live-Zustände
3. Einzelspiel = Fachlogik und echte Sonderfälle

Solange die produktweiten generierten Tokens auf dem Games-Lab-Branch noch nicht integriert sind, verwendet `games-design-system.css` kompatible CSS-Fallbacks. Neue dauerhafte Markenfarben oder Spacing-Skalen gehören nicht in ein Einzelspiel.

## Nutzerwege

- **Üben:** Modus auswählen -> Spiel wählen -> wenige Primärentscheidungen -> starten; seltene Regeln unter `Weitere Einstellungen`.
- **Highscore:** nur sinnvoll vergleichbare Aufgaben/Regeln; Board-Trennung nach fachlichem Profil, wenn erforderlich.
- **Live mit Lehrkraft:** Lehrkraft wählt Inhalt/Preset -> Code/QR -> Klasse tritt nur mit Code/QR + Name bei -> gemeinsamer Start.
- **Runde beitreten:** Spiel auswählen + 6-stelligen Code eingeben -> Kürzel im Spiel eingeben. Ein QR-Link öffnet direkt das passende Spiel.

Die gemeinsame Navigation ist Teil des Hub-Builds. Sie wird nach allen Spiel-Erweiterungen geladen und verwendet die existierenden Einstiegsschalter.

## URL-Vertrag

| URL | Wirkung |
| --- | --- |
| `/` | Games Hub |
| `/design-system/` | interne Living Preview der gemeinsamen Games-Komponenten |
| `/fast-quiz/` | Spieleigene Übersicht |
| `/fast-quiz/?mode=practice` | Training einstellen |
| `/fast-quiz/?mode=highscore` | Bestenliste / Highscore-Auswahl |
| `/fast-quiz/?mode=live` | Lehrkraft-Konfigurator |
| `/fast-quiz/?mode=join` | Beitrittsformular ohne vorausgefüllten Code |
| `/fast-quiz/?join=001234` | Beitrittsformular mit Code; führende Nullen erhalten |

Der Modus-/Join-Vertrag gilt analog für Fehlerjagd Deutsch und Vocab Rush. Gültige `join`-Parameter haben Vorrang. Modusparameter werden nach dem Einstieg entfernt; „Zurück“ startet keinen Modus erneut.

## Lokal prüfen

Node 22 oder neuer:

~~~bash
bash deploy-lab-games-hub.sh --check
npm ci --prefix tools/games --no-audit --no-fund
npm test --prefix tools/games
~~~

Browserprüfung inkl. Design-System-Preview:

~~~bash
tools/games/node_modules/.bin/playwright install chromium
npm run test:browser --prefix tools/games
~~~

Die Browserprüfung simuliert Serverantworten und die externe QR-Bibliothek. Sie schreibt keine echten Schüler-, Raum- oder Highscore-Daten.

## Lokal ansehen

Den zusammengesetzten Build verwenden, damit alle Spiel-Erweiterungen und die gemeinsame Design-Schicht enthalten sind:

~~~bash
GAME_BUILD_DIR="$(mktemp -d)"
node tools/build-lab-games-hub.mjs "$GAME_BUILD_DIR"
python3 -m http.server 8080 --directory "$GAME_BUILD_DIR/public"
~~~

Danach:

- `http://localhost:8080/` – Hub
- `http://localhost:8080/design-system/` – Living Preview

Live, Highscore und Foto-/KI-Funktionen verwenden im normalen Frontend ihre vorhandenen Staging-Backends.

## Cloud Shell – eigener Design-System-Worktree

Einmalig:

~~~bash
cd ~/Hausaufgabe
git fetch origin
git worktree add --track -b lab/games-design-system ~/gradecrew-games-design-system origin/lab/games-design-system
cd ~/gradecrew-games-design-system
bash cloud-shell-bootstrap.sh lab/games-design-system -- bash deploy-lab-games-hub.sh --check
~~~

Falls der Branch lokal schon existiert:

~~~bash
cd ~/Hausaufgabe
git fetch origin
git worktree add ~/gradecrew-games-design-system lab/games-design-system
cd ~/gradecrew-games-design-system
git pull --ff-only
bash cloud-shell-bootstrap.sh lab/games-design-system -- bash deploy-lab-games-hub.sh --check
~~~

Nach einem Reconnect:

~~~bash
cd ~/gradecrew-games-design-system
git pull --ff-only
bash cloud-shell-bootstrap.sh lab/games-design-system -- bash deploy-lab-games-hub.sh --check
~~~

## Preview veröffentlichen

Erst nach grünen Checks/Tests:

~~~bash
cd ~/gradecrew-games-design-system
bash cloud-shell-bootstrap.sh lab/games-design-system -- bash deploy-lab-games-hub.sh --deploy
~~~

Ziel bleibt der isolierte Preview-Channel `gradecrew-games-structure` in `hausaufgabe-staging`. Das Skript deployt ausschließlich Hosting dieses Lab-Previews, keine Functions oder Firestore-Regeln. Production bleibt unverändert.

## Neue Games-Komponente aufnehmen

1. Prüfen, ob das Muster bereits in `docs/games/GAMES_DESIGN_SYSTEM.md` definiert ist.
2. Produktweite Werte über `--gc-*`-Tokens beziehen; keine neue Markenpalette im Spiel anlegen.
3. Wiederverwendbare Games-Komponente mit `gcg-*` in `lab/shared/` ergänzen.
4. Living Preview und automatisierten Test ergänzen.
5. Erst danach in ein Einzelspiel migrieren.
6. Desktop/Tablet/Handy + Tastatur/Touch prüfen.

## Weiteres Spiel aufnehmen

1. eigenständiges Frontend mit den vorhandenen drei Modi bauen;
2. fachliches Bearbeitungsprofil (`fast`, `learn`, `deep`) definieren;
3. Einzel-Build mit Manifest und Prüfungen ergänzen;
4. Spiel einmal im Katalog eintragen;
5. gemeinsame Games-Komponenten statt eigener Kopien verwenden;
6. Hub-Build und Browserprüfungen erweitern;
7. `GAMES_STATUS.md` aktualisieren; erst nach Lab-Abnahme weiter integrieren.
