# Automatisierung: einmalige Aktivierung

Stand 02.10.2026: Preview-Identität vom Nutzer eingerichtet; automatischer Hosting-Deploy wurde bereits Ende-zu-Ende bestätigt. Der Chat-Connector kann Secrets/Variablen/IAM nicht direkt verwalten. Hosting, Functions und Rules bleiben bewusst getrennte Deploy-Stufen.

## 1. Automatische Hosting-Preview

In der authentifizierten Google Cloud Shell einen separaten Checkout verwenden, damit laufende Arbeiten nicht überschrieben werden:

```bash
AUTOMATION_DIR=$(mktemp -d "$HOME/gradecrew-automation.XXXXXX")
git clone --depth 1 --branch main https://github.com/HerrLoeffler/Hausaufgabe.git "$AUTOMATION_DIR"
bash "$AUTOMATION_DIR/tools/automation/setup-staging-identity.sh"
```

Das private Repository erfordert GitHub-Anmeldung, falls noch kein Git-Zugriff eingerichtet ist. Kein Token in Chat oder Befehlszeile schreiben. Alternativ das einzelne geprüfte Skript über GitHub herunterladen und in Cloud Shell hochladen.

Das Skript legt ausschließlich in `hausaufgabe-staging` einen Hosting-Serviceaccount und eine kurzlebige GitHub-Identität an. Keine JSON-Schlüsseldatei. Die Vertrauensbedingung begrenzt den Zugang auf dieses Repository (numerische ID), main und genau den Preview-Workflow. Der Serviceaccount erhält Hosting Admin und Service Usage Consumer. **IAM erlaubt damit auch normales Staging-Hosting; die Begrenzung auf den Preview-Kanal erzwingt unser Workflow.** Production erhält keine Berechtigungen.

Falls `gh` bereits angemeldet ist, setzt das Skript die benötigte Actions-Variable selbst. Sonst den ausgegebenen öffentlichen Provider-Namen als `STAGING_WIF_PROVIDER` in den GitHub-Actions-Variablen eintragen.

Danach einen normalen Push auf `feature/gradecrew-app-integration` durchlaufen lassen. Automatik: erfolgreiche `AI Staging Checks` → Build exakt dieses SHA ohne Cloud-Zugang → eigener Deploy-Job → Prüfsummenvergleich aller Dateien → Preview-Link und Receipt-Artefakt. Zwischenzeitlich überholte Commits werden abgewiesen. **Functions und Regeln bleiben unverändert.** Bestehender Preview-Kanal wird aktualisiert und läuft nach sieben Tagen ab.

Bei fehlender Variable läuft nur der Build; der Actions-Bericht nennt die fehlende Einrichtung. Deaktivierung: Variable entfernen. Google-IAM-Änderungen benötigen einmalig passende Administratorrechte im Staging-Projekt.

## 2. Staging AI Functions

Crew Assistant und Emmi benötigen serverseitige Callables. Dafür gibt es `tools/automation/deploy-staging-ai-functions.sh`.

Der Deploy ist absichtlich enger als ein normales `firebase deploy`:

- Ziel ist hart `hausaufgabe-staging`;
- Quelle muss der **aktuelle Remote-Head** von `feature/gradecrew-app-integration` sein;
- ein exakter 40-stelliger erwarteter SHA ist Pflicht;
- der Deploy läuft aus einem separaten detached Worktree;
- `crewAssistant` und `reviseWholeTest` müssen im Zielcommit vorhanden sein;
- Functions-Abhängigkeiten, Tests und Checks laufen vor dem Deploy erneut;
- deployt wird ausschließlich `functions:ai`;
- Assessment-Codebase, Firestore Rules, Hosting und Production werden nicht angefordert.

Zuerst Dry Run:

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout main
git pull --ff-only
bash tools/automation/deploy-staging-ai-functions.sh <VERIFIZIERTER_INTEGRATIONS_SHA>
```

Erst wenn Dry Run und der zugehörige `AI Staging Checks`-Lauf grün sind:

```bash
bash tools/automation/deploy-staging-ai-functions.sh <VERIFIZIERTER_INTEGRATIONS_SHA> --deploy
```

Das Skript verwendet eine vorhandene Firebase-CLI oder ersatzweise die gepinnte `firebase-tools@15.32.0`. Falls die persönliche Cloud-Shell-Sitzung noch nicht für Firebase authentifiziert ist, dort normal anmelden. Keine Tokens oder Schlüssel in Chat/Repo schreiben.

Wichtig: Dieser Pfad nutzt bewusst die persönliche, authentifizierte Staging-Cloud-Shell und **nicht** den Hosting-WIF-Serviceaccount. Der Hosting-Serviceaccount besitzt absichtlich keine Functions-Deploy-Rechte. Eine spätere vollautomatische Functions-CI/CD-Identität muss separat mit minimalen Rollen und eigener Workflow-Bindung eingerichtet werden.

Nach erfolgreichem Functions-Deploy den exakten SHA und Deploy-Nachweis in `GRADECREW_STATE.json` unter dem aktuellen `release_train` eintragen. Erst wenn Hosting **und** benötigte Functions belegt sind, darf der Batch als vollständig `staging_deployed` gelten.

## 3. Codex-Worker

Verwendet die offizielle `openai/codex-action` mit API-Abrechnung. Das ist keine Zusage, dass vorhandenes ChatGPT-Kontingent benutzt wird. Einen separaten OpenAI-Projekt-Key mit passendem Budget/Limit verwenden; nicht den vorhandenen GradeCrew-Generator-Key zweckentfremden.

1. Unter den GitHub Actions Secrets ein Repository-Secret `CODEX_WORKER_API_KEY` hinterlegen. Geheimwert nur dort eingeben.
2. Unter Actions-Variablen `CODEX_WORKER_ENABLED` auf `true` setzen.
3. Betreuender Chat prüft Branch/Commit und legt genau einen konkreten Auftrag nach `agent-queue/README.md` als neue JSON-Datei auf main an. Dessen Push startet den Worker. Nicht mehrere Aufgaben gleichzeitig einreichen.

Worker: lesender GitHub-Zugriff, keine gespeicherten Checkout-Zugangsdaten, kein Firebase-Zugang, workspace-write-Sandbox, drop-sudo, maximal 30 Minuten. Automatisch gesichert werden Patch, Auftrag, Ausgangscommit und Bericht als 30-Tage-Artefakt. Der betreuende Chat prüft und integriert; keine automatische PR-Erstellung oder Selbstfreigabe. Harte Runner-Abbrüche können letzte Änderungen verlieren.

Die API-Nutzung ist vor dem ersten bezahlten Lauf zu aktivieren; ein echter End-to-End-Test bleibt erforderlich. Arbeitsberichte sind nicht automatisch vertrauenswürdige Testergebnisse; Integration benötigt unabhängige Prüfung.

## Bestehende Chats

> Lies auf GitHub main START_HERE.md, GRADECREW_STATE.json und docs/AUTOMATION_SETUP.md neu. Prüfe deine Baustelle, Release-Stufe, tatsächlichen Branch/Commit und offene Integrations-/Deploy-Gates. Behaupte keine Aktivierung oder Deployment-Stufe ohne Beleg.

## Quellen
- https://learn.chatgpt.com/docs/github-action
- https://github.com/google-github-actions/auth
- https://firebase.google.com/docs/hosting/test-preview-deploy
- https://firebase.google.com/docs/functions/1st-gen/organize-functions-1st
