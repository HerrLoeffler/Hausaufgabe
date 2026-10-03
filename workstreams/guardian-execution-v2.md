# Guardian Execution V2

Task GC-AUTOMATION-04–07; Branch `feature/guardian-execution-v2` → main.
Basis `9ab366fea611c58c508a7e8d84279f416a308c47`. Regeln, State, TODO, Registry, offene PRs, Worker, Deploy-Workflows und Development Status `37079159236` frisch gelesen: 18 aktive Baustellen, 9 Überschneidungen; kein paralleler Execution-Controller. PR #51 bleibt eine gesonderte Web-CI-Arbeit.

## Implementiert, ausdrücklich noch nicht aktiviert

Konkrete neue Ausführung: dauerhaft reservierter Auftrag → begrenzter Responses-Bau-Aufruf → eigener Draft-PR → feste Combined-Prüfung ohne privilegierte Zugangsdaten → unabhängige OpenAI-/Anthropic-Reviews → exakter Fast-forward → explizite Integrations-CI → bestehende Staging-Deploys → geprüfte Receipt-Inhalte.

Die erste Zulassung betrifft kleine explizit benannte Web-Dateien, keine Prüfungsregeln/IAM/Backend-/Deploy-Dateien. Maximal drei Bau-/Reparaturversuche insgesamt, konservative Kostenreservierung vor jedem Start, kein blindes Retry bei unklarer API-/Dispatch-Rückmeldung. Modelle und Datenverträge auf main; Modelltexte sind keine Freigabeautorität. Bestehender Codex-Worker bleibt verfügbar; der neue begrenzte Worker benutzt einen einzelnen Responses-Aufruf, damit API-Aufwand ausdrücklich begrenzt werden kann.

Mehrere Jobs trennen Provider-Schlüssel, GitHub-Schreibrecht, Ausführung erzeugten Codes und Cloud-Zugang. GitHub-Token-Pushes lösen weitere Actions nicht automatisch aus; deshalb wird Integrations-CI ausdrücklich gestartet und deren Herkunft im Deploy nochmals geprüft.

## Verifikation und verbleibende Grenzen

Deploy-Workflow-Verknüpfung, Recipe-/Provenienzprüfung und Release-Board-Anbindung einschließlich Modell-/Usage-/Reservierungsanzeige sind umgesetzt. Aufnahme genau eines main-Auftrags über eigenen Workflow; sichere Einrichtung über `setup-guardian.sh`. Vorlage ist bewusst nicht in der aktiven Queue.

68 lokale Verhaltenstests grün: vollständiger Offline-Ablauf, normale Git-Fast-forward-Race, Scope-/Secrets-/Tests-Grenzen, Remote-Policy-Entzug, Kontrollcode-Version, unveränderte Dokumentation, Workflow-Rerun-Sperre, Modell-/Usage-/Refusal-/Kontext-/Budget-Grenzen, drei Bauversuche, begrenzte Deploy-Retries, echte Receipt-Digests und Release-Board gegen falsche grüne CI-Fallbacks. YAML lokal geparst und Bash-Syntax geprüft. GitHub-CI des finalen Codes und echte unprivilegierte Combined-Rehearsal separat nach Push prüfen; deren neue Runs nicht aus alten CI-Erfolgen ableiten.

Policy weiterhin deaktiviert und ohne Pilot. Dedizierter Worker-Key ist nach früherem realen Actions-Nachweis nicht hinterlegt; Review-Keys ebenfalls noch nicht bestätigt. Keine bezahlte KI-Ausführung, keine automatische Produktintegration und kein Production-Deploy durch diese Implementierung. Kleine Web-UI-Aufträge sind die erste Zulassung; Rules-/Backend-/Games-/Native-Profile sind ausdrücklich noch nicht implementiert.

## Nächster konkreter Schritt

Finale GitHub-CI und unprivilegierte Rehearsal prüfen; danach Steuerungscode auf main integrieren. Ein einzelner freigegebener Pilot mit begrenzten Dateien plus sichere Secrets-/Variablen-Einrichtung und echter Staging-Durchlauf sind erforderlich, bevor die Automatik als aktiv gilt. Martin-Abnahme und Production-Freigabe bleiben manuell. Code-Checkpoint `ff93d708d5cb9e140da3eab5426ffa85289faa2b`, PR #57; dessen fünf initialen Actions-Läufe waren grün. Das bestätigt nicht die später ergänzten Deploy-/Board-/Admission-Teile.
