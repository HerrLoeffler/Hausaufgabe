# Automatisierung: einmalige Aktivierung

Stand 02.10.2026: Die automatische Hosting-Preview ist Ende-zu-Ende bestätigt. Für die AI-Functions ist jetzt ebenfalls ein eigener automatischer Staging-Workflow vorbereitet. **Noch nicht als aktiviert/verified bezeichnen**, bis die einmalige Google-Cloud-IAM-Einrichtung erfolgt und ein realer Workflow-Deploy erfolgreich belegt wurde. Hosting, Functions und Rules bleiben bewusst getrennte Deploy-Stufen. Production bleibt approval-gated.

## 1. Automatische Hosting-Preview

Die Hosting-Automatik ist bereits eingerichtet. Ein erfolgreicher push-basierter Lauf von `AI Staging Checks` auf `feature/gradecrew-app-integration` baut exakt diesen getesteten SHA, prüft vor dem Deploy erneut, dass der Branch nicht weitergezogen ist, authentifiziert kurzlebig über Workload Identity Federation und veröffentlicht ausschließlich den Staging-Preview-Channel. Danach werden Manifest und Dateihashes gegen den gebauten Stand geprüft.

Die bestehende Identität `gradecrew-preview@hausaufgabe-staging.iam.gserviceaccount.com` besitzt absichtlich nur Hosting-bezogene Rechte. Sie darf keine Functions deployen.

Wiederherstellung/Neuaufbau nur falls nötig:

```bash
AUTOMATION_DIR=$(mktemp -d "$HOME/gradecrew-automation.XXXXXX")
git clone --depth 1 --branch main https://github.com/HerrLoeffler/Hausaufgabe.git "$AUTOMATION_DIR"
bash "$AUTOMATION_DIR/tools/automation/setup-staging-identity.sh"
```

Keine Service-Account-Schlüssel oder Tokens in Chat/Repo schreiben.

## 2. Automatische Staging AI Functions

Crew Assistant, Emmi und weitere AI-Serverfunktionen leben im Firebase-Codebase `ai`. Der dauerhafte Workflow ist `.github/workflows/staging-functions.yml`.

Er läuft nur nach einem erfolgreichen **push-basierten** `AI Staging Checks`-Lauf des Integrationsbranches und besitzt mehrere Fail-Closed-Grenzen:

- Zielprojekt fest: `hausaufgabe-staging`;
- Quelle: exakt der vom Upstream-CI getestete SHA;
- wenn `feature/gradecrew-app-integration` inzwischen weitergezogen ist, wird der Deploy verweigert;
- Functions-Tests und Syntax/Lint laufen erneut **vor** Cloud-Authentifizierung;
- eigener WIF-Pool + eigener Serviceaccount `gradecrew-functions@hausaufgabe-staging.iam.gserviceaccount.com`;
- Deployscope ausschließlich `functions:ai`;
- keine Firestore Rules, kein Hosting, kein Assessment-Codebase-Deploy und keine Production-Rolle;
- nach Deploy werden mindestens `crewAssistant` und `reviseWholeTest` in Staging verifiziert;
- ein Receipt-Artefakt hält Commit, CI-Lauf und Deployscope fest.

### Einmalige Aktivierung

Erst nachdem dieser Automationsstand auf `main` gemergt ist, einmal in der **authentifizierten Google Cloud Shell** ausführen:

```bash
AUTOMATION_DIR=$(mktemp -d "$HOME/gradecrew-functions-setup.XXXXXX")
git clone --depth 1 --branch main https://github.com/HerrLoeffler/Hausaufgabe.git "$AUTOMATION_DIR"
bash "$AUTOMATION_DIR/tools/automation/setup-staging-functions-identity.sh"
```

Das Setup erstellt **keinen JSON-Schlüssel**. Es richtet in `hausaufgabe-staging` einen eigenen Workload-Identity-Pool `gradecrew-functions-github`, den Provider `staging-functions` und den Serviceaccount `gradecrew-functions` ein. Die OIDC-Bedingung ist auf Repository-ID, `main` und exakt `.github/workflows/staging-functions.yml` begrenzt.

Der Deployer erhält staging-seitig die für den vorhandenen AI-Codebase benötigten Deploy-/Scheduler-/Task- und Secret-Metadatenrechte. `iam.serviceAccountUser` wird **nicht projektweit**, sondern nur auf tatsächlich vorhandene Runtime-/Build-Serviceaccounts vergeben. `Secret Manager Viewer` erlaubt dem Deployprozess, das vorhandene Secret `OPENAI_API_KEY` zu erkennen (`secretmanager.secrets.get`), aber nicht dessen Payload zu lesen.

Ein früherer One-shot-Deploy belegte genau diesen bisherigen IAM-Blocker: Functions-Tests und Firebase-Projektzugriff waren erfolgreich, der Deploy scheiterte anschließend mit `403 secretmanager.secrets.get` für `OPENAI_API_KEY`. Die neue Identität deckt diesen bekannten Metadatenzugriff ausdrücklich ab. Der erste echte automatische Deploy bleibt trotzdem der notwendige End-to-End-Nachweis.

Wenn `gh` in Cloud Shell bereits angemeldet ist, setzt das Setup die öffentliche Repository-Variable `STAGING_FUNCTIONS_WIF_PROVIDER` automatisch. Andernfalls gibt es am Ende die zwei notwendigen `gh`-Befehle aus. Kein Secretwert wird als GitHub-Variable gespeichert.

### Danach

Nach der einmaligen Aktivierung gilt für normale Staging-Entwicklung:

`Feature → Integration → AI Staging Checks grün → Hosting-Preview automatisch + AI-Functions automatisch → Martin testet.`

Cloud Shell ist dann **nicht mehr Teil des normalen Staging-Deployablaufs**. Sie bleibt nur für IAM-Reparaturen oder bewusst manuelle Notfall-/Diagnosepfade relevant.

Der bisherige `tools/automation/deploy-staging-ai-functions.sh` bleibt als eng begrenzter manueller Fallback erhalten. Er darf nicht mit der automatischen E2E-Verifikation verwechselt werden.

Erst nach erfolgreichem Functions-Workflow und Runtime-/Browserprüfung den aktuellen Release Train in `GRADECREW_STATE.json` auf `staging_deployed` hochstufen.

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
- https://github.com/google-github-actions/auth
- https://firebase.google.com/docs/hosting/test-preview-deploy
- https://firebase.google.com/docs/functions/manage-functions
- https://firebase.google.com/docs/projects/iam/permissions
