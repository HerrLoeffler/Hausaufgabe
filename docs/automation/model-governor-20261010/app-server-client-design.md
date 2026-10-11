# GC-MODEL-GOVERNOR-01 — eigener lokaler Sendeclient

Status: **Spezifikation zur Nutzerprüfung, 11.10.2026.** Die Nutzerwahl genehmigt die Richtung eines eigenen GradeCrew-App-Server-Clients, nicht automatisch jedes Detail dieses Dokuments oder eine Implementierung. Ziel ist ein eigener GradeCrew-Sendeweg, der Modell und Aufwand vor jedem neuen Turn festlegt. Der native Desktop-Sendeknopf bleibt außerhalb des Umfangs. Bestehende Task-, Versuch- und Budgethistorie bleibt erhalten; es entsteht keine neue Task-ID.

## Empfehlung und Abwägung

Bewertungsskala: 10 = hoher Nutzen beziehungsweise geringes Integrationsrisiko/geringer Bedienaufwand. Einschätzung des Ansatzes, kein Fertigstellungswert.

| Ansatz | Nutzen | Integrationssicherheit | Bedienkomfort | Begründung |
|---|---:|---:|---:|---|
| Eigener Client, zunächst nur von ihm angelegte lokale Codex-Chats | 8/10 | 8/10 | 7/10 | Eigener Sendepfad kontrolliert jede Anfrage; klare alleinige Schreibzuständigkeit. Ein zusätzlicher Composer ist nötig. Alte Chats werden zunächst nicht übernommen. |
| Derselbe Client mit Desktop-Chatübernahme über gemeinsamen Server | 9/10 | 4/10 | 8/10 | Historie kann grundsätzlich erhalten bleiben; tatsächlich gemeinsamer Server, Client-Werkzeuge und exklusive Schreibzuständigkeit sind noch nicht belegt. |
| Wiederholtes `codex exec/resume` pro Sendung | 5/10 | 5/10 | 5/10 | Kann Vorgänge ausführen, ersetzt aber keinen dauerhaft verbundenen Client mit konsistenter Ereignis-/Approval-Oberfläche; konkurrierende Desktop-Turns bleiben problematisch. |

Empfohlen ist der erste Ansatz als MVP, mit einer späteren ausdrücklich geprüften Übernahmefunktion. Wichtigste Entscheidung: **zunächst eigene Client-Chats oder sofort vorhandene Desktop-Chats übernehmen?** Der konkrete Startvorschlag ist eigene Client-Chats. Ein allgemeines Desktop-Übernahmeversprechen wäre durch die Quellen nicht gedeckt.

## Ein kleiner MVP

Ziel für den MVP ist ein neuer Composer im vorhandenen lokalen GradeCrew Dev Workbench (`tools/dev-workbench`, derzeitiger Loopback-Port 8772), sofern der Implementierungsplan den konkreten UI-/HTTP-Anschluss bestätigt. Der Composer zeigt automatische oder ausdrücklich manuelle Modellwahl, Modell/Aufwand samt kurzem Grund, Task-/Phasenklasse, Status und Antwortstrom. Wiederverwendet wird die vorhandene Policy-Logik von `tools/dev-workbench/codex-model-policy.mjs`; der CLI-Provider bleibt unverändert. Der App-Server-Transport ist neu und darf nicht ungeprüft aus CLI-Verhalten abgeleitet werden. Kein Produkt-AI-Router, kein zweiter Modellklassifikationsaufruf.

Ein lokaler Broker hält genau eine App-Server-Verbindung und stellt der Oberfläche nur die nötigen Aktionen bereit. Als erster Transport dient dokumentiertes stdio mit JSONL und initialize/initialized. Browsercode erhält keine Tokens und kann den CLI-Prozess nicht unmittelbar starten. Normale Codex-Anmeldung bleibt im unterstützten Profil; keine Authkopie, globale Modellkonfigurationsänderung oder Hookinstallation. Der Client zeigt Approval-Anfragen und wartet auf die Entscheidung, statt generell freizugeben. Das MVP umfasst Text, Antwortstream, Fehler und Approval-Zustand; fehlende Tool-/Elicitation-Unterstützung wird sichtbar abgelehnt. Kein stiller Wechsel zu einem anderen Provider.

Vor einer späteren Umsetzung sind Endpoint-/Origin-Bindung, lokale Broker-Zugriffskontrolle und genaue ET-Einbindung zu bestimmen. Der App Server ist laut offizieller Dokumentation experimentell; dieser Vorschlag ist ein begrenzter lokaler Pilot.

## Senden, Routing und Nachweise

1. Ein einziger Client besitzt die Schreibzuständigkeit des Chats; paralleles Senden und Doppelklick sind gesperrt. Aktiver/unklarer Turn bedeutet „warten“, kein `turn/steer`, Interrupt oder erneuter Start.
2. Vor dem Versand Modellkatalog vollständig über `model/list` prüfen. Routine: Luna/medium; komplexe Koordination/Architektur/Diagnose: Sol6.1/medium; high nur mit konkretem Grund. Low erst nach belegter Eignung; maximal zwei Modellwechsel je Teilaufgabe. Rechte-/Netz-/Quota-Probleme führen zu keinem größeren Modell.
3. Nur vorhandene Modell-ID mit angebotenem Aufwand und passenden Eingabemodalitäten zulassen. Fehlende Kombination, unvollständiger Katalog oder widersprechende Vorgaben: Versand stoppen; keine automatische Upgrade-/Default-/größere Ersatzwahl. Manuelle Auswahl folgt derselben Verfügbarkeitsprüfung.
4. Regel-/Ownership-Prüfung abschließen, dann Task-ID, Grund, angeforderte Modell-/Aufwandwerte, Regel-SHA, Versuch-ID und Startzustand privat sichern. `turn/start` enthält **jedes Mal** explizit `model` und `effort`; gespeicherte Threaddefaults sind nicht die Auswahlgrundlage.
5. JSON-RPC-ID, Server-Turn-ID und Zustandsereignisse zuordnen. Bei verlorener Startantwort gilt Ergebnis unbekannt: kein automatisches Wiederholen, kein Doppelturn. `clientUserMessageId` ist ohne entsprechenden Nachweis kein garantierter Idempotenzschlüssel.

`requested` kommt aus dem konkreten Request. Geladene `thread.model`/`reasoningEffort` beziehungsweise Resume-Antworten sind **Konfiguration**, kein Beleg des ausgeführten Modellaufrufs. Die installierten Schemas kennzeichnen das ausdrücklich; `TurnStartResponse.Turn` enthält keine Modell-/Aufwandtelemetrie. `actual` bleibt unknown, bis korrelierte, dafür geeignete Runtime-Evidenz vorliegt. Usage/Preise bleiben unbekannt, wenn nicht geliefert. Kein behaupteter Kosten-/Qualitätsgewinn aus Defaults.

## Modellrichtlinie vor jedem Senden

Jede Nachricht, die in diesem Client gesendet wird, erhält unmittelbar vor dem Aufruf eine neue deterministische Auswahl. Grundlage sind die vorhandenen Task-ID-, Phase-, Risiko-, Akzeptanz- und Versuchsdaten aus der bestehenden Governor-Policy; ein zusätzlicher Modellaufruf zur Klassifikation ist ausgeschlossen. Routine startet mit Luna/medium. Belegte bereichsübergreifende Komplexität kann Sol/medium begründen. High braucht einen konkreten Grund und passende ausdrückliche Autorisierung. Low wird erst nach vergleichbaren erfolgreichen Routinebelegen zugelassen. Manuelle Modell-/Aufwandswahl bleibt möglich, aber unter denselben Verfügbarkeits- und Autorisierungsregeln.

Der App Server liefert mit `model/list` einen Katalog, nicht den Nachweis, dass das Konto jede gelistete Kombination nutzen darf. Vor jedem `turn/start` müssen angeforderte Modell-ID und Aufwand von der aktuellen Serverversion unterstützt sein. Fehlt die exakte Kombination, ist der Katalog unvollständig oder widersprechen sich Taskprofil und Freigabe, stoppt der Client vor `turn/start`; kein stiller Fallback oder Upgrade. Eine Ablehnung nach dem Start wird als Ergebnis dieses Versuchs festgehalten und nicht automatisch mit einem anderen Modell erneut abgesendet.

Vor dem Versand sichert der Client einen minimalen lokalen Beleg mit Task-/Request-/Thread-ID, Phase, Klassifikationsgrund, Regelversion, versucht/angenommen/beobachtet getrennt und Startstatus. `turn/start` setzt **bei jedem Senden** explizit `model` und `effort`, auch wenn ein Thread gespeicherte Defaults hat. Der Request erhält eine JSON-RPC-ID und der Server eine Turn-ID; sie werden korreliert. Ein verlorenes oder widersprüchliches Startresultat gilt als `unknown`, sperrt Wiederholung und wird erst nach Abgleich bestehender Ereignisse/Belege geklärt. Der Beleg enthält keinen Prompttext, keine Antwort und keine geheimen Tokens.

Die geladenen Threadwerte `model`/`reasoningEffort` sind Konfiguration, kein Beweis des tatsächlichen Runtime-Modells. `actual` und Usage bleiben `unknown`, sofern kein geeigneter korrelierter Runtime-Beleg geliefert wird. Keine Tokenersparnis wird behauptet: echte Usage wird nur bei einem späteren regulären Auftrag erfasst und gegen eine vergleichbare Baseline eingeordnet. Keine zusätzliche Inferenz dient der Qualifikation.

## Vorhandene Chats: unterstützt und offen

Belegt im installierten Protokoll und exakten Quelltag: `thread/resume(threadId)` kann gespeicherte lokale Codex-Historie laden oder einen im **selben** Server geladenen Thread wieder verbinden. Für bereits geladene Threads können abweichende Resume-Overrides ignoriert werden, solange andere Subscriber/aktive Nutzung bestehen. `path`/`history` bleiben weg: sie sind instabil, können die ID-Auflösung ersetzen, und history ist ausdrücklich „FOR CODEX CLOUD — DO NOT USE“. Session-ID ist keine eindeutige Rollen-/Threadidentität.

Besonders relevant: der exakte `turn_start_inner` ruft `start_or_steer_turn` auf und unterscheidet Started/Steered. Ein vorheriges idle-Lesen ist deshalb keine atomare Garantie eines neuen Turns. Exklusive Schreibzuständigkeit und serverseitige Einordnung sind nötig; der Client darf nicht behaupten, jedes `turn/start` starte immer einen frischen Modellaufruf. Im MVP gehören deshalb nur neu vom Client angelegte Threads dazu. Der Broker muss einen einzigen aktiven Writer je Thread erzwingen; bei aktivem oder unklarem Turn zeigt er `warten` und ruft weder `turn/start` noch `turn/steer`, Interrupt oder Retry auf.

Desktop-Übernahme wäre nur nach Nutzerwahl des konkreten **lokalen Codex**-Threads, geprüftem Host/Store/CWD, funktionsfähigen benötigten Werkzeugen/Approvals und Übergabe der Schreibzuständigkeit zulässig. Dann über unterstützten gemeinsamen Server verbinden, Status prüfen, gegebenenfalls rein beobachtend warten und ID-basiert resumieren. Dokumentierte Unix-/WebSocket-Transporte sind keine Garantie, dass der laufende Desktop genau diesen Endpoint/Server freigibt. Ein neuer stdio-Server am gleichen Codex-Verzeichnis teilt Persistenz, aber sein ThreadManager kennt fremde aktive Turns nicht zuverlässig; daher kein paralleles Resume desselben Desktop-Chats als Abkürzung.

Nicht nachgewiesen: Desktop-Endpoint und Serverzuordnung, private dynamische Desktop-Tools/Browser-/Dateipanel-/Artifact-Kopplung, UI-Synchronisierung eines extern gestarteten Turns, hostübergreifende IDs und paginierte Historienunterstützung der konkret gewählten Kombination. Die aktuelle allgemeine Dokumentation und der installierte Alphastand unterscheiden sich teilweise; gegen die installierte Version qualifizieren. ChatGPT- und Work-Cloud-Chats sind nicht automatisch lokale Codex-Rollouts; ihre IDs lassen sich mit diesem Entwurf nicht als fortführbar einstufen. Keine App-Datenbankbearbeitung oder Historiekopie als Ersatz.

## Nächster Schritt

Dieses Dokument wird Martin jetzt zur Prüfung vorgelegt. Es empfiehlt einen lokalen Workbench-Composer mit zunächst ausschließlich client-eigenen Codex-Threads und expliziter Modell-/Aufwandswahl vor jedem Turn. Desktop-Chatübernahme, Implementierung und Runtime-Qualifikation bleiben getrennte Folgeentscheidungen. Nach Freigabe der Spezifikation wird ein fokussierter Implementierungsplan erstellt; bis dahin bleibt alles Entwurf.

## Aktueller Repo-Bezug und Selbstprüfung

Zum Erstellen dieses Entwurfs war `main` auf `6b433856760a08001e731e40ac7def16b4210c1b`. PR #200 (Luna/medium-Standard), PR #199 (Governor-Dokumentation) und PR #201 (Workbench-CLI-Import in `feature/gradecrew-app-integration`) sind gemergt; der CLI-Import ist kein Staging- oder Production-Deploy. PR #203 steht offen und als Draft auf Head `60dbce63f1694a138cda0cc822fcea0062062c23`; für diesen Head waren die Offline-, Handoff- und Development-Status-Checks erfolgreich. GitHub zeigte zum Prüfzeitpunkt keine eingereichten PR-Reviews. Der PR #203-Hook ist nicht installiert und gehört nicht zu diesem MVP.

Selbstprüfung: Die Annahme „Desktop-Thread-ID lässt sich mit einem neuen App Server sicher fortsetzen“ wurde verworfen. Der Entwurf trennt `requested`, Thread-Konfiguration, tatsächliche Runtime-Beobachtung und Usage; dokumentiert den `turn/start`-Start/Steuerungs-Race; verlangt Single-Writer und blockiert unbekannte Dispatch-Ergebnisse gegen automatische Wiederholung. Keine Behauptung zu Kosteneinsparung, nativer Desktop-Abdeckung, Deployment oder Produkttauglichkeit. Vor Code bleiben exakter Workbench-Anschluss, sichere lokale Broker-/Origin-Bindung, unterstützte Auth ohne private Tokenkopie, installierte App-Server-Version sowie Offline- und Approval-Verhalten zu klären.

## Quellen und Prüfung

- [Aktuelle offizielle App-Server-Dokumentation](https://learn.chatgpt.com/docs/app-server): Transport, Katalog, Thread-/Turn-APIs und Grenzen; heute gesucht und geöffnet.
- [Exakter Tag: Thread-Protokoll](https://github.com/openai/codex/blob/rust-v0.162.0-alpha.17.2/codex-rs/app-server-protocol/src/protocol/v2/thread.rs): Resume-ID, history/path, Antwortkonfiguration.
- [Exakter Tag: Thread-Processor](https://github.com/openai/codex/blob/rust-v0.162.0-alpha.17.2/codex-rs/app-server/src/request_processors/thread_processor.rs): `thread_resume_inner`, `resume_running_thread`, eigener ThreadManager und ignorierte Overrides.
- [Exakter Tag: Turn-Processor](https://github.com/openai/codex/blob/rust-v0.162.0-alpha.17.2/codex-rs/app-server/src/request_processors/turn_processor.rs): `turn_start_inner`, Started/Steered.
- Bereits vorhandene lokale schemas `ThreadResumeParams/Response`, `ThreadReadResponse`, `TurnStartParams/Response`, `ModelListResponse` der installierten CLI gelesen; bestehender Governor und Preflight-Capability-Matrix gezielt gelesen. Kein Runtime-/Metadata-Aufruf, keine reale Thread-ID gelesen/resumiert, keine Generation, Installation oder globale Änderung. Entwurf selbst auf Scope, Widersprüche und unbelegte Versprechen geprüft.
