# Ausführbare Fachaufträge: Brief, Entscheidungen und Nachweise

GC-POCOCK-IMPLEMENT-01 ergänzt die bestehenden Task-/Handoff-/Releaseverträge.
Zentralen koordinieren über APIs; autorisierte Fach-Chats führen aus. Die aktuelle
Quelle und der konkrete Nutzerauftrag gewinnen vor historischen Videos. Ein Brief
ist kein neuer Auftrag und erweitert keine Rechte.

## Den vorhandenen Auftrag knapp binden

In der bestehenden Workstream-Übergabe stehen Ziel und Prioritäten, erlaubte
Dateien und ausgeschlossene Aktionen, Owner, aktueller Branch/SHA, beobachtbare
Abnahme und genau ein nächster Schritt. Recherchierbare Fakten selbst ermitteln.
Nur echte neue Produktpräferenzen fragen; bekannte Entscheidungen übernehmen.
Unabhängige Fragen dürfen zusammen kommen, abhängige erst nach ihrer Voraussetzung.
Die [Workstream-Vorlage](../../workstreams/TEMPLATE.md) und
[PR-Vorlage](../../.github/PULL_REQUEST_TEMPLATE.md) sind die gemeinsamen Einstiege.

## Eine schmale Entscheidungskarte bei tatsächlicher Unklarheit

Im selben Handoff höchstens vier initiale Fragen, vorhandene Antworten und ihre
Quellen zuerst. Jeder Eintrag besitzt `id`, `status` (`open`/`answered`),
`blocked_by`, `claimed_owner` (unbeansprucht: `null`) und `answer` (offen: `null`).
Eine beantwortete Frage hat einen konkreten Antwort-/Quellenpointer. Ein Claim
ist eine dokumentierte Zuordnung, **kein atomarer Lock, Lease oder Heartbeat**.
Vor Schreibarbeit weiterhin tatsächlichen Owner/Branch/Überschneidungen prüfen.

Die Frontier besteht aus offenen Fragen mit beantworteten Voraussetzungen und
benanntem Owner. Unbeanspruchte entscheidbare Fragen werden separat gemeldet.
Menschliche Präferenzen bleiben offen, bis die echte Antwort vorliegt. Ein
Prototyp beantwortet genau diese Frage: Webvarianten im Browser, native
Enginefrage im tatsächlichen Spiel. Er bleibt getrennt von Umsetzung und Release.
Ein klarer Reparaturauftrag braucht keine künstliche Entscheidungskarte.

## Opt-in JSONbrief im vorhandenen Handoff

Für einen registrierten strukturierten Fachauftrag enthält dessen Übergabe genau
einen vollständigen fenced JSONblock mit Sprachlabel `gradecrew-brief`. Im
vorhandenen `workstreams/registry.json` verweist der Eintrag mit
`checkProfile: "workflow-brief-v1"` auf diesen Handoff. Kein separates Ticket- oder
Statussystem. Alt-Handoffs ohne Profil bleiben kompatibel. Die konkrete
[angewandte Übergabe](../../workstreams/pocock-workflow-implementation-20261010.md)
ist das vollständige Beispiel; hier keine zweite kopierte Schemafixture.

Pflichtfelder:

| Feld | Vertrag |
|---|---|
| `schema_version`, `task_id`, `parent_task_id`, `owner`, `goal` | Version1; bestehende Familie/Untertask, ausführender Owner, konkretes Ziel |
| `priorities` | Nicht leere Liste der konkreten Prioritäten dieses Auftrags |
| `source.branch`, `source.commit` | Benannte Quelle und voller 40-stelliger Commit; Aktualität zusätzlich mit Git/GitHub prüfen |
| `scope.allowed_paths`, `scope.excluded_actions`, `acceptance` | Nicht leere Listen; konkreter Umfang, Grenzen, beobachtbare Ergebnisse |
| `decisions` | 0–128 eindeutige Einträge; bei Routine ohne offene Fragen leere Liste, sonst keine unbekannten Abhängigkeiten oder Zyklen |
| `recovery.next_step`, `recovery.operations` | Genau nächste Arbeit; explizite Liste laufender/beendeter/unklarer Vorgänge, auch leer |
| Operation | `id`, `status` (`planned`/`running`/`succeeded`/`failed`/`unknown`), `evidence`- oder Historienpointer |
| `recovery.budget` | `mode`: `no_paid_calls` oder `existing_authorization_only`; `reservation_ids` und `attempt_history_ref`; bestehende Reservierungen nie in no-paid-Modus verwerfen |
| `review_axes.requirements`, `.standards` | Je `status` (`pending`/`pass`/`changes_requested`), `reviewer`, `evidence`-Liste; abgeschlossener Review benötigt anderen Reviewer und Beleg |

Bezeichner bestehen aus Buchstaben/Ziffern und `_.:-`, maximal80Zeichen; technische
Thread-/Agentzuordnung ggf. als normaler Handofftext daneben führen. Fakten,
Reservierungen und Versuche werden weiter aus den Originalbelegen übernommen.
Kein Reset bei neuem Chat oder geändertem Modell. Unklares Providerergebnis zuerst
abgleichen, kein neuer Paid-Call. Gestoppte Security-/Exportarbeit nicht umgehen.

## Rein lesenden Check anwenden

```sh
python3 tools/workstream_checks.py --registry workstreams/registry.json --require-task GC-POCOCK-IMPLEMENT-01
python3 -m unittest discover -s tools -p 'test_workstream_checks.py' -v
```

Der erste Befehl validiert nur profilierte Übergaben. Die ausdrücklich erforderliche
Task verhindert ein still verschwundenes opt-in-Profil. Exit0 bedeutet gültige
Deklaration, Exit1 einen Vertragsfehler. JSONstdout meldet `ready`, `needs_owner`,
`blocked`, `resume_safe`, `reconcile`. Laufende/unklare Vorgänge unterdrücken `ready`.
`resume_safe` bedeutet nur: keine so deklarierten laufenden/unklaren Vorgänge.
Es ist **keine Retry-, Budget-, Merge-, Geräte- oder Deployfreigabe**. Der Prüfer
liest innerhalb `workstreams/`, schreibt nichts und ruft weder GitHub noch
Provider auf. Eine formal korrekte Deklaration beweist nicht die externe Wahrheit,
Identität des Reviewers, tatsächliche Kosten oder den neuesten GitHub-SHA.

Die bestehende Handoff-CI führt Verhaltenstests und diesen realen Verbraucher aus;
Automation-/Release-/Telemetriechecks bleiben erhalten. Kein neuer Controller.

## Review, Runtime und gezielte Retro

Auftragserfüllung gegen Abnahme/Spec und Repo-Standards gegen aktuelle Verträge
getrennt berichten, am selben unveränderlichen Kandidaten. Ein passender
unabhängiger Reviewer kann beides übernehmen; keine doppelte Reviewflotte.
PRs erklären Auslöser, Vorher/Nachher, eigenen geeigneten Realbeleg, Umfang und
Rückrollfolgen. Kritische Befunde/fehlende relevante Gates bleiben blockierend.

Runtimebelege binden Version, richtige Instanz, Startzustand, reale Eingabe,
sichtbares Ergebnis und Datenfolge; ein anderer Fachchat fährt den begrenzten
Ablauf einmal nach. Engine-Eingabe, OS-/iPad-Eingabe, Fake Service, Emulator/live
API und tatsächliches Gerätegefühl getrennt. Nur selbst gestartete Prozesse
bereinigen; Belege überleben Cleanup. Web/native QA behält ihren eigenen Owner.

Nach einer real auffälligen Session höchstens drei belegte Verbesserungskandidaten
gegen vorhandene Checks vergleichen. Einen tatsächlich mechanischen Fehler
deterministisch abfangen; Urteil und Produktpräferenz bleiben Reviewarbeit.
Keine periodische Vollretro, pauschale 100%-Coverage, globale Skillumschreibung
oder Strukturrefactor ohne tatsächlichen Hotspot/Caller-/Regressionbeleg.
Lernhilfen erst bei konkreter Wissenslücke; kleines Lernziel und Anwendungsaufgabe
statt Produktmemory-Umbau. Adaptive Effort-/Modellwahl nach AGENTS; requested
und beobachtet sowie Grund, Ergebnis/Nacharbeit trennen, Einsparung unbekannt lassen.
