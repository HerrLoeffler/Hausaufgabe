# GC-HOOKS-01 — Codex-Lifecycle-Hooks für GradeCrew und Games

Entwurf vom 10.10.2026, nicht zur Installation freigegeben. Auftrag: Zentrale → GC · Automatisierung & Integration. Dieser Architekturentwurf ergänzt die vorhandene Koordination; er übernimmt keine Security-, Games- oder Guardian-Implementierung. Die inzwischen ausdrücklich beschlossene Hierarchie „Hauptzentrale → gemeinsame Games-Zentrale → Spielzentralen → ausführende Fach-Chats“ und die ausschließlich koordinierende Rolle ALLER Zentralen stehen in AGENTS/CHAT_CONTRACT; sie sind keine Designoption mehr. Die erste Sicherung in [PR184](https://github.com/HerrLoeffler/Hausaufgabe/pull/184), `be615a8f`, betraf nur die Hauptzentrale und wird im selben PR um die neue Nutzerentscheidung ergänzt.

## Ziel und belegter Iststand

Martin möchte, dass neue und fortgesetzte GradeCrew-Arbeit ihre Zuständigkeit, Übergabe und Nachweise zuverlässig berücksichtigt. Fachchats und Modelle sollen passend zum konkreten Auftrag gewählt werden. Erfolg bedeutet weniger verlorener Kontext und weniger Doppelarbeit, ohne zusätzliche Modellaufrufe aus Lifecycle-Ereignissen oder einen zweiten Aufgabenbestand.

Frisch über den GitHub-Connector geprüft: `main@59dd0a501a28c04c36ee877450239bf1d64a3187`. START_HERE, AGENTS, CHAT_CONTRACT, CHAT_RECOVERY, STATE, TODO, Registry und Workstream-README gelesen. Der vollständige Main-Tree enthält keine `.codex/`-Hook-Definition. Vor Anlage von PR184 alle 238 Branchnamen und 36 offenen PRs geprüft; keine eigene Hook-Aufgabe gefunden. Das ist kein inhaltlicher Scan jedes historischen Branches. PR126 betrifft Guardian-Zulassungsprofile und bleibt ein eigener offener Auftrag. PR126 überschneidet sich mit TODO/STATE/Registry; PR153 mit AGENTS/TODO/Registry. Bestehende Einträge werden erhalten; spätere Integration muss die gemeinsamen Dateien bewusst abgleichen.

[Development Status 38029190041](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38029190041), Job114146355743, auf genau diesem Main ist erfolgreich. Sein Bericht vom 10.10.2026 05:56 UTC nennt 21 aktive Baustellen, 12 Parallelüberschneidungen und 12 veraltete kritische Branches. Ein erfolgreicher Audit ist keine Konfliktfreiheit. Die Integrationsbasis ist weiterhin `feature/gradecrew-app-integration@c3a5fdcfb949bc0de23295a549388c23cf7655e6`; STATE dokumentiert Staging, nicht neue Hook-Aktivierung.

Hauptzentrale: Codex-Thread `01a10df6-736b-7a62-bd38-2724cf254c2e`, Host local, Arbeitswurzel ist eine ChatGPT-Projekt-Mirrorwurzel ohne `.git`. Facharbeit liegt unter anderem in separaten Git-Worktrees. Auf den geprüften lokalen Wurzeln fehlen `.codex/hooks.json` und Projektkonfiguration; die Nutzerkonfiguration enthält keine inline Hooks. Plugin-/Managed-Hooks sind damit nicht vollständig inventarisiert. Der gefundene CLI meldet `0.162.0-alpha.2`; seine App-Server-Schemata wurden lokal generiert. Normalisierte Handlerfelder umfassen unter anderem command, timeoutSec und additionalContextLimit, die Hook-Notification hat threadId/turnId. Diese Protokollform ist nicht das hooks.json-/stdin-Schema und beweist keine vorhandene Identity-Weitergabe oder einen erfolgreichen Hook-Lauf im Desktop.

## Drei mögliche Ansätze

1. **Empfohlen: geprüftes Bundle plus lokaler Adapter je freigegebener Wurzel.** Eine versionierte Implementierung und identische Hook-Definitionen; pro Wurzel nur Pfad-/Rollenbindung. Funktioniert ohne Annahme, dass jeder Fachbranch Main-Konfiguration enthält. Wenige ausdrücklich ausgewählte Pilotwurzeln zuerst.
2. **Nur eingecheckte Repo-Hooks.** Einfach für aktuelle Git-Checkouts, aber alte Games-/Fachbranches erben Main-Dateien nicht. Die Zentrale außerhalb des Git-Repos benötigt weiterhin einen Adapter. Kein ausreichender Gesamtansatz.
3. **Globale Hooks mit Projektfilter.** Weniger lokale Dateien, aber jeder fremde Chat erreicht den Handler, und additive Quellen erhöhen Doppelaufrufrisiken. Für diesen Auftrag nicht empfohlen.

## Getrennte Verantwortungen

| Ebene | Aufgabe | Bestehender Anschluss |
|---|---|---|
| Hooks | Kleiner lokaler Kontext, Zuständigkeits- und Nachweiswarnungen, mechanischer Resume-Snapshot | START_HERE, Registry, STATE, passende Übergabe |
| Agent/Zentrale | Frischen Main/PR/Run prüfen, Wunsch einordnen, Fachchat und Modell tatsächlich beauftragen, Ergebnisse abholen | GC-BRAIN-01, vorhandenes `coordination.json` und Request-Ledger |
| CI/Guardian | Feste Prüfungen, unveränderliche Kandidaten, zugelassene Profile, Budget-/Provider-/Review-Gates | Development Status, Handoff Checks, Guardian, komponentenspezifische CI |

Hooks starten weder Fachchats noch Subagenten, Actions, Commits, Merges, Deployments oder Provider-Aufrufe. Eine Hook-Meldung ist keine Freigabe. Die bestehenden drei Guardian-Reviews werden nicht durch lokale Hinweise ersetzt. Games bleiben vom gemeinsamen Web-Staging getrennt; auch eine erlaubte Games-Testveröffentlichung benötigt ihren bestehenden Auftrag und ihre Gates. Native Build-, Geräte-, Performance- und visuelle Prüfungen bleiben abhängig vom jeweiligen Spiel. Alle Zentralen starten selbst keine Builds, Tests, Integration oder Deployments; sie beauftragen dafür Fach-Chats. Auch notwendige Repo-Dokumentation wird dem zuständigen Fachchat übergeben und ist keine Ausnahme der Zentralenrolle.

## Ereignisse und bewusst kleine V1

Alle Handler laufen synchron, ohne Netzwerk. Ein Python-Dispatcher aus der Standardbibliothek genügt für die Hinweise, Snapshots und die reine Gate-Entscheidung. Er verwendet nur erlaubte strukturierte Quellen; Repo-/Nutzertexte werden nicht als Shellbefehle ausgeführt. Eine verlässlich aktuelle Threadidentität ist eine zusätzliche, derzeit ungeklärte Integrationsvoraussetzung der Sperre, nicht automatisch eine Fähigkeit dieses Dispatchers.

| Ereignis | Vorgeschlagenes Verhalten | Eigene Grenzen |
|---|---|---|
| SessionStart | Zeigt Rollenbindung, aktuellen lokalen Branch/HEAD, Task-/Übergabepointer, dokumentierte Release-Stufe und Frische der Kontrollquelle. Erinnert an frischen Main-/Live-Audit vor Änderungen. Liest bei compact den letzten mechanischen Snapshot. | 5s, Kontext höchstens 1.500 UTF-8-Bytes; `additionalContextLimit=512` |
| UserPromptSubmit | Kurzer konstanter Hinweis: Frage zuerst beantworten; bei tatsächlichem Arbeitsauftrag bestehende Task/Schreiber und zentrale Delegation abgleichen. Keine Schlüsselwort-Heuristik und keine automatische Aufgabenerzeugung. | 2s, Kontext höchstens 800 Bytes; `additionalContextLimit=256`; Prompt weder ausgeben noch speichern |
| PreToolUse | Nur bei positiv verifizierter Identität einer der fünf Zentralen Ausführungs-/Edit-Werkzeuge vor dem Start verweigern; Statuslesen und Koordinations-APIs erlauben. Bei Fach-Umsetzung keine Zentralensperre. | 2s; matcher alle Tools; Identity-/Coverage-Pilot vor Enforcement erforderlich |
| PreCompact | Schreibt einen mechanischen Snapshot und meldet gegebenenfalls fehlenden Übergabepointer. | 2s; niemals Kompaktierung blockieren |
| Interrupt | Best-effort-Snapshot desselben Typs. Bei Zeitüberschreitung bleibt der frühere Snapshot erhalten. | 2s; interner Gesamtbudgetdeckel 1,5s; keine Semantik aus Chattext ableiten |
| Stop | Prüft beobachtbare Arbeitsdeltas und den passenden Übergabepointer; gibt höchstens eine kurze fehlende-Nachweise-Warnung. Bei unverändertem Fragen-Turn still. | 2s; keine Weiterlaufentscheidung; bei `stop_hook_active=true` sofort `{}` |

V1 enthält keinen allgemeinen Test-/Änderungs-Hook und keinen PermissionRequest-Autoapprove. Vollständige Tests auf jeden Prompt oder Stop wären zu langsam und würden Fragen in Arbeitsaufträge verwandeln. Stop kann nicht alle uncommitteten Änderungen innerhalb derselben bereits schmutzigen Datei sicher einem Turn zuordnen: solche Grenzen dürfen nicht als lückenlose Kontrolle dargestellt werden. HEAD-/Dirty-Zähländerungen und explizite vorhandene Task-Nachweise sind Warnsignale; unveränderte Baseline bleibt still. Zentralen dürfen Hinweise/Snapshots über den separat geprüften lokalen Handler erhalten; das ist keine Erlaubnis, ihn selbst per Shelltool aufzurufen. Hook-Laufzeitprozesse und Fachchat-Aktivierung sind von Werkzeugaufrufen des koordinierenden Modells zu unterscheiden.

### Wireformat und aktuelle Quellen

Offizielle [Hooks-Dokumentation](https://learn.chatgpt.com/docs/hooks), frisch gelesen am 10.10.2026: Eingabe ist ein JSON-Objekt auf stdin mit `session_id`, `cwd`, `hook_event_name`; eventabhängig `turn_id`. SessionStart nutzt `source` startup/resume/clear/compact. UserPromptSubmit hat `prompt`; PreCompact hat `trigger`; Stop hat `stop_hook_active`. Stop und Interrupt benötigen JSON-Ausgabe; PreCompact ignoriert Klartext. Interrupt erlaubt höchstens 3s. Stop-Blocking erzeugt eine Fortsetzung, daher V1 ohne Blocking. Command-Hooks werden verwendet; prompt/agent-Handler sind keine unterstützte Ausführung. Projektlayer und genaue Definition müssen vertraut werden; mehrere Quellen sind additiv. [Konfigurationsdokumentation](https://learn.chatgpt.com/docs/config-file/config-advanced) beschreibt die Wurzel-/Layer-Erkennung.

Ausgabevorschläge, vom Dispatcher abhängig vom Ereignis erzeugt:

```json
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"GradeCrew: lokale Quelle veraltet/unbekannt; vor Änderungen frischen main und Live-Audit prüfen."}}
```

UserPromptSubmit verwendet dieselbe Hülle mit seinem Eventnamen. PreCompact, Interrupt und Stop verwenden bei einer Warnung ausschließlich:

```json
{"systemMessage":"GradeCrew: mechanischer Resume-Snapshot vorhanden; Code und Übergabe noch separat sichern."}
```

Ohne Warnung `{}`, Exit0. Keine `decision`, kein Exit2, kein `continue:false`, keine unpassenden `additionalContext`-Felder für diese drei Ereignisse. Nur der verifizierte PreToolUse-Fall verwendet `hookSpecificOutput` mit `hookEventName=PreToolUse`, `permissionDecision=deny` und einer kurzen `permissionDecisionReason`; kein Input-Rewrite/Autoapprove. Release-Verhalten anhand der aktuellen Dokumentation und Pilot prüfen; generierte Main-Schemata anderer Versionen sind kein Ersatz.

## PreToolUse: Rollenidentität vor Sperre

Die feste Rollenregel gilt für die fünf explizit zugeordneten bestehenden Threads. Die Nutzerentscheidung vom 10.10.2026 erweitert den anfänglichen Hauptzentralen-Scope:

| Ebene | Bestehender Chat | Thread-ID |
|---|---|---|
| Hauptzentrale | GradeCrew Zentrale | `01a10df6-736b-7a62-bd38-2724cf254c2e` |
| Gemeinsame Games-Zentrale | GC · Games-Zentrale | `01a11864-3ec7-7091-acc0-9ff292f530f3` |
| Spielzentrale Pizza | Pizza Spiel Zentrale | `01a111e6-c211-76a2-928e-8ed88a7b7bec` |
| Spielzentrale Lerninsel | GC · Lerninsel-Zentrale | `01a1183f-dad9-7640-8a82-23107c980d6e` |
| Spielzentrale Escape-Expedition | GC · Escape-Expedition-Zentrale | `01a11681-00e3-79d1-8f27-c48267b86c0d` |

Für alle: ausschließlich Koordination, Recherche und Statuslesen; keine eigenen Shellbefehle, Dateiänderungen, Tests, Builds, Integration oder Deployments. Fach-Umsetzung bleibt getrennt und ausführungsberechtigt. Diese Liste ist eine explizite Nutzerzuordnung, keine Chatnamensheuristik. Historische Implementierung dieser Chats bleibt Evidenz, keine aktuelle Ausführungsbefugnis. Weitere Rollen erfordern einen ausdrücklich zugeordneten Owner; keine neue Chats oder Forks durch den Hook.

Bestätigter Randfall: Normale Forks behalten die sessionId des Root-Chats. Hook-Common-Input liefert nicht pauschal den aktuellen thread.id. Siehe [App-Server: Thread/Sitzung/Fork](https://learn.chatgpt.com/docs/app-server). Deshalb niemals `session_id == coordinator_thread_id` als Sperrkriterium verwenden. Auch gleicher cwd/Worktree plus session_id trennt einen Same-directory-Fach-Fork nicht sicher von der Zentrale.

Gate-Vertrag: Enforcement nur mit einer vertrauenswürdigen, aktuellen Zuordnung des konkreten Events zu tatsächlichem Thread und Rolle, gebunden an reale Wurzel sowie aktuellen turn_id, soweit vorhanden. Die Zuordnung muss aus einem qualifizierten lokalen Client-/App-Server-Adapter stammen, nicht aus prompt/tool_input oder einem kopierten Rollenfeld. Ein lokaler statischer Rootadapter ist nur ein Hinweis, kein solcher Threadnachweis. Die tatsächlich verfügbare Zuordnung ist hier noch nicht belegt. Fehlt sie, bleibt `identity_unqualified`: höchstens ein datensparsamer Hinweis pro Turn, keine titel-/session-/pfadbasierte pauschale Verweigerung für Fach-Chats. Die Nutzerregel bindet alle fünf Zentralen weiterhin. Der Identity-Pilot muss jede dieser Rollen und einen Fach-Fork mit geteilter Root-sessionId abdecken.

Das ist ein konkretes Aktivierungsgate: Zuerst den vorhandenen Client auf eine unterstützte zuverlässige Zuordnung untersuchen und synthetisch prüfen. Wenn der Client sie nicht bereitstellt, nur die Hinweise/Snapshots aktivieren und die Zentralensperre ausdrücklich als unqualifiziert belassen; eine zusätzliche vertrauenswürdige Identitätsbrücke ist dann ein separat zu entwerfender Anschluss. Kein Hintergrunddienst, MCP-Server oder eigener App-Server startet allein wegen dieses Entwurfs. Kein falsches current_thread_id-Feld im Hook-Input erfinden.

### Werkzeugpolicy im positiv erkannten Zentralenkontext

| Werkzeugfamilie | Entscheidung / Grenze |
|---|---|
| Bash/exec_command, apply_patch/Edit/Write; beliebige File-/Git-Schreib-, Build-, Test-, Integration-, Workflow-Dispatch-/Deploy-Tools | Verweigern, auch wenn der konkrete Shellbefehl nur liest. Die Zentrale delegiert. |
| Computer-/Browser-JavaScript und allgemeine ausführbare Code-/Terminalwerkzeuge | Verweigern; nicht durch unsichere Textklassifikation als „read-only“ umetikettieren. |
| Chat-/Statuslesen, Quellen-GET, Job-/Receipt-Lesen, Ergebnisse abholen | Exakte geprüfte Toolnamen auf Allowlist; keine pauschale Freigabe aller GitHub- oder MCP-Tools. |
| Fachchat beauftragen, priorisieren, Sidebar organisieren, Modell pro Auftrag auswählen | Bestehende koordinierende APIs innerhalb der Nutzerautorisierung. Keine neue Chats/Hierarchie aus einem bloßen Vorschlag. |
| Code-mode-Transport für Koordinations-APIs | Nur zulassen, wenn die tatsächlichen verschachtelten Tools vorher einzeln durch die Policy laufen; keinen fremden Javascript-Ausführungskanal pauschal freigeben. Bei fehlendem Nachweis als Coverage-Lücke behandeln. |
| Unbekannte lokale Tools im eindeutig erkannten Zentralenkontext | Verweigern und an Fach-Owner verweisen; außerhalb dieses Kontextes keine zusätzliche Zentralensperre. |

Die Umsetzung erstellt die tatsächliche Name-/Alias-Allowlist aus dem aktuellen Host-Inventar. Ein create_worktree/handoff kann Dateien oder Setupbefehle verändern und ist kein bloßes Statuslesen; solche Tätigkeiten gehören zum Fachchat. Beauftragungs-APIs ersetzen keine vorhandene menschliche Autorisierung und lockern keine Fachchat-Gates.

Abdeckung laut aktueller Hooks-Dokumentation: Bash/Unified exec, apply_patch, MCP und die meisten lokalen Function-Tools werden erfasst. Code-mode-Nested-Calls müssen real getestet werden. Hosted WebSearch wird nicht erfasst. write_stdin startet keinen neuen PreToolUse-Durchlauf für eine alte Exec-Sitzung; deshalb vor einem Enforcement-Pilot aktive Zentralen-Terminals inventarisieren und vom passenden Fach-Owner geordnet beenden oder isolieren lassen. Bereits gestartete Befehle werden nicht rückgängig gemacht. Spezialisierte Pfade können ausnehmen; Hookausfall/Timeout/malformed Output ist keine garantierte Verweigerung. Die Rollenregel ist verbindlich, die Hook-Sperre eine belegbar begrenzte Schutzschicht, keine vollständige Sicherheitsgrenze.

## Scope: Mirrorwurzel und Worktrees

Kanonische, später umzusetzende Quellen: `tools/codex_hooks/lifecycle.py`, `tools/codex_hooks/hooks.template.json`, `tools/codex_hooks/README.md`. Ein manuell geprüfter, digestgebundener lokaler Bundleordner enthält die exakten freigegebenen Bytes. Seine absolute Dispatcheradresse wird beim ausdrücklichen lokalen Einrichten in die Vorlage eingesetzt. Keine bewegliche Main-Adresse und kein automatisches Bundle-Update.

Je ausgewählter Arbeitswurzel wird später eine identische `.codex/hooks.json` materialisiert. Die Definition verweist auf denselben absoluten Bundlepfad, nicht auf einen angenommenen Gitroot und nicht auf relative Pfade ab beliebigem cwd. `.codex/config.toml` darf nötigenfalls eine leere Projektlayer bilden, enthält aber keine zweite inline Hook-Definition. Keine Installation unter `~/.codex/` oder einer gemeinsamen Elternwurzel wie Documents/Codex oder allen ChatGPT-Projekten.

Der kleine lokale `.codex/gradecrew-workspace.json`-Adapter enthält nur canonical repository `HerrLoeffler/Hausaufgabe`, ausdrücklich zugelassene reale Wurzel, Rollenhinweis main_coordinator/games_coordinator/game_coordinator/implementation, Kontrollquellen-/Koordinationspfad und Bundle-Digest. Er enthält keine Aufgabenliste oder Chat-Routing-Kopie. Die fünf Rollen sind beschlossen; deren lokale Loader-/Identity-Bindung ist noch nicht aktiviert. Konkrete Aufgaben stammen weiterhin aus Registry, Übergabe und bestehenden Request-Ledgern. Mehrere mögliche Tasks auf einem Branch ergeben `task_unknown`, keine automatische Übernahme. Die Zuordnung einer Codex-session_id zu einer gespeicherten aktuellen Chat-ID ist ausdrücklich nicht gegeben; für Enforcement gilt das strengere Identitätsgate oben.

Der Dispatcher löst cwd und Adapterpfade mit realpath auf, prüft Pfadgrenzen und ignoriert fremde Wurzeln. In Git-Worktrees muss der normalisierte Remote dem vorgesehenen Repo entsprechen; Raw-URLs mit möglichen Zugangsdaten werden niemals ausgegeben. Ohne Git gelten nur die ausdrücklich gebundene Mirrorwurzel und ihre Kontrollquellen. Symlink-Ausbruch, fremdes Repo oder fehlende Bindung liefern eine sichere leere Ausgabe. Keine Ausführung aus dem untrusted Projekt zum Erzeugen von Trust.

Ein Git-Worktree ist eine eigene Discovery-/Trust-Wurzel. Main-Dateien erscheinen dort nicht automatisch auf alten Branches. Die Mirror-Zentrale wird für den ersten Pilot ausdrücklich an ihrer eigenen Wurzel gestartet. Das Laden aus beliebigen nicht-Git-Unterordnern bleibt unqualifiziert; bei fehlender Layer-Erkennung nicht globale Root-Marker ändern oder einen globalen Loader installieren. Später gegebenenfalls einen regulären lokalen GradeCrew-Repo-Projektzugang mit eigener Trust-Prüfung verwenden.

Vor Aktivierung in jeder Wurzel aktive Hook-Quellen und Hashes über die verfügbaren Hook-/Config-Inspektoren prüfen. Genau ein GradeCrew-Handler je Ereignis; vorhandene Plugin-/Managed-Regeln erhalten. Gleiche Bytes allein belegen weder Vertrauen noch tatsächliche Desktop-Ausführung. Versionswechsel brauchen erneut Tests und Prüfung der konkreten Definition, keinen Trust-Bypass.

## Datensparsame Wiederaufnahme und vorhandene Werkzeuge

Der Hook speichert keine Prompts, Antworten, Transkripte, Secrets, Schülerdaten, Diffs oder vollständigen Hand-offs. Eingabefelder `transcript_path`, `last_assistant_message` und `prompt` werden nicht für Kontextgewinnung verwendet. stdin ist auf 256KiB begrenzt; ungültige/zu große Eingabe liefert eine kurze neutrale Warnung ohne Echo.

Snapshot-Whitelist: schema_version, UTC-Zeit, Event, validierte Task-ID oder unknown, Repo-ID, lokaler HEAD, registrierte Branchkennung oder unregistered, Dirty-Zähler, erlaubter relativer Übergabepointer, beobachteter Kontrollquellen-SHA/Datum, `verification=not_inferred`, `deployment=not_inferred`, `code_backup=false`, `external_operations=not_observed_by_hook`. Keine Interpretation freier Hand-off-Texte als neue Ergebnis-/Kostennachweise. Laufende und unbekannte Paid-Vorgänge bleiben in ihren ursprünglichen Ledgern; der Pointer ist der Wiederaufnahmeansatz, nicht eine Aussage „keine Vorgänge“.

Die Mechanik von `tools/checkpoint.py` wiederverwenden, aber nicht dessen ganze CLI-Ausgabe persistieren: freie goal/done/next-Texte und Dateinamen gehören nicht in den automatischen Snapshot. Der Adapter begrenzt Git-Aufrufe und projiziert ausschließlich die Whitelist. Interner kleingeschriebener Helper-Slug darf die ursprüngliche GC-Task-ID nicht ersetzen. In der Mirrorrolle kein fremdes Worktree-HEAD als eigenes HEAD ausgeben.

Lokale Snapshots unter `.codex/gradecrew-resume/` der gebundenen Wurzel, ignoriert und nicht committed. Session-/Turn-Dateischlüssel aus validierten Identifier-Hashes, keine Pfadinterpolation. Atomare, private Dateien (0600) mit eindeutigen Eventnamen; parallele Sessions und Forks überschreiben einander nicht. Die gemeinsame sessionId darf weder eine gemeinsame Turn-Baseline noch eine automatische Wiederaufnahme eines fremden Fork-Snapshots erzeugen. Stop-Baseline bei UserPromptSubmit an den konkreten Turn binden; Wiederaufnahmekontext nur bei passendem qualifiziertem Thread-/Task-/Root-Nachweis übernehmen, sonst unknown. Maximal 2KiB pro Snapshot, 32 pro Session, 128 pro Wurzel, 14 Tage Aufbewahrung. Cleanup nur im eigenen geprüften Namespace; fehlende Schreibrechte sind eine sichtbare Best-effort-Grenze, keine Wiederholungsschleife.

`release_status.py` und Registry dienen als Struktur-/Pointerquellen. `development_status.py` ist kein schneller Hook: es kombiniert viele Git-Operationen und GitHub-Zugriff mit bis zu 20s Netztimeout. Der Hook liest höchstens einen zuvor explizit erzeugten, datierten Bericht; er startet keinen Fetch/Audit/Workflow. Den echten Live-Audit prüft der Agent außerhalb des Hooks mit vorhandenen Werkzeugen oder dem jüngsten Actions-Lauf. Ohne Netz bleibt der lokale Kontext hilfreich und eindeutig ungeprüft; das legitimiert keinen neuen bezahlten Versuch.

## Delegationshinweis und Modellentscheidung

Die Zentrale verwendet weiterhin GC-BRAIN-01 `coordination.json`, Fachübergaben und Request-Ledger. Der Hook nennt nur diese Quelle. Er schreibt keine Chatnachricht und wechselt kein Modell. Vor tatsächlichem Dispatch: Nutzerauftrag/Scope, aktive Arbeit, Task-/Request-ID, Checkout, Quell-SHA, Akzeptanzkriterien und vorhandene Budgets prüfen; das im Client verfügbare konkrete Modell mit Denktiefe und Grund speichern. Kleine Dokumentations-/Statusaufgaben benötigen keinen automatisch stärkeren Reviewer. Für substanzielle Architektur, Sicherheitsgrenzen und schwer reproduzierbare Fehler wählt die Zentrale entsprechend stärkere Analyse und unabhängige Reviews; strengere Profile bleiben maßgeblich. „Günstiger bei gleicher Qualität“ ist ein gesonderter evalgebundener Produktauftrag, keine Eigenschaft dieses Hooks.

Beschlossene Hierarchie: Hauptzentrale bündelt Projektprioritäten; Games-Zentrale koordiniert alle gemeinsamen Games-Verträge; eine Zentrale je Spiel koordiniert dessen Fachaufträge und Ergebnisse; Fach-Owner implementieren jeweils den autorisierten Task im eigenen Worktree. Keine automatische Fork-/Chat-Neuanlage und keine fortlaufende Historien-Synchronisation durch Forks. Gemeinsame Projektdateien bleiben Quelle; die bestehenden GC-BRAIN-Koordinations-/Ownerfelder später gezielt um die beschlossene Zuordnung ergänzen, keine zweite Routing-Registry. Der gelesene ältere GC-BRAIN-Remote-Stand ist nicht die neu beschlossene Rollenliste und darf diese nicht still überschreiben.

Vollständiges Briefing: Task-ID/Request-ID und Originalhistorie; zuständiger Owner-Chat, Rolle und Bereich; Basis-/Zielbranch und Quellen; erlaubte Schreibpfade sowie ausdrücklich read-only Schnittstellen; Abnahmekriterien und passende Prüfungen; gewähltes verfügbares Modell/Denktiefe mit Grund; laufende/unklare Vorgänge und Budgets; genau nächstes Ziel. Kein Prompt-Keyword kann dieses Briefing oder menschliche Freigaben ersetzen.

### Beschlossene adaptive Modell-/Aufwandswahl

Für alle Zentralen und Fachaufträge gilt die neue Nutzerleitlinie aus AGENTS/CHAT_CONTRACT, ohne pauschales Sol/high:

| Schritt | Startschema |
|---|---|
| Klare Standfrage, Zuordnung, kurzes Briefing | Verfügbares gpt-6-luna medium; nach stabilem belegtem risikoarmen Erfolg low erproben |
| Bereichsübergreifende Koordination, Abhängigkeiten, Review | gpt-6.1-sol medium |
| Schwierige Konflikte, Architektur, Sicherheit, Engine-Diagnose | gpt-6.1-sol high |
| Konkret begründetes ungelöst schwieriges Problem | Erst dann verfügbares Astra erwägen |

Zuerst Fakten/Werkzeuge prüfen; Netzwerk, Anmeldung, Limit oder fehlende Rechte sind kein Anlass für ein größeres Modell. Denkaufwand bevorzugt ändern. Kein Downgrade mitten in einer sicherheitskritischen Entscheidung. Nach stabilen vergleichbaren risikoarmen Schritten einen begrenzten niedrigeren Versuch mit gleichen Kriterien machen; bei Qualitätsverlust zurück. Höchstens zwei Modellwechsel pro zusammenhängender Teilaufgabe, keine Pingpong-Wechsel/Full-Kontext-Neustarts; Geschichte und Budgets erhalten. In der bestehenden Übergabe angefordert/beobachtet, Grund, Ergebnis, Nacharbeit und verfügbare Usage auseinanderhalten. Keine Gleichqualitäts- oder Preisbehauptung aus dem Startschema.

Technischer Weg: Die [App-Server-Dokumentation](https://learn.chatgpt.com/docs/app-server) und lokale TurnStartParams-/TurnSteerParams-Schemata unterscheiden turn/start mit model/effort von turn/steer ohne solche Overrides. Vor Wechsel verfügbares Modell/Aufwand am aktuellen Host prüfen. Bestehende laufende fremde Turns nicht abbrechen oder einen Wechsel im laufenden Modellaufruf behaupten. Die derzeitige App-Schnittstelle send_message_to_thread nimmt model/thinking für eine Folgebeauftragung; sicherer qualifizierter Weg hier: vorhandenen ruhenden Fachchat wählen, denselben Task/Scope erhalten, neue Turn-Grenze benutzen und danach tatsächlichen Runtime-Kontext prüfen. Neue Defaults können für spätere Turns bestehen bleiben; bei deren Auftrag erneut bewusst wählen, nicht blind den letzten niedrigen Aufwand übernehmen.

GradeCrew Central0.4.0 bietet derzeit keinen eigenen Modell-Umschaltendpoint. Seine vorhandenen Reads bleiben die Quellen; die tatsächliche Folgebeauftragung verwendet die App-Schnittstelle. Hooks können an dieses Briefing/Startschema erinnern oder Werkzeuge begrenzen, niemals selbst Modelle wechseln, neuen Turn erzeugen oder die laufende Anfrage umkonfigurieren. Der bestehende Produkt-AI-Router GC-AI-ROUTING-02 bleibt vollständig außerhalb dieses Auftrags.

**Einziger autorisierter Lesetest:** bestehender Fachchat GradeCrew-Plugins recherchieren, Thread01a10e37-4955-7db3-957f-d397b9dd8dc4, vor Start read-only als idle geprüft. Voriger abgeschlossener Turn01a1256c-6201-79f0-a439-b27c3a61db32: Runtime gpt-6-luna/medium. Angeforderter neuer Turn über send_message_to_thread: gpt-6-luna/low. Neuer Turn01a12570-4161-7610-8c7e-b4ff43c081d5 am10.10.2026 10:51UTC completed, 3.307s; Runtime-turn_context bestätigt gpt-6-luna/low. Vier Kriterien erfüllt: reine Standfrage ohne Codeauftrag, Login403 zuerst Ursache/Rechte, keine Sicherheitsentscheidung mitten im Turn herabstufen, Grenze zwischen Turnstart und Hookautomatik. Keine Toolmarker, Dateiänderungen, neuen Chats/Forks oder Abbrüche in diesem Probe-Turn. Modellfamilie unverändert, genau eine Aufwandänderung; keine Wechsel-/Budgethistorie zurückgesetzt.

Nur Modell-/Turn-/Usage-Metadaten wurden außerhalb der Hooks gelesen; kein Transkript in den Entwurf kopiert. Letzter Request laut Runtime:160256Input, davon3840cached, 163Output, davon60Reasoning, total160419Tokens. Das ist kein Rechnungs-/Preisbeleg; der lange vorhandene Kontext verhindert eine pauschale Sparbehauptung. Der kurze Kriteriencheck ist kein vollständiger Qualitätsvergleich und keine Sicherheits-/Hookabnahme. Kein zusätzlicher Paid-/Guardian-Provideraufruf oder Retry. Der aktuelle komplexe Hook-Entwurf bleibt beim beauftragten Sol/high; kein Downgrade seines laufenden Turns.

## Wiederverwendung von GradeCrew Central und Rollen-Skills

GradeCrew Central 0.4.0 geprüft: lokales Manifest, vollständige Paketliste, MCP-Tooldefinitionen und project-reader gelesen; keine SKILL.md im Paket. `gradecrew_project_status` erfolgreich mit GitHub-main `59dd0a5` und explizit dokumentiertem Release-Stand. Das ist ein echter Plugin-Read, kein Live-Deploy-/Hook-/Skillnachweis. Der vorhandene Projektleser bindet Status/Registry/Übergabe an einen Main-SHA; kein zweiter Koordinator, MCP-Server oder Aufgabenbestand nötig.

Die separate Übergabe `analysis/GC-HOOKS-01-SKILLS/HANDOFF.md` in der bekannten GradeCrew-Mirrorwurzel wurde gelesen: ursprünglicher SHA256 `a5ff9038fc11aeff4c5505bb2fd3f065de1e8fa4ea370ef72690aaa47f2e2e5d`; nach der ergänzten Modellvorgabe erneut gelesen, SHA256 `e1ae6a46810c0ee8342ab6c4dccc1b34e4038cd96b8ff5858eda5c74ccd16d9d`. Sie ist lokal gesichert, keine bereits integrierte Repo-/Skilldatei. Ihr konkreter Rollenentwurf wird hier berücksichtigt:

| Vorgeschlagener Skill | Hook-Anschluss | Grenze |
|---|---|---|
| gradecrew-coordinate | SessionStart/Prompt liefert Regeln und ausdrückliche Rolle; Zentrale erstellt Briefing und holt Nachweise über vorhandene Reads | Gilt für alle drei Zentralenebenen; keine eigene Shell-/Datei-/Build-/Test-/Deploy-Ausführung. Skilltext ist kein technisches Gate. |
| gradecrew-implement-task | Fachchat erhält eindeutige Task, Scope und Übergabe; Hook verwechselt ihn nicht mit einer Zentrale | Eigener autorisierter Worktree, bestehende Fach-Skills und Prüfungen; kein zweiter Auftrag aus Fork-Historie. |
| gradecrew-acceptance-review | Prüfer bekommt denselben unveränderlichen Kandidaten und Kriterien | Unabhängiger Fach-Prüfauftrag, keine Reparatur/Merge/Veröffentlichung ableiten; ein Zentralenchat bleibt auch bei Ergebnisbewertung koordinierend. |

Diese drei Skills sind Entwürfe, nicht installiert oder verhaltensgetestet. Alle drei übernehmen die gemeinsame adaptive Auswahlregel: coordinate wählt pro Briefing, implement-task bindet den tatsächlichen Teilschritt, acceptance-review dokumentiert angefordert/beobachtet und gleiche Kriterien. Ein versionierter Repo-Pilot unter `.agents/skills/` und spätere Paketierung im bestehenden Plugin sollen dieselben Quellen verwenden. Das installierte 0.4.0-Paket wird nicht still bearbeitet. Skills-Inventar/Autoring und Hook-Konfiguration/Verhaltenstests bleiben getrennte Eigentümer; dieser Dokumentationsauftrag erzeugt keine Skilldateien.

Konkrete Read-Allowlist-Kandidaten: `mcp__gradecrew_central__gradecrew_project_status`, `gradecrew_workstreams`, `gradecrew_handoff`, `gradecrew_task`, `gradecrew_staging_release` mit demselben Serverpräfix. Annotationen allein reichen nicht; die gelesene Implementierung der Status-/Registry-/Übergabe-Reads stimmt mit den Beschreibungen überein. `gradecrew_question`/`gradecrew_answer` schreiben Fragen-/Antwortzustand, Verbindungswerkzeuge ändern Login-/Connection-Zustand: nicht pauschal erlauben, weil der Pluginname „Central“ heißt. Private Staging-Reads bleiben an bestätigte Anmeldung/Rollen gebunden und werden niemals aus dem Hook zur Kontextsammlung gestartet.

Die Zentralen lesen Plugin-/GitHub-Status außerhalb der kurzen Offline-Hooks. Regel-/Skill-/Hook-Dokumentation sichern autorisierte Fach-Chats; die allgemeine CHAT_CONTRACT-Pflicht ist keine Umgehung der Zentralengrenze. Gemeinsame Games-Verträge verlinken bestehende Lern-/API-/Asset-/Engine-/Touch-/Save-/Solo-/Multiplayer-/QA-Quellen bedingt je Auftrag. PR153 ist noch offen und wird nicht als bereits integrierter Produktionsvertrag ausgegeben; Assetqualität und fehlende Geräte-/Nutzerabnahme bleiben sichtbar. Kein zusätzlicher pauschaler Games-Skill oder Chatanzahl pro Spiel.

## Verifikation vor einer späteren Installation

Testfälle für synthetische Git-Repos/Mirror-Files, keine realen Daten: alle sechs Ereignisse; vier SessionStart-Quellen; JSON-only Stop/Interrupt; stop_hook_active; Frage mit unveränderter/anfangs schmutziger Baseline; fehlende/mehrdeutige Task-Zuordnung; fremdes Repo; realpath/Symlink-Ausbruch; Unterordner eines Worktrees; Pfade mit Leerzeichen; invalides stdin; übergroße Inputs; fehlende Tools/Schreibrechte; Git-Timeout; bewusst unerreichbares Netz; parallele Sessions/Forks mit gleicher sessionId; Retention; veralteter STATE-/Audit-Stand. Spy-Tests belegen null Netzwerk, Provider, Dispatch, Commit, Merge und Deploy.

PreToolUse-Matrix: verifiziertes konkretes Zentralen-Event für JEDEN der fünf Threads verweigert Shell/Edit/Deploy und lässt die genau erlaubten Read-/Koordinations-APIs durch; Fach-Event mit eigener Wurzel läuft; Fach-Fork mit gleicher sessionId wird nicht als Zentrale erkannt; Same-directory-Fork/mehrdeutiger Rollenmarker bleibt unqualifiziert; keine neue Chats/Forks entstehen. Toolnamen/Aliase, nested Code-mode, bestehendes write_stdin, fehlende Identity und Hook-Timeout getrennt dokumentieren. Echte Pilotaufrufe erfolgen aus synthetischen Testrollen und durch den Fachchat, nicht als Shelltest im echten Zentralenchat. Ein „denied“-JSON allein beweist nicht, dass die Runtime ein Tool wirklich verhindert hat.

Gesondert prüfen: Snapshot enthält ausschließlich Whitelist, UTF-8-Limits, Codesicherung nicht behauptet, Budget/Versuche/Provider-Ergebnisse unverändert. Sentinel-Prompt, Antwort-, Schlüssel- und Schülertexte dürfen in stdout, stderr oder Dateien nicht erscheinen. Frische App-Server-Handler-Schemafelder mit der tatsächlich verwendeten CLI vergleichen; Hook-stdin/stdout gegen aktuelle Eventdokumentation und echten lokalen Pilot qualifizieren. App-Server-Schema allein ist kein stdin-Verhaltenstest.

Geeignete spätere Befehle nach implementiertem Kandidaten: `python3 -m unittest discover -s tools/codex_hooks -p 'test_*.py' -v`, `python3 -m json.tool tools/codex_hooks/hooks.template.json`, vorhandene Development-/Handoff-Checks. Erst nach grünem isoliertem Kandidaten ein echter local-only Pilot in genau einer freigegebenen Wurzel, anschließend Mirror-Zentrale und ein Games-Worktree; fremdes Projekt als Negativfall. Interrupt-Pilot belegt nur echten Nutzerinterrupt, keinen unvorhersehbaren Crash. Production-/Geräte-/Games-Qualitätsabnahme folgt daraus nicht.

## Aktivierung und genau nächster Schritt

Dieser Auftrag liefert ausschließlich Entwurf und Folgebriefing. Nächster Schritt: Zentrale legt den geschriebenen Entwurf Martin zur Prüfung vor. Nach Entwurfsfreigabe einen separaten Implementierungsplan erstellen und dessen Ausführungsmethode festlegen. Danach isolierter Codekandidat, angemessene unabhängige Prüfung und CI; keine Installation als Nebenwirkung der Tests.

Erst im ausdrücklich freigegebenen lokalen Aktivierungsschritt Bundlepfad, Rootadapter und `.codex/`-Definitionen herstellen; Projekt und genaue Definition regulär prüfen/vertraut bestätigen. Verfügbare Oberfläche bzw. CLI `/hooks` verwenden, niemals Trustdateien automatisiert ändern oder `--dangerously-bypass-hook-trust` benutzen. Das aktuelle Sandboxprofil erlaubt dem Fachchat keine Schreibänderung in der Mirrorwurzel; diese lokale Installation erfordert den passenden späteren Zugriff. Aktivierungsbeleg nennt Host/Clientversion, Wurzel, Bundle-/Hookhashes, tatsächlich empfangene Ereignisse, konkrete Thread-/Rollenidentitätsquelle, abgedeckte und nicht abgedeckte Tools, Limits, Datenschutz-/Offline-/Fork-Negativtests und Rückbau. Ohne qualifizierte Identity-/Coverage-Bindung keine Aussage „Zentralen-Ausführung technisch gesperrt“.

Rückbau: die konkreten GradeCrew-Hooks über den Hook-Inspektor deaktivieren bzw. ihre ausdrücklich angelegten lokalen Definitionen entfernen; fremde Konfiguration erhalten. Snapshots nur im eigenen Namespace entfernen. Kein globales Abschalten aller anderen Hooks. Der bisherige Repo-Einstieg bleibt der Fallback.
