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

## App-Integration: Deployskript richtet die Runtime selbst ein

Das App-Integration-Deploy-/Checkskript darf **nicht** davon abhängen, dass zuvor `nvm use 22` in einer anderen Shell ausgeführt wurde. Ebenso darf eine vorhandene nvm-Installation nicht vorausgesetzt werden.

`deploy-app-integration-preview.sh` und `cloud-shell-bootstrap.sh` verwenden dafür den gemeinsamen Helfer `tools/cloud-shell-runtime.sh` im eigenen Prozess:
1. vorhandenes Node 22 mit npm direkt verwenden;
2. andernfalls vorhandenes nvm laden oder die feste offizielle nvm-Version v0.40.3 herunterladen und ihren Commit prüfen;
3. Node 22 installieren/aktivieren und die aktive Hauptversion prüfen;
4. bei einem echten Deploy fehlende Firebase CLI im Benutzer-Cache installieren.

Keine globalen Installationsrechte nötig; Shellprofile und Repository bleiben unverändert. Die älteren branchspezifischen Preview-Skripte benötigen weiterhin ihren eigenen kompatiblen Branch; dieses Update ersetzt sie nicht auf anderen Branches.

Damit entfällt die fehleranfällige Übergabe einer Node-Umgebung zwischen Kind- und Eltern-Shell.

## Fehlernachweis vom 30.09.2026

Der erste App-Integration-Deploy stoppte mit `FEHLER: nvm fehlt.` vor Tests und Veröffentlichung. Ursache: Das Skript konnte vorhandenes nvm laden, aber keine fehlende Installation einrichten. Der gemeinsame Runtime-Helfer korrigiert genau diese Voraussetzung. Ausgeführte Shell-Tests prüfen die frische Sitzung, Wiederverwendung, fehlgeschlagenen Download und falschen Download-Commit sowie die Firebase-Installation ohne globale Rechte.

## Verbindliches Muster für ChatGPT-Befehle

Für einen frischen Reconnect zuerst Repository und Branch synchronisieren und danach direkt das selbstbootstrappende Zielskript starten:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout <BRANCH>
git pull --ff-only
bash <DEPLOY-ODER-CHECK-SKRIPT> <MODUS>
```

Beispiel Gate E Check:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/gate-e-load-test
git pull --ff-only
bash deploy-gate-e-preview.sh --check
```

Beispiel Gate E Deploy:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/gate-e-load-test
git pull --ff-only
bash deploy-gate-e-preview.sh --deploy
```

## Ausgabe-Regel für ChatGPT

- Pro Handlungsschritt **genau einen kopierbaren Codeblock** mit echten Shell-Befehlen ausgeben.
- Erwartete Terminalausgabe, Beispiele oder Erklärtexte **niemals** in denselben kopierbaren Block mischen.
- Keine dekorativen Terminalzeilen wie `====`, `GradeCrew:` oder Beispielausgaben als vermeintliche Befehle darstellen.
- Nach einem Fehler zuerst Ursache erklären und dann einen einzigen korrigierten Befehlsblock liefern.

## Git-Sicherheit

- Immer `git pull --ff-only`, niemals automatische Merge-Commits durch einen Pull erzeugen.
- Vor Deploys muss der jeweilige Deploy-Guard selbst einen sauberen Working Tree und den erlaubten Branch prüfen.
- Production niemals über allgemeine Hilfsskripte deployen.

## Firebase-Anmeldung

Deployskripte dürfen bei Bedarf die Firebase CLI installieren, speichern aber **keine Zugangsdaten im Repository**. Falls eine frische Cloud Shell keine gültige Firebase-Anmeldung mehr besitzt, darf ein Deploy erst nach normaler interaktiver Firebase-Anmeldung fortgesetzt werden. Keine Tokens, Passwörter oder Service-Account-Schlüssel in Chat, Repo oder Shell-History einfügen.

## Vorgabe für neue Chats

Bei jeder zukünftigen GradeCrew-Übergabe zuerst `GRADECREW_STATUS.md` und diese Datei lesen. Cloud-Shell-Kommandos immer vollständig und reconnect-sicher formulieren – auch wenn unmittelbar davor schon Initialisierungsschritte ausgeführt wurden.
