# Automatisierung

Stand 01.10.2026. Auftrag: automatische Codex-Aufträge und Firebase-Preview statt wiederholtem Cloud-Shell-Deploy.

Implementiert auf main:
- `staging-preview.yml`: erfolgreicher push-basierter App-CI-Lauf → getrennte Build-/Deploy-Jobs → Hosting-Preview → Prüfsummen-Receipt. Keine Functions-/Rules-Deploys.
- `codex-worker.yml`: neue einzelne Task-JSON auf main oder manueller Wiederholungsstart → gepinnter Basiscommit → begrenzter Worker → Patch-/Berichtsartefakt. Keine automatische Integration oder PR-Erstellung.
- Google-WIF-Einrichtungsskript mit numerischer Repo-ID und exakter Workflow-Bindung. Rollen nur auf hausaufgabe-staging.

Geprüft: drei lokale Verhaltenstests (Manifest/Projekt/Hash, Preview-URL, Task-Validierung), Task-Auswahl in temporärem Git-Repo, YAML-Parsing und Bash-Syntax. GitHub-CI ist separat am jeweiligen Commit zu prüfen. Noch kein echter Worker-Auftrag. Preview-Automatik inzwischen Ende-zu-Ende bestätigt (siehe Nachweis unten).

Offen: `CODEX_WORKER_API_KEY` und Aktivierungsvariable hinterlegen; danach den Worker einmal Ende-zu-Ende prüfen. Der Chat-Connector kann Secrets, Variablen und IAM nicht verwalten. Details in `docs/AUTOMATION_SETUP.md`.

Grenzen: GitHub-Concurrency ersetzt keine dauerhafte Warteschlange. Jeweils einen Auftrag einreichen und Abschluss abwarten. Worker-Artefakte nach Prüfung in Git sichern, bevor die 30-Tage-Aufbewahrung endet. Harte Runner-Abbrüche können letzte Änderungen verlieren. Der Hosting-IAM-Role erlaubt normales Staging-Hosting; Preview-Begrenzung liegt im vertrauenswürdigen main-Workflow. Production nicht berechtigt.

## Bestätigter Preview-Deploy am 01.10.2026

Cloud-Shell-Einrichtung erfolgreich nach erneutem Ausführen; Variable STAGING_WIF_PROVIDER gesetzt. App-CI 36874373683 erfolgreich. Automatischer Preview-Lauf 36874596096 erfolgreich: Google-Anmeldung, Deployment und Prüfsummenprüfung aller 82 Dateien. Commit d42973e9e29361795f773f68e6d6ac8008c36917 ist ein Startcommit ohne Quellcodeänderungen. Beleg dauerhaft: docs/evidence/preview-36874596096.json. Preview: https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app. Kein Gerätetest und keine Freigabe der offenen Security-Gates.
