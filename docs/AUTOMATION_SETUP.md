# Automatisierung: einmalige Aktivierung

Diese Datei beschreibt die Einrichtungswege, keinen automatisch aktuellen Aktivierungsstand. Maßgeblich sind frische Actions-Runs und tatsächlich geprüfte Receipts im Release Control. Hosting, Functions und Rules bleiben getrennte Deploy-Stufen; Production braucht eine ausdrückliche Freigabe. Der Guardian-V2-Pilot ist vor seiner ersten echten Ausführung separat zu bestätigen.

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

## 3. Vollständige Guardian-Ausführung V2

Die Implementierung ergänzt den bisherigen isolierten Codex-Worker um Veröffentlichung, eigene Tests, unabhängige Reviews, Reparaturfeedback, Integration und verifizierte Staging-Nachweise. Vertrags-/Scope-/Kostenregeln: [automation/EXECUTION.md](../automation/EXECUTION.md).

**Aktivierung erst nach der geprüften Integration dieses Steuerungscodes auf main.** Im ausgelieferten Stand ist `automation/guardian-policy.json` deaktiviert und ohne Aufgaben. Eine vorhandene Workflow-Datei bestätigt weder einen bezahlten Pilot noch eine aktive Automatik.

### Einmalig sicher hinterlegen

Unter https://github.com/HerrLoeffler/Hausaufgabe/settings/secrets/actions drei dedizierte Secrets eintragen:

| Secret | Zweck |
|---|---|
| `CODEX_WORKER_API_KEY` | OpenAI-Projekt-Key für den begrenzten Bau-Aufruf |
| `GUARDIAN_OPENAI_REVIEW_KEY` | Separater OpenAI-Review-Key; GPT-6 Astra muss freigeschaltet sein |
| `GUARDIAN_ANTHROPIC_REVIEW_KEY` | Anthropic-Review-Key für Claude Sonnet 5.5 |

Keine bestehenden Generator-/Production-Schlüssel wiederverwenden oder in Chat/Repo/Cloud-Shell-Befehle einkopieren. Eigene Projekt-/Provider-Ausgabenlimits und Modellzugriff prüfen. Die Engine reserviert konservativ maximal $5.50 pro Versuch, $16.50 pro Auftrag und $33 pro UTC-Tag; Cloud-/Actions-Kosten separat.

Danach Actions-Variablen `CODEX_WORKER_ENABLED=true` und `GRADECREW_GUARDIAN_ENABLED=true` setzen. Unter Actions → General muss GitHub Actions PRs erstellen dürfen; Jobrechte bleiben individuell eingeschränkt. Ein Flag allein startet wegen der leeren/deaktivierten Policy keinen Auftrag.

Alternativ in einer bereits bei GitHub als Repo-Eigentümer angemeldeten Shell:

```bash
bash tools/automation/setup-guardian.sh
```

Das Script fragt die drei Geheimwerte verdeckt über `gh secret set` ab, aktiviert die erforderliche PR-Erstellung und setzt Flags. Es schreibt keinen Geheimwert ins Repo und startet keinen bezahlten Auftrag. Keine pauschalen Firebase-/IAM-Rechte werden ergänzt.

### Einen echten Pilot aufnehmen

1. Betreuender Repo-Agent prüft frisch main, Development Status, Zielbranch, parallele Änderungen und die vollständige Task-Vorlage. Er erstellt aus einem konkreten Nutzerauftrag `agent-queue/<id>.json` mit exakten Dateien/Akzeptanzkriterien und aktuellem Integrations-SHA. Datei auf main mit CI sichern.
2. https://github.com/HerrLoeffler/Hausaufgabe/actions/workflows/guardian-admit.yml → Run workflow → Branch main → Task-ID ohne `.json`. Das ist die ausdrückliche Aufnahme dieses begrenzten Auftrags; vorhandene Historie kann nicht durch Neuaufnahme gelöscht werden.
3. Guardian reserviert Budget/Versuch und startet den Ausführungsworkflow. Fortschritt unter `stage-guardian.yml` und `guardian-execution.yml`; Release Control zeigt Modelle, Versuche, bekannte Nutzungsschätzung, Reservierungen und den tatsächlich bestätigten Stand.
4. Erst **Code → PR → exakte CI → zwei unabhängige Reviews → Integration → integrierte CI → Hosting/Functions-Receipts desselben SHA** ist ein technisch vollständiger Pilot. Noch offene Rules-/Produkt-/Gerätegates bleiben sichtbar.

Wenn PR-Erstellung, Provider-Modellzugriff oder WIF-Setup fehlt, ist das ein konkreter Setup-Blocker. Nicht einfach denselben bezahlten Worker-Run über GitHub „Re-run“ starten. Unklare Ergebnisse stoppen; actionable Tests/Reviews dürfen höchstens drei begrenzte Bauversuche auslösen.

### Stoppen / Berechtigung entziehen

`GRADECREW_GUARDIAN_ENABLED=false` verhindert weitere automatische Starts und Deployment-Fortsetzungen. Zusätzlich Policy auf main global `enabled=false` oder den konkreten Eintrag deaktivieren: aktuelle Remote-Policy wird vor privilegierten Aktionen, Provideraufrufen und Cloud-Login erneut geprüft. Einen bereits laufenden Providerrequest kann eine Flagänderung nicht zurückholen; bei Bedarf Run abbrechen und Kostenreservierung erhalten. Keine Historie löschen.

### Bisheriger Codex-Worker

`codex-worker.yml` bleibt für isolierte Werkzeug-Aufträge verfügbar: read-only GitHub, workspace-write, drop-sudo, kein Firebase-/Push-Zugang. Seine Patch-Artefakte sind **keine** automatische PR-/Deploy-Freigabe. Bei aktiviertem Guardian unterdrückt er direkte Push-Starts, damit nicht zwei Worker denselben Auftrag bearbeiten. Der neue V2-Worker benutzt bewusst einen begrenzten einzelnen Responses-Aufruf; so sind Modell-/Kontext-/Output-Kosten vor dem Start kontrollierbar.

## Bestehende Chats

> Lies auf GitHub main START_HERE.md, GRADECREW_STATE.json und docs/AUTOMATION_SETUP.md neu. Prüfe deine Baustelle, Release-Stufe, tatsächlichen Branch/Commit und offene Integrations-/Deploy-Gates. Behaupte keine Aktivierung oder Deployment-Stufe ohne Beleg.

## Quellen
- https://github.com/google-github-actions/auth
- https://firebase.google.com/docs/hosting/test-preview-deploy
- https://firebase.google.com/docs/functions/manage-functions
- https://firebase.google.com/docs/projects/iam/permissions

