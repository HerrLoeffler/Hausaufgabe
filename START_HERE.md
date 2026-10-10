# GradeCrew: Einstieg für jeden Arbeitschat

Gemeinsames Register: `HerrLoeffler/Hausaufgabe`, Branch **main**.
Diese Datei ist Projektkoordination, keine Aussage darüber, welcher Code live läuft.

1. GitHub-Zugriff prüfen. Ohne Zugriff sofort sagen, dass kein aktueller Code geprüft werden kann, und diese Datei, `GRADECREW_STATE.json` sowie die passende Aufgabenübergabe anfordern. Keine Zugangsdaten anfordern.
2. Auf **main** diese Datei, `AGENTS.md`, `GRADECREW_STATE.json` sowie `TODO.md` und `workstreams/README.md` lesen. Ein alter Feature-Branch kann veraltete Kopien enthalten.
3. In `GRADECREW_STATE.json` zuerst den aktuellen `release_train`, die eigene Workstream-Stufe und das Integrationsziel prüfen. Ein Feature darf nicht nur als „fertig“ bezeichnet werden; der genaue Zustand muss genannt werden.
4. Vor neuer Entwicklungsarbeit den **Live Development Status** prüfen: nach `git fetch --all --prune` `python tools/development_status.py` ausführen oder den jüngsten GitHub-Actions-Lauf **GradeCrew Development Status** lesen. Offene PRs, ahead/behind, Dateiüberschneidungen, Zielbranch-Abweichungen und unregistrierte Branches vor Arbeitsbeginn einordnen. `workstreams/registry.json` enthält nur die wenigen menschlichen Zuordnungen; Git/PR-Daten sind live zu ermitteln.
5. Passende Baustelle auswählen; deren Remote-Branch, Commit, Regeln und Statusdateien frisch lesen. Ein Registry-Eintrag ist eine Zuordnung, kein Beweis für aktuellen Branch-/CI-/Deploy-Stand.
6. Ziel und betroffene Dateien in einer eigenen Aufgabenübergabe festhalten. Überschneidungen abstimmen, bevor dieselben Dateien parallel verändert werden.
7. Eigener Aufgabenbranch / eigener Checkout. Keine gemeinsamen uncommitteten Arbeitsverzeichnisse zwischen unabhängigen Chats. Bestehende Änderungen zuerst sichern, niemals durch Reset/Force-Push beseitigen.
8. Nach einem sinnvollen Teilschritt: überprüfbaren Zwischencommit sichern, pushen und Übergabe aktualisieren. Bei Abbruch maximal den letzten ungesicherten Teilschritt verlieren.
9. Vor Integration: Live Development Status und aktuellen Zielbranch erneut prüfen, Konflikte bewusst lösen, passende Tests ausführen. Vor Deployment das Ziel und den genauen Commit nennen.
10. Sobald ein Feature eine Stufe wechselt, `GRADECREW_STATE.json` aktualisieren: Branch → CI → integriert → Staging → Nutzertest → Production. Andere Chats dürfen nicht aus Chat-Aussagen ableiten, dass dieser Schritt bereits erfolgt ist.

## Status korrekt unterscheiden

`branch_only` → `ci_green` → `integrated` → `staging_deployed` → `user_tested` → `production`.

Jede Stufe benötigt ihren eigenen Nachweis. Ein Commit ist kein CI-Nachweis. Eine grüne CI ist kein Deploy. Ein Hosting-Preview ist kein Functions-Deploy. Ein deployed Build ist kein Gerätetest. Ein hochgeladener iOS-Build ist noch kein Gerätetest.

**Verbotene Kurzform:** „Feature ist fertig“, wenn nicht zusätzlich gesagt wird, auf welcher Stufe es steht.

## Release Train

`GRADECREW_STATE.json -> release_train` ist die zentrale Antwort auf:
- Was soll als Nächstes gemeinsam auf Staging?
- Welche Features sind schon zusammen integriert?
- Welche Gates fehlen noch?
- Welcher Commit wurde tatsächlich deployed?
- Was hat Martin selbst bereits getestet?

Parallele Chats dürfen neue Features isoliert bauen, aber ein Staging-Batch wird über genau diesen Release Train zusammengeführt. So sammeln sich keine unsichtbaren „fertigen, aber irgendwo liegenden“ Features an.

## Development Status / Mehr-Chat-Control-Plane

`workstreams/registry.json` ist die kleine menschliche Zuordnungsschicht: Workstream, Primary Branch, Integrationsziel und Lifecycle-Zustand. Sie soll **nicht** laufend SHAs, PR-Stände oder Deployments duplizieren.

`tools/development_status.py` kombiniert diese Zuordnung mit echten Git-/GitHub-Daten und `GRADECREW_STATE.json`. Es zeigt unter anderem:
- aktive/relevante Workstreams,
- Branch-SHA und ahead/behind zum Ziel,
- offene PRs und abweichende PR-Ziele,
- potenzielle Dateiüberschneidungen paralleler Baustellen,
- unregistrierte Remote-Branches,
- veraltete kritische Branches,
- wie viele Workstreams laut zentralem Release-Status auf Staging liegen,
- ob der aktuelle Release Train Production verändert hat.

Das Audit ist **read-only**. Es sperrt, merged, löscht und deployt nichts automatisch.

## Werkzeuge

- `tools/checkpoint.py`: liest Git-Stand und schreibt einen kleinen JSON-Bericht; sichert **keinen Code**.
- `tools/release_status.py`: zeigt aus `GRADECREW_STATE.json` den aktuellen Release Train und die Workstream-Stufen kompakt an.
- `tools/development_status.py`: Live-Audit für parallele Branches/Chats/PRs und Dateiüberschneidungen.
- `workstreams/registry.json`: kleine Zuordnungsschicht für Primary Branch, Integrationsziel und Lifecycle-Zustand.
- `workstreams/TEMPLATE.md`: Auftrag und Übergabe pro Aufgabe.
- `.github/workflows/development-status.yml`: erzeugt automatisch Job Summary sowie JSON-/Markdown-Artefakt; schreibt keine Statusdatei zurück ins Repo.
- `.github/workflows/handoff-check.yml`: prüft die Koordinationsdateien und liefert einen Bericht im jeweiligen Actions-Lauf. Führt keine App-Tests oder Deployments aus.
- `GRADECREW_STATUS.md`: ältere Übergabe; historische Aussagen anhand der jeweiligen Baustelle prüfen.

## Verbindungsabbruch oder neuer Ersatzchat

Bei „Connection interrupted“, einem festhängenden Chat oder einer Übergabe zusätzlich [docs/CHAT_RECOVERY.md](docs/CHAT_RECOVERY.md) lesen. Die ursprüngliche Task-ID bleibt erhalten. Vor einer Übernahme den letzten gesicherten Schritt und mögliche noch laufende Vorgänge prüfen; ein Verbindungsabbruch beweist keinen Ausführungsabbruch. Neue Chats kennen fremde Chatverläufe und ungesicherten lokalen Code nicht automatisch.

## Starttext zum Kopieren

> Weiter mit GradeCrew, Baustelle: … . Lies auf main START_HERE.md, GRADECREW_STATE.json und die passende Übergabe. Prüfe zuerst Zugriff, Live Development Status, tatsächlichen Branch/Commit, Release-Train-Stufe und ungesicherte Änderungen. Setze beim nächsten belegten offenen Schritt fort.

## Automatisierung aktivieren und prüfen

Die ausführbaren Workflows und die einmalige Einrichtung stehen in `docs/AUTOMATION_SETUP.md`. Ein neuer Auftrag in `agent-queue/` kann nach Aktivierung den Codex-Worker starten. Nach erfolgreicher App-CI kann der Preview-Workflow Hosting veröffentlichen und Prüfsummen kontrollieren.

Die Preview-Automatik ist für Hosting und die getrennte Staging-AI-Functions-Pipeline Ende-zu-Ende bestätigt. Functions, Regeln und andere Dienste bleiben getrennte Deploy-Stufen. Worker-Aktivierung und dessen erster echter Ende-zu-Ende-Lauf müssen weiterhin anhand aktueller GitHub-Nachweise geprüft werden; keine Aktivierung aus dem Vorhandensein von Dateien ableiten. Bestehende Chats müssen diesen Einstieg neu lesen. Agent-Ergebnisse werden vor Integration unabhängig geprüft.

## Was steht auf der To-do-Liste?

`TODO.md` auf dem aktuellen main ist die gemeinsame Aufgabenübersicht. `GRADECREW_STATE.json` ist dagegen die zentrale Release-/Deploy-Sicht. Bei „Was ist fertig/deployed/offen?“ beide frisch lesen und zusätzlich den Live Development Status für Branch-/PR-Konflikte prüfen, statt aus Erinnerung zu antworten.

## Verbindliche Arbeitsbedingung

Alle GradeCrew-Chats – einschließlich Planung und Design – befolgen [docs/CHAT_CONTRACT.md](docs/CHAT_CONTRACT.md). Neue Wünsche bleiben nicht nur im Gespräch: Task-ID, TODO-Status, Release-Stufe und passende Übergabe vor Abschluss sichern. Bei fehlendem Zugriff die ungespeicherte Übergabe ausdrücklich nennen.

## Zwei dauerhafte Fachrollen — GC-LAUNCH-CONTROLS-01

[Assurance-Einstieg: Technische Sicherheit sowie Datenschutz, Recht & faire Bedienung](docs/assurance/README.md) verbindet20SEC- und20PRIV-Kontrollen, Rollenbriefs und bestehende Übergaben. Vor beauftrageten Änderungen relevante Kontrollen mit Owner, aktuellem Nachweis und Releasebezug auswählen; reine Standfragen starten keine Vollprüfung. NeueGames nutzen dieselben Einstiege. Kritische berechtigte Risiken blockieren betroffenen Scope, nicht pauschal jedes offene Kästchen. Rollen-/Katalogdokumentation ist kein Produkt-, Rechts-, Geräte- oder Deploynachweis und startet keine Agenten/Skills/Hooks. Beschlossene Zentralenrollen und adaptive Modellwahl stehen in AGENTS/CHAT_CONTRACT; alle Zentralen koordinieren ausschließlich.

## Skills für autorisierte Facharbeit — GC-HOOKS-01-SKILLS

[Verbindliche Skill-Zuordnung](docs/skills/GRADECREW_EXECUTION_SKILLS.md) verbindet vorhandene Fähigkeiten mit konkreten Fachaufträgen und den bestehenden Rollen-/Releasegrenzen. Sechs ausgewählte standalone User-Skills sind auf Martins Mac installiert; andere Hosts und Nutzung in alten Desktopturns separat prüfen. Zentralen koordinieren weiterhin ausschließlich. [Integrationsnachweis und Grenzen](workstreams/skills-integration-20261010.md); Hook-Entwurf PR184 bleibt getrennt, keine Hooks installiert.


## Konkrete Fachbriefs und angewandte Reviews — GC-POCOCK-IMPLEMENT-01

Der [kanonische Brief-/Entscheidungs-/Reviewvertrag](docs/workflow/EXECUTION_BRIEFS.md) ergänzt die vorhandene Übergabe. Bei einem tatsächlich strukturierten Fachauftrag ein opt-inBrief im bestehenden Handoff, Zuordnung in der bestehenden Registry; keine zweite Statusdatenbank. Der rein lesende Check erkennt fehlende Pflichtfelder, unklare Owner/Abhängigkeiten und deklarierte laufende oder unbekannte Vorgänge. Er erteilt keine Rechte, übernimmt keine atomaren Locks und startet weder Agenten, Retry noch Deploy.

Auftragserfüllung und Repo-Standards am selben Kandidaten getrennt durch einen passenden unabhängigen Reviewer prüfen; ein Reviewer kann beide Achsen übernehmen. PRs nennen Trigger, Vorher/Nachher, eigenen geeigneten Realbeleg, Umfang und Rückrollfolge. Routine ohne echte Fragen erhält keine künstliche Interview-/Abnahmerunde. Retro nur nach belegtem auffälligem Ablauf, maximal drei Kandidaten gegen bestehende Checks; keine automatische globale Skilländerung oder pauschaler Refactor. Alle bisherigen Rollen-, Source-, Recovery-, Budget- und strengeren Release-/Security-/Productiongates bleiben bestehen.
