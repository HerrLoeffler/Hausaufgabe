# GradeCrew: Skill-Zuordnung für autorisierte Facharbeit

GC-HOOKS-01-SKILLS · 10.10.2026 · Fortsetzung des bestehenden Skill-Auftrags nach Martins „Dann machen wir das“. Owner: bestehender Plugins-Fachchat; gemeinsame START/AGENTS/TODO/STATE/Registry bleiben bei GC · Automatisierung & Integration (`01a1089e-bbae-74c2-9a6a-6ce71fb3dba7`). Keine zweite Koordinator-/Statusdatenbank.

## Geltung und Rolle zuerst

Diese Zuordnung ist für ausführende Fach-Chats verbindlich innerhalb ihres tatsächlich autorisierten Auftrags. Vor Arbeit aktuelles START_HERE, AGENTS, CHAT_CONTRACT, vorhandene Task-/Workstream-Übergabe, passende Assurance-Rolle und tatsächlichen Branch/SHA lesen. Bei Wiederaufnahme CHAT_RECOVERY und laufende Vorgänge prüfen. Bestehende Aufgaben, Owner, Verträge, Versuche und Budgets erhalten.

Die fünf bestehenden GradeCrew-/Games-/Spiel-Zentralen koordinieren ausschließlich über erlaubte APIs: keine Shell, Dateiänderung, Tests, Builds, Integration oder Deploys. Ein Skill mit „MUST deploy“, Provisionierungsbeispielen, automatischer Delegation oder Design-Bauplan erweitert diese Rollenrechte nicht. Notwendige ausführende Arbeit an den konkret beauftragten Fachchat geben. Installation verändert weder Threadrollen noch tool permissions. GradeCrew Central 0.4.0 bleibt der gemeinsame Projektzugang; lesende Funktionen und schreibende/Verbindungsaktionen unterscheiden.

Nicht benötigte Skills nicht laden. Keine neue Interview-/Freigaberunde für bereits klare autorisierte Routinearbeit. Nur fehlende entscheidende Informationen klären. Nutzerauftrag und Projektregeln gehen allgemeinen Skillregeln vor. Automatische Skillauswahl ist eine Hilfe, kein garantierter Workflow- oder Sicherheitsnachweis.

## Zuordnung nach ausführender Rolle und Anlass

| Rolle / Trigger | Zu verwendende vorhandene Skills | Konkrete Grenze |
| --- | --- | --- |
| Umsetzung neuer komplexer Funktion | Superpowers brainstorming/writing-plans, passende execution/worktree-Skills | Beschlossene Spec, APIs und Eigentümer erhalten; Skillprozess angemessen zum Umfang, kein pauschales Chat-/Providerpaket. |
| Reproduzierbarer Bug | Superpowers systematic-debugging; test-driven-development bei passender Verhaltensänderung | Ursache/Fakten zuerst; Netzwerk, Login, Quota und Rechte nicht mit größerem Modell behandeln. |
| Webgestaltung / vorhandene GradeCrew-Seite verfeinern | `frontend-design`; vorhandene Browser- und Designfähigkeiten | Zuerst bestehende GradeCrew-Tokens, brand/workspace, Komponenten, Inhalte und Referenzen lesen. Nutzervorgabe zur Gestaltung gewinnt. Vanilla HTML/CSS/ES-Module erhalten; kein shadcn/React/Tailwind-Umbau aus dem Skill. |
| Figma-Design oder Umsetzung einer Figma-Vorlage | Passender Figma-Skill vor dessen Werkzeugaufruf, insbesondere design-to-code/use; frontend-design nur bei zusätzlichem Gestaltungsspielraum | Vorhandene Figma-/Code-Connect-Verträge verwenden; keine konkurrierenden Designvarianten ohne Auftrag. Figma-Verbindung bei tatsächlicher Nutzung prüfen. |
| Firebase-Auth-Code / konkrete Anmeldung | `firebase-auth-basics`; Debugging bei Authfehlern | Vorhandene Projekt-/Provider-/Domänenkonfiguration nutzen. Kein pauschales Google-Sign-in, neuer Projektaufbau, Login oder Authdeploy aus dem Skill. |
| Firestore-Datenmodell, Queries, SDK, Index | `firebase-firestore`, editions-/plattformpassende Referenz | Bestehende Zielumgebung/Database feststellen. Nicht ungefragt Enterprise-DB provisionieren oder bestehende Umgebung migrieren. Autorisierte Reads gezielt, keine Kundendaten zum Setup prüfen. |
| Firestore-Rules ändern | `firestore-rules-creation`; branchspezifische Security-Gates und relevante Tests | Bereits zuständigen Rules-Fachowner bevorzugen. Kein blindes Komplettrewrite, keine neuen selbst erteilten Rechte. CLI-/Projektzugriff, Schema, legitime Lehrkraft-/Schülerrollen, Queries und bestehende Tests prüfen. |
| Unabhängiger Firebase-Rules-Audit | `firebase-security-rules-auditor` plus passend beauftragter Codex-Security-Skill | Konkreter Scope und Originalbelege. Audit ist kein Fix/Deployauftrag. Upstream 1–5-Score ist keine GradeCrew-Gate-/Rechtsfreigabe; hardcoded-email-/„owner-only“-Heuristiken gegen tatsächliche ACL/Rollen prüfen. |
| Hosting-Konfiguration / konkret autorisierter Releaseauftrag | `firebase-hosting-basics`, vorhandene Release-/CI-/Receipt-Werkzeuge | Klassisches Hosting, nicht App Hosting. Bestehende Manifest-/exakte-SHA-/Functions-/Rules-/Abnahmegates erhalten. Auth- und Hosting-Beispiele nicht ausführen, wenn kein Deploy beauftragt. Production nur ausdrücklich freigegeben. |
| Allgemeiner Securityaudit oder Security-Diff | Passender Codex-Security-Skill für Repository oder Diff | Standardscan, deep scan und Findingsfix nicht austauschbar. Bestehende SEC-/PRIV-Rollen und Scope wählen; keine neue paid Anthropic-Reviewaction. |
| Bildgestütztes 3D-Objekt / Figur / Asset | `img2threejs` nach docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md, oder begründeter geeigneter Blender-/Engineweg | Lokalen Assetzustand, Referenz, Version, Render-/Mehrwinkel-/Animation-/Engineimportnachweise sichern. Three.js-Code ist kein Unrealasset; kein Enginewechsel aus einem Skill. |
| Games-Gameplay, Touch, Save/Resume, Solo/Multiplayer | Vorhandene Entwicklungs-/Debug-/Review-Skills und konkreter Spielvertrag | Keine künstliche 3D-Rekonstruktion bei reiner Lernlogik. Engine/Zielgerät, API/Attempt, Saveversion und freigegebenen Multiplayerumfang prüfen. UI-Skill ersetzt nicht UMG/Slate. |
| Unabhängige Abnahme | verification-before-completion/requesting-code-review sowie passend beauftragte Security-/Figma-/Gamesfähigkeiten | Exakter Commit/Test/Deploy/Gerätebeleg; nicht geprüft bleibt offen. Keine Fixes, Merges oder Freigaben aus dem Review ableiten. |

Modell/Effort je Arbeitsschritt nach aktuellem AGENTS wählen: Luna medium für einfache Zuordnung, Sol medium für übergreifenden Review, Sol high für schwierige Security/Architektur/Enginefragen. Aufwand bevorzugt ändern, maximal zwei Modellwechsel je Teilaufgabe, keine sicherheitskritische Herabstufung. Angefordert/beobachtet, Grund und Ergebnis in bestehender Übergabe festhalten. Ein Modellwechsel ändert keine Rollenrechte.

## Tatsächlich installierte Ergänzungen auf Martins Mac

Host: Darwin arm64. Installation mit dem vorhandenen Skill-Installer, gezielt nach gelesenen Quellen, ohne Upstreamcode zu verändern. Keine globale Bootstrap-/MCP-/Cloudkonfiguration, keine Anmeldung, kein Deployment oder direkter kostenpflichtiger APIaufruf.

| Skill | Fixierte Quelle | Installierter Pfad |
| --- | --- | --- |
| firebase-auth-basics | firebase/agent-skills@b5735e5baa0d874cb97a23e26ebe93e4501797b9 | /Users/martin/.codex/skills/firebase-auth-basics/SKILL.md |
| firebase-firestore | gleiche Firebase-Quelle | /Users/martin/.codex/skills/firebase-firestore/SKILL.md |
| firebase-hosting-basics | gleiche Firebase-Quelle | /Users/martin/.codex/skills/firebase-hosting-basics/SKILL.md |
| firebase-security-rules-auditor | gleiche Firebase-Quelle | /Users/martin/.codex/skills/firebase-security-rules-auditor/SKILL.md |
| firestore-rules-creation | gleiche Firebase-Quelle, benötigter Rules-Autorenbaustein | /Users/martin/.codex/skills/firestore-rules-creation/SKILL.md |
| frontend-design | anthropics/skills@dbd4588f9e1033efb41dad4bef2f7947c8993d44 | /Users/martin/.codex/skills/frontend-design/SKILL.md |

Die Dokumentationsnamen `firebase-firestore-standard` und `firestore-security-rules-auditor` stimmen nicht mit den tatsächlich fixierten aktuellen Quellordnern überein. Installiert sind die oben genannten echten Namen; Standard-/Enterprise-Referenzen liegen im aktuellen Firestore-Skill. Dessen ausdrückliche Rules-Authoring-Abhängigkeit begründet den fünften Firebase-Skill. Ein nicht installierter upstream `firestore-rules-author`-Subagent wird nicht erfunden; der Skill enthält die direkte Alternative, wenn dieser nicht verfügbar ist.

Die offiziellen Firebase-Skills enthalten Provisionierungs-/Deployanweisungen und dynamische `firebase-tools@latest`-Beispiele. Bei GradeCrew vorhandene qualifizierte Runtime/Profile und Zielprojekt verwenden; diese Beispiele sind keine Autorisierung. Der Rules-Autorenbaustein enthält sehr weitreichende pauschale Empfehlungen und Codebeispiele, die im tatsächlichen Daten-/Rollenvertrag überprüft werden müssen. Keine allgemeine Sicherheitsgarantie aus Herstellerherkunft ableiten. frontend-design verlangt zweistufigen Designplan/Briefabgleich und lässt ausdrücklich die Vorgabe des Briefs gewinnen; GradeCrew-Tokenwahl vor neuem Styling belegen.

Vorhandene Superpowers/Codex/Figma/img2threejs wurden nicht erneut installiert. Der im Verzeichnis gefundene vollständige Firebase-Plugin ist weiterhin uninstalled: nur die benötigten standalone Skills wurden installiert, kein zusätzlicher MCP-/Kontozugriff. Kein Supabase/Convex-/Matt-Pocock-Paket, shadcn-Stack oder paid Anthropic-Securityworkflow eingeführt. Die drei früher vorgeschlagenen neuen Rollen-Skills bleiben Vorschläge; diese Zuordnung verwendet bestehende Fachfähigkeiten und bestehende Rollenregeln.

## Discovery, Nutzung und Grenzen

`codex-cli 0.162.0-alpha.2` meldete bei einem begrenzten lokalen App-Server-Read über `initialize` und `skills/list(forceReload=true)` alle sechs Ergänzungen sowie img2threejs als `enabled=true`, `scope=user`, ohne Discovery-Fehler. Kein `thread/start`, `turn/start`, Firebase- oder Kundendatenzugriff. Ein erster sandboxed Serverstart endete vor initialize; der autorisierte lokale Read außerhalb der Sandbox gelang. Keine Trust-/Permissioneinstellung verändert. Die genaue Evidenz und Datei-Hashes stehen in [installation-20261010.json](installation-20261010.json).

Die vorhandene Desktop-Unterhaltung kann noch den Katalog des bereits laufenden Turns enthalten; Nutzung im nächsten Turn prüfen, nicht automatisch die App neu starten. Der neue lokale Discovery-Prozess ist belegt, aktive alte Threads wurden nicht neu gestartet oder umgestellt. Auf anderen Hosts sind diese maschinenspezifischen Installationen nicht automatisch vorhanden; Quellen/Pins bei Bedarf gezielt installieren und dort neu entdecken.

Eine kleine Offlineprobe mit erfundenen Rules und einem lokalen Designbeispiel wird in der [Setup-Übergabe](../../workstreams/skills-setup-20261010.md) dokumentiert. Sie belegt begrenztes Lesen/Anwenden, nicht erfolgreiche Cloud-/Auth-/Hostingfunktion, Produktionssicherheit, endgültige Grafik oder echte Geräteabnahme. Upstreamdateien bleiben unverändert; Updates erst lesen und gegen die Projektgrenzen prüfen, nicht pauschal `--all` aktualisieren.

## Integration und nächste Nutzung

Diese Datei liegt im eigenen Setup-PR. Gemeinsamer Integrationowner übernimmt nach Prüfung gezielt einen Link auf diesen Einstieg in die aktuellen Projektanweisungen und hält TODO/State/Registry bei GC-HOOKS-01 konsistent. Keine neue Taskfamilie oder Statusdatenbank. Die lokalen Skills sind bereits installiert; main-Verlinkung und PR-Integration separat belegen.

Offizielle Quellen: [Firebase Skills und Codex](https://firebase.google.com/docs/ai-assistance/agent-skills), [fixierte Firebase-Quelle](https://github.com/firebase/agent-skills/tree/b5735e5baa0d874cb97a23e26ebe93e4501797b9/skills), [fixierter frontend-design-Skill](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md), [OpenAI: Skill-Erkennung](https://learn.chatgpt.com/docs/build-skills), [OpenAI: skills/list](https://learn.chatgpt.com/docs/app-server). Lizenzen in den heruntergeladenen offiziellen Quellen erhalten; keine Vendor-Skillkopien in diesem PR.
