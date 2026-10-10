# GC-HOOKS-01 — Lifecycle-Hooks / feste Zentralenrolle

- Aktualisiert (UTC): 2026-10-10 10:42 UTC; abschließende Commit-/CI-Belege im PR.
- Verantwortlicher Fachchat: GC · Automatisierung & Integration, `01a1089e-bbae-74c2-9a6a-6ce71fb3dba7`.
- Auftraggeber/Zentrale: `01a10df6-736b-7a62-bd38-2724cf254c2e`; Nutzerauftrag und ergänzende Rollen-/Fork-/Hierarchievorgaben aus diesem Chat. Kein Security-Übernahmeauftrag.
- Zustand: Entwurf aktiv; Release-Stufe `branch_only`, keine lokale Hook-Installation.
- Aufgabenbranch: `docs/gc-hooks-01-design-20261010`; Basis `59dd0a501a28c04c36ee877450239bf1d64a3187`; Integrationsziel `main`.
- PR: [Draft184](https://github.com/HerrLoeffler/Hausaufgabe/pull/184); erster Rollen-/Koordinationscheckpoint `be615a8f22db1dfc13e6a7a97faa04ae78b376cf`.
- Betroffene Dateien: AGENTS.md, docs/CHAT_CONTRACT.md, TODO.md, GRADECREW_STATE.json, workstreams/registry.json, diese Übergabe und [geschriebener Entwurf](../docs/superpowers/specs/2026-10-10-gradecrew-lifecycle-hooks-design.md).

## Beschlossene Regel und Zuständigkeit

Martin hat die anfangs für die Hauptzentrale festgehaltene Regel anschließend ausdrücklich auf ALLE Zentralen erweitert: keine eigene Befehls-/Codeausführung, sondern Koordination. Hierarchie verbindlich: Hauptzentrale → gemeinsame Games-Zentrale → Zentrale je Spiel → ausführende Fach-Chats. Die vorhandenen Chats wurden durch die Hauptzentrale konkret zugeordnet und beauftragt:

| Rolle | Bestehender Chat | Thread-ID |
|---|---|---|
| Hauptzentrale | GradeCrew Zentrale | `01a10df6-736b-7a62-bd38-2724cf254c2e` |
| Gemeinsame Games-Zentrale | GC · Games-Zentrale | `01a11864-3ec7-7091-acc0-9ff292f530f3` |
| Spielzentrale Pizza | Pizza Spiel Zentrale | `01a111e6-c211-76a2-928e-8ed88a7b7bec` |
| Spielzentrale Lerninsel | GC · Lerninsel-Zentrale | `01a1183f-dad9-7640-8a82-23107c980d6e` |
| Spielzentrale Escape-Expedition | GC · Escape-Expedition-Zentrale | `01a11681-00e3-79d1-8f27-c48267b86c0d` |

AGENTS.md und CHAT_CONTRACT.md dokumentieren alle fünf IDs und Rollen. Zentralen verwenden koordinierende Status-/Recherche-/Chat-APIs, priorisieren, erstellen vollständige Briefings, wählen Modelle pro Schwierigkeit, beauftragen Fach-Chats und prüfen Ergebnisse. Keine Shell-/Terminalbefehle, Code-/Projektdateiänderungen, Tests, Builds, Integration oder Deployments durch Zentralen. Auch Pflichtdokumentation sichern beauftragte Fach-Chats. Fehlende Zuständigkeit organisieren, nicht selbst einspringen. Fach-Umsetzung bleibt erlaubt; Production, sichere Worktrees, Budget/Versuche und Recovery-Gates unverändert. Historische Umsetzung bleibt historische Evidenz, keine heutige Ausführungsbefugnis.

Automatisierungs-Fachchat besitzt Hook-Konfiguration, Integration und Verhaltenstests. GradeCrew-Plugins recherchieren erhält separat read-only Skill-Inventar/Entwurf, ohne dieselben Konfigurations-/Regeldateien zu bearbeiten. Diese Übergabe beauftragt oder informiert keinen weiteren Chat.

Der frühe Vorschlag ist durch die spätere Nutzerentscheidung überholt; die Hierarchie und fünf Zentralen sind beschlossen. Dieser Fachchat hat keine neuen/geforkten Chats erzeugt. Forks sind kopierte Historie, kein fortlaufender Sync; gemeinsame Projektdateien bleiben Quelle. Ein Briefing nennt Task-/Request-ID, Owner/Bereich/Rolle, Quellen, erlaubte Pfade, Schnittstellen, Abnahme, Modell/Denktiefe/Grund, vorhandene Budgets und nächstes Ziel. Keine neue Task-ID oder Budgetreservierung je Hierarchieebene.

## Bereits geprüft

GitHub-Connector erreichbar. Aktueller main `59dd0a501a28c04c36ee877450239bf1d64a3187`, vollständiger Main-Tree ohne .codex-Hooks, alle 238 Remote-Branchnamen und 36 offenen PRs geprüft. Keine Hook-Doppelarbeit entdeckt; kein vollständiger Inhaltsscan aller historischen Branches. Development Status38029190041 auf demselben SHA success, Bericht21aktive/12Parallelüberschneidungen/12veraltete kritischeBranches. Bestehende Kontrolltools und GC-BRAIN-01-Koordination gelesen. Lokale Nutzerkonfiguration ohne inlineHooks, ausgewählte Projektwurzeln ohne .codex; Plugin-/Managed-Inventar noch nicht vollständig. CLI0.162.0-alpha.2 und lokal generierte App-Server-Schemata ermittelt. Kein Hook-Eventpilot durchgeführt.

## Geschriebener Entwurf / echte Grenzen

SessionStart, UserPromptSubmit, PreToolUse, PreCompact, Interrupt und Stop sind konkret beschrieben: Verhalten, Ausgabeformat, Byte-/Zeitlimits, Rootadapter, Daten-Whitelist, Fork-Sicherheit, erlaubte/verbotene Werkzeugfamilien und Aktivierungsgates. Keine aktive .codex-Datei angelegt. Vollständige Statusberichte werden nicht pro Nachricht erzeugt; Agenten lesen frische Remote-Nachweise außerhalb des Hooks.

Wichtiger offener Anschluss: Normale Forks teilen die Root-sessionId; Hook-Common-Input belegt nicht den aktuellen thread.id. Identität allein aus session_id, Titel, cwd oder kopierten Instruktionen ist ungeeignet. Ein vertrauenswürdiger aktueller Thread-/Rollenadapter ist vor Zentralen-Enforcement zu qualifizieren, für jede der fünf konkreten Zentralen und Fach-Forks mit derselben sessionId. Bei fehlender Zuordnung höchstens ein Hinweis, keine versehentliche Sperre aller Fach-Forks. Noch keine solche Runtime-Zuordnung belegt; nur Policy-/Designvertrag. Tool-Hooks erfassen nicht jeden Pfad, insbesondere Hosted-Tools/alte Exec-Transporte sind Grenzen. Keine komplette Sicherheitsgrenze behaupten.

Installation und konkrete Trust-Bestätigung bleiben separat. Aktuelles Sandboxprofil erlaubt dem Fachchat nicht, die Mirrorwurzel zu ändern; kein Zugriff dort angefordert, weil noch kein Installationsauftrag vorliegt. CLI-Schemadiagnostik hat keine Hookdefinition ausgeführt oder vertraut.

## Kopierbares Folgebriefing nach Entwurfsfreigabe

**Task:** GC-HOOKS-01, ursprüngliche Historie/PR184 erhalten; keine neue Hook-Task-ID oder Versuchs-/Budgetinitialisierung. **Owner:** GC · Automatisierung & Integration, Thread01a1089e-bbae-74c2-9a6a-6ce71fb3dba7, Bereich Qualität/Betrieb, Rolle Fach-Umsetzung. Alle fünf Zentralen koordinieren ausschließlich und führen keine unterstützenden Shell-/Dateikommandos aus. Plugin-Fachchat hat sein separates read-only Skill-Inventar fertiggestellt und verändert keine gemeinsamen Konfigurations-/Regeldateien.

**Quellen:** aktuelles main START_HERE/AGENTS/CHAT_CONTRACT/CHAT_RECOVERY/STATE/TODO/Registry; PR184-Entwurf; frischer Development Status; GC-BRAIN-01-Koordination auf prototype/gradecrew-control-local-v1; aktuelle offizielle Hooks-/App-Server-Dokumentation. Vor Start PR-/Branch-Doppelarbeit und alle Root-/Trust-Bindungen erneut prüfen.

**Skill-Abgleich:** Fertiges lokales Inventar analysis/GC-HOOKS-01-SKILLS/HANDOFF.md in der bekannten Mirrorwurzel gelesen, SHA256 a5ff9038fc11aeff4c5505bb2fd3f065de1e8fa4ea370ef72690aaa47f2e2e5d. GradeCrew Central0.4.0 Manifest/Paket/Projektleser/MCP-Definitionen geprüft, keine SKILL.md. Echter gradecrew_project_status-Read liefert Main59dd0a5. Wiederverwenden: bestehende öffentliche Status-/Workstream-/Handoff-/Task-/Release-Reads; schreibende Question/Answer- und Verbindungsaktionen nicht pauschal freigeben. Drei schlanke Entwürfe gradecrew-coordinate, gradecrew-implement-task und gradecrew-acceptance-review an die Hook-Rollen anknüpfen, bedingte Games-Verträge verlinken. Keine neuen Skilldateien, kein installiertes Plugin verändert, kein neuer Service/Statusspeicher. Ausführliche Zuordnung im geschriebenen Entwurf.

**Nächste Phase:** Zuerst den geschriebenen Entwurf prüfen lassen; danach Implementierungsplan und Ausführungsmethode abstimmen. Im späteren Plan die Identitätsqualifikation ausdrücklich vor die Zentralensperre setzen. Falls der Host keinen zuverlässigen aktuellen Threadkontext liefert, Gate als blockiert belassen und ausschließlich freigegebene Hinweise/Snapshots implementieren; eine zusätzliche Identitätsbrücke braucht ihren konkreten geprüften Anschluss. Nie session_id=thread_id annehmen.

**Vorgesehene Schreibpfade der späteren Umsetzung:** tools/codex_hooks/lifecycle.py, hooks.template.json, test_*.py und README.md; notwendiger Anschluss an bestehende Handoff-CI; gezielte GC-HOOKS-01-Einträge in TODO/STATE/Registry/Übergabe. CI-Anschluss muss erneut auf parallele Arbeit geprüft werden. Keine echten .codex-Loader oder Bundlekopien als Nebenwirkung von Tests. Rootadapter/aktive .codex/hooks.json/Config nur im separat autorisierten lokalen Aktivierungsschritt. Guardian-Controller, Quell-/Provider-/Budgetledger, Web-/Games-Code, Security-Rules und Deployskripte sind read-only Schnittstellen.

**Modellwahl:** Zentrale wählt das auf dem Host tatsächlich verfügbare Modell pro Schritt und dokumentiert Denktiefe/Grund; kein Wechsel aus dem Hook. Aktueller Entwurfsauftrag wurde mit gpt-6.1-sol/high beauftragt. Für die spätere Identity-/Toolboundary-Prüfung angemessen unabhängige stärkere Analyse gemäß bestehender Reviewpolicy; keine Provider-/kostenpflichtigen Reviews automatisch starten. Eine konkrete spätere Modellbeauftragung ist noch nicht erfolgt.

**Abnahme:** synthetische Wireformat-/Datenschutz-/Offline-/Zeitlimit-/Fork-/Scope-Tests grün; dieselbe sessionId darf keinen Fach-Fork sperren oder fremde Snapshots übernehmen; pure Fragen lösen keine Arbeits-/Weiterlaufkette aus. Verifiziertes konkretes Zentralen-Event verweigert Ausführung/Edit und erlaubt geprüfte Koordinations-/Read-APIs. Nicht abgedeckte Tools/Runtimefehler ausdrücklich ausweisen. Echte Hook-/Trust-/Root-/Client-Nachweise separat; Tests sind kein Installations- oder Produktionsnachweis. Geeignete Befehle erst nach Codekandidat: python3 -m unittest discover -s tools/codex_hooks -p 'test_*.py' -v und python3 -m json.tool tools/codex_hooks/hooks.template.json; danach bestehende Koordinations-CI.

**Genau nächstes Ziel:** Schriftlichen Entwurf samt fünf beschlossenen Rollen, Skill-Anschluss und Identity-/Coverage-Grenze zur Entscheidung bereitstellen; noch keine Installation, weiteren Chats, Provideraufrufe oder Deployments.

## Wiederaufnahme / Nachweise

Begrenzte Dokumentationsprüfung lokal erfolgreich: STATE/Registry parsebar; ihre bisherigen Einträge und sämtliche Release-/Production-Angaben semantisch unverändert; ursprünglicher TODO-Inhalt unverändert vor neuem Task-Eintrag; fünf IDs in AGENTS, CHAT_CONTRACT, Entwurf und Übergabe vollständig; identischer Rollenvertrag in beiden Regeldateien. Keine aktive .codex-Konfiguration Bestandteil des Diffs. Schemadiagnostik mit tatsächlich vorhandenem CLI erfolgreich: normalisierter Command-Handler und Hook-Notification threadId/turnId, jedoch keine qualifizierte Bindung an Command-Hook-stdin. Keine Hook-Verhaltenstests oder echte Eventausführung in dieser Dokumentationsphase. Nach Push die vorhandenen Dokuchecks desselben PRs auswerten, nicht zusätzlich dispatchen.

Überschneidungen: PR126 berührt TODO/STATE/Registry, PR153 AGENTS/TODO/Registry. Hier wurden deren vorhandene Main-Inhalte erhalten; vor einer späteren Integration Main und gemeinsame Dateien frisch abgleichen. Keine Übernahme ihrer Umsetzung oder offenen Gates.

Keine Provider-, Queue-, Guardian-, Budget-, Build-, Merge-, Deployment- oder Trust-Aktion. Nur read-only Connector-/Dokumentations-/lokale Diagnoseschritte; generierte Schemas sind keine Hook-Installation. Lokaler Dokumentations-Arbeitsstand unter outputs/gc-hooks-01 dieser Fachchat-Wurzel, alte Security-/GC08-Checkouts unverändert. Alte Security-Task/PR146/PR148/Versuche nicht zurückgesetzt oder neu gestartet. Keine Laufzeit-, Geräte- oder Produktabnahme behauptet.

Entwurf einschließlich Scope-Ergänzungen fertig geschrieben; anschließender Dokumentationscommit und dessen CI werden im PR mit exakten IDs gesichert. Vor Wiederholung dort aktuelle Head-/Run-Ergebnisse prüfen. Fachchat installiert nichts aus dieser Entwurfsphase.

Nächster Schritt: Zentrale legt Martin den geschriebenen Entwurf aus PR184 mit offener Thread-/Fork-Identitätsqualifikation zur Prüfung vor.
