# GC-AI-GATEWAY-03 — Staging CI/CD without manual Cloud Shell deploys

Stand: 2026-10-02. Branch `feature/ai-gateway-staging-cicd-v1`, Basis `feature/openai-gateway-provider-v1@2a6a227788f512f06336ce59324413674e7af6b1` (PR #29).

## Ziel

Den bereits funktionierenden Claude+OpenAI-Gateway sicher aus GitHub nach Staging deployen, ohne dass normale Provider-Erweiterungen manuell in Cloud Shell ausgerollt werden müssen.

## Sicherheitsmodell

- Nur Projekt `hausaufgabe-staging`, Service `gradecrew-ai-gateway-staging`, Region `europe-west1`.
- Eigener Deploy-Serviceaccount `gradecrew-ai-gateway-deployer`; keine Production-Rolle und kein statischer Google-Schlüssel.
- GitHub authentifiziert per OIDC/WIF. Provider-Bedingung bindet exakt Repository-ID, Workflow-Datei und `integration/ai-gateway-staging`.
- Das Deploy-Servicekonto erhält **keinen** Zugriff auf den Wert von `OPENAI_API_KEY`; der bestehende Cloud-Run-Runtime-Serviceaccount behält seinen Secret-Zugriff.
- Container werden als immutable Git-SHA-Images in ein eigenes Artifact-Registry-Repository gepusht.
- Neue Revision wird mit `--no-traffic` und Tag `candidate` erstellt.
- Candidate wird privat mit kurzlebigem ID-Token getestet: `/health`, `/providers`, Claude-Smoke und OpenAI-Smoke.
- Erst nach allen grünen Smokes wird exakt die geprüfte Revision auf 100 % Traffic gesetzt.
- Fällt der Healthcheck nach Promotion aus, wird automatisch auf die vorherige 100-%-Revision zurückgeschaltet.
- Jeder erfolgreiche Lauf schreibt ein 90 Tage aufbewahrtes Deployment-Receipt mit Commit, Image, vorheriger/neuer Revision und Smoke-Latenzen.

## Qualitätsgates vor Cloud-Zugriff

Der Workflow führt vor jeder Google-Authentifizierung erneut aus:

1. Gateway Syntax + Unit-Tests.
2. Intelligence-Contract-Tests.
3. Evaluation-Tests.
4. echten Firestore-Emulator für Routing-Transaktionen/Budgetchecks.
5. lokalen Docker-Build.
6. stale-SHA- und Branch-Prüfung.

Damit können fehlerhafte Commits keine Cloud-Berechtigungen erhalten oder eine Candidate-Revision erzeugen.

## Verfügbarkeit / bestehende Testgenerierung

Dieser Workstream ändert **nicht** den aktuellen GradeCrew-Pfad für die Test-Erstellung. Die bisher stabile OpenAI/Firebase-Generierung bleibt aktiv und unabhängig vom Gateway. Ein zukünftiger Cutover darf nur hinter Feature-Flag/Pilot erfolgen.

Für den späteren Runtime-Cutover gilt als feste Regel:

1. Router versucht nur qualifizierte Provider/Modelle.
2. Bei klaren Provider-/Gatewayfehlern darf ein anderer qualifizierter Provider übernehmen.
3. Solange der Gateway-Pilot nicht nachweislich mindestens so stabil ist wie heute, bleibt der bestehende direkte OpenAI-Pfad als Legacy-Fallback erhalten.
4. Fallbacks werden dedupliziert, budgetiert und als Telemetrie erfasst; keine unendlichen Retry-Ketten.
5. Wenn auch der Legacy-Pfad fehlschlägt, wird sauber abgebrochen statt fachlich fragwürdige Aufgaben auszugeben.

Das bedeutet: Der Ausbau auf mehrere KIs darf die heute funktionierende Test-Erzeugung nicht zu einem Single Point of Failure machen.

## Neue Dateien

- `ai-gateway/Dockerfile`
- `ai-gateway/.dockerignore`
- `.github/workflows/staging-ai-gateway.yml`
- `tools/automation/setup-staging-ai-gateway-identity.sh`

## Einmaliges Bootstrap

Nach grüner PR-CI einmal in authentifizierter Cloud Shell:

```bash
gcloud config set project hausaufgabe-staging
bash tools/automation/setup-staging-ai-gateway-identity.sh
```

Das Script ist idempotent, erstellt WIF/Deployer/Artifact Registry falls nötig und setzt `STAGING_GATEWAY_WIF_PROVIDER`, sofern `gh` angemeldet ist. Danach sollen normale Gateway-Deployments vollständig über GitHub laufen.

## Noch offen

- PR-CI für diesen Workstream grün bestätigen.
- Bootstrap einmal ausführen.
- `integration/ai-gateway-staging` auf den geprüften Commit aktualisieren und ersten vollautomatischen Candidate→Smoke→Promotion-Lauf beobachten.
- Danach Gemini als nächsten Provider auf eigenem Branch anbinden.

## Statusbegriffe

Code: wird auf `feature/ai-gateway-staging-cicd-v1` gesichert. Staging: bestehender manueller Claude+OpenAI-Stand bleibt unverändert, bis Bootstrap + erster automatischer Lauf grün sind. Production: unverändert. Aktuelle Test-Erzeugung: unverändert.
