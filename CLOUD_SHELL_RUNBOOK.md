# GradeCrew – Cloud Shell Runbook

## Verbindliche Regel für alle zukünftigen Cloud-Shell-Anweisungen

**Jeder von ChatGPT ausgegebene Cloud-Shell-Befehlsblock muss so geschrieben sein, als wäre die Cloud Shell gerade frisch reconnectet worden.**

Niemals voraussetzen, dass aus einer vorherigen Sitzung noch Folgendes aktiv oder installiert ist:
- korrektes Arbeitsverzeichnis;
- korrekter Git-Branch;
- aktueller Git-Stand;
- aktive Node-Version;
- installierte Node-22-Version;
- geladene `nvm`-Umgebung;
- vorhandene Firebase CLI.

## Wichtige Shell-Regel

Ein mit `bash cloud-shell-bootstrap.sh ...` gestartetes Skript läuft in einer **Kind-Shell**. Ein dort ausgeführtes `nvm use 22` kann die Node-Version der Eltern-Shell **nicht** dauerhaft verändern. Deshalb dürfen Bootstrap und eigentlicher Deploy-/Testbefehl nicht mehr als zwei voneinander unabhängige Bash-Aufrufe empfohlen werden.

Stattdessen muss der eigentliche Befehl dem Bootstrap direkt übergeben werden. Der Bootstrap führt ihn anschließend im bereits vorbereiteten Node-22-Kontext aus.

### Verbindliches Muster

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout <BRANCH>
git pull --ff-only
bash cloud-shell-bootstrap.sh <BRANCH> -- <BEFEHL>
```

Beispiel Gate E Check:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/gate-e-load-test
git pull --ff-only
bash cloud-shell-bootstrap.sh feature/gate-e-load-test -- bash deploy-gate-e-preview.sh --check
```

Beispiel Gate E Deploy:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/gate-e-load-test
git pull --ff-only
bash cloud-shell-bootstrap.sh feature/gate-e-load-test -- bash deploy-gate-e-preview.sh --deploy
```

Der Bootstrap erledigt idempotent:
1. `git fetch --all --prune`;
2. Checkout des gewünschten Branches;
3. `git pull --ff-only`;
4. Laden von `nvm`;
5. **`nvm install 22`** – absichtlich auch dann, wenn Node 22 in einer früheren Sitzung schon installiert war;
6. `nvm use 22` und Default auf Node 22;
7. Firebase CLI nur dann installieren, wenn sie in der aktuellen Umgebung fehlt;
8. Node-, npm-, Firebase-, Branch- und Commit-Version anzeigen;
9. Working-Tree-Status anzeigen;
10. den angegebenen Folgebefehl **im selben vorbereiteten Prozess** ausführen.

## Warum `nvm install 22` statt nur `nvm use 22`?

Cloud-Shell-VMs können nach einem Reconnect neu bereitgestellt werden. Dann kann `nvm` noch vorhanden sein, aber die zuvor installierte Node-Version fehlen. `nvm install 22` ist idempotent und deckt beide Fälle ab: vorhandene Version verwenden oder fehlende Version installieren.

## Git-Sicherheit

- Immer `git pull --ff-only`, niemals automatische Merge-Commits durch einen Pull erzeugen.
- Vor Deploys muss der jeweilige Deploy-Guard weiterhin selbst einen sauberen Working Tree und den erlaubten Branch prüfen.
- Production niemals aus einem allgemeinen Bootstrap heraus deployen. Der Bootstrap bereitet nur die Shell vor.

## Firebase-Anmeldung

Der Bootstrap installiert bei Bedarf die Firebase CLI, speichert aber **keine Zugangsdaten im Repository**. Falls eine frische Cloud-Shell keine gültige Firebase-Anmeldung mehr besitzt, darf ein Deploy erst nach normaler interaktiver Firebase-Anmeldung fortgesetzt werden. Keine Tokens, Passwörter oder Service-Account-Schlüssel in Chat, Repo oder Shell-History einfügen.

## Vorgabe für neue Chats

Bei jeder zukünftigen GradeCrew-Übergabe zuerst `GRADECREW_STATUS.md` und diese Datei lesen. Cloud-Shell-Kommandos immer vollständig und reconnect-sicher formulieren – auch wenn unmittelbar davor schon dieselben Initialisierungsschritte ausgeführt wurden.
