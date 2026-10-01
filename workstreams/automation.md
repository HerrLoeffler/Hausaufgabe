# Automatisierung

Stand 01.10.2026. Auftrag: automatische Codex-Aufträge und Firebase-Preview statt wiederholtem Cloud-Shell-Deploy.

Implementiert auf main:
- `staging-preview.yml`: erfolgreicher push-basierter App-CI-Lauf → getrennte Build-/Deploy-Jobs → Hosting-Preview → Prüfsummen-Receipt. Keine Functions-/Rules-Deploys.
- `codex-worker.yml`: neue einzelne Task-JSON auf main oder manueller Wiederholungsstart → gepinnter Basiscommit → begrenzter Worker → Patch-/Berichtsartefakt. Keine automatische Integration oder PR-Erstellung.
- Google-WIF-Einrichtungsskript mit numerischer Repo-ID und exakter Workflow-Bindung. Rollen nur auf hausaufgabe-staging.

Geprüft: drei lokale Verhaltenstests (Manifest/Projekt/Hash, Preview-URL, Task-Validierung), Task-Auswahl in temporärem Git-Repo, YAML-Parsing und Bash-Syntax. GitHub-CI ist separat am jeweiligen Commit zu prüfen. Kein echter Worker-Auftrag, kein Cloud-Login/Deploy in dieser Einrichtungssession.

Offen: `STAGING_WIF_PROVIDER` durch authentifizierte Cloud-Shell-Einrichtung setzen; `CODEX_WORKER_API_KEY` und Aktivierungsvariable hinterlegen; danach beide Abläufe einmal Ende-zu-Ende prüfen. Der Chat-Connector kann Secrets, Variablen und IAM nicht verwalten. Details in `docs/AUTOMATION_SETUP.md`.

Grenzen: GitHub-Concurrency ersetzt keine dauerhafte Warteschlange. Jeweils einen Auftrag einreichen und Abschluss abwarten. Worker-Artefakte nach Prüfung in Git sichern, bevor die 30-Tage-Aufbewahrung endet. Harte Runner-Abbrüche können letzte Änderungen verlieren. Der Hosting-IAM-Role erlaubt normales Staging-Hosting; Preview-Begrenzung liegt im vertrauenswürdigen main-Workflow. Production nicht berechtigt.
