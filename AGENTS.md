# GradeCrew: Regeln für Arbeitsagenten

## Einstieg und belegbarer Stand
- Vor Änderungen `START_HERE.md`, `GRADECREW_STATE.json` und `workstreams/README.md` auf dem aktuellen Remote-main lesen; danach die Regeln und Übergabe des tatsächlichen Arbeitsbranches.
- Ohne GitHub-Zugriff diese Einschränkung sofort nennen und die Übergabedateien anfordern. Andere Chats und Erinnerungen ersetzen keine Prüfung des Codes.
- Branch, Commit, lokale Änderungen und verfügbaren Zugriff prüfen. Nicht stillschweigend den Branch wechseln.
- Vor neuer Entwicklungsarbeit nach frischem Fetch `python tools/development_status.py` ausführen oder den jüngsten GitHub-Actions-Lauf **GradeCrew Development Status** prüfen. Aktiven Primary Branch, Integrationsziel, offene PRs, ahead/behind, Dateiüberschneidungen und unregistrierte Branches einordnen, bevor eine parallele Lösung begonnen wird.
- `workstreams/registry.json` ist nur die menschliche Zuordnungsschicht. Aktuelle SHAs, PRs und Diffs immer aus Git/GitHub ableiten; `GRADECREW_STATE.json` bleibt die Release-/Deploy-Sicht.
- Zustände lokal, gepusht, getestet, deployed und am Gerät bestätigt getrennt mit Nachweisen dokumentieren. Keine alten Testergebnisse einem neuen Commit zuschreiben.

## Parallele Aufgaben und Unterbrechungen
- Pro Aufgabe eigener Branch und eigener Checkout/Worktree sowie eine Übergabe nach `workstreams/TEMPLATE.md`. Gemeinsame Dateien und Zuständigkeiten vorher benennen.
- Vor einer neuen parallelen Implementierung prüfen, ob bereits ein Primary-/Related-Branch oder offener PR dieselbe Funktion bzw. dieselben Dateien bearbeitet. Bei Überschneidung vorhandene Arbeit zuerst lesen und Zielbranch abstimmen.
- Sinnvolle Teilschritte früh committen und pushen, auch als ausdrücklich unfertigen Zwischenstand. Keine Zugangsdaten oder personenbezogenen Testdaten committen.
- Vor längeren Arbeitsschritten und beim Abschluss die Übergabe aktualisieren: erledigt, Belege, offene Punkte, nächster konkreter Schritt. Nicht erst auf eine Tokenwarnung warten.
- Vor Integration Live Development Status und aktuellen Zielbranch erneut prüfen, konkurrierende Änderungen erhalten und relevante Tests ausführen. Kein Force-Push, Reset oder Löschen fremder Arbeit.
- Routineentscheidungen selbst treffen; neue wesentliche Produktentscheidungen und große Refactors brauchen einen entsprechenden Auftrag.

## Development Status ist Warnsystem, keine Automatik
- `tools/development_status.py` ist read-only. Es darf keine Branches, PRs, Dateien oder Deployments automatisch verändern.
- Dateiüberschneidungen sind Konflikthinweise, keine Dateisperren. Zwei Workstreams dürfen dieselbe Datei nur nach bewusstem Abgleich verändern.
- Unregistrierte Branches niemals automatisch löschen. Erst zuordnen, integrieren, archivieren oder ausdrücklich als Altbestand markieren.
- Ein Registry-Zustand wie `integration_ready` ist eine menschliche Freigabestufe und ersetzt weder CI noch Mergeability noch aktuellen Zielbranch-Abgleich.

## Autorisierte automatische Ausführung
- Für einen Nutzerauftrag darf der betreuende Repo-Agent die begrenzte Kette aus `automation/EXECUTION.md` verwenden: konkreten SHA-/Datei-/Budget-Auftrag auf main sichern, `Admit one Guardian task` mit dessen ID starten und echten Run-/CI-/Review-/Receipt-Stand prüfen. Ein bloßer Chatplan startet nichts.
- V2 umfasst nur ausdrücklich zugelassene kleine Web-UI-Dateien. Andere Workstreams bleiben an eigene Security-/Rules-/Signierungsprofile gebunden. Keine pauschale Verarbeitung sämtlicher Registry-Branches.
- Der separate Execution-Controller darf nach reserviertem Budget, unveränderlicher Quelle, exakter CI und unabhängigen OpenAI-/Anthropic-Freigaben normal fast-forward integrieren und die bestehenden Staging-Deploys ausdrücklich starten. Development Status und Release Control bleiben read-only.
- Unklare Provider-/Dispatch-/Schreib-Ergebnisse niemals blind wiederholen; Versuchszähler nicht zurücksetzen. Konkrete Test-/Review-Blocker bleiben mit Run und Fehlertext erhalten. Neue Dokumentationscommits auf main sind kein Code-Wechsel; Änderung der geprüften Controller-Dateien braucht erneute Diagnose/Freigabe.
- Secrets ausschließlich in sicherer GitHub-Einrichtung hinterlegen. Ohne Keys, Flags, aufgenommenen Auftrag und erfolgreichen echten Pilot die Automatik nicht als aktiv oder E2E-verifiziert melden. Geräteabnahme und Production-Freigabe bleiben menschlich.

## Sicherheit und Deployment
- Production (`hausaufgabe-40294`) nur nach ausdrücklicher Freigabe im aktuellen Auftrag. Diese Koordinationsarbeit beinhaltet keine Deploy-Freigabe.
- Preview, normales Staging und Production getrennt behandeln. Keine automatische Übertragung von Preview-Regeln auf normales Staging; Security-Cutover benötigt die dokumentierten Gates.
- Lösungsschlüssel bleiben serverseitig. Abgabe und Bewertung serverseitig, Attempt-Abgabe idempotent, private Rate-Limit-Daten nicht clientlesbar. Aktive Prüfungsinhalte unveränderlich; manuelle Bewertung und Lösungsfreigabe kontrolliert zurückhalten.
- Bei Security-Arbeit die aktuellen branchspezifischen Audit-/Gate-Dokumente lesen. Bei Fehlern zuerst Ursache und reproduzierbaren Ablauf klären; keine Vermutungen als behoben melden.
- Kleine zusammenhängende Änderungen, passende Verhaltenstests; bestehende Prüfungen, deutsche UI und Release-Manifeste erhalten.
- Ein CI-Lauf ersetzt weder einen echten Gerätetest noch einen bestätigten Deploy.

## Abschluss
Kurz berichten: Änderung, Branch/Commit, tatsächlich ausgeführte Prüfungen, Deployment-Status, offene Risiken und nächster Schritt. Repo-Dateien starten keinen Agenten und sichern keinen uncommitteten Code automatisch.

## Gemeinsame To-do-Liste
- Zu Beginn und bei Fragen nach offenen Aufgaben TODO.md frisch auf main lesen. P0/P1, Blocker und nächste Schritte nennen; ohne GitHub-Zugriff die Datei anfordern.
- Neue Nutzerwünsche einer Task-ID zuordnen oder ergänzen; nach gesicherten Teilschritten den Status mit Nachweisen aktualisieren. Keine Erledigt-Markierung allein wegen eines Plans.
- Vor Änderungen an der Liste Remote-Stand erneut lesen; nur betroffene Aufgaben ändern und parallele Ergänzungen erhalten. Details und Zwischenstände weiterhin in eigener Workstream-Übergabe führen.

## Pflicht zur Dokumentation aller Chats
- docs/CHAT_CONTRACT.md gilt auch für reine Design-, Produkt- und Planungschats. Auftrag einer Task-ID zuordnen, neue Wünsche/Blocker erfassen, Entscheidungen und Gründe in der passenden Übergabe sichern.
- Vor Abschluss oder Aufgabenwechsel TODO.md und Workstream aktualisieren; Commit, echte Prüfungen, offene Punkte und nächsten ausführbaren Schritt nennen. Ohne Schreibzugriff eine kopierbare Übergabe liefern und fehlende Speicherung ausdrücklich melden.

## Wiederaufnahme nach Chat-Abbruch
- Bei Unterbrechungen und Ersatzchats gilt zusätzlich docs/CHAT_RECOVERY.md. Dieselbe Task-ID fortführen und den bestehenden Branch/PR prüfen; keine zweite Implementierung beginnen.
- Übergabe um Chat-Bezeichnung (Link nur wenn bekannt), aktive Zuständigkeit, letzten gesicherten Teilschritt, ungesicherte Änderungen, laufende Run-/Request-IDs und genau einen nächsten Schritt ergänzen. Fehlende Angaben als unbekannt markieren, niemals erfinden.
- Vor längeren Tests/Wartephasen und externen Starts einen Checkpoint sichern. Nach einem externen Start dessen zurückgegebene ID zeitnah sichern. Kleine Zwischenstände gesammelt committen; keine Commit-/Actions-Schleife pro Toolaufruf.
- Ein Verbindungsabbruch beweist weder Stop noch Erfolg. Vor Wiederholung Git-Refs, PRs, Actions, Deployment-Receipts und bei bezahlten Aufrufen Provider-Ergebnis/Kosten abgleichen. Unklares Ergebnis bleibt blockiert; Historie, Versuche und Budget erhalten.
- Bei Übernahme aktive Schreibarbeit des alten Chats klären; auf gemeinsamem Branch nur einen schreibenden Chat. GitHub-Jobs können separat weiterlaufen und werden beobachtet statt neu gestartet.

## Spiele: verfügbare 3D-Werkzeuge und Qualitätsprüfung
- Bei Spielearbeit [img2threejs und Assetqualität](docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md) lesen. Bei passenden 3D-Objekt-/Figurenaufgaben den verfügbaren img2threejs-Skill tatsächlich lesen und verwenden; bei ungeeigneter Aufgabe den anderen Weg kurz begründen.
- Zugriff und Nutzung mit gelesener Skill-Datei, Version, ausgeführten Schritten und Ergebnis-/Renderdateien in der Aufgabenübergabe belegen. Fehlende lokale Werkzeuge offen nennen; andere Rechner/Cloud-Chats erben Martins Installation nicht.
- Martins Hinweis vom 09.10.2026 „Qualität aktuell noch zu schlecht“ bleibt offene Qualitätsarbeit. Technische Tests oder Werkzeuginstallation ersetzen weder Vorlagenvergleich noch Prüfung im tatsächlichen Spiel und visuelle Abnahme.

## Beschlossene Zentralenrollen — GC-HOOKS-01, 10.10.2026

Martins feste Regel: Zentralen koordinieren ausschließlich. Die zunächst für die Hauptzentrale beschlossene Grenze wurde ausdrücklich auf die folgende Hierarchie erweitert: **GradeCrew-Zentrale → gemeinsame Games-Zentrale → Zentrale je Spiel → ausführende Fach-Chats**. Die fünf bestehenden Zentralenchats wurden konkret zugeordnet; keine neue Chat-Erstellung durch diese Regel.

| Rolle | Bestehender Chat | Thread-ID |
|---|---|---|
| Hauptzentrale | GradeCrew Zentrale | `01a10df6-736b-7a62-bd38-2724cf254c2e` |
| Gemeinsame Games-Zentrale | GC · Games-Zentrale | `01a11864-3ec7-7091-acc0-9ff292f530f3` |
| Spielzentrale Pizza | Pizza Spiel Zentrale | `01a111e6-c211-76a2-928e-8ed88a7b7bec` |
| Spielzentrale Lerninsel | GC · Lerninsel-Zentrale | `01a1183f-dad9-7640-8a82-23107c980d6e` |
| Spielzentrale Escape-Expedition | GC · Escape-Expedition-Zentrale | `01a11681-00e3-79d1-8f27-c48267b86c0d` |

- Alle genannten Zentralen führen ausschließlich Koordinations-, Recherche- und Statusaktionen über geeignete APIs aus: priorisieren, Quellen/Belege lesen, vollständige Briefings erstellen, Fach-Chats beauftragen, deren verfügbares Modell nach Schwierigkeit wählen, Ergebnisse prüfen und berichten.
- Zentralen führen selbst keine Shell-/Terminalbefehle aus, ändern keine Code-/Projektdateien und starten keine Tests, Builds, Integration oder Deployments. Das gilt auch für vermeintlich lesende Shellbefehle und Dokumentationsänderungen. Erforderliche dauerhafte Repo-Dokumentation nach CHAT_CONTRACT wird einem autorisierten Fachchat zugewiesen; die Pflicht ist keine Ausnahme vom Ausführungsverbot. Fehlende Zuständigkeit organisieren, statt selbst einzuspringen.
- Fach-Chats führen ihre konkret beauftrageten Tätigkeiten in eigenen sicheren Checkouts aus. Diese Rollenregel ist kein Ausführungsverbot für alle GradeCrew-Chats. Production-Freigaben, Budget-/Versuchshistorie, Wiederaufnahme und strengere Review-/CI-Gates bleiben bestehen. Keine zusätzliche Task-ID oder Kostenreservierung je Hierarchieebene.
- Die gemeinsame Games-Zentrale koordiniert spielübergreifende Verträge; Spielzentralen koordinieren jeweils ihr Spiel und dessen Fachaufträge. Eine Zentrale darf frühere Implementierung im Chat als historische Evidenz lesen, aber daraus keine aktuelle Ausführungsbefugnis ableiten.
- Forks kopieren Historie, liefern keinen fortlaufenden Informationssync und erben keine neue Fachzuständigkeit allein dadurch. Gemeinsame aktuelle Projektdateien und explizite Owner-/Rollenbindung sind maßgeblich. Normale Forks können dieselbe Root-sessionId behalten; sessionId, Chatname oder Pfad allein identifizieren daher keine Zentralenrolle zuverlässig.
- Bestehendes GradeCrew Central 0.4.0 wiederverwenden; die drei vorgeschlagenen Rollen-Skills koordinieren/umsetzen/unabhängig abnehmen sind noch nicht installiert. Keine pauschale Erlaubnis aller Plugin-Werkzeuge: lesende Statuszugriffe von schreibenden/Verbindungsaktionen unterscheiden.
- Technische Hook-Sperren sind noch nicht installiert oder qualifiziert. Die Rollenregel gilt als beschlossene Nutzeranweisung; Dokumentation ist kein Runtime-Durchsetzungsnachweis. Details und nächster Schritt: [GC-HOOKS-01-Übergabe im gesonderten PR184](https://github.com/HerrLoeffler/Hausaufgabe/blob/cfe75f60e9bc1a10e07b8066a31dbe10f050e801/workstreams/codex-lifecycle-hooks-20261010.md).


## Adaptive Modell-/Aufwandswahl — GC-HOOKS-01, 10.10.2026

Verbindliche Nutzerleitlinie für alle GradeCrew-/Games-Zentralen und ihre Fachaufträge: Modell und Denkaufwand pro Arbeitsschritt wählen, nicht pauschal `gpt-6.1-sol high`. Nur auf dem jeweiligen Host tatsächlich verfügbare Modelle/Aufwände verwenden. Dieses Startschema belegt weder gleiche Qualität noch konkrete Preise:

| Arbeitsschritt | Startschema |
|---|---|
| Einfache Statusfrage, Zuordnung, kurzes klares Briefing | `gpt-6-luna medium`; nach belegtem stabilem Erfolg risikoarm `low` erproben |
| Bereichsübergreifende Koordination, Abhängigkeiten, Review | `gpt-6.1-sol medium` |
| Schwierige Konflikte, Architektur, Sicherheit, Engine-Diagnose | `gpt-6.1-sol high` |
| Konkret begründetes ungelöstes schwieriges Problem | Erst dann verfügbares Astra prüfen; kein pauschaler Astra-Default |

- Bei reproduzierbaren fachlichen Fehlern zuerst benötigte Fakten/Werkzeuge prüfen, dann gezielt Aufwand oder Modell erhöhen. Netz, Anmeldung, Nutzungslimit und fehlende Rechte werden nicht durch ein größeres Modell behoben.
- Denkaufwand bevorzugt ändern, wenn das reicht. Kein Downgrade mitten in einer sicherheitskritischen Entscheidung. Nach stabil erfolgreichen vergleichbaren risikoarmen Teilschritten einen begrenzten niedrigeren Versuch mit denselben Akzeptanzkriterien machen; bei Qualitätsverlust zurück.
- Maximal zwei Modellwechsel pro zusammenhängender Teilaufgabe; keine ständigen Pingpong-Wechsel oder Full-Kontext-Neustarts. Historie, Task-/Request-ID, Versuche und Budgets bleiben erhalten. Aufwandänderungen ebenfalls begründet dokumentieren.
- Angefordertes Modell/Aufwand und beobachtetes tatsächliches Runtime-Modell/Aufwand unterscheiden. Grund, Ergebnis, Nacharbeit und verfügbare Nutzungsdaten knapp in der bestehenden Übergabe sichern; fehlende Usage/Preise als unbekannt markieren, keine Einsparung erfinden.
- Wechsel nur an unterstützten Teilaufgaben-/Turn-Grenzen: App-Server `turn/start` unterstützt `model`/`effort`; `turn/steer` überschreibt keinen Modellaufruf im aktiven Turn. Auf bereits laufende fremde Turns keine erzwungenen Wechsel oder Abbrüche anwenden. Hooks liefern Kontext/Guards, sind keine Modell-Umschaltmaschine.
- Die Wahl eines stärkeren Modells ändert keine Rollenrechte: Zentralen koordinieren ausschließlich, Fach-Chats führen ihren autorisierten Scope aus. Den bestehenden Produkt-AI-Router GC-AI-ROUTING-02 nicht aus dieser Codex-Arbeitsregel neu bauen oder aktivieren.

### Normale GradeCrew-Codex-Chats und Startvorgaben — GC-MODEL-GOVERNOR-01

Diese Auswahl gilt auch für einen direkt gestarteten normalen GradeCrew-Codex-Chat, nicht nur für Zentralen und delegierte Fachaufträge. Martins persönlicher Codex-Standard ist `gpt-6-luna` mit `medium`; er ist ein konfigurierbarer Startdefault und kein erzwungener Modell- oder Aufwandswert. Vor dem ersten neuen Arbeitsturn den konkreten Schritt einordnen: Routine startet mit Luna/medium; `low` erst nach belegter Eignung bei vergleichbaren risikoarmen Schritten; komplexe Koordination, Architektur oder Diagnose startet mit `gpt-6.1-sol`/medium; `high` braucht eine konkrete Schwierigkeit und Begründung. Höchstens zwei Modellwechsel pro zusammenhängender Aufgabe. Authentifizierung, Netz, Quota oder fehlende Rechte begründen keinen Modellwechsel nach oben.

Bei programmatischen Chat-/Delegationsstarts das gewünschte Modell und den Aufwand ausdrücklich über den unterstützten Startparameter setzen und in der vorhandenen Aufgabenübergabe `requested`, beobachtetes `actual` (oder `unknown`) und den Grund festhalten. Die globale Voreinstellung, Projekt-/Profilvorgaben und manuelle Auswahl in der Oberfläche können voneinander abweichen; eine gelesene Konfigurationsdatei belegt nicht den Wert eines bereits laufenden Turns. Im Desktop können Nutzer Modell und Aufwand auch für den aktuellen Chat über die Auswahl unter dem Composer beziehungsweise `/model` und `/reasoning` ändern; prüfe dies für einen bestehenden Chat vor der nächsten Aufgabe, wenn ein alter Override vermutet wird. Eine Regeldatei kann diese manuelle Auswahl nicht erzwingen oder rückwirkend ändern. Aktive Aufrufe weder umschreiben noch abbrechen; Änderungen gelten erst an einem unterstützten nächsten Turn-/Aufgabenstart. Diese Vorgabe behauptet keine installierte Hook- oder UI-Sperre und ändert PR184 nicht.

## Anlassbezogene Assurance — GC-LAUNCH-CONTROLS-01

Vor tatsächlich beauftrageten Änderungen den [gemeinsamen Assurance-Einstieg](docs/assurance/README.md) und die relevanten Rollenbriefs lesen: Website/Functions, Crew/Tests, iPad, alle Games und konkret zugeordnete ET-Oberflächen. Haupt-/Games-/Spielzentralen wählen den betroffenen SEC-/PRIV-Umfang und beauftragen ausführende Fach-Chats. Relevante Kontrollen mit Owner, Scope/SHA/Release, Status, Beleg, Grenzen und nächstem Schritt in der bestehenden Übergabe führen. Nicht alle40 Kontrollen pro PR/Standfrage ausführen oder eine zweite Statusdatenbank anlegen.

Status nur erfüllt/offen/nicht relevant/nicht geprüft; Nutzen/Priorität ist kein Fertigbeleg. Teil-/alte Tests, vorhandene Dateien oder Dokuintegration sind keine Produktfreigabe. Berechtigt belegte kritische Risiken/zwingende fehlende Gatebelege blockieren betroffenen Releaseumfang, irrelevante offene Punkte nicht pauschal alles. Strengere Review-/Guardian-/Productiongates erhalten; kein KI-Rechtszertifikat, ungeklärte Schul-/AVV-/Provider-/Zweckfragen an tatsächliche Verantwortliche/qualifizierte Prüfung geben. Rollenbriefs sind dauerhafte Einstiegstexte, keine automatisch laufenden Agenten/Skills/Hooks. Setup enthält keine Vollscans, Angriffe, Kundendatenexporte, bezahlten Providerstarts oder Deploys. Bestehende Tasks, Versuche, Reservierungen und Arbeitsgrenzen erhalten.
