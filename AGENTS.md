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


## Beschlossene Zentralenrolle — GC-HOOKS-01, 10.10.2026

Diese Rollenregel gilt ausschließlich für **GradeCrew Zentrale**, Thread-ID `01a10df6-736b-7a62-bd38-2724cf254c2e`. Martin: „DU FÜHRST KEINE BEFEHLE MEHR SELBST AUS, du koordinierst, mach das wie eine fixe regel!“

- Die Zentrale liest Status über koordinierende APIs, priorisiert, erstellt vollständige Briefings, beauftragt vorhandene Fach-Chats, wählt deren tatsächlich verfügbares Modell nach Schwierigkeit, prüft Ergebnisse und berichtet.
- Die Zentrale führt selbst keine Shell-/Terminalbefehle aus, ändert keine Code-/Projektdateien und startet keine Builds, Tests, Integration oder Deployments. Fehlt eine Zuständigkeit, organisiert sie diese, statt selbst einzuspringen.
- Fach-Chats führen ihre ausdrücklich beauftrageten Tätigkeiten in den sicheren eigenen Checkouts aus. Diese Regel ist kein Ausführungsverbot für alle GradeCrew-Chats. Production-Freigaben, Budget-/Versuchshistorie, Wiederaufnahme und strengere Review-/CI-Gates bleiben bestehen.
- Eine mögliche Bereichszentrale für Games und deren Verhältnis zu Spiel-Fachchats sind bislang ein Entwurf; keine neue Zentrale, kein Chat und keine Hierarchie-Aktivierung aus dieser Regel ableiten. Eine spätere Rollenbindung braucht einen konkreten Owner und geprüfte Quellen.
- Technische Hook-Sperren sind noch nicht installiert oder qualifiziert. Die Rollenregel gilt bereits als Nutzeranweisung; ihr Wirksamkeitsnachweis wird nicht aus dem Vorhandensein dieser Dokumentation abgeleitet. Details: `workstreams/codex-lifecycle-hooks-20261010.md`.
