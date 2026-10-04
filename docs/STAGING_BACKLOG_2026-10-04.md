# GC-AUTOMATION-08: Aufgabenprofile und Staging-Rückstand

Stand: 2026-10-04, 20:52 UTC. Read-only Bestandsaufnahme, keine neue Ausführung.
Geprüftes main: `ced8e6dbe1cec5215edeb88b551afc363fe634cc`.
Aktueller Web-Integrationsstand: `fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41`.

## Auftrag und Beweisgrenzen

Martin hat die Weiterarbeit an GC-AUTOMATION-08 und die Prüfung weiterer Funktionen vor Staging beauftragt. Dies ist keine pauschale Freigabe für neue Deployments, IAM-Erweiterungen, Provider-Aufrufe oder Production.
START_HERE, CHAT_RECOVERY, AGENTS, Release-State, TODO, Registry, aktuelle Übergaben und Actions wurden abgeglichen. GitHub ist erreichbar; Secrets/Apple-Gerätestatus sind über diesen Zugriff nicht belegbar.
Der aktuelle [Development Status](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37233003312) meldet 18 aktive Workstreams und neun mögliche Dateiüberschneidungen. Registry und historische TODO-Zeilen ersetzen keine aktuelle SHA-Prüfung. 62 unregistrierte Branches bleiben erhalten; sie werden weder automatisch zugelassen noch gelöscht.

## Bereits auf Staging oder Beta

| Thema | Tatsächlicher Stand | Noch offen |
|---|---|---|
| Web: Crew, Tutorial, Remy-Struktur, Audio V2, DE/EN und Einstieg | Web fb88dfa7. [AI Checks](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37231463662), [Hosting](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37231545703), [AI und Assessment Functions](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37231545691) erfolgreich. [Release Control](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37231799084) bestätigt Hosting-/AI-Receipts. | Menschliche Produkt-/Geräteprüfung, Rules-Cutover und vollständige Release-Abnahme sind damit nicht bestätigt. |
| Startscreen v4 | In fb88dfa7 nach betreuter Reparatur integriert und deployed. | Original [Guardian-Run](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37230004552) hatte einen CI-Blocker; die drei unabhängigen Reviews wurden nicht vollständig durchlaufen. Kein vollständiger Automatik-Erfolg. [Übergabe](../workstreams/design-startscreen-multiai-v4.md). |
| AI Gateway, vier Textprovider | [Deploy 37197597670](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37197597670), Source `362c735021479f8fa6bae5b3aaf8360757e506bd`: OpenAI, Claude, Gemini und Mistral echte Smokes erfolgreich; Revision gradecrew-ai-gateway-staging-00018-pew auf 100 %, Receipt vorhanden. Branch `integration/ai-gateway-staging` steht auf `ad621a314b57ce567e1bd165754f2c7ddff0947e`; seit Deploy nur GRADECREW_STATUS.md geändert. | Evaluator-IAM/WIF fehlt laut aktueller Gateway-Übergabe. App-Runtime-Routing ist noch nicht aktiv; Remy/Testgenerierung nutzen weiterhin den bisherigen direkten OpenAI-Pfad. Keine neuen bezahlten Evaluationen starten. |
| Escape Expedition Visual Retro V2 | [Preview 37213145451](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37213145451) erfolgreich für `21986ac99140db74e69fffe0f8f606085c00afc6`. Eigenes Staging-Preview, keine gemeinsame App-Integration. | Neuerer L3-Stand ist hierdurch nicht deployed oder getestet. |
| iPad-Lehrerapp | [TestFlight 37076301215](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37076301215) erfolgreich bei `79598be8a68d26319e5e9711d0df7c73e119684d`, Version 0.1.8, Build 17. | Apple-Verarbeitung, tatsächlich installierte Version und menschlicher Gerätetest nicht bestätigt. Kein Web-Staging-Deploy ersetzt diese Abnahme. |

Die ältere zentrale Gateway-Blockerbeschreibung und die ältere Functions-Quelle im Release-State sind historische Einträge. Die oben genannten Deploy-Logs belegen den neueren Stand. Dieser Audit ändert GRADECREW_STATE.json nicht ohne separate schema-konforme Release-Aktualisierung.

## Kandidaten vor Staging: jeweils nächstes belegtes Gate

| Thema / bestehender Auftrag | Heutige Einordnung | Nächster Schritt vor Deployment |
|---|---|---|
| Escape Expedition L3 / Visual | Bestehender Kandidat `6434ddefb83cffca7bde5a7347ed6d2f56d5cb45`, PR #83. Seit Retro-V2-Deploy wurden app.js, Tests, Preview-Workflow und Übergaben verändert; sechs Learning-Gates und adaptive Coco-Hinweise laut Übergabe. | Exakten Kandidaten mit bestehenden 35 Escape-Expedition-Tests und Build prüfen; bewusst gewählten Preview-Meilenstein und bestehende Freigabe bestätigen. Alte erfolgreiche Retro-V2-Action zählt nicht als L3-Nachweis; allgemeine übersprungene Games-Checks zählen nicht als bestanden. |
| Web Pre-Merge Combined CI, GC-RELEASE-02 | PR #51, `1985673476606b9222f08a014f657b7579910891`, historisch grün, aber 196 Commits hinter aktuellem Ziel. Infrastrukturverbesserung, keine neue Produktfunktion. | Gegen aktuelle Web-YAML abgleichen, schon enthaltene Teile erhalten, kombinierten Merge-Result erneut prüfen. Security/Telemetry berühren denselben Workflow. Kein alter Green-Run als heutige Merge-Freigabe. |
| PostHog, GC-TELEMETRY-POSTHOG-01 | Draft PR #99 Adapter/Projektion, PR #100 Deploy-Control; noch nicht integriert, deployed oder mit echtem Ereignis bestätigt. Frühere CI bei 377dc459 erfolgreich; jetziger Head 18a9f7b6 braucht frischen Zielabgleich. | Datenschutz-/Retention-Gates, aktuelle kombinierte CI, sicher eingerichtetes Staging-Token und kontrollierter Ereignisnachweis. Token-Präsenz ist unbekannt; keine Keys im Chat/Repo. Keine neue Umsetzung parallel zum vorhandenen Auftrag. |
| Generische Telemetrie | Feature `4e4f0ba90a5bbb68e63a8836782289b46fbef21f`; separater Emulator-Branch `dd722845a1f75feaa0369fde34a1d0dee3c56c52` mit [grünem Gate](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36934351905). Nicht gleichzusetzen mit bereits deployter Remy-Telemetrie. | Branches gegen aktuelle App vereinigen, Datenerfassung/Retention und Aktivierungsflags prüfen, exakte kombinierte CI. Noch kein belegter aktiver generischer Staging-Rollout. |
| Secure Assessment / Rules | Feature `76417085b6ae42cb9f6d5733af726c2eeb05dd79`. [36870114409](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36870114409): Node-Tests grün, isolierter Secure-Preview-Job fehlgeschlagen, u.a. DOM-/Accessibility-Verträge. Neuere Integrations-/Hardening-Branches existieren. | Zuerst neuere Arbeit abgleichen und aktuellen Preview-Blocker lösen; dokumentierte Preview-/E2E-/Last-/Rules-Gates C–G bleiben bestehen. Bereits deployte Assessment Functions beweisen keinen Rules-Cutover. |
| Freitext-Prüfhilfe | PR #11, `67dacb0e5fd1e2371ecbf142de37703e3b2ba1f7`; PR-Ziel ist historischer Release-Fix, Branch 557 Commits hinter aktuellem main. | Zuständigkeit/Ziel korrigieren, vorhandene Funktion im aktuellen Webstand abgleichen und heutigen kombinierten Kandidaten prüfen. Keine direkte Integration des alten Branchs. |
| Escape Room MVP / AI Tutor | PR #10, `a7ffc...`; [37021633218](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37021633218) scheitert am Deploy: Secret Manager OPENAI_API_KEY, 403 secretmanager.secrets.get. | Bestehende Preview-Identität und Berechtigung diagnostizieren; kein blindes Retry und keine pauschale IAM-/Secret-Ausweitung. Games-Hub/Design-/Adventure-/Jungle-/Masterpiece-PRs sind eine bestehende Kette, keine frei kombinierbaren neuen Aufträge. |
| Provider-Evaluator / Routing | Bereits Code, synthetische Fälle und Review-Scoring im Gateway-Workstream; Runtime-Routing nicht aktiv. | Einmalige dokumentierte Staging-Evaluator-Einrichtung und vorhandene Budget-/Datenschutz-/Human-Review-Gates. Genau acht bezahlte Calls nur im freigegebenen Evaluationslauf, höchstens 0,50 USD/Lauf laut bestehender Übergabe; keine neue Reservation in diesem Audit. |
| iOS Share-/Offline-/Bridge-Ausbau | Bestehender Native-Workstream und Beta-Build vorhanden. | Erst tatsächlichen Build-17-Gerätetest und aktuelle Web-Kompatibilität belegen, dann denselben Auftrag fortsetzen. Kein neuer Upload, um einen unklaren Apple-/Gerätestatus zu umgehen. |

Keiner dieser alten Branchstände wird durch den Audit pauschal für sofortigen Deploy freigegeben. Die nächsten technisch überschaubaren Meilensteine sind L3 als isolierter statischer Preview und die Combined-CI-Aktualisierung; PostHog benötigt zusätzliche Konfiguration und Datenschutzbelege. Sonstige historische Design-/Brand-/i18n-Branches zuerst gegen bereits integrierte Funktion abgleichen.

## GC-AUTOMATION-08: empfohlener Zuschnitt, noch nicht als Design genehmigt

Ziel: eine gemeinsame Phasenkette mit festen Profilen, ohne die bestehende kleine Web-Zulassung auf privilegierte Dateien auszuweiten.

Drei Ansätze:
1. **Empfehlung: gemeinsame Zustandsmaschine, feste vertrauenswürdige Profile auf main.** Wiederverwendung von Budget, drei Reviews, Ownership und Receipts; pro Aufgabenart eigene erlaubte Pfade, feste Tests, Artefakte und Deploy-Ziele. Schrittweise aktivierbar und prüfbar.
2. Eigene vollständige Controller pro Aufgabenart: klare Trennung, aber doppelte Budget-/Recovery-Logik und größere Driftgefahr.
3. Ein frei konfigurierbarer universeller Controller: wenig sichtbarer Code, aber vom Kandidaten beeinflussbare Commands/Deploy-Ziele; für die bestehenden Sicherheitsregeln ungeeignet.

Erster Ausbauschritt: Profil-Schnittstelle mit vollständiger Web-Kompatibilität plus ein isoliertes **statisches Games-Preview-Profil**. Games mit AI/Functions/Scores bleiben ein anderer, zunächst gesperrter Bereich. Backend, Rules, Gateway und Native bekommen definierte Zulassungs-/Prüfanforderungen, werden aber erst mit vollständig verdrahteten Gates und belegtem Pilot aktiv. GC-AUTOMATION-09 bis -11 aus PR #65 bleiben eigenständige Aufgaben.

Profilvertrag: ID/Version/Digest, Task-/Source-/Target-/Candidate-SHA, feste Pfadgrenzen und Risiko, festes Test-/Build-Profil, drei SHA-gebundene unabhängige Review-Perspektiven, erlaubte Integration, erforderliche Deploy-Komponenten und unveränderliche Artefakt-Receipts. Kandidaten können weder Validatoren noch Commands, Identitäten oder Deploy-Ziele ändern.

| Profil | Spezifische Mindest-Gates / Grenze |
|---|---|
| Bestehendes Web | Unveränderte Zulassung und Budgetverträge, kombinierte Tests, Hosting + AI-Receipt wie heute. |
| Statisches Games Preview | Nur ausgewähltes lab/escape-expedition und geprüfte Assets; keine Functions, Rules, Secrets oder Provider-Calls. Feste Node-22-Tests/Build; unveränderliches Paket, Dateihashes und SHA-Receipt; eigenes zugelassenes Staging-Hosting-Channel. |
| Backend | Modulbezogene Unit-/Emulator-/Auth-/Idempotenz-/Rate-Limit-/Kostenprüfungen, feste Functions-Auswahl, isolierte Staging-Identität, komponentenbezogene Receipts. Keine beliebige functions-Allowlist. |
| Security / Rules | Emulator-Allow/Deny, aktive Prüfungsinhalte und Lösungsschutz, Preview/E2E/Last/Cutover-Gates. Menschliche Rules-Cutover-Freigabe bleibt erhalten. |
| Gateway | Bestehenden Gateway-Workflow/Receipts übernehmen; Provider-Smokes/Evaluationen nur innerhalb eigener Budget-/Datenfreigabe. Kein Routing- oder Evaluator-Call nur für eine Guardian-Demo. |
| Native iOS | Build-/Web-Bridge-/Signing-Gates, isolierte Signing-/Upload-Identität, eindeutiger TestFlight-Buildnachweis; Gerätetest bleibt menschlich. Kein automatischer Production-/App-Store-Schritt. |

Recovery: taskId, ursprüngliche Historie, Kandidaten, Request-/Run-IDs, verbrauchte Versuche, reservierte/geschätzte Kosten und Limits bleiben erhalten. Laufende/unklare Calls stoppen neue Ausführung. Bei fortgeschriebenem Ziel wird zunächst Diff/Ancestry/Konflikt geprüft; ein neuer kombinierter Kandidat benötigt neue SHA-gebundene CI und Reviews. Keine automatische Review-Übernahme für geänderten Code und kein frisches Budget durch Profilwechsel. Qualifizierte Reparatur verbraucht denselben Gesamtversuchszähler. Controller-/Profiländerungen ändern den Control-Hash; bestehende auf andere Hashes gebundene Läufe werden nicht stillschweigend umgedeutet.

Der bestehende Games-Preview-Workflow ist kein fertiges Guardian-Profil: globale Service-Account-Umgebung erreicht Test-/Build-Schritte, fehlende Credentials können als Warnung enden, feste Paket-/SHA-Receipt-Verifikation fehlt. Das neue Profil muss credentialfreie CI von privilegiertem Deploy trennen und fehlenden Deploy-Nachweis blockieren. Keine IAM-Änderung ist in diesem Entwurf schon freigegeben.

Akzeptanz für den ersten Ausbau: alle bisherigen Web-Verträge und Hashes kompatibel; neue Profile standardmäßig gesperrt; negative Zulassungstests für Pfade/Targets/Profile; gleicher Budget-/Ownership-Vertrag über Wiederaufnahme; stale Target, falsches Artefakt, fehlende/ungültige Receipts und fehlende Credentials blockieren; keine Secrets im Build; ein bezahlfreier synthetischer Rehearsal des Games-Profils vor einem ausdrücklich gebundenen echten Pilot. Drei Reviews und menschliche Abnahme bleiben getrennt.

## Historie und nächster Schritt

GC-AUTOMATION-08 ist derselbe bereits offene Auftrag. Kein neuer Guardian-Auftrag, kein Provider-Call, keine Budgetreservation und kein Workflow-Retry in diesem Teilschritt.
Pilot: zwei Versuche und 1,70 USD Reservation erhalten. Startscreen v2/v3 haben weiterhin unbekannte Provider-Ergebnisse mit jeweils 2,40 USD Reservation. v4-Kandidat, bestehende 2,40 USD Reservation und unvollständige Reviews bleiben erhalten.
Nächster Schritt: Martin prüft den empfohlenen Ausbau-Zuschnitt. Danach konkrete schriftliche Spezifikation für das erste Profilpaket; nach deren Review Implementierungsplan und Code. Aktuell weder neue Profile zugelassen noch neue Staging-Deployments gestartet.
