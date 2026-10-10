# GC-HOOKS-01-SKILLS: gezielte lokale Einrichtung

Datum: 10.10.2026 · Owner: bestehender Plugins-Fachchat „GradeCrew-Plugins recherchieren“, eigener Thread-Link nicht geprüft. Auftrag über GradeCrew Zentrale `01a10df6-736b-7a62-bd38-2724cf254c2e`; ausdrücklich autorisierte Einrichtung nach „Dann machen wir das“. Shared-Integrationowner `01a1089e-bbae-74c2-9a6a-6ce71fb3dba7` behält START/AGENTS/CHAT_CONTRACT/TODO/STATE/Registry.

## Tatsächlicher Zwischenstand

- Eigener sauberer sparse Checkout: `analysis/GC-HOOKS-01-SKILLS/setup-20261010/repo`, Branch `docs/gc-hooks-skills-setup-20261010`, Basis main@`cacf2337c002da285ebbc65ea7aef1d395fcb44a`. Kein Reset/Forcepush/fremder Worktreewechsel.
- Sechs standalone User-Skills auf Martins Darwin/arm64-Host installiert: firebase-auth-basics, firebase-firestore, firebase-hosting-basics, firebase-security-rules-auditor, firestore-rules-creation, frontend-design. Tatsächliche Pfade, Quellenpins und alle28 installierten Quelldatei-Hashes in `docs/skills/installation-20261010.json`; alle28 bytegleich zur fixierten Quelle.
- Quellen: Firebase `b5735e5baa0d874cb97a23e26ebe93e4501797b9`, Anthropic `dbd4588f9e1033efb41dad4bef2f7947c8993d44`. Vollständige sechs SKILL.md-Inhalte gelesen. Keine Upstream-Anweisungen verändert. Dynamische CLI-/Provisionierungs-/Deploybeispiele, großflächige Rules-Ratschläge und GradeCrew-Rollengrenzen ausdrücklich in der Zuordnung eingeordnet.
- System-Skills skill-installer, OpenAI Docs, Plugin Management, writing-skills und dessen TDD-Hintergrund tatsächlich gelesen. Hier bestehende Vendor-Skills installiert und Rollen-Zuordnung dokumentiert; kein neuer Rollen-Skill authored, keine zwei konkurrierenden Coordinatorpakete.
- GradeCrew Central 0.4.0 bleibt aktiviert; tatsächlicher Projektstatus-Read erfolgreich. Gefundener vollständiger Firebase-Plugin ist nicht installiert; es wurde kein zusätzlicher MCP-/Firebasekontozugriff eingerichtet. Vorhandene Superpowers/Codex-Security/Figma/img2threejs wiederverwendet.
- [Verbindliche Fachrollen-Zuordnung](../docs/skills/GRADECREW_EXECUTION_SKILLS.md): Facharbeit lädt die zum konkreten Anlass passenden Skills; Zentralen koordinieren ausschließlich. Aktuelle main-Regel gilt unabhängig vom Skill. Integration dieses neuen Einstiegspfads über den Sharedowner noch offen.

Dokumentationsstufe zunächst branch_only; lokale Installation ist separat tatsächlich erfolgt und wird nicht erst durch PR-Merge auf andere Hosts verteilt. Kein Produkt-/Releasezustand verändert. Bisherige Taskfamilie GC-HOOKS-01 fortgeführt; keine neue Budgetreservierung oder zurückgesetzte Versuchshistorie.

## Tatsächlich ausgeführte geringe Prüfung

1. Aktuelle main-Einstiegs-/Rollen-/Assurance-Regeln, TODO/State/Registry und bestehende PR142/153/184 gelesen. Keine konkurrierende Skillsetup-Implementierung gefunden. Keine pauschale neue Prüfung von Security/Privacy-Facharbeit.
2. Quellen im isolierten Setupbereich heruntergeladen, nur ausgewählte Ordner mit dem vorhandenen Installer und expliziten Commitpins nach `/Users/martin/.codex/skills` installiert. Alle28 Dateien mit Quellen-SHA256 verglichen: identisch.
3. `codex-cli 0.162.0-alpha.2`, App-Server initialize + skills/list(forceReload) ohne thread/start/turn/start: alle sechs neuen Skills plus vorhandenes img2threejs `enabled=true`, `scope=user`, errors=[] im tatsächlichen Projekt-cwd. Beleg gespeichert. Keine Settings-/Truständerung. Der erste sandboxed Start endete vor initialize; der bereits autorisierte lokale Discovery-Read außerhalb der Sandbox gelang. Kein paid Modell-/Firebaseaufruf durch diesen Read.
4. Vorhandener quick_validate.py konnte wegen fehlendem PyYAML im gewählten Python nicht laufen. Keine Paketinstallation nur für diesen Hilfsvalidator vorgenommen. Tatsächlicher Codex-Skillparser meldet keine Discovery-Fehler; dies plus Dateiintegrität ist belegt, nicht ein erfolgreicher quick_validate-Lauf.
5. Autorisierte unabhängige Codex-Offlineprobe `skills_offline_probe`, angefordert Sol/medium, tatsächliches Runtime-Modell nicht separat beobachtet: installierter Rules-Auditor las fiktive Profile-Rules und identifizierte fehlende Update-Ownership (2/5 nach Upstream-Skala); frontend-design erstellte Plan/Briefabgleich und native statische Testkarte mit unveränderten Tokens; hypothetische Zentralen-Standfrage blieb bei API-Belegbedarf. [Originalbericht](../docs/skills/evidence/offline-probe.md), [isoliertes HTML-Beispiel](../docs/skills/evidence/test-card.html).
6. Probe enthält keine Cloud-/Emulator-/Browser-/Render-/Geräteprüfung; keine Produkt-Security/Grafikfreigabe. Autorisierte Fixture und normale Codex-Arbeit, keine externen paid APIs/Kundeninhalte/Providerkeys. Angefordert vs beobachtet im Manifest getrennt.
7. Development Status Run38065393323 / Job114251874080 gelesen, success; Warnungen über119 unklassifizierte Branches, offene unzugeordnete PRs inkl. PR184/142 und andere Zielabweichungen bleiben separate Koordinationsarbeit. Eigene Pfade neu/isoliert; keine Shared-/Runtime-Dateien geändert. Frisches git fetch --all --prune vor Sicherung ausgeführt.

## Erhaltene Vorarbeit und Ownership

Der vorherige lokale Recherche-/Rollenentwurf `analysis/GC-HOOKS-01-SKILLS/HANDOFF.md` war nicht in einem Gitrepository gesichert. Seine vollständige historische Kopie steht jetzt in `docs/skills/research-history-20261010.md`, ausdrücklich als durch dieses Setup überholter Entwurfsstand. Bestehende GC-PLUGINS-01- und GC-IMG2THREEJS-01-Historie/Installationen bleiben erhalten. Keine Installation von shadcn, Supabase, Convex, Matt-Pocock-Gesamtpaket oder Anthropic-paid-Securityreview. Keine neuen Chats/Forks, keine Hook-/Runtimekonfiguration oder Product-AI-Routeränderung.

Die lokale Skillliste ist im frischen Discovery-Prozess sichtbar. Im bereits laufenden Desktop-Turn kann dessen alter Katalog gelten; nächsten normalen Turn prüfen. Kein pauschaler Appneustart nötig behauptet, aktive Facharbeit nicht unterbrochen. Andere Hosts/Cloudchats benötigen ihre eigene Installation/Discovery.

## Sharedowner-Abgleich und genau nächster Schritt

Dem Shared-Integrationowner über das Ergebnis/PR folgende gezielte Deltas zum Abholen bereitstellen: Link auf docs/skills/GRADECREW_EXECUTION_SKILLS.md im aktuellen Einstieg; vorhandene GC-HOOKS-01-TODO/Registry/State fachlich um lokale sechs-Skill-Installation plus tatsächliches Discovery ergänzen; Entwurf/Installation/main-Verlinkung getrennt halten. Kein paralleles Editieren dieser Dateien durch diesen Fachchat. Keine Nachricht ohne passende menschliche Autorisierung aus dem Delegationsauftrag selbst ableiten.

Genau nächster Schritt: eigenen Dokumentations-PR mit exaktem Commit/Belegen bereitstellen; Sharedowner prüft und übernimmt ausschließlich die autorisierte Eintrittsverlinkung/Statusintegration. Kein Deploy. PR-Integration und Desktop-Nutzung im nächsten Turn nicht aus der lokalen Installation allein behaupten.
