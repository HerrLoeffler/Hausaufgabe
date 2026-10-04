# Guardian: Budgetprofil und konkrete Pilotvorbereitung

- Auftrag / Tasks: Martin verlangt Aktivierung bis zum realen Pilot; Kosten kleiner Aufträge enger begrenzen. GC-AUTOMATION-07 und GC-AUTOMATION-12.
- Datum: 04.10.2026.
- Branch: fix/guardian-budget-pilot-v1 → main.
- Geprüfte Controllerbasis: 14795f7a02aa797ea02854e077b7129340c9cdda.
- Geprüfte Pilotquelle: feature/gradecrew-app-integration@eb80c5e6a8b6c1ae13deba676709607bfccee208. Paralleler Startscreen-PR #68 ist bereits integriert; dieser Pilot verändert ausschließlich tutorial-choice-v1.css.
- Überschneidungen: eigener Controller-Workstream; keine parallele offene Guardian-Code-PR gefunden. PR #65 dokumentiert künftige komplexe Planung/visuelle Audits und bleibt davon getrennt. Development Status 37193300739/Jobbericht gelesen; bestehende Branch-/Dateiüberschneidungen erhalten. Main-PR #67 betrifft getrennte Staging-Receipt-Rechte.

## Erledigt

Optionales festes Kostenprofil small-web-v1 mit 12k/24k konservativen Kontextbytegrenzen, 6k/2,4k Ausgabetokens, 0,85 USD/Versuch und 2,55 USD/Auftrag. Taskvertrag, Budgetreservierung und alle vier Provideraufrufe verwenden dasselbe hashgebundene Profil. Standardvertrag kompatibel, Tagesbudget unverändert, keine stillen Upgrades oder Kürzungen. Gleiche Coding-KI und drei unabhängige Reviewer, High-Effort und alle bestehenden Gates erhalten.
Aktuelle Standardpreise aus offiziellen OpenAI-/Anthropic-Dokumenten geprüft (Links in EXECUTION). Rechnerische volle kleine Grenze 0,588 USD; 0,85 USD Reserve deckt zusätzlich 10% Verarbeitungspremium. Kein gemessener Paid-Verbrauch.
Konkreter Pilotauftrag: Später-Tutorialbutton bekommt 44px-Mindestklickfläche und fokussichtbaren Outline; exakte einzelne CSS-Datei, Akzeptanz/Constraints/Budget/Integrations-SHA festgelegt. Builder-Dateiliste bindet diese CSS physisch ein.
Sicheres Eigentümer-Setup kann optional genau eine Aufnahme dieses main-Auftrags anfordern. Keine Schlüssel im Chat/Repo, keine automatische Neuerzeugung oder Wiederverwendung von Production-Keys.

## Geprüft

91 lokale Tests: bestehende Guardian-/Pipeline-/Release-Control-Gates, kleinere Providerlimits für alle Rollen, Profilbindung im vollständigen simulierten Ablauf, gemischtes Tagesbudget, drei Reservierungen über Datumswechsel, kein Profilupgrade, Größenblock vor Provideraufruf, Ausgabegrenze, Setup mit Fake-gh einmaliger Aufnahme und Ablehnung ungültiger IDs. Bash-Syntax der Setup-/Validierungsskripte grün.
GitHub-CI dieses neuen Heads und Integration werden nach Push separat geprüft. Diese lokalen Tests sind kein bezahlter Pilot, kein Produktdeploy und kein physischer Gerätetest.

## Tatsächliche Zugangshürde

Frischer Guardian-main-Run 37194028373 / check-Job 111412063940 um 10:01 UTC: beide Flags leer; WORKER_KEY_PRESENT, OPENAI_REVIEW_KEY_PRESENT und ANTHROPIC_REVIEW_KEY_PRESENT false; continue übersprungen.
Diese Sitzung besitzt kein gh/GitHub-Token und keinen der drei Providerkeys. Der GitHub-Connector kann Code/PRs lesen/schreiben, aber bietet keine Secret-/Variablenadministration oder neuen Workflow-Dispatch. Daher keine Behauptung einer Aktivierung. Kein Browserfallback ohne dessen erforderliche Autorisierung verwendet.

## Nächster ausführbarer Schritt

Nach grüner CI Controller und Pilot auf main integrieren. Dann Eigentümer setzt die drei dedizierten Secrets über das verdeckte Setup und aktiviert Flags; das optionale Pilotargument fordert Aufnahme an. Admission muss aktuellen Quell-SHA bestätigen, andernfalls gezielt nachprüfen und neu pinnen, ohne alte Versuchshistorie zu löschen. Erst echte Provider/PR/CI/Reviews/Integration/Hosting-/Functions-Receipts bestätigen GC-AUTOMATION-07.
Production nicht angefordert oder verändert. Kein API-Key oder Provider-/Cloud-Aufruf durch diesen Arbeitsblock.

## Remote-Zwischenstand

PR #71: erster Produktcode-Head bb7bf90998b49485bdb25b551e19f3a3f2583aa9. Guardian-CI 37194754582, Handoff 37194754569 und Development Status 37194754600 erfolgreich. Isolierte Gesamt-Rehearsal 37194754805 läuft noch; kein bezahlter E2E-Lauf. Nach parallelem Dokumentationsfortschritt des Web-Ziels wurde der Pilot auf eb80c5e6a8b6c1ae13deba676709607bfccee208 neu gepinnt; CSS-Blob unverändert 22bfd82f60b451f53008ceef201b6c0861e8e307. Neue Runs des finalen Heads separat prüfen.

## Gesicherter Abschluss

PR #71 nach grüner finaler Remote-CI auf main integriert: 6810e163f07c423510e32208562170105d0cdd83. Geprüfter finaler Quellhead 9da017c8ac2cecd90c9b5545c916105b83b5aad4. Guardian 37194975024, Handoff 37194975026, Development Status 37194975086 und Gesamt-Rehearsal 37194975244 erfolgreich; letzte validiert den tatsächlichen Web-Snapshot einschließlich Dependencies, Functions/Assessment, Emulator-/UI-Prüfungen und Staging-Package ohne Provider-/Cloud-Zugang. 91 lokale Tests bestanden. Pilotvorlage verwendet jetzt ebenfalls small-web-v1. Frühere laufende Rehearsals wurden durch neue PR-Heads ersetzt, nicht als Erfolge des finalen Heads verwendet.

Stand: Code/Queue auf GitHub und main integriert; Pilot nicht aufgenommen, keine bezahlten Provideraufrufe, kein Guardian-Produktdeploy und kein Gerätetest. Schlüssel-/Flag-Einrichtung bleibt als konkrete externe Zugangshürde. Die Sitzung verfügt nicht über Secret-Verwaltung oder Providerzugänge; keine fehlenden Schlüssel erfunden oder Production-Keys kopiert. Nächster ausführbarer Schritt ist der sichere Eigentümer-Aufruf mit Pilotargument aus aktuellem main. Drei geheim eingegebene Schlüssel → Flags/Bot-PR-Einstellung → genau eine Admission-Anforderung; deren tatsächliches Ergebnis danach prüfen. Wird der Web-Zweig weitergeschrieben, stoppt Admission vor dem ersten Paid-Aufruf und verlangt einen frischen Abgleich. Production bleibt unverändert.
