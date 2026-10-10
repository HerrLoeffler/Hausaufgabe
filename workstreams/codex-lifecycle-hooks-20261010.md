# GC-HOOKS-01 — Lifecycle-Hooks / feste Zentralenrolle

- Aktualisiert (UTC): 2026-10-10 10:23 UTC; spätere Commit-/CI-Belege im PR.
- Verantwortlicher Fachchat: GC · Automatisierung & Integration, `01a1089e-bbae-74c2-9a6a-6ce71fb3dba7`.
- Auftraggeber/Zentrale: `01a10df6-736b-7a62-bd38-2724cf254c2e`; Nutzerauftrag und zwei Scope-Ergänzungen aus diesem Chat. Kein Security-Übernahmeauftrag.
- Zustand: Entwurf aktiv; Release-Stufe `branch_only`, keine lokale Hook-Installation.
- Aufgabenbranch: `docs/gc-hooks-01-design-20261010`; Basis `59dd0a501a28c04c36ee877450239bf1d64a3187`; Integrationsziel `main`.
- PR: wird nach dem gesicherten Dokumentationscommit angelegt; tatsächliche Nummer nicht erfinden.
- Betroffene Dateien: AGENTS.md, docs/CHAT_CONTRACT.md, TODO.md, GRADECREW_STATE.json, workstreams/registry.json, diese Übergabe; anschließend geschriebener Hook-Entwurf.

## Beschlossene Regel und Zuständigkeit

Martin hat ausschließlich für den bestehenden Hauptzentralen-Thread verbindlich angeordnet: keine eigene Befehls-/Codeausführung, sondern Koordination. AGENTS.md und CHAT_CONTRACT.md dokumentieren dies. Die Zentrale verwendet koordinierende Status-/Chat-APIs, priorisiert, erstellt Briefings, wählt Modelle pro Schwierigkeit, beauftragt Fach-Chats und prüft deren Ergebnisse. Sie führt keine Shell-/Terminalbefehle aus, bearbeitet keine Code-/Projektdateien und startet keine Builds, Tests, Integration oder Deployments. Fehlende Zuständigkeit organisieren, nicht selbst einspringen. Fach-Umsetzung bleibt erlaubt; Production, sichere Worktrees, Budget/Versuche und Recovery-Gates unverändert.

Automatisierungs-Fachchat besitzt Hook-Konfiguration, Integration und Verhaltenstests. GradeCrew-Plugins recherchieren erhält separat read-only Skill-Inventar/Entwurf, ohne dieselben Konfigurations-/Regeldateien zu bearbeiten. Diese Übergabe beauftragt oder informiert keinen weiteren Chat.

Vorgeschlagen, nicht beschlossen/eingerichtet: Hauptzentrale → Games-Bereichszentrale → spielbezogene Umsetzung. Design muss die drei Rollen unterscheiden. Forks sind kopierte Historie, kein fortlaufender Sync; gemeinsame Projektdateien bleiben Quelle. Ein Briefing nennt Task-ID, Owner/Bereich, Quellen, erlaubte Pfade, Schnittstellen, Abnahme und nächstes Ziel. Keine neue Zentrale/Chats allein wegen dieses Vorschlags erzeugen.

## Bereits geprüft

GitHub-Connector erreichbar. Aktueller main `59dd0a501a28c04c36ee877450239bf1d64a3187`, vollständiger Main-Tree ohne .codex-Hooks, alle 238 Remote-Branchnamen und 36 offenen PRs geprüft. Keine Hook-Doppelarbeit entdeckt; kein vollständiger Inhaltsscan aller historischen Branches. Development Status38029190041 auf demselben SHA success, Bericht21aktive/12Parallelüberschneidungen/12veraltete kritischeBranches. Bestehende Kontrolltools und GC-BRAIN-01-Koordination gelesen. Lokale Nutzerkonfiguration ohne inlineHooks, ausgewählte Projektwurzeln ohne .codex; Plugin-/Managed-Inventar noch nicht vollständig. CLI0.162.0-alpha.2 und lokal generierte App-Server-Schemata ermittelt. Kein Hook-Eventpilot durchgeführt.

## Weiterhin offen

SessionStart/Prompt/PreCompact/Interrupt/Stop-Entwurf um PreToolUse erweitern. Exakte Zentralenidentität muss aus vertrauenswürdiger Bindung plus tatsächlicher Sitzung erkannt werden; Hook-session_id nicht blind mit Chat-ID gleichsetzen. Toolabdeckung und nicht abgedeckte Wege dokumentieren; keine vollständige Sicherheitsgrenze behaupten. Installation und konkrete Trust-Bestätigung getrennt freigeben. Aktuelles Sandboxprofil erlaubt dem Fachchat nicht, die Mirrorwurzel zu ändern.

## Wiederaufnahme / Nachweise

Keine Provider-, Queue-, Guardian-, Budget-, Build-, Merge-, Deployment- oder Trust-Aktion. Nur read-only Connector-/Dokumentations-/lokale Diagnoseschritte; generierte Schemas sind keine Hook-Installation. Lokaler Dokumentations-Arbeitsstand unter outputs/gc-hooks-01 dieser Fachchat-Wurzel, alte Security-/GC08-Checkouts unverändert. Alte Security-Task/PR146/PR148/Versuche nicht zurückgesetzt oder neu gestartet. Keine Laufzeit-, Geräte- oder Produktabnahme behauptet.

Nächster Schritt: geschriebenes Hook-Design mit PreToolUse und Rollenhierarchie vervollständigen, im selben Branch sichern und der Zentrale für Martins Prüfung bereitstellen. Fachchat installiert nichts aus dieser Entwurfsphase.
