# GradeCrew Games – gemeinsamer Einstieg

Der Hub ordnet die drei vorhandenen Spiele. Aufgaben, Lernlogik, Wertung und Backends bleiben eigene Module.

## Aufbau

| Ort | Aufgabe |
| --- | --- |
| lab/shared/games-catalog.js | Einmalige Definition der Spiele, Modi, Einstiegsschalter und Buildskripte |
| lab/shared/game-shell.js / .css | Navigation und Einstieg in den gewünschten Modus |
| lab/games-hub/ | Spielauswahl, Suche, Fachfilter, Favoriten, Code-Einstieg |
| lab/fast-quiz/ | Mathematik und Rundungsaufgaben |
| lab/fehlerjagd-deutsch/ | Deutsch-Engine, Aufgabenintegrität, Erklärungen, Kompetenzprofil |
| lab/vocab-rush/ | Englisch, Vokabelsets, Import und Lernmodus |
| tools/build-lab-*.mjs | Vorhandene Einzel-Builds der Spiele |
| tools/build-lab-games-hub.mjs | Vollständige Einzel-Builds zusammensetzen; gemeinsame Navigation einbauen |
| tools/games/ | Automatisierte Struktur- und Browserprüfungen |
| GAMES_STATUS.md | Stand, Abnahmegrenzen und nächste Aufgaben |

## Nutzerwege

- **Üben:** Modus auswählen -> Spiel wählen -> Inhalte einstellen -> starten.
- **Highscore:** Modus auswählen -> Spiel wählen -> Disziplin und Kürzel festlegen -> starten.
- **Live mit Lehrkraft:** Modus auswählen -> Spiel wählen -> Runde konfigurieren -> Code/QR anzeigen -> Klasse beitreten lassen -> gemeinsam starten.
- **Runde beitreten:** Spiel auswählen + 6-stelligen Code eingeben -> Kürzel im Spiel eingeben. Ein QR-Link öffnet direkt das passende Spiel.

Die gemeinsame Navigation ist Teil des Hub-Builds. Sie wird nach allen Spiel-Erweiterungen geladen und verwendet die existierenden Einstiegsschalter.

## URL-Vertrag

| URL | Wirkung |
| --- | --- |
| /fast-quiz/ | Spieleigene Übersicht |
| /fast-quiz/?mode=practice | Training einstellen |
| /fast-quiz/?mode=highscore | Bestenliste / Highscore-Auswahl |
| /fast-quiz/?mode=live | Lehrkraft-Konfigurator |
| /fast-quiz/?mode=join | Beitrittsformular ohne vorausgefüllten Code |
| /fast-quiz/?join=001234 | Beitrittsformular mit Code; führende Nullen erhalten |

Das gilt auch für fehlerjagd-deutsch und vocab-rush. Gültige join-Parameter haben Vorrang. Modusparameter werden nach dem Einstieg entfernt; „Zurück“ startet keinen Modus erneut. QR-Links bleiben kompatibel mit den vorhandenen Backends.

## Lokal prüfen

Node 22 oder neuer:

~~~bash
bash deploy-lab-games-hub.sh --check
npm ci --prefix tools/games --no-audit --no-fund
npm test --prefix tools/games
~~~

Browserprüfung:

~~~bash
tools/games/node_modules/.bin/playwright install chromium
npm run test:browser --prefix tools/games
~~~

Die Browserprüfung simuliert Serverantworten und die externe QR-Bibliothek. Sie schreibt keine echten Schüler-, Raum- oder Highscore-Daten.

## Lokal ansehen

Den zusammengesetzten Build verwenden, damit alle Spiel-Erweiterungen enthalten sind:

~~~bash
GAME_BUILD_DIR="$(mktemp -d)"
node tools/build-lab-games-hub.mjs "$GAME_BUILD_DIR"
python3 -m http.server 8080 --directory "$GAME_BUILD_DIR/public"
~~~

Danach http://localhost:8080 öffnen. Live, Highscore und Foto-KI verwenden im normalen Frontend ihre vorhandenen Staging-Backends.

## Cloud Shell – eigener Arbeitsordner

Einmalig:

~~~bash
cd ~/Hausaufgabe
git fetch origin
git worktree add --track -b lab/games-structure ~/gradecrew-games-structure origin/lab/games-structure
cd ~/gradecrew-games-structure
bash cloud-shell-bootstrap.sh lab/games-structure -- bash deploy-lab-games-hub.sh --check
~~~

Nach einem Reconnect:

~~~bash
cd ~/gradecrew-games-structure
bash cloud-shell-bootstrap.sh lab/games-structure -- bash deploy-lab-games-hub.sh --check
~~~

Das Bootstrap-Skript bereitet Node 22 vor und führt den Folgebefehl im selben Prozess aus. Seine PATH-Änderung muss nicht an die Eltern-Shell zurückgegeben werden.

## Preview veröffentlichen

Nach Prüfung:

~~~bash
cd ~/gradecrew-games-structure
bash cloud-shell-bootstrap.sh lab/games-structure -- bash deploy-lab-games-hub.sh --deploy
~~~

Ziel: Preview-Channel gradecrew-games-structure in hausaufgabe-staging. Das Skript deployt ausschließlich diesen Hosting-Preview, keine Functions oder Firestore-Regeln. Die tatsächliche Preview-URL gibt Firebase nach erfolgreichem Deployment aus.

## Weiteres Spiel aufnehmen

1. Eigenständiges Frontend mit den vorhandenen drei Modi bauen.
2. Einzel-Build mit Manifest und Prüfungen ergänzen.
3. Spiel einmal im Katalog eintragen: sichere ID, vorhandene Einstiegsschalter und Buildskript.
4. Hub-Build und Browserprüfungen erweitern.
5. GAMES_STATUS.md aktualisieren; erst nach Lab-Abnahme in GradeCrew integrieren.
