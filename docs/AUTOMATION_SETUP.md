# Automatisierung: einmalige Aktivierung

Stand 01.10.2026: Workflows sind eingerichtet; Cloud-Berechtigungen, GitHub-Variablen und Worker-Key konnten mit dem Chat-Connector nicht gelesen oder gesetzt werden. Kein erfolgreicher Cloud-Deploy/Worker-Auftrag wird ohne echten Lauf behauptet.

## 1. Automatische Hosting-Preview

In der authentifizierten Google Cloud Shell einen separaten Checkout verwenden, damit laufende Arbeiten nicht überschrieben werden:

```bash
AUTOMATION_DIR=$(mktemp -d "$HOME/gradecrew-automation.XXXXXX")
git clone --depth 1 --branch main https://github.com/HerrLoeffler/Hausaufgabe.git "$AUTOMATION_DIR"
bash "$AUTOMATION_DIR/tools/automation/setup-staging-identity.sh"
```

Das private Repository erfordert GitHub-Anmeldung, falls noch kein Git-Zugriff eingerichtet ist. Kein Token in Chat oder Befehlszeile schreiben. Alternativ das einzelne geprüfte Skript über GitHub herunterladen und in Cloud Shell hochladen.

Das Skript legt ausschließlich in `hausaufgabe-staging` einen Hosting-Serviceaccount und eine kurzlebige GitHub-Identität an. Keine JSON-Schlüsseldatei. Die Vertrauensbedingung begrenzt den Zugang auf dieses Repository (numerische ID), main und genau den Preview-Workflow. Der Serviceaccount erhält Hosting Admin und Service Usage Consumer. **IAM erlaubt damit auch normales Staging-Hosting; die Begrenzung auf den Preview-Kanal erzwingt unser Workflow.** Production erhält keine Berechtigungen.

Falls `gh` bereits angemeldet ist, setzt das Skript die benötigte Actions-Variable selbst. Sonst den ausgegebenen öffentlichen Provider-Namen als `STAGING_WIF_PROVIDER` unter https://github.com/HerrLoeffler/Hausaufgabe/settings/variables/actions eintragen.

Danach einen normalen Push auf `feature/gradecrew-app-integration` durchlaufen lassen oder den erfolgreichen **push-basierten** Lauf von `AI Staging Checks` erneut ausführen. Ein manuell neu gestarteter workflow_dispatch-Lauf ist absichtlich kein Deploy-Trigger. Automatik: erfolgreiche CI → Build exakt dieses SHA ohne Cloud-Zugang → eigener Deploy-Job → Prüfsummenvergleich aller Dateien → Preview-Link und Receipt-Artefakt. Zwischenzeitlich überholte Commits werden abgewiesen. Functions und Regeln bleiben unverändert. Bestehender Preview-Kanal wird aktualisiert und läuft nach sieben Tagen ab.

Bei fehlender Variable läuft nur der Build; der Actions-Bericht nennt die fehlende Einrichtung. Deaktivierung: Variable entfernen. Google-IAM-Änderungen benötigen einmalig passende Administratorrechte im Staging-Projekt.

## 2. Codex-Worker

Verwendet die offizielle `openai/codex-action` mit API-Abrechnung. Das ist keine Zusage, dass vorhandenes ChatGPT-Kontingent benutzt wird. Einen separaten OpenAI-Projekt-Key mit passendem Budget/Limit verwenden; nicht den vorhandenen GradeCrew-Generator-Key zweckentfremden.

1. Unter https://github.com/HerrLoeffler/Hausaufgabe/settings/secrets/actions ein Repository-Secret `CODEX_WORKER_API_KEY` hinterlegen. Geheimwert nur dort eingeben.
2. Unter Actions-Variablen `CODEX_WORKER_ENABLED` auf `true` setzen.
3. Betreuender Chat prüft Branch/Commit und legt genau einen konkreten Auftrag nach `agent-queue/README.md` als neue JSON-Datei auf main an. Dessen Push startet den Worker. Nicht mehrere Aufgaben gleichzeitig einreichen; auf das Ergebnis warten.

Worker: lesender GitHub-Zugriff, keine gespeicherten Checkout-Zugangsdaten, kein Firebase-Zugang, workspace-write-Sandbox, drop-sudo, maximal 30 Minuten. Automatisch gesichert werden Patch, Auftrag, Ausgangscommit und Bericht als 30-Tage-Artefakt. Der betreuende Chat prüft und integriert; keine automatische PR-Erstellung oder Selbstfreigabe. Harte Runner-Abbrüche können letzte Änderungen verlieren. Deaktivierung: `CODEX_WORKER_ENABLED=false`.

Die API-Nutzung ist vor dem ersten bezahlten Lauf zu aktivieren; in diesem Einrichtungsauftrag wird noch kein künstlicher Codeauftrag ausgelöst. Ein echter End-to-End-Test nach Einrichtung bleibt erforderlich. Arbeitsberichte sind nicht automatisch vertrauenswürdige Testergebnisse; Integration benötigt unabhängige Prüfung.

## Bestehende Chats

> Lies auf GitHub main START_HERE.md und docs/AUTOMATION_SETUP.md neu. Prüfe deine Baustelle, sichere uncommittete Arbeit auf einem eigenen Branch und aktualisiere die Übergabe. Behaupte keine Aktivierung ohne erfolgreichen Actions-/Deploy-Nachweis.

## Quellen
- https://learn.chatgpt.com/docs/github-action
- https://github.com/google-github-actions/auth
- https://firebase.google.com/docs/hosting/test-preview-deploy
