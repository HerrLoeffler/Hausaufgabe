# GC-WEB-POLISH-20261007 — gezielte Web-Oberflächenkorrektur

Stand: 7. Oktober 2026. Verantwortlicher Chat: Hero-Design `01a10e98-1e57-7b40-af70-555fdfdae2e3`; Main integriert die Folgepakete seriell. Eigener Branch `feature/gc-web-polish-20261007`, Basis des verifizierten Smiley-Staging-Commits `4d6ee69a7bf0ff51e037dc69f651ca6237f5106c`. Release-Stufe `branch_only`. Kein eigener Folge-Deploy; Production unverändert.

## Designbrief und Grenzen

Martins Screenshots zeigen einen großen blauen ovalen Fokusrahmen um Remy nach Interaktion, eine kaum abgesetzte Testcode-Zeile, einen nach links gerutschten Account-Bereich, eine auf 1240 px beschränkte Lehreransicht und den Dashboard-Button „? Tutorial testen“. Die Wortmarkierungsaufgabe zeigt zwei fremde kleine Glyphen im Titel. Gewünscht ist eine ruhigere, klarere Oberfläche: Crew-Einstieg mittig unter Remy/Emmi/Wilma, Login oben rechts, Testcode als eigener Abschnitt, Sprache und Account-Aktionen rechts, sinnvoll nutzbare Desktopbreite und kurze, passende Aktionslabels. Die vorhandenen Funktionen, Sprachen und Mobile-Zugänglichkeit bleiben erhalten.

Begrenzter Ansatz: Header/Login und Crew-Hierarchie in bestehender Entry-UI/CSS korrigieren; nur Pointer-Fokus nach dem Schließen des Crew-Dialogs entfernen, Tastaturfokus erhalten. Den Dashboard-Tutorial-Button im vorhandenen Tutorial-UI-Modul beschriften. Überflüssige „KI“-Wörter nur in Aktionslabels glätten, Datenschutz- und Datenfluss-Hinweise erhalten. Für Markwords nur den sichtbaren Aufgabentitel auf die im Screenshot naheliegenden Unicode-Ersatzglyphen prüfen und gezielt bereinigen; weder gespeicherte Fragen noch Antworten global umschreiben. Ein echter Datensatz/Browser-Screenshot nach der Änderung bleibt für die visuelle Abnahme erforderlich.

Zuständigkeit ausschließlich `index.html`, CSS, dedizierte Entry-/Hero-/Tutorial-/Teacher-Copy-/Markwords-UI-Module und Tests. `app.js`, `functions/`, `shared/i18n/`, Games und iOS werden hier nicht bearbeitet; der Audioautor besitzt `app.js`. Die Sprachumschaltung nutzt bestehende `data-i18n-key`-Einträge. Keine Bilder oder Provider-Aufrufe.

## Prüfplan

Zuerst gezielte DOM-/Vertragstests für öffentliche Hierarchie, Fokusmodalität, Dashboard-CTA und Markwords-Glyphen ergänzen und rot prüfen. Danach minimal umsetzen, relevante Tests, komplette Frontend-Reihe, Staging-Build und Diff-Check laufen lassen. Unabhängiger Review vor dem PR. Sichtprüfung nur bei erlaubter Browsersteuerung; andernfalls ausdrücklich offen. Main erhält PR mit exaktem Branch/Commit und übernimmt die spätere Integration und Staging-Veröffentlichung.

## Prüfcheckpoint 07.10.2026

UI-Code in diesem Worktree umgesetzt. Gezielte Tests wurden zunächst rot und nach der Änderung grün; vollständige Frontend-Suite 262/262 grün, Staging-Build `2.3.1-gc28` mit 120 Dateien grün, `git diff --check` grün. Der erste Buildaufruf ohne vorgeschriebenes leeres Zielverzeichnis war ein Aufruffehler, danach erfolgreich. Unabhängiger Review läuft noch. Sicht- und Authentifizierungsprüfung auf dem echten Staging sind offen; der frühere Browserzugriff dieses Chats wurde durch App-Richtlinie abgelehnt. Markwords-U+FFFC wird nur im sichtbaren Titel entfernt; Ursache im realen Datensatz ist ohne erlaubte Staging-Sicht nicht bewiesen. Die Nutzeranforderung vom 07.10.2026 lautet jetzt ausdrücklich: auf Staging veröffentlichen und Login/Test-Erstellung prüfen. Vor Deployment Branch/PR, Integration, CI und Hosting-Receipt exakt nachweisen; Production bleibt unverändert.
