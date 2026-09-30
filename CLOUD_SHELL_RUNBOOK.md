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

## Neue verbindliche Regel: Deployskripte bootstrappen ihre Runtime selbst

Deploy-/Checkskripte dürfen **nicht** davon abhängen, dass zuvor `nvm use 22` in einer anderen Shell ausgeführt wurde. Jedes relevante Deployskript muss im eigenen Prozess:
1. `nvm` laden;
2. `nvm install 22` idempotent ausführen;
3. `nvm use 22` ausführen;
4. die aktive Node-Hauptversion prüfen;
5. bei einem echten Deploy die Firebase CLI bei Bedarf installieren.

Damit entfällt die fehleranfällige Übergabe einer Node-Umgebung zwischen Kind- und Eltern-Shell.

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
